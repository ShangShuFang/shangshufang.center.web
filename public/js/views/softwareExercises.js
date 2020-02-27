let pageApp = angular.module('pageApp', []);
pageApp.controller('pageCtrl', function ($scope, $http) {
  $scope.model = {
    //region 数据查询
    exercisesTypeList: [],
    selectedExercisesType: {},

    technologyList: [],
    selectedTechnology: {technologyID: 0, technologyName: '所有技术'},

    learningPhaseList: [],
    selectedLearningPhase: {learningPhaseID: 0, learningPhaseName: '所有阶段'},
    //endregion 数据查询

    //region 数据列表
    singleData: {
      fromIndex : 0,
      toIndex: 0,
      pageNumber: 1,
      totalCount: 0,
      maxPageNumber: 0,
      dataList: [],
      paginationArray: [],
      prePageNum: -1,
      nextPageNum: -1,
    },
    comprehensiveData: {
      fromIndex : 0,
      toIndex: 0,
      pageNumber: 1,
      totalCount: 0,
      maxPageNumber: 0,
      dataList: [],
      paginationArray: [],
      prePageNum: -1,
      nextPageNum: -1,
    },
    projectData: {
      fromIndex : 0,
      toIndex: 0,
      pageNumber: 1,
      totalCount: 0,
      maxPageNumber: 0,
      dataList: [],
      paginationArray: [],
      prePageNum: -1,
      nextPageNum: -1,
    },

    //endregion 数据列表

    //region 状态编辑
    loginUser: commonUtility.getLoginUser(),
    statusExercisesID: 0,
    statusModalTitle: '',
    status: '',
    isActive: true,
    //endregion 状态编辑
  };

  //region 页面初始化
  $scope.initPage = function () {
    localStorage.removeItem(Constants.KEY_UPD_EXERCISES);
    commonUtility.setNavActive();
    $scope.loadExercisesTypeList();
    $scope.loadTechnologyList();
    $scope.loadSingleData();
  };

  $scope.loadExercisesTypeList = function (){
    $scope.model.exercisesTypeList.push({exercisesTypeCode: 'S', exercisesTypeName: '单点练习'});
    $scope.model.exercisesTypeList.push({exercisesTypeCode: 'C', exercisesTypeName: '综合练习'});
    $scope.model.exercisesTypeList.push({exercisesTypeCode: 'P', exercisesTypeName: '项目练习'});
    $scope.model.selectedExercisesType = $scope.model.exercisesTypeList[0];
  };

  $scope.onExercisesTypeChange = function(exercisesTypeCode, exercisesTypeName){
    if($scope.model.selectedExercisesType.exercisesTypeCode === exercisesTypeCode){
      return false;
    }
    $scope.model.selectedExercisesType = {exercisesTypeCode: exercisesTypeCode, exercisesTypeName: exercisesTypeName};
    $scope.loadSingleData();
  };

  $scope.loadTechnologyList = function (){
    $http.get('/common/technology').then(function successCallback (response) {
      if(response.data.err){
        bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
        return false;
      }
      if(commonUtility.isEmptyList(response.data.dataList)){
        return false;
      }
      $scope.model.technologyList = response.data.dataList;
    }, function errorCallback(response) {
      bootbox.alert(localMessage.NETWORK_ERROR);
    });
  };

  $scope.onTechnologyChange = function(technologyID, technologyName){
    if($scope.model.selectedTechnology.technologyID === technologyID){
      return false;
    }
    $scope.model.selectedTechnology = {technologyID: technologyID, technologyName: technologyName};
    $scope.model.selectedLearningPhase = {learningPhaseID: 0, learningPhaseName: '所有阶段'};
    $scope.loadLearningPhase();
    $scope.loadSingleData();
  };

  $scope.loadLearningPhase = function(){
    $http.get(`/learningPath/usingLearningPhase?technologyID=${$scope.model.selectedTechnology.technologyID}`)
        .then(function successCallback (response) {
          if(response.data.err){
            bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
            return false;
          }
          if(commonUtility.isEmptyList(response.data.dataList)){
            return false;
          }

          $scope.model.learningPhaseList = response.data.dataList;
        }, function errorCallback(response) {
          bootbox.alert(localMessage.NETWORK_ERROR);
        });
  };

  $scope.onLearningPhaseChange = function (learningPhaseID, learningPhaseName){
    if($scope.model.selectedLearningPhase.learningPhaseID === learningPhaseID){
      return false;
    }
    $scope.model.selectedLearningPhase = {learningPhaseID: learningPhaseID, learningPhaseName: learningPhaseName};
    $scope.loadSingleData();
  };


  //endregion

  //region single data
  $scope.loadSingleData = function(){
    $http.get(`/softwareExercises/dataList?pageNumber=${$scope.model.singleData.pageNumber}&exercisesTypeCode=${$scope.model.selectedExercisesType.exercisesTypeCode}&technologyID=${$scope.model.selectedTechnology.technologyID}&learningPhaseID=${$scope.model.selectedLearningPhase.learningPhaseID}`)
        .then(function successCallback (response) {
          if(response.data.err){
            bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
            return false;
          }
          if(response.data.dataContent === null){
            return false;
          }
          if(response.data.dataContent.dataList !== null && response.data.dataContent.dataList.length === 0 && $scope.model.singleData.pageNumber > 1){
            $scope.model.singleData.pageNumber--;
            $scope.loadSingleData();
            return false;
          }
          $scope.model.singleData.totalCount = response.data.dataContent.totalCount;
          $scope.model.singleData.dataList = response.data.dataContent.dataList;
          $scope.model.singleData.pageNumber = response.data.dataContent.currentPageNum;
          $scope.model.singleData.maxPageNumber = Math.ceil(response.data.dataContent.totalCount / response.data.dataContent.pageSize);
          $scope.model.singleData.paginationArray = response.data.dataContent.paginationArray;
          $scope.model.singleData.prePageNum = response.data.dataContent.prePageNum === undefined ? -1 : response.data.dataContent.prePageNum;
          $scope.model.singleData.nextPageNum = response.data.dataContent.nextPageNum === undefined ? -1 : response.data.dataContent.nextPageNum;
          $scope.model.singleData.fromIndex = response.data.dataContent.dataList === null ? 0 : ($scope.model.singleData.pageNumber - 1) * Constants.PAGE_SIZE + 1;
          $scope.model.singleData.toIndex = response.data.dataContent.dataList === null ? 0 : ($scope.model.singleData.pageNumber - 1) * Constants.PAGE_SIZE + $scope.model.singleData.dataList.length;
        }, function errorCallback(response) {
          bootbox.alert(localMessage.NETWORK_ERROR);
        });
  };

  $scope.onSinglePrePage = function(){
    if($scope.model.singleData.pageNumber === 1){
      return false;
    }
    $scope.model.singleData.pageNumber--;
    $scope.loadSingleData();
  };

  $scope.onSinglePagination = function(pageNumber){
    if($scope.model.singleData.pageNumber === pageNumber){
      return false;
    }
    $scope.model.singleData.pageNumber = pageNumber;
    $scope.loadSingleData();
  };

  $scope.onSingleNextPage = function(){
    if($scope.model.singleData.pageNumber === $scope.model.singleData.maxPageNumber){
      return false;
    }
    $scope.model.singleData.pageNumber++;
    $scope.loadSingleData();
  };
  //endregion

  //region 更新
  $scope.onRedirectToEdit = function(data){
    localStorage.setItem(Constants.KEY_UPD_EXERCISES, data.exercisesID);
    location.href = '/softwareExercisesEdit';
  };
  //endregion

  //region 上传
  $scope.onRedirectToUpload = function(data){
    localStorage.setItem(Constants.KEY_UPLOAD_EXERCISES, data.exercisesID);
    if(data.exercisesType === 'S'){
      location.href = `/softwareExercisesFiles?exercisesType=${data.exercisesType}&technologyName=${data.technologyName}&learningPhaseName=${data.learningPhaseName}&knowledgeName=${data.knowledgeName}`;
      return false;
    }
    location.href = '/softwareExercisesFiles';
  };
  //endregion

  //region 更新状态
  $scope.onShowStatusModal = function (data) {
    $scope.model.statusModalTitle = `修改习题状态：${data.exercisesName}`;
    $scope.model.statusExercisesID = data.exercisesID;
    $scope.model.status = data.dataStatus;
    $scope.model.isActive = data.dataStatus === Constants.DATA_STATUS.ACTIVE;
    $('#kt_modal_status').modal('show');
  };

  $scope.onChangeStatus = function () {
    $http.put('/softwareExercises/status', {
      exercisesID: $scope.model.statusExercisesID,
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
      message: `您确定要删除习题【${data.exercisesName}】的所有相关内容吗？`,
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
          $http.delete(`softwareExercises?exercisesID=${data.exercisesID}`)
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