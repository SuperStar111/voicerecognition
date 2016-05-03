;
(function() {
  'use strict';

  angular.module('soft').directive('tabPayment', TabPayment);

  TabPayment.$inject = [ '$timeout', '$document', 'Payment', 'Service.SoftInputs', '$rootScope' ];
  function TabPayment($timeout, $document, Payment, SoftInputs, $rootScope) {
    return {
      restrict : 'A',
      scope : {
        parentScope : '=parentScope',
      },
      replace : true,
      templateUrl : function(elem, attrs) {
        return attrs.templateUrl;
      },
      link : function(scope, element, attrs, ctrl) {
        var scanstart = function() {
          console.log('start');
        };

        var scanend = function() {
          console.log('end');
        };
        var success = function(event, data) {
          event.preventDefault();
          event.stopPropagation();

          if (data.type == "giftcard") {
            ctrl.currentSubType.giftCardNumber = [ data.first, data.second, data.last ].join('');
          } else {
            var cardData = {
              id : "",
              seat : "99",
              payment_type : "327",
              payment_type_name : "Credit Card",
              payment_local_code : "",
              amount : "(0.00)",
              autho_amount : "0.00",
              autho_amount_gratuity : "0.00",
              changedue : "0.00",
              id_item : "",
              id_pay : null,
              refund : "no",
              cc_first_name : data.firstName,
              cc_last_name : data.lastName,
              cc_number : data.account,
              cc_full_number : data.account,
              cc_cvv : "",
              cc_exp : [ data.expMonth, "20" + data.expYear ].join("/"),
              room_number : "",
              guest_name : "",
              company_id : null,
              company_name : null,
              giftcard_number : null,
              display : "No"
            };

            if (data.type == 'visa') {
              cardData.payment_code = 'Visa';
            } else if (data.type == 'mastercard') {
              cardData.payment_code = 'MasterCard';
            } else if (data.type == 'amex') {
              cardData.payment_code = 'American Express';
            } else if (data.type == 'discover') {
              cardData.payment_code = 'Discover Card';
            }

            var payment = new Payment(cardData);
            ctrl.setPayment(payment);
          }
        };

        var failure = function() {
          console.log('failed');
        };

        $.cardswipe({
          firstLineOnly : true,
          success : function(data) {

          },
          parsers : [ "visa", "amex", "mastercard", "discover", "giftcard", "generic" ],
          debug : false
        });

        $rootScope.documentSwipeEvent = $document.on("scanstart.cardswipe", scanstart).on("scanend.cardswipe", scanend).on("success.cardswipe", success).on("failure.cardswipe",
          failure);

      },
      controller : Controller
    };
  }

  Controller.$inject = [ '$scope', '$rootScope', 'PaymentTypes', '$window', 'Orders', '$timeout', 'Clients', 'Modals', 'soft.Utils', 'Checks', '$cookieStore', '$state', 'Payment',
    '$q', 'Service.SoftInputs', 'KeyboardSimulator' ];
  function Controller($scope, $rootScope, PaymentTypes, $window, Orders, $timeout, Clients, Modals, Utils, Checks, $cookieStore, $state, Payment, $q, SoftInputs, KeyboardSimulator) {
    var self = this;

    PaymentTypes.processData();
    self.paymentTypes = PaymentTypes.paymentTypes;
    self.hasGratuity = PaymentTypes.hasGratuity;

    self.sendPayment = sendPayment;
    self.check = Checks.currentCheck();

    self.searchPromiseExpenseTab = {
      name : null,
      id : null
    };

    $scope.gratuity = {
      percent : 0,
      amount : 0
    };

    // definitions
    self.selectPaymentType = selectPaymentType;
    self.isActivePaymentType = isActivePaymentType;
    self.loadPayDetail = loadPayDetail;
    self.isSubPaymentType = isSubPaymentType;
    self.isPaymentTypeName = isPaymentTypeName;
    self.getSelectedOrderedItems = getSelectedOrderedItems;

    self.percentageAmount = percentageAmount;
    self.amountDue = amountDue;
    self.setPayment = setPayment;

    self.csdailskeysright_setting = csdailskeysright_setting;
    self.csdailpadinner_setting = csdailpadinner_setting;
    self.csdailskeysleft2_setting = csdailskeysleft2_setting;

    self.keys = keys;
    self.keyboard = keyboard;
    self.removeChar = removeChar;

    var onOrderReload = $rootScope.$on('Order Reloaded', function(event, data) {
      setOrder(data.order);
    });

    $scope.$on('$destroy', function() {
      onOrderReload();
    });

    function setPayment(payment) {
      var type = payment.get('payment_code');

      if (!type) {
        type = PaymentTypes.getCCType(payment.get('cc_full_number'));
      }

      for (var i = 0; i < self.paymentTypes.length; i++) {
        var paymentType = self.paymentTypes[i];

        if (paymentType.key == 'Credit Card') {
          self.selectPaymentType(paymentType);

          // set cc type
          var validSubType = null;
          for (var j = 0; j < paymentType.subTypes.length; j++) {
            var subType = paymentType.subTypes[j];
            if (subType.get('payment_code') == type) {
              if (!validSubType || validSubType.get('payment_code') != type) {
                validSubType = subType;
              }

              if (validSubType.get('local_code') == payment.get('payment_local_code')) {
                // break 2;
                j = paymentType.subTypes.length;
              }

            }
          }

          if (!Checks.currentCheck().currentOrder()) {
            Checks.currentCheck().getOrder().then(function(order) {

              self.order = Checks.currentCheck().currentOrder();
              self.order.paymentCtrl = self;

              // subType.init(order);

              self.loadPayDetail(validSubType);
              $timeout(function() {
                fillInfo(validSubType, payment);
              }, 2000);
            }, function(err) {
              console.log(err);
            });
          } else {
            self.order = Checks.currentCheck().currentOrder();
            self.order.paymentCtrl = self;

            // subType.init(order);

            self.loadPayDetail(validSubType);
            $timeout(function() {
              fillInfo(validSubType, payment);
            }, 2000);
          }

          break;
        }
      }

      function fillInfo(currentType, card) {
        currentType.cc_first_name = card.get('cc_first_name');
        currentType.cc_last_name = card.get('cc_last_name');
        currentType.cc_number = card.get('cc_number');

        var expires = card.get('cc_exp').split('/');
        currentType.exp_month = expires[0];
        currentType.exp_year = expires[1];
        currentType.cc_cvv = card.get('cc_cvv');
        // subType.currentCard = card;
      }

      //
    }

    init();
    function init() {
//      $timeout(
//        function() {
//          console.log('keyboard start');
//
//          var str = "%B378282246310005^TESTER JR/C            ^1412000000000?;378282246310005=1412000000000?|0600|D98326DEFAC5BC17653652EF96CBF866718E336EBEB789EAE21CD92B678BABB859134D5AE368A5EA45861B4B1118535DE1EE51ACCCC9C3F38C3228E216CF6202|BB2218A60B5EB91E301A64FD4EB2DB21C18FF436E482526715E83702C126342A||61401000|A86A8D86B9070CC68D1E4A3D7D4FFE5A7E5D3294F4F790B7224C9444BE50F1666D45E1F16397EFF82E979460E504ADBFF324062F1A93D6D8|B291EAC102814AA|D38E0C2C74ED36AD|1000004B291EAC00037B|A765||1000";
//          for (var i = 0; i < str.length; i++) {
//            console.log('Print ' + str[i]);
//            KeyboardSimulator.simulateKeyPress(str[i]);
//          }
//        }, 3000);

      angular.forEach(self.paymentTypes, function(paymentType, key) {
        if (!$scope.parentScope[paymentType.key.toLowerCase()]) {
          $scope.parentScope[paymentType.key.toLowerCase()] = {
            payment : paymentType.subTypes[0]
          };
        } else {
          $scope.parentScope[paymentType.key.toLowerCase()].payment = paymentType.subTypes[0];
        }
      });

      if (!self.order) {
        self.check.getOrder().then(function(order) {
          setOrder(order);
          if (!setIfHasCCPayment()) {
            self.selectPaymentType(self.paymentTypes[0]);
          }
        }, function(err) {
          console.log(err);
        });
      } else {
        if (!setIfHasCCPayment()) {
          self.selectPaymentType(self.paymentTypes[0]);
        }
      }

      self.global_allow_receivable_login = $cookieStore.get("global_allow_receivable_login");

      self.global_allow_server_adjustment = $cookieStore.get("global_allow_server_adjustment");

    }

    function setIfHasCCPayment() {
      var orderItems = self.order.getItemsByType();

      var payments = orderItems['payments'];
      for (var i = 0; i < payments.length; i++) {
        var payment = payments[i];
        if (payment.get('payment_type_name') == 'Credit Card' && isAuthorizedCCs(payment)) {
          self.setPayment(payment);

          self.currentSubType.selectCard(payment);

          return true;
        }
      }

      return false;
    }

    function isAuthorizedCCs(payment) {
      if (!self.authorizedCCs) {
        self.authorizedCCs = self.order.getAuhorizedCCs();
      }

      for (var i = 0; i < self.authorizedCCs.length; i++) {
        if (self.authorizedCCs[i].getId() == payment.getId()) {
          return true;
        }
      }
      return false;
    }

    function setOrder(order) {
      self.order = order;

      self.order.amt_due = self.order.total();
      self.order.paymentCtrl = self;

      self.amountDue(self.order.total());

      if (self.currentSubType)
        self.currentSubType.init(self.order);
    }

    // implements
    function selectPaymentType(paymentType) {
      self.activePaymentType = paymentType;

      // select default
      self.loadPayDetail(paymentType.subTypes[0]);

    }

    function isActivePaymentType(paymentType) {
      return self.activePaymentType == paymentType;
    }

    function loadPayDetail(subType) {
      if (self.currentSubType) {
        self.currentSubType.inactive();
      }
      self.currentSubType = subType;

      if (self.order) {
        self.amountDue(self.order.total());
      }

      if (self.order) {
        self.currentSubType.init(Checks.currentCheck().currentOrder());
      }

      $scope.parentScope[self.activePaymentType.key.toLowerCase()].payment = subType;

    }

    function isSubPaymentType(subType) {
      return self.currentSubType == subType;
    }

    function csdailskeysright_setting() {
      var className = '';
      if ($(window).width > 1093) {
        className = 'csdailskeysright';
      } else {
        className = 'smallcsdailskeysright';
      }
      return className;
    }

    function csdailpadinner_setting() {
      var className = '';
      if ($(window).width > 1093) {
        className = 'csdailpadinner';
      } else {
        className = 'smallcsdailpadinner';
      }
      return className;
    }

    function csdailskeysleft2_setting() {
      var className = '';
      if ($(window).width > 1093) {
        className = 'csdailskeysleft2';
      } else {
        className = 'smallcsdailskeysleft2';
      }
      return className;
    }

    function isPaymentTypeName(name) {
      return self.activePaymentType && self.activePaymentType.key && self.activePaymentType.key.toLowerCase() == name.toLowerCase();
    }

    function amountDue(value) {
      self.order = Checks.currentCheck().currentOrder();

      if (!angular.isDefined(value)) {
        return self._amount_due;
      } else {
        self._amount_due = value;
        self._percentageAmount = parseFloat(self._amount_due / self.order.total() * 100).toFixed(2);
      }
    }

    function percentageAmount(value) {
      self.order = Checks.currentCheck().currentOrder();

      if (!angular.isDefined(value)) {
        return self._percentageAmount;
      } else {
        self._percentageAmount = value;
        self._amount_due = (Utils.retfixx(0.01 * self.order.total() * self._percentageAmount)).toFixed(2);
      }
    }

    function getSelectedOrderedItems() {
      var items = [];
      angular.forEach($scope.parentScope.selectedOrderedItems, function(value, key) {
        if (value.isChecked) {
          items.push(value);
        }
      });

      return items;
    }

    function setCCTab(card) {

    }

    function sendPayment() {
      var check = Checks.currentCheck();
      if (check.isClosed()) {
        Modals.alert("Details for a Closed check can not be modified.");
        return;
      }

      var itemsSent = '';

      (function() {
        var selectedIds = [];
        angular.forEach(Checks.currentCheck().currentOrder().selectedOrderedItems, function(value, key) {
          if (value.isChecked) {
            selectedIds.push(value.getId());
          }
        });

        itemsSent = selectedIds.join(',');
      })();

      // self.loadPayDetail(self.currentSubType);

      self.currentSubType.sendPayment(itemsSent, $scope.parentScope[self.activePaymentType.key.toLowerCase()].payment).then(function(result) {

        if (result.closed_check.toLowerCase() == 'yes') {
          if (result.showMessage !== false) {
            Modals.alert(result.ResponseMessage, function() {
              $state.go('Home');
            });
          } else {
            $state.go('Home');
          }

        } else {
          if (result.showMessage !== false) {
            Modals.alert(result.ResponseMessage);
          }

          if (!result.skipReload) {
            Checks.currentCheck().getOrder().then(function(order) {
              self.currentSubType.onOrderReloaded(order);
            }, function(err) {
              console.log(err);
            });
          }

        }
      }, function(err) {
        if (err && !err.silent)
          Modals.alert(err.ResponseMessage);
      });

      return;
    }

    /* Pinpad */
    function keyboard() {
      var currentFocusing = SoftInputs.currentFocusing();
      if (currentFocusing) {
        var kb = currentFocusing.getkeyboard();
        if (kb.isOpen) {
          kb.close();
        } else {
          kb.reveal();
        }
      }

    }

    function keys(a) {
      var currentFocusing = SoftInputs.currentFocusing();

      if (currentFocusing) {
        var val = currentFocusing.val();

        currentFocusing.val(val + a);
        currentFocusing.trigger('input');

        currentFocusing.data().$ngModelController.$setViewValue(val + a);
        currentFocusing.trigger('blur');

      }
    }

    function removeChar() {
      var currentFocusing = SoftInputs.currentFocusing();

      if (currentFocusing) {
        var val = currentFocusing.val();

        if (val.length > 0) {
          var newVal = val.substring(0, val.length - 1);
          currentFocusing.val(newVal);

          currentFocusing.trigger('input');

          currentFocusing.data().$ngModelController.$setViewValue(newVal);
          currentFocusing.trigger('blur');
        }

      }
    }

    $scope.ctrl = self;
  }
})();