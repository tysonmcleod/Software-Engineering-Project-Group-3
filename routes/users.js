var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
// Bring in user model
var User = require('../models/user');

var User = User.model;
// register form

router.get('/register', function(req,res){
  res.render('register');
});


// register process

router.post('/register', function(req,res){
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const password2 = req.body.password2;

  // validation

  req.checkBody('firstname', 'Your first name is required').notEmpty();
  req.checkBody('lastname', 'Your surname name is required').notEmpty();
  req.checkBody('email', 'Invalid Email Address').isEmail();
  req.checkBody('username', 'A valid username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);


  let errors = req.validationErrors();

  if(errors){
    res.render('register', {
      errors:errors
    });
  } else{
    let newUser = new User({
      firstname:firstname,
      lastname:lastname,
      email:email,
      username:username,
      password:password
    });

    bcrypt.genSalt(10, function(err, salt){
      bcrypt.hash(newUser.password, salt, function(err, hash){
        if(err){
          console.log(err);
        }
        newUser.password = hash;
        newUser.save(function(err){
          if(err){
            console.log(err);
            return;
          }else {
            req.flash('success', 'you are now registered go login lol');
            res.redirect('/users/login');
          }
        });
      });
    });
  }
});


router.get('/login', function(req,res){
  res.render('login');
});




/* GET users listing.
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
*/
module.exports = router;
