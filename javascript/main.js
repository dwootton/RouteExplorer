window.controller = new Controller();

let aqMap = new AQMap();
console.log(window.controller);
// TODO: Add sensor object
let chart = new timeChart();
let selector = new Selector(aqMap, chart);

