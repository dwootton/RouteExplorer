class Selector {
	/**
	* Creates a selector object
	*
	*/ 
	constructor(){
		this.startDate = new Date();
		this.endDate = new Date();
		$(function() {
		  $('input[name="datetimes"]').daterangepicker({
		    timePicker: true,
		    startDate: moment().startOf('hour'),
		    endDate: moment().startOf('hour').add(32, 'hour'),
		    locale: {
		      format: 'M/DD hh:mm A'
		    }
		  }, 
		  (start, end) => {
	        console.log("Callback has been called!");
	        $('#reportrange span').html(start.format('D MMMM YYYY') + ' - ' + end.format('D MMMM YYYY'));
	        this.startDate = new Date(start.format);
	        this.endDate = new Date(end.format);    
	        this.getRange()
	       });
		});
	}

	getRange(){
		console.log([this.startDate,this.endDate]);
		return [this.startDate,this.endDate];
	}
}
