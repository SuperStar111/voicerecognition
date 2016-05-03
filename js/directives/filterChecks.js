;
(function() {
  'use strict';

  angular.module('soft').directive('filterChecks', FilterChecks);
  FilterChecks.$inject = [ '$log', '$modal' ];
  function FilterChecks($log, $modal) {
    return {
      restrict : 'A',
      link : function(scope, element, attrs) {
        var modal_class = 'sp-modal ';

        if (attrs.modalClass) {
          modal_class = modal_class + attrs.modalClass;
        }

        element.on('click', function(e) {
          if (attrs.ngDisabled == 'disabled') {
            return;
          }
          var modalInstance = $modal.open({
            templateUrl : 'templates/partials/popup/filter-popup.html',
            controller : Controller,
            animation : false,
            windowClass : modal_class,
          });

          modalInstance.result.then(function(selectedItem) {
            scope.selected = selectedItem;
          }, function() {
            $log.info('Modal dismissed at: ' + new Date());
          });
        });
      }
    };
  }

  Controller.$inject = [ '$scope', '$timeout', '$modalInstance', '$rootScope', '$filter', 'Checks', 'Modals', '$state', 'Service.Tables' ];
  function Controller($scope, $timeout, $modalInstance, $rootScope, $filter, Checks, Modals, $state, Tables) {
    var self = this;

    self.applyFilter = applyFilter;

    self.tables = Tables.getAll().then(function(tables) {
      self.tables = tables;
    });
    self.cancel = cancel;

    if ($rootScope.filterChecks) {
      self.filter = $rootScope.filterChecks;
    } else {
      self.filter = {
        closed_cb : 'no',
        table_cb : '',
        togo_cb : 'yes',
        delivery_cb : 'yes',
        phone_cb : '',
        orderfield : 'ord1.id',
        order : 'desc',
        filter_date : $rootScope.last_datetime
      };
    }

    self.yesNo = [ {
      field : 'yes',
      name : 'Yes'
    }, {
      field : 'no',
      name : 'No'
    } ];

    self.sortBy = [ {
      field : 'ord1.id',
      name : 'Check Number'
    }, {
      field : 'ord1.order_Status',
      name : 'Order Status'
    }, {
      field : 'lt.table_name',
      name : 'Table Name'
    }, {
      field : 'lt.location',
      name : 'Table Location'
    }, {
      field : 'emp.first_name',
      name : 'Employee'
    }, {
      field : 'ord1.order_total',
      name : 'Order Total'
    }, {
      field : 'cli.name',
      name : 'Client Name'
    } ];

    self.orderCriterias = [ {
      field : 'asc',
      name : 'Ascending'
    }, {
      field : 'desc',
      name : 'Descending'
    } ];

    $timeout(function() {
      $('#filter-date-wrapper').datetimepicker({
        // pickTime: false
        format : 'MM/DD/YYYY'
      });
    });

    function applyFilter() {
      self.filter.filter_date = $('#filter-date').val();
      // $rootScope.$broadcast('Filter Checks', {
      // filter : self.filter
      // });

      $rootScope.filterChecks = self.filter;

      Checks.getChecks(self.filter).then(function(result) {
        if (angular.isDefined(result.ResponseCode) && result.ResponseCode == 0) {
          Modals.alert(result.ResponseMessage);
        } else {
          if ($state.current.name == 'Home') {
            $rootScope.$broadcast('Filter Checks', {
              checklist : result
            });
          } else {
            $rootScope.onFilterChanged = $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
              $timeout(function() {
                $rootScope.$broadcast('Filter Checks', {
                  checklist : result
                });
              }, 1000);

              console.log($rootScope.onFilterChanged);
              // garbage
              $rootScope.onFilterChanged();
              console.log($rootScope.onFilterChanged);
            });

            $state.go('Home');
          }

          $modalInstance.close(self.filter);
        }
      },
      // fails
      function(err) {
        console.log(err);
      });
    }

    function cancel() {
      $modalInstance.dismiss('cancel');
    }

    $scope.filterChecksCtrl = self;
  }
})();