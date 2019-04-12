class AQMap {

	constructor(){
		console.log("map created!")
		this.showHeatMap = true;
		//this.svg = d3.select("svg")//.append('g')
		//this.width = this.svg.attr("width")
		//this.height = this.svg.attr("height")
		this.colorRange = ['rgba(0,104,55,.2)', 'rgba(102,189,99,1)', 'rgba(255,239,139,1)', 'rgba(255,180,33,1)', 'rgba(253,174,97,1)', 'rgba(244,109,67,1)', 'rgba(215,48,39,1)', 'rgba(165,0,38,1)']; //['#a50026','#d73027','#f46d43','#fdae61','#fee08b','#ffffbf','#d9ef8b','#a6d96a','#66bd63','#1a9850','#006837'];
    this.pm25Domain = [0,4,12, 35, 55, 85,150, 250, 350];

		this.colorMap = d3.scaleLinear()
		    .domain(this.pm25Domain)
		    .range(this.colorRange);//this.colorRange
		//window.controller.colorMap = this.colorMap;

		this.lastData = null;
		let myStyles = [{"elementType":"geometry","stylers":[{"color":"#f5f5f5"}]},{"elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#616161"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#f5f5f5"}]},{"featureType":"administrative.land_parcel","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"administrative.land_parcel","elementType":"labels.text.fill","stylers":[{"color":"#bdbdbd"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#eeeeee"}]},{"featureType":"poi","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},{"featureType":"poi.business","stylers":[{"visibility":"off"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#e5e5e5"}]},{"featureType":"poi.park","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"poi.park","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]},{"featureType":"road","elementType":"geometry","stylers":[{"color":"#ffffff"}]},{"featureType":"road.arterial","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.arterial","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#dadada"}]},{"featureType":"road.highway","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"color":"#616161"}]},{"featureType":"road.local","stylers":[{"visibility":"off"}]},{"featureType":"road.local","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.local","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"color":"#e5e5e5"}]},{"featureType":"transit.station","elementType":"geometry","stylers":[{"color":"#eeeeee"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#c9c9c9"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]}]
		this.myMap = new google.maps.Map(document.getElementById('map'), {
		    zoom: 11,
		    center: {lat: 40.69255337197885, lng: -111.86895401000976},
		    styles: myStyles,

		  });
		var poly1 = new google.maps.Polyline({
	    strokeColor: '#f00',
	    strokeOpacity: 1,
	    fillOpacity: 0

		});
		var poly2 = new google.maps.Polyline({
	    strokeColor: '#0f0',
	    strokeOpacity: 1,
	    fillOpacity: 0

		});
		var poly3 = new google.maps.Polyline({
	    strokeColor: '#00f',
	    strokeOpacity: 1,
	    fillOpacity: 0

		});


		this.directionsService = new google.maps.DirectionsService();
		//this.directionsServices = [new google.maps.DirectionsService(),new google.maps.DirectionsService(),new google.maps.DirectionsService()];


	 	this.directionsDisplays = [new google.maps.DirectionsRenderer({draggable: true,polylineOptions: poly1}),new google.maps.DirectionsRenderer({draggable: true,polylineOptions: poly2}),new google.maps.DirectionsRenderer({draggable: true, polylineOptions: poly3})];
		this.directionsDisplays.forEach(display=>{
			display.setMap(this.myMap);
		})

		this.interpChart = [new interpolatedChart(0)]//,new interpolatedChart(1),new interpolatedChart(2)];
		this.myMap.controls[google.maps.ControlPosition.LEFT_CENTER].push(document.getElementById('HeatMapToggle'));

	}

	getPolyLinePaths(){
		if(this.currentResponse == null){
			return;
		}
		var routes = this.currentResponse.routes;
		var colors = ['red', 'green', 'blue', 'orange', 'yellow', 'black'];
		// Loop through each route
		let polylines = []
		for (let i = 0; i < routes.length; i++) {
			// plot each line on the google map


			let polylinecoords = google.maps.geometry.encoding.decodePath(this.currentResponse.routes[i].overview_polyline);
			console.log(polylinecoords);
			let newLine = new google.maps.Polyline({
				path: polylinecoords,
				geodesic: true,
				strokeColor: '#FF0000',
				strokeOpacity: 1.0,
				strokeWeight: 2
			});
			polylines.push(newLine);
			console.log(newLine);
		}
		return polylines;
	}


	plotDirections(start, end) {
		window.controller.interpChart = this.interpChart[0];

		window.controller.colorRange = this.colorRange;
		window.controller.pm25Domain = this.pm25Domain;
	  let method = 'WALKING';

	  let request = {
	    origin: start,
	    destination: end,
	    travelMode: google.maps.DirectionsTravelMode[method],
	    provideRouteAlternatives: true
	  };

	  this.directionsService.route(request, (response, status) => {

	    if (status == google.maps.DirectionsStatus.OK) {
				this.currentResponse = response;
	      var routes = response.routes;
	      var colors = ['blue', 'black', 'black'];
				let opacities = [1.0,1.0,1.0];
	      var directionsDisplays = [];

	      // Reset the start and end variables to the actual coordinates
	      start = response.routes[0].legs[0].start_location;
	      end = response.routes[0].legs[0].end_location;

	      // Loop through each route
	      for (var i = 0; i < routes.length; i++) {
					// plot each line on the google map
	        let directionsDisplay = new google.maps.DirectionsRenderer({
	          map: this.myMap,
	          directions: response,
	          routeIndex: i,
	          draggable: true,
	          polylineOptions: {

	            strokeColor: colors[i],
	            strokeWeight: 5,
	            strokeOpacity: opacities[i],
							zIndex: 10000000000000000000000000000000000

	          }
	        });

					let polylinecoords = google.maps.geometry.encoding.decodePath(response.routes[i].overview_polyline);
					console.log(polylinecoords);
					let newLine = new google.maps.Polyline({
	          path: polylinecoords,
	          geodesic: true,
	          strokeColor: '#FF0000',
	          strokeOpacity: 1.0,
	          strokeWeight: 2
        	});
					console.log(newLine);

					if(i == 0){
						this.interpChart[i].update(newLine);
					}


	        // Push the current renderer to an array
	        directionsDisplays.push(directionsDisplay);
					let that = this;
	        // Listen for the directions_changed event for each route
	        google.maps.event.addListener(directionsDisplay, 'directions_changed', ( (directionsDisplay, i) => {

	          return function() {
							console.log("In Direction Change")

	            var directions = directionsDisplay.getDirections();
							console.log(directions);
	            var new_start = directions.routes[0].legs[0].start_location;
	            var new_end = directions.routes[0].legs[0].end_location;
							//let newPolylineCoords = google.maps.geometry.encoding.decodePath(directions.routes[i].overview_polyline);
							//console.log(newPolylineCoords);
							console.log(directions.routes);
							let changedLine = new google.maps.Polyline({
			          path: directions.routes[0].overview_path
		        	});
							console.log(changedLine)
							that.interpChart[i].update(changedLine);
	            if ((new_start.toString() !== start.toString()) || (new_end.toString() !== end.toString())) {

	              // Remove every route from map
	              for (var j = 0; j < directionsDisplays.length; j++) {

	                directionsDisplays[j].setMap(null);
	              }

	              // Redraw routes with new start/end coordinates
	              that.plotDirections(new_start, new_end);
	            }
	          }
	        })(directionsDisplay, i)); // End listener
	      } // End route loop
	    }
	  });
	}

	changeHighlightMarker(lat,lng){
		let dataPoint = [{
			lat:lat,
			long:lng
		}];

		if(this.highlightLocation && this.highlightLocation == dataPoint){
			return;
		}
		this.highlightLocation = dataPoint

		console.log(dataPoint);
		this.highlightOverlay = new google.maps.OverlayView();
		let that = this;

		this.highlightOverlay.onAdd = function() {
			d3.select(this.getPanes().overlayMouseTarget).selectAll(".highlightOverlay").remove();
			//get previous points;
		    let layer = d3.select(this.getPanes().overlayMouseTarget).append("div") // floatPane as I want sensors to be on top
		        .attr("class", "highlightOverlay");

		    that.highlightOverlay.draw = function() {
		      let projection = this.getProjection(),
		          padding = 10.5;

		      let marker = layer.selectAll("svg")
		          .data(dataPoint)
		          .each(transform)
		          .attr("fill", function(d){
		          	console.log(d);
		          	return "white";
		          })
		          .attr("opacity", "0.5")

		      let newMarkers = marker
		        .enter().append("svg")
		          .each(transform)
		          .attr("class", "highlighter")
							.style('position','relative');

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
						if(window.controller.Map.pastX == null){
							window.controller.Map.pastX =d.x - padding;
							window.controller.Map.pastY = d.y - padding;
						}

		        let newVal = d3.select(this)
								.style("left", (window.controller.Map.pastX) + "px")
								.style("top", (window.controller.Map.pastY) + "px")
								.transition()
								.duration(300)
		            .style("left", (d.x - padding) + "px")
		            .style("top", (d.y - padding) + "px");
						window.controller.Map.pastX = d.x- padding;
					  window.controller.Map.pastY = d.y- padding;
						return newVal;
		      }
		    };
		  };

		  // Bind our overlay to the map…
		  this.highlightOverlay.setMap(this.myMap);


	}

	renderDirections(options){


		let min = this.directionsDisplays.length; // set temporary minimum
		console.log(min);
		for(let i = 0; i < min; i++){
			this.directionsServices[i].route(options, (result, status) => {
				if(result.routes.length < min){
					min = result.routes.length;
				}
				console.log(result.routes);
				result.routes[0] = result.routes[i];
				console.log(min);
				let disp = this.directionsDisplays[i];
				//console.log(disp,route);
				disp.setDirections(result);
				console.log(result)

				/*
		    if (status == 'OK') {
		      this.directionsDisplay.setDirections(result);
		    }*/
				if(i == 0){
					let polylinecoords = google.maps.geometry.encoding.decodePath(result.routes[i].overview_polyline);
					console.log(polylinecoords);
					let newLine = new google.maps.Polyline({
          path: polylinecoords,
          geodesic: true,
          strokeColor: '#FF0000',
          strokeOpacity: 1.0,
          strokeWeight: 2
        	});
					console.log(newLine);
					this.interpChart.update(newLine);
				}
		  });
		}
		/*
		this.directionsServicea.route(options, (result, status) => {
		console.log(result.routes[1]);
		console.log(min);
			let disp = this.directionsDisplays[0];
			//console.log(disp,route);
			disp.setDirections(result);
			console.log(result)

			result.routes.shift();
			console.log(result)


    if (status == 'OK') {
      this.directionsDisplay.setDirections(result);
    }*/

	}
	refreshHeatMap(){
		// if the heat map has been previously displayed
		if(this.showHeatMap == false){
			// remove the heatmap
			if(this.myMap.data){
				this.myMap.data.forEach((feature) => {
		        this.myMap.data.remove(feature);
		    })
			}
	  } else {
			if(this.modelData){
				this.updateModel(this.modelData);
			}

		}
	}

	updateModel(modelData) {
		if(this.showHeatMap == false){
			this.modelData = modelData;
			return;
		}

    if(modelData.data){
      modelData = modelData.data;
    }

    this.modelData = modelData;
		console.log(modelData);
    //modelData = [8.964339902535034,15.595682501404061,16.57042698744204,18.19133816333678,11.611668095213714,11.565647168212108,9.916192521114132,6.541899730217069,7.052352588683608,7.501035178307062,12.019836906924501,16.98977615367748,14.43903630464879,18.41282496331842,11.333456684937138,9.348287548592062,14.489214074824726,6.790941527231953,7.815439492232705,8.135989384967434,13.852967147718985,17.47881501875145,17.602093468948997,18.830038387876115,16.222298703405457,11.069596451529595,12.860585717982625,5.843669206401813,6.430187999002033,8.673146088261356,14.552478042333625,17.200599865924136,21.489357944171832,20.283229563364984,22.151296051663245,12.974239563914061,10.456259349792571,9.093369517827368,8.655585226894358,9.608234030728035,14.663427790183809,15.271610089467535,19.424004390003876,19.44191061494021,20.92421296747697,15.638916349765802,9.75426986279476,12.976609675996558,11.121457884910457,10.471115502102577,14.966634341087122,15.06459586204938,19.77206699673942,16.27432872978454,21.08491498089317,18.887858898521586,11.711520640410228,10.284399004801326,10.85591700328193,10.676961765465006,15.418880386593878,17.324992752382588,20.867054510813166,13.975326921604745,20.773387078287815,21.984749565253274,15.453787202465993,15.829766955056902,13.49466080205513,10.41240450475944,15.238003806561725,15.702425998754974,19.789690539119942,17.16813636153775,23.63605745112857,24.109886934715696,21.57548452672802,20.333157196989834,16.441317860506214,13.19475038159874,14.422132334192963,13.80178996562388,14.180767016665985,18.971809169026482,24.201107603378983,25.317954340201148,25.655463931357115,22.65905392044519,19.313157803743675,17.18003245141215,12.696038236906523,13.763938609390353,12.647917754996156,19.517848958461776,24.30889143498016,25.726582171786102,26.038806451222484,24.10279485433458,21.681735071371676,20.208294359971237];

    // MODEL CODE:
    let startDate = new Date();
    let startStamp = startDate.getTime()
    let polygons = d3.contours()
      .size([245, 180]) //[36,49]
      .thresholds(d3.range(0, d3.max(modelData), 1))
      (modelData);


    var geojson = {
      type: 'FeatureCollection',
      features: []
    };

    for (let polygon of polygons) {
      if (polygon.coordinates.length === 0) continue;
      let coords = convertCoords(polygon.coordinates);

      geojson.features.push({
        type: 'Feature',
        properties: {
          value: polygon.value
        },
        geometry: {
          type: polygon.type,
          coordinates: coords
        }
      })
    }

    function convertCoords(coords) {
      // NOTE: Work through flipping coordiantes
      var maxLng = -111.7134030;
      var minLng = -112.001349; // coordinates flipped
      var minLat = 40.810476;
      var maxLat = 40.598850;

      var result = [];
      for (let poly of coords) {
        var newPoly = [];
        for (let ring of poly) {
          if (ring.length < 4) continue;
          var newRing = [];
          for (let p of ring) {
            newRing.push([
              minLng + (maxLng - minLng) * (p[0] / 245), //36
              maxLat - (maxLat - minLat) * (p[1] / 180) // 49
            ]);
          }
          newPoly.push(newRing);
        }
        result.push(newPoly);
      }
      return result;
    }

    if (this.lastData) {
      this.myMap.data.forEach((feature) => {
        this.myMap.data.remove(feature);
      })
    }

    this.lastData = geojson;
    let that = this;
    this.myMap.data.addGeoJson(geojson)
    this.myMap.data.setStyle(function(feature) {
      var color = 'gray';
			let zValue;
      if (feature.getProperty('value')) {
				zValue = 1000+feature.getProperty('value')*50;
        color = that.colorMap(feature.getProperty('value'));
      }
      return /** @type {!google.maps.Data.StyleOptions} */ ({
        fillColor: color,
        strokeWeight: 0,
        fillOpacity: 1.0,
        zIndex: 1000 + zValue*50
      });
    });

    let stopDate = new Date();
    let stopStamp = stopDate.getTime()

    console.log("d3 contour time: ", (stopStamp - startStamp))

    let labelsMapType = new google.maps.StyledMapType([{
      // Hide all map features by default
      stylers: [{
        visibility: 'off'
      }]
    }, {
      featureType: 'road.highway',
      stylers: [{
        visibility: 'on'
      }]
    }, {
      featureType: 'road.arterial',
      stylers: [{
        visibility: 'on',
        color: '#444444'
      }]
    }, {
      featureType: 'administrative',
      stylers: [{
        visibility: 'on'
      }]
    }, {
      "featureType": "road",
      "elementType": "labels",
      "stylers": [{
        "visibility": "off"
      }]
    }, {
      "elementType": "geometry",
      "stylers": [{
        "color": "#f5f5f5"
      }]
    }], {
      name: 'Labels',
      id: "MyLabels"
    });

    // Add to the map's overlay collection
    this.myMap.overlayMapTypes.clear();
    let labelsMap = this.myMap.overlayMapTypes.push(labelsMapType);

    // Select the just created highway labels and bring it to the front.
    d3.select("#map > div > div > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)").style('z-index', 1000000).style('opacity', 0.4);


    // consult this for d3 on top of leaflet: http://www.sydneyurbanlab.com/Tutorial7/tutorial7.html
    // working with SVGS and leaflet: https://stackoverflow.com/questions/50787719/make-svgs-on-top-of-leaflet-map-not-respond-to-pan-events
  }

}
