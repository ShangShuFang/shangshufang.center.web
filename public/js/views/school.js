let pageApp = angular.module('pageApp', []);
pageApp.controller('pageCtrl', function ($scope, $http) {
  $scope.model = {
    //begin: 数据查询
    selectedUniversity: {universityCode: 0, universityName: '所有高校'},
    universityList: [],
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
    modalTitle: '',
    schoolID: 0,
    universityList4Edit: [],
    selectedUniversity4Edit: {universityCode: 0, universityName: '请选择高校'},
    schoolName: '',
    schoolNameCompare: '',
    schoolNameIsInValid: Constants.CHECK_INVALID.DEFAULT,
    contacts: '',
    cellphone: '',
    cellphoneCompare: '',
    cellphoneIsInValid: Constants.CHECK_INVALID.DEFAULT,
    add: true,
    //end: 信息编辑

    //begin: 状态编辑
    statusSchoolID: 0,
    statusUniversityCode: 0,
    statusModalTitle: '',
    status: '',
    isActive: true,
    //end: 状态编辑
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

  $scope.loadData = function(){
    $http.get(`/school/dataList?pageNumber=${$scope.model.pageNumber}&universityCode=${$scope.model.selectedUniversity.universityCode}`)
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

  $scope.onUniversityChange = function(universityCode, universityName){
    if($scope.model.selectedUniversity.universityCode === universityCode){
      return false;
    }
    $scope.model.selectedUniversity = {universityCode: universityCode, universityName: universityName};
    $scope.loadData();
  };
  //endregion

  //region 添加数据
  $scope.setDefaultValue = function (){
    $scope.model.schoolID = 0;
    $scope.model.schoolName = '';
    $scope.model.schoolNameIsInValid = Constants.CHECK_INVALID.DEFAULT;
    $scope.model.contacts = '';
    $scope.model.cellphone = '';
    $scope.model.cellphoneIsInValid = Constants.CHECK_INVALID.DEFAULT;
    $scope.model.selectedUniversity4Edit = {universityCode: 0, universityName: '请选择高校'};
  };

  $scope.onShowAddModal = function(){
    $scope.setDefaultValue();
    $scope.model.modalTitle = '添加二级学院';
    $scope.model.add = true;
    $('#kt_modal_edit').modal('show');
  };

  $scope.onUniversityChange4Edit = function (universityCode, universityName){
    $scope.model.selectedUniversity4Edit = {universityCode: universityCode, universityName: universityName};
  };

  $scope.onSchoolNameBlur = function(){
    if($scope.model.selectedUniversity4Edit.universityCode === 0 ){
      return false;
    }
    if(commonUtility.isEmpty($scope.model.schoolName)){
      $scope.model.schoolNameIsInValid = Constants.CHECK_INVALID.DEFAULT;
      return false;
    }

    if($scope.model.schoolName === $scope.model.schoolNameCompare){
      $scope.model.schoolNameIsInValid = Constants.CHECK_INVALID.DEFAULT;
      return false;
    }

    $http.get(`/school/checkSchoolName?universityCode=${$scope.model.selectedUniversity4Edit.universityCode}&schoolName=${$scope.model.schoolName}`)
        .then(function successCallback (response) {
          if(response.data.err){
            $scope.model.schoolNameIsInValid = Constants.CHECK_INVALID.DEFAULT;
            bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
            return false;
          }

          $scope.model.schoolNameIsInValid =
              response.data.result ?
                  Constants.CHECK_INVALID.INVALID
                  : Constants.CHECK_INVALID.VALID;
        }, function errorCallback(response) {
          bootbox.alert(localMessage.NETWORK_ERROR);
        });
  };

  $scope.onCellphoneBlur = function(){
    if(commonUtility.isEmpty($scope.model.cellphone)){
      $scope.model.cellphoneIsInValid = Constants.CHECK_INVALID.DEFAULT;
      return false;
    }

    if($scope.model.cellphone === $scope.model.cellphoneCompare){
      $scope.model.cellphoneIsInValid = Constants.CHECK_INVALID.DEFAULT;
      return false;
    }

    $http.get('/school/checkCellphone?cellphone=' + $scope.model.cellphone)
        .then(function successCallback (response) {
          if(response.data.err){
            $scope.model.cellphoneIsInValid = Constants.CHECK_INVALID.DEFAULT;
            bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
            return false;
          }

          $scope.model.cellphoneIsInValid =
              response.data.result ?
                  Constants.CHECK_INVALID.INVALID
                  : Constants.CHECK_INVALID.VALID;
        }, function errorCallback(response) {
          bootbox.alert(localMessage.NETWORK_ERROR);
        });
  };

  $scope.add = function(){
    $http.post('/school', {
      schoolName: $scope.model.schoolName,
      universityCode: $scope.model.selectedUniversity4Edit.universityCode,
      contacts: $scope.model.contacts,
      cellphone: $scope.model.cellphone,
      loginUser: '1'
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
    $scope.model.modalTitle = '修改二级学院';
    $scope.model.schoolID = data.schoolID;
    $scope.model.schoolName = data.schoolName;
    $scope.model.schoolNameCompare = data.schoolName;
    $scope.model.schoolNameIsInValid = Constants.CHECK_INVALID.VALID;
    $scope.model.selectedUniversity4Edit = {universityCode: data.universityCode, universityName: data.universityName};
    $scope.model.contacts = data.contacts;
    $scope.model.cellphone = data.cellphone;
    $scope.model.cellphoneCompare = data.cellphone;
    $scope.model.cellphoneIsInValid = Constants.CHECK_INVALID.DEFAULT;
    $scope.model.add = false;
    $('#kt_modal_edit').modal('show');
  };

  $scope.change = function(){
    $http.put('/school', {
      schoolID: $scope.model.schoolID,
      schoolName: $scope.model.schoolName,
      universityCode: $scope.model.selectedUniversity4Edit.universityCode,
      contacts: $scope.model.contacts,
      cellphone: $scope.model.cellphone,
      loginUser: '1'
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

  // region 更新状态
  $scope.onShowStatusModal = function (data) {
    $scope.model.statusModalTitle = `修改状态：${data.universityName} ${data.schoolName}`;
    $scope.model.statusSchoolID = data.schoolID;
    $scope.model.statusUniversityCode = data.universityCode;
    $scope.model.status = data.dataStatus;
    $scope.model.isActive = data.dataStatus === Constants.DATA_STATUS.ACTIVE;
    $('#kt_modal_status').modal('show');
  };

  $scope.onChangeStatus = function () {
    $http.put('/school/status', {
      schoolID: $scope.model.statusSchoolID,
      universityCode: $scope.model.statusUniversityCode,
      status: $scope.model.status,
      loginUser: '1'
    }).then(function successCallback(response) {
      if(response.data.err){
        bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
        return false;
      }
      $('#kt_modal_status').modal('hide');
      $scope.loadData();
    }, function errorCallback(response) {
      bootbox.alert(localMessage.NETWORK_ERROR);
    });
  };
  //endregion

  // region 删除数据
  $scope.onDelete = function(data){
    bootbox.confirm({
      message: `您确定要删除${data.universityName}的${data.schoolName}吗？`,
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
          $http.delete(`school?universityCode=${data.universityCode}&schoolID=${data.schoolID}`)
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