var express = require('express');
var router = express.Router();
var User = require('../models/user');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
  User.find(function (err, users) {
    // if (err) return
    console.log(users)
  });
});

module.exports = router;
