class timeChartLegend {
  constructor() {
    this.svg = d3.select('#timeChartLegend');

    this.margin = {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10
    }
    this.width = +this.svg.node().getBoundingClientRect().width - this.margin.left - this.margin.right
    this.height = +this.svg.node().getBoundingClientRect().height - this.margin.top - this.margin.bottom

    this.plottingSVG = this.svg.append('g').attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    this.clsbtn1 = new d3CloseButton();
    this.clsbtn1.size(14).isCircle(true).borderStrokeWidth(3).crossStrokeWidth(3).rx(6).ry(6);
    let sampleData = [50, 200];
    /*var gUpper = this.plottingSVG.append("g").selectAll("g").data(sampleData).enter().append("g");
    let size = 20;
    gUpper.append("rect")
            .attr("x", function(d){ return d;})
            .attr("y", 50)
            .attr("width", size)
            .attr("height",size)
            .style({"fill": "#E6F9FF", "stroke-width": 2, "stroke": "black"});

            */

  }
  /**
   * Updates the views for the time chart legend.
   * @param  {[type]} info An array of sensor information
   * @return {[type]}      [description]
   */
  update(info) {

    let self = this;
    this.plottingSVG.selectAll('.sensorButton').remove();
    let selection = this.plottingSVG.selectAll('.sensorButton')
      .data(info)

    selection
      .exit()
      .remove()
    console.log("plotting", this.plottingSVG);


    this.sensorItems = selection
      .enter()
      .append('g')
      .attr('class', 'sensorButton')



    let barWidth = 75;
    let barHeight = 20;

    /* Adds the background rect  */
    this.sensorItems
      .append('rect')
      .attr('x', (d, i) => {
        i = i % 11; // After 11 icons have been placed, wrap to the next row
        return (i) * (barWidth + 20);
      })
      .attr("y", function(d, i) {
        let offset = 0;
        if (i > 10) {
          offset = 25;
        }
        return offset;
      })
      .attr('width', barWidth)
      .attr('height', barHeight)
      .attr('border-radius', 2)
      .attr('fill', 'whitesmoke')
      .attr('stroke', "gray")
      .attr('rx', 5)
      .attr('ry', 5);


    this.sensorItems.each((d, i, nodes) => {

      let g = d3.select(nodes[i]).append('g')
        .attr('class', 'close');

      let size = 14;
      let r = size / 2,
        ofs = size / 6,
        x = (i) * (barWidth + 20) + (barWidth / 1.2),
        y = barHeight / 2,
        cross = g.append("g");

      g.append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", r)
        .attr('fill-opacity', 0)

      cross.append("line")
        .attr("x1", x - r + ofs)
        .attr("y1", y)
        .attr("x2", x + r - ofs)
        .attr("y2", y)
        .attr("stroke", "black")
        .attr("stroke-width", 2);

      cross.append("line")
        .attr("x1", x)
        .attr("y1", y - r + ofs)
        .attr("x2", x)
        .attr("y2", y + r - ofs)
        .attr("stroke", "black")
        .attr("stroke-width", 2);

     cross.attr("transform", "rotate (45," + x + "," + y + ")");


      d3.selectAll(".close").on('click', (d, i, nodes) => {
        this.changeMapSelectedSensor();
        console.log(d, i, nodes);

        window.controller.timeChart.sensorDatas.splice(i, 1);
        window.controller.timeChart.modelDatas.splice(i, 1);
        window.controller.timeChart.sensorInfos.splice(i, 1);
        window.controller.timeChart.update();
        d3.event.stopPropagation();
      })
    })

    console.log("After")

    this.sensorItems
      .append('text')
      .attr('x', (d, i) => {
        i = i % 11; // After 11 icons have been placed, wrap to the next row
        return (i) * (barWidth + 20) + 5;
      })
      .attr("y", function(d, i) {
        let offset = 2;
        if (i > 10) {
          offset = 25;
        }
        return offset + barHeight / 2
      })
      .attr("dy", ".25em")
      .text(function(d) {
        return d.id;
      })
      .attr('font-size', '.75em')

    this.sensorItems.on('mouseenter', (d) => {
        let sensorID = d.id;
        console.log(this);

        let sensorSelection = d3.select('#sensorPath' + sensorID)
        sensorSelection
          .transition()
          .duration(500)
          .attr('stroke-width', 5)
          .attr('stroke', 'url(#temperature-gradient)')
          .attr('stroke-opacity', 1.0)
        let modelSelection = d3.select('#modelPath' + sensorID)
        modelSelection
          .transition()
          .duration(500)
          .attr('stroke-width', 5)
          .attr('stroke', 'black')
          .attr('stroke-opacity', 1)


        this.previousSelected = [sensorSelection, modelSelection];

        sensorSelection.moveToFront();

        modelSelection.moveToFront();
      })
      .on('mouseleave', (d, i, nodes) => {
        if (this.clickedSensor && (this.clickedSensor.id == d.id)) {
          return;
        }
        let sensorID = d.id;
        console.log(d3.select('#sensorPath' + sensorID));
        d3.select('#sensorPath' + sensorID)
          .attr('stroke-opacity', 0.6)
          .transition()
          .duration(500)
          .attr('stroke-width', 1)
          .attr('stroke', 'gray');
        let modelSelection = d3.select('#modelPath' + sensorID)
        modelSelection
          .transition()
          .duration(500)
          .attr('stroke-width', 1)
          .attr('stroke', 'gray')
          .attr('stroke-opacity', .6)
      })
      .on('click', (d, i, nodes) => {
        this.changeMapSelectedSensor(d);
        window.controller.timeChart.updateGradient(i);


        let prevClickedSensor;
        if (this.clickedSensor) {
          prevClickedSensor = this.clickedSensor.sensorButton;
        }

        let sensor = {
          id: d.id,
          sensorButton: nodes[i]
        }
        // TODO: Fix these dam legends.

        this.clickedSensor = sensor;
        d3.select(prevClickedSensor).selectAll('rect')
          .transition()
          .duration(500)
          .attr('stroke-width', 1)
          .attr('stroke', 'gray');

        window.controller.clickedSensor = this.clickedSensor;

        d3.select(prevClickedSensor).dispatch('mouseleave');
        d3.select(nodes[i]).selectAll('rect')
          .transition()
          .duration(200)
          .attr('stroke', "black")
          .attr('stroke-width', 4)


        d3.select(nodes[i]).selectAll('rect')
          .dispatch("mouseenter");
      })
      /*.on('mousedown', function(d, i) {
        d3.select(this)
          .selectAll('rect')
          .transition()
          .duration(100)
          .attr('fill', 'gray');
      })*/
      .on('mouseup', function(d, i) {
        d3.select(this)
          .selectAll('rect')
          .transition()
          .duration(200)
          .attr('fill', 'whitesmoke');
      });
    console.log(this.clickedSensor);
    if (this.clickedSensor) {

      /* Updates the node after the refresh */
      this.sensorItems
        .filter((d, i, nodes) => {
          console.log(d.id, this.clickedSensor.id)
          if (d.id == this.clickedSensor.id) {
            console.log(nodes[i]);
            this.clickedSensor.sensorButton = nodes[i];
          }
        })

      //d3.select(this.clickedSensor.sensorButton).dispatch("click");
    }


    d3.selection.prototype.moveToFront = function() {
      return this.each(function() {
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


  changeMapSelectedSensor(d) {
    console.log("INSIDE OF CHANGE SENSOR HIGHLIGHT!!!!!")
    d3.selectAll("#selected")
      .attr("id", function(dataPoint) {
        return "marker" + dataPoint.id;
      })
      .selectAll('circle')
      .transition()
        .duration(500)
        .attr('r', 6.5)
        .attr('stroke-width', '1')
        .attr('stroke', 'white');

    if(d == null){
      return;
    }
    d3.selectAll('#marker' + d.id)
      .attr('id', 'selected')
      .selectAll('circle')
      .transition()
        .duration(500)
        .attr('r', 10)
        .attr('stroke-width', '2')
        .attr('stroke', 'gold');


  }
}
