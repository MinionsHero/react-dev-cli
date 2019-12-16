#!/usr/bin/env node
process.env.NODE_PATH = __dirname + '/../node_modules/'
const { resolve } = require('path')
const res = command => resolve(__dirname, '../commands/', command)
const program = require('commander')

program.version(require('../package').version)

program.usage('创建React项目')

program.command('init')
  .option('-p, --package-manager', 'choose package manager')
  .description('初始化一个React项目')
  .alias('i')
  .action(() => {
    require(res('init'))
  })
program.parse(process.argv)
// if (!program.args || !program.args.length) {
//   program.help()
// } else {

// }
