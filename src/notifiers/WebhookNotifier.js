const BaseNotifier = require('./BaseNotifier');

/**
 * Webhook通知器
 */
class WebhookNotifier extends BaseNotifier {
  /**
   * 发送Webhook通知
   * @param {Object} notification - 通知配置
   * @param {Object} data - 通知数据
   * @returns {Promise<void>}
   */
  async send(notification, data) {
    const { url, headers = {}, method = 'POST' } = notification;
    
    const https = require('https');
    const http = require('http');
    const urlModule = require('url');
    
    const parsedUrl = urlModule.parse(url);
    const isHttps = parsedUrl.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const postData = JSON.stringify(data);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...headers
      }
    };
    
    return new Promise((resolve, reject) => {
      const req = client.request(options, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve();
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        }
      });
      
      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }
}

module.exports = WebhookNotifier;