;
(function() {
  'use strict';

  angular.module('soft').controller('ChecksController', ChecksController);

  ChecksController.$inject = [ '$scope', '$state', '$rootScope' ];
  function ChecksController($scope, $state, $rootScope) {
    var self = this;

    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
      if (!fromState.name) {
        if ($rootScope.currentState) {
          // $state.go($rootScope.currentState.name,
          // $rootScope.currentState.params);
        } else {
          // $state.go('EmployeeLogin');
        }
        $state.go('EmployeeLogin');
      }
    });

    self.goHome = goHome;

    init();
    function init() {

    }

    function goHome() {
      $state.go('Home');
    }
  }
})();