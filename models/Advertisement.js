const mongoose = require('mongoose')
var User = require('./user');

const Advertisement = new mongoose.Schema({
	'from': {type:String, trim:true, default:''},
	'to': {type:String, trim:true, default:''},
	'points': {type:Number, trim:true, default:0},
	'driver': User.schema,
	'riders': [User.schema]
})

module.exports = mongoose.model('Advertisement', Advertisement)

