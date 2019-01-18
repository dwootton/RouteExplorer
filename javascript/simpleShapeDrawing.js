// Ref for plyline: https://stackoverflow.com/questions/2698112/how-to-add-markers-on-google-maps-polylines-based-on-distance-along-the-line
class simpleShapeDrawer {
	constructor(myMap){
		this.myMap = myMap;
		this.poly = new google.maps.Polyline({
		    strokeColor: '#000000',
		    strokeOpacity: 1.0,
		    strokeWeight: 3,
		    zIndex: 100000000000000000000000000000000000000000000000000000000
		  });
		this.poly.setMap(this.myMap);

		window.controller.polyline = this.poly;
		window.controller.map = this.myMap;

		window.interpChart = new interpolatedChart();

		//this.myMap.addListener('click', addLatLng);
		// Handles click events on a map, and adds a new point to the Polyline.
		let that = this;
		this.markers = [];
		window.controller.markers = this.markers;

		function addLatLng(event) {
		  var path = that.poly.getPath();

		  // Because path is an MVCArray, we can simply append a new coordinate
		  // and it will automatically appear.
		  path.push(event.latLng);

		  // Add a new marker at the new plotted point on the polyline.
		  let markerNum = that.markers.length; // done before to not need to -1
		  that.markers.push(new google.maps.Marker({
		    position: event.latLng,
		    //title: '#' + path.getLength(),
		    map:  that.myMap,
		    label: path.length.toString(),
		    icon: {
		            path: 'M256,320c-70.688,0-128-57.312-128-128c0-70.687,57.313-128,128-128c70.688,0,128,57.313,128,128C384,262.688,326.688,320,256,320z',
		            fillColor: 'white',
		            fillOpacity: 1,
		            scale: 0.075,
		            strokeColor: 'black',
		            strokeWeight: 1,
		            strokeOpacity: 1,
		            labelOrigin : new google.maps.Point(250, 210),
		            anchor: new google.maps.Point(250, 210)
		        },
		    draggable: true
		  }));
		  console.log(window.controller.markers);


		  let newShape = event.overlay;
		  //let coordinates = [];
		  let pts = path.getArray();
		  that.selectedNode = markerNum;
		  /*
		  for (var i = 0 ; i < pts.length ; i++) {
                                  coordinates.push({
                                    lat: pts[i].lat(),
                                    lng: pts[i].lng()
                                  });
                                }
                                */
          window.interpChart.update(pts);

		  google.maps.event.addListener(that.markers[markerNum], 'drag', (event) => {

		            /*document.getElementById("lat").value = event.latLng.lat();

		            document.getElementById("long").value = event.latLng.lng();*/

		            //infoWindow.open(map, marker);

					path.setAt(markerNum,event.latLng);
					that.selectedNode = markerNum;
					//path.push(event.latLng)
		   })



		  google.maps.event.addListener(that.markers[markerNum], 'dragend',  (event) => {

		            /*document.getElementById("lat").value = event.latLng.lat();

		            document.getElementById("long").value = event.latLng.lng();*/

		            //infoWindow.open(map, marker);

					path.setAt(markerNum,event.latLng);
					let draggedPts = path.getArray();
					window.interpChart.update(draggedPts);
					that.selectedNode = markerNum;

					//path.push(event.latLng)
		   });

		  google.maps.event.addDomListener(document, 'keyup', (event) => {
			    var code = (event.keyCode ? event.keyCode : event.which);
			    if (code === 8) {
			    	console.log(markerNum);
			    	let prevPath = path.getArray();
			    	if(markerNum == that.selectedNode){
			    		console.log(that.selectedNode)
			    		removePoint(that.selectedNode);
			    		let pts = path.getArray();
				        window.interpChart.update(pts);
				        event.preventDefault();
    					event.stopPropagation();
			    	}


			    	/*that.markers[markerNum].setMap(null);
			    	let newPathArray = prevPath.map((element,index) => {
			    		if(index===markerNum){
			    			return
			    		}
			    		return element;
			    	})

			    	console.log(newPathArray);
			    	newPathArray.forEach(function(coord) {
					    //note: getPath returns a reference,
					    //you may add a point directly
					    that.poly.getPath().push(coord);
					 });

			    	//path.removeAt(markerNum)*/
			    }
			});

		function removePoint(markerNum) {
		  	that.markers[markerNum].setMap(null);
		    that.markers.splice(markerNum, 1);
		    that.poly.getPath().removeAt(markerNum);
		    that.selectedNode = 9999;
		    console.log("removed!")
		    /*
		    for (let i = 0; i < markers.length; i++) {
		        if (i === markerNum) {


		        }
		    }*/
		}
		  /*
		  google.maps.event.addDomListener(marker, 'keydown', function(event){
		  	console.log(event)
		  			if(event.keyCode == 46) {
				        alert('Delete key released');
				        path.removeAt(markerNum);

				    }
		  })
		  */




		}

		window.controller.addLatLng = addLatLng
	}

