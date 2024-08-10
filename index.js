console.log('Hello from index');

const config = require('./config.js');

// Define dependencies
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const flash = require('connect-flash');
var fs = require('fs');
var https = require('https');

var ports = process.env.NODE_ENV === 'production'
  ? [80, 443]
  : [80, 443];
  // : [3442, 3443];

const app = express();

var server = https.createServer(
  {
    key: fs.readFileSync('/etc/letsencrypt/live/nibarnehage.no/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/nibarnehage.no/fullchain.pem')
  },
  app
);

server.listen(ports[1], function(){
  console.log("listening on", ports[1]);
});
app.listen(ports[0], function(){
  console.log("listening on", ports[0]);
});

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

// app.listen(port, function () {
//   console.log('Listening on port ' + port);
// });

exports = module.exports = app;
