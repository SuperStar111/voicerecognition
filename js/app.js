var created_on = "POSPoint Browser";
var d = new Date();
;
(function() {

  'use strict';

  angular.module('soft', [ 'ui.bootstrap', 'ngCookies', 'ui.router', 'ngStorage', 'cgBusy', 'mj.scrollingTabs', 'ngIdle', 'angular-linq', 'digestHud' ]);
  angular.module('soft').config([ 'KeepaliveProvider', 'IdleProvider', function(KeepaliveProvider, IdleProvider) {
    IdleProvider.idle(5);
    IdleProvider.timeout(60);
    KeepaliveProvider.interval(10);
  } ]).config([ '$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('TerminalInterceptor');
  } ]);

  angular.module('soft').run(InitApplication);

  InitApplication.$inject = [ '$rootScope', '$location', '$cookieStore', '$cookies', '$timeout', 'Preferences', '$localStorage', 'OrderItemMenu', 'PaymentTypes', 'siteURL',
    '$state', 'Service.AppState', 'Users', '$window', 'Modals', 'Service.Terminals', '$document', 'ENV', '$sessionStorage', 'indexedDBService' ];
  function InitApplication($rootScope, $location, $cookieStore, $cookies, $timeout, Preferences, $localStorage, OrderItemMenu, PaymentTypes, siteURL, $state, AppState, Users,
    $window, Modals, Terminals, $document, ENV, $sessionStorage, indexedDBService) {

    $rootScope.siteURL = siteURL;
    $rootScope.appState = AppState;

    $rootScope.idleKickTimeout = 60;

    $rootScope.$on('POSLoaded', function(event, data) {
      $rootScope.posReady = true;

      if (data) {
        // $localStorage.pos = data.pos;
      }

      indexedDBService.open().then(function() {
        PaymentTypes.parse(null);
      }, function(err) {
        console.log(err);
      });

      setRootVariables(data);

      $rootScope.$broadcast('ROOTSCOPE READY');
    });

    $rootScope.$on('DO LOAD ORDER MENU', function() {
      setRootTime();

      if ($rootScope.actualLocalTime) {
        OrderItemMenu.parse(null, $rootScope.actualLocalTime);
      }
    });

    setRootTime();
    setUserInfoFromCookies();

    if ($cookieStore.get("location") && $location.$$path != '/test') {
      loadpos();
    }

    // load terminal ID if existed
    var terminalID = $cookies['Terminal_id'];
    var terminalLocationID = $cookies['CRLocatoinID'];

    if (terminalID) {
      if (terminalLocationID && terminalLocationID == $cookieStore.get("location")) {
        Terminals.currentID(terminalID);
      }
    }

    $rootScope.$on("POS NOT UP TO DATE", function(event, data) {
      loadpos(true);
    });

    $rootScope.enableCashDrawer = true;
    // $rootScope.$on('REINIT CASH DRAWER', function() {
    // $rootScope.enableCashDrawer = false;
    // $timeout(function() {
    // $rootScope.enableCashDrawer = true;
    // }, 1000);
    // });

    $window.onbeforeunload = function() {
      // handle the exit event
      console.log('exit event');
    };

    Preferences.getPreferences().then(function(preferences) {
      $rootScope.preferences = preferences;

      $rootScope.$broadcast('PREFERENCES LOADED', {
        preferences : preferences
      });
    },
    // fails
    function(err) {
      console.log(err);
    });

    Preferences.getClientInfo().then(function(result) {
      $rootScope.clientIP = result.ip;
    });

    // if ($localStorage.pos) {
    // $rootScope.symbol = $localStorage.pos["location"]["currency_symbol"];
    // PaymentTypes.parse($localStorage.pos.payments);
    //
    // setRootVariables();
    // }

    function loadpos() {
      Preferences.loadpos().then(function(result) {

      }, function(response) {
        console.log(response);
      });
    }

    function setRootVariables(data) {
      $rootScope.global_modifiers = data.pos.global_modifiers;
      $rootScope.location = data.pos.location;

      $rootScope.lastUpdated = data.pos.last_update;
      $rootScope.symbol = data.pos["location"]["currency_symbol"];

      $rootScope.isEmployeeOut = ($cookieStore.get("is_employee_out") == 'out');

      $rootScope.$broadcast('DO LOAD ORDER MENU');
    }

    $rootScope.$on('PUNCHED OUT', function() {
      $rootScope.isEmployeeOut = true;
      $cookieStore.put("is_employee_out", 'out');
    });
    $rootScope.$on('PUNCHED IN', function() {
      $rootScope.isEmployeeOut = false;

      $cookieStore.put("is_employee_out", 'in');
    });

    function setUserInfoFromCookies() {
      Users.allowAccessPosReports = ($cookieStore.get('access_pos_reports') + "").toUpperCase() == 'YES';
      Users.allowUpdateOtherServer = ($cookieStore.get('update_other_server') + "").toUpperCase() == 'YES';
    }

    function setRootTime() {
      $rootScope.actualLocalTime = $cookieStore.get('actualLocalTime');
      $rootScope.last_datetime = $cookieStore.get('last_datetime');
      $rootScope.serverTime = $cookieStore.get('serverTime');

      $rootScope.clientTime = new Date($cookieStore.get('clientTime'));
    }

    $rootScope.$on('$routeChangeStart', function(event, next, current) {

      var islog = $cookieStore.get("isloged");
      var islogedId = $cookieStore.get("islogedId");
      if ($location.path() == "/login")
        return;

      if (islog == "nop")
        window.location.href = "#/login";
      if (islogedId == "nop")
        window.location.href = "#/employeelogin";

    });

    $rootScope.$on('Actual Local Time Loaded', function() {
      setRootTime();

      if ($rootScope.actualLocalTime) {
        OrderItemMenu.parse(null, $rootScope.actualLocalTime);
      }

    });

    $rootScope.$on('$routeChangeStart', function(event) {

      try {
        if ($location.path() == "/employeelogin") {
          document.getElementById("password_id").focus();
        }
      } catch (e) {
        console.log(e);
      }
    });

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {

    });

    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
      if (!fromState.name && !$rootScope.isNotRefresh && [ 'Login', 'EmployeeLogin' ].indexOf(toState.name) == -1) {
        $rootScope.isNotRefresh = true;

        if (ENV != 'DEVELOPMENT') {
          $state.go('EmployeeLogin', {}, {
            reload : true
          });
        }
      } else if (fromState.name == 'Checks' && toState.name != 'Checks') {
        // mark new created check no longer the new one
        $rootScope.newCheckID = null;
      }

      if (toState.name == 'EmployeeLogin') {

        

      }
    });

    $rootScope.$on('Force Logout', function() {
      $state.go('EmployeeLogin');
    });

    $timeout(function() {

      $(window).resize(function() {

        var height = $(window).height() - 235;
        $('.schedule-list').height(height);
        $('.schedule-list').find('tbody').height(height);

      });

    });

    $rootScope.getBoostrapSize = function() {
      var viewWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      if (viewWidth >= 1200) {
        return "lg";
      } else if (viewWidth >= 992) {
        return "md";
      } else if (viewWidth >= 768) {
        return "sm";
      } else {
        return "xs";
      }
    };

    $rootScope.currentUser = function() {
      return Users.currentUser();
    };

    // Prevent backspace
    $document.on('keydown', function(e) {
      if (e.which === 8 && e.target.nodeName !== "INPUT") { // you can add
        // others here.
        e.preventDefault();
      }
    });
  }
  ;
})();
