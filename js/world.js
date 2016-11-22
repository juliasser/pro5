"use strict"

var pro5 = pro5 || {};

pro5.world = (function(){

	var init;

	init = function init(){
		var sunGeometry = new THREE.IcosahedronGeometry( 30, 2);
		var sunMaterial = new THREE.MeshBasicMaterial( { color: 0xFFA500 } );
		var sun = new THREE.Mesh( sunGeometry, sunMaterial );
        sun.name = "sun";
		pro5.engine.addObject(sun);
        
        pro5.spaceship.createShip();

	}

	return{
		init:init
	}

})();
