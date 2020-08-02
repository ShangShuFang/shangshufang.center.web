let pageApp = angular.module('pageApp', []);
pageApp.controller('pageCtrl', function($scope, $http) {
    $scope.model = {
        //begin: 信息编辑
        technologyID: 0,
        technologyName: '',
        learningPhaseID: 0,
        learningPhaseName: '',
        knowledgeID: 0,
        knowledgeName: '',

        documentList: [],
        documentUrl: '',
        answerGitUrl: '',
        loginUser: commonUtility.getLoginUser(),
        //end: 信息编辑
    };

    //region 页面初始化
    $scope.initPage = function() {
        commonUtility.setNavActive();
        if (!$scope.getParameter()) {
            bootbox.alert(localMessage.PARAMETER_ERROR);
            return false;
        }
        $scope.initUploadPlugin();
        $scope.loadFileList();
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
    //endregion

    $scope.initPage();
});

angular.bootstrap(document.querySelector('[ng-app="pageApp"]'), ['pageApp']);