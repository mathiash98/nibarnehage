console.log('Hello from index');

const config = require('./config.js');

// Define dependencies
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const flash = require('connect-flash');

var port = process.env.PORT || 8080;

const app = express();

//Define template eninge
app.set('view engine', 'hbs');
app.set('views', __dirname + '/app/views/');
app.use(bodyParser.json());
app.use(bodyParser.json({type: 'application/vnc.api+json'}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(express.static(__dirname + '/app/public/'));
app.use("/favicon.ico", express.static(__dirname+'/app/public/img/favico.ico'));
app.use(flash());
app.use(require('express-session')({ secret: config.secret, resave: false, saveUninitialized: false }));

var api = require('./API/api.js');
app.use('/', api)

app.listen(port, function () {
  console.log('Listening on port ' + port);
});

exports = module.exports = app;
