/************************************************************************
*   Library: Web 2.0 UI for jQuery (using prototypical inheritance)
*   - Following objects defined
* 		- w2ui.w2field 	- various field controls
*		- $.w2field		- jQuery wrapper
*   - Dependencies: jQuery, w2utils
* 
************************************************************************/

(function ($) {

	// ====================================================
	// -- Registers as a jQuery plugin
	
	$.fn.w2field = function(method) {
		// Method calling logic
		if (w2field[method]) {
			return w2field[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object') {
			return w2field.init.apply( this, arguments );
		} else if ( typeof method === 'string') {
			return w2field.init.apply( this, [{ type: method }] );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.w2field' );
		}    
	};
	
	// ====================================================
	// -- Implementation of core functionality
	
	var w2field = {
		// CONTEXT: this - is jQuery object
		init: function (options) { 		
			var obj = w2field;
			return $(this).each(function (field, index) {
				switch (options.type.toLowerCase()) {
					case 'clear': // removes any previous field type
						$(this).off('keypress').off('focus').off('blur');
						if ($(this).prev().hasClass('w2ui-list')) {	// if enum
							$(this).prev().remove();
							$(this).removeAttr('tabindex');
						}
						break;
					case 'int':
						$(this).on('keypress', function (evnt) { // keyCode & charCode differ in FireFox
							if (evnt.metaKey || evnt.ctrlKey || evnt.altKey || (evnt.charCode != evnt.keyCode && evnt.keyCode > 0)) return;
							var ch = String.fromCharCode(evnt.charCode);
							if (!w2utils.isInt(ch) && ch != '-') {
								evnt.stopPropagation();
								return false;
							}
						});
						$(this).on('blur', function (evnt)  { // keyCode & charCode differ in FireFox
							if (!w2utils.isInt(this.value)) { this.value = ''; $(this).trigger('change'); } 
						});
						break;
						
					case 'float':
						$(this).on('keypress', function (evnt) { // keyCode & charCode differ in FireFox
							if (evnt.metaKey || evnt.ctrlKey || evnt.altKey || (evnt.charCode != evnt.keyCode && evnt.keyCode > 0)) return;
							var ch = String.fromCharCode(evnt.charCode);
							if (!w2utils.isInt(ch) && ch != '.' && ch != '-') {
								evnt.stopPropagation();
								return false;
							}
						});
						$(this).on('blur', function (evnt)  { 
							if (!w2utils.isFloat(this.value)) { this.value = ''; $(this).trigger('change'); } 
						});
						break;
						
					case 'money':
						$(this).on('keypress', function (evnt) { // keyCode & charCode differ in FireFox	
							if (evnt.metaKey || evnt.ctrlKey || evnt.altKey || (evnt.charCode != evnt.keyCode && evnt.keyCode > 0)) return;
							var ch = String.fromCharCode(evnt.charCode);
							if (!w2utils.isInt(ch) && ch != '.' && ch != '-' && ch != '$' && ch != '€' && ch != '£' && ch != '¥') {
								evnt.stopPropagation();
								return false;
							}
						});
						$(this).on('blur', function (evnt)  { 
							if (!w2utils.isMoney(this.value)) { this.value = ''; $(this).trigger('change'); } 
						});
						break;
						
					case 'hex':
						$(this).on('keypress', function (evnt) { // keyCode & charCode differ in FireFox	
							if (evnt.metaKey || evnt.ctrlKey || evnt.altKey || (evnt.charCode != evnt.keyCode && evnt.keyCode > 0)) return;
							var ch = String.fromCharCode(evnt.charCode);
							if (!w2utils.isHex(ch)) {
								evnt.stopPropagation();
								return false;
							}
						});
						$(this).on('blur', function (evnt)  { 
							if (!w2utils.isHex(this.value)) { this.value = ''; $(this).trigger('change'); } 
						});
						break;
						 
					case 'alphanumeric':
						$(this).on('keypress', function (evnt) { // keyCode & charCode differ in FireFox
							if (evnt.metaKey || evnt.ctrlKey || evnt.altKey || (evnt.charCode != evnt.keyCode && evnt.keyCode > 0)) return;
							var ch = String.fromCharCode(evnt.charCode);
							if (!w2utils.isAlphaNumeric(ch)) {
								evnt.stopPropagation();
								return false;
							}
						});
						$(this).on('blur', function (evnt)  { 
							if (!w2utils.isAlphaNumeric(this.value)) { this.value = ''; } 
						});
						break;
						
					case 'date':
						var obj = this;
						// -- insert div for calendar
						if ($(this).length == 0 || $('#'+$(this)[0].id).length != 1) {
							console.error('The date field must have a unique id in w2field(\'date\').');
							return;
						}
						$(this) // remove transtion needed for functionality
							.css( { 'transition': 'none', '-webkit-transition': 'none', '-moz-transition': 'none', '-ms-transition': 'none', '-o-transition': 'none' })
							.data("options", options)
							.on('focus', function () {
								var top  = parseFloat($(obj).offset().top) + parseFloat(obj.offsetHeight);
								var left = parseFloat($(obj).offset().left);
								$('#global_calendar_div').remove();
								$('body').append('<div id="global_calendar_div" style="position: absolute; z-index: 1600; display: none;'+
									'		top: '+ (top + parseInt(obj.offsetHeight)) +'px; left: '+ left +'px;" '+
									' class="w2ui-reset w2ui-calendar" '+
									' onmousedown="event.stopPropagation(); event.preventDefault();"></div>');
								$('#global_calendar_div')
									.html($().w2field('calendar_get', obj.value, options))
									.css({
										left: left + 'px',
										top: top + 'px'
									})
									.data('el', obj)
									.show();
								// monitors
								var mtimer = setInterval(function () { 
									// monitor if moved
									if ($('#global_calendar_div').data('position') != ($(obj).offset().left) + 'x' + ($(obj).offset().top  + obj.offsetHeight)) {
										$('#global_calendar_div').css({
											'-webkit-transition': '.2s',
											left: ($(obj).offset().left) + 'px',
											top : ($(obj).offset().top + obj.offsetHeight) + 'px'
										}).data('position', ($(obj).offset().left) + 'x' + ($(obj).offset().top + obj.offsetHeight));
									}
									// monitor if destroyed
									if ($(obj).length == 0 || ($(obj).offset().left == 0 && $(obj).offset().top == 0)) {
										clearInterval(mtimer);
										$('#global_calendar_div').remove();
										return;
									}
								}, 100);
								$(obj).data('mtimer', mtimer);
							})
							.on('blur', function (event) {
								if (!w2utils.isDate($(obj).val())) $(obj).val('');
								clearInterval($(obj).data('mtimer'));
								$('#global_calendar_div').remove();
							})
							.on('keypress', function (event) {
								var obj = this;
								setTimeout(function () {
									$('#global_calendar_div').html( $().w2field('calendar_get', obj.value, options) );
								}, 10);
							});
						break;
						
					case 'time':
						break;

					case 'datetime':
						break;
						
					case 'color':
						break;

					case 'list': // drop down with read only <input>
						break;

					case 'enum':
						var defaults = {
							url			: '',
							items		: [],
							selected 	: [],		// preselected items
							max 		: 0,		// maximum number of items that can be selected 0 for unlim
							maxHeight 	: 72, 		// max height for input control to grow
							showAll		: false,	// if true then show selected item in drop down
							maxCache 	: 500,		// number items to cache
							onRender 	: null,		// -- not implemented
							onSelect 	: null		// -- not implemented
						}
						var obj	= this;
						$(obj).css({ 'border-color': 'transparent' });

						var settings = $.extend({}, defaults, options);
						if ($.isArray(settings.selected)) { $(this).data('selected', settings.selected); } else { $(this).data('selected', []); }

						// if items is array convert to an object
						if ($.isArray(settings.items) && !$.isPlainObject(settings.items[0])) {
							var items = [];
							for (var i in settings.items) {
								items.push({
									'id' 	: settings.items[i],
									'text'	: settings.items[i]
								});
							}
							settings.items = items;
						}

						// add item to selected
						this.add = function (item) {
							var selected = $(this).data('selected');
							if (!$.isArray(selected)) selected = [];
							if (settings.max != 0 && settings.max <= selected.length) {
								// if max reached, replace last
								selected.splice(selected.length - 1, 1);
							}
							selected.push(item);
							$(this).data('selected', selected);
							$(this).data('last_del', null);
							$(this).trigger('change');
						}

						this.show = function () {
							// insert global div
							if ($('#w2ui-global-items').length == 0) {
								$('body').append('<div id="w2ui-global-items" class="w2ui-reset w2ui-items" '+
									'style="position: absolute; z-index: 1200; display: none; -moz-box-sizing: border-box; -webkit-box-sizing: border-box;">'+
									'</div>');
							} else {
								// ignore second click
								return;	
							}
							var div = $('#w2ui-global-items');
							div.css({
									display : 'block',
									left 	: ($(obj).offset().left) + 'px',
									top 	: ($(obj).offset().top + obj.offsetHeight) + 'px'
								})
								.width(w2utils.getSize(obj, 'width'))
								.data('position', ($(obj).offset().left) + 'x' + ($(obj).offset().top + obj.offsetHeight));

							// show drop content
							w2field.list_render.call(obj);

							// monitors
							var monitor = function () { 
								var div = $('#w2ui-global-items');
								// monitor if destroyed
								if ($(obj).length == 0 || ($(obj).offset().left == 0 && $(obj).offset().top == 0)) {
									clearInterval($(obj).data('mtimer'));
									hide(); 
									return;
								}
								// monitor if moved
								if (div.data('position') != ($(obj).offset().left) + 'x' + ($(obj).offset().top  + obj.offsetHeight)) {
									div.css({
										'-webkit-transition': '.2s',
										left: ($(obj).offset().left) + 'px',
										top : ($(obj).offset().top + obj.offsetHeight) + 'px'
									})
									.data('position', ($(obj).offset().left) + 'x' + ($(obj).offset().top + obj.offsetHeight));
									// if moved then resize
									setTimeout(function () {
										w2field.list_render.call(obj, $(obj).data('last_search'));
									}, 200);
								}
								if (div.length > 0) $(obj).data('mtimer', setTimeout(monitor, 100));
							};
							$(obj).data('mtimer', setTimeout(monitor, 100));
						}						

						this.hide = function () {
							clearTimeout($(obj).data('mtimer'));
							$('#w2ui-global-items').remove();
						}

						// render controls with all items in it
						this.refresh = function () {
							var obj = this;
							// remove all items
							$($(this).data('selected-div')).remove();
							// rebuild it
							var margin = 'margin-top: ' + $(this).css('margin-top') + '; ' +
										 'margin-bottom: ' + $(this).css('margin-bottom') + '; ' +
										 'margin-left: ' + $(this).css('margin-left') + '; ' +
										 'margin-right: ' + $(this).css('margin-right') + '; '+
										 'width: ' + (w2utils.getSize(this, 'width') 
										 		   - parseInt($(this).css('margin-left')) 
										 		   - parseInt($(this).css('margin-right'))) + 'px; ';
							var html = '<div class="w2ui-list" style="'+ margin + ';">'+
									   '<ul>';
							var selected = $(this).data('selected');
							for (var s in selected) {
								html += '<li style="'+ ($(this).data('last_del') == s ? 'opacity: 0.5' : '') +'">'+
										'<div title="Remove" index="'+ s +'">&nbsp;&nbsp;</div>'+
										selected[s].text +
										'</li>';
							}
							html += '<li><input type="text" style="width: 10px; background-color: transparent"></li>';
							html += '</ul></div>';
							$(this).before(html);
							// adjust height
							var div = $(this).prev();
							$(this).data('selected-div', div);
							var cntHeight = w2utils.getSize(div, 'height')
								- parseInt($(div).css('margin-top')) 
								- parseInt($(div).css('margin-bottom'));
							if (cntHeight < 23) cntHeight = 23;
							if (cntHeight > settings.maxHeight) cntHeight = settings.maxHeight;
							$(div).height(cntHeight);
							if (div.length > 0) div[0].scrollTop = 1000;
							$(this).height(cntHeight);

							$(div).on('click', function (event) {
								var el = event.target;
								if (el.title == 'Remove') {
									$(obj).data('selected').splice($(el).attr('index'), 1);
									$(el.parentNode).remove();
									obj.refresh(); 
									w2field.list_render.call(obj);
									$(obj).trigger('change');
									event.stopPropagation();
								}
								$(this).find('input').focus();
							});
							$(div).find('input')
								.on('focus', function (event) {
									$(div).css({ 'outline': 'auto 5px -webkit-focus-ring-color', 'outline-offset': '-2px' });
									obj.show();
									event.stopPropagation();
								})
								.on('blur', function (event) {
									$(div).css('outline', 'none');
									obj.hide();
									event.stopPropagation();
								});
						}
						// init control
						$(this).data('settings', settings).attr('tabindex', -1);
						this.refresh();
						break;
				}
			});
		},
		
		// ******************************************************
		// -- Implementation

		list_render: function (search) {
			var obj 	 = this;
			var div 	 = $('#w2ui-global-items');
			var settings = $(this).data('settings');
			var selected = $(this).data('selected');
			if (div.length == 0) return; // if it is hidden
			if (typeof settings.items == 'undefined') settings.items = [];

			// build overall html
			if (typeof search == 'undefined') {
				var html 	 = '';
				html += '<div style="border-radius: 4px; background-color: white; padding: 3px;">'+
						'	<div class="list_items" style="padding-top: 3px;"></div>'+
						'</div>';
				div.html(html);
				search = '';
			}
			$(this).data('last_search', search);
			if (typeof $(obj).data('last_index') == 'undefined' || $(obj).data('last_index') == null) $(obj).data('last_index', 0);

			// pull items from url
			if (typeof settings.last_total == 'undefined') settings.last_total = -1;
			if (typeof settings.last_search_len == 'undefined') settings.last_search_len = 0;
			if (typeof settings.last_search_match == 'undefined') settings.last_search_match = -1;
			if (settings.url != '' && ( 
					   (settings.items.length == 0 && settings.last_total != 0) 
					|| (search.length > settings.last_search_len && settings.last_total > settings.maxCache)
					|| (search.length < settings.last_search_match && search.length != settings.last_search_len)
				)
			) {
				var match = false;
				if (settings.last_total < settings.maxCache) match = true;
				$.ajax({
					type 	: 'GET',
					dataType: 'text',
					url 	: settings.url,
					data 	: {
						search 	: search,
						max 	: settings.maxCache
					},
					complete: function (xhr, status) {
						settings.last_total = 0;
						if (status == 'success') {
							var data = $.parseJSON(xhr.responseText);
							if (match == false && data.total < settings.maxCache) { settings.last_search_match = search.length; }
							settings.last_search_len = search.length;
							settings.last_total = data.total
							settings.items      = data.options;
							w2field.list_render.call(obj, search);
						}
					}
				});
			}
			
			// build items
			var i = 0;
			var items = settings.items;
			var ihtml = '<ul>';
			// get ids of all selected items
			var ids	  = [];
			for (var a in selected) ids.push(w2utils.isInt(selected[a].id) ? parseInt(selected[a].id) : String(selected[a].id))
			// build list
			for (var a in items) {
				if (items[a] == '') continue;
				if (typeof items[a] == 'object') {
					var txt = String(items[a].text);
					if (txt == null && typeof items[a].caption != 'undefined') txt = items[a].caption;
					var id  = items[a].id;
					if (id == null && typeof items[a].value != 'undefined') id = items[a].value;
					if (id == null || String(id) == 'undefined' || id == '') id = txt;
				}
				if (typeof items[a] == 'string') {
					var id  = items[a];
					var txt = items[a];
				}
				// if already selected
				if ($.inArray(w2utils.isInt(id) ? parseInt(id) : String(id), ids) != -1 && settings.showAll !== true) continue;
				// check match with search
				var txt1 = String(search).toLowerCase();
				var txt2 = txt.toLowerCase();
				if (txt1.length <= txt2.length && txt2.substr(0, txt1.length) == txt1) {
					if (typeof settings['render'] == 'function') {
						txt = settings['render'](items[a]);
					}
					ihtml += '\n<li style="display: block; -webkit-transition: 0.2s" index="'+ a +'" value="'+ id +'" '+
							 '  onmouseover="$(this).parent().find(\'li\').removeClass(\'selected\'); $(this).addClass(\'selected\'); "'+
							 '	class="'+ (i % 2 ? 'w2ui-item-even' : 'w2ui-item-odd') + (i == $(obj).data('last_index') ? " selected" : "") +'">'+ 
							 txt +'</li>';
					if (i == $(obj).data('last_index')) $(obj).data('last_item', items[a]);
					i++;
				}
			}
			ihtml += '</ul>';
			if (i == 0) { 
				ihtml   = '<div style="padding: 2px; padding-bottom: 5px; text-align: center; color: gray">No items found</div>';
				var noItems = true;
			}
			div.find('.list_items').html(ihtml);
			$(this).data('last_max', i-1);	

			// scroll selected into view
			if (div.find('li.selected').length > 0) div.find('li.selected')[0].scrollIntoView(false);

			// if menu goes off screen - add scrollbar
			div.css({ '-webkit-transition': '0s', height : 'auto' }); 
			var max_height = parseInt($(document).height()) - parseInt(div.offset().top) - 8;
			if (parseInt(div.height()) > max_height) {
				div.css({ 
					height 	: (max_height - 5) + 'px', 
					overflow: 'show' 
				});
				$(div).find('.list_items').css({
					height 	: (max_height - 15) + 'px', 
					overflow: 'auto' 
				});
			}

			// add events
			$(div)
				.off('mousedown')
				.on('mousedown', function (event) {
					var id 	 = $(event.target).attr('index');
					var item = settings.items[id];
					if (typeof id == 'undefined') { event.preventDefault(); return; }
					obj.add(item);
					$(obj).data('last_index', 0);
					obj.refresh();
					w2field.list_render.call(obj, '');
				}
			);
			$(obj).prev().find('li > input')
				.val(search)
				.css('max-width', ($(div).width() - 25) + 'px')
				.width(((search.length + 2) * 6) + 'px')
				.focus()
				.on('click', function (event) {
					event.stopPropagation();
				})
				.off('keyup')
				.on('keyup', function (event) {
					var inp = this;
					setTimeout(function () { 
						var curr = $(obj).data('last_index');						
						switch (event.keyCode) {
							case 38: // up
								curr--;
								if (curr < 0) curr = 0;
								$(obj).data('last_index', curr);
								event.preventDefault();
								break;
							case 40: // down
								curr++;
								if (curr > $(obj).data('last_max')) curr = $(obj).data('last_max');
								$(obj).data('last_index', curr);
								event.preventDefault();
								break;
							case 13: // enter
								if (typeof $(obj).data('last_item') == 'undefined' || $(obj).data('last_item') == null || noItems === true) break;
								var selected = $(obj).data('selected'); 
								obj.add($(obj).data('last_item'));
								// select next
								if (curr > $(obj).data('last_max') - 1) curr = $(obj).data('last_max')-1;
								$(obj).data('last_index', curr);
								$(obj).data('last_item', null);
								// refrech
								$(inp).val('');
								obj.refresh();
								event.preventDefault();
								break;
							case 8: // backspace
								if (inp.value == '') {
									if (typeof $(obj).data('last_del') == 'undefined' || $(obj).data('last_del') == null) {
										// mark for deletion
										var selected = $(obj).data('selected'); 
										if (!$.isArray(selected)) selected = [];
										$(obj).data('last_del', selected.length-1);
										// refrech
										obj.refresh();
									} else {
										// delete marked one
										var selected = $(obj).data('selected'); 
										if (!$.isArray(selected)) selected = [];
										if (selected.length > 0) {
											selected.splice(selected.length-1, 1);
										}
										$(obj).data('selected', selected);
										$(obj).data('last_del', null);
										// refrech
										obj.refresh();
										$(obj).trigger('change');
									}
								}
								break;
							default: 
								$(obj).data('last_index', 0);
								$(obj).data('last_del', null);
								break;
						}
						// adjust height
						var div = $(obj).prev();
						div.css('height', 'auto');
						var cntHeight = w2utils.getSize(div, 'height')
							- parseInt($(div).css('margin-top')) 
							- parseInt($(div).css('margin-bottom'));
						if (cntHeight < 23) cntHeight = 23;
						if (cntHeight > settings.maxHeight) cntHeight = settings.maxHeight;
						$(div).height(cntHeight);
						if (div.length > 0) div[0].scrollTop = 1000;
						$(obj).height(cntHeight);
						// refresh menu
						if (!(event.keyCode == 8 && inp.value == '')) { 
							$(obj).prev().find('li').css('opacity', '1');
							$(obj).data('last_del', null);
						}
						if ($.inArray(event.keyCode, [16,91,37,39]) == -1) { // command and shift keys and arrows
							w2field.list_render.call(obj, inp.value); 
						}
					}, 10);
				})
		},
		
		// ******************************************************
		// -- Calendar
		
		calendar_get: function (date, options) {
			var td = new Date();
			var today = (Number(td.getMonth())+1) + '/' + td.getDate() + '/' + (String(td.getYear()).length > 3 ? td.getYear() : td.getYear() + 1900);
			if (date == '' || String(date) == 'undefined') date = today; 
			if (!w2utils.isDate(date)) date = today;
			
			var tmp  = date.split('/')
			var html =  '<table cellpadding="0" cellspacing="0" style=""><tr>' +
						'<td>'+ $().w2field('calendar_month', tmp[0], tmp[2], options) +'</td>'+
						'<!--td valign="top" style="background-color: #f4f4fe; padding: 8px; padding-bottom: 0px; padding-top: 22px; border: 1px solid silver; border-left: 0px;">'+
						'	Jan <br> Feb <br> Mar <br> Apr <br> May <br> Jun <br> Jul <br> Aug <br> Sep <br> Oct <br> Nov <br> Dec'+
						'</td>'+
						'<td valign="top" style="background-color: #f4f4fe; padding: 6px; padding-bottom: 0px; padding-top: 22px; border: 1px solid silver; border-left: 0px;">'+
						'	2001 <br> 2002 <br> 2003 <br> 2004'+
						'</td-->'+
						'</tr></table>';
			return html;
		},
		
		calendar_next: function(date) {
			var tmp = String(date).split('/');
			var month = tmp[0];
			var year  = tmp[1];
			if (parseInt(month) < 12) {
				month = parseInt(month) + 1;
			} else {
				month = 1;
				year  = parseInt(year) + 1;
			}
			var options = $($('#global_calendar_div.w2ui-calendar').data('el')).data('options');
			$('#global_calendar_div.w2ui-calendar').html( $().w2field('calendar_get', month+'/1/'+year, options) );
		},
		
		calendar_previous: function(date) {
			var tmp = String(date).split('/');
			var month = tmp[0];
			var year  = tmp[1];
			if (parseInt(month) > 1) {
				month = parseInt(month) - 1;
			} else {
				month = 12;
				year  = parseInt(year) - 1;
			}
			var options = $($('#global_calendar_div.w2ui-calendar').data('el')).data('options');
			$('#global_calendar_div.w2ui-calendar').html( $().w2field('calendar_get', month+'/1/'+year, options) );
		},
		
		calendar_month: function(month, year, options) {
			// options = { blocked: {'4/11/2011': 'yes'}, colored: {'4/11/2011': 'red:white'} }
			var td = new Date();
			var months 		= ['January', 'February', 'March', 'April', 'May', 'June', 'July',	'August', 'September', 'October', 'November', 'December'];
			var days  		= ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
			var daysCount   = ['31', '28', '31', '30', '31', '30', '31', '31', '30', '31', '30', '31'];
			var today		= (Number(td.getMonth())+1) + '/' + td.getDate() + '/' + (String(td.getYear()).length > 3 ? td.getYear() : td.getYear() + 1900);
			
			year  = Number(year);
			month = Number(month);
			if (year  === null || year  === '') year  = String(td.getYear()).length > 3 ? td.getYear() : td.getYear() + 1900;
			if (month === null || month === '') month = Number(td.getMonth())+1;
			if (month > 12) { month = month - 12; year++; }
			if (month < 1 || month == 0)  { month = month + 12; year--; }
			if (year/4 == Math.floor(year/4)) { daysCount[1] = '29'; } else { daysCount[1] = '28'; }
			if (year  == null) { year  = td.getYear(); }
			if (month == null) { month = td.getMonth()-1; }
			
			// start with the required date
			var td = new Date();
			td.setDate(1);
			td.setMonth(month-1);
			td.setYear(year);
			var weekDay = td.getDay();
			
			var html  = 
				'<div class="w2ui-calendar-title">'+
				'	<div style="float: left" class="w2ui-calendar-previous" onclick="$().w2field(\'calendar_previous\', \''+ month +'/'+ year +'\')"> <- </div>'+
				'	<div style="float: right" class="w2ui-calendar-next" onclick="$().w2field(\'calendar_next\', \''+ month +'/'+ year +'\')"> -> </div> '+ 
						months[month-1] +', '+ year + 
				'</div>'+
				'<table class="w2ui-calendar-days" onclick="" cellspacing="0">'+
				'	<tr class="w2ui-day-title"><td>M</td> <td>T</td> <td>W</td> <td>T</td> <td>F</td> <td>S</td> <td>S</td></tr>'+
				'	<tr>';
					
			var day = 1;
			for (var ci=1; ci<43; ci++) {
				if (weekDay == 0 && ci == 1) {
					for (var ti=0; ti<6; ti++) html += '<td class="w2ui-day-empty">&nbsp;</td>';
					ci += 6;
				} else {
					if (ci < weekDay || day > daysCount[month-1]) {
						html += '<td class="w2ui-day-empty">&nbsp;</td>';
						if ((ci)%7 == 0) html += '</tr><tr>';
						continue;
					}
				}
				var dt  = month + '/' + day + '/' + year;
				
				var className = ''; 
				if (dt == today) className = 'w2ui-today';
				if (ci % 7 == 6) className = 'w2ui-saturday';
				if (ci % 7 == 0) className = 'w2ui-sunday';
				
				var dspDay 	= day;			
				var col 	= '';
				var bgcol 	= '';
				var blocked = '';
				if (options.colored) if (options.colored[dt] != undefined) { // if there is predefined colors for dates
					tmp   = options.colored[dt].split(':');
					bgcol = 'background-color: ' + tmp[0] + ';';
					col   = 'color: ' + tmp[1] + ';';
				}
				var noSelect = false;
				// enable range 
				if (options.start || options.end) {
					var start 	= new Date(options.start);
					var end   	= new Date(options.end);
					var current = new Date(dt);
					if (current < start || current > end) {
						blocked  = ' w2ui-blocked-date';
						noSelect = true;
					} 
				}
				// block predefined dates
				if (options.blocked && $.inArray(dt, options.blocked) != -1) {
					blocked  = ' w2ui-blocked-date';
					noSelect = true;
				} 
				html += '<td class="'+ className + blocked +'" style="'+ col + bgcol + '" id="'+ this.name +'_date_'+ dt +'" date="'+ dt +'"';
				if (noSelect === false) {
					html += 'onclick="var el = $(\'#global_calendar_div.w2ui-calendar\').data(\'el\'); '+
							'	$(el).val(\''+ dt +'\').trigger(\'change\').trigger(\'blur\'); '+
							'	 event.stopPropagation(); return false;'+
							'"';
				}
				html +=	'>'+ dspDay + '</td>';
				if (ci % 7 == 0 || (weekDay == 0 && ci == 1)) html += '</tr><tr>';
				day++;
			}
			html += '</tr></table>';
			return html;
		}
	}

}) (jQuery);
