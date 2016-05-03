;
(function() {
  'use strict';

  angular.module('soft').factory('PaymentType.CreditCard', CreditCard);

  CreditCard.$inject = [ 'PaymentType.BasePaymentType', 'SoftView.TabView', 'soft.Utils', '$q', 'Checks', 'Orders', 'Service.Payments', '$timeout' ];
  function CreditCard(BasePaymentType, TabView, Utils, $q, Checks, Orders, Payments, $timeout) {
    var CreditCard = function(object) {
      var self = angular.extend(this, new BasePaymentType(object));

      var defaultPercent = 1.0; // previously 0.5

      self.months = Utils.months();

      self.init = init;

      self.paymentCtrl = null;
      self.sendPayment = sendPayment;

      self.authorizeclick = authorizeclick;
      self.saleclick = saleclick;
      self.ckprocess = ckprocess;
      self.updateAmountDue = updateAmountDue;
      self.selectCard = selectCard;
      self.isProcessor = isProcessor;
      self.formatGratuity = formatGratuity;

      self.payments = [];

      self.seatData = {};
      self.onSeatChange = onSeatChange;
      self.splitData = {};
      self.onSplitChange = onSplitChange;
      self.getYears = getYears;

      function reset() {
        self.seatData = {
          selectedSeatIds : [ 99 ]
        };
        self.splitData = {
          selectedSplitIds : [ 99 ]
        };

        clearFields();

        if (isProcessor()) {
          // loadPayments();
        }
      }

      function init(order) {
        self.order = order;

        self.paymentCtrl = order.paymentCtrl;

        self.orderTotal = self.order.total();

        self.amt_due = self.orderTotal;

        reset();

        self.originalAmount = self.paymentCtrl.amountDue();

        if (isProcessor()) {

          // self.gratuity = (parseFloat(self.orderTotal) *
          // defaultPercent).toFixed(2);

          self.gratuity = '';
          // self.paymentCtrl.amountDue(parseFloat(self.orderTotal) +
          // parseFloat(self.gratuity));

          self.paymentCtrl.amountDue(parseFloat(self.orderTotal).toFixed(2));
        }

        if (!isProcessor()) {
          self.authorization = 0;
        } else {
          self.authorization = 1;
        }

        self.tabControl = new TabView();

        self.tabControl.showTab('authorize'); // authorize, sale

        if (isProcessor()) {

          // loadPayments();

        }

        if (isProcessor()) {
          self.paymentCtrl.amountDue(parseFloat(self.paymentCtrl.amountDue()).toFixed(2));
        }

        self.availableYears = availableYears();
      }

      function isProcessor() {
        return self.get('processor').toUpperCase() == 'YES';
      }

      function authorizeclick() {
        self.authorization = 1;

        clearFields();
      }

      function clearFields() {
        self.cc_first_name = '';
        self.cc_last_name = '';
        self.cc_number = '';
        self.cc_number2 = '';
        self.exp_month = '';
        self.exp_year = '';
        self.cc_cvv = '';

        self.gratuity = '';

        self.currentCard = null;
      }

      function saleclick() {
        self.authorization = 0;

      }

      function fillCardInfo(card) {
        card.isSelected = true;
        self.currentCard = card;

        self.cc_first_name = card.get('cc_first_name');
        self.cc_last_name = card.get('cc_last_name');
        self.cc_number = card.get('cc_number');

        var exp = card.get('cc_exp').split('/');
        self.exp_month = exp[0];
        self.exp_year = exp[1];
        self.cc_cvv = card.get('cc_cvv');

        self.gratuity = '';
        self.paymentCtrl.amountDue(self.orderTotal);

        self.tabControl.showTab('sale');
        self.saleclick();
      }

      function selectCard(card) {
        self.order = Checks.currentCheck().currentOrder();
        if (self.order.isChair() && card.get('seat')) {
          self.seatData = {
            selectedSeatIds : [],
            authorizeCCClicked : true
          };
        } else if (self.order.isEqually() && card.get('split')) {
          self.splitData = {
            selectedSplitIds : [],
            authorizeCCClicked : true
          };
        }

        if (self.currentCard == card) {
          self.currentCard = null;
          self.tabControl.showTab('authorize');
          self.authorizeclick();
          card.isSelected = false;

        } else {
          self.tabControl.showTab('sale');
          self.saleclick();

          // clear previous selected states
          angular.forEach(self.payments, function(payment, index) {
            payment.isSelected = false;
          });

          fillCardInfo(card);

          if (self.order.isChair() && card.get('seat')) {
            self.seatData = {
              selectedSeatIds : card.get('seat').split(','),
              authorizeCCClicked : true
            };
          } else if (self.order.isEqually() && card.get('split')) {
            self.splitData = {
              selectedSplitIds : card.get('split').split(','),
              authorizeCCClicked : true
            };
          }
        }

      }

      function ckprocess() {
        return !!self.currentCard;
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

        // set payment as highlights
        if (self.seatData.isSeatClick) {
          angular.forEach(self.payments, function(payment) {
            payment.isSelected = false;
          });
        }

        if (self.seatData.isEmpty) {
          self.currentCard = null;
          self.authorizeclick();
          self.tabControl.showTab('authorize');
        } else if (self.seatData.selectedSeatIds == 99 && self.seatData.amount > 0) {
          if (self.payments.length > 0) {
            // select first card
            if (!self.currentCard && self.seatData.isSeatClick)
              selectCard(self.payments[0]);
          }
          // angular.forEach(self.payments, function(payment, index) {
          // payment.isSelected = true;
          // });
        } else {
          angular.forEach(self.seatData.selectedSeatIds, function(seat) {
            angular.forEach(self.payments, function(payment, index) {
              if (payment.get('seat') == 99 && self.seatData.amount > 0) {
                if (!self.currentCard && self.seatData.isSeatClick)
                  selectCard(payment);
              } else {
                var seats = payment.get('seat').split(',');
                if (seats.indexOf(seat) != -1) {
                  if (!self.currentCard && self.seatData.isSeatClick)
                    selectCard(payment);
                }
              }
            });
          });
        }
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

        // set payment as highlights
        if (self.splitData.isSplitClick) {
          angular.forEach(self.payments, function(payment) {
            payment.isSelected = false;
          });
        }

        if (self.splitData.isEmpty) {
          self.currentCard = null;
          self.tabControl.showTab('authorize');
          self.authorizeclick();
        } else if (self.splitData.selectedSplitIds == 99 && self.splitData.amount > 0) {
          if (self.payments.length > 0) {
            // select first card
            if (!self.currentCard && self.splitData.isSplitClick)
              selectCard(self.payments[0]);
          }
        } else {
          angular.forEach(self.splitData.selectedSplitIds, function(split) {
            angular.forEach(self.payments, function(payment, index) {
              if (payment.get('split') == 99) {
                if (!self.currentCard && self.splitData.isSplitClick)
                  selectCard(payment);
              } else {
                var splits = payment.get('split').split(',');
                if (splits.indexOf(split) != -1) {
                  if (!self.currentCard && self.splitData.isSplitClick)
                    selectCard(payment);
                }
              }
            });
          });
        }

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

              Checks.currentCheck().getOrder().then(function(order) {
                var payments = order.getAuhorizedCCs();

                if (payments.length > 0) {
                  $timeout(function() {
                    self.selectCard(payments[payments.length - 1]);
                  }, 2000);

                }

                result.skipReload = true;

                reset();

                deferred.resolve(result);
              }, function(err) {
                deferred.reject(err);
              });
            } else {
              reset();

              // clear fields

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

    return CreditCard;
  }
})();