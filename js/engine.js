"use strict"

var pro5 = pro5 || {};

pro5.engine = (function(){
    var scene, camera, renderer,

        renderqueue = [],

        addObject,
        addToRenderQueue,
        onWindowResize,
        render,
        init,
        calculateBoundry, 
        boundryWidth;

    addObject = function addObject(object){
        scene.add(object);
		console.log(scene);
    }

    addToRenderQueue = function addToRenderQueue(method){
        // TODO
        renderqueue.push(method);
    }

    // Eventhandlers
    onWindowResize = function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
        calculateBoundry();
    }

    render = function render(){
        // TODO      


        camera.position.y = pro5.spaceship.updateShip(camera.position.y, boundryWidth);

        requestAnimationFrame( render );
        renderer.render(scene, camera);
        renderqueue.forEach(function(method){
            method();
        });
    }

    calculateBoundry = function calculateBoundry(){
        var vFOV = camera.fov * Math.PI / 180;        // convert vertical fov to radians
        var height = 2 * Math.tan( vFOV / 2 ) * 50; // visible height
        boundryWidth = (height *  window.innerWidth / window.innerHeight) / 2; // visible width
    }

    init = function init(){
        // scene, camera, renderer
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
        camera.position.z = 50;
        camera.position.y = 50;

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize( window.innerWidth, window.innerHeight );
        //renderer.setClearColor(backgroundcolor);
        document.body.appendChild( renderer.domElement );

        window.addEventListener( 'resize', onWindowResize, false );
       
        calculateBoundry();
        
        render();
    }

    return{
        init:init,
        addObject:addObject,
        addToRenderQueue: addToRenderQueue,
        camera:camera
    }
})();
