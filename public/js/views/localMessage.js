const localMessage = {};
localMessage.NETWORK_ERROR = '网络异常，请检查网络设置';
localMessage.NO_ACCOUNT = '您输入的用户名或密码不存在！';

localMessage.UPLOAD_SUCCESS = '文件上传成功！';
localMessage.formatMessage = function (code, msg) {
  return `<strong>抱歉，系统发生异常，请联系我们</strong> </br>状态码:&nbsp ${code} </br> 详细信息:&nbsp ${msg}`;
};