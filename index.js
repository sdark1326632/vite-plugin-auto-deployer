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
      const env = resolvedCofnig.env.MODE
      if (env === 'development') {
        return
      }
      if (Array.isArray(options) && !!options.length) {
        options = options.find(item => item.mode == env)
        if (!options) {
          console.log('未找到相关环境，请手动上传~')
          return
        }
      }
      options.outDir = resolvedCofnig.build.outDir;
      options.readyTimeout = 5000;
    },
    async closeBundle() {
      console.log("\n");
      const { password, username } = options;
      const question = [];

      if (!username) {
        question.push({
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
        });
      }

      if (!password) {
        question.push({
          type: "password",
          name: "password",
          message: "请输入服务器密码",
          validate: (val) => {
            if (!val) {
              return "请输入服务器密码";
            }
            return true;
          }
        });
      }

      const answers = await inquirer.prompt(question);
      if (answers.username) {
        options.username = answers.username
      }

      if (answers.password) {
        options.password = answers.password
      }
      conn.connect(options);
      conn.on("ready", () => onReady(options));
      conn.on("error", onError);
    }
  };
};

function onReady(options) {
  const { host, port, path, outDir } = options;
  console.log(`服务器连接已就绪: ${host}:${port}`);

  if (!path) {
    console.log("请配置远程目录~");
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
  console.error("连接失败!");
  if (e.message.includes('authentication')) {
    console.error('请检查用户名密码是否正确!')
  } else {
    console.error(e.message)
  }
}
