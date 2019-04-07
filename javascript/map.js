class AQMap {

	constructor(){
		console.log("map created!")
		//this.svg = d3.select("svg")//.append('g')
		//this.width = this.svg.attr("width")
		//this.height = this.svg.attr("height")
		let i0 = d3.interpolateHsvLong(d3.hsv(120, 1, 0.65), d3.hsv(60, 1, 0.90)),
		    i1 = d3.interpolateHsvLong(d3.hsv(60, 1, 0.90), d3.hsv(0, 0, 0.95)),
		    interpolateTerrain = function(t) { return t < 0.5 ? i0(t * 2) : i1((t - 0.5) * 2); };
		//d3.scaleSequential(interpolateTerrain).domain([0, 50]);
		this.colorRange = ['rgb(0,104,55,.2)','rgb(0,104,55,.5)','rgb(0,104,55)', 'rgb(26,152,80)', 'rgb(102,189,99)', 'rgb(166,217,106)', 'rgb(217,239,139)', 'rgb(255,255,191)', 'rgb(254,224,139)', 'rgb(253,174,97)', 'rgb(244,109,67)', 'rgb(215,48,39)', 'rgb(165,0,38)']
;//['#a50026','#d73027','#f46d43','#fdae61','#fee08b','#ffffbf','#d9ef8b','#a6d96a','#66bd63','#1a9850','#006837'];
		this.pm25Domain = [4, 8, 12, 20, 28, 35,42,49,55,150,250,350];
		this.colorMap = d3.scaleThreshold()
		    .domain(this.pm25Domain)
		    .range(this.colorRange);

		this.modelWidth = 36;
		this.modelHeight = 49;
		this.contours = null;

		this.shiftKeyPressed = false;

		window.onkeydown = (e) => {
		  this.shiftKeyPressed = ((e.keyIdentifier == 'Shift') || (e.shiftKey == true));
		}

		window.onkeyup = (e)=> {
		  this.shiftKeyPressed = false;
		}

		let osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
		    osmAttrib = '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		    osm = L.tileLayer(osmUrl, {maxZoom: 40, attribution: osmAttrib});
		this.lastData = null;
		let myStyles = [{"elementType":"geometry","stylers":[{"color":"#f5f5f5"}]},{"elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#616161"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#f5f5f5"}]},{"featureType":"administrative.land_parcel","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"administrative.land_parcel","elementType":"labels.text.fill","stylers":[{"color":"#bdbdbd"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#eeeeee"}]},{"featureType":"poi","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},{"featureType":"poi.business","stylers":[{"visibility":"off"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#e5e5e5"}]},{"featureType":"poi.park","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"poi.park","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]},{"featureType":"road","elementType":"geometry","stylers":[{"color":"#ffffff"}]},{"featureType":"road.arterial","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.arterial","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#dadada"}]},{"featureType":"road.highway","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"color":"#616161"}]},{"featureType":"road.local","stylers":[{"visibility":"off"}]},{"featureType":"road.local","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.local","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"color":"#e5e5e5"}]},{"featureType":"transit.station","elementType":"geometry","stylers":[{"color":"#eeeeee"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#c9c9c9"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]}]
		this.myMap = new google.maps.Map(document.getElementById('map'), {
		    zoom: 11,
		    center: {lat: 40.69255337197885, lng: -111.86895401000976},
		    styles: myStyles,

		  });
		this.toolTip = d3.select("body").append("div")	
		    .attr("class", "tooltip")				
		    .style("opacity", 0);

		   /* Create legend*/
		//let legendColorRange = ['rgb(165,0,38)', 'rgb(215,48,39)', 'rgb(244,109,67)', 'rgb(253,174,97)', 'rgb(254,224,139)', 'rgb(255,255,191)', 'rgb(217,239,139)', 'rgb(166,217,106)', 'rgb(102,189,99)', 'rgb(26,152,80)', 'rgb(0,104,55)', 'rgb(0,177,55)', 'rgb(0,255,55)']
;//['#a50026','#d73027','#f46d43','#fdae61','#fee08b','#ffffbf','#d9ef8b','#a6d96a','#66bd63','#1a9850','#006837'];
		let legendColorMap = d3.scaleThreshold()
		    .domain(this.pm25Domain.reverse())
		    .range(this.colorRange.reverse());

		   let colorLegend = d3.legendColor()
		        .labelFormat(d3.format(".0f"))
		        .labels(d3.legendHelpers.thresholdLabels)
		        .scale(this.colorMap)
		        .shapePadding(2)
		        .shapeWidth(50)
		        .shapeHeight(20)
		        .labelOffset(5)
		        .ascending(true);

		    let testLegend = d3.select('#legend')
		    	.attr('width',275)
		    	.attr('height',300)
		    	//.attr('transform', 'translate(200,-200)')
		    	.append("g")
		       // .attr("transform", "translate(10, 10)")
		        .call(colorLegend);

		        console.log(testLegend); 
		    this.shapeDrawer = new simpleShapeDrawer(this.myMap);
		    window.controller.shapeDrawer = this.shapeDrawer;

		this.myMap.data.addListener('click', (event) => {
			// NOTE WORKING: var shiftKey = (event.Ua || event.Pa).shiftKey;

			if (this.shiftKeyPressed) {
				if(this.marker){
					this.marker.setMap(null);
				}
				
		        let myLatLng = event.latLng;
			    let lat = myLatLng.lat();
			    let lng = myLatLng.lng();
				//console.log(event)
				//console.log(event.latLng)
				console.log(lat,lng);
				selector.grabModelData(lat,lng, null);
				this.placeMarker(event.latLng);
		    } else {
		    	console.log(window.controller.sensorClicked);
		    	if(window.controller.sensorClicked){ // if sensor was clicked 
					window.controller.sensorClicked = false;
		    	} else {
		    		window.controller.addLatLng(event);
		    	}
		    	console.log(window.controller.sensorClicked);
		    	console.log("sorry, no shift!")
		    }
			
            
          	//this.myMap.setCenter(marker.getPosition());
        });
		/*L.map('map',{
		    renderer: L.svg()
		}).setView([40.7, -111.9], 10);

	  // load a tile layer
	    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
	        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
	        maxZoom: 18,
	        id: 'mapbox.streets',
	        accessToken: 'pk.eyJ1IjoiZHlsYW53b290dG9uIiwiYSI6ImNqamJ1NTQ0ZzN1cG8za29ncXdndHVkYTMifQ.QfUWU-MMXDfus5OMeRCf0Q'
	    }).addTo(this.myMap);

		//this.myMap = L.map('map').setView([-41.2858, 174.7868], 13) // lat and long represent midpoint of square
		/*
		L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
		    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		    maxZoom: 18,
		    id: 'mapbox.streets',
		    accessToken: 'pk.eyJ1IjoiZHlsYW53b290dG9uIiwiYSI6ImNqamJ1NTQ0ZzN1cG8za29ncXdndHVkYTMifQ.QfUWU-MMXDfus5OMeRCf0Q'
		}).addTo(this.myMap);
*/
	/*
		var host = 'https://maps.omniscale.net/v2/{id}/style.grayscale/{z}/{x}/{y}.png';

        var attribution = '&copy; 2018 &middot; <a href="https://maps.omniscale.com/">Omniscale</a> ' +
            '&middot; Map data: <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

        this.myMap = L.map('map').setView([53.14, 8.22], 13);
          L.tileLayer.grayscale(host, {
            id: 'pk.eyJ1IjoiZHlsYW53b290dG9uIiwiYSI6ImNqamJ1NTQ0ZzN1cG8za29ncXdndHVkYTMifQ.QfUWU-MMXDfus5OMeRCf0Q',
            attribution: attribution
          }).addTo(this.myMap);

        map.attributionControl.setPrefix(false);
		/*
		mapLink = 
            '<a href="http://openstreetmap.org">OpenStreetMap</a>';
        L.tileLayer(
            'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; ' + mapLink + ' Contributors',
            maxZoom: 18,
            }).addTo(map);
		*/
		//bottomLeftCorner = {'lat': 40.598850, 'lng': -112.001349}
    	// topRightCorner = {'lat': 40.810476, 'lng': -111.713403}
		//this.svgLayer.addTo(this.myMap);

		//this.update(null,null);

	}
	placeMarker(location) {
		this.marker = new google.maps.Marker({
			position: location, 
			map: this.myMap
		});
	}
	
	updateSensor(sensorData){

		console.log(sensorData);
		// SENSOR CODE: BEGIN HERE: 
		this.sensorData = sensorData;
		let overlay = new google.maps.OverlayView();
		let that = this;

		  // Add the container when the overlay is added to the map.
		  overlay.onAdd = function() {
		    let layer = d3.select(this.getPanes().overlayMouseTarget).append("div") // floatPane as I want sensors to be on top
		        .attr("class", "sensors");

		    // Draw each marker as a separate SVG element.
		    // We could use a single SVG, but what size would it have?
		    overlay.draw = function() {
		      let projection = this.getProjection(),
		          padding = 11;

		      let marker = layer.selectAll("svg")
		          .data(sensorData)
		          .each(transform)
		          .attr("fill", (d)=>{
		          	if(d.pm25< 0){
		          		return "black";
		          	}
		          	return (that.colorMap(d.pm25))
		          })
		          .classed("hiddenMarker", (d)=> {
		          	if(d.pm25< 0){
		          		return true;
		          	}
		          	return false;
		          })

		      marker
		          .on("mouseover", function(d) {		
		          	console.log("MOUSEOVER!!!")
		            that.toolTip.transition()		
		                .duration(200)		
		                .style("opacity", .9);		
		            that.toolTip	.html(d.id + "<br/>"  + d.pm25)	
		                .style("left", (d3.event.pageX - 30) + "px")		
		                .style("top", (d3.event.pageY - 75) + "px");		
		            })					
		        .on("mouseout", function(d) {		
		            that.toolTip.transition()		
		                .duration(500)		
		                .style("opacity", 0);	
		        })
		        .on("click", function(event) {
		        	console.log(event);

		            if(that.marker){
						that.marker.setMap(null);
					}
					//d3.select(this).attr('transform','translate(-30px,-30px)')
		            selector.grabSensorData(event);
		            d3.select(this).attr("id","selected");
		            console.log(this);
		            
		            d3.select(this).selectAll('circle')
		            	//.attr('transform','translate(15px,15px)')
		            	.transition(500)
		            	.attr('r',10)
		            	.attr('stroke-width','2')
		            	.attr('stroke','gold');
		            console.log(that);
		            d3.select(that.lastSelected).attr("id", null).selectAll('circle').transition(500).attr('r',6.5).attr('stroke-width','1').attr('stroke','white');
		            //d3.select(that.lastSelected).classed("nonSelected", true);
		            that.lastSelected = this;
		            
                	console.log(window.controller.sensorClicked);
                	window.controller.sensorClicked = true;
                	console.log(window.controller.sensorClicked);

		        });

		      let newMarkers = marker
		        .enter().append("svg")
		          .each(transform)
		          .attr("class", "marker");

		      marker.exit().remove();

		      // Add a circle. May be unused?
		      newMarkers.append("circle")
		          .attr("r", 6.5)
		          .attr('stroke','white')
		          .attr('stroke-width',1)
		          .attr("cx", padding)
		          .attr("cy", padding)
		          .attr("fill", (d)=>{
		          	if(d.pm25< 0){
		          		return "black";
		          	}
		          	return (that.colorMap(d.pm25))
		          })
		          .classed("hiddenMarker", (d)=> {
		          	if(d.pm25< 0){
		          		return true;
		          	}
		          	return false;
		          });
		    

		          
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
		  overlay.setMap(this.myMap);
		  if (d3.event) {
	        d3.event.preventDefault();
	        d3.event.stopPropagation();
	      }
	}
	updateModel(modelData){
		
		this.modelData = modelData;

		//modelData = [8.964339902535034,15.595682501404061,16.57042698744204,18.19133816333678,11.611668095213714,11.565647168212108,9.916192521114132,6.541899730217069,7.052352588683608,7.501035178307062,12.019836906924501,16.98977615367748,14.43903630464879,18.41282496331842,11.333456684937138,9.348287548592062,14.489214074824726,6.790941527231953,7.815439492232705,8.135989384967434,13.852967147718985,17.47881501875145,17.602093468948997,18.830038387876115,16.222298703405457,11.069596451529595,12.860585717982625,5.843669206401813,6.430187999002033,8.673146088261356,14.552478042333625,17.200599865924136,21.489357944171832,20.283229563364984,22.151296051663245,12.974239563914061,10.456259349792571,9.093369517827368,8.655585226894358,9.608234030728035,14.663427790183809,15.271610089467535,19.424004390003876,19.44191061494021,20.92421296747697,15.638916349765802,9.75426986279476,12.976609675996558,11.121457884910457,10.471115502102577,14.966634341087122,15.06459586204938,19.77206699673942,16.27432872978454,21.08491498089317,18.887858898521586,11.711520640410228,10.284399004801326,10.85591700328193,10.676961765465006,15.418880386593878,17.324992752382588,20.867054510813166,13.975326921604745,20.773387078287815,21.984749565253274,15.453787202465993,15.829766955056902,13.49466080205513,10.41240450475944,15.238003806561725,15.702425998754974,19.789690539119942,17.16813636153775,23.63605745112857,24.109886934715696,21.57548452672802,20.333157196989834,16.441317860506214,13.19475038159874,14.422132334192963,13.80178996562388,14.180767016665985,18.971809169026482,24.201107603378983,25.317954340201148,25.655463931357115,22.65905392044519,19.313157803743675,17.18003245141215,12.696038236906523,13.763938609390353,12.647917754996156,19.517848958461776,24.30889143498016,25.726582171786102,26.038806451222484,24.10279485433458,21.681735071371676,20.208294359971237];
		
		// MODEL CODE: 
		console.log(modelData);
		console.log(d3.max(modelData));
		let startDate = new Date();
		let startStamp = startDate.getTime()
		let polygons = d3.contours()
		    .size([36, 49])
		    .thresholds(d3.range(0, d3.max(modelData), 1))
		    (modelData);

		console.log(polygons);

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
		    var maxLng = -111.713403000000;
		    var minLng = -112.001349000000;
		    var minLat = 40.810475;
		    var maxLat = 40.59885;

		    var result = [];
		    for (let poly of coords) {
		        var newPoly = [];
		        for (let ring of poly) {
		            if (ring.length < 4) continue;
		            var newRing = [];
		            for (let p of ring) {
		                newRing.push([
		                    minLng + (maxLng - minLng) * (p[0] / 36),
		                    maxLat - (maxLat - minLat) * (p[1] / 49)
		                ]);
		            }
		            newPoly.push(newRing);
		        }
		        result.push(newPoly);
		    }
		    return result;
		}
		
		if(this.lastData){
			this.myMap.data.forEach((feature) => {
				this.myMap.data.remove(feature);
			})
		}
		
		this.lastData = geojson;
		let that = this;
		this.myMap.data.addGeoJson(geojson)
		this.myMap.data.setStyle(function(feature) {
          var color = 'gray';

          if (feature.getProperty('value')) {
            color = that.colorMap(feature.getProperty('value'));
          }
          return /** @type {!google.maps.Data.StyleOptions} */({
            fillColor: color,
            strokeWeight: 0,
            fillOpacity: 0.6,
            zIndex:10 //0.04,
          });
        });

        let stopDate = new Date();
		let stopStamp = stopDate.getTime()
		
		console.log("d3 contour time: ", (stopStamp-startStamp))

		let labelsMapType = new google.maps.StyledMapType([{
    	// Hide all map features by default
		    stylers: [{
		        visibility: 'off'
		    }]
		},{
            featureType: 'road.highway',
            stylers: [
                { visibility: 'on' }
            ]
        },{
            featureType: 'road.arterial',
            stylers: [
                { visibility: 'on',
                  color: '#444444' }
            ]
        },{
            featureType: 'administrative',
            stylers: [
                { visibility: 'on' }
            ]
        }, {
		    "featureType": "road",
		    "elementType": "labels",
		    "stylers": [
		      { "visibility": "off" }
		    ]
		}, {
		 	"elementType":"geometry",
		    "stylers":[ {
		        "color": "#f5f5f5"
		    }
		    ]}],  {
		    name: 'Labels',
		    id: "MyLabels"
		});

		// Add to the map's overlay collection
		let labelsMap = this.myMap.overlayMapTypes.push(labelsMapType);
		console.log(labelsMapType);
		// Select the just created highway labels and bring it to the front.  
		d3.select("#map > div > div > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)").style('z-index',1000000).style('opacity',0.5);


		/*
		let heatLayer = L.geoJSON(geojson.features);
		heatLayer.addTo(this.myMap);
*/

/*
		L.geoJSON(geojson.features, {
            style: function (feature) {
            	console.log(feature);
            	if(feature.properties.value < 15){
            		return {weight: 1, color: "#00ff00", "fill-opacity": 0.2}
            	} 
            	return {weight: 1, color: "#ff0000", "fill-opacity": 0.2}
                
            }
        }).addTo(this.myMap);

*/

		/*
		 svg = d3.select("#map").select("svg");
		let g = d3.select("#map").select("svg").select('g');
			g.attr("class", "leaflet-zoom-hide");

	    svg.selectAll("path").remove();
	    this.polygons = d3.contours()
		        .size([this.modelWidth,this.modelHeight]) // NOTE: Make this a param
		        .thresholds(d3.range(0, d3.max(modelData), 1))
	      	(modelData); 
	     console.log("before",this.polygons)

	    //let p1 = d3.geom.polygon(this.polygons);

		let longScale = d3.scaleLinear([0,10]).range([-112.001349000000,-111.713403000000])
		  let latScale = d3.scaleLinear([0,10]).range([40.81048,40.59885])
		  console.log(longScale(1))

		  for(let multiPolygon of this.polygons){
		    console.log(multiPolygon)
		    let coordinatesArr = [];
		    
		    if(multiPolygon.coordinates.length != 0){
		      console.log(multiPolygon.coordinates)
		      coordinatesArr = multiPolygon.coordinates[0][0];
		    } else {
		      break;
		    }


		    for( let coordinate of coordinatesArr){
		      //console.log("[0][0]",coordinate[0][0])

		      coordinate[0] = longScale(parseFloat(coordinate[0]));
		      coordinate[1] = latScale(parseFloat(coordinate[1]));
		      //console.log(parseInt(coordinate[0]))
		      //console.log("[0]",latScale(parseInt(coordinate[0])))
		    }
		  }

		  console.log("after",this.polygons)

		//L.geoJSON(this.polygons).addTo(this.myMap);
		let that = this;
		/*
		let that = this;
		new L.GeoJSON(this.polygons, {
			  style: function(feature) {
			      return feature.properties.style
			  }
			}).addTo(this.myMap);
			
		function projectPoint(x, y) {
		  var point = that.myMap.latLngToLayerPoint(new L.latLng(y, x));
		  this.stream.point(point.x, point.y);
		}


		let transform = d3.geoTransform({point: projectPoint});
		let lineGenerator = d3.geoPath().projection(transform);

		let contours = svg.append('g').attr('class','heatMap').selectAll("path")
	    	.data(this.polygons);
	    
		let heatMap = contours
	    .enter().append("path")
	      .attr("d", lineGenerator)//d3.geoPath(d3.geoIdentity().scale(this.width / this.modelWidth))
	      .attr("fill", (d) => { return this.colorMap(d.value)})
	      .attr("fill-opacity",0.8);

	    // Now because D3 is not generic leaflet, we have to defien what should happen to the SVG when
        // a user scrolls or zooms. So on "viewreset" the function "reset" is called
            this.myMap.on("viewreset", reset);

            // On first load, the user will not have paned or zoomed, but the SVG still needs to be put in the
            // right place, so the function reset is called.
            reset();

            // This function places the SVG at the right position, even after zoom and/or pan
            function reset() {

                // Get the bounding Box
                let boundsKreis = [[40.598850,-112.001349],[40.810476,-111.713403]]

                // save top left and bottom right corner coordinates in variables
                var topLeft = boundsKreis[0],
                        bottomRight = boundsKreis[1];

                // reposition and rescale SVG element
                svg.attr("width", bottomRight[0] - topLeft[0])
                        .attr("height", bottomRight[1] - topLeft[1])
                        .style("left", topLeft[0] + "px")
                        .style("top", topLeft[1] + "px");

                // reposition all geometries in SVG
                svg.selectAll("g.heatMap").attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
                heatMap.attr("d", lineGenerator);
            }

		/*

		

	    l

	    d3.geoIdentity()
  			.fitExtent([[left,top],[right,bottom]], geojsonObject); });
  			*/


// consult this for d3 on top of leaflet: http://www.sydneyurbanlab.com/Tutorial7/tutorial7.html
// working with SVGS and leaflet: https://stackoverflow.com/questions/50787719/make-svgs-on-top-of-leaflet-map-not-respond-to-pan-events
	}
}