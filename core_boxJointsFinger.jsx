/**
 * ExtendScript Adobe Illustrator CS6+
 * (c)MaratShagiev m_js@bk.ru
 * The generator of the box with the edges connectors of the type "finger"
 *
 * core
 * */

// todo:
// really we have three original sides: width, height and depth
// another ones we can get from this three original
// through operations: mirror, rotate, reverse and move

//@target illustrator

/**
 * values are taken from the interface
 * */
var options  = {
  boxWidth:  115,
  boxHeight: 75,
  boxDepth:  55,
  tabWidth:  6,
  thickness: 3,
  units:     'pt'
}
/**
 * CONST
 * */
var PT_TO_MM = 2.834645668;
var MM_TO_PT = 0.352777778;

(function genBoxFingerJoints(opts) {

  addArrayMethods();

  var boxWidth  = opts.boxWidth || 115,
      boxHeight = opts.boxHeight || 70,
      boxDepth  = opts.boxDepth || 60,
      tabWidth  = opts.tabWidth || 7,
      thickness = opts.thickness || 3;

  var doc        = activeDocument,
      lay        = doc.activeLayer,
      widthSide  = lay.pathItems.add(),
      heigthSide = lay.pathItems.add(),
      depthSide  = lay.pathItems.add();

  widthSide.setEntirePath(getPoints(boxWidth));
  heigthSide.setEntirePath(getPoints(boxHeight));
  depthSide.setEntirePath(getPoints(boxDepth, thickness));

  /**
   * todo: Operating with three basic elements to build three basic box wall.
   * */

  /**
   * get width or height points
   * @param {Number} boxDimension - box height or box width dimention value
   * @param {Number} shiftExtremeX - coordinate (for width and heihgt = 0, for depth = thickness)
   * */
  function getPoints(boxDimension, shiftExtremeX) {
    var x = 0;
    var y = 0,
        i;

    var points        = [],
        centerTabW    = tabWidth,
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
    points.push([x, y], [x + margTabW, y], [x + margTabW, y - thickness], [x + margTabW * 2, y - thickness]);
    x += margTabW * 2;
    /**
     * center
     * */
    for (i = 0; i < centerTabNumb; i++) {
      if ((i % 2)) {
        points.push([x + centerTabW, y - thickness]);
      } else {
        points.push([x, y], [x + centerTabW, y], [x + centerTabW, y - thickness]);
      }
      x += centerTabW;
    }
    /**
     * three last margin points
     * */
    points.push(
      [x + margTabW, y - thickness], [x + margTabW, y], [x + margTabW * 2, y]);

    if (shiftExtremeX) {
      points[0][0] += shiftExtremeX;
      points[points.length - 1][0] -= shiftExtremeX;
    }

    return points;
  }

  function addArrayMethods() {
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
     * @param {Numver, Null} axisX
     * @param {Numver, Null} axisY
     * */
    Array.prototype.mrPnts = function(axisX, axisY) {
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
    }
    /**
     * change in situ array of point [ [x,y], [x1,y1], ..., [xn, yn] ]
     * increase each value by delta value
     * @param {Numver, Null} deltaX
     * @param {Numver, Null} deltaY
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
    }
    /**
     * rotate to 90° clockwase or counterclockwise about start of points array
     * @param {Boolean} clockwise - if false rotate is counterclockwise
     * */
    Array.prototype.rtPnts = function(clockwise) {
      var x0 = this[0][0],
          y0 = this[0][1];
      if (clockwise) {
        for (i = 1; i < this.length; i++) {
          this[i][0] = (this[i][1] - y0) + x0;
          this[i][1] = (x0 - this[i][0]) + y0;
        }
      } else {
        for (i = 1; i < this.length; i++) {
          this[i][0] = (y0 - this[i][1]) + x0;
          this[i][1] = (this[i][0] - x0) + y0;
        }
      }
    }
  }

}(options));
