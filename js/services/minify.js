;
(function() {
  'use strict';

  angular.module('soft').service('Minify', Minify);

  function Minify() {
    var fn = function() {
      var self = this;

      self.filterFields = filterFields;

      function filterFields(entities, allowedFields) {
        angular.forEach(entities, function(entity, index) {
          var tmp = {};

          for ( var field in entity) {
            if (allowedFields.indexOf(field) != -1) {
              tmp[field] = entity[field];
            }
          }

          entities[index] = tmp;
        });
      }
    };

    return new fn();
  }

  Minify.$inject = [];
})();