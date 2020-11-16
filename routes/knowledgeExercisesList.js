let express = require('express');
let router = express.Router();
let sysConfig = require('../config/sysConfig');
let commonService = require('../service/commonService');

router.get('/', function(req, res, next) {
  res.render('knowledgeExercisesList', { title: '随堂习题批改' });
});

router.get('/dataList', (req, res, next) => {
  let service = new commonService.commonInvoke('courseExercisesList');
  let pageNumber = req.query.pageNumber;
	let pageSize = sysConfig.pageSize;
	let technologyID = req.query.technologyID;
  let universityCode = req.query.universityCode;
  let schoolID = 0;
  let courseID = req.query.courseID;
  let studentID = 0;
  let studentName = 'NULL';
  let dataStatus = req.query.dataStatus;

  let parameter = `${pageNumber}/${pageSize}/${technologyID}/${universityCode}/${schoolID}/${courseID}/${studentID}/${studentName}/${dataStatus}`;

  service.queryWithParameter(parameter,  (result) => {
    if (result.err) {
      res.json({
        err: true,
        code: result.code,
        msg: result.msg
      });
    } else {
      let dataContent = commonService.buildRenderData('随堂习题列表', pageNumber, result);
      res.json({
        err: false,
        code: result.code,
        msg: result.msg,
        dataContent: dataContent
      });
    }
  });
});

module.exports = router;
