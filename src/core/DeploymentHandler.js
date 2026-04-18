const { Client } = require('ssh2');
const fs = require('fs').promises;
const path = require('path');
const ora = require('ora');
const inquirer = require('inquirer');
const { formatMessage, logMessage } = require('../utils/messageFormatter');
const RemoteOperations = require('./RemoteOperations');
const { DeploymentLogger, DEFAULT_LOG_DIR } = require('./DeploymentLogger');
const NotificationManager = require('../notifiers/NotificationManager');

/**
 * 部署处理器类
 */
class DeploymentHandler {
  constructor() {
    this.notificationManager = new NotificationManager();
  }

  /**
   * 处理单个服务器部署
   * @param {Object} config - 部署配置
   * @returns {Promise<void>}
   */
  async handleDeployment(config) {
    const { 
      host, 
      port, 
      username, 
      password, 
      path: remotePath, 
      outDir, 
      readyTimeout = 5000,
      beforeDeploy,
      afterDeploy,
      enableLogging = false,
      logDir = DEFAULT_LOG_DIR
    } = config;
    
    const localDir = path.resolve(process.cwd(), outDir);
    
    // 验证本地构建目录是否存在
    try {
      await fs.access(localDir);
    } catch (err) {
      throw new Error(`Local build directory does not exist: ${localDir}`);
    }
    
    // 初始化日志记录器
    const logger = new DeploymentLogger(logDir, enableLogging);
    await logger.initLog(config);
    
    // 设置通知管理器配置
    this.notificationManager.setConfig(config);
    
    const spinner = ora(formatMessage('CONNECTING_TO_SERVER', { host, port })).start();
    
    return new Promise(async (resolve, reject) => {
      const conn = new Client();
      
      const cleanup = () => {
        try {
          conn.end();
        } catch (e) {
          // 忽略 cleanup 错误
        }
      };
      
      conn.on('ready', async () => {
        try {
          spinner.text = formatMessage('SERVER_CONNECTED', { host });
          
          // 记录连接成功
          await logger.writeLog('SSH_CONNECTED', { host, port });
          
          // 执行部署前钩子
          if (beforeDeploy) {
            const beforeDeployCommand = RemoteOperations.parseHookCommand(beforeDeploy, config);
            await logger.writeLog('BEFORE_DEPLOY_START', { command: beforeDeployCommand });
            await RemoteOperations.executeRemoteCommand(conn, beforeDeployCommand, 'Pre-deployment script', spinner);
            await logger.writeLog('BEFORE_DEPLOY_END', { success: true });
          }
          
          // 确保远程目录存在
          await RemoteOperations.safeCreateRemoteDir(conn, remotePath, spinner);
          await logger.writeLog('REMOTE_DIR_CREATED', { path: remotePath });
          
          // 清理远程目录
          await RemoteOperations.safeCleanRemoteDir(conn, remotePath, spinner);
          await logger.writeLog('REMOTE_DIR_CLEANED', { path: remotePath });
          
          // 上传文件
          spinner.start(formatMessage('UPLOADING_FILES', { path: remotePath }));
          await logger.writeLog('UPLOAD_START', { localDir, remotePath });
          await RemoteOperations.uploadFiles(localDir, remotePath, config, spinner);
          await logger.writeLog('UPLOAD_END', { success: true });
          
          // 执行部署后钩子
          if (afterDeploy) {
            const afterDeployCommand = RemoteOperations.parseHookCommand(afterDeploy, config);
            await logger.writeLog('AFTER_DEPLOY_START', { command: afterDeployCommand });
            await RemoteOperations.executeRemoteCommand(conn, afterDeployCommand, 'Post-deployment script', spinner);
            await logger.writeLog('AFTER_DEPLOY_END', { success: true });
          }
          
          spinner.succeed(formatMessage('UPLOAD_SUCCESS', { host, path: remotePath }));
          await logger.writeLog('DEPLOYMENT_SUCCESS', { host, remotePath });
          await this.notificationManager.sendNotifications(config.notifications, true);
          await logger.finalizeLog(true);
          cleanup();
          resolve();
        } catch (error) {
          spinner.fail(formatMessage('DEPLOYMENT_ERROR', { error: error.message }));
          await logger.writeLog('DEPLOYMENT_ERROR', { error: error.message, stack: error.stack });
          await this.notificationManager.sendNotifications(config.notifications, false, error);
          await logger.finalizeLog(false, error);
          cleanup();
          reject(error);
        }
      });
      
      conn.on('error', (error) => {
        spinner.fail(formatMessage('SSH_CONNECTION_FAILED', { error: error.message }));
        logger.writeLog('SSH_ERROR', { error: error.message });
        this.notificationManager.sendNotifications(config.notifications, false, error);
        logger.finalizeLog(false, error);
        cleanup();
        reject(error);
      });
      
      // 构建 SSH 连接配置（仅使用密码认证）
      const connectConfig = {
        host,
        port,
        username,
        password,
        readyTimeout
      };
      
      conn.connect(connectConfig);
    });
  }

  /**
   * 收集登录信息（保持英文提示以符合国际标准）
   * @param {Object} config - 部署配置
   * @returns {Promise<Object>} - 完整的配置对象
   */
  async collectLoginInfo(config) {
    const questions = [];
    
    if (!config.username) {
      questions.push({
        type: 'input',
        name: 'username',
        message: 'Enter server username:',
        default: 'root',
        validate: (val) => val.trim() ? true : 'Username cannot be empty'
      });
    }
    
    // 如果没有配置密码，则提示输入密码
    if (!config.password) {
      questions.push({
        type: 'password',
        name: 'password',
        message: 'Enter server password:',
        validate: (val) => val.trim() ? true : 'Password cannot be empty'
      });
    }
    
    if (questions.length === 0) {
      return config;
    }
    
    const answers = await inquirer.prompt(questions);
    return {
      ...config,
      username: answers.username || config.username,
      password: answers.password || config.password
    };
  }

  /**
   * 并行部署多个服务器
   * @param {Object[]} serverConfigs - 服务器配置数组
   * @returns {Promise<void>}
   */
  async deployMultipleServers(serverConfigs) {
    if (serverConfigs.length === 0) return;
    
    if (serverConfigs.length === 1) {
      // 单服务器部署
      await this.handleDeployment(serverConfigs[0]);
      return;
    }
    
    // 多服务器并行部署
    logMessage('cyan', 'STARTING_PARALLEL_DEPLOYMENT', { count: serverConfigs.length });
    
    const deploymentPromises = serverConfigs.map(async (config, index) => {
      try {
        await this.handleDeployment(config);
        return { success: true, config, index };
      } catch (error) {
        return { success: false, config, index, error };
      }
    });
    
    const results = await Promise.allSettled(deploymentPromises);
    
    // 统计结果
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.filter(r => r.status === 'rejected' || !r.value.success).length;
    
    logMessage('cyan', 'PARALLEL_DEPLOYMENT_COMPLETE', { success: successful, failed });
    
    // 如果有任何失败，抛出错误（但不会中断其他成功的部署）
    if (failed > 0) {
      const firstError = results.find(r => r.status === 'rejected')?.reason || 
                        results.find(r => r.status === 'fulfilled' && !r.value.success)?.value.error;
      throw new Error(formatMessage('PARALLEL_DEPLOYMENT_PARTIAL_FAILURE', { failed }));
    }
  }
}

module.exports = DeploymentHandler;