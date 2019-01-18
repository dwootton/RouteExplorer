class interpolatedChart {
	constructor(selector) {
		this.pointSeparationDistances = 500; // grab point ever km
		this.div = d3.select("body").append("div")
            .attr("class", "HMtooltip")
            .style("opacity", 0);
        this.margin = { top: 50, right: 0, bottom: 100, left: 50 };

	}

	setSelector(selector){
		this.selector = selector;
	}

	drawPathLegend(points,allPoints){
		let totalLength = google.maps.geometry.spherical.computeLength(points);
		let percentagesAlongPath = [0];
		let pathSectionDistance =0
		for(let i = 1; i < points.length; i++){
			pathSectionDistance += google.maps.geometry.spherical.computeDistanceBetween(points[i-1],points[i]);
			let percentAlongPath = pathSectionDistance/totalLength;
			percentagesAlongPath.push(percentAlongPath);
		}
		/* Append Line */


		let pathScale = d3.scaleLinear()
	        .domain([0, 1])
	        .range([0, this.allPoints.length*this.rectHeight]);

	    let pathGroup = d3.select('#lineMap').select('svg').append('g')
        	.attr("transform", "translate(" + this.margin.left/2 + "," + (this.margin.top+5) + ")");

       	/* Append Linearized Path Line */
	    pathGroup.append('rect')
	        .attr('width', 2)
	        .attr('height', function(d){
	            return pathScale(1);
	        })
	        .attr('x',12)
	        .attr('fill', 'steelblue');

	    /* Append Nodes Along Path Legend*/
	    let pathGroups = pathGroup.selectAll('circle')
        	.data(percentagesAlongPath);

    	pathGroups.exit().remove();

    	let newPathGroups = pathGroups.enter().append('g')
        	.attr('transform', function(d){
            	return 'translate(' + 12+','+pathScale(d)+')';
        	});

        newPathGroups
	        .append('circle')
	        .attr('r', 10)
	        .attr('fill', 'white');

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




		console.log(percentagesAlongPath);


	}

	update(points){
		this.points = points;
		//let lats = points.map(x => x.lat);
		//let longs = points.map(x => x.lng);
		window.controller.interpChart= this;



		let myFullPts = this.interpolateArrayTwo(points);

		this.allPoints = myFullPts;
		let myVals = this.getModelEst(myFullPts);



	}

	interpolateArrayTwo(points){
		let allCoordinates = [];
		if(points.length < 2) return;
		// calcualte distance between two points and then interpolates between them based on
		for(let i = 1; i < points.length; i++){
			let pathSectionDistance = google.maps.geometry.spherical.computeDistanceBetween(points[i-1],points[i]);
			let timesToInterp = Math.floor(pathSectionDistance/this.pointSeparationDistances);
			if(timesToInterp == 0){ continue; }

			let interpInterval = 1.0/timesToInterp;
			let counter = 0;
			while(counter < 1){
				let interpolatedValue = google.maps.geometry.spherical.interpolate(points[i-1],points[i],counter)
				allCoordinates.push({
					lat: interpolatedValue.lat(),
					lng: interpolatedValue.lng()
				})
				counter += interpInterval;
			}
		}
		return allCoordinates;
	}


	drawLineHeatMap(myData){
		let heatMapSVG;
	    let allData = jQuery.extend(true, [], myData);
	    d3.select('#lineMap').attr('height', 300).attr('width',650);


	    let width = 3000;
	    let height = 3000;
	    let margin = { top: 50, right: 0, bottom: 100, left: 50 };
	    this.rectHeight = 10;
	    this.rectWidth = 10;
	    let rectHeight = 10;
	    let rectWidth = 10;
	    d3.select('#lineMap').select('svg').selectAll('g').remove();
	    let svg = d3.select('#lineMap').select('svg')
	                    .attr('width',width)
	                    .attr('height',height)
	                .append("g")
	                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
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




	    let domain = [this.times[0].start,this.times[this.times.length-1].start]
	    let xExtent = this.times.length*rectWidth;
	    let xScale = d3.scaleTime()
	            .domain(domain)
	            .range([0, xExtent]).nice();

	    let colorRange = ['rgb(0,104,55,.2)','rgb(0,104,55,.5)','rgb(0,104,55)', 'rgb(26,152,80)', 'rgb(102,189,99)', 'rgb(166,217,106)', 'rgb(217,239,139)', 'rgb(255,255,191)', 'rgb(254,224,139)', 'rgb(253,174,97)', 'rgb(244,109,67)', 'rgb(215,48,39)', 'rgb(165,0,38)']
	;//['#a50026','#d73027','#f46d43','#fdae61','#fee08b','#ffffbf','#d9ef8b','#a6d96a','#66bd63','#1a9850','#006837'];
			let pm25Domain = [4, 8, 12, 20, 28, 35,42,49,55,150,250,350];
			let colorScale  = d3.scaleThreshold()
			    .domain(pm25Domain)
			    .range(colorRange);
		// Append x axis
		let x_axis = d3.axisBottom(xScale)
					   .tickFormat((d)=> {
					   	return formatDate(d);//dataset[d].keyword;
					   });
		heatMapSVG.append("g")
	       .call(x_axis)
	       .selectAll("text")
	        .attr("y", -10)
	        .attr("x", 0)
	        .attr("dy", ".35em");

	    // remove unneeded ticks
	    var ticks = d3.selectAll(".tick text");

		ticks.attr("class", function(d,i){
		 	if(i%10 != 0) d3.select(this).remove();
		});

		function formatDate(date) {
		  var hours = date.getHours();
		  var minutes = date.getMinutes();
		  var ampm = hours >= 12 ? 'pm' : 'am';
		  hours = hours % 12;
		  hours = hours ? hours : 12; // the hour '0' should be '12'
		  minutes = minutes < 10 ? '0'+minutes : minutes;
		  var strTime = hours + ':' + minutes + ' ' + ampm;
		  return date.getMonth()+1 + "/" + date.getDate() + "/" + date.getFullYear() + "  " + strTime;
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
	    if(xScaleWidth < 200){
	        xScaleWidth = 200;
	    }
	    //Set up xScale
	    let xScale = d3.scaleTime()
	            .domain(d3.extent(query))
	            .range([0, xScaleWidth]).nice();
	*/

	    let yScale = function(point){
	        return (point+1)*rectHeight;
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
	        .attr('x', function(d){
	            return xScale(d.time);
	        })
	        .attr('y', function(d,i){
	        	//console.log(i,myData.length);
	            return yScale(i%(myData.length/that.times.length));
	        })
	        .attr('fill', function(d){
	            return colorScale(d.data);
	        })
	        .on("mouseover", (d, i, nodes) => {
                 //this.mapPath.changeMapNavLine(.2)
								 console.log(d)
								 //let e = d3.select();
								 let matrix = nodes[i].getScreenCTM()
	 					        .translate(+ nodes[i].getAttribute("x"), + nodes[i].getAttribute("y"));

                 this.div.transition()
                 	.duration(600)
                 	.style("opacity", .7);
                 this.div.html(formatDate(d.time)+ "</br>" + d.data.toFixed(2))
								 .style("left", (window.pageXOffset + matrix.e - this.rectHeight*2.55) + "px")
								 .style("top", (window.pageYOffset + matrix.f - this.rectWidth*6) + "px");
                 window.controller.shapeDrawer.changeLineOpacity(0.3);
                 window.controller.shapeDrawer.changeHighlightMarker(d.lat, d.lng)
                 //let currentCoordinate = navCoordinates[d.point]
                 //d3.select('#highlighter')
                	//.transition().duration(100).attr('cx',currentCoordinate[0]).attr('cy',currentCoordinate[1]);
             })
             .on("mouseout",(d)=> {
                 //this.mapPath.changeMapNavLine(0.9)
                 this.div.transition()
                 	.duration(300)
                 	.style("opacity", 0);
                 window.controller.shapeDrawer.changeLineOpacity(0.9);
                 window.controller.shapeDrawer.changeHighlightMarker(0, 0)


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

	async getModelEst(points){
		// change these dates to dates from the selector
		//let firstDateStart = new Date("2018-12-11T06:00:00Z")
		//let lastDateStart = new Date("2018-12-19T06:00:00Z")
		this.times = generateTimes(window.controller.startDate, window.controller.endDate);


		//console.log(this.times);
		let promises = [];
		let promiseCounter = 0;
		for (let timeCounter = 0; timeCounter < this.times.length; timeCounter++){
			let start= this.times[timeCounter].start.toISOString().slice(0,-5)+"Z";
			let stop = this.times[timeCounter].stop.toISOString().slice(0,-5)+"Z";

			for (let i = 0; i< points.length; i++){
				let point = points[i];


				let url = "https://air.eng.utah.edu/dbapi/api/getEstimatesForLocation?location_lat="+point.lat+"&location_lng="+point.lng+"&start="+start + "&end=" + stop;
				//console.log(url)
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
			//console.log(values);

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
			this.finalData = finalVals;
			//console.log(finalVals)
			this.drawLineHeatMap(finalVals)
			this.drawPathLegend(this.points,points);
		    return finalVals;
		});
		return allData;
	}

}
	function appendLabels(svg){
        let height = 300;
        let width = 800;
        let margin = {

            top:20,
            left:20
        }
        svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", -45)
                .attr("x",0 - ((height- margin.top)/ 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text("Distance along path");

            // Add X Label
        svg.append("text")
                .attr("y", -35)
                .attr("x", ((width+margin.left)/2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text("Date");
    }



function mergeLatsAndLongs(lats,longs){
			if(lats.length != longs.length){
				console.log("ERROR: Lats != Longs")
				return;
			}
			let coordinates = [];
			for(let i = 0; i < lats.length; i++){
				coordinates.push({
					lat:lats[i],
					lng:longs[i]
				})
			}
			return coordinates;
		}

function generateTimes(firstDateStart,lastDateStart){ // Currently generates 1 time point per day
	firstDateStart = new Date(firstDateStart);
	lastDateStart = new Date(lastDateStart);
	let firstDateStop = new Date(new Date(firstDateStart).setMinutes(firstDateStart.getMinutes()+5));
	let LastDateStop = new Date(new Date(lastDateStart).setMinutes(lastDateStart.getMinutes()+5));
	let arr=[]
	for(let dt=firstDateStart; dt<=lastDateStart; dt.setHours(dt.getHours()+3)){
        arr.push(new Date(dt));
    }

    let starts = arr;
    arr=[]

    for(let dt=firstDateStop; dt<=LastDateStop; dt.setHours(dt.getHours()+3)){
        arr.push(new Date(dt));
    }
    let stops = arr;
    let times = [];
    for(let i = 0; i < stops.length; i++){
    	times.push({
    		start:starts[i],
    		stop:stops[i]
    	})
    }

    return times;
}

function interpolateArray(data, fitCount) {

    var linearInterpolate = function (before, after, atPoint) {
        return before + (after - before) * atPoint;
    };

    var newData = new Array();
    var springFactor = new Number((data.length - 1) / (fitCount - 1));
    newData[0] = data[0]; // for new allocation
    for ( var i = 1; i < fitCount - 1; i++) {
        var tmp = i * springFactor;
        var before = new Number(Math.floor(tmp)).toFixed();
        var after = new Number(Math.ceil(tmp)).toFixed();
        var atPoint = tmp - before;
        newData[i] = linearInterpolate(data[before], data[after], atPoint);
    }
    newData[fitCount - 1] = data[data.length - 1]; // for new allocation
    return newData;
};
