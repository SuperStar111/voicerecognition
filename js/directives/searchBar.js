;
(function() {
  'use strict';

  angular.module('soft').directive('searchBar', SearchBar);

  SearchBar.$inject = [];
  function SearchBar() {
    var ret = {
      restrict : 'A',
      transclude : false,
      templateUrl : 'templates/partials/search-bar.html',
      controller : Controller,
      link : function(scope, element, attrs, modelCtrl) {

      }
    };

    return ret;
  }

  Controller.$inject = [ '$scope', '$rootScope', '$state', 'Checks', 'Service.CashDrawers', 'Modals', 'Service.Sections' ];
  function Controller($scope, $rootScope, $state, Checks, CashDrawers, Modals, Sections) {
    var self = this;
    self._currentTab = null;
    self.isFullLayout = false;

    self.showTab = showTab;
    self.isTab = isTab;
    self.goHome = goHome;
    self.isHome = isHome;
    self.showSection = showSection;
    self.showLayout = showLayout;
    self.noSale = noSale;

    $scope.clearText = function() {
      $scope.searchText = '';
    };

    function showTab(tab) {
      self._currentTab = tab;
    }
    function isTab(tab) {
      return (self._currentTab == tab);
    }

    function isHome() {
      return $state.current.name == 'Home' && ([ 'general', 'section' ].indexOf($rootScope.layout) == -1);
    }

    function goHome($event) {
      if ($rootScope.isEmployeeOut) {
        $event.preventDefault();

        Modals.alert("User must punch in before using POSPoint.");
        return;
      }

      $state.go('Home');
      $rootScope.layout = 'home';
      self.showTab('home');

    }
    
    Sections.getAll().then(function(sections) {
      self.sections = sections;
    });

    function showSection(sectionID, $event) {
      if (angular.isDefined($event))
        $event.preventDefault();

      if ($state.current.name != 'Home') {
        $state.go('Home.SectionLayout', {
          id : sectionID
        }, {}, {
          reload : true
        });
      } else {
        $rootScope.sectionID = sectionID;
        $rootScope.layout = 'section';

      }
    }

    function showLayout() {

      if ($state.current.name != 'Home') {
        $state.go('Home.GeneralLayout');
      } else {
        $rootScope.sectionID = '';
        $rootScope.layout = 'general';

      }
    }

    $scope.$on('Section Layout Loaded', function(event, data) {
      self.isFullLayout = (data.result.fullpage.toLowerCase() === 'yes' || data.result.fullpage === true);
    });

    $scope.$on('Full Layout Loaded', function(event, data) {
      self.sectionStats = data['section-stats'];
    });

    function noSale($event) {
      if ($rootScope.isEmployeeOut) {
        $event.preventDefault();

        Modals.alert("User must punch in before using POSPoint.");
        return;
      }

      var check = Checks.currentCheck();
      var type = 'No Sale';

      var checkID = '';
      if (check && [ 'CheckDetail', 'CheckDetailWithTab', 'Checks' ].indexOf($state.current.name) != -1) {
        checkID = check.getId();
      }

      CashDrawers.update(type, checkID).then(function(response) {
        Modals.alert("<div style='font-size:72px;'>" + response.ResponseMessage + "</div>", function() {
        }, {
          html : true,
          title : ""
        });

        if (!self.enableCashDrawer) {
          $rootScope.enableCashDrawer = true;
        }
      }, function(err) {
        console.log(err);
      });
    }

    $scope.searchBarCtrl = self;
  }
  ;
})();