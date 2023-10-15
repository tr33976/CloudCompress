var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
require('dotenv').config();
const redis = require('redis');

var cmp = require('./routes/cmp');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use('/TmpFiles', express.static('/TmpFiles'));  
app.use(express.static('/TmpFiles')); 
app.use(fileUpload({
  // 100mb file limit with and extra 50mb sauce
  limits: { fileSize: 150 * 1024 * 1024 },
  abortOnLimit: true,
  useTempFiles : true,
  tempFileDir : './TmpFiles/tmp/'
}));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/cmp', cmp);

//Local redis client for development
//AWS redis client only works in cloud
//Have tested succesfully
const REDIS_LOCAL_CLIENT = true;
if(REDIS_LOCAL_CLIENT){
  app.locals.redisClient = redis.createClient();
} else {
  app.locals.redisClient = redis.createClient({
    url: 'redis://group37-cache.km2jzi.ng.0001.apse2.cache.amazonaws.com:6379'
  });
}
app.locals.redisClient.connect().then(console.log('Redis connected Compression Server'))
  .catch((err) => {
    console.log(err);
  });


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
