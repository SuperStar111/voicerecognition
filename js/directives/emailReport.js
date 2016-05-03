;
(function() {
  'use strict';

  angular.module('soft').directive('emailReport', EmailReport);

  EmailReport.$inject = [];
  function EmailReport() {
    return {
      restrict : 'A',
      scope : {
        data : '=filteredData',
        headers : '=headers',
        selectedReport : '=selectedReport',
        location : '=location',
        user : '=user',
        serverTime : '=serverTime'
      },
      controller : Controller
    };
  }

  Controller.inject = [ '$element', '$scope', '$http', '$compile', '$timeout', '$window', '$sce', 'apiURL', '$modal' ];
  function Controller($element, $scope, $http, $compile, $timeout, $window, $sce, apiURL, $modal) {
    $element.bind('click', popup);

    $scope.getTrustedHtml = function(data) {
      return $sce.trustAsHtml(data + "");
    };

    $scope.isAmountField = function(field) {
      return [ 'amount', 'average_amount', 'gratuity_amount', 'revenue', 'total' ].indexOf(field) != -1;
    };

    function popup(callback, options) {
      var boxOptions = {
        templateUrl : 'templates/partials/popup/send-report.html',
        controller : [ '$scope', '$modalInstance', 'callback', 'options', '$sce', function($scope, $modalInstance, callback, options, $sce) {
          $scope.title = "Send Report";

          if (options && options.html) {
            $scope.html = true;
            $scope.message = $sce.trustAsHtml($scope.message);
          }

          if (options && options.title) {
            $scope.title = options.title;
          }

          $scope.close = function($event) {
            if ($event) {
              $event.preventDefault();
            }
            
            $modalInstance.dismiss('cancel');

            if (typeof callback == "function") {
              callback();
            }
          };
          
          $scope.sendReport = function() {
            sendPDF($scope.report);
          };
          
        } ],
        resolve : {
          callback : function() {
            return callback;
          },
          options : function() {
            return options;
          }
        }
      };

      if (options && options.styles && options.styles.windowClass) {
        if (options.styles.windowClass != 'zIndex12000') {
          options.styles.windowClass += ' zIndex12000';
        }
      } else if (options && options.styles) {
        options.styles.windowClass = 'zIndex12000';
      } else if (options) {
        options.styles = {
          windowClass : 'zIndex12000'
        };
      } else {
        options = {
          styles : {
            windowClass : 'sp-modal zIndex12000'
          }
        };
      }

      boxOptions.windowClass = options.styles.windowClass;

      $modal.open(boxOptions);
    }

    function sendPDF(email) {
      var data = {
        user : {
          fullname : $scope.user.fullname,
          username : $scope.user.username
        },
        location : {
          name : $scope.location.name,
          id : $scope.location.id
        },
        report : {
          name : $scope.selectedReport.name,
          datetime : $scope.serverTime
        },
        data : $scope.data,
        headers : $scope.headers,
        email: email
      };

      var url = apiURL + 'api/pospoint2/Reports/report2pdf.php';
      // var url = 'http://localhost:8002/api/report/report2pdf.php';
      var options = {
        responseType : 'arraybuffer'

      };

      $http.post(url, data, options).success(function(response) {
        var blob = new Blob([ response ], {
           type : "text/html"
//          type : "application/pdf"
        });
        var objectUrl = URL.createObjectURL(blob);
        window.open(objectUrl);
      }, function(err) {
        console.log(err);
      });
    }
  }
})();