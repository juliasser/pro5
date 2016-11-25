"use strict"

var pro5 = pro5 || {};

pro5.spaceship = (function(){

    var Spaceship = function(mesh){

        this.mesh = mesh;
        this.mesh.name = "ship";
    }

    var ship, planetNr=0, startPosRef, startPosSet = false, markerMoving = false, currentMarkerPosition, markerNr=1, currentRefPlanet = pro5.world.planets.mercury,

        createShip,
        createFlame,
        updateShip,
        alignShip,
        rotateShip,
        updateFlame,
        checkForCollision,
        calculateSunDistance,
        setDistanceToNext,
        setLocation,
        reposition,
        setMarkerText,
        moveMarker,
        startMarker,
        resetMarker,
        setStartReferencePosition,
        reset,
        createRing,

        idle, start, stop; // tweens

    setStartReferencePosition = function setStartReferencePosition(planet){
        currentRefPlanet = planet;
        startPosRef = Math.round(Math.abs(pro5.engine.convertToScreenPosition(planet.mesh).y));
        startMarker = parseInt($("#travel--marker").css("top"));
        startPosSet = true;
        markerMoving = true;
    }

    resetMarker = function resetMarker(){
        console.log("reset");
        $("#travel--marker").children().remove();
        $("#travel--marker").css("top", "100px");
        currentMarkerPosition = 100;
        startPosSet = false;
        markerMoving = false;
        markerNr++;
    }

    moveMarker = function moveMarker() {
        var marker = $("#travel--marker");
        var currentPosRef = Math.round(Math.abs(pro5.engine.convertToScreenPosition(currentRefPlanet.mesh).y));

        currentMarkerPosition = startMarker + (currentPosRef - startPosRef);

        if(currentMarkerPosition > window.innerHeight)
            resetMarker();

        marker.css("top", currentMarkerPosition);
    }

    setMarkerText = function setMarkerText(currentSunDistance) {
        var marker = document.getElementById("travel--marker");

        var link = document.querySelector('#content--travel-marker');
        var markerArray = link.import.querySelector('body').childNodes;

        var canvas = document.getElementById("canvas--inbetween");

        if(marker.childNodes.length == 0) {

            if(!startPosSet) {
                switch (markerNr) {
                    case 1:
                        if (currentSunDistance > 23200000){
                            setStartReferencePosition(pro5.world.planets.mercury);
                            marker.appendChild(markerArray[markerNr-1]);
                        }
                        break;
                    case 2:
                        if (currentSunDistance > 120000000) {
                            setStartReferencePosition(pro5.world.planets.earth);
                            marker.appendChild(markerArray[markerNr-1]);
                        }
                        break;
                    case 3:
                        if (currentSunDistance > 200000000) {
                            setStartReferencePosition(pro5.world.planets.mars);
                            marker.appendChild(markerArray[markerNr-1]);
                        }
                        break;
                    case 4:
                        if (currentSunDistance > 250000000) {
                            setStartReferencePosition(pro5.world.planets.mars);
                            marker.appendChild(markerArray[markerNr-1]);
                        }
                        break;
                        /* // TODO: not working properly yet because of reference object
                    case 5:
                        if (currentSunDistance > 555000000) {
                            setStartReferencePosition(pro5.world.planets.mars);
                            marker.appendChild(markerArray[markerNr-1]);
                        }
                     */
                }
            }

        }
    }

    setLocation = function setLocation() {
        var locationElem = document.getElementById("bar-top--position").firstChild;

        // TODO Abfrage verbessern
        if(ship) {
            locationElem.innerHTML = pro5.world.planetInfo.root[planetNr].location;
        }
    }

    createShip = function createShip(){
        pro5.engine.loadObject("objects/rocket/rocket.json", function(mesh){
            ship = new Spaceship(mesh);
            ship.mesh.position.y = 80; // from 50
            ship.mesh.scale.set(3, 3, 3);
            createFlame();
        });
    }

    createFlame = function createFlame(){
        pro5.engine.loadObject("objects/rocket/flame.json", function(mesh){

            // parent flame mesh to rocket
            ship.mesh.add(mesh);
            mesh.position.y = -0.59;
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
        var endOfSpace = 5620000000; // :) pluto = ende

        // TODO Abfrage verbessern
        if(ship != undefined){
            currentSunDistance = Math.round( (ship.mesh.position.y-pro5.world.radiusSun) * 1160000);
            elem.innerHTML = currentSunDistance.toLocaleString();
        }
        if(currentSunDistance < endOfSpace) {
            setDistanceToNext(currentSunDistance);
            setLocation();
            setMarkerText(currentSunDistance);
        }
    }

    var y;

    reposition = function reposition(y){
        ship.mesh.position.x = 0;
        ship.mesh.position.y = y;

        ship.mesh.rotation.z = 0;
    }

    //Collision

    var last = "sun";
    var planet;

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

                

                if(intersections.length > 0 && intersections[0].distance <= 20 && intersections[0].object.name != "sun"){
                    // handle collision...
                    console.log(intersections[0].object.name);

                    planet = intersections[0].object;
                    
                    if(planet.name != last){
                        pro5.engine.removeObjectByName("ring");
                        createRing(planet);
                        last = planet.name;
                    }
                    
                    //pro5.engine.enterDetail(intersections[0].object);

                }
            }
        }
    }

    createRing = function createRing(planet){
        var geometry = new THREE.RingGeometry( planet.scale.x + 1.9, planet.scale.x + 2, 100 );
        var material = new THREE.MeshBasicMaterial( { color: 0xffffff, transparent: true, opacity: 0.4 } );
        var mesh = new THREE.Mesh( geometry, material );
        mesh.position.x = planet.position.x;
        mesh.position.y = planet.position.y;
        mesh.name = "ring";
        pro5.engine.addObject( mesh );
        
        var scale = new TWEEN.Tween(mesh.scale)
        .to({x: 1.2, y: 1.2, z: 1.2}, 700)
        .repeat(Infinity)
        .yoyo(true);
        
        var opacity = new TWEEN.Tween(mesh.material)
        .to({opacity: 0.8}, 700)
        .repeat(Infinity)
        .yoyo(true)
        .start();
        
        scale.start();
        
        
    }

    rotateShip = function(rotation){
        ship.mesh.rotation.z += rotation;
        a.rotateAround({x:0, y:0}, rotation);
    }

    alignShip = function alignShip(){
        if(!keyboard.pressed("left") && !keyboard.pressed("right") && (keyboard.pressed("up") || keyboard.pressed("down"))){
            var dr = (Math.round(ship.mesh.rotation.z/(Math.PI))*Math.PI ) - ship.mesh.rotation.z;
            rotateShip(dr*alignrotspeed);
        }
    }


    //Update Spaceship
    var keyboard = new THREEx.KeyboardState();
    var a = new THREE.Vector2(0, 0);
    var maxspeed = 0.7;
    var backspeed = 0.3;
    var rotspeed = 0.1;
    var alignrotspeed = 0.07;
    var acc = 0.03;
    var damping = 0.9;
    var cameraY,
        boundry;
    var moving = false;
    var flameflag = true;

    reset = function reset(){
        a = new THREE.Vector2(0, 0);
    }

    updateShip = function updateShip(cameraY, boundry){
        if  (markerMoving){
            moveMarker();
        }

        if(keyboard.pressed("left")) {
            rotateShip(rotspeed);
        }
        if(keyboard.pressed("right")) {
            rotateShip(-rotspeed);
        }

        if(keyboard.pressed("up")){
            if(a.length() < maxspeed){
                a.y += acc * Math.cos(ship.mesh.rotation.z);
                a.x += -acc * Math.sin(ship.mesh.rotation.z);
                updateFlame(true);
                moving = true;
            }
        } else if(keyboard.pressed("down")) {
            if(a.length() < backspeed){
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

        ship.mesh.position.y += a.y;

        // checks boundries
        if(ship.mesh.position.x + a.x <= boundry - 3.5 && ship.mesh.position.x + a.x >= -boundry + 3.5)
            ship.mesh.position.x += a.x;
        else{
            if(ship.mesh.position.x > boundry - 3.5)
                ship.mesh.position.x = boundry - 3.5;
            else if(ship.mesh.position.x < - boundry + 3.5)
                ship.mesh.position.x = - boundry + 3.5;
        }




        if(ship.mesh.position.y >= cameraY + 10 ){

            alignShip();

            if(moving)
                pro5.engine.cameraZoom(true);
            else
                pro5.engine.cameraZoom(false);

            return ship.mesh.position.y - 10;
        }
        else if(ship.mesh.position.y <= cameraY - 10){

            alignShip();

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
        reposition:reposition,
        reset: reset
    }

})();
