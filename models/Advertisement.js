const mongoose = require('mongoose')
var User = require('./user');

const Advertisement = new mongoose.Schema({
	'from': {type:String, trim:true, default:''},
	'to': {type:String, trim:true, default:''},
	'points': {type:Number, trim:true, default:0},
	'driver': User.schema,
	'rider': {type:User.schema, defualt: null}
})

module.exports = mongoose.model('Advertisement', Advertisement)

