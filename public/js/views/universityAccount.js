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
    modalTitle: '',
    accountID: 0,
    universityList4Edit: [],
    selectedUniversity4Edit: {universityCode: 0, universityName: '请选择高校'},
    schoolList4Edit: [],
    selectedSchool4Edit: {schoolID: 0, schoolName: '请选择二级学院'},
    customerID: 0,
    customerName: '',
    cellphone: '',
    cellphoneCompare: '',
    cellphoneIsInValid: Constants.CHECK_INVALID.DEFAULT,
    add: true,
    //end: 信息编辑

    //begin: 状态编辑
    statusAccountID: 0,
    statusUniversityCode: 0,
    statusSchoolID: 0,
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
    $http.get(`/universityAccount/dataList?pageNumber=${$scope.model.pageNumber}&universityCode=${$scope.model.selectedUniversity.universityCode}&schoolID=${$scope.model.selectedSchool.schoolID}`)
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
    $scope.model.customerName = '';
    $scope.model.cellphone = '';
    $scope.model.cellphoneIsInValid = Constants.CHECK_INVALID.DEFAULT;

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
    $scope.model.modalTitle = '添加管理员账户';
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

  $scope.onCellphoneBlur = function(){
    if(commonUtility.isEmpty($scope.model.cellphone)){
      $scope.model.cellphoneIsInValid = Constants.CHECK_INVALID.DEFAULT;
      return false;
    }

    if($scope.model.cellphone === $scope.model.cellphoneCompare){
      $scope.model.cellphoneIsInValid = Constants.CHECK_INVALID.DEFAULT;
      return false;
    }

    $http.get('/universityAccount/checkCellphone?cellphone=' + $scope.model.cellphone)
        .then(function successCallback (response) {
          if(response.data.err){
            $scope.model.cellphoneIsInValid = Constants.CHECK_INVALID.DEFAULT;
            bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
            return false;
          }
          if(response.data.result){
            $scope.model.cellphoneCompare = $scope.model.cellphone;
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
    $http.post('/universityAccount', {
      universityCode: $scope.model.selectedUniversity4Edit.universityCode,
      schoolID: $scope.model.selectedSchool4Edit.schoolID,
      fullName: $scope.model.customerName,
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
    $scope.model.modalTitle = '修改管理员账户';
    $scope.model.accountID = data.accountID;
    $scope.model.selectedUniversity4Edit = {universityCode: data.universityCode, universityName: data.universityName};
    $scope.model.selectedSchool4Edit = {schoolID: data.schoolID, schoolName: data.schoolName};
    $scope.model.customerID = data.customerID;
    $scope.model.customerName = data.customerName;
    $scope.model.cellphone = data.cellphone;
    $scope.model.cellphoneCompare = data.cellphone;
    $scope.model.cellphoneIsInValid = Constants.CHECK_INVALID.DEFAULT;
    $scope.model.add = false;
    $('#kt_modal_edit').modal('show');
  };

  $scope.change = function(){
    $http.put('/universityAccount', {
      accountID: $scope.model.accountID,
      universityCode: $scope.model.selectedUniversity4Edit.universityCode,
      schoolID: $scope.model.selectedSchool4Edit.schoolID,
      customerID: $scope.model.customerID,
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
    $scope.model.statusModalTitle = `修改${data.customerName}老师的账户状态`;
    $scope.model.statusAccountID = data.accountID;
    $scope.model.statusUniversityCode = data.universityCode;
    $scope.model.statusSchoolID = data.schoolID;
    $scope.model.status = data.dataStatus;
    $scope.model.isActive = data.dataStatus === Constants.DATA_STATUS.ACTIVE;
    $('#kt_modal_status').modal('show');
  };

  $scope.onChangeStatus = function () {
    $http.put('/universityAccount/status', {
      universityCode: $scope.model.statusUniversityCode,
      schoolID: $scope.model.statusSchoolID,
      accountID: $scope.model.statusAccountID,
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
      message: `您确定要删除${data.customerName}老师的账号吗？`,
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
          $http.delete(`universityAccount?universityCode=${data.universityCode}&schoolID=${data.schoolID}&accountID=${data.accountID}&customerID=${data.customerID}`)
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