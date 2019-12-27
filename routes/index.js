var express = require('express');
var router = express.Router();
var Advertisement = require('../models/Advertisement');
const keyFile = require('../APIKey.json');
const GoogleAPIKey = keyFile.APIKey;
//const GoogleAPIKey = process.env.APIKey;
const googleMapsClient = require('@google/maps').createClient({
  key: GoogleAPIKey
});

router.get('/', function(req, res, next) {
  console.log(req.user);
  console.log(req.isAuthenticated());

  res.render('index', {today: getCurrentDate(), apiKey: GoogleAPIKey });
});


router.post('/', function(req, res, next) {
  console.log(req.body);
  res.render('index', {today: getCurrentDate(), apiKey: GoogleAPIKey });
});

router.get('/search', function(req, res, next) {


  let filter = {};

  console.log(req.query);

  const username = res.locals.user;
  console.log(filter)

  const test = req.query['to-dest'];
  if(req.query['from-dest'])
    filter.from = req.query['from-dest'];
    console.log("test= ")

  if(req.query['to-dest'])
    filter.to = req.query['to-dest'];

  if(req.query.date)
    filter.date = req.query.date;

  console.log("filter=" + filter);
  console.log(filter);


  Advertisement
  .find(filter)
  .sort('date')
  .sort('departure')
  .then(advertisements => {
    console.log(advertisements)
    res.render("index", {today: getCurrentDate(), apiKey: GoogleAPIKey, data: advertisements, username:username });
  })
  .catch(err => {
    res.json({
      confirmation: 'fail',
      message: err.message
    })
  });

});

function getCurrentDate() {
  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var dayIndex = date.getDate();

  if(dayIndex < 10) {
    var day = "0".concat(dayIndex.toString());
  } else {
    var day = dayIndex;
  }

  return(`${year}-${month}-${day}`);
}

module.exports = router;
