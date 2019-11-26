var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Advertisement = require('../models/Advertisement');
var User = require('../models/user');


User = User.model;


router.get('/', function(req, res, next) {
  res.render('create-ad', { title: 'Express', testString: 'We the best'});
});



router.post('/send-ad', function(req, res, next) {


  let awesome_driver = new User({
    firstname:"per",
    lastname:"johansson",
    email: "perjohannson@it.se",
    username:"perjoh",
    password:"perra"
    });

  let awesome_rider = new User({
    firstname:"johnny",
    lastname:"johansson",
    email: "johjohannson@it.se",
    username:"johjoh",
    password:"johnny"
    });

  req.body.driver = awesome_driver;
  req.body.riders = [awesome_rider];

  Advertisement.create(req.body)
  .then(advertisement => {
    res.json({
      confirmation: 'success',
      data: advertisement
    })
    .catch(err => {
      res.json({
        confirmation: 'fail',
        message: err.message
      })
    })
  })
});

module.exports = router;