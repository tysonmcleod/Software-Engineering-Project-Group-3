var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Advertisement = require('../models/Advertisement');
var User = require('../models/user');
var bcrypt = require('bcryptjs');
var passport = require('passport');

const keyFile = require('../APIkey.json');
const GoogleAPIKey = keyFile.APIKey;

User = User.model;

router.get('/', function(req, res, next) {

 	let filter = {};
	let from_query = {};
	let to_query = {};
	let date_query = {};
	let localUser = {};
	if(res.locals.user){
		localUser = res.locals.user;
	}
	

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
		date_query = {"date": req.query.date};
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
		from_query = {"clique.from_lat_min": {$lt: lat_from}, "clique.from_lat_max": {$gt: lat_from}, "clique.from_lng_min": {$lt: lng_from}, "clique.from_lng_max": {$gt: lng_from}};
	}
	else if(req.query.from_lat){
		lat_from = parseFloat(req.query.from_lat);
		lng_from = parseFloat(req.query.from_lng);
		filter.from_lat = lat_from;
		filter.from_lng = lng_from;
		from_query = {"clique.from_lat_min": {$lt: lat_from}, "clique.from_lat_max": {$gt: lat_from}, "clique.from_lng_min": {$lt: lng_from}, "clique.from_lng_max": {$gt: lng_from}};
	}

	if(req.query.tocoords){
		let str = JSON.parse(req.query.tocoords);

		lat_to = str.geometry.location.lat;
		lng_to = str.geometry.location.lng;

		var arr2 = str.formatted_address.split(',');

		filter.to = arr2[1].substr(8);
		filter.to_lat = lat_to;
		filter.to_lng = lng_to;
		to_query = {"clique.to_lat_min": {$lt: lat_to}, "clique.to_lat_max": {$gt: lat_to}, "clique.to_lng_min": {$lt: lng_to}, "clique.to_lng_max": {$gt: lng_to}};
	}
	else if(req.query.to_lat){
		lat_to = parseFloat(req.query.to_lat);
		lng_to = parseFloat(req.query.to_lng);
		filter.to_lat = lat_to;
		filter.to_lng = lng_to;
		to_query = {"clique.to_lat_min": {$lt: lat_to}, "clique.to_lat_max": {$gt: lat_to}, "clique.to_lng_min": {$lt: lng_to}, "clique.to_lng_max": {$gt: lng_to}};	}

	if(Object.keys(filter).length === 0){
		res.render("display-all-advertisements", {	filter: filter });
	}
	
	console.log(from_query);
	console.log(to_query);
	Advertisement
	.find({$and: [Object.assign({}, from_query, to_query, date_query)]})
	.sort('date')
	.sort('departure')
	.then(advertisements => {
		res.render("display-all-advertisements", {	data: advertisements, filter: filter, username:localUser.username, apiKey: GoogleAPIKey });
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
			res.redirect("/users/login");
		}

	const id = req.params.id;
	const testUser2 = res.locals.user;
	const testUser = testUser2.username;

	const temp = {
		username: testUser,
		from_lat: req.params.from_lat,
		from_lng:  req.params.from_lng,
		to_lat:  req.params.to_lat,
		to_lng: req.params.to_lng
	};

	let ad = await Advertisement.findById(id);

	if(!ad.interested_riders.includes(testUser)){
		ad.interested_riders.push(testUser);
		ad.rider_trips.push(temp);
		console.log(ad.interested_riders);
		ad.save(function(err){
          if(err){
            console.log(err);
            return;
          }
      	});
    }

	res.redirect("back");
});


