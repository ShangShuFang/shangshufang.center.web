let pageApp = angular.module('pageApp', []);
pageApp.controller('pageCtrl', function ($scope, $sce, $http) {
  $scope.model = {
    title: '',
    studentID: 0,
    courseID: 0,
    courseClass: 0,
    courseExercisesID: 0,
    courseExercisesDetailID: 0,
    studentName: '',
    languageID: 0,
    exercisesStatus: '',
    exercisesStatusText: '',
    createTime: '',
    submitTime: '',
    choiceList: [],
    blankList: [],
    programList: [],
    loginUser: commonUtility.getLoginUser()
  };
  $scope.reviewModel = {
    title: '',
    compilationResult: REVIEW_RESULT.INIT,
    runResult: REVIEW_RESULT.INIT,
    codeStandardResult: REVIEW_RESULT.INIT,
    reviewResult: REVIEW_RESULT.INIT,
    reviewMemo: '',
    codeStandardList: [],
    codeStandardErrorList: [],
  };
  $scope.reviewHistoryModel = {
    title: '',
    dataList: []
  };

  //#region 页面初始化
  $scope.initPage = function () {
    commonUtility.setNavActive();
    $scope.loadExercises();
  };

  $scope.loadExercises = function () {
    let courseExercisesID = $('#hidden_courseExercisesID').val();
    $http.get('/knowledge/exercises/detail/data'
        .concat(`?courseExercisesID=${courseExercisesID}`))
        .then(function successCallback(response) {
          if (response.data.err) {
            bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
            return false;
          }

          $scope.model.title = `${response.data.courseExercises.courseName}（第${response.data.courseExercises.courseClass}节）`;
          $scope.model.studentID = response.data.courseExercises.studentID;
          $scope.model.languageID = response.data.courseExercises.languageID;
          $scope.model.courseID = response.data.courseExercises.courseID;
          $scope.model.courseClass = response.data.courseExercises.courseClass;
          $scope.model.courseExercisesID = response.data.courseExercises.courseExercisesID;
          $scope.model.studentName = response.data.courseExercises.studentName;
          $scope.model.createTime = response.data.courseExercises.createTime;
          $scope.model.exercisesStatus = response.data.courseExercises.dataStatus;
          $scope.model.exercisesStatusText = response.data.courseExercises.dataStatusText;
          if (response.data.courseExercises.createTime !== response.data.courseExercises.updateTime) {
            $scope.model.submitTime = response.data.courseExercises.updateTime;
          }
          response.data.courseExercises.singleChoiceExercisesList.forEach((data) => {
            data.exercisesTitleHtml = $sce.trustAsHtml(data.exercisesTitleHtml);
          });
          response.data.courseExercises.multipleChoiceExercisesList.forEach((data) => {
            data.exercisesTitleHtml = $sce.trustAsHtml(data.exercisesTitleHtml);
          });
          response.data.courseExercises.blankExercisesList.forEach((data) => {
            data.exercisesTitleHtml = $sce.trustAsHtml(data.exercisesTitleHtml);
          });
          response.data.courseExercises.programExercisesList.forEach((data) => {
            if (data.exercisesSourceType === 1) {
              data.exercisesTitleHtml = $sce.trustAsHtml(data.exercisesTitleHtml);
            }
          });

          $scope.model.singleChoiceList = response.data.courseExercises.singleChoiceExercisesList;
          $scope.model.multipleChoiceList = response.data.courseExercises.multipleChoiceExercisesList;
          $scope.model.blankList = response.data.courseExercises.blankExercisesList;
          $scope.model.programList = response.data.courseExercises.programExercisesList;
          $scope.loadCodeStandard(response.data.courseExercises.technologyID);
        }, function errorCallback(response) {
          bootbox.alert(localMessage.NETWORK_ERROR);
        });
  };

  $scope.loadCodeStandard = function (technologyID) {
    $http.get('/knowledge/exercises/detail/codeStandard'
        .concat(`?technologyID=${technologyID}`))
        .then(function successCallback(response) {
          if (response.data.err) {
            bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
            return false;
          }
          $scope.reviewModel.codeStandardList = response.data.dataList;
        }, function errorCallback(response) {
          bootbox.alert(localMessage.NETWORK_ERROR);
        });
  };

  //#endregion

  //#region 编程题批改
  $scope.showMarkDialog = function (program) {
    $scope.model.courseExercisesDetailID = program.courseExercisesDetailID;
    $scope.reviewModel.title = program.exercisesTitle;
    $scope.reviewModel.compilationResult = REVIEW_RESULT.INIT;
    $scope.reviewModel.runResult = REVIEW_RESULT.INIT;
    $scope.reviewModel.codeStandardResult = REVIEW_RESULT.INIT;
    $scope.reviewModel.reviewResult = REVIEW_RESULT.INIT;
    $scope.reviewModel.reviewMemo = '';
    $scope.reviewModel.codeStandardErrorList = [];
    $('#kt_modal_review').modal('show');
  };

  $scope.onCodeStandardClick = function (event) {
    let checked = event.target.checked;
    let value = event.target.value;
    if (checked) {
      $scope.addErrorCodeStandard(value);
    } else {
      $scope.removeErrorCodeStandard(value);
    }
  };

  $scope.addErrorCodeStandard = function (value) {
    $scope.reviewModel.codeStandardErrorList.push(value);
  };

  $scope.removeErrorCodeStandard = function (value) {
    let index = -1;
    for (let i = 0; i < $scope.reviewModel.codeStandardErrorList.length; i++) {
      if ($scope.reviewModel.codeStandardErrorList[i] === value) {
        index = i;
        break;
      }
    }
    if (index >= 0) {
      $scope.reviewModel.codeStandardErrorList.splice(index, 1);
    }
  };

  $scope.checkData = function () {
    if ($scope.reviewModel.compilationResult === REVIEW_RESULT.INIT) {
      bootbox.alert('请选择编译结果！');
      return false;
    }

    if ($scope.reviewModel.runResult === REVIEW_RESULT.INIT) {
      bootbox.alert('请选择运行结果！');
      return false;
    }
    if ($scope.reviewModel.codeStandardResult === REVIEW_RESULT.INIT) {
      bootbox.alert('请选择代码规范结果！');
      return false;
    }
    if ($scope.reviewModel.reviewResult === REVIEW_RESULT.INIT) {
      bootbox.alert('请选择综合评定结果！');
      return false;
    }
    if ($scope.reviewModel.codeStandardResult === REVIEW_RESULT.NOT_PASS
        && $scope.reviewModel.codeStandardErrorList.length === 0) {
      bootbox.alert('请选择代码规范存在的问题！');
      return false;
    }
    return true;
  };

  $scope.onReviewSubmit = function () {
    if (!$scope.checkData()) {
      return false;
    }
    let btn = $('#btnReviewSubmit');
    $(btn).attr('disabled', true);
    KTApp.progress(btn);


    let codeStandardErrorObject = [];
    $scope.reviewModel.codeStandardErrorList.forEach((codeStandardID) => {
      codeStandardErrorObject.push({
        studentID: $scope.model.studentID,
        courseID: $scope.model.courseID,
        courseClass: $scope.model.courseClass,
        courseExercisesID: $scope.model.courseExercisesID,
        courseExercisesDetailID: $scope.model.courseExercisesDetailID,
        languageID: $scope.model.languageID,
        codeStandardID: codeStandardID,
        loginUser: $scope.model.loginUser.adminID
      });
    });
    $http.post('/knowledge/exercises/detail/mark/program', {
      studentID: $scope.model.studentID,
      courseID: $scope.model.courseID,
      courseClass: $scope.model.courseClass,
      courseExercisesID: $scope.model.courseExercisesID,
      courseExercisesDetailID: $scope.model.courseExercisesDetailID,
      compilationResult: $scope.reviewModel.compilationResult,
      runResult: $scope.reviewModel.runResult,
      codeStandardResult: $scope.reviewModel.codeStandardResult,
      reviewResult: $scope.reviewModel.reviewResult,
      reviewMemo: $scope.reviewModel.reviewMemo,
      codeStandardErrorListJson: JSON.stringify(codeStandardErrorObject),
      loginUser: $scope.model.loginUser.adminID
    }).then(function successCallback(response) {
      if (response.data.err) {
        KTApp.unprogress(btn);
        $(btn).removeAttr('disabled');
        bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
        return false;
      }
      KTApp.unprogress(btn);
      $(btn).removeAttr('disabled');
      $('#kt_modal_review').modal('hide');
      $scope.loadExercises();
    }, function errorCallback(response) {
      bootbox.alert(localMessage.NETWORK_ERROR);
    });
  }
  //#endregion

  //region 批改历史
  $scope.showMarkHistoryDialog = function (program) {
    $scope.model.courseExercisesID = program.courseExercisesID;
    $scope.model.courseExercisesDetailID = program.courseExercisesDetailID;
    $scope.reviewHistoryModel.title = program.exercisesTitle;
    $http.get('/knowledge/exercises/detail/review/program'
        .concat(`?courseExercisesID=${$scope.model.courseExercisesID}`)
				.concat(`&courseExercisesDetailID=${$scope.model.courseExercisesDetailID}`))
        .then(function successCallback(response) {
          if (response.data.err) {
            bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
            return false;
          }
          $scope.reviewHistoryModel.dataList = response.data.dataList;
					$('#kt_modal_review_history').modal('show');
        }, function errorCallback(response) {
          bootbox.alert(localMessage.NETWORK_ERROR);
        });
  }
  //endregion
  $scope.initPage();
});

angular.bootstrap(document.querySelector('[ng-app="pageApp"]'), ['pageApp']);