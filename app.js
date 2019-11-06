let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');

let loginRouter = require('./routes/login');
let indexRouter = require('./routes/index');

let universityRouter = require('./routes/university');
let schoolRouter = require('./routes/school');
let universityAccountRouter = require('./routes/universityAccount');
let companyRouter = require('./routes/company');
let companyAccountRouter = require('./routes/companyAccount');
let commonRouter = require('./routes/common');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', loginRouter);
app.use('/index', indexRouter);
app.use('/university', universityRouter);
app.use('/school', schoolRouter);
app.use('/universityAccount', universityAccountRouter);
app.use('/company', companyRouter);
app.use('/companyAccount', companyAccountRouter);
app.use('/common', commonRouter);

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
