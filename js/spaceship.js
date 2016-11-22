"use strict"

var pro5 = pro5 || {};

pro5.spaceship = (function(){

    var Spaceship = function(geometry, materials){
		
		this.mesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials ) );
		this.mesh.scale.x = this.mesh.scale.y = this.mesh.scale.z = 10;
		
        //var spaceshipGeom = new THREE.CylinderGeometry(1,1,4,8);
        //var spaceshipMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff });
        //this.mesh = new THREE.Mesh( spaceshipGeom, spaceshipMaterial );
    }

    var manager, createShip, updateShip, ship;
	
	manager = function manager(geometry, materials){
		ship = new Spaceship(geometry, materials);
        ship.mesh.position.y = 50;
        pro5.engine.addObject(ship.mesh);
	}

    createShip = function createShip(){
		var loader = new THREE.JSONLoader();
		loader.load( "objects/rocket/rocket.json", manager );
    }

    var keyboard = new THREEx.KeyboardState(); 
    var a = new THREE.Vector2(0, 0);
    var maxspeed = 1;
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
            if(ship.mesh.position.x + a.x <= boundry - 4 && ship.mesh.position.x + a.x >= -boundry + 4)
                ship.mesh.position.x += a.x;
            

            // 
            if(cameraY == undefined)
                return 50;

            else{
                if(ship.mesh.position.y >= cameraY + 30 )
                    return ship.mesh.position.y - 30;
                else if(ship.mesh.position.y <= cameraY - 30)
                    return ship.mesh.position.y + 30; 
            } 

            return cameraY;

        }


    }

    return{
        createShip:createShip,
        updateShip:updateShip,
        ship:ship
    }

})();