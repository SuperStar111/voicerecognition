;
(function() {
  'use strict';

  angular.module('soft').factory('PaymentType.Cash', Cash);

  Cash.$inject = [ 'Service.CashDrawers', 'PaymentType.BasePaymentType', 'soft.Utils', '$q', 'Checks', 'Modals', 'Service.Payments' ];
  function Cash(CashDrawers, BasePaymentType, Utils, $q, Checks, Modals, Payments) {
    var Cash = function(object) {
      var self = angular.extend(this, new BasePaymentType(object));

      self.init = init;
      self.receive = receive;
      self.changeDue = changeDue;
      self.updateAmountDue = updateAmountDue;

      self.paymentCtrl = null;
      self.sendPayment = sendPayment;
      self.updateButtonValues = updateButtonValues;
      self.checkAmountDue = checkAmountDue;

      self.onSeatChange = onSeatChange;
      self.onSplitChange = onSplitChange;

      function reset() {
        self.seatData = {
          selectedSeatIds : [ 99 ]
        };
        self.splitData = {
          selectedSplitIds : [ 99 ]
        };

        self.received = '';
      }

      function init(order) {
        self.order = order;

        self.paymentCtrl = order.paymentCtrl;

        self.orderTotal = self.order.total();
        self.amt_due = self.orderTotal;

        self.gratuity = Utils.ckpar(null);

        reset();

        self.originalAmount = self.paymentCtrl.amountDue();

        self.updateAmountDue();

        updateButtonValues();

      }

      function receive(v) {
        self.received = self.arrayvalue[v];

      }

      function updateButtonValues() {
        self.arrayvalue = new Array();

        var amountDue = self.paymentCtrl.amountDue();
        if (isNaN(amountDue))
          amountDue = 0;
        var vt = parseFloat(amountDue);

        var v1 = Utils.calcround(vt, 10, self.arrayvalue);
        self.arrayvalue[0] = Utils.formatMoney(v1, 1);

        if (isNaN(self.arrayvalue[0]))
          self.arrayvalue[0] = 0;
        self.v1 = self.arrayvalue[0];

        var v2 = Utils.calcround(vt, 20, self.arrayvalue);
        self.arrayvalue[1] = Utils.formatMoney(v2, 1);
        if (isNaN(self.arrayvalue[1]))
          self.arrayvalue[1] = 0;
        self.v2 = self.arrayvalue[1];

        var v3 = Utils.calcround(vt, 50, self.arrayvalue);
        self.arrayvalue[2] = Utils.formatMoney(v3, 1);
        if (isNaN(self.arrayvalue[2]))
          self.arrayvalue[2] = 0;
        self.v3 = self.arrayvalue[2];

        var v4 = Utils.calcround(vt, 100, self.arrayvalue);
        self.arrayvalue[3] = Utils.formatMoney(v4, 1);
        if (isNaN(self.arrayvalue[3]))
          self.arrayvalue[3] = 0;
        self.v4 = self.arrayvalue[3];

        if (self.v4 < 10) {
          self.buttonSize = 1;
        } else if (self.v4 >= 10 && self.v4 < 100) {
          self.buttonSize = 2;
        } else if (self.v4 >= 100 && self.v4 < 1000) {
          self.buttonSize = 3;
        } else if (self.v4 >= 1000) {
          self.buttonSize = 4;
        }
      }

      function changeDue() {
        var change = parseFloat(self.received) - parseFloat(self.paymentCtrl.amountDue());

        if (isNaN(change)) {
          return '';
        } else if (change < 0) {
          return "0.00";
        } else {
          return change.toFixed(2);
        }
      }

      function updateAmountDue() {
        if (!self.gratuityChange)
          return;

        var n = parseFloat(self.gratuity);
        if (isNaN(n) || n == 0) {
          self.paymentCtrl.amountDue(self.originalAmount);
        } else {
          // var amountDue = parseFloat(self.paymentCtrl.amountDue());
          var amountDue = parseFloat(self.originalAmount);
          if (isNaN(amountDue)) {
            amountDue = 0;
          }
          self.paymentCtrl.amountDue((amountDue + n).toFixed(2));
        }

        updateButtonValues();
        self.gratuityChange = false;
      }

      function checkAmountDue() {
        if (!angular.isDefined(self.received) || self.received == '') {
          return;
        }

        // self.received = parseFloat(self.received);
        var received = parseFloat(self.received);
        if (isNaN(received)) {
          Modals.alert('Invalid received number.');
        } else {
          if (self.received < self.paymentCtrl.amountDue()) {
            self.paymentCtrl.amountDue(received);
          }
        }
      }

      function onSeatChange() {
        var amount = self.seatData.amount;
        if (amount == 0) {
          amount = self.order.total();
        }

        self.originalAmount = amount;

        var gratuity = self.gratuity ? self.gratuity : 0;
        self.paymentCtrl.amountDue(parseFloat(amount * 1.0 + gratuity * 1.0).toFixed(2));

        self.amt_due = amount;

        updateButtonValues();
      }

      function onSplitChange() {
        var amount = self.splitData.amount;
        if (amount == 0) {
          amount = self.order.total();
        }

        self.originalAmount = amount;
        
        var gratuity = self.gratuity ? self.gratuity : 0;
        self.paymentCtrl.amountDue(parseFloat(amount * 1.0 + gratuity * 1.0).toFixed(2));
        self.amt_due = amount;

        updateButtonValues();
      }

      function sendPayment(itemsSent) {
        var deferred = $q.defer();

        var received = self.received;
        if (!received || received == 0) {
          received = self.paymentCtrl.amountDue();
        }

        var data = {
          order_id : self.order.getId(),
          terminal_id : Utils.ckpar(''),
          payment_id : Utils.ckpar(self.getId()),
          seat : Utils.ckpar('99'),
          client_id : Utils.ckpar(''),

          items_taxexempt : Utils.ckpar(itemsSent),

          payment_amount : Utils.ckpar(self.paymentCtrl.amountDue()),
          gratuity : Utils.ckpar(self.gratuity),
          received : Utils.ckpar(received),

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
            CashDrawers.print();

            reset();
            if (result.change_due && result.change_due > 0 || self.received < self.order.total()) {
              if (!result.change_due) {
                result.change_due = "0.00";
              }
              Modals.alert("<div style='font-size:72px;text-align:center'>" + result.change_due + "</div>", function() {
                result.showMessage = false;
                deferred.resolve(result);
              }, {
                html : true,
                title : "Change Due"
              });
            } else {
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

    return Cash;
  }
})();