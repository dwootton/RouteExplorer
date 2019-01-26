class Selector {
  /**
   * Creates a selector object
   *
   */
  constructor() {
    this.startDate = new Date();
    this.endDate = new Date();
    this.selectedDate = new Date();
    this.dataMap = window.controller.map;
    this.timeChart = window.controller.timeChart;
    this.fullData = null;

    this.getSensorInformation();

    $(()=> {
      /* Set up the time selector UI */
      $('input[name="datetimes"]').daterangepicker({
          timePicker: true,
          startDate: moment().startOf('hour').subtract(36, 'hour'),
          endDate: moment().startOf('hour'),
          locale: {
            format: 'M/DD hh:mm A'
          }
        },
        /* Callback for when dates are selected on the picker */ 
        (start, end) => {
          console.log("Callback has been called!");
          $('#reportrange span').html(start.format('D MMMM YYYY') + ' - ' + end.format('D MMMM YYYY'));
          this.startDate = new Date(start.format());
          this.endDate = new Date(end.format());

          window.controller.startDate = new Date(start.format());
          window.controller.endDate = new Date(end.format());

          this.selectedDate = new Date((this.startDate.getTime() + this.endDate.getTime()) / 2);
          console.log("CHECKOUT: ", this.endDate.toISOString().slice(0, 10).replace(/-/g, ""))
					document.getElementById("dateDisplay").textContent = "to";
          document.getElementById("startDate").textContent = formatDate(this.startDate)
          document.getElementById("stopDate").textContent =  formatDate(this.endDate);

          this.getRange()
          let sensorData = this.grabSensorData("S-A-085");
          console.log('final!', this.grabAllSensorData(this.selectedDate));
          this.modelData = this.grabAllModelData(this.selectedDate, 10, 10);

        });
    });
  }

  async getSensorInformation() {
    console.log("SENSOR INFO CALLED")
    let url = "http://air.eng.utah.edu/dbapi/api/liveSensors/airU";
    //let url = "http://air.eng.utah.edu/dbapi/api/sensorsAtTime/airU&2019-01-04T22:00:00Z"
    let req = fetch(url)

    req.then((response) => {
        console.log("SENSOR INFO CALLED", response)
        return response.text();
      })
      .then((myJSON) => {
        console.log("Inside of Sensor info", myJSON)
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
        console.log(sensors);
        this.sensorList = sensors;

      });
  }

  getRange() {
    return [this.startDate, this.endDate];
  }

  async grabSensorData(selectedSensor) {
    console.log("SELECTED SENSOR:", selectedSensor);
    //let id = "S-A-085";// Ex id: S-A-085
    if (!selectedSensor.id) {
      return;
    }
    let id = selectedSensor.id;
    console.log(selectedSensor);
    let fullData = {}

    let url = "https://www.air.eng.utah.edu/dbapi/api/rawDataFrom?id=" + id + "&sensorSource=airu&start=" + this.startDate.toISOString() + "&end=" + this.endDate.toISOString() + "&show=pm25";
    let req = this.getDataFromDB("https://www.air.eng.utah.edu/dbapi/api/rawDataFrom?id=" + id + "&sensorSource=airu&start=" + this.startDate.toISOString() + "&end=" + this.endDate.toISOString() + "&show=pm25")

    this.sensorData = await req;

    // Grab Model Data //
    let modelData = this.grabModelData(selectedSensor, this.sensorData);


  }

  async grabModelData(selectedSensor, sensorData) {
    let start = this.startDate.toISOString().slice(0, -5) + "Z";
    let stop = this.endDate.toISOString().slice(0, -5) + "Z";

    let lat = selectedSensor.lat;
    let long = selectedSensor.long;

    let modelURL = "https://air.eng.utah.edu/dbapi/api/getEstimatesForLocation?location_lat=" + lat + "&location_lng=" + long + "&start=" + start + "&end=" + stop;
    let modelReq = fetch(modelURL).then(function(response) {
      console.log(response);
      return response.text();
    }).catch((err) => {
      console.log(err);
    });


    this.modelData = JSON.parse(await modelReq);



    console.log("GOt here!", sensorData);
    this.timeChart.update(sensorData, this.modelData, selectedSensor)
  }

  async grabAllSensorData(time) { // TODO: Add in 'get closest time' and extend the readings by an hour each side
    let closestStartDate = new Date(time);
    closestStartDate.setMinutes(time.getMinutes() + 10);

    //let sensorMapData = Array.from(this.sensorList);
    this.sensorMapData = [];

    // grab the most recent values for each sensor
		let formattedTime = time.toISOString().slice(0,-5)+'Z'
		let url = "http://air.eng.utah.edu/dbapi/api/sensorsAtTime?sensorSource=airU&selectedTime=" + formattedTime;
		console.log(url)
		let promise = fetch(url)
			.then(function(response){
				console.log("INSIDE OF CALL!!!")
				let newResponse = response.clone();
				console.log(newResponse);
				//console.log(newResponse.text());
				return newResponse.text();
			}).catch((err) => {
				console.log(err);
			})
		promise.then(values => {
			console.log("Inside of second promises!");
			console.log(values);
			let parsedValues = JSON.parse(values);
			let valuesFixedAttr = parsedValues.map(function(element){
				return {
					id:element.ID,
					lat:element.Latitude,
					long:element.Longitude,
					pm25:element.pm25,
					source: element['Sensor Source']
				}
			})
			console.log(valuesFixedAttr)
			this.sensorData = valuesFixedAttr;
			this.updateSensorViews();
			return valuesFixedAttr;
		});
		/*
		let promises = [];

    for (let i = 0; i < this.sensorList.length; i++) {
      let sensorID = this.sensorList[i].id;
      let sensorLat = this.sensorList[i].lat;
      let sensorLong = this.sensorList[i].long;

      let url = "https://www.air.eng.utah.edu/dbapi/api/rawDataFrom?id=" + sensorID + "&sensorSource=airu&start=" + time.toISOString() + "&end=" + closestStartDate.toISOString() + "&show=pm25"
      promises[i] = fetch(url).then(function(response) {
        return response.text();
      }).catch((err) => {
        console.log(err);
      });

      /*
      let req = this.getDataFromDB("https://www.air.eng.utah.edu/dbapi/api/rawDataFrom?id="+sensorID+"&sensorSource=airu&start=" + time.toISOString() + "&end=" + closestStartDate.toISOString()+ "&show=pm25")
      req.then((sensorData)=> {
      	console.log(sensorData);

      	that.sensorMapData.push({
      		id:sensorID,
      		lat:sensorLat,
      		long:sensorLong,
      		pm25:sensorData[0]
      	})

    }
    Promise.all(promises.map(p => p.catch(() => undefined)))

    Promise.all(promises).then(values => {
      console.log("INSIDE OF PROMISES")
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
            pm25: readings[0].pm25
          };
          parsedVals.push(obj)
        } else {
          let obj = {
            id: sensorID,
            lat: sensorLat,
            long: sensorLong,
            pm25: -1
          };
          parsedVals.push(obj)
        }
      }
      this.sensorData = parsedVals;
      this.updateSensorViews();
      return values;
    }); */
  }



  async grabAllModelData(time) {

    let closestStartDate = new Date(time);
    closestStartDate.setMinutes(time.getMinutes() + 5);

    //let latArr = linSpace(40.598850,40.810476,xReadings);
    //let longArr = linSpace(-111.818403,-112.001349,yReadings); //Note the second long value had to be increased otherwise, it gave an error.
    let promises = [];
    this.modelVals = []; // Generates xReadings by yReadings matrix to fill
    let start = time.toISOString().slice(0, -5) + "Z";
    let stop = closestStartDate.toISOString().slice(0, -5) + "Z";
    console.log('start', start);
    console.log('stop', stop);
    let sitesArray = [];
    let i = 0;
    let url = "https://air.eng.utah.edu/dbapi/api/getGridEstimates?start=" + start + "&end=" + stop;

    let modelReq = fetch(url).then(function(response) {
      console.log(response);
      return response.text();
    }).catch((err) => {
      console.log(err);
    });

    let allModelData = JSON.parse(await modelReq)[1];

    for (time in allModelData) {
      this.modelData = allModelData[time].pm25;
    }

    this.updateViews();
    /*
    for (let [longIndex, long] of longArr.entries()){
    	for (let [latIndex, lat] of latArr.entries()){
    		let url = "https://air.eng.utah.edu/dbapi/api/getEstimatesForLocation?location_lat="+lat+"&location_lng="+long+"&start="+start + "&end=" + stop;
    		promises[i] = fetch(url).then(function(response){
    		         return response.text();
    		}).catch((err)=>{
    			console.log(err);
    		});
    		"https://air.eng.utah.edu/dbapi/api/getGridEstimates&start=2018-12-01T00:00:00Z&end=2018-12-02T00:00:00Z"
    		//let req = this.getDataFromDB(url)
    		//req.then((modelData)=> {
    		//	that.modelVals.push(modelData[0].pm25);
    		//})
    		//promises.push(req);
    		i++;
    	}
    }
    */
    /*
    Promise.all(promises.map(p => p.catch(() => undefined)))

    Promise.all(promises).then(values =>{
    	let parsedVals = [];
    	for(let i = 0; i< values.length; i++){
    		parsedVals.push(JSON.parse(values[i])[0].pm25)
    	}
        that.modelData = values;
        this.modelData = parsedVals;
        this.updateViews();
        return values;
    });
    */


    // Mine: https://air.eng.utah.edu/dbapi/api/getEstimatesForLocation?location_lat=40.645877999999996&location_lng=-111.93736100000001&start=2018-12-13T16:00:00.000Z&end=2018-12-13T16:10:00.000Z
    // Mine: https://air.eng.utah.edu/dbapi/api/getEstimatesForLocation?location_lat=40.645877999999996&location_lng=-111.93736100000001&start=2018-12-12T16:00:00Z&end=2018-12-13T16:10:00Z
    // AQaU: https://air.eng.utah.edu/dbapi/api/getEstimatesForLocation?location_lat=40.78756024557722&location_lng=-111.84837341308594&start=2018-07-08T15:26:05Z&end=2018-07-09T15:26:05Z


    //  bottomLeftCorner = {'lat': 40.598850, 'lng': -112.001349}
    // topRightCorner = {'lat': 40.810476, 'lng': -111.713403}

  }

  updateViews() {
    this.dataMap.updateModel(this.modelData);

  }

  updateSensorViews() {
    window.controller.sensorData = this.sensorData;
    this.dataMap.updateSensor(this.sensorData)
  }

  getDataFromDB(anURL) {
    return new Promise((resolve, reject) => {
      const method = 'GET';
      const async = true;
      const request = new XMLHttpRequest();

      request.open(method, anURL, async); // true => request is async

      // If the request returns succesfully, then resolve the promise
      request.onreadystatechange = function processingResponse() {
        if (request.readyState === 4 && request.status === 200) {
          const response = JSON.parse(request.responseText);
          resolve(response);
        }

        // If request has an error, then reject the promise
        request.onerror = function showWarning(e) {
          console.log('Something went wrong....');
          reject(e);
        };
      };
      request.send();
    });
  }


}

function linSpace(startValue, stopValue, cardinality) {
  var arr = [];
  var currValue = startValue;
  var step = (stopValue - startValue) / (cardinality - 1);
  for (var i = 0; i < cardinality; i++) {
    arr.push(currValue + (step * i));
  }
  return arr;
}

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
