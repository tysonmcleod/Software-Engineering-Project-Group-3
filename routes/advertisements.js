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
	const from = req.body.from;
	const to = req.body.to;
	const username = req.body.username;

	req.checkBody('from', 'Your from is required').notEmpty();
	req.checkBody('to', 'Your to is required').notEmpty();
	req.checkBody('username', 'A valid username is required').notEmpty();

	let errors = req.validationErrors();

	let awesome_user = new User({
  	firstname:"per",
   	lastname:"johansson",
   	email: "perjohannson@it.se",
   	username:"perjoh",
   	password:"perra"
  	});

  if(errors){
    res.render('/api', {
      errors:errors
    });
  } else{
    let newAd = new Advertisement({
      from: from,
      to: to,
      user: awesome_user
    });

    newAd.save(function(err){
          if(err){
            console.log(err);
            return;
          }else {
            req.flash('success', 'you are now registered go login lol');
            res.redirect('/advertisements');
          }
        });
  	}
});

module.exports = router;