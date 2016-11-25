'use strict';

var pro5 = pro5 || {};

$(function() {
    console.log( "fuck yeah testing!" );
    var planetDetailGlobal = document.querySelector('#planet--global-structure');
    var content = planetDetailGlobal.import.querySelector('#infowrapper');
    document.body.appendChild(content);
    
    showPlanetContent("mercury");
    console.log(content);
});

function showPlanetContent(planetid) {
 console.log('oh yeah youre on '  + planetid);
};