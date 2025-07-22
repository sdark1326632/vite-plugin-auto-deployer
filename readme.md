# vite-plugin-auto-deployer

[English](./readme.md) | [中文说明](./readme-zh.md)

👨‍💻 Vite automates the release of plugins that solve the process of frequent manual server operation

🤷‍♀️ Completely free your hands!! 

👀 So you don't have to be afraid of rm -rf * anymore, you know... 

![](https://gitee.com/qq_1326632/vite-plugin-deployer/raw/master/images/4.png)


## 🛠️ Installation.

```sh
# npm
npm install -D vite-plugin-auto-deployer

# yarn
yarn add -D vite-plugin-auto-deployer

# pnpm
pnpm add -D vite-plugin-auto-deployer
```

## Complete the function

###### -[✔] 📖 Server list configuration for easy server management

###### -[✔] 👩‍🌾 Automatically reads environment variables to match server uploads, and the development environment ignores them

###### -[✔] 📋 Automatically reads the outDir directory for more flexibility No need to manually specify the dist file directory

###### -[✔] 📖 whether it is a system path, which is safer and prevents /* from accidentally deleting server files

###### -[✔] 🔐 Actively ask for username and password, which is more secure for server information

# Use the tutorial

```js
// vite.config.js
import autoDeployer from "vite-plugin-auto-deployer";

// single server
const serverInfo = {
  name: "testing environment",
  // configure the corresponding environment
  mode: "staging", 
  host: "101.43.164.172", 
  port: 22, 
  // to avoid server information leakage please remember your username and password according to personal needs if they are not required the program will prompt you to proceed
  username: "root",
  password: "xxxx",
  // the server directory that needs to be uploaded to
  path: "/data/website_test" 
};

// server list
const serverList = [
  {
    name: "test",
    mode: "staging",
    host: "101.43.164.172",
    port: 22,
    username: "root",
    password: "testxxxxxxx",  
    path: "/data/website_test"
  },
  {
    name: "prod",
    mode: "production",
    host: "101.43.164.172",
    port: 22,
    path: "/data/website_prod"
  }
];

// vite configuration
export default defineConfig({
  plugins: [vue(), autoDeployer(serverInfo)]
});
```

## Use screenshots

##### 🔐 When the username or password is empty, it will be prompted to enter


###### the default username is root
![](https://gitee.com/qq_1326632/vite-plugin-deployer/raw/master/images/1.png)

###### hidden password input
![](https://gitee.com/qq_1326632/vite-plugin-deployer/raw/master/images/2.png)

###### upload directory check
![](https://gitee.com/qq_1326632/vite-plugin-deployer/raw/master/images/3.png)

###### upload completion prompt
![](https://gitee.com/qq_1326632/vite-plugin-deployer/raw/master/images/4.png)

⭐⭐⭐⭐⭐

done sprinkle flowers

🎉🎉🎉🎉🎉🎉🎉🎉🎉
