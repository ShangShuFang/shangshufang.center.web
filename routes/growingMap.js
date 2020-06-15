let express = require('express');
let router = express.Router();
let sysConfig = require('../config/sysConfig');
let commonService = require('../service/commonService');

router.get('/', function(req, res, next) {
  res.render('growingMap', { title: '成长路线' });
});

router.get('/dataList', (req, res, next) => {
  let service = new commonService.commonInvoke('growingMapList');
  let pageNumber = parseInt(req.query.pageNumber);

  let parameter = `${pageNumber}/${sysConfig.pageSize}`;

  service.queryWithParameter(parameter,  (result) => {
    if (result.err) {
      res.json({
        err: true,
        code: result.code,
        msg: result.msg
      });
    } else {
      let dataContent = commonService.buildRenderData('研发方向', pageNumber, result);
      res.json({
        err: false,
        code: result.code,
        msg: result.msg,
        dataContent: dataContent
      });
    }
  });
});

router.delete('/delete', (req, res, next) => {
  let service = new commonService.commonInvoke('detailGrowingMap');
  let growingID = req.query.growingID;

  service.delete(growingID, function (result) {
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