(function() {

  angular.module('soft').controller(
    'CustomModifiersController',
    function($scope, $rootScope, $modal, $timeout, Modals) {
      $rootScope.customModifierModalVisible = false;
      $scope.buttonHeight = 52;
      $scope.defaultToppingImage = "images/NoMenuImage.png";

      // Button Area Selectors (for assessing available screen space) //
      $scope.selector = {
        'PREPARATION' : '#custom-modifier-selection-buttons-area',
        'EXTRA' : '#custom-modifier-selection-buttons-area',
        'TOPPINGS' : '#custom-modifier-toppings-buttons-area',
        'buttonsRight' : '#menuItemCustomModifiersModal .button-bar-right'
      };

      // Modifier Menu Object //
      $scope.modifier = {
        selectedSize : null,
        primary : [],
        item : {},
        global : {},
        byIndex : [],
        byGlobalIndex : [],
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
          this.choice.splice(0, this.choice.length);
        },
        clear : function() {
          this.selectedSize = null;
          this.primary.splice(0, this.primary.length);
          this.activeCategory = "";
          this.currentPage = 1;
          this.numPages = 1;
          for ( var cat in this.item) {
            delete this.item[cat];
          }

          for ( var cat in this.global) {
            delete this.global[cat];
          }

          this.byGlobalIndex = this.byGlobalIndex.splice(0, this.byGlobalIndex.length);

          this.byIndex.splice(0, this.byIndex.length);
          this.clearPrep();
          this.clearChoice();
        }
      };

      // Active Quarters Object //
      $scope.quarters = {
        '_q' : [ null, true, true, true, true ],
        'parts' : 1,
        'current' : function() {
          if (this.full()) {
            return '';
          }
          if (this.half(1)) {
            return 'H1';
          }
          if (this.half(2)) {
            return 'H2';
          }
          var qtrs = [];
          for (var i = 1; i <= 4; i++) {
            if (this._q[i]) {
              qtrs.push('Q' + i);
            }
          }
          if (qtrs.length) {
            return qtrs.join(' ');
          }
          return false;
        },
        'quarter' : function(quarter, state) {
          quarter = parseInt(quarter);
          if (quarter >= 1 && quarter <= 4) {
            if (typeof state === 'boolean') {
              this._q[quarter] = state;
            }
            return this._q[quarter];
          }
          return false;
        },
        'half' : function(half, state) {
          half = parseInt(half);
          if (typeof state === 'boolean') {
            if (half == 1) {
              this._q[1] = state;
              this._q[2] = state;
            }
            if (half == 2) {
              this._q[3] = state;
              this._q[4] = state;
            }
          }
          if (half == 1 && (this._q[1] && this._q[2]) && (this._q[3] == this._q[4])) {
            return true;
          }
          if (half == 2 && (this._q[3] && this._q[4]) && (this._q[1] == this._q[2])) {
            return true;
          }
          return false;
        },
        'full' : function(state) {
          if (typeof state === 'boolean') {
            this._q[1] = state;
            this._q[2] = state;
            this._q[3] = state;
            this._q[4] = state;
          }
          if (this._q[1] && this._q[2] && this._q[3] && this._q[4]) {
            return true;
          }
          return false;
        },
        'clickAction' : function(quarter) {
          if (this.timer) {
            window.clearTimeout(this.timer);
            this.timer = null;
          }

          // If whole is only option, do nothing. //
          if (this.parts == 1)
            return;

          // Validate clicked quarter. //
          quarter = parseInt(quarter);
          if (quarter < 1 || quarter > 4)
            return;

          // Click on a full pie, select that part of the pie. //
          if (this.full()) {
            for (var i = 1; i <= 4; i++) {
              this._q[i] = false;
            } // Turn everything off //
          }

          // Toggle clicked quarter of the pie. //
          var state = this._q[quarter];
          this._q[quarter] = !state;

          // Toggle complementary parts when using "Half" //
          if (this.parts == 2) {
            switch (quarter) {
              case 1:
                this._q[2] = !state;
                break;
              case 2:
                this._q[1] = !state;
                break;
              case 3:
                this._q[4] = !state;
                break;
              case 4:
                this._q[3] = !state;
                break;
            }
          }

          // If result of toggle is an empty pie, make it whole. //
          if (this._q[1] == false && this._q[2] == false && this._q[3] == false && this._q[4] == false) {
            this.timer = window.setTimeout(function() {
              $scope.quarters.full(true);
              $scope.$digest();
            }, this.delay);
          }
        },
        'timer' : null,
        'delay' : 1000, // milliseconds
        'choiceRefs' : { // references to chosen mods
          'W' : [],
          'H1' : [],
          'H2' : [],
          'Q1' : [],
          'Q2' : [],
          'Q3' : [],
          'Q4' : []
        },
        'clearChoiceRefs' : function() {
          for ( var section in this.choiceRefs) {
            this.choiceRefs[section].splice(0, this.choiceRefs[section].length);
          }
        },
        'clear' : function() {
          this.full(true);
          this.clearChoiceRefs();
        }
      };

      // Initialize, then Show the Modifier Modal. //
      $rootScope.showCustomModifierModal = function(item, current, $event) {
        $scope.isToppings = item.toppings && item.toppings.toUpperCase() != 'NO';

        $scope.message_to_chef = current.message_to_chef;

        var debug = true;

        // If requested menu item does not exist, say so. //
        if (!item) {
          $scope.alert("Error reading menu item!");
          return false;
        }

        // Only allow for menu items with 'yes' in 'custom' property //
        if (typeof item.custom === 'string' && item.custom.match(/yes/i)) {
          // Custom Modifiers Allowed!
        } else if (typeof item.custom === 'boolean' && item.custom) {

          // Custom Modifiers Allowed!
        } else {
          $scope.alert("Sorry, but this menu item does not support custom modifiers! (Item " + item.item_id + ": " + item.item_name + ")");
          return false;
        }

        if (!item.display_name) {
          // item.display_name = item.prep_shortname ? item.prep_shortname :
          // item.item_name;
          item.display_name = item.item_name;
        }
        $scope.itemToModify = item;

        // Clear Modifiers from Previous Use //
        $scope.searchText = "";
        $scope.modifier.filter = "";
        $scope.modifier.clear();
        $scope.quarters.clear();

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
        if (debug) {
          console.log('item.modifiers: ', item.modifiers);
        }

        for ( var cat in item.modifiers) {
          if (item.modifiers[cat] != null && typeof item.modifiers[cat] === 'object') {
            $scope.modifier.item[cat] = item.modifiers[cat];
          }
        }

        if (debug) {
          console.log("Categories:", $scope.modifier.item);
        }

        // Process Modifiers for Use in Modal //
        var showingFor = [ 'item', 'global' ];
        var id;
        var showGlobal;
        for ( var showingFor in {
          'item' : null,
          'global' : null
        }) {
          for ( var cat in $scope.modifier[showingFor]) {
            for (var i = 0; i < $scope.modifier[showingFor][cat].length; i++) {

              // Choose display_name. //
              $scope.modifier[showingFor][cat][i].display_name = $scope.modifier[showingFor][cat][i].prep_shortname ? $scope.modifier[showingFor][cat][i].prep_shortname
                : $scope.modifier[showingFor][cat][i].modifier;
              // $scope.modifier[showingFor][cat][i].display_name =
              // $scope.modifier[showingFor][cat][i].modifier;
              if (cat === 'SIZE') {
                $scope.modifier[showingFor][cat][i].display_name = 'SIZE - ' + $scope.modifier[showingFor][cat][i].display_name;
              }

              // Convert string to number. //
              $scope.modifier[showingFor][cat][i].price = parseFloat($scope.modifier[showingFor][cat][i].price);
              $scope.modifier[showingFor][cat][i].max_quantity = parseFloat($scope.modifier[showingFor][cat][i].max_quantity);

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

              // Confirm, or default, toppings image. //
              if (cat === "TOPPINGS") {
                if (!$scope.modifier[showingFor][cat][i].image) {
                  $scope.modifier[showingFor][cat][i].image = $scope.defaultToppingImage;
                }
              }

              // Save index within category. //
              $scope.modifier[showingFor][cat][i]['$index'] = i;

              // Save to reference array by id. //
              id = parseInt($scope.modifier[showingFor][cat][i].id);
              $scope.modifier.byIndex[id] = $scope.modifier[showingFor][cat][i];
              // console.log(id + ": " +
              // $scope.modifier.byIndex[id].display_name
              // + " " + $scope.modifier.byIndex[id].description);
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
        }

        $scope.modifier.showingFor = 'item';
        $scope.modifier.showing = $scope.modifier[$scope.modifier.showingFor];

        // Primary Modifier Choices/Categories for Display and Click Action //
        if (debug) {
          console.log("Primary Modifiers:");
        }

        for ( var i in $scope.modifier.showing.SIZE) {
          $scope.modifier.showing.SIZE[i].clickAction = function(mod, $event) {

            var openToppingsAfterSelectingSize = ($scope.modifier.selectedSize === null) ? true : false;
            if ($scope.modifier.selectedSize && $scope.modifier.selectedSize.size_fractional != this.size_fractional) {
              clearChoices();
            }

            $scope.modifier.selectedSize = this;

            for ( var i in $scope.modifier.primary) {
              $scope.modifier.primary[i].disabled = false;
            }

            // console.log("Size Fraction: " + this.size_fractional);
            if (this.size_fractional.match(/^Quarter/i)) {
              $scope.quarters.parts = 4;
            } else if (this.size_fractional.match(/^Half/i)) {
              $scope.quarters.parts = 2;
            } else {
              $scope.quarters.parts = 1;
            }
            if (openToppingsAfterSelectingSize && $scope.isToppings) {
              $scope.showModChoices('TOPPINGS');
            }
            $scope.quarters.full(true);

            if ($scope.sizeSelected) {
              $scope.removePrep($scope.sizeSelected, $event);
            }

            if (mod && $event) {
              $scope.sizeSelected = mod;
              $scope.choosePrep('add', mod, 1, $event);
            }

            if (!(mod && $event)) {
              $scope.updateToppingsDisplay();
            }
            // 
          };

          $scope.modifier.showing.SIZE[i].isActive = function() {
            return this === $scope.modifier.selectedSize;
          };
          $scope.modifier.primary.push($scope.modifier.showing.SIZE[i]);
        }

        $scope.modifier.primary.push({
          'display_name' : "PREPARATION",
          'clickAction' : function() {
            if (!this.disabled)
              $scope.showModChoices(this.display_name);
          },
          'isActive' : function() {
            return this.display_name === $scope.modifier.activeCategory;
          },
          'disabled' : true
        });

        if (angular.isArray(item.modifiers.EXTRA) && item.modifiers.EXTRA.length > 0) {
          $scope.modifier.primary.push({
            'display_name' : "EXTRA",
            'clickAction' : function() {
              if (!this.disabled)
                $scope.showModChoices(this.display_name);
            },
            'isActive' : function() {
              return this.display_name === $scope.modifier.activeCategory;
            },
            'disabled' : true
          });
        }

        if ($scope.isToppings) {
          $scope.modifier.primary.push({
            'display_name' : "TOPPINGS",
            'clickAction' : function() {
              if (!this.disabled)
                $scope.showModChoices(this.display_name);
            },
            'isActive' : function() {
              return this.display_name === $scope.modifier.activeCategory;
            },
            'disabled' : true
          });
        }

        if (debug)
          console.log($scope.modifier.primary);

        /*
         * console.log("Initializing Tooltips");
         * $('.has-tooltip').each(function(){ console.log(this);
         * $(this).tooltip(); //$(this).tooltip('show'); });
         */

        // Adjust top edge of Choisen Modifiers list to fit with the number of
        // categories. //
        if (debug)
          console.log("Adjusting list top for " + $scope.modifier.primary.length + " categories.");
        $('#custom-modifier-selections').css('top', $scope.modifier.primary.length * 40 + 10);

        // Finally, show the Modifiers Modal //
        $rootScope.customModifierModalVisible = true;

        // if (current && current.customModifiers &&
        // current.customModifiers.length) {
        // var currentSize = null;
        // angular.forEach(current.customModifiers, function(modifier, index) {
        // var mod = findMod(modifier.mod.id);
        //
        // if (mod.type == 'SIZE') {
        // mod.clickAction(mod, $event);
        //
        // } else {
        // if (modifier.quarters == 'W') {
        // modifier.quarters = '';
        // }
        //
        // $scope.choosePrep(modifier.prep, mod, modifier.qty, $event,
        // modifier.quarters);
        // }
        // });
        //
        // if (currentSize) {
        // }
        // }

        if (current && current.custommodifier) {

          $scope.modifier.activeCategory = current.custommodifier.modifier.activeCategory;
          $scope.modifier.selectedSize = current.custommodifier.modifier.selectedSize;

          angular.forEach(current.custommodifier.modifier.choices, function(choice) {
            if (choice.mod.type == 'SIZE') {
              choice.mod.clickAction(choice.mod, $event);
            } else {
              $scope.modifier.choice.push(choice);
            }

          });

          angular.forEach(current.custommodifier.quarters._q, function(q, i) {
            $scope.quarters._q[i] = q;
          });

          $scope.activateApplicablePreps();

          // Update Topping Quarters //
          $scope.updateToppingsDisplay();

          angular.forEach($scope.modifier.primary, function(item) {
            if (item.display_name == 'TOPPINGS') {
              item.clickAction();
            }
          });
        }

        // $scope.showModChoices();
        return true;

      }; // End of showCustomModifierModal //

      function findMod(itemId) {
        for ( var cat in $scope.modifier.showing) {
          for (var i = 0; i < $scope.modifier.showing[cat].length; i++) {
            // Choose display_name. //
            if ($scope.modifier.showing[cat][i].id == itemId) {
              return $scope.modifier.showing[cat][i];
            }

          }
        }

        return null;
      }

      // Show modifier choices when a category is tapped. //
      $scope.showModChoices = function(catToShow) {
        var debug = false;
        if (debug)
          console.log('Showing Modifier Choices: ' + catToShow);
        // Show chosen category if specified... //
        if (catToShow) {
          $scope.modifier.activeCategory = catToShow;
          // ...or current category if not specified, or default to
          // 'PREPARATION'. //
        } else if ((typeof $scope.modifier.showing[$scope.modifier.activeCategory] == 'undefined') || (!$scope.modifier.activeCategory)) {
          $scope.modifier.activeCategory = 'PREPARATION';
        }
        if (debug)
          console.log("Active Category: " + $scope.modifier.activeCategory);

        /*
         * // Clear Filters // $scope.clearSearchText(); $scope.quickFilter();
         */

        $scope.modifier.clearPrep();
        $scope.thisModPage = [];

        // Measure and fill available space with buttons. //
        window.setTimeout($scope.resetView, 1);
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
        var debug = false;
        if (debug)
          console.log("Filter pattern: " + pattern);

        // Reuse previous pattern when pattern is boolean and true. //
        if (pattern === true) {
          pattern = $scope.modifier.filter;
        }

        if (debug)
          console.log("Before:");
        if (debug)
          console.log($scope.modifier.showing[$scope.modifier.activeCategory]);
        // Filter modifiers before columnizing. //
        if (typeof pattern === 'string' && pattern.length >= 1) {
          pattern = new RegExp(pattern, 'i');
          var filteredList = [];
          for ( var i in $scope.modifier.showing[$scope.modifier.activeCategory]) {
            if (pattern.test($scope.modifier.showing[$scope.modifier.activeCategory][i].display_name)) {
              filteredList.push($scope.modifier.showing[$scope.modifier.activeCategory][i]);
            }
          }
        } else {
          filteredList = $scope.modifier.showing[$scope.modifier.activeCategory];
        }
        if (debug)
          console.log("After:");
        if (debug)
          console.log(filteredList);

        $scope.columnizeMods(filteredList);
      };

      $scope.nowFiltering = function(filterName) {
        return ($scope.modifier.filter === ("^[" + filterName + "]"));
      };

      // Slice up Modifiers according to button space. //
      $scope.columnizeMods = function(modList) {
        var debug = false;
        if (debug)
          console.log("Columnizing...");
        $scope.thisModPage = $scope.chunk(modList, $scope.modifier.maxPerPage);
        for ( var i in $scope.thisModPage) {
          $scope.thisModPage[i] = $scope.chunk($scope.thisModPage[i], $scope.modifier.maxRows);
        }
        $scope.modifier.currentPage = 1;
        $scope.modifier.numPages = $scope.thisModPage.length;
        if (debug)
          console.log("Number of Pages: " + $scope.modifier.numPages);
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
        $scope.modifier.byIndex[chosenMod.id].active = true;
        $scope.activateApplicablePreps();
      };

      $scope.rechooseMod = function(choiceInList) {
        var chosenMods = $scope.getChosenMods();
        if (chosenMods.length == 1 && chosenMods[0] == choiceInList.mod) {
          $scope.clearChosenMods();
        } else {
          $scope.chooseMod(choiceInList.mod);
          $scope.modPage(Math.floor(choiceInList.mod['$index'] / $scope.modifier.maxPerPage) + 1);
          $scope.modifier.prep[choiceInList.prep].selected = true;
        }
      };

      $scope.getChosenMods = function() {
        var chosenMods = [];
        for ( var mod in $scope.modifier.showing[$scope.modifier.activeCategory]) {
          if ($scope.modifier.showing[$scope.modifier.activeCategory][mod].active) {
            chosenMods.push($scope.modifier.showing[$scope.modifier.activeCategory][mod]);
          }
        }
        return chosenMods;
      };

      $scope.clearChosenMods = function() {
        for ( var cat in $scope.modifier.showing) {
          for ( var mod in $scope.modifier.showing[cat]) {
            $scope.modifier.showing[cat][mod].active = false;
          }
        }
        $scope.activateApplicablePreps();
      };

      $scope.choosePrep = function(chosenPrep, chosenMod, increment, clickEvent, quarter) {
        var debug = true;
        var chosenMods;
        var existing;
        var isTopping = false;

        // Stop that bubbling, now I mean it! //
        if (clickEvent)
          clickEvent.stopPropagation();

        // Default increment is +1 //
        if (!angular.isDefined(increment))
          increment = 1;

        // Use chosen modifier if specified, or all previously chosen modifiers
        // if not. //
        if (chosenMod) {
          chosenMods = [ chosenMod ];
        } else {
          chosenMods = $scope.getChosenMods();
        }

        // Special handling for TOPPINGS //
        if ($scope.modifier.activeCategory === 'TOPPINGS') {
          isTopping = true;
          var numToppings = 0;
          for ( var i in $scope.modifier.choice) {
            if ($scope.modifier.choice[i].mod.type === "TOPPINGS") {
              numToppings += Math.max($scope.modifier.choice[i].qty, 1);
            }
          }

          if (chosenPrep === 'add' && increment > 0 && numToppings >= $scope.itemToModify.toppings_max * $scope.quarters.parts) {
            $scope.alert("Max toppings for this menu item is set to " + $scope.itemToModify.toppings_max + ".");
            return;
          }
        }

        // Apply prep to chosen modifier(s). //
        for ( var mod in chosenMods) {

          // Look for existing entry. //
          inList = null;
          for ( var i in $scope.modifier.choice) {
            if ($scope.modifier.choice[i].mod.id === chosenMods[mod].id) {
              inList = i;
            }
          }

          // If it's not already there, add it. //
          if (inList === null) {
            if (!quarter) {
              if (isTopping) {
                quarter = $scope.quarters.current();
              } else {
                if ([ 'Q1', 'Q2', 'Q3', 'Q4' ].indexOf($scope.quarters.current()) != -1) {
                  quarter = '';
                } else {
                  quarter = $scope.quarters.current();
                }

              }
            }

            $scope.modifier.choice.push({
              'mod' : chosenMods[mod],
              'isTopping' : chosenMod.type.toUpperCase() == 'SIZE' ? false : isTopping,
              'quarters' : quarter,
              'prep' : chosenPrep,
              'danger' : $scope.modifier.prep[chosenPrep].danger,
              'qty' : 0,
              'extra_charge' : 0
            });
            inList = $scope.modifier.choice.length - 1;
          }

          // Adjust values according to chosen prep type. //
          if (chosenPrep === 'add') {
            chosenMods[mod].active = true;

            if ($scope.modifier.choice[inList].quarters != $scope.quarters.current()) {
              $scope.modifier.choice[inList].quarters = (isTopping) ? $scope.modifier.choice[inList].quarters + ' ' + $scope.quarters.current()
                : $scope.modifier.choice[inList].quarters;
            }

            $scope.modifier.choice[inList].prep = chosenPrep;
            $scope.modifier.choice[inList].danger = $scope.modifier.prep[chosenPrep].danger;

            if ($scope.modifier.choice[inList].quarters == $scope.quarters.current())
              $scope.modifier.choice[inList].qty += increment;

            if ($scope.modifier.choice[inList].qty < 1 && $scope.modifier.activeCategory != 'PREPARATION') {
              /*
               * chosenMods[mod].active = false; if (inList !== null) {
               * $scope.modifier.choice.splice(inList, 1); }
               */
              $scope.removePrep($scope.modifier.choice[inList]);
              return;
            } else if (inList !== null && $scope.modifier.choice[inList].qty > chosenMods[mod].max_quantity) {
              $scope.alert("Max Quantity for this modifier is set to " + chosenMods[mod].max_quantity + ".");
              $scope.modifier.choice[inList].qty = chosenMods[mod].max_quantity;
            }
          } else {
            // $scope.modifier.choice[inList].quarters = (isTopping ||
            // $scope.modifier.activeCategory === 'PREPARATION') ?
            // $scope.quarters.current() : null;
            if (!angular.isDefined($scope.modifier.choice[inList].quarters)) {
              $scope.modifier.choice[inList].quarters = '';
            }
            $scope.modifier.choice[inList].prep = chosenPrep;
            $scope.modifier.choice[inList].danger = $scope.modifier.prep[chosenPrep].danger;
            $scope.modifier.choice[inList].qty = 0;
          }
          if (chosenPrep === 'extra') {
            // Asynchronous prompt and update of extra preparation charge. //
            if ($scope.modifier.activeCategory === 'PREPARATION' && chosenMods[mod].prep_extra_charge) {
              $scope.prompt('Open Price - ' + $scope.modifier.choice[inList].mod.display_name, $scope.modifier.choice[inList], 'extra_charge');
            }
          }
        }

        // Perform action on multiple choices only once, then clear choices. //
        if (chosenMods.length > 0 && chosenPrep !== 'add') {
          $scope.clearChosenMods();
        }

        // Highlight Selected Prep Button //
        $scope.activateApplicablePreps();
        $scope.modifier.prep[chosenPrep].selected = true;

        // Update Topping Quarters //
        $scope.updateToppingsDisplay();
      }; // End of choosePrep //

      $scope.activateApplicablePreps = function() {
        // console.log("Activating Applicable Preparation Buttons");
        $scope.modifier.clearPrep();

        // Remove tooltips, if any. //
        try {
          $('[role="tooltip"]').remove();
        } catch (err) {
          console.warn(err);
        }

        var chosenMods = $scope.getChosenMods();
        if (typeof chosenMods !== 'object' || chosenMods.length == 0)
          return;

        // For TOPPINGS, only enable 'add' //
        if ($scope.modifier.activeCategory === 'TOPPINGS') {
          for ( var p in $scope.modifier.prep) {
            if (p === 'add') {
              $scope.modifier.prep[p].disabled = false;
            } else {
              $scope.modifier.prep[p].disabled = true;
            }
          }
        }

        // For all others, start with all prep types enabled. //
        else {
          for ( var p in $scope.modifier.prep) {
            $scope.modifier.prep[p].disabled = false;
          }
        }

        // Disable prep types not allowed by ANY chosen modifier. //
        for ( var mod in chosenMods) {
          for ( var p in $scope.modifier.prep) {
            $scope.modifier.prep[p].disabled = (chosenMods[mod][$scope.modifier.prep[p].property_name] && !$scope.modifier.prep[p].disabled) ? false : true;
          }
        }
      };

      $scope.removePrep = function(mod, clickEvent) {
        if (clickEvent) {
          clickEvent.preventDefault();
          clickEvent.stopPropagation();
        }
        for ( var i in $scope.modifier.choice) {
          if ($scope.modifier.choice[i].mod === mod) {
            if (mod.type.toUpperCase() == 'SIZE') {
              $scope.sizeSelected = null;
            }
            $scope.modifier.choice.splice(i, 1);
            break;
          }
        }
        $scope.clearChosenMods();
        $scope.updateToppingsDisplay();
      };

      $scope.updateToppingsDisplay = function() {
        var debug = false;
        $scope.quarters.clearChoiceRefs();
        for ( var i in $scope.modifier.choice) {
          var qtrs = (typeof $scope.modifier.choice[i].quarters === 'string') ? $scope.modifier.choice[i].quarters.split(' ') : [];
          for ( var q in qtrs) {
            // Whole Pie //
            if ($scope.quarters.parts == 1 || $scope.modifier.choice[i].mod.type.toUpperCase() == 'SIZE') {
              $scope.quarters.choiceRefs['W'].push($scope.modifier.choice[i]);
            }

            // Half Pie //
            if ($scope.quarters.parts == 2) {
              switch (qtrs[q]) {
                case 'W':
                case '':
                  if ($scope.modifier.choice[i].mod.type.toUpperCase() == 'SIZE') {
                    break;
                  }
                  $scope.quarters.choiceRefs['H1'].push($scope.modifier.choice[i]);
                  $scope.quarters.choiceRefs['H2'].push($scope.modifier.choice[i]);
                  break;
                case 'Q1':
                case 'Q2':
                  $scope.quarters.choiceRefs['H1'].push($scope.modifier.choice[i]);
                  break;
                case 'Q3':
                case 'Q4':
                  $scope.quarters.choiceRefs['H2'].push($scope.modifier.choice[i]);
                  break;
                default:
                  $scope.quarters.choiceRefs[qtrs[q]].push($scope.modifier.choice[i]);
              }
            }

            // Quarter Pie //
            if ($scope.quarters.parts == 4) {
              switch (qtrs[q]) {
                case 'W':
                case '':
                  if ($scope.modifier.choice[i].mod.type.toUpperCase() == 'SIZE') {
                    break;
                  }
                  $scope.quarters.choiceRefs['Q1'].push($scope.modifier.choice[i]);
                  $scope.quarters.choiceRefs['Q2'].push($scope.modifier.choice[i]);
                  $scope.quarters.choiceRefs['Q3'].push($scope.modifier.choice[i]);
                  $scope.quarters.choiceRefs['Q4'].push($scope.modifier.choice[i]);
                  break;
                case 'H1':
                  $scope.quarters.choiceRefs['Q1'].push($scope.modifier.choice[i]);
                  $scope.quarters.choiceRefs['Q2'].push($scope.modifier.choice[i]);
                  break;
                case 'H2':
                  $scope.quarters.choiceRefs['Q3'].push($scope.modifier.choice[i]);
                  $scope.quarters.choiceRefs['Q4'].push($scope.modifier.choice[i]);
                  break;
                default:
                  $scope.quarters.choiceRefs[qtrs[q]].push($scope.modifier.choice[i]);
              }
            }
          }
        }

        if (debug)
          console.log($scope.quarters.choiceRefs);
      };

      $scope.cancel = function() {
        $rootScope.customModifierModalVisible = false;
        $scope.clearChosenMods();
      };

      $scope.keyboard = function() {
        var txt = $('#customModifierNotes > textarea');
        var kb = txt.getkeyboard();
        if (typeof kb === 'undefined') {
          txt.keyboard({
            openOn : null,
            stayOpen : true,
            layout : 'qwerty',
            position : {
              of : '#menuItemCustomModifiersModalBody',
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
      $scope.assessButtonSpace = function(selector) {
        var debug = false;
        if (debug)
          console.log("Assessing Button Space...");
        if (debug)
          console.log("Selector: " + selector);
        var divHeight = $(selector).height();
        if (debug)
          console.log("Div Height: " + divHeight);
        $scope.modifier.maxRows = Math.floor((divHeight + 5) / $scope.buttonHeight);
        if (debug)
          console.log("Max Rows: " + $scope.modifier.maxRows);
        var bootstrapSize = $rootScope.getBoostrapSize();
        if (debug)
          console.log("Bootstrap Size: " + bootstrapSize);
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
        if (debug)
          console.log("Max Columns: " + $scope.modifier.maxCols);
        $scope.modifier.maxPerPage = $scope.modifier.maxCols * $scope.modifier.maxRows;
        if (debug)
          console.log("Max per Page: " + $scope.modifier.maxPerPage);
      };

      $scope.snapPaginators = function() {
        var h = $($scope.selector['buttonsRight']).outerHeight();
        $('.paginators').css('top', (Math.floor(h / $scope.buttonHeight) - 2) * $scope.buttonHeight);
        // $('.paginators').css('top', ( $scope.modifier.maxRows *
        // $scope.buttonHeight - 5 ) - ( $scope.buttonHeight * 2 - 5 ) );
      };

      // Recalculate pages and columns of buttons. //
      $scope.resetView = function(callback) {
        $timeout(function() {
          if ($rootScope.customModifierModalVisible) {
            $scope.assessButtonSpace($scope.selector[$scope.modifier.activeCategory]);
            $scope.filterMods(true);
            $scope.snapPaginators();
            $scope.$digest();
          }

          if (typeof callback == 'function') {
            callback();
          }
        }, 1);
      };
      $(window).resize($scope.resetView);

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

      $scope.chunk = function(a, chunkSize) {
        if (!chunkSize || chunkSize < 1)
          throw "Chunk size must be a positive integer! Received " + chunkSize;
        var chunks = [];
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

      $scope.applyModifier = function() {
        $rootScope.customModifierModalVisible = false;

        var arrDisplay = [];

        angular.forEach($scope.quarters.choiceRefs, function(items, quarter) {
          angular.forEach(items, function(item, index) {
            var choice = {
              quarter : quarter,
              item : item
            };

            arrDisplay.push(choice);
          });
        });

        var choices = [];
        angular.forEach($scope.modifier.choice, function(choice) {
          choices.push(choice);
        });

        var _q = [];
        angular.forEach($scope.quarters._q, function(q) {
          _q.push(q);
        });

        $rootScope.$broadcast('add-custom-modifiers', {
          choices : arrDisplay,
          message_to_chef : $scope.message_to_chef,
          custommodifier : {
            quarters : {
              current : $scope.quarters.current(),
              _q : _q,
            },
            modifier : {
              activeCategory : $scope.modifier.activeCategory,
              choices : choices,
              selectedSize : $scope.modifier.selectedSize
            }
          }

        });

        $scope.modifier.choice = [];
      };

      function clearChoices() {
        angular.forEach($scope.quarters.choiceRefs, function(items, quarter) {
          $scope.quarters.choiceRefs[quarter] = [];
        });

        $scope.modifier.choice = [];
      }
      $scope.$watch('modifier.selectedSize.size_fractional', function(newValue, oldValue) {
        if (angular.isDefined(oldValue)) {

        }

        // $scope.$broadcast('CHANGING CHOICES');
      });

      $scope.$watch('modifier.choice.length', function() {
        // $scope.$broadcast('CHANGING CHOICES');
      });
      // $scope.$watch('quarters.choiceRefs', function() {
      // $scope.$broadcast('CHANGING CHOICES');
      // });

      $scope.$on('CHANGING CHOICES', function() {
        var arrDisplay = [];

        if (!$scope.modifier || !$scope.modifier.selectedSize) {
          $scope.listChoices = arrDisplay;
          return;
        }

        angular.forEach($scope.quarters.choiceRefs, function(items, quarter) {
          angular.forEach(items, function(item, index) {
            var choice = {
              quarter : quarter,
              item : item
            };

            arrDisplay.push(choice);
          });
        });

        $scope.listChoices = arrDisplay;
      });

      // Initialization of Tool Tips //
      $(function() {
        $('#menuItemCustomModifiersModal').tooltip({
          selector : '.has-tooltip'
        });
      });
    });

})();