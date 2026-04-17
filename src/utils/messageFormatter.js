const chalk = require('chalk');

// 双语消息系统
const MESSAGES = {
  // 配置相关
  CONFIG_ERROR: {
    zh: "配置错误:",
    en: "Configuration Error:"
  },
  MISSING_HOST: {
    zh: "服务器地址 (host) 是必需的",
    en: "Server host is required"
  },
  MISSING_PATH: {
    zh: "远程目录路径 (path) 是必需的", 
    en: "Remote directory path is required"
  },
  
  // 环境相关
  SKIP_DEV_ENV: {
    zh: "开发环境，跳过自动部署",
    en: "Development environment, skipping auto-deployment"
  },
  NO_MATCHING_CONFIG: {
    zh: `未找到匹配当前环境 '{mode}' 的部署配置，跳过自动部署`,
    en: `No deployment configuration found for environment '{mode}', skipping auto-deployment`
  },
  MODE_MISMATCH: {
    zh: `部署配置的 mode '{configMode}' 与当前环境 '{currentMode}' 不匹配，跳过自动部署`,
    en: `Deployment configuration mode '{configMode}' doesn't match current environment '{currentMode}', skipping auto-deployment`
  },
  
  // 安全相关
  PRIVATE_KEY_NOT_FOUND: {
    zh: "私钥文件不存在: {path}",
    en: "Private key file not found: {path}"
  },
  PRIVATE_KEY_VALIDATION_FAILED: {
    zh: "私钥文件验证失败，跳过自动部署",
    en: "Private key validation failed, skipping auto-deployment"
  },
  CONFIG_VALIDATION_FAILED: {
    zh: "部署配置验证失败，跳过自动部署",
    en: "Deployment configuration validation failed, skipping auto-deployment"
  },
  DANGEROUS_PATH_DETECTED: {
    zh: "检测到危险的远程路径 '{path}'，为安全起见跳过自动部署",
    en: "Dangerous remote path '{path}' detected, skipping auto-deployment for security"
  },
  
  // 部署相关
  STARTING_DEPLOYMENT_NAMED: {
    zh: `\n🚀 开始部署到: {name} ({mode})`,
    en: `\n🚀 Starting deployment to: {name} ({mode})`
  },
  STARTING_DEPLOYMENT_UNNAMED: {
    zh: `\n🚀 开始部署到: {host}:{path} ({mode})`,
    en: `\n🚀 Starting deployment to: {host}:{path} ({mode})`
  },
  DEPLOYMENT_ERROR: {
    zh: `\n❌ 部署过程中发生错误: {error}`,
    en: `\n❌ Deployment error occurred: {error}`
  },
  CHECK_CONFIG_AND_RETRY: {
    zh: "请手动检查配置并重新部署",
    en: "Please check your configuration manually and redeploy"
  },
  
  // 远程操作相关
  REMOTE_DIR_READY: {
    zh: "远程目录已准备就绪: {path}",
    en: "Remote directory ready: {path}"
  },
  REMOTE_DIR_CREATE_ERROR: {
    zh: "创建远程目录时出现错误",
    en: "Error occurred while creating remote directory"
  },
  DIR_CREATE_WARNING: {
    zh: "目录创建警告: {warning}",
    en: "Directory creation warning: {warning}"
  },
  CLEAN_REMOTE_DIR_SUCCESS: {
    zh: "成功清理远程目录: {path}",
    en: "Successfully cleaned remote directory: {path}"
  },
  CLEAN_REMOTE_DIR_COMPLETED: {
    zh: "清理远程目录完成（可能有警告）: {path}",
    en: "Remote directory cleanup completed (may have warnings): {path}"
  },
  CLEAN_WARNING: {
    zh: "清理警告: {warning}",
    en: "Cleanup warning: {warning}"
  },
  
  // SSH 相关
  CONNECTING_TO_SERVER: {
    zh: "连接服务器 {host}:{port}...",
    en: "Connecting to server {host}:{port}..."
  },
  SERVER_CONNECTED: {
    zh: "服务器 {host} 连接成功，准备部署...",
    en: "Server {host} connected successfully, preparing for deployment..."
  },
  SSH_CONNECTION_FAILED: {
    zh: "SSH 连接失败: {error}",
    en: "SSH connection failed: {error}"
  },
  
  // 文件传输相关
  UPLOADING_FILES: {
    zh: "上传文件到 {path}...",
    en: "Uploading files to {path}..."
  },
  UPLOAD_SUCCESS: {
    zh: "部署成功！文件已上传至 {host}:{path}",
    en: "Deployment successful! Files uploaded to {host}:{path}"
  },
  UPLOAD_FAILED: {
    zh: "文件上传失败: {error}",
    en: "File upload failed: {error}"
  },
  
  // 钩子相关
  EXECUTING_HOOK: {
    zh: "执行 {description}...",
    en: "Executing {description}..."
  },
  HOOK_SUCCESS: {
    zh: "{description} 成功",
    en: "{description} successful"
  },
  HOOK_FAILED: {
    zh: "{description} 失败 (退出码: {code})",
    en: "{description} failed (exit code: {code})"
  },
  HOOK_OUTPUT: {
    zh: "输出: {output}",
    en: "Output: {output}"
  },
  HOOK_ERROR: {
    zh: "错误: {error}",
    en: "Error: {error}"
  },
  
  // 日志相关
  LOGGING_ENABLED: {
    zh: "📝 部署日志已启用: {logFile}",
    en: "📝 Deployment logging enabled: {logFile}"
  },
  LOG_INIT_FAILED: {
    zh: "⚠️  日志初始化失败: {error}",
    en: "⚠️  Log initialization failed: {error}"
  },
  LOG_WRITE_FAILED: {
    zh: "⚠️  日志写入失败: {error}",
    en: "⚠️  Log write failed: {error}"
  },
  LOG_FINALIZE_FAILED: {
    zh: "⚠️  日志结束写入失败: {error}",
    en: "⚠️  Log finalization failed: {error}"
  },
  LOG_SAVED_SUCCESS: {
    zh: "✅ 部署日志已保存: {logFile}",
    en: "✅ Deployment log saved: {logFile}"
  },
  LOG_SAVED_WITH_ERROR: {
    zh: "❌ 部署日志已保存（包含错误）: {logFile}",
    en: "❌ Deployment log saved (with errors): {logFile}"
  },
  
  // 通知相关
  UNKNOWN_NOTIFICATION_TYPE: {
    zh: "未知的通知类型: {type}",
    en: "Unknown notification type: {type}"
  },
  NOTIFICATION_SEND_FAILED: {
    zh: "发送通知失败 ({type}): {error}",
    en: "Failed to send notification ({type}): {error}"
  },
  EMAIL_NOTIFICATION_CONFIG: {
    zh: "📧 邮件通知配置: {from} -> {to}",
    en: "📧 Email notification config: {from} -> {to}"
  },
  EMAIL_NOTIFICATION_SUBJECT: {
    zh: "📧 主题: {subject}",
    en: "📧 Subject: {subject}"
  },
  EMAIL_NOTIFICATION_PLACEHOLDER: {
    zh: "⚠️  邮件通知功能需要额外的邮件服务配置",
    en: "⚠️  Email notification requires additional email service configuration"
  },
  
  // 并行部署相关
  STARTING_PARALLEL_DEPLOYMENT: {
    zh: "🚀 开始并行部署到 {count} 个服务器...",
    en: "🚀 Starting parallel deployment to {count} servers..."
  },
  PARALLEL_DEPLOYMENT_COMPLETE: {
    zh: "\n📊 并行部署完成: {success} 成功, {failed} 失败",
    en: "\n📊 Parallel deployment complete: {success} successful, {failed} failed"
  },
  PARALLEL_DEPLOYMENT_PARTIAL_FAILURE: {
    zh: "并行部署中有 {failed} 个服务器部署失败",
    en: "Parallel deployment had {failed} server deployments fail"
  }
};

