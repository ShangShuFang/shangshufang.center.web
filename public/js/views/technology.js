let pageApp = angular.module('pageApp', []);
pageApp.controller('pageCtrl', function ($scope, $http) {
  $scope.model = {
    //begin: 数据列表
    directionList4Search: [],
    selectedDirection4Search: {directionID: 0, directionName: '全部研发方向'},

    categoryList4Search: [],
    selectedCategory4Search: {technologyCategoryID: 0, technologyCategoryName: '全部技术类型'},

    fromIndex: 0,
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
    technologyID_thumbnail: 0,
    thumbnailUrl: '',
    //end: Brand编辑

    //begin: 信息编辑
    loginUser: commonUtility.getLoginUser(),
    modalTitle: '',
    programmingLanguageList: [],
    selectedProgrammingLanguage: {languageID: 0, languageName: '请选择所属编程语言'},
    technologyID: 0,
    technologyName: '',
    technologyNameIsInValid: Constants.CHECK_INVALID.DEFAULT,
    technologyStars: 0,
    technologyThumbnail: '',
    technologyMemo: '',
    directionList: [],
    selectedDirection: {directionID: 0, directionName: '请选择研发方向'},

    categoryList: [],
    selectedCategory: {technologyCategoryID: 0, technologyCategoryName: '请选择技术类型'},
    selectedCategoryTemp: {technologyCategoryID: 0, technologyCategoryName: '请选择技术类型'},

    selectedDifficulty: 'J',
    add: true,
    //end: 信息编辑

    //begin: 状态编辑
    technologyID_status: 0,
    statusModalTitle: '',
    status: '',
    isActive: true,
    //end: 状态编辑
  };

  //region 页面初始化
  $scope.initPage = function () {
    commonUtility.setNavActive();
    $scope.loadData();
    $scope.loadProgrammingLanguage();
    $scope.loadDirection();
  };

  $scope.onSearchDirectionChange = function (directionID, directionName) {
    if ($scope.model.selectedDirection4Search.directionID === directionID) {
      return false;
    }
    if (directionID === 0) {
      $scope.model.selectedDirection4Search = {directionID: directionID, directionName: directionName};
      $scope.model.categoryList4Search = [];
      $scope.model.selectedCategory4Search = {technologyCategoryID: 0, technologyCategoryName: '全部技术类型'};
      $scope.loadData();
      return false;
    }
    $scope.model.selectedDirection4Search = {directionID: directionID, directionName: directionName};
    $scope.loadCategory4Search();
    $scope.loadData();
  };

  $scope.onSearchCategoryChange = function (technologyCategoryID, technologyCategoryName) {
    if ($scope.model.selectedCategory4Search.technologyCategoryID === technologyCategoryID) {
      return false;
    }
    $scope.model.selectedCategory4Search = {
      technologyCategoryID: technologyCategoryID,
      technologyCategoryName: technologyCategoryName
    };
    $scope.loadData();
  };

  $scope.loadCategory4Search = function () {
    $http.get(`/common/category?directionID=${$scope.model.selectedDirection4Search.directionID}`)
        .then(function successCallback(response) {
          if (response.data.err) {
            bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
            return false;
          }
          if (response.data.dataList === null) {
            $scope.model.selectedCategory4Search = {technologyCategoryID: 0, technologyCategoryName: '全部技术类型'};
            $scope.model.categoryList4Search = [];
            return false;
          }
          $scope.model.selectedCategory4Search = {technologyCategoryID: 0, technologyCategoryName: '全部技术类型'};
          $scope.model.categoryList4Search = response.data.dataList;
        }, function errorCallback(response) {
          bootbox.alert(localMessage.NETWORK_ERROR);
        });
  };

  $scope.loadData = function () {
    $http.get(`/technology/dataList?pageNumber=${$scope.model.pageNumber}&directionID=${$scope.model.selectedDirection4Search.directionID}&categoryID=${$scope.model.selectedCategory4Search.technologyCategoryID}`)
        .then(function successCallback(response) {
          if (response.data.err) {
            bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
            return false;
          }
          if (response.data.dataContent === null) {
            return false;
          }
          if (response.data.dataContent.dataList !== null && response.data.dataContent.dataList.length === 0 && $scope.model.pageNumber > 1) {
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

  $scope.onPrePage = function () {
    if ($scope.model.pageNumber === 1) {
      return false;
    }
    $scope.model.pageNumber--;
    $scope.loadData();
  };

  $scope.onPagination = function (pageNumber) {
    if ($scope.model.pageNumber === pageNumber) {
      return false;
    }
    $scope.model.pageNumber = pageNumber;
    $scope.loadData();
  };

  $scope.onNextPage = function () {
    if ($scope.model.pageNumber === $scope.model.maxPageNumber) {
      return false;
    }
    $scope.model.pageNumber++;
    $scope.loadData();
  };

  $scope.loadProgrammingLanguage = function () {
    $http.get(`/technology/programmingLanguage`)
        .then(function successCallback(response) {
          if (response.data.err) {
            bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
            return false;
          }
          if (response.data.dataList === null) {
            return false;
          }

          $scope.model.programmingLanguageList = response.data.dataList;
        }, function errorCallback(response) {
          bootbox.alert(localMessage.NETWORK_ERROR);
        });
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

          $scope.model.directionList = response.data.dataList;
          $scope.model.directionList4Search = response.data.dataList;
        }, function errorCallback(response) {
          bootbox.alert(localMessage.NETWORK_ERROR);
        });
  };
  //endregion

  //region 添加及更新的公共方法
  $scope.loadCategory = function () {
    $http.get(`/common/category?directionID=${$scope.model.selectedDirection.directionID}`)
        .then(function successCallback(response) {
          if (response.data.err) {
            bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
            return false;
          }
          if (response.data.dataList === null) {
            $scope.model.selectedCategory = {technologyCategoryID: 0, technologyCategoryName: '全部技术类型'};
            $scope.model.categoryList = [];
            return false;
          }

          $scope.model.selectedCategory = $scope.model.add ?
              {technologyCategoryID: 0, technologyCategoryName: '全部技术类型'} :
              {technologyCategoryID: $scope.model.selectedCategoryTemp.technologyCategoryID, technologyCategoryName: $scope.model.selectedCategoryTemp.technologyCategoryName};

          $scope.model.categoryList = response.data.dataList;
        }, function errorCallback(response) {
          bootbox.alert(localMessage.NETWORK_ERROR);
        });
  };

  $scope.onSelectStar = function (number) {
    $scope.model.technologyStars = number;
  };

  $scope.onProgrammingLanguageChange = function (languageID, languageName) {
    $scope.model.selectedProgrammingLanguage = {
      languageID: languageID,
      languageName: languageName
    };
  };

  $scope.onDirectionChange = function (directionID, directionName) {
    if ($scope.model.selectedDirection.directionID === directionID) {
      return false;
    }
    if (directionID === 0) {
      $scope.model.selectedDirection = {directionID: directionID, directionName: directionName};
      $scope.model.categoryList = [];
      $scope.model.selectedCategory = {technologyCategoryID: 0, technologyCategoryName: '请选择技术类型'};
      return false;
    }
    $scope.model.selectedDirection = {directionID: directionID, directionName: directionName};
    $scope.loadCategory();
  };

  $scope.onCategoryChange = function (technologyCategoryID, technologyCategoryName) {
    if ($scope.model.selectedCategory.technologyCategoryID === technologyCategoryID) {
      return false;
    }
    $scope.model.selectedCategory = {
      technologyCategoryID: technologyCategoryID,
      technologyCategoryName: technologyCategoryName
    };
  };

  $scope.onSubmit = function () {
    if ($scope.model.add) {
      $scope.add();
    } else {
      $scope.change();
    }
  };
  //endregion

  //region 添加
  $scope.setDefaultValue = function () {
    $scope.model.technologyID = 0;
    $scope.model.selectedProgrammingLanguage = {languageID: 0, languageName: '请选择所属编程语言'};
    $scope.model.selectedDirection = {directionID: 0, directionName: '请选择研发方向'};
    $scope.model.selectedCategory = {technologyCategoryID: 0, technologyCategoryName: '请选择技术类型'};
    $scope.model.technologyName = '';
    $scope.model.technologyNameIsInValid = Constants.CHECK_INVALID.DEFAULT;
    $scope.model.technologyStars = 0;
    $scope.model.technologyThumbnail = '';
    $scope.model.selectedDifficulty = 'J';
    $scope.model.technologyMemo = '';
  };

  $scope.onShowAddModal = function () {
    $scope.setDefaultValue();
    $scope.model.modalTitle = '添加热门技术';
    $scope.model.add = true;
    $('#kt_modal_edit').modal('show');
  };

  $scope.onTechnologyNameBlur = function () {
    if (commonUtility.isEmpty($scope.model.technologyName)) {
      $scope.model.technologyNameIsInValid = Constants.CHECK_INVALID.DEFAULT;
      return false;
    }

    $http.get('/technology/checkTechnologyName?technologyName=' + $scope.model.technologyName)
        .then(function successCallback(response) {
          if (response.data.err) {
            $scope.model.technologyNameIsInValid = Constants.CHECK_INVALID.DEFAULT;
            bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
            return false;
          }

          $scope.model.technologyNameIsInValid =
              response.data.result ?
                  Constants.CHECK_INVALID.INVALID
                  : Constants.CHECK_INVALID.VALID;
        }, function errorCallback(response) {
          bootbox.alert(localMessage.NETWORK_ERROR);
        });
  };

  $scope.add = function () {
    $http.post('/technology', {
      languageID: $scope.model.selectedProgrammingLanguage.languageID,
      technologyName: $scope.model.technologyName,
      technologyStars: $scope.model.technologyStars,
      technologyMemo: $scope.model.technologyMemo,
      directionID: $scope.model.selectedDirection.directionID,
      categoryID: $scope.model.selectedCategory.technologyCategoryID,
      difficultyLevel: $scope.model.selectedDifficulty,
      loginUser: $scope.model.loginUser.adminID
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
    $scope.model.modalTitle = '修改技术信息';
    $scope.model.technologyID = data.technologyID;
    $scope.model.technologyName = data.technologyName;
    $scope.model.technologyNameIsInValid = Constants.CHECK_INVALID.VALID;
    $scope.model.technologyStars = data.technologyStars;
    $scope.model.selectedDirection = {directionID: data.directionID, directionName: data.directionName};
    $scope.model.selectedCategoryTemp = {technologyCategoryID: data.categoryID, technologyCategoryName: data.categoryName};
    $scope.model.selectedDifficulty = data.difficultyLevel;
    $scope.model.technologyMemo = data.technologyMemo;
    $scope.model.selectedProgrammingLanguage = {languageID: data.languageID, languageName: data.languageName};
    $scope.model.add = false;
    $scope.loadCategory();
    $('#kt_modal_edit').modal('show');
  };

  $scope.change = function () {
    $http.put('/technology', {
      technologyID: $scope.model.technologyID,
      technologyName: $scope.model.technologyName,
      technologyStars: $scope.model.technologyStars,
      technologyMemo: $scope.model.technologyMemo,
      directionID: $scope.model.selectedDirection.directionID,
      categoryID: $scope.model.selectedCategory.technologyCategoryID,
      difficultyLevel: $scope.model.selectedDifficulty,
      loginUser: $scope.model.loginUser.adminID
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

  //region 添加Brand
  $scope.onShowThumbnailModal = function (data) {
    $scope.model.technologyID_thumbnail = data.technologyID;
    $scope.model.thumbnailUrl = data.technologyThumbnail;
    $scope.model.thumbnailModalTitle = `缩略图: ${data.technologyName}`;
    $scope.model.add = false;
    let uploadTechnologyDir = {"dir1": "technology", "dir2": data.technologyName};
    let uploadServerUrl = commonUtility.buildSystemRemoteUri(Constants.UPLOAD_SERVICE_URI, uploadTechnologyDir);

    uploadUtils.destroyUploadPlugin('#file-upload-brand');
    uploadUtils.initUploadPlugin('#file-upload-brand', uploadServerUrl, ['png', 'jpg', 'jpeg'], false, function (opt, data) {
      $scope.model.thumbnailUrl = data.fileUrlList[0];
      $scope.$apply();
      layer.msg(localMessage.UPLOAD_SUCCESS);
    });

    $('#kt_modal_brand').modal('show');
  };

  $scope.onChangeThumbnail = function () {
    $http.put('/technology/thumbnail', {
      technologyID: $scope.model.technologyID_thumbnail,
      technologyThumbnail: $scope.model.thumbnailUrl,
      loginUser: $scope.model.loginUser.adminID
    }).then(function successCallback(response) {
      if (response.data.err) {
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
    $scope.model.statusModalTitle = `修改状态：${data.technologyName}`;
    $scope.model.technologyID_status = data.technologyID;
    $scope.model.status = data.dataStatus;
    $scope.model.isActive = data.dataStatus === Constants.DATA_STATUS.ACTIVE;
    $('#kt_modal_status').modal('show');
  };

  $scope.onChangeStatus = function () {
    $http.put('/technology/status', {
      technologyID: $scope.model.technologyID_status,
      status: $scope.model.status,
      loginUser: $scope.model.loginUser.adminID
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
      message: `您确定要删除${data.technologyName}吗？`,
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
          $http.delete(`technology?technologyID=${data.technologyID}`)
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