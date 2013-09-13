// =================================================
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

}) (app.core || {});