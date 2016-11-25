'use strict';

var pro5 = pro5 || {};

$(function () {
    console.log("fuck yeah testing!");
    console.log("----------");
    var planetDetailGlobal = document.querySelector('#planet--global-structure');
    var content = planetDetailGlobal.import.querySelector('#infowrapper');

    console.log('the global info wrapper was imported by the doc ready function:');
    console.log(content);
    document.body.appendChild(content);
    console.log("the whole thing has been added to the content.");
    console.log("----------");
    console.log("now calling showPlanetContent for mercury");
    showPlanetContent("mercury");

});

function showPlanetContent(planetid) {
    $(document.body).removeClass();
    $(document.body).addClass(planetid);
    $('#planet-detail--txt').prepend(planetContent);

    console.log("trying to import content data for " + planetid);

    var planetDetail = document.querySelector('#planet--' + planetid);
    var planetContent = planetDetail.import.querySelector('#planet-detail--textcontent');

    console.log(planetContent);
    console.log('oh yeah you got the text stuff for ' + planetid);

    // appending
    
    
};
