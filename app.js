var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
var indexRouter = require('./routes/index');
var concertRouter= require('./routes/concert');
var userRouter= require('./routes/user');
var bookingRoutes= require('./routes/booking');
var apiRoutes=require('./routes/api');
const db = require('./db/db');



var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'default-secret-key',
  resave: false,
  saveUninitialized: false,
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/',concertRouter);
app.use('/',userRouter);
app.use('/',bookingRoutes);
app.use('/api',apiRoutes);



app.use((req, res, next) => {
  console.log('Request:', req.method, req.originalUrl);
  next();
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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