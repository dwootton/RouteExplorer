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

  selectTime(timeIndex){
    if(timeIndex == this.currentlySelectedIndex){
      return;
    }
    this.selectedTime = this.times[timeIndex].start;
    this.updateModelView(timeIndex);
    this.drawChart(timeIndex);
    this.interpChart.updateTOSMHighLight();
    this.currentlySelectedIndex = timeIndex;
    // render new chart
    // render new map
    // highlight row on TOSM

  }

  selectDistance(paths){
    // for each path, render a
  }


  prepareData(index){
    let polylines = this.Map.getPolyLinePaths();
    let data = this.interpChart.getAllPathEstimatesAtTime(index,polylines);
    console.log(data);
    return data;
  }

  drawChart(index){
    let data = this.prepareData(index);

    // TODO: assuming 3 lines
    data.forEach(function (d) {
        d.distance = +d.distance;
        d.Path1PM25 = +d.Path1PM25;
        d.Path2PM25 = +d.Path2PM25;
        d.Path3PM25 = +d.Path3PM25;
    });

    let path1 =['Path 1'],
        path2 =['Path 2'],
        path3 =['Path 3'],
        distances =['x'];

    for(let i = 0; i < data.length; i++){
      distances.push(data[i].distance)
      path1.push(data[i].Path1PM25);
      path2.push(data[i].Path2PM25);
      path3.push(data[i].Path3PM25);
    }
    console.log(distances);
    let chartWidth = document.getElementById('chart-wrapper').clientWidth;
    console.log(chartWidth);
    chartWidth = parseInt(chartWidth);
    console.log(chartWidth);
    chartWidth= chartWidth -80+12;
    // 66 - 12 ()
    console.log(chartWidth)
    var chart = c3.generate({
        bindto: '#chart',
        data: {
           x: 'x',
          columns: [
            distances,path1, path2, path3
          ],
          onclick: function (d, element) { console.log(d); console.log(element);}
        },
        color: {
          pattern: ['#8e0000','#000000','#00008e']
        },
        size: {
          height: 200,
          width: chartWidth
        },
        padding:{
          left: 45,
          bottom:14,
          right:70
        },

        axis: {
          y: {
            label: {
                text: 'PM 2.5 Concentration',
                position: 'outer-center'
                // inner-right : default
                // inner-center
                // inner-left
                // outer-right
                // outer-center
                // outer-left
            },
            tick: {
                format: function (d) {
                    return (parseInt(d) == d) ? d : Math.round(d * 100) / 100;
                }
            }
          },
          x: {
            label: {
                text: 'Distance Along Path (%)',
                position: 'outer-center'
                // inner-right : default
                // inner-center
                // inner-left
                // outer-right
                // outer-center
                // outer-left
            },
            max: 1,
            min: 0,
            tick: {
              values: distances,
              format: function (x) { return Math.round(100*x); },
              culling: {
                    max: 6 // the number of tick texts will be adjusted to less than this value
              }
            }
          }
        }

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
    //this.allModelData = window.controller.pollutionArrays[timeIndex];
    this.updateModelView(timeIndex);
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
  async updateModelView(timeIndex) {
    this.Map.updateModel(timeIndex);

  }
}
