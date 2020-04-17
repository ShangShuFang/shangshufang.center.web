let express = require('express');
let router = express.Router();
let sysConfig = require('../config/sysConfig');
let commonService = require('../service/commonService');

router.get('/', function(req, res, next) {
  res.render('codeStandard', { title: '编码规范管理' });
});

router.get('/dataList', (req, res, next) => {
  let service = new commonService.commonInvoke('codeStandardList');
  let pageNumber = parseInt(req.query.pageNumber);
  let languageID = req.query.languageID === undefined ? 0 : req.query.languageID;

  let parameter = `${pageNumber}/${sysConfig.pageSize}/${languageID}`;

  service.queryWithParameter(parameter,  (result) => {
    if (result.err) {
      res.json({
        err: true,
        code: result.code,
        msg: result.msg
      });
    } else {
      let dataContent = commonService.buildRenderData('编码规范管理', pageNumber, result);
      res.json({
        err: false,
        code: result.code,
        msg: result.msg,
        dataContent: dataContent
      });
    }
  });
});

router.get('/checkName', function(req, res, next) {
  let service = new commonService.commonInvoke('checkCodeStandardName');
  let languageID = req.query.languageID;
  let codeStandardName = req.query.codeStandardName;

  let parameter = `${languageID}/${codeStandardName}`;

  service.queryWithParameter(parameter, function (result) {
    if(result.err){
      res.json({
        err: true,
        code: result.code,
        msg: result.msg
      });
    }else{
      res.json({
        err: false,
        code: result.code,
        msg: result.msg,
        result: result.content.responseData
      });
    }
  });
});

router.post('/', (req, res, next) => {
  let service = new commonService.commonInvoke('addCodeStandard');
  let data = {
    languageID: req.body.languageID,
    codeStandardName: req.body.codeStandardName,
    loginUser: req.body.loginUser
  };

  service.create(data, (result) => {
    if(result.err){
      res.json({
        err: true,
        code: result.code,
        msg: result.msg
      });
    }else{
      res.json({
        err: false,
        code: result.code,
        msg: result.msg
      });
    }
  });
});

router.put('/', (req, res, next) => {
  let service = new commonService.commonInvoke('changeCodeStandard');
  let data = {
    codeStandardID: req.body.codeStandardID,
    languageID: req.body.languageID,
    codeStandardName: req.body.codeStandardName,
    loginUser: req.body.loginUser
  };

  service.change(data, (result) => {
    if(result.err){
      res.json({
        err: true,
        code: result.code,
        msg: result.msg
      });
    }else{
      res.json({
        err: false,
        code: result.code,
        msg: result.msg
      });
    }
  });
});

module.exports = router;
