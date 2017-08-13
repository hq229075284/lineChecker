/**
 * case1:
 * *.a
 * case2:
 * !lib.a
 * case3:
 * /TODO
 * case4:
 * build/
 * case5:
 * doc/*.txt
 * case6:
 * doc/ ** /*.pdf
 */

const path = require("path");
/**
 * 输出过滤条件
 *
 * @param {string} [prefix=""]
 * @param {string} [input=""]
 * @returns
 */
function outPutReg(prefix = "", input = "") {
  const startWithSlash = /^\//.test(input)
  const endWithSlash = /\/$/.test(input)
  // 含通配符
  if (/\*\*/.test(input)) {
    let _input,
      type = 'ignore'

    if (/^!/.test(input)) {
      _input = input.substring(1);
      type = 'check'
    } else {
      _input = input
    }

    const regular = new RegExp(path.join(prefix, _input + '$').replace(/[\\]/g, "\\\\").replace(/(\*\*)/g, "[\\w|\\W]+").replace(/\*/g, "[^\\\\|\\/]+").replace(/\./g, "\\."));
    return {type: type, regular: regular};

  } else if (/\*/.test(input)) {
    let _input,
      type = 'ignore'

    if (/^!/.test(input)) {
      _input = input.substring(1);
      type = 'check'
    } else {
      _input = input
    }

    const regular = new RegExp(path.join(prefix, _input).replace(/[\\]/g, "\\\\").replace(/\*/g, "[^\\\\|\\/]+").replace(/\./g, "\\."));
    return {type: type, regular: regular};

  } else { // 不含通配符
    let _input,
      type = 'ignore'

    if (/^!/.test(input)) {
      _input = input.substring(1);
      type = 'check'
    } else {
      _input = input
    }

    if (startWithSlash && !endWithSlash) {
      const regular = new RegExp(path.join(prefix, _input + '$').replace(/\\/g, "\\\\").replace(/\./g, "\\."));
      return {type: type, regular: regular};
    }
    const regular = new RegExp(path.join(prefix, _input).replace(/\\/g, "\\\\").replace(/\./g, "\\."));
    return {type: type, regular: regular};
  }
}

module.exports = outPutReg;
