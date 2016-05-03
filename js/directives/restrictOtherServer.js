;
(function() {
  'use strict';

  angular.module('soft').directive('restrictOtherServer', RestrictOtherServer);

  RestrictOtherServer.$inject = [ 'Users', 'Modals' ];
  function RestrictOtherServer(Users, Modals) {
    return {
      restrict : 'A',
      priority: 100,
      link : function(scope, element, attrs) {
        if (!Users.allowUpdateOtherServer) {
          element.click(function(event) {
            if (attrs.restrictOtherServer != Users.currentUser().empid) {
              event.stopPropagation();
              event.preventDefault();
              Modals.alert("You are not authorized to update other server's checks.");
            }
          });
        }
      }
    };
  }
})();