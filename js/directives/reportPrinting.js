;
(function() {
  'use strict';

  angular.module('soft').directive('reportPrinting', ReportPrinting);

  ReportPrinting.$inject = [];
  function ReportPrinting() {
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

  Controller.inject = [ '$element', '$scope', '$http', '$compile', '$timeout', '$window', '$sce' ];
  function Controller($element, $scope, $http, $compile, $timeout, $window, $sce) {
    $element.bind('click', print);

    $scope.getTrustedHtml = function(data) {
      return $sce.trustAsHtml(data + "");
    };
    
    $scope.isAmountField = function(field) {
      return [ 'amount', 'average_amount', 'gratuity_amount', 'revenue', 'total' ].indexOf(field) != -1;
    };

    function print() {
      console.log($scope.data);
      console.log($scope.headers);

      var tpl = 'templates/partials/report-printing.html';
      $http.get(tpl).then(function(response) {
        var content = $compile(response.data)($scope);
        $timeout(function() {
          var newWin = $window.frames["printf"];
          newWin.document.write('<head>');
          newWin.document.write('<link href="css/stylesheet.css" type="text/css" rel="stylesheet" media="all" />');
          newWin.document.write('<link href="css/bootstrap.min.css" rel="stylesheet">');
          newWin.document.write('<link href="css/jquery-ui.min.css" rel="stylesheet">');
          newWin.document.write('<link href="css/common.css" rel="stylesheet">');
          newWin.document.write('<link href="css/reports.css" rel="stylesheet">');
          newWin.document.write('<link href="css/print.css" rel="stylesheet">');
          newWin.document.write('</head>');
          newWin.document.write('<body onload="window.print()" >' + content.html() + '</body>');
          newWin.document.close();
        }, 200);
      });

    }
  }
})();