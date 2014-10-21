;(function($,undefined) {
  var RadialContextMenu = function($menuContainer, options) {
    this.$menuContainer = $menuContainer;
    this.menuArray = [];

    this.__init(options);

    $menuContainer.data(this.properties.name, this);
  };

  RadialContextMenu.prototype.properties = {
    name: 'radialContextMenu',
    itemPositioning: {
      top: 1,
      bottom: 2,
      circle: 3
    }
  };

  RadialContextMenu.prototype.__init = function(options) {
    this.options = {
      showOnInit: true,
      bindMenu: false,
      container: 'body',
      touchDevice: false,
      styles: {
        offset: {},
        menuWidth: 250,
        itemRadius: 20,
        itemRadiusMargin: 5
      },
      items: {
        def: {
          selector: 'a',
          slots: 12
        }
      },
      menu: {}
    };

    if (!!options) {
      $.extend(this.options.styles, options.styles);
      if (!!options.container)
        this.options.container = options.container;

      this.options.showOnInit = options.showOnInit;
      this.options.touchDevice = options.touchDevice;
      this.options.items.bottomItems = options.bottomItems;
      this.options.items.topItems = options.topItems;
      this.options.bindMenu = options.bindMenu;
      this.options.dontBindClickOutside = options.dontBindClickOutside;
      this.options.noClickOutsideSelector = options.noClickOutsideSelector ? '.circular-menu,' + options.noClickOutsideSelector : '.circular-menu';
    }

    this.__getCompiledStyles();
    this.__setStyles();

    if (this.options.bindMenu)
      this.__bindContextMenu();

    if (!this.options.dontBindClickOutside)
      this.__bindClickOutside();
  };

  RadialContextMenu.prototype.invoke = function(menu, position) {
    this.__initialize(menu);
    this.toggle(this.options.showOnInit, position);
  };

  RadialContextMenu.prototype.__compareMenuSet = function(newMenuSet) {
    this.isMenuInitialized = false;
    if (!this.options.menu) {
      this.options.menu = newMenuSet;
      return;
    }

    this.isMenuInitialized = this.__compareObjects(this.options.menu, newMenuSet);

    if (!this.isMenuInitialized)
      this.options.menu = newMenuSet;
  };

  RadialContextMenu.prototype.__compareObjects = function(object1, object2) {
    var oSelf = this;
    if (_.isEmpty(object1))
      return _.isEmpty(object1) && _.isEmpty(object2);

    return _.each(object1, function(value, key) {
      if (typeof value === 'object')
        return typeof object2[key] === 'object' && oSelf.__compareObjects(value, object2[key]);

      return object2[key] === value;
    });
  };

  RadialContextMenu.prototype.__bindContextMenu = function() {
    var oSelf = this;
    $(this.options.container).on('contextmenu', function(ev) {
      ev.preventDefault();

      oSelf.toggle(true, {
        top: ev.clientY,
        left: ev.clientX
      });
    });
  };

  RadialContextMenu.prototype.__bindClickOutside = function() {
    var oSelf = this;
    $('body').on('click.contextMenuOuterClick', function(e) {
      if ($(e.target).closest(oSelf.options.noClickOutsideSelector).length === 0)
        oSelf.toggle(false);
    });
  };

  RadialContextMenu.prototype.__positionItems = function(positioningType, $items, slots) {
    var actualItemsCount = $items && $items.length || 0;

    var totalItemsCount = slots * 2 || this.options.items.def.slots;
    if (totalItemsCount < actualItemsCount * 2) totalItemsCount = actualItemsCount * 2;

    for(var i = 0; i < actualItemsCount; i++) {
      var position = this.__getItemPosition(i, totalItemsCount, actualItemsCount, positioningType);
      $items[i].style.left = position.left;
      $items[i].style.top = position.top;
    }
  };

  RadialContextMenu.prototype.__initialize = function(menuSet) {
    this.__compareMenuSet(menuSet);
    if (this.isMenuInitialized) {
      this.__showItems(0);
      return;
    }

    this.allItems = this.$menuContainer.find('.circle a, .menu-button >');

    this.menuArray = [];
    this.__convertMenuObject(menuSet);

    var oSelf = this;

    var eventType = this.options.touchDevice ? 'touchend' : 'click';
    $.each(this.menuArray, function(index, menu) {
      oSelf.__positionItems(oSelf.properties.itemPositioning.circle, menu.items);
      if (!!menu.subMenus)
        for (var i = 0; i < menu.subMenus.length; i++) {
          oSelf.__bindSubMenuControl(menu.subMenus[i]);
        }

      if (menu.parentIndex !== undefined) {
        oSelf.menuArray[menu.parentIndex].invokeControl.off(eventType).on(eventType, function() {
          oSelf.toggle(false);
          setTimeout(function() {
            oSelf.__showItems(menu.parentIndex);
            oSelf.toggle(true);
          }, 220);
        });
      }
    });
    this.__showItems(0);
  };

  RadialContextMenu.prototype.__bindSubMenuControl = function(subMenu) {
    var eventType = this.options.touchDevice ? 'touchstart' : 'click';
    var oSelf = this;
    subMenu.control.off(eventType).on(eventType, function() {
      oSelf.toggle(false);
      setTimeout(function() {
        oSelf.__showItems(subMenu.index);
        oSelf.toggle(true);
      }, 220);
    });
  };
  /**
   *
   * @param menu menu object in following format:
   * {
      itemSelectors: ['.item1']                  - list of jquery selectors for menu items
      invokeControlSelector: ".fromChildControl" - jquery selector for 'back' button
      subMenus:                                  - list of submenus
        [
         {
           itemSelectors: [...],
           invokeControlSelector: "",
           invokeFromParentControlSelector: "1fromParentControl", - jquery selector for control invoking menu from parent menu
           subMenus: [...]
         }
       ]
     };

   * @param parentMenuIndex
   * @private
   * @method sets menuArray property in following format:
   [
     {
       items: [${}, ${}], - jquery objects representing menu items
       invokeControl: ${} - jquery object representing "back" button in child menus
       subMenus:
      [
        {index:1,         - subMenu index in menuArray property
         control: {}      - jquery objects representing parent menu item invoking submenu
        }
      ]
     },
     {
      items: [{}, {}],
       parentIndex: 0     - parent menu index in menuArray property
     }
   ]
   *
   */
  RadialContextMenu.prototype.__convertMenuObject = function(menu, parentMenuIndex) {
    var oSelf = this;
    var menuItem = {parentIndex: parentMenuIndex};
    var menuIndex = this.menuArray.length;

    if (menu.itemSelectors) {
      menuItem.items = this.$menuContainer.find(menu.itemSelectors.join(','));
    }

    if (menu.invokeControlSelector) {
      menuItem.invokeControl = this.$menuContainer.find(menu.invokeControlSelector);
    }

    if (parentMenuIndex !== undefined && menu.invokeFromParentControlSelector) {
      this.menuArray[parentMenuIndex].subMenus = this.menuArray[parentMenuIndex].subMenus || [];
      this.menuArray[parentMenuIndex].subMenus.push({index: menuIndex, control: this.$menuContainer.find(menu.invokeFromParentControlSelector)});
    }

    this.menuArray.push(menuItem);
    if (menu.subMenus) {
      $.each(menu.subMenus, function(index, submenu) {
        oSelf.__convertMenuObject(submenu, menuIndex);
      });
    }
  };

  RadialContextMenu.prototype.__hideAllItems = function() {
    this.allItems.hide();
  };

  RadialContextMenu.prototype.__showItems = function(menuIndex) {
    if (!this.menuArray[menuIndex])
      return;

    this.__hideAllItems();

    this.menuArray[menuIndex].items && this.menuArray[menuIndex].items.show();

    if (this.menuArray[menuIndex].subMenus)
      $.each(this.menuArray[menuIndex].subMenus, function(idx, subMenu) {
        subMenu.control.show();
      });

    if (this.menuArray[menuIndex].parentIndex !== undefined)
      this.menuArray[this.menuArray[menuIndex].parentIndex].invokeControl.show();
  };

  RadialContextMenu.prototype.__getCompiledStyles = function() {
    var oSelf = this;
    this.compiledStyles = {
      itemCircleRadius: oSelf.options.styles.menuWidth / 2 - oSelf.options.styles.itemRadius - oSelf.options.styles.itemRadiusMargin,
      menuCenter: oSelf.options.styles.menuWidth / 2,
      outerCircleBorderWidth: oSelf.options.styles.itemRadius * 2 + oSelf.options.styles.itemRadiusMargin * 2
    };
  };

  RadialContextMenu.prototype.__getItemPosition = function(itemIdx, totalItemsCount, actualItemsCount, position) {
    var radialPosition = this.__getRadialPosition(itemIdx, totalItemsCount, actualItemsCount, position);

    return {
      top: (this.compiledStyles.menuCenter - radialPosition.top * this.compiledStyles.itemCircleRadius).toFixed() + 'px',
      left: (this.compiledStyles.menuCenter - radialPosition.left * this.compiledStyles.itemCircleRadius).toFixed() + 'px'
    }
  };

  RadialContextMenu.prototype.__getRadialPosition = function(itemIdx, totalItemsCount, actualItemsCount, position) {
    if (position === this.properties.itemPositioning.circle) {
      return {
        left: Math.cos(0.5 * Math.PI + 2 * itemIdx * Math.PI / actualItemsCount),
        top: Math.sin(0.5 * Math.PI + 2 * itemIdx * Math.PI / actualItemsCount)
      }
    }

    var offset = 0.5;
    var offsetSign = (position === this.properties.itemPositioning.top) ? 1 : -1;
    var equationSign = (position === this.properties.itemPositioning.top) ? -1 : 1;
    return {
      left: Math.cos(Math.PI * (offset * offsetSign + equationSign * (actualItemsCount - 1 - 2 * itemIdx) / totalItemsCount)),
      top:  Math.sin(Math.PI * (offset * offsetSign + equationSign * (actualItemsCount - 1 - 2 * itemIdx) / totalItemsCount))
    };
  };

  RadialContextMenu.prototype.__setStyles = function() {
    var oSelf = this;
    this.$menuContainer.css({
      "width": oSelf.options.styles.menuWidth + 'px',
      "height": oSelf.options.styles.menuWidth + 'px'
    });
    this.$menuContainer.find('.circle').css({
      "border-radius": oSelf.options.styles.menuWidth / 2 + "px"
    });
    this.$menuContainer.find('.outer-circle').css({
      "border-width": oSelf.compiledStyles.outerCircleBorderWidth + "px",
      "border-radius": oSelf.options.styles.menuWidth / 2 + "px"
    });
    this.$menuContainer.find('.circle a').css({
      "width": oSelf.options.styles.itemRadius * 2 + "px",
      "height": oSelf.options.styles.itemRadius * 2 + "px",
      "margin-top": -oSelf.options.styles.itemRadius + "px",
      "margin-left": -oSelf.options.styles.itemRadius + "px"
    });
    this.$menuContainer.find('.inner-circle').css({
      "top": oSelf.compiledStyles.outerCircleBorderWidth + "px",
      "left": oSelf.compiledStyles.outerCircleBorderWidth + "px",
      "height": (oSelf.options.styles.menuWidth - 2 * oSelf.compiledStyles.outerCircleBorderWidth)+ 'px',
      "width": (oSelf.options.styles.menuWidth - 2 * oSelf.compiledStyles.outerCircleBorderWidth)+ 'px'
    });
  };

  RadialContextMenu.prototype.toggle = function(bSet, position) {
    if (!!position) {
      var menuPosition = {left: position.left, top: position.top};
      var windowHeight = $(window).height();
      var windowWidth = $(window).width();
      var offsetTop = this.options.styles && this.options.styles.offset && this.options.styles.offset.top || 0;

      if (position.left + this.options.styles.menuWidth / 2 > windowWidth)
        menuPosition.left = windowWidth - this.options.styles.menuWidth / 2;
      if (position.left - this.options.styles.menuWidth / 2 < 0)
        menuPosition.left = this.options.styles.menuWidth / 2;

      if (position.top + this.options.styles.menuWidth / 2 > windowHeight)
        menuPosition.top = windowHeight - this.options.styles.menuWidth / 2;
      if (position.top - this.options.styles.menuWidth / 2 < offsetTop)
        menuPosition.top = this.options.styles.menuWidth / 2 + offsetTop;

      this.$menuContainer.css({
        top: (menuPosition.top - this.options.styles.menuWidth / 2) + 'px',
        left: (menuPosition.left - this.options.styles.menuWidth / 2) + 'px'
      });
    }

    if (typeof bSet === 'undefined') {
      this.$menuContainer[0].classList.toggle('open');
      return;
    }

    if (bSet) {
      this.$menuContainer[0].classList.add('open');
      return;
    }

    this.$menuContainer[0].classList.remove('open');
  };

  $.fn.radialContextMenu = function(options) {
    new RadialContextMenu(this, options);
    return this;
  }
})(jQuery);