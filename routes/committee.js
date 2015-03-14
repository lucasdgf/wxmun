var express = require('express');
var router = express.Router();
var Parse = require('parse').Parse;

Parse.initialize('pY4jnhhdNKVRJjL0xGL9q4QQmsBbLXfPLpTMXPpx', 'oDLZE9iIj6GKD8mP8wY0cuBA1l37npMkjVEXn13P');

/* GET stats page. */
router.get('/:committee/stats', function(req, res, next) {
  // prepare for query
  var committeeCode = req.params.committee.toUpperCase();
  var committeeClass = Parse.Object.extend('Committee');
  var committeeQuery = new Parse.Query(committeeClass);

  // find committee
  committeeQuery.equalTo('code', committeeCode);
  committeeQuery.find({
    success: function(results) {
      // prepare for delegates query
      var committee = results[0];
      var delegateClass = Parse.Object.extend('Delegate');
      var delegateQuery = new Parse.Query(delegateClass);

      // find countries
      delegateQuery.containedIn('objectId', committee.get('delegates'));
      delegateQuery.find({
        success: function(countries) {
          countries = countries.sort(function(a, b) {
            return (a.get('name') > b.get('name')) ? 1 : -1;
          });

          var numberSessions = countries[0].get('attendance').length,
              gsl = committee.get('gsl');
          res.render('stats', { committee: committeeCode,
                                committeeName: committee.get('name'),
                                countries: countries,
                                expand: true,
                                gsl: gsl,
                                quorum: committee.get('quorum'),
                                quorumDelegates: committee.get('quorumDelegates'),
                                totalCountries: countries.length,
                                id: 'stats',
                                logs: countries,
                                numberSessions: numberSessions,
                                title: 'Stats' });
        },
        error: function(error) {
          alert('Error: ' + error.code + ' ' + error.message);
        }
      });
    },
    error: function(error) {
      console.log('Error: ' + error.code + ' ' + error.message);
    }
  });
});


/* POST log present and absent */
router.post('/:committee/logcountry/:countrycode/:attendance', function(req, res) {
  // prepare for query
  var committeeCode = req.params.committee.toUpperCase();
  var countryCode = req.params.countrycode;
  var delegateClass = Parse.Object.extend('Delegate');
  var delegateQuery = new Parse.Query(delegateClass);

  // find delegate
  delegateQuery.equalTo('committee', committeeCode);
  delegateQuery.equalTo('code', countryCode);
  delegateQuery.find({
    success: function(results) {
      var delegate = results[0];

      // attendance log object
      var attendance = {
        record: req.params.attendance,
        timestamp: Date.now()
      };

      // log attendance instance
      delegate.add('attendance', attendance);
      delegate.save();

      var committeeClass = Parse.Object.extend('Committee');
      var committeeQuery = new Parse.Query(committeeClass);
      committeeQuery.equalTo('code', committeeCode);

      committeeQuery.find({
        success: function(results) {
          var committee = results[0];

          // update attendance count
          committee.increment('attendanceCount');
          var attendanceCount = committee.get('attendanceCount');
          var present = (attendance.record == 'P') ? 1 : 0;
          var quorum;

          // in case this is the end of a rollcall
          if(attendanceCount >= committee.get('delegates').length) {
            attendanceCount = 0;
          }

          // restart quorum delegates array if applicable
          if(attendanceCount == 1) {
            quorum = present;
            committee.set('quorumDelegates', []);
          }
          else {
            quorum = committee.get('quorum') + present;
          }

          // add to quorum if present
          if(present) {
            committee.add('quorumDelegates', { code: countryCode,
                                               name: delegate.get('name') });
          }

          // update attendanceCount and quorum
          committee.set('attendanceCount', attendanceCount);
          committee.set('quorum', quorum);

          if(attendanceCount == 0) {
            // log quorum at the end of rollcall
            committee.add('quorumLog', quorum);
          }

          if(attendanceCount != 0) {
            res.redirect('');
          }

          committee.save();
        },
        error: function(error) {
          alert('Error: ' + error.code + ' ' + error.message);
        }
      });
    },
    error: function(error) {
      alert('Error: ' + error.code + ' ' + error.message);
    }
  });
});

/* POST add to GSL */
router.post('/:committee/addtogsl/:countrycode/:countryname', function(req, res) {
  // prepare for query
  var committeeCode = req.params.committee.toUpperCase();
  var countryCode = req.params.countrycode;
  var countryName = req.params.countryname;
  var committeeClass = Parse.Object.extend('Committee');
  var committeeQuery = new Parse.Query(committeeClass);

  // find committee
  committeeQuery.equalTo('code', committeeCode);
  committeeQuery.find({
    success: function(results) {
      var committee = results[0];
      committee.add('gsl', { code: countryCode,
                             name: countryName });
      committee.save();
      res.redirect('');
    },
    error: function(error) {
      console.log('Error: ' + error.code + ' ' + error.message);
    }
  });
});

/* POST remove from GSL */
router.post('/:committee/removegsl/:countrycode', function(req, res) {
  // prepare for query
  var committeeCode = req.params.committee.toUpperCase();
  var countryCode = req.params.countrycode;
  var committeeClass = Parse.Object.extend('Committee');
  var committeeQuery = new Parse.Query(committeeClass);

  // find committee
  committeeQuery.equalTo('code', committeeCode);
  committeeQuery.find({
    success: function(results) {
      var committee = results[0];
      committee.remove('gsl', committee.get('gsl')[0]);
      committee.save();
      res.redirect('');
    },
    error: function(error) {
      console.log('Error: ' + error.code + ' ' + error.message);
    }
  });
});

