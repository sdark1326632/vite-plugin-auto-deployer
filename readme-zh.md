# vite-plugin-auto-deployer

[English](./readme.md) | [中文说明](./readme-zh.md)

👨‍💻 Vite 自动化发布插件，解决频繁手动操作服务器的过程

🤷‍♀️ 彻底解放你的双手!!!

👀 从此让你不必再害怕 rm -rf \* ，你懂得...

![](https://gitee.com/qq_1326632/vite-plugin-deployer/raw/master/images/auto-delop.png)

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

###### -[✔] 📖 检测是否为系统路径，更安全，防止 /* 误删除服务器文件 

###### -[✔] 🔐 主动询问用户名、密码，对服务器信息更安全

# 使用教程

```js
// vite.config.js
import autoDeployer from "vite-plugin-auto-deployer";

// 单服务器
const serverInfo = {
  name: "测试环境",
  mode: "staging", // 配置对应环境
  host: "101.43.164.172", // 主机地址
  port: 22, // 端口
  // 避免服务器信息泄露，用户名、密码按个人所需是否记住,非必填，程序会提示进行
  username: "root",
  password: "xxxx",
  path: "/data/website_test" // 需要上传至的服务器目录
};

// 服务器列表
const serverList = [
  {
    name: "测试",
    mode: "staging",
    host: "101.43.164.172",
    port: 22,
    username: "root",
    password: "testxxxxxxx",  
    path: "/data/website_test"
  },
  {
    name: "生产环境部署",
    mode: "production",
    host: "101.43.164.172",
    port: 22,
    path: "/data/website_prod"
  }
];

// Vite配置
export default ({ mode, command }) => {
  const config = {
    base: "/",
    // 配置单个serverInfo or 列表serverList 
    plugins: [autoDeployer(serverInfo)] 
  };
  return defineConfig(config);
};
```

## 使用截图

##### 🔐 用户名或密码为空时，提示输入，输入完会自动执行   ps:默认用户名为root


![](https://gitee.com/qq_1326632/vite-plugin-deployer/raw/master/images/1.png)

![](https://gitee.com/qq_1326632/vite-plugin-deployer/raw/master/images/2.png)

![](https://gitee.com/qq_1326632/vite-plugin-deployer/raw/master/images/3.png)

![](https://gitee.com/qq_1326632/vite-plugin-deployer/raw/master/images/4.png)

🎉🎉🎉🎉🎉🎉🎉🎉🎉

完结，撒花

⭐⭐⭐⭐⭐

### 如果您觉得本插件还行，麻烦 star 一下呗

### 你们的支持是我前进的动力!~

⭐⭐⭐⭐⭐
