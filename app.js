var createError = require('http-errors');
var express = require('express');
var mongoose = require('mongoose');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var bodyParser = require('body-parser');
var session = require('express-session');

// route files
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var advertisementsRouter = require('./routes/advertisements');
var ridesRouter = require('./routes/rides');

var app = express();
const port = 3000;


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

app.use(flash());

//Start database

var mongoDB = 'mongodb+srv://carliftadmin:carliftadmin@cluster0-dbznl.mongodb.net/carlift?retryWrites=true&w=majority';
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function(callback) {
  //The code in this asynchronous callback block is executed after connecting to MongoDB. 
      console.log('Successfully connected to MongoDB.');
  });

// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/advertisements', advertisementsRouter);
app.use('/rides', ridesRouter);


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

app.set('port', (process.env.PORT || 8000));

app.listen(app.get('port'), function(){
	console.log('Server started on port '+app.get('port'));
});

module.exports = app;