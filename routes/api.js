var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
/* This is a sample API route. */



const Advertisment = require('../models/Advertisement');

var mongoDB = 'mongodb+srv://carliftadmin:carliftadmin@cluster0-dbznl.mongodb.net/carlift?retryWrites=true&w=majority';
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


db.once('open', function(callback) {
//The code in this asynchronous callback block is executed after connecting to MongoDB. 
    console.log('Successfully connected to MongoDB.');
});


var awesome_instance2 = new Advertisment({ from: 'Uppsala', to: 'Sundsvall' });
var awesome_instance3 = new Advertisment({ from: 'Malmo', to: 'Lund' });


// Change record by modifying the fields, then calling save().
//awesome_instance.name="New cool name";


awesome_instance2.save(function (err, user) {
      if (err) console.log('error');
});

awesome_instance3.save(function (err, user) {
      if (err) console.log('error');
});


router.get('/', function(req, res, next) {
  res.render('db', { title: 'Express', testString: 'We the best'});
});


router.get('/advertisment', (req, res) => {

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
	//console.log(request.body.user.name);
    //console.log(request.body.user.email);
 	res.render('db', { title: 'Express', testString: 'SENT'});
});

module.exports = router;