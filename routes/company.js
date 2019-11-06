let express = require('express');
let router = express.Router();

router.get('/', function(req, res, next) {
  res.render('company', { title: '合作企业' });
});

module.exports = router;
