;
(function() {
  'use strict';

  angular.module('soft').factory('PaymentType.BasePaymentType', BasePaymentType);

  BasePaymentType.$inject = [ 'BaseObject' ];
  function BasePaymentType(BaseObject) {
    var BasePaymentType = function(object) {
      var self = angular.extend(this, new BaseObject(object));

      self.inactive = inactive;
      self.onOrderReloaded = onOrderReloaded;

      function inactive() {
        console.log('Need implement for "inactive" method');
      }
      function onOrderReloaded() {
        console.log('Need implement for "onOrderReloaded" method');
      }
    };

    return BasePaymentType;
  }
})();