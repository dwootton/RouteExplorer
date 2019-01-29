class timeChartLegend {
  constructor(){
    this.svg = d3.select('#timeChartLegend');

    this.margin = {top: 10, right: 10, bottom: 10, left: 10}
		this.width = +this.svg.node().getBoundingClientRect().width - this.margin.left - this.margin.right
		this.height = +this.svg.node().getBoundingClientRect().height - this.margin.top - this.margin.bottom

    this.plottingSVG = this.svg.append('g').attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
  }
  update(info){



    let selection = this.plottingSVG.selectAll('g')
      .data(info)
      console.log("INFO1",info);

    selection
      .exit()
      .remove()
      console.log("INFO2",info);


    this.sensorItems = selection
      .enter()
      .append('g')
      console.log("INFO3",info);

    let barWidth = 60;
    let barHeight = 20;
    console.log("INFO4",info);

    this.sensorItems
        .append('rect')
          .attr('x',(d,i)=>{
            i = i%11;
            return (i)*(barWidth+20);
          })
          .attr("y", function(d,i) {
            let offset = 0;
            if(i > 10){
              offset = 25;
            }
            return offset;
          })
          .attr('width',barWidth)
          .attr('height',barHeight)
          .attr('fill','whitesmoke')
          console.log("INFO5",info);

    this.sensorItems
        .append('text')
          .attr('x',(d,i)=>{
            i = i%11;
            return (i)*(barWidth+20)+5;
          })
          .attr("y", function(d,i) {
            let offset = 0;
            if(i > 10){
              offset = 25;
            }
            return offset+barHeight/2
          })
          .attr("dy", ".25em")
          .text(function(d) {
            console.log(d);
            return d.id; })
            .attr('font-size','.75em')

    this.sensorItems.on('mouseenter',(d)=>{

        let sensorID = d.id;
        console.log(this);
        if(this.previousSelected){
          console.log(this.previousSelected)
          this.previousSelected[0]
            .transition()
            .duration(500)
            .attr('stroke-width', 1)
            .attr('stroke', 'gray')
            .attr('stroke-opacity', 0.6);

          this.previousSelected[1]
            .transition()
            .duration(500)
              .attr('stroke-width', 1)
              .attr('stroke', 'gray')
              .attr('stroke-opacity', 0.6)
        }

        let sensorSelection  = d3.select('#sensorPath' + sensorID)
        sensorSelection
          .transition()
          .duration(500)
          .attr('stroke-width', 2)
          .attr('stroke', 'url(#temperature-gradient)')
          .attr('stroke-opacity', 1.0)
        let modelSelection  = d3.select('#modelPath' + sensorID)
        modelSelection
        .transition()
        .duration(500)
              .attr('stroke-width', 2)
              .attr('stroke', 'black')
              .attr('stroke-opacity', 1)


        this.previousSelected = [sensorSelection,modelSelection];

        sensorSelection.moveToFront();

        modelSelection.moveToFront();
    })
      .on('mouseleave', function(d){

        let sensorID = d.id;
        let prevSelection = d3.select('#sensorPath' + sensorID)
          .transition()
          .duration(500)
          .attr('stroke-width', 1)
          .attr('stroke', 'gray')
          .attr('stroke-opacity', 0.6)
      })
      .on('click', (d,i)=>{
        console.log(window.controller.timeChart);
        let sensorData = window.controller.timeChart.sensorDatas.splice(i, 1);
        let modelData = window.controller.timeChart.modelDatas.splice(i, 1);
        let sensorInfo = window.controller.timeChart.sensorInfos.splice(i, 1);
        window.controller.timeChart.update(sensorData,modelData,sensorInfo)
      })

      d3.selection.prototype.moveToFront = function() {
        return this.each(function(){
          this.parentNode.appendChild(this);
        });
      };
      /*
    marker
      .on("mouseover", function(d) {
        console.log(d3.select(this).attr("cx") + that.sensorWidth);
        let matrix = this.getScreenCTM()
          .translate(+this.getAttribute("cx"), +this.getAttribute("cy"));

        that.toolTip.transition()
          .duration(200)
          .style("opacity", .9);
        that.toolTip.html(d.id + "<br/>" + d.pm25)
          .style("left", (window.pageXOffset + matrix.e - 16.5) + "px")
          .style("top", (window.pageYOffset + matrix.f - 44) + "px");

        let sensorID = d.id;
        let prevSelection = d3.select('#sensorPath' + sensorID)
          .transition()
          .duration(500)
          .attr('stroke-width', 2)
          .attr('stroke', 'url(#temperature-gradient)')
          .attr('stroke-opacity', 1.0)
      })
      .on("mouseout", function(d) {
        that.toolTip.transition()
          .duration(500)
          .style("opacity", 0);
        let sensorID = d.id;
        console.log(d3.selectAll('#sensorPath' + sensorID))
        let prevSelection = d3.select('#sensorPath' + sensorID)
          .transition()
          .duration(500)
          .attr('stroke-width', 1)
          .attr('stroke', 'gray')
          .attr('stroke-opacity', 0.6)
      })


*/


    return true;
  }
}
