let express = require('express');
let router = express.Router();
let commonService = require('../service/commonService');

router.get('/', function(req, res, next) {
  res.render('softwareExercisesUploadFiles', {
    title: '能力测评编辑',
    exercisesType: req.query.exercisesType,
    technologyName: req.query.technologyName,
    learningPhaseName: req.query.learningPhaseName,
    knowledgeName: req.query.knowledgeName
  });
});

router.get('/files', function(req, res, next) {
  let service = new commonService.commonInvoke('exercisesFile');
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
        files: result.content.responseData
      });
    }
  });
});

router.post('/', (req, res, next) => {
  let service = new commonService.commonInvoke('exercisesFile');
  let data = {
    exercisesID: req.body.exercisesID,
    // imageList: req.body.imageList,
    documentList: req.body.documentList,
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

module.exports = router;