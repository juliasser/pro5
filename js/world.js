"use strict"

var pro5 = pro5 || {};

pro5.world = (function(){

	var init;

	init = function init(){
		var sunGeometry = new THREE.IcosahedronGeometry( 30, 2);
		var sunMaterial = new THREE.MeshBasicMaterial( { color: 0xFFA500 } );
		var sun = new THREE.Mesh( sunGeometry, sunMaterial );
		pro5.engine.addObject(sun);

		var spaceshipGeom = new THREE.CylinderGeometry(1,1,4,8);
		var spaceshipMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff });
		var spaceship = new THREE.Mesh( spaceshipGeom, spaceshipMaterial );
		spaceship.position.y = 50;
		pro5.engine.addObject(spaceship);

	}

	return{
		init:init
	}

})();
