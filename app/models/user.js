console.log('Hello from user.js');
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var SALT_WORK_FACTOR = 9;

var userSchema = new mongoose.Schema({
      username: {
        type: String,
        unique: true,
        required: true
      },
      password: {
        type: String,
        required: true
      },
      name: {
        type: String
      },
      admin: {
        type: Boolean,
        default: false
      },
      foreldre: {
        type: Boolean,
        default: false
      },
      added: { type: Date, default: Date.now },
      edited: { type: Date, default: Date.now }
    });

userSchema.pre('save', function(next) {
    var user = this;
    console.log('Saving user: ' + user.username);
    if (this.isModified('password') || this.isNew) {
      bcrypt.hash(user.password, SALT_WORK_FACTOR, function (err, hash) {
        if (err) return next(err);
        console.log(user.username + ' got a hashed password');
        user.password = hash;
        next();
      });
    } else {
      return next();
    }
});

userSchema.methods.comparePass = function(pass, cb) {
    bcrypt.compare(pass, this.password, function(err, isMatch) {
        if (err) {
          console.log(err);
          return cb(err);
        }
        cb(null, isMatch);
    });
};

module.exports = mongoose.model('User', userSchema);
