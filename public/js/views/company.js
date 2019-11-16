let pageApp = angular.module('pageApp', []);
pageApp.controller('pageCtrl', function ($scope, $http) {
  $scope.model = {
    //region 数据查询
    selectedProvince: {regionCode: 0, regionName: '所有省份'},
    provinceList: [],
    selectedCity: {regionCode: 0, regionName: '所有城市'},
    cityList: [],
    //endregion

    //region 数据列表
    fromIndex : 0,
    toIndex: 0,
    pageNumber: 1,
    totalCount: 0,
    maxPageNumber: 0,
    dataList: [],
    paginationArray: [],
    prePageNum: -1,
    nextPageNum: -1,
    //endregion

    //begin: Brand编辑
    brandModalTitle: '',
    companyID_brand: 0,
    brandUrl: '',
    memo: '',
    //end: Brand编辑

    //region 信息编辑
    loginUser: commonUtility.getLoginUser(),
    modalTitle: '',
    companyID: 0,
    companyName: '',
    companyNameIsInValid: Constants.CHECK_INVALID.DEFAULT,
    provinceList4Edit: [],
    selectedProvince4Edit: {regionCode: 0, regionName: '请选择省份'},
    cityList4Edit: [],
    selectedCity4Edit: {regionCode: 0, regionName: '请选择城市'},
    districtList: [],
    selectedDistrict4Edit: {regionCode: 0, regionName: '请选择区县'},
    contacts: '',
    cellphone: '',
    cellphoneCompare: '',
    cellphoneIsInValid: Constants.CHECK_INVALID.DEFAULT,
    address: '',
    add: true,
    //endregion

    //region 状态编辑
    statusCompanyID: 0,
    statusModalTitle: '',
    status: '',
    isActive: true,
    //endregion
  };

  //region 页面初始化
  $scope.initPage = function () {
    commonUtility.setNavActive();
    $scope.loadProvinceList();
    $scope.loadData();
  };

  $scope.setDefaultValue = function (){
    $scope.model.companyID = 0;
    $scope.model.companyName = '';
    $scope.model.companyNameIsInValid = Constants.CHECK_INVALID.DEFAULT;
    $scope.model.selectedProvince4Edit = {regionCode: 0, regionName: '请选择省份'};
    $scope.model.selectedCity4Edit = {regionCode: 0, regionName: '请选择城市'};
    $scope.model.selectedDistrict4Edit = {regionCode: 0, regionName: '请选择区县'};
    $scope.model.address = '';
    $scope.model.contacts = '';
    $scope.model.cellphone = '';
    $scope.model.cellphoneIsInValid = Constants.CHECK_INVALID.DEFAULT;
    $scope.model.cityList4Edit.splice(0, $scope.model.cityList4Edit.length);
    $scope.model.districtList.splice(0, $scope.model.districtList.length);
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

  $scope.loadData = function(){
    $http.get(`/company/dataList?pageNumber=${$scope.model.pageNumber}&provinceCode=${$scope.model.selectedProvince.regionCode}&cityCode=${$scope.model.selectedCity.regionCode}`)
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
  //endregion

  //region 添加&更新公共内容
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
    $scope.loadDistrictList(regionCode);
  };

  $scope.onDistrictChange4Edit = function (regionCode, regionName){
    if($scope.model.selectedDistrict4Edit.regionCode === regionCode){
      return false;
    }
    $scope.model.selectedDistrict4Edit = {regionCode: regionCode, regionName: regionName};
  };

  $scope.onCompanyNameBlur = function(){
    if(commonUtility.isEmpty($scope.model.companyName)){
      $scope.model.companyNameIsInValid = Constants.CHECK_INVALID.DEFAULT;
      return false;
    }

    $http.get('/company/checkCompanyNameExist?companyName=' + $scope.model.companyName)
        .then(function successCallback (response) {
          if(response.data.err){
            $scope.model.companyNameIsInValid = Constants.CHECK_INVALID.DEFAULT;
            bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
            return false;
          }

          $scope.model.companyNameIsInValid =
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
      $scope.model.cellphoneIsInValid = Constants.CHECK_INVALID.VALID;
      return false;
    }

    $http.get('/company/checkCellphoneExist?cellphone=' + $scope.model.cellphone)
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

  $scope.onSubmit = function(){
    if($scope.model.add){
      $scope.add();
    }else{
      $scope.change();
    }
  };
  //endregion

  //region 添加Brand
  $scope.onShowBrandModal = function (data){
    $scope.model.brandModalTitle = `${data.companyName}的Brand&Memo`;
    $scope.model.add = false;
    $scope.model.brandUrl = data.brand;
    $scope.model.memo = data.memo;
    $scope.model.companyID_brand = data.companyID;

    let uploadServerUrl = commonUtility.buildEnterpriseUploadRemoteUri(Constants.UPLOAD_SERVICE_URI, data.companyName, 'brand');

    uploadUtils.destroyUploadPlugin('#file-upload-brand');
    uploadUtils.initUploadPlugin('#file-upload-brand', uploadServerUrl, ['png','jpg', 'jpeg'], false, function (opt,data) {
      $scope.model.brandUrl = data.fileUrlList[0];
      layer.msg(localMessage.UPLOAD_SUCCESS);
    });

    $('#kt_modal_brand').modal('show');
  };

  $scope.onChangeBrand = function () {
    $http.put('/company/brand', {
      companyID: $scope.model.companyID_brand,
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

  //region 添加数据
  $scope.onShowAddModal = function(){
    $scope.setDefaultValue();
    $scope.model.modalTitle = '添加合作企业';
    $scope.model.add = true;
    $('#kt_modal_edit').modal('show');
  };

  $scope.add = function(){
    $http.post('/company', {
      companyName: $scope.model.companyName,
      provinceCode: $scope.model.selectedProvince4Edit.regionCode,
      cityCode: $scope.model.selectedCity4Edit.regionCode,
      districtCode: $scope.model.selectedDistrict4Edit.regionCode,
      address: $scope.model.address,
      contacts: $scope.model.contacts,
      cellphone: $scope.model.cellphone,
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

  //region 更新数据
  $scope.onShowChangeModal = function (data){
    $scope.setDefaultValue();
    $scope.model.modalTitle = '修改合作企业';
    $scope.model.companyID = data.companyID;
    $scope.model.companyName = data.companyName;
    $scope.model.companyNameIsInValid = Constants.CHECK_INVALID.VALID;
    $scope.model.selectedProvince4Edit = {regionCode: data.provinceCode, regionName: data.provinceName};
    $scope.model.selectedCity4Edit = {regionCode: data.cityCode, regionName: data.cityName};
    $scope.model.selectedDistrict4Edit = {regionCode: data.districtCode, regionName: data.districtName};
    $scope.model.address = data.address;
    $scope.model.contacts = data.contacts;
    $scope.model.cellphone = data.cellphone;
    $scope.model.cellphoneCompare = data.cellphone;
    $scope.model.cellphoneIsInValid = Constants.CHECK_INVALID.DEFAULT;
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
    $http.put('/company', {
      companyID: $scope.model.companyID,
      companyName: $scope.model.companyName,
      provinceCode: $scope.model.selectedProvince4Edit.regionCode,
      cityCode: $scope.model.selectedCity4Edit.regionCode,
      districtCode: $scope.model.selectedDistrict4Edit.regionCode,
      address: $scope.model.address,
      contacts: $scope.model.contacts,
      cellphone: $scope.model.cellphone,
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

  //region 更新状态
  $scope.onShowStatusModal = function (data) {
    $scope.model.statusModalTitle = `修改状态：${data.companyName}`;
    $scope.model.statusCompanyID = data.companyID;
    $scope.model.status = data.dataStatus;
    $scope.model.isActive = data.dataStatus === Constants.DATA_STATUS.ACTIVE;
    $('#kt_modal_status').modal('show');
  };

  $scope.onChangeStatus = function () {
    $http.put('/company/status', {
      companyID: $scope.model.statusCompanyID,
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
      message: `您确定要删除${data.companyName}吗？`,
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
          $http.delete(`company?companyID=${data.companyID}`)
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