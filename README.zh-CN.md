# Vite Auto Deployer

[English Documentation](https://gitee.com/qq_1326632/vite-plugin-auto-deployer/blob/master/readme.md) | [中文文档](https://gitee.com/qq_1326632/vite-plugin-auto-deployer/blob/master/README.zh-CN.md)

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

### 自动化部署
- **无缝集成**: 作为标准 Vite 插件，自动在构建完成后触发部署流程
- **自动目录检测**: 自动识别 Vite 配置的输出目录(`outDir`)，无需手动指定

### 安全可靠的传输
- **密码加密**: 避免与密码的直接接触
- **SSH/SCP 协议**: 使用安全 SSH 协议执行文件传输
- **路径安全验证**: 内置验证远程路径，避免误删重要目录

### 灵活的部署控制
- **交互式确认提示**: 敏感操作不在配置文件中硬编码，部署前安全确认
- **部署钩子**: 支持部署前后执行自定义命令（字符串或函数形式）
- **多环境配置**: 支持配置多个环境（如 staging、production），插件会根据当前构建环境自动选择相应配置执行部署

### 专业的用户体验
- **双语提示**: 同时显示中英文提示，确保全球开发者都能理解
- **详细日志**: 完整的部署日志，便于问题排查和分析
- **通知集成**: 支持 Webhook 和邮件通知，实现实时部署状态
- **性能优化**: 支持并发文件上传和文件压缩，提升部署效率
- **代码质量**: 集成 ESLint、Prettier 和 Jest，确保代码规范和测试覆盖

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

### 基本配置

在 `vite.config.js` 中添加插件：

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

### 运行构建

```bash
npm run build
```

构建完成后，插件会自动触发部署流程。

## 🔧 配置选项

### 基本配置

| 选项 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| `host` | `string` | ✅ | - | 远程服务器地址 |
| `username` | `string` | ✅ | - | SSH 用户名 |
| `password` | `string` | ✅ | - | SSH 密码 |
| `remotePath` | `string` | ✅ | - | 远程部署路径 |

### 高级配置

| 选项 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| `port` | `number` | ❌ | `22` | SSH 端口 |
| `localPath` | `string` | ❌ | `dist` | 本地构建输出目录 |
| `concurrency` | `number` | ❌ | `3` | 并发上传数量 |
| `compress` | `boolean` | ❌ | `true` | 是否启用文件压缩 |
| `preDeploy` | `string \| Function` | ❌ | - | 部署前执行的命令 |
| `postDeploy` | `string \| Function` | ❌ | - | 部署后执行的命令 |
| `exclude` | `string[]` | ❌ | `[]` | 排除的文件模式 |
| `include` | `string[]` | ❌ | `['**/*']` | 包含的文件模式 |

### 多环境配置

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

## 🎯 高级功能

### 部署钩子

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

### 自定义钩子函数

```javascript
vitePluginAutoDeployer({
  host: 'your-server.com',
  username: 'deploy',
  password: 'your-password',
  remotePath: '/var/www/html',
  preDeploy: async () => {
    console.log('准备部署...')
    // 执行自定义逻辑
  },
  postDeploy: async () => {
    console.log('部署完成！')
    // 执行自定义逻辑
  }
})
```

### 文件过滤

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

### 通知集成

#### 邮件通知

```javascript
vitePluginAutoDeployer({
  // ... 其他配置
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

#### Webhook 通知

```javascript
vitePluginAutoDeployer({
  // ... 其他配置
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

## 🔒 安全保障

### 密码安全
- 密码不会明文存储在配置文件中
- 支持环境变量和密钥管理服务
- 传输过程中使用 SSH 加密

### 路径验证
- 自动检测远程路径安全性
- 防止误删重要系统目录
- 支持白名单和黑名单配置

### 权限控制
- 最小权限原则
- 支持只读和写入权限分离
- 审计日志记录所有操作

## 📝 日志与监控

### 日志级别

插件提供详细的日志输出：

```
[INFO] 开始部署到 production 环境
[INFO] 连接到服务器: example.com:22
[INFO] 压缩文件: dist/app.js -> dist/app.js.gz (减少 45%)
[INFO] 上传文件: /dist/index.html (1/15)
[INFO] 上传文件: /dist/app.js (2/15)
...
[INFO] 执行部署后命令: pm2 restart my-app
[SUCCESS] 部署完成！总耗时: 12.5秒
```

### 监控指标

- 部署成功率
- 平均部署时间
- 文件传输速度
- 错误统计

## 🌐 多语言支持

插件内置中英文双语支持：

- **中文**: 完整的中文界面和提示
- **English**: 完整的英文界面和提示
- **自动检测**: 根据系统语言自动切换

## ⚡ 性能与可靠性

### 性能优化

- **并发上传**: 支持多线程文件上传
- **文件压缩**: Gzip 压缩减小传输体积
- **增量部署**: 只上传变更的文件
- **连接复用**: SSH 连接池管理

### 可靠性保证

- **重试机制**: 网络异常自动重试
- **事务性部署**: 部署失败自动回滚
- **健康检查**: 部署前检查服务器状态
- **超时控制**: 防止部署过程卡死

## 🛠️ 故障排除

### 常见问题

#### 连接失败

```
错误: connect ECONNREFUSED 127.0.0.1:22
```

**解决方案**:
1. 检查服务器地址和端口
2. 确认 SSH 服务正在运行
3. 检查防火墙设置

#### 权限不足

```
错误: EACCES: permission denied
```

**解决方案**:
1. 检查 SSH 用户权限
2. 确认远程路径权限
3. 使用正确的用户身份

#### 文件上传失败

```
错误: No such file or directory
```

**解决方案**:
1. 检查本地构建输出目录
2. 确认文件路径正确
3. 检查磁盘空间

### 调试模式

启用详细日志：

```javascript
vitePluginAutoDeployer({
  // ... 其他配置
  debug: true
})
```

## 📋 最佳实践

### 生产环境配置

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
        postDeploy: 'pm2 start my-app',
        concurrency: 5,
        compress: true
      }
    })
  ]
})
```

### CI/CD 集成

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

### 安全配置

```javascript
// 使用环境变量
vitePluginAutoDeployer({
  host: process.env.DEPLOY_HOST,
  username: process.env.DEPLOY_USER,
  password: process.env.DEPLOY_PASSWORD,
  remotePath: process.env.DEPLOY_PATH
})
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 开发环境设置

```bash
# 克隆项目
git clone https://github.com/your-username/vite-plugin-auto-deployer.git
cd vite-plugin-auto-deployer

# 安装依赖
npm install

# 运行测试
npm test

# 代码检查
npm run lint
```

### 提交规范

- `feat:` 新功能
- `fix:` 修复
- `docs:` 文档更新
- `style:` 代码格式
- `refactor:` 重构
- `test:` 测试相关
- `chore:` 构建相关

## 📄 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

感谢所有贡献者和用户！这个项目致力于简化前端部署流程，让开发者专注于创造更好的产品。