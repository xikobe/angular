var app = angular.module('codecraft', []);

app.controller('ParentController', function($scope, $rootScope){
  /*$scope.name = "Parent";
  $scope.reset = function(){
    $scope.name = "";
  }*/
})

app.controller('ChildController', function($scope, $rootScope){
  //$scope.name = "Child";
  $scope.reset = function(){
    $rootScope.name = "Reset By child";
  }
})
