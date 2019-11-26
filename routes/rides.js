var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Advertisement = require('../models/Advertisement');
var User = require('../models/user');

User = User.model;


router.get('/', (req, res) => {
	console.log(req);
	res.render('search-ad');
});

router.post('/finding-ads/update/:id', (req, res) => {
	var id = req.params.id;
	let awesome_rider = new User({
	    firstname:"bob",
	    lastname:"bobson",
	    email: "bobo@it.se",
	    username:"bobo",
	    password:"bobby"
    });

	Advertisement.findById(id)
	.then(profile => {
		console.log(profile.riders);
		profile.riders.push(awesome_rider);
		console.log(profile.riders);
		var newShit = {riders: profile.riders}
		
    	Advertisement.findOneAndUpdate(id, newShit, {new:true})
    	.then(profile => {
    		res.json({
    			confirmation: 'success',
    			data: profile
    		})
    	})
    	.catch(err => {
    		res.json({
    		   	confirmation: 'fail',
    			message: err.message
    		})
    	})	
    })
	.catch(err => {
		res.json({
			confirmation: 'fail',
			message: 'Advertisement ' + id + ' not found.'
		})
	})
});

router.get('/finding-ads/:id', (req, res) => {
	const id = req.params.id
	
	Advertisement.findById(id)
	.then(profile => {
		console.log(profile)
		res.render("show-ad", {	data: profile});
		/*
		res.json({
			confirmation: 'success',
			data: profile
		})
		*/
	})
	.catch(err => {
		res.json({
			confirmation: 'fail',
			message: 'Advertisement ' + id + ' not found.'
		})
	})
});


router.get('/finding-ads', (req, res) => {
	//console.log(req.sessionID)
	let filters = {};
	console.log(filters)
	console.log(typeof req.query.points);
	

	if (req.query.point != null){
		p = Number(req.query.points);
		filters.points = {p}
	}
	if(req.query.from != ''){
		filters.from = req.query.from;
	}
	if(req.query.to != ''){
		filters.to = req.query.to;
	}
	console.log(filters)
	//Advertisement.find().where('from').equals(from)
	Advertisement.find(filters)
	.then(advertisements => {
		console.log(advertisements)
		//console.log(JSON.stringify(advertisements))
		res.render("advertisements", {	data: advertisements	});
		/*res.json({		
			confirmation: 'success',
			data: advertisements
		})
		*/
	})
	.catch(err => {
		res.json({
			confirmation: 'fail',
			message: err.message
		})
	});

});



module.exports = router;