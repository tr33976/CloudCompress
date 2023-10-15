var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const fileUpload = require('express-fileupload')
const redis = require('redis');

var routes = require('./routes/index');
var download = require('./routes/download');
var myFiles = require('./routes/myFiles');

var app = express();

//set dev address
app.locals.TRF_ADDRESS = "http://localhost:3000"
app.locals.CMP_ADDRESS = "http://localhost:3001"

//connect to redis client, will need update to AWS
app.locals.redisClient = redis.createClient();
app.locals.redisClient.connect().then(console.log('Redis connected UI Server'))
  .catch((err) => {
    console.log(err);
  });

app.use(fileUpload({
  // 100mb file limit with and extra 50mb sauce
  limits: { fileSize: 150 * 1024 * 1024 },
  abortOnLimit: true,
  useTempFiles : true,
  tempFileDir : './TmpFiles/tmp/'
}));
  

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

//Just incase we need to handoff files on the traffic server
app.use('/TmpFiles', express.static('/TmpFiles'));  
app.use(express.static('/TmpFiles')); 

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/upload', routes);
app.use('/files', routes);
app.use('/download', download);
app.use('/myfiles', myFiles);

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
