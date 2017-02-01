"use strict"

var pro5 = pro5 || {};

pro5.spaceship = (function(){

    var Spaceship = function(mesh){
        this.mesh = mesh;
        this.mesh.name = "ship";
    }

    var ship,
        collisionDistance = 6,
        planetNr=0,
        markerNr=0,
        type=0,
        idle, start, stop, // tweens

        distance = 0,

        createShip,
        createFlame,

        setMarkerText,
        changeMarkerText,

        setDistanceToNext,
        setLocation,
        calculateSunDistance,

        checkForCollision,
        checkForSunCollision,
        shake = true,

        alignShip,
        rotateShip,
        setVector,
        rotateToOrbit,

        updateShip,
        updateFlame,
        teleportShip,
        secondPortal,

        getDistance,
        setDistance;

    //Update Spaceship
    var keyboard = new THREEx.KeyboardState();
    var a = new THREE.Vector2(0, 0);
    var maxspeed = 0.7;
    var backspeed = 0.03;
    var rotspeed = 6;
    var alignrotspeed = 4.2;
    var acc = 1.8;
    var damping = 0.96;
    var cameraY,
        boundry;
    var moving = false;
    var flameflag = true;

    /*
	*	### creation of ship and parts ###
	*/
    createShip = function createShip(type, callback){
        var query;
        switch(type){
            case 0:
                query = "objects/rocket/rocket.json";
                break;
            case 1:
                query = "objects/rocket/spaceshuttle.json";
                break;
            case 2:
                query = "objects/rocket/commandmodule.json";
                break;
            case 3:
                query = "objects/rocket/rocket_fat.json";
        }
        pro5.engine.loadObject(query, true, function(mesh){
            ship = new Spaceship(mesh);
            ship.mesh.position.y = 80; // from 50
            ship.mesh.scale.set(3, 3, 3);
            switch(type){
                case 0: case 3:
                    createFlame("flame", -0.59); // for standard
                    break;
                case 1:
                    createFlame("flame_small", -0.42, 0.31); // for spaceshuttle
                    break;
                case 2:
                    createFlame("flame", -0.43); // for commandmodule
                    break;
            }
            callback(ship);
        });
    }

    createFlame = function createFlame(file, y, x){
        pro5.engine.loadObject("objects/rocket/"+file+".json", true, function(mesh){

            // parent flame mesh to rocket
            ship.mesh.add(mesh);
            mesh.position.y = y;
            if(x !== undefined) {
                mesh.position.x = x;
                pro5.engine.loadObject("objects/rocket/"+file+".json", true, function(mesh){
                    mesh.position.y = y;
                    mesh.position.x = -x;
                    ship.mesh.add(mesh);
                    mesh.material.materials[0].emissive = new THREE.Color(0xb1932e);
                });
            }
            mesh.material.materials[0].emissive = new THREE.Color(0xb1932e);

            // add point light for flame
            var flame = new THREE.PointLight(0xe8b714, 1, 10);
            flame.position.y = -0.77;
            flame.position.z = 0.8;
            ship.mesh.add(flame);

            // init tweens
            start = new TWEEN.Tween(ship.mesh.children[0].scale)
                .to({x: 1.0, y: 1.0, z: 1.0}, 200)
                .onUpdate(function(){
                ship.mesh.children[1].intensity = this.x;
                if(ship.mesh.children[2] !== undefined)
                    ship.mesh.children[2].scale.set(
                        ship.mesh.children[0].scale.x,
                        ship.mesh.children[0].scale.y,
                        ship.mesh.children[0].scale.z);
            });

            stop = new TWEEN.Tween(ship.mesh.children[0].scale)
                .to({x: 0.01, y: 0.01, z: 0.01}, 200) // almost 0
                .onUpdate(function(){
                ship.mesh.children[1].intensity = this.x;
                if(ship.mesh.children[2] !== undefined)
                    ship.mesh.children[2].scale.set(
                        ship.mesh.children[0].scale.x,
                        ship.mesh.children[0].scale.y,
                        ship.mesh.children[0].scale.z);
            })
                .onComplete(function(){
                ship.mesh.children[0].visible = false;
                if(ship.mesh.children[2] !== undefined){
                    ship.mesh.children[2].visible = false;
                }
                ship.mesh.children[1].intensity = 0;
            });

            idle = new TWEEN.Tween(ship.mesh.children[0].scale)
                .to({x: 0.7, y: 0.7, z: 0.7}, 500)
                .repeat(Infinity)
                .yoyo(true)
                .onUpdate(function(){
                ship.mesh.children[1].intensity = this.x;
                if(ship.mesh.children[2] !== undefined)
                    ship.mesh.children[2].scale.set(
                        ship.mesh.children[0].scale.x,
                        ship.mesh.children[0].scale.y,
                        ship.mesh.children[0].scale.z);
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
    }

    /*
	*	### Marker ###
	*/
    setMarkerText = function setMarkerText(currentSunDistance) {

        if(markerNr != 1 && currentSunDistance > 19000000 && currentSunDistance < 70000000){
            pro5.engine.appendMarker('sun');
            pro5.engine.markerstorage[0].position.y = 70;
            console.log("set 1");
            markerNr = 1;
        }

        else if(markerNr !=2 && currentSunDistance > 100000000 && currentSunDistance < 175000000){
            pro5.engine.appendMarker('earth');
            pro5.engine.markerstorage[0].position.y = 190;
            console.log("set 2");
            markerNr = 2;
        }

        else if (markerNr != 3 && currentSunDistance > 175000000 && currentSunDistance < 260000000){
            pro5.engine.appendMarker('inner-planets-active');
            pro5.engine.markerstorage[0].position.y = 270;
            console.log("set 3");
            markerNr = 3;
        }

        else if (markerNr != 4 && currentSunDistance > 260000000 && currentSunDistance < 370000000){
            pro5.engine.appendMarker('inner-planets-out');
            pro5.engine.markerstorage[0].position.y = 350;
            console.log("set 4");
            markerNr = 4;
        }
        // Berechnung von Vergleichswerten??
        else if (markerNr != 5 && currentSunDistance > 370000000 && currentSunDistance < 670000000){
            pro5.engine.appendMarker('asteroid-belt');
            pro5.engine.markerstorage[0].position.y = 580;
            console.log("set 5");
            markerNr = 5;
        }

        else if (markerNr != 6 && currentSunDistance > 670000000 && currentSunDistance < 800000000){
            pro5.engine.appendMarker('diamond-rain');
            pro5.engine.markerstorage[0].position.y = 960;
            console.log("set 6");
            markerNr = 6;
        }

        else if (markerNr != 6 && currentSunDistance > 800000000 && currentSunDistance < 1500000000){
            pro5.engine.appendMarker('burping');
            pro5.engine.markerstorage[0].position.y = 2000;
            console.log("set 7");
            markerNr = 7;
        }
    }

    /*
	*	### GUI ###
	*/
    setLocation = function setLocation() {
        var locationElem = document.getElementById("bar-top--position").firstChild;

        // TODO Abfrage verbessern
        if(ship) {
            if(a.y < 0)
                locationElem.innerHTML = pro5.world.planetInfo.root[planetNr + 1].location;
            else
                locationElem.innerHTML = pro5.world.planetInfo.root[planetNr].location;

        }
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

        if(planetNr != 0 && a.y < 0){
            //var lastPlanet = pro5.world.planetInfo.root[planetNr-1];


            planetNr--;

            /*if( (currentDistanceToNext > (distanceToNext - lastPlanet.distance)) && !setPrevious ) {
                planetNr--;
                setPrevious = true;
            }*/
        }
        var planetName = document.getElementById("bar-top--nextplanet-name");
        var planetDistance = document.getElementById("bar-top--nextplanet-distance-calc");

        if(ship != undefined){
            planetName.innerHTML = currentPlanetName;
            planetDistance.innerHTML = Math.abs(Math.floor((currentDistanceToNext/1000000))).toLocaleString();
        }
    }

    calculateSunDistance = function calculateSunDistance() {
        var elem = document.getElementById("bar-top--currentdistance-calc");
        var currentSunDistance;
        var endOfSpace = 41343000000000; // :) next solar system = ende

        // TODO Abfrage verbessern
        if(ship){
            // eine distanceunit enstpricht der entfernung zwischen rand der sonne und mitte merkur, also 58.000.000km.
            // y = 58000000/distanceunit

            currentSunDistance = Math.round( (ship.mesh.position.y-pro5.world.radiusSun) * 58000000/pro5.world.getDistanceUnit());
            if(currentSunDistance > 0)
                elem.innerHTML = currentSunDistance.toLocaleString();
            else
                elem.innerHTML = 0;
        }
        if(currentSunDistance < endOfSpace) {
            setDistanceToNext(currentSunDistance);
            setLocation();
            setMarkerText(currentSunDistance);
        }
    }

    /*
	*	### Collision ###
	*/
    checkForCollision = function checkForCollision(){

        // direction vectors
        var rays = [
            new THREE.Vector3(0, 1, 0),
            new THREE.Vector3(1, 1, 0),
            new THREE.Vector3(1, 0, 0),
            new THREE.Vector3(1, -1, 0),
            new THREE.Vector3(0, -1, 0),
            new THREE.Vector3(-1, -1, 0),
            new THREE.Vector3(-1, 0, 0),
            new THREE.Vector3(-1, 1, 0),
        ];

        for (var vertexIndex = 0; vertexIndex < rays.length; vertexIndex++){

            var raycaster = new THREE.Raycaster();
            raycaster.set(ship.mesh.position, rays[vertexIndex]);

            if (checkForSunCollision(raycaster)){
                break;
            }

            var intersections = raycaster.intersectObjects(pro5.Planet.arrayPlanets);

            if(intersections.length > 0 && intersections[0].distance <= collisionDistance){
                // handle collision...
                console.log(intersections[0].object.name +", "+intersections[0].distance+", "+vertexIndex);

                pro5.engine.enterDetail(intersections[0].object);

                break;
            }
        }
    }

    changeMarkerText = function changeMarkerText(text){
        $(".travel--marker span").text("That's the wrong way buddy!");
    }

    teleportShip = function teleportShip(destinationX, destinationY, trackingshot) {
        var portalParameters;
        var startX = ship.mesh.position.x;
        var startY = ship.mesh.position.y;

        // create portal but not visible at beginning
        pro5.world.createPortal(0.01,0.01,40,startX,startY,"#1e90ff");
        portalParameters = pro5.world.getPortal().geometry.parameters;

        // let ship shrink
        var shrinkShip = new TWEEN.Tween(ship.mesh.scale)
        .to({x: 0.01, y: 0.01, z: 0.01}, 400)
        .start();

        // while ship shrinks, the portal outerRadius gets bigger at the same time
        var portalScale = new TWEEN.Tween(portalParameters)
        .to({outerRadius: 4}, 400)
        .easing(TWEEN.Easing.Back.Out)
        .start();

        // at the same time the innerRadius also gets bigger
        // onComplete: portal gets deleted and ship will be placed at destinationX and destinationY
        //             destination portal gets created and scaled up
        var portalOpen = new TWEEN.Tween(portalParameters)
        .to({innerRadius: 3.9}, 350)
        .onUpdate(function () {
            pro5.engine.removeObjectByName("portal");
            pro5.world.createPortal(this.innerRadius, portalParameters.outerRadius, portalParameters.thetaSegments, startX, startY, "#1e90ff");
        })
        .onComplete(function(){
            // remove portal

            pro5.engine.removeObjectByName("portal");



            if(trackingshot){

                //setTimeout(function(){
                var camera = pro5.engine.getCamera();
                var trackingshottween = new TWEEN.Tween(camera.position)
                .to({
                    x: destinationX,
                    y: destinationY
                }, 500)
                .delay(250)
                .onComplete(function(){
                    ship.mesh.position.x = destinationX;
                    ship.mesh.position.y = destinationY;
                    ship.mesh.rotation.z = 0;
                })
                .start();



                setTimeout(function(){
                    secondPortal(destinationX, destinationY, portalParameters, reloadShip, trackingshot);
                }, 1000);

            } else{
                ship.mesh.position.x = destinationX;
                ship.mesh.position.y = destinationY;
                ship.mesh.rotation.z = 0;

                secondPortal(destinationX, destinationY, portalParameters, reloadShip, trackingshot);
            }



        })
        .start();

        var reloadShip = new TWEEN.Tween(ship.mesh.scale)
        .delay(200)
        .to({x: 3, y: 3, z: 3}, 400);
    }

    secondPortal = function secondPortal (destinationX, destinationY, portalParameters, reloadShip, trackingshot){

        pro5.world.createPortal(0.01,0.01,40,destinationX,destinationY, "#FFB908");

        portalParameters = pro5.world.getPortal().geometry.parameters;

        var portalScaleReset = new TWEEN.Tween(portalParameters)
        .to({outerRadius: 4}, 400)
        .easing(TWEEN.Easing.Back.Out)
        .start();

        var portalOpenReset = new TWEEN.Tween(portalParameters)
        .to({innerRadius: 3.9}, 350)
        .onUpdate(function () {
            pro5.engine.removeObjectByName("portal");
            pro5.world.createPortal(this.innerRadius, portalParameters.outerRadius, portalParameters.thetaSegments, destinationX, destinationY,"#FFB908");
        })
        .onComplete(function () {
            pro5.engine.removeObjectByName("portal");
        })
        .start();

        reloadShip.start();

        if(trackingshot){
          //portal to planet
            setTimeout(function(){
                setVector(0, 0.8);
            }, 400)
        } else {
            // portal for sun collision
            setVector(0, 0.8);
        }


    }

    checkForSunCollision = function checkForSunCollision(raycaster) {
        var sun = pro5.engine.hasObject('sun');
        var intersections = raycaster.intersectObject(sun);

        if(intersections.length > 0 && intersections[0].distance <= collisionDistance){
            // handle collision...
            if(shake){ // only shake once
                pro5.engine.cameraShake(); // camera is shaking
                pro5.engine.setSunCollision(true); // spaceship stops moving

                setTimeout(function(){
                    // after a second change marker text first, after 1.5s let spaceship disappear through portal
                    changeMarkerText("That's the wrong way buddy!");

                    setTimeout(function () {
                        teleportShip(0,80);
                        setTimeout(function () {
                            $(".travel--marker span").text("There you go!");
                            pro5.engine.setSunCollision(false);
                            shake = true;
                        }, 800);
                    }, 1500);
                }, 1000);
                shake = false;
            }
            return true;
        }
    }

    /*
	*	### Helperfunctions ###
	*/
    rotateShip = function rotateShip(rotation){
        ship.mesh.rotation.z += rotation;
        a.rotateAround({x:0, y:0}, rotation);
    }

    alignShip = function alignShip(delta){
        if(!keyboard.pressed("left") && !keyboard.pressed("right") && (keyboard.pressed("up") || keyboard.pressed("down"))){
            var dr = (Math.round(ship.mesh.rotation.z/(Math.PI))*Math.PI ) - ship.mesh.rotation.z;
            rotateShip(dr*alignrotspeed*delta);
        }
    }

    rotateToOrbit = function(){
        // get look at vector
        var m = ship.mesh.matrix;
        m.lookAt(
            ship.mesh.position, new THREE.Vector3(), ship.mesh.up
        )

        // create quaternion and apply offset rotation
        var destRotation = new THREE.Quaternion().setFromRotationMatrix(m);
        destRotation.multiply(new THREE.Quaternion().setFromEuler(
            new THREE.Euler(-Math.PI/2, 0, -Math.PI/2)
        ));

        var animation = {position: 0};
        var toOrbitTween = new TWEEN.Tween(animation)
        .to({position: 1}, 500)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(function(){
            ship.mesh.quaternion.slerp(destRotation, animation.position);
        })
        .start();
    }

    /*
	*	### Getter/Setter
	*/
    setVector = function setVector(x, y){
        a.x = x;
        a.y = y;
    }

    /*
	*	### Update ###
	*/
    updateShip = function updateShip(cameraY, boundry, delta){
        calculateSunDistance();

        if(keyboard.pressed("left")) {
            rotateShip(rotspeed * delta);
        }
        if(keyboard.pressed("right")) {
            rotateShip(-rotspeed * delta);
        }

        if(keyboard.pressed("up")){
            if(a.length() < maxspeed){
                a.y += acc * Math.cos(ship.mesh.rotation.z) * delta;
                a.x += -acc * Math.sin(ship.mesh.rotation.z) * delta;
                updateFlame(true);
                moving = true;
            }
        } else {
            a.y *= Math.pow(damping, delta*60);
            a.x *= Math.pow(damping, delta*60);
            if(ship && ship.mesh.children[0] && ship.mesh.children[1]){
                updateFlame(false);
            }
            moving = false;
        }

        /*document.onkeyup = function(event){
            if(event.keyCode === 84){ // letter 't'
                pro5.engine.removeObject(ship.mesh);
                type = (type + 1)%4;
                createShip(type, function(){});
            }
        }*/

        ship.mesh.position.y += a.y * delta * 60;
        pro5.world.updateRing(ship.mesh.position.y);
        if(ship.mesh.position.y > distance){
            distance = ship.mesh.position.y;
        }

        // checks boundries
        if(ship.mesh.position.x + a.x <= boundry - 3.5 && ship.mesh.position.x + a.x >= -boundry + 3.5)
            ship.mesh.position.x += a.x * delta * 60;
        else{
            if(ship.mesh.position.x > boundry - 3.5)
                ship.mesh.position.x = boundry - 3.5;
            else if(ship.mesh.position.x < - boundry + 3.5)
                ship.mesh.position.x = - boundry + 3.5;
        }

        if(ship.mesh.position.y >= cameraY + 10 ){

            alignShip(delta);

            if(moving)
                pro5.engine.cameraZoom(true);
            else
                pro5.engine.cameraZoom(false);

            return ship.mesh.position.y - 10;
        }
        else if(ship.mesh.position.y <= cameraY - 10){

            alignShip(delta);

            if(moving)
                pro5.engine.cameraZoom(true);
            else
                pro5.engine.cameraZoom(false);

            return ship.mesh.position.y + 10;
        } else {
            if(!moving)
                pro5.engine.cameraZoom(false);
        }
        return cameraY;

    }

    updateFlame = function updateFlame(on){
        if(!on && flameflag){
            start.stop();
            idle.stop();
            stop.start();
            flameflag = false;
        }else if(on && !flameflag){
            ship.mesh.children[0].visible = true;
            if(ship.mesh.children[2] !== undefined)
                ship.mesh.children[2].visible = true;
            ship.mesh.children[1].intensity = 1;
            stop.stop();

            // have to reassign idle bc otherwise not yoyoing after some time :(
            idle = new TWEEN.Tween(ship.mesh.children[0].scale)
                .to({x: 0.7, y: 0.7, z: 0.7}, 500)
                .repeat(Infinity)
                .yoyo(true)
                .onUpdate(function(){
                ship.mesh.children[1].intensity = this.x;
                if(ship.mesh.children[2] !== undefined)
                    ship.mesh.children[2].scale.set(ship.mesh.children[0].scale.x, ship.mesh.children[0].scale.y, ship.mesh.children[0].scale.z);
            });

            start.chain(idle);

            start.start();
            flameflag = true;
        }
    }

    getDistance = function getDistance(){
        return distance;
    }

    setDistance = function setDistance(value){
        distance = value;
    }

    return{
        createShip:createShip,
        updateShip:updateShip,
        updateFlame:updateFlame,
        checkForCollision:checkForCollision,
        calculateSunDistance:calculateSunDistance,
        setVector: setVector,
        rotateToOrbit: rotateToOrbit,
        getDistance:getDistance,
        setDistance:setDistance,
        teleportShip:teleportShip
    }

})();
