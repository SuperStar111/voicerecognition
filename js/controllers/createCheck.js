;
(function() {
  'use strict';

  angular.module('soft').controller('CreateCheckController', CreateCheckController);

  CreateCheckController.$inject = [ '$scope', '$modal', '$cookieStore', '$http', '$filter', 'Checks', '$state', '$rootScope' ];
  function CreateCheckController($scope, $modal, $cookieStore, $http, $filter, Checks, $state, $rootScope) {
    // var self = this;

    init();
    function init() {
      Checks.getCheckDetails('').then(function(result) {
        var orderID = result.order_id;
        
        $rootScope.newCheckID = orderID;
        $state.go('CheckDetail', {id: orderID});

      }, function(err) {
        console.log(er);
      });
    }
  }
})();