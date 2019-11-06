let express = require('express');
let router = express.Router();
let commonService = require('../service/commonService');

router.get('/chinaRegion', (req, res, next) => {
  let service = new commonService.commonInvoke('chinaRegion');
  let parentCode = req.query.parentCode === undefined ? 0 : req.query.parentCode;

  service.queryWithParameter(parentCode,  (result) => {
    if (result.err || !result.content.result) {
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
