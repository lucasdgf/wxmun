var express = require('express');
var router = express.Router();

/* GET stats page. */
router.get('/:committee/stats', function(req, res, next) {
  var committee = req.params.committee;
  var db = req.db;
  var collection = db.get('committees');
  collection.findOne({ id: committee.toUpperCase() },{},function(e, docs) {
    var countries = docs.countries.country.sort(function(a, b) {
      return (a.name > b.name) ? 1 : ((a.name < b.name) ? -1 : 0);
    });

    var logCollection = db.get(committee);
    logCollection.find({},{},function(err, logs) {
      logs = logs.sort(function(a, b) {
        return (a.name > b.name) ? 1 : ((a.name < b.name) ? -1 : 0);
      });

      var numberSessions = logs[0].attendance.length,
          gsl = docs.gsl;
      res.render('stats', { committee: committee,
                            committeeName: docs.name,
                            countries: countries,
                            expand: true,
                            gsl: gsl,
                            quorum: docs.quorum,
                            quorumCountries: docs.quorumCountries,
                            totalCountries: logs.length,
                            id: 'stats',
                            logs: logs,
                            numberSessions: numberSessions,
                            title: 'Stats' });
    });
  });
});


/* POST log present and absent */
router.post('/:committee/logcountry/:countrycode/:attendance', function(req, res) {
  var committee = req.params.committee;
  var countryCode = req.params.countrycode;
  var db = req.db;

  // attendance log object
  var attendance = {
    record: req.params.attendance,
    timestamp: Date.now()
  };

  // update attendance count
  db.get('committees').findOne({id: committee.toUpperCase()},{},function(err, docs) {
    // update attendance count
    var attendanceCount = docs.attendanceCount + 1;
    var present = (attendance.record == 'P') ? 1 : 0;

    // in case this is the end of a rollcall
    if(attendanceCount >= /*docs.countries.country.length*/5) {
      attendanceCount = 0;
    }

    var quorum;

    // restart quorum countries array if applicable
    if(attendanceCount == 1) {
      quorum = present;
      db.get('committees').update(
        { id: committee.toUpperCase() },
        { $set: { 'quorumCountries': (present ? [countryCode] : []) } }
      );
    } else {
      quorum = docs.quorum + present;

      // add to quorum if present
      if(present) {
        db.get('committees').update(
          { id: committee.toUpperCase () },
          { $push: { 'quorumCountries': countryCode } }
        );
      }
    }

    // log attendance instance
    db.get(committee).update(
      { code: countryCode },
      { $push: { 'attendance': attendance } }
    );

    // update attendanceCount and quorum
    db.get('committees').update(
      { id: committee.toUpperCase() },
      { $set: {
        'attendanceCount': attendanceCount,
        'quorum': quorum
      } }
    );

    if(attendanceCount == 0) {
      // log quorum at the end of rollcall
      db.get('committees').update(
        { id: committee.toUpperCase() },
        { $push: { 'quorumLog': quorum } }
      );
    }

    if(attendanceCount != 0) {
      res.redirect('');
    }
  });
});

/* POST add to GSL */
router.post('/:committee/addtogsl/:countrycode', function(req, res) {
  var committee = req.params.committee;
  var countryCode = req.params.countrycode;
  var db = req.db;

  // update gsl
  db.get(committee).findOne({code: countryCode},{},function(err, country) {
    db.get('committees').update(
      { id: committee.toUpperCase() },
      { $push: { 'gsl': country } }
    );
    res.redirect('');
  });
});

/* POST remove from GSL */
router.post('/:committee/removegsl/:countrycode', function(req, res) {
  var committee = req.params.committee;
  var countryCode = req.params.countrycode;
  var db = req.db;

  // update gsl
  db.get(committee).findOne({code: countryCode},{},function(err, country) {
    db.get('committees').update(
      { id: committee.toUpperCase() },
      { $pull: { 'gsl': { 'code': countryCode } } }
    );
    res.redirect('');
  });
});

/* GET roll call page. */
router.get('/:committee/rollcall', function(req, res, next) {
  // get committee table
  var committee = req.params.committee;
  var db = req.db;
  var countryCollection = db.get(committee);

  // get countries in that committee
  countryCollection.find({},{},function(err, docs){
    var countries = docs.sort(function(a, b) {
      return (a.name > b.name) ? 1 : ((a.name < b.name) ? -1 : 0);
    });

    // resume rollcall if applicable
    db.get('committees').findOne({},{},function(e, committeeData){
      var totalCountries = countries.length,
          quorum = committeeData.attendanceCount ? committeeData.quorum : 0,
          gsl = committeeData.gsl;

      var rollCallCountries = countries.slice(committeeData.attendanceCount, totalCountries);
      res.render('rollcall', { committee: committee,
                               committeeName: committeeData.name,
                               countries: countries,
                               gsl: gsl,
                               quorum: quorum,
                               quorumCountries: committeeData.quorumCountries,
                               rollCallCountries: rollCallCountries,
                               totalCountries: totalCountries,
                               expand: true,
                               id: 'rollcall',
                               title: 'Roll Call' });
    });
  });
});

/* GET general speakers list page. */
router.get('/:committee/gsl', function(req, res, next) {
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
        quorumCountries = docs.quorumCountries;
    res.render('gsl', { committee: committee,
                        committeeName: committeeName,
                        countries: countries,
                        gsl: gsl,
                        gslTime: docs.GSLtime,
                        quorum: quorum,
                        quorumCountries: quorumCountries,
                        expand: false,
                        id: 'gsl',
                        title: 'General Speakers List' });
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
        quorumCountries = docs.quorumCountries;
    res.render('motions', { committee: committee,
                        committeeName: committeeName,
                        countries: countries,
                        gsl: gsl,
                        gslTime: docs.GSLtime,
                        quorum: quorum,
                        quorumCountries: quorumCountries,
                        expand: true,
                        id: 'motions',
                        title: 'Motions' });
  });
});

module.exports = router;
