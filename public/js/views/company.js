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

    //region Brand编辑
    brandModalTitle: '',
    companyID_brand: 0,
    brandUrl: '',
    //endregion

    //region Memo编辑
    memoModalTitle: '',
    companyID_memo: 0,
    memo: '',
    //endregion

    //region Recruit Level编辑
    recruitLevelModalTitle: '',
    companyID_recruitLevel: 0,
    recruitLevel: 'L3',
    //endregion

    //region 信息编辑
    loginUser: commonUtility.getLoginUser(),
    modalTitle: '',
    companyID: 0,
    companyName: '',
    companyAbbreviation: '',
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

    //region 使用技术
    technologyModalTitle: '',
    technologyCompanyID: 0,

    technologyList: [],
    selectedTechnologyID: 0,
    selectedTechnology: null,

    choiceTechnologyList: [],
    choiceSelectedTechnologyID: 0,
    choiceSelectedTechnology: null,
    //endregion

    //region 使用技术点
    usingKnowledgeModalTitle: '',
    usingKnowledgeCompanyID: 0,

    usingTechnologyList: [],
    selectedUsingTechnology: {technologyID: 0, technologyName: '请选择使用技术', isSelected: false},

    learningPhaseList: [],
    selectedLearningPhase: {learningPhaseID: 0, learningPhaseName: '请选择学习阶段', isSelected: false},

    knowledgeList: [],
    selectedKnowledge: {knowledgeID: 0, knowledgeName: ''},

    choiceKnowledgeList: [],
    choiceSelectedKnowledge: {knowledgeID: 0, knowledgeName: ''},
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
    $scope.model.companyAbbreviation = '';
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
    $scope.model.brandModalTitle = `上传${data.companyName}的logo`;
    $scope.model.companyID_brand = data.companyID;
    $scope.model.brandUrl = data.brand;
    // $scope.model.memo = data.memo;
    $scope.model.add = false;

    let uploadServerUrl = commonUtility.buildEnterpriseUploadRemoteUri(Constants.UPLOAD_SERVICE_URI, data.companyName, 'brand');

    uploadUtils.destroyUploadPlugin('#file-upload-brand');
    uploadUtils.initUploadPlugin('#file-upload-brand', uploadServerUrl, ['png','jpg', 'jpeg'], false, function (opt,data) {
      $scope.model.brandUrl = data.fileUrlList[0];
      $scope.$apply();
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

  //region 添加Memo
  $scope.onShowMemoModal = function(data){
    $scope.model.memoModalTitle = `${data.companyName}客户寄语`;
    $scope.model.companyID_memo = data.companyID;
    $scope.model.add = commonUtility.isEmpty(data.memo);
    $scope.model.memo = data.memo;
    $('#kt_modal_memo').modal('show');
  };

  $scope.onChangeMemo = function () {
    $http.put('/company/memo', {
      companyID: $scope.model.companyID_memo,
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

  //region 添加最低接收的级别
  $scope.onShowRecruitLevelModal = function(data){
    $scope.model.recruitLevelModalTitle = `${data.companyName}要求的最低能力级别`;
    $scope.model.companyID_recruitLevel = data.companyID;
    $scope.model.recruitLevel = data.recruitLevel;
    $('#kt_modal_recruit_level').modal('show');
  };

  $scope.onChangeRecruitLevel = function () {
    $http.put('/company/recruitLevel', {
      companyID: $scope.model.companyID_recruitLevel,
      recruitLevel: $scope.model.recruitLevel,
      loginUser: $scope.model.loginUser.adminID
    }).then(function successCallback(response) {
      if(response.data.err){
        bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
        return false;
      }
      $('#kt_modal_recruit_level').modal('hide');
      $scope.loadData();
    }, function errorCallback(response) {
      bootbox.alert(localMessage.NETWORK_ERROR);
    });
  };
  //endregion

  //region 使用技术
  $scope.onShowTechnologyModal = function(data){
    $scope.model.technologyModalTitle = `${data.companyName}使用技术`;
    $scope.model.technologyCompanyID = data.companyID;

    // 查询所有的技术信息
    $http.get('/common/technology').then(function successCallback (response) {
      if(response.data.err){
        bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
        return false;
      }
      if(commonUtility.isEmptyList(response.data.dataList)){
        $('#kt_modal_technology').modal('show');
        return false;
      }
      $scope.model.technologyList = response.data.dataList;

      //查询当前企业使用的技术信息
      $http.get(`/company/usingTechnology?companyID=${$scope.model.technologyCompanyID}`).then(function successCallback (response) {
        if(response.data.err){
          bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
          return false;
        }
        $scope.model.choiceTechnologyList.splice(0, $scope.model.choiceTechnologyList.length);
        if(commonUtility.isEmptyList(response.data.dataList)) {
          $('#kt_modal_technology').modal('show');
          return false;
        }
        response.data.dataList.forEach(function(data) {
          $scope.model.technologyList.forEach(function(technology) {
            if(data.technologyID === technology.technologyID){
              let index = $scope.model.technologyList.indexOf(technology);
              $scope.model.choiceTechnologyList.push(technology);
              $scope.model.technologyList.splice(index, 1);
            }
          });
        });
        $('#kt_modal_technology').modal('show');
      }, function errorCallback(response) {
        bootbox.alert(localMessage.NETWORK_ERROR);
      });

    }, function errorCallback(response) {
      bootbox.alert(localMessage.NETWORK_ERROR);
    });
  };

  $scope.onTechnologyClick = function(technology){
    $scope.model.selectedTechnologyID = technology.technologyID;
    $scope.model.selectedTechnology = technology;
  };

  $scope.onTechnologyDbClick = function(technology){
    let index = $scope.model.technologyList.indexOf(technology);
    $scope.model.technologyList.splice(index, 1);
    $scope.model.choiceTechnologyList.push(technology);
  };

  $scope.onChoiceTechnologyClick = function(technology){
    $scope.model.choiceSelectedTechnologyID = technology.technologyID;
    $scope.model.choiceSelectedTechnology = technology;
  };

  $scope.onChoiceTechnologyDbClick = function(technology){
    let index = $scope.model.choiceTechnologyList.indexOf(technology);
    $scope.model.choiceTechnologyList.splice(index, 1);
    $scope.model.technologyList.push(technology);
  };

  $scope.onMoveAllTechnologyToChoiceTechnology = function(){
    if($scope.model.technologyList.length === 0){
      return false;
    }
    $scope.model.technologyList.forEach(function(technology) {
      $scope.model.choiceTechnologyList.push(technology);
    });
    $scope.model.technologyList.splice(0, $scope.model.technologyList.length);
  };

  $scope.onMoveTechnologyToChoiceTechnology = function(){
    if($scope.model.selectedTechnologyID === 0 || $scope.model.selectedTechnology === null){
      return false;
    }
    let index = $scope.model.technologyList.indexOf($scope.model.selectedTechnology);
    $scope.model.technologyList.splice(index, 1);
    $scope.model.choiceTechnologyList.push($scope.model.selectedTechnology);
    $scope.model.selectedTechnologyID = 0;
    $scope.model.selectedTechnology = null;
  };

  $scope.onMoveAllChoiceTechnologyToTechnology = function(){
    if($scope.model.choiceTechnologyList.length === 0){
      return false;
    }
    $scope.model.choiceTechnologyList.forEach(function(technology) {
      $scope.model.technologyList.push(technology);
    });
    $scope.model.choiceTechnologyList.splice(0, $scope.model.choiceTechnologyList.length);
  };

  $scope.onMoveChoiceTechnologyToTechnology = function(){
    if($scope.model.choiceSelectedTechnologyID === 0 || $scope.model.choiceSelectedTechnology === null){
      return false;
    }
    let index = $scope.model.choiceTechnologyList.indexOf($scope.model.choiceSelectedTechnology);
    $scope.model.choiceTechnologyList.splice(index, 1);
    $scope.model.technologyList.push($scope.model.choiceSelectedTechnology);
    $scope.model.choiceSelectedTechnologyID = 0;
    $scope.model.choiceSelectedTechnology = null;
  };

  $scope.onSaveUseTechnology = function() {
    let choiceTechnologyIdList = [];
    $scope.model.choiceTechnologyList.forEach(function(technology) {
      choiceTechnologyIdList.push(technology.technologyID);
    });
    $http.post('/company/usingTechnology', {
      companyID: $scope.model.technologyCompanyID,
      technologyIdList: choiceTechnologyIdList.join(','),
      loginUser: $scope.model.loginUser.adminID
    }).then(function successCallback(response) {
      if(response.data.err){
        bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
        return false;
      }
      $('#kt_modal_technology').modal('hide');
      $scope.loadData();
    }, function errorCallback(response) {
      bootbox.alert(localMessage.NETWORK_ERROR);
    });
  };
  //endregion

  //region 使用技术点
  $scope.onShowKnowledgeModal = function(data){
    $scope.model.usingKnowledgeModalTitle = `【${data.companyName}】使用技术点`;
    $scope.model.usingKnowledgeCompanyID = data.companyID;

    $scope.model.selectedUsingTechnology = {technologyID: 0, technologyName: '请选择使用技术', isSelected: false};
    $scope.model.selectedLearningPhase = {learningPhaseID: 0, learningPhaseName: '请选择学习阶段', isSelected: false};

    $scope.model.selectedKnowledge = {knowledgeID: 0, knowledgeName: ''};
    $scope.model.knowledgeList.splice(0, $scope.model.knowledgeList.length);

    $scope.model.choiceSelectedKnowledge = {knowledgeID: 0, knowledgeName: ''};
    $scope.model.choiceKnowledgeList.splice(0, $scope.model.choiceKnowledgeList.length);

    $scope.loadCompanyUsingTechnology();
  };

  $scope.setDefaultKnowledgeModal = function(initType){
    switch (initType) {
      case 'init':
        $scope.model.learningPhaseList.splice(0, $scope.model.learningPhaseList.length);
        $scope.model.selectedLearningPhase = {learningPhaseID: 0, learningPhaseName: '请选择学习阶段', isSelected: false};

        $scope.model.knowledgeList.splice(0, $scope.model.knowledgeList.length);
        $scope.model.selectedKnowledge = {knowledgeID: 0, knowledgeName: ''};

        $scope.model.choiceKnowledgeList.splice(0, $scope.model.choiceKnowledgeList.length);
        $scope.model.selectedKnowledge = {knowledgeID: 0, knowledgeName: ''};
        break;
      case 'technology':
        $scope.model.learningPhaseList.splice(0, $scope.model.learningPhaseList.length);
        $scope.model.selectedLearningPhase = {learningPhaseID: 0, learningPhaseName: '请选择学习阶段', isSelected: false};

        $scope.model.knowledgeList.splice(0, $scope.model.knowledgeList.length);
        $scope.model.selectedKnowledge = {knowledgeID: 0, knowledgeName: ''};

        $scope.model.choiceKnowledgeList.splice(0, $scope.model.choiceKnowledgeList.length);
        $scope.model.selectedKnowledge = {knowledgeID: 0, knowledgeName: ''};
        break;
      case 'learningPhase':
        $scope.model.knowledgeList.splice(0, $scope.model.knowledgeList.length);
        $scope.model.selectedKnowledge = {knowledgeID: 0, knowledgeName: ''};

        $scope.model.choiceKnowledgeList.splice(0, $scope.model.choiceKnowledgeList.length);
        $scope.model.selectedKnowledge = {knowledgeID: 0, knowledgeName: ''};
        break;
    }
  };

  $scope.loadCompanyUsingTechnology = function(){
    $scope.model.usingTechnologyList.splice(0, $scope.model.usingTechnologyList.length);
    $http.get(`/company/usingTechnology?companyID=${$scope.model.usingKnowledgeCompanyID}`).then(function successCallback (response) {
      if(response.data.err){
        bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
        return false;
      }
      if(commonUtility.isEmptyList(response.data.dataList)) {
        $('#kt_modal_knowledge').modal('show');
        return false;
      }
      response.data.dataList.forEach(function(data) {
        $scope.model.usingTechnologyList.push({
          technologyID: data.technologyID,
          technologyName: data.technologyName,
          isSelected: false
        });
      });

      //根据已经编辑技术点的技术，设置技术列表中不同选项的样式
      $http.get(`/company/related/technology?companyID=${$scope.model.usingKnowledgeCompanyID}`).then(function successCallback (response) {
        if(response.data.err){
          bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
          return false;
        }
        if(commonUtility.isEmptyList(response.data.dataList)) {
          $('#kt_modal_knowledge').modal('show');
          return false;
        }

        response.data.dataList.forEach(function(data) {
          $scope.model.usingTechnologyList.forEach(function (usingTechnology) {
            if(data.technologyID === usingTechnology.technologyID){
              usingTechnology.isSelected = true;
            }
          });
        });
        $('#kt_modal_knowledge').modal('show');
      }, function errorCallback () {
        bootbox.alert(localMessage.NETWORK_ERROR);
      });
    }, function errorCallback(response) {
      bootbox.alert(localMessage.NETWORK_ERROR);
    });
  };

  $scope.onUsingTechnologyChange = function(technologyID, technologyName){
    $scope.model.selectedUsingTechnology = {technologyID: technologyID, technologyName: technologyName};
    $scope.setDefaultKnowledgeModal('technology');
    if($scope.model.selectedUsingTechnology.technologyID === 0){
      return false;
    }
    $scope.loadUsingLearningPhase();
  };

  $scope.loadUsingLearningPhase = function(){
    $http.get(`/learningPath/usingLearningPhase?technologyID=${$scope.model.selectedUsingTechnology.technologyID}`)
        .then(function successCallback (response) {
          if(response.data.err){
            bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
            return false;
          }
          if(commonUtility.isEmptyList(response.data.dataList)){
            return false;
          }

          response.data.dataList.forEach(function (data) {
            $scope.model.learningPhaseList.push({
              learningPhaseID: data.learningPhaseID,
              learningPhaseName: data.learningPhaseName,
              isSelected: false
            });
          });

          //标记该公司已经选择了技术点的学习阶段
          $http.get(`/company/related/learningPhase?companyID=${$scope.model.usingKnowledgeCompanyID}&technologyID=${$scope.model.selectedUsingTechnology.technologyID}`)
              .then(function successCallback (response) {
            if(response.data.err){
              bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
              return false;
            }
            if(commonUtility.isEmptyList(response.data.dataList)) {
              return false;
            }

            response.data.dataList.forEach(function(data) {
              $scope.model.learningPhaseList.forEach(function (learningPhase) {
                if(data.learningPhaseID === learningPhase.learningPhaseID){
                  learningPhase.isSelected = true;
                }
              });
            });
          }, function errorCallback () {
            bootbox.alert(localMessage.NETWORK_ERROR);
          });

        }, function errorCallback(response) {
          bootbox.alert(localMessage.NETWORK_ERROR);
        });
  };

  $scope.onLearningPhaseChange = function(learningPhaseID, learningPhaseName){
    $scope.model.selectedLearningPhase = {learningPhaseID: learningPhaseID, learningPhaseName: learningPhaseName};
    $scope.setDefaultKnowledgeModal('learningPhase');
    if($scope.model.selectedLearningPhase.learningPhaseID === 0){
      return false;
    }
    $scope.loadKnowledge();
  };

  $scope.loadKnowledge = function(){
    $http.get(`/learningPath/usingKnowledge?technologyID=${$scope.model.selectedUsingTechnology.technologyID}&learningPhase=${$scope.model.selectedLearningPhase.learningPhaseID}`)
        .then(function successCallback (response) {
          if(response.data.err){
            bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
            return false;
          }
          if(commonUtility.isEmptyList(response.data.dataList)){
            return false;
          }

          response.data.dataList.forEach(function (data) {
            $scope.model.knowledgeList.push({knowledgeID: data.knowledgeID, knowledgeName: data.knowledgeName});
          });

          //查询企业已经被认可的技术点
          $http.get(`/company/related/knowledge?companyID=${$scope.model.usingKnowledgeCompanyID}&technologyID=${$scope.model.selectedUsingTechnology.technologyID}&learningPhaseID=${$scope.model.selectedLearningPhase.learningPhaseID}`)
              .then(function successCallback (response) {
                if(response.data.err){
                  bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
                  return false;
                }
                if(commonUtility.isEmptyList(response.data.dataList)) {
                  return false;
                }

                response.data.dataList.forEach(function(data) {
                  $scope.model.knowledgeList.forEach(function (knowledge, index) {
                    if(data.knowledgeID === knowledge.knowledgeID){
                      $scope.model.choiceKnowledgeList.push(knowledge);
                      $scope.model.knowledgeList.splice(index, 1);
                    }
                  });
                });
              }, function errorCallback () {
                bootbox.alert(localMessage.NETWORK_ERROR);
              });


        }, function errorCallback(response) {
          bootbox.alert(localMessage.NETWORK_ERROR);
        });
  };

  $scope.onKnowledgeClick = function(knowledge){
    $scope.model.selectedKnowledge = knowledge;
  };

  $scope.onKnowledgeDbClick = function(knowledge){
    let index = $scope.model.knowledgeList.indexOf(knowledge);
    $scope.model.knowledgeList.splice(index, 1);
    $scope.model.choiceKnowledgeList.push(knowledge);
    $scope.model.selectedKnowledge = {knowledgeID: 0, knowledgeName: '', enable: true};
  };

  $scope.onChoiceKnowledgeClick = function(knowledge){
    $scope.model.choiceSelectedKnowledge = knowledge;
  };

  $scope.onChoiceKnowledgeDbClick = function(knowledge){
    let index = $scope.model.choiceKnowledgeList.indexOf(knowledge);
    $scope.model.choiceKnowledgeList.splice(index, 1);
    $scope.model.knowledgeList.push(knowledge);
    $scope.model.choiceSelectedKnowledge = {knowledgeID: 0, knowledgeName: '', enable: true};
  };

  $scope.onMoveAllFromSourceToChoice = function(){
    if($scope.model.knowledgeList.length === 0){
      return false;
    }
    $scope.model.knowledgeList.forEach(function(knowledge) {
      $scope.model.choiceKnowledgeList.push(knowledge);
    });

    $scope.model.knowledgeList.splice(0, $scope.model.knowledgeList.length);
  };

  $scope.onMoveItemFromSourceToChoice = function(){
    if($scope.model.selectedKnowledge.knowledgeID === 0){
      return false;
    }
    let index = $scope.model.knowledgeList.indexOf($scope.model.selectedKnowledge);
    $scope.model.knowledgeList.splice(index, 1);
    $scope.model.choiceKnowledgeList.push($scope.model.selectedKnowledge);
    $scope.model.selectedKnowledge = {knowledgeID: 0, knowledgeName: '', enable: true};
  };

  $scope.onMoveItemFromChoiceToSource = function(){
    if($scope.model.choiceSelectedKnowledge.knowledgeID === 0){
      return false;
    }
    let index = $scope.model.choiceKnowledgeList.indexOf($scope.model.choiceSelectedKnowledge);
    $scope.model.choiceKnowledgeList.splice(index, 1);
    $scope.model.knowledgeList.push($scope.model.choiceSelectedKnowledge);
    $scope.model.choiceSelectedTechnologyID = 0;
    $scope.model.choiceSelectedKnowledge = {knowledgeID: 0, knowledgeName: '', enable: true};
  };

  $scope.onMoveAllFromChoiceToSource = function(){
    if($scope.model.choiceKnowledgeList.length === 0){
      return false;
    }
    $scope.model.choiceKnowledgeList.forEach(function(knowledge) {
      $scope.model.knowledgeList.push(knowledge);
    });
    $scope.model.choiceKnowledgeList.splice(0, $scope.model.choiceKnowledgeList.length);
  };

  $scope.onSaveUsingKnowledge = function(){
    let choiceKnowledgeIdList = [];
    $scope.model.choiceKnowledgeList.forEach(function(knowledge) {
      choiceKnowledgeIdList.push(knowledge.knowledgeID);
    });
    $http.post('/company/usingKnowledge', {
      companyID: $scope.model.usingKnowledgeCompanyID,
      technologyID: $scope.model.selectedUsingTechnology.technologyID,
      learningPhaseID: $scope.model.selectedLearningPhase.learningPhaseID,
      knowledgeIdList: choiceKnowledgeIdList.join(','),
      loginUser: $scope.model.loginUser.adminID
    }).then(function successCallback(response) {
      if(response.data.err){
        bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
        return false;
      }
      $('#kt_modal_knowledge').modal('hide');
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
      companyAbbreviation: $scope.model.companyAbbreviation,
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
    $scope.model.companyAbbreviation = data.companyAbbreviation;
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
      companyAbbreviation: $scope.model.companyAbbreviation,
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