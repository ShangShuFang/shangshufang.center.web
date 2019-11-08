let pageApp = angular.module('pageApp', []);
pageApp.controller('pageCtrl', function ($scope, $http) {
  $scope.model = {
    cellphone: '',
    password: '',
    isRemember: true
  };

  $scope.onLogin = function(){
    $http.post('/', {
      cellphone: $scope.model.cellphone,
      password: $scope.model.password
    }).then(function successCallback(response) {
      if(response.data.err){
        bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
        return false;
      }
      if(response.data.customerInfo === null){
        bootbox.alert(localMessage.NO_ACCOUNT);
        return false;
      }
      //记录Cookie
      commonUtility.setCookie(Constants.COOKIE_LOGIN_USER, JSON.stringify(response.data.customerInfo), $scope.model.isRemember);
      location.href = '/index';
    }, function errorCallback(response) {
      bootbox.alert(localMessage.NETWORK_ERROR);
    });
  };
});