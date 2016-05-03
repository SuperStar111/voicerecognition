;
(function() {
  'use strict';

  angular.module('soft').factory('EmployeeMessage', EmployeeMessage);

  EmployeeMessage.$inject = [ 'BaseObject' ];
  function EmployeeMessage(BaseObject) {
    var EmployeeMessage = function(object) {
      var self = angular.extend(this, new BaseObject(object));

      self.hasSeen = hasSeen;
      self.seenText = seenText;
      self.senderName = senderName;

      function hasSeen() {
        return self.data['seen_date'] !== null;
      }

      function seenText() {
        return hasSeen() ? 'Read ' + self.data['seen_date'] + ' ' + self.data['seen_time'] : "";
      }

      function senderName() {
        // if (self.data['first_name'] != null) {
        // return [ self.data['first_name'], self.data['last_name'] ].join(' ');
        // } else {
        // return self.data['name'];
        // }
        return self.data['name'];
      }
    };

    return EmployeeMessage;
  }
})();