const localMessage = {};
localMessage.NETWORK_ERROR = '网络异常，请检查网络设置';
localMessage.formatMessage = function (code, msg) {
  return `<strong>抱歉，系统发生异常，请联系我们</strong> </br>状态码:&nbsp ${code} </br> 详细信息:&nbsp ${msg}`;
};