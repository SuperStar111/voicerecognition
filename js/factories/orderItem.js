(function() {
  'use strict';

  angular.module('soft').factory('OrderItem', OrderItem);

  OrderItem.$inject = [ 'BaseObject', 'ModifierOrderItem', 'Payment' ];
  function OrderItem(BaseObject, ModifierOrderItem, Payment) {
    var OrderItem = function(object) {
      var self = angular.extend(this, new BaseObject(object));

      self._modifiers = [];
      self._payments = [];

      self.getName = getName;
      self.getSeats = getSeats;
      self.getModifiers = getModifiers;
      self.getPayments = getPayments;

      init();

      function getName() {
        return self.get('item');
      }

      function getSeats() {
        var seats = self.get('seat');
        if (seats == 99) {
          return 'All';
        } else {
          return seats;
        }
        ;
      }

      function getPayments() {
        return self._payments;
      }

      function getModifiers() {
        return self._modifiers;
      }

      function init() {
        if (!!self.data['modifier']) {
          for ( var idx in self.data['modifier']) {
            var item = new ModifierOrderItem(self.data['modifier'][idx]);
            self._modifiers.push(item);
          }
        }

        if (!!self.data['payments']) {
          for ( var idx in self.data['payments']) {
            var item = new Payment(self.data['payments'][idx]);
            self._payments.push(item);
          }
        }
      }
      ;
    };

    return (OrderItem);
  }
})();