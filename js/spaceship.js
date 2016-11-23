"use strict"

var pro5 = pro5 || {};

pro5.spaceship = (function(){

    var Spaceship = function(mesh){

        this.mesh = mesh;
        this.mesh.name = "ship";
    }

    var createShip, updateShip, ship, checkForCollision;

    createShip = function createShip(){
        pro5.engine.loadObject("objects/rocket/rocket.json", function(mesh){
            ship = new Spaceship(mesh);
            ship.mesh.position.y = 50;
            ship.mesh.scale.set(3, 3, 3);
        });
    }

    //Collision
    var collidableObjects;

    checkForCollision = function checkForCollision(collidableObjects){

        if(collidableObjects.children != undefined && ship != undefined){

            for (var vertexIndex = 0; vertexIndex < ship.mesh.geometry.vertices.length; vertexIndex++)
            {   
                var raycaster = new THREE.Raycaster();
                var currentVertex = ship.mesh.geometry.vertices[vertexIndex].clone();
                var normalizedVertex = currentVertex.clone().normalize();
                raycaster.set(ship.mesh.position, normalizedVertex);

                var intersections = raycaster.intersectObjects(pro5.Planet.arrayPlanets);


                if(intersections.length > 0 && intersections[0].distance <= 5){
                    //console.log(intersections[0].object.name);
                }
            }
        }
    }

    //Update Spaceship
    var keyboard = new THREEx.KeyboardState();
    var a = new THREE.Vector2(0, 0);
    var maxspeed = 0.8;
    var rotspeed = 0.1;
    var acc = 0.03;
    var damping = 0.9;
    var cameraY,
        boundry;

    updateShip = function updateShip(cameraY, boundry){
        if(keyboard.pressed("left")) {
            ship.mesh.rotation.z += rotspeed;
            a.rotateAround({x:0, y:0}, rotspeed);
        }
        if(keyboard.pressed("right")) {
            ship.mesh.rotation.z -= rotspeed;
            a.rotateAround({x:0, y:0}, -rotspeed);
        }
        if(keyboard.pressed("up")) {
            if(a.length() < maxspeed){
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
            ship.mesh.position.y += a.y;

            // checks boundries
            if(ship.mesh.position.x + a.x <= boundry - 3.5 && ship.mesh.position.x + a.x >= -boundry + 3.5)
                ship.mesh.position.x += a.x;


            //
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
        checkForCollision:checkForCollision
    }

})();
