 // This is the sample data for this lesson
var app = angular.module('codecraft',[
  'ngResource',
  'infinite-scroll',
  'angularSpinner',
  'jcs-autoValidate',
  'angular-ladda',
  'mgcrea.ngStrap',
  'toaster',
  'ngAnimate',
  'ui.router'
]);

app.config(function ($stateProvider, $urlRouterProvider){
  $stateProvider
  .state('list', {
    url: "/",
    templateUrl: 'templates/list.html',
    controller: 'PersonListController',
  })
  .state('edit', {
    url: "/edit/:email",
    templateUrl: 'templates/edit.html',
    controller: 'PersonDetailController',
  });
  $urlRouterProvider.otherwise('/');
})

app.config(function($httpProvider, $resourceProvider, laddaProvider, $datepickerProvider){
  $httpProvider.defaults.headers.common['Authorization'] = 'Token c2c0185186918b795901f1aa163d94d3ba2f20d2';
  $resourceProvider.defaults.stripTrailingSlashes = false;
  laddaProvider.setOption({ /* optional */
      style: 'expand-left',
      spinnerSize: 35,
      spinnerColor: '#ffffff'
    });
  angular.extend($datepickerProvider.defaults, {
    dateFormat: 'd/M/yyyy',
    autoclose: true
  });
});

app.factory("Contact", function($resource){
  return $resource("https://codecraftpro.com/api/samples/v1/contact/:id/", {id:'@id'}, {
    update: {
      method: "PUT",
    }
  });
});


/************* CUSTOM FILTER ************/
app.filter('defaultImage', function(){
  return function(input, param){
    console.log("input: " + input);
    console.log("param: " + param);
    if(!input){
      return param;
    }else{
      return input;
    }

    
  }
})

app.controller('PersonDetailController', function($scope, ContactService, $stateParams){
  console.log($stateParams);

  $scope.contacts = ContactService;
  $scope.contacts.selectedPerson = $scope.contacts.getPerson($stateParams.email);
  $scope.save= function(){
    $scope.contacts.updateContact($scope.contacts.selectedPerson);
  };
  $scope.remove = function(){
    $scope.contacts.removeContact($scope.contacts.selectedPerson);
  };
  
});

app.controller('PersonListController', function($scope, ContactService, $modal){

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
  $scope.showCreateModal = function(){
    $scope.contacts.selectedPerson = {};
    $scope.createModal = $modal({
      scope: $scope,
      template: 'templates/modal.create.tpl.html',
      show: true,
    })
  }

  $scope.createContact = function(){
    console.log("createContact");
    $scope.contacts.createContact($scope.contacts.selectedPerson).then(function(){
      $scope.createModal.hide();
    });
  }
})


app.service('ContactService', function(Contact, $q, toaster){

  var self = {
    'selectedPerson': null,
    'search': null,
    'order': null,
    'getPerson': function(email){
      for(var i = 0; i <= self.persons.length; i++){
        var obj = self.persons[i];
        if(obj.email == email){
          return obj;
        }
      }

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
    },
    'isDeleting': false,
    'updateContact': function(person){
      console.log("service is updating");
      self.isSaving = true;
      person.$update().then(function(){
        self.isSaving = false;
        toaster.pop('success', 'Updated ' + person.name); 
      })
    },
    'removeContact': function(person){
      self.isDeleting = true;
      console.log("apaga");
      person.$remove().then(function(){
        self.isDeleting = false;
        var index = self.persons.indexOf(person);
        self.persons.splice(index, 1);
        self.selectedPerson = null;
      })
    },
    'createContact' : function(person){
      var d = $q.defer(); // inicializa promise
      self.isSaving = true;
      Contact.save(person).$promise.then(function(){
        self.isSaving = false;
        self.selectedPerson = null;
        self.hasMore = true;
        self.page = 1;
        self.persons = [];
        self.loadContacts();
        toaster.pop('success', 'Created ' + person.name); 
        d.resolve() // promessa completa
      });
      return d.promise;
    }
  }

  self.loadContacts();

  return self;
})