/* POST add to Quorum */
router.post('/:committee/addtoquorum/:countrycode/:countryname', function(req, res) {
  // prepare for query
  var committeeCode = req.params.committee.toUpperCase();
  var countryCode = req.params.countrycode;
  var countryName = req.params.countryname;
  var committeeClass = Parse.Object.extend('Committee');
  var committeeQuery = new Parse.Query(committeeClass);

  // find committee
  committeeQuery.equalTo('code', committeeCode);
  committeeQuery.find({
    success: function(results) {
      var committee = results[0];
      committee.add('quorumDelegates', { code: countryCode,
                                         name: countryName });
      committee.set('quorum', committee.get('quorum') + 1);
      committee.save();
      res.redirect('');
    },
    error: function(error) {
      console.log('Error: ' + error.code + ' ' + error.message);
    }
  });
});

/* GET roll call page. */
router.get('/:committee/rollcall', function(req, res, next) {
  // prepare for query
  var committeeCode = req.params.committee.toUpperCase();
  var committeeClass = Parse.Object.extend('Committee');
  var committeeQuery = new Parse.Query(committeeClass);

  // find committee
  committeeQuery.equalTo('code', committeeCode);
  committeeQuery.find({
    success: function(results) {
      // prepare for delegates query
      var committee = results[0];
      var delegateClass = Parse.Object.extend('Delegate');
      var delegateQuery = new Parse.Query(delegateClass);

      // find countries
      delegateQuery.containedIn('objectId', committee.get('delegates'));
      delegateQuery.find({
        success: function(countries) {
          countries = countries.sort(function(a, b) {
            return (a.get('name') > b.get('name')) ? 1 : -1;
          });

          var totalCountries = countries.length,
              quorum = committee.get('attendanceCount') ? committee.get('quorum') : 0,
              gsl = committee.get('gsl'),
              rollcallCountries = countries.slice(committee.get('attendanceCount'), totalCountries);

          res.render('rollcall', { committee: committee.get('code'),
                                   committeeName: committee.get('name'),
                                   countries: countries,
                                   gsl: gsl,
                                   quorum: quorum,
                                   quorumDelegates: committee.get('quorumDelegates'),
                                   rollcallCountries: rollcallCountries,
                                   totalCountries: totalCountries,
                                   expand: true,
                                   id: 'rollcall',
                                   title: 'Roll Call' });
        },
        error: function(error) {
          alert('Error: ' + error.code + ' ' + error.message);
        }
      });
    },
    error: function(error) {
      console.log('Error: ' + error.code + ' ' + error.message);
    }
  });
});

/* GET general speakers list page. */
router.get('/:committee/gsl', function(req, res, next) {
  // prepare for query
  var committeeCode = req.params.committee.toUpperCase();
  var committeeClass = Parse.Object.extend('Committee');
  var committeeQuery = new Parse.Query(committeeClass);

  // find committee
  committeeQuery.equalTo('code', committeeCode);
  committeeQuery.find({
    success: function(results) {
      // prepare for delegates query
      var committee = results[0];
      var delegateClass = Parse.Object.extend('Delegate');
      var delegateQuery = new Parse.Query(delegateClass);

      // find countries
      delegateQuery.containedIn('objectId', committee.get('delegates'));
      delegateQuery.find({
        success: function(countries) {
          countries = countries.sort(function(a, b) {
            return (a.get('name') > b.get('name')) ? 1 : -1;
          });

          var gsl = committee.get('gsl'),
              quorum = committee.get('quorum'),
              committeeName = committee.get('name'),
              quorumDelegates = committee.get('quorumDelegates');
          res.render('gsl', { committee: committee.get('code'),
                              committeeName: committeeName,
                              countries: countries,
                              gsl: gsl,
                              gslTime: committee.get('GSLtime'),
                              quorum: quorum,
                              quorumDelegates: quorumDelegates,
                              expand: false,
                              id: 'gsl',
                              title: 'General Speakers List' });
        },
        error: function(error) {
          alert('Error: ' + error.code + ' ' + error.message);
        }
      });
    },
    error: function(error) {
      console.log('Error: ' + error.code + ' ' + error.message);
    }
  });
});

/* GET general speakers list page. */
router.get('/:committee/motions', function(req, res, next) {
  var committee = req.params.committee;
  var db = req.db;
  var collection = db.get('committees');
  collection.findOne({ id: committee.toUpperCase() },{},function(e, docs) {
    var countries = docs.countries.country.sort(function(a, b) {
      return (a.name > b.name) ? 1 : ((a.name < b.name) ? -1 : 0);
    });
    var gsl = docs.gsl,
        quorum = docs.quorum,
        committeeName = docs.name,
        quorumDelegates = docs.quorumDelegates;
    res.render('motions', { committee: committee,
                        committeeName: committeeName,
                        countries: countries,
                        gsl: gsl,
                        gslTime: docs.GSLtime,
                        quorum: quorum,
                        quorumDelegates: quorumDelegates,
                        expand: true,
                        id: 'motions',
                        title: 'Motions' });
  });
});

module.exports = router;
