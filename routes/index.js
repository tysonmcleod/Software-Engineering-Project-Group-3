var express = require('express');
var calendar = require('node-calendar');
var router = express.Router();

var year = new Date().getFullYear();
const currentMonthIndex = new Date().getMonth() + 1;

const keyFile = require('../APIKey.json');
const GoogleAPIKey = keyFile.APIKey;
const googleMapsClient = require('@google/maps').createClient({
  key: GoogleAPIKey
});

router.get('/', function(req, res, next) {
  console.log(req.user);
  console.log(req.isAuthenticated());

  googleMapsClient.findPlace({
    input: 'Museum',
    inputtype: 'textquery',
    language: 'sv'
  }, function(err, response) {
    console.log(response.json.candidates);
  });

  currentMonth = new calendar.Calendar(1).monthdays2calendar(year, currentMonthIndex);
  res.render('index', { month: currentMonth, monthName: calendar.month_name[currentMonthIndex], monthNumber: currentMonthIndex, apiKey: GoogleAPIKey });
});


router.post('/', function(req, res, next) {
  if(req.body.next) {
    month = calendarWrap(Number(req.body.next) + 1);
    currentMonth = new calendar.Calendar(1).monthdays2calendar(year, month);
    res.render('index', { month: currentMonth, monthName: calendar.month_name[month], monthNumber: month, apiKey: GoogleAPIKey });
  } else if(req.body.previous && req.body.previous != currentMonthIndex) {
    month = calendarWrap(Number(req.body.previous) - 1);
    currentMonth = new calendar.Calendar(1).monthdays2calendar(year, month);
    res.render('index', { month: currentMonth, monthName: calendar.month_name[month], monthNumber: month, apiKey: GoogleAPIKey });
  } else {
    res.redirect('/');
  }
});

router.get('/book', function(req, res){
  res.render('book');
});

router.get('/offer', function(req, res){
  res.render('offer');
});

// Function for handling change of year
function calendarWrap(month) {
  if(month == 13) {
    year = year + 1;
    return(1);
  } else if(month == 0) {
    year = year - 1;
    return(12);
  } else {
    return(month);
  }
}

module.exports = router;
