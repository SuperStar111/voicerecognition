;
(function() {
  'use strict';

  angular.module('soft').directive('addManualItem', AddManualItem);

  AddManualItem.$inject = [ '$modal', '$log' ];
  function AddManualItem($modal, $log) {
    return {
      restrict : 'A',
      link : function(scope, elem, attrs, controller) {
        var modal_class = 'sp-modal ';
        if (attrs.modalClass) {
          modal_class = modal_class + attrs.modalClass;
        }

        elem.on('click', function(e) {
          var modalInstance = $modal.open({
            templateUrl : attrs.templateUrl,
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

  Controller.$inject = [ '$scope', '$rootScope', '$modalInstance', 'Service.ManualItems', 'Modals' ];
  function Controller($scope, $rootScope, $modalInstance, ManualItems, Modals) {
    var self = this;
    self.input = {};
    self.form = {};

    self.addItem = addItem;
    self.cancel = cancel;

    init();
    function init() {
      if (!$rootScope.manualMenuItemsDetails) {
        ManualItems.getManualItemDetails().then(function(result) {
          $rootScope.manualMenuItemsDetails = result;

          parse($rootScope.manualMenuItemsDetails);
        }, function(err) {
          console.log(err);
        });
      } else {
        console.log($rootScope.manualMenuItemsDetails);
        parse($rootScope.manualMenuItemsDetails);
      }
    }

    function parse($data) {
      self.input.plu = $data.plu;

      self.form.printers = $data.printers;
      self.form.menus = $data.menus;
      self.form.taxes = $data.taxes;
      self.form.types = $data.article_types;
    }

    function addItem() {

    }
    function addItem() {
      var data = {
        name : self.input.name,
        price : self.input.price,
        printerID : self.input.printer.id,
        menuID : self.input.menu.id,
        menuGroupID : self.input.menuGroup.id,
        plu : self.input.plu,
        description : self.input.description,
        articleType : self.input.type,
        taxable : self.input.isTaxable,
        taxID : self.input.taxCode.id,
        created_on : created_on
      };

      ManualItems.insert(data).then(function(result) {
        Modals.alert(result.ResponseMessage);

        if (result.ResponseCode == 1) {
          $modalInstance.close(self.input);
        }

      }, function(err) {
        console.log(err);
      });
    }

    function cancel() {
      $modalInstance.dismiss('cancel');
    }

    $scope.ctrl = self;

  }
})();