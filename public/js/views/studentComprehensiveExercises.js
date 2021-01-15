let pageApp = angular.module('pageApp', []);
pageApp.controller('pageCtrl', function ($scope, $http) {
  $scope.model = {
    //begin: 数据查询
    selectedLanguage: {languageID: 0, languageName: '全部编程语言'},
    languageList: [],

    selectedUniversity: {universityCode: 0, universityName: '所有高校'},
    universityList: [],

    selectedSchool: {schoolID: 0, schoolName: '所有二级学院'},
    schoolList: [],

    selectedMajor: {majorID: 0, majorName: '所有专业'},
    majorList: [],

    selectedStatus: {statusCode: 'NULL', statusName: '全部状态'},
    statusList: [{statusCode: 'P', statusName: '待批改'},{statusCode: 'Y', statusName: '正确'},{statusCode: 'N', statusName: '错误'}],

    fullName: '',
    //end: 数据查询

    //begin: 数据列表
    fromIndex : 0,
    toIndex: 0,
    pageNumber: 1,
    totalCount: 0,
    maxPageNumber: 0,
    dataList: [],
    paginationArray: [],
    prePageNum: -1,
    nextPageNum: -1,
    //end: 数据列表

    //begin: 信息编辑
    loginUser: commonUtility.getLoginUser()
    //end: 信息编辑
  };

  $scope.correctModel = {
    collectionID: 0,
    exercisesTitle: '',
    examTypeText: '',
    examKnowledge: '',
    difficultyLevelText: '',
    exercisesContent: '',
    fullName: '',
    universityName: '',
    schoolName: '',
    majorName: '',
    programLanguageName: '',
    gitUrl: '',
    dataStatus: '',
    correctResult: '',
    reviewMemo: ''
  };

  //region 页面初始化
  $scope.initPage = function () {
    commonUtility.setNavActive();
    $scope.loadProgramLanguage();
    $scope.loadUniversityList();
    $scope.loadData();
  };

  $scope.loadProgramLanguage = function () {
    $http.get('/common/programmingLanguage').then(function successCallback (response) {
      if(response.data.err){
        bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
        return false;
      }
      if(response.data.dataList === null){
        return false;
      }
      $scope.model.languageList = response.data.dataList;
    }, function errorCallback(response) {
      bootbox.alert(localMessage.NETWORK_ERROR);
    });
  };

  $scope.loadUniversityList = function (){
    $http.get('/common/university').then(function successCallback (response) {
      if(response.data.err){
        bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
        return false;
      }
      if(response.data.dataList === null){
        return false;
      }
      $scope.model.universityList = response.data.dataList;
    }, function errorCallback(response) {
      bootbox.alert(localMessage.NETWORK_ERROR);
    });
  };

  $scope.loadSchoolList = function (universityCode){
    if(universityCode === 0){
      $scope.model.selectedSchool = {schoolID: 0, schoolName: '所有二级学院'};
      $scope.model.schoolList.splice(0, $scope.model.schoolList.length);
      return false;
    }
    $http.get(`/common/school?universityCode=${universityCode}`)
        .then(function successCallback (response) {
          if(response.data.err){
            bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
            return false;
          }
          if(response.data.dataList === null){
            $scope.model.selectedSchool = {schoolID: 0, schoolName: '所有二级学院'};
            $scope.model.schoolList.splice(0, $scope.model.schoolList.length);
            return false;
          }
          $scope.model.selectedSchool = {schoolID: 0, schoolName: '所有二级学院'};
          $scope.model.schoolList = response.data.dataList;
        }, function errorCallback(response) {
          bootbox.alert(localMessage.NETWORK_ERROR);
        });
  };

  $scope.loadMajorList = function (universityCode, schoolID){
    if(universityCode === 0 || schoolID === 0){
      $scope.model.selectedMajor = {majorID: 0, majorName: '所有专业'};
      $scope.model.majorList.splice(0, $scope.model.majorList.length);
      return false;
    }
    $http.get(`/common/major?universityCode=${universityCode}&schoolID=${schoolID}`)
        .then(function successCallback (response) {
          if(response.data.err){
            bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
            return false;
          }
          if(response.data.dataList === null){
            $scope.model.selectedMajor = {majorID: 0, majorName: '所有专业'};
            $scope.model.majorList.splice(0, $scope.model.majorList.length);
            return false;
          }
          $scope.model.selectedMajor = {majorID: 0, majorName: '所有专业'};
          $scope.model.majorList = response.data.dataList;
        }, function errorCallback(response) {
          bootbox.alert(localMessage.NETWORK_ERROR);
        });
  };

  $scope.loadData = function(){
    $http.get('/student/comprehensive/exercises/dataList'
        .concat(`?pageNumber=${$scope.model.pageNumber}`)
        .concat(`&programLanguage=${$scope.model.selectedLanguage.languageID}`)
        .concat(`&universityCode=${$scope.model.selectedUniversity.universityCode}`)
        .concat(`&schoolID=${$scope.model.selectedSchool.schoolID}`)
        .concat(`&majorID=${$scope.model.selectedMajor.majorID}`)
        .concat(`&dataStatus=${$scope.model.selectedStatus.statusCode}`)
        .concat(`&fullName=${$scope.model.fullName}`))
        .then(function successCallback (response) {
          if(response.data.err){
            bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
            return false;
          }
          if(response.data.dataContent === null){
            return false;
          }
          if(response.data.dataContent.dataList !== null && response.data.dataContent.dataList.length === 0 && $scope.model.pageNumber > 1){
            $scope.model.pageNumber--;
            $scope.loadData();
            return false;
          }
          $scope.model.totalCount = response.data.dataContent.totalCount;
          $scope.model.dataList = response.data.dataContent.dataList;
          $scope.model.pageNumber = parseInt(response.data.dataContent.currentPageNum);
          $scope.model.maxPageNumber = Math.ceil(response.data.dataContent.totalCount / response.data.dataContent.pageSize);
          $scope.model.paginationArray = response.data.dataContent.paginationArray;
          $scope.model.prePageNum = response.data.dataContent.prePageNum === undefined ? -1 : response.data.dataContent.prePageNum;
          $scope.model.nextPageNum = response.data.dataContent.nextPageNum === undefined ? -1 : response.data.dataContent.nextPageNum;
          $scope.model.fromIndex = response.data.dataContent.dataList === null ? 0 : ($scope.model.pageNumber - 1) * Constants.PAGE_SIZE + 1;
          $scope.model.toIndex = response.data.dataContent.dataList === null ? 0 : ($scope.model.pageNumber - 1) * Constants.PAGE_SIZE + $scope.model.dataList.length;
        }, function errorCallback(response) {
          bootbox.alert(localMessage.NETWORK_ERROR);
        });
  };

  $scope.onPrePage = function(){
    if($scope.model.pageNumber === 1){
      return false;
    }
    $scope.model.pageNumber--;
    $scope.loadData();
  };

  $scope.onPagination = function(pageNumber){
    if($scope.model.pageNumber === pageNumber){
      return false;
    }
    $scope.model.pageNumber = pageNumber;
    $scope.loadData();
  };

  $scope.onNextPage = function(){
    if($scope.model.pageNumber === $scope.model.maxPageNumber){
      return false;
    }
    $scope.model.pageNumber++;
    $scope.loadData();
  };

  $scope.onLanguageChange = function (languageID, languageName) {
    if ($scope.model.selectedLanguage.languageID === languageID) {
      return false;
    }
    $scope.model.selectedLanguage = {languageID: languageID, languageName: languageName};
    $scope.loadData();
  };

  $scope.onUniversityChange = function(universityCode, universityName){
    if ($scope.model.selectedUniversity.universityCode === universityCode) {
      return false;
    }
    if (universityCode === 0) {
      $scope.model.selectedMajor = {majorID: 0, majorName: '所有专业'};
      $scope.model.majorList.splice(0, $scope.model.majorList.length);
    }
    $scope.model.selectedUniversity = {universityCode: universityCode, universityName: universityName};
    $scope.loadSchoolList($scope.model.selectedUniversity.universityCode);
    $scope.loadData();
  };

  $scope.onSchoolChange = function (schoolID, schoolName){
    if($scope.model.selectedSchool.schoolID === schoolID){
      return false;
    }
    $scope.model.selectedSchool = {schoolID: schoolID, schoolName: schoolName};
    $scope.loadMajorList($scope.model.selectedUniversity.universityCode, schoolID);
    $scope.loadData();
  };

  $scope.onMajorChange = function (majorID, majorName) {
    if ($scope.model.selectedMajor.majorID === majorID) {
      return false;
    }
    $scope.model.selectedMajor = {majorID: majorID, majorName: majorName};
    $scope.loadData();
  };

  $scope.onStatusChange = function (statusCode, statusName) {
    if ($scope.model.selectedStatus.statusCode === statusCode) {
      return false;
    }
    $scope.model.selectedStatus = {statusCode: statusCode, statusName: statusName};
    $scope.loadData();
  };

  $scope.onFullNameKeyDown = function (e) {
    if (e.keyCode === 13) {
      $scope.loadData();
    }
  };

  $scope.onCorrect = function (data) {
    $scope.correctModel.collectionID = data.collectionID;
    $scope.correctModel.exercisesTitle = data.exercisesTitle;
    $scope.correctModel.examTypeText = data.examTypeText;
    $scope.correctModel.examKnowledge = data.examKnowledge;
    $scope.correctModel.difficultyLevelText = data.difficultyLevelText;
    $scope.correctModel.exercisesContent = data.exercisesContent;
    $scope.correctModel.fullName = data.fullName;
    $scope.correctModel.universityName = data.universityName;
    $scope.correctModel.schoolName = data.schoolName;
    $scope.correctModel.majorName = data.majorName;
    $scope.correctModel.programLanguageName = data.programLanguageName;
    $scope.correctModel.gitUrl = data.gitUrl;
    $scope.correctModel.dataStatus = data.dataStatus;
    $scope.correctModel.correctResult = data.dataStatus;
    $scope.correctModel.reviewMemo = data.reviewMemo;
    $('#correct_modal').modal('show');
  }

  $scope.checkData = function () {
    if ($scope.correctModel.correctResult === 'P') {
      layer.msg('请选择批改结果');
      return false;
    }
    if (commonUtility.isEmpty($scope.correctModel.reviewMemo)) {
      layer.msg('请填写批改评语');
      return false;
    }
    return true;
  };

  $scope.submit = function () {
    $http.put('/student/comprehensive/exercises/correct', {
      collectionID: $scope.correctModel.collectionID,
      dataStatus: $scope.correctModel.correctResult,
      reviewMemo: $scope.correctModel.reviewMemo,
      loginUser: $scope.model.loginUser.adminID
    }).then(function successCallback(response) {
      if(response.data.err){
        bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
        return false;
      }
      $('#correct_modal').modal('hide');
      $scope.loadData();
    }, function errorCallback(response) {
      bootbox.alert(localMessage.NETWORK_ERROR);
    });
  };

  $scope.onSubmit = function () {
    if (!$scope.checkData()) {
      return false;
    }
    $scope.submit();
  }
  //endregion

  $scope.initPage();
});

angular.bootstrap(document.querySelector('[ng-app="pageApp"]'), ['pageApp']);