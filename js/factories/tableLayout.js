;
(function() {
  'use strict';

  angular.module('soft').factory('TableLayout', TableLayout);

  TableLayout.$inject = [ 'BaseObject' ];
  function TableLayout(BaseObject) {
    var TableLayout = function(object) {
      var self = angular.extend(this, new BaseObject(object));
      
      self.name = name;
      
      function name() {
        return self.data['table_name'];
      }
    };

    return TableLayout;

  }
})();