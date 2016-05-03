;
(function() {
  'use strict';

  angular.module('soft').factory('Schedule', Schedule);

  Schedule.$inject = [ 'BaseObject' ];
  function Schedule(BaseObject) {
    var Schedule = function(object) {
      var self = angular.extend(this, new BaseObject(object));

      self.date = date;
      self.title = title;

      function date() {
        return self.data[8];
      }
      ;

      function title() {
        return [ self.data[4], self.data[5] ].join(' - ') + ' ' + self.data[0];
      }
    };

    return Schedule;
  }
})();