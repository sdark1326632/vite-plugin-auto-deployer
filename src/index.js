const ora = require("ora");
const inquirer = require("inquirer");
const chalk = require("chalk");
const scpClient = require("scp2");
let Client = require("ssh2").Client;
let conn = new Client();

module.exports = function (options) {
  let defaultConfig = {
    readyTimeout: 5000
  };
  return {
    name: "vite-plugin-auto-deployer",
    configResolved(resolvedCofnig) {
      const env = resolvedCofnig.env.MODE;
      defaultConfig.env = env;
      defaultConfig.outDir = resolvedCofnig.build.outDir;
    },
    async closeBundle() {
      console.log("\n");
      const { env } = defaultConfig;
      if (env === "development") {
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

      if (options.name) {
        console.log(
          chalk.blue(
            `即将上传至： ${options.name} \nupcoming upload to: ${options.name} \n`
          )
        );
      }

      const { password, username } = options;
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
        options.username = answers.username;
      }

      if (answers.password) {
        options.password = answers.password;
      }
      let megerOption = { ...options, ...defaultConfig };

      conn.connect(megerOption);
      conn.on("ready", () => onReady(megerOption));
      conn.on("error", onError);
    }
  };
};

function onReady(options) {
  const { host, port, path, outDir } = options;
  console.log(
    `\n服务器连接已就绪: ${host}:${port}\nthe server connection is ready: ${host}:${port} \n`
  );

  if (!path) {
    console.log(
      chalk.red("请配置远程目录~ \n please configure the remote directory~ \n")
    );

    console.log(chalk.red("连接已关闭 \nconnection closed"));
    conn.end();
    return false;
  }

  // 检测路径是否是系统目录
  const warnPath = [
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

  if (warnPath.includes(path) || path.includes("*")) {
    console.log(
      chalk.red(
        "您当前正在做操系统目录，程序已终止，请手动操作~ \nyou are currently operating the system directory and the program has terminated please manually operate \n"
      )
    );

    console.log(chalk.red("连接已关闭 \n connection closed"));

    conn.end();
    return false;
  }

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

function onError(e) {
  console.log(chalk.red("\n连接失败\n"));
  console.log(chalk.red("connection failed:"));
  if (e.message.includes("authentication")) {
    console.log(chalk.red("\n请检查用户名密码是否正确!"));
    console.log(
      chalk.red("please check if the username and password are correct!")
    );
  } else {
    console.log(chalk.red(`\n${e.message}`));
  }
}
