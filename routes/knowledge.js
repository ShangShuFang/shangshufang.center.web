let express = require('express');
let router = express.Router();
let sysConfig = require('../config/sysConfig');
let commonService = require('../service/commonService');
let Constants = require('../constant/Constants');
let parameterUtils = require('../common/parameterUtils');

router.get('/', function(req, res, next) {
  res.render('knowledge', { title: '知识点' });
});

router.get('/dataList', (req, res, next) => {
  let service = new commonService.commonInvoke('knowledgeList');
  let pageNumber = parameterUtils.processNumberParameter(req.query.pageNumber, Constants.PAGE_NUMBER_DEFAULT);
  let technologyID = parameterUtils.processNumberParameter(req.query.technologyID, Constants.TECHNOLOGY_DEFAULT_ID);
  let learningPhaseID = parameterUtils.processNumberParameter(req.query.learningPhaseID, Constants.LEARNING_PHASE);
  let dataStatus = req.query.dataStatus;

  let parameter = `${pageNumber}/${sysConfig.pageSize}/${technologyID}/${learningPhaseID}/${dataStatus}`;

  service.queryWithParameter(parameter,  (result) => {
    if (result.err) {
      res.json({
        err: true,
        code: result.code,
        msg: result.msg
      });
    } else {
      let dataContent = commonService.buildRenderData('知识点', pageNumber, result);
      res.json({
        err: false,
        code: result.code,
        msg: result.msg,
        dataContent: dataContent
      });
    }
  });
});

router.get('/checkTechnologyName', function(req, res, next) {
  let service = new commonService.commonInvoke('checkKnowledgeNameExist');
  let technologyID = req.query.technologyID;
  let knowledgeName = req.query.knowledgeName;
  let parameter = `${technologyID}/${knowledgeName}`;

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
  let service = new commonService.commonInvoke('addKnowledge');
  let data = {
    technologyID: req.body.technologyID,
    learningPhaseID: req.body.learningPhaseID,
    knowledgeName: req.body.knowledgeName,
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
  let service = new commonService.commonInvoke('changeKnowledge');
  let data = {
    knowledgeID: req.body.knowledgeID,
    technologyID: req.body.technologyID,
    learningPhaseID: req.body.learningPhaseID,
    knowledgeName: req.body.knowledgeName,
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
  let service = new commonService.commonInvoke('changeKnowledgeStatus');
  let data = {
    knowledgeID: req.body.knowledgeID,
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
  let service = new commonService.commonInvoke('deleteKnowledge');
  let technologyID = req.query.technologyID;
  let knowledgeID = req.query.knowledgeID;
  let learningPhaseID = req.query.learningPhaseID;
  let parameter = `${technologyID}/${learningPhaseID}/${knowledgeID}`;

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