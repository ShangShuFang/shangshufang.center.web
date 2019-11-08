let globalApp = angular.module('myApp', []);
globalApp.controller('myCtrl', function ($scope, $http) {
  $scope.model = {
    loginUser: ''
  };
  
  $scope.initGlobalData = function () {
    let loginUser = commonUtility.getLoginUser();
    $scope.model.loginUser = loginUser.adminName;
  };

  $scope.onSignOut = function () {
    commonUtility.delCookie(Constants.COOKIE_LOGIN_USER);
    location.href = '/';
  };

  $scope.initGlobalData();
});

