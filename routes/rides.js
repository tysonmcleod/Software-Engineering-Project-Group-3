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

router.get('/finding-ads/:id', (req, res) => {
	const id = req.params.id

	Advertisement.findById(id)
	.then(profile => {
		res.json({
			confirmation: 'success',
			data: profile
		})
	})
	.catch(err => {
		res.json({
			confirmation: 'fail',
			message: 'Advertisement ' + id + ' not found.'
		})
	})
})

router.get('/finding-ads', (req, res) => {

	let filters = req.query;
	
	console.log(typeof req.query.points);
	p = Number(req.query.points);

	if (p != null){
		filters = {
			points: {$gt: p}
		}
	}

	//Advertisement.find().where('from').equals(from)
	Advertisement.find(filters)
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