/**
 * @file Interpolated Chart
 * @author Dylan Wootton <me@dylanwootton.com>
 * @version 0.2
 */

class interpolatedChart {
  /**
   * Constructor for the interpolatedChart class.
   *
   */
  constructor() {
    // The point separation distances is the length in meters to grab data along
    // the drawn path.
    this.pointInterpolationDistance = 1250;

    // The div for the tool tip
    this.div = d3.select("body").append("div")
      .attr("class", "HMtooltip")
      .style("opacity", 0);

    // The margin
    this.margin = {
      top: 50,
      right: 0,
      bottom: 100,
      left: 50
    };
  }
  /**
   * drawPathLegend draws a verticle linearized version of the
   * drawn path. It draws both the
   * @param  {[type]} points    [description]
   * @return {[type]}           [description]
   */
  drawPathLegend() {

    /* Set up Linearized Polyline */
    let pathScale = d3.scaleLinear()
      .domain([0, 1])
      .range([0, this.interpolatedPoints.length * this.rectHeight]);

    let pathGroup = d3.select('#lineMap').select('svg').append('g')
      .attr("transform", "translate(" + this.margin.left / 2 + "," + (this.margin.top + 5) + ")");

    /* Append Linearized Poly Line */
    pathGroup.append('rect')
      .attr('width', 2)
      .attr('height', function(d) {
        return pathScale(1);
      })
      .attr('x', 12)
      .attr('fill', 'steelblue');

    /* Determine pathnode placing */
    let totalLength = google.maps.geometry.spherical.computeLength(this.nodePoints);
    let percentagesAlongPath = [0];
    let pathSectionDistance = 0
    for (let i = 1; i < this.nodePoints.length; i++) {
      pathSectionDistance += google.maps.geometry.spherical.computeDistanceBetween(this.nodePoints[i - 1], this.nodePoints[i]);
      let percentAlongPath = pathSectionDistance / totalLength;
      percentagesAlongPath.push(percentAlongPath);
    }

    /* Append Nodes Along Path Legend*/
    let pathGroups = pathGroup.selectAll('circle')
      .data(percentagesAlongPath);

    pathGroups.exit().remove();

    let newPathGroups = pathGroups.enter().append('g')
      .attr('transform', function(d) {
        return 'translate(' + 12 + ',' + pathScale(d) + ')';
      });

    newPathGroups
      .append('circle')
      .attr('r', 10)
      .attr('fill', 'white');

    newPathGroups.append('text')
      .text(function(d, i) {
        return i + 1;
      })
      .attr('x', function(d, i) {
        if (i > 8) {
          return -8.5;
        }
        return -4
      })
      .attr('y', +5)
      .attr('fill', 'black');
  }
  /**
   * Update takes a array of latlng points, interpolates along that path and
   * then updates the interpolatedChart views based upon the new path.
   * @param  {[latlng Array]} points An array of latlng points to interpolate along.
   * @return {[type]}
   */
  update(points) {
    window.controller.interpChart = this;

    this.nodePoints = points;
    /* Interpolate along the provied latlng points array */
    this.interpolateAlongPoints();
    this.getModelEst();
  }

  /**
   * Interpolates along this.nodePoints, creating a new point using
   * pointInterpolationDistance as the step. Results are stored in
   * this.interpolatedPoints.
   *
   */
  interpolateAlongPoints() {
    this.interpolatedPoints = [];
    if (this.nodePoints.length < 2) return;
    // calcualte distance between two points and then interpolates between them based on
    for (let i = 1; i < this.nodePoints.length; i++) {
      let pathSectionDistance = google.maps.geometry.spherical.computeDistanceBetween(this.nodePoints[i - 1], this.nodePoints[i]);
      let timesToInterp = Math.floor(pathSectionDistance / this.pointInterpolationDistance);

      /* Return if line is not longer than separationDistance */
      if (timesToInterp == 0) {
        continue;
      }

      // Determine what step is needed to interpolate along the polyline
      let interpInterval = 1.0 / timesToInterp;

      /* Interpolate along polyline at step of interpInterval, pushing latlng
      	 points to allCoordinates */
      let counter = 0;
      while (counter < 1) {
        let interpolatedValue = google.maps.geometry.spherical.interpolate(this.nodePoints[i - 1], this.nodePoints[i], counter)
        this.interpolatedPoints.push({
          lat: interpolatedValue.lat(),
          lng: interpolatedValue.lng()
        })
        counter += interpInterval;
      }
    }
  }

