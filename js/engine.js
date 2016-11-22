"use strict"

var pro5 = pro5 || {};

pro5.engine = (function(){
    var scene, camera, renderer,

        renderqueue = [],

        addObject,
        addToRenderQueue,
        onWindowResize,
        render,
        init;

    addObject = function addObject(object){
        scene.add(object);
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
    }

    render = function render(){
        // TODO        
        camera.position.y = pro5.spaceship.updateShip(camera.position.y);

        requestAnimationFrame( render );
        renderer.render(scene, camera);
        renderqueue.forEach(function(method){
            method();
        });
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
        console.log(window.innerWidth);
        render();
    }

    return{
        init:init,
        addObject:addObject,
        addToRenderQueue: addToRenderQueue,
        camera:camera
    }
})();
