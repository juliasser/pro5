"use strict"

var pro5 = pro5 || {};

pro5.engine = (function(){
	var fgscene, bgscene, camera, fgrenderer, bgrenderer,
        renderqueue = [],
        loader,
        boundryWidth,
	    zoomout = false,
	    minzoom = 100,
	    maxzoom = 120,
		planetRotSpeed = 0.01,

		updateShip = false,
	    collision = true,
		inDetail = false,
        sunCollision = false,

		// ### functions ###

        // marker
        markerstorage = {},
        appendMarker,
        css3dscene,
        marker,
        css3drenderer,

		// loading
		loadObject,
        loadManager,

		// add/remove/check objects
        addObject,
		removeObject,
        addToBackground,
        removeObjectByName,
        hasObject,

		// event handlers
        onWindowResize,
		enterDetail,
        exitDetail,
        nextPage,

		// getters/setters
        getCamera,
		getScene,
        setSunCollision,

		// camera
        cameraZoom,
        resetCameraZoom,
        cameraShake,

        // stats
        stats,
		getInfo,

		// etc
        calculateBoundry,
        convertToScreenPosition,
        playIntroSequence,

		// render, init
        render,
        addToRenderQueue,
        init;

    /*
    *   ### Marker ###
     */
    appendMarker = function appendMarker($marker) {
        var markerDiv = document.getElementById('travel--marker');

        if (markerDiv.firstChild) {
            markerDiv.removeChild(markerDiv.firstChild);
        }

        var link = document.querySelector('#content--travel-marker');
        var div = ('#travel-marker--').concat($marker);
        var content = link.import.querySelector(div);
        markerDiv.appendChild(document.importNode(content, true));
    };

	/*
	*	### Loading ###
	*/
    loadObject = function loadObject(path, multimaterial, callback){
        loader.load(path, function(g, m){
            loadManager(g, m, multimaterial, callback);
        });
    }

    loadManager = function(geometry, materials, multimaterial, callback){
		var mesh;
		// if(multimaterial){
			mesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials ) );
			mesh.geometry.sortFacesByMaterialIndex();
		// }else{
		// 	mesh = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial({vertexColors: THREE.VertexColors}));
		// }
        fgscene.add( mesh );
        callback(mesh);
    }

	/*
	*	### Add/Remove/Check Objects ###
	*/
    addObject = function addObject(object){
        fgscene.add(object);
    }

    addToBackground = function addToBackground(object){
        bgscene.add(object);
    }

	removeObject = function removeObject(object){
		fgscene.remove(object);
	}

    removeObjectByName = function removeObjectByName(name){
        var toremove = fgscene.getObjectByName(name);
        //console.log(toremove);
        fgscene.remove(toremove);
    }

    hasObject = function hasObject(name){
        return fgscene.getObjectByName(name);
    }

	/*
	*	### Event Handlers ###
	*/
    onWindowResize = function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        fgrenderer.setSize( window.innerWidth, window.innerHeight );
        bgrenderer.setSize( window.innerWidth, window.innerHeight );
        css3drenderer.setSize(window.innerWidth, window.innerHeight);
        calculateBoundry();
    }

    enterDetail = function enterDetail(planet){

        updateShip = false;  	// switch off control for ship
        collision = false; 		// switch off collision detection
		inDetail = true;

        removeObjectByName("ring" + planet.name);
        //removeObjectByName("ring" + planet.name);

		var spaceship = pro5.world.getSpaceship();
		setTimeout(function(){
			pro5.world.planets[planet.name].addToOrbit(spaceship.mesh, 5, 0.02);
			pro5.spaceship.rotateToOrbit();
			//THREE.SceneUtils.attach(spaceship.mesh, fgscene, planet);
		}, 100); // so position of spaceship is correctly calculated (bc at least once rendered?)

        if(!planet.geometry.boundingBox){
            planet.geometry.computeBoundingBox();
        }
        var maxsize = Math.max(planet.geometry.boundingBox.max.x, planet.geometry.boundingBox.max.y, planet.geometry.boundingBox.max.z);

        var cameratween = new TWEEN.Tween(camera.position)
        .to({
			x: planet.position.x + planet.scale.x * maxsize * camera.aspect,
			y: planet.position.y,
			z: (planet.scale.x * maxsize*2) / Math.tan(THREE.Math.degToRad(camera.getEffectiveFOV() / 2))
		}, 1500)
		.easing(TWEEN.Easing.Quadratic.InOut)
        .start();

		// just an idea...
		/*var planettween = new TWEEN.Tween(planet.rotation)
		.to({
			x: 2*Math.PI
		}, 1500)
		.easing(TWEEN.Easing.Quadratic.InOut)
        .start();*/

        setTimeout(function() {

            var body = document.querySelector('body');
            body.removeAttribute('id');
            body.setAttribute("id", "planet-detail");
            body.removeAttribute("class");
            body.setAttribute("class", planet.name);

            document.querySelector('#infowrapper').style.display = "block";

            var link = document.getElementById('content--planets-'+planet.name+'-link');//document.querySelector('#content--planets-'+planet.name+'-link');
            var newnode = link.import.querySelector('#planet-detail--textcontent');
            var existingnode = document.querySelector('#planet-detail--btns');
            document.getElementById('planet-detail--txt').insertBefore(newnode.cloneNode(true), existingnode);

            document.addEventListener('keydown', nextPage, false);
            document.addEventListener('keydown', exitDetail, false);

        }, 2000);

    }

    nextPage = function nextPage(event){
        if(event.which == 39){
            var activePage = $('#planet-detail--textcontent .active');
            var nextPage = activePage.next();
            
            if(nextPage.length > 0){
                activePage.animate(
                    {opacity: 0},
                    1000);
                setTimeout(function(){ 
                    activePage.removeClass('active');
                    activePage.addClass('hidden');
                    nextPage[0].style.opacity = "0";
                    nextPage.removeClass('hidden');                    
                    nextPage.addClass('active');
                    nextPage.animate(
                        {opacity: 1},
                        2000);
                }, 1005);
            }            
        } else if(event.which == 37){
            var activePage = $('#planet-detail--textcontent .active');
            var prevPage = activePage.prev();
            
            if(prevPage.length > 0){
                activePage.animate(
                    {opacity: 0},
                    1000);
                setTimeout(function(){ 
                    activePage.removeClass('active');
                    activePage.addClass('hidden');
                    prevPage[0].style.opacity = "0";
                    prevPage.removeClass('hidden');                    
                    prevPage.addClass('active');
                    prevPage.animate(
                        {opacity: 1},
                        2000);
                }, 1005);
            } 
        }
    }
    
    exitDetail = function exitDetail(event){
		// if esc key was pressed
        if(event.which == 27){
			var oncomplete = function(){
				pro5.world.planets[planet.name].removeFromOrbit(spaceship.mesh);
				// reset spaceship
				spaceship.mesh.rotation.x = spaceship.mesh.rotation.y = 0;
				spaceship.mesh.scale.set(3,3,3);
				spaceship.mesh.position.z = 0;

				var direction = new THREE.Vector3(0,2,0).applyQuaternion(spaceship.mesh.quaternion);

				pro5.spaceship.setVector(direction.x, direction.y);

				// give spaceship away-from-planet-boost
				// pro5.spaceship.setVector(
				// 	(spaceship.mesh.position.x-planet.position.x)/planet.scale.x,
				// 	(spaceship.mesh.position.y - planet.position.y)/planet.scale.x);

				var cameratween = new TWEEN.Tween(camera.position)
	            .to({ x: 0, y: spaceship.mesh.position.y, z: minzoom}, 1500)
				.easing(TWEEN.Easing.Quadratic.InOut)
	            .start()
				.onComplete(function(){
					collision = true;
				});

				var body = document.querySelector('body');
				body.removeAttribute('id');
				body.setAttribute("id", "travel");
				body.removeAttribute("class");
				body.setAttribute("class", "intro");

	            document.querySelector('#planet-detail--txt').removeChild(document.querySelector('#planet-detail--textcontent'));
	            document.querySelector('#infowrapper').style.display = 'none';

				updateShip = true;
				inDetail = false;
                document.removeEventListener('keydown', nextPage, false);
				document.removeEventListener('keydown', exitDetail, false);
			}

			var spaceship = pro5.world.getSpaceship();
			var pivot = spaceship.mesh.parent;
			var planet = spaceship.mesh.parent.parent;

			var rotation = spaceship.mesh.getWorldRotation().z;
			rotation -= Math.PI/2;
			if(rotation > -0.2 && rotation < 0.2){
				console.log("noboost");
				oncomplete();
			}else{
				console.log("boost!!");
				pro5.world.planets[planet.name].satellites[0].speed = planetRotSpeed;
				var torotate = rotation < 0 ? - rotation: 2* Math.PI - rotation;

				rotation = {};
				rotation.y = 0;
				rotation.prev = 0;
				var duration = torotate*200;
				var slingshot = new TWEEN.Tween(rotation)
				.to({y: torotate-0.3}, torotate*200) // -0.3 to counter planet rotation during animation
				.easing(TWEEN.Easing.Quadratic.In)
				.start()
				.onUpdate(function(){
					pivot.rotateY(rotation.y-rotation.prev);
					rotation.prev = rotation.y;
				})
				.onComplete(function(){
					oncomplete();
				});
			}
        }
    }

	/*
	*	### Getters/Setters ###
	*/
    getCamera = function getCamera(){
        return camera;
    }

	getScene = function getScene(){
		return fgscene;
	}

	setSunCollision = function setSunCollision(value){
        sunCollision = value;
    }

	/*
	*	### Camera ###
	*/
    cameraZoom = function cameraZoom(zoomout){
        if(zoomout && camera.position.z < maxzoom){
            camera.position.z += 0.3;
            calculateBoundry();
        } else if (!zoomout && camera.position.z > minzoom){

            camera.position.z -= 0.5;
            calculateBoundry();
        }

    }

    resetCameraZoom = function resetCameraZoom(){
        camera.position.z = minzoom;
    }

    cameraShake = function cameraShake(){
            var shake = new TWEEN.Tween(camera.position)
                .to({x: camera.position.x + Math.random() * 4 - 2, y: camera.position.y + Math.random() * 4 - 2}, 100)
                .repeat(6)
                .yoyo(true)
                .start();
    }

	/*
	*	### etc ###
	*/
    playIntroSequence = function playIntroSequence(event){

        if(event.which == 32){
            document.removeEventListener( 'keydown', playIntroSequence, false);

            // remove startscreen
            var startnode = document.querySelector('#content--start');
            var body = document.querySelector('body');
            startnode.className += "content--start-fadeout";
            // body.removeChild(startnode);

            // start camera animation
            var cameratween = new TWEEN.Tween(camera.position)
            .to({ x: camera.position.x, y: 80, z: camera.position.z}, 3500)
            .delay(1750)
			.easing(TWEEN.Easing.Quadratic.InOut)
            .start()
			.onComplete(function(){
				updateShip = true;
			});

			if(DEBUG){
				cameratween.stop();
				camera.position.y = 80;
				updateShip = true;
			}
            //document.removeEventListener( 'keydown', function(){});

            // import header
            var link = document.querySelector('#content--travel-topbar-link');
            var newnode = link.import.querySelector('#content--travel-top-bar');
            var existingnode = document.querySelector('script');
            body.insertBefore(newnode, existingnode[0]);

            // import minimap
            link = document.querySelector('#content--travel-minimap-link');
            newnode = link.import.querySelector('#content--minimap');
            existingnode = document.querySelector('script');
            body.insertBefore(newnode, existingnode[0]);

            // import infowrapper and hide
            var link = document.querySelector('#content--planets-global-link');
            var newnode = link.import.querySelector('#infowrapper');
            var existingnode = document.querySelector('script');
            document.querySelector('body').insertBefore(newnode, existingnode[0]);
            document.querySelector('#infowrapper').style.display = "none";
        }
    }

    calculateBoundry = function calculateBoundry(){
        var vFOV = camera.fov * Math.PI / 180;        // convert vertical fov to radians
        var height = 2 * Math.tan( vFOV / 2 ) * camera.position.z; // visible height
        boundryWidth = (height *  window.innerWidth / window.innerHeight) / 2; // visible width
    }

    convertToScreenPosition = function convertToScreenPosition(obj) {
        var screenVector = new THREE.Vector3();
        obj.localToWorld( screenVector );

        screenVector.project( camera );

        var posx = Math.round(( screenVector.x + 1 ) * fgrenderer.domElement.offsetWidth / 2 );
        var posy = Math.round(( 1 - screenVector.y ) * fgrenderer.domElement.offsetHeight / 2 );

        return{
            x: posx,
            y: posy
        }
    }

	getInfo = function getInfo(){
		return fgrenderer.info;
	}

	/*
	*	render, init
	*/
    render = function render(){
        if(DEBUG) { stats.begin(); }

		//console.log(getInfo().memory.geometries);

        if(updateShip && !inDetail && !sunCollision){

			if(collision){
				pro5.spaceship.checkForCollision();
			}

            var newposition = pro5.spaceship.updateShip(camera.position.y, boundryWidth);

			// camera at bottom
            if(newposition < 80)
                camera.position.y = 80;
            else
                camera.position.y = newposition;

            if(!inDetail){
				var ship = pro5.world.getSpaceship();
				for(var planet in pro5.world.planets){
                	pro5.world.planets[planet].createRings(ship.mesh.position.y);
				}
			}
        }

		// Rotate Planets
        // TODO check for already filled up planet object
        if(pro5.world.planets.neptune != undefined){
            for(var object in pro5.world.planets){
                var planet = pro5.world.planets[object];
                planet.mesh.rotateY(planetRotSpeed);
				for(var i = 0; i < planet.satellites.length; i++){
					// needed to prevent interference when slingshoting
					if(planet.satellites[i].speed != planetRotSpeed)
						planet.satellites[i].pivot.rotateY(planet.satellites[i].speed-planetRotSpeed);
				}
            }
        }

		// rotate stuff
		for(var i = 0; i < pro5.world.stuff.length; i++){
			pro5.world.stuff[i].update();
		}

        TWEEN.update();

        if(DEBUG) { stats.end(); }

        requestAnimationFrame( render );
        fgrenderer.render(fgscene, camera);
        bgrenderer.render(bgscene, camera);
        css3drenderer.render(css3dscene, camera);

        renderqueue.forEach(function(method){
            method();
        });

        /*camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 0.1, 1000 );
        camera.position.z = 100;
        camera.position.y = -170;
        //camera.rotation.x = -1;

        var bgcanvas = document.getElementById("canvas--back");
        var fgcanvas = document.getElementById("canvas--front");*/


    }

    addToRenderQueue = function addToRenderQueue(method){
        // TODO
        renderqueue.push(method);
    }

    init = function init(){
        // STATS
        if(DEBUG){
            stats = new Stats();
            document.body.appendChild( stats.dom );
        }
        // scene, camera, renderer
        fgscene = new THREE.Scene();
        bgscene = new THREE.Scene();
        css3dscene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 0.1, 1000 );
        camera.position.z = 100;
        camera.position.y = -170;
        //camera.rotation.x = -1;

        var bgcanvas = document.getElementById("canvas--back");
        var fgcanvas = document.getElementById("canvas--front");
        var css3ddiv = document.createElement( 'div' );
        css3ddiv.className = 'css3d';
        css3ddiv.setAttribute("id", "travel--marker")

        marker = new THREE.CSS3DObject( css3ddiv );

        marker.position.y=70; // position for first marker

        marker.scale.x = 0.06;
        marker.scale.y = 0.06;

        markerstorage[0] = marker;

        css3dscene.add(marker);

        css3drenderer = new THREE.CSS3DRenderer();
        css3drenderer.setSize(window.innerWidth, window.innerHeight);
        css3drenderer.domElement.style.position = 'absolute';
        css3drenderer.domElement.style.top = 0;

        document.getElementById("canvas--inbetween").appendChild(css3drenderer.domElement);

        bgrenderer = new THREE.WebGLRenderer({canvas: bgcanvas,  antialias: true });
		bgrenderer.setPixelRatio( window.devicePixelRatio || 1 );
        bgrenderer.setSize( window.innerWidth, window.innerHeight );
        bgrenderer.setClearColor(0x121517);
        document.getElementById("canvas--wrapper-back").appendChild(bgrenderer.domElement );

		var testdiv = document.createElement("div");
        testdiv.id = "testdiv";
        document.getElementById("canvas--wrapper-global").insertBefore(testdiv, document.getElementById("canvas--wrapper-front"));

		fgrenderer = new THREE.WebGLRenderer({ canvas: fgcanvas, antialias: true, alpha: true });
		fgrenderer.setPixelRatio( window.devicePixelRatio || 1);
        fgrenderer.setSize( window.innerWidth, window.innerHeight );
        fgrenderer.setClearColor( 0x000000, 0 );
        document.getElementById("canvas--wrapper-front").appendChild( fgrenderer.domElement );

        window.addEventListener( 'resize', onWindowResize, false );
        document.addEventListener( 'keydown', playIntroSequence, false);

        if(DEBUG){
            var axis = new THREE.AxisHelper(100);
            fgscene.add(axis);
        }

        loader = new THREE.JSONLoader();

        calculateBoundry();

        render();
    }

    return{
        init:init,
        loadObject: loadObject,
        addObject:addObject,
		removeObject:removeObject,
        addToBackground: addToBackground,
        addToRenderQueue: addToRenderQueue,
        camera:camera,
        cameraZoom:cameraZoom,
        cameraShake:cameraShake,
        enterDetail:enterDetail,
        getInfo: getInfo,
        convertToScreenPosition:convertToScreenPosition,
        removeObjectByName:removeObjectByName,
        getCamera:getCamera,
		getScene:getScene,
        hasObject:hasObject,
        appendMarker:appendMarker,
        markerstorage:markerstorage,
        setSunCollision:setSunCollision,
    }
})();
