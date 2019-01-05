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
		window.interpChart = new interpolatedChart();

		this.myMap.addListener('click', addLatLng);
		// Handles click events on a map, and adds a new point to the Polyline.
		let that = this;

		function addLatLng(event) {
			console.log("INSIDE OF LAT LONG")
		  var path = that.poly.getPath();

		  // Because path is an MVCArray, we can simply append a new coordinate
		  // and it will automatically appear.
		  path.push(event.latLng);
		  console.log(event.latLng);
		  // Add a new marker at the new plotted point on the polyline.
		  console.log(path.length.toString());
		  var marker = new google.maps.Marker({
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
		  });
		  console.log(marker);
		  let markerNum = path.length - 1;

		  let newShape = event.overlay;
		  console.log(path.getArray());
		  let coordinates = [];
		  let pts = path.getArray();
		  for (var i = 0 ; i < pts.length ; i++) {
                                  coordinates.push({
                                    lat: pts[i].lat(),
                                    lng: pts[i].lng()
                                  });
                                }
          window.interpChart.update(coordinates);

		  google.maps.event.addListener(marker, 'drag', function (event) {

		            /*document.getElementById("lat").value = event.latLng.lat();

		            document.getElementById("long").value = event.latLng.lng();*/

		            //infoWindow.open(map, marker);

					path.setAt(markerNum,event.latLng);
					//path.push(event.latLng)
		   })



		  google.maps.event.addListener(marker, 'dragend', function (event) {

		            /*document.getElementById("lat").value = event.latLng.lat();

		            document.getElementById("long").value = event.latLng.lng();*/

		            //infoWindow.open(map, marker);
		            console.log(markerNum);
		            console.log(event.latLng.lng())
		            console.log(path[markerNum])
					console.log(path.getAt);
					console.log(path.setAt);
					path.setAt(markerNum,event.latLng);
					//path.push(event.latLng)
					console.log(path[markerNum])
		   });
		  



		}
		console.log(window)
		console.log(window.controller);
		window.controller.addLatLng = addLatLng
	}
}