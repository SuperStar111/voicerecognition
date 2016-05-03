;
(function() {
  'use strict';

  angular.module('soft').directive('pinPad', PinPad);

  PinPad.$inject = [];
  function PinPad() {
    return {
      restrict : 'E',
      templateUrl : 'templates/partials/pinpad.html',
      require : '^ngModel',
      link : function(scope, element, attrs, ngModel) {
        scope.ngModel = ngModel;
      },
      controller : Controller
    };
  }

  Controller.$inject = [ '$scope', '$attrs', '$timeout' ];
  function Controller($scope, $attrs, $timeout) {
    var self = this;

    self.password = '';

    self.keys = keys;
    self.remove = remove;
    self.keyboard = keyboard;

    $scope.$watch('$viewContentLoaded', function() {
      // angular.element("#password_id")[0].focus();
      $timeout(function () {
        angular.element("#password_id")[0].focus();
        //element.find('[autofocus]').focus();
      });
      
      angular.element("#password_id").keyboard({
        openOn : null,
        stayOpen : true,
        layout : 'qwerty',
        position : {
          of : '#pointBtm',
          my : 'center bottom'
        }
      }).addTyping();

    });

    $attrs.$observe('pinValue', function() {
      self.password = $attrs.pinValue;
    });

    $scope.$watch(function() {
      return self.password;
    }, function() {
      $scope.ngModel.$setViewValue(self.password);
    });

    function keys(a) {
      self.password += a;

      // TODO: Set focus for password input
      // document.getElementById("password_id").focus();
    }

    function remove() {
      self.password = self.password.substr(0, self.password.length - 1);
      // TODO: Set focus for password input
      // document.getElementById("password_id").focus();
    }

    function keyboard() {
      var kb = $('#password_id').getkeyboard();
      // close the keyboard if the keyboard is visible and the button is clicked
      // a second time
      if (kb.isOpen) {
        kb.close();
      } else {
        kb.reveal();
      }
    }

    $scope.pinpadCtrl = self;
  }
})();