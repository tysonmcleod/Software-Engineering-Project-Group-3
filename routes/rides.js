var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Advertisement = require('../models/Advertisement');
var User = require('../models/user');
var bcrypt = require('bcryptjs');
var passport = require('passport');

const keyFile = require('../APIKey.json');
const GoogleAPIKey = keyFile.APIKey;

User = User.model;

router.get('/', function(req, res, next) {

 	let filter = {};

 	console.log(req.query.date);
	//console.log(req.body.to-dest);  BEWARE '-' char doesnt seem to be allowed in req.body expression
	//

	if(req.query.from != ''){
		filter.from = req.query.from;
	}

	if(req.query.to != ''){
		filter.to = req.query.to;
	}

	if(req.query.points != ''){
		filter.points = req.query.points;
	}
	
	if(req.query.date){
		filter.date = req.query.date;
	}
	if(Object.keys(filter).length === 0){
		res.render("display-all-advertisements", {	filter: filter });
	}
	const username = res.locals.user;
	
	Advertisement
	.find(filter)
	.sort('date')
	.sort('departure')
	.then(advertisements => {
		res.render("display-all-advertisements", {	data: advertisements, filter: filter, username:username });
	})
	.catch(err => {
		res.json({
			confirmation: 'fail',
			message: err.message
		})
	});
	
});

router.get('/search', function(req, res, next) {


	let filter = {};

	console.log(req.query);

	const username = res.locals.user;
	console.log(filter)

	const test = req.query['to-dest'];
	if(req.query['from-dest'])
	 	filter.from = req.query['from-dest'];
	 	console.log("test= ")

	if(req.query['to-dest'])
		filter.to = req.query['to-dest'];

	if(req.query.date)
		filter.date = req.query.date;

	console.log("filter=" + filter);
	console.log(filter);


	Advertisement
		.find(filter)
		.sort('date')
		.sort('departure')
		.then(advertisements => {
	    console.log(advertisements)
	    res.render("display-all-advertisements", {filter: filter, data: advertisements, username:username });
	})
	.catch(err => {
		res.json({
			confirmation: 'fail',
			message: err.message
		})
	});
});

router.get('/create-ad', function(req, res, next) {
  res.render('create-ad', { today: getCurrentDate(), apiKey: GoogleAPIKey });
});

router.get('/destroy-the-ride/:id', async (req, res) => {
	const id = req.params.id;
	const ad = await Advertisement.findByIdAndRemove(id, {useAndModify: false});
	res.redirect("/rides/manage-users-ads");
});

router.get('/update-ride/:id', async (req, res) => {
	
	const id = req.params.id;

	const updateObj = {from: req.query.from};
	updateObj.to = req.query.to;
	updateObj.date = req.query.date;
	updateObj.available_seats = req.query.available_seats;
	updateObj.departure = req.query.departure;
	updateObj.arrival = req.query.arrival;

	console.log(updateObj);
	const newad = await Advertisement.findByIdAndUpdate(id, updateObj, {new: true});
	//const ad = await Advertisement.findByIdAndRemove(id, {useAndModify: false});
	console.log(newad);
	res.redirect("/rides/manage-users-ads/" + id);
});

router.get('/hop-on-ride/:id', async (req, res) => {
	const id = req.params.id;
	const testUser2 = res.locals.user;
	console.log(res.locals.user);
	const testUser = testUser2.username;

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
    res.redirect("/rides/manage-users-rides");
});

router.get('/hop-off-ride/:id', async (req, res) => {
	const id = req.params.id;
	const update = { rider: null};
	const testUser2 = res.locals.user;
	const testUser = testUser2.username;

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
	if(ad.confirmed_riders.includes(testUser)){
		ad.confirmed_riders.pull(testUser);
		ad.save(function(err){
        if(err){
            console.log(err);
            return;
        }
     	});
	}
    res.redirect("/rides/manage-users-rides");
});


router.post('/join-ride/:id/:username', async (req, res) => {
	const id = req.params.id;
	const new_rider = req.params.username;
	console.log(new_rider);
	let ad = await Advertisement.findById(id);

	if(!ad.confirmed_riders.includes(new_rider)){
		ad.confirmed_riders.push(new_rider);
		ad.interested_riders.pull(new_rider);
		ad.available_seats = ad.available_seats - 1;
		ad.save(function(err){
          if(err){
            console.log(err);
            return;
          }
      	});
    }
    res.redirect("/rides/manage-users-ads/"+ id);
});

router.post('/disjoin-ride/:id/:username', async (req, res) => {
	const id = req.params.id;
	const new_rider = req.params.username;
	
	let ad = await Advertisement.findById(id);

	if(ad.confirmed_riders.includes(new_rider)){
		ad.confirmed_riders.pull(new_rider);
		ad.available_seats = ad.available_seats + 1
		ad.save(function(err){
          if(err){
            console.log(err);
            return;
          }
      	});
    }
    res.redirect("/rides/manage-users-ads/" + id);
});




router.get('/send-ad', async function(req, res, next) {
	if(req.query.available_seats == "" || req.query.available_seats == null){
		req.query.available_seats = 0;
	}
	const user3 = res.locals.user;
	const user2 = user3.username;
	console.log("cool" + user2);
	console.log(req.body);
	console.log(req.query);
	req.query.driver = user2;
	console.log("hey" + req.query.driver);
	Advertisement.create(req.query)
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

router.get('/manage-users-ads', async (req, res) => {
	const user = res.locals.user;
	console.log(user.username);
	const username = user.username;
	const query = {driver: username};
	Advertisement.find({$or: [{confirmed_riders: username}, {interested_riders: username}, {driver: username}]})
	.sort('date')
	.sort('departure')
	.then(advertisement => {
		res.render("manage-users-advertisements", {	data: advertisement, username: username});
	})
	.catch(err => {
		res.json({
			confirmation: 'fail',
			message: 'Advertisement ' + id + ' not found.'
		})
	})
});

router.get('/manage-users-rides', async (req, res) => {
	const user = res.locals.user;
	console.log(user.username);
	const username = user.username;
	const query = {driver: username};
	Advertisement.find({$or: [{confirmed_riders: username}, {interested_riders: username}, {driver: username}]})
	.sort('date')
	.sort('departure')
	.then(advertisement => {
		res.render("manage-users-rides", {	data: advertisement, username: username});
	})
	.catch(err => {
		res.json({
			confirmation: 'fail',
			message: 'Advertisement ' + id + ' not found.'
		})
	})
});




router.get('/manage-users-ads/:id', async (req, res) => {
	const id = req.params.id;
	const test = res.locals.user;
	const username = test.username;
	
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

function getCurrentDate() {
	var date = new Date();
	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	var dayIndex = date.getDate();
  
	if(dayIndex < 10) {
	  var day = "0".concat(dayIndex.toString());
	} else {
	  var day = dayIndex;
	}
  
	return(`${year}-${month}-${day}`);
}


module.exports = router;