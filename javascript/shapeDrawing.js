class shapeDrawer {
    /* Code from : http://bl.ocks.org/knownasilya/89a32e572989f0aff1f8*/
    constructor(myMap) {
            console.log("Inside of shape drawer!")
            this.myMap = myMap;
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
                var polyOptions = {
                    strokeWeight: 0,
                    fillOpacity: 0.8,
                    editable: true,
                    draggable: false,
                    zIndex: 100000000000
                };
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
                    var path = polygon.getPath()
                    var coordinates = [];

                for (var i = 0 ; i < path.length ; i++) {
                      coordinates.push({
                        lat: path.getAt(i).lat(),
                        lng: path.getAt(i).lng()
                      });
                    }
                    console.log(coordinates);
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
                    console.log(coordinates);
                });



                google.maps.event.addListener(drawingManager, 'overlaycomplete', function (e) {
                    var coordinatesArray = e.overlay.getPath().getArray();
                    console.log(coordinatesArray);
                    var newShape = e.overlay;
                    
                    newShape.type = e.type;
                    
                    if (e.type !== google.maps.drawing.OverlayType.MARKER) {
                        // Switch back to non-drawing mode after drawing a shape.
                        drawingManager.setDrawingMode(null);
                        console.log(newShape)
                        // Add an event listener that selects the newly-drawn shape when the user
                        // mouses down on it.
                        



                        google.maps.event.addListener(newShape, 'click', function (e) {
                            console.log("IN CLICK!");
                            console.log(e);
                            console.log(newShape.getPaths().getArray())
                            let pts = newShape.getPaths().getArray()[0];
                            let coordinates = [];
                            for (var i = 0 ; i < pts.length ; i++) {
                              coordinates.push({
                                lat: pts.getAt(i).lat(),
                                lng: pts.getAt(i).lng()
                              });
                            }
                            console.log(coordinates);




                            if (e.vertex !== undefined) {
                                console.log(newShape.getPaths())
                                if (newShape.type === google.maps.drawing.OverlayType.POLYGON) {
                                    let path = newShape.getPaths().getAt(e.path);
                                    console.log(path);
                                    path.removeAt(e.vertex);
                                    if (path.length < 3) {
                                        newShape.setMap(null);
                                    }
                                    console.log(newShape.getPaths())
                                }
                                if (newShape.type === google.maps.drawing.OverlayType.POLYLINE) {
                                    let path = newShape.getPath();
                                    console.log(path);
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
                            setSelection(newShape);
                        });
                        setSelection(newShape);
                    }
                });

                // Clear the current selection when the drawing mode is changed, or when the
                // map is clicked.
                console.log(that.myMap)
                google.maps.event.addListener(drawingManager, 'drawingmode_changed', clearSelection);
                google.maps.event.addListener(that.myMap, 'click', clearSelection);
                google.maps.event.addDomListener(document.getElementById('delete-button'), 'click', deleteSelectedShape);

                buildColorPalette();
            }
            google.maps.event.addDomListener(window, 'load', initialize);

    }
}

