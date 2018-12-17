class Selector {
	/**
	* Creates a selector object
	*
	*/ 
	constructor(map, chart){
		this.startDate = new Date();
		this.endDate = new Date();
		this.selectedDate = new Date();
		this.map = map;
		this.timeChart = chart;
		this.fullData = null;
		this.sensorList = ["S-A-085","S-A-144","S-A-069"]
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
	        that.selectedDate =  new Date((that.startDate.getTime() + that.endDate.getTime()) / 2);

	        that.getRange()
	        let sensorData = that.grabSensorData("S-A-085");
	        console.log('final!', that.grabAllSensorData(that.selectedDate));
	       });
		});

	}

	getRange(){
		console.log([this.startDate,this.endDate]);
		return [this.startDate,this.endDate];
	}

	async grabSensorData(id){
		//let id = "S-A-085";// Ex id: S-A-085
		let fullData = {}
		
		let url = "https://www.air.eng.utah.edu/dbapi/api/rawDataFrom?id="+id+"&sensorSource=airu&start=" + this.startDate.toISOString() + "&end=" + this.endDate.toISOString()+ "&show=pm25";
		console.log(url);
		let req = this.getDataFromDB("https://www.air.eng.utah.edu/dbapi/api/rawDataFrom?id="+id+"&sensorSource=airu&start=" + this.startDate.toISOString() + "&end=" + this.endDate.toISOString()+ "&show=pm25")

		console.log("grabbed")
		let myData = await req;
		console.log(myData);
			
	}

	async grabAllSensorData(time){ // TODO: Add in 'get closest time' and extend the readings by an hour each side
		let closestStartDate = new Date(time);
		closestStartDate.setMinutes(time.getMinutes() + 10);

		let that = this;
		this.sensorMapData = {};
		// grab the most recent values for each sensor
		for(let i = 0; i < this.sensorList.length; i++){
			let sensorID = this.sensorList[i];
			let req = this.getDataFromDB("https://www.air.eng.utah.edu/dbapi/api/rawDataFrom?id="+sensorID+"&sensorSource=airu&start=" + time.toISOString() + "&end=" + closestStartDate.toISOString()+ "&show=pm25")
			req.then((sensorData)=> {
				that.sensorMapData[sensorID] = sensorData.data[0];
			})
		}
	}

	updateViews() {
		this.map.update(this.sensorMapData, this.sensorModelData);
		
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
