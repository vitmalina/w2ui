/************************************************************************
*   Library: Web 2.0 UI for jQuery (using prototypical inheritance)
*   - Following objects defined
* 		- w2popup 	- popup widget
*		- $.w2popup	- jQuery wrapper
*   - Dependencies: jQuery, w2utils
* 
* == NICE TO HAVE ==
*	- when maximized, align the slide down message
*	- bug: after transfer to another content, message does not work
* 	- transition should include title, body and buttons, not just body
*	- add lock method() to lock popup content
*
* == 1.3 changes ==
*	- keyboard esc - close
*	- w2confirm() - enter - yes, esc - no
*	- added onKeydown event listener
*	- added callBack to w2alert(msg, title, callBack)
*	- renamed doKeydown to keydown()
*	- if there are no rel=, the entire html is taken as body
*	- options.url is now for load or open methods
*	- moved all events to w2events
*	- aded lock() and unlock() functions
*	- fixed w2alert() and w2confirm to work in already opend popup
*
************************************************************************/

var w2popup = {};

(function () {

	// ====================================================
	// -- Registers as a jQuery plugin
	
	$.fn.w2popup = function(method, options) {	
		if (typeof method  == 'undefined') {
			options = {};
			method  = 'open';
		}
		if ($.isPlainObject(method)) {
			options = method;		
			method  = 'open';
		}
		method = method.toLowerCase();
		if (method == 'load' && typeof options == 'string') options = { url: options };
		if (method == 'open' && typeof options.url != 'undefined') method = 'load';
		if (typeof options == 'undefined') options = {};
		// load options from markup
		var dlgOptions = {};
		if ($(this).length > 0 ) {
			if ($(this).find('div[rel=title], div[rel=body], div[rel=buttons]').length > 0) {
				if ($(this).find('div[rel=title]').length > 0) {
					dlgOptions['title'] = $(this).find('div[rel=title]').html();
				}
				if ($(this).find('div[rel=body]').length > 0) {
					dlgOptions['body']  = $(this).find('div[rel=body]').html();
					dlgOptions['style'] = $(this).find('div[rel=body]')[0].style.cssText;
				}
				if ($(this).find('div[rel=buttons]').length > 0) {
					dlgOptions['buttons'] 	= $(this).find('div[rel=buttons]').html();
				}
			} else {
				dlgOptions['title']  = '&nbsp;';
				dlgOptions['body']   = $(this).html();
			}
			if (parseInt($(this).css('width')) != 0)  dlgOptions['width']  = parseInt($(this).css('width'));
			if (parseInt($(this).css('height')) != 0) dlgOptions['height'] = parseInt($(this).css('height'));
		}
		// show popup
		return w2popup[method]($.extend({}, dlgOptions, options));
	};
	
	// ====================================================
	// -- Implementation of core functionality (SINGELTON)
	
	w2popup = {	
		defaults: {
			title			: '',
			body			: '',
			buttons			: '',
			style			: '',
			color			: '#000',
			opacity			: 0.4,
			speed			: 0.3,
			modal			: false,
			maximized		: false,
			keyboard		: true,		// will close popup on esc if not modal
			width			: 500,
			height			: 300,
			showClose		: true,
			showMax			: false,
			transition		: null
		},
		handlers	: [],
		onOpen		: null,
		onClose		: null,
		onMax		: null,
		onMin		: null,
		onKeydown   : null,

		open: function (options) {
			var obj = this;
			// get old options and merge them
			var old_options = $('#w2ui-popup').data('options');
			var options = $.extend({}, this.defaults, { body : '' }, old_options, options);
			// if new - reset event handlers
			if ($('#w2ui-popup').length == 0) {
				w2popup.handlers	 = [];
				w2popup.onMax 	 	= null;
				w2popup.onMin 	 	= null;
				w2popup.onOpen	 	= null;
				w2popup.onClose	 	= null;
				w2popup.onKeydown	= null;
			}
			if (options.onOpen)		w2popup.onOpen		= options.onOpen;
			if (options.onClose)	w2popup.onClose		= options.onClose;
			if (options.onMax)		w2popup.onMax		= options.onMax;
			if (options.onMin)		w2popup.onMin		= options.onMin;
			if (options.onKeydown)	w2popup.onKeydown	= options.onKeydown;

			if (window.innerHeight == undefined) {
				var width  = document.documentElement.offsetWidth;
				var height = document.documentElement.offsetHeight;
				if (w2utils.engine == 'IE7') { width += 21; height += 4; }
			} else {
				var width  = window.innerWidth;
				var height = window.innerHeight;
			}
			if (parseInt(width)  - 10 < parseInt(options.width))  options.width  = parseInt(width)  - 10;
			if (parseInt(height) - 10 < parseInt(options.height)) options.height = parseInt(height) - 10;
			var top  = ((parseInt(height) - parseInt(options.height)) / 2) * 0.6;
			var left = (parseInt(width) - parseInt(options.width)) / 2;
			// check if message is already displayed
			if ($('#w2ui-popup').length == 0) {
				// trigger event
				var eventData = this.trigger({ phase: 'before', type: 'open', target: 'popup', options: options, present: false });
				if (eventData.isCancelled === true) return;			
				// output message
				w2popup.lockScreen(options);			
				var msg = '<div id="w2ui-popup" class="w2ui-popup" style="'+
								'width: '+ parseInt(options.width) +'px; height: '+ parseInt(options.height) +'px; opacity: 0; '+
								'-webkit-transform: scale(0.8); -moz-transform: scale(0.8); -ms-transform: scale(0.8); -o-transform: scale(0.8); '+
								'left: '+ left +'px; top: '+ top +'px;">';
				if (options.title != '') { 
					msg +='<div class="w2ui-msg-title">'+
						  (options.showClose ? '<div class="w2ui-msg-button w2ui-msg-close" onclick="w2popup.close(); '+
						  					   'if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;">Close</div>' : '')+ 
						  (options.showMax ? '<div class="w2ui-msg-button w2ui-msg-max" onclick="w2popup.toggle()">Max</div>' : '') + 
							  options.title +
						  '</div>'; 
				}
				msg += '<div class="w2ui-box1" style="'+(options.title == '' ? 'top: 0px !important;' : '')+(options.buttons == '' ? 'bottom: 0px !important;' : '')+'">';
				msg += '<div class="w2ui-msg-body'+ (!options.title != '' ? ' w2ui-msg-no-title' : '') + (!options.buttons != '' ? ' w2ui-msg-no-buttons' : '') +'" style="'+ options.style +'">'+ options.body +'</div>';
				msg += '</div>';
				msg += '<div class="w2ui-box2" style="'+(options.title == '' ? 'top: 0px !important;' : '')+(options.buttons == '' ? 'bottom: 0px !important;' : '')+'">';
				msg += '<div class="w2ui-msg-body'+ (!options.title != '' ? ' w2ui-msg-no-title' : '') + (!options.buttons != '' ? ' w2ui-msg-no-buttons' : '') +'" style="'+ options.style +'"></div>';
				msg += '</div>';
				if (options.buttons != '') { 
					msg += '<div class="w2ui-msg-buttons">'+ options.buttons +'</div>'; 
				}
				msg += '</div>';
				$('body').append(msg);
				// allow element to render
				setTimeout(function () {
					$('#w2ui-popup .w2ui-box2').hide();
					$('#w2ui-popup').css({ 
						'-webkit-transition': options.speed +'s opacity, '+ options.speed +'s -webkit-transform', 
						'-webkit-transform': 'scale(1)',
						'-moz-transition': options.speed +'s opacity, '+ options.speed +'s -moz-transform', 
						'-moz-transform': 'scale(1)',
						'-ms-transition': options.speed +'s opacity, '+ options.speed +'s -ms-transform', 
						'-ms-transform': 'scale(1)',
						'-o-transition': options.speed +'s opacity, '+ options.speed +'s -o-transform', 
						'-o-transform': 'scale(1)',
						'opacity': '1'
					});
				}, 1);
				// clean transform
				setTimeout(function () {
					$('#w2ui-popup').css({
						'-webkit-transform': '',
						'-moz-transform': '',
						'-ms-transform': '',
						'-o-transform': ''
					});
					// event after
					obj.trigger($.extend(eventData, { phase: 'after' }));
				}, options.speed * 1000);
			} else {
				// trigger event
				var eventData = this.trigger({ phase: 'before', type: 'open', target: 'popup', options: options, present: true });
				if (eventData.isCancelled === true) return;			
				// check if size changed
				if (typeof old_options == 'undefined' || old_options['width'] != options['width'] || old_options['height'] != options['height']) {
					$('#w2ui-panel').remove();
					w2popup.resize(options.width, options.height);
				}
				// show new items
				var body = $('#w2ui-popup .w2ui-box2 > .w2ui-msg-body').html(options.body);
				if (body.length > 0) body[0].style.cssText = options.style;
				$('#w2ui-popup .w2ui-msg-buttons').html(options.buttons);
				$('#w2ui-popup .w2ui-msg-title').html(
					  (options.showClose ? '<div class="w2ui-msg-button w2ui-msg-close" onclick="w2popup.close()">Close</div>' : '')+ 
					  (options.showMax ? '<div class="w2ui-msg-button w2ui-msg-max" onclick="w2popup.max()">Max</div>' : '') + 
					  options.title);
				// transition
				var div_old = $('#w2ui-popup .w2ui-box1')[0];
				var div_new = $('#w2ui-popup .w2ui-box2')[0];
				w2utils.transition(div_old, div_new, options.transition);
				div_new.className = 'w2ui-box1';
				div_old.className = 'w2ui-box2';	
				$(div_new).addClass('w2ui-current-box');		
				// remove max state
				$('#w2ui-popup').data('prev-size', null);
				// call event onChange
				setTimeout(function () {
					obj.trigger($.extend(eventData, { phase: 'after' }));
				}, 1);
			}		
			// save new options
			options._last_w2ui_name = w2utils.keyboard.active();
			w2utils.keyboard.active(null);
			$('#w2ui-popup').data('options', options);
			// keyboard events 
			if (options.keyboard) $(document).on('keydown', this.keydown);

			// initialize move
			var tmp = { resizing: false };
			$('#w2ui-popup .w2ui-msg-title')
				.on('mousedown', function (event) { mvStart(event); })
				.on('mousemove', function (event) { mvMove(event); })
				.on('mouseup',   function (event) { mvStop(event); });
			$('#w2ui-popup .w2ui-msg-body')
				.on('mousemove', function (event) { mvMove(event); })
				.on('mouseup',   function (event) { mvStop(event); });
			$('#w2ui-lock')
				.on('mousemove', function (event) { mvMove(event); })
				.on('mouseup',   function (event) { mvStop(event); });

			// handlers
			function mvStart(event) {
				if (!event) event = window.event;
				if (!window.addEventListener) { window.document.attachEvent('onselectstart', function() { return false; } ); }
				tmp.resizing = true;
				tmp.tmp_x = event.screenX;
				tmp.tmp_y = event.screenY;
				if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;
				if (event.preventDefault) event.preventDefault(); else return false;
			}
			
			function mvMove(evnt) {
				if (tmp.resizing != true) return;
				if (!evnt) evnt = window.event;
				tmp.tmp_div_x = (evnt.screenX - tmp.tmp_x); 
				tmp.tmp_div_y = (evnt.screenY - tmp.tmp_y); 
				$('#w2ui-popup').css({
					'-webkit-transition': 'none',
					'-webkit-transform': 'translate3d('+ tmp.tmp_div_x +'px, '+ tmp.tmp_div_y +'px, 0px)',
					'-moz-transition': 'none',
					'-moz-transform': 'translate('+ tmp.tmp_div_x +'px, '+ tmp.tmp_div_y +'px)',
					'-ms-transition': 'none',
					'-ms-transform': 'translate('+ tmp.tmp_div_x +'px, '+ tmp.tmp_div_y +'px)',
					'-o-transition': 'none',
					'-o-transform': 'translate('+ tmp.tmp_div_x +'px, '+ tmp.tmp_div_y +'px)'
				});
				$('#w2ui-panel').css({
					'-webkit-transition': 'none',
					'-webkit-transform': 'translate3d('+ tmp.tmp_div_x +'px, '+ tmp.tmp_div_y +'px, 0px)',
					'-moz-transition': 'none',
					'-moz-transform': 'translate('+ tmp.tmp_div_x +'px, '+ tmp.tmp_div_y +'px)',
					'-ms-transition': 'none',
					'-ms-transform': 'translate('+ tmp.tmp_div_x +'px, '+ tmp.tmp_div_y +'px',
					'-o-transition': 'none',
					'-o-transform': 'translate('+ tmp.tmp_div_x +'px, '+ tmp.tmp_div_y +'px)'
				});
			}
		
			function mvStop(evnt) {
				if (tmp.resizing != true) return;
				if (!evnt) evnt = window.event;
				tmp.tmp_div_x = (evnt.screenX - tmp.tmp_x); 
				tmp.tmp_div_y = (evnt.screenY - tmp.tmp_y); 			
				$('#w2ui-popup').css({
					'-webkit-transition': 'none',
					'-webkit-transform': 'translate3d(0px, 0px, 0px)',
					'-moz-transition': 'none',
					'-moz-transform': 'translate(0px, 0px)',
					'-ms-transition': 'none',
					'-ms-transform': 'translate(0px, 0px)',
					'-o-transition': 'none',
					'-o-transform': 'translate(0px, 0px)',
					'left': (parseInt($('#w2ui-popup').css('left')) + parseInt(tmp.tmp_div_x)) + 'px',
					'top':	(parseInt($('#w2ui-popup').css('top'))  + parseInt(tmp.tmp_div_y)) + 'px'
				});
				$('#w2ui-panel').css({
					'-webkit-transition': 'none',
					'-webkit-transform': 'translate3d(0px, 0px, 0px)',
					'-moz-transition': 'none',
					'-moz-transform': 'translate(0px, 0px)',
					'-ms-transition': 'none',
					'-ms-transform': 'translate(0px, 0px)',
					'-o-transition': 'none',
					'-o-transform': 'translate(0px, 0px)',
					'left': (parseInt($('#w2ui-panel').css('left')) + parseInt(tmp.tmp_div_x)) + 'px',
					'top':	(parseInt($('#w2ui-panel').css('top'))  + parseInt(tmp.tmp_div_y)) + 'px'
				});
				tmp.resizing = false;
			}		
			return this;		
		},

		keydown: function (event) {
			var options = $('#w2ui-popup').data('options');
			if (!options.keyboard) return;
			// trigger event
			var eventData = w2popup.trigger({ phase: 'before', type: 'keydown', target: 'popup', options: options, object: w2popup, originalEvent: event });
			if (eventData.isCancelled === true) return;
			// default behavior
			switch (event.keyCode) {
				case 27: 
					event.preventDefault();
					if ($('#w2ui-popup .w2ui-popup-message').length > 0) w2popup.message(); else w2popup.close();
					break;
			}
			// event after
			w2popup.trigger($.extend(eventData, { phase: 'after'}));
		},
		
		close: function (options) {
			var obj = this;
			var options = $.extend({}, $('#w2ui-popup').data('options'), options);
			// trigger event
			var eventData = this.trigger({ phase: 'before', type: 'close', target: 'popup', options: options });
			if (eventData.isCancelled === true) return;
			// default behavior
			$('#w2ui-popup, #w2ui-panel').css({ 
				'-webkit-transition': options.speed +'s opacity, '+ options.speed +'s -webkit-transform', 
				'-webkit-transform': 'scale(0.9)',
				'-moz-transition': options.speed +'s opacity, '+ options.speed +'s -moz-transform', 
				'-moz-transform': 'scale(0.9)',
				'-ms-transition': options.speed +'s opacity, '+ options.speed +'s -ms-transform', 
				'-ms-transform': 'scale(0.9)',
				'-o-transition': options.speed +'s opacity, '+ options.speed +'s -o-transform', 
				'-o-transform': 'scale(0.9)',
				'opacity': '0'
			});		
			w2popup.unlockScreen();
			setTimeout(function () {
				$('#w2ui-popup').remove();
				$('#w2ui-panel').remove();
				// event after
				obj.trigger($.extend(eventData, { phase: 'after'}));
			}, options.speed * 1000);				
			// restore active
			w2utils.keyboard.active(options._last_w2ui_name);
			// remove keyboard events
			if (options.keyboard) $(document).off('keydown', this.keydown);			
		},
		
		toggle: function () {
			var options = $('#w2ui-popup').data('options');
			if (options.maximized === true) w2popup.min(); else w2popup.max();
		},
		
		max: function () {
			var obj = this;
			var options = $('#w2ui-popup').data('options');
			if (options.maximized === true) return;
			// trigger event
			var eventData = this.trigger({ phase: 'before', type: 'max', target: 'popup', options: options });
			if (eventData.isCancelled === true) return;
			// default behavior
			options.maximized = true;
			options.prevSize  = $('#w2ui-popup').css('width')+':'+$('#w2ui-popup').css('height');
			$('#w2ui-popup').data('options', options);
			// do resize
			w2popup.resize(10000, 10000, function () {
				obj.trigger($.extend(eventData, { phase: 'after'}));
			});
		},

		min: function () {
			var obj = this;
			var options = $('#w2ui-popup').data('options');
			if (options.maximized !== true) return;
			var size = options.prevSize.split(':');
			// trigger event
			var eventData = this.trigger({ phase: 'before', type: 'min', target: 'popup', options: options });
			if (eventData.isCancelled === true) return;
			// default behavior
			options.maximized = false;
			options.prevSize  = null;
			$('#w2ui-popup').data('options', options);
			// do resize
			w2popup.resize(size[0], size[1], function () {
				obj.trigger($.extend(eventData, { phase: 'after'}));
			});
		},

		get: function () {
			return $('#w2ui-popup').data('options');
		},

		set: function (options) {
			w2popup.open(options);
		},
		
		clear: function() {
			$('#w2ui-popup .w2ui-msg-title').html('');
			$('#w2ui-popup .w2ui-msg-body').html('');
			$('#w2ui-popup .w2ui-msg-buttons').html('');
		},

		reset: function () {
			w2popup.open(w2popup.defaults);
		},
		
		load: function (options) {
			if (String(options.url) == 'undefined') {
				console.log('ERROR: The url parameter is empty.');
				return;
			}
			var tmp = String(options.url).split('#');
			var url = tmp[0];
			var selector = tmp[1];
			if (String(options) == 'undefined') options = {};
			// load url
			var html = $('#w2ui-popup').data(url);
			if (typeof html != 'undefined' && html != null) {
				popup(html, selector);
			} else {
				$.get(url, function (data, status, obj) {
					popup(obj.responseText, selector);
					$('#w2ui-popup').data(url, obj.responseText); // remember for possible future purposes
				});
			}
			function popup(html, selector) {
				delete options.url;
				$('body').append('<div id="w2ui-tmp" style="display: none">'+ html +'</div>');
				if (typeof selector != 'undefined' && $('#w2ui-tmp #'+selector).length > 0) {
					$('#w2ui-tmp #'+ selector).w2popup(options);
				} else {
					$('#w2ui-tmp > div').w2popup(options);
				}
				// link styles
				if ($('#w2ui-tmp > style').length > 0) {
					var style = $('<div>').append($('#w2ui-tmp > style').clone()).html();
					if ($('#w2ui-popup #div-style').length == 0) {
						$('#w2ui-ppopup').append('<div id="div-style" style="position: absolute; left: -100; width: 1px"></div>');
					}
					$('#w2ui-popup #div-style').html(style);
				}
				$('#w2ui-tmp').remove();
			}
		},
		
		message: function (options) {
			$().w2tag(); // hide all tags
			if (!options) options = { width: 200, height: 100 };
			if (parseInt(options.width) < 10)  options.width  = 10;
			if (parseInt(options.height) < 10) options.height = 10;
			if (typeof options.hideOnClick == 'undefined') options.hideOnClick = false;

			var head = $('#w2ui-popup .w2ui-msg-title');
			if ($('#w2ui-popup .w2ui-popup-message').length == 0) {
				var pwidth = parseInt($('#w2ui-popup').width());
				$('#w2ui-popup .w2ui-box1')
					.before('<div class="w2ui-popup-message" style="display: none; ' +
								(head.length == 0 ? 'top: 0px;' : 'top: '+ w2utils.getSize(head, 'height') + 'px;') +
					        	(typeof options.width  != 'undefined' ? 'width: '+ options.width + 'px; left: '+ ((pwidth - options.width) / 2) +'px;' : 'left: 10px; right: 10px;') +
					        	(typeof options.height != 'undefined' ? 'height: '+ options.height + 'px;' : 'bottom: 6px;') +
					        	'-webkit-transition: .3s; -moz-transition: .3s; -ms-transition: .3s; -o-transition: .3s;"' +
								(options.hideOnClick === true ? 'onclick="w2popup.message();"' : '') + '>'+
							'</div>');
				$('#w2ui-popup .w2ui-popup-message').data('options', options);
			} else {
				if (typeof options.width  == 'undefined') options.width  = w2utils.getSize($('#w2ui-popup .w2ui-popup-message'), 'width');
				if (typeof options.height == 'undefined') options.height = w2utils.getSize($('#w2ui-popup .w2ui-popup-message'), 'height');
			}
			var display = $('#w2ui-popup .w2ui-popup-message').css('display');
			$('#w2ui-popup .w2ui-popup-message').css({
				'-webkit-transform': (display == 'none' ? 'translateY(-'+ options.height + 'px)': 'translateY(0px)'),
				'-moz-transform': (display == 'none' ? 'translateY(-'+ options.height + 'px)': 'translateY(0px)'),
				'-ms-transform': (display == 'none' ? 'translateY(-'+ options.height + 'px)': 'translateY(0px)'),
				'-o-transform': (display == 'none' ? 'translateY(-'+ options.height + 'px)': 'translateY(0px)')
			});
			if (display == 'none') {
				$('#w2ui-popup .w2ui-popup-message').show().html(options.html);
				setTimeout(function() {
					$('#w2ui-popup .w2ui-popup-message').css({
						'-webkit-transition': '0s',	'-moz-transition': '0s', '-ms-transition': '0s', '-o-transition': '0s',
						'z-Index': 1500
					}); // has to be on top of lock 
					w2popup.lock();
					if (typeof options.onOpen == 'function') options.onOpen();
				}, 300);
			} else {
				$('#w2ui-popup .w2ui-popup-message').css('z-Index', 250);
				var options = $('#w2ui-popup .w2ui-popup-message').data('options');
				$('#w2ui-popup .w2ui-popup-message').remove();
				w2popup.unlock();				
				if (typeof options.onClose == 'function') options.onClose();
			}
			// timer needs to animation
			setTimeout(function () {
				$('#w2ui-popup .w2ui-popup-message').css({
					'-webkit-transform': (display == 'none' ? 'translateY(0px)': 'translateY(-'+ options.height +'px)'),
					'-moz-transform': (display == 'none' ? 'translateY(0px)': 'translateY(-'+ options.height +'px)'),
					'-ms-transform': (display == 'none' ? 'translateY(0px)': 'translateY(-'+ options.height +'px)'),
					'-o-transform': (display == 'none' ? 'translateY(0px)': 'translateY(-'+ options.height +'px)')
				});
			}, 1);
		},

		lock: function (msg, showSpinner) {
			w2utils.lock($('#w2ui-popup'), msg, showSpinner);
		},

		unlock: function () { 
			w2utils.unlock($('#w2ui-popup'));
		},
		
		// --- INTERNAL FUNCTIONS
		
		lockScreen: function (options) {
			if ($('#w2ui-lock').length > 0) return false;
			if (typeof options == 'undefined') options = $('#w2ui-popup').data('options');
			if (typeof options == 'undefined') options = {};
			options = $.extend({}, w2popup.defaults, options);
			// show element
			$('body').append('<div id="w2ui-lock" '+
				'	onmousewheel="if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true; if (event.preventDefault) event.preventDefault(); else return false;"'+
				'	style="position: '+(w2utils.engine == 'IE5' ? 'absolute' : 'fixed')+'; z-Index: 1199; left: 0px; top: 0px; '+
				'		   padding: 0px; margin: 0px; background-color: '+ options.color +'; width: 100%; height: 100%; opacity: 0;"></div>');	
			// lock screen
			setTimeout(function () {
				$('#w2ui-lock').css({ 
					'-webkit-transition': options.speed +'s opacity', 
					'-moz-transition': options.speed +'s opacity', 
					'-ms-transition': options.speed +'s opacity', 
					'-o-transition': options.speed +'s opacity', 
					'opacity': options.opacity 
				});
			}, 1);
			// add events
			if (options.modal == true) { 
				$('#w2ui-lock').on('mousedown', function () {
					$('#w2ui-lock').css({ 
						'-webkit-transition': '.1s', 
						'-moz-transition': '.1s', 
						'-ms-transition': '.1s', 
						'-o-transition': '.1s', 
						'opacity': '0.6'
					});			
					if (window.getSelection) window.getSelection().removeAllRanges();
				}); 
				$('#w2ui-lock').on('mouseup', function () {
					setTimeout(function () {
						$('#w2ui-lock').css({ 
							'-webkit-transition': '.1s', 
							'-moz-transition': '.1s', 
							'-ms-transition': '.1s', 
							'-o-transition': '.1s', 
							'opacity': options.opacity
						});
					}, 100);
					if (window.getSelection) window.getSelection().removeAllRanges();
				});
			} else {
				$('#w2ui-lock').on('mouseup', function () { w2popup.close(); });
			}
			return true;
		},
		
		unlockScreen: function () {
			if ($('#w2ui-lock').length == 0) return false;	
			var options = $.extend({}, $('#w2ui-popup').data('options'), options);		
			$('#w2ui-lock').css({ 
				'-webkit-transition': options.speed +'s opacity', 
				'-moz-transition': options.speed +'s opacity', 
				'-ms-transition': options.speed +'s opacity', 
				'-o-transition': options.speed +'s opacity', 
				'opacity': 0
			});
			setTimeout(function () { 
				$('#w2ui-lock').remove(); 
			}, options.speed * 1000); 
			return true;
		},
		
		resize: function (width, height, callBack) {
			var options = $('#w2ui-popup').data('options');
			// calculate new position
			if (parseInt($(window).width())  - 10 < parseInt(width))  width  = parseInt($(window).width())  - 10;
			if (parseInt($(window).height()) - 10 < parseInt(height)) height = parseInt($(window).height()) - 10;
			var top  = ((parseInt($(window).height()) - parseInt(height)) / 2) * 0.8;
			var left = (parseInt($(window).width()) - parseInt(width)) / 2;		
			// resize there
			$('#w2ui-popup').css({
				'-webkit-transition': options.speed + 's width, '+ options.speed + 's height, '+ options.speed + 's left, '+ options.speed + 's top',
				'-moz-transition': options.speed + 's width, '+ options.speed + 's height, '+ options.speed + 's left, '+ options.speed + 's top',
				'-ms-transition': options.speed + 's width, '+ options.speed + 's height, '+ options.speed + 's left, '+ options.speed + 's top',
				'-o-transition': options.speed + 's width, '+ options.speed + 's height, '+ options.speed + 's left, '+ options.speed + 's top',
				'top': top,
				'left': left,
				'width': width,
				'height': height
			});
			if (typeof callBack == 'function') {
				setTimeout(function () {
					callBack();
				}, options.speed * 1000);
			}
		}
	}

	// merge in event handling
	$.extend(w2popup, $.w2event);

})();

