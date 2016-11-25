"use strict"

var pro5 = pro5 || {};

pro5.engine = (function(){
    var fgscene, bgscene, camera, fgrenderer, bgrenderer,

        renderqueue = [],

        loader,
        loadObject,
        loadManager,
        addObject,
        removeObjectByName,
        addToBackground,
        addToWorld,
        addToRenderQueue,
        onWindowResize,
        render,
        init,
        calculateBoundry,
        boundryWidth,
        cameraZoom,
        startCamera,
        convertToScreenPosition,
        exitDetail,
        enterDetail,
        resetCameraZoom,
        getCamera,
        hasObject,

		inDetail = false;

    loadObject = function loadObject(path, callback){
        loader.load(path, function(g, m){
            loadManager(g, m, callback);
        });
    }

    loadManager = function(geometry, materials, callback){
        var mesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials ) );
        fgscene.add( mesh );
        callback(mesh);
    }

    addObject = function addObject(object){
        fgscene.add(object);
    }

    var name;

    removeObjectByName = function removeObjectByName(name){
        var toremove = fgscene.getObjectByName(name);
        console.log(toremove);
        fgscene.remove(toremove);
    }

    addToBackground = function addToBackground(object){
        bgscene.add(object);
    }

    addToRenderQueue = function addToRenderQueue(method){
        // TODO
        renderqueue.push(method);
    }

    hasObject = function hasObject(name){
        return fgscene.getObjectByName(name);
    }

    // Eventhandlers
    onWindowResize = function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        fgrenderer.setSize( window.innerWidth, window.innerHeight );
        bgrenderer.setSize( window.innerWidth, window.innerHeight );
        calculateBoundry();
    }

    getCamera = function getCamera(){
        return camera;
    }

    var started = false;
    var collision = false;
    var planet;

    enterDetail = function enterDetail(planet){

        started = false;
        collision = true;
		inDetail = true;
		resetCameraZoom();
		var spaceship = pro5.world.getSpaceship();

		setTimeout(function(){
			THREE.SceneUtils.attach(spaceship.mesh, fgscene, planet);
		}, 100);


        if(!planet.geometry.boundingBox){
            planet.geometry.computeBoundingBox();
        }
        var maxsize = Math.max(planet.geometry.boundingBox.max.x, planet.geometry.boundingBox.max.y, planet.geometry.boundingBox.max.z);

        var cameratween = new TWEEN.Tween(camera.position)
        .to({
			x: planet.position.x + planet.scale.x * maxsize * camera.aspect,
			y: planet.position.y,
			z: (planet.scale.x * maxsize*2) / Math.tan(THREE.Math.degToRad(camera.getEffectiveFOV() / 2))
		}, 2500)
        .start();

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


            document.addEventListener('keydown', exitDetail, false);

        }, 3000);

    }

    var minzoom = 100;

    exitDetail = function exitDetail(event){
        if(event.which == 27){
			inDetail = false;
			var spaceship = pro5.world.getSpaceship();
			console.log(spaceship);
			THREE.SceneUtils.detach(spaceship.mesh, spaceship.mesh.parent, fgscene);

			var body = document.querySelector('body');
			body.removeAttribute('id');
			body.setAttribute("id", "travel");
			body.removeAttribute("class");
			body.setAttribute("class", "intro");

            document.querySelector('#planet-detail--txt').removeChild(document.querySelector('#planet-detail--textcontent'));
            document.querySelector('#infowrapper').style.display = 'none';

            var cameratween = new TWEEN.Tween(camera.position)
            .to({ x: 0, y: camera.position.y, z: minzoom}, 2500)
            .start();

            setTimeout(function() {
                started = true;
                collision = false;
                document.removeEventListener('keydown', exitDetail, false);
            }, 3000);
        }
    }

    startCamera = function startCamera(event){

        if(event.which == 32){
            document.removeEventListener( 'keydown', startCamera, false);

            // remove startscreen
            var startnode = document.querySelector('#content--start');
            var body = document.querySelector('body');
            startnode.className += "content--start-fadeout";
            // body.removeChild(startnode);

            // start camera animation
            var cameratween = new TWEEN.Tween(camera.position)
            .to({ x: camera.position.x, y: 80, z: camera.position.z}, 3500)
            .delay(1750)
            .start();
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

            setTimeout(function() {
                started = true;
            }, 5500);
        }
    }

    calculateBoundry = function calculateBoundry(){
        var vFOV = camera.fov * Math.PI / 180;        // convert vertical fov to radians
        var height = 2 * Math.tan( vFOV / 2 ) * camera.position.z; // visible height
        boundryWidth = (height *  window.innerWidth / window.innerHeight) / 2; // visible width
    }

    var zoomout = false;
    var maxzoom = 120;

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

    render = function render(){

        if(started && !inDetail){
            pro5.spaceship.checkForCollision();


            var newposition = pro5.spaceship.updateShip(camera.position.y, boundryWidth);

            if(newposition < 80)
                camera.position.y = 80;
            else
                camera.position.y = newposition;

            pro5.spaceship.calculateSunDistance();

            pro5.spaceship.calculateSunDistance();

            if(!collision)
                pro5.spaceship.createRings();
        }

        // TODO check for already filled up planet object
        if(pro5.world.planets.neptune != undefined){
            for(var object in pro5.world.planets){
                var planet = pro5.world.planets[object];
                planet.mesh.rotateY(0.01);
            }
        }

        TWEEN.update();

        requestAnimationFrame( render );
        fgrenderer.render(fgscene, camera);
        bgrenderer.render(bgscene, camera);
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

    init = function init(){
        // scene, camera, renderer
        fgscene = new THREE.Scene();
        bgscene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 0.1, 1000 );
        camera.position.z = 100;
        camera.position.y = -170;
        //camera.rotation.x = -1;

        var bgcanvas = document.getElementById("canvas--back");
        var fgcanvas = document.getElementById("canvas--front");

        bgrenderer = new THREE.WebGLRenderer({canvas: bgcanvas,  antialias: true });
        bgrenderer.setSize( window.innerWidth, window.innerHeight );
        bgrenderer.setClearColor(0x121517);
        document.getElementById("canvas--wrapper-back").appendChild(bgrenderer.domElement );

		var testdiv = document.createElement("div");
        testdiv.id = "testdiv";
        document.getElementById("canvas--wrapper-global").insertBefore(testdiv, document.getElementById("canvas--wrapper-front"));

		fgrenderer = new THREE.WebGLRenderer({ canvas: fgcanvas, antialias: true, alpha: true });
        fgrenderer.setSize( window.innerWidth, window.innerHeight );
        fgrenderer.setClearColor( 0x000000, 0 );
        document.getElementById("canvas--wrapper-front").appendChild( fgrenderer.domElement );

        window.addEventListener( 'resize', onWindowResize, false );
        document.addEventListener( 'keydown', startCamera, false);

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
        addToBackground: addToBackground,
        addToWorld: addToWorld,
        addToRenderQueue: addToRenderQueue,
        camera:camera,
        cameraZoom:cameraZoom,
        enterDetail:enterDetail,
        fgrenderer: fgrenderer,
        convertToScreenPosition:convertToScreenPosition,
        removeObjectByName:removeObjectByName,
        getCamera:getCamera,
        hasObject:hasObject
    }
})();
