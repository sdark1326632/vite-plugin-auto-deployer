# vite-plugin-auto-deployer

👨‍💻Vite 自动化发布插件，解决频繁手动操作服务器的过程

彻底解放你的双手!!!🤷‍♀️🤷‍♀️🤷‍♀️🤷‍♀️🤷‍♀️

从此让你不必再害怕 rm -rf \* ，你懂得...👀

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

-[✔] 📖 服务器列表配置,方便对服务器进行管理 
######
-[✔] 👩‍🌾 自动读取环境变量匹配服务器上传，开发环境会忽略 
######
-[✔] 📋 自动读取 outDir 目录，更加灵活 无需手动指定 dist 文件目录 
######
-[✔] 🔐 主动询问用户名、密码，对服务器信息更安全

# 使用教程

```js
// vite.config.js
import autoDeployer from "vite-plugin-auto-deployer";

// 单服务器模式
const serverInfo = {
  name: "测试环境",
  mode: "staging", // 配置对应环境
  host: "101.43.164.172", // 主机地址
  port: 22, // 端口
  // 用户名密码按个人所需是否记住,非必须，
  // 不填会提问，常用于生产环境，避免服务器信息泄露
  // username: "root",
  // password: "xxxx",
  path: "/data/website" // 需要上传至的服务器目录
};

// 列表模式
const serverList = [
  {
    name: "测试",
    mode: "staging",
    host: "101.43.164.172",
    port: 22,
    username: "root",
    password: "test1",
    path: "/data/tibet_website"
  },
  {
    name: "生产环境部署",
    mode: "production",
    host: "101.43.164.172",
    port: 22,
    path: "/data/tibet_website"
  }
];

// Vite配置
export default ({ mode, command }) => {
  const config = {
    base: "/",
    plugins: [autoDeployer(serverInfo)] // 配置单个或列表
  };
  return defineConfig(config);
};
```

## 使用截图

##### 🔐 用户名或密码为空时，提示输入，输入完会自动执行

![](https://gitee.com/qq_1326632/vite-plugin-deployer/raw/master/images/question.png)

🎉🎉🎉🎉🎉🎉🎉🎉🎉

完结，撒花

⭐⭐⭐⭐⭐

### 如果您觉得本插件还行，麻烦 star 一下呗

### 你们的支持是我前进的动力!~

⭐⭐⭐⭐⭐
