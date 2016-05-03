;
(function() {
  'use strict';
  var isFullLayout = false;
  var isSectionView = false;
  var parentSelector = isFullLayout ? "#full-layout" : "#layout-wrapper";

  angular.module('soft').directive('softLayout', SoftLayoutDirective);

  SoftLayoutDirective.$inject = [];
  function SoftLayoutDirective() {
    return {
      restrict : 'E',
      templateUrl : function(elem, attrs) {
        return attrs.templateUrl;
      },
      link : function(scope, element, attrs, ctrl) {
        attrs.$observe('sectionId', function() {
          ctrl._tables = [];
          ctrl.sectionID = attrs.sectionId;
          ctrl.init();
        });

      },
      controller : Controller
    };
  }

  Controller.$inject = [ '$scope', 'SoftLayout', 'TableLayout', '$rootScope', '$state' ];
  function Controller($scope, SoftLayout, TableLayout, $rootScope, $state) {
    var self = this;

    $rootScope.open_modal = function(identifier) {
      console.log(identifier);
      var groupElem = $('#layout-wrapper').find("div[data-identifier='" + identifier + "']");

      var modalContainer = $('#fl-popup-modal .modal-dialog .modal-content .modal-body');
      modalContainer.html('');

      modalContainer.droppable();

      var groupLength = groupElem.length;

      groupElem.each(function(i, elem) {
        var clone = $(elem).find('.check-icon-inner').clone(false);
        clone.addClass('duplicate-item');
        clone.original = $(elem);
        clone.draggable({
          revert : function(destination) {
            if (destination === false || destination.hasClass('modal-body')) {
              return true;
            } else {
              if (destination.hasClass('full-layout')) {

                var newOffset = clone.offset();
                $(elem).offset({
                  top : newOffset.top,
                  left : newOffset.left
                });

                $rootScope.$broadcast('Item Dragged Out', {
                  element : $(elem)
                });

                clone.remove();
                groupLength--;

                if (groupLength == 1) {
                  $('#fl-popup-modal').modal('hide');
                }
              }
              return false;
            }
          }
        });

        modalContainer.append(clone);
      });

      $('#fl-popup-modal').modal('show');
    };

    self._tables = [];

    self.tables = tables;
    self.init = init;
    self.showTableDetail = showTableDetail;

    function init() {
      isSectionView = false;
      self.isFullLayout = false;

      if (self.sectionID) {
        isSectionView = true;
        SoftLayout.sectionLayout(self.sectionID).then(function(result) {
          self.isFullLayout = isFullLayout = (result.fullpage.toLowerCase() === 'yes' || result.fullpage === true);

          $rootScope.$broadcast('Section Layout Loaded', {
            result : result
          });

          // TODO: Get section detail
          if (isFullLayout) {
            SoftLayout.getSectionDetails().then(function(result) {
              self.sectionStats = result;

              $rootScope.$broadcast('Full Layout Loaded', {
                'section-stats' : result
              });
            }, function(err) {
              console.log(err);
            });
          }

          angular.forEach(result.table_section_layout, function(value, index) {
            var tableLayout = new TableLayout(value);
            self._tables.push(tableLayout);
          });

          self.tableLayoutData = result;
        },
        // fails
        function(err) {
          console.log(err);
        });
      } else {
        SoftLayout.tableLayout().then(function(result) {
          isFullLayout = false;

          angular.forEach(result.tables, function(value, index) {
            var tableLayout = new TableLayout(value);
            self._tables.push(tableLayout);
          });

          self.tableLayoutData = result;

        },
        // fails
        function(err) {
          console.log(err);
        });
      }

    }

    function tables() {
      return self._tables;
    }

    function showTableDetail(table) {
      if (table.get('order_id')) {
        $state.go('CheckDetailWithTab', {
          'id' : table.get('order_id'),
          'tab' : 'cart'
        });
      } else {
        $rootScope.$broadcast('NEW CHECK', {
          tableId : table.getId()
        });
      }
    }

    $scope.ctrl = self;
  }

  angular.module('soft').directive('layoutWrapper', LayoutWrapper);
  LayoutWrapper.$inject = [ '$compile', '$rootScope' ];

  function LayoutWrapper($compile, $rootScope) {
    return {
      restrict : 'A',
      require : '^softLayout',
      link : function(scope, element, attrs, layoutCtrl) {
        function collision($div1, $div2) {
          var x1 = $div1.offset().left;
          var y1 = $div1.offset().top;
          var h1 = $div1.outerHeight(true);
          var w1 = $div1.outerWidth(true);
          var b1 = y1 + h1;
          var r1 = x1 + w1;
          var x2 = $div2.offset().left;
          var y2 = $div2.offset().top;
          var h2 = $div2.outerHeight(true);
          var w2 = $div2.outerWidth(true);
          var b2 = y2 + h2;
          var r2 = x2 + w2;

          if (b1 < y2 || y1 > b2 || r1 < x2 || x1 > r2)
            return false;
          return true;
        }

        $rootScope.$on('Item Dragged Out', function(event, data) {
          element.find('.check-icon').each(function(i, e) {
            if (collision($(this), data.element)) {
              if ($(this).attr('id') === data.element.attr('id')) {
                console.log('dragged from layout');
                // multiple = false;
                data.element.find('button').remove();
              }
            }
          });
        });

        scope.$watch(function() {
          return layoutCtrl.tableLayoutData;
        }, function() {
          self.leftBlock = $('.left-block');

          if (layoutCtrl.tableLayoutData) {
            renderLayout(layoutCtrl.tableLayoutData);
          }

          if (!scope.hasResizeEvent) {

            $(window).resize(function() {
              if ([ 'general', 'section' ].indexOf($rootScope.layout) != -1) {
                renderLayout(layoutCtrl.tableLayoutData);
                // $scope.$apply();
              }
            });

            scope.hasResizeEvent = true;
          }

        });

        function updatePosition(ui, helper, droppable, element) {
          var leftPosition = ui.offset.left - droppable.offset().left;
          var topPosition = ui.offset.top - droppable.offset().top;
          var multiple = false;
          var identifier = '';

          element.find('.check-icon').each(function(i, e) {
            if (collision($(this), $(helper))) {
              // droppable.find('button').remove();
              leftPosition = $(this).position().left;
              topPosition = $(this).position().top + 2;
              identifier = $(this).attr('data-identifier');
              multiple = true;
              if ($(this).attr('id') === $(helper).attr('id')) {
                console.log('dragged from layout');
                multiple = false;
              }
            }
          });

          var dragEl = helper.clone();
          dragEl.addClass('added-icon');
          helper.remove();

          dragEl.draggable({
            helper : 'original',
            cursor : 'move',
            tolerance : 'fit',
            drop : function(event, ui) {
              $(ui.draggable).remove();
            }
          });

          dragEl.css({
            position : 'absolute',
            top : topPosition,
            left : leftPosition,
            height : 50 * layoutCtrl.heightScale,
            width : 50 * layoutCtrl.widthScale
          });

          if (multiple) {
            dragEl.attr({
              'data-identifier' : identifier,
              'id' : Math.random()
            });
            var btn = $compile("<button class='btn btn-xs' data-identifier=" + identifier + " ng-click='$root.open_modal(" + identifier + ")'></button>")($rootScope);
            dragEl.append(btn);
            scope.$apply();
          } else {
            dragEl.attr({
              'data-identifier' : Math.random(),
              'id' : Math.random()
            });
            $(dragEl).find('button').remove();
          }

          element.append(dragEl);
        }

        function renderLayout(data) {
          element.css('background-size', '100% 100%');
          if (data.image) {
            element.css('background-image', 'url(' + data.image + ')');

          } else if (data.floor_plan) {
            element.css('background-image', 'url(' + data.floor_plan + ')');
          } else {
            element.css('background-image', 'url(./images/table-layout.jpg)');
          }

          if (isFullLayout) {
            layoutCtrl.heightScale = element.height() / 768;

            element.width(1024 * layoutCtrl.heightScale);

            // element.width('100%');
            layoutCtrl.widthScale = element.width() / 1024;

            $rootScope.$broadcast('Layout Section Width Changed');

            element.droppable({
              drop : function(event, ui) {
                if (ui.helper.hasClass('check-icon')) {
                  updatePosition(ui, ui.helper, $(this), element);
                }
              },
              start : function(event, ui) {
                dragEl = ui.helper.clone();
                ui.helper.remove();
                dragEl.remove('button');
              }
            });
          } else {
            layoutCtrl.heightScale = element.height() / 962;
            element.width(776 * layoutCtrl.heightScale);
            layoutCtrl.widthScale = element.width() / 766;

            $rootScope.$broadcast('Layout Section Width Changed');

          }

          if (self.leftBlock.width() < 455) {
            self.leftBlock.css('opacity', 0);
          } else {
            self.leftBlock.css('opacity', 1);
          }

          $rootScope.$broadcast('Layout render successful', {
            heightScale : layoutCtrl.heightScale,
            widthScale : layoutCtrl.widthScale
          });
        }
      }
    };
  }

  angular.module('soft').directive('tableLayout', TableLayoutDirective);
  TableLayoutDirective.$inject = [ '$filter', 'SoftLayout' ];

  function TableLayoutDirective($filter, SoftLayout) {
    return {
      restrict : 'A',
      scope : {
        table : '=table'
      },
      link : function(scope, element, attrs, ctrl) {

        element.css('top', scope.table.get('ty') + '%');
        element.css('left', scope.table.get('tx') + '%');

        scope.$on('Layout render successful', function(event, data) {
          // element.css('height', (scope.table.get('size_y') || 80) *
          // data.heightScale);
          // element.css('width', (scope.table.get('size_x') || 80) *
          // data.widthScale);
        });

        attrs.$observe('heightScale', function() {
          element.css('height', (scope.table.get('size_y') || 80) * attrs.heightScale);
        });

        attrs.$observe('widthScale', function() {
          element.css('width', (scope.table.get('size_x') || 80) * attrs.widthScale);
        });

        var imageElement = element.find('.image');

        var imageID = scope.table.get('image');
        var imageUrl = scope.table.get('image_url');

        imageElement.css('-ms-transform', 'rotate(' + $filter('number')(scope.table.get('angle'), 0) + 'deg)');
        imageElement.css('-webkit-transform', 'rotate(' + $filter('number')(scope.table.get('angle'), 0) + 'deg)');
        imageElement.css('transform', 'rotate(' + $filter('number')(scope.table.get('angle'), 0) + 'deg)');

        if (imageID != 99 && imageID && imageUrl) {
          imageElement.css('background-image', 'url(' + imageUrl + ')');
          imageElement.css('background-color', 'transparent');
        } else {
          imageElement.css('background-color', scope.table.get('visualstatus_color'));
        }

        element.draggable({
          cursor : "move",
          containment : parentSelector,
          stop : function(event, ui) {
            var data = {
              pos_x : (ui.position.left / $(parentSelector).width()) * 100,
              pos_y : (ui.position.top / $(parentSelector).height()) * 100
            };

            scope.table.set('ty', data.pos_y);
            scope.table.set('tx', data.pos_x);
            element.css('top', scope.table.get('ty') + '%');
            element.css('left', scope.table.get('tx') + '%');

            if (isSectionView) {
              SoftLayout.updateSection(scope.table.get('section_table_id'), data).then(function(result) {
                console.log(result);
              },
              // fails
              function(err) {
                console.log(err);
              });
            } else {
              SoftLayout.updateTable(scope.table.getId(), data).then(function(result) {
                console.log(result);
              },
              // fails
              function(err) {
                console.log(err);
              });
            }

          }
        }).resizable({
          containment : parentSelector,
          aspectRatio : true,
          stop : function(event, ui) {
            var data = {
              pos_x : (ui.position.left / $(parentSelector).width()) * 100,
              pos_y : (ui.position.top / $(parentSelector).height()) * 100,
              size_x : ui.size.width / attrs.widthScale,
              size_y : ui.size.height / attrs.heightScale
            };

            if (isSectionView) {
              SoftLayout.updateSection(scope.table.get('section_table_id'), data).then(function(result) {
                console.log(result);
              },
              // fails
              function(err) {
                console.log(err);
              });
            } else {
              SoftLayout.updateTable(scope.table.getId(), data).then(function(result) {
                console.log(result);
              },
              // fails
              function(err) {
                console.log(err);
              });
            }

          }
        });

        element.find('.inner-span').rotatable({
          stop : function(event, ui) {
            var data = {
              angle : ui.angle.stop * 180 / Math.PI
            };

            if (isSectionView) {
              SoftLayout.updateSection(scope.table.get('section_table_id'), data).then(function(result) {
                console.log(result);
              },
              // fails
              function(err) {
                console.log(err);
              });
            } else {
              SoftLayout.updateTable(scope.table.getId(), data).then(function(result) {
                console.log(result);
              },
              // fails
              function(err) {
                console.log(err);
              });
            }

          }
        });
      }
    };
  }

  angular.module('soft').directive('draggableTable', DraggableTable);
  DraggableTable.$inject = [ '$filter' ];

  function DraggableTable($filter) {
    return {
      restrict : 'A',
      link : function(scope, element, attrs, ctrl) {
        element.draggable({
          helper : 'clone',
          cursor : 'move',
          tolerance : 'fit'
        });
      }
    };
  }

})();