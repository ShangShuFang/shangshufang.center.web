let pageApp = angular.module('pageApp', []);
pageApp.controller('pageCtrl', function ($scope, $http) {
  $scope.model = {
    //begin: 数据查询
    selectedProvince: {regionCode: 0, regionName: '所有省份'},
    provinceList: [],
    selectedCity: {regionCode: 0, regionName: '所有城市'},
    cityList: [],
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

    //begin: Brand编辑
    brandModalTitle: '',
    universityID_brand: 0,
    universityCode_brand: '',
    brandUrl: '',
    //end: Brand编辑

    //begin: Memo编辑
    memoModalTitle: '',
    universityID_memo: 0,
    universityCode_memo: '',
    memo: '',
    //end: Brand编辑

    //begin: 信息编辑
    loginUser: commonUtility.getLoginUser(),
    modalTitle: '',
    universityID: 0,
    universityCode: '',
    universityCodeIsInValid: Constants.CHECK_INVALID.DEFAULT,
    universityName: '',
    universityNameIsInValid: Constants.CHECK_INVALID.DEFAULT,
    provinceList4Edit: [],
    selectedProvince4Edit: {regionCode: 0, regionName: '请选择省份'},
    cityList4Edit: [],
    selectedCity4Edit: {regionCode: 0, regionName: '请选择城市'},
    districtList: [],
    selectedDistrict4Edit: {regionCode: 0, regionName: '请选择区县'},
    address: '',
    add: true,
    //end: 信息编辑

    //begin: 状态编辑
    statusUniversityID: 0,
    statusModalTitle: '',
    status: '',
    isActive: true,
    //end: 状态编辑
  };

  //region 页面初始化
  $scope.initPage = function () {
    commonUtility.setNavActive();
    $scope.loadProvinceList();
    $scope.loadData();
  };

  $scope.loadData = function(){
    $http.get(`/university/dataList?pageNumber=${$scope.model.pageNumber}&provinceCode=${$scope.model.selectedProvince.regionCode}&cityCode=${$scope.model.selectedCity.regionCode}`)
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

  $scope.loadProvinceList = function (){
    $http.get('/common/chinaRegion').then(function successCallback (response) {
      if(response.data.err){
        bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
        return false;
      }
      if(response.data.dataList === null){
        return false;
      }
      $scope.model.provinceList = response.data.dataList;
      $scope.model.provinceList4Edit = response.data.dataList;
    }, function errorCallback(response) {
      bootbox.alert(localMessage.NETWORK_ERROR);
    });
  };

  $scope.loadCityList = function (provinceCode){
    $http.get(`/common/chinaRegion?parentCode=${provinceCode}`).then(function successCallback (response) {
      if(response.data.err){
        bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
        return false;
      }
      if(response.data.dataList === null){
        $scope.model.selectedCity = {regionCode: 0, regionName: '所有城市'};
        return false;
      }
      $scope.model.selectedCity = {regionCode: 0, regionName: '所有城市'};
      $scope.model.cityList = response.data.dataList;
    }, function errorCallback(response) {
      bootbox.alert(localMessage.NETWORK_ERROR);
    });
  };

  $scope.onProvinceChange = function(regionCode, regionName){
    if($scope.model.selectedProvince.regionCode === regionCode){
      return false;
    }
    $scope.model.selectedProvince = {regionCode: regionCode, regionName: regionName};
    if(regionCode === 0){
      $scope.model.selectedCity = {regionCode: regionCode, regionName: '所有城市'};
      $scope.model.cityList.splice(0, $scope.model.cityList.length);
      $scope.loadData();
      return false;
    }
    if(Constants.PROVINCE_LEVEL_MUNICIPALITY.includes(regionName)){
      $scope.model.selectedCity = {regionCode: 0, regionName: `${regionName}市`};
      $scope.model.cityList.splice(0, $scope.model.cityList.length);
      $scope.loadData();
      return false;
    }
    $scope.loadData();
    $scope.loadCityList(regionCode);
  };

  $scope.onCityChange = function(regionCode, regionName){
    if($scope.model.selectedCity.regionCode === regionCode){
      return false;
    }
    $scope.model.selectedCity = {regionCode: regionCode, regionName: regionName};
    $scope.loadData();
  };
  //endregion

  //region 添加及更新的公共方法
  $scope.loadCityList4Edit = function (provinceCode){
    $http.get(`/common/chinaRegion?parentCode=${provinceCode}`).then(function successCallback (response) {
      if(response.data.err){
        bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
        return false;
      }
      if(response.data.dataList === null){
        $scope.model.selectedCity4Edit = {regionCode: 0, regionName: '请选择城市'};
        return false;
      }
      $scope.model.cityList4Edit = response.data.dataList;
      if($scope.model.add){
        $scope.model.selectedCity4Edit = {regionCode: 0, regionName: '请选择城市'};
      }else{
        if($scope.model.selectedCity4Edit.regionCode !== 0){
          $scope.loadDistrictList($scope.model.selectedCity4Edit.regionCode);
        }
      }
    }, function errorCallback(response) {
      bootbox.alert(localMessage.NETWORK_ERROR);
    });
  };

  $scope.loadDistrictList = function (cityCode){
    $http.get(`/common/chinaRegion?parentCode=${cityCode}`).then(function successCallback (response) {
      if(response.data.err){
        bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
        return false;
      }
      if(response.data.dataList === null){
        $scope.model.selectedDistrict4Edit = {regionCode: 0, regionName: '请选择区县'};
        return false;
      }
      $scope.model.districtList = response.data.dataList;
      if($scope.model.add){
        $scope.model.selectedDistrict4Edit = {regionCode: 0, regionName: '请选择区县'};
      }
    }, function errorCallback(response) {
      bootbox.alert(localMessage.NETWORK_ERROR);
    });
  };

  $scope.onProvinceChange4Edit = function (regionCode, regionName){
    if($scope.model.selectedProvince4Edit.regionName === regionName){
      return false;
    }
    $scope.model.selectedProvince4Edit = {regionCode: regionCode, regionName: regionName};
    if(regionCode === 0){
      $scope.model.selectedCity4Edit = {regionCode: 0, regionName: '请选择城市'};
      $scope.model.cityList4Edit.splice(0, $scope.model.cityList4Edit.length);
      $scope.model.selectedDistrict4Edit = {regionCode: 0, regionName: '请选择区县'};
      $scope.model.districtList.splice(0, $scope.model.districtList.length);
      return false;
    }
    if(Constants.PROVINCE_LEVEL_MUNICIPALITY.includes(regionName)){
      $scope.model.selectedCity4Edit = {regionCode: 0, regionName: `${regionName}市`};
      $scope.model.cityList4Edit.splice(0, $scope.model.cityList4Edit.length);
      $scope.model.selectedDistrict4Edit = {regionCode: 0, regionName: '请选择区县'};
      $scope.loadDistrictList(regionCode);
      return false;
    }

    $scope.model.selectedCity4Edit = {regionCode: 0, regionName: '请选择城市'};
    $scope.model.selectedDistrict4Edit = {regionCode: 0, regionName: '请选择区县'};
    $scope.model.districtList.splice(0, $scope.model.districtList.length);
    $scope.loadCityList4Edit(regionCode);
  };

  $scope.onCityChange4Edit = function (regionCode, regionName){
    if($scope.model.selectedCity4Edit.regionCode === regionCode){
      return false;
    }
    $scope.model.selectedCity4Edit = {regionCode: regionCode, regionName: regionName};
    $scope.model.selectedDistrict4Edit = {regionCode: 0, regionName: '请选择区县'};
    $scope.loadDistrictList(regionCode);
  };

  $scope.onDistrictChange4Edit = function (regionCode, regionName){
    if($scope.model.selectedDistrict4Edit.regionCode === regionCode){
      return false;
    }
    $scope.model.selectedDistrict4Edit = {regionCode: regionCode, regionName: regionName};
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
    $scope.model.universityID = 0;
    $scope.model.universityCode = '';
    $scope.model.universityCodeIsInValid = Constants.CHECK_INVALID.DEFAULT;
    $scope.model.universityName = '';
    $scope.model.universityNameIsInValid = Constants.CHECK_INVALID.DEFAULT;
    $scope.model.selectedProvince4Edit = {regionCode: 0, regionName: '请选择省份'};
    $scope.model.selectedCity4Edit = {regionCode: 0, regionName: '请选择城市'};
    $scope.model.selectedDistrict4Edit = {regionCode: 0, regionName: '请选择区县'};
    $scope.model.address = '';
    $scope.model.cityList4Edit.splice(0, $scope.model.cityList4Edit.length);
    $scope.model.districtList.splice(0, $scope.model.districtList.length);
  };

  $scope.onShowAddModal = function(){
    $scope.setDefaultValue();
    $scope.model.modalTitle = '添加合作高校';
    $scope.model.add = true;
    $('#kt_modal_edit').modal('show');
  };

  $scope.onUniversityCodeBlur = function(){
    if(commonUtility.isEmpty($scope.model.universityCode)){
      $scope.model.universityCodeIsInValid = Constants.CHECK_INVALID.DEFAULT;
      return false;
    }

    $http.get('/university/checkUniversityCode?universityCode=' + $scope.model.universityCode)
        .then(function successCallback (response) {
          if(response.data.err){
            $scope.model.universityCodeIsInValid = Constants.CHECK_INVALID.DEFAULT;
            bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
            return false;
          }

          $scope.model.universityCodeIsInValid =
              response.data.result ?
                  Constants.CHECK_INVALID.INVALID
                  : Constants.CHECK_INVALID.VALID;
        }, function errorCallback(response) {
          bootbox.alert(localMessage.NETWORK_ERROR);
        });
  };

  $scope.onUniversityNameBlur = function(){
    if(commonUtility.isEmpty($scope.model.universityName)){
      $scope.model.universityNameIsInValid = Constants.CHECK_INVALID.DEFAULT;
      return false;
    }

    $http.get('/university/checkUniversityName?universityName=' + $scope.model.universityName)
        .then(function successCallback (response) {
          if(response.data.err){
            $scope.model.universityNameIsInValid = Constants.CHECK_INVALID.DEFAULT;
            bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
            return false;
          }

          $scope.model.universityNameIsInValid =
              response.data.result ?
                  Constants.CHECK_INVALID.INVALID
                  : Constants.CHECK_INVALID.VALID;
        }, function errorCallback(response) {
          bootbox.alert(localMessage.NETWORK_ERROR);
        });
  };

  $scope.add = function(){
    $http.post('/university', {
      universityCode: $scope.model.universityCode,
      universityName: $scope.model.universityName,
      provinceCode: $scope.model.selectedProvince4Edit.regionCode,
      cityCode: $scope.model.selectedCity4Edit.regionCode,
      districtCode: $scope.model.selectedDistrict4Edit.regionCode,
      address: $scope.model.address,
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
    $scope.model.modalTitle = '修改合作高校';
    $scope.model.universityID = data.universityID;
    $scope.model.universityCode = data.universityCode;
    $scope.model.universityCodeIsInValid = Constants.CHECK_INVALID.VALID;
    $scope.model.universityName = data.universityName;
    $scope.model.universityNameIsInValid = Constants.CHECK_INVALID.VALID;
    $scope.model.selectedProvince4Edit = {regionCode: data.provinceCode, regionName: data.provinceName};
    $scope.model.selectedCity4Edit = {regionCode: data.cityCode, regionName: data.cityName};
    $scope.model.selectedDistrict4Edit = {regionCode: data.districtCode, regionName: data.districtName};
    $scope.model.address = data.address;
    $scope.model.add = false;

    if(Constants.PROVINCE_LEVEL_MUNICIPALITY.includes($scope.model.selectedProvince4Edit.regionName)){
      $scope.model.selectedCity = {regionCode: 0, regionName: `${$scope.model.selectedProvince4Edit.regionName}市`};
      $scope.model.cityList.splice(0, $scope.model.cityList.length);
      $scope.loadDistrictList($scope.model.selectedProvince4Edit.regionCode);
      $('#kt_modal_edit').modal('show');
      return false;
    }

    $scope.loadCityList4Edit($scope.model.selectedProvince4Edit.regionCode);
    $('#kt_modal_edit').modal('show');
  };

  $scope.change = function(){
    $http.put('/university', {
      universityID: $scope.model.universityID,
      universityCode: $scope.model.universityCode,
      universityName: $scope.model.universityName,
      provinceCode: $scope.model.selectedProvince4Edit.regionCode,
      cityCode: $scope.model.selectedCity4Edit.regionCode,
      districtCode: $scope.model.selectedDistrict4Edit.regionCode,
      address: $scope.model.address,
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
  $scope.onShowBrandModal = function (data){
    $scope.model.brandModalTitle = `Brand: ${data.universityName}`;
    $scope.model.add = false;
    $scope.model.brandUrl = data.brand;
    $scope.model.memo = data.memo;
    $scope.model.universityID_brand = data.universityID;
    $scope.model.universityCode_brand = data.universityCode;

    let uploadServerUrl = commonUtility.buildUniversityUploadRemoteUri(Constants.UPLOAD_SERVICE_URI, data.universityCode, 'brand');

    uploadUtils.destroyUploadPlugin('#file-upload-brand');
    uploadUtils.initUploadPlugin('#file-upload-brand', uploadServerUrl, ['png','jpg', 'jpeg'], false, function (opt,data) {
      $scope.model.brandUrl = data.fileUrlList[0];
      $scope.$apply();
      layer.msg(localMessage.UPLOAD_SUCCESS);
    });

    $('#kt_modal_brand').modal('show');
  };

  $scope.onChangeBrand = function () {
    $http.put('/university/brand', {
      universityID: $scope.model.universityID_brand,
      brand: $scope.model.brandUrl,
      memo: $scope.model.memo,
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

  //region 添加Memo
  $scope.onShowMemoModal = function(data){
    $scope.model.memoModalTitle = `${data.universityName}客户寄语`;
    $scope.model.universityID_memo = data.universityID;
    $scope.model.add = commonUtility.isEmpty(data.memo);
    $scope.model.memo = data.memo;
    $('#kt_modal_memo').modal('show');
  };

  $scope.onChangeMemo = function () {
    $http.put('/university/memo', {
      universityID: $scope.model.universityID_memo,
      memo: $scope.model.memo,
      loginUser: $scope.model.loginUser.adminID
    }).then(function successCallback(response) {
      if(response.data.err){
        bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
        return false;
      }
      $('#kt_modal_memo').modal('hide');
      $scope.loadData();
    }, function errorCallback(response) {
      bootbox.alert(localMessage.NETWORK_ERROR);
    });
  };
  //endregion

  //region 更新状态
  $scope.onShowStatusModal = function (data) {
    $scope.model.statusModalTitle = `修改状态：${data.universityName}`;
    $scope.model.statusUniversityID = data.universityID;
    $scope.model.status = data.dataStatus;
    $scope.model.isActive = data.dataStatus === Constants.DATA_STATUS.ACTIVE;
    $('#kt_modal_status').modal('show');
  };

  $scope.onChangeStatus = function () {
    $http.put('/university/status', {
      universityID: $scope.model.statusUniversityID,
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
      message: `您确定要删除${data.universityName}吗？`,
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
          $http.delete(`university?universityID=${data.universityID}`)
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