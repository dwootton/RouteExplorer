class Selector {
	/**
	* Creates a selector object
	*
	*/ 
	constructor(myMap, chart){
		this.startDate = new Date();
		this.endDate = new Date();
		this.selectedDate = new Date();
		this.dataMap = myMap;
		this.timeChart = chart;
		this.fullData = null;

		this.getSensorInformation();


		let that = this;

		$(function() {
		  $('input[name="datetimes"]').daterangepicker({
		    timePicker: true,
		    startDate: moment().startOf('hour').subtract(36,'hour'),
		    endDate: moment().startOf('hour'),
		    locale: {
		      format: 'M/DD hh:mm A'
		    }
		  }, 
		  (start, end) => {
	        console.log("Callback has been called!");
	        $('#reportrange span').html(start.format('D MMMM YYYY') + ' - ' + end.format('D MMMM YYYY'));
	        that.startDate = new Date(start.format());
	        that.endDate = new Date(end.format()); 

	        window.controller.startDate = new Date(start.format());
	        window.controller.endDate = new Date(end.format());

	        that.selectedDate =  new Date((that.startDate.getTime() + that.endDate.getTime()) / 2);
	        console.log("CHECKOUT: " ,that.endDate.toISOString().slice(0,10).replace(/-/g,""))
	        document.getElementById("startDate").textContent= formatDate(that.startDate) + " t"
	        document.getElementById("stopDate").textContent= "o " + formatDate(that.endDate);
	        
	        that.getRange()
	        let sensorData = that.grabSensorData("S-A-085");
	        console.log('final!', that.grabAllSensorData(that.selectedDate));
	        that.modelData = that.grabAllModelData(that.selectedDate,10,10);
	        
	       });
		});
	}

	async getSensorInformation(){
		let url = "http://air.eng.utah.edu/dbapi/api/liveSensors/airU";
		let req = fetch(url)
		let that = this;
		req.then((response) => {
			return response.text();
		})
		.then((myJSON) => {
			myJSON = JSON.parse(myJSON);
			let sensors = [];
			for(let i = 0; i < myJSON.length; i++){
				let val = {
					id:myJSON[i].ID,
					lat:myJSON[i].Latitude,
					long:myJSON[i].Longitude

				};
				sensors.push(val)

			}
			that.sensorList = sensors;

		});
	}	

	getRange(){
		return [this.startDate,this.endDate];
	}

	async grabSensorData(selectedSensor){
		console.log("SELECTED SENSOR:", selectedSensor);
		//let id = "S-A-085";// Ex id: S-A-085
		if(!selectedSensor.id){
			return;
		}
		let id = selectedSensor.id;
		console.log(selectedSensor);
		let fullData = {}
		
		let url = "https://www.air.eng.utah.edu/dbapi/api/rawDataFrom?id="+id+"&sensorSource=airu&start=" + this.startDate.toISOString() + "&end=" + this.endDate.toISOString()+ "&show=pm25";
		let req = this.getDataFromDB("https://www.air.eng.utah.edu/dbapi/api/rawDataFrom?id="+id+"&sensorSource=airu&start=" + this.startDate.toISOString() + "&end=" + this.endDate.toISOString()+ "&show=pm25")

		this.sensorData = await req;
		console.log(selectedSensor);

		// Grab Model Data //
		console.log(selectedSensor);
		let modelData = this.grabModelData(selectedSensor.lat, selectedSensor.long, this.sensorData);
		
			
	}

	async grabModelData(lat,long,sensorData){
		console.log(lat,long)
		let start = this.startDate.toISOString().slice(0,-5)+"Z";
		let stop = this.endDate.toISOString().slice(0,-5)+"Z";

		let modelURL = "https://air.eng.utah.edu/dbapi/api/getEstimatesForLocation?location_lat="+lat+"&location_lng="+long+"&start="+start + "&end=" + stop;
		console.log(modelURL);
		let modelReq = fetch(modelURL).then(function(response){ 
			console.log(response);
				         return response.text();
				}).catch((err)=>{
					console.log(err);
				});


		this.modelData = JSON.parse(await modelReq);

		console.log(this.modelData);


		console.log("GOt here!", sensorData);
		this.timeChart.update(sensorData, this.modelData)
	}

	async grabAllSensorData(time){ // TODO: Add in 'get closest time' and extend the readings by an hour each side
		let closestStartDate = new Date(time);
		closestStartDate.setMinutes(time.getMinutes() + 10);

		let that = this;
		//let sensorMapData = Array.from(this.sensorList);
		this.sensorMapData =[];

		// grab the most recent values for each sensor
		let promises = [];
		for(let i = 0; i < this.sensorList.length; i++){
			let sensorID = this.sensorList[i].id;
			let sensorLat = this.sensorList[i].lat;
			let sensorLong = this.sensorList[i].long;
			let url = "https://www.air.eng.utah.edu/dbapi/api/rawDataFrom?id="+sensorID+"&sensorSource=airu&start=" + time.toISOString() + "&end=" + closestStartDate.toISOString()+ "&show=pm25"
				promises[i] = fetch(url).then(function(response){ 
				         return response.text();
				}).catch((err)=>{
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
				*/
			}
			Promise.all(promises.map(p => p.catch(() => undefined)))

		Promise.all(promises).then(values =>{
			let parsedVals = [];
			for(let i = 0; i< values.length; i++){
				let sensorID = this.sensorList[i].id;
				let sensorLat = this.sensorList[i].lat;
				let sensorLong = this.sensorList[i].long;
				let readings = JSON.parse(values[i]).data
				if(readings[0]){
					let obj = {
						id:sensorID,
						lat:sensorLat,
						long:sensorLong,
						pm25:readings[0].pm25
					};
					parsedVals.push(obj) 
				} else {
					let obj = {
						id:sensorID,
						lat:sensorLat,
						long:sensorLong,
						pm25:-1
					};
					parsedVals.push(obj) 
				}
			}
		    this.sensorData = parsedVals;
		    this.updateSensorViews();
		    return values;
		});
	}
		


	async grabAllModelData(time){

		let closestStartDate = new Date(time);
		closestStartDate.setMinutes(time.getMinutes() + 5);

		//let latArr = linSpace(40.598850,40.810476,xReadings);
		//let longArr = linSpace(-111.818403,-112.001349,yReadings); //Note the second long value had to be increased otherwise, it gave an error.
		let promises = [];
		this.modelVals = []; // Generates xReadings by yReadings matrix to fill
		let that = this;
		let start = time.toISOString().slice(0,-5)+"Z";
		let stop = closestStartDate.toISOString().slice(0,-5)+"Z";
		console.log('start', start);
		console.log('stop', stop);
		let sitesArray = [];
		let i = 0;
		let url = "https://air.eng.utah.edu/dbapi/api/getGridEstimates?start="+start+"&end=" +stop;
		
		let modelReq = fetch(url).then(function(response){ 
			console.log(response);
				         return response.text();
				}).catch((err)=>{
					console.log(err);
				});


		let allModelData = JSON.parse(await modelReq)[1];
		console.log(allModelData);
		for (time in allModelData) {
		    this.modelData = allModelData[time].pm25;
		}
		console.log(this.modelData);
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

	updateSensorViews(){
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
