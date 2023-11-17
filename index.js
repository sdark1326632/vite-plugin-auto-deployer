const ora = require("ora");
const inquirer = require("inquirer");
const chalk = require("chalk");
const scpClient = require("scp2");
let Client = require("ssh2").Client;
let conn = new Client();

module.exports = function (options) {
  return {
    name: "vite-plugin-auto-server-upload",
    configResolved(resolvedCofnig) {
      options.outDir = resolvedCofnig.build.outDir;
      options.readyTimeout = 5000;
    },
    async closeBundle() {
      const { password, username } = options;
      if (!username || !password) {
        console.log('\n')
        const answers = await inquirer.prompt([
          {
            type: "input",
            name: "username",
            default: "root",
            message: "请输入服务器用户名",
            validate: (val) => {
              if (!val) {
                return "请输入服务器用户名";
              }
              return true;
            }
          },
          {
            type: "password",
            name: "password",
            message: "请输入服务器密码",
            validate: (val) => {
              if (!val) {
                return "请输入服务器密码";
              }
              return true;
            }
          }
        ]);

        options.username = answers.username;
        options.password = answers.password;
      }
      conn.connect(options);
      conn.on("ready", () => onReady(options));
      conn.on("error", onError);
      conn.on("end", onEnd);
      conn.on("close", onClose);
    }
  };
};

function onReady(options) {
  const { host, port, path, outDir } = options;
  console.log(`服务器连接已就绪: ${host}:${port}`);
  if (!path) {
    console.log("连接已关闭");
    conn.end();
    return false;
  }
  conn.exec(`rm -rf ${path}/*`, (err, stream) => {
    if (err) throw err;
    console.log(`清空 ${path} 目录成功!`);
    stream
      .on("close", (code, signal) => {
        const spinner = ora(`正在上传 ${outDir} 目录内文件...`);
        spinner.start();
        scpClient.scp(`./${outDir}`, options, (err) => {
          spinner.stop();
          if (err) {
            console.log(chalk.red("上传失败..."));
            throw err;
          } else {
            console.log(
              chalk.green("已自动上传至服务器! \n✿    ✿    ✿    ✿    ✿")
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
  console.log("error", e);
}

function onEnd() {
  console.log("end");
}

function onClose() {
  console.log("close");
}
