let pageApp = angular.module('pageApp', []);
pageApp.controller('pageCtrl', function ($scope, $http) {
  $scope.model = {
    technologyList: [],

    //region 表单内容
    loginUser: commonUtility.getLoginUser(),
    exercisesTypeList: [],
    selectedExercisesType: {exercisesTypeCode: '', exercisesTypeName: '请选择习题类型'},
    exercisesName: '',
    exercisesCode: '',
    exercisesCodeIsInValid: Constants.CHECK_INVALID.DEFAULT,
    exercisesCodeIsInValidMessage: '',
    knowledgeList: [],
    imageList: [],
    documentList: [],
    //endregion


    //region 数据更新
    exercisesID: 0,
    hasChosenKnowledgeList: [],
    hasProcessedTechnologyArray: [],
    hasProcessedLearningPhaseArray: [],
    hasProcessedKnowledgeArray: [],
    isLoadTreeNodeData: true,
    //endregion

    isAdd: true
  };

  //region 页面初始化
  $scope.initPage = function () {
    commonUtility.setNavActive();
    $scope.setOption();
    $scope.loadExercisesTypeList();
    $scope.loadTechnologyList();
    $scope.loadData();
  };

  $scope.setOption = function(){
    let exercisesID = localStorage.getItem(Constants.KEY_UPD_EXERCISES);
    if(exercisesID === null || isNaN(exercisesID)){
      $scope.model.isAdd = true;
      return false;
    }
    $scope.model.exercisesID = parseInt(exercisesID);
    $scope.model.isAdd = false;
  };

  $scope.loadExercisesTypeList = function (){
    $scope.model.exercisesTypeList.push({exercisesTypeCode: 'S', exercisesTypeName: '单点练习'});
    $scope.model.exercisesTypeList.push({exercisesTypeCode: 'C', exercisesTypeName: '综合练习'});
    $scope.model.exercisesTypeList.push({exercisesTypeCode: 'P', exercisesTypeName: '项目练习'});
  };

  $scope.onExercisesTypeChange = function(exercisesTypeCode, exercisesTypeName){
    $scope.model.exercisesName = '';
    if($scope.model.selectedExercisesType.exercisesTypeCode === exercisesTypeCode){
      return false;
    }

    $scope.model.selectedExercisesType = {exercisesTypeCode: exercisesTypeCode, exercisesTypeName: exercisesTypeName};

    if($scope.model.selectedExercisesType.exercisesTypeCode === 'S'){
      $scope.removeAllChooseKnowledge();
    }
  };

  $scope.loadTechnologyList = function(){
    $scope.model.technologyList.splice(0, $scope.model.technologyList.length);
    $http.get('/learningPath/usingTechnology').then(function successCallback (response) {
      if(response.data.err){
        bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
        return false;
      }
      if(response.data.dataList === null){
        return false;
      }
      response.data.dataList.forEach(function (data) {
        $scope.model.technologyList.push({
          technologyID: data.technologyID,
          technologyName: data.technologyName,
          learningPhaseList: [],
          nodeType: 'T',
          isOpen: false,
          isSelected: false
        });
      });
      if(!$scope.model.isAdd){
        $scope.loadChooseKnowledgeList('T');
      }
    }, function errorCallback(response) {
      bootbox.alert(localMessage.NETWORK_ERROR);
    });
  };

  $scope.loadLearningPhase = function(parent){
    parent.learningPhaseList.splice(0, parent.learningPhaseList.length);
    $http.get(`/learningPath/usingLearningPhase?technologyID=${parent.technologyID}`).then(function successCallback (response) {
      if(response.data.err){
        bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
        return false;
      }
      if(response.data.dataList === null){
        layer.msg(localMessage.NO_USING_LEARNING_PHASE);
        return false;
      }
      response.data.dataList.forEach(function (learningPath) {
        $scope.model.technologyList.forEach(function (technology) {
          if(technology.technologyID === parent.technologyID){
            technology.learningPhaseList.push({
              technologyID: parent.technologyID,
              technologyName: parent.technologyName,
              learningPhaseID: learningPath.learningPhaseID,
              learningPhaseName: learningPath.learningPhaseName,
              knowledgeList: [],
              nodeType: 'P',
              isOpen: false,
              isSelected: false
            });
          }
        });
      });
      parent.isOpen = true;
      if(!$scope.model.isAdd){
        $scope.loadChooseKnowledgeList('P');
      }
    }, function errorCallback(response) {
      bootbox.alert(localMessage.NETWORK_ERROR);
    });
  };

  $scope.loadChooseKnowledgeList = function(level){
    if($scope.model.hasChosenKnowledgeList.length === 0){
      $http.get(`/softwareExercisesEdit/knowledgeList?exercisesID=${$scope.model.exercisesID}`).then(function successCallback (response) {
        if(response.data.err){
          bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
          return false;
        }
        if(response.data.knowledgeList === null){
          return false;
        }

        $scope.model.hasChosenKnowledgeList = response.data.knowledgeList;

        if(level !== 'T'){
          return false;
        }
        $scope.model.hasChosenKnowledgeList.forEach(function (data) {
          $scope.model.technologyList.forEach(function (technology) {
            if(data.technologyID === technology.technologyID){
              if(!$scope.model.hasProcessedTechnologyArray.includes(data.technologyID)){
                $scope.model.hasProcessedTechnologyArray.push(data.technologyID);
                $scope.loadLearningPhase(technology);
              }
            }
          });
        });
      }, function errorCallback(response) {
        bootbox.alert(localMessage.NETWORK_ERROR);
      });
    }else{
      if(level === 'P'){
        $scope.model.hasChosenKnowledgeList.forEach(function (data) {
          $scope.model.technologyList.forEach(function (technology) {
            if(technology.isOpen){
              technology.learningPhaseList.forEach(function (learningPhase) {
                if(data.technologyID === technology.technologyID && data.learningPhaseID === learningPhase.learningPhaseID){
                  if(!$scope.model.hasProcessedLearningPhaseArray.includes(technology.technologyID.toString() + learningPhase.learningPhaseID.toString())){
                    $scope.model.hasProcessedLearningPhaseArray.push(technology.technologyID.toString() + learningPhase.learningPhaseID.toString());
                    $scope.loadKnowledge(learningPhase);
                  }
                }
              });
            }
          });
        });
      }

      if(level === 'K'){
        $scope.model.hasChosenKnowledgeList.forEach(function (data) {
          $scope.model.technologyList.forEach(function (technology) {
            if(technology.isOpen){
              technology.learningPhaseList.forEach(function (learningPhase) {
                if(learningPhase.isOpen){
                  learningPhase.knowledgeList.forEach(function(knowledge){
                    if(data.technologyID === technology.technologyID &&
                        data.learningPhaseID === learningPhase.learningPhaseID &&
                        data.knowledgeID === knowledge.knowledgeID) {

                      if(!$scope.model.hasProcessedKnowledgeArray.includes(technology.technologyID.toString() + learningPhase.learningPhaseID.toString() + knowledge.knowledgeID.toString())){
                        $scope.model.hasProcessedKnowledgeArray.push(technology.technologyID.toString() + learningPhase.learningPhaseID.toString() + knowledge.knowledgeID.toString());
                        $scope.model.knowledgeList.push({
                          technologyID: technology.technologyID,
                          learningPhaseID: learningPhase.learningPhaseID,
                          knowledgeID: knowledge.knowledgeID
                        });
                        knowledge.isSelected = true;
                      }
                    }
                  });
                }
              });
            }
          });
        });
      }
    }
  };

  $scope.loadData = function(){
    if($scope.model.isAdd){
      return false;
    }
    $http.get('/softwareExercisesEdit/exercises?exercisesID=' + $scope.model.exercisesID).then(function successCallback (response) {
      if(response.data.err){
        bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
        return false;
      }
      $scope.model.exercisesName = response.data.exercises.exercisesName;
      $scope.model.exercisesCode = response.data.exercises.exercisesCode;
      $scope.model.exercisesCodeIsInValid = Constants.CHECK_INVALID.VALID;
      $scope.model.exercisesCodeIsInValidMessage = '';
      $scope.model.exercisesTypeList.forEach(function (exercisesType) {
        if(exercisesType.exercisesTypeCode === response.data.exercises.exercisesType){
          $scope.model.selectedExercisesType = {exercisesTypeCode: exercisesType.exercisesTypeCode, exercisesTypeName: exercisesType.exercisesTypeName};
        }
      });
    }, function errorCallback(response) {
      bootbox.alert(localMessage.NETWORK_ERROR);
    });
  };

  $scope.onBack = function(){
    localStorage.removeItem(Constants.KEY_UPD_EXERCISES);
    location.href = '/softwareExercises';
  };
  //endregion

  //region 添加及更新的公共方法
  $scope.loadKnowledge = function(parent){
    parent.knowledgeList.splice(0, parent.knowledgeList.length);
    $http.get(`/learningPath/usingKnowledge?technologyID=${parent.technologyID}&learningPhase=${parent.learningPhaseID}`).then(function successCallback (response) {
      if(response.data.err){
        bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
        return false;
      }
      if(response.data.dataList === null){
        layer.msg(localMessage.NO_USING_KNOWLEDGE);
        return false;
      }
      response.data.dataList.forEach(function (knowledge) {
        $scope.model.technologyList.forEach(function (technology) {
          if(technology.technologyID === parent.technologyID){
            technology.learningPhaseList.forEach(function (learningPhase) {
              if(learningPhase.learningPhaseID === parent.learningPhaseID){
                learningPhase.knowledgeList.push({
                  technologyID: parent.technologyID,
                  technologyName: parent.technologyName,
                  learningPhaseID: parent.learningPhaseID,
                  learningPhaseName: parent.learningPhaseName,
                  knowledgeID: knowledge.knowledgeID,
                  knowledgeName: knowledge.knowledgeName,
                  nodeType: 'K',
                  isSelected: false
                });
              }
            });
          }
        });
      });
      parent.isOpen = true;

      if(!$scope.model.isAdd){
        $scope.loadChooseKnowledgeList('K');
      }
    }, function errorCallback(response) {
      bootbox.alert(localMessage.NETWORK_ERROR);
    });
  };

  $scope.onExercisesCodeBlur = function(){
    if(commonUtility.isEmpty($scope.model.exercisesCode)){
      $scope.model.exercisesCodeIsInValid = Constants.CHECK_INVALID.DEFAULT;
      return false;
    }

    $http.get('/softwareExercisesEdit/checkExercisesCode?exercisesCode=' + $scope.model.exercisesCode).then(function successCallback (response) {
      if(response.data.err){
        $scope.model.exercisesCodeIsInValid = Constants.CHECK_INVALID.DEFAULT;
        bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
        return false;
      }

      $scope.model.exercisesCodeIsInValid =
          response.data.result ?
              Constants.CHECK_INVALID.INVALID
              : Constants.CHECK_INVALID.VALID;
      $scope.model.exercisesCodeIsInValidMessage = localMessage.EXERCISES_CODE_INVALID;
    }, function errorCallback(response) {
      bootbox.alert(localMessage.NETWORK_ERROR);
    });
  };

  $scope.onTreeNodeClick = function(node){

    if(node.nodeType === 'T'){
      if($scope.model.selectedExercisesType.exercisesTypeCode === 'S'){
        return false;
      }
      node.isSelected = !node.isSelected;
      node.learningPhaseList.forEach(function (learningPhase) {
        learningPhase.isSelected = node.isSelected;
        learningPhase.knowledgeList.forEach(function (knowledge) {
          knowledge.isSelected = node.isSelected;
          $scope.setChooseKnowledgeList(node.technologyID, learningPhase.learningPhaseID, knowledge.knowledgeID, knowledge.isSelected);
        })
      });
    }

    if(node.nodeType === 'P'){
      if($scope.model.selectedExercisesType.exercisesTypeCode === 'S'){
        return false;
      }
      node.isSelected = !node.isSelected;
      node.knowledgeList.forEach(function (knowledge) {
        knowledge.isSelected = node.isSelected;
        $scope.setChooseKnowledgeList(node.technologyID, node.learningPhaseID, knowledge.knowledgeID, knowledge.isSelected);
      })
    }

    if(node.nodeType === 'K'){
      if($scope.model.selectedExercisesType.exercisesTypeCode === 'S'){
        //$scope.removeAllChooseKnowledge();
        $scope.model.exercisesName = `${node.knowledgeName}习题集`;
      }

      node.isSelected = !node.isSelected;
      $scope.setChooseKnowledgeList(node.technologyID, node.learningPhaseID, node.knowledgeID, node.isSelected);
    }
  };

  $scope.onTreeNodeDbClick = function(node, $event){
    if(node.nodeType === 'T'){
      if(node.isOpen){
        node.isOpen = false;
        $event.stopPropagation();
        return false;
      }
      $scope.loadLearningPhase(node);
    }
    if(node.nodeType === 'P'){
      if(node.isOpen){
        node.isOpen = false;
        $event.stopPropagation();
        return false;
      }
      $scope.loadKnowledge(node);
    }
    $event.stopPropagation();
  };

  $scope.removeAllChooseKnowledge = function () {
    $('.tree-demo input[type="checkbox"]').prop("checked",false);
    $scope.model.technologyList.forEach(function (technology) {
      technology.isSelected = false;
      technology.learningPhaseList.forEach(function (learningPhase) {
        learningPhase.isSelected = false;
        learningPhase.knowledgeList.forEach(function (knowledge) {
          knowledge.isSelected = false;
        })
      });
    });
    $scope.model.knowledgeList.splice(0, $scope.model.knowledgeList.length);
  };

  $scope.setChooseKnowledgeList = function(technologyID, learningPhaseID, knowledgeID, isSelected){
    if(!isSelected){
      //从数组中移除
      $scope.model.knowledgeList.forEach(function (knowledge, index) {
        if(knowledge.technologyID === technologyID
            && knowledge.learningPhaseID === learningPhaseID
            && knowledge.knowledgeID === knowledgeID){
          $scope.model.knowledgeList.splice(index, 1);
        }
      });
      return false;
    }
    //添加到数组中
    let isExists = false;
    $scope.model.knowledgeList.forEach(function (knowledge, index) {
      if(knowledge.technologyID === technologyID
          && knowledge.learningPhaseID === learningPhaseID
          && knowledge.knowledgeID === knowledgeID){
        isExists = true;
      }
    });
    if(isExists){
      return false;
    }
    $scope.model.knowledgeList.push({
      technologyID: technologyID,
      learningPhaseID: learningPhaseID,
      knowledgeID: knowledgeID
    });
  };

  $scope.checkExercisesCodeFormat = function(){
    switch ($scope.model.selectedExercisesType.exercisesTypeCode) {
      case 'S':
        if($scope.model.exercisesCode.indexOf('s_ex_') !== 0){
          $scope.model.exercisesCodeIsInValid = Constants.CHECK_INVALID.INVALID;
          $scope.model.exercisesCodeIsInValidMessage = localMessage.EXERCISES_CODE_SINGLE_FORMAT_INVALID;
          return false;
        }
        break;
      case 'C':
        if($scope.model.exercisesCode.indexOf('c_ex_') !== 0){
          $scope.model.exercisesCodeIsInValid = Constants.CHECK_INVALID.INVALID;
          $scope.model.exercisesCodeIsInValidMessage = localMessage.EXERCISES_CODE_COMPREHENSIVE_FORMAT_INVALID;
          return false;
        }
        break;
      case 'P':
        if($scope.model.exercisesCode.indexOf('p_ex_') !== 0){
          $scope.model.exercisesCodeIsInValid = Constants.CHECK_INVALID.INVALID;
          $scope.model.exercisesCodeIsInValidMessage = localMessage.EXERCISES_CODE_PROJECT_FORMAT_INVALID;
          return false;
        }
        break;
    }
    return true;
  };

  $scope.checkChooseKnowledge = function(){
    let technology = [];
    let learningPhase = [];
    let knowledgeArr = [];

    $scope.model.knowledgeList.forEach(function (knowledge) {
      if(!technology.includes(knowledge.technologyID)){
        technology.push(knowledge.technologyID);
      }
      if(!learningPhase.includes(knowledge.learningPhaseID)){
        learningPhase.push(knowledge.learningPhaseID);
      }
      if(!knowledgeArr.includes(knowledge.knowledgeID)){
        knowledgeArr.push(knowledge.knowledgeID);
      }
    });
    switch ($scope.model.selectedExercisesType.exercisesTypeCode) {
      case 'S':
        if(technology.length > 1 || learningPhase.length > 1 || knowledgeArr.length > 1){
          bootbox.alert(localMessage.EXERCISES_TYPE_SINGLE_INVALID);
          return false;
        }
        break;
      case 'C':
        if(technology.length > 1){
          bootbox.alert(localMessage.EXERCISES_TYPE_COMPREHENSIVE_INVALID);
          return false;
        }
        break;
    }
    return true;
  };

  $scope.checkData = function(){
    // if(!$scope.checkExercisesCodeFormat()){
    //   return false;
    // }
    if(!$scope.checkChooseKnowledge()){
      return false;
    }
    return true;
  };

  $scope.onSubmit = function(){
    if(!$scope.checkData()){
      return false;
    }
    if($scope.model.isAdd){
      $scope.add();
    }else{
      $scope.change();
    }
  };
  //endregion

  //region 新增
  $scope.add = function(){
    $http.post('/softwareExercisesEdit', {
      exercisesType: $scope.model.selectedExercisesType.exercisesTypeCode,
      exercisesName: $scope.model.exercisesName,
      // exercisesCode: $scope.model.exercisesCode,
      exercisesCode: 0,
      knowledgeListJson: JSON.stringify($scope.model.knowledgeList),
      loginUser: $scope.model.loginUser.adminID
    }).then(function successCallback(response) {
      if(response.data.err){
        bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
        return false;
      }
      location.href = '/softwareExercises';
    }, function errorCallback(response) {
      bootbox.alert(localMessage.NETWORK_ERROR);
    });
  };
  //endregion

  //region 更新
  $scope.change = function(){
    $http.put('/softwareExercisesEdit', {
      exercisesID: $scope.model.exercisesID,
      exercisesName: $scope.model.exercisesName,
      knowledgeListJson: JSON.stringify($scope.model.knowledgeList),
      loginUser: $scope.model.loginUser.adminID
    }).then(function successCallback(response) {
      if(response.data.err){
        bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
        return false;
      }
      localStorage.removeItem(Constants.KEY_UPD_EXERCISES);
      location.href = '/softwareExercises';
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