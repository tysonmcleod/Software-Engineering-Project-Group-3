var express = require('express');
var calendar = require('node-calendar');
var router = express.Router();

var year = new Date().getFullYear();
const currentMonthIndex = new Date().getMonth() + 1;


router.get('/', function(req, res, next) {
  currentMonth = new calendar.Calendar(1).monthdays2calendar(year, currentMonthIndex);
  res.render('index', { month: currentMonth, monthName: calendar.month_name[currentMonthIndex], monthNumber: currentMonthIndex });
});


router.post('/', function(req, res, next) {
  if(req.body.next) {
    month = calendarWrap(Number(req.body.next) + 1);
    currentMonth = new calendar.Calendar(1).monthdays2calendar(year, month);
    res.render('index', { month: currentMonth, monthName: calendar.month_name[month], monthNumber: month });
  } else if(req.body.previous && req.body.previous != currentMonthIndex) {
    month = calendarWrap(Number(req.body.previous) - 1);
    currentMonth = new calendar.Calendar(1).monthdays2calendar(year, month);
    res.render('index', { month: currentMonth, monthName: calendar.month_name[month], monthNumber: month });
  } else {
    res.redirect('/');
  }
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
