var myTouch1; 
var myTouch2;

$(document).ready(function () { 
	// create containers
	$(document.body).append('<div id="myTouch1" class="jsTouchPanel" style="position: absolute; left: 0px; top: 0px; border-left: 0px !important;"></div>');
	$(document.body).append('<div id="myTouch2" class="jsTouchPanel" style="position: absolute; left: 320px; top: 0px;"></div>');
	// init boxes
	myTouch1 = jsTouch.init('myTouch1', { width: 320,  page: 'pages/home.html' } );
	myTouch2 = jsTouch.init('myTouch2', { width: -320, page: 'pages/home.html' } );
	// unload page event
	resize();
});
// events
document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false); // prevent default scroll 
document.addEventListener('orientationchange', resize, false);
window.addEventListener('resize', resize, false);

function resize() {
	var width  = parseInt(window.innerWidth);
	var height = parseInt(window.innerHeight);
	if (width > 1000 || height > 1000) {
		myTouch1.width = 320;
		myTouch2.width = -320;
		$('#myTouch2').css('left', 320);
	} else {
		myTouch1.width = width;
		$('#myTouch2').css('left', width);
	}
	jsTouch.resize();
}

