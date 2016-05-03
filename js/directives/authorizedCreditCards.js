;
(function() {
  'use strict';

  angular.module('soft').directive('authorizedCreditCards', AuthorizedCreditCards);

  AuthorizedCreditCards.$inject = [];
  function AuthorizedCreditCards() {
    return {
      restrict : 'AE',
      scope : false,
      templateUrl : function(elem, attrs) {
        if (attrs.templateUrl) {
          return attrs.templateUrl;
        } else {
          return 'templates/partials/authorizedCCs.html';
        }
      },
      controller : Controller

    };

  }

  Controller.$inject = [ '$scope', 'Checks', 'Service.Payments', '$rootScope' ];
  function Controller($scope, Checks, Payments, $rootScope) {
    var self = this;

    self.selectCard = selectCard;

    init();
    function init() {
      self.order = Checks.currentCheck().currentOrder();

      $scope.authorizedCCs = self.order.getAuhorizedCCs();
    }

    var onOrderReloaded = $rootScope.$on('Order Reloaded', function(event, data) {
      $scope.authorizedCCs = data.order.getAuhorizedCCs();

    });

    $scope.$on('$destroy', function() {
      onOrderReloaded();
    });

    function selectCard(payment) {
      if (!$scope.ctrl.currentSubType.currentCard) {
        $scope.ctrl.setPayment(payment);
      }

      $scope.ctrl.currentSubType.selectCard(payment);
    }

    $scope.authorizedCCsCtrl = self;

  }
})();