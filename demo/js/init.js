var _ContextMenuManager = function() {};

_ContextMenuManager.prototype.itemsSelectors = {
  generatePDF: '.generate-pdf',
  generatePHOTO: '.generate-photo',

  addConnector: '.add-connector',
  addCurvedConnector: '.add-curved-connector',
  addRectangle: '.add-rectangle',
  addEllipse: '.add-ellipse',

  shapesMenu: '.shapes-menu',
  addNote: '.add-note',
  addLabel: '.add-label',
  addActionList: '.add-action-list',
  addImage: '.add-image',
  addVideo: '.add-video',
  uploadFile: '.upload-file',
  importCSV: '.import-csv-txt',

  changeCanvasBackgroundWhite : '.bg-canvas[data-canvas="white"]',
  changeCanvasBackgroundCork : '.bg-canvas[data-canvas="cork"]',
  changeCanvasBackgroundBlue : '.bg-canvas[data-canvas="blue"]',
  changeCanvasBackgroundGreen : '.bg-canvas[data-canvas="green"]',
  changeCanvasBackgroundBlueLined : '.bg-canvas[data-canvas="blue-lined"]',
  changeCanvasBackgroundWhiteLined : '.bg-canvas[data-canvas="white-lined"]',
  changeCanvasBackgroundBlueGraph : '.bg-canvas[data-canvas="blue-graph"]',
  changeCanvasBackgroundWhiteGraph : '.bg-canvas[data-canvas="white-graph"]'
};

_ContextMenuManager.prototype.setMenuContainer = function($menuContainer) {
  this.$menuContainers = this.$menuContainers || {};
  var menuType = 'canvas';
  this.$menuContainers[menuType] = $menuContainer;
  var options = {
    touchDevice: false,
    styles: {
      offset: {
        top: 0
      },
      menuWidth: 250,
      itemRadius: 30,
      itemRadiusMargin: 5
    },
    noClickOutsideSelector: '.settings-link'
  };
  this.$menuContainers[menuType].radialContextMenu(options);
};

_ContextMenuManager.prototype.invokeMenu = function(x, y, params) {
  this.hideMenu();

  var menuType = 'canvas';
  var menuOptions = this.__composeCanvasMenu();
  this.$menuContainers[menuType].find('input').val("");
  this.$menuContainers[menuType].data('radialContextMenu').invoke(menuOptions, {left:x, top:y});
};

_ContextMenuManager.prototype.hideMenu = function() {
  _.each(this.$menuContainers, function($container) {
    $container.data('radialContextMenu').toggle(false);
  });
};

_ContextMenuManager.prototype.__composeCanvasMenu = function(canvasId) {
  return {
    itemSelectors: [
      this.itemsSelectors.generatePDF,
      this.itemsSelectors.generatePHOTO,
      this.itemsSelectors.shapesMenu,
      this.itemsSelectors.addNote,
      this.itemsSelectors.addLabel,
      this.itemsSelectors.addActionList,
      this.itemsSelectors.addImage,
      this.itemsSelectors.addVideo,
      this.itemsSelectors.uploadFile,
      this.itemsSelectors.importCSV
    ],
    invokeControlSelector: ".main-menu",
    subMenus: [
      {itemSelectors:
        [
          this.itemsSelectors.changeCanvasBackgroundWhite,
          this.itemsSelectors.changeCanvasBackgroundCork,
          this.itemsSelectors.changeCanvasBackgroundBlue,
          this.itemsSelectors.changeCanvasBackgroundGreen,
          this.itemsSelectors.changeCanvasBackgroundBlueLined,
          this.itemsSelectors.changeCanvasBackgroundWhiteLined,
          this.itemsSelectors.changeCanvasBackgroundBlueGraph,
          this.itemsSelectors.changeCanvasBackgroundWhiteGraph
        ],
        invokeFromParentControlSelector: ".colors-menu",
        parentIndex: 0
      },
      {
        itemSelectors: [
          this.itemsSelectors.addConnector,
          this.itemsSelectors.addCurvedConnector,
          this.itemsSelectors.addRectangle,
          this.itemsSelectors.addEllipse
        ],
        invokeFromParentControlSelector: this.itemsSelectors.shapesMenu,
        parentIndex: 0
      }
    ]
  };
};

ContextMenuManager = new _ContextMenuManager();