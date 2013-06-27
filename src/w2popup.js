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
*
* == 1.3 changes ==
*	- keyboard esc - close
*
************************************************************************/

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
		if (typeof options == 'undefined') options = {};
		// load options from markup
		var dlgOptions = {};
		if ($(this).length > 0 ) {
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
			if (parseInt($(this).css('width')) != 0)  dlgOptions['width']  = parseInt($(this).css('width'));
			if (parseInt($(this).css('height')) != 0) dlgOptions['height'] = parseInt($(this).css('height'));
		}
		// show popup
		return window.w2popup[method]($.extend({}, dlgOptions, options));
	};
	
	// ====================================================
	// -- Implementation of core functionality (SINGELTON)
	
	window.w2popup = {	
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
			transition		: null,
			onUnlock		: null,
			onOpen			: null,
			onChange		: null, 
			onBeforeClose	: null,
			onClose			: null,
			onMax			: null,
			onMin			: null
		},
		
		open: function (options) {
			// get old options and merge them
			var old_options = $('#w2ui-popup').data('options');
			var options = $.extend({}, this.defaults, {
				body: '',
				renderTime: 0,
				onOpen: null,
				onChange: null,
				onBeforeClose: null,
				onClose: null
			}, old_options, options);
	
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
			var top  = ((parseInt(height) - parseInt(options.height)) / 2) * 0.8;
			var left = (parseInt(width) - parseInt(options.width)) / 2;
			
			// check if message is already displayed
			if ($('#w2ui-popup').length == 0) {
				// output message
				window.w2popup.lock($.extend({}, options, {
					onMouseDown: options.modal ? function () {
						$('#w2ui-lock').css({ 
							'-webkit-transition': '.1s', 
							'-moz-transition': '.1s', 
							'-ms-transition': '.1s', 
							'-o-transition': '.1s', 
							'opacity': '0.6'
						});			
						if (window.getSelection) window.getSelection().removeAllRanges();
					} : null,
					onMouseUp: options.modal ? function () {
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
					} : function () { 
						$().w2popup('close'); 
					},
					onClick: function (event) {
						if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;
					}
				}));
			
				var msg = '<div id="w2ui-popup" class="w2ui-popup" style="'+
								'width: '+ parseInt(options.width) +'px; height: '+ parseInt(options.height) +'px; opacity: 0; '+
								'-webkit-transform: scale(0.8); -moz-transform: scale(0.8); -ms-transform: scale(0.8); -o-transform: scale(0.8); '+
								'left: '+ left +'px; top: '+ top +'px;">';
				if (options.title != '') { 
					msg +='<div class="w2ui-msg-title">'+
						  (options.showClose ? '<div class="w2ui-msg-button w2ui-msg-close" onclick="$().w2popup(\'close\'); '+
						  					   'if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;">Close</div>' : '')+ 
						  (options.showMax ? '<div class="w2ui-msg-button w2ui-msg-max" onclick="$().w2popup(\'toggle\')">Max</div>' : '') + 
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
					if (typeof options.onOpen == 'function') { setTimeout(function () { options.onOpen(); }, 1); }
				}, options.speed * 1000);
			} else {
				// check if size changed
				if (typeof old_options == 'undefined' || old_options['width'] != options['width'] || old_options['height'] != options['height']) {
					$('#w2ui-panel').remove();
					window.w2popup.resize(options.width, options.height);
				}
				// show new items
				var body = $('#w2ui-popup .w2ui-box2 > .w2ui-msg-body').html(options.body);
				if (body.length > 0) body[0].style.cssText = options.style;
				$('#w2ui-popup .w2ui-msg-buttons').html(options.buttons);
				$('#w2ui-popup .w2ui-msg-title').html(
					  (options.showClose ? '<div class="w2ui-msg-button w2ui-msg-close" onclick="$().w2popup(\'close\')">Close</div>' : '')+ 
					  (options.showMax ? '<div class="w2ui-msg-button w2ui-msg-max" onclick="$().w2popup(\'max\')">Max</div>' : '') + 
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
					if (typeof options.onChange == 'function') options.onChange();
				}, 1);
			}		
			// save new options
			$('#w2ui-popup').data('options', options);
			// keyboard events 
			if (options.keyboard) $(document).on('keydown', this.doKeydown);
			// finalize
			this.initMove();			
			return this;		
		},

		doKeydown: function (event) {
			var options = $('#w2ui-popup').data('options');
			if (!options.keyboard) return;
			switch (event.keyCode) {
				case 27: 
					if (options.modal === true) {
						$('#w2ui-lock').css({ 'opacity': '0.6' });
						setTimeout(function () { $('#w2ui-lock').css({ 'opacity': options.opacity }); }, 400);
						return;					
					}
					$().w2popup('close');
					break;
			}
		},
		
		close: function (options) {
			var options = $.extend({}, $('#w2ui-popup').data('options'), options);
			if (typeof options.onBeforeClose == 'function') {
				if (options.onBeforeClose() === false) return;
			}
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
			window.w2popup.unlock({
				opacity: 0,
				onFinish: options.onFinish ? options.onFinish : null			
			});
			setTimeout(function () {
				$('#w2ui-popup').remove();
				$('#w2ui-panel').remove();
			}, options.speed * 1000);				
			if (typeof options.onClose == 'function') {
				options.onClose();
			}
			// remove keyboard events
			if (options.keyboard) $(document).off('keydown', this.doKeydown);			
		},
		
		toggle: function () {
			var options = $('#w2ui-popup').data('options');
			if (options.maximized === true) $().w2popup('min'); else $().w2popup('max');
		},
		
		max: function () {
			var options = $('#w2ui-popup').data('options');
			if (options.maximized === true) return;
			window.w2popup.resize(10000, 10000, function () {
				if (typeof options.onMax == 'function') options.onMax();
			});
			// save options
			options.maximized = true;
			options.prevSize  = $('#w2ui-popup').css('width')+':'+$('#w2ui-popup').css('height');
			$('#w2ui-popup').data('options', options);
		},

		min: function () {
			var options = $('#w2ui-popup').data('options');
			if (options.maximized !== true) return;
			var size = options.prevSize.split(':');
			window.w2popup.resize(size[0], size[1], function () {
				if (typeof options.onMin == 'function') options.onMin();
			});
			// save options
			options.maximized = false;
			options.prevSize  = null;
			$('#w2ui-popup').data('options', options);
		},

		get: function () {
			return $('#w2ui-popup').data('options');
		},

		set: function (options) {
			$().w2popup('open', options);
		},
		
		clear: function() {
			$('#w2ui-popup .w2ui-msg-title').html('');
			$('#w2ui-popup .w2ui-msg-body').html('');
			$('#w2ui-popup .w2ui-msg-buttons').html('');
		},

		reset: function () {
			window.w2popup.open(window.w2popup.defaults);
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
			if (parseInt(options.width) < 10)  options.width  = 10;
			if (parseInt(options.height) < 10) options.height = 10;
			if (typeof options.hideOnClick == 'undefined') options.hideOnClick = true;

			var head = $('#w2ui-popup .w2ui-msg-title');
			if ($('#w2ui-popup .w2ui-popup-message').length == 0) {
				var pwidth = parseInt($('#w2ui-popup').width());
				$('#w2ui-popup .w2ui-box1')
					.before('<div class="w2ui-popup-message" style="display: none; ' +
								(head.length == 0 ? 'top: 0px;' : 'top: '+ w2utils.getSize(head, 'height') + 'px;') +
					        	(typeof options.width  != 'undefined' ? 'width: '+ options.width + 'px; left: '+ ((pwidth - options.width) / 2) +'px;' : 'left: 10px; right: 10px;') +
					        	(typeof options.height != 'undefined' ? 'height: '+ options.height + 'px;' : 'bottom: 6px;') +
					        	'-webkit-transition: .3s; -moz-transition: .3s; -ms-transition: .3s; -o-transition: .3s;"' +
								(options.hideOnClick === true ? 'onclick="$().w2popup(\'message\');"' : '') + '>'+
							'</div>');
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
				$('#w2ui-popup .w2ui-msg-buttons').fadeOut('slow');
				if (typeof options.onOpen == 'function') options.onOpen();
			} else {
				$('#w2ui-popup .w2ui-msg-buttons').fadeIn('slow');
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
			setTimeout(function () {
				if (display != 'none') {
					$('#w2ui-popup .w2ui-popup-message').remove();
					if (typeof options.onClose == 'function') options.onClose();
				}
			}, 300);
		},
		
		// --- INTERNAL FUNCTIONS
		
		lock: function (options) {
			if ($('#w2ui-lock').length > 0) return false;
			var options = $.extend({}, { 'onUnlock': null, 'onMouseDown': null, 'onMouseUp': null }, options);
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
				$('body, body *').css({
					//'text-shadow': '0px 0px 5px rgb(0,0,0)',
					//'color': 'transparent'
				});	
			}, 1);
			//$('body').data('_old_overflow', $('body').css('overflow')).css({ 'overflow': 'hidden' });		
			// lock events
			if (typeof options.onMouseDown == 'function') { 
				$('#w2ui-lock').bind('mousedown', options.onMouseDown); 
			}
			if (typeof options.onMouseUp == 'function') { 
				$('#w2ui-lock').bind('mouseup', options.onMouseUp); 
			}
			return true;
		},
		
		unlock: function (options) {
			if ($('#w2ui-lock').length == 0) return false;	
			var options = $.extend({}, $('#w2ui-popup').data('options'), options);		
			$('#w2ui-lock').css({ 
				'-webkit-transition': options.speed +'s opacity', 
				'-moz-transition': options.speed +'s opacity', 
				'-ms-transition': options.speed +'s opacity', 
				'-o-transition': options.speed +'s opacity', 
				'opacity': options.opacity 
			});
			$('body, body *').css({
				//'text-shadow': '',
				//'color': ''
			});
			//$('body').css({ 'overflow': $('body').data('_old_overflow') });		
			setTimeout(function () { 
				$('#w2ui-lock').remove(); 
				if (typeof options.onUnlock == 'function') {  options.onUnlock(); }
			}, options.speed * 1000); 
			return true;
		},
	
		initMove: function () {
			var obj = this;
			$('#w2ui-popup .w2ui-msg-title')
				.on('mousedown', function () { obj.startMove.apply(obj, arguments); })
				.on('mousemove', function () { obj.doMove.apply(obj, arguments); })
				.on('mouseup',   function () { obj.stopMove.apply(obj, arguments); });
			$('#w2ui-popup .w2ui-msg-body')
				.on('mousemove', function () { obj.doMove.apply(obj, arguments); })
				.on('mouseup',   function () { obj.stopMove.apply(obj, arguments); });
			$('#w2ui-lock')
				.on('mousemove', function () { obj.doMove.apply(obj, arguments); })
				.on('mouseup',   function () { obj.stopMove.apply(obj, arguments); });
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
		},
		
		startMove: function (event) {
			if (!event) event = window.event;
			if (!window.addEventListener) { window.document.attachEvent('onselectstart', function() { return false; } ); }
			this.resizing = true;
			this.tmp_x = event.screenX;
			this.tmp_y = event.screenY;
			if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;
			if (event.preventDefault) event.preventDefault(); else return false;
		},
		
		doMove: function (evnt) {
			if (this.resizing != true) return;
			if (!evnt) evnt = window.event;
			this.tmp_div_x = (evnt.screenX - this.tmp_x); 
			this.tmp_div_y = (evnt.screenY - this.tmp_y); 
			$('#w2ui-popup').css({
				'-webkit-transition': 'none',
				'-webkit-transform': 'translate3d('+ this.tmp_div_x +'px, '+ this.tmp_div_y +'px, 0px)',
				'-moz-transition': 'none',
				'-moz-transform': 'translate('+ this.tmp_div_x +'px, '+ this.tmp_div_y +'px)',
				'-ms-transition': 'none',
				'-ms-transform': 'translate('+ this.tmp_div_x +'px, '+ this.tmp_div_y +'px)',
				'-o-transition': 'none',
				'-o-transform': 'translate('+ this.tmp_div_x +'px, '+ this.tmp_div_y +'px)'
			});
			$('#w2ui-panel').css({
				'-webkit-transition': 'none',
				'-webkit-transform': 'translate3d('+ this.tmp_div_x +'px, '+ this.tmp_div_y +'px, 0px)',
				'-moz-transition': 'none',
				'-moz-transform': 'translate('+ this.tmp_div_x +'px, '+ this.tmp_div_y +'px)',
				'-ms-transition': 'none',
				'-ms-transform': 'translate('+ this.tmp_div_x +'px, '+ this.tmp_div_y +'px',
				'-o-transition': 'none',
				'-o-transform': 'translate('+ this.tmp_div_x +'px, '+ this.tmp_div_y +'px)'
			});
		},
	
		stopMove: function (evnt) {
			if (this.resizing != true) return;
			if (!evnt) evnt = window.event;
			this.tmp_div_x = (evnt.screenX - this.tmp_x); 
			this.tmp_div_y = (evnt.screenY - this.tmp_y); 			
			$('#w2ui-popup').css({
				'-webkit-transition': 'none',
				'-webkit-transform': 'translate3d(0px, 0px, 0px)',
				'-moz-transition': 'none',
				'-moz-transform': 'translate(0px, 0px)',
				'-ms-transition': 'none',
				'-ms-transform': 'translate(0px, 0px)',
				'-o-transition': 'none',
				'-o-transform': 'translate(0px, 0px)',
				'left': (parseInt($('#w2ui-popup').css('left')) + parseInt(this.tmp_div_x)) + 'px',
				'top':	(parseInt($('#w2ui-popup').css('top'))  + parseInt(this.tmp_div_y)) + 'px'
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
				'left': (parseInt($('#w2ui-panel').css('left')) + parseInt(this.tmp_div_x)) + 'px',
				'top':	(parseInt($('#w2ui-panel').css('top'))  + parseInt(this.tmp_div_y)) + 'px'
			});
			delete this.resizing;
		}		
	}

	window.w2alert = function (msg, title) {
		if (typeof title == 'undefined') {
			title = w2utils.lang('Notification');
		}
		$().w2popup({
			width 	: 450,
			height 	: 200,
			title   : title,
			body    : '<div class="w2ui-alert-body">' + msg +'</div>',
			buttons : '<input type="button" value="'+ w2utils.lang('Ok') +'" class="w2ui-alert-button" onclick="$().w2popup(\'close\');">'
		});
	};

	window.w2confirm = function (msg, title, callBack) {
		if (typeof callBack == 'undefined' || typeof title == 'function') {
			callBack = title; 
			title = w2utils.lang('Confirmation');
		}
		if (typeof title == 'undefined') {
			title = w2utils.lang('Confirmation');
		}
		$().w2popup({
			width 		: 450,
			height 		: 200,
			title   	: title,
			modal		: true,
			showClose	: false,
			body    	: '<div class="w2ui-confirm-body">' + msg +'</div>',
			buttons 	: '<input id="buttonNo" type="button" value="'+ w2utils.lang('No') +'" class="w2ui-confirm-button">&nbsp;'+
					  	  '<input id="buttonYes" type="button" value="'+ w2utils.lang('Yes') +'" class="w2ui-confirm-button">'
		});
		$('#w2ui-popup #buttonNo').on('click', function () {
			$().w2popup('close');
			if (typeof callBack == 'function') callBack('No');
		});
		$('#w2ui-popup #buttonYes').on('click', function () {
			$().w2popup('close');
			if (typeof callBack == 'function') callBack('Yes');
		});
	};

})();
