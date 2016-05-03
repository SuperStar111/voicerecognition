;
(function() {
  'use strict';

  angular.module('soft').factory('Table', Table);

  Table.$inject = [ 'BaseObject' ];
  function Table(BaseObject) {
    var Table = function(object) {
      var self = angular.extend(this, new BaseObject(object));

      self.displayName = displayName;

      function displayName() {
        return self.data['table_display_name'];
      }
    };

    return Table;

  }
})();