let express = require('express');
let router = express.Router();
let sysConfig = require('../config/sysConfig');
let commonService = require('../service/commonService');

router.get('/', function(req, res, next) {
  res.render('growingMapEdit', { title: '成长路线编辑' });
});

router.get('/list/learningPhase', (req, res, next) => {
  let service = new commonService.commonInvoke('allLearningPhase');

  service.queryWithParameter('',  (result) => {
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

router.get('/any', (req, res, next) => {
  let service = new commonService.commonInvoke('growingMap');
  let growingID = req.query.growingID;

  service.queryWithParameter(growingID,  (result) => {
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
        detail: result.content.responseData
      });
    }
  });
});

router.get('/list/learningPhase/chose', (req, res, next) => {
  let service = new commonService.commonInvoke('growingMapChoseList');
  let growingID = req.query.growingID;
  service.queryWithParameter(growingID,  (result) => {
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

router.post('/', (req, res, next) => {
  let service = new commonService.commonInvoke('saveGrowingMap');
  let data = {
    growingID: req.body.growingID,
    growingTarget: req.body.growingTarget,
    targetMemo: req.body.targetMemo,
    detailJson: req.body.detailJson,
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