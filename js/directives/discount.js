;
(function() {
  'use strict';

  angular.module('soft').directive('discount', Discount);

  Discount.$inject = [ '$modal', '$log', 'Modals' ];
  function Discount($modal, $log, Modals) {
    return {
      restrict : 'A',
      scope : {
        orderedItems : '=orderedItems'
      },
      link : function(scope, elem, attrs) {
        var modal_class = 'sp-modal ';
        if (attrs.modalClass) {
          modal_class = modal_class + attrs.modalClass;
        }

        elem.on('click', function(e) {

          var items = scope.orderedItems;

          if (items.length == 0) {
            Modals.alert("Please select a item(s) to initiate discount.");
          } else {

            var modalInstance = $modal.open({
              templateUrl : attrs.templateUrl,
              controller : Controller,
              animation : false,
              windowClass : modal_class,
              resolve : {
                items : function() {
                  return angular.copy(items);
                }
              }
            });

            modalInstance.result.then(function(selectedItem) {
              scope.selected = selectedItem;
            }, function() {
              $log.info('Modal dismissed at: ' + new Date());
            });
          }

        });
      }
    };
  }

  Controller.$inject = [ '$scope', '$rootScope', '$modalInstance', 'Modals', 'items', 'Orders', 'Checks', 'Users', 'Auth', '$cookieStore', '$timeout', '$q', 'PaymentTypes' ];
  function Controller($scope, $rootScope, $modalInstance, Modals, items, Orders, Checks, Users, Auth, $cookieStore, $timeout, $q, PaymentTypes) {
    var self = this;

    self.cancel = cancel;
    self.setup = setup;
    self.changeCode = changeCode;
    self.apply = apply;

    self.items = items;

    getDiscountCodes().then(function(codes) {
      self.discountCodes = codes;

      init();
    });

    function init() {

      self.order = Checks.currentCheck().currentOrder();

      // calculate previous discount
      calculatePreviousDiscounts();
    }

    function calculatePreviousDiscounts() {
      angular.forEach(self.items, function(item) {
        var s = 0;
        angular.forEach(item.getPayments(), function(payment) {
          s += parseFloat(payment.amount(true));
        });

        item.discountedPrice = parseFloat(s).toFixed(2);
      });
    }

    function getDiscountCodes() {
      var deferred = $q.defer();

      var arr = new Array();

      PaymentTypes.getPaymentsByType('Adjustments').then(function(adjustments) {
        angular.forEach(adjustments.items, function(adjustment) {
          var code = adjustment.local_code;
          if (!code) {
            code = adjustment.payment_code;
          }

          var item = {
            code : code,
            type : adjustment.adjustment_discount_type,
            data : adjustment
          };

          arr.push(item);

          deferred.resolve(arr);
        });
      }, function(err) {
        deferred.reject(err);
      });

      return deferred.promise;
    }

    function cancel() {
      $modalInstance.dismiss('cancel');
    }

    function setup(item) {
      item.beforeDiscount = function() {
        if (item.data.quantity == 0) {
          return 0;
        }

        var amount = parseFloat(parseInt(item.data.quantity) * parseFloat(item.get('price'))).toFixed(2);

        amount -= item.discountedPrice;

        return parseFloat(amount).toFixed(2);
      };

      item.afterDiscount = function() {
        if (item.data.quantity == 0) {
          return 0;
        }

        var amount = item.beforeDiscount();

        if (self.code && [ self.code.local_code, self.code.payment_code ].indexOf('Tax Exempt') != -1) {
          var tax = parseFloat(item.get('tax1_amount') + parseFloat(item.get('tax2_amount')));
          amount -= parseInt(item.data.quantity) * tax;
        } else {
          if (self.type == 'Fixed' && self.amount > 0) {
            amount -= self.amount;
          } else if (self.type == 'Percentage' && self.amount > 0) {

            amount -= amount / 100 * self.amount;
          }
        }

        return parseFloat(amount).toFixed(2);
      };
    }

    function changeCode() {
      self.type = self.code.adjustment_discount_type;

      if (self.code && [ self.code.local_code, self.code.payment_code ].indexOf('Tax Exempt') != -1) {

        calcExemptTax(self.items);
        self.isTaxExempt = true;
      } else {
        self.isTaxExempt = false;
        if (self.code.adjustment_discount_type == 'Fixed') {
          var amount = (self.code.adjustment_discount_rate + "").substr(0, (self.code.adjustment_discount_rate + "").indexOf('.') + 3);

          self.amount = parseFloat(amount).toFixed(2);

        } else if (self.code.adjustment_discount_type == 'Percentage') {
          var percentage = (self.code.adjustment_discount_rate + "").substr(0, (self.code.adjustment_discount_rate + "").indexOf('.') + 3);

          // var total = self.order.total();
          // var amount = parseFloat(total) / 100 * parseFloat(percentage);

          self.amount = parseFloat(percentage).toFixed(2);

        }
      }

    }

    function calcExemptTax(items) {
      var amount = 0;

      if (parseFloat(self.order.tax()) == 0) {
        self._percentage = null;
        self.amount = null;
        return;
      }

      angular.forEach(items, function(value, key) {

        if (value.isChecked) {
          amount += parseFloat(value.get('tax1_amount') + parseFloat(value.get('tax2_amount')));
        }

      });

      // self._percentage = (amount / parseFloat(self.order.tax()) *
      // 100).toFixed(2);
      self.amount = parseFloat(amount).toFixed(2);
    }

    function apply($event, form) {
      $event.preventDefault();

      if ($rootScope.location.Manager_req_discount.toUpperCase() == 'NO' && !Users.currentUser().allowDiscount) {
        Modals.alert("You are not authorized to make a discount. Please see a manager to do so.", function() {

        });
      } else if ($rootScope.location.Manager_req_discount.toUpperCase() == 'YES' && !Users.currentUser().allowDiscount) {
        var timeoutPromise;

        Modals.verifyEmpId(function(password, closePopup, di) {
          Auth.verifyManager($cookieStore.get("location"), password, 'yes', 'no').then(
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
                processDiscount();
              }, 100);

            }
          },
          // fails
          function(err) {
            console.log(err);
          });
        }, function() {

        }, {
          keepPopupWhenYes : true
        });
      } else {
        processDiscount();
      }

      function processDiscount() {
        // submit discount
        var orderID = Checks.currentCheck().getId();

        var discounts = new Array();

        angular.forEach(self.items, function(item) {
          if (item.get('quantity') > 0) {
            var amount = item.beforeDiscount();

            if (self.type == 'Fixed') {
              amount = self.amount;
            } else {
              amount = amount / 100 * self.amount;
            }

            var data = {
              item_id : item.getId(),
              discount_value : amount,
              quantity : item.get('quantity')
            };

            discounts.push(data);
          }

        });

        Orders.updateItemsDiscount(orderID, self.code.id, discounts).then(function(result) {
          Checks.currentCheck().getOrder().then(function(order) {
            self.cancel();
          }, function(err) {
            console.log(err);
          });
        }, function(err) {
          console.log(err);
        });
      }

    }

    $scope.ctrl = self;

  }
})();