  /**
   * [drawLineHeatMap description]
   * @return {[type]}        [description]
   */
  drawLineHeatMap() {
    //console.log(this.interpChartData)
    let heatMapSVG;
    d3.select('#lineMap').attr('height', 300).attr('width', 650);

    let width = 3000;
    let height = 3000;
    let margin = {
      top: 50,
      right: 0,
      bottom: 100,
      left: 50
    };
    this.rectHeight = 10;
    this.rectWidth = 10;
    let rectHeight = 10;
    let rectWidth = 10;
    d3.select('#lineMap').select('svg').selectAll('g').remove();
    let svg = d3.select('#lineMap').select('svg')
      .attr('width', width)
      .attr('height', height)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    this.interpCharSVG = svg;

    let scaledPointDistances;

    let domain = [this.times[0].start, this.times[this.times.length - 1].start]
    let xExtent = this.times.length * rectWidth;
    let xScale = d3.scaleTime()
      .domain(domain)
      .range([0, xExtent]).nice();

    let colorRange = ['rgb(0,104,55,.2)', 'rgb(0,104,55,.5)', 'rgb(0,104,55)', 'rgb(26,152,80)', 'rgb(102,189,99)', 'rgb(166,217,106)', 'rgb(217,239,139)', 'rgb(255,255,191)', 'rgb(254,224,139)', 'rgb(253,174,97)', 'rgb(244,109,67)', 'rgb(215,48,39)', 'rgb(165,0,38)']; //['#a50026','#d73027','#f46d43','#fdae61','#fee08b','#ffffbf','#d9ef8b','#a6d96a','#66bd63','#1a9850','#006837'];
    let pm25Domain = [4, 8, 12, 20, 28, 35, 42, 49, 55, 150, 250, 350];
    let colorScale = d3.scaleThreshold()
      .domain(pm25Domain)
      .range(colorRange);


    let yScale = function(point) {
      return (point + 1) * rectHeight;
    }

    //Set up Color Scale

    let rects = this.interpCharSVG.selectAll("rect")
      .data(this.interpChartData);

    rects.exit().remove();

    let that = this;
    rects.enter().append('rect')
      .attr('width', rectWidth)
      .attr('height', rectHeight)
      .attr('x', function(d) {
        return xScale(d.time);
      })
      .attr('y', (d, i) => {
        return yScale(i % (this.interpChartData.length / this.times.length));
      })
      .attr('fill', function(d) {
        return colorScale(d.data);
      })
      .on("mouseover", (d, i, nodes) => {
        console.log(d)
        let matrix = nodes[i].getScreenCTM()
          .translate(+nodes[i].getAttribute("x"), +nodes[i].getAttribute("y"));

        this.div.transition()
          .duration(600)
          .style("opacity", .7);
        this.div.html(formatDate(d.time) + "</br>" + d.data.toFixed(2))
          .style("left", (window.pageXOffset + matrix.e - this.rectHeight * 2.55) + "px")
          .style("top", (window.pageYOffset + matrix.f - this.rectWidth * 6) + "px");
        window.controller.shapeDrawer.changeLineOpacity(0.3);
        window.controller.shapeDrawer.changeHighlightMarker(d.lat, d.lng)
      })
      .on("mouseout", (d) => {
        //this.mapPath.changeMapNavLine(0.9)
        this.div.transition()
          .duration(300)
          .style("opacity", 0);
        window.controller.shapeDrawer.changeLineOpacity(0.9);
        window.controller.shapeDrawer.changeHighlightMarker(0, 0)
      })

    // Append x axis
    this.x_axis = d3.axisBottom(xScale)
      .tickFormat((d) => {
        return formatDate(d); //dataset[d].keyword;
      });

    this.appendLabels();

    //Set up Append Rects
    if (d3.event) {
      d3.event.preventDefault();
      d3.event.stopPropagation();
    }

  }

