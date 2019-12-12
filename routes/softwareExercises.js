let express = require('express');
let router = express.Router();
let sysConfig = require('../config/sysConfig');
let commonService = require('../service/commonService');

router.get('/', function(req, res, next) {
  res.render('softwareExercises', { title: '软件研发能力测评' });
});

router.get('/dataList', (req, res, next) => {
  let service = new commonService.commonInvoke('exercises');
  let pageNumber = parseInt(req.query.pageNumber);
  let exercisesTypeCode = req.query.exercisesTypeCode === undefined ? 'A' : req.query.exercisesTypeCode;
  let technologyID = req.query.technologyID === undefined ? 0 : req.query.technologyID;
  let learningPhaseID = req.query.learningPhaseID === undefined ? 0 : req.query.learningPhaseID;

  let parameter = `${pageNumber}/${sysConfig.pageSize}/${exercisesTypeCode}/${technologyID}/${learningPhaseID}`;

  service.queryWithParameter(parameter,  (result) => {
    if (result.err) {
      res.json({
        err: true,
        code: result.code,
        msg: result.msg
      });
    } else {
      let dataContent = commonService.buildRenderData('软件研发能力测评', pageNumber, result);
      res.json({
        err: false,
        code: result.code,
        msg: result.msg,
        dataContent: dataContent
      });
    }
  });
});

router.put('/status', (req, res, next) => {
  let service = new commonService.commonInvoke('changeExercisesStatus');
  let data = {
    exercisesID: req.body.exercisesID,
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
  let service = new commonService.commonInvoke('exercises');
  let exercisesID = req.query.exercisesID;

  service.delete(exercisesID, function (result) {
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