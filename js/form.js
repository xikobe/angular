var app = angular.module('minmax', []);

app.controller('minMaxCtrl', function($scope, $http){
  $scope.formData = {};

  $scope.onSubmit = function(){
    console.log("Gonna submit");
    console.log($scope.formData);

    $http.post('https://minmax-server.herokuapp.com/register/', $scope.formData).
      success(function(data){
        console.log(":)")
      }).error(function(data){
        console.log("error");
      })
  }
})
