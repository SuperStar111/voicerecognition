;
(function() {
  'use strict';

  angular.module('soft').factory('PaymentType.Surcharge', Surcharge);

  Surcharge.$inject = [ 'PaymentType.BasePaymentType', 'Modals', '$q', 'Checks', 'soft.Utils', 'Service.Payments' ];
  function Surcharge(BasePaymentType, Modals, $q, Checks, Utils, Payments) {
    var Surcharge = function(object) {
      var self = angular.extend(this, new BasePaymentType(object));

      self.init = init;
      self.paymentCtrl = null;
      self.sendPayment = sendPayment;

      self.seatData = {};
      self.onSeatChange = onSeatChange;
      self.splitData = {};
      self.onSplitChange = onSplitChange;
      self.amountDue = amountDue;

      function reset() {
        self.seatData = {
          selectedSeatIds : [ 99 ]
        };
        self.splitData = {
          selectedSplitIds : [ 99 ]
        };

        self.amountDue('');
      }

      function init(order) {
        self.order = order;
        self.paymentCtrl = order.paymentCtrl;

        reset();
      }

      function amountDue(value) {
        if (!angular.isDefined(value)) {
          return self._amount_due;
        } else {
          self._amount_due = value;
        }
      }

      function onSeatChange() {
        // var amount = self.seatData.amount;
        // if (amount == 0 || self.seatData.selectedSeatIds[0] == 99) {
        // amount = self.order.total();
        // }
        //
        // self.amountDue(amount);
      }

      function onSplitChange() {
        // var amount = self.splitData.amount;
        // if (amount == 0 || self.splitData.selectedSplitIds[0] == 99) {
        // amount = self.order.total();
        // }
        //
        // self.amountDue(amount);

      }

      function sendPayment(itemsSent) {
        var deferred = $q.defer();

        var data = {
          order_id : self.order.getId(),
          terminal_id : Utils.ckpar(''),
          payment_id : Utils.ckpar(self.getId()),
          seat : Utils.ckpar('99'),
          client_id : Utils.ckpar(''),

          notes : Utils.ckpar(self.pay_description),

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
          data['seat_payment_details'] = Payments.getSeatPaymentDetails(self.seatData.amounts, self.amountDue(), 0).join(',');
        } else if (self.order.isEqually()) {
          data['split'] = self.splitData.selectedSplitIds.join(',');
          data['seat'] = self.splitData.selectedSplitIds.join(',');

          if (data['split'] == 99) {
            self.splitData.amounts = self.order.getSplitAmounts();

          }

          data['seat_payment_details'] = Payments.getSeatPaymentDetails(self.splitData.amounts, self.amountDue(), 0).join(',');
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

    return Surcharge;
  }
})();