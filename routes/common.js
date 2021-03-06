let express = require('express');
let router = express.Router();
let commonService = require('../service/commonService');

router.get('/chinaRegion', (req, res, next) => {
  let service = new commonService.commonInvoke('chinaRegion');
  let parentCode = req.query.parentCode === undefined ? 0 : req.query.parentCode;

  service.queryWithParameter(parentCode,  (result) => {
    if (result.err) {
      res.json({
        err: true,
        code: result.code,
        msg: result.msg
      });
    } else {
      res.json({
        err: false,
        code: result.code,
        msg: result.msg,
        dataList: result.content.responseData
      });
    }
  });
});

router.get('/university', (req, res, next) => {
  let service = new commonService.commonInvoke('universityList');
  let parameter = '1/9999/0/0/NULL';

  service.queryWithParameter(parameter,  (result) => {
    if (result.err) {
      res.json({
        err: true,
        code: result.code,
        msg: result.msg
      });
    } else {
      res.json({
        err: false,
        code: result.code,
        msg: result.msg,
        dataList: result.content.responseData
      });
    }
  });
});

router.get('/school', (req, res, next) => {
  let service = new commonService.commonInvoke('schoolList');
  let universityCode = req.query.universityCode;
  let parameter = `1/9999/${universityCode}/NULL`;

  service.queryWithParameter(parameter,  (result) => {
    if (result.err) {
      res.json({
        err: true,
        code: result.code,
        msg: result.msg
      });
    } else {
      res.json({
        err: false,
        code: result.code,
        msg: result.msg,
        dataList: result.content.responseData
      });
    }
  });
});

router.get('/major', (req, res, next) => {
  let service = new commonService.commonInvoke('majorList');
  let universityCode = req.query.universityCode;
  let schoolID = req.query.schoolID;
  let parameter = `1/9999/${universityCode}/${schoolID}`;

  service.queryWithParameter(parameter,  (result) => {
    if (result.err) {
      res.json({
        err: true,
        code: result.code,
        msg: result.msg
      });
    } else {
      res.json({
        err: false,
        code: result.code,
        msg: result.msg,
        dataList: result.content.responseData
      });
    }
  });
});

router.get('/programmingLanguage', function(req, res, next) {
  let service = new commonService.commonInvoke('programmingLanguage');

  service.queryWithParameter('', function(result) {
    if (result.err) {
      res.json({
        err: true,
        code: result.code,
        msg: result.msg
      });
    } else {
      res.json({
        err: false,
        code: result.code,
        msg: result.msg,
        dataList: result.content.responseData
      });
    }
  });
});

router.get('/company', (req, res, next) => {
  let service = new commonService.commonInvoke('companyList');
  let parameter = `1/9999/0/0/NULL`;

  service.queryWithParameter(parameter,  (result) => {
    if (result.err) {
      res.json({
        err: true,
        code: result.code,
        msg: result.msg
      });
    } else {
      res.json({
        err: false,
        code: result.code,
        msg: result.msg,
        dataList: result.content.responseData
      });
    }
  });
});

router.get('/technology', (req, res, next) => {
  let service = new commonService.commonInvoke('technologyList');
  let parameter = `1/9999/0/0/NULL`;

  service.queryWithParameter(parameter,  (result) => {
    if (result.err) {
      res.json({
        err: true,
        code: result.code,
        msg: result.msg
      });
    } else {
      res.json({
        err: false,
        code: result.code,
        msg: result.msg,
        dataList: result.content.responseData
      });
    }
  });
});

router.get('/knowledge', (req, res, next) => {
  let service = new commonService.commonInvoke('knowledgeSimpleList');
  let technologyID = req.query.technologyID;
  service.queryWithParameter(technologyID,  (result) => {
    if (result.err) {
      res.json({
        err: true,
        code: result.code,
        msg: result.msg
      });
    } else {
      res.json({
        err: false,
        code: result.code,
        msg: result.msg,
        dataList: result.content.responseData
      });
    }
  });
});

router.get('/direction', (req, res, next) => {
  let service = new commonService.commonInvoke('directionList');
  let parameter = `1/9999/NULL`;

  service.queryWithParameter(parameter,  (result) => {
    if (result.err) {
      res.json({
        err: true,
        code: result.code,
        msg: result.msg
      });
    } else {
      res.json({
        err: false,
        code: result.code,
        msg: result.msg,
        dataList: result.content.responseData
      });
    }
  });
});

router.get('/category', (req, res, next) => {
  let service = new commonService.commonInvoke('technologyCategoryList');
  let directionID = parseInt(req.query.directionID);

  let parameter = `1/9999/${directionID}/NULL`;

  service.queryWithParameter(parameter,  (result) => {
    if (result.err) {
      res.json({
        err: true,
        code: result.code,
        msg: result.msg
      });
    } else {
      res.json({
        err: false,
        code: result.code,
        msg: result.msg,
        dataList: result.content.responseData
      });
    }
  });
});

router.get('/learningPhase', (req, res, next) => {
  let technologyID = req.query.technologyID;
  let service = new commonService.commonInvoke('learningPhase');

  service.queryWithParameter(technologyID,  (result) => {
    if (result.err) {
      res.json({
        err: true,
        code: result.code,
        msg: result.msg
      });
    } else {
      res.json({
        err: false,
        code: result.code,
        msg: result.msg,
        dataList: result.content.responseData
      });
    }
  });
});

router.get('/course', (req, res, next) => {
	let service = new commonService.commonInvoke('courseSimpleList');
	let universityCode = req.query.universityCode;
	let schoolID = req.query.schoolID;
	let teacherID = req.query.teacherID;
	let technologyID = req.query.technologyID;
	let parameter = `${universityCode}/${schoolID}/${teacherID}/${technologyID}`;

  service.queryWithParameter(parameter,  (result) => {
    if (result.err) {
      res.json({
        err: true,
        code: result.code,
        msg: result.msg
      });
    } else {
      res.json({
        err: false,
        code: result.code,
        msg: result.msg,
        dataList: result.content.responseData
      });
    }
  });
});

module.exports = router;
