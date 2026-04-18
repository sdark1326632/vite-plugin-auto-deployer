import { Plugin } from 'vite';

interface WebhookNotification {
  /** 通知类型: webhook */
  type: 'webhook';
  /** Webhook URL */
  url: string;
  /** HTTP 请求头 */
  headers?: Record<string, string>;
  /** HTTP 方法，默认为 POST */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

interface EmailNotification {
  /** 通知类型: email */
  type: 'email';
  /** SMTP 配置 */
  smtp: {
    host: string;
    port: number;
    secure?: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  /** 发件人邮箱 */
  from: string;
  /** 收件人邮箱 */
  to: string | string[];
  /** 邮件主题 */
  subject?: string;
}

interface VitePluginAutoDeployerOptions {
  /** 环境模式，用于匹配当前构建环境（必需） */
  mode: string;
  /** 服务器名称（可选，用于显示） */
  name?: string;
  /** 服务器主机地址（必需） */
  host: string;
  /** SSH端口，默认为22 */
  port?: number;
  /** 服务器用户名（可选，如未提供将在部署时交互式输入） */
  username?: string;
  /** 服务器密码（可选，如未提供将在部署时交互式输入） */
  password?: string;
  /** 远程服务器目标路径（必需） */
  path: string;
  /** 本地构建输出目录，默认使用Vite配置的outDir */
  outDir?: string;
  /** SSH连接超时时间（毫秒），默认5000 */
  readyTimeout?: number;
  /** 部署前执行的远程命令（可选） */
  beforeDeploy?: string;
  /** 部署后执行的远程命令（可选） */
  afterDeploy?: string;
  /** 是否启用部署日志，默认为 true */
  enableLogging?: boolean;
  /** 自定义日志目录，默认为 ~/.vite-auto-deployer/logs */
  logDir?: string;
  /** 通知配置数组 */
  notifications?: (WebhookNotification | EmailNotification)[];
}

/**
 * Vite自动部署插件
 * 
 * @param options - 单个部署配置或部署配置数组
 * @returns Vite插件实例
 * 
 * @example
 * // 基础配置（密码认证）
 * autoDeployer({
 *   mode: 'production',
 *   host: '192.168.1.100',
 *   path: '/var/www/html'
 * })
 * 
 * @example
 * // 包含部署钩子和通知
 * autoDeployer({
 *   mode: 'production',
 *   host: '192.168.1.100',
 *   path: '/var/www/html',
 *   beforeDeploy: 'echo "Starting deployment..." && pm2 stop app || true',
 *   afterDeploy: 'npm install --production && pm2 start app.js || pm2 restart app',
 *   notifications: [
 *     {
 *       type: 'webhook',
 *       url: 'https://hooks.slack.com/services/xxx',
 *       headers: { 'Content-Type': 'application/json' }
 *     }
 *   ]
 * })
 * 
 * @example
 * // 多环境配置 - 插件会根据当前构建环境自动选择第一个匹配的配置进行部署
 * autoDeployer([
 *   {
 *     mode: 'staging',
 *     host: '192.168.1.101',
 *     path: '/var/www/staging'
 *   },
 *   {
 *     mode: 'production', 
 *     host: '192.168.1.102',
 *     path: '/var/www/production',
 *     enableLogging: true,
 *     notifications: [
 *       { type: 'webhook', url: 'https://notify.example.com/deploy' }
 *     ]
 *   }
 * ])
 * 
 * @note 注意：SSH密钥认证已从本插件中移除，仅支持基于密码的认证方式。
 * @note 注意：mode 参数现在是必需的，必须明确指定部署环境。
 */
declare function vitePluginAutoDeployer(
  options: VitePluginAutoDeployerOptions | VitePluginAutoDeployerOptions[]
): Plugin;

export = vitePluginAutoDeployer;