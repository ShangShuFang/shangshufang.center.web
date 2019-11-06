let http = require('http');
let util = require('util');

/**
 * 调用API Service获取数据
 * @param host API Service域名
 * @param port API Service端口号
 * @param path API Service资源地址
 * @param callback 回调函数
 */
exports.query = function(host, port, path, callback){
  let options = {
    hostname: host,
    port: port,
    path: encodeURI(path),
    method: 'GET'
  };

  let content = '';
  let req = http.request(options, function (res) {
    if(res.statusCode === 200){
      res.setEncoding('utf8');
      res.on('data', function (data) {
        content += data.toString();
      }).on('end', function(){
        content = JSON.parse(content);
        return callback({
          'err': !content.result,
          'code': content.responseCode,
          'msg': content.responseMessage,
          'content': content
        });
      });
    }else{
      return callback({
        'err': true,
        'code': 'C2E01',
        'msg': `API Service发生异常。statusCode：${res.statusCode}`,
        'detail': util.format('invoke service failed. statusCode:[%s], host:[%s], port:[%s], path:[%s], param:[%s]', res.statusCode, host, port, path)
      });
    }
  });

  req.on('error', function (e) {
    return callback({
      'err': true,
      'code': 'C2E99',
      'msg': '无法调用API Service，请检查网络设置及API Service是否启动。',
      'detail': util.format('invoke service error. host:[%s], port:[%s], path:[%s], param:[%s], reason:[%s]', host, port, path, e.message)
    });
  });

  req.end();
};

/**
 * 调用API Service添加数据
 * @param data 待添加的数据
 * @param host API Service域名
 * @param port API Service端口号
 * @param path API Service资源地址
 * @param callback 回调函数
 */
exports.create = function(data, host, port, path, callback){
  data = JSON.stringify(data);
  let options = {
    method: 'POST',
    host: host,
    port: port,
    path: path,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      'Content-Length': Buffer.byteLength(data, 'utf8')
    }
  };

  let content = '';
  let req = http.request(options, function (res) {
    if(res.statusCode === 200){
      res.setEncoding('utf8');
      res.on('data', function (data) {
        content += data.toString();
      }).on('end', function(){
        content = JSON.parse(content);
        return callback({
          'err': !content.result,
          'code': content.responseCode,
          'msg': content.responseMessage,
          'content': content
        });
      });
    }else{
      return callback({
        'err': true,
        'code': 'C2E01',
        'msg': `API Service发生异常。statusCode：${res.statusCode}`,
        'detail': util.format('invoke service failed. statusCode:[%s], host:[%s], port:[%s], path:[%s], data:[%s]', res.statusCode, host, port, path, JSON.stringify(data))
      });
    }
  });

  req.on('error', function (e) {
    return callback({
      'err': true,
      'code': 'C2E99',
      'msg': '无法调用API Service，请检查网络设置及API Service是否启动。',
      'detail': util.format('invoke service error. host:[%s], port:[%s], path:[%s], data:[%s], reason:[%s]', host, port, path, JSON.stringify(data), e.message)
    });
  });

  req.write(data);
  req.end();
};

/**
 * 调用API Service修改数据
 * @param data 待修改的数据
 * @param host API Service域名
 * @param port API Service端口号
 * @param path API Service资源地址
 * @param callback 回调函数
 */
exports.change = function(data, host, port, path, callback){
  data = JSON.stringify(data);
  let options = {
    method: 'PUT',
    host: host,
    port: port,
    path: path,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      'Content-Length': Buffer.byteLength(data, 'utf8')
    }
  };

  let content = '';
  let req = http.request(options, function (res) {
    if(res.statusCode === 200){
      res.setEncoding('utf8');
      res.on('data', function (data) {
        content += data.toString();
      }).on('end', function(){
        content = JSON.parse(content);
        return callback({
          'err': !content.result,
          'code': content.responseCode,
          'msg': content.responseMessage,
          'content': content
        });
      });
    }else{
      return callback({
        'err': true,
        'code': 'C2E01',
        'msg': `API Service发生异常。statusCode：${res.statusCode}`,
        'detail': util.format('invoke service failed. statusCode:[%s], host:[%s], port:[%s], path:[%s], data:[%s]', res.statusCode, host, port, path, JSON.stringify(data))
      });
    }
  });

  req.on('error', function (e) {
    return callback({
      'err': true,
      'code': 'C2E99',
      'msg': '无法调用API Service，请检查网络设置及API Service是否启动。',
      'detail': util.format('invoke service error. host:[%s], port:[%s], path:[%s], data:[%s], reason:[%s]', host, port, path, JSON.stringify(data), e.message)
    });
  });

  req.write(data);
  req.end();
};

/**
 * 调用API Service删除数据
 * @param data 待修改的数据
 * @param host API Service域名
 * @param port API Service端口号
 * @param path API Service资源地址
 * @param callback 回调函数
 */
exports.delete = function(host, port, path, callback){
  let options = {
    hostname: host,
    port: port,
    path: path,
    method: 'DELETE'
  };

  let content = '';
  let req = http.request(options, function (res) {
    if(res.statusCode === 200){
      res.setEncoding('utf8');
      res.on('data', function (data) {
        content += data.toString();
      }).on('end', function(){
        content = JSON.parse(content);
        return callback({
          'err': !content.result,
          'code': content.responseCode,
          'msg': content.responseMessage,
          'content': content
        });
      });
    }else{
      return callback({
        'err': true,
        'code': 'C2E01',
        'msg': `API Service发生异常。statusCode：${res.statusCode}`,
        'detail': util.format('invoke service failed. statusCode:[%s], host:[%s], port:[%s], path:[%s], param:[%s]', res.statusCode, host, port, path, path)
      });
    }
  });

  req.on('error', function (e) {
    return callback({
      'err': true,
      'code': 'C2E99',
      'msg': '无法调用API Service，请检查网络设置及API Service是否启动。',
      'detail': util.format('invoke service error. host:[%s], port:[%s], path:[%s], param:[%s], reason:[%s]', host, port, path, path, e.message)
    });
  });

  req.end();
};