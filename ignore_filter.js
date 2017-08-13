const path = require("path");
// 输出过滤条件
function outPutReg(prefix = "", input="") {
  // 含通配符
  if (/\*/.test(input)) {
    if (/^!/.test(input)) {
      const _input = input.substring(1);
      const regular = new RegExp(
        path
          .join(prefix, _input)
          .replace(/[\\]/g, "\\\\")
          .replace(/(\*\*)|\*/g, "[\\w|\\W]+")
      );
      return {
        type: "check",
        regular: regular
      };
    } else {
      const regular = new RegExp(
        path
          .join(prefix, input)
          .replace(/[\\]/g, "\\\\")
          .replace(/(\*\*)|\*/g, "[\\w|\\W]+")
      );
      return {
        type: "ignore",
        regular: regular
      };
    }
  } else {
    // 不含通配符
    if (/^!/.test(input)) {
      const _input = input.substring(1);
      const regular = new RegExp(
        path.join(prefix, _input).replace(/[\\]/g, "\\\\")
      );
      return {
        type: "check",
        regular: regular
      };
    } else {
      const regular = new RegExp(
        path.join(prefix, input).replace(/[\\]/g, "\\\\")
      );
      return {
        type: "ignore",
        regular: regular
      };
    }
  }
}

module.exports = outPutReg;
