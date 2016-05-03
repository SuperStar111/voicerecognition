;
(function() {
  'use strict';

  angular.module('soft').directive('softInput', SoftInput);

  SoftInput.$inject = [ 'Service.SoftInputs' ];
  function SoftInput(SoftInputs) {
    return {
      restrict : 'A',
      link : function(scope, element, attrs) {
        element.keyboard({
          openOn : null,
          stayOpen : true,
          layout : 'qwerty',
          position : {
            of : null,
            my : 'center bottom'
          },
          css : {
            input : ''
          }
        }).addTyping();

        element.focus(function(event) {
          SoftInputs.currentFocusing(element);
        });

      }
    };
  }

  angular.module('soft').service('Service.SoftInputs', SoftInputs);
  SoftInputs.$inject = [];
  function SoftInputs() {
    var SoftInputs = function() {
      var self = this;

      self._currentInput = null;

      self.currentFocusing = currentFocusing;
      self.blur = blur;

      function currentFocusing(input) {
        if (input) {
          self._currentInput = input;
        } else {
          return self._currentInput;
        }
      }

      function blur() {
        self._currentInput = null;
      }
    };

    return new SoftInputs();
  }
})();