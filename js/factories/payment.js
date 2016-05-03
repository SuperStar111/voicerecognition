;
(function() {
  'use strict';

  angular.module('soft').factory('Payment', Payment);

  Payment.$inject = [ 'BaseObject' ];
  function Payment(BaseObject) {
    var Payment = function(object) {
      var self = angular.extend(this, new BaseObject(object));
      // var availablePaymentTypes = [ 'CREDIT CARD', 'DEBIT CARD' ];

      // definitions
      self.lastDigists = lastDigists;
      self.paymentType = paymentType;
      self.amount = amount;
      self.getText = getText;
      self.paymentCode = paymentCode;

      // implements
      function paymentType() {
        return self.get('payment_type_name').toUpperCase();
      }

      function lastDigists() {
        if ([ 'CREDIT CARD', 'DEBIT CARD' ].indexOf(self.paymentType()) != -1) {
          var matches = self.get('cc_number').match(/([\d]{4})$/);
          if (!!matches) {
            return matches[1];
          } else {
            return null;
          }
        }
      }

      function paymentCode() {
        return self.get('payment_local_code') ? self.get('payment_local_code') : self.get('payment_code');
      }

      function getText() {
        if ([ 'CREDIT CARD', 'DEBIT CARD' ].indexOf(self.paymentType()) != -1) {
          return joinString([ self.paymentCode(), lastDigists() ], ' - ');
        } else if ([ 'INTERFACE' ].indexOf(self.paymentType()) != -1) {
          return joinString([ self.paymentCode(), self.get('room_number'), self.get('guest_name') ], ' - ');
        } else if ([ 'RECEIVABLES' ].indexOf(self.paymentType()) != -1) {
          return joinString([ self.paymentCode(), self.get('company_name') ], ' - ');
        } else if ([ 'GIFT CERTIFICATE' ].indexOf(self.paymentType()) != -1) {
          var cardNumber = self.get('giftcard_number');
          if (!cardNumber)
            cardNumber = "";

          return joinString([ self.paymentCode(), cardNumber.substr(cardNumber.length - 4) ], ' - ');
        } else {
          return self.paymentCode();
        }
      }

      function amount(isParseFloat) {
        var ret = self.get('amount') == 99 ? 'All' : self.get('amount');
        if (isParseFloat) {
          ret = (ret + "").replace(/[\(\)]/g, "");
        }

        return ret;
      }

      function joinString(input, delimiter) {
        // remove empty item
        var newInput;
        newInput = [];
        angular.forEach(input, function(item) {
          if (item != "" && item)
            newInput.push(item);
        });

        return newInput.join(delimiter);
      }
    };

    return Payment;
  }
})();