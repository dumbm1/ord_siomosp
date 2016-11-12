/**
 * Adobe ExtendScript for Illustrator CS4+
 * (c) Marat Shagiev
 * e-mail: m_js@bk.ru
 * 11.11.2016
 *
 * The generator of the box with the edges connectors of the type "finger" for laser cutting
 * */

//todo: rewrite as OOP
//todo: select API
//todo: make version 2.0.0

//@target illustrator

(function boxFingerJointsMaker() {

  var store       = new Store();
  var previewFlag = false;

  var win = new Window('dialog', 'Box Finger Joints Maker');
  var pan = win.add('panel', undefined, 'Box parameters');

  pan.alignChildren = 'right';

  var unitsGr       = pan.add('group');
  var widthGr       = pan.add('group');
  var heightGr      = pan.add('group');
  var depthGr       = pan.add('group');
  var mathThickGr   = pan.add('group');
  var fingerWidthGr = pan.add('group');

  var btnGr = win.add('group');

  unitsGr.add('statictext', undefined, 'Units');
  widthGr.add('statictext', undefined, 'Box width');
  heightGr.add('statictext', undefined, 'Box height');
  depthGr.add('statictext', undefined, 'Box depth');
  mathThickGr.add('statictext', undefined, 'Matherial thickness');
  fingerWidthGr.add('statictext', undefined, 'Finger width');

  win.units = unitsGr.add('dropdownlist', [0, 0, 100, 20], ['mm', 'pt']);
  win.boxW  = widthGr.add('edittext', [0, 0, 100, 20]);
  win.boxH  = heightGr.add('edittext', [0, 0, 100, 20]);
  win.boxD  = depthGr.add('edittext', [0, 0, 100, 20]);
  win.thick = mathThickGr.add('edittext', [0, 0, 100, 20]);
  win.tabW  = fingerWidthGr.add('edittext', [0, 0, 100, 20]);

  win.units.selection = 1;

  var okBtn      = btnGr.add('button', undefined, 'OK');
  var cancelBtn  = btnGr.add('button', undefined, 'Cancel');
  var previewBtn = btnGr.add('button', undefined, 'Preview');

  store.setFaceValues(win);

  okBtn.onClick = function() {
    store.setIniValues(win);
    if (!previewFlag) {
      var opts = store.getFaceValues(win);
      var core = new Core(opts);
      core.makeBox();
    }
    win.close();
  }

  previewBtn.onClick = function() {
    var opts = store.getFaceValues(win);
    var core = new Core(opts);
    if (previewFlag) {
      undo();
      core.makeBox();
      win.update();
      redraw();
    } else {
      core.makeBox();
      win.update();
      redraw();
      previewFlag = true;
    }
  }

  cancelBtn.onClick = function() {
    if (previewFlag) {
      undo();
    }
    win.close();
  }

  win.show();

  /**
   * operating with varlues of the panel
   * and save settings on ini-file
   * path to save is relatively:
   * * userData/LocalStorage/boxFingerJoints/boxFingerJoints.ini
   *
   * @method{setFaceValues} load the values to interface from ini-file or from defaults object
   * @method{
   * @constructor
   *
   * */
  function Store() {
    /**
     * @public
     * @param {Window} win - ExtendScript UI class object
     * */
    this.setFaceValues = function(win) {
      var values = _getIniValues();

      for (var key in values) {
        if (key == "units") {
          win[key].selection = +values[key];
          continue;
        }
        win[key].text = values[key];
      }
    }
    /**
     * @public
     * @param {Window} win - ExtendScript UI class object
     * */
    this.setIniValues = function(win) {
      var iniFile  = _getIniFile();
      var faceOpts = this.getFaceValues(win);
      var defaults = new Defaults();

      _clearIni(iniFile);

      iniFile.open('w');

      for (var key in defaults) {
        var iniKey = key;
        var iniVal = faceOpts[key];

        if (iniVal === '') {
          iniVal = defaults[key];
        }
        iniFile.writeln(iniKey);
        iniFile.writeln(iniVal);
      }
      iniFile.close();
    }
    /**
     * @public
     * @param {Window} win - ExtendScript UI class object
     * @return {Object} opts - values of interface
     * */
    this.getFaceValues = function(win) {
      var opts = new Defaults();
      for (var key in opts) {
        if (key == "units") {
          opts[key] = win[key].selection.index;
          continue;
        }
        opts[key] = win[key].text;
      }
      return opts;
    }
    /**
     * make the default values for the interface
     *
     * @constructor
     * */
    function Defaults() {
      this.units = 1;
      this.boxW  = 100;
      this.boxH  = 100;
      this.boxD  = 100;
      this.thick = 5;
      this.tabW  = 10;
    }

    /**
     * get or create ini-file where storing the interface values
     *
     * @private
     * */
    function _getIniFile() {
      var storageFolder = new Folder(Folder.userData + '/LocalStorage/boxFingerJoints/');
      if (!storageFolder.exists) {
        storageFolder.create();
      }
      var iniFile = new File(storageFolder.fullName + '/boxFingerJoints.ini');
      if (!iniFile.exists) {
        iniFile.open('w');
        iniFile.close();
      }
      return iniFile;
    }

    /**
     * clear ini-file through deletion and recreation
     *
     * @private
     * @param {File} f - Object of the ExtendScript File class
     * */
    function _clearIni(f) {
      f.remove();
      f.open('w');
      f.close();
    }

    /**
     * read {key: value} from ini-file
     * odd lines are keys, even lines are values
     *
     * @private
     * @return {Object} opts - values that paste to interface
     * */
    function _getIniValues() {
      var opts    = new Defaults();
      var iniFile = _getIniFile();

      iniFile.open('r');

      for (var value in opts) {
        var key = iniFile.readln();
        var val = iniFile.readln();
        if (key === '') continue;
        if (val === '') continue;
        opts[key] = val;
      }
      iniFile.close();
      return opts;
    }

  }

  /**
   * construct box
   *
   * @constructor
   * @method {makeBox}
   * */
  function Core(opts) {
    _addPntsArrayMethods();

    var PT_TO_MM = 2.834645668,
        PT       = 1,
        unitsFactor;

    var units = +opts.units;

    switch (units) {
      case 0:
        unitsFactor = PT_TO_MM;
        break;
      case 1:
        unitsFactor = PT;
        break;
      default:
        unitsFactor = PT;
        break;
    }

    var boxW  = +opts.boxW * unitsFactor,
        boxH  = +opts.boxH * unitsFactor,
        boxD  = +opts.boxD * unitsFactor,
        tabW  = +opts.tabW * unitsFactor,
        thick = +opts.thick * unitsFactor,

        lay   = activeDocument.activeLayer;
    /**
     * @public
     * */
    this.makeBox = function() {
      _addBoxShape('frontal', 0, 0);
      _addBoxShape('frontal', boxW, 0);
      _addBoxShape('side', boxW * 2, 0);
      _addBoxShape('side', boxW * 2, -boxH);
      _addBoxShape('horizontal', 0, -boxH);
      _addBoxShape('horizontal', boxW, -boxH);
    }

    /**
     * adds one wall of the box to the specified location
     *
     * @private
     * @param {String} dimCase - 'front', 'back', 'right', 'left', 'bottom', 'top'
     * @param {Number} x - top-left coordinate of the shape
     * @param {Number} y - top-left coordinate of the shape
     * */
    function _addBoxShape(dimCase, x, y) {
      var resPnts = _getShapePnts();
      _addShape(resPnts);
      /**
       * @return {Array} resPnts - array of points [[x0, y0], [x1, y1], ... [xn, yn]]
       * */
      function _getShapePnts() {
        var topPnts,
            rightPnts,
            bottPnts,
            leftPnts;

        switch (dimCase) {
          case 'frontal':
            topPnts   = _getBasePnts({
              boxDim: boxW, x: x, y: y
            });
            rightPnts = _getBasePnts({
              boxDim: boxH, x: x, y: y
            }).rotatePnts(true).mvPnts(boxW, null);
            bottPnts  = _getBasePnts({
              boxDim: boxW, x: x, y: y
            }).reflectPnts(null, y).mvPnts(null, boxH).reverse();
            leftPnts  = _getBasePnts({
              boxDim: boxH, x: x, y: y
            }).rotatePnts(true).reflectPnts(x, null).reverse();
            break;

          case 'side':
            topPnts   = _getBasePnts({
              boxDim: boxD, x: x, y: y, shftExtrmX: thick
            });
            rightPnts = _getBasePnts({
              boxDim: boxH, x: x, y: y
            }).rotatePnts(true).reflectPnts(x - thick / 2, null).mvPnts(boxD, null);
            bottPnts  = _getBasePnts({
              boxDim: boxD, x: x, y: y, shftExtrmX: thick
            }).reflectPnts(null, y).mvPnts(null, boxH).reverse();
            leftPnts  = _getBasePnts({
              boxDim: boxH, x: x, y: y
            }).rotatePnts(true).mvPnts(thick, null).reverse();
            break;

          case 'horizontal':
            topPnts   = _getBasePnts({
              boxDim: boxW, x: x, y: y, shftExtrmX: thick
            }).reflectPnts(null, y - thick / 2);
            rightPnts = _getBasePnts({
              boxDim: boxD, x: x, y: y
            }).rotatePnts(true).reflectPnts(x - thick / 2, null).mvPnts(boxW, null);
            bottPnts  = _getBasePnts({
              boxDim: boxW, x: x, y: y, shftExtrmX: thick
            }).mvPnts(null, boxD - thick).reverse();
            leftPnts  = _getBasePnts({
              boxDim: boxD, x: x, y: y
            }).rotatePnts(true).mvPnts(thick, null).reverse();
            break;

          default:
            break;
        }

        rightPnts.splice(0, 1);
        rightPnts.splice(rightPnts.length - 1);
        leftPnts.splice(0, 1);
        leftPnts.splice(leftPnts.length - 1);

        var resPnts = topPnts.concat(rightPnts, bottPnts, leftPnts);
        return resPnts;
      }
    }

    /**
     * add the path item and set attributes to
     *
     * @private
     * @param {Array} pnts - array of points [[x0, y0], [x1, y1], ... [xn, yn]]
     * @return {PathItem} shape - object of Illustrator's class PathItem
     * */
    function _addShape(pnts) {
      var fillCol = new CMYKColor();
      var strkCol = new CMYKColor();

      fillCol.cyan   = 30;
      fillCol.yellow = 90;
      strkCol.black  = 99;

      var shape = lay.pathItems.add();
      shape.setEntirePath(pnts);
      shape.closed      = true;
      shape.fillColor   = fillCol;
      shape.strokeColor = strkCol;
      shape.strokeWidth = 0.1;
      return shape;
    }

    /**
     * get width or height points
     *
     * @private
     * @param {{shftExtrmX: {Number}, boxDim: {Number}, x: {Number}, y: {Number}}} opts
     * @return {Array} points - array of points to the base path item
     * */
    function _getBasePnts(opts) {
      var shiftExtremeX = opts.shftExtrmX || 0;
      var boxDimension  = opts.boxDim || 100;
      var x             = opts.x || 0;
      var y             = opts.y || 0;
      var i;

      var points        = [],
          centerTabW    = tabW,
          margTabW,
          centerTabNumb = Math.ceil(boxDimension / centerTabW) - 5;

      /**
       * check the correctness of the box values
       * */
      if (centerTabNumb < 2) {
        centerTabW    = boxDimension / 5;
        centerTabNumb = 1;
        margTabW      = centerTabW;
      } else {
        if (!(centerTabNumb % 2)) {
          centerTabNumb -= 1;
        }
        margTabW = (boxDimension - centerTabW * centerTabNumb) / 4;
      }
      /**
       * for first margin points
       * */
      points.push([x, y], [x + margTabW, y], [x + margTabW, y - thick], [x + margTabW * 2, y - thick]);
      x += margTabW * 2;
      /**
       * center
       * */
      for (i = 0; i < centerTabNumb; i++) {
        if ((i % 2)) {
          points.push([x + centerTabW, y - thick]);
        } else {
          points.push([x, y], [x + centerTabW, y], [x + centerTabW, y - thick]);
        }
        x += centerTabW;
      }
      /**
       * three last margin points
       * */
      points.push(
        [x + margTabW, y - thick], [x + margTabW, y], [x + margTabW * 2, y]);

      if (shiftExtremeX) {
        points[0][0] += shiftExtremeX;
        points[points.length - 1][0] -= shiftExtremeX;
      }

      return points;
    }

    /**
     * adds methods to Array.protorype for usable call of it's
     *
     * @private
     * */
    function _addPntsArrayMethods() {
      var i;
      /**
       * change in situ array of point [ [x,y], [x1,y1], ..., [xn, yn] ]
       * mirror each value by axis value
       *
       * @param {Number, Null} axisX
       * @param {Number, Null} axisY
       * */
      Array.prototype.reflectPnts = function(axisX, axisY) {
        if (axisX !== null) {
          for (i = 0; i < this.length; i++) {
            this[i][0] = axisX * 2 - this[i][0];
          }
        }
        if (axisY !== null) {
          for (i = 0; i < this.length; i++) {
            this[i][1] = axisY * 2 - this[i][1];
          }
        }
        return this;
      }
      /**
       * change in situ array of point [ [x,y], [x1,y1], ..., [xn, yn] ]
       * increase each value by delta value
       *
       * @param {Number, Null} deltaX
       * @param {Number, Null} deltaY
       * */
      Array.prototype.mvPnts = function(deltaX, deltaY) {
        if (deltaX !== null) {
          for (i = 0; i < this.length; i++) {
            this[i][0] += deltaX;
          }
        }
        if (deltaY !== null) {
          for (i = 0; i < this.length; i++) {
            this[i][1] -= deltaY;
          }
        }
        return this;
      }
      /**
       * rotate to 90° clockwase or counterclockwise about start of points array
       *
       * @param {Boolean} clockwise - if false rotate is counterclockwise
       * */
      Array.prototype.rotatePnts = function(clockwise) {
        var x0 = this[0][0],
            y0 = this[0][1];
        var x, y;

        if (clockwise) {
          for (i = 1; i < this.length; i++) {
            x = this[i][0];
            y = this[i][1];

            this[i][0] = (y - y0) + x0;
            this[i][1] = (x0 - x) + y0;

          }
        } else {
          for (i = 1; i < this.length; i++) {
            x = this[i][0];
            y = this[i][1];

            this[i][0] = (y0 - y) + x0;
            this[i][1] = (x - x0) + y0;
          }
        }
        return this;
      }

    }

  }
}() );
