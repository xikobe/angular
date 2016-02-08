var app = angular.module('minmax', []);

app.controller('minMaxCtrl', function($scope){
  $scope.formData = {};

  $scope.onSubmit = function(){
    console.log("Gonna submit");
    console.log($scope.formData);
  }
})
