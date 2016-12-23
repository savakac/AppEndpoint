//
// Module dependencies
//
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compression = require('compression');
var session = require('express-session');
var mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(session);
var dotenv = require('dotenv');
var lusca = require('lusca');
var passport = require('passport');
var flash = require('express-flash');

//
// Load enviroment variables
//
dotenv.load({ path: '.env.app' });

//
// Controllers route handlers
//
var homeController = require('./controllers/home');
var userController = require('./controllers/user');
var contactController = require('./controllers/contact');
var apiController = require('./controllers/api');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 310000000}));
app.use(compression());
app.use(session({
	resave: true,
	saveUninitialized: true,
	secret: process.env.SESSION_SECRET,
	// store: new MongoStore({
	// 	url: process.env.MONGODB_URI || process.env.MONGOLAB_URI,
	// 	autoReconnect: true
	// })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//
// Primary app routes
//
app.get('/', homeController.index);
app.get('/user', userController.getUser);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;