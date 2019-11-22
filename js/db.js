var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');



exports.openDataBaseConnection = function() {

	var mongoDB = 'mongodb+srv://carliftadmin:carliftadmin@cluster0-dbznl.mongodb.net/carlift?retryWrites=true&w=majority';
	mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'MongoDB connection error:'));
	return db;
};