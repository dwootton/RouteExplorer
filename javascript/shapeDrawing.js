class shapeDrawer {
    /* Code from : http://bl.ocks.org/knownasilya/89a32e572989f0aff1f8*/
    constructor(myMap) {
            //console.log("Inside of shape drawer!")
            this.myMap = myMap;
            this.interpChart = new interpolatedChart();
            var drawingManager;
            var selectedShape;
            var colors = ['#1E90FF', '#FF1493', '#32CD32', '#FF8C00', '#4B0082'];
            var selectedColor;
            var colorButtons = {};
            let that = this;

            function clearSelection () {
                if (selectedShape) {
                    if (selectedShape.type !== 'marker') {
                        selectedShape.setEditable(false);
                    }
                    
                    selectedShape = null;
                }
            }

            function setSelection (shape) {
                if (shape.type !== 'marker') {
                    clearSelection();
                    shape.setEditable(true);
                    selectColor(shape.get('fillColor') || shape.get('strokeColor'));
                }
                
                selectedShape = shape;
            }

            function deleteSelectedShape () {
                if (selectedShape) {
                    selectedShape.setMap(null);
                }
            }

            function selectColor (color) {
                selectedColor = color;
                for (var i = 0; i < colors.length; ++i) {
                    var currColor = colors[i];
                    colorButtons[currColor].style.border = currColor == color ? '2px solid #789' : '2px solid #fff';
                }

                // Retrieves the current options from the drawing manager and replaces the
                // stroke or fill color as appropriate.
                var polylineOptions = drawingManager.get('polylineOptions');
                polylineOptions.strokeColor = color;
                drawingManager.set('polylineOptions', polylineOptions);

                var polygonOptions = drawingManager.get('polygonOptions');
                polygonOptions.fillColor = color;
                drawingManager.set('polygonOptions', polygonOptions);
            }

            function setSelectedShapeColor (color) {
                if (selectedShape) {
                    if (selectedShape.type == google.maps.drawing.OverlayType.POLYLINE) {
                        selectedShape.set('strokeColor', color);
                    } else {
                        selectedShape.set('fillColor', color);
                    }
                }
            }

            function makeColorButton (color) {
                var button = document.createElement('span');
                button.className = 'color-button';
                button.style.backgroundColor = color;
                google.maps.event.addDomListener(button, 'click', function () {
                    selectColor(color);
                    setSelectedShapeColor(color);
                });

                return button;
            }

            function buildColorPalette () {
                var colorPalette = document.getElementById('color-palette');
                for (var i = 0; i < colors.length; ++i) {
                    var currColor = colors[i];
                    var colorButton = makeColorButton(currColor);
                    colorPalette.appendChild(colorButton);
                    colorButtons[currColor] = colorButton;
                }
                selectColor(colors[0]);
            }

            function initialize () {
                let polyOptions = {
                    strokeWeight: 0,
                    fillOpacity: 0.8,
                    editable: true,
                    draggable: false,
                    zIndex: 100000000000
                };
                //console.log(that);
                // Creates a drawing manager attached to the map that allows the user to draw
                // markers, lines, and shapes.
                drawingManager = new google.maps.drawing.DrawingManager({
                    drawingMode: google.maps.drawing.OverlayType.POLYGON,
                    drawingControl: true,
                    drawingControlOptions: {
                        position: google.maps.ControlPosition.BOTTOM_CENTER,
                        drawingModes: ['marker', 'polygon', 'polyline']
                    },
                    polylineOptions: {
                        editable: true,
                        draggable: false,
                        zIndex: 100000000000
                    },
                    polygonOptions: polyOptions,
                    map: that.myMap
                });

                google.maps.event.addListener(drawingManager, 'polygoncomplete', function (polygon) {
                    let path = polygon.getPath()
                    let coordinates = [];

                    for (let i = 0 ; i < path.length ; i++) {
                      coordinates.push({
                        lat: path.getAt(i).lat(),
                        lng: path.getAt(i).lng()
                      });
                    }
                    //console.log(coordinates);
                });

                google.maps.event.addListener(drawingManager, 'polylinecomplete', function (polyline) {
                    var path = polyline.getPath()
                    var coordinates = [];

                for (var i = 0 ; i < path.length ; i++) {
                      coordinates.push({
                        lat: path.getAt(i).lat(),
                        lng: path.getAt(i).lng()
                      });
                    }
                    //console.log(coordinates);
                });



                google.maps.event.addListener(drawingManager, 'overlaycomplete', function (e) {
                    var coordinatesArray = e.overlay.getPath().getArray();
                    //console.log(coordinatesArray);
                    var newShape = e.overlay;
                    
                    newShape.type = e.type;
                    
                    if (e.type !== google.maps.drawing.OverlayType.MARKER) {
                        // Switch back to non-drawing mode after drawing a shape.
                        drawingManager.setDrawingMode(null);
                        //console.log(newShape)
                        // Add an event listener that selects the newly-drawn shape when the user
                        // mouses down on it.
                        



                        google.maps.event.addListener(newShape, 'click', (e) => {
                            //console.log("IN CLICK!");
                            //console.log(e);
                            //console.log(newShape.getPath().getArray());
                            let pts;
                            let coordinates = [];

                            if(newShape.getPaths != undefined) { // handles polygons
                                pts = newShape.getPaths().getArray()[0];

                                for (var i = 0 ; i < pts.length ; i++) {
                                  coordinates.push({
                                    lat: pts.getAt(i).lat(),
                                    lng: pts.getAt(i).lng()
                                  });
                                }
                            } else { // handles paths
                                pts = newShape.getPath().getArray();
                                for (var i = 0 ; i < pts.length ; i++) {
                                  coordinates.push({
                                    lat: pts[i].lat(),
                                    lng: pts[i].lng()
                                  });
                                }
                            }

                            //console.log(pts);
                            //let pts = newShape.getPaths().getArray()[0];
                            
                            that.plotNodes(coordinates);

                            //console.log(coordinates);
                            that.interpChart.update(coordinates);





                            if (e.vertex !== undefined) {
                                //console.log(newShape.getPaths())
                                if (newShape.type === google.maps.drawing.OverlayType.POLYGON) {
                                    let path = newShape.getPaths().getAt(e.path);
                                    //console.log(path);
                                    path.removeAt(e.vertex);
                                    if (path.length < 3) {
                                        newShape.setMap(null);
                                    }
                                    //console.log(newShape.getPaths())
                                }
                                if (newShape.type === google.maps.drawing.OverlayType.POLYLINE) {
                                    let path = newShape.getPath();
                                    //console.log(path);
                                    path.removeAt(e.vertex);
                                    if (path.length < 2) {
                                        newShape.setMap(null);
                                    }
                                }
                            }
                            setSelection(newShape);
                            
                        });
                        setSelection(newShape);
                    }
                    else {
                        google.maps.event.addListener(newShape, 'click', function (e) {
                            that.setSelection(newShape);
                        });
                        setSelection(newShape);
                    }
                });

                // Clear the current selection when the drawing mode is changed, or when the
                // map is clicked.
                //console.log(that.myMap)
                google.maps.event.addListener(drawingManager, 'drawingmode_changed', clearSelection);
                google.maps.event.addListener(that.myMap, 'click', clearSelection);
                google.maps.event.addDomListener(document.getElementById('delete-button'), 'click', deleteSelectedShape);

                buildColorPalette();
            }
            google.maps.event.addDomListener(window, 'load', initialize);

    }

    /* LOOK INTO http://jsfiddle.net/geocodezip/kvaztgaL/2/ FOR Poly Line Drawing*/ 

    plotNodes(points) {
        console.log("IN POINT DRAWER!")
        console.log(points);
        let overlay = new google.maps.OverlayView();
        let that = this;

          // Add the container when the overlay is added to the map.
          overlay.onAdd = function() {
            d3.selectAll(".pathNodes").remove();
            let layer = d3.select(this.getPanes().overlayMouseTarget).append("div") // floatPane as I want sensors to be on top
                .attr("class", "pathNodes");

            // Draw each marker as a separate SVG element.
            // We could use a single SVG, but what size would it have?
            overlay.draw = function() {
              let projection = this.getProjection(),
                  padding = 7;
                console.log(layer);
                
              let marker = layer.selectAll("svg")
                  .data(points)
                  .each(transform)
                  .classed("pointNode", true);
                console.log("MARKERS HERE",marker);
              //marker
              /*
                  .on("mouseover", function(d) {        
                    console.log("MOUSEOVER!!!")
                    that.toolTip.transition()       
                        .duration(200)      
                        .style("opacity", .9);      
                    that.toolTip    .html(d.id + "<br/>"  + d.pm25) 
                        .style("left", (d3.event.pageX - 30) + "px")        
                        .style("top", (d3.event.pageY - 75) + "px");        
                    })                  
                .on("mouseout", function(d) {       
                    that.toolTip.transition()       
                        .duration(500)      
                        .style("opacity", 0);   
                })
                .on("click", function(d) {

                    if(that.marker){
                        that.marker.setMap(null);
                    }
                    selector.grabSensorData(d);
                    d3.select(this).classed("selected", true);
                    console.log(that);
                    d3.select(that.lastSelected).classed("selected", false);
                    d3.select(that.lastSelected).classed("nonSelected", true);
                    that.lastSelected = this;
                    
                    

                });
                */

              let newMarkers = marker
                .enter().append("svg")
                  .each(transform)
                  .attr("class", "pathNodes");

              marker.exit().remove();
              console.log(newMarkers)
              // Add a circle. May be unused?
              newMarkers.append("circle")
                  .attr("r", (d)=> {
                    console.log(d);
                    return "7";
                  })
                  .attr("cx", padding)
                  .attr("cy", padding)
                  .attr("fill", "purple");

            

                  
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
                console.log(projection);
                d = new google.maps.LatLng(parseFloat(d.lat), parseFloat(d.lng));
               
                d = projection.fromLatLngToDivPixel(d);
                //console.log(d3.select(this));
                console.log(d);
                return d3.select(this)
                    .style("left", (d.x - padding) + "px")
                    .style("top", (d.y - padding) + "px");
              }
            };
          };

          // Bind our overlay to the map…
          overlay.setMap(this.myMap);
    }

    updateSensor(sensorData){
        //console.log(sensorData);
        // SENSOR CODE: BEGIN HERE: 
        this.sensorData = sensorData;
        
    }
}

