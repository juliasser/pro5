let width = $(window).width();

if (width < 1280) {
    window.location.href = "mobile.html";
    console.log(width + 'px is too small (<1280) sry');  
}