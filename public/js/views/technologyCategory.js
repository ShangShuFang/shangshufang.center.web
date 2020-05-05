let pageApp = angular.module('pageApp', []);
pageApp.controller('pageCtrl', function ($scope, $http) {
  $scope.listModel = {
    directionList: [],
    selectedDirection: {directionID: 0, directionName: '全部研发方向'},
    fromIndex: 0,
    toIndex: 0,
    pageNumber: 1,
    totalCount: 0,
    maxPageNumber: 0,
    dataList: [],
    paginationArray: [],
    prePageNum: -1,
    nextPageNum: -1,
  };
  $scope.editModel = {
    loginUser: commonUtility.getLoginUser(),
    modalTitle: '',
    technologyCategoryID: 0,
    technologyCategoryName: '',
    technologyCategoryNameIsInValid: Constants.CHECK_INVALID.DEFAULT,
    directionList: [],
    selectedDirection: {directionID: 0, directionName: '请选择研发方向'},
    add: true,
  };
  $scope.statusModel = {
    technologyCategoryID: 0,
    directionID: 0,
    modalTitle: '',
    status: '',
    isActive: true,
  };

  //region 页面初始化
  $scope.initPage = function () {
    commonUtility.setNavActive();
    $scope.loadDirection();
    $scope.loadData();
  };

  $scope.loadDirection = function () {
    $http.get(`/common/direction`)
        .then(function successCallback(response) {
          if (response.data.err) {
            bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
            return false;
          }
          if (response.data.dataList === null) {
            return false;
          }
          $scope.listModel.directionList = response.data.dataList;
          $scope.editModel.directionList = response.data.dataList;
        }, function errorCallback(response) {
          bootbox.alert(localMessage.NETWORK_ERROR);
        });
  };

  $scope.loadData = function () {
    $http.get(`/technology/category/dataList?pageNumber=${$scope.listModel.pageNumber}&directionID=${$scope.listModel.selectedDirection.directionID}`)
        .then(function successCallback(response) {
          if (response.data.err) {
            bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
            return false;
          }
          // if (response.data.dataContent === null || response.data.dataContent.dataList === null || response.data.dataContent.dataList.length === 0) {
          //   return false;
          // }
          $scope.listModel.totalCount = response.data.dataContent.totalCount;
          $scope.listModel.dataList = response.data.dataContent.dataList;
          $scope.listModel.pageNumber = response.data.dataContent.currentPageNum;
          $scope.listModel.maxPageNumber = Math.ceil(response.data.dataContent.totalCount / response.data.dataContent.pageSize);
          $scope.listModel.paginationArray = response.data.dataContent.paginationArray;
          $scope.listModel.prePageNum = response.data.dataContent.prePageNum === undefined ? -1 : response.data.dataContent.prePageNum;
          $scope.listModel.nextPageNum = response.data.dataContent.nextPageNum === undefined ? -1 : response.data.dataContent.nextPageNum;
          $scope.listModel.fromIndex = response.data.dataContent.dataList === null ? 0 : ($scope.listModel.pageNumber - 1) * Constants.PAGE_SIZE + 1;
          $scope.listModel.toIndex = response.data.dataContent.dataList === null ? 0 : ($scope.listModel.pageNumber - 1) * Constants.PAGE_SIZE + $scope.listModel.dataList.length;
        }, function errorCallback(response) {
          bootbox.alert(localMessage.NETWORK_ERROR);
        });
  };

  $scope.onPrePage = function () {
    if ($scope.listModel.pageNumber === 1) {
      return false;
    }
    $scope.listModel.pageNumber--;
    $scope.loadData();
  };

  $scope.onPagination = function (pageNumber) {
    if ($scope.listModel.pageNumber === pageNumber) {
      return false;
    }
    $scope.listModel.pageNumber = pageNumber;
    $scope.loadData();
  };

  $scope.onNextPage = function () {
    if ($scope.listModel.maxPageNumber === 0 || $scope.listModel.pageNumber === $scope.listModel.maxPageNumber) {
      return false;
    }
    $scope.listModel.pageNumber++;
    $scope.loadData();
  };

  $scope.onSearchDirectionChange = function (directionID, directionName) {
    $scope.listModel.selectedDirection = {directionID: directionID, directionName: directionName};
    $scope.loadData();
  };
  //endregion

  //region 添加及更新的公共方法
  $scope.onEditDirectionChange = function (directionID, directionName) {
    $scope.editModel.selectedDirection = {directionID: directionID, directionName: directionName};
  };

  $scope.onSubmit = function () {
    if ($scope.editModel.add) {
      $scope.add();
    } else {
      $scope.change();
    }
  };
  //endregion

  //region 添加
  $scope.setDefaultValue = function () {
    $scope.editModel.modalTitle = '';
    $scope.editModel.technologyCategoryID = 0;
    $scope.editModel.technologyCategoryName = '';
    $scope.editModel.technologyCategoryNameIsInValid = Constants.CHECK_INVALID.DEFAULT;
    $scope.editModel.selectedDirection = {directionID: 0, directionName: '请选择研发方向'};
  };

  $scope.onShowAddModal = function () {
    $scope.setDefaultValue();
    $scope.editModel.modalTitle = '添加分类';
    $scope.editModel.add = true;
    $('#kt_modal_edit').modal('show');
  };

  $scope.onTechnologyCategoryNameBlur = function () {
    if (commonUtility.isEmpty($scope.editModel.technologyCategoryName)) {
      $scope.editModel.technologyCategoryNameIsInValid = Constants.CHECK_INVALID.DEFAULT;
      return false;
    }

    $http.get(`/technology/category/check/name?directionID=${$scope.editModel.selectedDirection.directionID}&categoryName=${$scope.editModel.technologyCategoryName}`)
        .then(function successCallback(response) {
          if (response.data.err) {
            $scope.editModel.technologyCategoryNameIsInValid = Constants.CHECK_INVALID.DEFAULT;
            bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
            return false;
          }

          $scope.editModel.technologyCategoryNameIsInValid =
              response.data.exist ?
                  Constants.CHECK_INVALID.INVALID
                  : Constants.CHECK_INVALID.VALID;
        }, function errorCallback(response) {
          bootbox.alert(localMessage.NETWORK_ERROR);
        });
  };

  $scope.add = function () {
    $http.post('/technology/category', {
      directionID: $scope.editModel.selectedDirection.directionID,
      technologyCategoryName: $scope.editModel.technologyCategoryName,
      loginUser: $scope.editModel.loginUser.adminID
    }).then(function successCallback(response) {
      if (response.data.err) {
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

  //region 更新技术信息
  $scope.onShowChangeModal = function (data) {
    $scope.setDefaultValue();
    $scope.editModel.modalTitle = '修改分类';
    $scope.editModel.selectedDirection = {directionID: data.directionID, directionName: data.directionName};
    $scope.editModel.technologyCategoryID = data.technologyCategoryID;
    $scope.editModel.technologyCategoryName = data.technologyCategoryName;
    $scope.editModel.technologyCategoryNameIsInValid = Constants.CHECK_INVALID.VALID;
    $scope.editModel.add = false;
    $('#kt_modal_edit').modal('show');
  };

  $scope.change = function () {
    $http.put('/technology/category', {
      technologyCategoryID: $scope.editModel.technologyCategoryID,
      directionID: $scope.editModel.selectedDirection.directionID,
      technologyCategoryName: $scope.editModel.technologyCategoryName,
      loginUser: $scope.editModel.loginUser.adminID
    }).then(function successCallback(response) {
      if (response.data.err) {
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

  //region 更新状态
  $scope.onShowStatusModal = function (data) {
    $scope.statusModel.modalTitle = `修改状态：${data.technologyCategoryName}`;
    $scope.statusModel.technologyCategoryID = data.technologyCategoryID;
    $scope.statusModel.directionID = data.directionID;
    $scope.statusModel.status = data.dataStatus;
    $scope.statusModel.isActive = data.dataStatus === Constants.DATA_STATUS.ACTIVE;
    $('#kt_modal_status').modal('show');
  };

  $scope.onChangeStatus = function () {
    $http.put('/technology/category/status', {
      technologyCategoryID: $scope.statusModel.technologyCategoryID,
      directionID: $scope.statusModel.directionID,
      status: $scope.statusModel.status,
      loginUser: $scope.editModel.loginUser.adminID
    }).then(function successCallback(response) {
      if (response.data.err) {
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
  $scope.onDelete = function (data) {
    bootbox.confirm({
      message: `您确定要删除分类${data.technologyCategoryName}吗？`,
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
        if (result) {
          $http.delete(`/technology/category?directionID=${data.directionID}&technologyCategoryID=${data.technologyCategoryID}`)
              .then(function successCallback(response) {
                if (response.data.err) {
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