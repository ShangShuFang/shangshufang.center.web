const express = require('express');
const router = express.Router();
const sysConfig = require('../config/sysConfig');
const parameterUtils = require('../common/parameterUtils');
const commonService = require('../service/commonService');

router.get('/', function (req, res, next) {
  res.render('technologyCategory', {title: '研发技术分类'});
});

router.get('/dataList', (req, res, next) => {
  let service = new commonService.commonInvoke('technologyCategoryList');
  let pageNumber = parseInt(req.query.pageNumber);
  let directionID = parseInt(req.query.directionID);

  let parameter = `${pageNumber}/${sysConfig.pageSize}/${directionID}/NULL`;

  service.queryWithParameter(parameter, (result) => {
    if (result.err) {
      res.json({
        err: true,
        code: result.code,
        msg: result.msg
      });
    } else {
      let dataContent = commonService.buildRenderData('研发技术分类', pageNumber, result);
      res.json({
        err: false,
        code: result.code,
        msg: result.msg,
        dataContent: dataContent
      });
    }
  });
});

router.get('/check/name', function (req, res, next) {
  let service = new commonService.commonInvoke('checkTechnologyCategoryNameExist');
  let directionID = req.query.directionID;
  let categoryName = parameterUtils.convertSpecialChar(req.query.categoryName);
  let parameter = `${directionID}/${categoryName}`;

  service.queryWithParameter(parameter, function (result) {
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
        exist: result.content.responseData
      });
    }
  });
});

router.post('/', (req, res, next) => {
  const service = new commonService.commonInvoke('addTechnologyCategory');
  const data = {
    directionID: req.body.directionID,
    technologyCategoryName: req.body.technologyCategoryName,
    loginUser: req.body.loginUser
  };

  service.create(data, (result) => {
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
        msg: result.msg
      });
    }
  });
});

router.put('/', (req, res, next) => {
  let service = new commonService.commonInvoke('changeTechnologyCategory');
  let data = {
    technologyCategoryID: req.body.technologyCategoryID,
    directionID: req.body.directionID,
    technologyCategoryName: req.body.technologyCategoryName,
    loginUser: req.body.loginUser
  };

  service.change(data, (result) => {
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
        msg: result.msg
      });
    }
  });
});

router.put('/status', (req, res, next) => {
  let service = new commonService.commonInvoke('changeTechnologyCategoryStatus');
  let data = {
    technologyCategoryID: req.body.technologyCategoryID,
    directionID: req.body.directionID,
    dataStatus: req.body.status,
    loginUser: req.body.loginUser
  };

  service.change(data, (result) => {
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
        msg: result.msg
      });
    }
  });
});

router.delete('/', (req, res, next) => {
  let service = new commonService.commonInvoke('deleteTechnologyCategory');
  let directionID = req.query.directionID;
  let technologyCategoryID = req.query.technologyCategoryID;
  let parameter = `${directionID}/${technologyCategoryID}`;

  service.delete(parameter, function (result) {
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
        msg: result.msg
      });
    }
  });
});

module.exports = router;