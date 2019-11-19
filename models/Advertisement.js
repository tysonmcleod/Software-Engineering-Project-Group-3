const mongoose = require('mongoose')
var User = require('./user');

const Advertisement = new mongoose.Schema({
	'from': {type:String, trim:true, default:''},
	'to': {type:String, trim:true, default:''},
	'user': User.schema
})

module.exports = mongoose.model('Advertisement', Advertisement)

