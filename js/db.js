var mongoose = require('mongoose');

/*
exports.openDataBaseConnection = function() {

	var mongoDB = 'mongodb+srv://carliftadmin:carliftadmin@cluster0-dbznl.mongodb.net/carlift?retryWrites=true&w=majority';
	mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'MongoDB connection error:'));
	return db;
};
*/

var mongoDB = 'mongodb+srv://carliftadmin:carliftadmin@cluster0-dbznl.mongodb.net/carlift?retryWrites=true&w=majority';
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function(callback) {
	//The code in this asynchronous callback block is executed after connecting to MongoDB. 
	    console.log('Successfully connected to MongoDB.');
	});

module.exports = db;