  appendLabels() {

    let height = 300;
    let width = 800;
    let margin = {
      top: 20,
      left: 20
    }

    this.interpCharSVG.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -45)
      .attr("x", 0 - ((height - margin.top) / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Distance along path");

    // Add X Label
    this.interpCharSVG.append("text")
      .attr("y", -35)
      .attr("x", ((width + margin.left) / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Date");

    /* Draws the x Axis Label */
    this.interpCharSVG.append("g")
      .call(this.x_axis)
      .selectAll("text")
      .attr("y", -10)
      .attr("x", 0)
      .attr("dy", ".35em");

    // remove unneeded ticks
    var ticks = d3.selectAll(".tick text");

    ticks.attr("class", function(d, i) {
      if (i % 10 != 0) d3.select(this).remove();
    });

    /* Draw y axis label */
    this.drawPathLegend();
  }

  async getModelEst() {
    let points = this.interpolatedPoints;

    // grab the start and stop date, and generate times between them
    this.times = generateTimes(window.controller.startDate, window.controller.endDate);

    //console.log(this.times);
    let promises = [];
    let promiseCounter = 0;
    for (let timeCounter = 0; timeCounter < this.times.length; timeCounter++) {
      let start = this.times[timeCounter].start.toISOString().slice(0, -5) + "Z";
      let stop = this.times[timeCounter].stop.toISOString().slice(0, -5) + "Z";

      for (let i = 0; i < this.interpolatedPoints.length; i++) {
        let point = this.interpolatedPoints[i];


        let url = "https://air.eng.utah.edu/dbapi/api/getEstimatesForLocation?location_lat=" + point.lat + "&location_lng=" + point.lng + "&start=" + start + "&end=" + stop;
        //console.log(url)
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

    let allData = await Promise.all(promises).then(values => {
      let parsedVals = [];
      console.log(values);

      for (let i = 0; i < values.length; i++) {
        if (values[i]) {
          parsedVals.push(JSON.parse(values[i])[0].pm25)
        }
      }
      let finalVals = []
      let loggerCounter = 0;
      for (let timeCounter = 0; timeCounter < this.times.length; timeCounter++) {
        for (let pointCounter = 0; pointCounter < this.interpolatedPoints.length; pointCounter++) {
          finalVals[loggerCounter] = {
            data: parsedVals[loggerCounter],
            time: this.times[timeCounter].start,
            lat: this.interpolatedPoints[pointCounter].lat,
            lng: this.interpolatedPoints[pointCounter].lng
          }
          loggerCounter++;
        }
      }
      this.interpChartData = finalVals;
      console.log(finalVals)
      this.drawLineHeatMap();

      return finalVals;
    });
    return allData;
  }

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
/**
 * generateTimes takes in two date time objects and interpolates new date time
 * objects between the two inputs. The interpolation uses a step stored in timeStep.
 *
 * @param  {[date time]} firstDateStart The first date time to begin interpolating from.
 * @param  {[date time]} lastDateStart  The date time to interpolate up to.
 * @return {[array of date times]}      An array of interpolated date time objects
 */
function generateTimes(firstDateStart, lastDateStart) { // Currently generates 1 time point per day
  let timeStep = 3; // in hours

  firstDateStart = new Date(firstDateStart);
  lastDateStart = new Date(lastDateStart);

  /* Sets up stop times for the start times, this allows for a 5 minute interval
     to get sensor data from. */
  let firstDateStop = new Date(new Date(firstDateStart).setMinutes(firstDateStart.getMinutes() + 5));
  let LastDateStop = new Date(new Date(lastDateStart).setMinutes(lastDateStart.getMinutes() + 5));
  /* Set up array with start times */
  let starts = [];
  for (let dt = firstDateStart; dt <= lastDateStart; dt.setHours(dt.getHours() + timeStep)) {
    starts.push(new Date(dt));
  }
  /* Set up array with stop times */
  let stops = [];
  for (let dt = firstDateStop; dt <= LastDateStop; dt.setHours(dt.getHours() + timeStep)) {
    stops.push(new Date(dt));
  }
  /* Combines starts and stops to combined array */
  let times = [];
  for (let i = 0; i < stops.length; i++) {
    times.push({
      start: starts[i],
      stop: stops[i]
    })
  }
  return times;
}

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
