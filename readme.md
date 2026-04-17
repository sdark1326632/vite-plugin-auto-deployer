# Vite Auto Deployer

[English Documentation](readme.md) | [中文文档](README.zh-CN.md)

**Vite Automated Deployment Plugin** - An intelligent deployment solution designed for modern frontend development workflows

![Vite Auto Deployer](https://gitee.com/qq_1326632/vite-plugin-deployer/raw/master/images/4.png)

## 📌 Table of Contents

- [✨ Core Features](#-core-features)
- [🚀 Quick Start](#-quick-start)
- [🔧 Configuration Options](#-configuration-options)
- [🎯 Advanced Features](#-advanced-features)
- [🔒 Security Guarantees](#-security-guarantees)
- [📝 Logging & Monitoring](#-logging--monitoring)
- [🌐 Multilingual Support](#-multilingual-support)
- [⚡ Performance & Reliability](#-performance--reliability)
- [🛠️ Troubleshooting](#-troubleshooting)
- [📋 Best Practices](#-best-practices)

## ✨ Core Features

### Intelligent Automated Deployment
- **Seamless Integration**: Standard Vite plugin that automatically triggers deployment after build completion
- **Environment Awareness**: Automatically matches server configuration based on the `--mode` parameter
- **Smart Directory Detection**: Automatically identifies Vite's output directory (`outDir`), no manual specification required

### Secure & Reliable Transfer
- **SSH/SCP Protocol**: Secure file transfer based on SSH connections
- **Multiple Authentication**: Supports both password and SSH key authentication
- **Path Security Validation**: Strict validation of remote paths to prevent accidental deletion of critical system directories

### Flexible Deployment Control
- **Interactive Credential Input**: Sensitive information is not hardcoded in config files, entered securely during deployment
- **Deployment Hooks**: Supports custom command execution before and after deployment (string or function format)
- **Multi-environment Configuration**: Supports configuring multiple environments (such as staging, production), and the plugin automatically selects the matching configuration based on the current build environment for deployment

### Professional User Experience
- **Bilingual Messages**: Displays both Chinese and English prompts simultaneously for global developer comprehension
- **Detailed Logging**: Complete deployment audit logs for issue tracking and analysis
- **Notification Integration**: Supports Webhook and email notifications for real-time deployment status monitoring

## 🚀 Quick Start

### Installation

```bash
# npm
npm install -D vite-plugin-auto-deployer

# yarn
yarn add -D vite-plugin-auto-deployer

# pnpm
pnpm add -D vite-plugin-auto-deployer
```

### Basic Configuration

```js
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import autoDeployer from 'vite-plugin-auto-deployer'

const deploymentConfig = {
  name: 'Production Environment',
  mode: 'production',           // Matches the --mode parameter in build commands
  host: '192.168.1.100',       // Server IP address or domain
  port: 22,                    // SSH port
  username: 'deploy',          // Server username
  // password: 'your-password', // Password (optional, interactive input recommended)
  path: '/var/www/html'        // Remote deployment directory
}

export default defineConfig({
  plugins: [
    vue(),
    autoDeployer(deploymentConfig)
  ]
})
```

### Build & Deploy

```bash
# Development build (no deployment triggered)
npm run build -- --mode development

# Staging environment deployment
npm run build -- --mode staging

# Production environment deployment
npm run build -- --mode production
```

## 🔧 Configuration Options

### Basic Configuration

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `name` | `string` | No | - | Server name for logging and display |
| `mode` | `string` | No | Current build mode | Matches Vite's build mode |
| `host` | `string` | **Yes** | - | Server IP address or domain |
| `port` | `number` | No | `22` | SSH port |
| `username` | `string` | No | - | Server username (interactive input if not provided) |
| `password` | `string` | No | - | Server password (interactive input if not provided) |
| `path` | `string` | **Yes** | - | Remote server deployment directory |
| `outDir` | `string` | No | Vite's configured `outDir` | Local build output directory |

### Authentication Configuration

#### SSH Key Authentication (Recommended)

```js
const config = {
  // ... other configurations
  privateKeyPath: '~/.ssh/id_rsa',     // Private key file path
  passphrase: 'your-key-passphrase'    // Private key passphrase (if applicable)
}
```

#### Password Authentication

```js
const config = {
  // ... other configurations
  password: 'your-password'            // Plaintext password (not recommended)
  // Or omit the password field for interactive input during deployment
}
```

### Deployment Hooks

#### String Format

```js
const config = {
  // ... other configurations
  beforeDeploy: 'echo "Stopping services..." && pm2 stop app || true',
  afterDeploy: 'npm install --production && pm2 start app.js'
}
```

#### Function Format (Dynamic Configuration)

```js
const config = {
  // ... other configurations
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

### Logging Configuration

```js
const config = {
  // ... other configurations
  enableLogging: true,                 // Enable logging (default: false)
  logDir: './deployment-logs'          // Custom log directory (default: ./.vite-auto-deployer/logs)
}
```

### Notification Configuration

```js
const config = {
  // ... other configurations
  notifications: [
    // Webhook notification
    {
      type: 'webhook',
      url: 'https://hooks.slack.com/services/YOUR/WEBHOOK',
      headers: { 'Content-Type': 'application/json' },
      method: 'POST'
    },
    // Email notification (requires SMTP configuration)
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

#### QQ Email Configuration Example

To use QQ Email for notifications, configure as follows:

**1. Obtain QQ Email Authorization Code**
- Log in to QQ Email web version
- Go to「Settings」→「Account」
- Find「POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV Service」
- Enable「IMAP/SMTP Service」
- Follow instructions to send SMS and obtain authorization code (16-character alphanumeric)

**2. QQ Email SMTP Configuration**

```js
const config = {
  // ... other configurations
  notifications: [
    {
      type: 'email',
      smtp: {
        host: 'smtp.qq.com',        // QQ Email SMTP server
        port: 465,                  // SSL port
        secure: true,               // Use SSL encryption
        auth: {
          user: 'your-qq-number@qq.com',  // Your QQ email (full email address)
          pass: 'your-authorization-code' // QQ Email authorization code (NOT your login password!)
        }
      },
      from: 'your-qq-number@qq.com',      // Sender email
      to: ['recipient1@example.com', 'recipient2@example.com'], // Recipient list
      subject: 'Vite Auto Deployment Notification', // Email subject
      template: 'default'                 // Email template ('default' or 'simple')
    }
  ]
}
```

**3. Install Dependencies**

Email functionality requires the `nodemailer` package:

```bash
# npm
npm install nodemailer

# yarn  
yarn add nodemailer

# pnpm
pnpm add nodemailer
```

**4. Secure Configuration with Environment Variables (Recommended)**

To avoid hardcoding sensitive information in code, use environment variables:

```js
// vite.config.js
const config = {
  // ... other configurations
  notifications: [
    {
      type: 'email',
      smtp: {
        host: 'smtp.qq.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.QQ_EMAIL_USER,     // Retrieved from environment variables
          pass: process.env.QQ_EMAIL_PASSWORD  // Retrieved from environment variables
        }
      },
      from: process.env.QQ_EMAIL_USER,
      to: [process.env.DEPLOY_NOTIFY_EMAIL],
      subject: 'Vite Auto Deployment Notification'
    }
  ]
}
```

Configure in `.env.local` file (do not commit to version control):

```
# .env.local
QQ_EMAIL_USER=your-qq-number@qq.com
QQ_EMAIL_PASSWORD=your-16-digit-authorization-code
DEPLOY_NOTIFY_EMAIL=dev-team@example.com,manager@example.com
```

**Email Template Options**
- `default`: Professional HTML formatted email with complete deployment details and status indicators
- `simple`: Simple text format email with basic information only

**Important Notes**
- The `pass` field for QQ Email must use the **authorization code**, not your QQ password
- If the authorization code is compromised, you can regenerate it in QQ Email settings
- It's recommended to use a dedicated QQ email account for deployment notifications, not your primary personal email
- Email sending frequency is limited by QQ Email's sending limits (typically max 10 emails per minute)

## 🎯 Advanced Features

### Multi-server Configuration

#### Environment-based Single Server Selection

The plugin now supports **single server deployment from a configuration list**. When you provide an array of server configurations, the plugin will automatically find and deploy to the **first matching server** based on the current build environment (`--mode`), rather than deploying to all matching servers simultaneously.

This approach provides better control and prevents unintended multi-server deployments.

```js
const multiEnvironmentConfig = [
  // Staging environment - will be selected when --mode staging
  {
    name: 'Staging Server',
    mode: 'staging',
    host: '192.168.1.200',
    path: '/var/www/staging',
    privateKeyPath: '~/.ssh/staging_key'
  },
  // Production environment - will be selected when --mode production  
  {
    name: 'Production Server',
    mode: 'production',
    host: '192.168.1.100',
    path: '/var/www/html',
    privateKeyPath: '~/.ssh/prod_key'
  },
  // Additional production server (won't be deployed to unless it's the first match)
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

**Deployment Behavior:**
- When running `npm run build -- --mode staging`: Only deploys to "Staging Server"
- When running `npm run build -- --mode production`: Only deploys to "Production Server" (the first match)
- The "Backup Production Server" will only be deployed to if it appears before the main production server in the array

#### Multi-server Parallel Deployment for Same Environment

If you need true parallel deployment to multiple servers for the same environment, you can still achieve this by explicitly providing an array with multiple configurations that have the same `mode` value:

```js
// This will deploy to both servers simultaneously (same mode)
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

However, the recommended approach is to use the single-server selection pattern for most use cases, as it provides clearer deployment intent and reduces the risk of accidental multi-server deployments.

#### Single Mode, Multiple Servers

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

#### Multi-environment Configuration

```js
const multiEnvironmentConfig = [
  // Staging environment
  {
    name: 'Staging Server',
    mode: 'staging',
    host: '192.168.1.200',
    path: '/var/www/staging',
    privateKeyPath: '~/.ssh/staging_key'
  },
  // Production environment
  {
    name: 'Production Server',
    mode: 'production',
    host: '192.168.1.100',
    path: '/var/www/html',
    privateKeyPath: '~/.ssh/prod_key'
  }
]
```

### Environment Auto-matching Advantages

- **Intelligent Selection**: The plugin automatically selects the matching configuration based on the current build environment (`--mode` parameter or `NODE_ENV`)
- **Simplified Configuration**: No need to maintain multiple configuration files for different environments; all configurations are managed centrally
- **Secure Isolation**: Server configurations for different environments are completely isolated to prevent accidental operations

## 🔒 Security Guarantees

### Path Security Validation

The plugin includes strict path validation mechanisms to prevent dangerous operations:

**Blocked Dangerous Paths Include:**
- Root directory (`/`)
- System critical directories (`/bin`, `/etc`, `/usr`, `/var`, etc.)
- Wildcard paths (`/*`, `/home/*`)
- Any path that could potentially delete system files

### Safe Directory Cleanup

Employs safe file cleanup strategies, replacing dangerous `rm -rf` commands:

```bash
# Safe cleanup command
find "${remotePath}" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
```

**Advantages:**
- Deletes only directory contents, preserving the directory itself
- Limits deletion depth to prevent recursive accidental deletion
- Properly handles permissions and error conditions

### Authentication Security Best Practices

1. **Avoid Password Hardcoding**: Never store plaintext passwords in configuration files
2. **Use SSH Keys**: Recommended for production environments
3. **Private Key Permissions**: Ensure private key file permissions are set to `600`
4. **Interactive Input**: Enter sensitive information securely during deployment

## 📝 Logging & Monitoring

### Logging Features

**Default Status**: Disabled (requires explicit enabling)

**Enable Method**:
```js
{
  enableLogging: true,
  logDir: './custom-logs' // Optional: Custom log directory
}
```

**Log Format**: JSON format with complete deployment context information

**Log Example**:
```
{
  "timestamp": "2026-04-16T18:24:09.123Z",
  "level": "DEPLOYMENT_START",
  "deploymentId": "deploy-1681642754-abc123",
  "config": {
    "name": "Production Environment",
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

### Notification Integration

Supports multiple notification methods for real-time deployment status monitoring:

- **Webhook**: Integrates with Slack, Discord, WeChat Work, etc.
- **Email**: Sends detailed deployment reports
- **Custom**: Extensible to other notification channels

## 🌐 Multilingual Support

### Bilingual Message Display

All prompt messages display both Chinese and English simultaneously, formatted as follows:

```
🚀 开始部署到: 生产环境 (production)
🚀 Starting deployment to: Production Environment (production)
```

**Advantages:**
- Global developers can understand deployment information
- No need to configure language environment
- Enhances international team collaboration experience

## ⚡ Performance & Reliability

### Error Handling

- **Graceful Degradation**: Deployment failures won't interrupt the build process
- **Detailed Error Information**: Provides clear error descriptions and solutions
- **Retry Friendly**: Supports manual redeployment

### Resource Management

- **Connection Reuse**: Optimized SSH connection management
- **Memory Efficiency**: Lightweight implementation that doesn't impact build performance
- **Timeout Control**: Configurable connection and operation timeout settings

## 🛠️ Troubleshooting

### Common Issues

#### Connection Failed
- **Check Network**: Ensure the build machine can access the target server
- **Verify Credentials**: Confirm SSH credentials or private keys are correct
- **Port Open**: Ensure SSH port (default 22) is open

#### Path Validation Failed
- **Use Absolute Paths**: Avoid relative paths
- **Avoid System Directories**: Use application-specific directories
- **Permission Check**: Ensure target directory is writable

#### Private Key File Not Found
- **Absolute Path**: Use absolute paths to specify private key location
- **File Permissions**: Ensure private key file is readable
- **Windows Paths**: Use forward slashes or double backslashes

### Debugging Tips

```bash
# Enable detailed logging
enableLogging: true

# Increase connection timeout
readyTimeout: 10000 // 10 seconds

# Test single server configuration
// Temporarily comment out other server configurations
```

## 📋 Best Practices

### Secure Configuration

```js
// Recommended secure configuration example
const secureConfig = {
  name: 'Production Server',
  mode: 'production',
  host: 'your-server.com',
  username: 'deploy',
  privateKeyPath: process.env.SSH_KEY_PATH, // Retrieved from environment variables
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

### Environment Separation

- **Development Environment**: No deployment configuration, or explicitly set `mode: 'development'`
- **Staging Environment**: Use separate staging servers and configurations
- **Production Environment**: Use the most stringent security configurations and monitoring

### Version Control

- **Don't Commit Sensitive Information**: Add log directories to `.gitignore`
- **Configuration Templates**: Provide `vite.config.example.js` as a template
- **Environment Variables**: Inject sensitive configurations through environment variables

### Community Contributions

We welcome Issues and Pull Requests! We look forward to your valuable suggestions and code contributions.

---

**Happy Deploying!** 🎉

⭐ If this plugin has been helpful to you, please give the project a Star!