(function() {
  'use strict';

  angular.module('soft').factory('ModifierOrderItem', ModifierOrderItem);

  ModifierOrderItem.$inject = [ 'BaseObject' ];
  function ModifierOrderItem(BaseObject) {
    var ModifierOrderItem = function(object) {
      var self = angular.extend(this, new BaseObject(object));

      self.getText = getText;
      self.total = total;

      function getText() {
        var parts;

        parts = [];
        var quantity = parseFloat(self.data['quantity']);
        parts.push(quantity != 1 ? self.data['quantity_fraction'] : "");

        var modifier_type = self.data['modifier_type'] == 'EXTRA' ? 'XT' : '';
        if (!!modifier_type) {
          parts.push(modifier_type);
        }
        
        parts.push(!!self.data['modifier_name'] ? self.data['modifier_name'] : self.data['special_instruction']);

        return parts.join(' ');
      }

      function total() {
        return self.data['modifier_total'];
      }
    };

    return (ModifierOrderItem);
  }
})();