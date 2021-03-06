let pageApp = angular.module('pageApp', []);
pageApp.controller('pageCtrl', function($scope, $http) {
    $scope.model = {
        //begin: 数据查询
        selectedTechnology: { technologyID: 0, technologyName: '所有技术' },
        technologyList: [],

        selectedLearningPhase: { learningPhaseID: 0, learningPhaseName: '所有分组' },
        learningPhaseList: [],

        selectedDataStatus: { statusCode: 'N', statusName: '所有状态' },
        dataStatusList: [
            { statusCode: 'P', statusName: '待审核' },
            { statusCode: 'A', statusName: '正常' },
            { statusCode: 'D', statusName: '禁用' }
        ],
        //end: 数据查询

        //begin: 数据列表
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

        //begin: 信息编辑
        loginUser: commonUtility.getLoginUser(),
        modalTitle: '',
        knowledgeID: 0,
        technologyList4Edit: [],
        selectedTechnology4Edit: { technologyID: 0, technologyName: '请选择所属技术' },

        selectedLearningPhase4Edit: { learningPhaseID: 0, learningPhaseName: '请选择知识点分组' },
        learningPhaseList4Edit: [],

        knowledgeName: '',
        knowledgeNameCompare: '',
        knowledgeNameIsInValid: Constants.CHECK_INVALID.DEFAULT,
        add: true,
        //end: 信息编辑

        //begin: 状态编辑
        statusKnowledgeID: 0,
        statusTechnologyID: 0,
        statusLearningPhaseID: 0,

        statusModalTitle: '',
        status: '',
        isActive: true,
        //end: 状态编辑
    };

    //region 页面初始化
    $scope.initPage = function() {
        commonUtility.setNavActive();
        $scope.loadSearchTechnologyList();
        $scope.loadData();
    };

    $scope.loadSearchTechnologyList = function() {
        $http.get('/common/technology').then(function successCallback(response) {
            if (response.data.err) {
                bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
                return false;
            }
            if (response.data.dataList === null) {
                return false;
            }
            $scope.model.technologyList = response.data.dataList;
            $scope.model.technologyList4Edit = response.data.dataList;
        }, function errorCallback(response) {
            bootbox.alert(localMessage.NETWORK_ERROR);
        });
    };

    $scope.loadLearningPhaseList = function(technologyID, groupName) {
        if (technologyID === 0) {
            switch (groupName) {
                case 'S':
                    $scope.model.learningPhaseList = [];
                    $scope.model.selectedLearningPhase = {learningPhaseID: 0, learningPhaseName: '所有分组'};
                    break;
                case 'E':
                    $scope.model.learningPhaseList4Edit = [];
                    $scope.model.selectedLearningPhase4Edit = {learningPhaseID: 0, learningPhaseName: '请选择知识点分组' };
                    break;
            }
            return false;
        }
        $http.get(`/common/learningPhase?technologyID=${technologyID}`).then(function successCallback(response) {
            if (response.data.err) {
                bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
                return false;
            }
            switch (groupName) {
                case 'S':
                    $scope.model.learningPhaseList = response.data.dataList;
                    $scope.model.selectedLearningPhase = {learningPhaseID: 0, learningPhaseName: '所有分组'};
                    break;
                case 'E':
                    $scope.model.learningPhaseList4Edit = response.data.dataList;
                    $scope.model.selectedLearningPhase4Edit = {learningPhaseID: 0, learningPhaseName: '请选择知识点分组' };
                    break;
            }
        }, function errorCallback(response) {
            bootbox.alert(localMessage.NETWORK_ERROR);
        });
    };

    $scope.loadData = function() {
        $http.get(`/knowledge/dataList?pageNumber=${$scope.model.pageNumber}&technologyID=${$scope.model.selectedTechnology.technologyID}&learningPhaseID=${$scope.model.selectedLearningPhase.learningPhaseID}&dataStatus=${$scope.model.selectedDataStatus.statusCode}`).then(function successCallback(response) {
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
            $scope.model.pageNumber = parseInt(response.data.dataContent.currentPageNum);
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

    $scope.onPrePage = function() {
        if ($scope.model.pageNumber === 1) {
            return false;
        }
        $scope.model.pageNumber--;
        $scope.loadData();
    };

    $scope.onPagination = function(pageNumber) {
        if ($scope.model.pageNumber === pageNumber) {
            return false;
        }
        $scope.model.pageNumber = pageNumber;
        $scope.loadData();
    };

    $scope.onNextPage = function() {
        if ($scope.model.pageNumber === $scope.model.maxPageNumber) {
            return false;
        }
        $scope.model.pageNumber++;
        $scope.loadData();
    };

    $scope.onTechnologyChange = function(technologyID, technologyName) {
        $scope.loadLearningPhaseList(technologyID, 'S');
        if ($scope.model.selectedTechnology.technologyID === technologyID) {
            return false;
        }
        $scope.model.selectedTechnology = { technologyID: technologyID, technologyName: technologyName };
        $scope.loadData();
    };

    $scope.onLearningPhaseChange = function(learningPhaseID, learningPhaseName) {
        $scope.model.selectedLearningPhase = { learningPhaseID: learningPhaseID, learningPhaseName: learningPhaseName };
        $scope.loadData();
    };

    $scope.onDataStatusChange = function(statusCode, statusName) {
        $scope.model.selectedDataStatus = { statusCode: statusCode, statusName: statusName };
        $scope.loadData();
    };

    //endregion

    //region 添加数据
    $scope.setDefaultValue = function() {
        $scope.model.knowledgeID = 0;
        $scope.model.knowledgeName = '';
        $scope.model.knowledgeNameCompare = '';
        $scope.model.knowledgeNameIsInValid = Constants.CHECK_INVALID.DEFAULT;
    };

    $scope.onShowAddModal = function() {
        $scope.setDefaultValue();
        $scope.model.modalTitle = '添加技术点';
        $scope.model.add = true;
        $('#kt_modal_edit').modal('show');
    };

    $scope.onTechnologyChange4Edit = function(technologyID, technologyName) {
        $scope.loadLearningPhaseList(technologyID, 'E');
        $scope.model.knowledgeNameIsInValid = Constants.CHECK_INVALID.DEFAULT;
        $scope.model.selectedTechnology4Edit = { technologyID: technologyID, technologyName: technologyName };
    };

    $scope.onLearningPhase4Edit = function(learningPhaseID, learningPhaseName) {
        $scope.model.selectedLearningPhase4Edit = { learningPhaseID: learningPhaseID, learningPhaseName: learningPhaseName };
    };

    $scope.onKnowledgeNameBlur = function() {
        if ($scope.model.selectedTechnology4Edit.technologyID === 0) {
            return false;
        }
        if (commonUtility.isEmpty($scope.model.knowledgeName)) {
            $scope.model.knowledgeNameIsInValid = Constants.CHECK_INVALID.DEFAULT;
            return false;
        }

        if ($scope.model.knowledgeName === $scope.model.knowledgeNameCompare) {
            $scope.model.knowledgeNameIsInValid = Constants.CHECK_INVALID.DEFAULT;
            return false;
        }

        $http.get(`/knowledge/checkTechnologyName?technologyID=${$scope.model.selectedTechnology4Edit.technologyID}&knowledgeName=${$scope.model.knowledgeName}`).then(function successCallback(response) {
            if (response.data.err) {
                $scope.model.knowledgeNameIsInValid = Constants.CHECK_INVALID.DEFAULT;
                bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
                return false;
            }

            $scope.model.knowledgeNameIsInValid =
                response.data.result ?
                Constants.CHECK_INVALID.INVALID :
                Constants.CHECK_INVALID.VALID;
        }, function errorCallback(response) {
            bootbox.alert(localMessage.NETWORK_ERROR);
        });
    };

    $scope.add = function() {
        $http.post('/knowledge', {
            technologyID: $scope.model.selectedTechnology4Edit.technologyID,
            learningPhaseID: $scope.model.selectedLearningPhase4Edit.learningPhaseID,
            knowledgeName: $scope.model.knowledgeName,
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

    $scope.onSubmit = function() {
        if ($scope.model.add) {
            $scope.add();
        } else {
            $scope.change();
        }
    };

    //endregion

    //region 修改数据
    $scope.onShowChangeModal = function(data) {
        $scope.setDefaultValue();
        $scope.model.modalTitle = '修改技术点';
        $scope.model.knowledgeID = data.knowledgeID;
        $scope.model.knowledgeName = data.knowledgeName;
        $scope.model.knowledgeNameCompare = data.knowledgeName;
        $scope.model.knowledgeNameIsInValid = Constants.CHECK_INVALID.VALID;
        $scope.model.selectedTechnology4Edit = { technologyID: data.technologyID, technologyName: data.technologyName };
        $scope.model.selectedLearningPhase4Edit = { learningPhaseID: data.learningPhaseID, learningPhaseName: data.learningPhaseName };
        $scope.model.add = false;
        $('#kt_modal_edit').modal('show');
    };

    $scope.change = function() {
        $http.put('/knowledge', {
            knowledgeID: $scope.model.knowledgeID,
            technologyID: $scope.model.selectedTechnology4Edit.technologyID,
            learningPhaseID: $scope.model.selectedLearningPhase4Edit.learningPhaseID,
            knowledgeName: $scope.model.knowledgeName,
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

    //region 习题上传
    $scope.onRedirectToUpload = function(data) {
        let uploadExercisesParameter = {
            technologyID: data.technologyID,
            technologyName: data.technologyName,
            learningPhaseID: data.learningPhaseID,
            learningPhaseName: data.learningPhaseName,
            knowledgeID: data.knowledgeID,
            knowledgeName: data.knowledgeName
        };
        localStorage.setItem(Constants.KEY_UPLOAD_EXERCISES, JSON.stringify(uploadExercisesParameter));
        location.href = '/knowledge/exercises';
    };
    //endregion

    // region 更新状态
    $scope.onShowStatusModal = function(data) {
        $scope.model.statusModalTitle = `修改状态：${data.technologyName} ${data.knowledgeName}`;
        $scope.model.statusKnowledgeID = data.knowledgeID;
        $scope.model.statusTechnologyID = data.technologyID;
        $scope.model.statusLearningPhaseID = data.learningPhaseID;
        $scope.model.status = data.dataStatus;
        $scope.model.isActive = data.dataStatus === Constants.DATA_STATUS.ACTIVE;
        $('#kt_modal_status').modal('show');
    };

    $scope.onChangeStatus = function() {
        $http.put('/knowledge/status', {
            technologyID: $scope.model.statusTechnologyID,
            knowledgeID: $scope.model.statusKnowledgeID,
            learningPhaseID: $scope.model.statusLearningPhaseID,
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

    // region 删除数据
    $scope.onDelete = function(data) {
        bootbox.confirm({
            message: `您确定要删除${data.technologyName}的技术点：${data.knowledgeName}吗？`,
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
            callback: function(result) {
                if (result) {
                    $http.delete(`knowledge?technologyID=${data.technologyID}&learningPhaseID=${data.learningPhaseID}&knowledgeID=${data.knowledgeID}`)
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