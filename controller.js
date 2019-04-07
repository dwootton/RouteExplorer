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
}
