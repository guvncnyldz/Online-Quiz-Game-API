var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');

var indexRouter = require('./routes/index');
var authRouter = require('./routes/authenticate');
var userRouter = require('./routes/users');
var inventoryRouter = require('./routes/inventory');
var jokerRouter = require('./routes/jokers');
var storeRouter = require('./routes/store')
var announcementRouter = require('./routes/announcement')
var definationRouter = require('./routes/defination')
var questionRouter = require('./routes/questions')

var app = express();

// DB Connection
const db=require('./helper/db')();

//Config
const config=require('./config');
app.set('api_secret_key',config.api_secret_key)
app.set('version',config.app_version)
//Middleware
const { httpLogger,verifyToken} = require('./middleware');

//Utils 
const { logger} = require('./utils');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(httpLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/api',verifyToken)
app.use('/api/users', userRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/joker', jokerRouter);
app.use('/api/store', storeRouter)
app.use('/api/announcement', announcementRouter)
app.use('/api/defination', definationRouter)
app.use('/api/question', questionRouter)




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
