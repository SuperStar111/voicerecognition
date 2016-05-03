;
(function() {
  'use strict';

  angular.module('soft').factory('LoginSession', LoginSession);

  LoginSession.$inject = [ 'BaseObject' ];
  function LoginSession(BaseObject) {
    var LoginSession = function(object) {
      var self = angular.extend(this, new BaseObject(object));

      init();

      function init() {

      }
    };

    return LoginSession;
  }
})();