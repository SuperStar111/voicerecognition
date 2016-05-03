;
(function() {
  'use strict';

  angular.module('soft').directive('saveReport', SaveReport);

  SaveReport.$inject = [];
  function SaveReport() {
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

  Controller.inject = [ '$element', '$scope', '$http', '$compile', '$timeout', '$window', '$sce', 'apiURL' ];
  function Controller($element, $scope, $http, $compile, $timeout, $window, $sce, apiURL) {
    $element.bind('click', print);

    $scope.getTrustedHtml = function(data) {
      return $sce.trustAsHtml(data + "");
    };

    $scope.isAmountField = function(field) {
      return [ 'amount', 'average_amount', 'gratuity_amount', 'revenue', 'total' ].indexOf(field) != -1;
    };

    function print() {
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
        headers : $scope.headers
      };

      var url = apiURL + 'api/pospoint2/Reports/report2pdf.php';
      // var url = 'http://localhost:8002/api/report/report2pdf.php';
      var options = {
        responseType : 'arraybuffer'

      };

      $http.post(url, data, options).success(function(response) {
        var blob = new Blob([ response ], {
          // type : "text/html"
          type : "application/pdf"
        });
        var objectUrl = URL.createObjectURL(blob);
        window.open(objectUrl);
      }, function(err) {
        console.log(err);
      });
    }
  }
})();