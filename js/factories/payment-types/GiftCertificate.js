;
(function() {
  'use strict';

  angular.module('soft').factory('PaymentType.GiftCertificate', GiftCertificate);

  GiftCertificate.$inject = [ 'PaymentType.BasePaymentType', '$timeout', 'Service.Payments', 'Modals', '$q', 'Checks', 'soft.Utils' ];
  function GiftCertificate(BasePaymentType, $timeout, Payments, Modals, $q, Checks, Utils) {
    var GiftCertificate = function(object) {
      var self = angular.extend(this, new BasePaymentType(object));

      self.getGiftCertificate = getGiftCertificate;

      self.init = init;
      self.paymentCtrl = null;
      self.sendPayment = sendPayment;
      self.updateAmountDue = updateAmountDue;
      self.focus = focus;
      self.blur = blur;

      self.amount = amount;

      self.onSeatChange = onSeatChange;
      self.onSplitChange = onSplitChange;

      function reset() {
        self.seatData = {
          selectedSeatIds : [ 99 ]
        };
        self.splitData = {
          selectedSplitIds : [ 99 ]
        };

        self.balance = '';
        self.gratuity = '';
        self.validCard = '';
        self.giftCardNumber = '';
      }

      function init(order) {
        self.order = order;
        self.paymentCtrl = order.paymentCtrl;

        self.orderTotal = self.order.total();
        self.amt_due = self.orderTotal;

        reset();

      }

      function updateAmountDue() {
        if (!self.gratuityChange)
          return;

        var n = parseFloat(self.gratuity);
        if (isNaN(n)) {
          n = 0;
        }

        self.amount(parseFloat(self.paymentCtrl.amountDue()) + n, true);

        self.gratuityChange = false;
      }

      function focus() {
        self.isFocusing = true;
      }

      function blur() {
        self.isFocusing = false;

        if (self.tempVal) {
          self.amount(self.tempVal, true);
        }

      }

      function amount(value, force) {
        if (angular.isDefined(value)) {
          if (self.isFocusing && !force) {
            self.tempVal = value;
            return;
          }

          self.tempVal = null;

          // var max = self.order.total();
          var max = self.amount();
          if (self.balance && self.balance > 0) {

            max = parseFloat(self.balance);

            if (parseFloat(self.balance) < parseFloat(self.amount())) {
              self.gratuity = 0;
              value = self.order.total();
            } else {

            }

            if (parseFloat(value) >= parseFloat(max)) {
              value = parseFloat(max);
            }

            if (parseFloat(self.gratuity) > parseFloat(max)) {
              self.gratuity = parseFloat(max);
            }
          }

          self.paymentCtrl.amountDue(parseFloat(value).toFixed(2));
        } else {
          if (self.isFocusing && angular.isDefined(self.tempVal) && !force && self.tempVal != null) {
            return self.tempVal;
          }

          return self.paymentCtrl.amountDue();
        }
      }

      function getGiftCertificate() {
        if (self.promise) {
          $timeout.cancel(self.promise);
        }

        self.promise = $timeout(function() {
          Payments.getGiftCertificate(self.giftCardNumber, self.get('displayName')).then(function(result) {
            if (result.ResponseCode == 0) {
              self.balance = '';
              Modals.alert(result.ResponseMessage);
              self.validCard = '';
            } else {
              if (result.balance) {
                self.balance = result.balance;
                self.validCard = self.giftCardNumber;

                // if (self.paymentCtrl.amountDue() > self.balance) {
                self.amount(self.amount(), true);
                // }

              } else {
                self.validCard = '';
              }
            }

          }, function(err) {
            console.log(err);
          });
        }, 500);
      }

      function onSeatChange() {
        var amount = self.seatData.amount;
        if (amount == 0 || self.seatData.selectedSeatIds[0] == 99) {
          amount = self.order.total();
        }

        var gratuity = self.gratuity ? self.gratuity : 0;
        self.paymentCtrl.amountDue(parseFloat(amount * 1.0 + gratuity * 1.0).toFixed(2));

        self.amt_due = amount;
      }

      function onSplitChange() {
        var amount = self.splitData.amount;
        if (amount == 0 || self.splitData.selectedSplitIds[0] == 99) {
          amount = self.order.total();
        }

        var gratuity = self.gratuity ? self.gratuity : 0;
        self.paymentCtrl.amountDue(parseFloat(amount * 1.0 + gratuity * 1.0).toFixed(2));
        self.amt_due = amount;

      }

      function sendPayment(itemsSent) {
        var deferred = $q.defer();

        var data = {
          order_id : self.order.getId(),
          terminal_id : Utils.ckpar(''),
          payment_id : Utils.ckpar(self.getId()),
          seat : Utils.ckpar('99'),
          client_id : Utils.ckpar(''),

          gift_certificate : Utils.ckpar(self.validCard),
          gratuity : Utils.ckpar(self.gratuity),

          items_taxexempt : Utils.ckpar(itemsSent),

          // amount info
          payment_amount : Utils.ckpar(self.paymentCtrl.amountDue()),

          requires_manager_approval : 'no' // TODO: Implement Pinpad
        };

        if (self.order.isChair()) {
          data['seat'] = self.seatData.selectedSeatIds.join(',');
          if (data['seat'] == 99) {
            self.seatData.amounts = self.order.getSeatAmounts();

          }
          data['seat_payment_details'] = Payments.getSeatPaymentDetails(self.seatData.amounts, self.paymentCtrl.amountDue(), self.gratuity).join(',');
        } else if (self.order.isEqually()) {
          data['split'] = self.splitData.selectedSplitIds.join(',');
          data['seat'] = self.splitData.selectedSplitIds.join(',');

          if (data['split'] == 99) {
            self.splitData.amounts = self.order.getSplitAmounts();

          }

          data['seat_payment_details'] = Payments.getSeatPaymentDetails(self.splitData.amounts, self.paymentCtrl.amountDue(), self.gratuity).join(',');
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

    return GiftCertificate;
  }
})();