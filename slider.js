class Slider{
  constructor(){
    let margin = { top: 10, right: 5, bottom: 10, left: 30 };

    let height = 300;
    let width = 100;
    let times = [];
    window.controller.times.forEach(time=>{
      times.push(time.start);
    })

    console.log(width);

    let timeBounds = [new Date(times[0]),new Date(times[times.length-1])];
    this.yScale = d3.scaleTime().range([0, height])
      .domain(timeBounds)
      .clamp(true);
  console.log(timeBounds);


  //this.updateData(data);
  let yBandStarts = []
  let dataNewYorkTimes = times.map(d => {
    yBandStarts.push(this.yScale(d));
    console.log(d);
    return {
    timePoint: this.yScale(d),
    value: 20 // change this value to be the averaged pm 25 pollution
    }
  });
  console.log(yBandStarts);

  let svg = d3
    .select('#slider')
    .attr('width', width)
    .attr('height', height);
  this.svg =svg;
  let padding = 0.1;
  console.log(svg);
  let yBand = d3
    .scaleBand()
    .domain(yBandStarts)
    .range([margin.top, height - margin.bottom])
    .padding(padding);
    console.log(yBand(new Date(window.controller.times[2].start)));
  let yLinear = this.yScale
    .range([
      margin.top + yBand.bandwidth() / 2 + yBand.step() * padding - 0.5,
      height -
        margin.bottom -
        yBand.bandwidth() / 2 -
        yBand.step() * padding -
        0.5,
    ]);


  let yBandVals = []
  times.map(d => {
    yBandVals.push(yLinear(d));
  });
  console.log(yBandVals);



  var x = d3
    .scaleLinear()
    .domain([0, 45])
    .nice()
    .range([width - margin.left, margin.right]);
  //let parseDate = d3.timeFormat("%Y-%m-%d")
  this.xScale =x;
  /*var yAxis = g =>
    g
      .attr('transform', `translate(${width - margin.right},0)`)
      .call(
        d3
          .axisRight(y)
          .tickValues([1e4])
          .tickFormat(d3.format('($.2s'))
      )
      .call(g => g.select('.domain').remove());*/

  this.slider = d3
        .sliderLeft(yLinear)
        .ticks(6)
        .default(9)
        .on('onchange', value => draw(value))
        .displayFormat(d3.timeFormat("%m-%d \n %H:%M %p"));
  console.log(this.slider)
  var slider = g =>
    g.attr('transform', `translate(${width-margin.right},0`).call(this.slider);
    var bars = svg
      .append('g')
      .selectAll('rect')
      .data(dataNewYorkTimes);
    var barsEnter = bars
      .enter()
      .append('rect')
      .attr('class','sliderBars')
      .attr('y', d =>
      { return yBand(d.timePoint)})
      .attr('x', d => x(d.value))
      .attr('height', yBand.bandwidth())
      .attr('width', d => x(0) - x(d.value)); //



      let xAxis = d3.axisTop(x).ticks(2);
      svg.append("g")
        .attr("class", "yAxis")
        .call(xAxis)
        .attr('transform', `translate(${margin.left-5},0)`)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("AVG PM 2.5");


  svg.append('g').call(slider);
    let that = this;

    var draw = selected => {
      let yPosition = this.yScale(new Date(selected));
      console.log(xPosition);
      let closestBarLocation = indexOfClosest(yBandVals,yPosition);

      console.log(selected);
      barsEnter
        .merge(bars)
        .attr('fill', (d,i) => {
          /*
          console.log(d.timePoint,);
          if(d.timePoint < this.xScale(roundToInterval(new Date(selected),interval))){ // if greater
            if(d.timePoint + 17 > this.xScale(roundToInterval(new Date(selected),interval))){
              return '#bad80a';
            }
          }
          return '#e0e0e0'*/
          return (i === closestBarLocation ? '#bad80a' : '#e0e0e0')
        });

      if(isNaN(selected.getTime())){
        selected = timeBounds[0];
      }
      let selectedDate = this.times[closestBarLocation];
      console.log(selectedDate);
      let m = selectedDate;
      var dateString =
          m.getUTCFullYear() + "/" +
          ("0" + (m.getUTCMonth()+1)).slice(-2) + "/" +
          ("0" + m.getUTCDate()).slice(-2) + " " +
          ("0" + m.getUTCHours()).slice(-2) + ":" +
          ("0" + m.getUTCMinutes()).slice(-2) + ":" +
          ("0" + m.getUTCSeconds()).slice(-2);

      d3.select('p#value-new-york-times').text(
        dateString
        //d3.format(parseDate)(dataNewYorkTimes[3].value)
      );
      d3.select('.parameter').property("value", dateString);

      window.controller.selectTime(closestBarLocation);


    }
  }

  /**
   * Method to change the data displayed on the scented widget.
   * @param  {[type]} data [Double array of the means (or maxes) of each path]
   * @return {[type]}      [none]
   */
  changeData(data){
    let margin = { top: 10, right: 50, bottom: 50, left: 40 };

    let height = 300;
    let width = d3.select('#timeSlider').attr('width');
    let times = [];
    window.controller.times.forEach(time=>{
      times.push(time.start);
    })

    console.log(width);

    let timeBounds = [times[0],times[times.length-1]];
    this.yScale = d3.scaleTime().range([0, height])
      .domain(timeBounds)
      .clamp(true);

    // check if time bounds changed?
    //this.updateData(data);
    let yBandStarts = []
    let dataNewYorkTimes = times.map((d,i) => {
      yBandStarts.push(this.yScale(d));
      return {
      timePoint: this.yScale(d),
      value: data[i] // change this value to be the averaged pm 25 pollution
      }
    });

    this.xScale.domain([0,d3.max(data)])
    let xAxis = d3.axisTop(this.xScale).ticks(2);


    d3.select('.xAxis').remove('*');
    this.svg.append("g")
      .attr("class", "xAxis")
      .call(xAxis)
      .attr('transform', `translate(${margin.top+5},0)`)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("AVG PM 2.5");
    var bars = this.svg
      .selectAll('.sliderBars')
      .data(dataNewYorkTimes);
    let xscale = this.xScale;
    bars
      //.merge(bars)
      .transition(500)
      .attr('y', d => this.xScale(d.value))
      .attr('width', d => this.xScale(0) - this.xScale(d.value));


  }

}

function indexOfClosest(nums, target) {
  let closest = Number.MAX_SAFE_INTEGER;
  let index = 0;

  nums.forEach((num, i) => {
    let dist = Math.abs(target - num);

    if (dist < closest) {
      index = i;
      closest = dist;
    }
  });

  return index;
}
