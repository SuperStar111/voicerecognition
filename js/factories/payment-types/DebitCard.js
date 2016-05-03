;
(function() {
  'use strict';

  angular.module('soft').factory('PaymentType.DebitCard', DebitCard);

  DebitCard.$inject = [ 'PaymentType.BasePaymentType', 'SoftView.TabView', 'soft.Utils', '$q', 'Checks', 'Orders', 'Service.Payments' ];
  function DebitCard(BasePaymentType, TabView, Utils, $q, Checks, Orders, Payments) {
    var DebitCard = function(object) {
      var self = angular.extend(this, new BasePaymentType(object));

      self.months = Utils.months();

      self.init = init;
      self.paymentCtrl = null;
      self.sendPayment = sendPayment;

      self.updateAmountDue = updateAmountDue;

      self.onSeatChange = onSeatChange;
      self.onSplitChange = onSplitChange;
      self.formatGratuity = formatGratuity;
      self.getYears = getYears;

      function reset() {
        self.seatData = {
          selectedSeatIds : [ 99 ]
        };
        self.splitData = {
          selectedSplitIds : [ 99 ]
        };
      }

      function init(order) {
        reset();

        self.order = order;

        self.paymentCtrl = order.paymentCtrl;
        self.orderTotal = self.order.total();
        self.amt_due = self.orderTotal;

        self.amount_due = parseFloat(self.order.total()).toFixed(2);

        self.availableYears = availableYears();
      }
      function formatGratuity() {
        var gratuity = parseFloat(self.gratuity);
        if (isNaN(gratuity)) {
          self.gratuity = '';
        } else {
          self.gratuity = gratuity.toFixed(2);
        }

      }
      function updateAmountDue() {
        if (!self.gratuityChange)
          return;

        var n = parseFloat(self.gratuity);
        if (isNaN(n)) {
          n = 0;
        }

        self.paymentCtrl.amountDue((parseFloat(self.paymentCtrl.amountDue()) + n).toFixed(2));

        self.gratuityChange = false;
      }

      function onSeatChange() {
        var amount = self.seatData.amount;
        if (amount == 0) {
          amount = self.order.total();
        }

        self.originalAmount = amount;

        self.amt_due = amount;
        // self.gratuity = (parseFloat(self.amt_due) * 0.5).toFixed(2);
        var gratuity = self.gratuity ? self.gratuity : 0;

        self.paymentCtrl.amountDue(parseFloat(amount * 1.0 + gratuity * 1.0).toFixed(2));

      }

      function onSplitChange() {
        var amount = self.splitData.amount;
        if (amount == 0) {
          amount = self.order.total();
        }

        self.originalAmount = amount;

        self.amt_due = amount;
        // self.gratuity = (parseFloat(self.amt_due) * 0.5).toFixed(2);
        var gratuity = self.gratuity ? self.gratuity : 0;

        self.paymentCtrl.amountDue(parseFloat(amount * 1.0 + gratuity * 1.0).toFixed(2));

      }

      function availableYears() {
        var currentYear = new Date().getFullYear();

        var arr = new Array();
        var n = 30;
        for (var i = 0; i <= n; i++) {
          arr.push(currentYear + i);
        }

        return arr;
      }

      function getYears() {
        var availableYears = angular.copy(self.availableYears);

        var currentMonth = (new Date().getMonth()) * 1 + 1;

        var currentYear = new Date().getFullYear();

        if (self.exp_month && self.exp_month * 1 < currentMonth * 1) {
          while (availableYears[0] <= currentYear)
            availableYears.shift();
        }

        return availableYears;
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

          // credit info
          cc_first_name : Utils.ckpar(self.cc_first_name),
          cc_last_name : Utils.ckpar(self.cc_last_name),
          cc_number : self.currentCard ? self.currentCard.get('cc_full_number') : Utils.ckpar(self.cc_number),
          cc_cvv : Utils.ckpar(self.cc_cvv),
          cc_exp_month : Utils.ckpar(self.exp_month),
          cc_exp_yr : Utils.ckpar(self.exp_year),
          cc_autho : self.authorization,
          cc_process_autho : self.currentCard ? self.currentCard.getId() : '',

          // amount info
          payment_amount : Utils.ckpar(self.paymentCtrl.amountDue()),
          gratuity : Utils.ckpar(self.gratuity),
          cc_manual_autho : Utils.ckpar(self.manual_autho),

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
            if (result.closed_check.toLowerCase() == 'no') {
              reset();

              Checks.currentCheck().getOrder().then(function(order) {

                result.skipReload = true;
                deferred.resolve(result);
              }, function(err) {
                deferred.reject(err);
              });

            } else {
              reset();
              deferred.resolve(result);
            }

          } else {
            deferred.reject(result);
          }
        }, function(err) {
          deferred.reject(err);
        });

        return deferred.promise;
      }
    };

    return DebitCard;
  }
})();