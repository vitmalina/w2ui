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
*	- add layout.lock(), unlock()
*
* == 1.3 changes ==
*   - tabs can be array of string, array of tab objects or w2tabs object
*	- html() method is alias for content()
*	- el(panel) - returns DOM element for the panel
*	- resizer should be on top of the panel (for easy styling)
*	- content: $('content'); - it will return graceful error
*	- % base resizes
*	- better min/max calculation when window resizes
*	- moved some settings to prototype
* 
************************************************************************/

(function () {
	var w2layout = function (options) {
		this.box		= null		// DOM Element that holds the element
		this.name		= null;		// unique name for w2ui
		this.panels		= [];

		this.padding	= 0;		// panel padding
		this.resizer	= 4;		// resizer width or height
		this.style		= '';
		this.css		= '';		// will display all inside <style> tag

		this.onShow		= null;
		this.onHide		= null;
		this.onResizing = null;
		this.onRender	= null;
		this.onRefresh	= null;
		this.onResize	= null;
		this.onDestroy	= null
		
		$.extend(true, this, options, w2obj.layout);
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
				if ($.isPlainObject(object.panels[p].tabs) || $.isArray(object.panels[p].tabs)) object.initTabs(panels[p].type);
				if ($.isPlainObject(object.panels[p].toolbar) || $.isArray(object.panels[p].toolbar)) object.initToolbar(panels[p].type);
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

		content: function (panel, data, transition) {
			var obj = this;
			var p = this.get(panel);
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
							if (typeof(data) == 'object') {
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
		
		html: function (panel, data, transition) {
			this.content(panel, data, transition);
		},
			
		load: function (panel, url, transition, onLoad) {
			var obj = this;
			if (this.get(panel) == null) return false;
			$.get(url, function (data, status, object) {
				obj.content(panel, object.responseText, transition);
				if (onLoad) onLoad();
				// IE Hack
				if (window.navigator.userAgent.indexOf('MSIE')) setTimeout(function () { obj.resize(); }, 100);
			});
			return true;
		},
		
		show: function (panel, immediate) {
			var obj = this;
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'show', target: panel, panel: this.get(panel), immediate: immediate });	
			if (eventData.stop === true) return false;
	
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
			var eventData = this.trigger({ phase: 'before', type: 'hide', target: panel, panel: this.get(panel), immediate: immediate });	
			if (eventData.stop === true) return false;
	
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

		initToolbar: function (panel, toolbar) {
			var pan = this.get(panel);
			if (pan != null && typeof toolbar == 'undefined') toolbar = pan.toolbar;
			if (pan == null || toolbar == null) return false;
			// instanciate toolbar
			if ($.isArray(toolbar)) toolbar = { items: toolbar };
			$().w2destroy(this.name + '_' + panel + '_toolbar'); // destroy if existed
			pan.toolbar = $().w2toolbar($.extend({}, toolbar, { owner: this, name: this.name + '_' + panel + '_toolbar' }));
			return true;
		},

		initTabs: function (panel, tabs) {
			var pan = this.get(panel);
			if (pan != null && typeof tabs == 'undefined') tabs = pan.tabs;
			if (pan == null || tabs == null) return false;
			// instanciate tabs
			var object = {};
			if ($.isArray(tabs)) {
				$.extend(true, object, { tabs: [] });
				for (var t in tabs) {
					var tmp = tabs[t];
					if (typeof tmp == 'object') object.tabs.push(tmp); else object.tabs.push({ id: tmp, caption: tmp });
				}
				object.active = object.tabs[0].id;
			} else {
				$.extend(true, object, tabs);
			}
			$().w2destroy(this.name + '_' + panel + '_tabs'); // destroy if existed
			pan.tabs = $().w2tabs($.extend({}, object, { owner: this, name: this.name + '_' + panel + '_tabs' }));
			return true;
		},
				
		render: function (box) {
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection 
			var time = (new Date()).getTime();
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'render', target: this.name, box: box });	
			if (eventData.stop === true) return false;
	
			if (typeof box != 'undefined' && box != null) { 
				if ($(this.box).find('#layout_'+ this.name +'_panel_main').length > 0) {
					$(this.box)
						.removeAttr('name')
						.removeClass('w2ui-layout')
						.html('');
				}
				this.box = box;
			}
			if (!this.box) return false;
			$(this.box)
				.attr('name', this.name)
				.addClass('w2ui-layout')
				.html('<div></div>');
			if ($(this.box).length > 0) $(this.box)[0].style.cssText += this.style;
			// create all panels
			var tmp = ['top', 'left', 'main', 'preview', 'right', 'bottom'];
			for (var t in tmp) {
				var pan  = this.get(tmp[t]);
				var html =  '<div id="layout_'+ this.name + '_panel_'+ tmp[t] +'" class="w2ui-panel">'+
							'	<div class="w2ui-panel-tabs"></div>'+
							'	<div class="w2ui-panel-toolbar"></div>'+
							'	<div class="w2ui-panel-content"></div>'+
							'</div>'+
							'<div id="layout_'+ this.name + '_resizer_'+ tmp[t] +'" class="w2ui-resizer"></div>';
				$(this.box).find(' > div').append(html);
				// if there are tabs and/or toolbar - render it
				if (pan.tabs != null) $(this.box).find('#layout_'+ this.name + '_panel_'+ tmp[t] +' .w2ui-panel-tabs').w2render(pan.tabs);
				if (pan.toolbar != null) $(this.box).find('#layout_'+ this.name + '_panel_'+ tmp[t] +' .w2ui-panel-toolbar').w2render(pan.toolbar);
			}
			$(this.box).find(' > div')
				.append('<style id="layout_'+ this.name + '_panel_css" style="position: absolute; top: 10000px;">'+ this.css +'</style>');		
			// process event
			this.trigger($.extend(eventData, { phase: 'after' }));	
			// reinit events
			this.refresh();
			this.initEvents();
			return (new Date()).getTime() - time;
		},
		
		refresh: function (panel) {
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection 
			if (typeof panel == 'undefined') panel = null;
			var time = (new Date()).getTime();
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'refresh', target: (typeof panel != 'undefined' ? panel : this.name), panel: this.get(panel) });	
			if (eventData.stop === true) return;
	
			if (panel != null && typeof panel != 'undefined') {
				var p = this.get(panel);
				if (p == null) return;
				// apply properties to the panel
				var el = $('#layout_'+ this.name +'_panel_'+ panel).css({ display: p.hidden ? 'none' : 'block' });
				el = el.find('.w2ui-panel-content');
				if (el.length > 0) el.css('overflow', p.overflow)[0].style.cssText += ';' + p.style;
				// insert content
				if (typeof p.content == 'object' && p.content.render) {
					p.content.render($('#layout_'+ this.name + '_panel_'+ p.type +' > .w2ui-panel-content')[0]);
				} else {
					$('#layout_'+ this.name + '_panel_'+ p.type +' > .w2ui-panel-content').html(p.content);
				}
				// if there are tabs and/or toolbar - render it
				var tmp = $(this.box).find('#layout_'+ this.name + '_panel_'+ p.type +' .w2ui-panel-tabs');
				if (p.tabs != null) { 
					if (tmp.find('[name='+ p.tabs.name +']').length == 0) tmp.w2render(p.tabs); else p.tabs.refresh(); 
				} else {
					tmp.html('').removeClass('w2ui-tabs').hide();
				}
				var tmp = $(this.box).find('#layout_'+ this.name + '_panel_'+ p.type +' .w2ui-panel-toolbar');
				if (p.toolbar != null) { 
					if (tmp.find('[name='+ p.toolbar.name +']').length == 0) tmp.w2render(p.toolbar); else p.toolbar.refresh(); 
				} else {
					tmp.html('').removeClass('w2ui-toolbar').hide();
				}
			} else {
				if ($('#layout_' +this.name +'_panel_main').length <= 0) {
					this.render();
					return;
				}
				this.resize();
				// refresh all of them
				for (var p in this.panels) { this.refresh(this.panels[p].type); }
			}
			this.trigger($.extend(eventData, { phase: 'after' }));	
			return (new Date()).getTime() - time;
		},
		
		resize: function () {
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection 
			if (!this.box) return false;
			var time = (new Date()).getTime();
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'resize', target: this.name, panel: this.tmp_resizing });	
			if (eventData.stop === true) return false;
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
					tmp.sizeCalculated = (tmp.type == 'left' || tmp.type == 'right' ? width : tmph) * parseInt(tmp.size) / 100;
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
						w2ui[obj.name].startResize('top', event);
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
						w2ui[obj.name].startResize('left', event);
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
						w2ui[obj.name].startResize('right', event);
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
						w2ui[obj.name].startResize('bottom', event);
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
						w2ui[obj.name].startResize('preview', event);
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
					// do not sent resize to panels, or it will get caught in a loop
					if (typeof w2ui[e].resize == 'function' && typeof w2ui[e].panels == 'undefined') w2ui[e].resize();
				}
			}, 100);		
			this.trigger($.extend(eventData, { phase: 'after' }));
			return (new Date()).getTime() - time;
		},
		
		destroy: function () { 
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'destroy', target: this.name });	
			if (eventData.stop === true) return false;
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
			
			$(window).off('resize', this.events.resize);
			$(document).off('mousemove', this.events.mousemove);
			$(document).off('mouseup', this.events.mouseup);
			
			return true;
		},
		
		// --- INTERNAL FUNCTIONS
		
		initEvents: function () {
			var obj = this;
			
			this.events = {
				resize : function (event) { 
					w2ui[obj.name].resize()	
				},
				mousemove : function (event) { 
					w2ui[obj.name].doResize(event)	
				},
				mouseup : function (event) { 
					w2ui[obj.name].stopResize(event)	
				}
			};
			
			$(window).on('resize', this.events.resize);
			$(document).on('mousemove', this.events.mousemove);
			$(document).on('mouseup', this.events.mouseup);
		},
	
		startResize: function (type, evnt) {
			if (!this.box) return;
			if (!evnt) evnt = window.event;
			if (!window.addEventListener) { window.document.attachEvent('onselectstart', function() { return false; } ); }
			this.tmp_resizing = type;
			this.tmp_x = evnt.screenX;
			this.tmp_y = evnt.screenY;
			this.tmp_div_x = 0;
			this.tmp_div_y = 0;
			if (type == 'left' || type == 'right') {
				this.tmp_value = parseInt($('#layout_'+ this.name + '_resizer_'+ type)[0].style.left);
			}
			if (type == 'top' || type == 'preview' || type == 'bottom') {
				this.tmp_value = parseInt($('#layout_'+ this.name + '_resizer_'+ type)[0].style.top);
			}
		},
	
		doResize: function (evnt) {
			if (!this.box) return;
			if (!evnt) evnt = window.event;
			if (typeof this.tmp_resizing == 'undefined') return;
			var panel = this.get(this.tmp_resizing);
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'resizing', target: this.tmp_resizing, object: panel, event: evnt });	
			if (eventData.stop === true) return false;

			var p = $('#layout_'+ this.name + '_resizer_'+ this.tmp_resizing);
			if (!p.hasClass('active')) p.addClass('active');
			this.tmp_div_x = (evnt.screenX - this.tmp_x); 
			this.tmp_div_y = (evnt.screenY - this.tmp_y); 
			// left panel -> drag
			if (this.tmp_resizing == 'left' &&  (this.get('left').minSize - this.tmp_div_x > this.get('left').width)) {
				this.tmp_div_x = this.get('left').minSize - this.get('left').width;
			}
			if (this.tmp_resizing == 'left' && (this.get('main').minSize + this.tmp_div_x > this.get('main').width)) {
				this.tmp_div_x = this.get('main').width - this.get('main').minSize;
			}
			// right panel -> drag 
			if (this.tmp_resizing == 'right' &&  (this.get('right').minSize + this.tmp_div_x > this.get('right').width)) {
				this.tmp_div_x = this.get('right').width - this.get('right').minSize;
			}
			if (this.tmp_resizing == 'right' && (this.get('main').minSize - this.tmp_div_x > this.get('main').width)) {
				this.tmp_div_x =  this.get('main').minSize - this.get('main').width;
			}
			// top panel -> drag
			if (this.tmp_resizing == 'top' &&  (this.get('top').minSize - this.tmp_div_y > this.get('top').height)) {
				this.tmp_div_y = this.get('top').minSize - this.get('top').height;
			}
			if (this.tmp_resizing == 'top' && (this.get('main').minSize + this.tmp_div_y > this.get('main').height)) {
				this.tmp_div_y = this.get('main').height - this.get('main').minSize;
			}
			// bottom panel -> drag 
			if (this.tmp_resizing == 'bottom' &&  (this.get('bottom').minSize + this.tmp_div_y > this.get('bottom').height)) {
				this.tmp_div_y = this.get('bottom').height - this.get('bottom').minSize;
			}
			if (this.tmp_resizing == 'bottom' && (this.get('main').minSize - this.tmp_div_y > this.get('main').height)) {
				this.tmp_div_y =  this.get('main').minSize - this.get('main').height;
			}
			// preview panel -> drag 
			if (this.tmp_resizing == 'preview' &&  (this.get('preview').minSize + this.tmp_div_y > this.get('preview').height)) {
				this.tmp_div_y = this.get('preview').height - this.get('preview').minSize;
			}
			if (this.tmp_resizing == 'preview' && (this.get('main').minSize - this.tmp_div_y > this.get('main').height)) {
				this.tmp_div_y =  this.get('main').minSize - this.get('main').height;
			}
			switch(this.tmp_resizing) {
				case 'top':
				case 'preview':
				case 'bottom':
					this.tmp_div_x = 0;
					if (p.length > 0) p[0].style.top = (this.tmp_value + this.tmp_div_y) + 'px';
					break;
				case 'left':
				case 'right':
					this.tmp_div_y = 0;
					if (p.length > 0) p[0].style.left = (this.tmp_value + this.tmp_div_x) + 'px';
					break;
			}
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));	
		},
	
		stopResize: function (evnt) {
			if (!this.box) return;
			if (!evnt) evnt = window.event;
			if (!window.addEventListener) { window.document.attachEvent('onselectstart', function() { return false; } ); }
			if (typeof this.tmp_resizing == 'undefined') return;
			// set new size
			var ptop 	= this.get('top');
			var pbottom	= this.get('bottom');
			var panel 	= this.get(this.tmp_resizing);
			var height 	= parseInt($(this.box).height());
			var width 	= parseInt($(this.box).width());
			var str 	= String(panel.size);
			switch (this.tmp_resizing) {
				case 'top':
					var ns = parseInt(panel.sizeCalculated) + this.tmp_div_y;
					var nd = 0;
					break;
				case 'bottom':
					var nd = 0;
				case 'preview':
					var nd = (ptop && !ptop.hidden ? ptop.sizeCalculated : 0) 
						   + (pbottom && !pbottom.hidden ? pbottom.sizeCalculated : 0);
					var ns = parseInt(panel.sizeCalculated) - this.tmp_div_y;
					break;
				case 'left':
					var ns = parseInt(panel.sizeCalculated) + this.tmp_div_x;
					var nd = 0;
					break;
				case 'right': 
					var ns = parseInt(panel.sizeCalculated) - this.tmp_div_x;
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
			this.resize();
			$('#layout_'+ this.name + '_resizer_'+ this.tmp_resizing).removeClass('active');
			delete this.tmp_resizing;
		}		
	}
	
	$.extend(w2layout.prototype, $.w2event);
	w2obj.layout = w2layout;
})();
