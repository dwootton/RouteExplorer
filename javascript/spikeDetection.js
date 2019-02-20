class SpikeDetector {
  constructor(sensors) {

    this.spikeSelectDiv = d3.select(".spike-selector").append('svg') /*.append('g')*/ .attr('id', 'spikeSVG')
      //.attr('transform', 'translate(0,15)');

    this.sensorList = sensors;
    this.allSensorsData = this.gatherAllSensorData();

    //runs the signal detection code on the data
    //let processedData = performSignalDetection();



  }

  destroy() {
    this.spikeSelectDiv.remove();
    this.allSensorData = null;

  }

  /**
   * Requires that sensorList has been populated.
   * @return {[type]} [description]
   */
  gatherAllSensorData() {
    console.log(this.sensorList);
    let promises = [];
    for (let i = 0; i < this.sensorList.length; i++) {
      let sensorID = this.sensorList[i].id;
      let sensorLat = this.sensorList[i].lat;
      let sensorLong = this.sensorList[i].long;

      let url = "https://www.air.eng.utah.edu/dbapi/api/rawDataFrom?id=" + sensorID + "&sensorSource=airu&start=" + window.controller.startDate.toISOString() + "&end=" + window.controller.endDate.toISOString() + "&show=pm25"
      console.log(url);
      promises[i] = fetch(url).then(function(response) {
        return response.text();
      }).catch((err) => {
        console.log(err);
      });


    }
    Promise.all(promises.map(p => p.catch(() => undefined)))

    Promise.all(promises).then(values => {
      let parsedVals = [];
      for (let i = 0; i < values.length; i++) {
        let sensorID = this.sensorList[i].id;
        let sensorLat = this.sensorList[i].lat;
        let sensorLong = this.sensorList[i].long;
        let readings = JSON.parse(values[i]).data
        if (readings[0]) {
          let obj = {
            id: sensorID,
            lat: sensorLat,
            long: sensorLong,
            pm25: readings
          };
          parsedVals.push(obj)
        } else {
          let obj = {
            id: sensorID,
            lat: sensorLat,
            long: sensorLong,
            pm25: []
          };
          parsedVals.push(obj)
        }
      }
      this.allSensorsData = parsedVals;

      this.processedData = this.performSignalDetection();
      //this.gatherModelData();
      this.drawDetectedElements();
      return values;
    });
  }

  gatherModelData(sensor, start, end) {
    let promises = [];

    for (let i = 0; i < this.sensorList.length; i++) {
      let sensorID = this.sensorList[i].id;
      let sensorLat = this.sensorList[i].lat;
      let sensorLong = this.sensorList[i].long;


      let modelURL = "https://air.eng.utah.edu/dbapi/api/getEstimatesForLocation?location_lat=" + sensorLat + "&location_lng=" + sensorLong + "&start=" + start + "&end=" + stop;


      let url = "https://www.air.eng.utah.edu/dbapi/api/rawDataFrom?id=" + sensorID + "&sensorSource=airu&start=" + window.controller.startDate.toISOString() + "&end=" + window.controller.endDate.toISOString() + "&show=pm25"
      promises[i] = fetch(modelURL).then(function(response) {
        return response.text();
      }).catch((err) => {
        console.log(err);
      });


    }
    Promise.all(promises.map(p => p.catch(() => undefined)))

    Promise.all(promises).then(values => {
      console.log(values);
      console.log(JSON.parse(values));
      let parsedVals = [];
      for (let i = 0; i < values.length; i++) {
        let sensorID = this.sensorList[i].id;
        let sensorLat = this.sensorList[i].lat;
        let sensorLong = this.sensorList[i].long;
        let readings = JSON.parse(values[i]).data
        console.log(readings);
        if (readings[0]) {
          let obj = {
            id: sensorID,
            lat: sensorLat,
            long: sensorLong,
            pm25: readings
          };
          parsedVals.push(obj)
        } else {
          let obj = {
            id: sensorID,
            lat: sensorLat,
            long: sensorLong,
            pm25: []
          };
          parsedVals.push(obj)
        }
      }
      this.allSensorsData = parsedVals;
      console.log(this.allSensorsData);
      this.processedData = this.performSignalDetection();
      console.log(this.processedData);
      //this.gatherAllModelData();
      this.drawDetectedElements();
      return values;
    });
  }


  drawDetectedElements() {
    let spikes = [];

    this.allSensorsData.forEach(monitor => { // for each air quality monitor
      if (this.isEmpty(monitor.signalDetection) || !monitor.signalDetection) { //if it doesn't have any recordings, skip
        return;
      }
      for (let i = 0; i < monitor.signalDetection.signals.length - 2; i++) { //for each measurment in the monitor

        if (monitor.pm25[i].pm25 > 60) { // monitor.signalDetection.signals[i][1] === 1 && parseInt(monitor.pm25[i].pm25) > 50 &&  && monitor.signalDetection.signals[i][1] === 1 ) { //if the signal value is 1 (ie there is a peak), signals is not offset at there is no
          let sliceStart = i - 60;
          if (sliceStart < 0) {
            sliceStart = 0;
          }

          let sliceEnd = i + 60;
          if (sliceEnd > monitor.signalDetection.signals.length) {
            sliceEnd = monitor.signalDetection.signals.length;
          }

          let vals = monitor.pm25.slice(sliceStart, sliceEnd); //et spikeModelPts = [];
          console.log(vals);

          spikes.push({
            id: monitor.id,
            measurements: vals, // offset by 60 as the lag offsets the dates/times
            reading: [monitor.signalDetection.signals[i], monitor.pm25[i]],
            signal: monitor.signalDetection.signals.slice(sliceStart, sliceEnd),
          });
        }
      }
    })

    this.spikeData = this.findMaxSpikesOnInterval(spikes, 15);
    this.sensorDict = {};

    /* Init each */
    this.sensorList.forEach(sensor => {
      this.sensorDict[sensor.id] = {
        id: sensor.id,
        children: []
      };
    })

    /* Add each spike to parent */
    this.spikeData.forEach(spike => {
      console.log(spike);
      this.sensorDict[spike.id].children.push(spike);
    })


    this.root = {
      id: window.controller.selector.sensorSource,
      children: []
    }

    for (let sensor in this.sensorDict) {
      this.root.children.push(this.sensorDict[sensor]);
    }

    this.root = d3.hierarchy(this.root);
    console.log(this.root)
    this.drawSpikes(this.root);

    console.log(this.sensorDict, this.spikeData);
  }

  /**
   * This function works by taking in a JSON array of spikes, determining which
   * spikes occur within the same hour, and returning a list that only contains
   * one spike per hour. If an overlap occurs (ie there is more than one spike
   * in an hour), the function will choose the maximum point in that hour period.
   */
  findMaxSpikesOnInterval(spikes, interval) {
    let result = []
    console.log(spikes)
    for (let i = 0; i < spikes.length; i++) { // starting at 1 so not to index at spike[-1], No increment as you only want to advance to the next spike in the while loop
      let encounteredTime = new Date(spikes[i].measurements[60].time)
      encounteredTime = encounteredTime.getTime()
      let hourList = [];
      console.log(spikes[i]);
      while (i < spikes.length && (Math.abs(encounteredTime - new Date(spikes[i].measurements[60].time).getTime()) < interval * 60 * 1000)) { // while the new spike is still in the same hour
        console.log(encounteredTime - new Date(spikes[i].measurements[60].date).getTime())
        hourList.push(spikes[i]);
        i++;
      }
      console.log(hourList);

      let max = hourList.reduce(function(prev, current) {
        return (prev.measurements[60].value > current.measurements[60].value) ? prev : current
      });

      result.push(max);
      i--; // subtract by one so that when the for loop increments, you don't skip past the newly encountered spike
    }
    return result
  }

  drawSpikes(source) {
    let duration = 200;
    let margin = {
        top: 30,
        right: 10,
        bottom: 30,
        left: 10
      },
      width = 200,
      barHeight = 30,
      barWidth = (width - margin.left - margin.right) * 0.8;

    let color = 'green';
        // Compute the flattened node list.
    var nodes = this.root.descendants();
    console.log(nodes);
    var height = Math.max(500, nodes.length * barHeight + margin.top + margin.bottom);

    d3.select("#spikeSVG").transition()
      .duration(duration)
      .attr("height", height);

    d3.select(this.frameElement).transition()
      .duration(duration)
      .style("height", height + "px");

    var index = -1;

    this.root.eachBefore(function(n) {
      n.x = ++index * barHeight;
      n.y = 0;
    });

    source.x0 = 0;
    source.y0 = 0;

    // Update the nodes…
    let node = this.spikeSelectDiv.selectAll(".spikes")
      .data(nodes);

    var nodeEnter = node.enter().append("g")
      .attr("class", "spikes")
      .attr("transform", function(d) {
        return "translate(" + source.y0 + "," + source.x0 + ")";
      })
      .style("opacity", 0);

    let self = this;

    function click(d) {
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
      self.drawSpikes(d);
    }

    // Enter any new nodes at the parent's previous position.
    nodeEnter.append("rect")
      .attr("y", function(d){
        return (-barHeight / 2)*(1/(d.depth+1));
      })
      .attr("height", function(d){
        return barHeight*(1/(d.depth+1));
      })
      .attr("width", barWidth)
      .style("fill", color)
      .on("click", click);

    nodeEnter.append("text")
      .attr("dy", 3.5)
      .attr("dx", 5.5)
      .text(function(d) {
        console.log(d);
        return d.data.id;
      });

    // Transition nodes to their new position.
    nodeEnter.transition()
      .duration(duration)
      .attr("transform", function(d) {
        return "translate(" + d.y + "," + d.x + ")";
      })
      .style("opacity", 1);

    node.transition()
      .duration(duration)
      .attr("transform", function(d) {
        return "translate(" + d.y + "," + d.x + ")";
      })
      .style("opacity", 1)
      .select("rect")
      .style("fill", color);

    // Transition exiting nodes to the parent's new position.
    node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) {
        return "translate(" + source.y + "," + source.x + ")";
      })
      .style("opacity", 0)
      .remove();

    this.root.each(function(d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });

    /*

    console.log(this.spikeSelectDiv, this.spikeData);
    let spikeDivs = this.spikeSelectDiv.selectAll("g")
      .data(this.spikeData)
      .enter()
      .append("g")
      .attr('x', 0)
      .attr('transform', (d, i) => {
        return 'translate(' + 0 + ',' + i * (30 + 5) + ')';
      })

    spikeDivs
      .append('rect')
      .attr('y', 0)
      .attr('height', function(d, i) {
        return 20;
      })
      .classed("spikes", true);

    spikeDivs
      .append('text')
      */



  }

  /**
   * Sets up the parameters for the ZScored algorithm
   *
   *
   * @return
   *   the input data containing a new attribute with signal data from the the ZScored Algorithm.
   */
  performSignalDetection() {
    let data = [];
    this.allSensorsData.forEach((monitor) => {
      let SIG_LAG = 60;
      let SIG_THRESH = 5;
      let SIG_INF = .001;
      //monitor.signalDetection = smoothedZScore(monitor.values,SIG_LAG, SIG_THRESH,SIG_INF);
      monitor.signalDetection = this.smoothedZScore2(monitor.pm25, SIG_LAG, SIG_THRESH, SIG_INF);
    }) //end data.forEach
    return data;
  } //end function performSignalDetection

  /**
   * The ZScore Signal Detection algorithm uses a moving window and the standard deviation
   * of that window to determine if a spike is uncharacteristic.
   *
   *
   * @return
   *   the input data containing a new attribute with signal data from the the ZScored Algorithm.
   */
  smoothedZScore2(data, lag, threshold, influence) {
    let y = data; // Copy Variable name to 'y' since so much of this was written with 'y'
    let yVals = data.map(function(val) { // extract y values from the {date, value} object
      return val.pm25;
    });

    if (this.isEmpty(yVals)) {
      return;
    }
    //create signals array
    var signals = [];
    var avgFilter = [];
    var stdFilter = [];

    for (var i = 0; i < y.length; i++) {
      signals.push(0);
      avgFilter.push(0);
      stdFilter.push(0);
    }

    var filteredY = yVals.slice(0, lag);


    avgFilter[lag - 1] = this.average(yVals.slice(0, lag));
    stdFilter[lag - 1] = this.stanDeviate(yVals.slice(0, lag));


    for (var i = lag; i <= y.length - 1; i++) { //might need to remove equals

      let date = y[i].time; //read and save date for this datapoint

      if (Math.abs(yVals[i] - avgFilter[i - 1]) > threshold * stdFilter[i - 1]) {
        //if the MAGNITUDE of the current (measurement-avg) value is above the thresh*std.Dev....

        if (yVals[i] > avgFilter[i - 1]) {
          //if this value is above average, mark positive signal
          signals[i] = [date, 1];
        } else {
          //otherwise we are below average, mark negative signal
          signals[i] = [date, -1];
        } //end if-else y[i]


        filteredY[i] = influence * yVals[i] + (1 - influence) * filteredY[i - 1];

      } else {
        //if the MAGNITUDE does not exceed our threshold value, there is no signal, mark 0
        signals[i] = [date, 0];
        filteredY[i] = yVals[i];
      } //end if-else Math.abs


      var start = i - lag;
      avgFilter[i] = this.average(filteredY.slice(start, i));
      stdFilter[i] = this.stanDeviate(filteredY.slice(start, i));

    } //end for i

    //remove the zero entries from 'signals
    let measurementPairs = signals.slice(lag);

    return {
      signals: measurementPairs,
      avgFilter: avgFilter,
      stdFilter: stdFilter
    };
  } //end smoothedZScore2

  /**
   * Averages the inputted array.
   *
   *
   * @return
   *   the average of the array
   */
  average(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  /**
   * Determines the standard deviation of the inputted array
   *
   *
   * @return
   *   the standard deviation of the array
   */
  stanDeviate(arr) {
    var meanOfOrg = (arr.reduce(function(l, r) {
      return l + r;
    })) / arr.length;
    var theSqrdSet = arr.map(function(el) {
      return Math.pow((el - meanOfOrg), 2)
    });
    var theResult = Math.sqrt((theSqrdSet.reduce(function(l, r) {
      return l + r;
    })) / theSqrdSet.length);
    return theResult;
  }

  /**
   * Determines if the object is empty
   *
   *
   * @return
   *   True or false depending on if the object is empty
   */
  isEmpty(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key))
        return false;
    }
    return true;
  }
}
