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
        boundryWidth;

	loadObject = function loadObject(path, callback){
		var mesh;
		loader.load(path, function(g, m){
			mesh = loadManager(g, m, callback);
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
        pro5.spaceship.checkForCollision(fgscene);

        camera.position.y = pro5.spaceship.updateShip(camera.position.y, boundryWidth);

        requestAnimationFrame( render );
        fgrenderer.render(fgscene, camera);
		bgrenderer.render(bgscene, camera);
        renderqueue.forEach(function(method){
            method();
        });
    }

    calculateBoundry = function calculateBoundry(){
        var vFOV = camera.fov * Math.PI / 180;        // convert vertical fov to radians
        var height = 2 * Math.tan( vFOV / 2 ) * 100; // visible height
        boundryWidth = (height *  window.innerWidth / window.innerHeight) / 2; // visible width
    }

    init = function init(){
        // scene, camera, renderer
        fgscene = new THREE.Scene();
		bgscene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 0.1, 1000 );
        camera.position.z = 100;
        camera.position.y = 50;

		bgrenderer = new THREE.WebGLRenderer({ antialias: true });
        bgrenderer.setSize( window.innerWidth, window.innerHeight );
        bgrenderer.setClearColor(0x111822);
        document.body.appendChild( bgrenderer.domElement );

		var testdiv = document.createElement("div");
		testdiv.id = "testdiv";
		document.body.appendChild(testdiv);

		fgrenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        fgrenderer.setSize( window.innerWidth, window.innerHeight );
		fgrenderer.setClearColor( 0x000000, 0 );
        document.body.appendChild( fgrenderer.domElement );

        window.addEventListener( 'resize', onWindowResize, false );

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
        camera:camera
    }
})();
