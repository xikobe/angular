// This is the sample data for this lesson
var app = angular.module('codecraft',[
  'ngResource',
  'infinite-scroll',
  'angularSpinner',
  'jcs-autoValidate',
  'angular-ladda'
]);

app.config(function($httpProvider, $resourceProvider, laddaProvider){
  $httpProvider.defaults.headers.common['Authorization'] = 'Token c2c0185186918b795901f1aa163d94d3ba2f20d2';
  $resourceProvider.defaults.stripTrailingSlashes = false;
  laddaProvider.setOption({ /* optional */
      style: 'expand-left',
      spinnerSize: 35,
      spinnerColor: '#ffffff'
    });
});

app.factory("Contact", function($resource){
  return $resource("https://codecraftpro.com/api/samples/v1/contact/:id/", {id:'@id'}, {
    update: {
      method: "PUT",
    }
  });
});

app.controller('PersonDetailController', function($scope, ContactService){
  $scope.contacts = ContactService
  $scope.save= function(){
    $scope.contacts.updateContact($scope.contacts.selectedPerson);
  }
});

app.controller('PersonListController', function($scope, ContactService){

  $scope.search = "";
  $scope.order = "email";
  $scope.contacts = ContactService;

  $scope.loadMore = function(){
    ContactService.loadMore();
  };
  $scope.$watch('search', function(oldVal, newVal){
    if(angular.isDefined(newVal)){
      $scope.contacts.doSearch(newVal);
    }
  });

  $scope.$watch('order', function(oldVal, newVal){
    if(angular.isDefined(newVal)){
      $scope.contacts.doOrder(newVal);
    }
  });
})


app.service('ContactService', function(Contact){

  var self = {
    'selectedPerson': null,
    'search': null,
    'order': null,
    'addPerson': function(person){
      this.persons.push(person);
    },
    'doSearch' : function(searchVal){
      self.hasMore = true;
      self.page = 1;
      self.persons = [];
      self.search = searchVal;
      self.loadContacts();
    },
    'doOrder' : function(orderVal){
      self.hasMore = true;
      self.page = 1;
      self.persons = [];
      self.order = orderVal;
      self.loadContacts();
    },
    'updateContact': function(person){
      console.log("service is updating");
      self.isSaving = true;
      person.$update().then(function(){
        self.isSaving = false;
      })
    },
    'page': 1,
    'hasMore': true,
    'isLoading': false,
    'persons': [],
    'isSaving': false,
    'loadContacts': function(){
      if(self.hasMore && !self.isLoading){
        self.isLoading = true;

        var params = {
          'page': self.page,
          'search': self.search,
          'ordering': self.order,
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
