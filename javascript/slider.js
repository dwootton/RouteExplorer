class Slider {
  constructor(){
    var svg = d3.select("#slider"),
        margin = {right: 50, left: 50},
        width = 1700 - margin.left - margin.right,
        height = 35;


        let timeBounds = [new Date(window.controller.selector.startDate), new Date(window.controller.selector.endDate )];

    this.xScale = d3.scaleTime().range([0, width])
          .domain(timeBounds)
          .clamp(true);

    console.log(width);
    /*
    var x = d3.scaleLinear()
        .domain([0, 180])
        .range([0, width])

*/
    var slider = svg.append("g")
        .attr("class", "slider")
        .attr("transform", "translate(" + margin.left + "," + height / 2 + ")");
    let that = this;
    slider.append("line")
        .attr("class", "track")
        .attr("x1", this.xScale.range()[0])
        .attr("x2", this.xScale.range()[1])
      .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "track-inset")
      .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "track-overlay")
        .call(d3.drag()
            .on("start.interrupt", function() { slider.interrupt(); })
            .on("start drag", ()=> {
              let newData = this.xScale.invert(d3.event.x);
              let selector = window.controller.selector;
              that.selectedDate = new Date(newData);
    					window.controller.selectedDate = that.selectedDate
              selector.selectedDate = that.selectedDate;
              /*selector.grabAllSensorData(that.selectedDate);
              selector.grabAllModelData(that.selectedDate);*/
              window.controller.map.getDataAtTime(that.selectedDate);
            }));

    slider.insert("g", ".track-overlay")
        .attr("class", "ticks")
        .attr("transform", "translate(0," + 18 + ")")
      .selectAll("text")
      .data(this.xScale.ticks(5))
      .enter().append("text")
        .attr("x", this.xScale)
        .attr("text-anchor", "middle")
        .text(function(d) { return d; });

    var handle = slider.insert("circle", ".track-overlay")
        .attr("class", "handle")
        .attr("r", 9);

    slider.transition() // Gratuitous intro!
        .duration(750)
        .tween("hue", function() {
          var i = d3.interpolate(0, 70);
          return function(t) { hue(i(t)); };
        });

    let hue = (h) => {
      handle.attr("cx", this.xScale(h));
      svg.style("background-color", d3.hsl(h, 0.8, 0.8));
    }
  }

}


/*

<style>

.ticks {
  font: 10px sans-serif;
}

.track,
.track-inset,
.track-overlay {
  stroke-linecap: round;
}

.track {
  stroke: #000;
  stroke-opacity: 0.3;
  stroke-width: 10px;
}

.track-inset {
  stroke: #ddd;
  stroke-width: 8px;
}

.track-overlay {
  pointer-events: stroke;
  stroke-width: 50px;
  stroke: transparent;
  cursor: crosshair;
}

.handle {
  fill: #fff;
  stroke: #000;
  stroke-opacity: 0.5;
  stroke-width: 1.25px;
}

</style>
<svg width="960" height="500"></svg>
<script src="//d3js.org/d3.v4.min.js"></script>
<script>


 */
