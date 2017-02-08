console.log('Hello from api.js');
var express = require('express');
var router = express.Router();
var passport = require('passport');
var mongoose = require('mongoose');
var conf = require('../config.js');

mongoose.connect(conf.dbUrl); // connect to mongoDB database


router.use(passport.initialize());
router.use(passport.session());

var routes = require('./routes');
router.use('/', routes);

module.exports = router;
