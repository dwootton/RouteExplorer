class interpolatedChart {
  constructor(number) {
    console.log("Created!! Interp!!")
    this.pointSeparationDistances = 1000; // grab point ever km

    this.div = d3.select("body").append("div")
      .attr("class", "HMtooltip")
      .style("opacity", 0)
      .style("position", "absolute");
    this.numInterpChart = number;
    let bbSelection = d3.select('.line0')
    this.width = bbSelection.node().getBoundingClientRect().width + 30;
    this.height = 200;
    this.highlightAll = false;
    this.setUpPathLegend();
  }

  setUpPathLegend() {
    this.legendSVG = d3.select('#pathLegend').selectAll('svg');
    console.log(this.legendSVG)
    this.legendSVG.attr('width', this.width)
    this.legendSVG.attr('height', 20)
    this.legendSVG.append('rect')
      .attr('x', 10)
      .attr('y', 5)
      .attr('width', 250)
      .attr('height', 10)
      .attr('fill', 'black')
    /*Create and place the "blocks" containing the circle and the text */
    let start = this.legendSVG
      .append("g")
      .attr("transform", "translate(15,10)");

    let stop = this.legendSVG
      .append("g")
      .attr("transform", "translate(255,10)");

    /* Create the text for each block */


    start.append('circle')
      .attr('r', 10)
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('fill', "#e94335");

    stop.append('circle')
      .attr('r', 10)
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('fill', "#e94335");

    start.append("text")
      .attr('dy',5)
      .attr('dx',-5)
      .attr('font-size',16)
      .attr('fill','white')
      .text("A")
    stop.append("text")
      .attr('dy',5)
      .attr('dx',-5)
      .attr('font-size',16)
      .attr('fill','white')
      .text("B")



  }

  toggleHighlight() {
    // toggle highlight All
    this.highlightAll = !this.highlightAll;
    //update TOSM View
    this.updateTOSMHighLight();

  }

  setSelector(selector) {
    this.selector = selector;
  }

  update(polyline) {

    console.log(polyline);
    window.controller.startDate = new Date("2019-3-8 18:00:00");
    window.controller.endDate = new Date("2019-3-9 5:00:00");
    this.times = generateTimes(window.controller.startDate, window.controller.endDate);
    window.controller.times = this.times;
    window.controller.slider = new Slider();

    window.controller.selectedTime = this.times[0].start;
    console.log(this.times, window.controller.startDate, window.controller.endDate);
    console.log("Inside interpChart!")
    //let lats = points.map(x => x.lat);
    //let longs = points.map(x => x.lng);
    console.log(window.controller);
    window.controller.interpChart = this;
    console.log(window.controller);


    //console.log(lats,longs);
    this.interpolationPoints = this.interpolateArray(polyline);

    //this.tempDataChecker();
    //let finalPts = mergeLatsAndLongs(myLatPts,myLngPts)
    if (window.controller.allGrids == null) {
      console.log("Inside of all grids!")
      let myVals = this.getModelGrids();
      return;
    }

    let estimates = this.getEstimates();
    console.log(estimates);
    this.drawLineHeatMap(estimates);
  }
  async tempDataChecker() {

    let points = this.interpolationPoints;


    //console.log(this.times);
    let promises = [];
    let promiseCounter = 0;
    console.log(points);
    for (let timeCounter = 0; timeCounter < this.times.length; timeCounter++) {
      let start = this.times[timeCounter].start.toISOString().slice(0, -5) + "Z";
      let stop = this.times[timeCounter].stop.toISOString().slice(0, -5) + "Z";
      console.log(points);
      for (let i = 0; i < points.length; i++) {
        let point = points[i];


        let url = "https://air.eng.utah.edu/dbapi/api/getEstimatesForLocation?location_lat=" + point.lat() + "&location_lng=" + point.lng() + "&start=" + start + "&end=" + stop;

        console.log(url)
        promises[promiseCounter] = fetch(url).then(function(response) {
          return response.text();
        }).catch((err) => {
          //console.log(err);
        });
        promiseCounter++;
        //let req = this.getDataFromDB(url)
        //req.then((modelData)=> {
        //	that.modelVals.push(modelData[0].pm25);
        //})
        //promises.push(req);

      }

    }


    Promise.all(promises.map(p => p.catch(() => undefined)))

    let allData = Promise.all(promises).then(values => {
      let parsedVals = [];
      console.log(values);

      for (let i = 0; i < values.length; i++) {
        if (values[i]) {
          parsedVals.push(JSON.parse(values[i])[0].variability)
        }
      }
      let finalVals = []
      let loggerCounter = 0;
      for (let timeCounter = 0; timeCounter < this.times.length; timeCounter++) {
        for (let pointCounter = 0; pointCounter < points.length; pointCounter++) {
          finalVals[loggerCounter] = {
            data: parsedVals[loggerCounter],
            time: this.times[timeCounter].start,
            lat: points[pointCounter].lat,
            lng: points[pointCounter].lng
          }
          loggerCounter++;
        }
      }
      console.log(finalVals);
      this.finalData = finalVals;
      //console.log(finalVals)
      this.drawLineHeatMap(finalVals)
      return finalVals;
    });
    return allData;
  }


  makeFinerGrid() {

    var maxLng = -111.7134030;
    var minLng = -112.001349;
    var maxLat = 40.810476;
    var minLat = 40.598850;



    let longs = makeArr(minLng, maxLng, 245);
    let lats = makeArr(minLat, maxLat, 180);
    let pollutionArrays = [];
    console.log(longs, lats);
    for (let timeIndex = 0; timeIndex < this.times.length; timeIndex++) {
      let pollutionArr = [];
      for (let latIndex = 0; latIndex < lats.length; latIndex++) {
        for (let lngIndex = 0; lngIndex < longs.length; lngIndex++) {
          let lat = lats[latIndex]; //small to large
          let lng = longs[lngIndex];
          let pm25Value = Interpolizer(lat, lng, window.controller.allGrids[timeIndex]);
          pollutionArr.push(pm25Value.result);
        }
      }
      console.log(pollutionArr);
      pollutionArrays.push(pollutionArr);
    }
    console.log(pollutionArrays);
    window.controller.pollutionArrays = pollutionArrays;
    this.pollutionArrays = pollutionArrays;
    return //pollutionArr;
  }

  getEstimates() {
    console.log(window.controller.allGrids);
    if (window.controller.allGrids == null) {
      return;
    }
    let plottingData = [];
    let averagePMs = [];
    for (let i = 0; i < this.times.length; i++) {
      let pmSum = 0;
      this.interpolationPoints.forEach((point) => {
        console.log(point);
        let pm25Value = Interpolizer(point.lat(), point.lng(), window.controller.allGrids[i]);
        plottingData.push({
          data: pm25Value.result,
          lat: point.lat(),
          lng: point.lng(),
          time: this.times[i].start
        })
        pmSum += pm25Value.result;
        console.log(plottingData)
      })
      let pmAVG = pmSum / this.interpolationPoints.length;
      averagePMs.push(pmAVG);
    }
    console.log(averagePMs);
    window.controller.slider.changeData(averagePMs);
    console.log(plottingData);
    this.drawLineHeatMap(plottingData);

    window.controller.selectTime(0);
    //window.controller.slider


  }

  getAllPathEstimatesAtTime(index, polylines) {
    let polyLinePaths = [];
    for (let i = 0; i < polylines.length; i++) {
      let polyline = polylines[i];
      let points = this.interpolateArray(polyline);
      polyLinePaths.push(points);
    }
    window.controller.polyLinePaths = polyLinePaths;
    // calculate distance % along path
    let percentThroughPath = [];
    for (let i = 1; i <= polyLinePaths[0].length; i++) {
      let percent = (1.0 * i / polyLinePaths[0].length);
      percentThroughPath.push(percent)
    }
    let allPathPMValues = [];
    for (let i = 0; i < polyLinePaths.length; i++) {
      let pathPMValues = [];
      polyLinePaths[i].forEach((point) => {
        let pm25Value = Interpolizer(point.lat(), point.lng(), window.controller.allGrids[index]);
        pathPMValues.push(pm25Value.result);
      })
      allPathPMValues.push(pathPMValues);
    }

    let tableData = [];
    for (let i = 0; i < percentThroughPath.length; i++) {
      if (polylines.length == 3) {
        tableData.push({
          distance: percentThroughPath[i],
          Path1PM25: allPathPMValues[0][i],
          Path2PM25: allPathPMValues[1][i],
          Path3PM25: allPathPMValues[2][i],
        })
      } else if (polylines.length == 2) {
        tableData.push({
          distance: percentThroughPath[i],
          Path1PM25: allPathPMValues[0][i],
          Path2PM25: allPathPMValues[1][i],
        })
      } else {
        tableData.push({
          distance: percentThroughPath[i],
          Path1PM25: allPathPMValues[0][i],
        })
      }
      console.log(tableData);
    }
    return tableData;


  }


  interpolateArray(polyline) {
    //var path =
    let totalDistance = polyline.Distance(); //google.maps.geometry.spherical.computeLength(path.getArray());
    //set num Iterations to constant;
    let numIterations = 25; //totalDistance / this.pointSeparationDistances;
    //let traveledDistance = 0;
    console.log(totalDistance);
    console.log(numIterations);
    let points = [];
    for (let i = 0; i < numIterations; i++) {
      //let latlng = polylength*(traveledDistance/totalDistance)/100;
      var latlng = polyline.GetPointAtDistance(polyline.Distance() * (1.0 * i / numIterations));
      points.push(latlng);
    }
    console.log(points);
    return points;
  }

  interpolateArrayTwo(points) {
    let allCoordinates = [];
    console.log(points)
    if (points.length < 2) return;
    // calcualte distance between two points and then interpolates between them based on
    for (let i = 1; i < points.length; i++) {
      let pathSectionDistance = google.maps.geometry.spherical.computeDistanceBetween(points[i - 1], points[i]);
      console.log(google.maps.geometry.spherical.computeDistanceBetween);
      console.log(this.pointSeparationDistances, pathSectionDistance);
      let timesToInterp = Math.floor(pathSectionDistance / this.pointSeparationDistances);

      if (timesToInterp == 0) {
        continue;
      }
      console.log(pathSectionDistance)


      let interpInterval = 1.0 / timesToInterp;
      console.log(interpInterval);
      let counter = 0;
      while (counter < 1) {
        let interpolatedValue = google.maps.geometry.spherical.interpolate(points[i - 1], points[i], counter)
        console.log(interpolatedValue);
        allCoordinates.push({
          lat: interpolatedValue.lat(),
          lng: interpolatedValue.lng()
        })
        counter += interpInterval;
      }
      console.log(allCoordinates);
    }
    return allCoordinates;
    //google.maps.geometry.spherical.computeDistanceBetween(pt1,pt2);
    //console.log(google.maps.geometry.spherical.computeLength(path))
  }

  updateTOSMHighLight() {
    let svg = d3.select('#lineMap' + this.numInterpChart.toString()).select('svg').selectAll('g');
    let rects = svg.selectAll("rect");
    let colorScale = d3.scaleLinear()
      .domain(this.pm25Domain)
      .range(this.colorRange);
    rects
      .transition()
      .duration(400)
      .attr('fill', (d, i) => {
        let color = d3.rgb(colorScale(d.data));
        if (d.time.toISOString() == window.controller.selectedTime.toISOString() || this.highlightAll) { //index is valid
          return color;
        } //index is valid
        return color.darker(0.5);
      })
      .attr('opacity', (d, i) => {
        if (d.time.toISOString() == window.controller.selectedTime.toISOString() || this.highlightAll) { //index is valid
          return 1.0;
        }
        return 0.6;
      })
  }

  drawLineHeatMap(myData) {
    console.log(myData);
    let heatMapSVG;
    let allData = jQuery.extend(true, [], myData);
    console.log(allData);
    //d3.select('#lineMap').attr('height', 300).attr('width',650);


    let width = this.width;
    let height = this.height;
    let margin = {
      top: 10,
      right: 0,
      bottom: 25,
      left: 0
    };


    let svg = d3.select('#lineMap' + this.numInterpChart.toString()).select('svg')
      .attr('width', width)
      .attr('height', height)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    console.log(svg);
    console.log(d3.select('#lineMap' + this.numInterpChart.toString()))
    heatMapSVG = svg;

    svg.on('mouseleave', function(d) {
      d3.selectAll('.highlightOverlay').remove();
    })
    /*
    let pathGroup = d3.select('#lineMap').select('svg').append('g')
        .attr("transform", "translate(" + margin.left/2 + "," + margin.top + ")");

    let pathScale = d3.scaleLinear()
        .domain([0, d3.max(myData)])
        .range([0, allData.length*rectHeight]);

    pathGroup.append('rect')
        .attr('width', 2)
        .attr('height', function(d){
            return pathScale(1);
        })
        .attr('x',12)
        .attr('fill', 'steelblue');
        */
    let scaledPointDistances;

    //console.log(domain);


    /*let colorRange = window.controller.colorRange; //['rgb(0,104,55,.2)','rgb(0,104,55,.5)','rgb(0,104,55)', 'rgb(26,152,80)', 'rgb(102,189,99)', 'rgb(166,217,106)', 'rgb(217,239,139)', 'rgb(255,255,191)', 'rgb(254,224,139)', 'rgb(253,174,97)', 'rgb(244,109,67)', 'rgb(215,48,39)', 'rgb(165,0,38)']
    ; //['#a50026','#d73027','#f46d43','#fdae61','#fee08b','#ffffbf','#d9ef8b','#a6d96a','#66bd63','#1a9850','#006837'];
    let pm25Domain = window.controller.pm25Domain; //[4, 8, 12, 20, 28, 35,42,49,55,150,250,350];
    let colorScale = d3.scaleLinear()
      .domain(pm25Domain)
      .range(colorRange);*/
    this.colorRange = ['rgba(0,104,55,.2)', 'rgba(102,189,99,1)', 'rgba(255,239,139,1)', 'rgba(255,180,33,1)', 'rgba(253,174,97,1)', 'rgba(244,109,67,1)', 'rgba(215,48,39,1)', 'rgba(165,0,38,1)']; //['#a50026','#d73027','#f46d43','#fdae61','#fee08b','#ffffbf','#d9ef8b','#a6d96a','#66bd63','#1a9850','#006837'];
    this.pm25Domain = [0, 4, 12, 35, 55, 85, 150, 250, 350];
    let colorScale = d3.scaleLinear()
      .domain(this.pm25Domain)
      .range(this.colorRange);
    //let colorScale = window.controller.colorMap;

    // remove unneeded ticks

    /*
	    let pathGroups = pathGroup.selectAll('circle')
	        .data(scaledPointDistances);

	    pathGroups.exit().remove();

	    let newPathGroups = pathGroups.enter().append('g')
	        .attr('transform', function(d){
	            return 'translate(' + 12+','+pathScale(d)+')';
	        });

	    newPathGroups
	        .append('circle')
	        .attr('r', 10)
	        .attr('fill',function(d,i){
	            if(currentSelectedCircle === i){
	                return '#F5B000';
	            }
	            return 'white'});

	    newPathGroups.append('text')
	        .text(function(d,i){
	            return i+1;
	        })
	        .attr('x', function(d,i){
	            if(i > 8){
	                return -8.5;
	            }
	            return -4})
	        .attr('y', +5)
	        .attr('fill','black');

	    for(let i = 0; i < allData.length; i++){
	        if(allData[i] !== undefined){
	            allData[i].val = bindDateAndPointToData(allData[i], new Date(1990,0),i);
	        }
	    }

	    let query = heatmap.getCurrentQuery();
	    let selectedData = filterDataToQuery(query,allData);
	    //let groupedSelectedData = groupData(query,selectedData);

	    // Currently data is not grouped by point. Group by point and then visualize array as heatmap


	    let xScaleWidth = query.length*(rectWidth);
	    console.log(xScaleWidth);
	    if(xScaleWidth < 200){
	        xScaleWidth = 200;
	    }
	    //Set up xScale
	    let xScale = d3.scaleTime()
	            .domain(d3.extent(query))
	            .range([0, xScaleWidth]).nice();
	*/






    let yBandStarts = []
    let dataNewYorkTimes = window.controller.times.map(d => {
      yBandStarts.push((d.start));
    });
    console.log(yBandStarts);

    let padding = 0.01;
    console.log(svg);
    let yBand = d3
      .scaleBand()
      .domain(yBandStarts)
      .range([0, height - margin.bottom - margin.top])
      .padding(padding);
    this.yBand = yBand;

    let rectHeight = yBand.bandwidth;
    let rectWidth = 10;
    console.log(rectHeight, rectWidth)
    let xScale = function(point) {
      return (point + 1) * (rectWidth);
    }
    //Set up Color Scale

    let rects = svg.selectAll("rect")
      .data(myData);

    rects.exit().remove();

    //   let monthNames = ["Jan", "Feb", "Mar", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];

    let that = this;
    console.log(yBand(that.times[0]))
    rects.enter().append('rect')
      .attr('width', rectWidth)
      .attr('height', rectHeight)
      .attr('x', function(d, i) {
        return xScale(i % (myData.length / that.times.length));
      })
      .attr('y', function(d, i) {
        //console.log(i,myData.length);
        console.log(yBand(d.time), d.time)
        return yBand(d.time);

      })
      .on("mouseover", (d) => {
        console.log(d);
        //this.mapPath.changeMapNavLine(.2)
        this.div.transition()
          .duration(600)
          .style("opacity", .7);
        this.div.html(d.data.toFixed(2))
          .style("top", d3.event.pageY - 200 + "px")
          .style("left", d3.event.pageX - 30 + "px");
        //window.controller.shapeDrawer.changeLineOpacity(0.3);
        window.controller.Map.changeHighlightMarker(d.lat, d.lng);
        //let currentCoordinate = navCoordinates[d.point]
        //d3.select('#highlighter')
        //	.transition().duration(100).attr('cx',currentCoordinate[0]).attr('cy',currentCoordinate[1]);
      })
      .on("mouseout", (d) => {
        //this.mapPath.changeMapNavLine(0.9)
        console.log(this.div);
        this.div.transition()
          .duration(300)
          .style("opacity", 0);
      })
      .on("click", (d, i) => {
        // set selected date
        window.controller.selectedDate = d.time;
        // update map view
        let index = 0;
        for (let index = 0; index < this.times.length; index++) {
          let time = this.times[index];
          console.log(time);
          console.log(time.start.toISOString(), d.time.toISOString())
          if (time.start.toISOString() == d.time.toISOString()) {
            window.controller.selectTime(index);
          }
        }

        //console.log(i % (myData.length / this.interpolationPoints.length));
        //window.controller.grabAllModelData(i % (myData.length / this.interpolationPoints.length));
      })
      .transition()
      .duration(0)
      .attr('fill', function(d, i) {
        let color = d3.rgb(colorScale(d.data));
        console.log(d.time, window.controller.selectedTime)
        if (d.time.toISOString() == window.controller.selectedTime.toISOString()) { //index is valid
          return color;
        } //index is valid
        return color.darker(0.5);
      })
      .attr('opacity', function(d, i) {
        if (d.time.toISOString() == window.controller.selectedTime.toISOString()) { //index is valid
          return 1.0;
        }
        return 0.6;
      })

    //appendLabels(svg);

    //Set up Append Rects
    if (d3.event) {
      d3.event.preventDefault();
      d3.event.stopPropagation();
    }
  }

  parseGrid(gridObjects) {
    let gridObject = gridObjects[0];
    console.log(gridObject);
    let latList = [-1];
    for (let i = 0; i < 36; i++) {
      latList.push(gridObject[0][i].lat);
    }


    let lngList = [-1];
    for (let i = 0; i < Object.keys(gridObject[0]).length; i = i + 36) {
      lngList.push(gridObject[0][i].lng);
    }
    //lngList.push(-1);
    //lngList = lngList.reverse();
    //latList = latList.reverse();
    console.log(latList);
    console.log(lngList);
    let allGrids = [];
    let allPollutionArrs = [];
    for (let i = 0; i < gridObjects.length; i++) {
      gridObject = gridObjects[i];
      let pollutionArr;
      for (let time in gridObject[1]) {
        pollutionArr = gridObject[1][time].pm25;
      }
      // add to pollution arrays (used for rendering);
      allPollutionArrs.push(pollutionArr);

      let value = -1; // by default
      let myGrid = new Array(37).fill(0).map(() => new Array(50).fill(0));
      // fill in first row
      let fillCounter = 0;
      for (let i = 0; i < 50; i++) {
        myGrid[0][i] = lngList[fillCounter];
        fillCounter++;
      }

      // fill in first col
      fillCounter = 0;
      for (let i = 0; i < 37; i++) {
        myGrid[i][0] = latList[fillCounter];
        fillCounter++;
      }

      let counter = latList.length - 1;
      for (let row = 1; row < latList.length; row++) {
        for (let col = 1; col < lngList.length; col++) {
          //let pollutionIndex = (row-1) * 36 + (col-1);
          /* Pollution Array is stored like this
          [3][7][11]
          [2][6][10]
          [1][5][9]
          [0][4][8]

           */
          let pollutionIndex = (col - 1) * 36 + (row - 1);
          /*if(row > parseInt(latList.length/2)){
          	if(col > parseInt(lngList.length/2)){
          		val = 100;
          	} else {
          		val = 30
          	}
          } else {
          	if(col > parseInt(lngList.length/2)){
          		val = 10;
          	} else {
          		val = 2;
          	}
          }*/

          myGrid[counter][col] = pollutionArr[pollutionIndex];
        }
        counter--;
      }
      allGrids.push(myGrid);
    }
    window.controller.allGrids = allGrids;
    console.log(allGrids);
    console.log("Start Make Finer");
    this.makeFinerGrid();
    console.log("End Make Finer");
    console.log(this.pollutionArrays)
    window.controller.Map.calculateContour(this.pollutionArrays);


    //window.controller.pollutionArrays = allPollutionArrs;
    console.log(allGrids);

    let dataToPlot = this.getEstimates();
    //Perform the calculations
    console.log(dataToPlot);





    //for each val in pollution array
    // find it's long column
    // find it's lat row
    // place it at that location in 2D array (+1 row, +1 col)


    //reshape

  }

  async getModelGrids() {
    // change these dates to dates from the selector
    //let firstDateStart = new Date("2018-12-11T06:00:00Z")
    //let lastDateStart = new Date("2018-12-19T06:00:00Z")



    //console.log(this.times);
    let promises = [];
    let promiseCounter = 0;
    for (let timeCounter = 0; timeCounter < this.times.length; timeCounter++) {
      let start = this.times[timeCounter].start.toISOString().slice(0, -5) + "Z";
      let stop = this.times[timeCounter].stop.toISOString().slice(0, -5) + "Z";

      let gridURL = "https://air.eng.utah.edu/dbapi/api/getGridEstimates?start=" + start + "&end=" + stop;
      console.log(gridURL);
      promises[promiseCounter] = fetch(gridURL).then(function(response) {
        return response.text();
      }).catch((err) => {
        //console.log(err);
      });
      promiseCounter++;
    }


    Promise.all(promises.map(p => p.catch(() => undefined)))

    let allData = await Promise.all(promises).then(values => {
      let parsedVals = [];
      console.log(values);

      for (let i = 0; i < values.length; i++) {
        if (values[i]) {
          parsedVals.push(JSON.parse(values[i]))
          console.log(JSON.parse(values[i]));
        }
      }
      console.log(parsedVals);
      this.parseGrid(parsedVals);

      //this.drawLineHeatMap(finalVals)
    })
  }
}

