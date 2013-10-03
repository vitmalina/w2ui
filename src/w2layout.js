/************************************************************************
*   Library: Web 2.0 UI for jQuery (using prototypical inheritance)
*   - Following objects defined
* 		- w2ui.w2layout - layout widget
*		- $.w2layout	- jQuery wrapper
*   - Dependencies: jQuery, w2utils, w2toolbar, w2tabs
*
* == NICE TO HAVE ==
*	- onResize for the panel
*	- problem with layout.html (see in 1.3)
*	- add panel title
* 
************************************************************************/

(function () {
	var w2layout = function (options) {
		this.box		= null		// DOM Element that holds the element
		this.name		= null;		// unique name for w2ui
		this.panels		= [];
		this.tmp 		= {};

		this.padding	= 1;		// panel padding
		this.resizer	= 4;		// resizer width or height
		this.style		= '';

		this.onShow		= null;
		this.onHide		= null;
		this.onResizing = null;
		this.onRender	= null;
		this.onRefresh	= null;
		this.onResize	= null;
		this.onDestroy	= null
		
		$.extend(true, this, w2obj.layout, options);
	};
	
	// ====================================================
	// -- Registers as a jQuery plugin
	
	$.fn.w2layout = function(method) {
		if (typeof method === 'object' || !method ) {
			// check required parameters
			if (!method || typeof method.name == 'undefined') {
				console.log('ERROR: The parameter "name" is required but not supplied in $().w2layout().');
				return;
			}
			if (typeof w2ui[method.name] != 'undefined') {
				console.log('ERROR: The parameter "name" is not unique. There are other objects already created with the same name (obj: '+ method.name +').');
				return;			
			}
			if (!w2utils.isAlphaNumeric(method.name)) {
				console.log('ERROR: The parameter "name" has to be alpha-numeric (a-z, 0-9, dash and underscore). ');
				return;			
			}
			var panels = method.panels;
			var object = new w2layout(method);
			$.extend(object, { handlers: [], panels: [] });
			// add defined panels panels
			for (var p in panels) { 
				object.panels[p] = $.extend(true, {}, w2layout.prototype.panel, panels[p]); 
				if ($.isPlainObject(object.panels[p].tabs) || $.isArray(object.panels[p].tabs)) initTabs(object, panels[p].type);
				if ($.isPlainObject(object.panels[p].toolbar) || $.isArray(object.panels[p].toolbar)) initToolbar(object, panels[p].type);
			}
			// add all other panels
			for (var p in { 'top':'', 'left':'', 'main':'', 'preview':'', 'right':'', 'bottom':'' }) { 
				if (object.get(p) != null) continue;
				object.panels[p] = $.extend(true, {}, w2layout.prototype.panel, { type: p, hidden: true, size: 50 }); 
			}

			if ($(this).length > 0) {
				object.render($(this)[0]);
			}
			w2ui[object.name] = object;
			return object;		

		} else if (w2ui[$(this).attr('name')]) {
			var obj = w2ui[$(this).attr('name')];
			obj[method].apply(obj, Array.prototype.slice.call(arguments, 1));
			return this;
		} else {
			console.log('ERROR: Method ' +  method + ' does not exist on jQuery.w2layout' );
		}

		function initTabs(object, panel, tabs) {
			var pan = object.get(panel);
			if (pan != null && typeof tabs == 'undefined') tabs = pan.tabs;
			if (pan == null || tabs == null) return false;
			// instanciate tabs
			if ($.isArray(tabs)) tabs = { tabs: tabs };
			$().w2destroy(object.name + '_' + panel + '_tabs'); // destroy if existed
			pan.tabs = $().w2tabs($.extend({}, tabs, { owner: object, name: object.name + '_' + panel + '_tabs' }));
			return true;
		}
		
		function initToolbar(object, panel, toolbar) {
			var pan = object.get(panel);
			if (pan != null && typeof toolbar == 'undefined') toolbar = pan.toolbar;
			if (pan == null || toolbar == null) return false;
			// instanciate toolbar
			if ($.isArray(toolbar)) toolbar = { items: toolbar };
			$().w2destroy(object.name + '_' + panel + '_toolbar'); // destroy if existed
			pan.toolbar = $().w2toolbar($.extend({}, toolbar, { owner: object, name: object.name + '_' + panel + '_toolbar' }));
			return true;
		}
	};
	
	// ====================================================
	// -- Implementation of core functionality
	
	w2layout.prototype = {
		// default setting for a panel
		panel: {
			type 		: null,		// left, right, top, bottom
			size 		: 100, 		// width or height depending on panel name
			minSize 	: 20,
			hidden 		: false,
			resizable 	: false,
			overflow 	: 'auto',
			style 		: '',
			content 	: '',			// can be String or Object with .render(box) method
			tabs		: null,
			toolbar		: null,
			width		: null, 		// read only
			height 		: null, 		// read only
			onRefresh	: null,
			onShow 		: null,
			onHide 		: null
		},

		// alias for content
		html: function (panel, data, transition) {
			return this.content(panel, data, transition);
		},
			
		content: function (panel, data, transition) {
			var obj = this;
			var p = this.get(panel);
			if (panel == 'css') {
				$('#layout_'+ obj.name +'_panel_css').html('<style>'+ data +'</style>');
				return true;
			}
			if (p == null) return false;
			if ($('#layout_'+ this.name + '_panel2_'+ p.type).length > 0) return false;
			$('#layout_'+ this.name + '_panel_'+ p.type).scrollTop(0);
			if (data == null || typeof data == 'undefined') {
				return p.content;
			} else {
				if (data instanceof jQuery) {
					console.log('ERROR: You can not pass jQuery object to w2layout.content() method');
					return false;
				}
				// remove foreign classes and styles
				var tmp = $('#'+ 'layout_'+ this.name + '_panel_'+ panel + ' > .w2ui-panel-content');
				var panelTop = $(tmp).position().top;
				tmp.attr('class', 'w2ui-panel-content');
				if (tmp.length > 0 && typeof p.style != 'undefined') tmp[0].style.cssText = p.style;
				if (p.content == '') {
					p.content = data;
					if (!p.hidden) this.refresh(panel);
				} else {
					p.content = data;
					if (!p.hidden) {
						if (transition != null && transition != '' && typeof transition != 'undefined') {
							// apply transition
							var nm   = 'layout_'+ this.name + '_panel_'+ p.type;
							var div1 = $('#'+ nm + ' > .w2ui-panel-content');
							div1.after('<div class="w2ui-panel-content new-panel" style="'+ div1[0].style.cssText +'"></div>');
							var div2 = $('#'+ nm + ' > .w2ui-panel-content.new-panel');
							div1.css('top', panelTop);
							div2.css('top', panelTop);
							if (typeof data == 'object') {
								data.box = div2[0]; // do not do .render(box);
								data.render();
							} else {
								div2.html(data);
							}
							w2utils.transition(div1[0], div2[0], transition, function () {
								div1.remove();
								div2.removeClass('new-panel');
								// IE Hack
								if (window.navigator.userAgent.indexOf('MSIE')) setTimeout(function () { obj.resize(); }, 100);
							});
						} else {
							if (!p.hidden) this.refresh(panel);
						}
					}
				}
			}
			// IE Hack
			if (window.navigator.userAgent.indexOf('MSIE')) setTimeout(function () { obj.resize(); }, 100);
			return true;
		},
		
		load: function (panel, url, transition, onLoad) {
			var obj = this;
			if (panel == 'css') {
				$.get(url, function (data, status, xhr) {					
					obj.content(panel, xhr.responseText);
					if (onLoad) onLoad();
				});
				return true;
			}
			if (this.get(panel) != null) {
				$.get(url, function (data, status, xhr) {
					obj.content(panel, xhr.responseText, transition);
					if (onLoad) onLoad();
					// IE Hack
					if (window.navigator.userAgent.indexOf('MSIE')) setTimeout(function () { obj.resize(); }, 100);
				});
				return true;
			}
			return false;
		},

		sizeTo: function (panel, size) {
			var obj = this;
			var pan = obj.get(panel);
			if (pan == null) return false;
			// resize
			$(obj.box).find(' > div .w2ui-panel').css({
				'-webkit-transition': '.35s',
				'-moz-transition'	: '.35s',
				'-ms-transition'	: '.35s',
				'-o-transition'		: '.35s'
			});
			setTimeout(function () { 
				obj.set(panel, { size: size }); 
			}, 1);
			// clean
			setTimeout(function () { 
				$(obj.box).find(' > div .w2ui-panel').css({
					'-webkit-transition': '0s',
					'-moz-transition'	: '0s',
					'-ms-transition'	: '0s',
					'-o-transition'		: '0s'
				}); 
				obj.resize();
			}, 500);
			return true;
		},

		show: function (panel, immediate) {
			var obj = this;
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'show', target: panel, object: this.get(panel), immediate: immediate });	
			if (eventData.isCancelled === true) return false;
	
			var p = obj.get(panel);
			if (p == null) return false;
			p.hidden = false;
			if (immediate === true) {
				$('#layout_'+ obj.name +'_panel_'+panel).css({ 'opacity': '1' });	
				if (p.resizabled) $('#layout_'+ obj.name +'_resizer_'+panel).show();
				obj.trigger($.extend(eventData, { phase: 'after' }));	
				obj.resize();
			} else {			
				if (p.resizabled) $('#layout_'+ obj.name +'_resizer_'+panel).show();
				// resize
				$('#layout_'+ obj.name +'_panel_'+panel).css({ 'opacity': '0' });	
				$(obj.box).find(' > div .w2ui-panel').css({
					'-webkit-transition': '.2s',
					'-moz-transition'	: '.2s',
					'-ms-transition'	: '.2s',
					'-o-transition'		: '.2s'
				});
				setTimeout(function () { obj.resize(); }, 1);
				// show
				setTimeout(function() {
					$('#layout_'+ obj.name +'_panel_'+ panel).css({ 'opacity': '1' });	
				}, 250);
				// clean
				setTimeout(function () { 
					$(obj.box).find(' > div .w2ui-panel').css({
						'-webkit-transition': '0s',
						'-moz-transition'	: '0s',
						'-ms-transition'	: '0s',
						'-o-transition'		: '0s'
					}); 
					obj.trigger($.extend(eventData, { phase: 'after' }));	
					obj.resize();
				}, 500);
			}
			return true;
		},
		
		hide: function (panel, immediate) {
			var obj = this;
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'hide', target: panel, object: this.get(panel), immediate: immediate });	
			if (eventData.isCancelled === true) return false;
	
			var p = obj.get(panel);
			if (p == null) return false;
			p.hidden = true;		
			if (immediate === true) {
				$('#layout_'+ obj.name +'_panel_'+panel).css({ 'opacity': '0'	});
				$('#layout_'+ obj.name +'_resizer_'+panel).hide();
				obj.trigger($.extend(eventData, { phase: 'after' }));	
				obj.resize();
			} else {
				$('#layout_'+ obj.name +'_resizer_'+panel).hide();
				// hide
				$(obj.box).find(' > div .w2ui-panel').css({
					'-webkit-transition': '.2s',
					'-moz-transition'	: '.2s',
					'-ms-transition'	: '.2s',
					'-o-transition'		: '.2s'
				});
				$('#layout_'+ obj.name +'_panel_'+panel).css({ 'opacity': '0'	});
				setTimeout(function () { obj.resize(); }, 1);
				// clean
				setTimeout(function () { 
					$(obj.box).find(' > div .w2ui-panel').css({
						'-webkit-transition': '0s',
						'-moz-transition'	: '0s',
						'-ms-transition'	: '0s',
						'-o-transition'		: '0s'
					}); 
					obj.trigger($.extend(eventData, { phase: 'after' }));	
					obj.resize();
				}, 500);
			}
			return true;
		},
		
		toggle: function (panel, immediate) {
			var p = this.get(panel);
			if (p == null) return false;
			if (p.hidden) return this.show(panel, immediate); else return this.hide(panel, immediate);
		},
		
		set: function (panel, options) {
			var obj = this.get(panel, true);
			if (obj == null) return false;
			$.extend(this.panels[obj], options);
			this.refresh(panel);
			this.resize(); // resize is needed when panel size is changed
			return true;		
		},
	
		get: function (panel, returnIndex) {
			var obj = null;
			for (var p in this.panels) {
				if (this.panels[p].type == panel) { 
					if (returnIndex === true) return p; else return this.panels[p];
				}
			}
			return null;
		},

		el: function (panel) {
			var el = $('#layout_'+ this.name +'_panel_'+ panel +' .w2ui-panel-content');
			if (el.length != 1) return null;
			return el[0];
		},

		render: function (box) {
			var obj = this;
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection 
			var time = (new Date()).getTime();
			// event before
			var eventData = obj.trigger({ phase: 'before', type: 'render', target: obj.name, box: box });	
			if (eventData.isCancelled === true) return false;
	
			if (typeof box != 'undefined' && box != null) { 
				if ($(obj.box).find('#layout_'+ obj.name +'_panel_main').length > 0) {
					$(obj.box)
						.removeAttr('name')
						.removeClass('w2ui-layout')
						.html('');
				}
				obj.box = box;
			}
			if (!obj.box) return false;
			$(obj.box)
				.attr('name', obj.name)
				.addClass('w2ui-layout')
				.html('<div></div>');
			if ($(obj.box).length > 0) $(obj.box)[0].style.cssText += obj.style;
			// create all panels
			var tmp = ['top', 'left', 'main', 'preview', 'right', 'bottom'];
			for (var t in tmp) {
				var pan  = obj.get(tmp[t]);
				var html =  '<div id="layout_'+ obj.name + '_panel_'+ tmp[t] +'" class="w2ui-panel">'+
							'	<div class="w2ui-panel-tabs"></div>'+
							'	<div class="w2ui-panel-toolbar"></div>'+
							'	<div class="w2ui-panel-content"></div>'+
							'</div>'+
							'<div id="layout_'+ obj.name + '_resizer_'+ tmp[t] +'" class="w2ui-resizer"></div>';
				$(obj.box).find(' > div').append(html);
				// tabs are rendered in refresh()
			}
			$(obj.box).find(' > div')
				.append('<div id="layout_'+ obj.name + '_panel_css" style="position: absolute; top: 10000px;"></div');
			obj.refresh(); // if refresh is not called here, the layout will not be available right after initialization
			// process event
			obj.trigger($.extend(eventData, { phase: 'after' }));	
			// reinit events
			setTimeout(function () { // needed this timeout to allow browser to render first if there are tabs or toolbar
				obj.resize();
				initEvents();
			}, 0);
			return (new Date()).getTime() - time;

			function initEvents() {
				obj.tmp.events = {
					resize : function (event) { 
						w2ui[obj.name].resize()	
					},
					resizeStart : resizeStart,
					mousemove 	: resizeMove,
					mouseup 	: resizeStop
				};
				$(window).on('resize', obj.tmp.events.resize);
				$(document).on('mousemove', obj.tmp.events.mousemove);
				$(document).on('mouseup', obj.tmp.events.mouseup);
			}

			function resizeStart(type, evnt) {
				if (!obj.box) return;
				if (!evnt) evnt = window.event;
				if (!window.addEventListener) { window.document.attachEvent('onselectstart', function() { return false; } ); }
				obj.tmp.resize = {
					type	: type,
					x 		: evnt.screenX,
					y 		: evnt.screenY,
					div_x 	: 0,
					div_y 	: 0,
					value	: 0
				};
				if (type == 'left' || type == 'right') {
					obj.tmp.resize.value = parseInt($('#layout_'+ obj.name + '_resizer_'+ type)[0].style.left);
				}
				if (type == 'top' || type == 'preview' || type == 'bottom') {
					obj.tmp.resize.value = parseInt($('#layout_'+ obj.name + '_resizer_'+ type)[0].style.top);
				}
			}

			function resizeStop(evnt) {
				if (!obj.box) return;
				if (!evnt) evnt = window.event;
				if (!window.addEventListener) { window.document.attachEvent('onselectstart', function() { return false; } ); }
				if (typeof obj.tmp.resize == 'undefined') return;
				// set new size
				if (obj.tmp.div_x != 0 || obj.tmp.resize.div_y != 0) { // only recalculate if changed
					var ptop 	= obj.get('top');
					var pbottom	= obj.get('bottom');
					var panel 	= obj.get(obj.tmp.resize.type);
					var height 	= parseInt($(obj.box).height());
					var width 	= parseInt($(obj.box).width());
					var str 	= String(panel.size);
					switch (obj.tmp.resize.type) {
						case 'top':
							var ns = parseInt(panel.sizeCalculated) + obj.tmp.resize.div_y;
							var nd = 0;
							break;
						case 'bottom':
							var ns = parseInt(panel.sizeCalculated) - obj.tmp.resize.div_y;
							var nd = 0;
							break;
						case 'preview':
							var ns = parseInt(panel.sizeCalculated) - obj.tmp.resize.div_y;
							var nd = (ptop && !ptop.hidden ? ptop.sizeCalculated : 0) 
								   + (pbottom && !pbottom.hidden ? pbottom.sizeCalculated : 0);
							break;
						case 'left':
							var ns = parseInt(panel.sizeCalculated) + obj.tmp.resize.div_x;
							var nd = 0;
							break;
						case 'right': 
							var ns = parseInt(panel.sizeCalculated) - obj.tmp.resize.div_x;
							var nd = 0;
							break;
					}	
					// set size
					if (str.substr(str.length-1) == '%') {
						panel.size = Math.floor(ns * 100 / 
							(panel.type == 'left' || panel.type == 'right' ? width : height - nd) * 100) / 100 + '%';
					} else {
						panel.size = ns;
					}
					obj.resize();
				}
				$('#layout_'+ obj.name + '_resizer_'+ obj.tmp.resize.type).removeClass('active');
				delete obj.tmp.resize;
			}

			function resizeMove(evnt) {
				if (!obj.box) return;
				if (!evnt) evnt = window.event;
				if (typeof obj.tmp.resize == 'undefined') return;
				var panel = obj.get(obj.tmp.resize.type);
				// event before
				var eventData = obj.trigger({ phase: 'before', type: 'resizing', target: obj.tmp.resize.type, object: panel, originalEvent: evnt });	
				if (eventData.isCancelled === true) return false;

				var p = $('#layout_'+ obj.name + '_resizer_'+ obj.tmp.resize.type);
				if (!p.hasClass('active')) p.addClass('active');
				obj.tmp.resize.div_x = (evnt.screenX - obj.tmp.resize.x); 
				obj.tmp.resize.div_y = (evnt.screenY - obj.tmp.resize.y); 
				// left panel -> drag
				if (obj.tmp.resizing == 'left' &&  (obj.get('left').minSize - obj.tmp.resize.div_x > obj.get('left').width)) {
					obj.tmp.resize.div_x = obj.get('left').minSize - obj.get('left').width;
				}
				if (obj.tmp.resize.type == 'left' && (obj.get('main').minSize + obj.tmp.resize.div_x > obj.get('main').width)) {
					obj.tmp.resize.div_x = obj.get('main').width - obj.get('main').minSize;
				}
				// right panel -> drag 
				if (obj.tmp.resize.type == 'right' &&  (obj.get('right').minSize + obj.tmp.resize.div_x > obj.get('right').width)) {
					obj.tmp.resize.div_x = obj.get('right').width - obj.get('right').minSize;
				}
				if (obj.tmp.resize.type == 'right' && (obj.get('main').minSize - obj.tmp.resize.div_x > obj.get('main').width)) {
					obj.tmp.resize.div_x =  obj.get('main').minSize - obj.get('main').width;
				}
				// top panel -> drag
				if (obj.tmp.resize.type == 'top' &&  (obj.get('top').minSize - obj.tmp.resize.div_y > obj.get('top').height)) {
					obj.tmp.resize.div_y = obj.get('top').minSize - obj.get('top').height;
				}
				if (obj.tmp.resize.type == 'top' && (obj.get('main').minSize + obj.tmp.resize.div_y > obj.get('main').height)) {
					obj.tmp.resize.div_y = obj.get('main').height - obj.get('main').minSize;
				}
				// bottom panel -> drag 
				if (obj.tmp.resize.type == 'bottom' &&  (obj.get('bottom').minSize + obj.tmp.resize.div_y > obj.get('bottom').height)) {
					obj.tmp.resize.div_y = obj.get('bottom').height - obj.get('bottom').minSize;
				}
				if (obj.tmp.resize.type == 'bottom' && (obj.get('main').minSize - obj.tmp.resize.div_y > obj.get('main').height)) {
					obj.tmp.resize.div_y =  obj.get('main').minSize - obj.get('main').height;
				}
				// preview panel -> drag 
				if (obj.tmp.resize.type == 'preview' &&  (obj.get('preview').minSize + obj.tmp.resize.div_y > obj.get('preview').height)) {
					obj.tmp.resize.div_y = obj.get('preview').height - obj.get('preview').minSize;
				}
				if (obj.tmp.resize.type == 'preview' && (obj.get('main').minSize - obj.tmp.resize.div_y > obj.get('main').height)) {
					obj.tmp.resize.div_y =  obj.get('main').minSize - obj.get('main').height;
				}
				switch(obj.tmp.resize.type) {
					case 'top':
					case 'preview':
					case 'bottom':
						obj.tmp.resize.div_x = 0;
						if (p.length > 0) p[0].style.top = (obj.tmp.resize.value + obj.tmp.resize.div_y) + 'px';
						break;
					case 'left':
					case 'right':
						obj.tmp.resize.div_y = 0;
						if (p.length > 0) p[0].style.left = (obj.tmp.resize.value + obj.tmp.resize.div_x) + 'px';
						break;
				}
				// event after
				obj.trigger($.extend(eventData, { phase: 'after' }));	
			}
		},
		
		refresh: function (panel) {
			var obj = this;
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection 
			if (typeof panel == 'undefined') panel = null;
			var time = (new Date()).getTime();
			// event before
			var eventData = obj.trigger({ phase: 'before', type: 'refresh', target: (typeof panel != 'undefined' ? panel : obj.name), object: obj.get(panel) });	
			if (eventData.isCancelled === true) return;
	
			// obj.unlock(panel);
			if (panel != null && typeof panel != 'undefined') {
				var p = obj.get(panel);
				if (p == null) return;
				// apply properties to the panel
				var el = $('#layout_'+ obj.name +'_panel_'+ panel).css({ display: p.hidden ? 'none' : 'block' });
				el = el.find('.w2ui-panel-content');
				if (el.length > 0) el.css('overflow', p.overflow)[0].style.cssText += ';' + p.style;
				if (p.resizable === true) {
					$('#layout_'+ this.name +'_resizer_'+ panel).show(); 
				} else {
					$('#layout_'+ this.name +'_resizer_'+ panel).hide(); 					
				}
				// insert content
				if (typeof p.content == 'object' && p.content.render) {
					p.content.box = $('#layout_'+ obj.name + '_panel_'+ p.type +' > .w2ui-panel-content')[0];
					p.content.render(); // do not do .render(box);
				} else {
					$('#layout_'+ obj.name + '_panel_'+ p.type +' > .w2ui-panel-content').html(p.content);
				}
				// if there are tabs and/or toolbar - render it
				var tmp = $(obj.box).find('#layout_'+ obj.name + '_panel_'+ p.type +' .w2ui-panel-tabs');
				if (p.tabs != null) { 
					if (tmp.find('[name='+ p.tabs.name +']').length == 0) tmp.w2render(p.tabs); else p.tabs.refresh(); 
				} else {
					tmp.html('').removeClass('w2ui-tabs').hide();
				}
				var tmp = $(obj.box).find('#layout_'+ obj.name + '_panel_'+ p.type +' .w2ui-panel-toolbar');
				if (p.toolbar != null) { 
					if (tmp.find('[name='+ p.toolbar.name +']').length == 0) tmp.w2render(p.toolbar); else p.toolbar.refresh(); 
				} else {
					tmp.html('').removeClass('w2ui-toolbar').hide();
				}
			} else {
				if ($('#layout_' +obj.name +'_panel_main').length <= 0) {
					obj.render();
					return;
				}
				obj.resize();
				// refresh all of them
				for (var p in this.panels) { obj.refresh(this.panels[p].type); }
			}
			obj.trigger($.extend(eventData, { phase: 'after' }));	
			return (new Date()).getTime() - time;
		},
		
		resize: function () {
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection 
			if (!this.box) return false;
			var time = (new Date()).getTime();
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'resize', target: this.name, panel: this.tmp.resizing });	
			if (eventData.isCancelled === true) return false;
			if (this.padding < 0) this.padding = 0;
	
			// layout itself
			var width  = parseInt($(this.box).width());
			var height = parseInt($(this.box).height());
			$(this.box).find(' > div').css({
				width	: width + 'px',
				height	: height + 'px'
			});
			var obj = this;
			// panels
			var pmain   = this.get('main');
			var pprev   = this.get('preview');
			var pleft   = this.get('left');
			var pright  = this.get('right');
			var ptop    = this.get('top');
			var pbottom = this.get('bottom');
			var smain	= true; // main always on
			var sprev   = (pprev != null && pprev.hidden != true ? true : false);
			var sleft   = (pleft != null && pleft.hidden != true ? true : false);
			var sright  = (pright != null && pright.hidden != true ? true : false);
			var stop    = (ptop != null && ptop.hidden != true ? true : false);
			var sbottom = (pbottom != null && pbottom.hidden != true ? true : false);
			// calculate %
			for (var p in { 'top':'', 'left':'', 'right':'', 'bottom':'', 'preview':'' }) { 
				var tmp = this.get(p);
				var str = String(tmp.size);
				if (tmp && str.substr(str.length-1) == '%') {
					var tmph = height;
					if (tmp.type == 'preview') {
						tmph = tmph 
							- (ptop && !ptop.hidden ? ptop.sizeCalculated : 0) 
							- (pbottom && !pbottom.hidden ? pbottom.sizeCalculated : 0);
					}
					tmp.sizeCalculated = parseInt((tmp.type == 'left' || tmp.type == 'right' ? width : tmph) * parseFloat(tmp.size) / 100);
				} else {
					tmp.sizeCalculated = parseInt(tmp.size);
				}
				if (tmp.sizeCalculated < parseInt(tmp.minSize)) tmp.sizeCalculated = parseInt(tmp.minSize);
			}
			// top if any		
			if (ptop != null && ptop.hidden != true) {
				var l = 0;
				var t = 0;
				var w = width;
				var h = ptop.sizeCalculated;
				$('#layout_'+ this.name +'_panel_top').css({
					'display': 'block',
					'left': l + 'px',
					'top': t + 'px',
					'width': w + 'px',
					'height': h + 'px'
				}).show();
				ptop.width  = w;
				ptop.height = h;
				// resizer
				if (ptop.resizable) {
					t = ptop.sizeCalculated - (this.padding == 0 ? this.resizer : 0);
					h = (this.resizer > this.padding ? this.resizer : this.padding);
					$('#layout_'+ this.name +'_resizer_top').show().css({
						'display': 'block',
						'left': l + 'px',
						'top': t + 'px',
						'width': w + 'px',
						'height': h + 'px',
						'cursor': 'ns-resize'
					}).bind('mousedown', function (event) {
						w2ui[obj.name].tmp.events.resizeStart('top', event);
						return false;
					});
				}
			} else {
				$('#layout_'+ this.name +'_panel_top').hide();
			}
			// left if any
			if (pleft != null && pleft.hidden != true) {
				var l = 0;
				var t = 0 + (stop ? ptop.sizeCalculated + this.padding : 0);
				var w = pleft.sizeCalculated;
				var h = height - (stop ? ptop.sizeCalculated + this.padding : 0) - 
									  (sbottom ? pbottom.sizeCalculated + this.padding : 0);
				var e = $('#layout_'+ this.name +'_panel_left');
				if (window.navigator.userAgent.indexOf('MSIE') > 0 && e.length > 0 && e[0].clientHeight < e[0].scrollHeight) w += 17; // IE hack
				$('#layout_'+ this.name +'_panel_left').css({
					'display': 'block',
					'left': l + 'px',
					'top': t + 'px',
					'width': w + 'px',
					'height': h + 'px'
				}).show();
				pleft.width  = w;
				pleft.height = h;
				// resizer
				if (pleft.resizable) {
					l = pleft.sizeCalculated - (this.padding == 0 ? this.resizer : 0);
					w = (this.resizer > this.padding ? this.resizer : this.padding);
					$('#layout_'+ this.name +'_resizer_left').show().css({
						'display': 'block',
						'left': l + 'px',
						'top': t + 'px',
						'width': w + 'px',
						'height': h + 'px',
						'cursor': 'ew-resize'
					}).bind('mousedown', function (event) {
						w2ui[obj.name].tmp.events.resizeStart('left', event);
						return false;
					});
				}
			} else {
				$('#layout_'+ this.name +'_panel_left').hide();
				$('#layout_'+ this.name +'_resizer_left').hide();
			}
			// right if any
			if (pright != null && pright.hidden != true) {
				var l = width - pright.sizeCalculated;
				var t = 0 + (stop ? ptop.sizeCalculated + this.padding : 0);
				var w = pright.sizeCalculated;
				var h = height - (stop ? ptop.sizeCalculated + this.padding : 0) - 
									  (sbottom ? pbottom.sizeCalculated + this.padding : 0);
				$('#layout_'+ this.name +'_panel_right').css({
					'display': 'block',
					'left': l + 'px',
					'top': t + 'px',
					'width': w + 'px',
					'height': h + 'px'
				}).show();
				pright.width  = w;
				pright.height = h;
				// resizer
				if (pright.resizable) {
					l = l - this.padding;
					w = (this.resizer > this.padding ? this.resizer : this.padding);
					$('#layout_'+ this.name +'_resizer_right').show().css({
						'display': 'block',
						'left': l + 'px',
						'top': t + 'px',
						'width': w + 'px',
						'height': h + 'px',
						'cursor': 'ew-resize'
					}).bind('mousedown', function (event) {
						w2ui[obj.name].tmp.events.resizeStart('right', event);
						return false;
					});
				}			
			} else {
				$('#layout_'+ this.name +'_panel_right').hide();
			}
			// bottom if any
			if (pbottom != null && pbottom.hidden != true) {
				var l = 0;
				var t = height - pbottom.sizeCalculated;
				var w = width;
				var h = pbottom.sizeCalculated;
				$('#layout_'+ this.name +'_panel_bottom').css({
					'display': 'block',
					'left': l + 'px',
					'top': t + 'px',
					'width': w + 'px',
					'height': h + 'px'
				}).show();
				pbottom.width  = w;
				pbottom.height = h;
				// resizer
				if (pbottom.resizable) {
					t = t - (this.padding == 0 ? 0 : this.padding);
					h = (this.resizer > this.padding ? this.resizer : this.padding);
					$('#layout_'+ this.name +'_resizer_bottom').show().css({
						'display': 'block',
						'left': l + 'px',
						'top': t + 'px',
						'width': w + 'px',
						'height': h + 'px',
						'cursor': 'ns-resize'
					}).bind('mousedown', function (event) {
						w2ui[obj.name].tmp.events.resizeStart('bottom', event);
						return false;
					});
				}
			} else {
				$('#layout_'+ this.name +'_panel_bottom').hide();
			}
			// main - always there
			var l = 0 + (sleft ? pleft.sizeCalculated + this.padding : 0);
			var t = 0 + (stop ? ptop.sizeCalculated + this.padding : 0);
			var w = width  - (sleft ? pleft.sizeCalculated + this.padding : 0) - 
								  (sright ? pright.sizeCalculated + this.padding: 0);
			var h = height - (stop ? ptop.sizeCalculated + this.padding : 0) - 
								  (sbottom ? pbottom.sizeCalculated + this.padding : 0) -
								  (sprev ? pprev.sizeCalculated + this.padding : 0);
			var e = $('#layout_'+ this.name +'_panel_main');
			if (window.navigator.userAgent.indexOf('MSIE') > 0 && e.length > 0 && e[0].clientHeight < e[0].scrollHeight) w += 17; // IE hack
			$('#layout_'+ this.name +'_panel_main').css({
				'display': 'block',
				'left': l + 'px',
				'top': t + 'px',
				'width': w + 'px',
				'height': h + 'px'
			});
			pmain.width  = w;
			pmain.height = h;
			
			// preview if any
			if (pprev != null && pprev.hidden != true) {
				var l = 0 + (sleft ? pleft.sizeCalculated + this.padding : 0);
				var t = height - (sbottom ? pbottom.sizeCalculated + this.padding : 0) - pprev.sizeCalculated;
				var w = width  - (sleft ? pleft.sizeCalculated + this.padding : 0) - 
									  (sright ? pright.sizeCalculated + this.padding : 0);
				var h = pprev.sizeCalculated;
				var e = $('#layout_'+ this.name +'_panel_preview');
				if (window.navigator.userAgent.indexOf('MSIE') > 0 && e.length > 0 && e[0].clientHeight < e[0].scrollHeight) w += 17; // IE hack
				$('#layout_'+ this.name +'_panel_preview').css({
					'display': 'block',
					'left': l + 'px',
					'top': t + 'px',
					'width': w + 'px',
					'height': h + 'px'
				}).show();
				pprev.width  = w;
				pprev.height = h;
				// resizer
				if (pprev.resizable) {
					t = t - (this.padding == 0 ? 0 : this.padding);
					h = (this.resizer > this.padding ? this.resizer : this.padding);
					$('#layout_'+ this.name +'_resizer_preview').show().css({
						'display': 'block',
						'left': l + 'px',
						'top': t + 'px',
						'width': w + 'px',
						'height': h + 'px',
						'cursor': 'ns-resize'
					}).bind('mousedown', function (event) {
						w2ui[obj.name].tmp.events.resizeStart('preview', event);
						return false;
					});
				}
			} else {
				$('#layout_'+ this.name +'_panel_preview').hide();
			}

			// display tabs and toolbar if needed
			for (var p in { 'top':'', 'left':'', 'main':'', 'preview':'', 'right':'', 'bottom':'' }) { 
				var pan = this.get(p);
				var tmp = '#layout_'+ this.name +'_panel_'+ p +' > .w2ui-panel-';
				var height = 0;
				if (pan.tabs != null) {
					if (w2ui[this.name +'_'+ p +'_tabs']) w2ui[this.name +'_'+ p +'_tabs'].resize();
					height += w2utils.getSize($(tmp + 'tabs').css({ display: 'block' }), 'height');
				}
				if (pan.toolbar != null) {
					if (w2ui[this.name +'_'+ p +'_toolbar']) w2ui[this.name +'_'+ p +'_toolbar'].resize();
					height += w2utils.getSize($(tmp + 'toolbar').css({ top: height + 'px', display: 'block' }), 'height');
				}
				$(tmp + 'content').css({ display: 'block' }).css({ top: height + 'px' });
			}
			// send resize to all objects
			var obj = this;
			clearTimeout(this._resize_timer);
			this._resize_timer = setTimeout(function () {
				for (var e in w2ui) {
					if (typeof w2ui[e].resize == 'function') {
						// sent to all none-layouts
						if (w2ui[e].panels == 'undefined') w2ui[e].resize();
						// only send to nested layouts
						var parent = $(w2ui[e].box).parents('.w2ui-layout');
						if (parent.length > 0 && parent.attr('name') == obj.name) w2ui[e].resize();
					}
				}
			}, 100);		
			this.trigger($.extend(eventData, { phase: 'after' }));
			return (new Date()).getTime() - time;
		},
		
		destroy: function () { 
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'destroy', target: this.name });	
			if (eventData.isCancelled === true) return false;
			if (typeof w2ui[this.name] == 'undefined') return false;
			// clean up
			if ($(this.box).find('#layout_'+ this.name +'_panel_main').length > 0) {
				$(this.box)
					.removeAttr('name')
					.removeClass('w2ui-layout')
					.html('');
			}
			delete w2ui[this.name];
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			
			if (obj.tmp.events && obj.tmp.events.resize) 	$(window).off('resize', obj.tmp.events.resize);
			if (obj.tmp.events && obj.tmp.events.mousemove) $(document).off('mousemove', obj.tmp.events.mousemove);
			if (obj.tmp.events && obj.tmp.events.mouseup) 	$(document).off('mouseup', obj.tmp.events.mouseup);
			
			return true;
		},

		lock: function (panel, msg, showSpinner) {
			if ($.inArray(String(panel), ['left', 'right', 'top', 'bottom', 'preview', 'main']) == -1) {
				console.log('ERROR: First parameter needs to be the a valid panel name.');
				return;
			}
			var nm = '#layout_'+ this.name + '_panel_' + panel;
			w2utils.lock(nm, msg, showSpinner);
		},

		unlock: function (panel) { 
			if ($.inArray(String(panel), ['left', 'right', 'top', 'bottom', 'preview', 'main']) == -1) {
				console.log('ERROR: First parameter needs to be the a valid panel name.');
				return;
			}
			var nm = '#layout_'+ this.name + '_panel_' + panel;
			w2utils.unlock(nm);
		}
	}
	
	$.extend(w2layout.prototype, $.w2event);
	w2obj.layout = w2layout;
})();
