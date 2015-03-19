var express = require('express');
var router = express.Router();
var Parse = require('parse').Parse;

Parse.initialize('pY4jnhhdNKVRJjL0xGL9q4QQmsBbLXfPLpTMXPpx', 'oDLZE9iIj6GKD8mP8wY0cuBA1l37npMkjVEXn13P');

/* Redirect committee page to motions */
router.get('/:committee', function(req, res, next) {
  res.redirect('/committee/' + req.params.committee + '/motions');
});

/* Stats Page */
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
      delegateQuery.limit(200);

      // find countries
      delegateQuery.containedIn('objectId', committee.get('delegates'));
      delegateQuery.find({
        success: function(countries) {
          countries = countries.sort(function(a, b) {
            return (a.get('name') > b.get('name')) ? 1 : -1;
          });

          var notNGOs = countries.filter(function(country) {
            return country.get('code').indexOf('NGO') <= -1;
          }).map(function(country) {
             return country.get('attendance') ? country.get('attendance').length : 0;
          });

          var numberSessions =  Math.max.apply(null, notNGOs),
              gsl = committee.get('gsl');

          countries.map(function(country) {
            var attendance = 0;
            country.get('attendance').map(function(session) {
              attendance += (session.record == 'P' ? 1 : 0);
            });

            if(country.get('attendance')) {
              if(country.get('attendance').length) {
                country.set('attendancePerc', attendance / country.get('attendance').length);
              }
              else {
                country.set('attendancePerc', 0);
              }
            }
            else {
              country.set('attendancePerc', 'NA');
            }
          });

          var motions = {};
          committee.get('caucus').map(function(caucus) {
            if(!motions[caucus.proposer]) {
              motions[caucus.proposer] = 1;
            }
            else {
              motions[caucus.proposer] += 1;
            }
          });

          res.render('stats', { committee: committeeCode,
                                committeeName: committee.get('name'),
                                countries: countries,
                                expand: true,
                                gsl: gsl,
                                motions: motions,
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

/* Attendance logging */
router.post('/:committee/logcountry/:countrycode/:attendance', function(req, res) {
  // prepare for query
  var committeeCode = req.params.committee.toUpperCase();
  var countryCode = req.params.countrycode;
  var delegateClass = Parse.Object.extend('Delegate');
  var delegateQuery = new Parse.Query(delegateClass);
  delegateQuery.limit(200);

  // find delegate
  if(countryCode.indexOf("NGO") <= -1) {
    delegateQuery.equalTo('committee', committeeCode);
  }

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

          committee.set('quorum', quorum);
          committee.save();

          // in case this is the end of a rollcall
          if(attendanceCount >= committee.get('delegates').length) {
            attendanceCount = 0;
            committee.set('attendanceCount', 0);
          }

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

/* Add delegate to GSL */
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

/* Remove delegate from GSL */
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
      var gsl = committee.get('gsl').filter(function(country){ return country.code != countryCode });
      committee.set('gsl', gsl);
      committee.save();
      res.redirect('');
    },
    error: function(error) {
      console.log('Error: ' + error.code + ' ' + error.message);
    }
  });
});

/* Add delegate to Quorum */
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

/* Rollcall page */
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
      delegateQuery.limit(200);

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

/* GSL page */
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
      delegateQuery.limit(200);

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

/* Motions page */
router.get('/:committee/motions', function(req, res, next) {
  // prepare for query
  var committeeCode = req.params.committee.toUpperCase();
  var committeeClass = Parse.Object.extend('Committee');
  var committeeQuery = new Parse.Query(committeeClass);

  // find committee
  committeeQuery.equalTo('code', committeeCode);
  committeeQuery.find({
    success: function(results) {
      var committee = results[0];
      var quorumDelegates = committee.get('quorumDelegates').sort(function(a, b) {
        return (a.name > b.name) ? 1 : ((a.name < b.name) ? -1 : 0);
      });

      var quorum = committee.get('quorum'),
          committeeName = committee.get('name'),
          quorumDelegates = quorumDelegates;
      res.render('motions', { committee: committeeCode,
                              committeeName: committeeName,
                              countries: committee.get('delegates'),
                              gsl: committee.get('gsl'),
                              quorum: quorum,
                              quorumDelegates: quorumDelegates,
                              expand: true,
                              id: 'motions',
                              title: 'Motions' });
    },
    error: function(error) {
      console.log('Error: ' + error.code + ' ' + error.message);
    }
  });
});

/* Moderated caucus page */
router.get('/:committee/moderated/:country/:totaltime/:timeperspeaker', function(req, res, next) {
  // prepare for query
  var committeeCode = req.params.committee.toUpperCase();
  var countryCode = req.params.country;
  var totalTime = req.params.totaltime;
  var timePerSpeaker = req.params.timeperspeaker;
  var committeeClass = Parse.Object.extend('Committee');
  var committeeQuery = new Parse.Query(committeeClass);

  // find committee
  committeeQuery.equalTo('code', committeeCode);
  committeeQuery.find({
    success: function(results) {
      // prepare for delegates query
      var committee = results[0],
          quorum = committee.get('quorum'),
          committeeName = committee.get('name'),
          quorumDelegates = committee.get('quorumDelegates');

      res.render('moderated', { committee: committee.get('code'),
                                committeeName: committeeName,
                                quorum: quorum,
                                quorumDelegates: quorumDelegates,
                                timePerSpeaker: timePerSpeaker,
                                totalTime: totalTime,
                                expand: false,
                                id: 'motions',
                                title: 'Moderated Caucus' });
    },
    error: function(error) {
      console.log('Error: ' + error.code + ' ' + error.message);
    }
  });
});

/* Unmoderated caucus page */
router.get('/:committee/unmoderated/:country/:time', function(req, res, next) {
  // prepare for query
  var committeeCode = req.params.committee.toUpperCase();
  var countryCode = req.params.country;
  var caucusTime = req.params.time;
  var committeeClass = Parse.Object.extend('Committee');
  var committeeQuery = new Parse.Query(committeeClass);

  // find committee
  committeeQuery.equalTo('code', committeeCode);
  committeeQuery.find({
    success: function(results) {
      var committee = results[0];
      committee.add('caucus', { type: 'Unmoderated Caucus',
                                proposer: countryCode,
                                time: caucusTime,
                              });
      committee.save();
      res.render('unmoderated', { committee: committeeCode,
                                  committeeName: committee.get('name'),
                                  expand: true,
                                  quorum: committee.get('quorum'),
                                  time: caucusTime,
                                  totalCountries: committee.get('delegates').length,
                                  id: 'motions',
                                  title: 'Unmoderated Caucus' });
    },
    error: function(error) {
      console.log('Error: ' + error.code + ' ' + error.message);
    }
  });
});

/* Consultation of the whole page */
router.get('/:committee/consultation/:country/:time', function(req, res, next) {
  // prepare for query
  var committeeCode = req.params.committee.toUpperCase();
  var countryCode = req.params.country;
  var caucusTime = req.params.time;
  var committeeClass = Parse.Object.extend('Committee');
  var committeeQuery = new Parse.Query(committeeClass);

  // find committee
  committeeQuery.equalTo('code', committeeCode);
  committeeQuery.find({
    success: function(results) {
      var committee = results[0];
      committee.add('caucus', { type: 'Consultation of the Whole',
                                proposer: countryCode,
                                time: caucusTime,
                              });
      committee.save();
      res.render('consultation', { committee: committeeCode,
                                  committeeName: committee.get('name'),
                                  expand: true,
                                  quorum: committee.get('quorum'),
                                  time: caucusTime,
                                  totalCountries: committee.get('delegates').length,
                                  id: 'motions',
                                  title: 'Consultation of the Whole' });
    },
    error: function(error) {
      console.log('Error: ' + error.code + ' ' + error.message);
    }
  });
});

/* Generic text box page */
router.get('/:committee/notes', function(req, res, next) {
  // prepare for query
  var committeeCode = req.params.committee.toUpperCase();
  var committeeClass = Parse.Object.extend('Committee');
  var committeeQuery = new Parse.Query(committeeClass);

  // find committee
  committeeQuery.equalTo('code', committeeCode);
  committeeQuery.find({
    success: function(results) {
      var committee = results[0],
          notes = committee.get('notes').reverse();

      res.render('notes', { committee: committeeCode,
                            committeeName: committee.get('name'),
                            expand: true,
                            notes: notes,
                            quorum: committee.get('quorum'),
                            totalCountries: committee.get('delegates').length,
                            id: 'notes',
                            title: 'Committee Notes' });
    },
    error: function(error) {
      console.log('Error: ' + error.code + ' ' + error.message);
    }
  });
});

/* Save note */
router.post('/:committee/addnote', function(req, res) {
  // prepare for query
  var committeeCode = req.params.committee.toUpperCase();
  var committeeClass = Parse.Object.extend('Committee');
  var committeeQuery = new Parse.Query(committeeClass);

  // find committee
  committeeQuery.equalTo('code', committeeCode);
  committeeQuery.find({
    success: function(results) {
      var committee = results[0];
      committee.add('notes', req.body.note);
      committee.save();
      res.redirect('');
    },
    error: function(error) {
      console.log('Error: ' + error.code + ' ' + error.message);
    }
  });
});

/* Generic timer page */
router.get('/:committee/timer', function(req, res, next) {
  // prepare for query
  var committeeCode = req.params.committee.toUpperCase();
  var committeeClass = Parse.Object.extend('Committee');
  var committeeQuery = new Parse.Query(committeeClass);

  // find committee
  committeeQuery.equalTo('code', committeeCode);
  committeeQuery.find({
    success: function(results) {
      var committee = results[0];

      res.render('timer', { committee: committeeCode,
                            committeeName: committee.get('name'),
                            expand: true,
                            quorum: committee.get('quorum'),
                            totalCountries: committee.get('delegates').length,
                            id: 'timer',
                            title: 'Committee Timer' });
    },
    error: function(error) {
      console.log('Error: ' + error.code + ' ' + error.message);
    }
  });
});

module.exports = router;
