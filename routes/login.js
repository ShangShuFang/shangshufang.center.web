let express = require('express');
let router = express.Router();
let commonService = require('../service/commonService');

router.get('/', function(req, res, next) {
  res.render('login', { title: '管理中心登陆', layout: null });
});

router.post('/', function (req, res, next) {
  let service = new commonService.commonInvoke('login');
  let param =`${req.body.cellphone}/${req.body.password}`;

  service.queryWithParameter(param, function (result) {
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
        customerInfo: result.content.responseData
      });
    }
  })
});

module.exports = router;
