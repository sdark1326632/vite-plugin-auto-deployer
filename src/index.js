const ora = require("ora");
const inquirer = require("inquirer");
const chalk = require("chalk");
const scpClient = require("scp2");
let Client = require("ssh2").Client;
let conn = new Client();

let defaultConfig = {
  readyTimeout: 5000
};

module.exports = function (options) {
  return {
    name: "vite-plugin-auto-deployer",
    configResolved(resolvedCofnig) {
      const env = resolvedCofnig.env.MODE;
      defaultConfig.env = env;
      defaultConfig.outDir = resolvedCofnig.build.outDir;
    },
    async closeBundle() {
      console.log("\n");

      // 是否是开发环境
      if (isDev(defaultConfig)) {
        return;
      }

      if (Array.isArray(options) && !!options.length) {
        options = options.find((item) => item.mode == env);
        if (!options) {
          console.log(
            chalk.red(
              "未找到相关环境，请手动上传~\nno relevant environment found please upload manually \n"
            )
          );
          return;
        }
      }

      defaultConfig = { ...options, ...defaultConfig };

      // 检查必填项
      if (!checkRequiredFields(defaultConfig)) {
        console.log(
          chalk.red(
            "\n✖️ 缺少必填项，请手动上传！ \nmissing required fields please upload manually\n"
          )
        );
        return;
      }

      // 检测是否为安全目录
      if (isDangerDir(defaultConfig)) {
        console.log(
          chalk.red(
            "\n✖️ 非安全目录，请手动上传！ \nnon-secure directory please upload manually\n"
          )
        );
        return;
      }

      if (options.name) {
        console.log(
          chalk.blue(
            `即将上传至： ${options.name} \nupcoming upload to: ${options.name} \n`
          )
        );
      }

      // 检测登录信息
      if (!await checkLoginInfo(defaultConfig)) {
        console.log(
          chalk.red(
            "\n✖️ 登录信息不完整，请手动上传！ \nlogin information incomplete please upload manually\n"
          )
        );
        return;
      }

      conn.connect(defaultConfig);
      conn.on("ready", () => onReady(defaultConfig));
      conn.on("error", onError);
    }
  };
};

function onReady(options) {
  const { host, port, path, outDir } = options;
  console.log(
    `\n服务器连接已就绪: ${host}:${port}\nthe server connection is ready: ${host}:${port} \n`
  );

  conn.exec(`rm -rf ${path}/*`, (err, stream) => {
    if (err) throw err;
    console.log(
      `清空 ${path} 目录成功!\nempty  ${path} catalog successful! \n`
    );
    stream
      .on("close", (code, signal) => {
        const spinner = ora(`uploading ${outDir} files in the directory...`);
        spinner.start();
        scpClient.scp(`./${outDir}`, options, (err) => {
          spinner.stop();
          if (err) {
            console.log(chalk.red("上传失败..."));
            console.log(chalk.red("\nupload failed..."));
            throw err;
          } else {
            console.log(
              chalk.green(
                "已自动上传至服务器!\nautomatically uploaded to the server! \n\n上传成功 ~ \n🚀🚀🚀 success ~ \n"
              )
            );
          }
          conn.end();
        });
      })
      .on("data", (data) => {
        console.log("STDOUT: " + data);
      })
      .stderr.on("data", (data) => {
        console.log("STDERR: " + data);
      });
  });
}

// 是否开发环境
function isDev({ env }) {
  return env === "development";
}

// 检查必填项
function checkRequiredFields(options) {
  const { host, path, port } = options;
  if (!port) {
    options.port = 22;
  }

  if (!host) {
    console.log(
      chalk.red("🤔请配置服务器地址 \nplease configure the server address\n")
    );
  }
  if (!path) {
    console.log(
      chalk.red("🤔请配置远程目录~ \nplease configure remote directory\n")
    );
  }
  if (!host || !path) {
    return;
  }

  return true;
}

// 检测是否为安全目录
function isDangerDir({ path }) {
  // 检测路径是否是系统目录
  const warnPath = [
    "*",
    "/",
    "/bin",
    "/boot",
    "/dev",
    "/etc",
    "/home",
    "/lib",
    "/opt",
    "/proc",
    "/root",
    "/run",
    "/sbin",
    "/srv",
    "/sys",
    "/var",
    "/*"
  ];

  return warnPath.includes(path);
}

// 检测登录信息
async function checkLoginInfo(defaultConfig) {
  const { password, username } = defaultConfig;
  const question = [];

  if (!username) {
    question.push({
      type: "input",
      name: "username",
      default: "root",
      message: "请输入服务器用户名 \n please enter the server username",
      validate: (val) => {
        if (!val) {
          return "请输入服务器用户名 \n please enter the server username";
        }
        return true;
      }
    });
  }

  if (!password) {
    question.push({
      type: "password",
      name: "password",
      message: "请输入服务器密码 \n please enter the server password",
      validate: (val) => {
        if (!val) {
          return "请输入服务器密码 \n please enter the server password";
        }
        return true;
      }
    });
  }

  const answers = await inquirer.prompt(question);
  if (answers.username) {
    defaultConfig.username = answers.username;
  }

  if (answers.password) {
    defaultConfig.password = answers.password;
  }

  return defaultConfig.username && defaultConfig.password;

}

// 连接失败处理
function onError(e) {
  console.log(chalk.red("\n连接失败:\nconnection failed:"));
  if (e.message.includes("authentication")) {
    console.log(chalk.red("\n请检查用户名密码是否正确!"));
    console.log(
      chalk.red("please check if the username and password are correct!")
    );
  } else {
    console.log(chalk.red(`\n${e.message}`));
  }
}
