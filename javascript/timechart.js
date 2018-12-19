
class timeChart {

	constructor(){
		console.log("timechart created!")


		
	this.svg = d3.select("#timeChart");

		this.margin = {top: 20, right: 20, bottom: 110, left: 40}
		this.margin2 = {top: 430, right: 20, bottom: 30, left: 40}
		this.width = +this.svg.attr("width") - this.margin.left - this.margin.right
		this.height = +this.svg.attr("height") - this.margin.top - this.margin.bottom
		this.height2 = +this.svg.attr("height") - this.margin2.top - this.margin2.bottom;

		this.parseDate = d3.timeParse("%b %Y");

		this.xScale = d3.scaleTime().range([0, this.width]),
		this.x2Scale = d3.scaleTime().range([0, this.width]),
		this.yScale = d3.scaleLinear().range([this.height, 0]),
		this.y2Scale = d3.scaleLinear().range([this.height2, 0]);

		this.xAxis = d3.axisBottom(this.xScale),
		this.xAxis2 = d3.axisBottom(this.x2Scale),
		this.yAxis = d3.axisLeft(this.yScale);

		this.area = d3.area()
		    .curve(d3.curveMonotoneX)
		    .x((d)=>{ return this.xScale(d.time); })
		    .y0(this.height)
		    .y1((d)=>{ return this.yScale(d.pm25); });

		this.area2 = d3.area()
		    .curve(d3.curveMonotoneX)
		    .x((d)=>{ return this.x2Scale(d.time); })
		    .y0(this.height2)
		    .y1((d)=> { return this.y2Scale(d.pm25); });

		this.svg.append("defs").append("clipPath")
		    .attr("id", "clip")
		  .append("rect")
		    .attr("width", this.width)
		    .attr("height", this.height);

		
	}

	
	initChart(){

	}
	refreshChart(){	
		this.svg.selectAll('g').remove();

		this.focus = this.svg.append("g")
	    	.attr("class", "focus")
	    	.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

	   	this.context = this.svg.append("g")
    		.attr("class", "context")
    		.attr("transform", "translate(" + this.margin2.left + "," + this.margin2.top + ")");

	}

	update(data){
		this.refreshChart();
		let self = this;
		function type(d) {
			console.log("In Type!!!")
		  d.time = new Date(d.time);
		  d.pm25 = +d.pm25;
		  return d;
		}
		this.currentData = data.data;
		data = data.data;

		console.log(data);
		data = data.map(type); 
		console.log(data);

		function brushed() {
		  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
		  var s = d3.event.selection || self.x2Scale.range();
		  console.log("Brushed", self.currentData);
		  self.xScale.domain(s.map(self.x2Scale.invert, self.x2Scale));
		  self.focus.select(".area").attr("d", self.area);
		  self.focus.select(".axis--x").call(self.xAxis);
		  self.svg.select(".zoom").call(self.zoom.transform, d3.zoomIdentity
		      .scale(self.width / (s[1] - s[0]))
		      .translate(-s[0], 0));
		}

		function zoomed() {
		  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
		  var t = d3.event.transform;
		  self.xScale.domain(t.rescaleX(self.x2Scale).domain());
		  self.focus.select(".area").attr("d", self.area);
		  self.focus.select(".axis--x").call(self.xAxis);
		  self.context.select(".brush").call(self.brush.move, self.xScale.range().map(t.invertX, t));
		}

		

    // Start of update
    let timeBounds = [data[0].time, data[data.length-1].time];

    console.log(timeBounds);
	  this.xScale.domain(timeBounds);

	  this.yScale.domain([0, d3.max(data, function(d) { return d.pm25; })]);
	  this.x2Scale.domain(this.xScale.domain());
	  this.y2Scale.domain(this.yScale.domain());

	  this.brush = d3.brushX()
		    .extent([[0, 0], [this.width, this.height2]])
		    .on("brush end", brushed);

		this.zoom = d3.zoom()
		    .scaleExtent([1, Infinity])
		    .translateExtent([[0, 0], [this.width, this.height]])
		    .extent([[0, 0], [this.width, this.height]])
		    .on("zoom", zoomed);

	  this.focus.append("path")
	      .datum(data)
	      .attr("class", "area")
	      .attr("d", this.area);

	  this.focus.append("g")
	      .attr("class", "axis axis--x")
	      .attr("transform", "translate(0," + this.height + ")")
	      .call(this.xAxis);

	  this.focus.append("g")
	      .attr("class", "axis axis--y")
	      .call(this.yAxis);

	  this.context.append("path")
	      .datum(data)
	      .attr("class", "area")
	      .attr("d", this.area2);

	  this.context.append("g")
	      .attr("class", "axis axis--x")
	      .attr("transform", "translate(0," + this.height2 + ")")
	      .call(this.xAxis2);

	  this.context.append("g")
	      .attr("class", "brush")
	      .call(this.brush)
	      .call(this.brush.move, this.xScale.range());

	  this.svg.append("rect")
	      .attr("class", "zoom")
	      .attr("width", this.width)
	      .attr("height", this.height)
	      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
	      .call(this.zoom);
	}

}

