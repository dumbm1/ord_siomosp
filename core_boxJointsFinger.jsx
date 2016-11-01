/**
 * ExtendScript Adobe Illustrator CS4+
 * (c)MaratShagiev m_js@bk.ru
 * The generator of the box with the edges connectors of the type "finger"
 *
 * core
 * */

//@target illustrator

/**
 * values are taken from the interface
 * */
var options = {
  boxW : 100,
  boxH : 125,
  boxD : 60,
  tabW : 10,
  thick: 5,
  units: 'pt'
}
/**
 * GLOBAL_CONSTANTS
 * */
PT_TO_MM = 2.834645668;
MM_TO_PT = 0.352777778;

(function genBoxFingerJoints (opts) {

  addPointsMethods ();

  var boxW  = opts.boxW || 115,
      boxH  = opts.boxH || 70,
      boxD  = opts.boxD || 60,
      tabW  = opts.tabW || 7,
      thick = opts.thick || 3;

  var doc = activeDocument,
      lay = doc.activeLayer;

  var frontPnts = getShapePnts ('front', 0, 0);
  var backPnts  = getShapePnts ('back', boxW, 0);
  var rightPnts = getShapePnts ('right', boxW * 2, 0);
  var leftPnts  = getShapePnts ('left', boxW * 2, -boxH);
  var bottPnts  = getShapePnts ('bottom', 0, -boxH);
  var topPnts   = getShapePnts ('top', boxW, -boxH);

  addShape (frontPnts);
  addShape (backPnts);
  addShape (rightPnts);
  addShape (leftPnts);
  addShape (bottPnts);
  addShape (topPnts);

  /**
   * LIBRARY
   * */

  /**
   * add the path item and set attributes to
   * @param {Array} pnts - array of points [[x0, y0], [x1, y1], ... [xn, yn]]
   * @return {PathItem} shape - object of Illustrator's class PathItem
   * */
  function addShape (pnts) {
    var fillCol = new CMYKColor ();
    var strkCol = new CMYKColor ();

    fillCol.cyan   = 30;
    fillCol.yellow = 90;
    strkCol.black  = 99;

    var shape = lay.pathItems.add ();
    shape.setEntirePath (pnts);
    shape.closed      = true;
    shape.fillColor   = fillCol;
    shape.strokeColor = strkCol;
    shape.strokeWidth = 0.1;
    return shape;
  }

  /**
   * @param {String} dimCase - 'front', 'back', 'right', 'left', 'bottom', 'top'
   * @param {Number} x - top-left coordinate of the shape
   * @param {Number} y - top-left coordinate of the shape
   * @return {Array} resPnts - array of points [[x0, y0], [x1, y1], ... [xn, yn]]
   * */
  function getShapePnts (dimCase, x, y) {
    var topPnts,
        rightPnts,
        bottPnts,
        leftPnts;

    switch (dimCase) {
      case 'front':
      case 'back':
        topPnts   = getPnts ({
          boxDim: boxW, x: x, y: y
        });
        rightPnts = getPnts ({
          boxDim: boxH, x: x, y: y
        }).rotatePnts (true).mvPnts (boxW, null);
        bottPnts  = getPnts ({
          boxDim: boxW, x: x, y: y
        }).reflectPnts (null, y).mvPnts (null, boxH).reverse ();
        leftPnts  = getPnts ({
          boxDim: boxH, x: x, y: y
        }).rotatePnts (true).reflectPnts (x, null).reverse ();
        break;

      case 'right':
      case 'left':
        topPnts   = getPnts ({
          boxDim: boxD, x: x, y: y, shftExtrmX: thick
        });
        rightPnts = getPnts ({
          boxDim: boxH, x: x, y: y
        }).rotatePnts (true).reflectPnts (x - thick / 2, null).mvPnts (boxD, null);
        bottPnts  = getPnts ({
          boxDim: boxD, x: x, y: y, shftExtrmX: thick
        }).reflectPnts (null, y).mvPnts (null, boxH).reverse ();
        leftPnts  = getPnts ({
          boxDim: boxH, x: x, y: y
        }).rotatePnts (true).mvPnts (thick, null).reverse ();
        break;

      case 'bottom':
      case 'top':
        topPnts   = getPnts ({
          boxDim: boxW, x: x, y: y, shftExtrmX: thick
        }).reflectPnts (null, y - thick / 2);
        rightPnts = getPnts ({
          boxDim: boxD, x: x, y: y,
        }).rotatePnts (true).reflectPnts (x - thick / 2, null).mvPnts (boxW, null);
        bottPnts  = getPnts ({
          boxDim: boxW, x: x, y: y, shftExtrmX: thick
        }).mvPnts (null, boxD - thick).reverse ();
        leftPnts  = getPnts ({
          boxDim: boxD, x: x, y: y,
        }).rotatePnts (true).mvPnts (thick, null).reverse ();
        break;

      default:
        break;
    }

    rightPnts.splice (0, 1);
    rightPnts.splice (rightPnts.length - 1);
    leftPnts.splice (0, 1);
    leftPnts.splice (leftPnts.length - 1);

    var resPnts = topPnts.concat (rightPnts, bottPnts, leftPnts);

    return resPnts;
  }

  /**
   * get width or height points
   * @param {{shftExtrmX: {Number}, boxDim: {Number}, x: {Number}, y: {Number}}} opts
   * @return {Array} points - array of points to the base path item
   * */
  function getPnts (opts) {
    var shiftExtremeX = opts.shftExtrmX || 0;
    var boxDimension  = opts.boxDim || 100;
    var x             = opts.x || 0;
    var y             = opts.y || 0;
    var i;

    var points        = [],
        centerTabW    = tabW,
        margTabW,
        centerTabNumb = Math.ceil (boxDimension / centerTabW) - 5;

    /**
     * todo: ??? is correctness of the box values should be checked in the interface ???
     * todo: this needs in-depth workup
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
    points.push ([x, y], [x + margTabW, y], [x + margTabW, y - thick], [x + margTabW * 2, y - thick]);
    x += margTabW * 2;
    /**
     * center
     * */
    for (i = 0; i < centerTabNumb; i++) {
      if ((i % 2)) {
        points.push ([x + centerTabW, y - thick]);
      } else {
        points.push ([x, y], [x + centerTabW, y], [x + centerTabW, y - thick]);
      }
      x += centerTabW;
    }
    /**
     * three last margin points
     * */
    points.push (
      [x + margTabW, y - thick], [x + margTabW, y], [x + margTabW * 2, y]);

    if (shiftExtremeX) {
      points[0][0] += shiftExtremeX;
      points[points.length - 1][0] -= shiftExtremeX;
    }

    return points;
  }

  function addPointsMethods () {
    var i;
    /**
     * change in situ array of point [ [x,y], [x1,y1], ..., [xn, yn] ]
     * mirror each value by axis value
     * @param {Number, Null} axisX
     * @param {Number, Null} axisY
     * */
    Array.prototype.reflectPnts = function (axisX, axisY) {
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
     * @param {Number, Null} deltaX
     * @param {Number, Null} deltaY
     * */
    Array.prototype.mvPnts = function (deltaX, deltaY) {
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
     * @param {Boolean} clockwise - if false rotate is counterclockwise
     * */
    Array.prototype.rotatePnts = function (clockwise) {
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

} (options));
