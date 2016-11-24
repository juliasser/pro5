"use strict"

var pro5 = pro5 || {};

pro5.spaceship = (function(){

    var Spaceship = function(mesh){

        this.mesh = mesh;
        this.mesh.name = "ship";
    }
    
    var createShip, updateShip, ship, checkForCollision, calculateSunDistance;

    createShip = function createShip(){
        pro5.engine.loadObject("objects/rocket/rocket.json", function(mesh){
            ship = new Spaceship(mesh);
            ship.mesh.position.y = 50;
            ship.mesh.scale.set(3, 3, 3);
        });
    }

    calculateSunDistance = function calculateSunDistance() {
        var elem = document.getElementById("bar-top--currentdistance-calc");

        if(ship != undefined){
            elem.innerHTML = (Math.round( (ship.mesh.position.y-pro5.world.radiusSun) * 1160000)).toLocaleString();
        }
    }
    
    //Collision
    var lockedright, lockedleft, lockedup, lockeddown, collision;

    lockeddown = lockedleft = lockedright = lockedup = collision = false;



    //Update Spaceship
    var keyboard = new THREEx.KeyboardState();
    var a = new THREE.Vector2(0, 0);
    var maxspeed = 0.7;
    //var boostmaxspeed = 10;
    var rotspeed = 0.1;
    var acc = 0.03;
    //var boostacc = 0.1;
    var damping = 0.9;
    //var boostdamping = 0.98;
    var cameraY,
        boundry;

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


                if(intersections.length > 0 && intersections[0].distance <= 20){
                    // handle collision...
                    
                    collision = true;

                    if(intersections[0].object.name != "sun"){
                        console.log(intersections[0].object.position.x);
                        
                        //pro5.engine.setCameraPos(intersections[0].object.position.x + 30, intersections[0].object.position.y, 0);
                        
                        //pro5.engine.camera.position.x = intersections[0].object.position.x - 30;
                        //pro5.engine.camera.position.y = intersections[0].object.position.y;
                    }


                    /*if(vertexIndex === 1 || vertexIndex === 2 || vertexIndex === 3)
                        lockedright = true;
                    else if(vertexIndex === 5 || vertexIndex === 6 || vertexIndex === 7)
                        lockedleft = true;*/
                    break;
                    ;
                } else {
                    collision = false;
                    lockedright = false;
                    lockedleft = false;
                }               
            }

            //console.log(collision);
        }
    }

    updateShip = function updateShip(cameraY, boundry){

        

        if(keyboard.pressed("left")) {
            ship.mesh.rotation.z += rotspeed;
            a.rotateAround({x:0, y:0}, rotspeed);
        }
        if(keyboard.pressed("right")) {
            ship.mesh.rotation.z -= rotspeed;
            a.rotateAround({x:0, y:0}, -rotspeed);
        }
        /*if(keyboard.pressed("up") && keyboard.pressed("space")) {
            if(a.length() < boostmaxspeed){
                a.y += boostacc * Math.cos(ship.mesh.rotation.z);
                a.x += -boostacc * Math.sin(ship.mesh.rotation.z);
            }
        } else*/ if(keyboard.pressed("up")){
            /*if(a.length() > maxspeed){
                a.y *= boostdamping;
                a.x *= boostdamping;
            } else*/ if(a.length() < maxspeed){
                a.y += acc * Math.cos(ship.mesh.rotation.z);
                a.x += -acc * Math.sin(ship.mesh.rotation.z);
            }
        } else if(keyboard.pressed("down")) {
            if(a.length() < maxspeed){
                a.y -= acc * Math.cos(ship.mesh.rotation.z);
                a.x -= -acc * Math.sin(ship.mesh.rotation.z);
            }
        } else {
            a.y *= damping;
            a.x *= damping;
        }

        if(ship){
            
            checkForCollision();
            
            ship.mesh.position.y += a.y;

            // checks boundries
            if(ship.mesh.position.x + a.x <= boundry - 3.5 && ship.mesh.position.x + a.x >= -boundry + 3.5)
                ship.mesh.position.x += a.x;

            if(cameraY == undefined)
                return 50;

            else{
                if(ship.mesh.position.y >= cameraY + 10 )
                    return ship.mesh.position.y - 10;
                else if(ship.mesh.position.y <= cameraY - 10)
                    return ship.mesh.position.y + 10;
            }

            return cameraY;

        }


    }

    return{
        createShip:createShip,
        updateShip:updateShip,
        checkForCollision:checkForCollision,
        calculateSunDistance:calculateSunDistance
    }

})();
