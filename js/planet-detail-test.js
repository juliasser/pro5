'use strict';

var pro5 = pro5 || {};

$(function () {
    var planetDetailGlobal = document.querySelector('#planet--global-structure');
    var content = planetDetailGlobal.import.querySelector('#infowrapper');
    document.body.appendChild(content);

    showPlanetContent("mercury");
});

function showPlanetContent(planetid) {
    $(document.body).removeClass();
    $(document.body).addClass(planetid);

    var planetDetail = document.querySelector('#planet--' + planetid);
    var planetContent = planetDetail.import.querySelector('#planet-detail--textcontent');

    console.log(planetContent);

    // appending
    $('#planet-detail--txt').prepend(planetContent);
};
