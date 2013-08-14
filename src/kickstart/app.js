var app = {};

/****************************************************
*  NICE TO HAVE
*	- get should not use eval(), should use global linking
*/

app.header = function (msg) {
	$('#app-header').html(msg);
}

// ===========================================
// -- Loads modules or calls .render()
// -- if module was previously loaded

app.load = function (name, params, callBack) {
	if (typeof app.core.modules[name] == 'undefined') {
		console.log('ERROR: module "'+ name +'" is not defined. Define it in app/conf/modules.js.');
		return;
	}
	if (!params) params = {};
	// init module and pass params
	app[name] = app[name] || {};
	app[name].params = $.extend({}, params);
	// check if was loaded before 
	if (app.core.modules[name] && app.core.modules[name].isLoaded === true) {
		if (typeof app[name].render == 'undefined') {
			console.log('ERROR: Loader: module "'+ name + '" has no render() method.');
		} else {
			app[name].render();
			if (typeof callBack == 'function') callBack(true);
		}
	} else {
		app.ajax({ 
			url 	: app.core.modules[name].url, 
			dataType: "script", 
			success	: function (data, status, respObj) {
				app.core.modules[name].isLoaded = true;
				if (typeof callBack == 'function') callBack(true);
			},
			error 	: function (respObj, err, errData) {
				if (err == 'error') {
					console.log('ERROR: Loader: module "'+ name +'" failed to load ('+ app.core.modules[name].url +').');
				} else {
					console.log('ERROR: Loader: module "'+ name + '" is loaded ('+ app.core.modules[name].url +'), but with a parsing error(s) in line '+ errData.line +': '+ errData.message);
					app.core.modules[name].isLoaded = true;
					if (typeof callBack == 'function') callBack(false);
				}
			} 
		});		
	}
};

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
			app.ajax({
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
};

// ===========================================
// -- Includes all files as scripts in order to see error line

app.include = function (files) {
	if (typeof files == 'string') files = [files];
	for (var i in files) {
		$(document).append('<script type="text/javascript" src="'+ files[i] +'"></script>');
	}
};

// ===========================================
// -- Common place for all AJAX calls

app.ajax = function (url, options) {
	if (typeof options == 'undefined') options = url; else $.extend(options, { url: url });
	if (typeof options.error != 'undefined') options._error_ = options.error; 
	// custom error handler
	options.error = function (xhr, status, error) {
		if (typeof app.ajaxError == 'function') app.ajaxError(xhr, status, error);
		if (typeof options._error_ == 'function') options._error_(xhr, status, error);
	}
	options.cache = false;
	// submit through jquery
	$.ajax(options);
};

// ===========================================
// -- Dialogs

app.error = function (msg, title, callBack) {
	if (typeof callBack == 'undefined' && typeof title == 'function') {
		callBack = title; 
		title = 'Error';
	}
	if (typeof title == 'undefined') {
		title = 'Error';
	}
	// if popup is open
	if ($('#w2ui-popup').length > 0) {
		$('#w2ui-popup .w2ui-popup-message').remove();
		$().w2popup('message', {
			width 	: 500,
			height 	: 200,
			showMax : false,
			html 	: 
				'<div class="centered"><div style="padding-bottom: 30px">'+
				'	<div style=\'display: inline-block; text-align: left; font-size: 12px; font-family: Monaco, "Courier New"; color: #555;\'>'+ 
						String(msg).replace(/\n/g, '<br>') +
				'	</div>' +
				'</div></div>'
		});
		$('#w2ui-popup .w2ui-popup-message').on('click', function (event) { if (typeof callBack == 'function') callBack(); });
		return;
	}
	// open in as a popup
	$().w2popup('open', {
		width 	: 500,
		height 	: 245,
		showMax : false,
		title 	: (typeof title != 'undefined' ? title : 'Error'),
		body 	: '<div class="centered"><div>'+
			 	  '  <div style=\'display: inline-block; text-align: left; font-size: 12px; font-family: Monaco, "Courier New"; color: #555;\'>'+ 
			 			String(msg).replace(/\n/g, '<br>') +
				  '	 </div>' +
				  '</div></div>',
		buttons : '<input type="button" value="Ok" onclick="$().w2popup(\'close\')" style="width: 60px">',
		onClose : function () { if (typeof callBack == 'function') callBack(); }
	});
}