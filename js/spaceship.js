"use strict"

var pro5 = pro5 || {};

pro5.spaceship = (function(){

    var Spaceship = function(mesh){

        this.mesh = mesh;
        this.mesh.name = "ship";
    }

    var ship, currentPlanet = "mercury", planetNr=0,

        createShip,
        updateShip,
		updateFlame,
        checkForCollision,
        calculateSunDistance,
        setDistanceToNext,
        setLocation,
        reposition,

		idle, start, stop; // tweens

    setLocation = function setLocation() {
        var locationElem = document.getElementById("bar-top--position").firstChild;

        // TODO Abfrage verbessern
        if(ship != undefined) {
            locationElem.innerHTML = pro5.world.planetInfo.root[planetNr].location;
        }
    }

    createShip = function createShip(){
        pro5.engine.loadObject("objects/rocket/rocket.json", function(mesh){
            ship = new Spaceship(mesh);
            ship.mesh.position.y = 80; // from 50
            ship.mesh.scale.set(3, 3, 3);
            pro5.engine.loadObject("objects/rocket/flame.json", function(mesh){

                // parent flame mesh to rocket
                ship.mesh.add(mesh);
                mesh.position.y = -0.59;
                //mesh.scale.set(0,0,0);
                mesh.material.materials[0].emissive = new THREE.Color(0xb1932e);

                // add point light for flame
                var flame = new THREE.PointLight(0xe8b714, 1, 10);
                flame.position.y = -0.77;
                flame.position.z = 0.8;
                ship.mesh.add(flame);

				start = new TWEEN.Tween(ship.mesh.children[0].scale)
				.to({x: 1.0, y: 1.0, z: 1.0}, 200)
				.onUpdate(function(){
					ship.mesh.children[1].intensity = this.x;
				});

				stop = new TWEEN.Tween(ship.mesh.children[0].scale)
				.to({x: 0.0, y: 0.0, z: 0.0}, 200)
				.onUpdate(function(){
					ship.mesh.children[1].intensity = this.x;
				})
				.onComplete(function(){
					ship.mesh.children[0].visible = false;
					ship.mesh.children[1].intensity = 0;
				});

				idle = new TWEEN.Tween(ship.mesh.children[0].scale)
				.to({x: 0.7, y: 0.7, z: 0.7}, 500)
				.repeat(Infinity)
				.yoyo(true)
				.onUpdate(function(){
					ship.mesh.children[1].intensity = this.x;
				});

				start.chain(idle);

				updateFlame(false);

                if(DEBUG){
                    pro5.gui.addThreeColor(mesh.material.materials[0], "emissive");

                    pro5.gui.add(flame.position, "y");
                    pro5.gui.add(flame.position, "z");
                    pro5.gui.add(flame, "intensity");
                    pro5.gui.addThreeColor(flame, "color");
                }
            });
        });
    }

    setDistanceToNext = function setDistanceToNext(currentSunDistance) {
        var setNext = false;
        var setPrevious = false;
        var currentPlanet = pro5.world.planetInfo.root[planetNr];

        var distanceToNext = currentPlanet.distance;
        var currentPlanetName = currentPlanet.name;
        var currentDistanceToNext = distanceToNext - currentSunDistance;

        if(currentDistanceToNext < 0 && !setNext){
            planetNr++;
            setNext = true;
        }

        if(planetNr != 0){
            var lastPlanet = pro5.world.planetInfo.root[planetNr-1];

            if( (currentDistanceToNext > (distanceToNext - lastPlanet.distance)) && !setPrevious ) {
                planetNr--;
                setPrevious = true;
            }
        }
        var planetName = document.getElementById("bar-top--nextplanet-name");
        var planetDistance = document.getElementById("bar-top--nextplanet-distance-calc");

        if(ship != undefined){
            planetName.innerHTML = currentPlanetName;
            planetDistance.innerHTML = Math.floor((currentDistanceToNext/1000000)).toLocaleString();
        }

    }

    calculateSunDistance = function calculateSunDistance() {
        var elem = document.getElementById("bar-top--currentdistance-calc");
        var currentSunDistance;
        var endOfSpace = 5900000000; // :) pluto = ende

        // TODO Abfrage verbessern
        if(ship != undefined){
            currentSunDistance = Math.round( (ship.mesh.position.y-pro5.world.radiusSun) * 1160000);
            elem.innerHTML = currentSunDistance.toLocaleString();
        }

        if(currentSunDistance < endOfSpace) {
            setDistanceToNext(currentSunDistance);
            setLocation();
        }
    }

    var y;

    reposition = function reposition(y){
        ship.mesh.position.x = 0;
        ship.mesh.position.y = y;

        ship.mesh.rotation.z = 0;
    }

    //Collision
    checkForCollision = function checkForCollision(){

        if(ship != undefined){

            // direction vectors
            var rays = [
                /*new THREE.Vector3(0, 1, 0),
                new THREE.Vector3(0, 0, 1),
                new THREE.Vector3(1, 0, 0),
                new THREE.Vector3(0, 0, -1),
                new THREE.Vector3(-1, 0, 0),
                new THREE.Vector3(0, -1, 0),
                new THREE.Vector3(-1, 1, 1),
                new THREE.Vector3(1, 1, 1),
                new THREE.Vector3(1, 1, -1),
                new THREE.Vector3(-1, 1, -1),
                new THREE.Vector3(1, -1, -1),
                new THREE.Vector3(1, -1, 1),
                new THREE.Vector3(-1, -1, 1),
                new THREE.Vector3(-1, -1, -1)*/

                new THREE.Vector3(0, 1, 0),
                new THREE.Vector3(1, 1, 0),
                new THREE.Vector3(1, 0, 0),
                new THREE.Vector3(1, -1, 0),
                new THREE.Vector3(0, -1, 0),
                new THREE.Vector3(-1, -1, 0),
                new THREE.Vector3(-1, 0, 0),
                new THREE.Vector3(-1, 1, 0),
            ];

            for (var vertexIndex = 0; vertexIndex < rays.length; vertexIndex++)
            {
                var raycaster = new THREE.Raycaster();
                raycaster.set(ship.mesh.position, rays[vertexIndex]);

                var intersections = raycaster.intersectObjects(pro5.Planet.arrayPlanets);


                if(intersections.length > 0 && intersections[0].distance <= 10 && intersections[0].object.name != "sun"){
                    // handle collision...
                    console.log(intersections[0].object.name);


                    pro5.engine.cameraToPlanet(intersections[0].object);


                }
            }
        }
    }

    //Update Spaceship
    var keyboard = new THREEx.KeyboardState();
    var a = new THREE.Vector2(0, 0);
    var maxspeed = 0.7;
    var rotspeed = 0.1;
    var acc = 0.03;
    var damping = 0.9;
    var cameraY,
        boundry;
    var moving = false;
	var flameflag = true;

    updateShip = function updateShip(cameraY, boundry){

        if(keyboard.pressed("left")) {
            ship.mesh.rotation.z += rotspeed;
            a.rotateAround({x:0, y:0}, rotspeed);
        }
        if(keyboard.pressed("right")) {
            ship.mesh.rotation.z -= rotspeed;
            a.rotateAround({x:0, y:0}, -rotspeed);
        }
        if(keyboard.pressed("up")){
            if(a.length() < maxspeed){
                a.y += acc * Math.cos(ship.mesh.rotation.z);
                a.x += -acc * Math.sin(ship.mesh.rotation.z);
				updateFlame(true);
                moving = true;
            }
        } else if(keyboard.pressed("down")) {
            if(a.length() < maxspeed){
                a.y -= acc * Math.cos(ship.mesh.rotation.z);
                a.x -= -acc * Math.sin(ship.mesh.rotation.z);
                moving = true;
            }
        } else {
            a.y *= damping;
            a.x *= damping;
            if(ship && ship.mesh.children[0] && ship.mesh.children[1]){
				updateFlame(false);
            }
            moving = false;
        }

        if(ship){

            ship.mesh.position.y += a.y;

            // checks boundries
            if(ship.mesh.position.x + a.x <= boundry - 3.5 && ship.mesh.position.x + a.x >= -boundry + 3.5)
                ship.mesh.position.x += a.x;

            if(cameraY == undefined){
                return 50;
            } else{
                if(ship.mesh.position.y >= cameraY + 10 ){

					// TODO extremely ugly code...clean up
					if(!keyboard.pressed("left") && !keyboard.pressed("right")){
						var dr = (Math.round(ship.mesh.rotation.z/(Math.PI))*Math.PI ) - ship.mesh.rotation.z;
						ship.mesh.rotation.z += dr * 0.07;
						a.rotateAround({x:0, y:0}, dr * 0.07);
					}

                    if(moving)
                        pro5.engine.cameraZoom(true);
                    else
                        pro5.engine.cameraZoom(false);

                    return ship.mesh.position.y - 10;
                }
                else if(ship.mesh.position.y <= cameraY - 10){

					// TODO extremely ugly code...clean up
					if(!keyboard.pressed("left") && !keyboard.pressed("right")){
						var dr = (Math.round(ship.mesh.rotation.z/(Math.PI))*Math.PI ) - ship.mesh.rotation.z;
						ship.mesh.rotation.z += dr * 0.07;
						a.rotateAround({x:0, y:0}, dr * 0.07);
					}

                    if(moving)
                        pro5.engine.cameraZoom(true);
                    else
                        pro5.engine.cameraZoom(false);

                    return ship.mesh.position.y + 10;
                } else {
                    if(!moving)
                        pro5.engine.cameraZoom(false);
                }

            }
            return cameraY;

        }


    }

	updateFlame = function updateFlame(on){
		if(!on && flameflag){
			start.stop();
			idle.stop();
			stop.start();
			flameflag = false;
		}else if(on && !flameflag){
			ship.mesh.children[0].visible = true;
			ship.mesh.children[1].intensity = 1;
			stop.stop();

			// have to reassign idle bc otherwise not yoyoing after some time :(
			idle = new TWEEN.Tween(ship.mesh.children[0].scale)
			.to({x: 0.7, y: 0.7, z: 0.7}, 500)
			.repeat(Infinity)
			.yoyo(true)
			.onUpdate(function(){
				ship.mesh.children[1].intensity = this.x;
			});

			start.chain(idle);

			start.start();
			flameflag = true;
		}
	}

    return{
        createShip:createShip,
        updateShip:updateShip,
        checkForCollision:checkForCollision,
        calculateSunDistance:calculateSunDistance,
        reposition:reposition
    }

})();
