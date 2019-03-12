class Slider {
  constructor(){


  var margin = { top: 10, right: 50, bottom: 50, left: 40 },
    width = 1700 - margin.left - margin.right,
    height = 100;

  let timeBounds = [new Date(window.controller.selector.startDate), new Date(window.controller.selector.endDate )];

  this.xScale = d3.scaleTime().range([0, width])
      .domain(timeBounds)
      .clamp(true);

  //this.updateData(data);

  let dataNewYorkTimes = d3.range(0, width).map(d => {
    console.log(d);
    return {
    timePoint: this.xScale(d),
    value: 1 // change this value to be the averaged pm 25 pollution
    }
  });

  let svg = d3
    .select('#slider')
    .attr('width', width)
    .attr('height', height);

  let padding = 0.1;

  let xBand = d3
    .scaleBand()
    .domain(timeBounds)
    .range([margin.left, width - margin.right])
    .padding(padding);

  let xLinear = this.xScale
    .range([
      margin.left + xBand.bandwidth() / 2 + xBand.step() * padding - 0.5,
      width -
        margin.right -
        xBand.bandwidth() / 2 -
        xBand.step() * padding -
        0.5,
    ]);

  var y = d3
    .scaleLinear()
    .domain([0, 75])
    .nice()
    .range([height - margin.bottom, margin.top]);
  //let parseDate = d3.timeFormat("%Y-%m-%d")

  var yAxis = g =>
    g
      .attr('transform', `translate(${width - margin.right},0)`)
      .call(
        d3
          .axisRight(y)
          .tickValues([1e4])
          .tickFormat(d3.format('($.2s'))
      )
      .call(g => g.select('.domain').remove());

  var slider = g =>
    g.attr('transform', `translate(0,${height - margin.bottom})`).call(
      d3
        .sliderBottom(xLinear)
        .step(1)
        .ticks(4)
        .default(9)
        .on('onchange', value => draw(value))
    );

  var bars = svg
    .append('g')
    .selectAll('rect')
    .data(dataNewYorkTimes);

  var barsEnter = bars
    .enter()
    .append('rect')
    .attr('x', d => xBand(d.timePoint))
    .attr('y', d => y(d.value))
    .attr('height', d => y(0) - y(d.value))
    .attr('width', 5); //xBand.bandwidth()

  svg.append('g').call(yAxis);
  svg.append('g').call(slider);
  let that = this;
  var draw = selected => {
    barsEnter
      .merge(bars)
      .attr('fill', d => (d.timePoint === selected ? '#bad80a' : '#e0e0e0'));
    console.log(selected);
    if(isNaN(selected.getTime())){
      selected = timeBounds[0];
    }
    that.selectedDate = new Date(roundToInterval(new Date(selected),15));
    if(that.renderedDate == null){
      that.renderedDate = new Date();
    }
    console.log(that.selectedDate.toISOString(),that.renderedDate.toISOString());
    console.log(that.selectedDate.toISOString() == that.renderedDate.toISOString());
    console.log(that.renderedDate != null);
    if(that.selectedDate.toISOString() == that.renderedDate.toISOString()){
      console.log("Same hour!")
      return;
    }
    that.renderedDate = that.selectedDate;
    let m = that.selectedDate;
    var dateString =
        m.getUTCFullYear() + "/" +
        ("0" + (m.getUTCMonth()+1)).slice(-2) + "/" +
        ("0" + m.getUTCDate()).slice(-2) + " " +
        ("0" + m.getUTCHours()).slice(-2) + ":" +
        ("0" + m.getUTCMinutes()).slice(-2) + ":" +
        ("0" + m.getUTCSeconds()).slice(-2);

    console.log(dateString);
    d3.select('p#value-new-york-times').text(
      dateString
      //d3.format(parseDate)(dataNewYorkTimes[3].value)
    );
    window.controller.selector.selectedDate = that.selectedDate;
    //window.controller.selector.grabAllSensorData(that.selectedDate);
    //window.controller.selector.grabAllModelData(that.selectedDate);
    window.controller.map.getDataAtTime(that.selectedDate);
  }
  draw(new Date(new Date().getTime - 5*60*60*1000))
    /*
    var svg = d3.select("#slider"),
        margin = {right: 50, left: 50},
        width = 1700 - margin.left - margin.right,
        height = 35;


        let timeBounds = [new Date(window.controller.selector.startDate), new Date(window.controller.selector.endDate )];

    this.xScale = d3.scaleTime().range([0, width])
          .domain(timeBounds)
          .clamp(true);

    console.log(width);

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
              if(that.selectedDate == roundToHour(new Date(newData))){
                console.log("already selectedx!")
                return;
              }
              that.selectedDate = roundToHour(new Date(newData));

    					window.controller.selectedDate = that.selectedDate
              selector.selectedDate = that.selectedDate;
              /*selector.grabAllSensorData(that.selectedDate);
              selector.grabAllModelData(that.selectedDate);
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

    }*/
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
/* Date = datetime obejct. Interval = number of minutes (number)*/
 function roundToInterval(date, interval) {
   p = interval * 60 * 1000; // milliseconds in an hour
   return new Date(Math.round(date.getTime() / p ) * p);
 }
