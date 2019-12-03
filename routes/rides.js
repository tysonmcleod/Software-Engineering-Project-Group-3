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

	
	Advertisement
	.find(filter)
	.sort('date')
	.sort('departure')
	.then(advertisements => {
		res.render("display-all-advertisements", {	data: advertisements, filter: filter});
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
	const ad = await Advertisement.findByIdAndRemove(id, {useAndModify: false});
	res.redirect("/rides/manage-users-ads/" + ad.driver);
});

router.post('/update-ride/:id', async (req, res) => {
	
	const id = req.params.id;
	res.send(id);
	//const ad = await Advertisement.findByIdAndRemove(id, {useAndModify: false});
	//res.redirect("/rides/manage-users-ads/" + ad.driver);
});

router.post('/hop-on-ride/:id', async (req, res) => {
	const id = req.params.id;

	const testUser = "augaug";
	

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

	const testUser = "augaug";


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


router.post('/join-ride/:id/:username', async (req, res) => {
	const id = req.params.id;
	const new_rider = req.params.username;
	
	let ad = await Advertisement.findById(id);

	if(!ad.confirmed_riders.includes(new_rider)){
		ad.confirmed_riders.push(new_rider);
		ad.interested_riders.pull(new_rider);
		ad.available_seats = ad.available_seats + 1;
		ad.save(function(err){
          if(err){
            console.log(err);
            return;
          }
      	});
    }
    res.redirect("/rides/manage-users-ads/" + ad.driver +"/" + id);
});

router.post('/disjoin-ride/:id/:username', async (req, res) => {
	const id = req.params.id;
	const new_rider = req.params.username;
	
	let ad = await Advertisement.findById(id);

	if(ad.confirmed_riders.includes(new_rider)){
		ad.confirmed_riders.pull(new_rider);
		ad.available_seats = ad.available_seats + -1
		ad.save(function(err){
          if(err){
            console.log(err);
            return;
          }
      	});
    }
    res.redirect("/rides/manage-users-ads/" + ad.driver +"/" + id);
});




router.post('/send-ad', function(req, res, next) {
	if(req.body.available_seats == undefined){
		req.body.available_seats = 0;
	}
	console.log(req.body.leaving);
	console.log(typeof req.body.arriving);
	console.log(req.body.arriving <= "23:22");
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

router.get('/manage-users-ads/:username', (req, res) => {
	const username = req.params.username;
	const query = {driver: username};
	Advertisement.find({$or: [{confirmed_riders: username}, {interested_riders: username}, {driver: username}]})
	.sort('date')
	.sort('departure')
	.then(advertisement => {
		console.log(advertisement)
		res.render("manage-users-advertisements", {	data: advertisement, username: username});
	})
	.catch(err => {
		res.json({
			confirmation: 'fail',
			message: 'Advertisement ' + id + ' not found.'
		})
	})
});




router.get('/manage-users-ads/:username/:id', (req, res) => {
	const id = req.params.id;
	const username = req.params.username;
	
	Advertisement.findById(id)
	.then(advertisement => {
		res.render("manage-one-advertisement", {	data: advertisement, username: username});
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