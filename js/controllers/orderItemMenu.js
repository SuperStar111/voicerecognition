;
(function() {
  'use strict';

  angular.module('soft').controller('OrderItemMenuController', OrderItemMenuController);

  OrderItemMenuController.$inject = [ 'OrderItemMenu', '$cookies' ];
  function OrderItemMenuController(OrderItemMenu, $cookies) {
    var self = this;

    self.viewType = 'list'; // list, gallery, slot

    self.predefinedMenuViews = [ 'List', 'Gallery', 'Slot' ];

    self.setViewType = setViewType;
    self.isViewType = isViewType;

    init();

    function init() {
      self.menuview = $cookies['menuview'];

      if (self.predefinedMenuViews.indexOf(self.menuview) == -1) {
        self.menuview = self.predefinedMenuViews[0];
      }

      setViewType(self.menuview.toLowerCase());
    }
    function setViewType(viewType) {
      self.viewType = viewType;
    }

    function isViewType(viewType) {
      return self.viewType == viewType;
    }
  }
})();