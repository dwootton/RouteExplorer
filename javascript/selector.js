/**
 * @file Selector
 * @author Dylan Wootton <me@dylanwootton.com>
 * @version 0.2
 */

class Selector {
  /**
   * Creates a selector object
   *
   */
  constructor() {
    this.startDate = moment().startOf('hour').subtract(26, 'hour');
    this.endDate = moment().startOf('hour').subtract(2, 'hour');
    window.controller.selectedDate = new Date();
    this.dataMap = window.controller.map;
    this.timeChart = window.controller.timeChart;
    this.sensorSource = "airU";//"airU"
    this.rendered = false;
    this.selectedSensors = [];
    this.averagedPM25 = [];

    this.populateSensorList();

    $(()=> {

      /* Callback for when dates are selected on the picker */
      let callback = (start, end) => {
        // remove previously selected sensor from map
        if(!d3.selectAll('#selected').empty()){
          window.controller.timeChartLegend.changeMapSelectedSensor();
          window.controller.selectedSensor = null;
        }

        // Update timechart label
        /*$('#reportrange span').html(start.format('D MMMM YYYY') + ' - ' + end.format('D MMMM YYYY'));*/

        this.startDate = new Date(start.format());
        this.endDate = new Date(end.format());

        document.getElementById("overlay").style.display = "block";

        window.controller.startDate = new Date(start.format());
        window.controller.endDate = new Date(end.format());

        // select the middle timepoint as default render
        window.controller.selectedDate = new Date((this.startDate.getTime() + this.endDate.getTime()) / 2);
        window.controller.slider.changeDates();
        /* Update the date display in the navBar
        document.getElementById("dateDisplay").textContent = "to";
        document.getElementById("startDate").textContent = formatDate(this.startDate)
        document.getElementById("stopDate").textContent =  formatDate(this.endDate);*/
        this.newTime = true;

        this.grabAllSensorDataOld(window.controller.selectedDate);
        this.newTime = true;
        this.grabAllModelDataOld(window.controller.selectedDate);
        this.rendered = true;
        //this.grabModelDataForEntireRange();
        console.log(d3.selectAll('.close'));
        while(!d3.select('.close').empty()){
          d3.select('.close').dispatch('click');
        }
        //let prevSelectedSensor = [];
        if(this.selectedSensors){
          this.selectedSensors = [];
          window.controller.timeChart.initNewChart();
          /*this.selectedSensors.forEach(sensorID=>{
            //prevSelectedSensor.append(sensorID)
            console.log("Prev Clicked Element", sensorID);

            // remove the sensor from selectedSensors
            this.selectedSensors =  this.selectedSensors.filter(e => e !== sensorID);

          });*/
        }


      };

      /* Set up the time selector UI */
      $('input[name="datetimes"]').daterangepicker({
          timePicker: true,
          startDate: this.startDate,
          endDate: this.endDate,
          locale: {
            format: 'M/DD hh:mm A'
          }
        },callback);
      callback(this.startDate,this.endDate);
    });
  }

  /**
   * Determines which sensors are active and stores active sensors
   * in sensorList.
   *
   */
  async populateSensorList() {

    let url = "http://air.eng.utah.edu/dbapi/api/liveSensors/"+this.sensorSource;
    if(this.sensorSource == "airu"){
      url = "http://air.eng.utah.edu/dbapi/api/liveSensors/airU";
    }
    //let url = "http://air.eng.utah.edu/dbapi/api/sensorsAtTime/airU&2019-01-04T22:00:00Z"
    let req = fetch(url)
    console.log("INSIDE OF POPULATE!!!",this.sensorList)
    /* Adds each sensor to this.sensorList */
    req.then((response) => {
        return response.text();
      })
      .then((myJSON) => {
        myJSON = JSON.parse(myJSON);
        let sensors = [];
        for (let i = 0; i < myJSON.length; i++) {
          let val = {
            id: myJSON[i].ID,
            lat: myJSON[i].Latitude,
            long: myJSON[i].Longitude
          };
          sensors.push(val)
        }

        this.sensorList = sensors;
        console.log("INSIDE OF POPULATE!!!",this.sensorList)
      });
  }

