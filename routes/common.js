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
  let service = new commonService.commonInvoke('university');
  let parameter = '1/9999/0/0';

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
