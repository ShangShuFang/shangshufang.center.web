let express = require('express');
let router = express.Router();

router.get('/', function(req, res, next) {
  res.render('school', { title: '二级学院' });
});

module.exports = router;
