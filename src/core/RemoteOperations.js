const ora = require('ora');
const scpClient = require('scp2');
const { formatMessage, logMessage } = require('../utils/messageFormatter');

/**
 * 远程操作工具类
 */
class RemoteOperations {
  /**
   * 安全地创建远程目录（如果不存在）
   * @param {Object} conn - SSH连接对象
   * @param {string} remotePath - 远程路径
   * @param {Object} spinner - 加载指示器
   * @returns {Promise<void>}
   */
  static safeCreateRemoteDir(conn, remotePath, spinner) {
    return new Promise((resolve, reject) => {
      conn.exec(`mkdir -p "${remotePath}"`, (err, stream) => {
        if (err) {
          reject(new Error(formatMessage('REMOTE_DIR_CREATE_ERROR')));
          return;
        }
        
        stream.on('close', (code) => {
          if (code === 0) {
            spinner?.succeed(formatMessage('REMOTE_DIR_READY', { path: remotePath }));
            resolve();
          } else {
            reject(new Error(formatMessage('REMOTE_DIR_CREATE_ERROR')));
          }
        });
        
        stream.stderr.on('data', (data) => {
          logMessage('warning', 'DIR_CREATE_WARNING', { warning: data.toString().trim() });
        });
      });
    });
  }

  /**
   * 安全地清理远程目录内容（不删除目录本身）
   * @param {Object} conn - SSH连接对象
   * @param {string} remotePath - 远程路径
   * @param {Object} spinner - 加载指示器
   * @returns {Promise<void>}
   */
  static safeCleanRemoteDir(conn, remotePath, spinner) {
    return new Promise((resolve, reject) => {
      // 使用更安全的方法：列出目录内容并逐个删除
      const cleanCommand = `if [ -d "${remotePath}" ] && [ "$(ls -A "${remotePath}")" ]; then find "${remotePath}" -mindepth 1 -maxdepth 1 -exec rm -rf {} +; fi`;
      
      conn.exec(cleanCommand, (err, stream) => {
        if (err) {
          reject(new Error(formatMessage('CLEAN_REMOTE_DIR_COMPLETED', { path: remotePath })));
          return;
        }
        
        let hasError = false;
        stream.on('close', (code) => {
          if (code === 0 && !hasError) {
            spinner?.succeed(formatMessage('CLEAN_REMOTE_DIR_SUCCESS', { path: remotePath }));
            resolve();
          } else {
            spinner?.fail(formatMessage('CLEAN_REMOTE_DIR_COMPLETED', { path: remotePath }));
            resolve(); // 继续上传，即使有警告
          }
        });
        
        stream.stderr.on('data', (data) => {
          const errorData = data.toString().trim();
          if (errorData) {
            logMessage('warning', 'CLEAN_WARNING', { warning: errorData });
            hasError = true;
          }
        });
      });
    });
  }

  /**
   * 执行文件上传
   * @param {string} localDir - 本地目录
   * @param {string} remotePath - 远程路径
   * @param {Object} sshConfig - SSH配置
   * @param {Object} spinner - 加载指示器
   * @returns {Promise<void>}
   */
  static uploadFiles(localDir, remotePath, sshConfig, spinner) {
    return new Promise((resolve, reject) => {
      const uploadOptions = {
        ...sshConfig,
        path: remotePath
      };
      
      scpClient.scp(localDir, uploadOptions, (err) => {
        if (err) {
          reject(new Error(formatMessage('UPLOAD_FAILED', { error: err.message })));
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * 解析钩子命令（支持函数或字符串）
   * @param {string|Function} hook - 钩子命令
   * @param {Object} config - 配置对象
   * @returns {string|null} - 解析后的命令
   */
  static parseHookCommand(hook, config) {
    if (typeof hook === 'function') {
      try {
        return hook(config);
      } catch (error) {
        console.error('Hook function execution error:', error.message);
        return null;
      }
    }
    return hook;
  }

  /**
   * 执行远程命令（用于部署钩子）
   * @param {Object} conn - SSH连接对象
   * @param {string} command - 命令
   * @param {string} description - 描述
   * @param {Object} spinner - 加载指示器
   * @returns {Promise<void>}
   */
  static executeRemoteCommand(conn, command, description, spinner) {
    return new Promise((resolve, reject) => {
      if (!command) {
        resolve();
        return;
      }
      
      spinner?.start(formatMessage('EXECUTING_HOOK', { description }));
      
      conn.exec(command, (err, stream) => {
        if (err) {
          reject(new Error(formatMessage('HOOK_FAILED', { description, code: err.message })));
          return;
        }
        
        let output = '';
        let stderrOutput = '';
        
        stream.on('data', (data) => {
          output += data.toString();
        });
        
        stream.stderr.on('data', (data) => {
          stderrOutput += data.toString();
        });
        
        stream.on('close', (code) => {
          if (code === 0) {
            spinner?.succeed(formatMessage('HOOK_SUCCESS', { description }));
            if (output.trim()) {
              logMessage("info", 'HOOK_OUTPUT', { output: output.trim() });
            }
            resolve();
          } else {
            spinner?.fail(formatMessage('HOOK_FAILED', { description, code }));
            if (stderrOutput.trim()) {
              logMessage('error', 'HOOK_ERROR', { error: stderrOutput.trim() });
            }
            reject(new Error(`${description} failed with exit code: ${code}`));
          }
        });
      });
    });
  }
}

module.exports = RemoteOperations;