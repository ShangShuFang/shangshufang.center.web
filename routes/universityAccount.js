let express = require('express');
let router = express.Router();

router.get('/', function(req, res, next) {
  res.render('universityAccount', { title: '合作高校管理员账户' });
});

module.exports = router;
