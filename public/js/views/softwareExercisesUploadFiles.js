let pageApp = angular.module('pageApp', []);
pageApp.controller('pageCtrl', function ($scope, $http) {
  $scope.model = {
    //begin: 信息编辑
    exercisesID: 0,
    loginUser: commonUtility.getLoginUser(),
    imageList: [],
    documentList: [],
    documentUrl: '',
    breadcrumb: '',
    answerGitUrl: '',
    //end: 信息编辑
  };

  //region 页面初始化
  $scope.initPage = function () {
    commonUtility.setNavActive();
    let exercisesID = localStorage.getItem(Constants.KEY_UPLOAD_EXERCISES);
    if(exercisesID === null || isNaN(exercisesID)){
      bootbox.alert(localMessage.PARAMETER_ERROR);
      return false;
    }
    $scope.model.exercisesID = parseInt(exercisesID);
    $scope.setBreadCrumb();
    $scope.initUploadPlugin();
    $scope.loadFileList();
  };

  $scope.setBreadCrumb = function() {
    let exercisesType = $('#hidden_exercisesType').val();
    let technologyName = $('#hidden_technologyName').val();
    let learningPhaseName = $('#hidden_learningPhaseName').val();
    let knowledgeName = $('#hidden_knowledgeName').val();

    switch (exercisesType) {
      case 'S':
        $scope.model.breadcrumb = `单点练习/${technologyName}/${learningPhaseName}/${knowledgeName}`;
        break;
      case 'C':
        $scope.model.breadcrumb = `综合练习/${technologyName}`;
        break;
      case 'P':
        $scope.model.breadcrumb = `项目练习/${technologyName}`;
        break;
      default:
        break;
    }

  };

  $scope.initUploadPlugin = function(){
    let uploadImageDir = {"dir1": "exercises", "dir2": $scope.model.exercisesID, "dir3": "image"};
    let uploadDocumentDir = {"dir1": "exercises", "dir2": $scope.model.exercisesID, "dir3": "document"};

    let uploadImageServerUrl = commonUtility.buildSystemRemoteUri(Constants.UPLOAD_SERVICE_URI, uploadImageDir);
    let uploadDocumentServerUrl = commonUtility.buildSystemRemoteUri(Constants.UPLOAD_SERVICE_URI, uploadDocumentDir);

    uploadUtils.initUploadPlugin('#file-upload-image', uploadImageServerUrl, ['png','jpg', 'jpeg'], false, function (opt,data) {
      $scope.model.imageList.push({
        imageUrl: data.fileUrlList[0],
        imageName: data.fileUrlList[0].substr(data.fileUrlList[0].lastIndexOf('/') + 1)
      });
      $scope.$apply();
      $('#kt_modal_image').modal('hide');
    });

    uploadUtils.initUploadPlugin('#file-upload-document', uploadDocumentServerUrl, ['pdf'], false, function (opt,data) {
      $scope.model.documentUrl = data.fileUrlList[0];
      // $scope.model.documentList.push({
      //   documentUrl: data.fileUrlList[0],
      //   documentName: data.fileUrlList[0].substr(data.fileUrlList[0].lastIndexOf('/') + 1)
      // });
      $scope.$apply();
      // $('#kt_modal_document').modal('hide');
    });
  };

  $scope.onChangeDocumentList = function() {
    $scope.model.documentList.push({
      documentUrl: $scope.model.documentUrl,
      documentName: $scope.model.documentUrl.substr($scope.model.documentUrl.lastIndexOf('/') + 1),
      answerGitUrl: $scope.model.answerGitUrl
    });
    // $scope.$apply();
    $('#kt_modal_document').modal('hide');
  };

  $scope.loadFileList = function(){
    $http.get(`/softwareExercisesFiles/files?exercisesID=${$scope.model.exercisesID}`).then(function successCallback (response) {
      if(response.data.err){
        bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
        return false;
      }
      if(response.data.files === null){
        return false;
      }

      if(response.data.files.imageList !== null){
        response.data.files.imageList.forEach(function (image) {
          $scope.model.imageList.push({
            imageUrl: image.imageUrl,
            imageName: image.imageUrl.substr(image.imageUrl.lastIndexOf('/') + 1)
          });
        })
      }

      if(response.data.files.documentList !== null){
        response.data.files.documentList.forEach(function (document) {
          $scope.model.documentList.push({
            documentUrl: document.documentUrl,
            documentName: document.documentUrl.substr(document.documentUrl.lastIndexOf('/') + 1),
            answerUrl: document.answerUrl
          });
        })
      }
    }, function errorCallback(response) {
        bootbox.alert(localMessage.NETWORK_ERROR);
    });
  };

  $scope.onShowUploadImageModal = function(){
    $('#kt_modal_image').modal('show');
  };

  $scope.onShowUploadDocumentModal = function(){
    $('#kt_modal_document').modal('show');
  };

  $scope.onRemoveImage = function(data){
    $scope.model.imageList.forEach(function (image, index) {
      if(image.imageUrl === data.imageUrl){
        $scope.model.imageList.splice(index, 1);
      }
    })
  };

  $scope.onRemoveDocument = function(data){
    $scope.model.documentList.forEach(function (image, index) {
      if(image.documentUrl === data.documentUrl){
        $scope.model.documentList.splice(index, 1);
      }
    })
  };

  $scope.onSave = function(){
    // let imageList = [];
    // $scope.model.imageList.forEach(function (image) {
    //   imageList.push(image.imageUrl);
    // });

    let documentObjectArray = [];

    $scope.model.documentList.forEach(function (document) {
      documentObjectArray.push({
        documentUrl: document.documentUrl,
        answerUrl: document.answerGitUrl
      });
    });
    $http.post('/softwareExercisesFiles', {
      exercisesID: $scope.model.exercisesID,
      // imageList: imageList.join(','),
      documentList: JSON.stringify(documentObjectArray),
      loginUser: $scope.model.loginUser.adminID
    }).then(function successCallback(response) {
      if(response.data.err){
        bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
        return false;
      }
      $scope.model.imageList.splice(0, $scope.model.imageList.length);
      $scope.model.documentList.splice(0, $scope.model.documentList.length);
      bootbox.alert(localMessage.UPLOAD_SUCCESS);
    }, function errorCallback(response) {
      bootbox.alert(localMessage.NETWORK_ERROR);
    });
  };
  //endregion

  $scope.initPage();
});

angular.bootstrap(document.querySelector('[ng-app="pageApp"]'), ['pageApp']);