  /**
   * Uses this.sensorSouce to determine what string capitaliziation
   * is necessary for API compatability with processedData route.
   * @return {[type]} string of the sensor source used for the API.
   */
  changeSource(){
    if(this.sensorSource == "airU" || this.sensorSource == "airu"){
      return "airu";
    } else if(this.sensorSource == "all" ) {
      console.log(window.controller.selectedSensor);
      if(window.controller.selectedSensor.id[0]=="S"){ //if AirU sensor was selected
        return "airu"
      } else {
        return "Purple Air";
      }
    } else {
      return "Purple Air";
    }
  }

grabIndividualSensorData(selectedSensor){
  if (!selectedSensor.id) {
    return;
  }
  if(!this.entireSensorData){
    this.grabIndividualSensorDataOld(selectedSensor);
  }

  let sensor = this.entireSensorData.find((element)=>{
    return element.id == selectedSensor.id;
  })
  let id = sensor.id
  window.controller.selectedSensor = selectedSensor;
  if(this.selectedSensors.includes(id)){
    console.log(id);
    window.controller.timeChartLegend.highlightSensorButton(id);
    //window.controller.timeChartLegend.dispatchEvent(id,'click');
    return;
  }
  this.selectedSensors.push(id);
  this.generateModelData = true;
  console.log(sensor)
  this.individualSensorData = {
    data:sensor.pm25,
  }


  let modelData = this.grabModelData(selectedSensor);

}

  /**
   * Grabs a individuals sensors pm25 data for the time inbetween startDate and
   * endDate. Updates this.sensorData and calls this.grabModelData.
   * @param  {[type]}  selectedSensor The sensor object to fetch data from.
   */
  async grabIndividualSensorDataOld(selectedSensor) {
    //let id = "S-A-085";// Ex id: S-A-085
    if (!selectedSensor.id) {
      return;
    }


    let start = this.startDate.toISOString().slice(0, -5) + "Z";
    let stop = this.endDate.toISOString().slice(0, -5) + "Z";

    let id = selectedSensor.id;

    window.controller.selectedSensor = selectedSensor;
    if(this.selectedSensors.includes(id)){
      console.log(id);
      window.controller.timeChartLegend.highlightSensorButton(id);
      //window.controller.timeChartLegend.dispatchEvent(id,'click');
      return;
    }
    this.selectedSensors.push(id);

    let processed = true;
    var numDaysBetween = function(d1, d2) {
      var diff = Math.abs(d1.getTime() - d2.getTime());
      return diff / (1000 * 60 * 60 * 24);
    };
    let url;
    let timeInterval = numDaysBetween(this.startDate,this.endDate);
    this.generateModelData = true;
    let changedSource = this.changeSource();
    if(timeInterval > 2){ // if time difference is
      console.log(timeInterval);

      url = "https://air.eng.utah.edu/dbapi/api/processedDataFrom?id=" + id + "&sensorSource=" + changedSource + "&start=" +start + "&end=" +stop + "&function=mean&functionArg=pm25&timeInterval=5m"

      if(timeInterval > 7){
        this.generateModelData = false;
      }
    } else {
      this.generateModelData = true;
      url = "https://www.air.eng.utah.edu/dbapi/api/rawDataFrom?id=" + id + "&sensorSource="+changedSource+"&start=" + start + "&end=" + stop + "&show=pm25";
    }


    // Note: sensor source must be lowercase for the API.

    // WORKS: https://air.eng.utah.edu/dbapi/api/processedDataFrom?id=S-A-085&sensorSource=airu&start=2019-01-20T01:08:40Z&end=2019-01-27T01:08:40Z&function=mean&functionArg=pm25&timeInterval=5m
    //https://air.eng.utah.edu/dbapi/api/processedDataFrom?id=1010&sensorSource=Purple Air&start=2019-01-20T01:08:40Z&end=2019-01-27T01:08:40Z&function=mean&functionArg=pm25&timeInterval=5m

    // /api/processedDataFrom?id=1010&sensorSource=airu&start=2017-10-01T00:00:00Z&end=2017-10-02T00:00:00Z&function=mean&functionArg=pm25&timeInterval=30m
    //let url = "air.eng.utah.edu/dbapi/api/rawDataFrom?id=S-A-085&sensorSource=airu&start=2018-03-01T00:00:00Z&end=2018-03-13T00:00:00Z&show=all"
    //let url = "air.eng.utah.edu/dbapi/api/rawDataFrom?id=S-A-069&sensorSource=airu&start=2019-01-18T12:00:00Z&end=2019-01-20T00:00:00Z&show=pm25
    console.log(url);
    let req = fetch(url)

    /* Processes sensor data and the model data */
    req.then((response) => {
      //console.log(response.text())
        return response.text();
      })
      .then((myJSON) => {
        myJSON = JSON.parse(myJSON);
        this.individualSensorData = myJSON;

        if(this.generateModelData){
          let modelData = this.grabModelData(selectedSensor);
        } else {
          this.timeChart.addData(this.individualSensorData,this.individualSensorData , selectedSensor)
        }
      });
  }

