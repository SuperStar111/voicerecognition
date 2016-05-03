;
(function() {
  'use strict';

  angular.module('soft').factory('PaymentType.Adjustment', Adjustment);

  Adjustment.$inject = [ 'PaymentType.BasePaymentType', 'soft.Utils', 'Checks', '$q', '$rootScope', 'Users', 'Modals', 'Auth', '$cookieStore', '$timeout', 'Service.Payments' ];
  function Adjustment(BasePaymentType, Utils, Checks, $q, $rootScope, Users, Modals, Auth, $cookieStore, $timeout, Payments) {
    var Adjustment = function(object) {
      var self = angular.extend(this, new BasePaymentType(object));

      self.init = init;
      self.paymentCtrl = null;
      self.sendPayment = sendPayment;
      self.amount = amount;
      self.percent = percent;
      self.onOrderReloaded = onOrderReloaded;

      self.onSeatChange = onSeatChange;
      self.onSplitChange = onSplitChange;

      self._totalTax = 0;

      function reset() {
        self.seatData = {
          selectedSeatIds : [ 99 ]
        };
        self.splitData = {
          selectedSplitIds : [ 99 ]
        };

        self.pay_description = '';
      }

      function setupValues() {
        if (self.data.adjustment_discount_type == 'Fixed') {
          self._totalTax = self.data.adjustment_discount_rate.substr(0, self.data.adjustment_discount_rate.indexOf('.') + 3);

          self.amount(self._totalTax);

        } else if (self.data.adjustment_discount_type == 'Percentage') {
          self._percentage = self.data.adjustment_discount_rate.substr(0, self.data.adjustment_discount_rate.indexOf('.') + 3);
          self.percent(self._percentage);
        } else {
          self.freeEditing = true;
          self._totalTax = '';
          self._percentage = '';
        }
      }

      function init(order) {
        self.order = order;

        self.paymentCtrl = order.paymentCtrl;

        reset();
        setupValues();

        if (self.get('displayName') == 'Tax Exempt') {
          // if (!self.freeEditing)
          self.disableFields = true;

          if ($rootScope.cleanupFn) {
            $rootScope.cleanupFn();
          }

          $rootScope.cleanupFn = $rootScope.$on('Selected Ordered Items Changed', function(event, data) {
            calcExemptTax(data.items);
          });

          calcExemptTax(self.paymentCtrl.getSelectedOrderedItems());

        }
      }

      function calcExemptTax(items) {
        self._totalTax = 0;

        if (parseFloat(self.order.tax()) == 0) {
          self._percentage = null;
          self._totalTax = null;
          return;
        }

        angular.forEach(items, function(value, key) {

          if (value.isChecked) {
            self._totalTax += parseFloat(value.get('tax1_amount') + parseFloat(value.get('tax2_amount')));
          }

        });

        self._percentage = (self._totalTax / parseFloat(self.order.tax()) * 100).toFixed(2);

        if (self._percentage > 100) {
          self._percentage = 100;
        }

        self._totalTax = self._totalTax.toFixed(2);
        self.percent(self._percentage);

      }

      function amount(value) {
        if (angular.isDefined(value)) {
          var amount = 0;

          if (self.order.isChair()) {
            amount = self.seatData.amount;
          } else if (self.order.isEqually()) {
            amount = self.splitData.amount;
          }

          if (!amount) {
            amount = self.order.total();
          }

          var total = amount;

          if (self.get('displayName') == 'Tax Exempt') {
            total = self.order.tax();
          }

          self._totalTax = value;

          if (self.data.adjustment_discount_type != 'Percentage') {
            if (self.get('displayName') == 'Tax Exempt') {
              if (total == 0) {
                self._percentage = 0;
              } else {
                self._percentage = (self._totalTax / parseFloat(total) * 100).toFixed(2);
                if (self._percentage > 100) {
                  self._percentage = 100;
                  self.percent(100);
                }
              }

            } else {
              self._percentage = (self._totalTax / parseFloat(total) * 100).toFixed(2);
              if (self._percentage > 100) {
                // self._percentage = 100;
                self.percent(100);
              }
            }
          }

        } else {
          return self._totalTax;
        }
      }

      function percent(value) {
        if (angular.isDefined(value)) {
          var amount = 0;

          if (self.order.isChair()) {
            amount = self.seatData.amount;
          } else if (self.order.isEqually()) {
            amount = self.splitData.amount;
          }

          if (!amount) {
            amount = self.order.total();
          }

          var total = amount;

          if (self.get('displayName') == 'Tax Exempt') {
            total = self.order.tax();
          }

          if (value > 100) {
            value = 100;
          }

          self._percentage = value;

          if (self.data.adjustment_discount_type != 'Fixed' || value == 100) {
            self._totalTax = (parseFloat(total) / 100 * parseFloat(value)).toFixed(2);
          }
        } else {
          return self._percentage;
        }
      }

      function onOrderReloaded(order) {
        self.order = order;

        setupValues();
      }

      function onSeatChange() {
        if (self.data.adjustment_discount_type == 'Percentage') {
          var amount = self.seatData.amount;
          if (self.seatData.amount == 0) {
            amount = self.order.total();
          }
          var val = amount * self.percent() / 100;
          self.amount(val.toFixed(2));
        } else if (self.data.adjustment_discount_type == 'Fixed') {
          var amount = self.seatData.amount;
          if (self.seatData.amount == 0) {
            amount = self.order.total();
          }
          var val = self.amount() / amount * 100;
          self.percent(val.toFixed(2));
        } else {

        }

      }

      function onSplitChange() {
        if (self.data.adjustment_discount_type == 'Percentage') {
          var amount = self.splitData.amount;
          if (self.splitData.amount == 0) {
            amount = self.order.total();
          }
          var val = amount * self.percent() / 100;
          self.amount(val.toFixed(2));
        } else if (self.data.adjustment_discount_type == 'Fixed') {
          var amount = self.splitData.amount;
          if (self.splitData.amount == 0) {
            amount = self.order.total();
          }
          var val = self.amount() / amount * 100;
          self.percent(val.toFixed(2));
        }

      }

      function sendPayment(itemsSent) {
        var deferred = $q.defer();

        if ($rootScope.location.Manager_req_adjustment.toUpperCase() == 'NO' && !Users.currentUser().allowAdjustment) {
          Modals.alert("You are not authorized to make an adjustment. Please see a manager to do so.", function() {
            deferred.reject({
              silent : true
            });
          });
        } else if ($rootScope.location.Manager_req_adjustment.toUpperCase() == 'YES' && !Users.currentUser().allowAdjustment) {
          var timeoutPromise;

          Modals.verifyEmpId(function(password, closePopup, di) {
            Auth.verifyManager($cookieStore.get("location"), password, 'no', 'yes').then(
            // success)
            function(result) {
              if (result["ResponseCode"] == 0) {
                di.scope.pinValue = '';
                Modals.alert(result.ResponseMessage);
              } else if (result["ResponseCode"] == 1) {
                closePopup();

                if (timeoutPromise) {
                  $timeout.cancel(timeoutPromise);
                }

                timeoutPromise = $timeout(function() {
                  processAdjustment();
                }, 100);

              }
            },
            // fails
            function(err) {
              deferred.reject(err);
            });
          }, function() {
            deferred.reject();
          }, {
            keepPopupWhenYes : true
          });
        } else {
          processAdjustment();
        }

        function processAdjustment() {
          var data = {
            order_id : self.order.getId(),
            terminal_id : Utils.ckpar(''),
            payment_id : Utils.ckpar(self.getId()),
            client_id : Utils.ckpar(''),

            items_taxexempt : Utils.ckpar(itemsSent),
            notes : Utils.ckpar(self.pay_description),

            payment_amount : Utils.ckpar(self.amount()),

            requires_manager_approval : 'no' // TODO: Implement Pinpad
          };

          if (self.order.isChair()) {
            data['seat'] = self.seatData.selectedSeatIds.join(',');

            if (data['seat'] == 99) {
              self.seatData.amounts = self.order.getSeatAmounts();

            }

            data['seat_payment_details'] = Payments.getSeatPaymentDetails(self.seatData.amounts, self.amount(), 0).join(',');
          } else if (self.order.isEqually()) {
            data['split'] = self.splitData.selectedSplitIds.join(',');
            data['seat'] = self.splitData.selectedSplitIds.join(',');

            if (data['split'] == 99) {
              self.splitData.amounts = self.order.getSplitAmounts();

            }

            data['seat_payment_details'] = Payments.getSeatPaymentDetails(self.splitData.amounts, self.amount(), 0).join(',');
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
        }

        return deferred.promise;
      }
    };

    return Adjustment;
  }
})();