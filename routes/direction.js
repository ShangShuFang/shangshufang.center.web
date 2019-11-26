let express = require('express');
let router = express.Router();
let sysConfig = require('../config/sysConfig');
let commonService = require('../service/commonService');

router.get('/', function(req, res, next) {
  res.render('direction', { title: '研发方向' });
});

router.get('/dataList', (req, res, next) => {
  let service = new commonService.commonInvoke('direction');
  let pageNumber = parseInt(req.query.pageNumber);

  let parameter = `${pageNumber}/${sysConfig.pageSize}`;

  service.queryWithParameter(parameter,  (result) => {
    if (result.err) {
      res.json({
        err: true,
        code: result.code,
        msg: result.msg
      });
    } else {
      let dataContent = commonService.buildRenderData('研发方向', pageNumber, result);
      res.json({
        err: false,
        code: result.code,
        msg: result.msg,
        dataContent: dataContent
      });
    }
  });
});

router.get('/checkDirectionName', function(req, res, next) {
  let service = new commonService.commonInvoke('checkDirectionNameExist');
  let directionName = req.query.directionName;

  service.queryWithParameter(directionName, function (result) {
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

router.get('/relateTechnology', function(req, res, next) {
  let service = new commonService.commonInvoke('technologyDirection4Direction');
  let directionID = req.query.directionID;

  service.queryWithParameter(directionID, function (result) {
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
        dataList: result.content.responseData
      });
    }
  });
});

router.post('/', (req, res, next) => {
  let service = new commonService.commonInvoke('direction');
  let data = {
    directionName: req.body.directionName,
    directionStars: req.body.directionStars,
    directionMemo: req.body.directionMemo,
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
  let service = new commonService.commonInvoke('direction');
  let data = {
    directionID: req.body.directionID,
    directionName: req.body.directionName,
    directionStars: req.body.directionStars,
    directionMemo: req.body.directionMemo,
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
  let service = new commonService.commonInvoke('changeDirectionStatus');
  let data = {
    directionID: req.body.directionID,
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

router.put('/thumbnail', (req, res, next) => {
  let service = new commonService.commonInvoke('changeDirectionThumbnail');
  let data = {
    directionID: req.body.directionID,
    directionThumbnail: req.body.directionThumbnail,
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
  let service = new commonService.commonInvoke('direction');
  let directionID = req.query.directionID;

  service.delete(directionID, function (result) {
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