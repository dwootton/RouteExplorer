class AQMap {

  constructor() {
    this.colorRange = ['rgb(0,104,55,.2)', 'rgb(0,104,55,.5)', 'rgb(0,104,55)', 'rgb(26,152,80)', 'rgb(102,189,99)', 'rgb(166,217,106)', 'rgb(217,239,139)', 'rgb(255,255,191)', 'rgb(254,224,139)', 'rgb(253,174,97)', 'rgb(244,109,67)', 'rgb(215,48,39)', 'rgb(165,0,38)']; //['#a50026','#d73027','#f46d43','#fdae61','#fee08b','#ffffbf','#d9ef8b','#a6d96a','#66bd63','#1a9850','#006837'];
    this.pm25Domain = [4, 8, 12, 20, 28, 35, 42, 49, 55, 150, 250, 350];

    window.controller.colorRange = this.colorRange;
    window.controller.pm25Domain = this.pm25Domain;

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

    window.onkeyup = (e) => {
      this.shiftKeyPressed = false;
    }

    this.lastData = null;
    let myStyles = [{
      "elementType": "geometry",
      "stylers": [{
        "color": "#f5f5f5"
      }]
    }, {
      "elementType": "labels.icon",
      "stylers": [{
        "visibility": "off"
      }]
    }, {
      "elementType": "labels.text.fill",
      "stylers": [{
        "color": "#616161"
      }]
    }, {
      "elementType": "labels.text.stroke",
      "stylers": [{
        "color": "#f5f5f5"
      }]
    }, {
      "featureType": "administrative.land_parcel",
      "elementType": "labels",
      "stylers": [{
        "visibility": "off"
      }]
    }, {
      "featureType": "administrative.land_parcel",
      "elementType": "labels.text.fill",
      "stylers": [{
        "color": "#bdbdbd"
      }]
    }, {
      "featureType": "poi",
      "elementType": "geometry",
      "stylers": [{
        "color": "#eeeeee"
      }]
    }, {
      "featureType": "poi",
      "elementType": "labels.text",
      "stylers": [{
        "visibility": "off"
      }]
    }, {
      "featureType": "poi",
      "elementType": "labels.text.fill",
      "stylers": [{
        "color": "#757575"
      }]
    }, {
      "featureType": "poi.business",
      "stylers": [{
        "visibility": "off"
      }]
    }, {
      "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [{
        "color": "#e5e5e5"
      }]
    }, {
      "featureType": "poi.park",
      "elementType": "labels.text",
      "stylers": [{
        "visibility": "off"
      }]
    }, {
      "featureType": "poi.park",
      "elementType": "labels.text.fill",
      "stylers": [{
        "color": "#9e9e9e"
      }]
    }, {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [{
        "color": "#ffffff"
      }]
    }, {
      "featureType": "road.arterial",
      "elementType": "labels",
      "stylers": [{
        "visibility": "off"
      }]
    }, {
      "featureType": "road.arterial",
      "elementType": "labels.text.fill",
      "stylers": [{
        "color": "#757575"
      }]
    }, {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [{
        "color": "#dadada"
      }]
    }, {
      "featureType": "road.highway",
      "elementType": "labels",
      "stylers": [{
        "visibility": "off"
      }]
    }, {
      "featureType": "road.highway",
      "elementType": "labels.text.fill",
      "stylers": [{
        "color": "#616161"
      }]
    }, {
      "featureType": "road.local",
      "stylers": [{
        "visibility": "off"
      }]
    }, {
      "featureType": "road.local",
      "elementType": "labels",
      "stylers": [{
        "visibility": "off"
      }]
    }, {
      "featureType": "road.local",
      "elementType": "labels.text.fill",
      "stylers": [{
        "color": "#9e9e9e"
      }]
    }, {
      "featureType": "transit.line",
      "elementType": "geometry",
      "stylers": [{
        "color": "#e5e5e5"
      }]
    }, {
      "featureType": "transit.station",
      "elementType": "geometry",
      "stylers": [{
        "color": "#eeeeee"
      }]
    }, {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [{
        "color": "#c9c9c9"
      }]
    }, {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [{
        "color": "#9e9e9e"
      }]
    }]

    this.myMap = new google.maps.Map(document.getElementById('map'), {
      zoom: 11,
      center: {
        lat: 40.69255337197885,
        lng: -111.86895401000976
      },
      styles: myStyles,
      streetViewControl: false,
      fullscreenControl: false

    });

    google.maps.event.addListener(this.myMap, 'idle', ()=>{
      this.loadedTiles = true;
      console.log("Loaded Tiles:", this.loadedTiles);
    });

    this.toolTip = d3.select("body").append("div")
      .attr("class", "mapTooltip")
      .style("opacity", 0);
    this.sensorWidth = 11;

    /* Create legend
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

    let testLegend = d3.select('#pm25Legend')
      .attr('width', 275)
      .attr('height', 300)
      //.attr('transform', 'translate(200,-200)')
      .append("g")
      // .attr("transform", "translate(10, 10)")
      .call(colorLegend);
      */
    this.setUpSourceMenu();


    /*

      var type = icons[key];
      var name = type.name;
      var icon = type.icon;
      var div = document.createElement('div');
      div.innerHTML = '<img src="' + icon + '"> ' + name;
      legend.appendChild(div);
    }
    */

    //this.shapeDrawer = new simpleShapeDrawer(this.myMap); END MODE REMOVAL
    //window.controller.shapeDrawer = this.shapeDrawer;END MODE REMOVAL
    this.refreshClick()

  }

  setUpSourceMenu(){
    let mapLegend = document.getElementById('mapLegend');
    this.myMap.controls[google.maps.ControlPosition.TOP_RIGHT].push(mapLegend);
    let sensorSourceMenu = document.getElementById('radioButton');
    this.myMap.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(sensorSourceMenu);
    let div = document.createElement('div');

    let sourceTypes = ['AirU','Purple Air','All']
    for(var i=0 ; i < sourceTypes.length ; i++)
    {
        let innerDiv = document.createElement('div')
        innerDiv.id = sourceTypes[i];
        let button = document.createElement('input')
        button.type = "radio"
        button.name = "sensor source"
        button.value = sourceTypes[i];

        if(i == 0){
          button.checked = true;
        }
        //item.innerHTML= '<input type="checkbox" name="item[]" value="'+label+'>';

        //let item = label + newBox;
        let label = document.createElement('label');
        label.innerHTML = sourceTypes[i];
        label.htmlFor = sourceTypes[i];
        innerDiv.appendChild(button);
        innerDiv.appendChild(label);
        sensorSourceMenu.appendChild(innerDiv);
        innerDiv.onclick = (e)=>{
          let source = e.toElement.value;

          switch(source){
            case "Purple Air":
              source = "purpleAir";
              break;
            case "All":
              source = "all";
              break;
            case "AirU":
              source = "airu";
              break;

          }
          window.controller.selector.newTime = true;

          window.controller.selector.setSensorSource(source);
        }
    }
    sensorSourceMenu.appendChild(div);

    //this.myMap.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(sensorSourceMenu);
  }

  refreshClick() {
    this.myMap.data.addListener('click', (event) => {
      // NOTE WORKING: var shiftKey = (event.Ua || event.Pa).shiftKey;
      if (this.shiftKeyPressed) {
        if (this.marker) {
          this.marker.setMap(null);
        }

        let myLatLng = event.latLng;
        let lat = myLatLng.lat();
        let lng = myLatLng.lng();

        selector.grabModelData(lat, lng, null);
        this.placeMarker(event.latLng);
      }
      /*
      if (window.controller.modeSelector.mode === 'explore') {
        return;
      }
      /*


      if (window.controller.sensorClicked) { // if sensor was clicked
        window.controller.sensorClicked = false;
      } else {
        window.controller.addLatLng(event);
      }
      console.log("sorry, no shift!")
END MODE REMOVAL
      */


      //this.myMap.setCenter(marker.getPosition());
    });
  }
  hideClick() {
    this.myMap.data.addListener('click', null);
  }
  placeMarker(location) {
    this.marker = new google.maps.Marker({
      position: location,
      map: this.myMap
    });
  }

  selectSensor(selectedSensor){
    if(selectedSensor){
      window.controller.selectedSensor = selectedSensor;
    }
    //this.updateSensor(sensorData)
  }

  blackenSensors(){
    let circs = d3.selectAll('.marker').selectAll('circle')
    circs
      .transition()
      .duration(1000)
      .attr('r',2)
      .attr('fill','black');
  }

  updateSensor(sensorData) {
    this.sensorData = sensorData;
    let overlay = new google.maps.OverlayView();
    let that = this;
    window.controller.sensorOverlay = overlay;


    // Add the container when the overlay is added to the map.
    overlay.onAdd = function() {
      d3.select(window.controller.sensorOverlay.getPanes().overlayMouseTarget).selectAll("div").remove();

      let layer = d3.select(this.getPanes().overlayMouseTarget).append("div") // floatPane as I want sensors to be on top
        .attr("class", "sensors");

      // Draw each marker as a separate SVG element.
      overlay.draw = function() {
        let projection = this.getProjection(),
          padding = that.sensorWidth;

        let marker = layer.selectAll("svg")
          .data(sensorData)
          .each(transform)

        marker
          .on("mouseover", function(d) {
            let matrix = this.getScreenCTM()
              .translate(+this.getAttribute("cx"), +this.getAttribute("cy"));

            that.toolTip.transition()
              .duration(200)
              .style("opacity", .9);
            that.toolTip.html(d.id + "<br/>" + d.pm25)
              .style("left", (window.pageXOffset + matrix.e - 16.5) + "px")
              .style("top", (window.pageYOffset + matrix.f - 44) + "px");


            let sensorID = d.id;
            /*window.controller.timeChartLegend.dispatchSensorEvent(sensorID,'mouseenter')*/
            /*let prevSelection = d3.select('#sensorPath' + sensorID)
              .transition()
              .duration(500)
              .attr('stroke-width', 2)
              .attr('stroke', 'url(#temperature-gradient)')
              .attr('stroke-opacity', 1.0)*/
          })
          .on("mouseout", function(d) {
            that.toolTip.transition()
              .duration(500)
              .style("opacity", 0);
            let sensorID = d.id;
            //window.controller.timeChartLegend.dispatchSensorEvent(sensorID,'mouseleave')
            /*
            let prevSelection = d3.select('#sensorPath' + sensorID)
              .transition()
              .duration(500)
              .attr('stroke-width', 1)
              .attr('stroke', 'gray')
              .attr('stroke-opacity', 0.6)
              */
          })
          .on("click", function(sensor) {
            if (that.marker) {
              that.marker.setMap(null);
            }

            window.controller.selectedSensor = sensor;
            let myLatlng = new google.maps.LatLng(+sensor.lat, +sensor.long);
            window.controller.map.myMap.panTo(myLatlng);
            d3.selectAll('#selected')
              .attr('id', (d)=> {
                return "marker"+d.id;
              })
              .selectAll('circle')
                .transition()
                .duration(200)
                .attr('r',6.5)
                .attr('stroke-width',1)
                .attr('stroke','white');
            that.selectSensor(sensor);
            //d3.select(this).attr('transform','translate(-30px,-30px)')
            selector.grabIndividualSensorData(sensor);
            //d3.select(this).attr("id", "selected");

            /*d3.select(this).selectAll('circle')
              //.attr('transform','translate(15px,15px)')
              .transition(500)
              .attr('r', 10)
              .attr('stroke-width', '2')
              .attr('stroke', 'gold');*/
            window.controller.timeChartLegend.changeMapSelectedSensor(sensor);
            let lineChartSelector = '#sensorPath' + sensor.id;

            /*if (that.lastSelected && that.lastSelected != this) {
              d3.select(that.lastSelected).attr("id", "marker"+sensor.id).selectAll('circle').transition(500).attr('r', 6.5).attr('stroke-width', '1').attr('stroke', 'white');
            }*/

            that.lastSelected = this;
            window.controller.sensorClicked = true;

          });

        let newMarkers = marker
          .enter().append("svg")
          .each(transform)
          .attr('id', (d)=> {
            if(window.controller.selectedSensor && d.id==window.controller.selectedSensor.id){
              return "selected";
            }
            return "marker"+d.id;
          })
          .attr("class", "marker");

        newMarkers.exit().remove();

        newMarkers.append("circle")
          /*.attr("r", 2)*/
          .attr('stroke', (d)=>{
            if(window.controller.selectedSensor && d.id==window.controller.selectedSensor.id){
              return "gold";
            }
            return 'white';
          })
          .attr('stroke-width', (d)=>{
            if(window.controller.selectedSensor && d.id==window.controller.selectedSensor.id){
              return 2;
            }
            return 1;
          })
          .attr("cx", padding)
          .attr("cy", padding)
          /*.transition()
          .duration(500)*/
          .attr("r", (d)=>{
            if(window.controller.selectedSensor && d.id==window.controller.selectedSensor.id){
              return 10;
            }
            else return 6.5;
          })
          .attr("fill", (d) => {
            if (d.pm25 < 0) {
              return "black";
            }
            return (that.colorMap(d.pm25))
          })

        if(window.controller.selectedSensor){
          //window.controller.timeChartLegend.dispatchSensorEvent(window.controller.selectedSensor.id, 'click');
        }




        /*
		          .classed("hiddenMarker", (d)=> {
		          	if(d.pm25< 0){
		          		return true;
		          	}
		          	return false;
		          });*/



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

          return d3.select(this)
            .style("left", (d.x - padding) + "px")
            .style("top", (d.y - padding) + "px");
        }
      };
    };

    // Bind our overlay to the map…
    overlay.setMap(this.myMap);
    /*
    if (d3.event) {
      d3.event.preventDefault();
      d3.event.stopPropagation();
    }
    */
  }

  getDataAtTime(time){
    // get correct model slice after 50 ms (time to load)
    if(!this.prevModelCall ){
      this.prevModelCall = new Date();
      window.controller.selector.grabAllModelContour(time);
    }

    //if(this.loadedTiles){
      this.prevModelCall = new Date();
      window.controller.selector.grabAllModelContour(time);
      window.controller.selector.grabAllSensorData(time)
      this.loadedTiles = false;
    //}


    // get correct time slice for each sensor
  }

  updateModelContour(contour){

    if (this.lastData) {

      this.myMap.data.forEach((feature) => {
        this.myMap.data.remove(feature);
      })

    }

    this.lastData = contour.contour;
    let that = this;
    let startDate = new Date();
    let startStamp = startDate.getTime()
    let imported = this.myMap.data.addGeoJson(contour.contour)
    console.log(imported);
    if(imported != null){
      this.loadedTiles = true;
      console.log(imported);
    }


    this.myMap.data.setStyle(function(feature) {
      var color = 'gray';

      if (feature.getProperty('value')) {
        color = that.colorMap(feature.getProperty('value'));
      }
      return /** @type {!google.maps.Data.StyleOptions} */ ({
        fillColor: color,
        strokeWeight: 0,
        fillOpacity: 0.6,
        zIndex: 10
      });
    });
    let stopDate = new Date();
    let stopStamp = startDate.getTime()
    console.log("d3 contour time: ", (stopStamp - startStamp))

    //let stopDate = new Date();
    //let stopStamp = stopDate.getTime()
    /*
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
    d3.select("#map > div > div > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)").style('z-index', 1000000).style('opacity', 0.5);
    */


  }





  updateModel(modelData) {
    if(modelData.data){
      modelData = modelData.data;
    }

    this.modelData = modelData;

    //modelData = [8.964339902535034,15.595682501404061,16.57042698744204,18.19133816333678,11.611668095213714,11.565647168212108,9.916192521114132,6.541899730217069,7.052352588683608,7.501035178307062,12.019836906924501,16.98977615367748,14.43903630464879,18.41282496331842,11.333456684937138,9.348287548592062,14.489214074824726,6.790941527231953,7.815439492232705,8.135989384967434,13.852967147718985,17.47881501875145,17.602093468948997,18.830038387876115,16.222298703405457,11.069596451529595,12.860585717982625,5.843669206401813,6.430187999002033,8.673146088261356,14.552478042333625,17.200599865924136,21.489357944171832,20.283229563364984,22.151296051663245,12.974239563914061,10.456259349792571,9.093369517827368,8.655585226894358,9.608234030728035,14.663427790183809,15.271610089467535,19.424004390003876,19.44191061494021,20.92421296747697,15.638916349765802,9.75426986279476,12.976609675996558,11.121457884910457,10.471115502102577,14.966634341087122,15.06459586204938,19.77206699673942,16.27432872978454,21.08491498089317,18.887858898521586,11.711520640410228,10.284399004801326,10.85591700328193,10.676961765465006,15.418880386593878,17.324992752382588,20.867054510813166,13.975326921604745,20.773387078287815,21.984749565253274,15.453787202465993,15.829766955056902,13.49466080205513,10.41240450475944,15.238003806561725,15.702425998754974,19.789690539119942,17.16813636153775,23.63605745112857,24.109886934715696,21.57548452672802,20.333157196989834,16.441317860506214,13.19475038159874,14.422132334192963,13.80178996562388,14.180767016665985,18.971809169026482,24.201107603378983,25.317954340201148,25.655463931357115,22.65905392044519,19.313157803743675,17.18003245141215,12.696038236906523,13.763938609390353,12.647917754996156,19.517848958461776,24.30889143498016,25.726582171786102,26.038806451222484,24.10279485433458,21.681735071371676,20.208294359971237];

    // MODEL CODE:
    let startDate = new Date();
    let startStamp = startDate.getTime()
    let polygons = d3.contours()
      .size([36, 49])
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

      if (feature.getProperty('value')) {
        color = that.colorMap(feature.getProperty('value'));
      }
      return /** @type {!google.maps.Data.StyleOptions} */ ({
        fillColor: color,
        strokeWeight: 0,
        fillOpacity: 0.6,
        zIndex: 10
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
    d3.select("#map > div > div > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)").style('z-index', 1000000).style('opacity', 0.5);


    // consult this for d3 on top of leaflet: http://www.sydneyurbanlab.com/Tutorial7/tutorial7.html
    // working with SVGS and leaflet: https://stackoverflow.com/questions/50787719/make-svgs-on-top-of-leaflet-map-not-respond-to-pan-events
  }
}
