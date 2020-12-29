let pageApp = angular.module('pageApp', []);
pageApp.controller('pageCtrl', function($scope, $http) {
    $scope.model = {
        selectedExamType: { examTypeCode: 0, examTypeName: '全部类型' },
        examTypeList: [
            { examTypeCode: 1, examTypeName: '服务端' },
            { examTypeCode: 2, examTypeName: '前端' },
            { examTypeCode: 3, examTypeName: '数据库' },
            { examTypeCode: 4, examTypeName: '全栈' }
        ],

        selectedDifficultyLevel: { difficultyLevelCode: 0, difficultyLevelName: '全部难度' },
        difficultyLevelList: [
            { difficultyLevelCode: 1, difficultyLevelName: '入门' },
            { difficultyLevelCode: 2, difficultyLevelName: '简单' },
            { difficultyLevelCode: 3, difficultyLevelName: '中等' },
            { difficultyLevelCode: 4, difficultyLevelName: '较难' },
            { difficultyLevelCode: 5, difficultyLevelName: '困难' }
        ],

        selectedDataStatus: { statusCode: 'NULL', statusName: '所有状态' },
        dataStatusList: [
            { statusCode: 'P', statusName: '待审核' },
            { statusCode: 'A', statusName: '启用' },
            { statusCode: 'D', statusName: '禁用' }
        ],

        fromIndex: 0,
        toIndex: 0,
        pageNumber: 1,
        totalCount: 0,
        maxPageNumber: 0,
        dataList: [],
        paginationArray: [],
        prePageNum: -1,
        nextPageNum: -1
    };

    $scope.editModel = {
        exercisesID: 0,
        optionType: 'add',
        title: '',//标题
        examKnowledge: '',//考察点
        examType: '1',//类型
        difficultyLevel: '1',//难度
        exercisesContent: '',//详细内容
        loginUser: commonUtility.getLoginUser()
    };

    $scope.statusModel = {
        exercisesID: 0,
        modalTitle: '',
        status: '',
    };

    //region 页面初始化
    $scope.initPage = function() {
        commonUtility.setNavActive();
        $scope.loadData();
    };

    $scope.onExamTypeChange = function(examTypeCode, examTypeName) {
        if ($scope.model.selectedExamType.examTypeCode === examTypeCode) {
            return false;
        }
        $scope.model.selectedExamType = { examTypeCode: examTypeCode, examTypeName: examTypeName };
        $scope.loadData();
    };

    $scope.onDifficultyLevelChange = function(difficultyLevelCode, difficultyLevelName) {
        if ($scope.model.selectedDifficultyLevel.difficultyLevelCode === difficultyLevelCode) {
            return false;
        }
        $scope.model.selectedDifficultyLevel = { difficultyLevelCode: difficultyLevelCode, difficultyLevelName: difficultyLevelName };
        $scope.loadData();
    };

    $scope.onDataStatusChange = function(statusCode, statusName) {
        if ($scope.model.selectedDataStatus.statusCode === statusCode) {
            return false;
        }
        $scope.model.selectedDataStatus = { statusCode: statusCode, statusName: statusName };
        $scope.loadData();
    };

    $scope.loadData = function() {
        $http.get('/exercises/comprehensive/list'
            .concat(`?pageNumber=${$scope.model.pageNumber}`)
            .concat(`&examType=${$scope.model.selectedExamType.examTypeCode}`)
            .concat(`&difficultyLevel=${$scope.model.selectedDifficultyLevel.difficultyLevelCode}`)
            .concat(`&dataStatus=${$scope.model.selectedDataStatus.statusCode}`))
            .then(function successCallback(response) {
                if (response.data.err) {
                    bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
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
                $scope.model.toIndex = response.data.dataContent.dataList === null ? 0 : ($scope.model.pageNumber - 1) * Constants.PAGE_SIZE + response.data.dataContent.dataList.length;
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

    $scope.onShowEditModal = function(data) {
        if (data === undefined) {
            $scope.editModel.optionType = 'add';
            $scope.editModel.title = '';
            $scope.editModel.examKnowledge = '';
            $scope.editModel.examType = '1';
            $scope.editModel.difficultyLevel = '1';
            $scope.editModel.exercisesContent = '';
        } else {
            $scope.editModel.optionType = 'upd';
            $scope.editModel.exercisesID = data.exercisesID;
            $scope.editModel.title = data.exercisesTitle;
            $scope.editModel.examKnowledge = data.examKnowledge;
            $scope.editModel.examType = data.examType.toString();
            $scope.editModel.difficultyLevel = data.difficultyLevel.toString();
            $scope.editModel.exercisesContent = data.exercisesDescription;
        }

        $('#kt_modal_edit').modal('show');
    };

    $scope.add = function() {
        $http.post('/exercises/comprehensive', {
            exercisesTitle: $scope.editModel.title,
            examKnowledge: $scope.editModel.examKnowledge,
            examType: $scope.editModel.examType,
            difficultyLevel: $scope.editModel.difficultyLevel,
            exercisesDescription: $scope.editModel.exercisesContent,
            loginUser: $scope.editModel.loginUser.adminID
        }).then(function successCallback(response) {
            if (response.data.err) {
                bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
                return false;
            }
            $scope.loadData();
            $('#kt_modal_edit').modal('hide');
        }, function errorCallback(response) {
            bootbox.alert(localMessage.NETWORK_ERROR);
        });
    };

    $scope.change = function() {
        $http.put('/exercises/comprehensive', {
            exercisesID: $scope.editModel.exercisesID,
            exercisesTitle: $scope.editModel.title,
            examKnowledge: $scope.editModel.examKnowledge,
            examType: $scope.editModel.examType,
            difficultyLevel: $scope.editModel.difficultyLevel,
            exercisesDescription: $scope.editModel.exercisesContent,
            loginUser: $scope.editModel.loginUser.adminID
        }).then(function successCallback(response) {
            if (response.data.err) {
                bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
                return false;
            }
            $scope.loadData();
            $('#kt_modal_edit').modal('hide');
        }, function errorCallback(response) {
            bootbox.alert(localMessage.NETWORK_ERROR);
        });
    };

    $scope.onSubmit = function() {
        if ($scope.editModel.optionType === 'add') {
            $scope.add();
        } else {
            $scope.change();
        }
    };

    $scope.onShowStatusModal = function(data) {
        $scope.statusModel.exercisesID = data.exercisesID;
        $scope.statusModel.modalTitle = `状态修改：${data.exercisesTitle}`;
        $('#kt_modal_status').modal('show');
    };

    $scope.onChangeStatus = function() {
        $http.put('/exercises/comprehensive/status', {
            exercisesID: $scope.statusModel.exercisesID,
            status: $scope.statusModel.status,
            loginUser: $scope.editModel.loginUser.adminID
        }).then(function successCallback(response) {
            if (response.data.err) {
                bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
                return false;
            }
            $scope.loadData();
            $('#kt_modal_status').modal('hide');
        }, function errorCallback(response) {
            bootbox.alert(localMessage.NETWORK_ERROR);
        });
    };

    $scope.onDelete = function(data) {
            bootbox.confirm({
                message: `您确定要删除【${data.exercisesTitle}】吗？`,
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
                        $http.delete(`/exercises/comprehensive?exercisesID=${data.exercisesID}`)
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
        }
        //endregion

    $scope.initPage();
});

angular.bootstrap(document.querySelector('[ng-app="pageApp"]'), ['pageApp']);