// ============================================
// --- Common dialogs

var w2alert = function (msg, title, callBack) {
	if (typeof title == 'undefined') title = w2utils.lang('Notification');
	if ($('#w2ui-popup').length > 0) {
		w2popup.message({
			width 	: 400,
			height 	: 150,
			html 	: '<div style="position: absolute; top: 0px; left: 0px; right: 0px; bottom: 40px; overflow: auto">'+
					  '		<div class="w2ui-centered"><div style="font-size: 13px;">'+ msg +'</div></div>'+
					  '</div>'+
					  '<div style="position: absolute; bottom: 7px; left: 0px; right: 0px; text-align: center; padding: 5px">'+
					  '		<input type="button" value="Ok" onclick="w2popup.message();" class="w2ui-popup-button">'+
					  '</div>',
			onClose : function () { 
				if (typeof callBack == 'function') callBack(); 
			} 
		});
	} else {
		w2popup.open({
			width 	: 450,
			height 	: 200,
			showMax : false,
			title 	: title,
			body    : '<div class="w2ui-centered"><div style="font-size: 13px;">' + msg +'</div></div>',
			buttons : '<input type="button" value="'+ w2utils.lang('Ok') +'" class="w2ui-popup-button" onclick="w2popup.close();">',
			onClose : function () { 
				if (typeof callBack == 'function') callBack(); 
			} 
		});
	}
};

