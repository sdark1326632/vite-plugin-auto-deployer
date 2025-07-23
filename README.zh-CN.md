# vite-plugin-auto-deployer

[English](https://gitee.com/qq_1326632/vite-plugin-auto-deployer/blob/master/readme.md) | [中文说明](https://gitee.com/qq_1326632/vite-plugin-auto-deployer/blob/master/README.zh-CN.md)

👨‍💻 Vite 自动化发布插件，解决频繁手动操作服务器的过程

🤷‍♀️ 彻底解放你的双手!!!

👀 从此让你不必再害怕 rm -rf \* ，你懂得...

![](https://gitee.com/qq_1326632/vite-plugin-deployer/raw/master/images/4.png)

## 🛠️ 安装

```sh
# npm
npm install -D vite-plugin-auto-deployer

# yarn
yarn add -D vite-plugin-auto-deployer

# pnpm
pnpm add -D vite-plugin-auto-deployer
```

## 完成功能

###### -[✔] 📖 服务器列表配置,方便对服务器进行管理

###### -[✔] 👩‍🌾 自动读取环境变量匹配服务器上传，开发环境会忽略

###### -[✔] 📋 自动读取 outDir 目录，更加灵活 无需手动指定 dist 文件目录

###### -[✔] 📖 检测是否为系统路径，更安全，防止 /\* 误删除服务器文件

###### -[✔] 🔐 主动询问用户名、密码，对服务器信息更安全

# 使用教程

```js
// vite.config.js
import autoDeployer from "vite-plugin-auto-deployer";

// 单服务器
const serverInfo = {
  // 配置对应环境
  mode: "staging",
  host: "101.43.164.172",
  port: 22,
  // 避免服务器信息泄露，用户名、密码按个人所需是否记住,非必填，程序会提示进行
  username: "root",
  password: "xxxx",
  // 需要上传至的服务器目录
  path: "/data/website_test"
};

// 服务器列表
const serverList = [
  {
    name: "测试环境",
    mode: "staging",
    host: "101.43.164.172",
    port: 22,
    username: "root",
    password: "testxxxxxxx",
    path: "/data/website_test"
  },
  {
    name: "生产环境",
    mode: "production",
    host: "101.43.164.172",
    port: 22,
    path: "/data/website_prod"
  }
];

// Vite配置
export default defineConfig({
  plugins: [vue(), autoDeployer(serverInfo)]
});
```

## 使用截图

##### 🔐 用户名或密码为空时，提示输入，输入完会自动执行

###### 默认用户名为 root

![](https://gitee.com/qq_1326632/vite-plugin-deployer/raw/master/images/1.png)

###### 隐藏式密码输入

![](https://gitee.com/qq_1326632/vite-plugin-deployer/raw/master/images/2.png)

###### 上传目录检查

![](https://gitee.com/qq_1326632/vite-plugin-deployer/raw/master/images/3.png)

###### 上传完成提示

![](https://gitee.com/qq_1326632/vite-plugin-deployer/raw/master/images/4.png)

⭐⭐⭐⭐⭐

完结，撒花

🎉🎉🎉🎉🎉🎉🎉🎉🎉
