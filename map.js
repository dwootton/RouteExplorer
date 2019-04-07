class AQMap {

	constructor(){
		console.log("map created!")
		//this.svg = d3.select("svg")//.append('g')
		//this.width = this.svg.attr("width")
		//this.height = this.svg.attr("height")
		this.colorRange = ['rgba(0,104,55,.2)', 'rgba(102,189,99,1)', 'rgba(255,239,139,1)', 'rgba(255,180,33,1)', 'rgba(253,174,97,1)', 'rgba(244,109,67,1)', 'rgba(215,48,39,1)', 'rgba(165,0,38,1)']; //['#a50026','#d73027','#f46d43','#fdae61','#fee08b','#ffffbf','#d9ef8b','#a6d96a','#66bd63','#1a9850','#006837'];
    this.pm25Domain = [0,4,12, 35, 55, 85,150, 250, 350];
		this.colorMap = d3.scaleThreshold()
		    .domain(this.pm25Domain)
		    .range(this.colorRange);


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

		this.interpChart = [new interpolatedChart(0),new interpolatedChart(1),new interpolatedChart(2)];


	}

	plotDirections(start, end) {
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

	      var routes = response.routes;
	      var colors = ['red', 'green', 'blue', 'orange', 'yellow', 'black'];
	      var directionsDisplays = [];

	      // Reset the start and end variables to the actual coordinates
	      start = response.routes[0].legs[0].start_location;
	      end = response.routes[0].legs[0].end_location;

	      // Loop through each route
	      for (var i = 0; i < routes.length; i++) {

	        let directionsDisplay = new google.maps.DirectionsRenderer({
	          map: this.myMap,
	          directions: response,
	          routeIndex: i,
	          draggable: true,
	          polylineOptions: {

	            strokeColor: colors[i],
	            strokeWeight: 4,
	            strokeOpacity: .3
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
					this.interpChart[i].update(newLine);

	        // Push the current renderer to an array
	        directionsDisplays.push(directionsDisplay);
					let that = this;
	        // Listen for the directions_changed event for each route
	        google.maps.event.addListener(directionsDisplay, 'directions_changed', ( (directionsDisplay, i) => {

	          return function() {
							console.log("In Direction Change")
	            var directions = directionsDisplay.getDirections();
	            var new_start = directions.routes[0].legs[0].start_location;
	            var new_end = directions.routes[0].legs[0].end_location;
							let newPolylineCoords = google.maps.geometry.encoding.decodePath(directions.routes[i].overview_polyline);
							console.log(newPolylineCoords);
							let changedLine = new google.maps.Polyline({
			          path: newPolylineCoords,
			          geodesic: true,
		        	});
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

}
