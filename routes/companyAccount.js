let express = require('express');
let router = express.Router();

router.get('/', function(req, res, next) {
  res.render('companyAccount', { title: '合作企业管理员账户' });
});

module.exports = router;
