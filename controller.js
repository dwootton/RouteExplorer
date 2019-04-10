class Controller {
  constructor() {
    this.Map = new AQMap();
    console.log("new controller");
    this.width = 245;
		this.height = 180;
  }
  search(){

    let directionsOptions = this.constructQuery();
    // add loading
    //this.Map.renderDirections(directionsOptions);
    this.Map.plotDirections(document.getElementById("start").value.replace(/ /g,"+"),document.getElementById("destination").value.replace(/ /g,"+"));


    //finish laoding
  }

  prepareData(){
    let polylines = window.controller.Map.getPolyLinePaths();
    let data = window.controller.interpChart.getAllPathEstimatesAtTime(0,polylines);
    console.log(data);
    return data;
  }

  drawChart(){
    let data = this.prepareData();

    // TODO: assuming 3 lines
    data.forEach(function (d) {
        d.distance = +d.distance;
        d.Path1PM25 = +d.Path1PM25;
        d.Path2PM25 = +d.Path2PM25;
        d.Path3PM25 = +d.Path3PM25;
    });

    let path1 =['Path 1'],
        path2 =['Path 2'],
        path3 =['Path 3'];

    for(let i = 0; i < data.length; i++){
      path1.push(data[i].Path1PM25);
      path2.push(data[i].Path2PM25);
      path3.push(data[i].Path3PM25);
    }
    let chartWidth = document.getElementById('chart').clientWidth;
    var chart = c3.generate({
        bindto: '#chart',
        data: {
          columns: [
            path1, path2, path3
          ]
        },
        color: {
          pattern: ['#ff0000','#00ff00','#0000ff']
        },
        size: {
          height: 300,
          width: chartWidth
        },
    });
  }
  constructQuery(){
    let baseURL = "https://maps.googleapis.com/maps/api/directions/json?";
    let origin = "origin=" + document.getElementById("start").value.replace(/ /g,"+");
    let destination = "&destination=" + document.getElementById("destination").value.replace(/ /g,"+");
    let mode = "&mode="+this.transportMode;
    let forUse = "&key=AIzaSyA3X5TPjGMtpRK1NnVeuDOCAwvZSKPT564";
    let alternates = "&alternatives=true"
    let query = baseURL+origin+destination+mode+forUse+alternates;
    //return query;

    let options = {
      origin: document.getElementById("start").value.replace(/ /g,"+"),
      destination: document.getElementById("destination").value.replace(/ /g,"+"),
      travelMode: this.transportMode,
      //transitOptions: TransitOptions,
      //drivingOptions: DrivingOptions,
      //unitSystem: UnitSystem,
      //waypoints[]: DirectionsWaypoint,
      //optimizeWaypoints: Boolean,
      provideRouteAlternatives: true,
      //avoidFerries: Boolean,
      //avoidHighways: Boolean,
      //avoidTolls: Boolean,
      //region: String
    }
    return options;
  }

  /**
   * Gets all of the data values for the heatmap and updates view.
   * @param  {[type]}  time [description]
   * @return {Promise}      [description]
   */
  async grabAllModelData(timeIndex) {

    console.log(window.controller.pollutionArrays);
    this.allModelData = window.controller.pollutionArrays[timeIndex];
    console.log(this.allModelData)
    this.updateModelView();
    //let time = window.controller.times[timeIndex];
    /* Sets up time interval to grab model data from
    let start = time.toISOString().slice(0, -5) + "Z";
    let closestStartDate = new Date(time);
    closestStartDate.setMinutes(time.getMinutes() + 5);
    let stop = closestStartDate.toISOString().slice(0, -5) + "Z";

    let url = "https://air.eng.utah.edu/dbapi/api/getGridEstimates?start=" + start + "&end=" + stop;

    /* Obtains model grid estimates and re-render map view
    let modelReq = fetch(url).then( (response)=> {
      return response.text();
    }).then( (values) => {
      /* If there is a more recent selection

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
    */
   window.controller.times
  }

  /**
   * Updates model heatmap
   */
  updateModelView() {
    this.Map.updateModel(this.allModelData);

  }
}