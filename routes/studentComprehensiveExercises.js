let express = require('express');
let router = express.Router();
let sysConfig = require('../config/sysConfig');
let commonService = require('../service/commonService');

router.get('/', function(req, res, next) {
  res.render('studentComprehensiveExercises', { title: '就业测评批改' });
});

router.get('/dataList', (req, res, next) => {
  let service = new commonService.commonInvoke('studentComprehensiveExercisesList');
  let pageNumber = req.query.pageNumber;
  let pageSize = sysConfig.pageSize;
  let programLanguage = req.query.programLanguage;
  let universityCode = req.query.universityCode;
  let schoolID = req.query.schoolID;
  let majorID = req.query.majorID;
  let fullName = req.query.fullName.length === 0 ? 'NULL' : req.query.fullName;
  let dataStatus = req.query.dataStatus.length === 0 ? 'NULL' : req.query.dataStatus;
  let parameter = `${pageNumber}/${pageSize}/${programLanguage}/${universityCode}/${schoolID}/${majorID}/${fullName}/${dataStatus}`;

  service.queryWithParameter(parameter,  (result) => {
    if (result.err) {
      res.json({
        err: true,
        code: result.code,
        msg: result.msg
      });
    } else {
      let dataContent = commonService.buildRenderData('就业测评批改', pageNumber, result);
      res.json({
        err: false,
        code: result.code,
        msg: result.msg,
        dataContent: dataContent
      });
    }
  });
});

router.put('/correct', (req, res, next) => {
  let service = new commonService.commonInvoke('correctStudentComprehensiveExercises');
  let data = {
    collectionID: req.body.collectionID,
    dataStatus: req.body.dataStatus,
    reviewMemo: req.body.reviewMemo,
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
