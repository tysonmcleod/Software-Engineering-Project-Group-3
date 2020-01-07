var express = require('express');
var router = express.Router();
var Advertisement = require('../models/Advertisement');
const keyFile = require('../APIkey.json');
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
