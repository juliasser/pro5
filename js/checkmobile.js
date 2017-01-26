let width = $(window).width();
    
if (width < 1024) {
        window.location.href = "mobile.html";
        console.log(width + 'px is too small (<1024) sry');  
}