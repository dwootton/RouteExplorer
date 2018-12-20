
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
		
		this.line = d3.line()
			.curve(d3.curveMonotoneX)
			.x((d)=>{ return this.xScale(d.time); })
		    .y((d)=>{ return this.yScale(d.pm25); });

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

	updateSlider(date){
	  this.selectedDate = date;
	  console.log(this.xScale(this.selectedDate))
	  console.log(this.x2Scale(this.selectedDate));
      this.slider
        //.transition()
        //.duration(500)
        .attr('x1', this.xScale(this.selectedDate))
        .attr('y1', 0)
        .attr('x2', this.xScale(this.selectedDate))
        .attr('y2', this.height)
        .style("stroke", "grey")
        .style("stroke-width", 4)
        .style("stroke-dasharray",4);
    }

    updateSliderZoom(){
      this.slider
        .attr('x1', this.xScale(this.selectedDate))
        .attr('y1', 0)
        .attr('x2', this.xScale(this.selectedDate))
        .attr('y2', this.height)
        .style("stroke", "grey")
        .style("stroke-width", 4)
        .style("stroke-dasharray",4);

    }


	update(data,modelData){
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
		console.log(modelData);

		data = data.map(type);
		modelData = modelData.map(type); 
		console.log(modelData);

		function brushed() {
		  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
		  var s = d3.event.selection || self.x2Scale.range();
		  self.xScale.domain(s.map(self.x2Scale.invert, self.x2Scale));
		  self.focus.select(".area").attr("d", self.area);
		  self.focus.select(".line").attr("d", self.line);
		  self.focus.select(".axis--x").call(self.xAxis);
		  self.svg.select(".zoom").call(self.zoom.transform, d3.zoomIdentity
		      .scale(self.width / (s[1] - s[0]))
		      .translate(-s[0], 0));
		  self.updateSliderZoom();
		}

		function zoomed() {
		  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
		  var t = d3.event.transform;
		  self.xScale.domain(t.rescaleX(self.x2Scale).domain());
		  self.focus.select(".area").attr("d", self.area);
		  self.focus.select(".line").attr("d", self.line);
		  self.focus.select(".axis--x").call(self.xAxis);
		  self.context.select(".brush").call(self.brush.move, self.xScale.range().map(t.invertX, t));
		  self.updateSliderZoom();
		}

		/*
	this.svg.append("linearGradient")				
	    .attr("id", "area-gradient")			
	    .attr("gradientUnits", "userSpaceOnUse")	
	    .attr("x1", 0).attr("y1", this.yScale(0))			
	    .attr("x2", 0).attr("y2", this.yScale(1000))		
	  .selectAll("stop")						
	    .data([								
	      {offset: "0%", color: "red"},		
	      {offset: "30%", color: "red"},	
	      {offset: "45%", color: "black"},		
	      {offset: "55%", color: "black"},		
	      {offset: "60%", color: "lawngreen"},	
	      {offset: "100%", color: "lawngreen"}	
	    ])					
	  .enter().append("stop")			
	    .attr("offset", function(d) { return d.offset; })	
	    .attr("stop-color", function(d) { return d.color; });
	    */
    // Start of update
    let timeBounds = [data[0].time, data[data.length-1].time];

    console.log(timeBounds);
	  this.xScale.domain(timeBounds);
	  modelData
	  let maxSensorReading = d3.max(data, function(d) { return d.pm25; });
	  let maxModelEstimate = d3.max(modelData, function(d) { return d.pm25; });
	  console.log(maxModelEstimate);
	  this.yScale.domain([0, d3.max([maxSensorReading,maxModelEstimate]) ]);
	  this.x2Scale.domain(this.xScale.domain());
	  this.y2Scale.domain(this.yScale.domain());

	  this.slider = this.focus.append("line");
		console.log(this.slider);

		console.log(selector.selectedDate);
		this.updateSlider(selector.selectedDate);


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

	  this.focus.append("path")
	  	  .datum(modelData)
	  	  .attr("class","line")
	  	  .attr("d", this.line);

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