function appendLabels(svg) {
  let height = this.height;
  let width = this.width;
  let margin = {
    top: 5,
    left: 10
  }
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -45)
    .attr("x", 0 - ((height - margin.top) / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Distance along path");

  // Add X Label
  svg.append("text")
    .attr("y", -35)
    .attr("x", ((width + margin.left) / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Date");
}



function mergeLatsAndLongs(lats, longs) {
  if (lats.length != longs.length) {
    console.log("ERROR: Lats != Longs")
    return;
  }
  let coordinates = [];
  for (let i = 0; i < lats.length; i++) {
    coordinates.push({
      lat: lats[i],
      lng: longs[i]
    })
  }
  return coordinates;
}

function generateTimes(firstDateStart, lastDateStart) { // Currently generates 1 time point per day
  firstDateStart = new Date(firstDateStart);
  lastDateStart = new Date(lastDateStart);
  let firstDateStop = new Date(new Date(firstDateStart).setMinutes(firstDateStart.getMinutes() + 5));
  let lastDateStop = new Date(new Date(lastDateStart).setMinutes(lastDateStart.getMinutes() + 5));
  console.log(firstDateStart, lastDateStart)
  let arr = []
  for (let dt = firstDateStart; dt <= lastDateStart; dt.setHours(dt.getHours() + 1)) {
    arr.push(new Date(dt));
  }

  let starts = arr;
  arr = []

  for (let dt = firstDateStop; dt <= lastDateStop; dt.setHours(dt.getHours() + 1)) {
    arr.push(new Date(dt));
  }
  let stops = arr;
  let times = [];
  for (let i = 0; i < stops.length; i++) {
    times.push({
      start: starts[i],
      stop: stops[i]
    })
  }
  console.log(times);

  return times;
}

function interpolateArray(data, fitCount) {

  var linearInterpolate = function(before, after, atPoint) {
    return before + (after - before) * atPoint;
  };

  var newData = new Array();
  var springFactor = new Number((data.length - 1) / (fitCount - 1));
  newData[0] = data[0]; // for new allocation
  for (var i = 1; i < fitCount - 1; i++) {
    var tmp = i * springFactor;
    var before = new Number(Math.floor(tmp)).toFixed();
    var after = new Number(Math.ceil(tmp)).toFixed();
    var atPoint = tmp - before;
    newData[i] = linearInterpolate(data[before], data[after], atPoint);
  }
  newData[fitCount - 1] = data[data.length - 1]; // for new allocation
  return newData;
};

function makeArr(startValue, stopValue, cardinality) {
  var arr = [];
  var currValue = startValue;
  var step = (stopValue - startValue) / (cardinality - 1);
  for (var i = 0; i < cardinality; i++) {
    arr.push(currValue + (step * i));
  }
  return arr;
}
