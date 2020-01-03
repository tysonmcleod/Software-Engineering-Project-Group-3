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
	let from_query = {};
	let to_query = {};
	let date_query = {};
	const username = res.locals.user;
	let radius = 0;

	if(req.query.radius){
		radius = parseFloat(req.query.radius);
		filter.radius = radius;
	}
	else{
		radius = 0.1;
		filter.radius = 0.1;
	}
	console.log(radius);

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
		date_query = {"date": {$gte: req.query.date}};
	}
	else{
		var today = new Date()
		var dd = String(today.getDate()).padStart(2, '0');
		var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
		var yyyy = today.getFullYear();
		today = yyyy + '-' + mm + '-' + dd;
		date_query = {};
	}

	if(req.query.fromcoords){
		let str = JSON.parse(req.query.fromcoords);
		console.log(str);
		let lat_from = str.geometry.location.lat;
		let lng_from = str.geometry.location.lng;

		var arr = str.formatted_address.split(',');
		
		filter.from = arr[1].substr(8);
		filter.from_lat = lat_from;
		filter.from_lng = lng_from;
		from_query = {"from_details.lat": {$gt: lat_from-radius, $lt: lat_from+radius}}, {"from_details.lng": {$gt: lng_from-radius, $lt: lng_from+radius}};
	}
	else if(req.query.from_lat){
		lat_from = parseFloat(req.query.from_lat);
		lng_from = parseFloat(req.query.from_lng);
		filter.from_lat = lat_from;
		filter.from_lng = lng_from;
		from_query = {"from_details.lat": {$gt: lat_from-radius, $lt: lat_from+radius}}, {"from_details.lng": {$gt: lng_from-radius, $lt: lng_from+radius}}
	}

	if(req.query.tocoords){
		let str = JSON.parse(req.query.tocoords);

		lat_to = str.geometry.location.lat;
		lng_to = str.geometry.location.lng;

		var arr2 = str.formatted_address.split(',');

		filter.to = arr2[1].substr(8);
		filter.to_lat = lat_to;
		filter.to_lng = lng_to;
		to_query = {"to_details.lat": {$gt: lat_to-radius, $lt: lat_to+radius}}, {"to_details.lng": {$gt: lng_to-radius, $lt: lng_to+radius}};
	}
	else if(req.query.to_lat){
		lat_to = parseFloat(req.query.to_lat);
		lng_to = parseFloat(req.query.to_lng);
		filter.to_lat = lat_to;
		filter.to_lng = lng_to;
		to_query = {"to_details.lat": {$gt: lat_to-radius, $lt: lat_to+radius}}, {"to_details.lng": {$gt: lng_to-radius, $lt: lng_to+radius}}
	}

	if(Object.keys(filter).length === 0){
		res.render("display-all-advertisements", {	filter: filter });
	}
	
	
	Advertisement
	.find({$and: [Object.assign({}, from_query, to_query, date_query)]})
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

router.get('/create-ad', function(req, res, next) {
  res.render('create-ad', { today: getCurrentDate(), apiKey: GoogleAPIKey });
});

router.get('/delete-ride/:id', async (req, res) => {
	const id = req.params.id;
	const ad = await Advertisement.findByIdAndRemove(id, {useAndModify: false});
	res.redirect("/rides/manage-users-ads");
});

router.get('/update-ride/:id', async (req, res) => {
	
	const id = req.params.id;

	const updateObj = {};
	updateObj.date = req.query.date;
	updateObj.departure = req.query.departure;
	updateObj.arrival = req.query.arrival;

	const newad = await Advertisement.findByIdAndUpdate(id, updateObj, {new: true});

	res.redirect("/rides/manage-users-ads/" + id);
});

router.get('/request-ride/:id/:from_lat/:from_lng/:to_lat/:to_lng', async (req, res) => {
	if(!req.isAuthenticated()){
			res.redirect("/users/register");
		}

	const lat = req.params.lat;
	const lng = req.params.lng;
	const id = req.params.id;
	const testUser2 = res.locals.user;
	console.log(res.locals.user);
	const testUser = testUser2.username;

	const temp = {
		username: testUser,
		from_lat: req.params.from_lat,
		from_lng:  req.params.from_lng,
		to_lat:  req.params.to_lat,
		to_lng: req.params.to_lng
	}

	let ad = await Advertisement.findById(id);

	if(!ad.interested_riders.includes(testUser)){
		ad.interested_riders.push(testUser);
		ad.rider_trips.push(temp);

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


router.post('/accept-rider/:id/:username', async (req, res) => {
	const id = req.params.id;
	const new_rider = req.params.username;

	let ad = await Advertisement.findById(id);

	if(!ad.confirmed_riders.includes(new_rider)){
		ad.confirmed_riders.push(new_rider);
		ad.interested_riders.pull(new_rider);
		
		const trip = ad.rider_trips.find(x => x.username == new_rider);
		ad.confirmed_rider_trips.push(trip);
		ad.rider_trips.pull(trip);

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

router.post('/reject-rider/:id/:username', async (req, res) => {
	const id = req.params.id;
	const new_rider = req.params.username;
	
	let ad = await Advertisement.findById(id);

	if(ad.confirmed_riders.includes(new_rider)){
		ad.confirmed_riders.pull(new_rider);
		ad.interested_riders.push(new_rider);
		const trip = ad.confirmed_rider_trips.find(x => x.username == new_rider);
		ad.rider_trips.push(trip);
		ad.confirmed_rider_trips.pull(trip);

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




router.get('/make-advertisement', async function(req, res, next) {

	let new_ad = {};
	let new_from = {};
	let new_to = {};

	if(req.query.available_seats == "" || req.query.available_seats == null){
		req.query.available_seats = 0;
	}

	if(req.query.fromcoords){
		const str = JSON.parse(req.query.fromcoords);
		console.log(str.geometry.location.lat);
		console.log(str.geometry.location.lng);
		var arr = str.formatted_address.split(',');
		console.log(arr[1].substr(1,6));
		new_from.post_address = parseInt(arr[1].substr(1,3).concat(arr[1].substr(5,6)));
		new_from.lat = parseFloat(str.geometry.location.lat);
		new_from.lng = parseFloat(str.geometry.location.lng);
		new_ad.from = arr[1].substr(8);
	}

	if(req.query.tocoords){
		console.log(req.query.tocoords);
		const str = JSON.parse(req.query.tocoords);
		console.log(str.geometry.location.lat);
		console.log(str.geometry.location.lng);
		var arr2 = str.formatted_address.split(',');
		console.log(arr2[1].substr(1,6));
		new_to.post_address = parseInt(arr2[1].substr(1,3).concat(arr2[1].substr(5,6)));
		new_to.lat = parseFloat(str.geometry.location.lat);
		new_to.lng = parseFloat(str.geometry.location.lng);
		new_ad.to = arr2[1].substr(8);
	}

	const user3 = res.locals.user;
	const user2 = user3.username;

	new_ad.driver = user2;
	new_ad.date = req.query.date;
	new_ad.departure = req.query.departure;
	new_ad.arrival = req.query.arrival;
	new_ad.available_seats = req.query.available_seats;
	new_ad.from_details = new_from;
	new_ad.to_details = new_to;
	console.log(new_ad);

	Advertisement.create(new_ad)
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
		res.render("manage-users-advertisements", {	data: advertisement, username: username, });
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
		console.log(advertisement.rider_trips);
		res.render("manage-one-advertisement", {	data: advertisement, username: username, apiKey: GoogleAPIKey});
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
		res.render("display-one-advertisement", {	data: advertisement, apiKey: GoogleAPIKey});
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