var express = require('express');
var calendar = require('node-calendar')
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  currentMonth = new calendar.Calendar(1).monthdays2calendar(2019, 11);
  res.render('index', { title: 'Express', testString: 'NOT SENT', month: currentMonth });
});

router.post('/', function(req, res, next) {
  currentMonth = new calendar.Calendar(1).monthdays2calendar(2019, 11);
  res.render('index', { title: 'Express', testString: 'SENT', month: currentMonth });
});


router.get('/book', function(req, res){
  res.render('book');
})

router.get('/offer', function(req, res){
  res.render('offer');
})


module.exports = router;
