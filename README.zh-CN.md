# Vite Auto Deployer

[English Documentation](readme.md) | [中文文档](README.zh-CN.md)

**Vite 自动化部署插件** - 专为现代前端开发工作流设计的智能部署解决方案


## 📌 目录

- [✨ 核心特性](#-核心特性)
- [🚀 快速开始](#-快速开始)
- [🔧 配置选项](#-配置选项)
- [🎯 高级功能](#-高级功能)
- [🔒 安全保障](#-安全保障)
- [📝 日志与监控](#-日志与监控)
- [🌐 多语言支持](#-多语言支持)
- [⚡ 性能与可靠性](#-性能与可靠性)
- [🛠️ 故障排除](#-故障排除)
- [📋 最佳实践](#-最佳实践)

## ✨ 核心特性

### 智能自动化部署
- **无缝集成**: 作为标准 Vite 插件，自动在构建完成后触发部署流程
- **环境感知**: 根据 `--mode` 参数自动匹配对应的服务器配置
- **智能目录检测**: 自动识别 Vite 配置的输出目录 (`outDir`)，无需手动指定

### 安全可靠的传输
- **多重认证**: 支持密码认证和 SSH 密钥认证
- **SSH/SCP 协议**: 基于安全的 SSH 连接进行文件传输
- **路径安全验证**: 严格验证远程路径，防止误删系统关键目录

### 灵活的部署控制
- **交互式凭证输入**: 敏感信息不在配置文件中硬编码，部署时安全输入
- **部署钩子**: 支持部署前后的自定义命令执行（字符串或函数形式）
- **多环境配置**: 支持配置多个环境（如 staging、production），插件会根据当前构建环境自动选择匹配的配置进行部署

### 专业的用户体验
- **双语消息**: 同时显示中英文提示，确保全球开发者都能理解
- **详细日志**: 完整的部署审计日志，便于问题追踪和分析
- **通知集成**: 支持 Webhook 和邮件通知，实时掌握部署状态

## 🚀 快速开始

### 安装

```bash
# npm
npm install -D vite-plugin-auto-deployer

# yarn
yarn add -D vite-plugin-auto-deployer

# pnpm
pnpm add -D vite-plugin-auto-deployer
```

### 基础配置

```js
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import autoDeployer from 'vite-plugin-auto-deployer'

const deploymentConfig = {
  name: '生产环境',
  mode: 'production',           // 匹配构建命令中的 --mode 参数
  host: '192.168.1.100',       // 服务器地址
  port: 22,                    // SSH 端口
  username: 'deploy',          // 服务器用户名
  // password: 'your-password', // 密码（可选，推荐交互式输入）
  path: '/var/www/html'        // 远程部署目录
}

export default defineConfig({
  plugins: [
    vue(),
    autoDeployer(deploymentConfig)
  ]
})
```

### 构建与部署

```bash
# 开发环境构建（不触发部署）
npm run build --mode development

# 测试环境部署
npm run build --mode staging

# 生产环境部署
npm run build --mode production
```

## 🔧 配置选项

### 基础配置

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `name` | `string` | 否 | - | 服务器名称，用于日志和显示 |
| `mode` | `string` | 否 | 当前构建模式 | 匹配 Vite 的构建模式 |
| `host` | `string` | **是** | - | 服务器 IP 地址或域名 |
| `port` | `number` | 否 | `22` | SSH 端口 |
| `username` | `string` | 否 | - | 服务器用户名（未提供则交互式输入） |
| `password` | `string` | 否 | - | 服务器密码（未提供则交互式输入） |
| `path` | `string` | **是** | - | 远程服务器部署目录 |
| `outDir` | `string` | 否 | Vite 配置的 `outDir` | 本地构建输出目录 |

### 认证配置

#### SSH 密钥认证（推荐）

```js
const config = {
  // ... 其他配置
  privateKeyPath: '~/.ssh/id_rsa',     // 私钥文件路径
  passphrase: 'your-key-passphrase'    // 私钥密码（如果有的话）
}
```

#### 密码认证

```js
const config = {
  // ... 其他配置
  password: 'your-password'            // 明文密码（不推荐）
  // 或省略 password 字段，在部署时交互式输入
}
```

### 部署钩子

#### 字符串形式

```js
const config = {
  // ... 其他配置
  beforeDeploy: 'echo "Stopping services..." && pm2 stop app || true',
  afterDeploy: 'npm install --production && pm2 start app.js'
}
```

#### 函数形式（动态配置）

```js
const config = {
  // ... 其他配置
  beforeDeploy: (deploymentConfig) => {
    if (deploymentConfig.mode === 'production') {
      return 'pm2 stop app && echo "Production services stopped"';
    }
    return 'echo "Staging deployment starting"';
  },
  afterDeploy: (deploymentConfig) => {
    const commands = [
      'npm install --production',
      `echo "Deployment completed for ${deploymentConfig.name}"`,
      'pm2 start app.js || pm2 restart app'
    ];
    return commands.join(' && ');
  }
}
```

### 日志配置

```js
const config = {
  // ... 其他配置
  enableLogging: true,                 // 启用日志（默认：false）
  logDir: './deployment-logs'          // 自定义日志目录（默认：./.vite-auto-deployer/logs）
}
```

### 通知配置

```js
const config = {
  // ... 其他配置
  notifications: [
    // Webhook 通知
    {
      type: 'webhook',
      url: 'https://hooks.slack.com/services/YOUR/WEBHOOK',
      headers: { 'Content-Type': 'application/json' },
      method: 'POST'
    },
    // 邮件通知（需要 SMTP 配置）
    {
      type: 'email',
      smtp: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'your-email@gmail.com',
          pass: 'your-app-password'
        }
      },
      from: 'deploy@yourcompany.com',
      to: ['devops@yourcompany.com'],
      subject: 'Vite Auto Deployment Status'
    }
  ]
}
```

#### QQ邮箱配置示例

要使用QQ邮箱发送通知，请按以下步骤配置：

**1. 获取QQ邮箱授权码**
- 登录QQ邮箱网页版
- 进入「设置」→「账户」
- 找到「POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务」
- 开启「IMAP/SMTP服务」
- 按照提示发送短信获取授权码（16位字母数字组合）

**2. QQ邮箱SMTP配置**

```js
const config = {
  // ... 其他配置
  notifications: [
    {
      type: 'email',
      smtp: {
        host: 'smtp.qq.com',        // QQ邮箱SMTP服务器
        port: 465,                  // SSL端口
        secure: true,               // 使用SSL加密
        auth: {
          user: 'your-qq-number@qq.com',  // 你的QQ邮箱（完整邮箱地址）
          pass: 'your-authorization-code' // QQ邮箱授权码（不是登录密码！）
        }
      },
      from: 'your-qq-number@qq.com',      // 发件人邮箱
      to: ['recipient1@example.com', 'recipient2@example.com'], // 收件人列表
      subject: 'Vite自动部署通知',         // 邮件主题
      template: 'default'                 // 邮件模板（可选：'default' 或 'simple'）
    }
  ]
}
```

**4. 环境变量安全配置（推荐）**

为避免在代码中硬编码敏感信息，建议使用环境变量：

```js
// vite.config.js
const config = {
  // ... 其他配置
  notifications: [
    {
      type: 'email',
      smtp: {
        host: 'smtp.qq.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.QQ_EMAIL_USER,     // 从环境变量获取
          pass: process.env.QQ_EMAIL_PASSWORD  // 从环境变量获取
        }
      },
      from: process.env.QQ_EMAIL_USER,
      to: [process.env.DEPLOY_NOTIFY_EMAIL],
      subject: 'Vite自动部署通知'
    }
  ]
}
```

然后在 `.env.local` 文件中配置（不要提交到版本控制）：

```
# .env.local
QQ_EMAIL_USER=your-qq-number@qq.com
QQ_EMAIL_PASSWORD=your-16-digit-authorization-code
DEPLOY_NOTIFY_EMAIL=dev-team@example.com,manager@example.com
```

**邮件模板选项**
- `default`: 专业的HTML格式邮件，包含完整的部署详情和状态指示
- `simple`: 简洁的文本格式邮件，只包含基本信息

**注意事项**
- QQ邮箱的 `pass` 字段必须使用**授权码**，不是QQ密码
- 授权码一旦泄露，可以在QQ邮箱设置中重新生成
- 建议使用专用的QQ邮箱账号用于部署通知，而不是个人主要邮箱
- 邮件发送频率受限于QQ邮箱的发送限制（通常每分钟最多10封）

## 🎯 高级功能

### 多服务器配置

#### 基于环境的单服务器选择

插件现在支持**从配置列表中选择单个服务器进行部署**。当您提供服务器配置数组时，插件会自动根据当前构建环境（`--mode`）找到并部署到**第一个匹配的服务器**，而不是同时部署到所有匹配的服务器。

这种方案提供了更好的控制性，防止意外的多服务器部署。

```js
const multiEnvironmentConfig = [
  // 测试环境 - 当 --mode staging 时会被选中
  {
    name: 'Staging Server',
    mode: 'staging',
    host: '192.168.1.200',
    path: '/var/www/staging',
    privateKeyPath: '~/.ssh/staging_key'
  },
  // 生产环境 - 当 --mode production 时会被选中  
  {
    name: 'Production Server',
    mode: 'production',
    host: '192.168.1.100',
    path: '/var/www/html',
    privateKeyPath: '~/.ssh/prod_key'
  },
  // 额外的生产服务器（除非在数组中排在前面，否则不会被部署）
  {
    name: 'Backup Production Server',
    mode: 'production',
    host: '192.168.1.101',
    path: '/var/www/html',
    privateKeyPath: '~/.ssh/prod_key'
  }
]

export default defineConfig({
  plugins: [vue(), autoDeployer(multiEnvironmentConfig)]
})
```

**部署行为：**
- 运行 `npm run build -- --mode staging` 时：只部署到 "Staging Server"
- 运行 `npm run build -- --mode production` 时：只部署到 "Production Server"（第一个匹配项）
- "Backup Production Server" 只有在数组中排在主生产服务器之前时才会被部署

#### 同一环境的多服务器并行部署

如果您确实需要对同一环境进行真正的并行多服务器部署，仍然可以通过显式提供具有相同 `mode` 值的多个配置来实现：

```js
// 这将同时部署到两个服务器（相同的mode）
const parallelProductionServers = [
  {
    name: 'Production Server 1',
    mode: 'production',
    host: '192.168.1.100',
    path: '/var/www/html'
  },
  {
    name: 'Production Server 2', 
    mode: 'production',
    host: '192.168.1.101',
    path: '/var/www/html'
  }
]
```

然而，对于大多数使用场景，推荐使用单服务器选择模式，因为它提供了更清晰的部署意图，并降低了意外多服务器部署的风险。

#### 单模式多服务器

```js
const serverList = [
  {
    name: 'Web Server 1',
    mode: 'production',
    host: '192.168.1.101',
    path: '/var/www/html',
    privateKeyPath: '~/.ssh/web_servers'
  },
  {
    name: 'Web Server 2',
    mode: 'production',
    host: '192.168.1.102',
    path: '/var/www/html',
    privateKeyPath: '~/.ssh/web_servers'
  }
]

export default defineConfig({
  plugins: [vue(), autoDeployer(serverList)]
})
```

#### 多环境配置

```js
const multiEnvironmentConfig = [
  // 测试环境
  {
    name: 'Staging Server',
    mode: 'staging',
    host: '192.168.1.200',
    path: '/var/www/staging',
    privateKeyPath: '~/.ssh/staging_key'
  },
  // 生产环境
  {
    name: 'Production Server',
    mode: 'production',
    host: '192.168.1.100',
    path: '/var/www/html',
    privateKeyPath: '~/.ssh/prod_key'
  }
]
```

### 环境自动匹配优势

- **智能选择**: 插件会根据当前构建环境（`--mode` 参数或 `NODE_ENV`）自动选择匹配的配置
- **简化配置**: 无需为不同环境维护多个配置文件，所有配置集中管理
- **安全隔离**: 不同环境的服务器配置完全隔离，避免误操作

## 🔒 安全保障

### 路径安全验证

插件内置严格的路径验证机制，防止危险操作：

**被阻止的危险路径包括：**
- 根目录 (`/`)
- 系统关键目录 (`/bin`, `/etc`, `/usr`, `/var` 等)
- 通配符路径 (`/*`, `/home/*`)
- 任何可能导致系统文件删除的路径

### 安全目录清理

采用安全的文件清理策略，替代危险的 `rm -rf` 命令：

```bash
# 安全清理命令
find "${remotePath}" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
```

**优势：**
- 只删除目录内容，保留目录本身
- 限制删除深度，防止递归误删
- 正确处理权限和错误情况

### 认证安全最佳实践

1. **避免密码硬编码**: 不在配置文件中存储明文密码
2. **使用 SSH 密钥**: 生产环境推荐使用 SSH 密钥认证
3. **私钥权限**: 确保私钥文件权限为 `600`
4. **交互式输入**: 敏感信息在部署时安全输入

## 📝 日志与监控

### 日志功能

**默认状态**: 关闭（需要显式启用）

**启用方式**:
```js
{
  enableLogging: true,
  logDir: './custom-logs' // 可选：自定义日志目录
}
```

**日志格式**: JSON 格式，包含完整的部署上下文信息

**日志示例**:
```
{
  "timestamp": "2026-04-16T18:24:09.123Z",
  "level": "DEPLOYMENT_START",
  "deploymentId": "deploy-1681642754-abc123",
  "config": {
    "name": "生产环境",
    "mode": "production",
    "host": "192.168.1.100",
    "port": 22,
    "path": "/var/www/html"
  },
  "environment": {
    "nodeVersion": "v18.17.0",
    "platform": "linux",
    "cwd": "/home/user/my-project"
  }
}
```

### 通知集成

支持多种通知方式，实时监控部署状态：

- **Webhook**: 集成 Slack、Discord、企业微信等
- **邮件**: 发送详细的部署报告
- **自定义**: 可扩展其他通知渠道

## 🌐 多语言支持

### 双语消息显示

所有提示信息同时显示中英文，格式如下：

```
🚀 开始部署到: 生产环境 (production)
🚀 Starting deployment to: Production Environment (production)
```

**优势：**
- 全球开发者都能理解部署信息
- 无需配置语言环境
- 提升国际化团队协作体验

## ⚡ 性能与可靠性

### 错误处理

- **优雅降级**: 部署失败不会导致构建中断
- **详细错误信息**: 提供清晰的错误描述和解决方案
- **重试友好**: 支持手动重新部署

### 资源管理

- **连接复用**: 优化 SSH 连接管理
- **内存效率**: 轻量级实现，不影响构建性能
- **超时控制**: 可配置连接和操作超时时间

## 🛠️ 故障排除

### 常见问题

#### 连接失败
- **检查网络**: 确保构建机器能访问目标服务器
- **验证凭证**: 确认 SSH 凭证或私钥正确
- **端口开放**: 确保 SSH 端口（默认 22）已开放

#### 路径验证失败
- **使用绝对路径**: 避免相对路径
- **避开系统目录**: 使用应用专用目录
- **权限检查**: 确保目标目录可写

#### 私钥文件未找到
- **绝对路径**: 使用绝对路径指定私钥位置
- **文件权限**: 确保私钥文件可读
- **Windows 路径**: 使用正斜杠或双反斜杠

### 调试技巧

```bash
# 启用详细日志
enableLogging: true

# 增加连接超时
readyTimeout: 10000 // 10秒

```

## 📋 最佳实践

### 安全配置

```js
// 推荐的安全配置示例
const secureConfig = {
  name: 'Production Server',
  mode: 'production',
  host: 'your-server.com',
  username: 'deploy',
  privateKeyPath: process.env.SSH_KEY_PATH, // 从环境变量获取
  path: '/opt/app/production',
  beforeDeploy: 'pm2 stop app || true',
  afterDeploy: 'npm install --production && pm2 start app.js',
  enableLogging: true,
  notifications: [
    {
      type: 'webhook',
      url: process.env.DEPLOY_WEBHOOK_URL
    }
  ]
}
```

### 环境分离

- **开发环境**: 不配置部署，或明确设置 `mode: 'development'`
- **测试环境**: 使用独立的测试服务器和配置
- **生产环境**: 使用最严格的安全配置和监控

### 版本控制

- **不要提交敏感信息**: `.gitignore` 中添加日志目录
- **配置模板**: 提供 `vite.config.example.js` 作为模板
- **环境变量**: 敏感配置通过环境变量注入

### 社区贡献

欢迎提交 Issue 和 Pull Request！我们期待您的宝贵建议和代码贡献。

---

**Happy Deploying!** 🎉

⭐ 如果这个插件对您有帮助，请给项目点个 Star！