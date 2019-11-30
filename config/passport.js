var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');
var bcrypt = require('bcrypt');

module.exports = function (passport) {
    // Local Strategy
    passport.use(new LocalStrategy(function (username, password, done) {
        // Match Username
        let query = {username:username};
        User.model.findOne(query, function (err, user) {
            if(err) throw err;
            if(!user){
                return done(null, false, {message: 'No user found'});
            }

            //Match the password
            bcrypt.compare(password, user.password, function (err, isMatch) {
                if(err) throw err;
                if(isMatch){
                    return done(null, user);
                } else {
                    return done(null, false, {message: 'Wrong password'});
                }
            });
        });
    }));

    // use this to write any data we want to the user session
    passport.serializeUser(function (user,done) {
        done(null, user.id)
    });

    // retrieve data from the user session - read data
    passport.deserializeUser(function (id,done) {
        User.model.findById(id, function (err, user) {
            done(err, user);
        });
    });
};
