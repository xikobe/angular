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
    views: {
      'main': {
        templateUrl: 'templates/list.html',
        controller: 'PersonListController',
      },
      'search': {
        templateUrl: 'templates/searchform.html',
        controller: 'PersonListController',
      }
    },
  })
  .state('edit', {
    url: "/edit/:email",
    views: {
      'main': {
        templateUrl: 'templates/edit.html',
        controller: 'PersonDetailController',
      }
    },
  })
  .state('create', {
    url: '/create/',
    views: {
      'main': {
        templateUrl: 'templates/edit.html',
        controller: 'PersonCreateController',
      }
    },
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


app.directive("ccSpinner", function(){
  return {
    'transclude': true,
    //'restrict': 'AEC', // para usar a directive como Atribute, Element, Class
    'restrict': 'E',
    'templateUrl': 'templates/spinner.html',
    'scope': {
      'isLoading':'=', // variable
      'message': '@' // string
    }
  }
})

app.directive("ccCard", function(){
  return {
    //'restrict': 'AEC', // para usar a directive como Atribute, Element, Class
    'restrict': 'AE',
    'templateUrl': 'templates/card.html',
    'scope': {
      'user':'='
    },
    'controller':function($scope, ContactService){
      $scope.isDeleting = false;
      $scope.deleteUser = function(){
        console.log("delete me");
        $scope.isDeleting = true;
        ContactService.removeContact($scope.user).then(function(){
          //$state.go("list");
          $scope.isDeleting = false;
        });
      }
    }
  }
})

/************* CUSTOM FILTER ************/
app.filter('defaultImage', function(){
  return function(input, param){
    //console.log("input: " + input);
    //console.log("param: " + param);
    if(!input){
      return param;
    }else{
      return input;
    }

    
  }
});

app.controller('PersonCreateController', function($scope, $state,ContactService){
  $scope.contacts = ContactService;
  $scope.mode = 'create';
  $scope.contacts.selectedPerson = {};
  $scope.save = function(){
    $scope.contacts.createContact($scope.contacts.selectedPerson).then(function(){
      //$state.go('list');
    });
  }
});

app.controller('PersonDetailController', function($scope, ContactService, $stateParams, $state){
  $scope.mode = "edit";
  $scope.contacts = ContactService;
  $scope.contacts.selectedPerson = $scope.contacts.getPerson($stateParams.email);
  $scope.save= function(){
    $scope.contacts.updateContact($scope.contacts.selectedPerson).then(function(){
      $state.go("list");
    });
  };
  $scope.remove = function(){
    $scope.contacts.removeContact($scope.contacts.selectedPerson).then(function(){
      $state.go("list");
    });
  };
  
});

app.controller('PersonListController', function($scope, ContactService, $modal){

  $scope.search = "";
  $scope.order = "email";
  $scope.contacts = ContactService;

  $scope.loadMore = function(){
    ContactService.loadMore();
  };
})


app.service('ContactService', function(Contact, $q, toaster, $rootScope){

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
    'ordering' : 'name',
    'doSearch' : function(){
      self.hasMore = true;
      self.page = 1;
      self.persons = [];
      self.loadContacts();
    },
    'doOrder' : function(){
      self.hasMore = true;
      self.page = 1;
      self.persons = [];
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
      var d = $q.defer();
      self.isSaving = true;
      person.$update().then(function(){
        self.isSaving = false;
        toaster.pop('success', 'Updated ' + person.name); 
        d.resolve();
      })
      return d.promise;
    },
    'removeContact': function(person){
      self.isDeleting = true;
      var d = $q.defer();
      person.$remove().then(function(){
        self.isDeleting = false;
        var index = self.persons.indexOf(person);
        self.persons.splice(index, 1);
        self.selectedPerson = null;
        toaster.pop('success', 'Removed ' + person.name); 
        d.resolve();
      })
      return d.promise;
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
    },
    'watchFilters': function(){
      $rootScope.$watch(function(){
        return self.search;
      }, function(newVal){
        if(angular.isDefined(newVal)){
          self.doSearch();
        }
      });

      $rootScope.$watch(function(){
        return self.ordering;
      }, function(newVal){
        if(angular.isDefined(newVal)){
          self.doOrder();
        }
      })

    }
  }

  self.loadContacts();
  self.watchFilters();

  return self;
})
