let express = require('express');
let router = express.Router();

router.get('/', function(req, res, next) {
  res.render('login', { title: '管理中心登陆', layout: null });
});

module.exports = router;