router.get('/derequest-ride/:id', async (req, res) => {
	const id = req.params.id;
	const update = { rider: null};
	const testUser2 = res.locals.user;
	const testUser = testUser2.username;

	let ad = await Advertisement.findById(id);

	if(ad.interested_riders.includes(testUser)){
		ad.interested_riders.pull(testUser);
		const trip = ad.rider_trips.find(x => x.username == testUser);
		ad.rider_trips.pull(trip);
		ad.save(function(err){
        if(err){
            console.log(err);
            return;
        }
     	});
	}
	if(ad.confirmed_riders.includes(testUser)){
		ad.confirmed_riders.pull(testUser);
		const trip = ad.confirmed_rider_trips.find(x => x.username == testUser);
		ad.confirmed_rider_trips.pull(trip);
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
		ad.rate_riders.push(-1);
		ad.riders_rate_driver.push(-1);
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
// todo: remove one -1 value from rate_riders array
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

router.post('/not-accept-rider/:id/:username', async (req, res) => {
	const id = req.params.id;
	const rider = req.params.username;

	let ad = await Advertisement.findById(id);

	if(ad.interested_riders.includes(rider)){
		ad.interested_riders.pull(rider);
		console.log(ad.rider_trips);
		const trip = ad.rider_trips.find(x => x.username == rider);
		ad.rider_trips.pull(trip);
		console.log(ad.rider_trips);

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
	const radius_km = req.query.radius;
	const radius = radius_km/100;

	console.log(req.query);

	if(req.query.available_seats == "" || req.query.available_seats == null){
		req.query.available_seats = 0;
	}

	if(req.query.fromcoords){
		const str = JSON.parse(req.query.fromcoords);
		var arr = str.formatted_address.split(',');
		new_from.lat = parseFloat(str.geometry.location.lat);
		new_from.lng = parseFloat(str.geometry.location.lng);
		new_ad.from = arr[1].substr(8);
		new_ad.fromfrom = arr[0];
	}

	if(req.query.tocoords){
		const str = JSON.parse(req.query.tocoords);
		var arr2 = str.formatted_address.split(',');
		new_to.lat = parseFloat(str.geometry.location.lat);
		new_to.lng = parseFloat(str.geometry.location.lng);
		new_ad.to = arr2[1].substr(8);
		new_ad.toto = arr2[0];
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
	new_ad.radius = radius;
	new_ad.clique = {
 		'from_lat_min': new_from.lat - radius,
	 	'from_lat_max': new_from.lat + radius*1,
	 	'from_lng_min': new_from.lng - radius,
	 	'from_lng_max': new_from.lng + radius*1,
	 	'to_lat_min': new_to.lat - radius,
	 	'to_lat_max': new_to.lat + radius*1,
	 	'to_lng_min': new_to.lng - radius,
	 	'to_lng_max': new_to.lng + radius*1
	 }
	new_ad.price = req.query.price;
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
		console.log(advertisement)
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

router.post('/rate-rider/:id', async (req, res) => {
	const id = req.params.id;
	const riderUsername = req.body.riderUsername;
	const rating = req.body.starRating;

	let ad = await Advertisement.findById(id);

	riderIndex = ad.confirmed_riders.indexOf(riderUsername);
	ad.rate_riders[riderIndex] = Number(rating);

	var updateObj = { $set: {} };
	updateObj.$set["rate_riders."+riderIndex] = Number(rating);

	let savedAd = await Advertisement.findByIdAndUpdate(id, updateObj);

	console.log(savedAd);


	let user = await User.findOne({username: riderUsername});
	console.log('Rating and votes of rider ' + riderUsername + ' before new rating.');
	console.log(user.rating);
	console.log(user.votes);

	user.rating += Number(rating);
	user.votes++;

	let updatedUser = {
		rating: user.rating,
		votes: user.votes
	};

	console.log('Rating and votes of rider ' + riderUsername + ' after new rating.');

	try {
		const savedUser = await User.findOneAndUpdate({username: riderUsername}, updatedUser, {new: true});
		console.log(savedUser);
	} catch (err) {
		res.status(500).json({message: err.message})
		// TODO: render to error not found pug file
	}

	res.redirect("/rides/manage-users-ads/" + id);
});

router.post('/rate-driver/:id', async (req, res) => {
	const id = req.params.id;
	const driverUsername = req.body.driverUsername;
	const riderUsername = req.body.riderUsername;
	const rating = req.body.starRating;

	let ad = await Advertisement.findById(id);

	riderIndex = ad.confirmed_riders.indexOf(riderUsername);
	ad.riders_rate_driver[riderIndex] = Number(rating);

	var updateObj = { $set: {} };
	updateObj.$set["riders_rate_driver."+riderIndex] = Number(rating);

	let savedAd = await Advertisement.findByIdAndUpdate(id, updateObj);

	console.log(savedAd);

	let user = await User.findOne({username: driverUsername});
	console.log('Rating and votes of driver ' + driverUsername + ' before new rating.');
	console.log(user.driverRating);
	console.log(user.driverVotes);

	user.driverRating += Number(rating)
	user.driverVotes++;

	let updatedUser = {
		driverRating: user.driverRating,
		driverVotes: user.driverVotes
	};

	console.log('Rating and votes of driver ' + driverUsername + ' after new rating.');

	try {
		const savedUser = await User.findOneAndUpdate({username: driverUsername}, updatedUser, {new: true});
		console.log(savedUser);
	} catch (err) {
		res.status(500).json({message: err.message})
		// TODO: render to error not found pug file
	}

	res.redirect("/rides/manage-users-rides");
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