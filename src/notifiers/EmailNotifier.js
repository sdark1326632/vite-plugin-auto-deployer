const BaseNotifier = require('./BaseNotifier');
const { logMessage } = require('../utils/messageFormatter');

// 邮件通知依赖（懒加载）
let nodemailer;

/**
 * 邮件模板生成器
 * @param {string} templateType - 模板类型
 * @param {Object} data - 通知数据
 * @returns {string} - HTML邮件内容
 */
function generateEmailTemplate(templateType, data) {
  const { deployment } = data;
  
  switch (templateType) {
    case 'simple':
      return `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>Deployment ${deployment.success ? 'Success' : 'Failed'}</h2>
          <p><strong>Server:</strong> ${deployment.name || deployment.host}</p>
          <p><strong>Mode:</strong> ${deployment.mode}</p>
          <p><strong>Path:</strong> ${deployment.path}</p>
          <p><strong>Time:</strong> ${new Date(deployment.timestamp).toLocaleString()}</p>
          ${deployment.error ? `<p><strong>Error:</strong> ${deployment.error}</p>` : ''}
        </div>
      `;
    
    default: // 'default' template
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: ${deployment.success ? '#4CAF50' : '#f44336'}; margin: 0;">
              🚀 Vite Auto Deployer
            </h1>
            <p style="color: #666; margin: 5px 0;">Automated Deployment Notification</p>
          </div>
          
          <div style="background: ${deployment.success ? '#e8f5e8' : '#ffeaea'}; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; color: ${deployment.success ? '#2e7d32' : '#c62828'};">
              ${deployment.success ? '✅ Deployment Successful' : '❌ Deployment Failed'}
            </h3>
            <p style="margin: 0; font-size: 14px;">
              ${deployment.success ? 'Your application has been successfully deployed!' : 'There was an error during deployment.'}
            </p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h4 style="margin: 0 0 10px 0; color: #333; border-bottom: 1px solid #eee; padding-bottom: 5px;">Deployment Details</h4>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; width: 30%;"><strong>Server Name:</strong></td>
                <td style="padding: 8px 0;">${deployment.name || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Environment:</strong></td>
                <td style="padding: 8px 0;">${deployment.mode}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Host:</strong></td>
                <td style="padding: 8px 0;">${deployment.host}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Remote Path:</strong></td>
                <td style="padding: 8px 0;">${deployment.path}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Timestamp:</strong></td>
                <td style="padding: 8px 0;">${new Date(deployment.timestamp).toLocaleString()}</td>
              </tr>
            </table>
          </div>
          
          ${deployment.error ? `
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
              <h4 style="margin: 0 0 10px 0; color: #856404;">Error Details</h4>
              <p style="margin: 0; font-family: monospace; font-size: 13px; color: #856404; white-space: pre-wrap;">${deployment.error}</p>
            </div>
          ` : ''}
          
          <div style="text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 15px;">
            <p style="margin: 0;">This is an automated message from Vite Auto Deployer.</p>
          </div>
        </div>
      `;
  }
}

/**
 * 邮件通知器
 */
class EmailNotifier extends BaseNotifier {
  /**
   * 发送邮件通知
   * @param {Object} notification - 通知配置
   * @param {Object} data - 通知数据
   * @returns {Promise<void>}
   */
  async send(notification, data) {
    const { smtp, from, to, subject, template = 'default' } = notification;
    
    // 懒加载nodemailer
    if (!nodemailer) {
      try {
        nodemailer = require('nodemailer');
      } catch (error) {
        logMessage('error', 'EMAIL_NOTIFICATION_PLACEHOLDER');
        throw new Error('nodemailer package is required for email notifications. Please install it: npm install nodemailer');
      }
    }
    
    // 创建邮件传输器
    const transporter = nodemailer.createTransport(smtp);
    
    // 验证SMTP连接
    try {
      await transporter.verify();
    } catch (error) {
      throw new Error(`SMTP connection verification failed: ${error.message}`);
    }
    
    // 构建邮件内容
    const mailOptions = {
      from: from,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject: subject || 'Vite Auto Deployment Notification',
      html: generateEmailTemplate(template, data)
    };
    
    // 发送邮件
    const info = await transporter.sendMail(mailOptions);
    
    logMessage('success', 'EMAIL_NOTIFICATION_CONFIG', { from, to: Array.isArray(to) ? to.join(', ') : to });
    logMessage('success', 'EMAIL_NOTIFICATION_SUBJECT', { subject: mailOptions.subject });
    
    return info;
  }
}

module.exports = EmailNotifier;