'use strict';

var pro5 = pro5 || {};

var DEBUG = false;

window.onload = function(){
	if(DEBUG){
		pro5.gui = new dat.GUI();
		addGuiPrototype();
	}
	pro5.engine.init();
	pro5.world.init();
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
}
