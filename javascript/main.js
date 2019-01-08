window.controller = new Controller();

let aqMap = new AQMap();
console.log(window.controller);
// TODO: Add sensor object
let chart = new timeChart();
let selector = new Selector(aqMap, chart);
window.controller.selector = selector;
window.controller.map = aqMap;

function makeSearch() {
	let sensorName = document.getElementsByName("search")[0].value;
	console.log(window.controller.sensorData);
	let sensor = window.controller.sensorData.find(function(element){
		return element.id === sensorName;
	})
  	window.controller.selector.grabSensorData(sensor)
  	console.log(sensor)
  	window.controller.map.myMap.panTo(new google.maps.LatLng(sensor.lat, sensor.long));
  	return false;
}