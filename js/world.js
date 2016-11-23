"use strict"

var pro5 = pro5 || {};

pro5.world = (function(){

	var planets = {};
    //var arrayPlanets = [];

	var init, loadPlanet, createLights, createStars, placePlanets;

	init = function init(){
        pro5.spaceship.createShip();

		// creating the different lights used in the scene
		createLights();

		// creating 'some' stars
		createStars();

		placePlanets();
	}

	placePlanets = function placePlanets() {
		var distanceUnit = 80;


		var sunGeometry = new THREE.IcosahedronGeometry( 30, 2);
		var sunMaterial = new THREE.MeshBasicMaterial( { color: 0xFFA500 } );
		var sun = new THREE.Mesh( sunGeometry, sunMaterial );
		sun.name = "sun";
		pro5.engine.addObject(sun);

		// load planets

		pro5.Planet.load("mercury", 30, distanceUnit, 5);

		var venus = new THREE.Mesh( new THREE.IcosahedronGeometry(5,0), new THREE.MeshBasicMaterial( { color: 0xff0000 } ));
		venus.position.y = distanceUnit * 1.9;
		pro5.engine.addObject(venus);

		pro5.Planet.load("earth", 30, distanceUnit * 2.6, 10);

		pro5.Planet.load("mars", 30, distanceUnit * 4, 10); 

		var jupiter = new THREE.Mesh( new THREE.IcosahedronGeometry(5,0), new THREE.MeshBasicMaterial( { color: 0xff0000 } ));
		jupiter.position.y = distanceUnit * 13.4;
		pro5.engine.addObject(jupiter);

		var saturn = new THREE.Mesh( new THREE.IcosahedronGeometry(5,0), new THREE.MeshBasicMaterial( { color: 0xff0000 } ));
		saturn.position.y = distanceUnit * 24.7;
		pro5.engine.addObject(saturn);

		var uranus = new THREE.Mesh( new THREE.IcosahedronGeometry(5,0), new THREE.MeshBasicMaterial( { color: 0xff0000 } ));
		uranus.position.y = distanceUnit * 49.5;
		pro5.engine.addObject(uranus);

		var neptun = new THREE.Mesh( new THREE.IcosahedronGeometry(5,0), new THREE.MeshBasicMaterial( { color: 0xff0000 } ));
		neptun.position.y = distanceUnit * 77.5;
		pro5.engine.addObject(neptun);

		var pluto = new THREE.Mesh( new THREE.IcosahedronGeometry(5,0), new THREE.MeshBasicMaterial( { color: 0xff0000 } ));
		pluto.position.y = distanceUnit * 101.7;
		pro5.engine.addObject(pluto);
	}

	createStars = function createStars() {
		var starQty = 45000;
		var starGeometry = new THREE.Geometry(1000, 100, 50);

		var textureLoader = new THREE.TextureLoader();

		var materialOptions = {
			size: 10,
			opacity: 0.7,
			transparent: true,
			map: textureLoader.load(
				"test/starMap.png"
			),
		};

		var starMaterial = new THREE.PointsMaterial(materialOptions);

		for (var i = 0; i < starQty; i++) {
			var starVertex = new THREE.Vector3();
			starVertex.x = Math.random() * 1000 - 500;
			starVertex.y = Math.random() * 20000 - 10000;
			starVertex.z = Math.random() * (-1000) - 400;

			starGeometry.vertices.push(starVertex);
		}

		var stars = new THREE.Points(starGeometry, starMaterial);
		pro5.engine.addToBackground(stars);
	}

	createLights = function createLights(){
		var sunLight = new THREE.DirectionalLight(0xffe8a0, 1);
		sunLight.position.set( 0, 0, 50 );

		// an ambient light modifies the global color of a scene (and makes the shadows softer)
		var ambientLight = new THREE.AmbientLight(0xffffff, 0.5);

		var dirlight = new THREE.DirectionalLight( 0xefefff, 0.6 );
		dirlight.position.set( 0, 50, 50 );

		pro5.engine.addObject( sunLight );
		pro5.engine.addObject( ambientLight );
		pro5.engine.addObject( dirlight );

		if(DEBUG){
			var sunFolder = pro5.gui.addFolder("sun");
			sunFolder.add(sunLight, "visible").name("sun visibility");
			sunFolder.add(sunLight.position, "x").name("x");
			sunFolder.add(sunLight.position, "y").name("y");
			sunFolder.add(sunLight.position, "z").name("z");
			sunFolder.add(sunLight, "intensity").name("intensity");
			sunFolder.addThreeColor( sunLight, 'color');

			var ambLightFolder = pro5.gui.addFolder("Ambient Light");
			ambLightFolder.add(ambientLight, "intensity").name("intensity");
			ambLightFolder.addThreeColor( ambientLight, 'color');

			var dirLightFolder = pro5.gui.addFolder("Directional Light");
			dirLightFolder.add(dirlight, "visible").name("sun visibility");
			dirLightFolder.add(dirlight.position, "x").name("x");
			dirLightFolder.add(dirlight.position, "y").name("y");
			dirLightFolder.add(dirlight.position, "z").name("z");
			dirLightFolder.add(dirlight, "intensity").name("intensity");
			dirLightFolder.addThreeColor( dirlight, 'color');
		}
	}

	return{
		init:init,
		planets:planets,
        //arrayPlanets:arrayPlanets
	}

})();
