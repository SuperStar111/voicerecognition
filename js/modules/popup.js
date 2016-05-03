;
(function() {
  'use strict';

  /**
   * @Author: Manas Sahoo
   * @Date : 03/07/2015 @ Angular Js controller for Popups
   */
  angular.module('soft').controller('manualItemCtrl', [ '$scope', '$modalInstance', function($scope, $modalInstance) {
    $scope.item = {
      printer : '--- Printer ---',
      menu : '--- Menu ---',
      menu_group : '--- Menu Group ---',
      type : '--- Article Type ---',
      is_taxable : '--- Taxable ---',
      tax_code : '--- Tax Code ---'
    };

    $scope.add_item = function() {
      console.log($scope.item);
      $modalInstance.close($scope.item);
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };
  } ]);

  angular.module('soft').controller('fireOrderCtrl', [ '$scope', '$modalInstance', '$timeout', function($scope, $modalInstance, $timeout) {
    $timeout(function() {
      $("#sortable1, #sortable2, #sortable3").sortable({
        connectWith : ".items-container"
      }).disableSelection();
    });

    $scope.fire_order = function() {
      $modalInstance.close();
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };
  } ]);
  angular.module('soft').controller('discountCtrl', [ '$scope', '$modalInstance', '$timeout', function($scope, $modalInstance, $timeout) {
    $timeout(function() {
      $('.order-quantity').bootstrapNumber();
    });
    $scope.item = {
      quantity : 1,
    };
    $scope.discount = {
      code : '--- Discount Code ---',
      type : '--- Discount Type ---'
    };

    $scope.apply_discount = function() {
      $modalInstance.close();
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };
  } ]);
  angular.module('soft').controller('managerPwCtrl', [ '$scope', '$modalInstance', '$timeout', function($scope, $modalInstance, $timeout) {

    $scope.keys = function(a) {
      var val = $scope.password;
      if (val) {
        $scope.password = val + "" + a;
        pass_val = val + "" + a;
      } else {
        $scope.password = a;
        pass_val = a;
      }
      $("#manager-password").focus();
    };

    $scope.remove = function() {
      var str = $scope.password;
      $scope.password = str.substr(0, str.length - 1);
      $("#manager-password").focus();
    };

    $scope.keyboard = function() {
      var kb = $('#manager-password').getkeyboard();
      if (kb.isOpen) {
        kb.close();
      } else {
        kb.reveal();
      }
    };

    $scope.hit_enter = function(event) {
      if (event.keyCode == 13) {
        console.log(event);
      }
    };

    $scope.keyboard_clic = function() {
      pos = pose($('#manager-password'));
    };

    $timeout(function() {
      $('#manager-password').keyboard({
        openOn : null,
        stayOpen : true,
        layout : 'qwerty',
        position : {
          of : '#pointBtm',
          my : 'center bottom'
        }
      }).addTyping();
    });

    $scope.submit_discount = function() {
      $modalInstance.close();
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };
  } ]);
  angular.module('soft').controller('seatCtrl', [ '$scope', '$modalInstance', '$timeout', function($scope, $modalInstance, $timeout) {

    $scope.apply_seat = function() {
      $modalInstance.close();
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };
  } ]);
  
})();
