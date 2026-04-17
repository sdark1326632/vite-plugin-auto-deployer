const { logMessage } = require('../utils/messageFormatter');

/**
 * 通知器基类
 */
class BaseNotifier {
  /**
   * 发送通知
   * @param {Object} notification - 通知配置
   * @param {Object} data - 通知数据
   * @returns {Promise<void>}
   */
  async send(notification, data) {
    throw new Error('send method must be implemented by subclass');
  }

  /**
   * 记录通知发送失败
   * @param {string} type - 通知类型
   * @param {Error} error - 错误对象
   */
  logSendFailure(type, error) {
    logMessage('warning', 'NOTIFICATION_SEND_FAILED', { type, error: error.message });
  }
}

module.exports = BaseNotifier;