  async grabModelData(selectedSensor) {
    let start = this.startDate.toISOString().slice(0, -5) + "Z";
    let stop = this.endDate.toISOString().slice(0, -5) + "Z";

    let lat = selectedSensor.lat;
    let long = selectedSensor.long;

    let modelURL = "https://air.eng.utah.edu/dbapi/api/getEstimatesForLocation?location_lat=" + lat + "&location_lng=" + long + "&start=" + start + "&end=" + stop;
    let modelReq = fetch(modelURL)

    /* Processes sensor data and the model data */
    modelReq.then((response) => {
        return response.text();
      })
      .then((myJSON) => {
        this.modelDataAtSensorLocation = JSON.parse(myJSON);
        console.log(this.individualSensorData);
        this.timeChart.addData(this.individualSensorData, this.modelDataAtSensorLocation, selectedSensor)
      });
  }
  dispAllData(){
    console.log(this.entireModelData,this.entireSensorData);
  }



  grabAllSensorData(time){
    if(this.newTime){
      this.grabAllSensorDataOld(time);
    }


    let compareTime = new Date(time).getTime();
    let newSensorData = [];
    this.entireSensorData.forEach((sensor)=>{
      console.log(sensor);
      // find the sensor reading closest to selected time (past)
      //closestTime(sensor.pm25,new Date(time));
      let pmIndex = sensor.pm25.findIndex((element)=>{
        return new Date(element.time).getTime() > compareTime;
      });
      console.log(pmIndex);
      if(sensor.pm25 && sensor.pm25[pmIndex] && sensor.pm25[pmIndex].pm25){
        newSensorData.push({
          id:sensor.id,
          pm25:sensor.pm25[pmIndex].pm25,
          lat:sensor.lat,
          long:sensor.long,
        })
      }

    })
    console.log(newSensorData);
    this.allSensorsData = newSensorData;
    console.log(this.allSensorsData);
    this.updateSensorView();


  }

  /**
   * Obtains 1 pm25 reading from every sensor and re-renders the updates sensors
   * on the maps
   *
   * @param  {[type]}  time Date Time object of the time to grab sensor data from
   */
  async grabAllSensorDataOld(time) {

    /* Remove sensors from the map */
    if(window.controller.sensorOverlay){
      window.controller.map.blackenSensors();
    }

    /* Sets up a window of time to get pm25 values from */
    let closestStartDate = new Date(time);
    closestStartDate.setMinutes(time.getMinutes() + 10);

    /* Obtain the most recent values for each sensor */
		let formattedTime = time.toISOString().slice(0,-5)+'Z'
		let url = "http://air.eng.utah.edu/dbapi/api/sensorsAtTime?sensorSource="+this.sensorSource+"&selectedTime=" + formattedTime;
    if(this.sensorSource == 'airu'){
      url = "http://air.eng.utah.edu/dbapi/api/sensorsAtTime?sensorSource=airU&selectedTime=" + formattedTime;
    }
    console.log("INSIDE REQUEST", time)
		let req = fetch(url)
			.then(function(response){
        console.log(response);
				return response.text();
			})
      .then(values => {
      if(window.controller.selectedDate != time){
        return;
      }
			let parsedValues = JSON.parse(values);

      /* processes the retrieved data into a format for plotting on map */
			let valuesFixedAttr = parsedValues.map(function(element){
				return {
					id:element.ID,
					lat:element.Latitude,
					long:element.Longitude,
					pm25:element.pm25,
					source: element['Sensor Source']
				}
			})
      console.log("INSIDE OF ACTUAL REQUES",valuesFixedAttr);

      /* Update data and re-render map view */
			this.allSensorsData = valuesFixedAttr;
			this.updateSensorView();
      console.log(this.newTime);
      if(this.newTime){
        this.newTime = false;
        if(window.controller.spikeDetector){
          console.log(window.controller.spikeDetector);
          window.controller.spikeDetector.removeSVG();
          window.controller.spikeDetector = null;
        }
        console.log(valuesFixedAttr);
        window.controller.spikeDetector = new SpikeDetector(valuesFixedAttr);
        console.log(valuesFixedAttr);
        this.gatherSensorDataForEntireTime(valuesFixedAttr);
      }
		});
  }

