class SpikeDetector{
  constructor(sensors){

    this.spikeSelectDiv = d3.select(".spike-selector").append('svg');


    sensor.forEach(sensor=>{

    })

    //runs the signal detection code on the data
    let processedData = performSignalDetection(data);



  }

  destroy(){
    this.spikeSelectDiv.remove();
    this.spikeData = null;

  }


  /**
   * Sets up the parameters for the ZScored algorithm
   *
   *
   * @return
   *   the input data containing a new attribute with signal data from the the ZScored Algorithm.
   */
  performSignalDetection(data){
      data.forEach(function(monitor){
          if(!monitor.values){
              return;
          }
          let SIG_LAG = 60;
          let SIG_THRESH = 5;
          let SIG_INF = .001;
          //monitor.signalDetection = smoothedZScore(monitor.values,SIG_LAG, SIG_THRESH,SIG_INF);
          monitor.signalDetection = smoothedZScore2(monitor.values,SIG_LAG, SIG_THRESH,SIG_INF);
      })//end data.forEach
      return data;
  }//end function performSignalDetection

  /**
   * The ZScore Signal Detection algorithm uses a moving window and the standard deviation
   * of that window to determine if a spike is uncharacteristic.
   *
   *
   * @return
   *   the input data containing a new attribute with signal data from the the ZScored Algorithm.
   */
  smoothedZScore2(data,lag,threshold,influence){
      let y = data;                           // Copy Variable name to 'y' since so much of this was written with 'y'
      let yVals = data.map(function(val){     // extract y values from the {date, value} object
          return val.value;
      });
      if(isEmpty(yVals)){
          return;
      }
      //create signals array
      var signals = [];
      var avgFilter = [];
      var stdFilter = [];

      for(var i = 0; i < y.length; i++){
          signals.push(0);
          avgFilter.push(0);
          stdFilter.push(0);
      }

      var filteredY = yVals.slice(0,lag);


      avgFilter[lag-1] = average(yVals.slice(0,lag));
      stdFilter[lag-1] = stanDeviate(yVals.slice(0,lag));


      for(var i = lag; i <= y.length-1; i++){  //might need to remove equals

          let date = y[i].date;     //read and save date for this datapoint

          if(Math.abs(yVals[i] - avgFilter[i-1]) > threshold * stdFilter[i-1]){
              //if the MAGNITUDE of the current (measurement-avg) value is above the thresh*std.Dev....

              if(yVals[i] > avgFilter[i-1]){
                  //if this value is above average, mark positive signal
                  signals[i] = [date,1];
              } else{
                  //otherwise we are below average, mark negative signal
                  signals[i] = [date,-1];
              }//end if-else y[i]


              filteredY[i] = influence * yVals[i] + (1-influence) * filteredY[i-1];

          } else {
              //if the MAGNITUDE does not exceed our threshold value, there is no signal, mark 0
              signals[i] = [date,0];
              filteredY[i] = yVals[i];
          } //end if-else Math.abs


          var start = i-lag;
          avgFilter[i] = average(filteredY.slice(start,i));
          stdFilter[i] = stanDeviate(filteredY.slice(start,i));

      }//end for i

      //remove the zero entries from 'signals
      let measurementPairs = signals.slice(lag);

      return { signals:measurementPairs, avgFilter:avgFilter, stdFilter:stdFilter};
  }//end smoothedZScore2

  /**
   * Averages the inputted array.
   *
   *
   * @return
   *   the average of the array
   */
  average(arr){
      return arr.reduce((a,b) => a + b, 0) / arr.length;
  }

  /**
   * Determines the standard deviation of the inputted array
   *
   *
   * @return
   *   the standard deviation of the array
   */
  stanDeviate(arr){
      var meanOfOrg = (arr.reduce(function(l,r){return l+r;}))/arr.length;
      var theSqrdSet = arr.map(function(el){ return Math.pow((el - meanOfOrg),2)});
      var theResult = Math.sqrt((theSqrdSet.reduce(function(l,r){return l+r;}))/theSqrdSet.length);
      return theResult;
  }

  /**
   * Determines if the object is empty
   *
   *
   * @return
   *   True or false depending on if the object is empty
   */
  isEmpty(obj) {
      for(var key in obj) {
          if(obj.hasOwnProperty(key))
              return false;
      }
      return true;
  }
}
