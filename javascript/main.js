
window.controller = new Controller();

let aqMap = new AQMap();
console.log(window.controller);
// TODO: Add sensor object
let chart = new timeChart();
let selector = new Selector(aqMap, chart);
window.controller.selector = selector;
window.controller.map = aqMap;
let mode = new ModeSelector();
console.log(mode)
window.controller.modeSelector = mode;
function makeSearch() {

	let sensorName = document.getElementsByName("search")[0].value;

	let sensor = window.controller.sensorData.find(function(element){
		return element.id === sensorName;
	})
	

  	window.controller.selector.grabSensorData(sensor)
  	window.controller.map.myMap.panTo(new google.maps.LatLng(sensor.lat, sensor.long));
  	
  	let element = d3.selectAll(".marker")
  		.filter(function(d) { return d.id === sensor.id })
  	 
  	//console.log(element.node());
    element.node().dispatchEvent(new Event('click'));
    return false;
  		//
  		/*
  		.selectAll('circle')
		//.attr('transform','translate(15px,15px)')
			.transition(500)
		    .attr('r',10)
		    .attr('stroke-width','2')
		    .attr('stroke','gold');
*/
	/*
  	d3.select(this)
		            console.log(that);
		            d3.select(that.lastSelected).attr("id", null).selectAll('circle').transition(500).attr('r',6.5).attr('stroke-width','1').attr('stroke','white');
		            //d3.select(that.lastSelected).classed("nonSelected", true);
		            that.lastSelected = this;*/
    
  	
}