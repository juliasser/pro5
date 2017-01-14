'use strict';

var pro5 = pro5 || {};

var DEBUG = false;
var debug;

window.onload = function(){
	if(DEBUG){
		pro5.gui = new dat.GUI();
		debug = {};
		debug.updateX = function(){
			pro5.world.getSpaceship().mesh.position.x += 0.1;
		}
		debug.updateY = function(){
			pro5.world.getSpaceship().mesh.position.y += 0.1;
		}
		debug.updateZ = function(){
			pro5.world.getSpaceship().mesh.position.z += 0.1;
		}
		addGuiPrototype();

		pro5.gui.add(debug, "updateX");
		pro5.gui.add(debug, "updateY");
		pro5.gui.add(debug, "updateZ");
	}
	pro5.engine.init();
	pro5.world.init();

    var link = document.querySelector('#content--start-link');
    var startscreen = link.import.querySelector('#content--start');
    var existingnode = document.querySelector('script');
    document.querySelector('body').insertBefore(startscreen, existingnode[0]);

    console.log(pro5.spaceship.calculateSunDistance);
    //appendMarker('sun');
}

function addGuiPrototype(){
	dat.GUI.prototype.addThreeColor = function( obj, varname){
		var dummy = {};
		dummy.color = [obj[varname].r*255, obj[varname].g*255, obj[varname].b*255 ];
		var controller = this.addColor(dummy, "color");
		controller.onChange( function( colorValue  )
		{
			obj[varname].r = colorValue[0]/255;
			obj[varname].g = colorValue[1]/255;
			obj[varname].b = colorValue[2]/255;
			console.log(obj);
		});
	};
};

function appendMarker($marker) {
    console.log($marker);
    var markerDiv = document.getElementById('travel--marker');

    if (markerDiv.firstChild) {
        console.log(markerDiv.firstChild);
        markerDiv.removeChild(markerDiv.firstChild);
    }

    var link = document.querySelector('link[rel=import]');
    var content = link.import.querySelector('#travel-marker--'+$marker);
    console.log(content);
    markerDiv.appendChild(document.importNode(content, true));

};
