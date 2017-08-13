#!/usr/bin/env node

const fs = require("fs");
const readline = require("readline");
const path = require("path");
// 命令行颜色模块
const chalk = require("chalk");

// 命令行颜色
const error_c = chalk.bold.red;
const warning_c = chalk.yellow;
const express_c = chalk.green;

// 配置项
const config = JSON.parse(fs.readFileSync(path.join(__dirname, "line.config.json"), {encoding: "utf-8"}));

const {
  dir = "./",
  validType = [
    '', ".js", '.json'
  ],
  ignoreWarning = false,
  line = {
    warn: 300,
    error: 500
  }
} = config;

const warnLine = config.line.warn || 300;
const errorLine = config.line.error || 500;

/**
 * 忽略项
 */
// 输出忽略条件
const outPutReg = require("./ignore_filter");
// 读取忽略项配置文件
const ignoreInputStream = fs.createReadStream("./.ignoreLine");
// 忽略项表达式集合
const ignoreExpress = [];
// 强行需要检测的表达式集合
const checkExpress = [];

const ignore_promise = new Promise(function (resolve, reject) {
  const ignore_rl = readline.createInterface({
    input: ignoreInputStream
    // output: process.stdout
  });
  ignore_rl.on("line", input => {
    // 忽略#开头的行
    if (/^#/.test(input) || !input) {
      return;
    }
    const regularObj = outPutReg(__dirname, input);
    if (regularObj.type === "ignore") {
      ignoreExpress.push(regularObj.regular);
    }
    if (regularObj.type === "check") {
      checkExpress.push(regularObj.regular);
    }
  });
  ignore_rl.on("close", () => {
    console.log("ignoreExpress:", ignoreExpress);
    console.log("checkExpress:", checkExpress);
    console.log("already read ConfigFile");
    resolve();
  });
});

// detect line for each files, according to config file
function readDir(currentPath, dir) {
  const target_dir_path = path.join(currentPath, dir);
  fs.readdir(target_dir_path, function (err, files) {
    if (err) 
      throw err;
    files
      .map(function (fileName, index) {
        const target_file_path = path.join(target_dir_path, fileName);
        let isIgnore = false;
        if (path.join(__dirname, 'line.config.json') === target_file_path) {
          debugger
        }
        ignoreExpress
          .map(function (express, index) {
            if (express.test(target_file_path)) {
              isIgnore = true;
            }
          });
        checkExpress.map(function (express, index) {
          if (express.test(target_file_path)) {
            isIgnore = false;
          }
        });

        fs.stat(target_file_path, function (err, stats) {
          if (err) 
            throw err;
          if (stats.isDirectory()) {
            readDir(target_file_path, "./");
          }

          if (stats.isFile() && !isIgnore) {
            for (var i = 0; i < validType.length; i++) {
              const regular = new RegExp(`${validType[i].replace(/\./, '\\.')}`);
              if (regular.test(fileName)) {
                break;
              }
            }
            if (validType.length === i) {
              return;
            }
            var lines = 0;
            const inputStream = fs.createReadStream(target_file_path);
            const rl = readline.createInterface({
              input: inputStream
              // output: process.stdout
            });
            rl.on("line", input => {
              lines++;
            });
            rl.on("close", () => {
              if (lines > errorLine) {
                return console.log(error_c(`${target_file_path}行数${lines}`));
              }
              if (!ignoreWarning && lines > warnLine) {
                console.log(warning_c(`${target_file_path}行数${lines}`));
              }
            });
          }
        });
      });
  });
}

ignore_promise
  .then(function () {
    readDir(__dirname, dir);
  });

module.exports = function () {
  ignore_promise
    .then(function () {
      readDir(__dirname, dir);
    });
};
