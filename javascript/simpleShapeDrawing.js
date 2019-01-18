/**
 * @file Shape Drawing
 * @author Dylan Wootton <me@dylanwootton.com>
 * @version 0.2
 */

class simpleShapeDrawer {
  /**
   * The constructor of the shape drawer
   * @param {[type]} myMap [description]
   */
  constructor(myMap) {
		/* Set up drawing on the map */
    this.myMap = myMap;
    this.poly = new google.maps.Polyline({
      strokeColor: '#000000',
      strokeOpacity: 1.0,
      strokeWeight: 3,
      zIndex: 100000000000000000000000000000000000000000000000000000000
    });
    this.poly.setMap(this.myMap);

		/* Stores the polyline, map, interp Chart as global objects */
    window.controller.polyline = this.poly;
    window.controller.map = this.myMap;
    window.controller.interpChart = new interpolatedChart();

    /* Markers are new points of the Polyline */
    let that = this;
    this.pathNodes = [];
    window.controller.pathNodes = this.pathNodes;

		/* On click, add point and update views */
    let addLatLng = event => {
      var path = this.poly.getPath();

      /* Add point to path */
      path.push(event.latLng); // note: this re-renders the polyline on the map

      /* Add a new circle marker at the new plotted point on the polyline. */
      let markerNum = this.pathNodes.length;
      this.pathNodes.push(new google.maps.Marker({
        position: event.latLng,
        map: that.myMap,
        label: path.length.toString(),
        icon: {
          path: 'M256,320c-70.688,0-128-57.312-128-128c0-70.687,57.313-128,128-128c70.688,0,128,57.313,128,128C384,262.688,326.688,320,256,320z',
          fillColor: 'white',
          fillOpacity: 1,
          scale: 0.075,
          strokeColor: 'black',
          strokeWeight: 1,
          strokeOpacity: 1,
          labelOrigin: new google.maps.Point(250, 210),
          anchor: new google.maps.Point(250, 210)
        },
        draggable: true
      }));

			/* Update interpChart view */
      let pts = path.getArray();
      window.controller.interpChart.update(pts);

			/* Delete the most recently editted node if delete is pressed */
			this.selectedNode = markerNum;
			google.maps.event.addDomListener(document, 'keyup', (event) => {
        let code = (event.keyCode ? event.keyCode : event.which);
        if (code === 8) {
          let prevPath = path.getArray();
          if (markerNum == that.selectedNode) {
            removePoint(that.selectedNode);
            let pts = path.getArray();
            window.controller.interpChart.update(pts);
            event.preventDefault();
            event.stopPropagation();
          }
        }
      });

			/* Update marker position on drag */
      google.maps.event.addListener(this.pathNodes[markerNum], 'drag', (event) => {
        path.setAt(markerNum, event.latLng);
        this.selectedNode = markerNum;
      })

			/* Update path location and render new interp chart views */
      google.maps.event.addListener(this.pathNodes[markerNum], 'dragend', (event) => {
        path.setAt(markerNum, event.latLng);
        let draggedPts = path.getArray();
        window.controller.interpChart.update(draggedPts);
        this.selectedNode = markerNum;

      });

			/* Removes the point that corresponds to the recently clicked marker */
      let removePoint = markerNum => {
        this.pathNodes[markerNum].setMap(null);
        this.pathNodes.splice(markerNum, 1);
        this.poly.getPath().removeAt(markerNum);
        this.selectedNode = 9999;
      }
    }

		// add globally for use inside of map.js
    window.controller.addLatLng = addLatLng
  }

	/**
   * Used to set the opacity of the drawn path Markers
   * and lines on the google map.
   *
   * @param  {[double]} opacity [The opacity value to set them to]
   * @return {[type]}         [description]
   */
  changeLineOpacity(opacity) {
		/* Change opacity of the line */
    this.poly.setOptions({
      strokeOpacity: opacity
    });

		/* Change opacity of the path pathNodes */
    for (let i = 0; i < this.pathNodes.length; i++) {
      this.pathNodes[i].setOpacity(opacity)
    }
  }

  /**
   * Used to set the path highlighter's lat and lng on
   * the google map.
   *
   * @param  {[double]} lat [The Latitutde.]
   * @param  {[double]} lng [The Longitude.]
   * @return
   */
  changeHighlightMarker(lat, lng) {
		/* Convert lat and lng to at latlng obj */
    let dataPoint = [{
      lat: lat,
      long: lng
    }];

    this.pathHighlightOverlay = new google.maps.OverlayView();
    let that = this;

    this.pathHighlightOverlay.onAdd = function() {

      d3.select(this.getPanes().overlayMouseTarget).selectAll(".pathHighlight").remove();
      let layer = d3.select(this.getPanes().overlayMouseTarget).append("div") // floatPane as I want sensors to be on top
        .attr("class", "pathHighlight");

      that.pathHighlightOverlay.draw = function() {
        let projection = this.getProjection(),
          padding = 14;

        layer.selectAll("svg")
          .data(dataPoint)
          .enter().append("svg")
          .each(transform)
          .append("circle")
            .attr("r", 11)
            .attr('stroke', 'gold')
            .attr('stroke-width', 3)
            .attr('fill-opacity', 0.2)
            .attr("cx", padding)
            .attr("cy", padding)
            .attr("fill", "black");

        function transform(d) {
          d = new google.maps.LatLng(parseFloat(d.lat), parseFloat(d.long));
          d = projection.fromLatLngToDivPixel(d);
          return d3.select(this)
            .style("left", (d.x - padding) + "px")
            .style("top", (d.y - padding) + "px");
        }
      };
    };

    // Bind our overlay to the map
    this.pathHighlightOverlay.setMap(this.myMap);
  }
}
