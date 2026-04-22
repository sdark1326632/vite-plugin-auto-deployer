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
      // 使用更安全的命令：列出目录内容再逐个删除
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
        path: remotePath,
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
   * 并发上传文件（性能优化版本）
   * @param {string} localDir - 本地目录
   * @param {string} remotePath - 远程路径
   * @param {Object} sshConfig - SSH配置
   * @param {Object} spinner - 加载指示器
   * @param {Object} options - 选项
   * @returns {Promise<void>}
   */
  static async uploadFilesConcurrent(localDir, remotePath, sshConfig, spinner, options = {}) {
    const { concurrency = 3, compress = false } = options;
    const fs = require('fs').promises;
    const path = require('path');

    // 获取所有文件
    const files = await this.getAllFiles(localDir);
    
    if (files.length === 0) {
      if (spinner) {
      spinner.succeed(formatMessage('UPLOAD_SUCCESS'));
    }
      return;
    }

    spinner?.start(formatMessage('UPLOADING_FILES_COUNT', { count: files.length }));

    // 分批处理文件
    const batches = [];
    for (let i = 0; i < files.length; i += concurrency) {
      batches.push(files.slice(i, i + concurrency));
    }

    let uploadedCount = 0;
    const totalFiles = files.length;

    for (const batch of batches) {
      const uploadPromises = batch.map(async (filePath) => {
        const relativePath = path.relative(localDir, filePath);
        const remoteFilePath = path.posix.join(remotePath, relativePath.replace(/\\/g, '/'));

        return this.uploadSingleFile(filePath, remoteFilePath, sshConfig);
      });

      await Promise.allSettled(uploadPromises);
      uploadedCount += batch.length;
      
      const progress = Math.round((uploadedCount / totalFiles) * 100);
      if (spinner) {
      spinner.text = formatMessage('UPLOAD_PROGRESS', { uploaded: uploadedCount, total: totalFiles, progress });
    }

    if (spinner) {
      spinner.succeed(formatMessage('UPLOAD_SUCCESS'));
    }
  }

  /**
   * 上传单个文件
   * @param {string} localPath - 本地文件路径
   * @param {string} remotePath - 远程文件路径
   * @param {Object} sshConfig - SSH配置
   * @returns {Promise<void>}
   */
  static uploadSingleFile(localPath, remotePath, sshConfig) {
    return new Promise((resolve, reject) => {
      const { Client } = require('ssh2');
      const fs = require('fs');

      const conn = new Client();
      
      conn.on('ready', () => {
        conn.sftp((err, sftp) => {
          if (err) {
            conn.end();
            reject(err);
            return;
          }

          // 确保远程目录存在
          const remoteDir = path.posix.dirname(remotePath);
          conn.exec(`mkdir -p "${remoteDir}"`, (mkdirErr) => {
            if (mkdirErr) {
              sftp.end();
              conn.end();
              reject(mkdirErr);
              return;
            }

            // 上传文件
            sftp.fastPut(localPath, remotePath, (uploadErr) => {
              sftp.end();
              conn.end();
              
              if (uploadErr) {
                reject(uploadErr);
              } else {
                resolve();
              }
            });
          });
        });
      });

      conn.on('error', (err) => {
        reject(err);
      });

      conn.connect({
        host: sshConfig.host,
        port: sshConfig.port,
        username: sshConfig.username,
        password: sshConfig.password,
      });
    });
  }

  /**
   * 获取目录下所有文件
   * @param {string} dir - 目录路径
   * @returns {Promise<string[]>}
   */
  static async getAllFiles(dir) {
    const fs = require('fs').promises;
    const path = require('path');
    const files = [];

    async function scan(currentDir) {
      const items = await fs.readdir(currentDir);

      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = await fs.stat(fullPath);

        if (stat.isDirectory()) {
          await scan(fullPath);
        } else {
          files.push(fullPath);
        }
      }
    }

    await scan(dir);
    return files;
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
              logMessage('info', 'HOOK_OUTPUT', { output: output.trim() });
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