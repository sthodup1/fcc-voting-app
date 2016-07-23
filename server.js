'use strict';
var express = require("express");
var routes = require('./app/routes/index.js');
var mongoose = require("mongoose");
var passport = require("passport");
var session = require("express-session");
var path = require("path");
var bodyParser = require('body-parser')
var app = express();
require("dotenv").load();
require("./app/config/passport")(passport);

app.set('views', path.join(__dirname, '/public/views'));
app.set('view engine', 'pug');
app.set('view options', { basedir: __dirname})

mongoose.connect(process.env.MONGO_URI);

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/controllers', express.static(process.cwd() + '/app/controllers'));
app.use('/common', express.static(process.cwd() + '/app/common'));
app.use( bodyParser.json() ); 

app.use(session({
  secret: 'secretClementine',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

routes(app, passport);
  
app.listen(process.env.PORT || 8080, function() {
  console.log("App listening...");
});




