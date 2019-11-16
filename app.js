var createError = require('http-errors');
var express = require('express');
var session = require('express-session');
var passport = require('passport');
var expressValidator = require('express-validator');
var LocalStrategy =  require('passport-local').Strategy;
var mumlter = require('multer');
var upload = mumlter({dest:'./uploads'});
var flash = require('connect-flash');

//Set up mongoose connection
var mongoose = require('mongoose');
var mongoDB = 'mongodb://localhost:27017/mydb';
mongoose.connect(mongoDB, { useNewUrlParser: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
const port = 3000;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);


app.use(session({secret:'secret',saveUninitialized:'true',resave:'true'}));

//Handle sessions
app.use(session({secret:'secret',
  saveUninitialized:'true',
  resave:'true'
}));

//Passport  -- authentication system
app.use(passport.initialize());
app.use(passport.session());


//Validator
/*app.use(expressValidator({
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
}));*/

app.use(flash());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
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

app.set('port', (process.env.PORT || 8000));

app.listen(app.get('port'), function(){
  console.log('Server started on port '+app.get('port'));
});

module.exports = app;

