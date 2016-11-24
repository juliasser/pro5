"use strict"

var pro5 = pro5 || {};

pro5.engine = (function(){
    var fgscene, bgscene, camera, fgrenderer, bgrenderer,

        renderqueue = [],

		loader,
		loadObject,
		loadManager,
        addObject,
		addToBackground,
		addToWorld,
        addToRenderQueue,
        onWindowResize,
        render,
        init,
        calculateBoundry,
        boundryWidth,
        cameraZoom;

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

	addToBackground = function addToBackground(object){
        bgscene.add(object);
    }

    addToRenderQueue = function addToRenderQueue(method){
        // TODO
        renderqueue.push(method);
    }

    // Eventhandlers
    onWindowResize = function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        fgrenderer.setSize( window.innerWidth, window.innerHeight );
		bgrenderer.setSize( window.innerWidth, window.innerHeight );
        calculateBoundry();
    }

    render = function render(){
        // TODO
        pro5.spaceship.checkForCollision();

        // TODO check for already filled up planet object
        if(pro5.world.planets.neptune != undefined){

            for(var object in pro5.world.planets){
                var planet = pro5.world.planets[object];
                planet.mesh.rotateY(0.01);
            }
        }

        camera.position.y = pro5.spaceship.updateShip(camera.position.y, boundryWidth);
		pro5.spaceship.calculateSunDistance();

        requestAnimationFrame( render );
        fgrenderer.render(fgscene, camera);
		bgrenderer.render(bgscene, camera);
        renderqueue.forEach(function(method){
            method();
        });
    }

    calculateBoundry = function calculateBoundry(){
        var vFOV = camera.fov * Math.PI / 180;        // convert vertical fov to radians
        var height = 2 * Math.tan( vFOV / 2 ) * camera.position.z; // visible height
        boundryWidth = (height *  window.innerWidth / window.innerHeight) / 2; // visible width
    }

    var zoomout = false;
    var maxzoom = 120;
    var minzoom = 100;

    cameraZoom = function cameraZoom(zoomout){
        console.log(zoomout +  " " + camera.position.z);
        if(zoomout && camera.position.z < maxzoom){
            camera.position.z += 0.3;
            calculateBoundry();
        } else if (!zoomout && camera.position.z > minzoom){

           camera.position.z -= 0.5;
            calculateBoundry();
        }

    }

    init = function init(){
        // scene, camera, renderer
        fgscene = new THREE.Scene();
		bgscene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 0.1, 1000 );
        camera.position.z = 100;
        camera.position.y = 50;

        var bgcanvas = document.getElementById("canvas--back");
        var fgcanvas = document.getElementById("canvas--front");



		fgrenderer = new THREE.WebGLRenderer({ canvas: fgcanvas, antialias: true,
                                                      alpha: true });
        fgrenderer.setSize( window.innerWidth, window.innerHeight );
		fgrenderer.setClearColor( 0x000000, 0 );
        document.getElementById("canvas--wrapper-front").prepend( fgrenderer.domElement );

		var testdiv = document.createElement("div");
		testdiv.id = "canvas--inbetween";
        document.getElementById("canvas--wrapper-back").after(testdiv);

		bgrenderer = new THREE.WebGLRenderer({canvas: bgcanvas,  antialias: true });
        bgrenderer.setSize( window.innerWidth, window.innerHeight );
        bgrenderer.setClearColor(0x121517);
        document.getElementById("canvas--wrapper-back").prepend(bgrenderer.domElement );

        window.addEventListener( 'resize', onWindowResize, false );

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
        cameraZoom:cameraZoom
    }
})();
