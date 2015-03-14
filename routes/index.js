var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET committee list */
router.get('/committees', function(req, res, next) {
  var db = req.db;
  var collection = db.get('committees');

  collection.find({},{},function(e,docs){
    res.render('committees', {
      committees : docs
    });
  });
});

module.exports = router;