	changeLineOpacity(opacity){
		this.poly.setOptions({strokeOpacity: opacity});
		for(let i = 0; i < this.markers.length; i++){
			this.markers[i].setOpacity(opacity)
		}
		this.markers

	}

	changeHighlightMarker(lat,lng){
		let dataPoint = [{
			lat:lat,
			long:lng
		}];
		this.pathHighlightOverlay = new google.maps.OverlayView();
		let that = this;

		this.pathHighlightOverlay.onAdd = function() {
			d3.select(this.getPanes().overlayMouseTarget).selectAll(".pathHighlight").remove();
		    let layer = d3.select(this.getPanes().overlayMouseTarget).append("div") // floatPane as I want sensors to be on top
		        .attr("class", "pathHighlight");

		    // Draw each marker as a separate SVG element.
		    // We could use a single SVG, but what size would it have?
		    that.pathHighlightOverlay.draw = function() {
		      let projection = this.getProjection(),
		          padding = 10.5;

		      let marker = layer.selectAll("svg")
		          .data(dataPoint)
		          .each(transform)

		      let newMarkers = marker
		        .enter().append("svg")
		          .each(transform);

		      marker.exit().remove();

		      // Add a circle. May be unused?
		      newMarkers.append("circle")
		          .attr("r", 10)
		          .attr('stroke','gold')
		          .attr('stroke-width',3)
		          .attr('fill-opacity',0.2)
		          .attr("cx", padding)
		          .attr("cy", padding)
		          .attr("fill", "black");




		      // Add a label.
		      /*
		      newMarkers.append("text")
		          .attr("x", padding + 7)
		          .attr("y", padding)
		          .attr("dy", ".31em")
		          .text(function(d) {return d.id;});

		      function transform(d) {
		        let latLongObj = {lat:+d.lat,lng:+d.long};
		        console.log(latLongObj);
		        let realLLObj = new google.maps.LatLng(latLongObj.lat, latLongObj.lng);
		        let obj = projection.fromLatLngToDivPixel(realLLObj);
		        console.log(obj);
		        let sel = d3.select(this);
		        return d3.select(this)
		            .style("left", (obj.x - padding) + "px")
		            .style("top", (obj.y - padding) + "px");
		      }
				One SVG:
				let newMarkers = marker
		        .enter()
		          .append("circle")
		          .attr("cx", (d) => {
		          	 d = new google.maps.LatLng(parseFloat(d.lat), parseFloat(d.long));
				        d = projection.fromLatLngToDivPixel(d);

				        return (d.x-padding) +"px";
		          })
		          .attr("cy", (d) => {
		          	 d = new google.maps.LatLng(parseFloat(d.lat), parseFloat(d.long));
				        d = projection.fromLatLngToDivPixel(d);

				        return (d.y-padding) +"px";
		          })
		          .attr("class", "marker")
		          .attr("fill",(d)=>{
		          	return (that.colorMap(d.pm25))
		          });
		      */
		      function transform(d) {
		        d = new google.maps.LatLng(parseFloat(d.lat), parseFloat(d.long));
		        d = projection.fromLatLngToDivPixel(d);
		        //console.log(d3.select(this));

		        return d3.select(this)
		            .style("left", (d.x - padding) + "px")
		            .style("top", (d.y - padding) + "px");
		      }
		    };
		  };

		  // Bind our overlay to the map…
		  this.pathHighlightOverlay.setMap(this.myMap);


	}
}
