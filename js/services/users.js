;
(function() {
  'use strict';

  angular.module('soft').service('Users', Users);

  Users.$inject = [ '$q', '$http', '$cookieStore', 'apiURL' ];
  function Users($q, $http, $cookieStore, apiURL) {
    var Users = function() {
      var self = this;
      self.data = null;

      self.currentUser = currentUser;
      self.store = store;

      function currentUser() {
        var user = {
          fullname : $cookieStore.get("fullname"),
          location : $cookieStore.get("location"),
          password : $cookieStore.get("password"),
          username : $cookieStore.get("username"),
          allowAdjustment : $cookieStore.get('global_allow_server_adjustment') == 'yes',
          allowDiscount : $cookieStore.get('allow_server_discount') && $cookieStore.get('allow_server_discount').toLowerCase() == 'yes',
          empid : $cookieStore.get("empid")
        };

        var firstname = "";

        if (!!user.fullname) {
          firstname = user.fullname.substring(0, user.fullname.indexOf(" "));
        }

        user.firstname = firstname;
        user.allowAccessPosReports = self.allowAccessPosReports;
        user.allowUpdateOtherServer = self.allowUpdateOtherServer;

        return user;
      }

      // store user information
      function store(data) {
        self.data = data;
        for ( var prop in data) {
          $cookieStore.put(prop, data[prop]);
        }
      }
    };

    return new Users();
  }
})();