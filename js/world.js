"use strict"

var pro5 = pro5 || {};

pro5.world = (function(){

	var planets = {};

	var init;

	init = function init(){
		var sunGeometry = new THREE.IcosahedronGeometry( 30, 2);
		var sunMaterial = new THREE.MeshBasicMaterial( { color: 0xFFA500 } );
		var sun = new THREE.Mesh( sunGeometry, sunMaterial );
        sun.name = "sun";
		pro5.engine.addObject(sun);

        pro5.spaceship.createShip();

		var amblight = new THREE.AmbientLight(0x404040, 1);
		pro5.engine.addObject(amblight);

		var light = new THREE.PointLight(0x808040, 10);
		light.position.set(0,0,50);
		pro5.engine.addObject(light);

		// load planets
		pro5.Planet.load("earth", 30, 100, 10);

	}

	return{
		init:init,
		planets:planets
	}

})();
