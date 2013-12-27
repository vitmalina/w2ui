/************************************************************************
*   Library: Web 2.0 UI for jQuery (using prototypical inheritance)
*   - Following objects defined
*		- w2field		- various field controls
*		- $().w2field	- jQuery wrapper
*   - Dependencies: jQuery, w2utils
*
* == NICE TO HAVE ==
*	- select - for select, list - for drop down (needs this in grid)
*	- enum add events: onLoad, onRequest, onCompare, onSelect, onDelete, onClick for already selected elements
*	- upload (regular files)
*	- enum - refresh happens on each key press even if not needed (for speed)
*	- BUG with prefix/postfix and arrows (test in different contexts)
*	- multiple date selection
*	- rewrire everythin in objects (w2ftext, w2fenum, w2fdate)
*	- render calendar to the div
*
************************************************************************/

(function ($) {

	var w2field = function (options) {
		// public properties
		this.type		= options.type || 'text';
		this.el			= null
		this.options	= $.extend(true, {}, options);
		this.helpers	= {}; // object or helper elements
		this.onSearch	= options.onSearch || null,
		// this.custom	= {};	// custom elements - should be in prototype
		this.type 		= String(this.type).toLowerCase();
		delete this.options.type;
		delete this.options.onSearch;
		$.extend(true, this, w2obj.field);
	};

	// ====================================================
	// -- Registers as a jQuery plugin
	
	$.fn.w2field = function (method, options) {
		if (typeof method == 'string' && typeof options == 'object') {
			method = $.extend(true, {}, options, { type: method });
		}
		if (typeof method == 'string' && typeof options == 'undefined') {
			method = { type: method };
		}
		return this.each(function (index, el) {
			var obj = $(el).data('w2field');
			// if object is not defined, define it
			if (typeof obj == 'undefined') {
				var obj = new w2field(method);
				$.extend(obj, { handlers: [] });
				if (el) obj.el = $(el)[0];
				obj.init();
				$(el).data('w2field', obj);
				return obj;
			} else { // fully re-init
				obj.clear();
				var obj = new w2field(method);
				$.extend(obj, { handlers: [] });
				if (el) obj.el = $(el)[0];
				obj.init();
				$(el).data('w2field', obj);
				return obj;
			}
			return null;
		});
	}	

	// ====================================================
	// -- Implementation of core functionality

	w2field.prototype = {
		
		init: function () {
			var obj 	= this;
			var options = this.options;
			var defaults;

			switch (this.type) {

				case 'text':
				case 'int':
				case 'float':
				case 'money':
				case 'currency':
				case 'percent':
				case 'alphanumeric':
				case 'hex':
					defaults = {
						min				: null,
						max				: null,
						autoFormat	 	: true,
						currencyPrefix	: '$', 	// $€£¥
						currencySuffix	: '', 	// $€£¥
						groupSymbol		: ',',
						arrows			: false,
						keyboard		: true,
						precision		: null,
						prefix			: '',
						suffix			: ''
					};
					this.options = $.extend(true, {}, defaults, options);
					options = this.options; // since object is re-created, need to re-assign
					options.numberRE  = new RegExp('['+ options.groupSymbol + ']', 'g');
					options.moneyRE   = new RegExp('['+ options.currencyPrefix + options.currencySuffix + options.groupSymbol + ']', 'g');
					options.percentRE = new RegExp('['+ options.groupSymbol + '%]', 'g');
					// no keyboard support needed
					if (['text', 'alphanumeric', 'hex'].indexOf(this.type) != -1) {
						options.arrows   = false;
						options.keyboard = false;
					}
					this.addPrefix(); // only will add if needed
					this.addSuffix();
					break;

				case 'color':
					defaults = {
						prefix	: '#',
						suffix	: '<div style="width: '+ (parseInt($(this.el).css('font-size')) + 3 || 12) +'px">&nbsp;</div>',
						arrows	: false,
						keyboard: false
					};
					$.extend(options, defaults);
					this.addPrefix(); 	// only will add if needed
					this.addSuffix();	// only will add if needed
					// additional checks
					$(this.el)
						.attr('maxlength', 6)
						.on('keydown', function (event) { // need this for cut/paster
							if (event.keyCode == 86 && (event.ctrlKey || event.metaKey)) {
								var obj = this;
								$(this).prop('maxlength', 7);
								setTimeout(function () {
									var val = $(obj).val();
									if (val.substr(0, 1) == '#') val = val.substr(1);
									if (!w2utils.isHex(val)) val = '';
									$(obj).val(val).prop('maxlength', 6).change();
								}, 20);
							}
						})
						.on('keyup', function (event) {
							if (event.keyCode == 86 && (event.ctrlKey || event.metaKey)) $(this).prop('maxlength', 6);
						});
					if ($(this.el).val() != '') setTimeout(function () { $(obj.el).change(); }, 1);
					break;

				case 'date':
					defaults = {
						format	: w2utils.settings.date_format, // date format
						start	: '',		// start of selectable range
						end		: '',		// end of selectable range
						keyboard: true,
						blocked	: {},		// {'4/11/2011': 'yes'}
						colored	: {}		// {'4/11/2011': 'red:white'}
					};
					this.options = $.extend(true, {}, defaults, options);
					options = this.options; // since object is re-created, need to re-assign
					$(this.el).attr('placeholder', options.format);
					break;

				case 'time':
					defaults = {
						format	: 'h24', //w2utils.settings.time_format,
						keyboard: true
					};
					this.options = $.extend(true, {}, defaults, options);
					options = this.options; // since object is re-created, need to re-assign
					$(this.el).attr('placeholder', options.format == 'h12' ? 'hh:mi pm' : 'h24:mi');
					break;

				case 'interval':
					break;

				case 'combo':
				case 'list':
				case 'select':
					defaults = {
						url 		: null, 		// server url to load from
						items		: [],
						selected	: null,
						maxWidth	: null,			// max width for input control to grow
						maxHeight	: 350,			// max height for input control to grow
						match		: 'contains',	// ['contains', 'is', 'begins with', 'ends with']
						onSearch	: null,			// triggers when search needs to be performed
						onRequest	: null,			// triggers when need to load from URL
						onLoad		: null,			// triggers when loaded from URL
						render		: null, 		// render function for drop down item
						markSearch 	: true,
						suffix		: '<div class="arrow-down" style="margin-top: '+ ((parseInt($(this.el).height()) - 8) / 2) +'px;"></div>',
						strict 		: true,			// same width as control
						altRows		: true			// alternate row color
					};
					options = $.extend({}, defaults, options);
					this.options = options;
					this.addSuffix();
					if (options.selected) $(this.el).data('selected', options.selected);
					break;

				case 'enum':
					break;

				case 'upload':
					break;
			}
			// attach events
			$(this.el)
				.addClass('w2field')
				.data('w2field', this)
				.on('change', 	function (event) { obj.change.call(obj, event) })
				.on('click', 	function (event) { event.stopPropagation() }) // ignore click because it messes overlays
				.on('focus', 	function (event) { obj.focus.call(obj, event) })
				.on('blur', 	function (event) { obj.blur.call(obj, event) })
				.on('keypress', function (event) { obj.keyPress.call(obj, event) })
				.on('keydown', 	function (event) { obj.keyDown.call(obj, event) })
				.css({
					'box-sizing'		: 'border-box',
					'-webkit-box-sizing': 'border-box',
					'-moz-box-sizing'	: 'border-box',
					'-ms-box-sizing'	: 'border-box',
					'-o-box-sizing'		: 'border-box'
				});
			// format initial value
			this.change($.Event('change'));
		},

		clear: function () {
			// restore paddings
			var tmp = $(this.el).data('tmp');
			if (tmp['old-padding-left'])  $(this.el).css('padding-left',  tmp['old-padding-left']);
			if (tmp['old-padding-right']) $(this.el).css('padding-right', tmp['old-padding-right']);
			// if money then clear value
			if (['money', 'currency'].indexOf(this.type) != -1) {
				$(this.el).val($(this.el).val().replace(options.moneyRE, ''));
			}
			if (this.type == 'percent') {
				$(this.el).val($(this.el).val().replace(/%/g, ''));
			}
			// remove events and data
			$(this.el)
				.removeCalss('w2field')
				.removeData() // removes all attached data
				.off('change')
				.off('click')
				.off('focus')
				.off('blur')
				.off('keypress')
				.off('keydown')
				.off('keyup');
			// remove helpers
			for (var h in this.helpers) $(this.helpers[h]).remove();
			this.helpers = {};
		},

		refresh: function () {
			this.clear();
			this.init();
		},

		change: function (event) {
			var obj 	= this;
			var options = obj.options;
			// numeric 
			if (['int', 'float', 'money', 'currency', 'percent'].indexOf(this.type) != -1) {
				// check max/min
				var val 	= $(this.el).val().trim();
				var cancel 	= false;
				if (options.autoFormat && ['money', 'currency'].indexOf(this.type) != -1) val = String(val).replace(options.moneyRE, '');
				if (options.autoFormat && this.type == 'percent') val = String(val).replace(options.percentRE, '');
				if (options.autoFormat && ['int', 'float'].indexOf(this.type) != -1) val = String(val).replace(options.numberRE, '');
				if (parseInt(val) == val) {
					if (options.min !== null && val < options.min) { val = options.min; $(this.el).val(options.min).change(); cancel = true; }
					if (options.max !== null && val > options.max) { val = options.max; $(this.el).val(options.max).change(); cancel = true; }
				}
				if (val !== '' && !this.checkType(val)) { val = ''; $(this.el).val(''); } // check validity
				// autoformat numbers or money
				if (options.autoFormat) {
					switch (this.type) {
						case 'currency':
						case 'money':
							val = w2utils.formatNumber(Number(val).toFixed(2), options.groupSymbol);
							if (val != '') val = options.currencyPrefix + val + options.currencySuffix;
							break;
						case 'percent':
							val = w2utils.formatNumber(options.precision ? Number(val).toFixed(options.precision) : val, options.groupSymbol);
							if (val != '') val += '%';
							break;
						case 'float':
							val = w2utils.formatNumber(options.precision ? Number(val).toFixed(options.precision) : val, options.groupSymbol);
							break;
						case 'int':
							val = w2utils.formatNumber(val, options.groupSymbol);
							break;
					}
					$(this.el).val(val);
				}
				// if needs cancel
				if (cancel) {
					event.stopPropagation();
					event.preventDefault();
					return false;
				}
			}
			// color
			if (this.type == 'color') {
				var color = '#' + $(this.el).val();
				if ($(this.el).val().length != 6 && $(this.el).val().length != 3) color = '';
				$(this.el).next().find('div').css('background-color', color);				
			}
		},

		focus: function (event) {
			var obj 	= this;
			var options = this.options;
			// color
			if (this.type == 'color') {
				$("#w2ui-overlay").remove();
				$(obj.el).w2overlay(obj.getColorHTML());
				// bind events
				$('#w2ui-overlay .color')
					.on('mousedown', function (event) {
						var color = $(event.originalEvent.target).attr('name');
						$(obj.el).val(color).change().blur();
						$('#w2ui-overlay').remove();		
					});
			}
			// date
			if (this.type == 'date') {
				$("#w2ui-overlay").remove();
				$(obj.el).w2overlay('<div class="w2ui-reset w2ui-calendar"></div>', { css: { "background-color": "#f5f5f5" } });
				this.updateOverlay();
			}
			// time
			if (this.type == 'time') {
				$("#w2ui-overlay").remove();
				$(obj.el).w2overlay('<div class="w2ui-reset w2ui-time"></div>', { css: { "background-color": "#fff" } });
				this.updateOverlay();
			}
			// menu
			if (['select', 'list', 'combo'].indexOf(this.type) != -1) {
				$("#w2ui-overlay").remove();				
				$(obj.el).w2menu($.extend(true, {}, this.options, {
					onSelect: function (event) {						
						$(obj.el).data('selected', event.item).val(event.item.text).change().blur();
					}
				}));
			}
		},

		blur: function (event) {
			var obj 	= this;
			var options = obj.options;
			// hide overlay
			if (['color', 'date', 'time', 'select', 'list', 'combo', 'enum', 'upload'].indexOf(this.type) != -1) {
				$('#w2ui-overlay').remove();
			}
			// make sure element exists
			if (['list', 'select'].indexOf(this.type) != -1) {
				var val = $(this.el).val();
				if (typeof val == 'undefined') return;
				// make sure element exists
				var flag = false;
				for (var i in options.items) {
					var it = options.items[i];
					if (typeof it == 'object' && it.text == val) flag = true;
					if (typeof it == 'string' && it == val) flag = true;
				}
				if (!flag) {
					$(this.el).val('').removeData('selected').change();
					for (var i in options.items) delete options.items.hidden;
				}
			}
		},

		keyPress: function (event) {
			var obj 	= this;
			var options = obj.options;
			// ignore wrong pressed key
			if (['int', 'float', 'money', 'currency', 'percent', 'hex', 'color', 'alphanumeric'].indexOf(this.type) != -1) {
				// keyCode & charCode differ in FireFox
				if (event.metaKey || event.ctrlKey || event.altKey || (event.charCode != event.keyCode && event.keyCode > 0)) return;
				var ch = String.fromCharCode(event.charCode);
				if (!this.checkType(ch, true) && event.keyCode != 13) {
					event.preventDefault();
					if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;
					return false;
				}
			}
			// update date popup
			if (['date', 'time'].indexOf(this.type)) {
				setTimeout(function () { obj.updateOverlay(); }, 1);
			}
			// list/select
			if (['list', 'select'].indexOf(this.type) != -1) {
				if (event.keyCode == 13) {
					var val = $(this.el).val();
					if (typeof val == 'undefined') return;
					// make sure element exists
					var item = null;
					for (var i in options.items) {
						if (options.items[i].text == val) { item = options.items[i]; break; }
					}
					var current = $(this.el).data('selected');
					if (!item) {
						$(this.el).val('').removeData('selected');
					} else if (!current || current.id != item.id) {
						$(this.el).data('selected', item);
					}
				}
			}
		},

		keyDown: function (event, extra) {
			var obj 	= this;
			var options = obj.options;
			var key 	= event.keyCode || extra.keyCode;
			// numeric 
			if (['int', 'float', 'money', 'currency', 'percent'].indexOf(this.type) != -1) {
				if (!options.keyboard) return;
				var cancel = false;
				var val = parseFloat($(obj.el).val().replace(options.moneyRE, '')) || 0;
				var inc = 1;
				if (event.ctrlKey || event.metaKey) inc = 10;
				switch (key) {
					case 38: // up
						$(obj.el).val((val + inc <= options.max || options.max === null ? val + inc : options.max)).change();
						cancel = true;
						break;
					case 40: // down
						$(obj.el).val((val - inc >= options.min || options.min === null ? val - inc : options.min)).change();
						cancel = true;
						break;
				}
				if (cancel) {
					event.preventDefault();
					setTimeout(function () { 
						// set cursor to the end
						obj.el.setSelectionRange(obj.el.value.length, obj.el.value.length); 
					}, 0);
				}
			}
			// date
			if (this.type == 'date') {
				if (!options.keyboard) return;
				var cancel  = false;
				var daymil  = 24*60*60*1000;
				var inc		= 1;
				if (event.ctrlKey || event.metaKey) inc = 10; 
				var dt = w2utils.isDate($(this.el).val(), options.format, true);
				if (!dt) { dt = new Date(); daymil = 0; }
				switch (key) {
					case 38: // up
						var newDT = w2utils.formatDate(dt.getTime() + daymil, options.format);
						if (inc == 10) newDT = w2utils.formatDate(new Date(dt.getFullYear(), dt.getMonth()+1, dt.getDate()), options.format);
						$(obj.el).val(newDT).change();
						cancel = true;
						break;
					case 40: // down
						var newDT = w2utils.formatDate(dt.getTime() - daymil, options.format);
						if (inc == 10) newDT = w2utils.formatDate(new Date(dt.getFullYear(), dt.getMonth()-1, dt.getDate()), options.format);
						$(obj.el).val(newDT).change();
						cancel = true;
						break;
				}
				if (cancel) {
					event.preventDefault();
					setTimeout(function () { 
						// set cursor to the end
						obj.el.setSelectionRange(obj.el.value.length, obj.el.value.length); 
						obj.updateOverlay();
					}, 0);
				}
			}
			// time
			if (this.type == 'time') {
				if (!options.keyboard) return;
				var cancel  = false;
				var inc		= 1;
				if (event.ctrlKey || event.metaKey) inc = 60; 
				var val = $(this.el).val();
				var time = this.toMin(val);
				switch (key) {
					case 38: // up
						time += inc;
						cancel = true;
						break;
					case 40: // down
						time -= inc;
						cancel = true;
						break;
				}
				if (cancel) {
					$(obj.el).val(this.fromMin(time)).change();
					event.preventDefault();
					setTimeout(function () { 
						// set cursor to the end
						obj.el.setSelectionRange(obj.el.value.length, obj.el.value.length); 
					}, 0);
				}
			}
			// list/select/combo
			if (['list', 'select', 'combo'].indexOf(this.type) != -1) {
				var cancel  = false;
				// apply arrows
				switch (key) {
					case 13: // enter
						var item = options.items[options.index];
						if (item) $(this.el).data('selected', item).val(item.text).change();
						if ($(this.el).val() == '' && $(this.el).data('selected')) $(this.el).removeData('selected').val('').change();
						break;
					case 38: // up
						options.index = w2utils.isInt(options.index) ? parseInt(options.index) : 0;
						options.index--;
						while (options.index > 0 && options.items[options.index].hidden) options.index--;
						if (options.index == 0 && options.items[options.index].hidden) {
							while (options.items[options.index] && options.items[options.index].hidden) options.index++;
						}
						cancel = true;
						break;
					case 40: // down
						options.index = w2utils.isInt(options.index) ? parseInt(options.index) : -1;
						options.index++;
						while (options.index < options.items.length-1 && options.items[options.index].hidden) options.index++;
						if (options.index == options.items.length-1 && options.items[options.index].hidden) {
							while (options.items[options.index] && options.items[options.index].hidden) options.index--;
						}
						cancel = true;
						break;
				}
				if (cancel) {
					if (options.index < 0) options.index = 0;
					if (options.index >= options.items.length) options.index = options.items.length -1;
					// display new selected item
					var el  = $('#w2ui-overlay > div');
					var cur = el.find('tr[index='+ options.index +']');
					el.find('tr.w2ui-selected').removeClass('w2ui-selected');
					cur.addClass('w2ui-selected');					
					if (cur.length > 0 ) {
						var top  	= cur[0].offsetTop - 5; // 5 is margin top
						var scrTop 	= el.scrollTop();
						var height 	= el.height();
						if (top < scrTop || top + cur.height() > scrTop + height) {
							$('#w2ui-overlay > div').animate({ 'scrollTop': top - (height - cur.height() * 2) / 2 }, 250, 'linear');
						}
					}
					// cancel event
					event.preventDefault();
					setTimeout(function () { 
						// set cursor to the end
						obj.el.setSelectionRange(obj.el.value.length, obj.el.value.length); 
					}, 0);
					return;
				}
				// run search
				setTimeout(function () {
					var search = $(obj.el).val();
					// trigger event
					var eventData = obj.trigger({ phase: 'before', type: 'search', target: obj.el, search: search });
					if (eventData.isCancelled === true) return;
					// default behaviour
					for (var i in options.items) {
						var item = options.items[i];
						var prefix = '';
						var suffix = '';
						if (['is', 'begins with'].indexOf(options.match) != -1) prefix = '^';
						if (['is', 'ends with'].indexOf(options.match) != -1) suffix = '$';
						try { 
							var re = new RegExp(prefix + search + suffix, 'i');
							if (re.test(item.text)) item.hidden = false; else item.hidden = true; 
						} catch (e) {
						}
					}
					options.index = null;
					obj.updateOverlay();
					setTimeout(function () { if (options.markSearch) $('#w2ui-overlay').w2marker(search); }, 1);
					// event after
					obj.trigger($.extend(eventData, { phase: 'after' }));
				}, 1);
			}
		},

		updateOverlay: function () {
			var obj 	= this;
			var options = this.options;
			// date
			if (this.type == 'date') {
				var month, year;
				var dt = w2utils.isDate($(this.el).val(), this.options.format, true);
				if (dt) { month = dt.getMonth() + 1; year = dt.getFullYear(); }
				(function refreshCalendar(month, year) {
					$('#w2ui-overlay > div > div').html(obj.getMonthHTML(month, year));
					$('#w2ui-overlay .date').on('mousedown', function () {
						var day = $(this).attr('date');
						$(obj.el).val(day).change().blur();
						$('#w2ui-overlay').remove();
					});
					$('#w2ui-overlay .previous').on('mousedown', function () {
						var tmp = obj.options.current.split('/');
						tmp[0]  = parseInt(tmp[0]) - 1;
						refreshCalendar(tmp[0], tmp[1]);
					});
					$('#w2ui-overlay .next').on('mousedown', function () {
						var tmp = obj.options.current.split('/');
						tmp[0]  = parseInt(tmp[0]) + 1;
						refreshCalendar(tmp[0], tmp[1]);
					});
				})(month, year);
			}
			// date
			if (this.type == 'time') {
				var h24 = (this.options.format == 'h24' ? true : false);
				$('#w2ui-overlay > div').html(obj.getHourHTML());
				$('#w2ui-overlay .time').on('mousedown', function () {
					var hour = $(this).attr('hour');
					$(obj.el).val((hour > 12 && !h24 ? hour - 12 : hour) + ':00' + (!h24 ? (hour < 12 ? ' am' : ' pm') : '')).change();
					$('#w2ui-overlay > div').html(obj.getMinHTML(hour));
					$('#w2ui-overlay .time').on('mousedown', function () {
						var min = $(this).attr('min');
						$(obj.el).val((hour > 12 && !h24 ? hour - 12 : hour) + ':' + (min < 10 ? 0 : '') + min + (!h24 ? (hour < 12 ? ' am' : ' pm') : '')).change().blur();
						$('#w2ui-overlay').remove();
					});
				});
			}
			// list
			if (['list', 'select', 'combo'].indexOf(this.type) != -1) {
				$().w2menu('refresh', options);
			}
		},

		/*
		*  INTERNAL FUNCTIONS
		*/

		checkType: function (ch, loose) {
			var obj = this;
			switch (obj.type) {
				case 'int':
					if (loose && ['-'].indexOf(ch) != -1) return true;
					return w2utils.isInt(ch);
				case 'percent':
				case 'float':
					if (loose && ['-','.'].indexOf(ch) != -1) return true;
					return w2utils.isFloat(ch);
				case 'currency':
				case 'money':
					if (loose && ['-', '.', obj.options.groupSymbol, obj.options.currencyPrefix, obj.options.currencySuffix].indexOf(ch) != -1) return true;
					return w2utils.isFloat(ch.replace(obj.options.moneyRE, ''));
				case 'hex':
				case 'color':
					return w2utils.isHex(ch);
				case 'alphanumeric': 
					return w2utils.isAlphaNumeric(ch);
			}
			return true;
		},

		addPrefix: function () {
			var obj = this;
			setTimeout(function () {
				var helper;
				var tmp = $(obj.el).data('tmp') || {};
				tmp['old-padding-left'] = $(obj.el).css('padding-left');
				$(obj.el).data('tmp', tmp);
				if (obj.options.prefix !== '') {
					$(obj.el).before(
						'<div class="w2ui-field-helper">'+ 
							obj.options.prefix +
						'</div>'
					);
					helper = $(obj.el).prev();
					helper.css({
							'color'				: $(obj.el).css('color'),
							'font-family'		: $(obj.el).css('font-family'),
							'font-size'			: $(obj.el).css('font-size'),
							'padding-top'		: $(obj.el).css('padding-top'),
							'padding-bottom'	: $(obj.el).css('padding-bottom'),
							'padding-left'		: $(obj.el).css('padding-left'),
							'padding-right'		: 0,
							'margin-top'		: (parseInt($(obj.el).css('margin-top'), 10) + 1) + 'px',
							'margin-bottom'		: (parseInt($(obj.el).css('margin-bottom'), 10) + 1) + 'px',
							'margin-left'		: $(obj.el).css('margin-left'),
							'margin-right'		: 0
						})
						.on('click', function () {
							$(obj).next().focus(); 
						});
					$(obj.el).css('padding-left', (helper.width() + parseInt($(obj.el).css('padding-left'), 10)) + 'px');
					// remember helper
					obj.helpers['prefix'] = helper;
				}
			}, 1);
		},

		addSuffix: function () {
			var obj = this;
			var helper, pr;
			setTimeout(function () {
				var tmp = $(obj.el).data('tmp') || {};
				tmp['old-padding-right'] = $(obj.el).css('padding-right');
				$(obj.el).data('tmp', tmp);
				pr = parseInt($(obj.el).css('padding-right'), 10);
				if (obj.options.arrows) {
					$(obj.el).after(
						'<div class="w2ui-field-helper" style="border: 1px solid transparent">&nbsp;'+ 
						'	<div class="w2ui-field-up" type="up">'+
						'		<div class="arrow-up" type="up"></div>'+
						'	</div>'+
						'	<div class="w2ui-field-down" type="down">'+
						'		<div class="arrow-down" type="down"></div>'+
						'	</div>'+
						'</div>');
					var height = w2utils.getSize(obj.el, 'height');
					helper = $(obj.el).next();
					helper.css({
							'color'			: $(obj.el).css('color'),
							'font-family'	: $(obj.el).css('font-family'),
							'font-size'		: $(obj.el).css('font-size'),
							'height'		: ($(obj.el).height() + parseInt($(obj.el).css('padding-top'), 10) + parseInt($(obj.el).css('padding-bottom'), 10) ) + 'px',
							'padding'		: 0,
							'margin-top'	: (parseInt($(obj.el).css('margin-top'), 10) + 1) + 'px',
							'margin-bottom'	: 0,
							'border-left'	: '1px solid silver'
						})
						.css('margin-left', '-'+ (helper.width() + parseInt($(obj.el).css('margin-right'), 10) + 12) + 'px')
						.on('mousedown', function (event) {
							$('body').on('mouseup', tmp);
							$('body').data('_field_update_timer', setTimeout(update, 700));
							update(false);
							// timer function
							function tmp() {
								clearTimeout($('body').data('_field_update_timer'));
								$('body').off('mouseup', tmp);
							}
							// update function
							function update(notimer) {
								$(obj.el).focus();
								obj.keyDown($.Event("keydown"), { 
									keyCode : ($(event.target).attr('type') == 'up' ? 38 : 40) 
								});
								if (notimer !== false) $('body').data('_field_update_timer', setTimeout(update, 60));
							}
						});
					pr += helper.width() + 12;
					$(obj.el).css('padding-right', pr + 'px');
					// remember helper
					obj.helpers['arrows'] = helper;
				}
				if (obj.options.suffix !== '') {
					$(obj.el).after(
						'<div class="w2ui-field-helper">'+ 
							obj.options.suffix + 
						'</div>');
					helper = $(obj.el).next();
					helper
						.css({
							'color'				: $(obj.el).css('color'),
							'font-family'		: $(obj.el).css('font-family'),
							'font-size'			: $(obj.el).css('font-size'),
							'padding-top'		: $(obj.el).css('padding-top'),
							'padding-bottom'	: $(obj.el).css('padding-bottom'),
							'padding-left'		: '3px',
							'padding-right'		: $(obj.el).css('padding-right'),
							'margin-top'		: (parseInt($(obj.el).css('margin-top'), 10) + 1) + 'px',
							'margin-bottom'		: (parseInt($(obj.el).css('margin-bottom'), 10) + 1) + 'px'
						})
						.on('click', function () { 
							$(obj).prev().focus(); 
						});
					helper.css('margin-left', '-'+ (w2utils.getSize(helper, 'width') + parseInt($(obj.el).css('margin-right'), 10) + 2) + 'px');
					pr += helper.width() + 3;
					$(obj.el).css('padding-right', pr + 'px');
					// remember helper
					obj.helpers['suffix'] = helper;
				}
			}, 1);	
		},

		getColorHTML: function () {
			var html =  '<div class="w2ui-color">'+ 
						'<table cellspacing="5">';
			var colors	= [
				['000000', '444444', '666666', '999999', 'CCCCCC', 'EEEEEE', 'F3F3F3', 'FFFFFF'],
				['FF011B', 'FF9838', 'FFFD59', '01FD55', '00FFFE', '0424F3', '9B24F4', 'FF21F5'],
				['F4CCCC', 'FCE5CD', 'FFF2CC', 'D9EAD3', 'D0E0E3', 'CFE2F3', 'D9D1E9', 'EAD1DC'],
				['EA9899', 'F9CB9C', 'FEE599', 'B6D7A8', 'A2C4C9', '9FC5E8', 'B4A7D6', 'D5A6BD'],
				['E06666', 'F6B26B', 'FED966', '93C47D', '76A5AF', '6FA8DC', '8E7CC3', 'C27BA0'],
				['CC0814', 'E69138', 'F1C232', '6AA84F', '45818E', '3D85C6', '674EA7', 'A54D79'],
				['99050C', 'B45F17', 'BF901F', '37761D', '124F5C', '0A5394', '351C75', '741B47'],
				['660205', '783F0B', '7F6011', '274E12', '0C343D', '063762', '20124D', '4C1030']
			];
			for (var i=0; i<8; i++) {
				html += '<tr>';
				for (var j=0; j<8; j++) {
					html += '<td>'+
							'	<div class="color" style="background-color: #'+ colors[i][j] +';" name="'+ colors[i][j] +'">'+
							'		'+ ($(this.el).val() == colors[i][j] ? '&#149;' : '&nbsp;')+
							'	</div>'+
							'</td>';
				}
				html += '</tr>';
				if (i < 2) html += '<tr><td style="height: 8px" colspan="8"></td></tr>';
			}
			html += '</table></div>';
			return html;
		},

		getMonthHTML: function (month, year) {
			var td 			= new Date();
			var months		= w2utils.settings.fullmonths;
			var days		= w2utils.settings.fulldays;
			var daysCount	= ['31', '28', '31', '30', '31', '30', '31', '31', '30', '31', '30', '31'];
			var today		= td.getFullYear() + '/' + (Number(td.getMonth()) + 1) + '/' + td.getDate();
			// normalize date
			year  = w2utils.isInt(year)  ? parseInt(year)  : td.getFullYear();
			month = w2utils.isInt(month) ? parseInt(month) : td.getMonth() + 1;
			if (month > 12) { month -= 12; year++; }
			if (month < 1 || month === 0)  { month += 12; year--; }
			if (year/4 == Math.floor(year/4)) { daysCount[1] = '29'; } else { daysCount[1] = '28'; }
			this.options.current = month + '/' + year;
			
			// start with the required date
			td = new Date(year, month-1, 1);
			var weekDay = td.getDay();
			var tabDays = w2utils.settings.shortdays;
			var dayTitle = '';
			for ( var i = 0, len = tabDays.length; i < len; i++) {
				dayTitle += '<td>' + tabDays[i] + '</td>';
			}
			var html  = 
				'<div class="w2ui-calendar-title title">'+
				'	<div class="w2ui-calendar-previous previous"> <div></div> </div>'+
				'	<div class="w2ui-calendar-next next"> <div></div> </div> '+ 
						months[month-1] +', '+ year + 
				'</div>'+
				'<table class="w2ui-calendar-days" cellspacing="0">'+
				'	<tr class="w2ui-day-title">' + dayTitle + '</tr>'+
				'	<tr>';
					
			var day = 1;
			for (var ci=1; ci<43; ci++) {
				if (weekDay === 0 && ci == 1) {
					for (var ti=0; ti<6; ti++) html += '<td class="w2ui-day-empty">&nbsp;</td>';
					ci += 6;
				} else {
					if (ci < weekDay || day > daysCount[month-1]) {
						html += '<td class="w2ui-day-empty">&nbsp;</td>';
						if ((ci) % 7 === 0) html += '</tr><tr>';
						continue;
					}
				}
				var dt  = year + '/' + month + '/' + day;
				
				var className = ''; 
				if (ci % 7 == 6)  className = 'w2ui-saturday';
				if (ci % 7 === 0) className = 'w2ui-sunday';
				if (dt == today)  className += ' w2ui-today';
				
				var dspDay	= day;
				var col		= '';
				var bgcol	= '';
				var blocked	= '';
				var tmp_dt 	= w2utils.formatDate(dt, this.options.format);
				if (this.options.colored && this.options.colored[tmp_dt] !== undefined) { // if there is predefined colors for dates
					tmp		= this.options.colored[tmp_dt].split(':');
					bgcol	= 'background-color: ' + tmp[0] + ';';
					col		= 'color: ' + tmp[1] + ';';
				}
				var noSelect = false;
				// enable range 
				if (this.options.start || this.options.end) {
					var start	= new Date(w2utils.isDate(this.options.start, this.options.format, true));
					var end		= new Date(w2utils.isDate(this.options.end, this.options.format, true));
					var current	= new Date(dt);
					if (current < start || current > end) {
						blocked	= ' w2ui-blocked-date';
						noSelect	= true;
					}
				}
				// block predefined dates
				if (this.options.blocked && $.inArray(tmp_dt, this.options.blocked) != -1) {
					blocked  = ' w2ui-blocked-date';
					noSelect = true;
				} 
				html += '<td class="'+ (noSelect === false ? 'date ' : '') + className + blocked + '" style="'+ col + bgcol + '" date="'+ tmp_dt +'">'+
							dspDay + 
						'</td>';
				if (ci % 7 === 0 || (weekDay === 0 && ci == 1)) html += '</tr><tr>';
				day++;
			}
			html += '</tr></table>';
			return html;
		},

		getHourHTML: function () {
			var tmp = [];
			var h24 = (this.options.format == 'h24' ? true : false);
			for (var a=0; a<24; a++) {				
				var time = (a >= 12 && !h24 ? a - 12 : a) + ':00' + (!h24 ? (a < 12 ? ' am' : ' pm') : '');
				if (a == 12 && !h24) time = '12:00 pm';
				if (!tmp[Math.floor(a/8)]) tmp[Math.floor(a/8)] = '';
				tmp[Math.floor(a/8)] += '<div class="time" hour="'+ a +'">'+ time +'</div>';
			}
			var html = 
				'<div class="w2ui-time"><table><tr>'+
				'	<td>'+ tmp[0] +'</td>' +
				'	<td>'+ tmp[1] +'</td>' +
				'	<td>'+ tmp[2] +'</td>' +
				'</tr></table></div>';
			return html;
		},

		getMinHTML: function (hour) {
			if (typeof hour == 'undefined') hour = 0;
			var h24 = (this.options.format == 'h24' ? true : false);
			var tmp = [];
			for (var a=0; a<60; a+=5) {				
				var time = (hour > 12 && !h24 ? hour - 12 : hour) + ':' + (a < 10 ? 0 : '') + a + ' ' + (!h24 ? (a < 12 ? ' am' : ' pm') : '');
				var ind = a < 20 ? 0 : (a < 40 ? 1 : 2);
				if (!tmp[ind]) tmp[ind] = '';
				tmp[ind] += '<div class="time" min="'+ a +'">'+ time +'</div>';
			}
			var html = 
				'<div class="w2ui-time"><table><tr>'+
				'	<td>'+ tmp[0] +'</td>' +
				'	<td>'+ tmp[1] +'</td>' +
				'	<td>'+ tmp[2] +'</td>' +
				'</tr></table></div>';
			return html;
		},

		toMin: function (str) {
			var tmp = str.split(':');
			if (tmp.length == 2) {
				tmp[0] = parseInt(tmp[0]);
				tmp[1] = parseInt(tmp[1]);
				if (str.indexOf('pm') != -1 && tmp[0] != 12) tmp[0] += 12;
			} else {
				tmp = [(new Date()).getHours(), (new Date()).getMinutes() - 1];
			}
			return tmp[0] * 60 + tmp[1];
		},

		fromMin: function (time) {
			var ret = '';
			if (time >= 24 * 60) time = time % (24 * 60);
			if (time < 0) time = 24 * 60 + time;
			var hour = Math.floor(time/60);
			var min  = ((time % 60) < 10 ? '0' : '') + (time % 60);
			if (this.options.format.indexOf('h24') != -1) {
				ret = hour + ':' + min;
			} else {
				ret = (hour <= 12 ? hour : hour - 12) + ':' + min + ' ' + (hour >= 12 ? 'pm' : 'am');
			}
			return ret;
		}
	}

	$.extend(w2field.prototype, w2utils.event);
	w2obj.field = w2field;

}) (jQuery);