  /**
   * Gets the sensor source depending on the sensor's id.
   * @param  {[type]} id [description]
   * @return {[type]}    [description]
   */
  getSensorSource(id){
    if(id){
      console.log(id.slice(0,3));
      if(id.length > 4 && id.slice(0,3)=="S-A"){ //if AirU sensor was selected
          return "airu"
      } else {
        return "Purple Air";
      }
    }
  }

  /**
   * Requires that sensorList has been populated.
   * @return {[type]} [description]
   */
  gatherSensorDataForEntireTime(sensorList) {
    this.grabModelDataForEntireRange();
    console.log(sensorList)
    this.sensorList = sensorList;
    let promises = [];
    for (let i = 0; i < this.sensorList.length; i++) {
      let sensorID = this.sensorList[i].id;
      let sensorLat = this.sensorList[i].lat;
      let sensorLong = this.sensorList[i].long;
      let source = this.getSensorSource(sensorID);
      let url = "https://www.air.eng.utah.edu/dbapi/api/rawDataFrom?id=" + sensorID + "&sensorSource="+source+"&start=" + window.controller.startDate.toISOString() + "&end=" + window.controller.endDate.toISOString() + "&show=pm25"
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
        console.log(JSON.parse(values[i]));
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
      console.log(parsedVals);
      this.entireSensorData = parsedVals;
      window.controller.spikeDetector.addData(parsedVals);
      window.controller.spikeDetector.performSignalDetection();
      window.controller.spikeDetector.drawDetectedElements();
      return values;
    });
  }
  /*
  convertToSensorList(values){
    this.sensorList = sensors;
  } */

  /**
   * Gets all of the data values for the heatmap and updates view.
   * @param  {[type]}  time [description]
   * @return {Promise}      [description]
   */
  async grabModelDataForEntireRange() {
    /* Sets up time interval to grab model data from */
    let start = window.controller.startDate.toISOString().slice(0, -5) + "Z";
    let stop = window.controller.endDate.toISOString().slice(0, -5) + "Z";

    let url = "https://air.eng.utah.edu/dbapi/api/getGridEstimates?start=" + start + "&end=" + stop;
    console.log(url);
    let timeStart = new Date();
    /* Obtains model grid estimates and re-render map view */
    let modelReq = fetch(url).then( (response)=> {
      return response.text();
    }).then( (values) => {
      /* If there is a more recent selection */

      /*if(window.controller.selectedDate != time){
        return;
      } */
      console.log(values);
      let organizedModelDataCollection = [];
      let parsedModelData = JSON.parse(values);
      console.log(parsedModelData)

      parsedModelData.shift();
      parsedModelData.forEach( (element) => {
        console.log(element);
        let date = Object.keys(element);
        console.log(date);

        console.log(element[0]);
        organizedModelDataCollection.push({
          time: new Date(date),
          data: element[date].pm25
        })
        this.averagedPM25.push(element[date].pm25.reduce((p,c,_,a) => p + c/a.length,0))

      })
      console.log(this.averagedPM25)
      window.controller.slider.changeData(this.averagedPM25);
      console.log(organizedModelDataCollection);

      this.entireModelData = organizedModelDataCollection;
      this.contours = [];
      this.entireModelData.forEach((modelSlice)=>{
        console.log(modelSlice)
        let contour = this.computeContours(modelSlice);
        console.log(contour);
        this.contours.push({
          contour:contour,
          time:modelSlice.time
        })
      })
      console.log(this.contours);
      console.log(this.entireModelData)
      let timeStop = new Date();
      console.log(timeStop.getTime()-timeStart.getTime());
      window.controller.slider.changeData(this.averagedPM25);
      document.getElementById("overlay").style.display = "none";
      /*for (time in allModelData) {
        this.entireModelData = allModelData[time].pm25;
      }
      this.updateModelView(); */

      // After all done:

    })
  }

  grabAllModelData(time){
    let requestedTime = new Date(time).getTime();
    if(typeof this.entireModelData == 'undefined'){
      this.grabAllModelDataOld(time);
    }
    let slice = this.entireModelData.find((estimate)=>{
      return new Date(estimate.time).getTime() > requestedTime;
    })
    this.allModelData = slice;
    this.updateModelView();

  }

  grabAllModelContour(time){
    let requestedTime = new Date(time).getTime();
    if(typeof this.entireModelData == 'undefined'){
      this.grabAllModelDataOld(time);
    }
    let contour = this.contours.find((estimate)=>{
      return new Date(estimate.time).getTime() > requestedTime;
    })

    this.allModelContour = contour;
    this.updateModelContourView();
  }
  /**
   * Gets all of the data values for the heatmap and updates view.
   * @param  {[type]}  time [description]
   * @return {Promise}      [description]
   */
  async grabAllModelDataOld(time) {
    /* Sets up time interval to grab model data from */
    let start = time.toISOString().slice(0, -5) + "Z";
    let closestStartDate = new Date(time);
    closestStartDate.setMinutes(time.getMinutes() + 5);
    let stop = closestStartDate.toISOString().slice(0, -5) + "Z";

    let url = "https://air.eng.utah.edu/dbapi/api/getGridEstimates?start=" + start + "&end=" + stop;

    /* Obtains model grid estimates and re-render map view */
    let modelReq = fetch(url).then( (response)=> {
      return response.text();
    }).then( (values) => {
      /* If there is a more recent selection */

      if(window.controller.selectedDate != time){
        console.log("MORE RECENT!!!")
        return;
      }
      let allModelData = JSON.parse(values)[1]; //Note: Currently broken?
      console.log(allModelData);
      for (time in allModelData) {
        this.allModelData = allModelData[time].pm25;
      }
      this.updateModelView();
    })
  }

  /**
   * Updates model heatmap
   */
  updateModelView() {
    this.dataMap.updateModel(this.allModelData);

  }

  /**
   * Updates model heatmap
   */
  updateModelContourView() {
    this.dataMap.updateModelContour(this.allModelContour);

  }


  computeContours(modelData) {
    if(modelData.data){
      modelData = modelData.data;
    }

    this.modelData = modelData;

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
    let options = {tolerance: .001, highQuality: true};

    let simpl = turf.simplify(geojson, options);
    console.log(simpl, geojson);

    let stopDate = new Date();
    let stopStamp = stopDate.getTime()
    console.log("d3 contour time: ", (stopStamp - startStamp))
    return simpl;
  }

  /**
   * Updates sensor view on map
   */
  updateSensorView() {
    window.controller.allSensorsData = this.allSensorsData;
    console.log(this.allSensorsData);
    this.dataMap.updateSensor(this.allSensorsData)
  }

  setSensorSource(source){
    console.log(source);
    this.sensorSource = source;
    //this.populateSensorList();
    console.log(this.rendered)
    if(this.rendered){
      this.grabAllSensorData(window.controller.selectedDate);
    }
  }
  setSelectedDate(selectedDate,caller){
    console.log(selectedDate,caller);
    window.controller.selectedDate = selectedDate;
    if(caller == "timeChart"){
      console.log(window.controller.slider.slider);
      window.controller.slider.slider.value(selectedDate);
    } else {
      try{
        window.controller.timeChart.updateSlider(selectedDate);
      }
      catch(error){
        console.log(error);
      }

    }

  }
}

