let express = require('express');
let router = express.Router();
let sysConfig = require('../config/sysConfig');
let commonService = require('../service/commonService');

router.get('/', function(req, res, next) {
  res.render('student', { title: '学生列表' });
});

router.get('/dataList', (req, res, next) => {
  let service = new commonService.commonInvoke('studentList');
  let pageNumber = req.query.pageNumber;
  let pageSize = sysConfig.pageSize;
  let universityCode = req.query.universityCode;
  let schoolID = req.query.schoolID;
  let majorID = req.query.majorID;
  let fullName = req.query.fullName.length === 0 ? 'NULL' : req.query.fullName;
  let parameter = `${pageNumber}/${pageSize}/${universityCode}/${schoolID}/${majorID}/${fullName}`;

  service.queryWithParameter(parameter,  (result) => {
    if (result.err) {
      res.json({
        err: true,
        code: result.code,
        msg: result.msg
      });
    } else {
      let dataContent = commonService.buildRenderData('学生列表', pageNumber, result);
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
