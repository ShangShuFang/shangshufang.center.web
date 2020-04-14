let express = require('express');
let router = express.Router();
let sysConfig = require('../config/sysConfig');
let Constants = require('../constant/Constants');
let commonService = require('../service/commonService');

router.get('/', function(req, res, next) {
  res.render('companyAccount', { title: '合作企业管理员账户' });
});

router.get('/dataList', (req, res, next) => {
  let service = new commonService.commonInvoke('companyAccountList');
  let pageNumber = parseInt(req.query.pageNumber);
  let companyID = req.query.companyID === undefined ? 0 : req.query.companyID;
  let parameter = `${pageNumber}/${sysConfig.pageSize}/${companyID}`;

  service.queryWithParameter(parameter,  (result) => {
    if (result.err) {
      res.json({
        err: true,
        code: result.code,
        msg: result.msg
      });
    } else {
      let dataContent = commonService.buildRenderData('合作企业管理员账户', pageNumber, result);
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
  let service = new commonService.commonInvoke('checkCompanyAccountCellphone');
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
  let service = new commonService.commonInvoke('addCompanyAccount');
  let data = {
    companyID: req.body.companyID,
    fullName: req.body.fullName,
    cellphone: req.body.cellphone,
    password: req.body.cellphone.substr(5),
    accountRole: Constants.AccountRole.ADMIN,
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
  let service = new commonService.commonInvoke('changeCompanyAccount');
  let data = {
    accountID: req.body.accountID,
    companyID: req.body.companyID,
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
  let service = new commonService.commonInvoke('changeCompanyAccountStatus');
  let data = {
    accountID: req.body.accountID,
    companyID: req.body.companyID,
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
  let service = new commonService.commonInvoke('deleteCompanyAccount');

  let companyID = req.query.companyID;
  let customerID = req.query.customerID;
  let accountID = req.query.accountID;

  let parameter = `${companyID}/${customerID}/${accountID}`;

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
