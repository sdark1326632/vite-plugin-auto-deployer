const chalk = require('chalk');
const { formatMessage, logMessage } = require('../utils/messageFormatter');
const { isDangerousPath } = require('../utils/pathValidator');

/**
 * 验证必填字段
 * @param {Object} options - 配置选项
 * @returns {boolean} - 验证是否通过
 */
function validateRequiredFields(options) {
  const errors = [];
  
  if (!options.host) {
    errors.push(formatMessage('MISSING_HOST'));
  }
  
  if (!options.path) {
    errors.push(formatMessage('MISSING_PATH'));
  }
  
  if (errors.length > 0) {
    logMessage('error', 'CONFIG_ERROR');
    errors.forEach(error => {
      // 使用灰色显示错误详情，保持一致性
      console.log(chalk.gray('  - ' + error));
    });
    return false;
  }
  
  // 设置默认端口
  if (options.port == null) {
    options.port = 22;
  }
  
  return true;
}

/**
 * 验证部署配置的完整性
 * @param {Object} config - 部署配置
 * @returns {Promise<boolean>} - 验证是否通过
 */
async function validateDeploymentConfig(config) {
  // 验证必填字段
  if (!validateRequiredFields(config)) {
    logMessage('error', 'CONFIG_VALIDATION_FAILED');
    return false;
  }
  
  // 验证路径安全性
  if (isDangerousPath(config.path)) {
    logMessage('error', 'DANGEROUS_PATH_DETECTED', { path: config.path });
    return false;
  }
  
  return true;
}

module.exports = {
  validateRequiredFields,
  validateDeploymentConfig
};