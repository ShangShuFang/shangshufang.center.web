let pageApp = angular.module('pageApp', []);
pageApp.controller('pageCtrl', function ($scope, $http) {
  $scope.model = {
    //begin: 数据查询
    selectedProgrammeLanguage: {languageID: 0, languageName: '所有编程语言'},
    programmeLanguageList: [],
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
    loginUser: commonUtility.getLoginUser(),
    modalTitle: '',
    codeStandardID: 0,
    programmeLanguageList4Edit: [],
    selectedProgrammeLanguage4Edit: {languageID: 0, languageName: '请选择编程语言'},
    codeStandardName: '',
    codeStandardNameIsInValid: Constants.CHECK_INVALID.DEFAULT,
    add: true,
    //end: 信息编辑
  };

  //region 页面初始化
  $scope.initPage = function () {
    commonUtility.setNavActive();
    $scope.loadProgrammingLanguage();
    $scope.loadData();
  };

  $scope.loadProgrammingLanguage = function(){
    $http.get(`/technology/programmingLanguage`).then(function successCallback (response) {
      if(response.data.err){
        bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
        return false;
      }
      if(response.data.dataList === null){
        return false;
      }

      $scope.model.programmeLanguageList = response.data.dataList;
      $scope.model.programmeLanguageList4Edit = response.data.dataList;
    }, function errorCallback(response) {
      bootbox.alert(localMessage.NETWORK_ERROR);
    });
  };

  $scope.loadData = function(){
    $http.get(`/codeStandard/dataList?pageNumber=${$scope.model.pageNumber}&languageID=${$scope.model.selectedProgrammeLanguage.languageID}`)
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
          $scope.model.pageNumber = response.data.dataContent.currentPageNum;
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

  $scope.onProgrammeLanguageChange = function(languageID, languageName){
    $scope.model.selectedProgrammeLanguage = {languageID: languageID, languageName: languageName};
    $scope.loadData();
  };
  //endregion

  //region 添加数据
  $scope.setDefaultValue = function (){
    $scope.model.codeStandardID = 0;
    $scope.model.selectedProgrammeLanguage4Edit = {languageID: 0, languageName: '请选择编程语言'};
    $scope.model.codeStandardName = '';
  };

  $scope.onShowAddModal = function(){
    $scope.setDefaultValue();
    $scope.model.modalTitle = '添加编码规范';
    $scope.model.add = true;
    $('#kt_modal_edit').modal('show');
  };

  $scope.onProgrammeLanguageChange4Edit = function (languageID, languageName){
    $scope.model.selectedProgrammeLanguage4Edit = {languageID: languageID, languageName: languageName};
  };

  $scope.add = function(){
    $http.post('/codeStandard', {
      languageID: $scope.model.selectedProgrammeLanguage4Edit.languageID,
      codeStandardName: $scope.model.codeStandardName,
      loginUser: $scope.model.loginUser.adminID
    }).then(function successCallback(response) {
      if(response.data.err){
        bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
        return false;
      }
      $('#kt_modal_edit').modal('hide');
      $scope.loadData();
    }, function errorCallback(response) {
      bootbox.alert(localMessage.NETWORK_ERROR);
    });
  };

  $scope.onSubmit = function(){
    if($scope.model.add){
      $scope.add();
    }else{
      $scope.change();
    }
  };

  //endregion

  //region 修改数据
  $scope.onShowChangeModal = function (data){
    $scope.setDefaultValue();
    $scope.model.modalTitle = '修改编码规范';
    $scope.model.codeStandardID = data.codeStandardID;
    $scope.model.selectedProgrammeLanguage4Edit = {languageID: data.languageID, languageName: data.languageName};
    $scope.model.codeStandardName = data.codeStandardName;
    $scope.model.codeStandardNameIsInValid = Constants.CHECK_INVALID.VALID;
    $scope.model.add = false;
    $('#kt_modal_edit').modal('show');
  };

  $scope.onCodeStandardNameBlur = function(){
    if($scope.model.selectedProgrammeLanguage4Edit.languageID === 0 ){
      return false;
    }

    if(commonUtility.isEmpty($scope.model.codeStandardName)){
      $scope.model.codeStandardNameIsInValid = Constants.CHECK_INVALID.DEFAULT;
      return false;
    }

    // if($scope.model.schoolName === $scope.model.schoolNameCompare){
    //   $scope.model.schoolNameIsInValid = Constants.CHECK_INVALID.DEFAULT;
    //   return false;
    // }

    $http.get(`/codeStandard/checkName?languageID=${$scope.model.selectedProgrammeLanguage4Edit.languageID}&codeStandardName=${$scope.model.codeStandardName}`)
        .then(function successCallback (response) {
          if(response.data.err){
            $scope.model.codeStandardNameIsInValid = Constants.CHECK_INVALID.DEFAULT;
            bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
            return false;
          }

          $scope.model.codeStandardNameIsInValid =
              response.data.result ?
                  Constants.CHECK_INVALID.INVALID
                  : Constants.CHECK_INVALID.VALID;
        }, function errorCallback(response) {
          bootbox.alert(localMessage.NETWORK_ERROR);
        });
  };

  $scope.change = function(){
    $http.put('/codeStandard', {
      codeStandardID: $scope.model.codeStandardID,
      languageID: $scope.model.selectedProgrammeLanguage4Edit.languageID,
      codeStandardName: $scope.model.codeStandardName,
      loginUser: $scope.model.loginUser.adminID
    }).then(function successCallback(response) {
      if(response.data.err){
        bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
        return false;
      }
      $('#kt_modal_edit').modal('hide');
      $scope.loadData();
    }, function errorCallback(response) {
      bootbox.alert(localMessage.NETWORK_ERROR);
    });
  };
  //endregion

  // region 删除数据
  $scope.onDelete = function(data){
    bootbox.confirm({
      message: `您确定要删除${data.codeStandardName}吗？`,
      buttons: {
        confirm: {
          label: '确认',
          className: 'btn-danger'
        },
        cancel: {
          label: '取消',
          className: 'btn-secondary'
        }
      },
      callback: function (result) {
        if(result) {
          $http.delete(`/codeStandard?languageID=${data.languageID}&codeStandardID=${data.codeStandardID}`)
              .then(function successCallback(response) {
                if(response.data.err){
                  bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
                  return false;
                }
                $scope.loadData();
              }, function errorCallback(response) {
                bootbox.alert(localMessage.NETWORK_ERROR);
              });
        }
      }
    });
  };
  //endregion

  $scope.initPage();
});

angular.bootstrap(document.querySelector('[ng-app="pageApp"]'), ['pageApp']);