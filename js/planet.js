"use strict"

var pro5 = pro5 || {};

pro5.Planet = function Planet(name, x, y, scale, mesh){
    this.mesh = mesh;
    this.mesh.position.y = y;
    this.mesh.position.x = x;
    this.mesh.scale.set(scale, scale, scale);
    this.mesh.name = name;
	this.hasRing=false;
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
		if(name != "sun"){
			pro5.world.planets[name] = elem;
			pro5.Planet.arrayPlanets.push(elem.mesh);
		}
        mesh.rotation.x = 1; // a bit less than 90 deg = Math.PI/2
        if(callback){
            callback(mesh);
        }
    });
}

pro5.Planet.prototype.createRings = function createRings(shipY){

	if(!this.hasRing &&
		shipY >= this.mesh.position.y - this.mesh.scale.x - 20 &&
		shipY <= this.mesh.position.y + this.mesh.scale.x + 20){

		//console.log("create");

		var geometry = new THREE.RingGeometry( this.mesh.scale.x + 1.9, this.mesh.scale.x + 2, 100 );
		var material = new THREE.MeshBasicMaterial( { color: 0xffffff, transparent: true, opacity: 0.4 } );
		var mesh = new THREE.Mesh( geometry, material );
		mesh.position.x = this.mesh.position.x;
		mesh.position.y = this.mesh.position.y;
		mesh.name = "ring" + this.mesh.name;
		pro5.engine.addObject( mesh );
		this.hasRing=true;

		var scale = new TWEEN.Tween(mesh.scale)
		.to({x: 1.2, y: 1.2, z: 1.2}, 700)
		.repeat(Infinity)
		.yoyo(true)
		.start();

		var opacity = new TWEEN.Tween(mesh.material)
		.to({opacity: 0.8}, 700)
		.repeat(Infinity)
		.yoyo(true)
		.start();

	} else if(this.hasRing && (shipY <= this.mesh.position.y - this.mesh.scale.x - 20 ||
		shipY >= this.mesh.position.y + this.mesh.scale.x + 20)){
        console.log("remove");
		pro5.engine.removeObjectByName("ring" + this.mesh.name);
        this.hasRing = false;
	}
}
