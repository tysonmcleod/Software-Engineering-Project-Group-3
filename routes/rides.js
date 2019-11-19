var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Advertisement = require('../models/Advertisement');
var User = require('../models/user');
var databaseConnection = require('../js/db')

User = User.model;


router.get('/', (req, res) => {
	res.render('search-ad', { title: 'Express', testString: 'We the best'});
});


router.post('/finding-ads', (req, res) => {

	const from = req.body.from;

	Advertisement.find().where('from').equals(from)
	.then(advertisements => {
		
		//res.render('show-ads', advertisements);
		
		res.json({
			confirmation: 'success',
			data: advertisements
		})
	})
	.catch(err => {
		res.json({
			confirmation: 'fail',
			message: err.message
		})
	})
});


module.exports = router;