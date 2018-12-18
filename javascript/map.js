class AQMap {

	constructor(){
		console.log("map created!")
		this.svg = d3.select("svg")
		this.width = this.svg.attr("width")
		this.height = this.svg.attr("height")
		let i0 = d3.interpolateHsvLong(d3.hsv(120, 1, 0.65), d3.hsv(60, 1, 0.90)),
		    i1 = d3.interpolateHsvLong(d3.hsv(60, 1, 0.90), d3.hsv(0, 0, 0.95)),
		    interpolateTerrain = function(t) { return t < 0.5 ? i0(t * 2) : i1((t - 0.5) * 2); };
		this.colorMap = d3.scaleSequential(interpolateTerrain).domain([0, 40]);
		this.modelWidth = 10;
		this.modelHeight = 10;
		this.contours = null;

	}

	update(sensorData, modelData){
		console.log("IN UPDATE!!!!")
		this.sensorData = sensorData;
		this.modelData = modelData;

	    this.contours = this.svg.selectAll("path")
	    	.data(d3.contours()
		        .size([this.modelWidth,this.modelHeight]) // NOTE: Make this a param
		        .thresholds(d3.range(0, 40, 1))
	      	(modelData));

		this.contours
	    .enter().append("path")
	      .attr("d", d3.geoPath(d3.geoIdentity().scale(this.width / this.modelWidth)))
	      .attr("fill", (d) => { return this.colorMap(d.value); });

	    this.contours
	    	.exit().remove();
	}
}