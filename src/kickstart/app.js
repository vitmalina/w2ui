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
}