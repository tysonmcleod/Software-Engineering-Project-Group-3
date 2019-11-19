const mongoose = require('mongoose')

const Advertisement = new mongoose.Schema({
	from: {type:String, trim:true, default:''},
	to: {type:String, trim:true, default:''}
})

module.exports = mongoose.model('Advertisement', Advertisement)

