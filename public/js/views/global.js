let globalApp = angular.module('myApp', []);
globalApp.controller('myCtrl', function ($scope, $http) {
  $scope.model = {
    loginUser: ''
  };
  
  $scope.initGlobalData = function () {
    $scope.model.loginUser = '张强';
  };

  $scope.initGlobalData();
});

