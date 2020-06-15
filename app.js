let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');

let loginRouter = require('./routes/login');
let indexRouter = require('./routes/index');

let universityRouter = require('./routes/university');
let schoolRouter = require('./routes/school');
let majorRouter = require('./routes/major');
let universityAccountRouter = require('./routes/universityAccount');
let companyRouter = require('./routes/company');
let companyAccountRouter = require('./routes/companyAccount');
let directionRouter = require('./routes/direction');
let technologyRouter = require('./routes/technology');
let technologyCategoryRouter = require('./routes/technologyCategory');
let knowledgeRouter = require('./routes/knowledge');
let learningPathRouter = require('./routes/learningPath');
let knowledgeExercisesRouter = require('./routes/knowledgeExercises');
let codeStandardRouter = require('./routes/codeStandard');
let growingMapRouter = require('./routes/growingMap');
let growingMapEditRouter = require('./routes/growingMapEdit');
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

app.use(function (req, res, next) {
  let url = req.originalUrl;
  if (url !== '/' && url.indexOf('/login') < 0 && req.cookies['shs.cms.user'] === undefined) {
    return res.redirect("/");
  }
  next();
});

app.use('/', loginRouter);
app.use('/login', loginRouter);
app.use('/index', indexRouter);
app.use('/university', universityRouter);
app.use('/school', schoolRouter);
app.use('/major', majorRouter);
app.use('/universityAccount', universityAccountRouter);
app.use('/company', companyRouter);
app.use('/companyAccount', companyAccountRouter);
app.use('/direction', directionRouter);
app.use('/technology', technologyRouter);
app.use('/technology/category', technologyCategoryRouter);
app.use('/knowledge', knowledgeRouter);
app.use('/knowledge/exercises', knowledgeExercisesRouter);
app.use('/codeStandard', codeStandardRouter);
app.use('/learningPath', learningPathRouter);
app.use('/growingMap', growingMapRouter);
app.use('/growingMap/edit', growingMapEditRouter);

// app.use('/softwareExercises', softwareExercisesRouter);
// app.use('/softwareExercisesEdit', softwareExercisesEditRouter);
// app.use('/softwareExercisesFiles', softwareExercisesUploadFilesRouter);

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
