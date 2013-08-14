// =================================================
// -- Route Module

app.route = (function (obj) {
	var no_update = false;

	obj.set 	= set;
	obj.parse	= parse;
	obj.go		= go;

	init();
	return obj;

	function init () {
		// init routes
		$(window).on('hashchange', function (event) {
			if (no_update === true) return;
			var path = String(document.location.hash).replace(/\/{2,}/g, '/');
			if (path.length > 1) path = path.substr(1);
			app.route.go(path);
		});		
	}

	function set (path) {
		if (path.substr(0, 1) != '/') path = '/' + path;
		no_update = true;
		document.location.hash = path;
		setTimeout(function () { no_update = false; }, 1); // need timer to allow hash to be proceesed by the browser
	}

	function parse () {
		var hash = String(document.location.hash).replace(/\/{2,}/g, '/');
		if (hash.length > 1) hash = hash.substr(1);
		if (hash.length > 1 && hash.substr(0, 1) == '/') hash = hash.substr(1);
		return hash.split('/');
	}	

	function go (path) {
		if (!path) return;
		if (path.substr(0, 1) != '/') path = '/' + path;
		path = path.replace(/\/{2,}/g, '/');
		var tmp = app.route.parse();
		var mod = tmp[0];
		app.route.set(path);
		// open that module
		if (app.core.modules[mod] && app.core.modules[mod].isLoaded) {
			app[mod].params = { route: path, parsed: app.route.parse() };
			app[mod].render();
		} else {
			app.load(mod, { route: path, parsed: app.route.parse() });
		}
	}

}) (app.route || {});