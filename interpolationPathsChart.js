class interpolatedChart {
  constructor(number) {
    console.log("Created!! Interp!!")
    this.pointSeparationDistances = 500; // grab point ever km

    this.div = d3.select("body").append("div")
      .attr("class", "HMtooltip")
      .style("opacity", 0)
      .style("position", "absolute");
    this.numInterpChart = number;
    this.width = 115;
    this.height = 350;
  }

  setSelector(selector) {
    this.selector = selector;
  }

  update(polyline) {
    console.log(polyline);
    window.controller.startDate = new Date("2019-3-10 06:00:00");
    window.controller.endDate = new Date("2019-3-11 06:00:00");
    this.times = generateTimes(window.controller.startDate, window.controller.endDate);
    console.log("Inside interpChart!")
    //let lats = points.map(x => x.lat);
    //let longs = points.map(x => x.lng);
    console.log(window.controller);
    window.controller.interpChart = this;
    console.log(window.controller);


    //console.log(lats,longs);
    let myFullPts = this.interpolateArray(polyline);
    /*let myLatPts = interpolateArray(lats,17);
    console.log(myLatPts)
    let myLngPts = interpolateArray(longs,17);
    console.log(myLngPts)


    */
    console.log(myFullPts);
    //let finalPts = mergeLatsAndLongs(myLatPts,myLngPts)
    let myVals = this.getModelEst(myFullPts);

  }

  interpolateArray(polyline) {
    //var path =
    let totalDistance = polyline.Distance(); //google.maps.geometry.spherical.computeLength(path.getArray());

    let numIterations = totalDistance / this.pointSeparationDistances;
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


  drawLineHeatMap(myData) {
    console.log(myData);
    let heatMapSVG;
    let allData = jQuery.extend(true, [], myData);
    console.log(allData);
    //d3.select('#lineMap').attr('height', 300).attr('width',650);


    let width = this.width;
    let height = this.height;
    let margin = {
      top: 30,
      right: 0,
      bottom: 10,
      left: 25
    };
    let rectHeight = 7.5;
    let rectWidth = 7.5;
    let svg = d3.select('#lineMap' + this.numInterpChart.toString()).select('svg')
      .attr('width', width)
      .attr('height', height)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    console.log(svg);
    console.log(d3.select('#lineMap' + this.numInterpChart.toString()))
    heatMapSVG = svg;
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




    let domain = [this.times[0].start, this.times[this.times.length - 1].start]
    //console.log(domain);
    let xExtent = this.times.length * rectWidth;
    let xScale = d3.scaleTime()
      .domain(domain)
      .range([0, xExtent]).nice();

    let colorRange = window.controller.colorRange; //['rgb(0,104,55,.2)','rgb(0,104,55,.5)','rgb(0,104,55)', 'rgb(26,152,80)', 'rgb(102,189,99)', 'rgb(166,217,106)', 'rgb(217,239,139)', 'rgb(255,255,191)', 'rgb(254,224,139)', 'rgb(253,174,97)', 'rgb(244,109,67)', 'rgb(215,48,39)', 'rgb(165,0,38)']
    ; //['#a50026','#d73027','#f46d43','#fdae61','#fee08b','#ffffbf','#d9ef8b','#a6d96a','#66bd63','#1a9850','#006837'];
    let pm25Domain = window.controller.pm25Domain; //[4, 8, 12, 20, 28, 35,42,49,55,150,250,350];
    let colorScale = d3.scaleLinear()
      .domain(pm25Domain)
      .range(colorRange);
    // Append x axis
    let x_axis = d3.axisBottom(xScale)
      .tickFormat((d) => {
        return formatDate(d); //dataset[d].keyword;
      });
    heatMapSVG.append("g")
      .call(x_axis)
      .selectAll("text")
      .attr("y", -10)
      .attr("x", 0)
      .attr("dy", ".35em");

    // remove unneeded ticks
    var ticks = d3.selectAll(".tick text");

    ticks.attr("class", function(d, i) {
      if (i % 10 != 0) d3.select(this).remove();
    });

    function formatDate(date) {
      var hours = date.getHours();
      var minutes = date.getMinutes();
      var ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      minutes = minutes < 10 ? '0' + minutes : minutes;
      var strTime = hours + ':' + minutes + ' ' + ampm;
      return date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear() + "  " + strTime;
    }
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

    let yScale = function(point) {
      return (point + 1) * rectHeight;
    }

    //Set up Color Scale

    let rects = svg.selectAll("rect")
      .data(myData);

    rects.exit().remove();

    //   let monthNames = ["Jan", "Feb", "Mar", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];

    let that = this;
    rects.enter().append('rect')
      .attr('width', rectWidth)
      .attr('height', rectHeight)
      .attr('x', function(d) {
        return xScale(d.time);
      })
      .attr('y', function(d, i) {
        //console.log(i,myData.length);
        return yScale(i % (myData.length / that.times.length));
      })
      .attr('fill', function(d) {
        return colorScale(d.data);
      })
      .on("mouseover", (d) => {
        console.log(d);
        //this.mapPath.changeMapNavLine(.2)
        this.div.transition()
          .duration(600)
          .style("opacity", .7);
        this.div.html(formatDate(d.time) + "</br>" + d.data.toFixed(2))
          .style("top", d3.event.pageY - 200 + "px")
          .style("left", d3.event.pageX - 30 + "px");
        console.log(d.lat(), d.lng());
        //window.controller.shapeDrawer.changeLineOpacity(0.3);
        window.controller.Map.changeHighlightMarker(d.lat(), d.lng())
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
        //window.controller.shapeDrawer.changeLineOpacity(0.9);
        //window.controller.shapeDrawer.changeHighlightMarker(0, 0)


        //d3.select('#highlighter').transition().duration(1000).attr('cx',-10).attr('cy',-10);
      })

    /*.on("mouseover", function(d) {
	               changeMapNavLine(.2)
	               div.transition()
	                 .duration(600)
	                 .style("opacity", .7);
	               div.html(monthNames[d.date.getMonth()] +"</br>"+ d.date.getFullYear() + "</br>" + d.data.toFixed(2))
	                 .style("top", d3.event.pageY - 70 + "px")
	                 .style("left", d3.event.pageX - 30 + "px");
	                 let currentCoordinate = navCoordinates[d.point]

	                d3.select('#highlighter')
	                .transition().duration(100).attr('cx',currentCoordinate[0]).attr('cy',currentCoordinate[1]);
	                })
	             .on("mouseout", function(d) {
	                changeMapNavLine(0.9)
	               div.transition()
	                 .duration(300)
	                 .style("opacity", 0);
	               d3.select('#highlighter').transition().duration(1000).attr('cx',-10).attr('cy',-10);
	               })

	             .on("click", function(d){
	                let monthsSinceStart = d.date.getMonth() + d.date.getYear()*12;
	                let startDate = new Date(1990,0);
	                monthsSinceStart -= startDate.getMonth() + startDate.getYear()*12;
	                window.render(monthsSinceStart)
	             })
	*/
    /*
	    rects
	        .attr('width', rectWidth)
	        .attr('height', rectHeight)
	        .attr('x', function(d,i){
	            return xScale(d.time);
	        })
	        .attr('y', function(d,i){
	        	console.log(i%myData.length)
	            return yScale(i%myData.length);
	        })
	        .attr('fill', function(d){
	            return colorScale(d.data);
	        })
		*/

    // Append Axis
    //let x_axis = d3.axisBottom(xScale).ticks((query.length/15+1));

    /*
    let xAxis = d3.svg.axis()
        .scale(xScale)
        .tickFormat(function (d) {
            return d;
        })
        .orient("top");

    */

    appendLabels(svg);

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
    console.log(latList);
    console.log(lngList);
		let allGrids = [];
		for(let i = 0; i < gridObjects.length; i++){
			let pollutionArr;
	    for (let time in gridObject[1]) {
	      pollutionArr = gridObject[1][time].pm25;
	    }

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

	    for (let row = 1; row < latList.length; row++) {
	      for (let col = 1; col < lngList.length; col++) {
	        let pollutionIndex = (row - 1) * 36 + col;
	        myGrid[row][col] = pollutionArr[pollutionIndex];
	      }
	    }
			allGrids.append(myGrid);
		}
    this.allGrids = allGrids;
    console.log(allGrids);
    //Perform the calculations
    var calcM = Interpolizer(40.7649, -111.8421, this.allGrids[0]);

    //Output the results
    console.log(calcM);




    //for each val in pollution array
    // find it's long column
    // find it's lat row
    // place it at that location in 2D array (+1 row, +1 col)


    //reshape

  }
  async getModelEst(points) {
    // change these dates to dates from the selector
    //let firstDateStart = new Date("2018-12-11T06:00:00Z")
    //let lastDateStart = new Date("2018-12-19T06:00:00Z")
    let start = new Date(this.times[0].start).toISOString().slice(0, -5) + "Z";
    let end = new Date(this.times[0].stop).toISOString().slice(0, -5) + "Z";


    let gridURL = "https://air.eng.utah.edu/dbapi/api/getGridEstimates?start=" + start + "&end=" + end;
    console.log(gridURL)
    let gridPromise = fetch(gridURL).then(function(response) {
      return response.text();
    }).catch((err) => {
      //console.log(err);
    });

    gridPromise.then(values => {
      console.log(values);
      console.log();
      this.parseGrid(JSON.parse(values))
    })



    /*



		//console.log(this.times);
		let promises = [];
		let promiseCounter = 0;
		console.log(points);
		for (let timeCounter = 0; timeCounter < this.times.length; timeCounter++){
			let start= this.times[timeCounter].start.toISOString().slice(0,-5)+"Z";
			let stop = this.times[timeCounter].stop.toISOString().slice(0,-5)+"Z";
			console.log(points);
			for (let i = 0; i< points.length; i++){
				let point = points[i];


				let url = "https://air.eng.utah.edu/dbapi/api/getEstimatesForLocation?location_lat="+point.lat()+"&location_lng="+point.lng()+"&start="+start + "&end=" + stop;

				console.log(url)
				promises[promiseCounter] = fetch(url).then(function(response){
				         return response.text();
				}).catch((err)=>{
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

		let allData = await Promise.all(promises).then(values =>{
			let parsedVals = [];
			console.log(values);

			for(let i = 0; i< values.length; i++){
				if(values[i]){
					parsedVals.push(JSON.parse(values[i])[0].pm25)
				}
			}
			let finalVals = []
			let loggerCounter = 0;
			for(let timeCounter = 0; timeCounter < this.times.length; timeCounter++){
				for(let pointCounter = 0; pointCounter < points.length; pointCounter++){
					finalVals[loggerCounter] = {
						data:parsedVals[loggerCounter],
						time:this.times[timeCounter].start,
						lat: points[pointCounter].lat,
						lng:points[pointCounter].lng
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
	}*/
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
  let LastDateStop = new Date(new Date(lastDateStart).setMinutes(lastDateStart.getMinutes() + 5));
  console.log(firstDateStart, firstDateStop)
  let arr = []
  for (let dt = firstDateStart; dt <= lastDateStart; dt.setHours(dt.getHours() + 3)) {
    arr.push(new Date(dt));
  }

  let starts = arr;
  arr = []

  for (let dt = firstDateStop; dt <= LastDateStop; dt.setHours(dt.getHours() + 3)) {
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
