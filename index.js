'use strict'

fs = require 'fs'

module.exports = function(options) {
  options = Object.prototype.toString.call(options) === '[object Object]' ? options : {};

  return function (req, res, next) {
    var remoteAddr = req.ip || req.ips || req._remoteAddress ||
      (req.socket && (req.socket.remoteAddress || (req.socket.socket && req.socket.socket.remoteAddress)));

    if (!remoteAddr) return next();

    if (!options.filter && !options.filterPath) return next();

    if (options.filterPath) {
      var buffer = fs.readFileSync(options.filterPath);
      options.filter = buffer.toString().split(/\n/g);
    }

    var authorized = false;

    switch (Object.prototype.toString.call(options.filter)) {
      case '[object String]':
        authorized = new RegExp(options.filter.trim().replace(/\./g, '\\.').replace(/\?/g, '\\d?').replace(/\*/g, '\\d*')).test(remoteAddr);
        break;
      case '[object Array]':
        var regExp = options.filter.reduce(function(pre, next, index, filter) {
          if (typeof next === 'string' && next.length > 0) {
            pre += next.trim().replace(/\./g, '\\.').replace(/\?/g, '\\d?').replace(/\*/g, '\\d*');
          }

          if (index === filter.length - 1) {
            pre += ')$';
          } else {
            pre += '|';
          }

          return pre;
        }, '^(');
        authorized = new RegExp(regExp).test(remoteAddr);
        break;
      case '[object RegExp]':
        authorized = options.filter.test(remoteAddr);
      case '[object Function]':
        authorized = options.filter.call(this, remoteAddr);
      default:
        authorized = false
    }

    if (authorized) {
      next()
    } else {
      next({ status: options.status ? options.status : 403, message: options.status ? options.message : 'forbidden' })
    }
  }
}
