const mongoose = require('mongoose')
var User = require('./user');

const Advertisement = new mongoose.Schema({
	'from': {type:String, trim:true, default:''},
	'to': {type:String, trim:true, default:''},
	'driver': User.schema,
	'confirmed_riders': [{type:String, trim:true}],
	'interested_riders': [{type:String, trim:true}],
	'date': {type:String, trim:true, default:''},
	'car_size': {type:Number, trim:true, default:5},
	'available_seats': {type:String, trim:true, default:4},
	'points': {type:Number, trim:true, default:0}
})

module.exports = mongoose.model('Advertisement', Advertisement);

