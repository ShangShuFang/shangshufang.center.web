let pageApp = angular.module('pageApp', []);
pageApp.controller('pageCtrl', function ($scope, $http) {
  $scope.model = {
    selectedTechnology: {technologyID: 0, technologyName: '选择技术'},
    technologyList: [],
    selectedDataStatus: {statusCode: 'NULL', statusName: '所有状态'},
    dataStatusList: [
      {statusCode: 'P', statusName: '待审核'},
      {statusCode: 'A', statusName: '启用'},
      {statusCode: 'D', statusName: '禁用'}
    ],
    fromIndex : 0,
    toIndex: 0,
    pageNumber: 1,
    totalCount: 0,
    maxPageNumber: 0,
    dataList: [],
    paginationArray: [],
    prePageNum: -1,
    nextPageNum: -1
  };

  $scope.editModel = {
    exercisesID: 0,
    optionType: 'add',
    selectedTechnology: {technologyID: 0, technologyName: '选择技术'},
    technologyList: [],
    exercisesName: '',
    documentUrl: '',
    answerGitUrl: '',
    isShowUpload: false,
    loginUser: commonUtility.getLoginUser()
  };

  $scope.statusModel = {
    exercisesID: 0,
    modalTitle: '',
    status: '',
  };

  //region 页面初始化
  $scope.initPage = function () {
    commonUtility.setNavActive();
    $scope.initTechnologyList();
    $scope.loadData();
  };

  $scope.initTechnologyList = function () {
    $http.get('/common/technology').then(function successCallback (response) {
      if(response.data.err){
        bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
        return false;
      }
      if(response.data.dataList === null) {
        return false;
      }
      $scope.model.technologyList = response.data.dataList;
      $scope.editModel.technologyList = response.data.dataList;
    }, function errorCallback(response) {
      bootbox.alert(localMessage.NETWORK_ERROR);
    });
  };

  $scope.initUploadPlugin = function(){
    let uploadDocumentDir = {"dir1": "exercises", "dir2": `T${$scope.editModel.selectedTechnology.technologyID}`, "dir3": `comprehensive`};
    let uploadDocumentServerUrl = commonUtility.buildSystemRemoteUri(Constants.UPLOAD_SERVICE_URI, uploadDocumentDir);
    uploadUtils.initUploadPlugin('#file-upload', uploadDocumentServerUrl, ['pdf'], false, function (opt,data) {
      $scope.editModel.documentUrl = data.fileUrlList[0];
      $scope.$apply();
      layer.msg(localMessage.UPLOAD_SUCCESS);
    });
  };

  $scope.onTechnologyChange = function (technologyID, technologyName) {
    if($scope.model.selectedTechnology.technologyID === technologyID){
      return false;
    }
    $scope.model.selectedTechnology = {technologyID: technologyID, technologyName: technologyName};
    $scope.loadData();
  };
  
  $scope.onDataStatusChange = function (statusCode, statusName) {
    if($scope.model.selectedDataStatus.statusCode === statusCode){
      return false;
    }
    $scope.model.selectedDataStatus = {statusCode: statusCode, statusName: statusName};
    $scope.loadData();
  };
  
  $scope.onTechnologyChange4Edit = function (technologyID, technologyName) {
    $scope.editModel.selectedTechnology = {technologyID: technologyID, technologyName: technologyName};
    uploadUtils.destroyUploadPlugin('#file-upload');
    if (technologyID !== 0) {
      $scope.initUploadPlugin();
      $scope.editModel.documentUrl = "";
      $('#file-upload').show();
    } else {
      $('#file-upload').hide();
    }
  };

  $scope.loadData = function () {
    $http.get(`/exercises/comprehensive/list?pageNumber=${$scope.model.pageNumber}&technologyID=${$scope.model.selectedTechnology.technologyID}&dataStatus=${$scope.model.selectedDataStatus.statusCode}`)
    .then(function successCallback (response) {
      if(response.data.err){
        bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
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
      $scope.model.toIndex = response.data.dataContent.dataList === null ? 0 : ($scope.model.pageNumber - 1) * Constants.PAGE_SIZE + response.data.dataContent.dataList.length;
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

  $scope.onShowEditModal = function (data) {
    if (commonUtility.isEmpty(data)) {
      uploadUtils.destroyUploadPlugin('#file-upload');
      $('#file-upload').hide();
      $scope.editModel.exercisesID = 0;
      $scope.editModel.selectedTechnology = {technologyID: 0, technologyName: '选择技术'};
      $scope.editModel.exercisesName = '';
      $scope.editModel.answerGitUrl = '';
      $scope.editModel.documentUrl = '';
      $scope.editModel.optionType = 'add';
    } else {
      $scope.editModel.exercisesID = data.exercisesID;
      $scope.editModel.selectedTechnology = {technologyID: data.technologyID, technologyName: data.technologyName};
      $scope.editModel.exercisesName = data.exercisesName;
      $scope.editModel.answerGitUrl = data.answerUrl;
      $scope.editModel.documentUrl = data.documentUrl;
      uploadUtils.destroyUploadPlugin('#file-upload');
      $scope.initUploadPlugin();
      $('#file-upload').show();
      $scope.editModel.optionType = 'change';
    }

    
    $('#kt_modal_upload').modal('show');
  };

  $scope.add = function () {
    $http.post('/exercises/comprehensive', {
      exercisesName: $scope.editModel.exercisesName, 
      technologyID: $scope.editModel.selectedTechnology.technologyID,
      answerUrl: $scope.editModel.answerGitUrl,
      documentUrl: $scope.editModel.documentUrl,
      loginUser: $scope.editModel.loginUser.adminID
    }).then(function successCallback(response) {
      if(response.data.err){
        bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
        return false;
      }
      $scope.loadData();
      $('#kt_modal_upload').modal('hide');
    }, function errorCallback(response) {
      bootbox.alert(localMessage.NETWORK_ERROR);
    });
  };

  $scope.change = function () {
    $http.put('/exercises/comprehensive', {
      exercisesID: $scope.editModel.exercisesID, 
      exercisesName: $scope.editModel.exercisesName, 
      answerUrl: $scope.editModel.answerGitUrl,
      documentUrl: $scope.editModel.documentUrl,
      loginUser: $scope.editModel.loginUser.adminID
    }).then(function successCallback(response) {
      if(response.data.err){
        bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
        return false;
      }
      $scope.loadData();
      $('#kt_modal_upload').modal('hide');
    }, function errorCallback(response) {
      bootbox.alert(localMessage.NETWORK_ERROR);
    });
  };

  $scope.onSubmit = function(){
    if ($scope.editModel.optionType === 'add') {
      $scope.add();
    } else {
      $scope.change();
    }
  };

  $scope.onShowStatusModal = function (data) {
    $scope.statusModel.exercisesID = data.exercisesID;
    $scope.statusModel.modalTitle = `状态修改：${data.exercisesName}`;
    $('#kt_modal_status').modal('show');
  };

  $scope.onChangeStatus = function () {
    $http.put('/exercises/comprehensive/status', {
      exercisesID: $scope.statusModel.exercisesID, 
      status: $scope.statusModel.status, 
      loginUser: $scope.editModel.loginUser.adminID
    }).then(function successCallback(response) {
      if(response.data.err){
        bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
        return false;
      }
      $scope.loadData();
      $('#kt_modal_status').modal('hide');
    }, function errorCallback(response) {
      bootbox.alert(localMessage.NETWORK_ERROR);
    });
  };

  $scope.onDelete = function (data) {
    bootbox.confirm({
      message: `您确定要删除${data.exercisesName}吗？`,
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
          $http.delete(`/exercises/comprehensive?exercisesID=${data.exercisesID}`)
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
  }
  //endregion

  $scope.initPage();
});

angular.bootstrap(document.querySelector('[ng-app="pageApp"]'), ['pageApp']);