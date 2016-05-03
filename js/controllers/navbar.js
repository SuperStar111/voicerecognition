;
(function() {
  'use strict';

  angular.module('soft').controller('NavbarController', NavbarController);

  NavbarController.$inject = [ 'Users', '$state', 'Modals', 'Auth', '$window' ];
  function NavbarController(Users, $state, Modals, Auth, $window) {
    var self = this;

    self.logout = logout;

    self.currentUser = Users.currentUser();
    self.stateName = $state.current.name;
    self.gotoSignUp = gotoSignUp;

    function gotoSignUp() {
      $window.open('https://www.softpoint.us/sites/product%20sites/softpointcloud/', '_blank');
    }

    function logout() {
      Modals.openModal("Manager Log Out", 'templates/partials/logout-dialog.html', LogoutController);
    }

    LogoutController.$inject = [ 'message', '$modalInstance', '$scope', '$cookieStore', 'PaymentTypes' ];
    function LogoutController(title, $modalInstance, $scope, $cookieStore, PaymentTypes) {
      var logoutCtrl = this;

      logoutCtrl.title = title;
      logoutCtrl.processingLogout = false;

      logoutCtrl.logout = logout;
      logoutCtrl.close = close;

      function close() {
        $modalInstance.dismiss('cancel');
      }
      ;

      function logout($event) {
        $event.preventDefault();

        if (!logoutCtrl.pass_out) {
          var msg = "Please Enter Password!";
          $modalInstance.dismiss('cancel');

          Modals.alert(msg, function() {
            Modals.openModal("Manager Log Out", 'templates/partials/logout-dialog.html', LogoutController);
          });

          return;
        } else {
          logoutCtrl.processingLogout = true;

          Auth.emplogout(logoutCtrl.pass_out).then(function(result) {
            $modalInstance.dismiss('cancel');

            if (result["Response Code"] == "a" || result["Response Code"] == "1" || result["Response Code"] == "2") {

              Modals.alert(result["Response Message"], function() {
                Modals.openModal("Manager Log Out", 'templates/partials/logout-dialog.html', LogoutController);
              });

            } else if (result["Response Code"] == 0) {

              $cookieStore.put("islogedId", "nop");
              $cookieStore.put("isloged", "nop");

              PaymentTypes.paymentTypes = [];
              $state.go('Login');
            }
          }, function(response) {
            console.log(response);
          });
        }
      }

      $scope.logoutCtrl = logoutCtrl;
    }
  }
})();