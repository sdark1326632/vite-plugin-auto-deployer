/**
 * 获取环境模式
 * @param {Object} resolvedConfig - Vite解析后的配置
 * @returns {string} - 环境模式
 */
function getEnvironmentMode(resolvedConfig) {
  // Vite 的 mode 在 resolvedConfig.mode 中
  return resolvedConfig.mode || process.env.NODE_ENV || 'development';
}

module.exports = {
  getEnvironmentMode,
};
