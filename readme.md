# Vite Auto Deployer

[English Documentation](https://gitee.com/qq_1326632/vite-plugin-auto-deployer/blob/master/readme.md) | [中文文档](https://gitee.com/qq_1326632/vite-plugin-auto-deployer/blob/master/README.zh-CN.md)

**Vite Automated Deployment Plugin** - An intelligent deployment solution designed for modern frontend development workflows


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

### Automated Deployment
- **Seamless Integration**: Standard Vite plugin that automatically triggers deployment after build completion
- **Automatic Directory Detection**: Automatically identifies Vite configuration output directory (`outDir`), no manual specification required

### Secure & Reliable Transfer
- **Password Encryption**: Avoid direct contact with passwords
- **SSH/SCP Protocol**: Use secure SSH protocol for file transmission
- **Path Security Validation**: Built-in validation of remote paths to prevent deletion of important directories

### Flexible Deployment Control
- **Interactive Confirmation Prompts**: Sensitive operations are not hardcoded in configuration files, secure confirmation before deployment
- **Deployment Hooks**: Support execution of custom commands before and after deployment (string or function format)
- **Multi-environment Configuration**: Support configuration of multiple environments (such as staging, production), plugin automatically selects matching configuration based on current build environment for deployment

### Professional User Experience
- **Bilingual Prompts**: Display both Chinese and English prompts simultaneously to ensure global developers can understand
- **Detailed Logging**: Complete deployment logs for easy troubleshooting and analysis
- **Notification Integration**: Support Webhook and email notifications for real-time deployment status
- **Performance Optimization**: Support concurrent file uploads and file compression to improve deployment efficiency
- **Code Quality**: Integrated ESLint, Prettier and Jest to ensure code standards and test coverage

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

Add the plugin to `vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import { vitePluginAutoDeployer } from 'vite-plugin-auto-deployer'

export default defineConfig({
  plugins: [
    vitePluginAutoDeployer({
      host: 'your-server.com',
      username: 'deploy',
      password: 'your-password',
      remotePath: '/var/www/html'
    })
  ]
})
```

### Run Build

```bash
npm run build
```

The plugin will automatically trigger the deployment process after build completion.

## 🔧 Configuration Options

### Basic Configuration

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `host` | `string` | ✅ | - | Remote server address |
| `username` | `string` | ✅ | - | SSH username |
| `password` | `string` | ✅ | - | SSH password |
| `remotePath` | `string` | ✅ | - | Remote deployment path |

### Advanced Configuration

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `port` | `number` | ❌ | `22` | SSH port |
| `localPath` | `string` | ❌ | `dist` | Local build output directory |
| `concurrency` | `number` | ❌ | `3` | Concurrent upload count |
| `compress` | `boolean` | ❌ | `true` | Enable file compression |
| `preDeploy` | `string \| Function` | ❌ | - | Command to execute before deployment |
| `postDeploy` | `string \| Function` | ❌ | - | Command to execute after deployment |
| `exclude` | `string[]` | ❌ | `[]` | File patterns to exclude |
| `include` | `string[]` | ❌ | `['**/*']` | File patterns to include |

### Multi-environment Configuration

```javascript
export default defineConfig({
  plugins: [
    vitePluginAutoDeployer({
      staging: {
        host: 'staging.example.com',
        username: 'deploy',
        password: 'staging-password',
        remotePath: '/var/www/staging'
      },
      production: {
        host: 'production.example.com',
        username: 'deploy',
        password: 'prod-password',
        remotePath: '/var/www/production'
      }
    })
  ]
})
```

## 🎯 Advanced Features

### Deployment Hooks

```javascript
vitePluginAutoDeployer({
  host: 'your-server.com',
  username: 'deploy',
  password: 'your-password',
  remotePath: '/var/www/html',
  preDeploy: 'pm2 stop my-app',
  postDeploy: 'pm2 start my-app'
})
```

### Custom Hook Functions

```javascript
vitePluginAutoDeployer({
  host: 'your-server.com',
  username: 'deploy',
  password: 'your-password',
  remotePath: '/var/www/html',
  preDeploy: async () => {
    console.log('Preparing deployment...')
    // Execute custom logic
  },
  postDeploy: async () => {
    console.log('Deployment completed!')
    // Execute custom logic
  }
})
```

### File Filtering

```javascript
vitePluginAutoDeployer({
  host: 'your-server.com',
  username: 'deploy',
  password: 'your-password',
  remotePath: '/var/www/html',
  include: ['**/*', '!node_modules/**'],
  exclude: ['*.log', 'temp/**']
})
```

### Notification Integration

#### Email Notifications

```javascript
vitePluginAutoDeployer({
  // ... other configurations
  notifications: {
    email: {
      smtp: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'your-email@gmail.com',
          pass: 'your-app-password'
        }
      },
      to: 'team@example.com',
      from: 'deploy@example.com'
    }
  }
})
```

#### Webhook Notifications

```javascript
vitePluginAutoDeployer({
  // ... other configurations
  notifications: {
    webhook: {
      url: 'https://hooks.slack.com/services/...',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  }
})
```

## 🔒 Security Guarantees

### Password Security
- Passwords are not stored in plain text in configuration files
- Support for environment variables and key management services
- Transmission encrypted using SSH

### Path Validation
- Automatic detection of remote path security
- Prevention of accidental deletion of important system directories
- Support for whitelist and blacklist configurations

### Permission Control
- Principle of minimum permissions
- Support for separation of read and write permissions
- Audit logging of all operations

## 📝 Logging & Monitoring

### Log Levels

The plugin provides detailed logging output:

```
[INFO] Starting deployment to production environment
[INFO] Connecting to server: example.com:22
[INFO] Compressing file: dist/app.js -> dist/app.js.gz (reduced by 45%)
[INFO] Uploading file: /dist/index.html (1/15)
[INFO] Uploading file: /dist/app.js (2/15)
...
[INFO] Executing post-deployment command: pm2 restart my-app
[SUCCESS] Deployment completed! Total time: 12.5 seconds
```

### Monitoring Metrics

- Deployment success rate
- Average deployment time
- File transfer speed
- Error statistics

## 🌐 Multilingual Support

Plugin has built-in Chinese and English bilingual support:

- **Chinese**: Complete Chinese interface and prompts
- **English**: Complete English interface and prompts
- **Auto-detection**: Automatically switches based on system language

## ⚡ Performance & Reliability

### Performance Optimization

- **Concurrent Uploads**: Support multi-threaded file uploads
- **File Compression**: Gzip compression reduces transmission volume
- **Incremental Deployment**: Only upload changed files
- **Connection Pooling**: SSH connection pool management

### Reliability Guarantee

- **Retry Mechanism**: Automatic retry on network exceptions
- **Transactional Deployment**: Automatic rollback on deployment failure
- **Health Checks**: Server status check before deployment
- **Timeout Control**: Prevent deployment process from hanging

## 🛠️ Troubleshooting

### Common Issues

#### Connection Failed

```
Error: connect ECONNREFUSED 127.0.0.1:22
```

**Solutions**:
1. Check server address and port
2. Confirm SSH service is running
3. Check firewall settings

#### Permission Denied

```
Error: EACCES: permission denied
```

**Solutions**:
1. Check SSH user permissions
2. Confirm remote path permissions
3. Use correct user identity

#### File Upload Failed

```
Error: No such file or directory
```

**Solutions**:
1. Check local build output directory
2. Confirm file paths are correct
3. Check disk space

### Debug Mode

Enable detailed logging:

```javascript
vitePluginAutoDeployer({
  // ... other configurations
  debug: true
})
```

## 📋 Best Practices

### Production Environment Configuration

```javascript
// vite.config.js
export default defineConfig({
  build: {
    outDir: 'dist'
  },
  plugins: [
    vitePluginAutoDeployer({
      production: {
        host: process.env.DEPLOY_HOST,
        username: process.env.DEPLOY_USER,
        password: process.env.DEPLOY_PASS,
        remotePath: '/var/www/production',
        preDeploy: 'pm2 stop my-app',
        postDeploy: 'pm2 start my-app && pm2 save',
        concurrency: 5,
        compress: true
      }
    })
  ]
})
```

### CI/CD Integration

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run deploy:production
```

### Security Configuration

```javascript
// Use environment variables
vitePluginAutoDeployer({
  host: process.env.DEPLOY_HOST,
  username: process.env.DEPLOY_USER,
  password: process.env.DEPLOY_PASSWORD,
  remotePath: process.env.DEPLOY_PATH
})
```

## 🤝 Contributing

Welcome to submit Issues and Pull Requests!

### Development Environment Setup

```bash
# Clone the project
git clone https://github.com/your-username/vite-plugin-auto-deployer.git
cd vite-plugin-auto-deployer

# Install dependencies
npm install

# Run tests
npm test

# Code checking
npm run lint
```

### Commit Conventions

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation updates
- `style:` Code formatting
- `refactor:` Code refactoring
- `test:` Test-related changes
- `chore:` Build-related changes

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

Thanks to all contributors and users! This project is dedicated to simplifying frontend deployment workflows, allowing developers to focus on creating better products.