var app = angular.module('minmax', [
    'jcs-autoValidate'
]);

app.controller('minMaxCtrl', function($scope, $http){
  $scope.formData = {};

  $scope.onSubmit = function(valid){

    if(valid){
      console.log("Gonna submit");
      console.log($scope.formData);

      /*$http.post('https://minmax-server.herokuapp.com/register/', $scope.formData).
        success(function(data){
          console.log(":)")
        }).error(function(data){
          console.log("error");
        })*/
    }else{
      console.log("invalid");
    }



  }
})
