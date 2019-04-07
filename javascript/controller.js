class Controller {
	constructor(){
		this.map = null;
		this.timeChart = null;
		this.interpChart = null;
	}
	static setView(viewName,viewInstance){
		this[viewName] = viewInstance;
	}
}