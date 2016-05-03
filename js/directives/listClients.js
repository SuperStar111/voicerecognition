;
(function() {
  'use strict';

  angular.module('soft').directive('listClients', ListClients);

  ListClients.$inject = [];
  function ListClients() {
    return {
      restrict : 'AE',
      scope : {
        selectClient : '&selectCallback',
        search : '=search',
        excludeClients : '=excludeClients'
      },
      templateUrl : function(elem, attrs) {
        if (attrs.templateUrl) {
          return attrs.templateUrl
        } else {
          return 'templates/partials/list-clients.html';
        }
      },
      controller : Controller
    };
  }

  Controller.$inject = [ '$scope', '$timeout', 'Checks', 'siteURL', 'Client' ];
  function Controller($scope, $timeout, Checks, siteURL, Client) {
    var self = this;

    self.searchClientStarted = false;
    self.searchingClients = false;
    self.clients = [];
    self.siteURL = siteURL;

    // assign callback
    self.selectClient = selectClient;

    // definitions
    self.doSearchClients = doSearchClients;

    // implements
    $scope.$watch('search', function() {
      if ($scope.search.length >= 3) {
        if (self.searchTimer)
          $timeout.cancel(self.searchTimer);

        self.searchTimer = $timeout(function() {
          if ($scope.search.length >= 3) {
            doSearchClients($scope.search);
          }
        }, 500);

      } else if ($scope.search.length == 0) {
        self.clients = [];
        self.searchClientStarted = false;
      }
    });

    function doSearchClients(term) {
      self.searchClientStarted = true;

      self.searchingClients = true;
      Checks.searchClients(term).then(function(result) {
        self.clients = [];
        self.searchingClients = false;

        angular.forEach(result.Clients, function(data, index) {
          var client = new Client(data);

          var existing = false;

          for ( var idx in $scope.excludeClients) {
            if ($scope.excludeClients[idx].getId() == client.getId()) {
              self.clients.push($scope.excludeClients[idx]);
              existing = true;
              break;
            }
          }

          if (!existing) {
            self.clients.push(client);
          }
        });
      },
      // fails
      function(err) {
        console.log(err);
      });
    }

    function selectClient(client) {
      $scope.selectClient({
        client : client
      });
    }

    $scope.ctrl = self;
  }
})();