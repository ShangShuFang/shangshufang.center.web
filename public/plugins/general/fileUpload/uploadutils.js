let uploadUtils = {};
uploadUtils.initUploadPlugin = function (selector, uploadUrl, fileType, multiple, completeCallback) {
  $(selector).initUpload({
    "uploadUrl": uploadUrl,//上传文件信息地址
    //"deleteFileUrl":"/editNews/deleteFile?fileName=",//上传文件信息地址
    //"beforeUpload": beforeUploadFun,//在上传前执行的函数
    "ismultiple": multiple,
    "fileType": fileType,//文件类型限制，默认不限制，注意写的是文件后缀
    //"size":350,//文件大小限制，单位kb,默认不限制
    "maxFileNumber": multiple ? 10 : 1,//文件个数限制，为整数
    //"filelSavePath":"",//文件上传地址，后台设置的根目录
    "onUpload": completeCallback, //在上传后执行的函数
    //autoCommit:true,//文件是否自动上传
  });
};

uploadUtils.destroyUploadPlugin = function (selector) {
  $(selector).empty();
};