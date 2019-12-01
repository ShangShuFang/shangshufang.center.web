let pageApp = angular.module('pageApp', []);
pageApp.controller('pageCtrl', function ($scope, $http) {
  $scope.model = {
    //begin: 数据查询
    selectedTechnology: {technologyID: 0, technologyName: '所有技术'},
    technologyList: [],
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
    loginUser: commonUtility.getLoginUser(),
    modalTitle: '',
    learningPathID: 0,

    technologyList4Edit: [],
    selectedTechnology4Edit: {technologyID: 0, technologyName: '请选择所属技术'},

    learningPhaseList: [],
    selectedLearningPhase: {learningPhaseID: 0, learningPhaseName: '请选择学习阶段', enable: true},

    knowledgeList: [],
    selectedKnowledge: {knowledgeID: 0, knowledgeName: '', enable: true},

    choiceKnowledgeList: [],
    choiceSelectedKnowledge: {knowledgeID: 0, knowledgeName: '', enable: true},

    add: true,
    //end: 信息编辑

    //begin: 状态编辑
    statusTechnologyID: 0,
    statusLearningPhaseID: 0,

    statusModalTitle: '',
    status: '',
    isActive: true,
    //end: 状态编辑
  };

  //region 页面初始化
  $scope.initPage = function () {
    commonUtility.setNavActive();
    $scope.loadTechnologyList();
    $scope.loadData();
  };

  $scope.loadTechnologyList = function (){
    $http.get('/common/technology').then(function successCallback (response) {
      if(response.data.err){
        bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
        return false;
      }
      if(response.data.dataList === null){
        return false;
      }
      $scope.model.technologyList = response.data.dataList;
      $scope.model.technologyList4Edit = response.data.dataList;
    }, function errorCallback(response) {
      bootbox.alert(localMessage.NETWORK_ERROR);
    });
  };

  $scope.loadData = function(){
    $http.get(`/learningPath/dataList?pageNumber=${$scope.model.pageNumber}&technologyID=${$scope.model.selectedTechnology.technologyID}`)
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

  $scope.onTechnologyChange = function(technologyID, technologyName){
    if($scope.model.selectedTechnology.technologyID === technologyID){
      return false;
    }
    $scope.model.selectedTechnology = {technologyID: technologyID, technologyName: technologyName};
    $scope.loadData();
  };
  //endregion

  // region 添加更新公共方法
  $scope.onTechnologyChange4Edit = function (technologyID, technologyName){
    $scope.model.selectedTechnology4Edit = {technologyID: technologyID, technologyName: technologyName};
    $scope.model.selectedLearningPhase = {learningPhaseID: 0, learningPhaseName: '请选择学习阶段', enable: true};
    $scope.model.knowledgeList.splice(0, $scope.model.knowledgeList.length);
    $scope.model.choiceKnowledgeList.splice(0, $scope.model.choiceKnowledgeList.length);
    if($scope.model.selectedTechnology4Edit.technologyID === 0){
      $scope.model.learningPhaseList.splice(0, $scope.model.learningPhaseList.length);
      return false;
    }
    $scope.loadEnabledLearningPhase();
    $scope.loadEnabledKnowledge();
  };

  $scope.loadEnabledLearningPhase = function(){
    //获取所有的学习阶段
    $http.get('/common/learningPhase')
        .then(function successCallback (response) {
          if(response.data.err){
            bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
            return false;
          }
          if(commonUtility.isEmptyList(response.data.dataList)){
            $scope.model.learningPhaseList.splice(0, $scope.model.learningPhaseList.length);
            return false;
          }
          $scope.model.learningPhaseList.splice(0, $scope.model.learningPhaseList.length);
          response.data.dataList.forEach(function(data) {
            $scope.model.learningPhaseList.push({
              learningPhaseID: data.learningPhaseID,
              learningPhaseName: data.learningPhaseName,
              enable: true
            });
          });

          //获取当前技术已经添加的学习阶段
          $http.get(`/learningPath/usingLearningPhase?technologyID=${$scope.model.selectedTechnology4Edit.technologyID}`)
              .then(function successCallback (response) {
                if(response.data.err){
                  bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
                  return false;
                }
                if(commonUtility.isEmptyList(response.data.dataList)){
                  return false;
                }

                $scope.model.learningPhaseList.forEach(function(learningPhase) {
                  response.data.dataList.forEach(function (usingLearningPhase) {
                    if(learningPhase.learningPhaseID === usingLearningPhase.learningPhaseID) {
                      learningPhase.enable = false;
                    }
                  });
                });
              }, function errorCallback(response) {
                bootbox.alert(localMessage.NETWORK_ERROR);
              });

        }, function errorCallback(response) {
          bootbox.alert(localMessage.NETWORK_ERROR);
        });
  };

  $scope.loadEnabledKnowledge = function(){
    //获取当前技术的所有知识点
    $http.get(`/common/knowledge?technologyID=${$scope.model.selectedTechnology4Edit.technologyID}`)
        .then(function successCallback (response) {
          if(response.data.err){
            bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
            return false;
          }
          if(commonUtility.isEmptyList(response.data.dataList)){
            $scope.model.knowledgeList.splice(0, $scope.model.knowledgeList.length);
            return false;
          }
          $scope.model.knowledgeList.splice(0, $scope.model.knowledgeList.length);
          response.data.dataList.forEach(function(data) {
            $scope.model.knowledgeList.push({
              knowledgeID: data.knowledgeID,
              knowledgeName: data.knowledgeName,
              enable: true
            });
          });

          $scope.setEnabledKnowledge();
        }, function errorCallback(response) {
          bootbox.alert(localMessage.NETWORK_ERROR);
        });
  };

  $scope.setEnabledKnowledge = function(){
    $http.get(`/learningPath/usingKnowledge?technologyID=${$scope.model.selectedTechnology4Edit.technologyID}`)
        .then(function successCallback (response) {
          if(response.data.err){
            bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
            return false;
          }
          if(commonUtility.isEmptyList(response.data.dataList)){
            return false;
          }

          $scope.model.knowledgeList.forEach(function(knowledge) {
            response.data.dataList.forEach(function (usingKnowledge) {
              if(knowledge.knowledgeID === usingKnowledge.knowledgeID) {
                knowledge.enable = false;
              }
            });
          });
          if(!$scope.model.add){
            $scope.loadUsingKnowledge4Phase();
          }
        }, function errorCallback(response) {
          bootbox.alert(localMessage.NETWORK_ERROR);
        });
  };

  $scope.loadUsingKnowledge4Phase = function(){
    $http.get(`/learningPath/usingKnowledge?technologyID=${$scope.model.selectedTechnology4Edit.technologyID}&learningPhase=${$scope.model.selectedLearningPhase.learningPhaseID}`)
        .then(function successCallback (response) {
          if(response.data.err){
            bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
            return false;
          }
          if(commonUtility.isEmptyList(response.data.dataList)){
            return false;
          }
          response.data.dataList.forEach(function (usingKnowledge) {
            $scope.model.choiceKnowledgeList.push({
              knowledgeID: usingKnowledge.knowledgeID,
              knowledgeName: usingKnowledge.knowledgeName,
              enable: true
            });
            $scope.model.knowledgeList.forEach(function (knowledge, index) {
              if(knowledge.knowledgeID === usingKnowledge.knowledgeID){
                $scope.model.knowledgeList.splice(index, 1);
              }
            })
          });
        }, function errorCallback(response) {
          bootbox.alert(localMessage.NETWORK_ERROR);
        });
  };

  $scope.onLearningPhase4Edit = function (learningPhaseID, learningPhaseName, enable){
    $scope.model.selectedLearningPhase = {learningPhaseID: learningPhaseID, learningPhaseName: learningPhaseName, enable: enable};
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
    $scope.model.knowledgeList.forEach(function(knowledge, index) {
      if(knowledge.enable){
        $scope.model.choiceKnowledgeList.push(knowledge);
      }
    });

    $scope.model.choiceKnowledgeList.forEach(function(choiceKnowledge) {
      $scope.model.knowledgeList.forEach(function (knowledge, index) {
        if(choiceKnowledge.knowledgeID === knowledge.knowledgeID){
          $scope.model.knowledgeList.splice(index, 1);
        }
      });
    });
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

  $scope.onSubmit = function(){
    if($scope.model.add){
      $scope.add();
    }else{
      $scope.change();
    }
  };
  //endregion

  //region 添加数据
  $scope.setDefaultValue = function (){
    $scope.model.selectedTechnology4Edit = {technologyID: 0, technologyName: '请选择所属技术'};
    $scope.model.selectedLearningPhase = {learningPhaseID: 0, learningPhaseName: '请选择学习阶段', enable: true};

    $scope.model.learningPhaseList.splice(0, $scope.model.learningPhaseList.length);
    $scope.model.knowledgeList.splice(0, $scope.model.knowledgeList.length);
    $scope.model.choiceKnowledgeList.splice(0, $scope.model.choiceKnowledgeList.length);
    $scope.model.selectedKnowledge = {knowledgeID: 0, knowledgeName: '', enable: true};
    $scope.model.choiceSelectedKnowledge = {knowledgeID: 0, knowledgeName: '', enable: true};
  };

  $scope.onShowAddModal = function(){
    $scope.setDefaultValue();
    $scope.model.modalTitle = '添加学习路径';
    $scope.model.add = true;
    $('#kt_modal_edit').modal('show');
  };

  $scope.add = function(){
    $http.post('/learningPath', {
      technologyID: $scope.model.selectedTechnology4Edit.technologyID,
      learningPhaseID: $scope.model.selectedLearningPhase.learningPhaseID,
      knowledgeIdList: $scope.model.choiceKnowledgeList.map((knowledge) => {return knowledge.knowledgeID}).join(','),
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

  //region 修改数据
  $scope.onShowChangeModal = function (data){
    $scope.setDefaultValue();
    $scope.model.modalTitle = '修改学习路径';
    $scope.model.learningPathID = data.learningPathID;
    $scope.model.selectedTechnology4Edit = {technologyID: data.technologyID, technologyName: data.technologyName};
    $scope.model.selectedLearningPhase = {learningPhaseID: data.learningPhaseID, learningPhaseName: data.learningPhaseName};
    $scope.model.add = false;
    $scope.loadEnabledKnowledge();
    $('#kt_modal_edit').modal('show');
  };

  $scope.change = function(){
    $http.put('/learningPath', {
      technologyID: $scope.model.selectedTechnology4Edit.technologyID,
      learningPhaseID: $scope.model.selectedLearningPhase.learningPhaseID,
      knowledgeIdList: $scope.model.choiceKnowledgeList.map((knowledge) => {return knowledge.knowledgeID}).join(','),
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

  // region 更新状态
  $scope.onShowStatusModal = function (data) {
    $scope.model.statusModalTitle = `修改状态：${data.technologyName} ${data.learningPhaseName}学习内容`;
    $scope.model.statusTechnologyID = data.technologyID;
    $scope.model.statusLearningPhaseID = data.learningPhaseID;
    $scope.model.status = data.dataStatus;
    $scope.model.isActive = data.dataStatus === Constants.DATA_STATUS.ACTIVE;
    $('#kt_modal_status').modal('show');
  };

  $scope.onChangeStatus = function () {
    $http.put('/learningPath/status', {
      technologyID: $scope.model.statusTechnologyID,
      learningPhaseID: $scope.model.statusLearningPhaseID,
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

  // region 删除数据
  $scope.onDelete = function(data){
    bootbox.confirm({
      message: `您确定要删除${data.technologyName}${data.learningPhaseName}的学习内容吗？`,
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
          $http.delete(`learningPath?technologyID=${data.technologyID}&learningPhaseID=${data.learningPhaseID}`)
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