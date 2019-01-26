class ModeSelector {
    constructor(mapPath){
        this.first = true;
        this.mapPath = mapPath;
        this.updateMode();
    }



    updateMode(){
        //let myPath = this.mapPath;
        let button = d3.select('#modeSwitch');
        button.on('change', update);
        button.attr('checked','false');
        $('#modeSwitch').trigger('click');
        let self = this;

        function update(){
            /*
            if(first){
                d3.select('#chart').transition().duration(500).attr('class','shown');
                d3.select('div #lineMap').transition().duration(500).attr('class','hidden');
                first = false;
                return;
            }
            */


            let status = document.getElementById("modeSwitch").checked; // False => Explorer, True => Navigator

            let modeText = d3.select('#currentMode');
            modeText.attr('padding-bottom',20);

            if(status){ // Navigator Mode
                //modeButton.selectAll().remove();
                self.mode = 'navigate';
                modeText
                    .text('Path Exploration ');
                console.log(window.controller.polyline)
                window.controller.polyline.setMap(window.controller.map.myMap);
                if(window.controller.pathNodes){
                    for(let i = 0; i < window.controller.pathNodes.length; i++){
                        console.log(window.controller.pathNodes);
                        window.controller.pathNodes[i].setMap(window.controller.map.myMap);
                    }
                }
                d3.select('div #lineMap').transition().duration(500).attr('class','shown');
                d3.select('#timeChart').transition().duration(500).attr('class','hidden');
                //window.controller.map.refreshClick();


                //window.controller.pathNodes
                /*myPath.changeMapNavLine(1);
                d3.select('#chart').attr('class','hidden');
                //.selectAll('svg').attr('height',0).attr('opacity',0);
                d3.select('div #lineMap').transition().duration(500).attr('class','shown');
                d3.select('div #lineMap').transition().duration(500).attr('display','block').attr('height',300).attr('overflow-y','scroll').attr('overflow-x','scroll');

                */

            } else { // Explorer Mode
                //modeButton.selectAll().remove();
                self.mode = 'explore';
                modeText
                    .text('Data Exploration ');
                console.log(window.controller.map)
                window.controller.polyline.setMap(null);
                if(window.controller.pathNodes){
                    for(let i = 0; i < window.controller.pathNodes.length; i++){
                        window.controller.pathNodes[i].setMap(null);
                    }
                }
                d3.select('div #lineMap').transition().duration(500).attr('class','hidden');
                d3.select('#timeChart').transition().duration(500).attr('class','shown');
                //window.controller.map.hideClick();
                    /*
                myPath.changeMapNavLine(0);
                 d3.select('#chart').transition().duration(500).attr('class','shown');
                 //.selectAll('svg').attr('height',400).attr('opacity',1);
                 d3.select('div #lineMap').transition().duration(500).attr('class','hidden');
                 //.attr('height',0).attr('overflow','hidden');
                 d3.select('div #lineMap').select('svg').style('display','none');
                */
            }

        }
    }
}
