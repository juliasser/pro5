"use strict"

var pro5 = pro5 || {};

pro5.Planet = function(name, x, y, scale, mesh){
	var self = this;
	self.mesh = mesh;
	self.mesh.position.y = y;
	self.mesh.position.x = x;
	self.mesh.scale.set(scale, scale, scale);
	self.mesh.name = name;
}

pro5.Planet.prototype.addToOrbit = function(mesh, height){
	this.mesh.add(mesh);
	console.log(mesh.position);
}

pro5.Planet.arrayPlanets = [];

// Create Planet through external file
pro5.Planet.load = function(name, x, y, scale, callback){
	pro5.engine.loadObject("objects/"+name+"/"+name+".json", function(mesh){ // TODO change to actual path
		var elem = new pro5.Planet(name, x, y, scale, mesh)
		pro5.world.planets[name] = elem;
        pro5.Planet.arrayPlanets.push(elem.mesh);
		mesh.rotation.x = 2.2; // a bit more than 90 deg = Math.PI*2
		if(callback){
			callback(mesh);
		}
	});
}
