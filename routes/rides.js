var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Advertisement = require('../models/Advertisement');
var User = require('../models/user');

User = User.model;

router.get('/', function(req, res, next) {

 	let filter = {};

 	console.log(req.query.date);
	//console.log(req.body.to-dest);  BEWARE '-' char doesnt seem to be allowed in req.body expression
	//
	if(req.query['from-dest'] != undefined){
		filter.from = req.query['from-dest'];
	}
	else if(req.query.from != ''){
		filter.from = req.query.from;
	}
	if(req.query['to-dest'] != undefined){
		filter.to = req.query['to-dest'];
	}
	else if(req.query.to != ''){
		filter.to = req.query.to;
	}
	if(req.query.points == undefined){
	}
	else if(req.query.points == ''){
	}
	else{
		filter.points = req.query.points;
	}
	if(req.query.date){
		filter.date = req.query.date;
	}
	if(Object.keys(filter).length === 0){
		res.render("display-all-advertisements", {	filter: filter});
	}
	console.log('efd');
	Advertisement.find(filter)
	.then(advertisements => {
		console.log('edl');
		res.render("display-all-advertisements", {	data: advertisements, filter: filter});
		console.log('edl2');
	})
	.catch(err => {
		res.json({
			confirmation: 'fail',
			message: err.message
		})
	});
});

router.get('/create-ad', function(req, res, next) {
  res.render('create-ad');
});

router.get('/destroy-the-ride/:id', async (req, res) => {
	
	const id = req.params.id;
	await Advertisement.findByIdAndRemove(id, {useAndModify: false});
	res.redirect("/rides");
});

router.post('/hop-on-ride/:id', async (req, res) => {
	const id = req.params.id;
	const testUser = "johndoe";
	
	let ad = await Advertisement.findById(id);

	if(!ad.interested_riders.includes(testUser)){
		ad.interested_riders.push(testUser);
		ad.save(function(err){
          if(err){
            console.log(err);
            return;
          }
      	});
    }
    res.redirect("/rides/show-ads/" + id);

});

router.post('/hop-off-ride/:id', async (req, res) => {
	const id = req.params.id;
	const update = { rider: null};
	const testUser = "johndoe";

	let ad = await Advertisement.findById(id);

	if(ad.interested_riders.includes(testUser)){
		ad.interested_riders.pull(testUser);
		ad.save(function(err){
        if(err){
            console.log(err);
            return;
        }
     	});
	}
    res.redirect("/rides/show-ads/" + id);
});





router.post('/send-ad', function(req, res, next) {


	let test_driver = new User({
		firstname:"John",
		lastname:"Doe",
		email: "JohnDoe@john.doe",
		username:"johndoe",
  		password:"johndoe"
    });


  req.body.driver = test_driver;

	Advertisement.create(req.body)
	.then(advertisement => {
  		res.redirect("/rides/show-ads/" + advertisement.id);
  	})
	.catch(err => {
    	res.json({
        	confirmation: 'fail',
        	message: err.message
      	})
   	})
});

router.get('/show-users-ads/:username', (req, res) => {
	const username = req.params.username;
	const query = {username: username};
	User.find(query)
	.then(user => {
		res.json({
			confirmation: 'success',
			message: user
		})
	})
	.catch(err => {
		res.json({
			confirmation: 'fail',
			message: 'Advertisement ' + id + ' not found.'
		})
	})
});


router.get('/show-ads/:id', (req, res) => {
	const id = req.params.id
	
	Advertisement.findById(id)
	.then(advertisement => {
		res.render("display-one-advertisement", {	data: advertisement});
	})
	.catch(err => {
		res.json({
			confirmation: 'fail',
			message: 'Advertisement ' + id + ' not found.'
		})
	})
});


module.exports = router;