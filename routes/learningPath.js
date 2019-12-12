let express = require('express');
let router = express.Router();
let sysConfig = require('../config/sysConfig');
let commonService = require('../service/commonService');
let Constants = require('../constant/Constants');
let parameterUtils = require('../common/parameterUtils');

router.get('/', function(req, res, next) {
  res.render('learningPath', { title: '路径规划' });
});

router.get('/dataList', (req, res, next) => {
  let service = new commonService.commonInvoke('learningPath');
  let pageNumber = parameterUtils.processNumberParameter(req.query.pageNumber, Constants.PAGE_NUMBER_DEFAULT);
  let technologyID = parameterUtils.processNumberParameter(req.query.technologyID, Constants.TECHNOLOGY_DEFAULT_ID);
  let learningPhase = parameterUtils.processNumberParameter(req.query.learningPhase, Constants.LEARNING_PHASE);

  let parameter = `${pageNumber}/${sysConfig.pageSize}/${technologyID}/${learningPhase}`;

  service.queryWithParameter(parameter,  (result) => {
    if (result.err) {
      res.json({
        err: true,
        code: result.code,
        msg: result.msg
      });
    } else {
      let dataContent = commonService.buildRenderData('路径规划', pageNumber, result);
      res.json({
        err: false,
        code: result.code,
        msg: result.msg,
        dataContent: dataContent
      });
    }
  });
});

router.get('/usingTechnology', function(req, res, next) {
  let service = new commonService.commonInvoke('usingTechnology4LearningPath');

  service.queryWithParameter('', function (result) {
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

router.get('/usingLearningPhase', function(req, res, next) {
  let service = new commonService.commonInvoke('usingLearningPhase');
  let technologyID = req.query.technologyID;

  service.queryWithParameter(technologyID, function (result) {
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

router.get('/usingKnowledge', function(req, res, next) {
  let service = new commonService.commonInvoke('usingKnowledge');
  let technologyID = req.query.technologyID;
  let learningPhase = parameterUtils.processNumberParameter(req.query.learningPhase, Constants.LEARNING_PHASE);
  let parameter = `${technologyID}/${learningPhase}`;

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
        dataList: result.content.responseData
      });
    }
  });
});

router.post('/', (req, res, next) => {
  let service = new commonService.commonInvoke('learningPath');
  let data = {
    technologyID: req.body.technologyID,
    learningPhaseID: req.body.learningPhaseID,
    knowledgeIdList: req.body.knowledgeIdList,
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
  let service = new commonService.commonInvoke('learningPath');
  let data = {
    technologyID: req.body.technologyID,
    learningPhaseID: req.body.learningPhaseID,
    knowledgeIdList: req.body.knowledgeIdList,
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
  let service = new commonService.commonInvoke('changeLearningPathStatus');
  let data = {
    technologyID: req.body.technologyID,
    learningPhaseID: req.body.learningPhaseID,
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
  let service = new commonService.commonInvoke('learningPath');
  let technologyID = req.query.technologyID;
  let learningPhaseID = req.query.learningPhaseID;
  let parameter = `${technologyID}/${learningPhaseID}`;

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
