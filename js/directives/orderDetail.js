;
(function() {
  'use strict';

  angular.module('soft').directive('orderDetail', OrderDetail);

  OrderDetail.$inject = [ 'Order' ];
  function OrderDetail(Order) {
    var ret = {
      restrict : 'E',
      transclude : false,
      scope : {
        order : '=order'
      },
      templateUrl : function(elem, attrs) {
        return attrs.templateUrl;
      },
      controller : Controller,
      link : function(scope, element, attrs, modelCtrl) {

      }
    };

    return ret;
  }

  Controller.$inject = [ '$scope', 'Orders', 'Order', '$cookieStore' ];
  function Controller($scope, Orders, Order, $cookieStore) {
    var self = this;

    self.printEqually = printEqually;
    self.printChair = printChair;

    $scope.$watch('order', function() {
      if (!!$scope.order) {
        self.order = $scope.order;
        self.totalItems = self.order.getTotalItems();

      }
    });

    // implements
    function printEqually() {
      if (self.order.isEqually()) {
        Orders.getCheckDetailsByPercentage(self.order.getId(), self.order.getTotalCovers()).then(
        // success
        function(result) {

          try {
            $('#loader-ajax').hide();

            self.order = new Order(result[0]["regular_receipt"]);
            self.order.setView('percentage');

          } catch (e) {

          }
        },
        // failes
        function(response) {
          console.log(response);
        });
      }
    }
    ;

    // implements
    function printChair() {
      if (self.order.isChair()) {
        Orders.getCheckDetailsByChair(self.order.getId()).then(
        // success
        function(result) {

          try {
            $('#loader-ajax').hide();

            self.order = new Order(result[0]["regular_receipt"]);
            self.order.setView('chair');

          } catch (e) {

          }
        },
        // failes
        function(response) {
          console.log(response);
        });
      }
    }
    ;

    $scope.ctrl = self;
  }
  ;
})();