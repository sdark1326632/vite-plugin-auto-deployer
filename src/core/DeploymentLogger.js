const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { logMessage } = require('../utils/messageFormatter');

// 部署日志配置
const DEFAULT_LOG_DIR = path.join(process.cwd(), '.vite-auto-deployer', 'logs');

/**
 * 部署日志类
 */
class DeploymentLogger {
  constructor(logDir = DEFAULT_LOG_DIR, enableLogging = false) {
    this.logDir = logDir;
    this.enableLogging = enableLogging;
    this.currentLogFile = null;
    this.currentDeploymentId = null;
  }
  
  async initLog(deploymentConfig) {
    if (!this.enableLogging) return;
    
    try {
      await fs.mkdir(this.logDir, { recursive: true });
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const serverName = deploymentConfig.name || `${deploymentConfig.host}_${deploymentConfig.mode}`;
      this.currentLogFile = path.join(this.logDir, `deploy_${serverName}_${timestamp}.log`);
      this.currentDeploymentId = `deploy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // 写入部署开始日志
      await this.writeLog('DEPLOYMENT_START', {
        deploymentId: this.currentDeploymentId,
        timestamp: new Date().toISOString(),
        config: {
          name: deploymentConfig.name,
          mode: deploymentConfig.mode,
          host: deploymentConfig.host,
          port: deploymentConfig.port,
          path: deploymentConfig.path,
          outDir: deploymentConfig.outDir
        },
        environment: {
          nodeVersion: process.version,
          platform: os.platform(),
          cwd: process.cwd()
        }
      });
      
      logMessage('gray', 'LOGGING_ENABLED', { logFile: this.currentLogFile });
    } catch (error) {
      logMessage('warning', 'LOG_INIT_FAILED', { error: error.message });
      this.enableLogging = false;
    }
  }
  
  async writeLog(level, data) {
    if (!this.enableLogging || !this.currentLogFile) return;
    
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        level,
        deploymentId: this.currentDeploymentId,
        ...data
      };
      
      const logLine = JSON.stringify(logEntry) + '\n';
      await fs.appendFile(this.currentLogFile, logLine);
    } catch (error) {
      // 日志写入失败不影响主流程
      logMessage('warning', 'LOG_WRITE_FAILED', { error: error.message });
    }
  }
  
  async finalizeLog(success, error = null) {
    if (!this.enableLogging || !this.currentLogFile) return;
    
    try {
      await this.writeLog('DEPLOYMENT_END', {
        success,
        endTime: new Date().toISOString(),
        duration: Date.now() - parseInt(this.currentDeploymentId.split('-')[1]),
        error: error ? error.message : null
      });
      
      if (success) {
        logMessage('gray', 'LOG_SAVED_SUCCESS', { logFile: this.currentLogFile });
      } else {
        logMessage('gray', 'LOG_SAVED_WITH_ERROR', { logFile: this.currentLogFile });
      }
    } catch (error) {
      logMessage('warning', 'LOG_FINALIZE_FAILED', { error: error.message });
    }
  }
}

module.exports = {
  DeploymentLogger,
  DEFAULT_LOG_DIR
};