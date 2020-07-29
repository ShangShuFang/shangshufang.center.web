let pageApp = angular.module('pageApp', []);
pageApp.controller('pageCtrl', function($scope, $http) {
    $scope.model = {
        growingID: 0,
        headTitle: '',
        growingTarget: '',
        targetMemo: '',
        treeData: [],
        loginUser: commonUtility.getLoginUser()
    };

    $scope.initPage = function() {
        let growingID = commonUtility.getUriParameter('growingID');
        if (!commonUtility.isEmpty(growingID) && commonUtility.isNumber(growingID)) {
            $scope.model.growingID = parseInt(growingID);
        }
        commonUtility.setNavActive();
        $scope.loadGrowingMap();
        $scope.loadLearningPhase();
    };

    $scope.loadLearningPhase = function() {
        $http.get(`/growingMap/edit/list/learningPhase`)
            .then(function successCallback(response) {
                if (response.data.err) {
                    bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
                    return false;
                }

                if (commonUtility.isEmptyList(response.data.dataList)) {
                    return false;
                }
                let originalDataList = response.data.dataList;

                //新增场景
                if ($scope.model.growingID === 0) {
                    $scope.model.headTitle = '新增成长路线';
                    originalDataList.forEach((data) => {
                        let learningPhaseArray = [];
                        data.learningPhaseList.forEach((learningPhase) => {
                            learningPhaseArray.push({
                                "id": data.technologyID + '-' + learningPhase.learningPhaseID,
                                "text": learningPhase.learningPhaseName,
                                "state": { "selected": false },
                                "icon": "flaticon-placeholder-3 kt-font-primary"
                            });
                        });
                        $scope.model.treeData.push({
                            "id": data.technologyID,
                            "text": data.technologyName,
                            "icon": "flaticon2-paper-plane kt-font-danger",
                            "state": { "opened": true },
                            "children": learningPhaseArray
                        })
                    })

                    $scope.buildTreeData();
                    return false;
                }

                //编辑场景
                $http.get(`/growingMap/edit/list/learningPhase/chose?growingID=${$scope.model.growingID}`)
                    .then(function successCallback(response) {
                        if (response.data.err) {
                            bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
                            return false;
                        }
                        $scope.model.headTitle = '编辑成长路线';
                        let chooseDataList = response.data.dataList;
                        originalDataList.forEach((data) => {
                            let technologyID = data.technologyID;
                            let learningPhaseArray = [];
                            data.learningPhaseList.forEach((learningPhase) => {
                                let selected = false;
                                let chooseLearningPhaseArray = [];

                                for (let i = 0; i < chooseDataList.length; i++) {
                                    if (chooseDataList[i].technologyID === technologyID) {
                                        chooseLearningPhaseArray = chooseDataList[i].learningPhaseList;
                                        break;
                                    }
                                }

                                if (chooseLearningPhaseArray.length > 0) {
                                    for (let i = 0; i < chooseLearningPhaseArray.length; i++) {
                                        let chooseTechnologyID = chooseLearningPhaseArray[i].technologyID;
                                        let chooseLearningPhaseID = chooseLearningPhaseArray[i].learningPhaseID;
                                        if (learningPhase.technologyID === chooseTechnologyID && learningPhase.learningPhaseID === chooseLearningPhaseID) {
                                            selected = true;
                                            break;
                                        }
                                    }
                                }

                                learningPhaseArray.push({
                                    "id": data.technologyID + '-' + learningPhase.learningPhaseID,
                                    "text": learningPhase.learningPhaseName,
                                    "state": { "selected": selected },
                                    "icon": "flaticon-placeholder-3 kt-font-primary"
                                });
                            });
                            $scope.model.treeData.push({
                                "id": data.technologyID,
                                "text": data.technologyName,
                                "icon": "flaticon2-paper-plane kt-font-danger",
                                "state": { "opened": true },
                                "children": learningPhaseArray
                            })
                        })
                        $scope.buildTreeData();
                    }, function errorCallback(response) {
                        bootbox.alert(localMessage.NETWORK_ERROR);
                    });
            }, function errorCallback(response) {
                bootbox.alert(localMessage.NETWORK_ERROR);
            });
    };

    $scope.buildTreeData = function() {
        $('#growing_tree').jstree({
            'plugins': ["wholerow", "checkbox", "types"],
            'core': {
                "themes": {
                    "responsive": false
                },
                'data': [{
                    "text": "成长路径",
                    "state": {
                        "opened": true
                    },
                    "children": $scope.model.treeData
                }]
            },
            "types": {
                "default": {
                    "icon": "fa fa-folder kt-font-warning"
                },
                "file": {
                    "icon": "fa fa-file  kt-font-warning"
                }
            },
        });
    };

    $scope.loadGrowingMap = function() {
        if ($scope.model.growingID === 0) {
            return false;
        }
        $http.get(`/growingMap/edit/any?growingID=${$scope.model.growingID}`)
            .then(function successCallback(response) {
                if (response.data.err) {
                    bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
                    return false;
                }
                $scope.model.growingTarget = response.data.detail.growingTarget;
                $scope.model.targetMemo = response.data.detail.targetMemo;
            }, function errorCallback(response) {
                bootbox.alert(localMessage.NETWORK_ERROR);
            });
    };

    $scope.checkData = function() {
        let checkedArray = $('#growing_tree a.jstree-clicked i.flaticon-placeholder-3').parent().parent();
        if (commonUtility.isEmpty($scope.model.growingTarget)) {
            bootbox.alert(localMessage.GROWING_TARGET_EMPTY);
            return false;
        }
        if (commonUtility.isEmpty($scope.model.targetMemo)) {
            bootbox.alert(localMessage.TARGET_MEMO_EMPTY);
            return false;
        }
        if (checkedArray.length === 0) {
            bootbox.alert(localMessage.GROWING_MAP_EMPTY);
            return false;
        }
        return true;
    };

    $scope.onSave = function() {
        if (!$scope.checkData()) {
            return false;
        }

        let selectedArray = [];
        let checkedArray = $('#growing_tree a.jstree-clicked i.flaticon-placeholder-3').parent().parent();
        $.each(checkedArray, function(index, obj) {
            let technologyID = $(obj).parent().parent().attr('id')
            let learningPhaseID = $(obj).attr('id').split('-')[1];
            selectedArray.push({
                technologyID: technologyID,
                learningPhaseID: learningPhaseID
            });
        });

        $http.post('/growingMap/edit', {
            growingID: $scope.model.growingID,
            growingTarget: $scope.model.growingTarget,
            targetMemo: $scope.model.targetMemo,
            detailJson: JSON.stringify(selectedArray),
            loginUser: $scope.model.loginUser.adminID
        }).then(function successCallback(response) {
            if (response.data.err) {
                bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
                return false;
            }
            location.href = '/growingMap';
        }, function errorCallback(response) {
            bootbox.alert(localMessage.NETWORK_ERROR);
        });

    };

    $scope.initPage();
});

angular.bootstrap(document.querySelector('[ng-app="pageApp"]'), ['pageApp']);