var w2confirm = function (msg, title, callBack) {
	if (typeof callBack == 'undefined' || typeof title == 'function') {
		callBack = title; 
		title = w2utils.lang('Confirmation');
	}
	if (typeof title == 'undefined') {
		title = w2utils.lang('Confirmation');
	}
	if ($('#w2ui-popup').length > 0) {
		w2popup.message({
			width 	: 400,
			height 	: 150,
			html 	: '<div style="position: absolute; top: 0px; left: 0px; right: 0px; bottom: 40px; overflow: auto">'+
					  '		<div class="w2ui-centered"><div style="font-size: 13px;">'+ msg +'</div></div>'+
					  '</div>'+
					  '<div style="position: absolute; bottom: 7px; left: 0px; right: 0px; text-align: center; padding: 5px">'+
					  '		<input id="No" type="button" value="'+ w2utils.lang('No') +'" class="w2ui-popup-button">'+
					  '		<input id="Yes" type="button" value="'+ w2utils.lang('Yes') +'" class="w2ui-popup-button">'+
					  '</div>',
			onOpen: function () {
				$('#w2ui-popup .w2ui-popup-message .w2ui-popup-button').on('click', function (event) {
					w2popup.message();
					if (typeof callBack == 'function') callBack(event.target.id);
				});
			},
			onKeydown: function (event) {
				switch (event.originalEvent.keyCode) {
					case 13: // enter
						if (typeof callBack == 'function') callBack('Yes');
						w2popup.message();
						break
					case 27: // esc
						if (typeof callBack == 'function') callBack('No');
						w2popup.message();
						break
				}
			} 
		});
	} else {
		w2popup.open({
			width 		: 450,
			height 		: 200,
			title   	: title,
			modal		: true,
			showClose	: false,
			body    	: '<div class="w2ui-centered"><div style="font-size: 13px;">' + msg +'</div></div>',
			buttons 	: '<input id="No" type="button" value="'+ w2utils.lang('No') +'" class="w2ui-popup-button">'+
					  	  '<input id="Yes" type="button" value="'+ w2utils.lang('Yes') +'" class="w2ui-popup-button">',
			onOpen: function (event) {
				event.onComplete = function () {
					$('#w2ui-popup .w2ui-popup-button').on('click', function (event) {
						w2popup.close();
						if (typeof callBack == 'function') callBack(event.target.id);
					});
				}
			},
			onKeydown: function (event) {
				switch (event.originalEvent.keyCode) {
					case 13: // enter
						if (typeof callBack == 'function') callBack('Yes');
						w2popup.close();
						break
					case 27: // esc
						if (typeof callBack == 'function') callBack('No');
						w2popup.close();
						break
				}
			} 
		});
	}
};