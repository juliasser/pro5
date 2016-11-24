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
        cameraZoom,
        rotateCamera;

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

    var started = false;
    rotateCamera = function rotateCamera(e){
        if(e.which == 32){
            // remove startscreen
            var startnode = document.querySelector('#content--start');
            var body = document.querySelector('body');
            startnode.className += "content--start-fadeout";
            // body.removeChild(startnode);
        
            
            
            // start camera animation
            var cameratween = new TWEEN.Tween(camera.rotation)
            .to({ x: 0, y: camera.rotation.y, z: camera.rotation.z}, 2500)
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
            
            started = true;
        }
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
        if(zoomout && camera.position.z < maxzoom){
            camera.position.z += 0.3;
            calculateBoundry();
        } else if (!zoomout && camera.position.z > minzoom){

            camera.position.z -= 0.5; 
            calculateBoundry();
        }

    }

    render = function render(){
        // TODO

        if(started){
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

            pro5.spaceship.calculateSunDistance();
        }


        TWEEN.update();

        requestAnimationFrame( render );
        fgrenderer.render(fgscene, camera);
        bgrenderer.render(bgscene, camera);
        renderqueue.forEach(function(method){
            method();
        });
    }

    init = function init(){
        // scene, camera, renderer
        fgscene = new THREE.Scene();
        bgscene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 0.1, 1000 );
        camera.position.z = 100;
        camera.position.y = 50;
        camera.rotation.x = -1;

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

        var testdiv = document.createElement("div");
        testdiv.id = "testdiv";
        document.getElementById("canvas--wrapper-back").after(testdiv);

        bgrenderer = new THREE.WebGLRenderer({canvas: bgcanvas,  antialias: true });
        bgrenderer.setSize( window.innerWidth, window.innerHeight );
        bgrenderer.setClearColor(0x121517);
        document.getElementById("canvas--wrapper-back").prepend(bgrenderer.domElement );

        window.addEventListener( 'resize', onWindowResize, false );
        document.addEventListener( 'keydown', function(event){
            rotateCamera(event);
        }, false);

        if(DEBUG){
            var axis = new THREE.AxisHelper(100);
            fgscene.add(axis);
        }

        loader = new THREE.JSONLoader();

        calculateBoundry();

        console.log(camera);

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
