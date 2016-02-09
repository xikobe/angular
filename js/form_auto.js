var app = angular.module('minmax', [
    'jcs-autoValidate',
    'angular-ladda'
]);

app.run(function(defaultErrorMessageResolver){
  defaultErrorMessageResolver.getErrorMessages().then(function (errorMessages) {
          errorMessages['tooYoung'] = 'Idade minima {0}';
          errorMessages['tooOld'] = 'Idade máxima {0}';
          errorMessages['badUsername'] = "Username Invalido";
        });
})

app.controller('minMaxCtrl', function($scope, $http){
  $scope.formData = {};
  $scope.loginLoading = false;

  $scope.onSubmit = function(){
    $scope.loginLoading = true;
    console.log("Gonna submit");
    console.log($scope.formData);

    $http.post('https://minmax-server.herokuapp.com/register/', $scope.formData).
      success(function(data){
        console.log(":)");
        $scope.loginLoading = false;
      }).error(function(data){
        console.log("error");
        $scope.loginLoading = false;
      })
  }
})
