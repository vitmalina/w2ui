/************************************************************************
*   Library: Web 2.0 UI for jQuery (using prototypical inheritance)
*   - Following objects defined
* 		- w2ui.w2layout - layout widget
*		- $.w2layout	- jQuery wrapper
*   - Dependencies: jQuery, w2utils
*
* == 1.2 changes 
*   - added panel name in the event data object
*
*  DEPRECATED METHODS
*   - add()
*   - remove()
*
*  NICE TO HAVE
*   - onResize for the panel
* 
************************************************************************/

(function () {
	var w2layout = function (options) {
		this.box		= null		// DOM Element that holds the element
		this.name		= null;		// unique name for w2ui
		this.panels		= [];
		this.padding	= 1;		// panel padding
		this.spacer		= 4;		// resizer width or height
		this.style		= '';
		this.css		= '';		// will display all inside <style> tag
		this.width		= null		// reads from container
		this.height		= null;		// reads from container
		this.onShow		= null;
		this.onHide		= null;
		this.onResizing = null;
		this.onRender	= null;
		this.onRefresh	= null;
		this.onResize	= null;
		this.onDestroy	= null
		
		$.extend(true, this, options);
	};
	
	// ====================================================
	// -- Registers as a jQuery plugin
	
	$.fn.w2layout = function(method) {
		if (typeof method === 'object' || !method ) {
			// check required parameters
			if (!method || typeof method.name == 'undefined') {
				$.error('The parameter "name" is required but not supplied in $().w2layout().');
				return;
			}
			if (typeof w2ui[method.name] != 'undefined') {
				$.error('The parameter "name" is not unique. There are other objects already created with the same name (obj: '+ method.name +').');
				return;			
			}
			var panels = method.panels;
			var object = new w2layout(method);
			$.extend(object, { handlers: [], panels: [] });
			for (var p in panels) { object.panels[p] = $.extend({}, w2layout.prototype.panel, panels[p]); }
			if ($(this).length > 0) {
				$(this).data('w2name', object.name);
				object.render($(this)[0]);
			}
			w2ui[object.name] = object;		
			return object;		
			
		} else if (typeof $(this).data('w2name') != 'undefined') {
			var obj = w2ui[$(this).data('w2name')];
			obj[method].apply(obj, Array.prototype.slice.call(arguments, 1));
			return this;
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.w2layout' );
		}    
	};
	
	// ====================================================
	// -- Implementation of core functionality
	
	w2layout.prototype = {
		// default setting for a panel
		panel: {
			type: 		null,		// left, right, top, bottom
			size: 		100, 		// width or height depending on panel name
			minSize: 	20,
			hidden: 	false,
			resizable:  false,
			overflow: 	'auto',
			style: 		'',
			content: 	'',			// can be String or Object with .render(box) method
			width: 		null, 		// read only
			height: 	null, 		// read only
			onRefresh: 	null,
			onShow: 	null,
			onHide: 	null
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
				if (p.content == '') {
					p.content = data;
					if (!p.hidden) this.refresh(panel);
				} else {
					p.content = data;
					if (!p.hidden) {
						if (transition != null && transition != '' && typeof transition != 'undefined') {
							// apply transition
							if (String(transition).substr(0, 5) == 'slide') {
								var nm   = 'layout_'+ this.name + '_panel_'+ p.type;
								var pan  = $('#'+nm);
								var html = pan.html();
								var st   = pan[0].style.cssText;
								pan.attr('id', 'layout_'+ this.name + '_panel_'+ p.type +'_trans');					
								pan.html('<div id="'+ nm +'_old"></div><div id="'+ nm +'"></div>');
								pan.find('#'+ nm +'')[0].style.cssText = pan[0].style.cssText + '; left: 0px !important; top: 0px !important; '+
									'-webkit-transition: 0s; -moz-transition: 0s; -ms-transition: 0s; -o-transition: 0s;';
								pan.find('#'+ nm +'_old')[0].style.cssText = pan[0].style.cssText + '; left: 0px !important; top: 0px !important; '+
									'-webkit-transition: 0s; -moz-transition: 0s; -ms-transition: 0s; -o-transition: 0s;';
								pan[0].style.cssText += 'border: 0px; margin: 0px; padding: 0px; outline: 0px; overflow: hidden;';
								if (typeof(data) == 'object') {
									data.box = pan.find('#'+ nm)[0]; // do not do .render(box);
									data.render();
								} else {
									pan.find('#'+ nm).html(data);
								}
								pan.find('#'+ nm +'_old').html(html);
						
								var obj  = this;
								w2utils.transition(pan.find('#'+ nm +'_old')[0], pan.find('#'+ nm)[0], transition, function () {
									// clean up
									var pan = $('#layout_'+ obj.name + '_panel_'+ p.type +'_trans');
									if (pan.length > 0) {
										pan[0].style.cssText = st;
										pan.attr('id', 'layout_'+ obj.name + '_panel_'+ p.type).html(pan.find('#'+ nm).html());
									}
									// IE Hack
									if (window.navigator.userAgent.indexOf('MSIE')) setTimeout(function () { obj.resize(); }, 100);
								});
							} else {
								$('#layout_'+ this.name + '_panel_'+ p.type).before('<div id="layout_'+ this.name + '_panel2_'+ p.type + '">'+ data +'</div>');					
								$('#layout_'+ this.name + '_panel2_'+ p.type)[0].style.cssText = $('#layout_'+ this.name + '_panel_'+ p.type)[0].style.cssText;
								if (typeof data == 'object') { 
									data.render($('#layout_'+ this.name + '_panel2_'+ p.type)[0]); 
								}
								var div1 = $('#layout_'+ this.name + '_panel2_'+ p.type)[0];
								var div2 = $('#layout_'+ this.name + '_panel_'+ p.type)[0];
								var obj  = this;
								w2utils.transition(div2, div1, transition, function () {
									// clean up
									$('#layout_'+ obj.name + '_panel_'+ p.type).remove();
									$('#layout_'+ obj.name + '_panel2_'+ p.type).attr('id', 'layout_'+ obj.name + '_panel_'+ p.type);
									p.content = data;
									// IE Hack
									if (window.navigator.userAgent.indexOf('MSIE')) setTimeout(function () { obj.resize(); }, 100);
								});
							}
						} else {
							if (!p.hidden) this.refresh(panel);
						}
					}
				}
			}
			// IE Hack
			if (window.navigator.userAgent.indexOf('MSIE')) setTimeout(function () { obj.resize(); }, 100);
		},
		
		load: function (panel, url, transition, onLoad) {
			var obj = this;
			$.get(url, function (data, status, object) {
				obj.content(panel, object.responseText, transition);
				if (onLoad) onLoad();
				// IE Hack
				if (window.navigator.userAgent.indexOf('MSIE')) setTimeout(function () { obj.resize(); }, 100);
			});
		},
		
		show: function (panel, immediate) {
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'show', target: panel, panel: this.get(panel), immediate: immediate });	
			if (eventData.stop === true) return false;
	
			var p = this.get(panel);
			if (p == null) return false;
			p.hidden = false;
			if (immediate === true) {
				$('#layout_'+ this.name +' #layout_'+ this.name +'_panel_'+panel).css({ 'opacity': '1' });	
				if (p.resizabled) $('#layout_'+ this.name +' #layout_'+ this.name +'_splitter_'+panel).show();
				this.trigger($.extend(eventData, { phase: 'after' }));	
				this.resize();
			} else {			
				var obj = this;
				if (p.resizabled) $('#layout_'+ obj.name +' #layout_'+ obj.name +'_splitter_'+panel).show();
				// resize
				$('#layout_'+ obj.name +' #layout_'+ obj.name +'_panel_'+panel).css({ 'opacity': '0' });	
				$('#layout_'+ this.name +' .w2ui-panel').css({
					'-webkit-transition': '.2s',
					'-moz-transition'	: '.2s',
					'-ms-transition'	: '.2s',
					'-o-transition'		: '.2s'
				});
				setTimeout(function () { obj.resize(); }, 1);
				// show
				setTimeout(function() {
					$('#layout_'+ obj.name +' #layout_'+ obj.name +'_panel_'+panel).css({ 'opacity': '1' });	
				}, 250);
				// clean
				setTimeout(function () { 
					$('#layout_'+ obj.name +' .w2ui-panel').css({
						'-webkit-transition': '0s',
						'-moz-transition'	: '0s',
						'-ms-transition'	: '0s',
						'-o-transition'		: '0s'
					}); 
					obj.trigger($.extend(eventData, { phase: 'after' }));	
					obj.resize();
				}, 500);
			}
		},
		
		hide: function (panel, immediate) {
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'hide', target: panel, panel: this.get(panel), immediate: immediate });	
			if (eventData.stop === true) return false;
	
			var p = this.get(panel);
			if (p == null) return false;
			p.hidden = true;		
			if (immediate === true) {
				$('#layout_'+ this.name +' #layout_'+ this.name +'_panel_'+panel).css({ 'opacity': '0'	});
				$('#layout_'+ this.name +' #layout_'+ this.name +'_splitter_'+panel).hide();
				this.trigger($.extend(eventData, { phase: 'after' }));	
				this.resize();
			} else {
				var obj = this;
				$('#layout_'+ obj.name +' #layout_'+ obj.name +'_splitter_'+panel).hide();
				// hide
				$('#layout_'+ this.name +' .w2ui-panel').css({
					'-webkit-transition': '.2s',
					'-moz-transition'	: '.2s',
					'-ms-transition'	: '.2s',
					'-o-transition'		: '.2s'
				});
				$('#layout_'+ this.name +' #layout_'+ this.name +'_panel_'+panel).css({ 'opacity': '0'	});
				setTimeout(function () { obj.resize(); }, 1);
				// clean
				setTimeout(function () { 
					$('#layout_'+ obj.name +' .w2ui-panel').css({
						'-webkit-transition': '0s',
						'-moz-transition'	: '0s',
						'-ms-transition'	: '0s',
						'-o-transition'		: '0s'
					}); 
					obj.trigger($.extend(eventData, { phase: 'after' }));	
					obj.resize();
				}, 500);
			}
		},
		
		toggle: function (panel, immediate) {
			var p = this.get(panel);
			if (p == null) return false;
			if (p.hidden) this.show(panel, immediate); else this.hide(panel, immediate);
		},
		
		set: function (panel, options) {
			var obj = this.getIndex(panel);
			if (obj == null) return false;
			$.extend(this.panels[obj], options);
			this.refresh(panel);
			return true;		
		},
	
		get: function (panel) {
			var obj = null;
			for (var p in this.panels) {
				if (this.panels[p].type == panel) { obj = this.panels[p]; break; }
			}
			return obj;
		},
		
		getIndex: function (panel) {
			var index = null;
			for (var p in this.panels) {
				if (this.panels[p].type == panel) { index = p; break; }
			}
			return index;
		},	
		
		render: function (box) {
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection 
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'render', target: this.name, box: box });	
			if (eventData.stop === true) return false;
	
			if (typeof box != 'undefined' && box != null) { 
				$(this.box).html(''); 
				this.box = box;
			}
			if (!this.box) return;
			// add main panel if it was not already added
			if (this.get('main') == null) this.panels.push( $.extend({}, w2layout.prototype.panel, { type: 'main'}) );
			if (this.get('css') == null)  this.panels.push( $.extend({}, w2layout.prototype.panel, { type: 'css'}) );
			var html = '<div id="layout_'+ this.name +'" class="w2ui-layout" style="'+ this.style +'"></div>';
			$(this.box).html(html);
			// create all panels
			var tmp = ['top', 'left', 'main', 'preview', 'right', 'bottom'];
			for (var t in tmp) {
				var html =  '<div id="layout_'+ this.name + '_panel_'+ tmp[t] +'" class="w2ui-panel"></div>'+
							'<div id="layout_'+ this.name + '_splitter_'+ tmp[t] +'" class="w2ui-splitter"></div>';
				$('#layout_'+ this.name +'').append(html);
			}
			$('#layout_'+ this.name +'').append('<style id="layout_'+ this.name + '_panel_css" style="position: absolute; top: 10000px;">'+ this.css +'</style>');		
			// process event
			this.trigger($.extend(eventData, { phase: 'after' }));	
			// reinit events
			this.refresh();
			this.initEvents();
		},
		
		refresh: function (panel) {
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection 
			if (typeof panel == 'undefined') panel = null;
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'refresh', target: (typeof panel != 'undefined' ? panel : this.name), panel: this.get(panel) });	
			if (eventData.stop === true) return false;
	
			if (panel != null && typeof panel != 'undefined') {
				var p = this.get(panel);
				if (p == null) return false;
				// apply properties to the panel
				var el = $('#layout_'+ this.name +' #layout_' +this.name +'_panel_'+panel).css({
					display: p.hidden ? 'none' : 'block',
					overflow: p.overflow
				});
				if (el.length > 0) el[0].style.cssText += ';' + p.style;
				// insert content
				if (typeof p.content == 'object' && p.content.render) {
					p.content.render($('#layout_'+ this.name +' #layout_'+ this.name + '_panel_'+ p.type)[0]);
				} else {
					$('#layout_'+ this.name +' #layout_'+ this.name + '_panel_'+ p.type).html(p.content);
				}
			} else {
				if ($('#layout_'+ this.name +' #layout_' +this.name +'_panel_main').length <= 0) {
					this.render();
					return;
				}
				this.resize();
				// refresh all of them
				for (var p in this.panels) { this.refresh(this.panels[p].type); }
			}
			this.trigger($.extend(eventData, { phase: 'after' }));	
			return true;
		},
		
		resize: function (width, height) {
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection 
			if (!this.box) return;
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'resize', target: this.name, panel: this.tmp_resizing, width: width, height: height });	
			if (eventData.stop === true) return false;
	
			// layout itself
			this.width  = parseInt($(this.box).width());
			this.height = parseInt($(this.box).height());
			
			if (typeof width != 'undefined' && width != null)  this.width  = parseInt(width);
			if (typeof height != 'undefined' && height != null) this.height = parseInt(height);
			$('#layout_'+ this.name +'').css({
				width: this.width + 'px',
				height: this.height + 'px'
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
			if (ptop && String(ptop.size).substr((String(ptop.size).length-1)) == '%') {
				ptop.size = this.height * parseInt(ptop.size) / 100;
			}
			if (pleft && String(pleft.size).substr((String(pleft.size).length-1)) == '%') {
				pleft.size = this.height * parseInt(pleft.size) / 100;
			}
			if (pright && String(pright.size).substr((String(pright.size).length-1)) == '%') {
				pright.size = this.height * parseInt(pright.size) / 100;
			}
			if (pbottom && String(pbottom.size).substr((String(pbottom.size).length-1)) == '%') {
				pbottom.size = this.height * parseInt(pbottom.size) / 100;
			}
			if (pprev && String(pprev.size).substr((String(pprev.size).length-1)) == '%') {
				pprev.size = (this.height 
								- (ptop && !ptop.hidden ? ptop.size : 0) 
								- (pbottom && !pbottom.hidden ? pbottom.size : 0))
							* parseInt(pprev.size) / 100;
			}
			if (ptop) ptop.size = parseInt(ptop.size);
			if (pleft) pleft.size = parseInt(pleft.size);
			if (pprev) pprev.size = parseInt(pprev.size);
			if (pright) pright.size	= parseInt(pright.size);
			if (pbottom) pbottom.size = parseInt(pbottom.size);
			// top if any		
			if (ptop != null && ptop.hidden != true) {
				var l = 0;
				var t = 0;
				var w = this.width;
				var h = ptop.size;
				$('#layout_'+ this.name +' #layout_'+ this.name +'_panel_top').css({
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
					t = ptop.size;
					h = this.spacer;
					$('#layout_'+ this.name +' #layout_'+ this.name +'_splitter_top').show().css({
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
				$('#layout_'+ this.name +' #layout_'+ this.name +'_panel_top').hide();
			}
			// left if any
			if (pleft != null && pleft.hidden != true) {
				var l = 0;
				var t = 0 + (stop ? ptop.size + (ptop.resizable ? this.spacer : this.padding) : 0);
				var w = pleft.size;
				var h = this.height - (stop ? ptop.size + (ptop.resizable ? this.spacer : this.padding) : 0) - 
									  (sbottom ? pbottom.size + (pbottom.resizable ? this.spacer : this.padding) : 0);
				var e = $('#layout_'+ this.name +' #layout_'+ this.name +'_panel_left');
				if (window.navigator.userAgent.indexOf('MSIE') > 0 && e.length > 0 && e[0].clientHeight < e[0].scrollHeight) w += 17; // IE hack
				$('#layout_'+ this.name +' #layout_'+ this.name +'_panel_left').css({
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
					l = pleft.size;
					w = this.spacer;
					$('#layout_'+ this.name +' #layout_'+ this.name +'_splitter_left').show().css({
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
				$('#layout_'+ this.name +' #layout_'+ this.name +'_panel_left').hide();
				$('#layout_'+ this.name +' #layout_'+ this.name +'_splitter_left').hide();
			}
			// right if any
			if (pright != null && pright.hidden != true) {
				var l = this.width - pright.size;
				var t = 0 + (stop ? ptop.size + (ptop.resizable ? this.spacer : this.padding) : 0);
				var w = pright.size;
				var h = this.height - (stop ? ptop.size + (ptop.resizable ? this.spacer : this.padding) : 0) - 
									  (sbottom ? pbottom.size + (pbottom.resizable ? this.spacer : this.padding) : 0);
				$('#layout_'+ this.name +' #layout_'+ this.name +'_panel_right').css({
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
					l = l - this.spacer;
					w = this.spacer;
					$('#layout_'+ this.name +' #layout_'+ this.name +'_splitter_right').show().css({
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
				$('#layout_'+ this.name +' #layout_'+ this.name +'_panel_right').hide();
			}
			// bottom if any
			if (pbottom != null && pbottom.hidden != true) {
				var l = 0;
				var t = this.height - pbottom.size;
				var w = this.width;
				var h = pbottom.size;
				$('#layout_'+ this.name +' #layout_'+ this.name +'_panel_bottom').css({
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
					t = t - this.spacer;
					h = this.spacer;
					$('#layout_'+ this.name +' #layout_'+ this.name +'_splitter_bottom').show().css({
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
				$('#layout_'+ this.name +' #layout_'+ this.name +'_panel_bottom').hide();
			}
			// main - always there
			var l = 0 + (sleft ? pleft.size + (pleft.resizable ? this.spacer : this.padding) : 0);
			var t = 0 + (stop ? ptop.size + (ptop.resizable ? this.spacer : this.padding) : 0);
			var w = this.width  - (sleft ? pleft.size + (pleft.resizable ? this.spacer : this.padding) : 0) - 
								  (sright ? pright.size + (pright.resizable ? this.spacer : this.padding): 0);
			var h = this.height - (stop ? ptop.size + (ptop.resizable ? this.spacer : this.padding) : 0) - 
								  (sbottom ? pbottom.size + (pbottom.resizable ? this.spacer : this.padding) : 0) -
								  (sprev ? pprev.size + (pprev.resizable ? this.spacer : this.padding) : 0);
			var e = $('#layout_'+ this.name +' #layout_'+ this.name +'_panel_main');
			if (window.navigator.userAgent.indexOf('MSIE') > 0 && e.length > 0 && e[0].clientHeight < e[0].scrollHeight) w += 17; // IE hack
			$('#layout_'+ this.name +' #layout_'+ this.name +'_panel_main').css({
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
				var l = 0 + (sleft ? pleft.size + (pleft.resizable ? this.spacer : this.padding) : 0);
				var t = this.height - (sbottom ? pbottom.size + (pbottom.resizable ? this.spacer : this.padding) : 0) - pprev.size;
				var w = this.width  - (sleft ? pleft.size + (pleft.resizable ? this.spacer : this.padding) : 0) - 
									  (sright ? pright.size + (pright.resizable ? this.spacer : this.padding): 0);
				var h = pprev.size;
				var e = $('#layout_'+ this.name +' #layout_'+ this.name +'_panel_preview');
				if (window.navigator.userAgent.indexOf('MSIE') > 0 && e.length > 0 && e[0].clientHeight < e[0].scrollHeight) w += 17; // IE hack
				$('#layout_'+ this.name +' #layout_'+ this.name +'_panel_preview').css({
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
					t = t - this.spacer;
					h = this.spacer;
					$('#layout_'+ this.name +' #layout_'+ this.name +'_splitter_preview').show().css({
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
				$('#layout_'+ this.name +' #layout_'+ this.name +'_panel_preview').hide();
			}
	
			// send resize event to children
			for (var i in this.panels) { 
				var p = this.panels[i];
				if (typeof p.content == 'object' && p.content.resize) {
					p.content.resize(); 
				}
			}
			// send resize to all objects
			var obj = this;
			clearTimeout(this._resize_timer);
			this._resize_timer = setTimeout(function () {
				for (var e in w2ui) {
					// do not sent resize to panels, or it will get caught in a loop
					if (typeof w2ui[e].resize == 'function' && typeof w2ui[e].panels == 'undefined') w2ui[e].resize();
				}
			}, 200);
			
			this.trigger($.extend(eventData, { phase: 'after' }));	
		},
		
		destroy: function () { 
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'destroy', target: this.name });	
			if (eventData.stop === true) return false;
			// clean up
			$(this.box).html('');
			delete w2ui[this.name];
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));	
		},
		
		// --- INTERNAL FUNCTIONS
		
		initEvents: function () {
			var obj = this;
			$(window).on('resize', function (event) {
				w2ui[obj.name].resize()
			});
			$(document).on('mousemove', function (event) {
				w2ui[obj.name].doResize(event);
			});
			$(document).on('mouseup', function (event) {
				w2ui[obj.name].stopResize(event);
			});
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
				this.tmp_value = parseInt($('#layout_'+ this.name + '_splitter_'+ type)[0].style.left);
			}
			if (type == 'top' || type == 'preview' || type == 'bottom') {
				this.tmp_value = parseInt($('#layout_'+ this.name + '_splitter_'+ type)[0].style.top);
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

			var p = $('#layout_'+ this.name + '_splitter_'+ this.tmp_resizing);
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
			var panel = this.get(this.tmp_resizing);
			switch (this.tmp_resizing) {
				case 'top':
					panel.size = parseInt(panel.size) + this.tmp_div_y;
					break;
				case 'preview':
				case 'bottom':
					panel.size = parseInt(panel.size) - this.tmp_div_y;
					break;
				case 'left':
					panel.size = parseInt(panel.size) + this.tmp_div_x;
					break;
				case 'right': 
					panel.size = parseInt(panel.size) - this.tmp_div_x;
					break;
			}	
			this.resize();
			$('#layout_'+ this.name + '_splitter_'+ this.tmp_resizing).removeClass('active');
			delete this.tmp_resizing;
		}		
	}
	
	$.extend(w2layout.prototype, $.w2event);
	w2obj.w2layout = w2layout;
})();
