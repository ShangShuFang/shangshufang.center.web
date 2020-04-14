let express = require('express');
let router = express.Router();
let sysConfig = require('../config/sysConfig');
let Constants = require('../constant/Constants');
let commonService = require('../service/commonService');

router.get('/', function(req, res, next) {
  res.render('universityAccount', { title: '合作高校管理员账户' });
});

router.get('/dataList', (req, res, next) => {
  let service = new commonService.commonInvoke('universityAccountList');
  let pageNumber = parseInt(req.query.pageNumber);
  let universityCode = req.query.universityCode === undefined ? 0 : req.query.universityCode;
  let schoolID = req.query.schoolID === undefined ? 0 : req.query.schoolID;
  let parameter = `${pageNumber}/${sysConfig.pageSize}/${universityCode}/${schoolID}`;

  service.queryWithParameter(parameter,  (result) => {
    if (result.err) {
      res.json({
        err: true,
        code: result.code,
        msg: result.msg
      });
    } else {
      let dataContent = commonService.buildRenderData('合作高校管理员账户', pageNumber, result);
      res.json({
        err: false,
        code: result.code,
        msg: result.msg,
        dataContent: dataContent
      });
    }
  });
});

router.get('/checkCellphone', function(req, res, next) {
  let service = new commonService.commonInvoke('checkUniversityAccountCellphone');
  let cellphone = req.query.cellphone;

  service.queryWithParameter(cellphone, function (result) {
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
  let service = new commonService.commonInvoke('addUniversityAccount');
  let data = {
    universityCode: req.body.universityCode,
    schoolID: req.body.schoolID,
    fullName: req.body.fullName,
    cellphone: req.body.cellphone,
    password: req.body.cellphone.substr(5),
    accountRole: Constants.AccountRole.ADMIN,
    dataStatus: Constants.ACCOUNT_WAITING,
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
  let service = new commonService.commonInvoke('changeUniversityAccount');
  let data = {
    accountID: req.body.accountID,
    universityCode: req.body.universityCode,
    schoolID: req.body.schoolID,
    customerID: req.body.customerID,
    cellphone: req.body.cellphone,
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

router.put('/status', (req, res, next) => {
  //todo 如果dataStatus为A，则发送通知短信
  let service = new commonService.commonInvoke('changeUniversityAccountStatus');
  let data = {
    accountID: req.body.accountID,
    universityCode: req.body.universityCode,
    schoolID: req.body.schoolID,
    customerID: req.body.customerID,
    accountRole: req.body.accountRole,
    dataStatus: req.body.status,
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

router.delete('/', (req, res, next) => {
  let service = new commonService.commonInvoke('deleteUniversityAccount');
  let accountID = req.query.accountID;
  let universityCode = req.query.universityCode;
  let schoolID = req.query.schoolID;
  let customerID = req.query.customerID;
  let parameter = `${universityCode}/${schoolID}/${accountID}/${customerID}`;

  service.delete(parameter, function (result) {
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
