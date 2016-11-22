"use strict"

var pro5 = pro5 || {};

pro5.world = (function(){

	var planets = {};

	var init, loadPlanet, createLights;

	init = function init(){
		var sunGeometry = new THREE.IcosahedronGeometry( 30, 2);
		var sunMaterial = new THREE.MeshBasicMaterial( { color: 0xFFA500 } );
		var sun = new THREE.Mesh( sunGeometry, sunMaterial );
        sun.name = "sun";
		pro5.engine.addObject(sun);

        pro5.spaceship.createShip();

		// creating the different lights used in the scene
		createLights();

		// load planets
		pro5.Planet.load("earth", 30, 100, 10);

	}

	createLights = function createLights(){
		var sunLight = new THREE.DirectionalLight(0xffe8a0, 1);
		sunLight.position.set( 0, 0, 50 ).normalize();

		// an ambient light modifies the global color of a scene (and makes the shadows softer)
		var ambientLight = new THREE.AmbientLight(0xffffff, 0.5);

		var dirlight = new THREE.DirectionalLight( 0xefefff, 0.6 );
		dirlight.position.set( 0, 50, 0 ).normalize();

		pro5.engine.addObject( sunLight );
		pro5.engine.addObject( ambientLight );
		pro5.engine.addObject( dirlight );
	}

	loadPlanet = function loadPlanet(name, x, y, scale){
		pro5.engine.loadObject("test/"+name+".json", function(mesh){ // TODO change to actual path
			planets.push(mesh)
			mesh.position.y = y;
			mesh.position.x = x;
			mesh.scale.set(scale, scale, scale);
            mesh.name = name;
		});
	}

	return{
		init:init,
		planets:planets
	}

})();
