;
(function() {
  'use strict';

  angular.module('soft').factory('PaymentType.Gratuity', Gratuity);

  Gratuity.$inject = [ 'PaymentType.BasePaymentType', 'Modals', '$q', 'Checks', 'soft.Utils' ];
  function Gratuity(BasePaymentType, Modals, $q, Checks, Utils) {
    var Gratuity = function(object) {
      var self = angular.extend(this, new BasePaymentType(object));

      self.init = init;
      self.paymentCtrl = null;
      self.sendPayment = sendPayment;

      self.amountDue = amountDue;
      self.percentageAmount = percentageAmount;

      self.onSeatChange = onSeatChange;

      self.onSplitChange = onSplitChange;

      function reset() {
        self.seatData = {
          selectedSeatIds : [ 99 ]
        };
        self.splitData = {
          selectedSplitIds : [ 99 ]
        };
      }

      function init(order) {
        self.order = order;

        self.paymentCtrl = order.paymentCtrl;

        self.orderTotal = self.order.total();
        reset();
      }

      function amountDue(value) {
        if (!angular.isDefined(value)) {
          return self._amount_due;
        } else {
          self._amount_due = value;

          if (value == '') {
            self._percentageAmount = '';
            return;
          }

          var total = self.order.total();
          if (self.order.isChair() && self.seatData.amount && self.seatData.amount != 0) {
            total = self.seatData.amount;
          } else if (self.order.isEqually() && self.splitData.amount && self.splitData.amount != 0) {
            total = self.splitData.amount;
          }

          self._percentageAmount = parseFloat(self._amount_due / total * 100).toFixed(2);
        }
      }

      function percentageAmount(value) {
        if (!angular.isDefined(value)) {
          return self._percentageAmount;
        } else {
          self._percentageAmount = value;

          if (value == '') {
            self._amount_due = '';
            return;
          }

          var total = self.order.total();
          if (self.order.isChair() && self.seatData.amount && self.seatData.amount != 0) {
            total = self.seatData.amount;
          } else if (self.order.isEqually() && self.splitData.amount && self.splitData.amount != 0) {
            total = self.splitData.amount;
          }

          self._amount_due = parseFloat(Utils.retfixx(total / 100 * self._percentageAmount)).toFixed(2);
        }
      }

      function onSeatChange() {
        if (self._percentageAmount) {
          percentageAmount(self._percentageAmount);
        }
      }

      function onSplitChange() {
        if (self._percentageAmount) {
          percentageAmount(self._percentageAmount);
        }
        // self.amountDue(self.splitData.amount);
      }

      function sendPayment(itemsSent) {
        var deferred = $q.defer();

        var data = {
          order_id : self.order.getId(),
          terminal_id : Utils.ckpar(''),
          payment_id : Utils.ckpar(self.getId()),
          seat : Utils.ckpar('99'),
          client_id : Utils.ckpar(''),

          items_taxexempt : Utils.ckpar(itemsSent),

          // amount info
          payment_amount : Utils.ckpar(self.amountDue()),

          requires_manager_approval : 'no' // TODO: Implement Pinpad
        };

        if (self.order.isChair()) {
          data['seat'] = self.seatData.selectedSeatIds.join(',');
          if (data['seat'] == 99) {
            self.seatData.amounts = self.order.getSeatAmounts();

          }
          data['seat_payment_details'] = self.seatData.amounts.join(',');
        } else if (self.order.isEqually()) {
          data['split'] = self.splitData.selectedSplitIds.join(',');
          data['seat'] = self.splitData.selectedSplitIds.join(',');

          if (data['split'] == 99) {
            self.splitData.amounts = self.order.getSplitAmounts();

          }

          data['seat_payment_details'] = self.splitData.amounts.join(',');
        }

        Checks.updatePayments(data).then(function(result) {
          if (result.ResponseCode == 1) {
            reset();

            deferred.resolve(result);

          } else {
            deferred.reject(result);
          }
        }, function(err) {
          deferred.reject(err);
        });

        return deferred.promise;
      }
    };

    return Gratuity;
  }
})();