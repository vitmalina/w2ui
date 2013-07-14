/************************************************************************
*   Library: Web 2.0 UI for jQuery (using prototypical inheritance)
*   - Following objects defined
* 		- w2tabs 	- tabs widget
*		- $.w2tabs	- jQuery wrapper
*   - Dependencies: jQuery, w2utils
*
* == NICE TO HAVE ==
*	- tabs might not work in chromium apps, need bind()
*   - on overflow display << >>
* 	- individual tab onClick (possibly other events) are not working
*
* == NICE TO HAVE ==
*	- doClick -> click, doClose -> animateClose, doInsert -> animateInsert
*
************************************************************************/

(function () {
	var w2tabs = function (options) {
		this.box		= null;		// DOM Element that holds the element
		this.name		= null;		// unique name for w2ui
		this.active		= null;
		this.tabs		= [];
		this.right		= '';
		this.style		= '';
		this.onClick	= null;
		this.onClose	= null;
		this.onRender	= null;
		this.onRefresh	= null;
		this.onResize	= null;
		this.onDestroy	= null;

		$.extend(true, this, options, w2obj.tabs);
	}
	
	// ====================================================
	// -- Registers as a jQuery plugin
	
	$.fn.w2tabs = function(method) {
		if (typeof method === 'object' || !method ) {
			// check required parameters
			if (!method || typeof method.name == 'undefined') {
				console.log('ERROR: The parameter "name" is required but not supplied in $().w2tabs().');
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
			// extend tabs
			var tabs   = method.tabs;
			var object = new w2tabs(method);
			$.extend(object, { tabs: [], handlers: [] });
			for (var i in tabs) { object.tabs[i] = $.extend({}, w2tabs.prototype.tab, tabs[i]); }		
			if ($(this).length != 0) {
				object.render($(this)[0]);
			}
			// register new object
			w2ui[object.name] = object;
			return object;

		} else if (w2ui[$(this).attr('name')]) {
			var obj = w2ui[$(this).attr('name')];
			obj[method].apply(obj, Array.prototype.slice.call(arguments, 1));
			return this;
		} else {
			console.log('ERROR: Method ' +  method + ' does not exist on jQuery.w2tabs' );
		}    
	};
	
	// ====================================================
	// -- Implementation of core functionality
	
	w2tabs.prototype = {
		tab : {
			id		  : null,		// commnad to be sent to all event handlers
			text	  : '',
			hidden	  : false,
			disabled  : false,
			closable  :	false,
			hint	  : '',
			onClick	  : null,
			onRefresh : null,
			onClose	  : null
		},
		
		add: function (tab) {
			return this.insert(null, tab);
		},
		
		insert: function (id, tab) {
			if (!$.isArray(tab)) tab = [tab];
			// assume it is array
			for (var r in tab) {
				// checks
				if (String(tab[r].id) == 'undefined') {
					console.log('ERROR: The parameter "id" is required but not supplied. (obj: '+ this.name +')');
					return;
				}
				var unique = true;
				for (var i in this.tabs) { if (this.tabs[i].id == tab[r].id) { unique = false; break; } }
				if (!unique) {
					console.log('ERROR: The parameter "id='+ tab[r].id +'" is not unique within the current tabs. (obj: '+ this.name +')');
					return;
				}
				if (!w2utils.isAlphaNumeric(tab[r].id)) {
					console.log('ERROR: The parameter "id='+ tab[r].id +'" must be alpha-numeric + "-_". (obj: '+ this.name +')');
					return;
				}
				// add tab
				var tab = $.extend({}, tab, tab[r]);
				if (id == null || typeof id == 'undefined') {
					this.tabs.push(tab);
				} else {
					var middle = this.get(id, true);
					this.tabs = this.tabs.slice(0, middle).concat([tab], this.tabs.slice(middle));
				}		
				this.refresh(tab[r].id);		
			}
		},
		
		remove: function (id) {
			var removed = 0;
			for (var a = 0; a < arguments.length; a++) {
				var tab = this.get(arguments[a]);
				if (!tab) return false;
				removed++;
				// remove from array
				this.tabs.splice(this.get(tab.id, true), 1);
				// remove from screen
				$(this.box).find('#tabs_'+ this.name +'_tab_'+ w2utils.escapeId(tab.id)).remove();
			}
			return removed;
		},

		select: function (id) {
			if (this.get(id) == null || this.active == id) return false;
			this.active = id;
			this.refresh();
			return true;
		},
		
		set: function (id, tab) {
			var index = this.get(id, true);
			if (index == null) return false;
			$.extend(this.tabs[index], tab);
			this.refresh(id);
			return true;	
		},
		
		get: function (id, returnIndex) {
			for (var i in this.tabs) {
				if (this.tabs[i].id == id) { 
					if (returnIndex === true) return i; else return this.tabs[i]; 
				}
			}
			return null;	
		},
		
		show: function () {
			var shown = 0;
			for (var a = 0; a < arguments.length; a++) {
				var tab = this.get(arguments[a]);
				if (!tab || tab.hidden === false) continue;
				tab.hidden = false;
				this.refresh(tab.id);
				shown++;
			}
			return shown;
		},
		
		hide: function () {
			var hidden = 0;
			for (var a = 0; a < arguments.length; a++) {
				var tab = this.get(arguments[a]);
				if (!tab || tab.hidden === true) continue;
				tab.hidden = true;
				this.refresh(tab.id);
				hidden++;
			}
			return hidden;
		},
		
		enable: function (id) {
			var enabled = 0;
			for (var a = 0; a < arguments.length; a++) {
				var tab = this.get(arguments[a]);
				if (!tab || tab.disabled === false) continue;
				tab.disabled = false;
				this.refresh(tab.id);
				enabled++;
			}
			return enabled;
		},
		
		disable: function (id) {
			var disabled = 0;
			for (var a = 0; a < arguments.length; a++) {
				var tab = this.get(arguments[a]);
				if (!tab || tab.disabled === true) continue;
				tab.disabled = true;
				this.refresh(tab.id);
				disabled++;
			}
			return disabled;
		},
			
		refresh: function (id) {
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection 
			if (String(id) == 'undefined') {
				// refresh all
				for (var i in this.tabs) this.refresh(this.tabs[i].id);
			}
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'refresh', target: (typeof id != 'undefined' ? id : this.name), tab: this.get(id) });	
			if (eventData.stop === true) return false;
			// create or refresh only one item
			var tab = this.get(id);
			if (tab == null) return;
			if (typeof tab.caption != 'undefined') tab.text = tab.caption;
			
			var jq_el   = $(this.box).find('#tabs_'+ this.name +'_tab_'+ w2utils.escapeId(tab.id));
			var tabHTML = (tab.closable ? '<div class="w2ui-tab-close" onclick="w2ui[\''+ this.name +'\'].animateClose(\''+ tab.id +'\', event);"></div>' : '') +
						  '	<div class="w2ui-tab'+ (this.active == tab.id ? ' active' : '') + (tab.closable ? ' closable' : '') +'" '+
						  '		title="'+ (typeof tab.hint != 'undefined' ? tab.hint : '') +'"'+
						  '		onclick="w2ui[\''+ this.name +'\'].click(\''+ tab.id +'\', event);">' + tab.text + '</div>';
			if (jq_el.length == 0) {
				// does not exist - create it
				var addStyle = '';
				if (tab.hidden) { addStyle += 'display: none;'; }
				if (tab.disabled) { addStyle += 'opacity: 0.2; -moz-opacity: 0.2; -webkit-opacity: 0.2; -o-opacity: 0.2; filter:alpha(opacity=20);'; }
				html = '<td id="tabs_'+ this.name + '_tab_'+ tab.id +'" style="'+ addStyle +'" valign="middle">'+ tabHTML + '</td>';
				if (this.get(id, true) != this.tabs.length-1 && $(this.box).find('#tabs_'+ this.name +'_tab_'+ w2utils.escapeId(this.tabs[parseInt(this.get(id, true))+1].id)).length > 0) {
					$(this.box).find('#tabs_'+ this.name +'_tab_'+ w2utils.escapeId(this.tabs[parseInt(this.get(id, true))+1].id)).before(html);
				} else {
					$(this.box).find('#tabs_'+ this.name +'_right').before(html);
				}
			} else {
				// refresh
				jq_el.html(tabHTML);
				if (tab.hidden) { jq_el.css('display', 'none'); }
							else { jq_el.css('display', ''); }
				if (tab.disabled) { jq_el.css({ 'opacity': '0.2', '-moz-opacity': '0.2', '-webkit-opacity': '0.2', '-o-opacity': '0.2', 'filter': 'alpha(opacity=20)' }); }
							else { jq_el.css({ 'opacity': '1', '-moz-opacity': '1', '-webkit-opacity': '1', '-o-opacity': '1', 'filter': 'alpha(opacity=100)' }); }
			}
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},
		
		render: function (box) {
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'render', target: this.name, box: box });	
			if (eventData.stop === true) return false;
			// default action
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection 
			if (String(box) != 'undefined' && box != null) { 
				if ($(this.box).find('> table #tabs_'+ this.name + '_right').length > 0) {
					$(this.box)
						.removeAttr('name')
						.removeClass('w2ui-reset w2ui-tabs')
						.html('');
				}
				this.box = box;
			}
			if (!this.box) return;
			// render all buttons
			var html = '<table cellspacing="0" cellpadding="1" width="100%">'+
					   '	<tr><td width="100%" id="tabs_'+ this.name +'_right" align="right">'+ this.right +'</td></tr>'+
					   '</table>';
			$(this.box)
				.attr('name', this.name)
				.addClass('w2ui-reset w2ui-tabs')
				.html(html);
			if ($(this.box).length > 0) $(this.box)[0].style.cssText += this.style;
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			this.refresh();
		},
		
		resize: function () {
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection 
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'resize', target: this.name });	
			if (eventData.stop === true) return false;
			// empty function
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},
	
		destroy: function () { 
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'destroy', target: this.name });	
			if (eventData.stop === true) return false;
			// clean up
			if ($(this.box).find('> table #tabs_'+ this.name + '_right').length > 0) {
				$(this.box)
					.removeAttr('name')
					.removeClass('w2ui-reset w2ui-tabs')
					.html('');
			}
			delete w2ui[this.name];
			// event after
			this.trigger($.extend({ phase: 'after' }));	
		},
		
		// ===================================================
		// -- Internal Event Handlers
	
		click: function (id, event) {
			var tab = this.get(id);
			if (tab == null || tab.disabled) return false;
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'click', target: id, tab: this.get(id), event: event });	
			if (eventData.stop === true) return false;
			// default action
			$(this.box).find('#tabs_'+ this.name +'_tab_'+ w2utils.escapeId(this.active) +' .w2ui-tab').removeClass('active');
			this.active = tab.id;
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			this.refresh(id);
		},
		
		animateClose: function(id, event) {
			var tab = this.get(id);
			if (tab == null || tab.disabled) return false;
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'close', target: id, tab: this.get(id), event: event });	
			if (eventData.stop === true) return false;
			// default action
			var obj = this;
			$(this.box).find('#tabs_'+ this.name +'_tab_'+ w2utils.escapeId(tab.id)).css({ 
				'-webkit-transition': '.2s', 
				'-moz-transition': '2s', 
				'-ms-transition': '.2s', 
				'-o-transition': '.2s', 
				opacity: '0' });
			setTimeout(function () {
				var width = $(obj.box).find('#tabs_'+ obj.name +'_tab_'+ w2utils.escapeId(tab.id)).width();
				$(obj.box).find('#tabs_'+ obj.name +'_tab_'+ w2utils.escapeId(tab.id))
					.html('<div style="width: '+ width +'px; -webkit-transition: .2s; -moz-transition: .2s; -ms-transition: .2s; -o-transition: .2s"></div>')
				setTimeout(function () {
					$(obj.box).find('#tabs_'+ obj.name +'_tab_'+ w2utils.escapeId(tab.id)).find(':first-child').css({ 'width': '0px' });
				}, 50);
			}, 200);
			setTimeout(function () {
				obj.remove(id);		
			}, 450);
			// event before
			this.trigger($.extend(eventData, { phase: 'after' }));
			this.refresh();
		},

		animateInsert: function(id, tab) {		
			if (this.get(id) == null) return;
			if (!$.isPlainObject(tab)) return;
			// check for unique
			var unique = true;
			for (var i in this.tabs) { if (this.tabs[i].id == tab.id) { unique = false; break; } }
			if (!unique) {
				console.log('ERROR: The parameter "id='+ tab.id +'" is not unique within the current tabs. (obj: '+ this.name +')');
				return;
			}
			// insert simple div
			var jq_el   = $(this.box).find('#tabs_'+ this.name +'_tab_'+ w2utils.escapeId(tab.id));
			if (jq_el.length != 0) return; // already exists
			// measure width
			if (typeof tab.caption != 'undefined') tab.text = tab.caption;
			var tmp = '<div id="_tmp_tabs" class="w2ui-reset w2ui-tabs" style="position: absolute; top: -1000px;">'+
				'<table cellspacing="0" cellpadding="1" width="100%"><tr>'+
				'<td id="_tmp_simple_tab" style="" valign="middle">'+
					(tab.closable ? '<div class="w2ui-tab-close"></div>' : '') +
				'	<div class="w2ui-tab '+ (this.active == tab.id ? 'active' : '') +'">'+ tab.text +'</div>'+
				'</td></tr></table>'+
				'</div>';
			$('body').append(tmp);
			// create dummy element
			tabHTML = '<div style="width: 1px; -webkit-transition: 0.2s; -moz-transition: 0.2s; -ms-transition: 0.2s; -o-transition: 0.2s;">&nbsp;</div>';
			var addStyle = '';
			if (tab.hidden) { addStyle += 'display: none;'; }
			if (tab.disabled) { addStyle += 'opacity: 0.2; -moz-opacity: 0.2; -webkit-opacity: 0.2; -o-opacity: 0.2; filter:alpha(opacity=20);'; }
			html = '<td id="tabs_'+ this.name +'_tab_'+ tab.id +'" style="'+ addStyle +'" valign="middle">'+ tabHTML +'</td>';
			if (this.get(id, true) != this.tabs.length && $(this.box).find('#tabs_'+ this.name +'_tab_'+ w2utils.escapeId(this.tabs[parseInt(this.get(id, true))].id)).length > 0) {
				$(this.box).find('#tabs_'+ this.name +'_tab_'+ w2utils.escapeId(this.tabs[parseInt(this.get(id, true))].id)).before(html);
			} else {
				$(this.box).find('#tabs_'+ this.name +'_right').before(html);
			}
			// -- move
			var obj = this;
			setTimeout(function () { 
				var width = $('#_tmp_simple_tab').width();
				$('#_tmp_tabs').remove();
				$('#tabs_'+ obj.name +'_tab_'+ w2utils.escapeId(tab.id) +' > div').css('width', width+'px'); 
			}, 1);
			setTimeout(function () {
				// insert for real
				obj.insert(id, tab);
			}, 200);
		}
	}
	
	$.extend(w2tabs.prototype, $.w2event);
	w2obj.tabs = w2tabs;
})();
