var express = require('express');
var router = express.Router();


// Bring in user model
var User = require('../models/user');


// register form

router.get('/', function(req,res){
  res.render('register');
});


/* GET users listing.
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
*/
module.exports = router;
