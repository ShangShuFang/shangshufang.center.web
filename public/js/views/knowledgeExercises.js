let pageApp = angular.module('pageApp', []);
pageApp.controller('pageCtrl', function($scope, $http) {
    $scope.model = {
        technologyID: 0,
        technologyName: '',
        learningPhaseID: 0,
        learningPhaseName: '',
        knowledgeID: 0,
        knowledgeName: '',
        loginUser: commonUtility.getLoginUser(),
        choiceQuestion: {
            dataList: [],
            pageNumber: 1,
            totalCount: 0,
            maxPageNumber: 0,
            dataStatus: 'NULL'
        },
        fillInBlankQuestion: {
            dataList: [],
            pageNumber: 1,
            totalCount: 0,
            maxPageNumber: 0,
            dataStatus: 'NULL'
        },
        programmeQuestion: {
            dataList: [],
            pageNumber: 1,
            totalCount: 0,
            maxPageNumber: 0,
            dataStatus: 'NULL'
        },
        approveExercises: {
            title: '',
            type: '',
            status: '',
            question: {}
        }
        //choiceQuestionList: [],
        // fillInBlankQuestionList: [],
        // programmeQuestionList: [],

        // documentList: [],
        // documentUrl: '',
        // answerGitUrl: '',
    };

    //#region 选择题
    $scope.loadChoiceQuestionList = function() {
        //取得当前知识点的选择题
        $http.get('/knowledge/exercises/choice/list?'
                .concat(`pageNumber=${$scope.model.choiceQuestion.pageNumber}`)
                .concat(`&technologyID=${$scope.model.technologyID}`)
                .concat(`&knowledgeID=${$scope.model.knowledgeID}`)
                .concat(`&dataStatus=${$scope.model.choiceQuestion.dataStatus}`))
            .then(function successCallback(response) {
                if (response.data.err) {
                    bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
                    return false;
                }
                
                $scope.model.choiceQuestion.totalCount = response.data.dataContent.totalCount;
                    $scope.model.choiceQuestion.maxPageNumber = Math.ceil(response.data.dataContent.totalCount / response.data.dataContent.pageSize);

                if (response.data.dataContent.totalCount > 0) {
                    response.data.dataContent.dataList.forEach((data) => {
                        data.isNew = false;
                        data.isShowEdit = false;
                        $scope.model.choiceQuestion.dataList.push(data);
                    });
                    return false;
                }
                $scope.model.choiceQuestion.dataList = [];
            }, function errorCallback(response) {
                bootbox.alert(localMessage.NETWORK_ERROR);
            });
    };

    $scope.onFilterChoiceQuestion = function(dataStatus) {
        if ($scope.model.choiceQuestion.dataStatus === dataStatus) {
            return false;
        }
        $scope.model.choiceQuestion.dataStatus = dataStatus;
        $scope.model.choiceQuestion.pageNumber = 1;
        $scope.model.choiceQuestion.dataList = [];
        $scope.loadChoiceQuestionList();
    };

    $scope.onShowApproveDialog = function(type, choiceQuestion) {
        $scope.model.approveExercises.title = choiceQuestion.exercisesTitle.length > 25 ? 
                                                choiceQuestion.exercisesTitle.substr(0, 25).concat('...') : 
                                                choiceQuestion.exercisesTitle;

        $scope.model.type = type;
        $scope.model.question = choiceQuestion;
        $scope.model.approveExercises.status = '';
        $('#kt_modal_status').modal('show');
    };

    $scope.onChangeStatus = function() {
        switch($scope.model.type) {
            case 'C':
                $scope.changeChoiceStatus();
                break;
            case 'B':
                break;
            case 'P':
                break;
        }
    };

    $scope.changeChoiceStatus = function() {
        if ($scope.model.question.dataStatus === $scope.model.approveExercises.status) {
            layer.msg('修改的状态不能和当前状态相同！');
            return false;
        }
        $http.put('/knowledge/exercises/choice/change/status', {
            exercisesID: $scope.model.question.exercisesID,
            technologyID: $scope.model.technologyID,
            knowledgeID: $scope.model.knowledgeID,
            dataStatus: $scope.model.approveExercises.status,
            loginUser: $scope.model.loginUser.adminID
        }).then(function successCallback(response) {
            if (response.data.err) {
                bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
                return false;
            }
            let currentTime = new Date().toLocaleString('chinese', { hour12: false });
            $scope.model.question.dataStatus = $scope.model.approveExercises.status;
            $scope.model.question.dataStatusText = $scope.model.approveExercises.status === 'A' ? '审批通过' : '审批未通过';
            $scope.model.question.updateUser = $scope.model.loginUser.adminName;
            $scope.model.question.updateTime = currentTime.replaceAll('/', '-');
            
            if ($scope.model.choiceQuestion.dataStatus === 'NULL') {
                $('#kt_modal_status').modal('hide');
                return false;
            }
            let removeIndex = -1;
            for (let i = 0; i < $scope.model.choiceQuestion.dataList.length; i++) {
                if ($scope.model.choiceQuestion.dataList[i].exercisesID === $scope.model.question.exercisesID) {
                    removeIndex = i;
                    break;
                }
            }
            if (removeIndex >= 0) {
                $scope.model.choiceQuestion.dataList.splice(removeIndex, 1);
            }

            $('#kt_modal_status').modal('hide');
            
        }, function errorCallback(response) {
            bootbox.alert(localMessage.NETWORK_ERROR);
        }); 
    };

    $scope.onCreateChoiceQuestion = function() {
        $scope.model.choiceQuestion.dataList.push($scope.buildChoiceQuestion());
    };

    $scope.buildChoiceQuestion = function() {
        let choiceQuestion = {};
        choiceQuestion.exercisesTitle = '';
        choiceQuestion.exercisesSource = '';
        choiceQuestion.exercisesType = 'S'; //默认为单项选择
        choiceQuestion.isNew = true;
        choiceQuestion.choiceOptions = [{
                optionText: '',
                rightAnswer: false
            },
            {
                optionText: '',
                rightAnswer: false
            },
            {
                optionText: '',
                rightAnswer: false
            },
            {
                optionText: '',
                rightAnswer: false
            }
        ];
        choiceQuestion.isShowEdit = false;
        return choiceQuestion;
    };

    $scope.toggleChoiceQuestionEdit = function(choiceQuestion, isShow) {
        choiceQuestion.isShowEdit = isShow;
    };

    $scope.checkChoiceData = function(choiceQuestion) {
        let answerCount = 0;
        if (choiceQuestion.exercisesTitle.length === 0) {
            layer.msg('请填写题目标题！');
            return false;
        }
        if (choiceQuestion.exercisesSource.length === 0) {
            layer.msg('请填写题目来源！');
            return false;
        }
        for (let i = 0; i <= choiceQuestion.choiceOptions.length - 1; i++) {
            if (choiceQuestion.choiceOptions[i].optionText.length === 0) {
                layer.msg('不能有内容为空的选项内容！');
                return false;
            }
        }

        for (let i = 0; i <= choiceQuestion.choiceOptions.length - 1; i++) {
            if (choiceQuestion.choiceOptions[i].rightAnswer) {
                answerCount++;
            }
        }
        if (answerCount === 0) {
            layer.msg('请设置正确选项！');
            return false;
        }
        if (choiceQuestion.exercisesType === 'M' && answerCount < 2) {
            layer.msg('多项选择题至少应有不少于两个正确选项！');
            return false;
        }
        return true;
    };

    $scope.saveChoiceQuestion = function(choiceQuestion) {
        //数据校验
        if (!$scope.checkChoiceData(choiceQuestion)) {
            return false;
        }

        if (choiceQuestion.isNew) {
            $scope.addChoiceQuestion(choiceQuestion);
            return false; 
        }
        $scope.changeChoiceQuestion(choiceQuestion);        
    };

    $scope.addChoiceQuestion = function(choiceQuestion) {
        let optionsJson = JSON.stringify(choiceQuestion.choiceOptions);
        //数据保存，并提示保存结果
        $http.post('/knowledge/exercises/choice/add', {
            technologyID: $scope.model.technologyID,
            knowledgeID: $scope.model.knowledgeID,
            exercisesTitle: choiceQuestion.exercisesTitle,
            exercisesSource: choiceQuestion.exercisesSource,
            exercisesType: choiceQuestion.exercisesType,
            choiceOptionsJson: optionsJson,
            loginUser: $scope.model.loginUser.adminID
        }).then(function successCallback(response) {
            if (response.data.err) {
                bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
                return false;
            }
            //隐藏编辑区
            let currentTime = new Date().toLocaleString('chinese', { hour12: false });
            choiceQuestion.isNew = false;
            choiceQuestion.exercisesID = response.data.exercisesID;
            choiceQuestion.dataStatus = 'P';
            choiceQuestion.dataStatusText = '待审批';
            choiceQuestion.createUser = $scope.model.loginUser.adminName;
            choiceQuestion.createTime = currentTime.replaceAll('/', '-');
            choiceQuestion.updateUser = $scope.model.loginUser.adminName;
            choiceQuestion.updateTime = currentTime.replaceAll('/', '-');

            $scope.toggleChoiceQuestionEdit(choiceQuestion, false);
            layer.msg('保存成功！');
        }, function errorCallback(response) {
            bootbox.alert(localMessage.NETWORK_ERROR);
        }); 
    };

    $scope.changeChoiceQuestion = function(choiceQuestion) {
        let optionsJson = JSON.stringify(choiceQuestion.choiceOptions);
        //数据保存，并提示保存结果
        $http.put('/knowledge/exercises/choice/change', {
            exercisesID: choiceQuestion.exercisesID,
            technologyID: $scope.model.technologyID,
            knowledgeID: $scope.model.knowledgeID,
            exercisesTitle: choiceQuestion.exercisesTitle,
            exercisesSource: choiceQuestion.exercisesSource,
            exercisesType: choiceQuestion.exercisesType,
            choiceOptionsJson: optionsJson,
            loginUser: $scope.model.loginUser.adminID
        }).then(function successCallback(response) {
            if (response.data.err) {
                bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
                return false;
            }
            //隐藏编辑区
            $scope.toggleChoiceQuestionEdit(choiceQuestion, false);
            layer.msg('保存成功！');
        }, function errorCallback(response) {
            bootbox.alert(localMessage.NETWORK_ERROR);
        }); 
    };

    $scope.onRemoveChoiceQuestion = function(question) {
        if (question.exercisesTitle.length === 0) {
            $scope.removeChoiceQuestion(question);
            return false;
        }
        bootbox.confirm({
            message: `您确定要删除选择题【${question.exercisesTitle}】吗？`,
            buttons: {
                confirm: {
                    label: '删除',
                    className: 'btn-danger'
                },
                cancel: {
                    label: '取消',
                    className: 'btn-secondary'
                }
            },
            callback: function(result) {
                if (result) {
                    if(question.isNew) {
                        $scope.removeChoiceQuestion(question);
                        $scope.$apply();
                        return false;
                    }
                    $scope.deleteChoiceQuestion(question);
                }
            }
        });
    };

    $scope.deleteChoiceQuestion = function(question) {
        $http.delete('/knowledge/exercises/choice/delete'
                    .concat(`?technologyID=${question.technologyID}`)
                    .concat(`&knowledgeID=${question.knowledgeID}`)
                    .concat(`&exercisesID=${question.exercisesID}`))
        .then(function successCallback(response) {
            if(response.data.err){
                bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
                return false;
            }
            $scope.removeChoiceQuestion(question);
            layer.msg('删除成功！');
        }, function errorCallback(response) {
            bootbox.alert(localMessage.NETWORK_ERROR);
        });
    };

    $scope.removeChoiceQuestion = function(question) {
        let removeIndex = -1;
        $scope.model.choiceQuestion.dataList.forEach(function(choiceQuestion, index) {
            if (choiceQuestion === question) {
                removeIndex = index;
            }
        });
        if (removeIndex >= 0) {
            $scope.model.choiceQuestion.dataList.splice(removeIndex, 1);
        }
    }

    $scope.onRemoveOption = function(choiceQuestion, op) {
        let removeIndex = -1;
        choiceQuestion.choiceOptions.forEach(function(option, index) {
            if (option === op) {
                removeIndex = index;
            }
        });
        if (removeIndex >= 0) {
            choiceQuestion.choiceOptions.splice(removeIndex, 1);
        }
    };

    $scope.onCreateChoiceOption = function(choiceQuestion) {
        choiceQuestion.choiceOptions.push({
            optionText: '',
            rightAnswer: false
        });
    };

    $scope.onSetAnswer = function(choiceQuestion, option, event) {
        if (choiceQuestion.exercisesType === 'S') {
            choiceQuestion.choiceOptions.forEach(function(option) {
                option.rightAnswer = false;
            });
        }
        option.rightAnswer = event.target.checked;
    };

    $scope.onLoadMoreChoiceQuestion = function() {
        $scope.model.choiceQuestion.pageNumber++;
        $scope.loadChoiceQuestionList();
    }

    

    //#endregion

    //#region 填空题
    $scope.initFillInBlankQuestionList = function() {
        //取得当前知识点的填空题

        //如果当前知识点没有已保存的填空题，则进行初始化
        $scope.model.fillInBlankQuestionList.push($scope.buildFillInBlankQuestion());
    };

    $scope.buildFillInBlankQuestion = function() {
        let question = {};
        question.exercisesTitle = '';
        question.exercisesSource = '';
        question.answer = '';
        question.isShowEdit = false;
        return question;
    };

    $scope.onCreateFillInQuestion = function() {
        $scope.model.fillInBlankQuestionList.push($scope.buildFillInBlankQuestion());
    };

    $scope.toggleFillInQuestionEdit = function(question, isShow) {
        question.isShowEdit = isShow;
    };

    $scope.onRemoveFillInQuestion = function(question) {
        if (question.exercisesTitle.length === 0) {
            $scope.removeFillInQuestion(question);
            return false;
        }
        bootbox.confirm({
            message: `您确定要删除填空题【${question.exercisesTitle}】吗？`,
            buttons: {
                confirm: {
                    label: '删除',
                    className: 'btn-danger'
                },
                cancel: {
                    label: '取消',
                    className: 'btn-secondary'
                }
            },
            callback: function(result) {
                if (result) {
                    $scope.removeFillInQuestion(question);
                    $scope.$apply();
                }
            }
        });
    };

    $scope.removeFillInQuestion = function(question) {
        let removeIndex = -1;
        $scope.model.fillInBlankQuestionList.forEach(function(fillInQuestion, index) {
            if (fillInQuestion === question) {
                removeIndex = index;
            }
        });
        if (removeIndex >= 0) {
            $scope.model.fillInBlankQuestionList.splice(removeIndex, 1);
        }
    }

    //#endregion

    //#region 编程题
    $scope.initUploadPlugin = function() {
        let uploadDocumentDir = { "dir1": "exercises", "dir2": `T${$scope.model.technologyID}`, "dir3": `K${$scope.model.knowledgeID}` };
        let uploadDocumentServerUrl = commonUtility.buildSystemRemoteUri(Constants.UPLOAD_SERVICE_URI, uploadDocumentDir);
        uploadUtils.initUploadPlugin('#file-upload-document', uploadDocumentServerUrl, ['pdf'], false, function(opt, data) {
            $scope.model.documentUrl = data.fileUrlList[0];
            $scope.$apply();
            layer.msg(localMessage.UPLOAD_SUCCESS);
        });
    };

    $scope.onChangeDocumentList = function() {
        $scope.model.documentList.push({
            documentUrl: $scope.model.documentUrl,
            documentName: $scope.model.documentUrl.substr($scope.model.documentUrl.lastIndexOf('/') + 1),
            answerGitUrl: $scope.model.answerGitUrl,
        });
        $('#kt_modal_document').modal('hide');
    };

    $scope.loadFileList = function() {
        $http.get(`/knowledge/exercises/files?technologyID=${$scope.model.technologyID}&knowledgeID=${$scope.model.knowledgeID}`).then(function successCallback(response) {
            if (response.data.err) {
                bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
                return false;
            }
            if (response.data.files === null) {
                return false;
            }

            $scope.model.documentList.splice(0, response.data.files.length);
            if (response.data.files !== null) {
                response.data.files.forEach(function(file) {
                    $scope.model.documentList.push({
                        documentUrl: file.documentUrl,
                        documentName: file.documentUrl.substr(file.documentUrl.lastIndexOf('/') + 1),
                        answerGitUrl: file.answerUrl,
                        dataStatus: file.dataStatus,
                        dataStatusText: file.dataStatusText,
                        createUser: file.createUser,
                        createTime: file.createTime
                    });
                })
            }
        }, function errorCallback(response) {
            bootbox.alert(localMessage.NETWORK_ERROR);
        });
    };

    $scope.onShowUploadDocumentModal = function() {
        $('div.cleanFileBt').trigger("click");
        $scope.model.answerGitUrl = '';
        $scope.model.documentUrl = '';
        $('#kt_modal_document').modal('show');
    };

    $scope.onRemoveDocument = function(data) {
        $scope.model.documentList.forEach(function(image, index) {
            if (image.documentUrl === data.documentUrl) {
                $scope.model.documentList.splice(index, 1);
            }
        })
    };

    $scope.onSave = function() {
        let documentObjectArray = [];

        $scope.model.documentList.forEach(function(document) {
            documentObjectArray.push({
                documentUrl: document.documentUrl,
                answerUrl: document.answerGitUrl
            });
        });
        $http.post('/knowledge/exercises', {
            technologyID: $scope.model.technologyID,
            learningPhaseID: $scope.model.learningPhaseID,
            knowledgeID: $scope.model.knowledgeID,
            exercisesJson: JSON.stringify(documentObjectArray),
            loginUser: $scope.model.loginUser.adminID
        }).then(function successCallback(response) {
            if (response.data.err) {
                bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
                return false;
            }
            $scope.loadFileList();
            layer.msg(localMessage.UPLOAD_SUCCESS);
        }, function errorCallback(response) {
            bootbox.alert(localMessage.NETWORK_ERROR);
        });
    };

    //#endregion

    //#region 页面初始化
    $scope.initPage = function() {
        commonUtility.setNavActive();
        if (!$scope.getParameter()) {
            bootbox.alert(localMessage.PARAMETER_ERROR);
            return false;
        }
        $scope.loadChoiceQuestionList();
        // $scope.initFillInBlankQuestionList();
        // $scope.initUploadPlugin();
        // $scope.loadFileList();
    };

    $scope.getParameter = function() {
        let parameterJson = localStorage.getItem(Constants.KEY_UPLOAD_EXERCISES);
        if (parameterJson === null) {
            return false;
        }

        let parameter = JSON.parse(parameterJson);
        $scope.model.technologyID = parameter.technologyID;
        $scope.model.technologyName = parameter.technologyName;
        $scope.model.learningPhaseID = parameter.learningPhaseID;
        $scope.model.learningPhaseName = parameter.learningPhaseName;
        $scope.model.knowledgeID = parameter.knowledgeID;
        $scope.model.knowledgeName = parameter.knowledgeName;
        return true;
    };

    //#endregion

    $scope.initPage();
});

angular.bootstrap(document.querySelector('[ng-app="pageApp"]'), ['pageApp']);