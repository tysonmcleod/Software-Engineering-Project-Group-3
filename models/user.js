const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// user schema
const UserSchema = mongoose.Schema({
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
const User = module.exports = mongoose.model('User', UserSchema);
