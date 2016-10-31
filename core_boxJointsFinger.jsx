/**
 * ExtendScript Adobe Illustrator CS6+
 * (c)MaratShagiev m_js@bk.ru
 * The generator of the box with the edges connectors of the type "finger"
 *
 * core
 *
 * really we have three original sides: width, height and depth
 * another ones we can get from this three original
 * through operations: mirror, rotate, reverse and move
 * */

//@target illustrator

/**
 * values are taken from the interface
 * */
var options  = {
  boxW:  100,
  boxH:  125,
  boxD:  60,
  tabW:  10,
  thick: 5,
  units: 'pt'
}
/**
 * CONST
 * */
var PT_TO_MM = 2.834645668;
var MM_TO_PT = 0.352777778;

(function genBoxFingerJoints(opts) {

  addPointsMethods();

  var boxW  = opts.boxW || 115,
      boxH  = opts.boxH || 70,
      boxD  = opts.boxD || 60,
      tabW  = opts.tabW || 7,
      thick = opts.thick || 3;

  var doc = activeDocument,
      lay = doc.activeLayer;

  var frontShape = makeFrontShape();
  var leftShape = makeLeftShape();
  var bottomShape = makeBottomShape();

  /**
   * Operating with three basic elements to build three basic box wall
   * */

  function makeFrontShape() {
    var topPnts   = getPnts(boxW);
    var rightPnts = getPnts(boxH).rotatePnts(true).mvPnts(boxW, null);
    var bottPnts  = getPnts(boxW).reflectPnts(null, 0).mvPnts(null, boxH).reverse();
    var leftPnts  = getPnts(boxH).rotatePnts(true).reflectPnts(0, null).reverse();

    rightPnts.splice(0, 1);
    bottPnts.splice(0, 1);
    leftPnts.splice(0, 1);
    leftPnts.splice(leftPnts.length - 1);

    var resultPoints = topPnts.concat(rightPnts, bottPnts, leftPnts);

    var shape = lay.pathItems.add();
    shape.setEntirePath(resultPoints);
    shape.closed = true;
    return shape;
  }

  function makeLeftShape() {
    var topPnts   = getPnts(boxD, thick);
    var rightPnts = getPnts(boxH).rotatePnts(true).reflectPnts(-thick / 2, null).mvPnts(boxD, null);
    var bottPnts  = getPnts(boxD, thick).reflectPnts(null, 0).mvPnts(null, boxH).reverse();
    var leftPnts  = getPnts(boxH).rotatePnts(true).mvPnts(thick, null).reverse();

    rightPnts.splice(0, 1);
    bottPnts.splice(0, 1);
    leftPnts.splice(0, 1);
    leftPnts.splice(leftPnts.length - 1);

    var resPnts = topPnts.concat(rightPnts, bottPnts, leftPnts);

    var shape = lay.pathItems.add();
    shape.setEntirePath(resPnts);
    return shape;
  }

  function makeBottomShape() {
    var topPnts   = getPnts(boxW, thick).reflectPnts(null, -thick / 2);
    var rightPnts = getPnts(boxD).rotatePnts(true).reflectPnts(-thick / 2, null).mvPnts(boxW, null);
    var bottPnts  = getPnts(boxW, thick).mvPnts(null, boxD - thick).reverse();
    var leftPnts  = getPnts(boxD).rotatePnts(true).mvPnts(thick, null).reverse();

    rightPnts.splice(0, 1);
    rightPnts.splice(rightPnts.length - 1);
    leftPnts.splice(0, 1);
    leftPnts.splice(leftPnts.length - 1);

    var resPnts = topPnts.concat(rightPnts, bottPnts, leftPnts);

    var shape = lay.pathItems.add();
    shape.setEntirePath(resPnts);
    return shape;
  }

  /**
   * get width or height points
   * @param {Number} boxDimension - box height or box width dimention value
   * @param {Number} shiftExtremeX - coordinate (for width and heihgt = 0, for depth = thickness)
   * */
  function getPnts(boxDimension, shiftExtremeX) {
    var x = 0;
    var y = 0,
        i;

    var points        = [],
        centerTabW    = tabW,
        margTabW,
        centerTabNumb = Math.ceil(boxDimension / centerTabW) - 5;

    /**
     * todo: the correctness of the box values should be checked here or in the interface???
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

  function addPointsMethods() {
    var i;
    /**
     * copy the points array to the new array
     * @return{Array} cp - copy of this array
     * */
    Array.prototype.cpPnts = function() {
      var cp = [];
      for (i = 0; i < this.length; i++) {
        cp[i]    = [];
        cp[i][0] = this[i][0];
        cp[i][1] = this[i][1];
      }
      return cp;
    }
    /**
     * change in situ array of point [ [x,y], [x1,y1], ..., [xn, yn] ]
     * mirror each value by axis value
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

}(options));
