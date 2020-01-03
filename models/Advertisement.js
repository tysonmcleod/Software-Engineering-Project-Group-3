const mongoose = require('mongoose')
var User = require('./user');

const Advertisement = new mongoose.Schema({
	'from': {type:String, trim:true, default:''},
	'from_details': [{
    	lat: Number,
    	lng: Number,
    	post_address: Number
 	}],
 	'to_details': [{
    	lat: Number,
    	lng: Number,
    	post_address: Number
 	}],
	'to': {type:String, trim:true, default:''},
	'driver': {type:String, trim:true, default:''},
	'confirmed_riders': [{type:String, trim:true}],
	'interested_riders': [{type:String, trim:true}],
	'date': {type:String, trim:true, default:''},
	'available_seats': {type:Number, trim:true, default:0},
	'departure': {type:String, trim:true, default:''},
	'arrival': {type:String, trim:true, default:''}
})

module.exports = mongoose.model('Advertisement', Advertisement);