/**
 * 格式化消息 - 修改为使用换行符分隔中英文
 * @param {string} key - 消息键
 * @param {Object} params - 参数对象
 * @returns {string} - 格式化后的消息
 */
function formatMessage(key, params = {}) {
  const zhMessage = MESSAGES[key]?.['zh'] || key;
  const enMessage = MESSAGES[key]?.['en'] || key;
  
  // 替换参数
  let finalZhMessage = zhMessage;
  let finalEnMessage = enMessage;
  
  Object.keys(params).forEach(param => {
    const placeholder = `{${param}}`;
    if (finalZhMessage.includes(placeholder)) {
      finalZhMessage = finalZhMessage.replace(placeholder, params[param]);
    }
    if (finalEnMessage.includes(placeholder)) {
      finalEnMessage = finalEnMessage.replace(placeholder, params[param]);
    }
  });
  
  // 如果中英文相同，只返回一个；否则返回两者，用换行符分隔
  if (finalZhMessage === finalEnMessage) {
    return finalZhMessage;
  }
  
  return `${finalZhMessage}\n${finalEnMessage}`;
}

/**
 * 双语日志函数
 * @param {'info'|'success'|'warning'|'error'|'gray'|'cyan'} level - 日志级别
 * @param {string} key - 消息键
 * @param {Object} params - 参数对象
 */
function logMessage(level, key, params = {}) {
  const message = formatMessage(key, params);
  switch (level) {
    case 'info':
      console.log(chalk.blue(message));
      break;
    case 'success':
      console.log(chalk.green(message));
      break;
    case 'warning':
      console.log(chalk.yellow(message));
      break;
    case 'error':
      console.log(chalk.red(message));
      break;
    case 'gray':
      console.log(chalk.gray(message));
      break;
    case 'cyan':
      console.log(chalk.cyan(message));
      break;
    default:
      console.log(message);
  }
}

module.exports = {
  MESSAGES,
  formatMessage,
  logMessage
};