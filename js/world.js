"use strict"

var pro5 = pro5 || {};

pro5.world = (function(){

    var planetInfo = { "root": [
        {name: "mercury", distance : 58000000, location : "Inner Planets", symbol: "&#9791"},
        {name: "venus", distance : 108000000, location : "Inner Planets", symbol: "&#9792"},
        {name: "earth", distance: 150000000, location : "Inner Planets", symbol: "&#9793"},
        {name: "mars", distance : 228000000, location : "Inner Planets", symbol: "&#9794"},
        {name: "jupiter", distance : 778000000, location : "Asteroid Belt", symbol: "&#9795"},
        {name: "saturn", distance : 1433000000, location : "Outer Planets", symbol: "&#9796"},
        {name: "uranus", distance : 2872000000, location : "Outer Planets", symbol: "&#9797"},
        {name: "neptune", distance : 4495000000, location : "Outer Planets", symbol: "&#9798"},
        {name: "pluto", distance : 5900000000, location : "Trans Neptunian Region", symbol: "&#9799"},
        {name: "next solar system", distance : 41343000000000, location : "Trans Neptunian Region", symbol: ""}
    ]};

    var planets = {}, spaceship, portal;
    var radiusSun = 60;
    var distanceUnit = 60; // 90 y units away from middle of the sun, 60 units away from edge of sun (with radiusSun=30)
	var stuff = [];
	var ring;

    var init, getDistanceUnit, getSpaceship, setSpaceship, loadPlanet, createLights, createStars, createAsteroids, loadPlanets, createPortal, getPortal,

	updateRing, showRing;

    init = function init(){
        pro5.spaceship.createShip(0, function(ship){
            spaceship = ship;
        });

        // creating the different lights used in the scene
        createLights();

        // creating the asteroid belt
        createAsteroids();

        // creating 'some' stars
        createStars();

        loadPlanets();

		var ringcontainer = document.createElement( 'div' );
		var ringdiv = document.createElement( 'div' );
        ringdiv.className = 'selectionring';
        ringdiv.setAttribute("id", "travel--selectionring");

		ringcontainer.appendChild(ringdiv);

        ring = new THREE.CSS3DObject( ringcontainer );
		ring.current = null;

		pro5.engine.addCSSObject(ring);
    }

    getSpaceship = function getSpaceship(){
        return spaceship;
    }

    setSpaceship = function setSpaceship(ship) {
        spaceship = ship;
    }

    getPortal = function getPortal() {
        return portal;
    }
    
    createPortal = function createPortal(innerRadius, outerRadius, thetaSegments, x, y, color) {
        var geometry = new THREE.RingGeometry( innerRadius, outerRadius, thetaSegments );
        var material = new THREE.MeshBasicMaterial( { color: color, side: THREE.DoubleSide, transparent: true, opacity:0.8 } );
        portal = new THREE.Mesh( geometry, material );
        portal.position.x = x;
        portal.position.y = y;
        portal.name = "portal";

        pro5.engine.addObject(portal);
    }

    getDistanceUnit = function getDistanceUnit() {
        return distanceUnit;
    }

	updateRing = function updateRing(shipY){
		// if ring is rendered and ship is still inside boundaries
		if(ring.current !== null &&
			shipY >= ring.current.mesh.position.y - ring.current.mesh.scale.x - 10 &&
			shipY <= ring.current.mesh.position.y + ring.current.mesh.scale.x + 10){
				var opacity = 1 - Math.abs(shipY - ring.current.mesh.position.y)/(ring.current.mesh.scale.x + 10.);
				ring.element.style.opacity = opacity;
		}else{
			// search for new planet
			var found = false;
			for(var i in planets){
				if(shipY >= planets[i].mesh.position.y - planets[i].mesh.scale.x - 10 &&
				shipY <= planets[i].mesh.position.y + planets[i].mesh.scale.x + 10){
					console.log("found "+planets[i].mesh.name);
					ring.current = planets[i];
					ring.position.copy(planets[i].mesh.position);
					var size = planets[i].mesh.geometry.boundingSphere.radius * planets[i].mesh.scale.x + 1.5;
					size *= 37.5;
					ring.element.firstChild.style.width = size+"px";
					ring.element.firstChild.style.height = size+"px";
					ring.scale.set(0.065, 0.065, 0.065);
					found = true;
					var opacity = 1 - Math.abs(shipY - ring.current.mesh.position.y)/(ring.current.mesh.scale.x + 10.);
					ring.element.style.opacity = opacity;
					break;
				}
			}
			// if none was found, set ring to null
			if(!found){
				ring.current = null;
			}
		}
	}

	showRing = function showRing(visibility){
		if(visibility){
			//$(ring.element).fadeIn(800); doesn't work yet bc overwritten by updateRing
			ring.element.style.display = "block";
		}else{
			$(ring.element).fadeOut(300);
		}
	}

    createPortal = function createPortal(innerRadius, outerRadius, thetaSegments, x, y, color) {
        var geometry = new THREE.RingGeometry( innerRadius, outerRadius, thetaSegments, 1 );
        var material = new THREE.MeshBasicMaterial( { color: color, side: THREE.DoubleSide, transparent: true, opacity:0.8 } );
        portal = new THREE.Mesh( geometry, material );
        portal.position.x = x;
        portal.position.y = y;
        portal.name = "portal";

        pro5.engine.addObject(portal);
    }

    loadPlanets = function loadPlanets() {

        pro5.Planet.load("sun", 0, 0, radiusSun, function(mesh){
            mesh.material.materials[0].emissive = new THREE.Color(0x91886a);//(0x9b9170);
            mesh.material.materials[1].emissive = new THREE.Color(0x75674d);//(0xa28d65);
            if(DEBUG){
                //var sunmatfoler = pro5.gui.addFolder("Sun material");
                //sunmatfoler.addThreeColor(planets.sun.mesh.material.materials[0], "emissive");
                //sunmatfoler.addThreeColor(planets.sun.mesh.material.materials[1], "emissive");
            }
        });

        // load planets
        pro5.Planet.load("mercury", -30, distanceUnit + radiusSun, 5);

		pro5.Planet.load("venus", 30, distanceUnit * 1.86 + radiusSun, 10);

		pro5.Planet.load("earth", -30, distanceUnit * 2.59 + radiusSun, 10, function(){
			pro5.Planet.load("moon", 0, 0, 2, function(mesh){
				setTimeout(function(){ // so scale calculated correctly (bc at least rendered once first?)
					planets["earth"].addToOrbit(mesh, 10, 1.2);
				}, 100);

			}, "earth");
		});

        pro5.Planet.load("mars", 30, distanceUnit * 3.93 + radiusSun, 6, function(){
			pro5.Planet.load("phobos", 0, 0, 2, function(mesh){
				setTimeout(function(){ // so scale calculated correctly (bc at least rendered once first?)
					planets["mars"].addToOrbit(mesh, 10, 1.2);
				}, 100);

			}, "mars");
		});

        pro5.Planet.load("jupiter", -30, distanceUnit * 13.4 + radiusSun, 20, function(){
			pro5.Planet.load("europa", 0, 0, 2, function(mesh){
				setTimeout(function(){ // so scale calculated correctly (bc at least rendered once first?)
					planets["jupiter"].addToOrbit(mesh, 10, 1.2);
				}, 100);

			}, "jupiter");
		});

        pro5.Planet.load("saturn", 40, distanceUnit * 24.7 + radiusSun, 15);

        pro5.Planet.load("uranus", -30, distanceUnit * 49.5 + radiusSun, 15);

        pro5.Planet.load("neptune", 30, distanceUnit * 77.5 + radiusSun, 15);

        pro5.Planet.load("pluto", -30, distanceUnit * 101.7 + radiusSun, 4);
    }

    createStars = function createStars() {
        var starQty = 45000;
        var colors = [];
        var starGeometry = new THREE.Geometry(1000, 100, 50);


        var textureLoader = new THREE.TextureLoader();

        var materialOptions = {
            size: 2,
            opacity: 1,
            transparent: true,
            vertexColors: THREE.VertexColors
            //color: Math.random() * 0x808008 + 0x808080
            /* map: textureLoader.load(
			"test/starMap.png"
	       ), */
        };

        var starMaterial = new THREE.PointsMaterial(materialOptions);

        for (var i = 0; i < starQty; i++) {
            var starVertex = new THREE.Vector3();
            starVertex.x = Math.random() * 1000 - 500;
            starVertex.y = Math.random() * 20000 - 10000;
            starVertex.z = Math.random() * (-1000) - 400;

            // random color
            colors[i] = new THREE.Color();
            if(Math.random() < 0.5){
                colors[i].setHSL( 0.55, Math.random()*0.5, Math.random() );
            }else{
                colors[i].setHSL( 0, Math.random()*0.2, Math.random() );
            }


            starGeometry.vertices.push(starVertex);
        }

        starGeometry.colors=colors;

        var stars = new THREE.Points(starGeometry, starMaterial);
        pro5.engine.addToBackground(stars);
    }

    createAsteroids = function createAsteroids() {
        var asteroidsQty = 80;
        //var asteroids = new THREE.Group();

        //var textureLoader = new THREE.TextureLoader();

        /*var materialOptions = {
			size: 2,
			opacity: 1,
			transparent: true,
            vertexColors: THREE.VertexColors
		};*/

        for (var i = 0; i < asteroidsQty; i++) {
			var random = Math.floor(Math.random()*6 + 1);
			pro5.engine.loadObject("objects/other/asteroids/asteroid"+random+".json", false, function(mesh, i){
				mesh.name = 'asteroid' + i;
	            mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * (2.5 - 1) + 1; // 1 <= x < 2.5
	            mesh.geometry.computeBoundingSphere();

	            var unique = false;
	            var buffer = 2;
				var x,y,z;

	            while(!unique){
                    
                    var ymin = distanceUnit * 3.93 + radiusSun + 40; // position of mars + buffer
                    var ymax = distanceUnit * 13.4 + radiusSun - 80; // position of jupiter - buffer

	                mesh.position.x = Math.random() * 200 - 75; // -100 <= x < 100
	                mesh.position.y = Math.random() * (ymax - ymin) + ymin;  // ymin <= x < ymax
                    mesh.position.z = Math.random() * (-80 + 1)  -1; // -1 >= x > -80
	                //mesh.position.z = 0;

					unique = true;

	                for(var j = 0; j < i; j++){
	                    var current = pro5.engine.hasObject('asteroid'+j);

						// TODO solve problem

						var distance = mesh.position.distanceTo(current.position);

						if(mesh.geometry.boundingSphere.radius + current.geometry.boundingSphere.radius > distance){
							console.log("false!");
							unique = false;
							break;
						}
	                }

	            }
				var object = new pro5.Stuff(mesh, Math.random()*0.05);
	            pro5.engine.addObject(mesh);
			});
        }

    }


    createLights = function createLights(){
        var sunLight = new THREE.PointLight(0xffe8a0, 1);
        sunLight.position.set( 0, 0, 0 );

        // an ambient light modifies the global color of a scene (and makes the shadows softer)
        var ambientLight = new THREE.AmbientLight(0xffffff, 0.5);

        var dirlight = new THREE.DirectionalLight( 0xefefff, 0.37);//6 );
        dirlight.position.set( 16, 50, -4); //0, 50, -50 );

        var sunSpotLight = new THREE.SpotLight(0xefefff, 0.6);
        sunSpotLight.angle = Math.PI/2;
        sunSpotLight.distance = 80;
        sunSpotLight.position.set( 0, 0, 80 );

        pro5.engine.addObject( sunLight );
        pro5.engine.addObject( ambientLight );
        pro5.engine.addObject( dirlight );
        pro5.engine.addObject( sunSpotLight );

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

            pro5.gui.add(sunSpotLight, "intensity");

            //var spotLightHelper = new THREE.SpotLightHelper( sunSpotLight );
            //pro5.engine.addObject( spotLightHelper );
            //console.log(spotLightHelper);
        }
    }

    return{
        init:init,
        planets:planets,
		stuff:stuff,
        getSpaceship:getSpaceship,
        setSpaceship:setSpaceship,
		updateRing:updateRing,
		showRing:showRing,
        radiusSun:radiusSun,
        planetInfo:planetInfo,
        createPortal:createPortal,
        getPortal:getPortal,
        getDistanceUnit:getDistanceUnit
    }

})();
