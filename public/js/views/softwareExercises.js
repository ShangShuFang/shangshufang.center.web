let pageApp = angular.module('pageApp', []);
pageApp.controller('pageCtrl', function ($scope, $http) {
  $scope.model = {
    //region 数据查询
    exercisesTypeList: [],
    selectedExercisesType: {exercisesTypeCode: 'A', exercisesTypeName: '所有类型'},

    technologyList: [],
    selectedTechnology: {technologyID: 0, technologyName: '所有技术'},

    learningPhaseList: [],
    selectedLearningPhase: {learningPhaseID: 0, learningPhaseName: '所有阶段'},
    //endregion 数据查询

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
    $scope.loadData();
  };

  $scope.loadExercisesTypeList = function (){
    $scope.model.exercisesTypeList.push({exercisesTypeCode: 'S', exercisesTypeName: '单点练习'});
    $scope.model.exercisesTypeList.push({exercisesTypeCode: 'C', exercisesTypeName: '综合练习'});
    $scope.model.exercisesTypeList.push({exercisesTypeCode: 'P', exercisesTypeName: '项目练习'});
  };

  $scope.onExercisesTypeChange = function(exercisesTypeCode, exercisesTypeName){
    if($scope.model.selectedExercisesType.exercisesTypeCode === exercisesTypeCode){
      return false;
    }
    $scope.model.selectedExercisesType = {exercisesTypeCode: exercisesTypeCode, exercisesTypeName: exercisesTypeName};
    $scope.loadData();
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
    $scope.loadData();
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
    $scope.loadData();
  };

  $scope.loadData = function(){
    $http.get(`/softwareExercises/dataList?pageNumber=${$scope.model.pageNumber}&exercisesTypeCode=${$scope.model.selectedExercisesType.exercisesTypeCode}&technologyID=${$scope.model.selectedTechnology.technologyID}&learningPhaseID=${$scope.model.selectedLearningPhase.learningPhaseID}`)
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

  //region 更新
  $scope.onRedirectToEdit = function(data){
    localStorage.setItem(Constants.KEY_UPD_EXERCISES, data.exercisesID);
    location.href = '/softwareExercisesEdit';
  };
  //endregion

  //region 上传
  $scope.onRedirectToUpload = function(data){
    localStorage.setItem(Constants.KEY_UPLOAD_EXERCISES, data.exercisesID);
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