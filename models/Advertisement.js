const mongoose = require('mongoose')
var User = require('./user');

const Advertisement = new mongoose.Schema({
	'from': {type:String, trim:true, default:''},
	'from_details': {
    	lat: Number,
    	lng: Number,
    	post_address: Number
 	},
 	'to_details': {
    	lat: Number,
    	lng: Number,
    	post_address: Number
 	},
	'to': {type:String, trim:true, default:''},
	'driver': {type:String, trim:true, default:''},
	'confirmed_riders': [{type:String, trim:true}],
	'interested_riders': [{type:String, trim:true}],
	'rider_trips': [{
		username: {type:String, trim:true},
		from_lat: Number,
		from_lng: Number,
		to_lat: Number,
		to_lng: Number
	}],
	'confirmed_rider_trips': [{
		username: {type:String, trim:true},
		from_lat: Number,
		from_lng: Number,
		to_lat: Number,
		to_lng: Number
	}],
	'date': {type:String, trim:true, default:''},
	'available_seats': {type:Number, trim:true, default:0},
	'departure': {type:String, trim:true, default:''},
	'arrival': {type:String, trim:true, default:''}
})

module.exports = mongoose.model('Advertisement', Advertisement);

