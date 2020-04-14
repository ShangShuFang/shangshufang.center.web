let express = require('express');
let router = express.Router();
let commonService = require('../service/commonService');

router.get('/', function(req, res, next) {
  res.render('knowledgeExercises', {title: '习题上传'});
});

router.get('/files', function(req, res, next) {
  let service = new commonService.commonInvoke('knowledgeExercisesList');
  let technologyID = req.query.technologyID;
  let learningPhaseID = req.query.learningPhaseID;
  let knowledgeID = req.query.knowledgeID;
  let parameter = `1/999/${technologyID}/${learningPhaseID}/${knowledgeID}`;

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
        files: result.content.responseData
      });
    }
  });
});

router.post('/', (req, res, next) => {
  let service = new commonService.commonInvoke('addKnowledgeExercises');
  let data = {
    technologyID: req.body.technologyID,
    learningPhaseID: req.body.learningPhaseID,
    knowledgeID: req.body.knowledgeID,
    exercisesJson: req.body.exercisesJson,
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