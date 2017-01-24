"use strict"

var pro5 = pro5 || {};

pro5.Stuff = function Stuff(mesh, velocity, xpos, ypos, zpos){
	this.angvelocity = new THREE.Quaternion().setFromEuler(new THREE.Euler(
		Math.random()*velocity,
		Math.random()*velocity,
		Math.random()*velocity));
	this.mesh = mesh;
	if(xpos) this.mesh.position.x = xpos;
	if(ypos) this.mesh.position.y = ypos;
	if(zpos) this.mesh.position.z = zpos;
	pro5.world.stuff.push(this);
}

pro5.Stuff.prototype.update = function(){
	this.mesh.quaternion.multiply(this.angvelocity);
}
