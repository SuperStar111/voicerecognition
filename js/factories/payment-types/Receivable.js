;
(function() {
  'use strict';

  angular.module('soft').factory('PaymentType.Receivable', Receivable);

  Receivable.$inject = [ 'PaymentType.BasePaymentType', '$timeout', 'Service.Payments', 'Modals', '$q', 'Checks', 'soft.Utils', 'Users', 'Auth', '$cookieStore' ];
  function Receivable(BasePaymentType, $timeout, Payments, Modals, $q, Checks, Utils, Users, Auth, $cookieStore) {
    var Receivable = function(object) {
      var self = angular.extend(this, new BasePaymentType(object));

      self.init = init;
      self.paymentCtrl = null;
      self.sendPayment = sendPayment;
      self.updateAmountDue = updateAmountDue;
      self.selectCompany = selectCompany;
      self.inactive = inactive;

      self.getPaymentReceivableDetails = getPaymentReceivableDetails;

      self.onSeatChange = onSeatChange;
      self.onSplitChange = onSplitChange;

      function reset() {
        self.seatData = {
          selectedSeatIds : [ 99 ]
        };
        self.splitData = {
          selectedSplitIds : [ 99 ]
        };

        self.selectedCompany = {};
        self.companyName = '';
      }

      function init(order) {
        self.order = order;

        self.paymentCtrl = order.paymentCtrl;

        self.orderTotal = self.order.total();

        self.amt_due = self.orderTotal;

        // self.gratuity = (parseFloat(self.order.total()) * 0.5).toFixed(2);
        reset();

        self.originalAmount = self.paymentCtrl.amountDue();
      }

      function getPaymentReceivableDetails(receivables) {
        if (!self.companyName || self.companyName.length == 0) {
          self.searchResult = [];
          return;
        }
        if (self.promise) {
          $timeout.cancel(self.promise);
        }

        self.promise = $timeout(function() {
          self.searchingReceivables = true;
          Payments.getPaymentReceivableDetails(self.companyName).then(function(result) {
            self.searchingReceivables = false;
            if (result.ResponseCode == 0) {
              self.searchResult = [];
              Modals.alert(result.ResponseMessage);
            } else {
              if (result.result && result.result.length > 0) {
                self.searchResult = result.result;
              } else {
                self.searchResult = [];
              }
            }

          }, function(err) {
            self.searchingReceivables = false;
            console.log(err);
          });
        }, 500);
      }

      function selectCompany(company) {
        if (company.receivables && company.receivables.toUpperCase() == 'NO') {
          Modals.alert("This receivable account is currently turned off. Please see Manager in case of error.");
          return;
        } else if (company.associated && company.associated.toUpperCase() == 'NOT ASSOCIATED') {
          Modals
            .alert("The Company is not associated with this location. Should you wish to set up terms for this company. Please do so in BusinessPanel under Back Office - Receivables.");
          return;
        }

        self.selectedCompany = company;

        self.searchResult = [];

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

      function inactive() {
        self.companyName = null;
        self.searchResult = [];
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
      }

      function sendPayment(itemsSent) {
        var deferred = $q.defer();

        var options = {
          text : {
            yes : 'Submit',
            no : 'Cancel'
          }
        };
        var yesFn = function() {
          var timeoutPromise;
          $timeout(function() {
            Modals.verifyEmpId(function(password, closePopup, di) {
              Auth.verifyManager($cookieStore.get("location"), password, 'no', 'no', 'yes').then(
              // success)
              function(result) {
                if (result["ResponseCode"] == 0) {
                  di.scope.pinValue = '';

                  if (timeoutPromise) {
                    $timeout.cancel(timeoutPromise);
                  }

                  timeoutPromise = $timeout(function() {
                    Modals.alert(result['ResponseMessage']);
                  }, 100);

                } else if (result["ResponseCode"] == 1) {
                  closePopup();

                  if (timeoutPromise) {
                    $timeout.cancel(timeoutPromise);
                  }

                  timeoutPromise = $timeout(function() {

                    processReceivable();
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
          }, 100);

        };
        var noFn = function() {
          deferred.reject({
            silent : true
          });
        };

        if (self.selectedCompany.available_credit && self.selectedCompany.available_credit < self.paymentCtrl.amountDue()) {
          Modals.confirm("Receivable account has or will exceeded it's credit limit with this posting. Would you like to have a Manager override this charge in order to post?",
            yesFn, noFn, options);
        } else {
          processReceivable();
        }

        function processReceivable() {
          var data = {
            order_id : self.order.getId(),
            terminal_id : Utils.ckpar(''),
            payment_id : Utils.ckpar(self.getId()),
            seat : Utils.ckpar('99'),
            client_id : Utils.ckpar(''),

            company_id : self.selectedCompany ? Utils.ckpar(self.selectedCompany.company_id) : '',

            items_taxexempt : Utils.ckpar(itemsSent),

            // amount info
            payment_amount : Utils.ckpar(self.paymentCtrl.amountDue()),
            gratuity : Utils.ckpar(self.gratuity),

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
        }

        return deferred.promise;
      }

    };

    return Receivable;
  }
})();