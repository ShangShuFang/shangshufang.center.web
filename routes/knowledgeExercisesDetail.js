let express = require('express');
let router = express.Router();
let marked = require('marked');
let commonService = require('../service/commonService');

router.get('/', function(req, res, next) {
  let courseExercisesID = req.query.courseExercisesID;
  res.render('knowledgeExercisesDetail', { title: '随堂习题批改', courseExercisesID: courseExercisesID});
});

router.get('/data', function (req, res, next) {
  let courseExercisesID = req.query.courseExercisesID;
  let service = new commonService.commonInvoke('studentCourseExercises');

  service.queryWithParameter(courseExercisesID, (result) => {
    if(result.err){
      res.json({
        err: true,
        code: result.code,
        msg: result.msg
      });
    }else{
      if (result.content.responseData !== null) {
        result.content.responseData.singleChoiceExercisesList.forEach((data) => {
          data.noAnswer = false;
          data.exercisesTitleHtml = marked(data.exercisesTitle);
        });
        result.content.responseData.multipleChoiceExercisesList.forEach((data) => {

          data.noAnswer = false;
          data.exercisesTitleHtml = marked(data.exercisesTitle);
        });
        result.content.responseData.blankExercisesList.forEach((data) => {
          data.noAnswer = false;
          data.exercisesTitleHtml = marked(data.exercisesTitle);
        });
        result.content.responseData.programExercisesList.forEach((data) => {
          data.noAnswer = false;
          data.sourceCodeUrl = data.submitSourceCodeUrl
          data.originalSourceCodeUrl = data.submitSourceCodeUrl;
          if (data.exercisesSourceType === 0) {
            data.exercisesDocUri = data.exercisesTitle;
            if (data.exercisesTitle !== null) {
              data.exercisesTitle = data.exercisesTitle.substr(data.exercisesTitle.lastIndexOf('/') + 1);
            }

          } else {
            data.exercisesTitleHtml = marked(data.exercisesTitle);
          }
        });
      }
      res.json({
        err: false,
        code: result.code,
        msg: result.msg,
        courseExercises: result.content.responseData
      });
    }
  });
});

router.get('/codeStandard', function (req, res, next) {
  let service = new commonService.commonInvoke('codeStandardList4Technology');
  let technologyID = req.query.technologyID;
  service.queryWithParameter(technologyID, (result) => {
    if(result.err){
      res.json({
        err: true,
        code: result.code,
        msg: result.msg
      });
    }else{

      res.json({
        err: false,
        code: result.code,
        msg: result.msg,
        dataList: result.content.responseData
      });
    }
  });
});

router.get('/review/program', function (req, res, next) {
  let service = new commonService.commonInvoke('programReviewList');
  let courseExercisesID = req.query.courseExercisesID;
  let courseExercisesDetailID = req.query.courseExercisesDetailID;
  let parameter = `${courseExercisesID}/${courseExercisesDetailID}`;

  service.queryWithParameter(parameter, (result) => {
    if(result.err){
      res.json({
        err: true,
        code: result.code,
        msg: result.msg
      });
    }else{
      res.json({
        err: false,
        code: result.code,
        msg: result.msg,
        dataList: result.content.responseData
      });
    }
  });
});

router.post('/mark/program', function(req, res, next) {
  let service = new commonService.commonInvoke('markCourseProgramExercises');
  let data = {
    studentID: req.body.studentID,
    courseID: req.body.courseID,
    courseClass: req.body.courseClass,
    courseExercisesID: req.body.courseExercisesID,
    courseExercisesDetailID: req.body.courseExercisesDetailID,
    compilationResult: req.body.compilationResult,
    runResult: req.body.runResult,
    codeStandardResult: req.body.codeStandardResult,
    reviewResult: req.body.reviewResult,
    reviewMemo: req.body.reviewMemo,
    codeStandardErrorListJson: req.body.codeStandardErrorListJson,
    loginUser: req.body.loginUser
  };

  service.create(data, (result) => {
    if (result.err) {
      res.json({
        err: true,
        code: result.code,
        msg: result.msg
      });
    } else {
      res.json({
        err: false,
        code: result.code,
        msg: result.msg
      });
    }
  });
});

module.exports = router;
