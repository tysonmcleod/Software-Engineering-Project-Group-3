var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var passport = require('passport');
var bodyParser = require('body-parser');

// Bring in user model
var User = require('../models/user');

var User = User.model;
// register form

router.get('/register', function (req, res) {
    res.render('register');
});


// register process
// changed from NOT async function to async function
router.post('/register', async function (req, res) {

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

    //Check if username is taken
    try {
        const check_user_exists = await User.findOne({username: username});
        if (check_user_exists) {
            const username_error = {param: 'username', msg: 'Username already taken', 'value': username};
            errors.push(username_error);
        }
    } catch (err) {
        res.status(500).json({message: err.message})
    }

    if (errors) {
        console.log(errors);
        res.render('register', {
            errors: errors
        });
    } else {
        let newUser = new User({
            firstname: firstname,
            lastname: lastname,
            email: email,
            username: username,
            password: password
        });

        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(newUser.password, salt, function (err, hash) {
                if (err) {
                    console.log(err);
                }
                newUser.password = hash;
                newUser.save(function (err) {
                    if (err) {
                        console.log(err);
                        return;
                    } else {
                        req.flash('success', 'you are now registered go login lol');
                        res.redirect('/users/login');
                    }
                });
            });
        });
    }
});

// Login Form
router.get('/login', function (req, res) {
    res.render('login');
});


// Login Process
router.post("/login", function (req, res, next) {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);

});

//Log out
router.get('/logout', function (req, res) {
    console.log('Logout user:');
    console.log(res.locals.user);
    req.logout();
    req.flash('success', 'You are logged out');
    res.redirect('/');
});

// Get profile of logged in user
router.get('/profile', async (req, res) => {
    const user = res.locals.user;
    console.log("Display profile of user: " + user.username);
    console.log(user);
    res.render("profile", {
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
        email: user.email,
        password: user.password,
        rating: user.rating,
        votes: user.votes,
        driverRating: user.driverRating,
        driverVotes: user.driverVotes
    })
});

router.get('/profile/:username/:adId/:interest', async (req, res) => {
    const username = req.params.username;
    const interest = req.params.interest;
    const adId = req.params.adId;

    try {
        const user = await User.findOne({username: username});
        console.log("Display profile of user: " + user.username);
        console.log(user);
        console.log(interest);
        if (interest === 'true')
            res.render("checkoutInterestedProfile", {
                firstname: user.firstname,
                lastname: user.lastname,
                username: user.username,
                email: user.email,
                password: user.password,
                rating: user.rating,
                votes: user.votes,
                adId: adId,
                driverRating: user.driverRating,
                driverVotes: user.driverVotes
            });
        else
            res.render("checkoutProfile", {
                firstname: user.firstname,
                lastname: user.lastname,
                username: user.username,
                email: user.email,
                password: user.password,
                rating: user.rating,
                votes: user.votes,
                driverRating: user.driverRating,
                driverVotes: user.driverVotes
            })
    } catch (err) {
        res.status(500).json({message: err.message})
    }
});

// Edit profile of loggen in user through profile page
router.get('/editProfile', async (req, res) => {
    const user = res.locals.user;
    console.log("Display profile of user: " + user.username);
    console.log(user);
    res.render("editProfile", {
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
        email: user.email,
        password: user.password
    })
});

router.post('/update', async (req, res) => {
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const email = req.body.email;
    const username = req.body.username;
    //const rating = req.body.rating;

    let updatedUser = {
        firstname: firstname,
        lastname: lastname,
        email: email
    };

    console.log("Update profile of user: " + username);
    console.log(updatedUser);

    try {
        const user = await User.findOneAndUpdate({username: username}, updatedUser, {new: true});
        console.log(user);
        res.redirect("/users/profile")
    } catch (err) {
        res.status(500).json({message: err.message})
        // TODO: render to error not found pug file
    }
});

router.post('/rate-rider/:id', async (req, res) => {
    const id = req.params.id;
    const driverUsername = req.body.driverUsername;
    const riderUsername = req.body.riderUsername;

    let user = await User.findOne({username: riderUsername});

    res.render("driverRateRiderProfile", {data: user, driver: driverUsername, adId: id})
});

router.post('/rate-driver/:id', async (req, res) => {
    const id = req.params.id;
    const driverUsername = req.body.driverUsername;
    const riderUsername = req.body.riderUsername;

    let user = await User.findOne({username: driverUsername});

    res.render("riderRateDriverProfile", {data: user, rider: riderUsername, adId: id})
});

module.exports = router;