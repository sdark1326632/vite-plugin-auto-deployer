const path = require('path');

/**
 * 危险路径模式（更严格的验证）
 * @type {RegExp[]}
 */
const DANGEROUS_PATH_PATTERNS = [
  /^\/$/,           // 根目录
  /^\/[^/]+\/?\*$/, // 如 /home/*
  /^(\/[^/]+)*\/\*$/, // 任意深度的 /*
  /^\/(bin|boot|dev|etc|home|lib|opt|proc|root|run|sbin|srv|sys|usr|var)(\/.*)?$/i, // 系统目录
];

/**
 * 验证路径是否安全
 * @param {string} remotePath - 远程路径
 * @returns {boolean} - 是否为危险路径
 */
function isDangerousPath(remotePath) {
  if (!remotePath || typeof remotePath !== 'string') {
    return true;
  }
  
  // 规范化路径（移除末尾斜杠）
  const normalizedPath = remotePath.replace(/\/+$/, '');
  
  // 检查是否包含危险模式
  return DANGEROUS_PATH_PATTERNS.some(pattern => pattern.test(normalizedPath));
}

module.exports = {
  isDangerousPath,
  DANGEROUS_PATH_PATTERNS
};