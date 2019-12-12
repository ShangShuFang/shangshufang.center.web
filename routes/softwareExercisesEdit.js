let express = require('express');
let router = express.Router();
let sysConfig = require('../config/sysConfig');
let commonService = require('../service/commonService');

router.get('/', function(req, res, next) {
  res.render('softwareExercisesEdit', { title: '能力测评编辑' });
});

router.get('/checkExercisesCode', function(req, res, next) {
  let service = new commonService.commonInvoke('checkExercisesCode');
  let exercisesCode = req.query.exercisesCode;

  service.queryWithParameter(exercisesCode, function (result) {
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

router.get('/exercises', function(req, res, next) {
  let service = new commonService.commonInvoke('exercises');
  let exercisesID = req.query.exercisesID;

  service.queryWithParameter(exercisesID, function (result) {
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
        exercises: result.content.responseData
      });
    }
  });
});

router.get('/knowledgeList', function(req, res, next) {
  let service = new commonService.commonInvoke('exercisesKnowledgeList');
  let exercisesID = req.query.exercisesID;

  service.queryWithParameter(exercisesID, function (result) {
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
        knowledgeList: result.content.responseData
      });
    }
  });
});

router.post('/', (req, res, next) => {
  let service = new commonService.commonInvoke('exercises');
  let data = {
    exercisesType: req.body.exercisesType,
    exercisesName: req.body.exercisesName,
    exercisesCode: req.body.exercisesCode,
    knowledgeListJson: req.body.knowledgeListJson,
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
  let service = new commonService.commonInvoke('exercises');
  let data = {
    exercisesID: req.body.exercisesID,
    exercisesName: req.body.exercisesName,
    knowledgeListJson: req.body.knowledgeListJson,
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