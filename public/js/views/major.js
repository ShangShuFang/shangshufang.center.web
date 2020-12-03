let pageApp = angular.module('pageApp', []);
pageApp.controller('pageCtrl', function ($scope, $http) {
  $scope.model = {
    //begin: 数据查询
    selectedUniversity: {universityCode: 0, universityName: '所有高校'},
    universityList: [],

    selectedSchool: {schoolID: 0, schoolName: '所有二级学院'},
    schoolList: [],
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
    majorID: 0,
    universityList4Edit: [],
    selectedUniversity4Edit: {universityCode: 0, universityName: '请选择高校'},
    schoolList4Edit: [],
    selectedSchool4Edit: {schoolID: 0, schoolName: '请选择二级学院'},
    majorName: '',
    majorNameIsInValid: Constants.CHECK_INVALID.DEFAULT,
    add: true,
    //end: 信息编辑
  };

  //region 页面初始化
  $scope.initPage = function () {
    commonUtility.setNavActive();
    $scope.loadUniversityList();
    $scope.loadData();
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
      $scope.model.universityList4Edit = response.data.dataList;
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

  $scope.loadData = function(){
    $http.get(`/major/dataList?pageNumber=${$scope.model.pageNumber}&universityCode=${$scope.model.selectedUniversity.universityCode}&schoolID=${$scope.model.selectedSchool.schoolID}`)
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

  $scope.onUniversityChange = function(universityCode, universityName){
    $scope.model.selectedUniversity = {universityCode: universityCode, universityName: universityName};
    $scope.loadSchoolList($scope.model.selectedUniversity.universityCode);
    $scope.loadData();
  };

  $scope.onSchoolChange = function (schoolID, schoolName){
    if($scope.model.selectedSchool.schoolID === schoolID){
      return false;
    }
    $scope.model.selectedSchool = {schoolID: schoolID, schoolName: schoolName};
    $scope.loadData();
  };

  //endregion

  //region 添加数据
  $scope.setDefaultValue = function (){
    $scope.model.accountID = 0;
    $scope.model.selectedUniversity4Edit = {universityCode: 0, universityName: '请选择高校'};
    $scope.model.selectedSchool4Edit = {schoolID: 0, schoolName: '请选择二级学院'};
    $scope.model.majorName = '';
  };

  $scope.loadSchoolList4Edit = function (universityCode){
    if(universityCode === 0){
      $scope.model.selectedSchool4Edit = {schoolID: 0, schoolName: '所有二级学院'};
      $scope.model.schoolList4Edit.splice(0, $scope.model.schoolList4Edit.length);
      return false;
    }
    $http.get(`/common/school?universityCode=${universityCode}`)
        .then(function successCallback (response) {
          if(response.data.err){
            bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
            return false;
          }
          if(response.data.dataList === null){
            $scope.model.selectedSchool4Edit = {schoolID: 0, schoolName: '请选择二级学院'};
            $scope.model.schoolList4Edit.splice(0, $scope.model.schoolList4Edit.length);
            return false;
          }
          $scope.model.selectedSchool4Edit = {schoolID: 0, schoolName: '请选择二级学院'};
          $scope.model.schoolList4Edit = response.data.dataList;
        }, function errorCallback(response) {
          bootbox.alert(localMessage.NETWORK_ERROR);
        });
  };

  $scope.onShowAddModal = function(){
    $scope.setDefaultValue();
    $scope.model.modalTitle = '添加专业';
    $scope.model.add = true;
    $('#kt_modal_edit').modal('show');
  };

  $scope.onUniversityChange4Edit = function (universityCode, universityName){
    $scope.model.selectedUniversity4Edit = {universityCode: universityCode, universityName: universityName};
    $scope.loadSchoolList4Edit($scope.model.selectedUniversity4Edit.universityCode);
  };

  $scope.onSchoolChange4Edit = function (schoolID, schoolName){
    $scope.model.selectedSchool4Edit = {schoolID: schoolID, schoolName: schoolName};
  };

  $scope.add = function(){
    $http.post('/major', {
      universityCode: $scope.model.selectedUniversity4Edit.universityCode,
      schoolID: $scope.model.selectedSchool4Edit.schoolID,
      majorName: $scope.model.majorName,
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
    $scope.model.modalTitle = '修改专业名称';
    $scope.model.majorID = data.majorID;
    $scope.model.selectedUniversity4Edit = {universityCode: data.universityCode, universityName: data.universityName};
    $scope.model.selectedSchool4Edit = {schoolID: data.schoolID, schoolName: data.schoolName};
    $scope.model.majorName = data.majorName;
    $scope.model.schoolNameIsInValid = Constants.CHECK_INVALID.VALID;
    $scope.model.add = false;
    $('#kt_modal_edit').modal('show');
  };

  $scope.onMajorNameBlur = function(){
    if($scope.model.selectedUniversity4Edit.universityCode === 0 ){
      return false;
    }

    if($scope.model.selectedSchool4Edit.schoolID === 0 ){
      return false;
    }

    if(commonUtility.isEmpty($scope.model.majorName)){
      $scope.model.majorNameIsInValid = Constants.CHECK_INVALID.DEFAULT;
      return false;
    }

    // if($scope.model.schoolName === $scope.model.schoolNameCompare){
    //   $scope.model.schoolNameIsInValid = Constants.CHECK_INVALID.DEFAULT;
    //   return false;
    // }

    $http.get(`/major/checkName?universityCode=${$scope.model.selectedUniversity4Edit.universityCode}&schoolID=${$scope.model.selectedSchool4Edit.schoolID}&majorName=${$scope.model.majorName}`)
        .then(function successCallback (response) {
          if(response.data.err){
            $scope.model.majorNameIsInValid = Constants.CHECK_INVALID.DEFAULT;
            bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
            return false;
          }

          $scope.model.majorNameIsInValid =
              response.data.result ?
                  Constants.CHECK_INVALID.INVALID
                  : Constants.CHECK_INVALID.VALID;
        }, function errorCallback(response) {
          bootbox.alert(localMessage.NETWORK_ERROR);
        });
  };

  $scope.change = function(){
    $http.put('/major', {
      majorID: $scope.model.majorID,
      universityCode: $scope.model.selectedUniversity4Edit.universityCode,
      schoolID: $scope.model.selectedSchool4Edit.schoolID,
      majorName: $scope.model.majorName,
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
      message: `您确定要删除${data.majorName}专业吗？`,
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
          $http.delete(`/major?universityCode=${data.universityCode}&schoolID=${data.schoolID}&majorID=${data.majorID}`)
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