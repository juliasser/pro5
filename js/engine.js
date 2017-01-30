"use strict"

var pro5 = pro5 || {};

pro5.engine = (function(){
    var fgscene, bgscene, camera, fgrenderer, bgrenderer,
        renderqueue = [],
        loader,
        clock,
        boundryWidth,
        zoomout = false,
        minzoom = 100,
        maxzoom = 120,
        planetRotSpeed = 0.6,

        updateShip = false,
        collision = true,
        inDetail = false,
        sunCollision = false,
		lastAjaxCall = 0,
		ajaxCallTime = 2000, // ajax call every 2 seconds

        // ### functions ###

        // marker
        markerstorage = {},
        appendMarker,
        css3dscene,
        marker,
        css3drenderer,
        changeNextDistanceOnDetail,
        changeNextDistanceOnDetailExit,
        changePositionOnDetail,

        // loading
        loadObject,
        loadManager,

        // add/remove/check objects
        addObject,
        addCSSObject,
        removeObject,
        addToBackground,
        removeObjectByName,
        hasObject,

        // event handlers
        onWindowResize,
        enterDetail,
        exitDetail,
        keypagination,
        nextPage,
        prevPage,
        portalToPlanet,

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
        var markerDiv = document.getElementsByClassName('travel--marker')[0];

        if (markerDiv.firstChild) {
            markerDiv.removeChild(markerDiv.firstChild);
        }

        var link = document.querySelector('#content--travel-marker');
        var div = ('#travel-marker--').concat($marker);
        var content = link.import.querySelector(div);
        markerDiv.appendChild(document.importNode(content, true));
    };

    changeNextDistanceOnDetail = function changeNextDistanceOnDetail() {
        $('#bar-top--distance-nextplanet').css('opacity', '0');
        setTimeout(function(){
            $('#bar-top--distance-nextplanet').contents().eq(0).hide();
            $('#bar-top--distance-nextplanet').contents().eq(1).replaceWith(" to leave press ");
            $('#bar-top--nextplanet-name').text("esc");
            $('#bar-top--distance-nextplanet').animate(
                {opacity: 1},
                2000);
        }, 1500);

    }
    changeNextDistanceOnDetailExit = function changeNextDistanceOnDetailExit() {
        $('#bar-top--distance-nextplanet').contents().eq(0).show();
        $('#bar-top--distance-nextplanet').contents().eq(1).replaceWith(" to ");
    }

    changePositionOnDetail = function changePositionOnDetail(planetName) {
        var planets = pro5.world.planetInfo.root;

        for(var i = 0; i < planets.length; i++){
            if(planets[i].name === planetName){
                var symbol = planets[i].symbol;
                var position = symbol.concat(" " + planets[i].name);
                $('#bar-top--position h1').css('opacity','0');
            }
        }

        setTimeout(function(){
            $('#bar-top--position h1').html(position);
            $('#travel-detail--bar-top h1').animate(
                {opacity: 1},
                2000);
        }, 1500);
    }

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

    addCSSObject = function addCSSObject(object){
        css3dscene.add(object);
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

        $('.css3d.travel--marker').hide();
        changeNextDistanceOnDetail();
        changePositionOnDetail(planet.name);
		pro5.world.showRing(false);

        var spaceship = pro5.world.getSpaceship();
        setTimeout(function(){
            pro5.world.planets[planet.name].addToOrbit(spaceship.mesh, 5, 1.2);
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

        var visitedPlanets = $('.visited');

        console.log(visitedPlanets);

        if(visitedPlanets.length > 0){
            for(var i = 0; i < visitedPlanets.length; i++){
                visitedPlanets[i].removeEventListener('click', portalToPlanet, false);
            }
        }
        // just an idea...
        /*var planettween = new TWEEN.Tween(planet.rotation)
		.to({
			x: 2*Math.PI
		}, 1500)
		.easing(TWEEN.Easing.Quadratic.InOut)
        .start();*/

        setTimeout(function() {

            var circle = $('.circle--' + planet.name);
            var width = circle.width();

            console.log(width);

            if(!circle.hasClass('visited')){
                console.log('visited');
                circle.animate(
                    {height: 0,
                     width: 0},
                    200);

                setTimeout(function(){
                    circle.addClass('visited');
                    circle.animate(
                        {height: width,
                         width: width},
                        200);
                }, 205);
                //circle.css('background-color', '#96281B');
            }

            var body = document.querySelector('body');
            body.removeAttribute('id');
            body.setAttribute("id", "planet-detail");
            body.removeAttribute("class");
            body.setAttribute("class", planet.name);

            document.querySelector('#infowrapper').style.display = "block";
            document.querySelector('#infowrapper').style.opacity = "0";

            var link = document.getElementById('content--planets-'+planet.name+'-link');//document.querySelector('#content--planets-'+planet.name+'-link');
            var newnode = link.import.querySelector('#planet-detail--textcontent');
            var existingnode = document.querySelector('#planet-detail--btns');
            document.getElementById('planet-detail--txt').insertBefore(newnode.cloneNode(true), existingnode);

            $('#infowrapper').animate(
                {opacity: 1},
                2000);

            setTimeout(function(){
                document.addEventListener('keydown', keypagination, false);
                document.addEventListener('keydown', exitDetail, false);
                document.querySelector('.planet-detail--key-right-s').addEventListener('click', nextPage, false);
            }, 2005);
        }, 1505);

    }


    nextPage = function nextPage(){
        var activePage = $('#planet-detail--textcontent .active');
        var nextPage = activePage.next();

        if(nextPage.length > 0){
            activePage.animate(
                {opacity: 0},
                750);
            setTimeout(function(){
                activePage.removeClass('active');
                activePage.addClass('hidden');
                nextPage[0].style.opacity = "0";
                nextPage.removeClass('hidden');
                nextPage.addClass('active');
                nextPage.animate(
                    {opacity: 1},
                    1000);
            }, 800);
        }
    }

    prevPage = function prevPage(){
        var activePage = $('#planet-detail--textcontent .active');
        var prevPage = activePage.prev();

        if(prevPage.length > 0){
            activePage.animate(
                {opacity: 0},
                750);
            setTimeout(function(){
                activePage.removeClass('active');
                activePage.addClass('hidden');
                prevPage[0].style.opacity = "0";
                prevPage.removeClass('hidden');
                prevPage.addClass('active');
                prevPage.animate(
                    {opacity: 1},
                    1000);
            }, 800);
        }
    }

    keypagination = function keypagination(event){
        //console.log(event.which);
        if(event.which == 39){
            nextPage();
        } else if(event.which == 37){
            prevPage();
        }
    }
    
    portalToPlanet = function portalToPlanet(event){
        
        var classes = $(this).attr("class").split(/\s+/);
        var planetname;
        
        for(var c in classes){
            if(classes[c].indexOf('circle') == 0){
                planetname = classes[c].split('--');
            }
        }
        
        var planet = hasObject(planetname[1]);
    }

    exitDetail = function exitDetail(event){
        // if esc key was pressed
        if(event.which == 27){
            $('.css3d.travel--marker').show();
			var oncomplete = function(){
                changeNextDistanceOnDetailExit();
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
                pro5.world.showRing(true);
                document.removeEventListener('keydown', nextPage, false);
                document.removeEventListener('keydown', exitDetail, false);

                var visitedPlanets = $('.visited');

                if(visitedPlanets.length > 0){
                    for(var i = 0; i < visitedPlanets.length; i++){
                        visitedPlanets[i].addEventListener('click', portalToPlanet, false);
                    }
                }
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
    render = function render(time){
        var delta = clock.getDelta();
        if(DEBUG) { stats.begin(); }

        //console.log(getInfo().memory.geometries);

        if(updateShip && !inDetail && !sunCollision){

            if(collision){
                pro5.spaceship.checkForCollision();
            }

            var newposition = pro5.spaceship.updateShip(camera.position.y, boundryWidth, delta);

            // camera at bottom
            if(newposition < 80)
                camera.position.y = 80;
            else
                camera.position.y = newposition;
        }

        // Rotate Planets
        // TODO check for already filled up planet object
        if(pro5.world.planets.neptune != undefined){
            for(var object in pro5.world.planets){
                var planet = pro5.world.planets[object];

                planet.mesh.rotateY(planetRotSpeed*delta);
                for(var i = 0; i < planet.satellites.length; i++){
                    // needed to prevent interference when slingshoting
                    if(planet.satellites[i].speed != planetRotSpeed)
                        planet.satellites[i].pivot.rotateY((planet.satellites[i].speed-planetRotSpeed)*delta);
                }
            }
        }

        // rotate stuff
        for(var i = 0; i < pro5.world.stuff.length; i++){
            pro5.world.stuff[i].update();
        }

        TWEEN.update(time);

        if(DEBUG) { stats.end(); }

        fgrenderer.render(fgscene, camera);
        bgrenderer.render(bgscene, camera);
        css3drenderer.render(css3dscene, camera);

        renderqueue.forEach(function(method){
            method();
        });

	    if(!lastAjaxCall || time - lastAjaxCall >= ajaxCallTime) {
	        lastAjaxCall = time;
			var distance = pro5.spaceship.getDistance();
			if(distance > 0){
				$.ajax({
				  method: "POST",
				  url: "ajax.php",
				  data: { distance: distance}
				}).done(function( msg ) {
					if(msg !== '1'){
						console.error("Average distance could not be saved to database!", msg);
					}
				});
			}
	    }

		requestAnimationFrame( render );
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
		$(css3ddiv).addClass("travel--marker");
        //css3ddiv.setAttribute("id", "travel--marker")

        marker = new THREE.CSS3DObject( css3ddiv );

        marker.position.y=70; // position for first marker

        marker.scale.x = 0.05;
        marker.scale.y = 0.05;

        markerstorage[0] = marker;

        addCSSObject(marker);

		$.ajax({
		  method: "GET",
		  url: "ajax.php"
		}).done(function( msg ) {
	        var avrdiv = document.createElement( 'div' );
			$(avrdiv).addClass("travel--marker");

			//TODO move to html file and import
			$(avrdiv).append('<div id="travel-marker--avr-distance"><span>--- The average of our users came this far, keep going! ---</span></div>');

	        var avrdistancemarker = new THREE.CSS3DObject( avrdiv );
			markerstorage[1] = avrdistancemarker;
			addCSSObject(avrdistancemarker);
            avrdistancemarker.position.y = msg;
			avrdistancemarker.scale.set(0.05, 0.05, 0.05);
			console.log("set avr marker to "+msg);
		});

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

		clock = new THREE.Clock();
		clock.start();
        requestAnimationFrame(render);
    }

    return{
        init:init,
        loadObject: loadObject,
        addObject:addObject,
        addCSSObject:addCSSObject,
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
