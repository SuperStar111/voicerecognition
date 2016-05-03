;
(function() {
  'use strict';

  angular.module('soft').factory('SoftView.TabView', TabView);

  TabView.$inject = [];
  function TabView() {
    var TabView = function() {
      var self = this;

      self.showTab = showTab;
      self.isTab = isTab;

      function showTab(tab) {
        self.currentTab = tab;
      }

      function isTab(tab) {
        return self.currentTab == tab;
      }
    };

    return TabView;

  }
})();