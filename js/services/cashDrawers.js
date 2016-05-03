;
(function() {
  'use strict';

  angular.module('soft').service('Service.CashDrawers', CashDrawers);

  CashDrawers.$inject = [ '$q', '$http', '$rootScope', 'apiURL', '$cookieStore', '$timeout', 'Modals' ];
  function CashDrawers($q, $http, $rootScope, apiURL, $cookieStore, $timeout, Modals) {
    var CashDrawers = function() {
      var self = this;

      self.update = update;
      self.print = print;

      function update(type, orderID) {
        var deferred = $q.defer();

        var url = apiURL + "api/POSPoint2/update_open_drawer.php";
        var data = {
          location_id : $cookieStore.get("location"),
          open_type : type,
          open_on : created_on,
          open_by : $cookieStore.get("empid"),
          token : generatetoken()
        };

        if (orderID) {
          data['order_id'] = orderID;
        }

        var options = {
          url : url + '?' + $.param(data),
          method : 'GET'
        };

        $rootScope.myPromise = $http(options).success(function(result) {
          deferred.resolve(result);
        }).error(function(data, status) {
          deferred.reject(data);
        });

        return deferred.promise;
      }

      function print() {
        if (!self.alreadyOpened) {
          self.alreadyOpened = true;

          $timeout(function() {
            self.alreadyOpened = false;
          }, 3000);

          var printerName = 'Register Printer;';

          if (document.jzebra && document.jzebra.findPrinter) {
            document.jzebra.findPrinter(printerName);
            if (!document.jzebra.getPrinter()) {
              console.log('Printer ' + printerName + ' not found, using default one.');
              document.jzebra.findPrinter();
            }

            console.log('Opening drawer');
            document.jzebra.append(chr(27) + "\x70" + "\x30" + chr(25) + chr(25) + "\r");
            document.jzebra.print();
          } else {
            Modals.alert("Please allow Java to have Cash Drawer work.");
            $rootScope.$broadcast("REINIT CASH DRAWER");
          }

        }
      }

      function chr(i) {
        return String.fromCharCode(i);
      }

    };

    return new CashDrawers();
  }
})();