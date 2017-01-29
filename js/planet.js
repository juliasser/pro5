"use strict"

var pro5 = pro5 || {};

pro5.Planet = function Planet(name, x, y, scale, mesh){
    this.mesh = mesh;
    this.mesh.position.y = y;
    this.mesh.position.x = x;
    this.mesh.scale.set(scale, scale, scale);
    this.mesh.name = name;
	this.hasRing = false;
	this.satellites = [];
}

pro5.Planet.prototype.addToOrbit = function(mesh, height, speed){

	var pivot = new THREE.Object3D();
	this.mesh.add(pivot);

	THREE.SceneUtils.attach(mesh, pro5.engine.getScene(), this.mesh);
	this.mesh.remove(mesh);
	pivot.add(mesh);

	var target = mesh.position.clone();
	target.y = 0;
	target.setLength(1 + height/this.mesh.scale.x);

	var resetAnimation = new TWEEN.Tween(mesh.position)
	.to(target, 500)
	.easing(TWEEN.Easing.Quadratic.InOut)
	.start();

	this.satellites.push({
		pivot: pivot,
		speed: speed,
		height: height
	})
}

pro5.Planet.prototype.removeFromOrbit = function(mesh){
	for(var i = 0; i < this.satellites.length; i++){
		if (this.satellites[i].pivot.children[0] == mesh){
			THREE.SceneUtils.detach(mesh, this.satellites[i].pivot, pro5.engine.getScene());
			this.mesh.remove(this.satellites[i].pivot);
			this.satellites.splice(i, 1);
			return;
		}
	}
	console.error("object could not be removed from orbit");

}

// TODO not copy to every instance of planet?
pro5.Planet.arrayPlanets = [];

// Create Planet through external file
pro5.Planet.load = function(name, x, y, scale, callback, parent){
	var query = parent ? "objects/"+parent+"/"+name+"/"+name+".json": "objects/"+name+"/"+name+".json";
    pro5.engine.loadObject(query, false, function(mesh){ // TODO change to actual path
        var elem = new pro5.Planet(name, x, y, scale, mesh);
		if(name != "sun"){
			if(parent){
				pro5.world.planets[parent].moons.push(elem);
				pro5.Planet.arrayPlanets.push(elem.mesh);
			}else{
				pro5.world.planets[name] = elem;
				pro5.world.planets[name].moons = [];
				pro5.Planet.arrayPlanets.push(elem.mesh);
			}
		}

        mesh.rotation.x = 1; // a bit less than 90 deg = Math.PI/2
        if(callback){
            callback(mesh);
        }
    });
}

pro5.Planet.prototype.resetHasRing = function resetHasRing(){
    this.hasRing = false;
}

pro5.Planet.prototype.createRings = function createRings(shipY){

    // solve: should not be created everytime
	// <inner radius>, <outer radius>, <vertices defining roundness>, <vertices inside ring>(min 1)
	var radius = this.mesh.geometry.boundingSphere.radius * this.mesh.scale.x + 1.5
    var geometry = new THREE.RingGeometry(radius, radius + 0.1, 100, 1);

        var material = new THREE.MeshBasicMaterial( { color: 0xffffff, transparent: true, opacity: 0.4 } );
        var mesh = new THREE.Mesh( geometry, material );
        mesh.position.x = this.mesh.position.x;
        mesh.position.y = this.mesh.position.y;
        mesh.name = "ring" + this.mesh.name;

    var opacity = new TWEEN.Tween(mesh.material)
		.to({opacity: 0.8}, 700)
		.repeat(Infinity)
		.yoyo(true);

    var scale = new TWEEN.Tween(mesh.scale)
		.to({x: 1.2, y: 1.2, z: 1.2}, 700)
		.repeat(Infinity)
		.yoyo(true);

	if(!this.hasRing &&
		shipY >= this.mesh.position.y - this.mesh.scale.x - 20 &&
		shipY <= this.mesh.position.y + this.mesh.scale.x + 20){

		//var geometry = new THREE.RingGeometry( this.mesh.scale.x + 1.9, this.mesh.scale.x + 2, 100 );

		pro5.engine.addObject( mesh );
		this.hasRing=true;

        scale.start();
        opacity.start();

	} else if(pro5.engine.hasObject("ring" + this.mesh.name) && this.hasRing &&
		(shipY <= this.mesh.position.y - this.mesh.scale.x - 20 ||
		 shipY >= this.mesh.position.y + this.mesh.scale.x + 20)){

        var ring = pro5.engine.hasObject("ring" + this.mesh.name);

        scale.stop();
        opacity.stop();

        var fadeout = new TWEEN.Tween(ring.material)
		.to({opacity: 0}, 100)
		.start();

        var scalein = new TWEEN.Tween(ring.scale)
		.to({x: 0.8, y: 0.8, z: 0.8}, 400)
		.start();

        var name = ring.name;
        var planet = this;

        setTimeout(function () {
            pro5.engine.removeObjectByName(name);
            planet.hasRing = false;
        }, 1000);


	}
}
