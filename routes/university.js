let express = require('express');
let router = express.Router();
let sysConfig = require('../config/sysConfig');
let commonService = require('../service/commonService');

router.get('/', function(req, res, next) {
  res.render('university', { title: '合作高校' });
});

router.get('/dataList', (req, res, next) => {
  let service = new commonService.commonInvoke('university');
  let pageNumber = parseInt(req.query.pageNumber);
  let provinceCode = req.query.provinceCode === undefined ? 0 : req.query.provinceCode;
  let cityCode = req.query.cityCode === undefined ? 0 : req.query.cityCode;

  let parameter = `${pageNumber}/${sysConfig.pageSize}/${provinceCode}/${cityCode}`;

  service.queryWithParameter(parameter,  (result) => {
    if (result.err) {
      res.json({
        err: true,
        code: result.code,
        msg: result.msg
      });
    } else {
      let dataContent = commonService.buildRenderData('合作高校', pageNumber, result);
      res.json({
        err: false,
        code: result.code,
        msg: result.msg,
        dataContent: dataContent
      });
    }
  });
});

router.get('/checkUniversityCode', function(req, res, next) {
  let service = new commonService.commonInvoke('checkUniversityCode');
  let universityCode = req.query.universityCode;

  service.queryWithParameter(universityCode, function (result) {
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

router.get('/checkUniversityName', function(req, res, next) {
  let service = new commonService.commonInvoke('checkUniversityName');
  let universityName = req.query.universityName;

  service.queryWithParameter(universityName, function (result) {
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
  let service = new commonService.commonInvoke('university');
  let data = {
    universityCode: req.body.universityCode,
    universityName: req.body.universityName,
    provinceCode: req.body.provinceCode,
    cityCode: req.body.cityCode,
    districtCode: req.body.districtCode,
    address: req.body.address,
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
  let service = new commonService.commonInvoke('university');
  let data = {
    universityID: req.body.universityID,
    universityCode: req.body.universityCode,
    universityName: req.body.universityName,
    provinceCode: req.body.provinceCode,
    cityCode: req.body.cityCode,
    districtCode: req.body.districtCode,
    address: req.body.address,
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
  let service = new commonService.commonInvoke('changeUniversityStatus');
  let data = {
    universityID: req.body.universityID,
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

router.put('/brand', (req, res, next) => {
  let service = new commonService.commonInvoke('changeUniversityBrand');
  let data = {
    universityID: req.body.universityID,
    brand: req.body.brand,
    memo: req.body.memo,
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
  let service = new commonService.commonInvoke('university');
  let universityID = req.query.universityID;

  service.delete(universityID, function (result) {
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
