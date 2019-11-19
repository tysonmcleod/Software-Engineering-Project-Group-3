var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Advertisment = require('../models/Advertisement');
var User = require('../models/user');
var databaseConnection = require('../js/db')

User = User.model;

db = databaseConnection.openDataBaseConnection();

db.once('open', function(callback) {
	//The code in this asynchronous callback block is executed after connecting to MongoDB. 
	    console.log('Successfully connected to MongoDB.');
	});

var awesome_user = new User({
	firstname:"per",
 	lastname:"johansson",
 	email: "perjohannson@it.se",
 	username:"perjoh",
 	password:"perra"
});

var awesome_ride = new Advertisment({ from: 'Stockholm', to: 'Copenhagen', user: awesome_user});


// Change record by modifying the fields, then calling save().
//awesome_instance.name="New cool name";
awesome_ride.save(function (err, user) {
      if (err) console.log('error');
});



router.get('/', function(req, res, next) {
  res.render('db', { title: 'Express', testString: 'We the best'});
});


router.get('/advertisement', (req, res) => {

	Advertisment.find()
	.then(advertisments => {
		res.json({
			confirmation: 'success',
			data: advertisments
		})
	})
	.catch(err => {
		res.json({
			confirmation: 'fail',
			message: err.message
		})
	})
})

router.post('/send', function(req, res, next) {

 	res.render('db', { title: 'Express', testString: 'SENT'});
});

module.exports = router;