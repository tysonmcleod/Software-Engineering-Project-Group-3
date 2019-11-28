var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Advertisement = require('../models/Advertisement');
var User = require('../models/user');

User = User.model;


router.get('/', (req, res) => {
	res.render('search-ad');
});

router.get('/create-ad', function(req, res, next) {
  res.render('create-ad');
});

router.get('/show-ads', function(req, res, next) {

 	let filters = {};
 	for (const key in req.query) {
  		console.log(key, req.query[key])
  		console.log("From" + req.query['from-dest'])
	}

	//console.log(req.body.to-dest);  BEWARE '-' char doesnt seem to be allowed in req.body expression
	
	if(req.query['from-dest'] != ''){
		filters.from = req.query['from-dest'];
	}
	else if(req.query.from != ''){
		filters.from = req.query.from;
	}
	if(req.query['to-dest'] != ''){
		filters.to = req.query['to-dest'];
	}

	Advertisement.find(filters)
	.then(advertisements => {
		console.log(advertisements)
		res.render("display-all-advertisements", {	data: advertisements, from: req.query['from-dest'], to: req.query['to-dest']});
	})
	.catch(err => {
		res.json({
			confirmation: 'fail',
			message: err.message
		})
	});
});


router.get('/update-results', function(req, res, next) {

 	let filters = {};


	if(req.query.points != ''){
		filters.points = req.query.points;
	}
	if(req.query.from != ''){
		filters.from = req.query.from;
	}
	if(req.query.to != ''){
		filters.to = req.query.to;
	}

	console.log(filters);

	Advertisement.find(filters)
	.then(advertisements => {
		console.log(advertisements)
		res.render("display-all-advertisements", {	data: advertisements, from: filters.from, to:filters.to, points: filters.points});
	})
	.catch(err => {
		res.json({
			confirmation: 'fail',
			message: err.message
		})
	});

});

router.post('/hop-on-ride/:id', async (req, res) => {
	const id = req.params.id;
	const testUser = new User({
	    firstname:"johnny",
	    lastname:"johansson",
	    email: "johjohannson@it.se",
	    username:"johjoh",
    	password:"johnny"
    });
	
	let ad = await Advertisement.findById(id);
	console.log(ad.rider);

	if(ad.rider == null){
		const update = {rider: testUser};
		const query = {_id: id};
		await Advertisement.findOneAndUpdate(query, update, {useAndModify: false});
	}
	else{
	}
	res.redirect("/rides/finding-ads/" + id);
});

router.post('/hop-off-ride/:id', async (req, res) => {
	const id = req.params.id;
	const update = { rider: null};
	
	let ad = await Advertisement.findById(id);
	console.log(ad.rider);

	if(ad.rider == null){
		//res.send("nothing to do");
	}
	else{
		const query = {_id: id};
		await Advertisement.findOneAndUpdate(query, update, {useAndModify: false});
	}
	res.redirect("/rides/finding-ads/" + id);
});





router.post('/send-ad', function(req, res, next) {


  let awesome_driver = new User({
    firstname:"per",
    lastname:"johansson",
    email: "perjohannson@it.se",
    username:"perjoh",
    password:"perra"
    });

  let awesome_rider = new User({
    firstname:"johnny",
    lastname:"johansson",
    email: "johjohannson@it.se",
    username:"johjoh",
    password:"johnny"
    });

  req.body.driver = awesome_driver;
  req.body.rider = awesome_rider;

  Advertisement.create(req.body)
  .then(advertisement => {
    res.json({
      confirmation: 'success',
      data: advertisement
    })
    .catch(err => {
      res.json({
        confirmation: 'fail',
        message: err.message
      })
    })
  })
});

router.post('/finding-ads/testing/:id', (req, res) => {
	var id = req.params.id;
	var profileUsername = 'johjoh';
	//var result = Advertisement.findById(id, {lean: true});

	Advertisement.findById(id)
	.then(advertisements => {
		res.redirect("/rides/finding-ads/" + id);
		
		index = 0;
		console.log(advertisements.riders)
		var temp = []
		for (i of advertisements.riders){
			if( i.username == profileUsername){
				advertisements.riders.splice(index, 1);
			}
			index = index + 1;
		}
		console.log(advertisements);
		
		advertisements.save(function(error) {
                    if (error) {
                        console.log(error);
                    } else {
                        // send the records
                        res.redirect("/rides/finding-ads/" + id);
                    }
                });
                
	})
	.catch(err => {
    		res.json({
    		   	confirmation: 'fail',
    			message: err.message
    		})
    	})

});

router.post('/finding-ads/remove-rider/:id', (req, res) => {
	var id = req.params.id;
	var profileUsername = 'johjoh';
	Advertisement.findById(id)
	.then(advertisements => {
		var temp = [];
		console.log("hipp");
		var index = 0;
		for (i of profile.riders){
			if( i.username == profileUsername){
				console.log(i.username + "index: " + index);
				temp = profile.riders
				temp.splice(index, 1);
			}
			index = index + 1;
		}


		console.log('temp=' + temp);
		update = {riders: []}
		console.log("id: " + id);
    	Advertisement.findOneAndUpdate(id, update, {new:true}, {useAndModify: false})
    	.then(advertisements => {
    		res.redirect("/rides/finding-ads/" + id)
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

router.post('/finding-ads/update/:id', (req, res) => {
	var id = req.params.id;
	let awesome_rider = new User({
	    firstname:"bob",
	    lastname:"bobson",
	    email: "bobo@it.se",
	    username:"bob",
	    password:"bobby"
    });



	Advertisement.findById(id)
	.then(profile => {
		found = false;
		for (i of profile.riders){
			if( i.username == awesome_rider.username){
				found = true;
			}
		}
		if(!(found)){
			console.log("adding rider...");
			console.log(profile.riders);
			profile.riders.push(awesome_rider);
			console.log(profile.riders);
			var newRiders = {riders: profile.riders};
		}
		else{
			var newRiders = {'riders': profile.riders};
		}
		console.log("Adding: " + newRiders.riders);
    	Advertisement.findOneAndUpdate({"_id": id}, newRiders, {returnNewDocument:true}, {useAndModify:false})
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
		res.render("display-one-advertisement", {	data: profile});
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
		res.render("display-all-advertisements", {	data: advertisements	});
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