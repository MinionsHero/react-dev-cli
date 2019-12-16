const { prompt } = require('inquirer')
const program = require('commander')
const chalk = require('chalk')
const download = require('download-git-repo')
const ora = require('ora')
const fs = require('fs')
const path = require('path')
const execa = require('execa')

const option = program.parse(process.argv).args[0]
const defaultName = typeof option === 'string' ? option : 'react-project'
const tplList = require(`${__dirname}/../template`)
const tplLists = Object.keys(tplList) || [];
console.log(`
${chalk.green('欢迎使用MinonsHero的React脚手架')}
${chalk.green('有问题欢迎反馈:')}
${chalk.underline('https://github.com/MinionsHero/react-dev-cli/issues')}
`)
const question = [
  {
    type: 'input',
    name: 'name',
    message: '项目名称',
    default: defaultName,
    filter(val) {
      return val.trim()
    },
    validate(val) {
      const validate = (val.trim().split(" ")).length === 1
      if (!validate) {
        return '项目名称不允许包含空格';
      }
      const projectPath = path.resolve(process.cwd(), './' + val)
      try {
        fs.accessSync(projectPath, fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK);
        return '目录已存在,请使用其他名称'
      } catch (err) {
        return true
      }
    },
    transformer(val) {
      return val;
    }
  }, {
    type: 'list',
    name: 'template',
    message: '项目模板',
    choices: tplLists,
    default: tplLists[0],
    validate(val) {
      return true;
    },
    transformer(val) {
      return val;
    }
  }, {
    type: 'input',
    name: 'description',
    message: '项目描述',
    default: 'React project',
    validate(val) {
      return true;
    },
    transformer(val) {
      return val;
    }
  }, {
    type: 'input',
    name: 'author',
    message: '项目作者',
    default: 'project author',
    validate(val) {
      return true;
    },
    transformer(val) {
      return val;
    }
  }
]
module.exports = prompt(question).then(({ name, template, description, author }) => {
  const projectName = name;
  const templateName = template;
  const gitPlace = tplList[templateName]['place'];
  const gitBranch = tplList[templateName]['branch'];
  let spinner = ora('正在下载模板,请等待...');
  spinner.start();
  download(`${gitPlace}${gitBranch}`, `./${projectName}`, (err) => {
    if (err) {
      console.log(chalk.red(err))
      process.exit()
    }
    fs.readFile(`./${projectName}/package.json`, 'utf8', function (err, data) {
      if (err) {
        spinner.stop();
        console.error(err);
        return;
      }
      const packageJson = JSON.parse(data);
      packageJson.name = name;
      packageJson.description = description;
      packageJson.author = author;
      var updatePackageJson = JSON.stringify(packageJson, null, 2);
      fs.writeFile(`./${projectName}/package.json`, updatePackageJson, 'utf8', function (err) {
        if (err) {
          spinner.stop();
          console.error(err);
          return;
        } else {
          spinner.succeed('项目创建成功!')
          spinner = ora({
            text: '正在安装依赖,请等待...'
          })
          spinner.start()
          execa('npm', ['install'], { cwd: process.cwd() + '/' + projectName }).then((output) => {
            const { failed, timedOut, isCanceled, killed, stderr, stdout, exitCode } = output
            if (exitCode != 0 || failed || timedOut || isCanceled || killed) {
              throw new Error(stderr)
            }
            console.log(`
            ${chalk.grey(stdout)}
            ${chalk.yellow(stderr)}
            `)
            spinner.succeed('依赖安装完毕!')
            console.log(`
            ${chalk.bgWhite.black('👉 运行命令进入项目开启你的React之旅~  ')}
            ${chalk.yellow(`cd ${projectName}`)}
            ${chalk.yellow('npm run start')}`);
          }).catch((e) => {
            console.log(`${chalk.red(e.message)}`)
          })
        }
      });
    });
  })
})
