;
(function() {
  'use strict';

  angular.module('soft').controller('ReportsController', ReportsController);

  ReportsController.$inject = [ '$scope', '$rootScope', '$cookieStore', '$http', '$sce', 'Users', 'Reports', 'Modals',
      '$state' ];
  function ReportsController($scope, $rootScope, $cookieStore, $http, $sce, Users, Reports, Modals, $state) {
    var self = this;

    self.user = Users.currentUser();

    self.isAmountField = isAmountField;

    self.apis = {};

    self.predefinedFields = {
      amount : 'Amount',
      average_amount : 'Average Amount',
      order : 'Order',
      type : 'Type',
      check_number : 'Check Number',
      cash_received : 'Cash Received',
      terminal : 'Terminal',
      opened_by : 'Opened By',
      opened_on : 'Opened On',
      opened_datetime : 'Opened Date & Time',
      'opened_date_&_time' : 'Opened Date & Time',
      'check_#' : 'Check #',
      number_of_covers : 'Number of Covers',
      number_of_orders : 'Number of Orders',
      time : 'Time',
      revenue : 'Revenue',
      client : 'Client',
      covers : 'Covers',
      'date_&_time' : 'Date & Time',
      server : 'Server',
      source_of_business : 'Source of Business',
      status : 'Status',
      total : 'Total',
      gratuity_amount : 'Gratuity Amount',
      counts : 'Counts',
      count : "Count",
      menu_article : 'Menu Article',
      employee : 'Employee',
      payment_type : 'Payment Type'
    };

    function isAmountField(field) {
      return [ 'amount', 'average_amount', 'gratuity_amount', 'revenue', 'total' ].indexOf(field) != -1;
    }

    if (!self.user.allowAccessPosReports) {
      Modals.alert("You are not authorized to access Reports.", function() {
        $state.go('Home');
      });
      return;
    }

    // trust content from api as safe html
    self.getTrustedHtml = getTrustedHtml;
    // apply filter on report table
    self.applyFilter = applyFilter;
    // on change dropdown, update report content
    self.updateSelectedReport = updateSelectedReport;
    self.reportTypes = [];

    // filter types
    self.filterTypes = [ 'filter_date=', 'filter_emp_id=', 'filter_from_date=', 'filter_to_date=', 'menu',
        'filter_display=' ];

    // report types

    self.reportHeaders = {};

    function updateSelectedReport($event) {
      if ($event) {
        $event.preventDefault();
      }

      resetFilter();
      self.applyFilter();
    }

    // convert report table headers to title case
    function toTitleCase(str) {
      if (str.indexOf('Datetime') > 0) {
        str = str.replace('Datetime', 'Date & Time');
      }
      return str.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    }

    init();
    // initialize reports page content
    function init() {
      Reports.getReportTypeList().then(function(result) {
        angular.forEach(result, function(report, key) {
          var api = Reports.parse(report.api);
          self.apis[report.name] = api;

          // for ( var filter in self.filterTypes) {
          // if (api.params.indexOf(filter) != -1) {
          //
          // }
          // }
        });

        self.reportTypes = result;

        self.selectedReport = self.reportTypes[0];

        // reset filter to default before applying filter
        resetFilter();

        self.applyFilter();
      }, function(err) {
        console.log(err);
      });

      // reports page initialization setup

      $scope.server_first_name = $cookieStore.get("server_first_name");

      self.serverTime = $rootScope.serverTime;
      self.serverTime = self.serverTime.replace(new RegExp('-', 'g'), '/');
      self.serverTime = self.serverTime.replace(/([\d]{2})\:([\d]{2})\:[\d]{2}/, "$1\:$2");

      self.location = $rootScope.location;

      resetFilter();

    }

    function resetFilter() {
      self.filterCriteria = {};

      self.filterCriteria.fromdate = new Date(self.serverTime);
      self.filterCriteria.todate = new Date(self.serverTime);
      self.filterCriteria.date = new Date(self.serverTime);
      self.filterCriteria.type = 'Summary';
      // self.filterCriteria.empid = $cookieStore.get("empid");
    }

    function getTrustedHtml(data) {
      return $sce.trustAsHtml(data + "");
    }

    function applyFilter() {

      // call api-report to apply filter
      // $scope.showTable = false;
      self.currentAPI = self.apis[self.selectedReport.name];

      Reports.applyFilter(self.selectedReport, self.filterCriteria).then(function(data) {

        self.reportName = data.report_name;

        if (angular.isDefined(data.ResponseCode) && data.ResponseCode == 0) {
          self.reportData = null;
          self.message = data.ResponseMessage;
        } else {
          switch (data.report_name) {
            case 'All Day Sales':
              self.reportData = transformAllDaySales(data.results);
              break;
            default:
              self.reportData = transformReportData(data.results);
              break;
          }

          if (data.report_name == 'Money / Item Sales Distribution') {
            var predefinedHeadings = [ 'Paid Out Report', 'Item Sales Report', 'Server Void Report' ];

            var cnt = 0;
            angular.forEach(self.reportData, function(section, key) {
              if (predefinedHeadings[cnt]) {
                section.heading = predefinedHeadings[cnt];
                cnt++;
              }

            });
          }

          // TODO need to update once we integrate other reports
          self.reportName = self.selectedReport.name;
        }

      },
      // fails
      function(err) {
        console.log(err);
      });
    }

    function getHeadersFromFields(obj) {
      var headers = [];
      angular.forEach(obj, function(value, field) {
        if (self.predefinedFields[field]) {
          headers.push({
            key : field,
            title : self.predefinedFields[field]
          });
        }
      });

      return headers;
    }

    function transformData(data) {
      var out = {};
      if (angular.isArray(data) && data.length > 0) {
        out.headers = getHeadersFromFields(data[0]);
        out.items = data;
      }

      return out;
    }

    function transformAllDaySales(data) {
      var sections = {};

      sections.primary = transformData(data.primary);
      sections.refunds_and_pay_outs = transformData(data.refunds_and_pay_outs);

      return sections;
    }

    function transformReportData(data) {
      var sections = {};

      var detailField = getDetailFieldName();

      if (angular.isArray(data)) {
        var newArr = new Array();

        angular.forEach(data, function(value, key) {
          if (self.filterCriteria.type == 'Detail') {
            value.detail = {
              items : getItemDetail(value)
            };

            if (value.detail.items.length > 0) {
              value.detail.headers = getHeadersFromFields(value[detailField][0]);
            }
          }

          newArr.push(value);
        });

        sections.main = transformData(newArr);

      } else {
        angular.forEach(data, function(value, key) {
          if (self.filterCriteria.type == 'Detail') {
            value.detail = {
              items : getItemDetail(value)
            };

            if (value.detail.items.length > 0) {
              value.detail.headers = getHeadersFromFields(value[detailField][0]);
            }
          }

          sections[key] = transformData(value);

          console.log(value);
        });
      }

      return sections;
    }

    function getItemDetail(item) {
      var ret = new Array();
      var detailField = getDetailFieldName();

      angular.forEach(item[detailField], function(value, key) {
        ret.push(value);

      });

      return ret;
    }

    function getDetailFieldName() {
      switch (self.reportName) {
        case 'Payment Details':
          return 'orders';
          break;
        default:
          return 'content';
          break;
      }
    }

  }
})();
