// This is the sample data for this lesson
var app = angular.module('codecraft',[
  'ngResource',
  'infinite-scroll',
]);

app.config(function($httpProvider, $resourceProvider){
  $httpProvider.defaults.headers.common['Authorization'] = 'Token c2c0185186918b795901f1aa163d94d3ba2f20d2';
  $resourceProvider.defaults.stripTrailingSlashes = false;
});

app.factory("Contact", function($resource){
  return $resource("https://codecraftpro.com/api/samples/v1/contact/:id/")
})

app.controller('PersonDetailController', function($scope, ContactService){
  $scope.contacts = ContactService
});

app.controller('PersonListController', function($scope, ContactService){

  $scope.search = "";
  $scope.order = "email";
  $scope.contacts = ContactService;

  $scope.loadMore = function(){
    ContactService.loadMore();
  };
  $scope.sensitiveSearch = function(person){
    if($scope.search){
      return person.name.indexOf($scope.search) == 0 || person.email.indexOf($scope.search) == 0;
    }
    return true;
  }
})


app.service('ContactService', function(Contact){

  var self = {
    'selectedPerson': null,
    'addPerson': function(person){
      this.persons.push(person);
    },

    'page': 1,
    'hasMore': true,
    'isLoading': false,
    'persons': [],
    'loadContacts': function(){
      if(self.hasMore && !self.isLoading){
        self.isLoading = true;

        var params = {
          'page': self.page,
        }

        Contact.get(params, function(data){
          console.log(data);
          angular.forEach(data.results, function(person){
            self.persons.push(new Contact(person));
          })

          if(!data.next){
            self.hasMore = false;
          }
          self.isLoading = false;
        });
      }
    },
    'loadMore': function(){
      if(self.hasMore && !self.isLoading){
        self.page += 1;
        self.loadContacts();
      }
    }
  }

  self.loadContacts();

  return self;
})