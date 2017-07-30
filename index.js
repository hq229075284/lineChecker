#!/usr/bin/env node

const fs = require('fs')
const readline = require('readline')
const path = require('path')
const chalk = require('chalk');

// 配置项
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'line.config.json'), {encoding: 'utf-8'}))
// 忽略项
const ignoreInputStream = fs.createReadStream('./.ignoreLine')
const ignoreExpress = []
function outPutReg(prefix = '', str) {
  // 含通配符
  if (/\*/.test(str)) {
    console.log(str)
  } else { // 不含通配符
    return new RegExp(path.join(prefix, str).replace(/[\\]/g, '\\\\'))
  }
}

/* const readIgnore = new Promise(function (resolve, reject) {
  const rl = readline.createInterface({
    input: ignoreInputStream,
    // output: process.stdout
  });
  rl.on('line', (input) => {
    console.log(express(outPutReg(__dirname, input)))
    ignoreExpress.push(outPutReg(__dirname, input))
    // console.log(`Received: ${input}`);
  });
  rl.on('close', () => {
    console.log('ignoreExpress:', ignoreExpress)
    console.log('close')
    resolve()
  });
}) */

const rl = readline.createInterface({
  input: ignoreInputStream,
  // output: process.stdout
});
rl.on('line', (input) => {
  console.log(express(outPutReg(__dirname, input)))
  // console.log("F:\\font-end\line-cli\\node_modules\\resolve\\test\\node_path\\x
  // \ccc\index.js")
  ignoreExpress.push(outPutReg(__dirname, input))
  // console.log(`Received: ${input}`);
});
rl.on('close', () => {
  console.log('ignoreExpress:', ignoreExpress)
  console.log('close')
});

// 命令行颜色
const error = chalk.bold.red;
// const warning = chalk.keyword('orange');
const warning = chalk.yellow;
const express = chalk.green;

const {
  dir = './',
  validType = ['js'],
  ignoreWarning = false
} = config

/* const dir = config.dir || './'
const validType = config.validType || ['js']
const ignoreWarning = config.ignoreWarning || false */
const warnLine = config.line.warn || 300
const errorLine = config.line.error || 500

// detect line for each files, according to config file
function readF(currentPath, dir) {
  const target_dir_path = path.join(currentPath, dir)
  fs.readdir(target_dir_path, function (err, files) {
    if (err) 
      throw err
    files
      .map(function (fileName, index) {
        const target_file_path = path.join(target_dir_path, fileName)
        let isIgnore = false
        ignoreExpress.map(function (express, index) {
          if (express.test(target_file_path)) {
            isIgnore = true
          }
        })
        if (isIgnore) {
          return
        }
        fs
          .stat(target_file_path, function (err, stats) {
            if (err) 
              throw err
            if (stats.isDirectory()) {
              readF(target_file_path, './')
            }
            if (stats.isFile()) {
              for (var i = 0; i < validType.length; i++) {
                const regular = new RegExp(`.${validType[i]}`)
                if (regular.test(fileName)) {
                  break
                }
              }
              if (validType.length === i) {
                return
              }
              var lines = 0
              const inputStream = fs.createReadStream(target_file_path)
              const rl = readline.createInterface({
                input: inputStream,
                // output: process.stdout
              });
              rl.on('line', (input) => {
                lines++
                // console.log(`Received: ${input}`);
              });
              rl.on('close', () => {
                if (lines > errorLine) {
                  return console.log(error(`${target_file_path}行数${lines}`))
                }
                if (!ignoreWarning && lines > warnLine) {
                  console.warn(warning(`${target_file_path}行数${lines}`))
                }
              });
            }
          })
      })
  })
}

readF(__dirname, dir)
/* readIgnore
  .then(readF(__dirname, dir))
  .catch(err => {
    throw err
  }) */