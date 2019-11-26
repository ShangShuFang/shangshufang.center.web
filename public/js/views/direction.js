let pageApp = angular.module('pageApp', []);
pageApp.controller('pageCtrl', function ($scope, $http) {
  $scope.model = {
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

    //begin: 缩略图上传
    thumbnailModalTitle: '',
    directionID_thumbnail: 0,
    thumbnailUrl: '',
    //end: Brand编辑

    //begin: 相关技术
    relateTechnologyModalTitle: '',
    relateTechnologyList: [],
    //end: 相关技术

    //begin: 信息编辑
    loginUser: commonUtility.getLoginUser(),
    modalTitle: '',
    directionID: 0,
    directionName: '',
    directionNameIsInValid: Constants.CHECK_INVALID.DEFAULT,
    directionStars: 0,
    directionThumbnail: '',
    directionMemo: '',
    add: true,
    //end: 信息编辑

    //begin: 状态编辑
    directionID_status: 0,
    statusModalTitle: '',
    status: '',
    isActive: true,
    //end: 状态编辑
  };

  //region 页面初始化
  $scope.initPage = function () {
    commonUtility.setNavActive();
    $scope.loadData();
  };

  $scope.loadData = function(){
    $http.get(`/direction/dataList?pageNumber=${$scope.model.pageNumber}`)
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

  $scope.showRelateTechnology = function (data){
    if(data.technologyCount === 0){
      return false;
    }
    $http.get(`/direction/relateTechnology?directionID=${data.directionID}`)
        .then(function successCallback (response) {
          if(response.data.err){
            bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
            return false;
          }
          if(response.data.dataList === null){
            return false;
          }
          $scope.model.relateTechnologyList = response.data.dataList;
          $scope.model.relateTechnologyModalTitle = `${data.directionName}涉及的技术`;
          $('#kt_modal_relate_technology').modal('show');
        }, function errorCallback(response) {
          bootbox.alert(localMessage.NETWORK_ERROR);
        });
  };
  //endregion

  //region 添加及更新的公共方法
  $scope.onSelectStar = function(number) {
    $scope.model.directionStars = number;
  };

  $scope.onSubmit = function(){
    if($scope.model.add){
      $scope.add();
    }else{
      $scope.change();
    }
  };
  //endregion

  //region 添加
  $scope.setDefaultValue = function (){
    $scope.model.directionID = 0;
    $scope.model.directionName = '';
    $scope.model.directionNameIsInValid = Constants.CHECK_INVALID.DEFAULT;
    $scope.model.directionStars = 0;
    $scope.model.directionThumbnail = '';
    $scope.model.directionMemo = '';
  };

  $scope.onShowAddModal = function(){
    $scope.setDefaultValue();
    $scope.model.modalTitle = '添加研发方向';
    $scope.model.add = true;
    $('#kt_modal_edit').modal('show');
  };

  $scope.onDirectionNameBlur = function(){
    if(commonUtility.isEmpty($scope.model.directionName)){
      $scope.model.directionNameIsInValid = Constants.CHECK_INVALID.DEFAULT;
      return false;
    }

    $http.get('/direction/checkDirectionName?directionName=' + $scope.model.directionName)
        .then(function successCallback (response) {
          if(response.data.err){
            $scope.model.directionNameIsInValid = Constants.CHECK_INVALID.DEFAULT;
            bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
            return false;
          }

          $scope.model.directionNameIsInValid =
              response.data.result ?
                  Constants.CHECK_INVALID.INVALID
                  : Constants.CHECK_INVALID.VALID;
        }, function errorCallback(response) {
          bootbox.alert(localMessage.NETWORK_ERROR);
        });
  };

  $scope.add = function(){
    $http.post('/direction', {
      directionName: $scope.model.directionName,
      directionStars: $scope.model.directionStars,
      directionMemo: $scope.model.directionMemo,
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

  //region 更新高校信息
  $scope.onShowChangeModal = function (data){
    $scope.setDefaultValue();
    $scope.model.modalTitle = '修改研发方向';
    $scope.model.directionID = data.directionID;
    $scope.model.directionName = data.directionName;
    $scope.model.directionNameIsInValid = Constants.CHECK_INVALID.VALID;
    $scope.model.directionStars = data.directionStars;
    $scope.model.directionMemo = data.directionMemo;
    $scope.model.add = false;
    $('#kt_modal_edit').modal('show');
  };

  $scope.change = function(){
    $http.put('/direction', {
      directionID: $scope.model.directionID,
      directionName: $scope.model.directionName,
      directionStars: $scope.model.directionStars,
      directionMemo: $scope.model.directionMemo,
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

  //region 添加Brand
  $scope.onShowThumbnailModal = function (data){
    $scope.model.directionID_thumbnail = data.directionID;
    $scope.model.thumbnailUrl = data.directionThumbnail;
    $scope.model.thumbnailModalTitle = `缩略图: ${data.directionName}`;
    $scope.model.add = false;
    let uploadServerUrl = commonUtility.buildSystemRemoteUri(Constants.UPLOAD_SERVICE_URI, `direction-${data.directionName}`);

    uploadUtils.destroyUploadPlugin('#file-upload-brand');
    uploadUtils.initUploadPlugin('#file-upload-brand', uploadServerUrl, ['png','jpg', 'jpeg'], false, function (opt,data) {
      $scope.model.thumbnailUrl = data.fileUrlList[0];
      $scope.$apply();
      layer.msg(localMessage.UPLOAD_SUCCESS);
    });

    $('#kt_modal_brand').modal('show');
  };

  $scope.onChangeThumbnail = function () {
    $http.put('/direction/thumbnail', {
      directionID: $scope.model.directionID_thumbnail,
      directionThumbnail: $scope.model.thumbnailUrl,
      loginUser: $scope.model.loginUser.adminID
    }).then(function successCallback(response) {
      if(response.data.err){
        bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
        return false;
      }
      $('#kt_modal_brand').modal('hide');
      $scope.loadData();
    }, function errorCallback(response) {
      bootbox.alert(localMessage.NETWORK_ERROR);
    });
  };
  //endregion

  //region 更新状态
  $scope.onShowStatusModal = function (data) {
    $scope.model.statusModalTitle = `修改状态：${data.directionName}`;
    $scope.model.directionID_status = data.directionID;
    $scope.model.status = data.dataStatus;
    $scope.model.isActive = data.dataStatus === Constants.DATA_STATUS.ACTIVE;
    $('#kt_modal_status').modal('show');
  };

  $scope.onChangeStatus = function () {
    $http.put('/direction/status', {
      directionID: $scope.model.directionID_status,
      status: $scope.model.status,
      loginUser: $scope.model.loginUser.adminID
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

  //region 删除数据
  $scope.onDelete = function(data){
    bootbox.confirm({
      message: `您确定要删除${data.directionName}吗？`,
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
          $http.delete(`direction?directionID=${data.directionID}`)
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