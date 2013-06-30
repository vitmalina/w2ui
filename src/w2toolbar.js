/************************************************************************
*   Library: Web 2.0 UI for jQuery (using prototypical inheritance)
*   - Following objects defined
* 		- w2toolbar 	- toolbar widget
*		- $.w2toolbar	- jQuery wrapper
*   - Dependencies: jQuery, w2utils
*
* == NICE TO HAVE ==
*   - on overflow display << >>
* 
************************************************************************/

(function () {
	var w2toolbar = function (options) {
		this.box		= null,		// DOM Element that holds the element
		this.name 		= null,		// unique name for w2ui
		this.items 		= [],
		this.right 		= '',		// HTML text on the right of toolbar
		this.onClick 	= null,
		this.onRender 	= null, 
		this.onRefresh	= null,
		this.onResize   = null,
		this.onDestroy  = null
	
		$.extend(true, this, options, w2obj.toolbar);
	}
	
	// ====================================================
	// -- Registers as a jQuery plugin
	
	$.fn.w2toolbar = function(method) {
		if (typeof method === 'object' || !method ) {
			// check required parameters
			if (!method || typeof method.name == 'undefined') {
				console.log('ERROR: The parameter "name" is required but not supplied in $().w2toolbar().');
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
			var items = method.items;
			// extend items
			var object = new w2toolbar(method);
			$.extend(object, { items: [], handlers: [] });
			
			for (var i in items) { object.items[i] = $.extend({}, w2toolbar.prototype.item, items[i]); }		
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
			console.log('ERROR: Method ' +  method + ' does not exist on jQuery.w2toolbar' );
		}    
	};
	
	// ====================================================
	// -- Implementation of core functionality
	
	w2toolbar.prototype = {
		item: {
			id		: null,		// commnad to be sent to all event handlers
			type	: 'button',	// button, check, radio, drop, menu, break, html, spacer
			text	: '',
			html	: '', 
			img		: null,	
			icon 	: null,
			hidden	: false,
			disabled: false,
			checked	: false, 	// used for radio buttons
			arrow	: true,		// arrow down for drop/menu types
			hint	: '',
			group	: null, 	// used for radio buttons
			items	: null, 	// for type menu it is an array of items in the menu
			onClick	: null
		},
	
		add: function (items) {
			this.insert(null, items);
		},
		
		insert: function (id, items) {
			if (!$.isArray(items)) items = [items];
			for (var o in items) {
				// checks
				if (typeof items[o].type == 'undefined') {
					console.log('ERROR: The parameter "type" is required but not supplied in w2toolbar.add() method.');
					return;
				}
				if ($.inArray(String(items[o].type), ['button', 'check', 'radio', 'drop', 'menu', 'break', 'html', 'spacer']) == -1) {
					console.log('ERROR: The parameter "type" should be one of the following [button, check, radio, drop, menu, break, html, spacer] '+
							'in w2toolbar.add() method.');
					return;
				}
				if (typeof items[o].id == 'undefined') {
					console.log('ERROR: The parameter "id" is required but not supplied in w2toolbar.add() method.');
					return;
				}
				var unique = true;
				for (var i = 0; i < this.items.length; i++) { if (this.items[i].id == items[o].id) { unique = false; return; } }
				if (!unique) {
					console.log('ERROR: The parameter "id" is not unique within the current toolbar.');
					return;
				}
				if (!w2utils.isAlphaNumeric(items[o].id)) {
					console.log('ERROR: The parameter "id" must be alpha-numeric + "-_".');
					return;
				}
				// add item
				var it = $.extend({}, w2toolbar.prototype.item, items[o]);
				if (id == null || typeof id == 'undefined') {
					this.items.push(it);
				} else {
					var middle = this.get(id, true);
					this.items = this.items.slice(0, middle).concat([it], this.items.slice(middle));
				}
				this.refresh(it.id);
			}
		},
		
		remove: function (id) {
			var removed = 0;
			for (var a = 0; a < arguments.length; a++) {
				var it = this.get(arguments[a]);
				if (!it) continue;
				removed++;
				// remove from screen
				$(this.box).find('#tb_'+ this.name +'_item_'+ w2utils.escapeId(it.id)).remove();
				// remove from array
				var ind = this.get(it.id, true);
				if (ind) this.items.splice(ind, 1);
			}
			return removed;
		},
		
		set: function (id, options) {
			var item = this.get(id, true);
			if (item == null) return false;
			$.extend(this.items[item], options);
			this.refresh(id);
			return true;	
		},
		
		get: function (id, returnIndex) {
			for (var i = 0; i < this.items.length; i++) {
				if (this.items[i].id == id) { 
					if (returnIndex === true) return i; else return this.items[i]; 
				}
			}
			return null;
		},
			
		show: function (id) {
			var items = 0;
			for (var a = 0; a < arguments.length; a++) {
				var it = this.get(arguments[a]);
				if (!it) continue;
				items++;
				it.hidden = false;
				this.refresh(it.id);
			}
			return items;
		},
		
		hide: function (id) {
			var items = 0;
			for (var a = 0; a < arguments.length; a++) {
				var it = this.get(arguments[a]);
				if (!it) continue;
				items++;
				it.hidden = true;
				this.refresh(it.id);
			}
			return items;
		},
		
		enable: function (id) {
			var items = 0;
			for (var a = 0; a < arguments.length; a++) {
				var it = this.get(arguments[a]);
				if (!it) continue;
				items++;
				it.disabled = false;
				this.refresh(it.id);
			}
			return items;
		},
		
		disable: function (id) {
			var items = 0;
			for (var a = 0; a < arguments.length; a++) {
				var it = this.get(arguments[a]);
				if (!it) continue;
				items++;
				it.disabled = true;
				this.refresh(it.id);
			}
			return items;
		},
		
		check: function (id) {
			var items = 0;
			for (var a = 0; a < arguments.length; a++) {
				var it = this.get(arguments[a]);
				if (!it) continue;
				items++;
				it.checked = true;
				this.refresh(it.id);
			}
			return items;
		},
		
		uncheck: function (id) {
			var items = 0;
			for (var a = 0; a < arguments.length; a++) {
				var it = this.get(arguments[a]);
				if (!it) continue;
				items++;
				it.checked = false;
				this.refresh(it.id);
			}
			return items;
		},
		
		render: function (box) {
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'render', target: this.name, box: box });	
			if (eventData.stop === true) return false;
	 
			if (typeof box != 'undefined' && box != null) { 
				if ($(this.box).find('> table #tb_'+ this.name + '_right').length > 0) {
					$(this.box)
						.removeAttr('name')
						.removeClass('w2ui-reset w2ui-toolbar')
						.html('');
				}
				this.box = box;
			}
			if (!this.box) return;
			// render all buttons
			var html = '<table cellspacing="0" cellpadding="0" width="100%">'+
					   '<tr>';
			for (var i = 0; i < this.items.length; i++) {
				var it = this.items[i];
				if (it == null)  continue;
				if (it.type == 'spacer') {
					html += '<td width="100%" id="tb_'+ this.name +'_item_'+ it.id +'" align="right"></td>';
				} else {
					html += '<td id="tb_'+ this.name + '_item_'+ it.id +'" style="'+ (it.hidden ? 'display: none' : '') +'" '+
							'	class="'+ (it.disabled ? 'disabled' : '') +'" valign="middle">'+ this.getItemHTML(it) + 
							'</td>';
				}
			}
			html += '<td width="100%" id="tb_'+ this.name +'_right" align="right">'+ this.right +'</td>';
			html += '</tr>'+
					'</table>';
			$(this.box)
				.attr('name', this.name)
				.addClass('w2ui-reset w2ui-toolbar')
				.html(html);
			if ($(this.box).length > 0) $(this.box)[0].style.cssText += this.style;
			// event after
			this.trigger($.extend({ phase: 'after' }));	
		},
		
		refresh: function (id) {
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection 
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'refresh', target: (typeof id != 'undefined' ? id : this.name), item: this.get(id) });	
			if (eventData.stop === true) return false;
			
			if (typeof id == 'undefined') {
				// refresh all
				for (var i = 0; i < this.items.length; i++) {
					if (typeof this.items[i].id == 'undefined') {
						console.log('ERROR: Cannot refresh toolbar element with no id.');
						continue;
					}
					this.refresh(this.items[i].id);
				}
			}
			// create or refresh only one item
			var it = this.get(id);
			if (it == null) return;
			
			var el = $(this.box).find('#tb_'+ this.name +'_item_'+ w2utils.escapeId(it.id));
			var html  = this.getItemHTML(it);
			if (el.length == 0) {
				// does not exist - create it
				html =  '<td id="tb_'+ this.name + '_item_'+ it.id +'" style="'+ (it.hidden ? 'display: none' : '') +'" '+
						'	class="'+ (it.disabled ? 'disabled' : '') +'" valign="middle">'+ html + 
						'</td>';
				if (this.get(id, true) == this.items.length-1) {
					$(this.box).find('#tb_'+ this.name +'_right').before(html);
				} else {
					$(this.box).find('#tb_'+ this.name +'_item_'+ w2utils.escapeId(this.items[parseInt(this.get(id, true))+1].id)).before(html);
				}
			} else {
				// refresh
				el.html(html);
				if (it.hidden) { el.css('display', 'none'); } else { el.css('display', ''); }
				if (it.disabled) { el.addClass('disabled'); } else { el.removeClass('disabled'); }
			}
			// event after
			this.trigger($.extend({ phase: 'after' }));	
		},
		
		resize: function () {
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection 
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'resize', target: this.name });	
			if (eventData.stop === true) return false;

			// empty function

			// event after
			this.trigger($.extend({ phase: 'after' }));	
		},
	
		destroy: function () { 
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'destroy', target: this.name });	
			if (eventData.stop === true) return false;
			// clean up
			if ($(this.box).find('> table #tb_'+ this.name + '_right').length > 0) {
				$(this.box)
					.removeAttr('name')
					.removeClass('w2ui-reset w2ui-toolbar')
					.html('');
			}
			$(this.box).html('');
			delete w2ui[this.name];
			// event after
			this.trigger($.extend({ phase: 'after' }));	
		},
		
		// ========================================
		// --- Internal Functions
		
		getMenuHTML: function (item) { 
			var menu_html = '<table cellspacing="0" cellpadding="0" class="w2ui-toolbar-drop">';
			for (var f = 0; f < item.items.length; f++) { 
				var mitem = item.items[f];
				if (typeof mitem == 'string') {
					var tmp = mitem.split('|');
					// 1 - id, 2 - text, 3 - image, 4 - icon
					mitem = { id: tmp[0], text: tmp[0], img: null, icon: null };
					if (tmp[1]) mitem.text = tmp[1];
					if (tmp[2]) mitem.img  = tmp[2];
					if (tmp[3]) mitem.icon = tmp[3];
				} else {
					if (typeof mitem.text != 'undefined' && typeof mitem.id == 'undefined') mitem.id = mitem.text;
					if (typeof mitem.text == 'undefined' && typeof mitem.id != 'undefined') mitem.text = mitem.id;
					if (typeof mitem.caption != 'undefined') mitem.text = mitem.caption;
					if (typeof mitem.img == 'undefined') mitem.img = null;
					if (typeof mitem.icon == 'undefined') mitem.icon = null;
				}
				var img = '<td>&nbsp;</td>';
				if (mitem.img)  img = '<td><div class="w2ui-tb-image w2ui-icon '+ mitem.img +'"></div></td>';
				if (mitem.icon) img = '<td align="center"><div class="w2ui-tb-image"><span class="'+ mitem.icon +'"></span></div></td>';
				menu_html += 
					'<tr onmouseover="$(this).addClass(\'w2ui-selected\');" onmouseout="$(this).removeClass(\'w2ui-selected\');" '+
					'		onclick="$(document).click(); w2ui[\''+ this.name +'\'].doMenuClick(\''+ item.id +'\', event, \''+ f +'\');">'+
						img +
					'	<td>'+ mitem.text +'</td>'+
					'</tr>';
			}
			menu_html += "</table>";
			return menu_html;
		},
		
		getItemHTML: function (item) {
			var html = '';
			
			if (typeof item.caption != 'undefined') item.text = item.caption;
			if (typeof item.hint == 'undefined') item.hint = '';
			if (typeof item.text == 'undefined') item.text = '';
	
			switch (item.type) {
				case 'menu':
					item.html = this.getMenuHTML(item);
				case 'button':	
				case 'check':
				case 'radio':
				case 'drop':
					var img = '<td>&nbsp;</td>';
					if (item.img)  img = '<td><div class="w2ui-tb-image w2ui-icon '+ item.img +'"></div></td>';
					if (item.icon) img = '<td><div class="w2ui-tb-image"><span class="'+ item.icon +'"></span></div></td>';
					html +=  '<table cellpadding="0" cellspacing="0" title="'+ item.hint +'" class="w2ui-button '+ (item.checked ? 'checked' : '') +'" '+
							 '       onclick     = "var el=w2ui[\''+ this.name + '\']; if (el) el.doClick(\''+ item.id +'\', event);" '+
							 '       onmouseover = "' + (!item.disabled ? "$(this).addClass('over');" : "") + '"'+
							 '       onmouseout  = "' + (!item.disabled ? "$(this).removeClass('over');" : "") + '"'+
							 '       onmousedown = "' + (!item.disabled ? "$(this).addClass('down');" : "") + '"'+
							 '       onmouseup   = "' + (!item.disabled ? "$(this).removeClass('down');" : "") + '"'+
							 '>'+
							 '<tr><td>'+
							 '  <table cellpadding="1" cellspacing="0">'+
							 '  <tr>' +
							 		img +
									(item.text != '' ? '<td class="w2ui-tb-caption" nowrap>'+ item.text +'</td>' : '') +
									(((item.type == 'drop' || item.type == 'menu') && item.arrow !== false) ? 
										'<td class="w2ui-tb-down" nowrap>&nbsp;&nbsp;&nbsp;</td>' : '') +
							 '  </tr></table>'+
							 '</td></tr></table>';
					break;
								
				case 'break':
					html +=  '<table cellpadding="0" cellspacing="0"><tr>'+
							 '    <td><div class="w2ui-break">&nbsp;</div></td>'+
							 '</tr></table>';
					break;
	
				case 'html':
					html +=  '<table cellpadding="0" cellspacing="0"><tr>'+
							 '    <td nowrap>' + item.html + '</td>'+
							 '</tr></table>';
					break;
			}
			
			var newHTML = '';
			if (typeof item.onRender == 'function') newHTML = item.onRender.call(this, item.id, html);
			if (typeof this.onRender == 'function') newHTML = this.onRender(item.id, html);
			if (newHTML != '' && typeof newHTML != 'undefined') html = newHTML;
			return html;					
		},

		doMenuClick: function (id, event, menu_index) {
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection 
			var obj = this;
			var it  = this.get(id);
			if (it && !it.disabled) {
				// event before
				var eventData = this.trigger({ phase: 'before', type: 'click', target: (typeof id != 'undefined' ? id : this.name), item: this.get(id),
					  subItem: (typeof menu_index != 'undefined' && this.get(id) ? this.get(id).items[menu_index] : null), event: event });	
				if (eventData.stop === true) return false;

				// normal processing

				// event after
				this.trigger($.extend({ phase: 'after' }));	
			}
		},
				
		doClick: function (id, event) {
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection 
			var obj = this;
			var it  = this.get(id);
			if (it && !it.disabled) {
				// event before
				var eventData = this.trigger({ phase: 'before', type: 'click', target: (typeof id != 'undefined' ? id : this.name), 
					item: this.get(id), event: event });	
				if (eventData.stop === true) return false;
			
				$('#tb_'+ this.name +'_item_'+ w2utils.escapeId(it.id) +' table.w2ui-button').removeClass('down');
								
				if (it.type == 'radio') {
					for (var i = 0; i < this.items.length; i++) {
						var itt = this.items[i];
						if (itt == null || itt.id == it.id || itt.type != 'radio') continue;
						if (itt.group == it.group && itt.checked) {
							itt.checked = false;
							this.refresh(itt.id);
						}
					}
					it.checked = true;
					$('#tb_'+ this.name +'_item_'+ w2utils.escapeId(it.id) +' table.w2ui-button').addClass('checked');					
				}

				if (it.type == 'drop' || it.type == 'menu') {
					if (it.checked) {
						// if it was already checked, second click will hide it
						it.checked = false;
					} else {
						// show overlay
						setTimeout(function () {
							var w = $('#tb_'+ obj.name +'_item_'+ w2utils.escapeId(it.id)).width();
							if (!$.isPlainObject(it.overlay)) it.overlay = {};
							$('#tb_'+ obj.name +'_item_'+ w2utils.escapeId(it.id)).w2overlay(it.html, $.extend({ left: (w-50)/2, top: 3 }, it.overlay));
							// window.click to hide it
							$(document).on('click', hideDrop);
							function hideDrop() {
								it.checked = !it.checked;
								if (it.checked) {
									$('#tb_'+ obj.name +'_item_'+ w2utils.escapeId(it.id) +' table.w2ui-button').addClass('checked');
								} else {
									$('#tb_'+ obj.name +'_item_'+ w2utils.escapeId(it.id) +' table.w2ui-button').removeClass('checked');					
								}
								obj.refresh(it.id);
								$(document).off('click', hideDrop);
							}
						}, 1);
					}
				}

				if (it.type == 'check' || it.type == 'drop' || it.type == 'menu') {
					it.checked = !it.checked;
					if (it.checked) {
						$('#tb_'+ this.name +'_item_'+ w2utils.escapeId(it.id) +' table.w2ui-button').addClass('checked');
					} else {
						$('#tb_'+ this.name +'_item_'+ w2utils.escapeId(it.id) +' table.w2ui-button').removeClass('checked');					
					}
				}
				// event after
				this.trigger($.extend({ phase: 'after' }));	
			}
		}		
	}
	
	$.extend(w2toolbar.prototype, $.w2event);
	w2obj.toolbar = w2toolbar;
})();
