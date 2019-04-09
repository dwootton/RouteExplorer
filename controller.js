class Controller {
  constructor() {
    this.Map = new AQMap();
    console.log("new controller");
  }
  search(){

    let directionsOptions = this.constructQuery();
    // add loading
    //this.Map.renderDirections(directionsOptions);
    this.Map.plotDirections(document.getElementById("start").value.replace(/ /g,"+"),document.getElementById("destination").value.replace(/ /g,"+"));


    //finish laoding
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
    this.Map.updateModel(this.allModelData);

  }
}
