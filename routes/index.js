let express = require('express');
let router = express.Router();

router.get('/', function(req, res, next) {
  res.render('index', { title: '管理中心主页' });
});

module.exports = router;
