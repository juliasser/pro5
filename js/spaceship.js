"use strict"

var pro5 = pro5 || {};

pro5.spaceship = (function(){

    var Spaceship = function(){
        var spaceshipGeom = new THREE.CylinderGeometry(1,1,4,8);
        var spaceshipMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff });
        this.mesh = new THREE.Mesh( spaceshipGeom, spaceshipMaterial );
    }

    var createShip, updateShip, ship;

    createShip = function createShip(){
        ship = new Spaceship();
        ship.mesh.position.y = 50;
        pro5.engine.addObject(ship.mesh);
    }

    var keyboard = new THREEx.KeyboardState(); 
    var a = new THREE.Vector2(0, 0);
    var maxspeed = 1;
    var rotspeed = 0.1;
    var acc = 0.03;
    var damping = 0.9;

    updateShip = function updateShip(){
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
        } else {
            a.y *= damping;
            a.x *= damping;
        }

        if(ship){
            ship.mesh.position.y += a.y; 
            ship.mesh.position.x += a.x; 
        }
    }

    return{
        createShip:createShip,
        updateShip:updateShip
    }

})();