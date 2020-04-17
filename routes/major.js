let express = require('express');
let router = express.Router();
let sysConfig = require('../config/sysConfig');
let commonService = require('../service/commonService');

router.get('/', function(req, res, next) {
  res.render('major', { title: '专业管理' });
});

router.get('/dataList', (req, res, next) => {
  let service = new commonService.commonInvoke('majorList');
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
      let dataContent = commonService.buildRenderData('专业管理', pageNumber, result);
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
  let service = new commonService.commonInvoke('checkMajorName');
  let universityCode = req.query.universityCode;
  let schoolID = req.query.schoolID;
  let majorName = req.query.majorName;

  let parameter = `${universityCode}/${schoolID}/${majorName}`;

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
  let service = new commonService.commonInvoke('addMajor');
  let data = {
    universityCode: req.body.universityCode,
    schoolID: req.body.schoolID,
    majorName: req.body.majorName,
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
  let service = new commonService.commonInvoke('changeMajor');
  let data = {
    majorID: req.body.majorID,
    universityCode: req.body.universityCode,
    schoolID: req.body.schoolID,
    majorName: req.body.majorName,
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
  let service = new commonService.commonInvoke('deleteMajor');
  let universityCode = req.query.universityCode;
  let schoolID = req.query.schoolID;
  let majorID = req.query.majorID;
  let parameter = `${universityCode}/${schoolID}/${majorID}`;

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
