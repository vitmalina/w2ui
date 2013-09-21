/* kicstart 0.x (c) http://w2ui.com/kickstart, vitmalina@gmail.com */
var app = {};

/****************************************************
*  NICE TO HAVE
*	- get should not use eval(), should use global linking
*/

app.header = function (msg) {
	$('#app-header').html(msg);
}

app.timer = function () {
	app._timer_start = (new Date()).getTime();
	app._timer_lap   = (new Date()).getTime();
	console.log('Start Timer');
}

app.lap = function (name) {
	if (typeof name != 'string') name = ''; else name = ' "' + name + '"';
	console.log('Total:', (new Date()).getTime() - app._timer_start, 'Lap'+ name + ':', (new Date()).getTime() - app._timer_lap);
	app._timer_lap = (new Date()).getTime();
}

// ===========================================
// -- Loads modules or calls .render()
// -- if module was previously loaded

app.load = function (names, params, callBack) {
	if (!$.isArray(names)) names = [names];
	if (typeof params == 'function') {
		callBack = params;
		params   = {};
	}
	if (!params) params = {};
	var modCount = names.length;
	for (var n in names) {
		var name = names[n];
		if (typeof app.core.modules[name] == 'undefined') {
			modCount--;
			console.log('ERROR: module "'+ name +'" is not defined. Define it in app/conf/modules.js.');
			return;
		}
		// init module and pass params
		app[name] = app[name] || {};
		app[name].params = $.extend({}, params);
		// check if was loaded before 
		if (app.core.modules[name] && app.core.modules[name].isLoaded === true) {
			modCount--;
			if (typeof app[name].render == 'undefined') {
				console.log('ERROR: Loader: module "'+ name + '" has no render() method.');
			} else {
				app[name].render();
				isFinished();
			}
		} else {
			$.ajax({ url : app.core.modules[name].url, dataType: "script" })
				.always(function () { // arguments are either same as done or fail
					modCount--;
				})
				.done(function (data, status, xhr) {
					app.core.modules[name].isLoaded = true;
					isFinished();
				})
				.fail(function (xhr, err, errData) {
					if (err == 'error') {
						console.log('ERROR: Loader: module "'+ name +'" failed to load ('+ app.core.modules[name].url +').');
					} else {
						console.log('ERROR: Loader: module "'+ name + '" is loaded ('+ app.core.modules[name].url +'), but with a parsing error(s) in line '+ errData.line +': '+ errData.message);
						app.core.modules[name].isLoaded = true;
						isFinished();
					}
				});
		}
	}

	function isFinished() {
		if (typeof callBack == 'function' && modCount == 0) callBack(true);
	}
}

// ===========================================
// -- Loads a set of files and returns 
// -- its contents to the callBack function

app.get = function (files, callBack) {
	var bufferObj = {};
	var bufferLen = files.length;
	
	for (var i in files) {
		// need a closure
		(function () {
			var index = i;
			var path  = files[i];
			$.ajax({
				url		: path,
				dataType: 'text',
				success : function (data, success, responseObj) {
					if (success != 'success') {
						console.log('ERROR: Loader: error while getting a file '+ path +'.');
						return;
					}
					bufferObj[index] = responseObj.responseText;
					loadDone();

				},
				error : function (data, err, errData) {
					if (err == 'error') {
						console.log('ERROR: Loader: failed to load '+ files[i] +'.');
					} else {
						console.log('ERROR: Loader: file "'+ files[i] + '" is loaded, but with a parsing error(s) in line '+ errData.line +': '+ errData.message);
						bufferObj[index] = responseObj.responseText;
						loadDone();
					}
				}
			});
		})();
	}
	// internal counter
	function loadDone() {
		bufferLen--;
		if (bufferLen <= 0) callBack(bufferObj);
	}
}

// ===========================================
// -- Includes all files as scripts in order to see error line

app.include = function (files) {
	if (typeof files == 'string') files = [files];
	for (var i in files) {
		$(document).append('<script type="text/javascript" src="'+ files[i] +'"></script>');
	}
}// =================================================
// -- Core Module

app.core = (function (obj) {
	var config;
	var modules;

	obj.user	= {};
	obj.modules	= modules;

	init();
	return obj;

	function init() {
		// -- load utils
		app.get(['app/conf/session.js'], function (data) {
			try { for (var i in data) eval(data[i]); } catch (e) { }
			// if login page - do not init
			if (document.location.href.indexOf('login.html') > 0) return;
			// -- if no user info
			app.core.user = app.session();
			if ($.isEmptyObject(app.core.user)) {
				document.location = 'login.html';
				return;
			}
			// -- load dependencies
			var files = [
				'app/conf/action.js', 
				'app/conf/modules.js', 
				'app/conf/config.js', 
				'app/conf/start.js' 
			];
			app.get(files, function (data) {
				try {
					/* REVISIT - ajax(script type ) does not show line */
					for (var i in data) eval(data[i]);
				} catch (e) {
					app.include(files);
				}
				app.core.config  = config;
				app.core.modules = modules;
				// init application UI
				$('#app-toolbar').w2toolbar(app.core.config.app_toolbar);
				$('#app-tabs').w2tabs(app.core.config.app_tabs);
				$('#app-main').w2layout(app.core.config.app_layout);
				// popin
				//$().w2popup({ width: 300, height: 65, body: 
				//	'<div style="font-size: 18px; color: #666; text-align: center; padding-top: 15px">Loading....</div>'} );
				setTimeout(popin, 100);
			});
		});
	}

	function popin() {
		$('#app-container').fadeIn(200);
		//$('#app-container').css({ '-webkit-transform': 'scale(1)', opacity: 1 });
		setTimeout(function () {
			var top = 0;
			// app toolbar
			if (app.core.config.show.toolbar) {
				$('#app-toolbar').css('height', '30px').show();
				top += 30;
			} else {
				$('#app-toolbar').hide();
			}
			// app tabs
			if (app.core.config.show.tabs) {
				$('#app-tabs').css({ 'top': top + 'px', 'height': '30px' }).show();
				top += 30;
			} else {
				$('#app-tabs').hide();
			}
			$('#app-top').css('height', top + 'px').show();
			// app header
			if (app.core.config.show.header) {
				$('#app-header').css({ 'top': top + 'px', 'height': '60px' }).show();
				top += 60;
			} else {
				$('#app-header').hide();
			}
			$('#app-main').css('top', top + 'px');
			// init app
			if (typeof app.start == 'function') app.start();
			var hash = String(document.location.hash);
			if (hash.length > 1) hash = hash.substr(1);
			if ($.trim(hash) != '')	app.route.go(hash);
		}, 200);
	}

}) (app.core || {});// =================================================
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