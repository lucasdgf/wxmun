var express = require('express');
var router = express.Router();
var Parse = require('parse').Parse;

Parse.initialize('pY4jnhhdNKVRJjL0xGL9q4QQmsBbLXfPLpTMXPpx', 'oDLZE9iIj6GKD8mP8wY0cuBA1l37npMkjVEXn13P');

/* GET home page. */
router.get('/', function(req, res, next) {
  // prepare for query
  var committeeClass = Parse.Object.extend('Committee');
  var committeeQuery = new Parse.Query(committeeClass);

  // find committees
  committeeQuery.find({
    success: function(results) {
      var committees = results.map(function(committee){
        return { name: committee.get('name'),
                 code: committee.get('code') } });
      res.render('index', { committees: committees,
                            title: 'wXMUN'});
    },
    error: function(error) {
      console.log('Error: ' + error.code + ' ' + error.message);
    }
  });
});

module.exports = router;
