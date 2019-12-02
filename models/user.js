const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// user schema
const User = new mongoose.Schema({
  firstname:{
    type: String,
    required: true
  },
  lastname:{
    type: String,
    required: true
  },
  email:{
    type: String,
    required: true
  },
  username:{
    type: String,
    required: true
  },
  password:{
    type: String,
    required: true
  }
});

// module exports to access outside of this file
module.exports = {
  model: mongoose.model('User', User), schema: User};


