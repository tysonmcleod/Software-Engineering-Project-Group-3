const mongoose = require('mongoose')
var User = require('./user');

const Advertisement = new mongoose.Schema({
	'from': {type:String, trim:true, default:''},
	'to': {type:String, trim:true, default:''},
	'driver': {type:String, trim:true, default:''},
	'confirmed_riders': [{type:String, trim:true}],
	'interested_riders': [{type:String, trim:true}],
	'date': {type:String, trim:true, default:''},
	'available_seats': {type:Number, trim:true, default:0},
	'points': {type:Number, trim:true, default:0}
})

module.exports = mongoose.model('Advertisement', Advertisement);

