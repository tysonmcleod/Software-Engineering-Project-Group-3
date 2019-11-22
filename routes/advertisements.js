var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Advertisement = require('../models/Advertisement');
var User = require('../models/user');
var databaseConnection = require('../js/db')


User = User.model;


router.get('/', function(req, res, next) {
  res.render('create-ad', { title: 'Express', testString: 'We the best'});
});



router.post('/send-ad', function(req, res, next) {


  let awesome_user = new User({
    firstname:"per",
    lastname:"johansson",
    email: "perjohannson@it.se",
    username:"perjoh",
    password:"perra"
    });

  req.body.user = awesome_user;

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