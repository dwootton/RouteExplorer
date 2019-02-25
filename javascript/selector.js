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

        window.controller.startDate = new Date(start.format());
        window.controller.endDate = new Date(end.format());

        // select the middle timepoint as default render
        window.controller.selectedDate = new Date((this.startDate.getTime() + this.endDate.getTime()) / 2);

        /* Update the date display in the navBar
        document.getElementById("dateDisplay").textContent = "to";
        document.getElementById("startDate").textContent = formatDate(this.startDate)
        document.getElementById("stopDate").textContent =  formatDate(this.endDate);*/
        this.newTime = true;

        this.grabAllSensorData(window.controller.selectedDate);
        this.modelData = this.grabAllModelData(window.controller.selectedDate, 10, 10);
        this.rendered = true;
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
      if(window.controller.selectedSensor.id[0]=="S"){ //if AirU sensor was selected
        return "airu"
      } else {
        return "Purple Air";
      }
    } else {
      return "Purple Air";
    }
  }

  /**
   * Grabs a individuals sensors pm25 data for the time inbetween startDate and
   * endDate. Updates this.sensorData and calls this.grabModelData.
   * @param  {[type]}  selectedSensor The sensor object to fetch data from.
   */
  async grabIndividualSensorData(selectedSensor) {
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

    if(timeInterval > 2){ // if time difference is
      console.log(timeInterval);
      let changedSource = this.changeSource();
      url = "https://air.eng.utah.edu/dbapi/api/processedDataFrom?id=" + id + "&sensorSource=" + changedSource + "&start=" +start + "&end=" +stop + "&function=mean&functionArg=pm25&timeInterval=5m"

      if(timeInterval > 7){
        this.generateModelData = false;
      }
    } else {
      this.generateModelData = true;
      url = "https://www.air.eng.utah.edu/dbapi/api/rawDataFrom?id=" + id + "&sensorSource="+this.sensorSource.toLowerCase()+"&start=" + start + "&end=" + stop + "&show=pm25";
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
        this.timeChart.addData(this.individualSensorData, this.modelDataAtSensorLocation, selectedSensor)
      });
  }


  /**
   * Obtains 1 pm25 reading from every sensor and re-renders the updates sensors
   * on the maps
   *
   * @param  {[type]}  time Date Time object of the time to grab sensor data from
   */
  async grabAllSensorData(time) {
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

      if(this.newTime){
        this.newTime = false;
        if(window.controller.spikeDetector){
          console.log(window.controller.spikeDetector);
          window.controller.spikeDetector.removeSVG();
          window.controller.spikeDetector = null;
        }
        window.controller.spikeDetector = new SpikeDetector(valuesFixedAttr);

      }
		});
  }

  /**
   * Gets all of the data values
   * @param  {[type]}  time [description]
   * @return {Promise}      [description]
   */
  async grabAllModelData(time) {
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
        return;
      }
      let allModelData = JSON.parse(values)[1];
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
   * Updates sensor view on map
   */
  updateSensorView() {
    window.controller.allSensorsData = this.allSensorsData;
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
