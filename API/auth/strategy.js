console.log('Hello from strategy.js');
// load all the things we need
var LocalStrategy = require('passport-local').Strategy;

// load up the user model
var User = require('../../app/models/user');

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
          var tmpUser = {
            _id:user.id,
            username: user.username,
            admin:user.admin,
            foreldre:user.foreldre
          }
            done(err, tmpUser);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy(
        function(username, password, done) {
            console.log('Registering user: ' + username);
            // asynchronous
            // User.findOne wont fire unless data is sent back
            // process.nextTick(function() {

            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            User.findOne({
                'username': username
            }, function(err, user) {
                // if there are any errors, return the error
                if (err)
                    return done(err);

                // check to see if theres already a user with that email
                if (user) {
                    return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                } else {

                    // if there is no user with that email
                    // create the user
                    var newUser = new User({
                        username: username,
                        password: password
                    });

                    // set the user's local credentials

                    // save the user
                    newUser.save(function(err, user) {
                        if (err) {
                            console.log(err);
                        } else {
                            return done(null, user);
                        }
                    });
                }

            });

            // });

        }));

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy(
        function(username, password, done) { // callback with username and password from our form
            // find a user whose username is the same as the forms username
            // we are checking to see if the user trying to login already exists
            User.findOne({
                'username': username
            }, function(err, user) {
                // if there are any errors, return the error before anything else
                if (err) {
                    console.log(err);
                    return done(err);
                }
                // if no user is found, return the message
                else if (!user) {
                    console.log(username + "was not found");
                    return done(null, false, ('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
                }
                // if the user is found comparePass
                else user.comparePass(password, function(err, isMatch) {
                  // If password is correct and there are no err
                    if (isMatch && !err) {
                      var tmpUser = {
                        _id:user.id,
                        username: user.username,
                        admin:user.admin,
                        foreldre:user.foreldre
                      }
                        return done(null, tmpUser);
                    } else return done(err, false, ('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
                });
                // all is well, return successful user

            });

        }));
};
