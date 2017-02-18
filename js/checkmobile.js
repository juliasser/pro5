let width = $(window).width();

if (width < 1280) {
    window.location.href = "mobile.html";
}

if (navigator.userAgent.search("MSIE") >= 0) {
    window.location.href = "browser.html";
}
else if (navigator.userAgent.search("Chrome") >= 0) {
    console.log('thats good (chrome)');
}
else if (navigator.userAgent.search("Firefox") >= 0) {
    window.location.href = "browser.html";
}
else if (navigator.userAgent.search("Safari") >= 0 && navigator.userAgent.search("Chrome") < 0) {
    window.location.href = "browser.html";
}
else if (navigator.userAgent.search("Opera") >= 0) {
    console.log('thats kinda good (opera)');
}