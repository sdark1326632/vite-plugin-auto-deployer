const WebhookNotifier = require('./WebhookNotifier');
const EmailNotifier = require('./EmailNotifier');
const { logMessage } = require('../utils/messageFormatter');

/**
 * 通知管理器
 */
class NotificationManager {
  constructor() {
    this.notifiers = {
      webhook: new WebhookNotifier(),
      email: new EmailNotifier(),
    };
  }

  /**
   * 发送通知
   * @param {Object[]} notifications - 通知配置数组
   * @param {boolean} success - 部署是否成功
   * @param {Error|null} error - 错误对象（如果失败）
   * @returns {Promise<void>}
   */
  async sendNotifications(notifications = [], success, error = null) {
    if (notifications.length === 0) return;

    const notificationData = {
      deployment: {
        name: this.config?.name,
        mode: this.config?.mode,
        host: this.config?.host,
        path: this.config?.path,
        timestamp: new Date().toISOString(),
        success,
        error: error ? error.message : null,
      },
    };

    for (const notification of notifications) {
      try {
        const notifier = this.notifiers[notification.type];
        if (!notifier) {
          logMessage('warning', 'UNKNOWN_NOTIFICATION_TYPE', { type: notification.type });
          continue;
        }
        await notifier.send(notification, notificationData);
      } catch (notifyError) {
        this.notifiers[notification.type]?.logSendFailure?.(notification.type, notifyError) ||
          logMessage('warning', 'NOTIFICATION_SEND_FAILED', {
            type: notification.type,
            error: notifyError.message,
          });
      }
    }
  }

  /**
   * 设置部署配置（用于通知数据）
   * @param {Object} config - 部署配置
   */
  setConfig(config) {
    this.config = config;
  }
}

module.exports = NotificationManager;
