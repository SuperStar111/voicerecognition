;
(function() {
  'use strict';

  angular.module('soft').config([ '$locationProvider', '$stateProvider', '$urlRouterProvider', function($locationProvider, $stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    $stateProvider.state('Login', {
      url : '/login',
      templateUrl : 'templates/login.html',
      controller : 'LoginController',
      controllerAs : 'LoginCtrl'
    }).state('EmployeeLogin', {
      url : '/employeelogin',
      templateUrl : 'templates/employeelogin.html',
      controller : 'EmployeeLoginController',
      controllerAs : 'EmployeeLoginCtrl'
    }).state('Home', {
      url : '/home',
      templateUrl : 'templates/home.html',
      controller : 'HomeController',
      controllerAs : 'homeCtrl'
    }).state('Schedule', {
      url : '/schedule',
      templateUrl : 'templates/schedule.html',
      controller : 'ScheduleController',
      controllerAs : 'scheduleCtrl'
    }).state('Reports', {
      url : '/reports',
      templateUrl : 'templates/reports.html',
      controller : 'ReportsController',
      controllerAs : 'reportsCtrl'
    }).state('Checks', {
      url : '/check',
      templateUrl : 'templates/empty.html',
      controller : 'ChecksController',
      controllerAs : 'checksCtrl'
    }).state('CreateCheck', {
      url : '/check/create',
      templateUrl : 'templates/empty.html',
      controller : 'CreateCheckController'
    }).state('Employee', {
      url : '/employee',
      templateUrl : 'templates/employee.html',
      controller : 'EmployeeController',
      controllerAs : 'employeeCtrl'
    }).state('CheckDetail', {
      url : '/check_detail/:id',
      templateUrl : 'templates/checkDetail.html',
      controller : 'CheckDetailController',
      controllerAs : 'checkDetailCtrl'
    }).state('CheckDetailWithTab', {
      url : '/check_detail/:id/:tab',
      templateUrl : 'templates/checkDetail.html',
      controller : 'CheckDetailController',
      controllerAs : 'checkDetailCtrl'
    }).state('Layout', {
      url : '/layout',
      templateUrl : 'templates/soft-layout.html',
      controller : 'SoftLayoutController',
      controllerAs : 'softLayoutCtrl'
    }).state('SectionLayout', {
      url : '/layout/:sectionID',
      templateUrl : 'templates/soft-layout.html',
      controller : 'SoftLayoutController',
      controllerAs : 'softLayoutCtrl'
    }).state('Home.GeneralLayout', {
      url : '/layout/general',
      templateUrl : 'templates/home.html',
      controller : 'HomeController',
      controllerAs : 'homeCtrl'
    }).state('Home.SectionLayout', {
      url : '/layout/section/:id',
      templateUrl : 'templates/home.html',
      controller : 'HomeController',
      controllerAs : 'homeCtrl'
    }).state('test', {
      url : '/test',
      templateUrl : 'templates/test.html',
      controller : 'TestController',
      controllerAs : 'testCtrl'
    });
  } ]);

})();
