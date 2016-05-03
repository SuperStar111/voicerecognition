(function() {

  angular.module('soft').controller(
    'ModifiersController',
    function($scope, $rootScope, $modal, $timeout, Modals) {
      var self = this;

      $rootScope.modifierModalVisible = false;
      $scope.buttonHeight = 52;

      self._enableApply = false;

      // Modifier Menu Object //
      $scope.modifier = {
        item : {},
        global : {},
        byIndex : {
          'item' : [],
          'global' : []
        },
        showing : null,
        showingFor : 'item',
        showingGlobal : false,
        activeCategory : "",
        currentPage : 1,
        numPages : 1,
        maxRows : 10,
        maxCols : 2,
        maxPerPage : 20,
        filter : '',
        prep : {
          'add' : {
            disabled : true,
            selected : false,
            danger : false,
            property_name : 'prep_add'
          },
          'allergic' : {
            disabled : true,
            selected : false,
            danger : true,
            property_name : 'prep_alergy'
          },
          'extra' : {
            disabled : true,
            selected : false,
            danger : false,
            property_name : 'prep_extra'
          },
          'less' : {
            disabled : true,
            selected : false,
            danger : false,
            property_name : 'prep_less'
          },
          'only' : {
            disabled : true,
            selected : false,
            danger : false,
            property_name : 'prep_only'
          },
          'remove' : {
            disabled : true,
            selected : false,
            danger : true,
            property_name : 'prep_remove'
          },
          'side' : {
            disabled : true,
            selected : false,
            danger : false,
            property_name : 'prep_side'
          },
          'sub' : {
            disabled : true,
            selected : false,
            danger : false,
            property_name : 'prep_sub'
          },
          'temp' : {
            disabled : null,
            selected : null,
            danger : false,
            property_name : null
          }
        },
        clearPrep : function() {
          for ( var p in this.prep) {
            this.prep[p].disabled = true;
            this.prep[p].selected = false;
          }
        },
        choice : [],
        clearChoice : function() {
          for (var x = $scope.modifier.choice.length - 1; x >= 0; x--) {
            $scope.removePrep($scope.modifier.choice[x], null);
          }
          // this.choice = this.choice.splice(0, this.choice.length);
        },
        clear : function() {
          this.showingFor = 'item';
          this.activeCategory = "";
          this.currentPage = 1;
          this.numPages = 1;
          for ( var cat in this.item) {
            delete this.item[cat];
          }
          for ( var cat in this.global) {
            delete this.global[cat];
          }
          this.byIndex.item = this.byIndex.item.splice(0, this.byIndex.item.length);
          this.byIndex.global = this.byIndex.global.splice(0, this.byIndex.global.length);
          this.clearPrep();
          this.clearChoice();
        }
      };

      // Initialize, then Show the Modifier Modal. //
      $rootScope.showModifierModal = function(item, current) {
        $scope.message_to_chef = current.message_to_chef;

        // If requested menu item does not exist, say so. //
        if (!item) {
          $scope.alert("Error reading menu item!");
          return;
        }

        // Local Currency Symbol //
        console.log("Currency Symbol: " + $scope.symbol);
        $scope.currency_symbol = $rootScope.location.currency_symbol;

        // Selected Menu Item Name //
        // console.log("Showing modifier for item " + item.item_id + ": " +
        // item.prep_shortname + " - " + item.item_name);
        console.log("Showing modifier for item:");
        console.log(item);
        if (!item.display_name) {
          // item.display_name = item.prep_shortname ? item.prep_shortname :
          // item.item_name;
          item.display_name = item.item_name;
        }
        $scope.itemToModify = item;

        // Reset Previous Choices //
        $scope.searchText = "";
        $scope.modifier.filter = "";
        $scope.modifier.clear();

        // Assemble Global Modifiers for Appropriate Menu Article Type //
        console.log("Global Modifiers (" + item.article_type + "):");
        console.log($rootScope.global_modifiers);
        console.log($rootScope.global_modifiers[item.article_type]);
        for ( var cat in $rootScope.global_modifiers[item.article_type]) {
          if ($rootScope.global_modifiers[item.article_type][cat] != null && typeof $rootScope.global_modifiers[item.article_type][cat] === 'object') {
            $scope.modifier.global[cat] = $rootScope.global_modifiers[item.article_type][cat];
          }
        }
        console.log($scope.modifier.global);

        // Assemble Item-specific Modifiers //
        console.log("Item-specific Modifiers:");
        console.log(item.modifiers);
        for ( var cat in item.modifiers) {
          if (item.modifiers[cat] != null && typeof item.modifiers[cat] === 'object') {
            $scope.modifier.item[cat] = item.modifiers[cat];
          }
        }
        console.log($scope.modifier.item);

        // Process Modifiers for Use in Modal //
        var showingFor = [ 'item', 'global' ];
        var id;
        var showGlobal;
        for ( var showingFor in {
          'item' : null,
          'global' : null
        }) {
          console.log("Processing mods for " + showingFor);
          for ( var cat in $scope.modifier[showingFor]) {
            for (var i = 0; i < $scope.modifier[showingFor][cat].length; i++) {
              // Choose display_name. //
              $scope.modifier[showingFor][cat][i].display_name = $scope.modifier[showingFor][cat][i].prep_shortname ? $scope.modifier[showingFor][cat][i].prep_shortname
                : $scope.modifier[showingFor][cat][i].modifier;
              // $scope.modifier[showingFor][cat][i].display_name =
              // $scope.modifier[showingFor][cat][i].modifier;

              // Convert string to number. //
              $scope.modifier[showingFor][cat][i].price = parseFloat($scope.modifier[showingFor][cat][i].price);
              $scope.modifier[showingFor][cat][i].max_quantity = parseFloat($scope.modifier[showingFor][cat][i].max_quantity);

              if (showingFor == 'global') {
                $scope.modifier[showingFor][cat][i].isGlobal = true;
              }

              // Convert "Yes" to true. //
              for ( var p in $scope.modifier.prep) {
                if (typeof $scope.modifier[showingFor][cat][i][$scope.modifier.prep[p].property_name] === 'string') {
                  $scope.modifier[showingFor][cat][i][$scope.modifier.prep[p].property_name] = $scope.modifier[showingFor][cat][i][$scope.modifier.prep[p].property_name]
                    .match(/yes/i) ? true : false;
                }
              }
              if (typeof $scope.modifier[showingFor][cat][i].prep_extra_charge === 'string') {
                $scope.modifier[showingFor][cat][i].prep_extra_charge = $scope.modifier[showingFor][cat][i].prep_extra_charge.match(/yes/i) ? true : false;
              }

              // Save index within category. //
              $scope.modifier[showingFor][cat][i]['$index'] = i;

              // Save to reference array by id. //
              id = parseInt($scope.modifier[showingFor][cat][i].id);
              $scope.modifier.byIndex[showingFor][id] = $scope.modifier[showingFor][cat][i];
              // console.log(id + ": " +
              // $scope.modifier.byIndex[showingFor][id].display_name + " " +
              // $scope.modifier.byIndex[showingFor][id].description);
            }
          }

          if (($scope.modifier[showingFor][cat] != null) && ($scope.modifier[showingFor][cat].length > 0)) {
            $scope.modifier[showingFor][cat].sort(function(a, b) {
              return a.display_name.localeCompare(b.display_name);
            });

            if (showingFor == 'item')
              showGlobal = false;
          } else {
            if (!angular.isDefined(showGlobal) && showingFor == 'item') {
              showGlobal = true;
            }
          }

        }

        // Display Item Modifiers //
        $scope.modifier.showingFor = 'item';
        $scope.modifier.showing = $scope.modifier.item;

        /*
         * console.log("Initializing Tooltips");
         * $('.has-tooltip').each(function(){ console.log(this);
         * $(this).tooltip(); //$(this).tooltip('show'); });
         */

        // Finally, show the Modifiers Modal //
        $rootScope.modifierModalVisible = true;
        $scope.resetView(function() {
          if (current && current.modifiers && current.modifiers.length) {
            angular.forEach(current.modifiers, function(modifier) {
              var mod = findMod(modifier.mod.id);

              $scope.rechooseMod(modifier);
              $scope.choosePrep(modifier.prep, mod, modifier.qty);
            });

          }

          if (showGlobal) {
            $scope.toggleGlobal(null);
          }

          if (item.require_temperature.toLowerCase() == 'no') {
            self._enableApply = true;
          }

        });

      };

      $scope.resetView = function(callback) {

        // Actions to take after modal display. //
        $timeout(function() {
          // Count number of modifier categories. //
          var numCats = 0;
          for ( var cat in $scope.modifier[$scope.modifier.showingFor]) {
            numCats++;
          }
          // Adjust top edge of Choisen Modifiers list to fit with the number of
          // categories. //
          console.log("Adjusting list top for " + numCats + " categories.");
          $('#modifier-selections').css('top', numCats * 40 + 10);

          // Align paginators with bottom modifier button row. //
          $scope.assessButtonSpace();
          $scope.snapPaginators();

          $scope.showModChoices();

          if (typeof callback == 'function') {
            callback();
          }
        }, 1);
      };

      $scope.toggleGlobal = function(showingFor, clickEvent) {
        var mustResetView = true;
        if (showingFor === 'item' || showingFor === 'global') {
          if (showingFor === $scope.modifier.showingFor) {
            mustResetView = false;
          } else {
            $scope.modifier.showingFor = showingFor;
          }
        } else {
          $scope.modifier.showingFor = ($scope.modifier.showingFor == 'item') ? 'global' : 'item';
        }
        if (mustResetView) {
          console.log("Showing " + $scope.modifier.showingFor + " modifiers");
          $scope.modifier.showing = $scope.modifier[$scope.modifier.showingFor];
          $scope.resetView();
        }
        $scope.searchText = "";
        if (clickEvent)
          clickEvent.target.blur();
      };

      // Show modifier choices when a category is tapped. //
      $scope.showModChoices = function(catToShow) {
        // Show chosen category if specified... //
        if (catToShow) {
          $scope.modifier.activeCategory = catToShow;
          // ...or current category if not specified, or default to
          // 'PREPARATION'. //
        } else if ((typeof $scope.modifier[$scope.modifier.showingFor][$scope.modifier.activeCategory] == 'undefined') || (!$scope.modifier.activeCategory)) {
          $scope.modifier.activeCategory = 'PREPARATION';
        }

        /*
         * // Clear Filters // $scope.clearSearchText(); $scope.quickFilter();
         */

        // Now show! //
        $scope.modifier.clearPrep();
        // $scope.columnizeMods($scope.modifier[$scope.modifier.showingFor][$scope.modifier.activeCategory]);
        $scope.filterMods(true);
      };

      $scope.textFilter = function() {
        // console.log("Text Filter: " + $scope.searchText);
        if (typeof $scope.searchText === 'string' && $scope.searchText.length >= 3) {
          $scope.modifier.filter = "^" + $scope.searchText;
        } else if ($scope.searchText.length == 0) {
          $scope.modifier.filter = "";
        }
        $scope.filterMods($scope.modifier.filter);
      };

      $scope.clearSearchText = function() {
        $scope.searchText = "";
        $scope.modifier.filter = "";
        $scope.filterMods($scope.modifier.filter);
      };

      $scope.quickFilter = function(filterName) {
        // console.log("Quick Filter " + filterName);
        $scope.searchText = "";
        filterName = "^[" + filterName + "]";
        $scope.modifier.filter = (filterName === $scope.modifier.filter) ? "" : filterName;
        $scope.filterMods($scope.modifier.filter);
      };

      $scope.filterMods = function(pattern) {
        // console.log("Filter pattern: " + pattern);

        // Reuse previous pattern when pattern is boolean and true. //
        if (pattern === true) {
          pattern = $scope.modifier.filter;
        }

        // Filter modifiers before columnizing. //
        if (typeof pattern === 'string' && pattern.length >= 1) {
          pattern = new RegExp(pattern, 'i');
          var filteredList = [];
          for ( var i in $scope.modifier[$scope.modifier.showingFor][$scope.modifier.activeCategory]) {
            if (pattern.test($scope.modifier[$scope.modifier.showingFor][$scope.modifier.activeCategory][i].display_name)) {
              filteredList.push($scope.modifier[$scope.modifier.showingFor][$scope.modifier.activeCategory][i]);
            }
          }
        } else {
          filteredList = $scope.modifier[$scope.modifier.showingFor][$scope.modifier.activeCategory];
        }

        $scope.columnizeMods(filteredList);
      };

      $scope.nowFiltering = function(filterName) {
        return ($scope.modifier.filter === ("^[" + filterName + "]"));
      };

      function findMod(itemId) {
        for ( var showingFor in {
          'item' : null,
          'global' : null
        }) {
          for ( var cat in $scope.modifier[showingFor]) {
            for (var i = 0; i < $scope.modifier[showingFor][cat].length; i++) {
              // Choose display_name. //
              if ($scope.modifier[showingFor][cat][i].id == itemId) {
                return $scope.modifier[showingFor][cat][i];
              }

            }
          }
        }

        return null;
      }

      // Slice up Modifiers according to button space. //
      $scope.columnizeMods = function(modList) {
        $scope.thisModPage = $scope.chunk(modList, $scope.modifier.maxPerPage);
        for ( var i in $scope.thisModPage) {
          $scope.thisModPage[i] = $scope.chunk($scope.thisModPage[i], $scope.modifier.maxRows);
        }
        $scope.modifier.currentPage = 1;
        $scope.modifier.numPages = $scope.thisModPage.length;
      };

      $scope.modPage = function(page) {
        if (typeof page === 'string') {
          if (page.match(/^prev/i)) {
            $scope.modifier.currentPage -= 1;
          } else if (page.match(/^next/i)) {
            $scope.modifier.currentPage += 1;
          }
        } else {
          $scope.modifier.currentPage = parseInt(page);
        }
        console.log("Set page to " + page);
        if ($scope.modifier.currentPage < 1)
          $scope.modifier.currentPage = $scope.modifier.numPages;
        if ($scope.modifier.currentPage > $scope.modifier.numPages)
          $scope.modifier.currentPage = 1;
      };

      // Select chosen modifier, and activate Preparation types. //
      $scope.chooseMod = function(chosenMod) {
        // console.log("You have chosen...");
        // console.log(chosenMod);
        $scope.clearChosenMods();
        $scope.showModChoices(chosenMod.type);
        $scope.modifier.byIndex[$scope.modifier.showingFor][chosenMod.id].active = true;
        $scope.activateApplicablePreps();
      };
      $scope.rechooseMod = function(choiceInList) {
        var chosenMods = $scope.getChosenMods();
        if (chosenMods.length == 1 && chosenMods[0] == choiceInList.mod) {
          $scope.clearChosenMods();
        } else {
          $scope.toggleGlobal(choiceInList.from);
          $scope.chooseMod(choiceInList.mod);
          $scope.modPage(Math.floor(choiceInList.mod['$index'] / $scope.modifier.maxPerPage) + 1);
          $scope.modifier.prep[choiceInList.prep].selected = true;
        }
      };

      $scope.getChosenMods = function() {
        var chosenMods = [];
        for ( var mod in $scope.modifier[$scope.modifier.showingFor][$scope.modifier.activeCategory]) {
          if ($scope.modifier[$scope.modifier.showingFor][$scope.modifier.activeCategory][mod].active) {
            chosenMods.push($scope.modifier[$scope.modifier.showingFor][$scope.modifier.activeCategory][mod]);
          }
        }
        return chosenMods;
      };

      $scope.clearChosenMods = function() {
        for ( var cat in $scope.modifier[$scope.modifier.showingFor]) {
          for ( var mod in $scope.modifier[$scope.modifier.showingFor][cat]) {
            $scope.modifier[$scope.modifier.showingFor][cat][mod].active = false;
          }
        }
        $scope.activateApplicablePreps();
      };

      $scope.chooseTemp = function(chosenTempMod) {
        var debug = true;
        if (debug)
          console.log("Temp:");
        if (debug)
          console.log(chosenTempMod);
      };

      $scope.choosePrep = function(chosenPrep, chosenMod, increment, clickEvent) {
        var debug = false;
        var chosenMods;
        var existing;

        // Stop that bubbling, now I mean it! //
        if (clickEvent)
          clickEvent.stopPropagation();

        // Default increment is +1 //
        if (typeof increment === 'undefined')
          increment = 1;

        // Use chosen modifier if specified, or all previously chosen modifiers
        // if not. //
        if (chosenMod) {
          if (debug)
            console.log("Assigning " + chosenPrep + " to " + chosenMod.display_name);
          chosenMods = [ chosenMod ];
        } else {
          if (debug)
            console.log("Assigning " + chosenPrep + " to all selected modifiers");
          chosenMods = $scope.getChosenMods();
          if (debug)
            console.log(chosenMods);
        }

        // Apply prep to chosen modifier(s). //
        for ( var mod in chosenMods) {
          // Look for existing entry. //
          inList = null;
          for ( var i in $scope.modifier.choice) {
            if ($scope.modifier.choice[i].mod === chosenMods[mod]) {
              inList = i;
            }
            continue;
          }
          // For temperature, remove previous. //
          if (chosenPrep === 'temp') {
            var i = 0;
            while (i < $scope.modifier.choice.length) {
              if ($scope.modifier.choice[i].prep === 'temp') {
                $scope.modifier.choice.splice(i, 1);

                self._enableApply = false;
                chosenMod.active = false;
                continue;
              }
              i++;
            }
          }
          // If it's not already there, add it. //
          if (!inList) {
            if (chosenPrep === 'temp') {
              self._enableApply = true;
              chosenMod.active = true;
            }

            $scope.modifier.choice.push({
              'mod' : chosenMods[mod],
              'from' : $scope.modifier.showingFor,
              'prep' : chosenPrep,
              'danger' : $scope.modifier.prep[chosenPrep].danger,
              'qty' : 0,
              'extra_charge' : 0
            });
            inList = $scope.modifier.choice.length - 1;
          }

          var incOrDec = false;
          if ([ 'inc', 'dec' ].indexOf(chosenPrep) != -1) {
            incOrDec = true;
            chosenPrep = $scope.modifier.choice[inList].prep;
          }

          // Adjust values according to chosen prep type. //
          if (chosenPrep === 'add') {
            chosenMod.active = true;
            $scope.modifier.choice[inList].prep = chosenPrep;
            $scope.modifier.choice[inList].danger = $scope.modifier.prep[chosenPrep].danger;
            $scope.modifier.choice[inList].qty += increment;
            if ($scope.modifier.choice[inList].qty < 1) {
              chosenMods[mod].active = false;
              if (inList !== null) {
                $scope.modifier.choice.splice(inList, 1);
              }
              return;
            } else if (inList !== null && $scope.modifier.choice[inList].qty > chosenMods[mod].max_quantity) {
              $scope.alert("Max Quantity for this modifier is set to " + chosenMods[mod].max_quantity + ".");
              $scope.modifier.choice[inList].qty = chosenMods[mod].max_quantity;
            }
          } else {
            if ($scope.modifier.choice[inList]) {
              $scope.modifier.choice[inList].prep = chosenPrep;
              $scope.modifier.choice[inList].danger = $scope.modifier.prep[chosenPrep].danger;

              if ($scope.modifier.choice[inList].qty == 0) {
                $scope.modifier.choice[inList].qty = 1;
              }

              if (angular.isDefined(increment) && incOrDec) {
                $scope.modifier.choice[inList].qty += increment;
              }
            }

          }
          if (chosenPrep === 'extra') {
            // Asynchronous prompt and update of extra preparation charge. //
            if ($scope.modifier.activeCategory === 'PREPARATION' && chosenMods[mod].prep_extra_charge) {
              $scope.prompt('Open Price - ' + $scope.modifier.choice[inList].mod.display_name, $scope.modifier.choice[inList], 'extra_charge');
            }
          }
        }

        if (chosenMods.length > 0 && chosenPrep !== 'add') {
          $scope.clearChosenMods();
        }
        $scope.activateApplicablePreps();
        $scope.modifier.prep[chosenPrep].selected = true;

      };

      $scope.activateApplicablePreps = function() {
        // console.log("Activating Applicable Preparation Buttons");
        $scope.modifier.clearPrep();

        // Remove tooltips, if any. //
        try {
          $('[role="tooltip"]').remove();
        } catch (err) {
          console.warn(err);
        }

        // No Prep Buttons for TEMPERATURE //
        if ($scope.modifier.activeCategory === 'TEMPERATURE')
          return;

        var chosenMods = $scope.getChosenMods();
        if (typeof chosenMods !== 'object' || chosenMods.length == 0)
          return;

        // Start with all prep types enabled. //
        for ( var p in $scope.modifier.prep) {
          $scope.modifier.prep[p].disabled = false;
        }

        // Disable prep types not allowed by ANY chosen modifier. //
        for ( var mod in chosenMods) {
          for ( var p in $scope.modifier.prep) {
            $scope.modifier.prep[p].disabled = (chosenMods[mod][$scope.modifier.prep[p].property_name] && !$scope.modifier.prep[p].disabled) ? false : true;
          }
        }
      };

      $scope.removePrep = function(chosenPrep, clickEvent) {
        if (clickEvent)
          clickEvent.stopPropagation();
        for ( var i in $scope.modifier.choice) {
          if ($scope.modifier.choice[i] === chosenPrep) {
            $scope.modifier.choice.splice(i, 1);
            break;
          }
        }

        if (chosenPrep.prep === 'temp') {
          self._enableApply = false;
        }
        $scope.clearChosenMods();
      };

      $scope.cancel = function() {
        $rootScope.modifierModalVisible = false;
        $scope.modifier.clear();

      };

      $scope.keyboard = function() {
        var txt = $('#modifierNotes > textarea');
        var kb = txt.getkeyboard();
        if (typeof kb === 'undefined') {
          txt.keyboard({
            openOn : null,
            stayOpen : true,
            layout : 'qwerty',
            position : {
              of : '#menuItemModifiersModalBody',
              my : 'center bottom',
              at : 'center bottom'
            }
          }).addTyping();
          kb = txt.getkeyboard();
        }
        kb.reveal();
      };

      $scope.alert = function(msg) {
        Modals.alert(msg);
      };

      $scope.prompt = function(msg, targetObject, targetProperty) {
        var options = {
          title : msg,
          placeholder : 'Enter Amount'
        };
        var modalInstance = Modals.prompt(options);

        modalInstance.result.then(function(prompt_input) {
          targetObject[targetProperty] = prompt_input;
        });
      };

      // Assess available space for modifier buttons. //
      $scope.assessButtonSpace = function() {
        var divHeight = $('#modifier-selection-buttons-area').height();
        $scope.modifier.maxRows = Math.floor((divHeight + 5) / $scope.buttonHeight);
        var bootstrapSize = $rootScope.getBoostrapSize();
        switch (bootstrapSize) {
          case "lg":
            $scope.modifier.maxCols = 4;
            break;
          case "md":
            $scope.modifier.maxCols = 3;
            break;
          default:
            $scope.modifier.maxCols = 2;
        }
        $scope.modifier.maxPerPage = $scope.modifier.maxCols * $scope.modifier.maxRows;
      };

      $scope.snapPaginators = function() {
        $('.paginators').css('top', ($scope.modifier.maxRows * $scope.buttonHeight - 5) - ($scope.buttonHeight * 2 - 5));
      };

      // When view resizes, recalculate pages and columns of buttons. //
      $(window).resize(function() {
        $scope.assessButtonSpace();
        $scope.snapPaginators();
      });

      $scope.chunk = function(a, chunkSize) {
        var chunks = [];
        if (typeof a === 'undefined')
          return chunks;
        for (var i = 0; i < a.length; i += chunkSize) {
          chunks.push(a.slice(i, i + chunkSize));
        }
        return chunks;
      };

      $scope.tooltip = function(e) {
        console.log(e);
        if (e.type == 'mouseenter') {
          var tgt = $(e.target);
          var title = tgt.attr("title");
          tgt.find('.tooltip').remove();
          tgt.append('<div class="tooltip left in" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner">' + title + '</div></div>');
        } else if (e.type == 'mouseleave') {
          $(e.target).find('.tooltip').remove();
        }
      };

      $scope.showChoicesIf = function(cat, isTrue) {
        if (isTrue) {
          $scope.showModChoices(cat);
        }
      };

      $scope.isApplyEnabled = function() {
        return self._enableApply;
      };

      $scope.$watch('modifier.choice.length', function() {
        $scope.selectedMod = {};

        angular.forEach($scope.modifier.choice, function(modifier, index) {
          $scope.selectedMod[modifier.mod.id] = true;
        });
      });
      // Initialization of Tool Tips //
      $(function() {
        // console.log("Initializing Tooltips");
        $('[data-toggle="tooltip"]').tooltip();
        // $('.add-tooltip').hover($scope.tooltip, $scope.tooltip);
        // $('.has-tooltip').each(function(){
        // $(this).tooltip();
        // $(this).tooltip('show');
        // });
        // $('.has-tooltip').tooltip('show');
        // $('.has-tooltip').tooltip('hide');
        // $('body').tooltip({
        // selector: '.has-tooltip'
        // });
      });

      // broadcast modifier change, check controller will take care of it then
      $scope.applyModifier = function() {
        if ($scope.isApplyEnabled()) {
          $rootScope.modifierModalVisible = false;
          $rootScope.$broadcast('add-modifiers', {
            choices : $scope.modifier.choice,
            message_to_chef : $scope.message_to_chef
          });
          
          $scope.modifier.clear();
          //$scope.modifier.choice = [];

        } else {
          Modals.alert('Please select temperature!');
        }

      };
    });

})();