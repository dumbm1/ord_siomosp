/**
 * ExtendScript Adobe Illustrator CS4+
 * (c)MaratShagiev m_js@bk.ru
 * The generator of the box with the edges connectors of the type "finger"
 *
 * core
 * */

//@target illustrator-19

/**
 * values are taken from the interface
 * */
var options = {
  boxW : 100,
  boxH : 125,
  boxD : 60,
  tabW : 10,
  thick: 5
};

(function main (opts) {
  /**
   * API
   * */

  var box = new BoxShape ();

  box.addPntsMethodsToArray ();

  box.addBoxShape ('front', 0, 0);
  box.addBoxShape ('back', opts.boxW, 0);
  box.addBoxShape ('right', opts.boxW * 2, 0);
  box.addBoxShape ('left', opts.boxW * 2, -opts.boxH);
  box.addBoxShape ('bottom', 0, -opts.boxH);
  box.addBoxShape ('top', opts.boxW, -opts.boxH);

  /**
   * @constructor
   * */

  function BoxShape () {
    var boxW  = opts.boxW || 115,
        boxH  = opts.boxH || 70,
        boxD  = opts.boxD || 60,
        tabW  = opts.tabW || 7,
        thick = opts.thick || 3;

    var lay = activeDocument.activeLayer;
    /**
     * @param {String} dimCase - 'front', 'back', 'right', 'left', 'bottom', 'top'
     * @param {Number} x - top-left coordinate of the shape
     * @param {Number} y - top-left coordinate of the shape
     * @return {Array} resPnts - array of points [[x0, y0], [x1, y1], ... [xn, yn]]
     * */
    this.addBoxShape = function (dimCase, x, y) {
      var resPnts = _getShapePnts ();
      _addShape (resPnts);

      function _getShapePnts () {
        var topPnts,
            rightPnts,
            bottPnts,
            leftPnts;

        switch (dimCase) {
          case 'front':
          case 'back':
            topPnts   = _getBasePnts ({
              boxDim: boxW, x: x, y: y
            });
            rightPnts = _getBasePnts ({
              boxDim: boxH, x: x, y: y
            }).rotatePnts (true).mvPnts (boxW, null);
            bottPnts  = _getBasePnts ({
              boxDim: boxW, x: x, y: y
            }).reflectPnts (null, y).mvPnts (null, boxH).reverse ();
            leftPnts  = _getBasePnts ({
              boxDim: boxH, x: x, y: y
            }).rotatePnts (true).reflectPnts (x, null).reverse ();
            break;

          case 'right':
          case 'left':
            topPnts   = _getBasePnts ({
              boxDim: boxD, x: x, y: y, shftExtrmX: thick
            });
            rightPnts = _getBasePnts ({
              boxDim: boxH, x: x, y: y
            }).rotatePnts (true).reflectPnts (x - thick / 2, null).mvPnts (boxD, null);
            bottPnts  = _getBasePnts ({
              boxDim: boxD, x: x, y: y, shftExtrmX: thick
            }).reflectPnts (null, y).mvPnts (null, boxH).reverse ();
            leftPnts  = _getBasePnts ({
              boxDim: boxH, x: x, y: y
            }).rotatePnts (true).mvPnts (thick, null).reverse ();
            break;

          case 'bottom':
          case 'top':
            topPnts   = _getBasePnts ({
              boxDim: boxW, x: x, y: y, shftExtrmX: thick
            }).reflectPnts (null, y - thick / 2);
            rightPnts = _getBasePnts ({
              boxDim: boxD, x: x, y: y,
            }).rotatePnts (true).reflectPnts (x - thick / 2, null).mvPnts (boxW, null);
            bottPnts  = _getBasePnts ({
              boxDim: boxW, x: x, y: y, shftExtrmX: thick
            }).mvPnts (null, boxD - thick).reverse ();
            leftPnts  = _getBasePnts ({
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

        /**
         * get width or height points
         * @param {{shftExtrmX: {Number}, boxDim: {Number}, x: {Number}, y: {Number}}} opts
         * @return {Array} points - array of points to the base path item
         * */
        function _getBasePnts (opts) {
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
      }

      /**
       * add the path item and set attributes to
       * @param {Array} pnts - array of points [[x0, y0], [x1, y1], ... [xn, yn]]
       * @return {PathItem} shape - object of Illustrator's class PathItem
       * */
      function _addShape (pnts) {
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

    }
    this.addPntsMethodsToArray = function () {
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
  }

} (options));