/**
 * Formats date time object into day month year string.
 * @param  {[type]} date date time to be converted to string
 * @return {[type]}      string in order day month year
 */
function formatDate(date) {
  var monthNames = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
  ];

  var day = date.getDate();
  var monthIndex = date.getMonth();
  var year = date.getFullYear();

  return day + ' ' + monthNames[monthIndex] + ' ' + year;
}

/**
 * Performs a binary search on the array using the given accessor and returns the index
 * corresponding to the closest time in the array. Note: Requires a sorted array.
 * @param  {[type]} arr [description]
 * @param  {[type]} x   [description]
 * @return {[type]}     [description]
 */
function closestTime (arr, x) {
    //abs(x);
  //sensor.pm25.findIndex((element)=>{
    //return new Date(element.time).getTime()
    x = x.getTime();
    /* lb is the lower bound and ub the upper bound defining a subarray or arr. */
    var lb = 0,
        ub = arr.length - 1 ;
    /* We loop as long as x is in inside our subarray and the length of our subarray is greater than 0 (lb < ub). */
    while (ub - lb > 1) {
        var m = parseInt((ub - lb + 1) / 2) ; // The middle value
        /* Depending on the middle value of our subarray, we update the bound. */
        if (new Date(arr[lb + m].time).getTime() > x) {
            ub = lb + m ;
        }
        else if (new Date(arr[lb + m].time).getTime() < x) {
            lb = lb + m ;
        }
        else {
            ub = lb + m ; lb = lb + m ;
        }
    }
    /* After the loop, we know that the closest value is either the one at the lower or upper bound (may be the same if x is in arr). */
    var clst = lb ;
    if (Math.abs(arr[lb] - x) > Math.abs(arr[ub] - x)) {
        clst = ub ;
    }
    return clst ; // If you want the value instead of the index, return arr[clst]
}
