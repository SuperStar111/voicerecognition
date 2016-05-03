;
(function() {
  'use strict';

  angular.module('soft').controller('HomeController', HomeController);

  HomeController.$inject = [ '$scope', 'Checks', 'Order', 'Orders', '$cookieStore', 'Modals', '$rootScope', '$state', '$stateParams', 'Check', 'Users', '$window' ];
  function HomeController($scope, Checks, Order, Orders, $cookieStore, Modals, $rootScope, $state, $stateParams, Check, Users, $window) {
    var self = this;

    self.checklist = null;

    self.loadCheckDetails = loadCheckDetails;
    self.printCheck = printCheck;
    self.activeCheck = activeCheck;
    self.viewPayment = viewPayment;
    self.reopen = reopen;

    $scope.$watch('searchText', function(query) {
      try {
        $scope.counted = $filter("filter")($scope.checklist, query).length;
      } catch (e) {

      }
    });

    // reset filter
    $rootScope.filterChecks = null;

    init();

    var cleanUpFunc = $rootScope.$on('Filter Checks', function(event, data) {
      var result = data.checklist;

      self.checklist = result["listorder"];
      self.counted = !self.checklist ? 0 : self.checklist.length;

      if (self.counted == 0) {
        self.counted = "create";
      }

      if (self.checklist.length > 0) {
        self.loadCheckDetails(self.checklist[0], 0, null, function() {
          $rootScope.layout = 'check detail';
        });
      }
    });

    var cleanupLayoutSectionChange = $rootScope.$on('Layout Section Width Changed', function(event, data) {
      var rightBlockWidth = $('.right-block').width();

      $('#blocks-container').css('padding-right', rightBlockWidth + 30 + 'px');
    });

    $scope.$on('$destroy', function() {
      cleanUpFunc();
      cleanupLayoutSectionChange();
      $rootScope.layout = null;
    });

    $scope.$on('$locationChangeSuccess', function(a, b, c, d, e) {
      if (self.isBackToHome) {
        //$cookieStore.put('reloadhome', 'yes');
        // $window.location.reload(true);
      }
    });

    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
      if (fromState.name != 'EmployeeLogin' && fromState.name != '' && toState.name == 'Home') {
        //self.isBackToHome = true;
        //event.preventDefault();
      }

      if ([ 'Home.SectionLayout', 'Home.GeneralLayout' ].indexOf(toState.name) != -1) {
        if (toParams.id > 0) {
          $rootScope.sectionID = toParams.id;
          $rootScope.layout = 'section';

          $rootScope.appState.setState('Home.SectionLayout');
        } else {
          $rootScope.sectionID = '';
          $rootScope.layout = 'general';

          $rootScope.appState.setState('Home.GeneralLayout');
        }
      }

    });

    function init() {
      $cookieStore.put('reloadhome', 'no');

      $rootScope.appState.setState('home');

      Checks.getChecks().then(function(result) {
        self.checklist = result["listorder"];
        self.counted = self.checklist.length;

        if (self.counted == 0) {
          self.counted = "create";
        }

        if (self.checklist.length > 0) {
          self.loadCheckDetails(self.checklist[0], 0, null, function() {
            // $rootScope.layout = 'check detail';
          });
        }
        // $scope.loadCheckDetails($scope.checklist[0].id, 0,
        // result["listorder"][0]["order_Status"]);
      },
      // fails
      function(err) {
        console.log(err);
      });
    }

    function loadCheckDetails(item, index, $event, callback) {
      self.currentPreviewCheck = item;

      if ($event) {
        $event.stopPropagation();
      }

      self.currentCheckedIndex = index;

      self.checkStatus = item.order_Status;
      self.loadCheckDetail = true;

      $('#loader-ajax').show();

      if ($(window).width() < 990) {
        self.smallDevice = true;
        item.selected = !item.selected;
        self.showingDetail = !self.showingDetail;

        // $scope.right_bloc_hide = $scope.right_bloc_hide ? false : true;
        // $('.left-bloc-list').eq(index).insertBefore('.left-bloc-list:first-child');
      }

      item.orderStatus = item.order_Status;

      Orders.getOrderDetail(item).then(function(result) {
        $('#loader-ajax').hide();

        self.order = result.order;

        if (Checks.currentCheck()) {
          Checks.currentCheck().currentOrder(self.order);
        } else {

        }

        if (typeof callback == 'function') {
          callback();
        }
      }, function(err) {
        console.log(err);
      });
    }

    function printCheck(check) {
      Checks.printCheck(check).then(function(result) {
        Modals.alert(result['response_message']);
      }, function(err) {
        console.log(err);
      });
    }

    function activeCheck(index) {
      return index === self.currentCheckedIndex ? 'active' : '';
    }

    function viewPayment(item, $event) {
      $event.stopPropagation();
      if (!Users.allowUpdateOtherServer) {
        if (item.server_id != Users.currentUser().empid) {
          Modals.alert("You are not authorized to update other server's checks.", function() {
          });
          return;
        }
      }

      if (item.order_Status.toUpperCase() == 'CANCELLED') {
        $event.stopPropagation();

        Modals.alert("A cancelled check can not be modified.");
        return;
      }

      $state.go('CheckDetailWithTab', {
        'id' : item.id,
        'tab' : 'payment'
      });
    }

    $scope.$watch(function() {
      return $rootScope.layout;
    }, function() {
      if ([ 'general', 'section' ].indexOf($rootScope.layout) != -1) {
        self.isLayoutView = true;

      } else {
        self.isLayoutView = false;
        $('#blocks-container').css('padding-right', '');
      }
    });

    function reopen(check, $event) {
      $event.preventDefault();

      Modals.confirm("Are you sure you wish to Reopen this check?", function() {
        Orders.reopen(check.id).then(function(result) {
          Modals.alert(result.ResponseMessage, function() {
            $state.go('Home', {}, {
              reload : true
            });
          });

        }, function(er) {
          console.log(err);
        });
      });

    }

  }
})();