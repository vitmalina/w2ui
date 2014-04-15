/************************************************************************
*   Library: Web 2.0 UI for jQuery (using prototypical inheritance)
*   - Following objects defined
*		- w2field		- various field controls
*		- $().w2field	- jQuery wrapper
*   - Dependencies: jQuery, w2utils
*
* == NICE TO HAVE ==
*	- upload (regular files)
*	- BUG with prefix/postfix and arrows (test in different contexts)
*	- prefix and suffix are slow (100ms or so)
*	- multiple date selection
*	- month selection, year selections
*	- arrows no longer work (for int)
*	- add postData for autocomplete
*	- form to support custom types
*
* == 1.4 Changes ==
*	- select - for select, list - for drop down (needs this in grid)
*	- $().addType() - changes sligtly (this.el)
*	- $().removeType() - new method
*	- enum add events: onLoad, onRequest, onDelete,  for already selected elements
*	- enum - refresh happens on each key press even if not needed (for speed)
*	- rewrire everythin in objects (w2ftext, w2fenum, w2fdate)
*	- render calendar to the div
*	- added .btn with colors
*	- added enum.style and file.style attributes
*	- test all fields as Read Only
*	- added openOnFocus
*	- deprecated -- change: showAll -> applyFilter
*	- color: select with keyboard
*	- enum: addNew event
*	- added icon and onIconClick
*	- new: clearCache
*	- easy way to add icons
*	- easy way to navigate month/year in dates
*	- added step for numeric inputs
*	- changed prepopulate -> minLength
*	- added options.postData
*
************************************************************************/

(function ($) {

	var w2field = function (options) {
		// public properties
		this.el			= null
		this.helpers	= {}; // object or helper elements
		this.type		= options.type || 'text';
		this.options	= $.extend(true, {}, options);
		this.onSearch	= options.onSearch		|| null;
		this.onRequest	= options.onRequest		|| null;
		this.onLoad		= options.onLoad		|| null;
		this.onError	= options.onError		|| null;
		this.onClick	= options.onClick		|| null;
		this.onAdd		= options.onAdd			|| null;
		this.onNew		= options.onNew			|| null;
		this.onRemove	= options.onRemove		|| null;
		this.onMouseOver= options.onMouseOver	|| null;
		this.onMouseOut	= options.onMouseOut	|| null;
		this.onIconClick= options.onIconClick	|| null;
		this.tmp		= {}; // temp object
		// clean up some options
		delete this.options.type;
		delete this.options.onSearch;
		delete this.options.onRequest;
		delete this.options.onLoad;
		delete this.options.onError;
		delete this.options.onClick;
		delete this.options.onMouseOver;
		delete this.options.onMouseOut;
		delete this.options.onIconClick;
		// extend with defaults
		$.extend(true, this, w2obj.field);
	};

	// ====================================================
	// -- Registers as a jQuery plugin

	$.fn.w2field = function (method, options) {
		// call direct
		if (this.length == 0) {
			var pr = w2field.prototype;
			if (pr[method]) {
				return pr[method].apply(pr, Array.prototype.slice.call(arguments, 1));
			}
		} else {
			if (typeof method == 'string' && typeof options == 'object') {
				method = $.extend(true, {}, options, { type: method });
			}
			if (typeof method == 'string' && typeof options == 'undefined') {
				method = { type: method };
			}
			method.type = String(method.type).toLowerCase();
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
					if (method.type == 'clear') return;
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
	}

	// ====================================================
	// -- Implementation of core functionality

	/* 	To add custom types
		$().w2field('addType', 'myType', function (options) {
			$(this.el).on('keypress', function (event) {
				if (event.metaKey || event.ctrlKey || event.altKey
					|| (event.charCode != event.keyCode && event.keyCode > 0)) return;
				var ch = String.fromCharCode(event.charCode);
				if (ch != 'a' && ch != 'b' && ch != 'c') {
					if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;
					return false;
				}
			});
			$(this.el).on('blur', function (event)  { // keyCode & charCode differ in FireFox
				var ch = this.value;
				if (ch != 'a' && ch != 'b' && ch != 'c') {
					$(this).w2tag(w2utils.lang("Not a single charecter from the set of 'abc'"));
				}
			});
		});
	*/

	w2field.prototype = {

		custom: {},  // map of custom types

		pallete: [
			['000000', '444444', '666666', '999999', 'CCCCCC', 'EEEEEE', 'F3F3F3', 'FFFFFF'],
			['FF011B', 'FF9838', 'FFFD59', '01FD55', '00FFFE', '0424F3', '9B24F4', 'FF21F5'],
			['F4CCCC', 'FCE5CD', 'FFF2CC', 'D9EAD3', 'D0E0E3', 'CFE2F3', 'D9D1E9', 'EAD1DC'],
			['EA9899', 'F9CB9C', 'FEE599', 'B6D7A8', 'A2C4C9', '9FC5E8', 'B4A7D6', 'D5A6BD'],
			['E06666', 'F6B26B', 'FED966', '93C47D', '76A5AF', '6FA8DC', '8E7CC3', 'C27BA0'],
			['CC0814', 'E69138', 'F1C232', '6AA84F', '45818E', '3D85C6', '674EA7', 'A54D79'],
			['99050C', 'B45F17', 'BF901F', '37761D', '124F5C', '0A5394', '351C75', '741B47'],
			['660205', '783F0B', '7F6011', '274E12', '0C343D', '063762', '20124D', '4C1030']
		],

		addType: function (type, handler) {
			type = String(type).toLowerCase();
			this.custom[type] = handler;
			return true;
		},

		removeType: function (type) {
			type = String(type).toLowerCase();
			if (!this.custom[type]) return false;
			delete this.custom[type];
			return true
		},

		init: function () {
			var obj 	= this;
			var options = this.options;
			var defaults;

			// Custom Types
			if (typeof this.custom[this.type] == 'function') {
				this.custom[this.type].call(this, options);
				return;
			}
			// only for INPUT or TEXTAREA
			if (['INPUT', 'TEXTAREA'].indexOf(this.el.tagName) == -1) {
				console.log('ERROR: w2field could only be applied to INPUT or TEXTAREA.', this.el);
				return;
			}

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
						step 			: 1,
						placeholder		: '',
						autoFormat	 	: true,
						currencyPrefix	: w2utils.settings.currencyPrefix,
						currencySuffix	: w2utils.settings.currencySuffix,
						currencyPrecision: w2utils.settings.currencyPrecision,
						groupSymbol		: w2utils.settings.groupSymbol,
						arrows			: false,
						keyboard		: true,
						precision		: null,
						silent			: true,
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
					$(this.el).attr('placeholder', options.placeholder);
					break;

				case 'color':
					defaults = {
						prefix		: '#',
						suffix		: '<div style="width: '+ (parseInt($(this.el).css('font-size')) || 12) +'px">&nbsp;</div>',
						placeholder	: '',
						arrows		: false,
						keyboard	: false
					};
					$.extend(options, defaults);
					this.addPrefix(); 	// only will add if needed
					this.addSuffix();	// only will add if needed
					// additional checks
					$(this.el).attr('maxlength', 6);
					if ($(this.el).val() != '') setTimeout(function () { $(obj.el).change(); }, 1);
					$(this.el).attr('placeholder', options.placeholder);
					break;

				case 'date':
					defaults = {
						format		: w2utils.settings.date_format, // date format
						placeholder	: '',
						keyboard	: true,
						silent		: true,
						start		: '',		// string or jquery object
						end			: '',		// string or jquery object
						blocked		: {},		// { '4/11/2011': 'yes' }
						colored		: {}		// { '4/11/2011': 'red:white' }
					};
					this.options = $.extend(true, {}, defaults, options);
					options = this.options; // since object is re-created, need to re-assign
					$(this.el).attr('placeholder', options.placeholder ? options.placeholder : options.format);
					break;

				case 'time':
					defaults = {
						format		: w2utils.settings.time_format,
						placeholder	: '',
						keyboard	: true,
						silent		: true,
						start		: '',
						end			: ''
					};
					this.options = $.extend(true, {}, defaults, options);
					options = this.options; // since object is re-created, need to re-assign
					$(this.el).attr('placeholder', options.placeholder ? options.placeholder : (options.format == 'h12' ? 'hh:mi pm' : 'hh:mi'));
					break;

				case 'datetime':
					break;

				case 'list':
				case 'combo':
					defaults = {
						items			: [],
						selected		: {},
						placeholder		: '',
						url 			: null, 		// url to pull data from
						postData		: {},
						minLength		: 1,
						cacheMax		: 250,
						maxDropHeight 	: 350,			// max height for drop down menu
						match			: 'begins',		// ['contains', 'is', 'begins', 'ends']
						silent			: true,
						icon			: null,
						iconStyle		: '',
						onSearch		: null,			// when search needs to be performed
						onRequest		: null,			// when request is submitted
						onLoad			: null,			// when data is received
						onError			: null,			// when data fails to load due to server error or other failure modes
						onIconClick		: null,
						renderDrop		: null, 		// render function for drop down item
						prefix			: '',
						suffix			: '',
						openOnFocus 	: false,		// if to show overlay onclick or when typing
						markSearch 		: false
					};
					if (this.type == 'list') {
						// defaults.search = (options.items && options.items.length >= 10 ? true : false);
						defaults.openOnFocus = true;
						defaults.suffix = '<div class="arrow-down" style="margin-top: '+ ((parseInt($(this.el).height()) - 6) / 2) +'px;"></div>';
						$(this.el).addClass('w2ui-select');
					}
					options = $.extend({}, defaults, options, {
						align 		: 'both',		// same width as control
						altRows		: true			// alternate row color
					});
					options.items 	 = this.normMenu(options.items);
					this.options = options;
					if (!$.isPlainObject(options.selected)) options.selected = {};
					$(this.el).data('selected', options.selected);
					if (options.url) this.request(0);
					if (options.icon) {
						options.prefix = '<span class="w2ui-icon '+ options.icon +'" '+
							'	style="cursor: pointer; margin: -2px 5px 0px 0px; font-size: 14px; color: #7F98AD;' + options.iconStyle +'">'+
							'</span>';
					}
					if (this.type == 'list') this.addFocus();
					this.addPrefix();
					this.addSuffix();
					setTimeout(function () { obj.refresh();	}, 10); // need this for icon refresh
					$(this.el).attr('placeholder', options.placeholder).attr('autocomplete', 'off');
					if (typeof options.selected.text != 'undefined') $(this.el).val(options.selected.text);
					break;

				case 'enum':
					defaults = {
						items			: [],
						selected		: [],
						placeholder		: '',
						max 			: 0,			// max number of selected items, 0 - unlim
						url 			: null, 		// not implemented
						postData		: {},
						minLength		: 1, 
						cacheMax		: 250,
						maxWidth		: 250,			// max width for a single item
						maxHeight		: 350,			// max height for input control to grow
						maxDropHeight 	: 350,			// max height for drop down menu
						match			: 'contains',	// ['contains', 'is', 'begins', 'ends']
						silent			: true,
						openOnFocus 	: false,		// if to show overlay onclick or when typing
						markSearch 		: true,
						renderDrop		: null, 		// render function for drop down item
						renderItem		: null,			// render selected item
						style			: '',			// style for container div
						onSearch		: null,			// when search needs to be performed
						onRequest		: null,			// when request is submitted
						onLoad			: null,			// when data is received
						onError			: null,			// when data fails to load due to server error or other failure modes
						onClick			: null,			// when an item is clicked
						onAdd			: null,			// when an item is added
						onNew			: null,			// when new item should be added
						onRemove		: null,			// when an item is removed
						onMouseOver 	: null,			// when an item is mouse over
						onMouseOut		: null			// when an item is mouse out
					};
					options = $.extend({}, defaults, options, {
						align 		: 'both',	// same width as control
						suffix		: '',
						altRows		: true		// alternate row color
					});
					options.items 	 = this.normMenu(options.items);
					options.selected = this.normMenu(options.selected);
					this.options = options;
					if (!$.isArray(options.selected)) options.selected = [];
					$(this.el).data('selected', options.selected);
					if (options.url) this.request(0);
					this.addSuffix();
					this.addMulti();
					break;

				case 'file':
					defaults = {
						selected		: [],
						placeholder		: w2utils.lang('Attach files by dragging and dropping or Click to Select'),
						max 			: 0,
						maxSize			: 0,		// max size of all files, 0 - unlim
						maxFileSize		: 0,		// max size of a single file, 0 -unlim
						maxWidth		: 250,		// max width for a single item
						maxHeight		: 350,		// max height for input control to grow
						maxDropHeight 	: 350,		// max height for drop down menu
						silent			: true,
						renderItem		: null,		// render selected item
						style			: '',		// style for container div
						onClick			: null,		// when an item is clicked
						onAdd			: null,		// when an item is added
						onRemove		: null,		// when an item is removed
						onMouseOver 	: null,		// when an item is mouse over
						onMouseOut		: null,		// when an item is mouse out
					};
					options = $.extend({}, defaults, options, {
						align 		: 'both',	// same width as control
						altRows		: true		// alternate row color
					});
					this.options = options;
					if (!$.isArray(options.selected)) options.selected = [];
					$(this.el).data('selected', options.selected);
					this.addMulti();
					break;
			}
			// attach events
			this.tmp = {
				onChange	: function (event) { obj.change.call(obj, event) },
				onClick		: function (event) { obj.click.call(obj, event) },
				onFocus		: function (event) { obj.focus.call(obj, event) },
				onBlur 		: function (event) { obj.blur.call(obj, event) },
				onKeydown	: function (event) { obj.keyDown.call(obj, event) },
				onKeyup		: function (event) { obj.keyUp.call(obj, event) },
				onKeypress	: function (event) { obj.keyPress.call(obj, event) }
			}
			$(this.el)
				.addClass('w2field')
				.data('w2field', this)
				.on('change', 	this.tmp.onChange)
				.on('click', 	this.tmp.onClick) 		// ignore click because it messes overlays
				.on('focus', 	this.tmp.onFocus)
				.on('blur', 	this.tmp.onBlur)
				.on('keydown', 	this.tmp.onKeydown)
				.on('keyup', 	this.tmp.onKeyup)
				.on('keypress', this.tmp.onKeypress)
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
			var obj		= this;
			var options	= this.options;
			var tmp 	= $(this.el).data('tmp');
			this.type 	 = 'clear';
			if (!this.tmp) return;
			// restore paddings
			if (typeof tmp != 'undefined') {
				if (tmp && tmp['old-padding-left'])  $(this.el).css('padding-left',  tmp['old-padding-left']);
				if (tmp && tmp['old-padding-right']) $(this.el).css('padding-right', tmp['old-padding-right']);
			}
			// if money then clear value
			if (['money', 'currency'].indexOf(this.type) != -1) {
				$(this.el).val($(this.el).val().replace(options.moneyRE, ''));
			}
			if (this.type == 'percent') {
				$(this.el).val($(this.el).val().replace(/%/g, ''));
			}
			if (this.type == 'color') {
				$(this.el).removeAttr('maxlength');
			}
			if (this.type == 'list') {
				$(this.el).removeClass('w2ui-select');
			}
			// remove events and data
			$(this.el)
				.val(this.clean($(this.el).val()))
				.removeClass('w2field')
				.removeData() // removes all attached data
				.off('change', 	this.tmp.onChange)
				.off('click', 	this.tmp.onClick)
				.off('focus', 	this.tmp.onFocus)
				.off('blur', 	this.tmp.onBlur)
				.off('keydown', this.tmp.onKeydown)
				.off('keyup', 	this.tmp.onKeyup)
				.off('keypress',this.tmp.onKeypress);
			// remove helpers
			for (var h in this.helpers) $(this.helpers[h]).remove();
			this.helpers = {};
		},

		refresh: function () {
			var obj		 = this;
			var options	 = this.options;
			var selected = $(this.el).data('selected');
			var time 	 = (new Date()).getTime();
			// enum
			if (['list'].indexOf(this.type) != -1) {
				$(obj.el).parent().css('white-space', 'nowrap'); // needs this for arrow alway to appear on the right side
				// hide focus and show text
				if (obj.helpers.prefix) obj.helpers.prefix.hide();
				setTimeout(function () {
					var focus = obj.helpers.focus.find('input');
					if ($(focus).val() == '') {
						$(focus).css('opacity', 0).prev().css('opacity', 0);
						$(obj.el).val(selected && selected.text != null ? selected.text : '');
						$(obj.el).attr('placeholder', $(obj.el).attr('_placeholder'));
						// if empty show no icon
						if ($.isEmptyObject(selected)) {
							if (obj.helpers && obj.helpers.prefix) obj.helpers.prefix.hide();
						} else {
							if (obj.helpers && obj.helpers.prefix) obj.helpers.prefix.show();
						}
					} else {
						$(focus).css('opacity', 1).prev().css('opacity', 1);
						if (obj.helpers && obj.helpers.prefix) obj.helpers.prefix.hide();
						$(obj.el).val('');
						$(obj.el).attr('_placeholder', $(obj.el).attr('placeholder')).removeAttr('placeholder');
					}
				}, 1);
			}
			if (['enum', 'file'].indexOf(this.type) != -1) {
				var html = '';
				for (var s in selected) {
					var it  = selected[s];
					var ren = '';
					if (typeof options.renderItem == 'function') {
						ren = options.renderItem(it, s, '<div class="w2ui-list-remove" title="'+ w2utils.lang('Remove') +'" index="'+ s +'">&nbsp;&nbsp;</div>');
					} else {
						ren = '<div class="w2ui-list-remove" title="'+ w2utils.lang('Remove') +'" index="'+ s +'">&nbsp;&nbsp;</div>'+
							  (obj.type == 'enum' ? it.text : it.name + '<span class="file-size"> - '+ w2utils.size(it.size) +'</span>');
					}
					html += '<li index="'+ s +'" style="max-width: '+ parseInt(options.maxWidth) + 'px; '+ (it.style ? it.style : '') +'">'+
							ren +'</li>';
				}
				var div = obj.helpers.multi;
				var ul  = div.find('ul');
				div.attr('style', div.attr('style') + ';' + options.style);
				if ($(obj.el).attr('readonly')) div.addClass('w2ui-readonly'); else div.removeClass('w2ui-readonly');
				// celan
				div.find('.w2ui-enum-placeholder').remove();
				ul.find('li').not('li.nomouse').remove();
				// add new list
				if (html != '') {
					ul.prepend(html);
				} else if (typeof options.placeholder != 'undefined') {
					var style =
						'padding-top: ' + $(this.el).css('padding-top') + ';'+
						'padding-left: ' + $(this.el).css('padding-left') + '; ' +
						'box-sizing: ' + $(this.el).css('box-sizing') + '; ' +
						'line-height: ' + $(this.el).css('line-height') + '; ' +
						'font-size: ' + $(this.el).css('font-size') + '; ' +
						'font-family: ' + $(this.el).css('font-family') + '; ';
					div.prepend('<div class="w2ui-enum-placeholder" style="'+ style +'">'+ options.placeholder + '</div>');
				}
				// ITEMS events
				div.find('li')
					.data('mouse', 'out')
					.on('click', function (event) {
						var item = selected[$(event.target).attr('index')];
						if ($(event.target).hasClass('nomouse')) return;
						event.stopPropagation();
						// trigger event
						var eventData = obj.trigger({ phase: 'before', type: 'click', target: obj.el, originalEvent: event.originalEvent, item: item });
						if (eventData.isCancelled === true) return;
						// default behavior
						if ($(event.target).hasClass('w2ui-list-remove')) {
							if ($(obj.el).attr('readonly')) return;
							// trigger event
							var eventData = obj.trigger({ phase: 'before', type: 'remove', target: obj.el, originalEvent: event.originalEvent, item: item });
							if (eventData.isCancelled === true) return;
							// default behavior
							$().w2overlay();
							selected.splice($(event.target).attr('index'), 1);
							$(obj.el).trigger('change');
							$(event.target).parent().fadeOut('fast');
							setTimeout(function () {
								obj.refresh();
								// event after
								obj.trigger($.extend(eventData, { phase: 'after' }));
							}, 300);
						}
						if (obj.type == 'file' && !$(event.target).hasClass('w2ui-list-remove')) {
							var preview = '';
							if ((/image/i).test(item.type)) { // image
								preview = '<div style="padding: 3px;">'+
									'	<img src="'+ (item.content ? 'data:'+ item.type +';base64,'+ item.content : '') +'" style="max-width: 300px;" '+
									'		onload="var w = $(this).width(); var h = $(this).height(); '+
									'			if (w < 300 & h < 300) return; '+
									'			if (w >= h && w > 300) $(this).width(300);'+
									'			if (w < h && h > 300) $(this).height(300);"'+
									'		onerror="this.style.display = \'none\'"'+
									'	>'+
									'</div>';
							}
							var td1 = 'style="padding: 3px; text-align: right; color: #777;"';
							var td2 = 'style="padding: 3px"';
							preview += '<div style="padding: 8px;">'+
								'	<table cellpadding="2">'+
								'	<tr><td '+ td1 +'>Name:</td><td '+ td2 +'>'+ item.name +'</td></tr>'+
								'	<tr><td '+ td1 +'>Size:</td><td '+ td2 +'>'+ w2utils.size(item.size) +'</td></tr>'+
								'	<tr><td '+ td1 +'>Type:</td><td '+ td2 +'>' +
								'		<span style="width: 200px; display: block-inline; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">'+ item.type +'</span>'+
								'	</td></tr>'+
								'	<tr><td '+ td1 +'>Modified:</td><td '+ td2 +'>'+ w2utils.date(item.modified) +'</td></tr>'+
								'	</table>'+
								'</div>';
								$(event.target).w2overlay(preview);
						}
						// event after
						obj.trigger($.extend(eventData, { phase: 'after' }));
					})
					.on('mouseover', function (event) {
						var tmp = event.target;
						if (tmp.tagName != 'LI') tmp = tmp.parentNode;
						if ($(tmp).hasClass('nomouse')) return;
						if ($(tmp).data('mouse') == 'out') {
							var item = selected[$(tmp).attr('index')];
							// trigger event
							var eventData = obj.trigger({ phase: 'before', type: 'mouseOver', target: obj.el, originalEvent: event.originalEvent, item: item });
							if (eventData.isCancelled === true) return;
							// event after
							obj.trigger($.extend(eventData, { phase: 'after' }));
						}
						$(tmp).data('mouse', 'over');
					})
					.on('mouseout', function (event) {
						var tmp = event.target;
						if (tmp.tagName != 'LI') tmp = tmp.parentNode;
						if ($(tmp).hasClass('nomouse')) return;
						$(tmp).data('mouse', 'leaving');
						setTimeout(function () {
							if ($(tmp).data('mouse') == 'leaving') {
								$(tmp).data('mouse', 'out');
								var item = selected[$(tmp).attr('index')];
								// trigger event
								var eventData = obj.trigger({ phase: 'before', type: 'f', target: obj.el, originalEvent: event.originalEvent, item: item });
								if (eventData.isCancelled === true) return;
								// event after
								obj.trigger($.extend(eventData, { phase: 'after' }));
							}
						}, 0);
					});
				// adjust height
				$(this.el).height('auto');
				var cntHeight = $(div).find('> div').height() + w2utils.getSize(div, '+height') * 2;
				if (cntHeight < 26) cntHeight = 26;
				if (cntHeight > options.maxHeight) cntHeight = options.maxHeight;
				if (div.length > 0) div[0].scrollTop = 1000;
				var inpHeight = w2utils.getSize($(this.el), 'height') - 2;
				if (inpHeight > cntHeight) cntHeight = inpHeight
				$(div).css({ 'height': cntHeight + 'px', overflow: (cntHeight == options.maxHeight ? 'auto' : 'hidden') });
				if (cntHeight < options.maxHeight) $(div).prop('scrollTop', 0);
				$(this.el).css({ 'height' : (cntHeight + 2) + 'px' });
			}
			return (new Date()).getTime() - time;
		},

		reset: function () {
			var obj  = this;
			var type = this.type;
			this.clear();
			this.type = type;
			this.init();
		},

		clean: function (val) {
			var options = this.options;
			val = String(val).trim();
			// clean
			if (['int', 'float', 'money', 'currency', 'percent'].indexOf(this.type) != -1) {
				if (options.autoFormat && ['money', 'currency'].indexOf(this.type) != -1) val = String(val).replace(options.moneyRE, '');
				if (options.autoFormat && this.type == 'percent') val = String(val).replace(options.percentRE, '');
				if (options.autoFormat && ['int', 'float'].indexOf(this.type) != -1) val = String(val).replace(options.numberRE, '');
				if (parseFloat(val) == val) {
					if (options.min !== null && val < options.min) { val = options.min; $(this.el).val(options.min); }
					if (options.max !== null && val > options.max) { val = options.max; $(this.el).val(options.max); }
				}
				if (val !== '' && w2utils.isFloat(val)) val = Number(val); else val = '';
			}
			return val;
		},

		format: function (val) {
			var options = this.options;
			// autoformat numbers or money
			if (options.autoFormat && val != '') {
				switch (this.type) {
					case 'money':
					case 'currency':
						val = w2utils.formatNumber(Number(val).toFixed(options.currencyPrecision), options.groupSymbol);
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
			}
			return val;
		},

		change: function (event) {
			var obj 	= this;
			var options = obj.options;
			// numeric
			if (['int', 'float', 'money', 'currency', 'percent'].indexOf(this.type) != -1) {
				// check max/min
				var val 	=  $(this.el).val();
				var new_val = this.format(this.clean($(this.el).val()));
				// if was modified
				if (val != '' && val != new_val) {
					$(this.el).val(new_val).change();
					// cancel event
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
				if ($(obj.el).is(':focus')) this.updateOverlay();
			}
		},

		click: function (event) {
			event.stopPropagation();
			// lists
			if (['list', 'combo', 'enum'].indexOf(this.type) != -1) {
				if (!$(this.el).is(':focus')) this.focus(event);
			}
			// other fields with drops
			if (['date', 'time', 'color'].indexOf(this.type) != -1) {
				this.updateOverlay();
			}
		},

		focus: function (event) {
			var obj 	= this;
			var options = this.options;
			// color, date, time
			if (['color', 'date', 'time'].indexOf(obj.type) !== -1) {
				if ($(obj.el).attr('readonly')) return;
				if ($("#w2ui-overlay").length > 0) $('#w2ui-overlay')[0].hide();
				setTimeout(function () { obj.updateOverlay(); }, 150);
			}
			// menu
			if (['list', 'combo', 'enum'].indexOf(obj.type) != -1) {
				if ($(obj.el).attr('readonly')) return;
				if ($("#w2ui-overlay").length > 0) $('#w2ui-overlay')[0].hide();
				setTimeout(function () {
					if (obj.type == 'list' && $(obj.el).is(':focus')) {
						$(obj.helpers.focus).find('input').focus();
						return;
					}
					obj.search();
					setTimeout(function () { obj.updateOverlay(); }, 1);
				}, 1);
			}
			// file
			if (obj.type == 'file') {
				$(obj.helpers.multi).css({ 'outline': 'auto 5px #7DB4F3', 'outline-offset': '-2px' });
			}
		},

		blur: function (event) {
			var obj 	= this;
			var options = obj.options;
			var val 	= $(obj.el).val().trim();
			// hide overlay
			if (['color', 'date', 'time', 'list', 'combo', 'enum'].indexOf(obj.type) != -1) {
				if ($("#w2ui-overlay").length > 0) $('#w2ui-overlay')[0].hide();
			}
			if (['int', 'float', 'money', 'currency', 'percent'].indexOf(obj.type) != -1) {
				if (val !== '' && !obj.checkType(val)) {
					$(obj.el).val('').change();
					if (options.silent === false) {
						$(obj.el).w2tag('Not a valid number');
						setTimeout(function () { $(obj.el).w2tag(''); }, 3000);
					}
				}
			}
			// date or time
			if (['date', 'time'].indexOf(obj.type) != -1) {
				if (w2utils.isInt(obj.el.value)) {
					$(obj.el).val(w2utils.formatDate(new Date(parseInt(obj.el.value)), options.format)).change();
				}
				// check if in range
				if (val !== '' && !obj.inRange(obj.el.value)) {
					$(obj.el).val('').removeData('selected').change();
					if (options.silent === false) {
						$(obj.el).w2tag('Not in range');
						setTimeout(function () { $(obj.el).w2tag(''); }, 3000);
					}
				} else {
					if (obj.type == 'date' && val !== '' && !w2utils.isDate(obj.el.value, options.format)) {
						$(obj.el).val('').removeData('selected').change();
						if (options.silent === false) {
							$(obj.el).w2tag('Not a valid date');
							setTimeout(function () { $(obj.el).w2tag(''); }, 3000);
						}
					}
					if (obj.type == 'time' && val !== '' && !w2utils.isTime(obj.el.value)) {
						$(obj.el).val('').removeData('selected').change();
						if (options.silent === false) {
							$(obj.el).w2tag('Not a valid time');
							setTimeout(function () { $(obj.el).w2tag(''); }, 3000);
						}
					}
				}
			}
			// clear search input
			if (obj.type == 'enum') {
				$(obj.helpers.multi).find('input').val('').width(20);
			}
			// file
			if (obj.type == 'file') {
				$(obj.helpers.multi).css({ 'outline': 'none' });
			}
		},

		keyPress: function (event) {
			var obj 	= this;
			var options = obj.options;
			// ignore wrong pressed key
			if (['int', 'float', 'money', 'currency', 'percent', 'hex', 'color', 'alphanumeric'].indexOf(obj.type) != -1) {
				// keyCode & charCode differ in FireFox
				if (event.metaKey || event.ctrlKey || event.altKey || (event.charCode != event.keyCode && event.keyCode > 0)) return;
				var ch = String.fromCharCode(event.charCode);
				if (!obj.checkType(ch, true) && event.keyCode != 13) {
					event.preventDefault();
					if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;
					return false;
				}
			}
			// update date popup
			if (['date', 'time'].indexOf(obj.type) != -1) {
				setTimeout(function () { obj.updateOverlay(); }, 1);
			}
		},

		keyDown: function (event, extra) {
			var obj 	= this;
			var options = obj.options;
			var key 	= event.keyCode || (extra && extra.keyCode);
			// numeric
			if (['int', 'float', 'money', 'currency', 'percent'].indexOf(obj.type) != -1) {
				if (!options.keyboard || $(obj.el).attr('readonly')) return;
				var cancel = false;
				var val = parseFloat($(obj.el).val().replace(options.moneyRE, '')) || 0;
				var inc = options.step;
				if (event.ctrlKey || event.metaKey) inc = 10;
				switch (key) {
					case 38: // up
						if (event.shiftKey) break; // no action if shift key is pressed
						$(obj.el).val((val + inc <= options.max || options.max === null ? Number((val + inc).toFixed(12)) : options.max)).change();
						cancel = true;
						break;
					case 40: // down
						if (event.shiftKey) break; // no action if shift key is pressed
						$(obj.el).val((val - inc >= options.min || options.min === null ? Number((val - inc).toFixed(12)) : options.min)).change();
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
			if (obj.type == 'date') {
				if (!options.keyboard || $(obj.el).attr('readonly')) return;
				var cancel  = false;
				var daymil  = 24*60*60*1000;
				var inc		= 1;
				if (event.ctrlKey || event.metaKey) inc = 10;
				if (w2utils.isInt(obj.el.value)) {
					$(obj.el).val(w2utils.formatDate(new Date(parseInt(obj.el.value)), options.format)).change();
				}
				var dt = w2utils.isDate($(obj.el).val(), options.format, true);
				if (!dt) { dt = new Date(); daymil = 0; }
				switch (key) {
					case 38: // up
						if (event.shiftKey) break; // no action if shift key is pressed
						var newDT = w2utils.formatDate(dt.getTime() + daymil, options.format);
						if (inc == 10) newDT = w2utils.formatDate(new Date(dt.getFullYear(), dt.getMonth()+1, dt.getDate()), options.format);
						$(obj.el).val(newDT).change();
						cancel = true;
						break;
					case 40: // down
						if (event.shiftKey) break; // no action if shift key is pressed
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
			if (obj.type == 'time') {
				if (!options.keyboard || $(obj.el).attr('readonly')) return;
				var cancel  = false;
				var inc		= 1;
				if (event.ctrlKey || event.metaKey) inc = 60;
				if (w2utils.isInt(obj.el.value)) {
					$(obj.el).val(w2utils.formatTime(new Date(parseInt(obj.el.value)), options.format)).change();
				}
				var val = $(obj.el).val();
				var time = obj.toMin(val) || obj.toMin((new Date()).getHours() + ':' + ((new Date()).getMinutes() - 1));
				switch (key) {
					case 38: // up
						if (event.shiftKey) break; // no action if shift key is pressed
						time += inc;
						cancel = true;
						break;
					case 40: // down
						if (event.shiftKey) break; // no action if shift key is pressed
						time -= inc;
						cancel = true;
						break;
				}
				if (cancel) {
					$(obj.el).val(obj.fromMin(time)).change();
					event.preventDefault();
					setTimeout(function () {
						// set cursor to the end
						obj.el.setSelectionRange(obj.el.value.length, obj.el.value.length);
					}, 0);
				}
			}
			// color
			if (obj.type == 'color') {
				if ($(obj.el).attr('readonly')) return;
				// paste
				if (event.keyCode == 86 && (event.ctrlKey || event.metaKey)) {
					$(obj.el).prop('maxlength', 7);
					setTimeout(function () {
						var val = $(obj).val();
						if (val.substr(0, 1) == '#') val = val.substr(1);
						if (!w2utils.isHex(val)) val = '';
						$(obj).val(val).prop('maxlength', 6).change();
					}, 20);
				}
				if ((event.ctrlKey || event.metaKey) && !event.shiftKey) {
					if (typeof obj.tmp.cind1 == 'undefined') {
						obj.tmp.cind1 = -1;
						obj.tmp.cind2 = -1;
					} else {
						switch (key) {
							case 38: // up
								obj.tmp.cind1--;
								break;
							case 40: // down
								obj.tmp.cind1++;
								break;
							case 39: // right
								obj.tmp.cind2++;
								break;
							case 37: // left
								obj.tmp.cind2--;
								break;
						}
						if (obj.tmp.cind1 < 0) obj.tmp.cind1 = 0;
						if (obj.tmp.cind1 > this.pallete.length - 1) obj.tmp.cind1 = this.pallete.length - 1;
						if (obj.tmp.cind2 < 0) obj.tmp.cind2 = 0;
						if (obj.tmp.cind2 > this.pallete[0].length - 1) obj.tmp.cind2 = this.pallete[0].length - 1;
					}
					if ([37, 38, 39, 40].indexOf(key) != -1) {
						$(obj.el).val(this.pallete[obj.tmp.cind1][obj.tmp.cind2]).change();
						event.preventDefault();
					}
				}
			}
			// list/select/combo
			if (['list', 'combo', 'enum'].indexOf(obj.type) != -1) {
				if ($(obj.el).attr('readonly')) return;
				var cancel		= false;
				var selected	= $(obj.el).data('selected');
				var focus 		= $(obj.helpers.focus).find('input');
				if (obj.type == 'list') {
					if ([37, 38, 39, 40].indexOf(key) == -1) obj.refresh(); // arrows
				}
				// apply arrows
				switch (key) {
					case 27: // escape
						if (obj.type == 'list') {
							if ($(focus).val() == '') {
								$(obj.el).data('selected', {});
							} else {
								$(focus).val('');
							}
							obj.refresh();
							event.stopPropagation(); // escape in field should not close popup
						}
						break;
					case 37: // left
					case 39: // right
						// cancel = true;
						break;
					case 13: // enter
						if ($('#w2ui-overlay').length == 0) break; // no action if overlay not open
						var item  = options.items[options.index];
						var multi = $(obj.helpers.multi).find('input');
						if (obj.type == 'enum') {
							if (item != null) {
								// trigger event
								var eventData = obj.trigger({ phase: 'before', type: 'add', target: obj.el, originalEvent: event.originalEvent, item: item });
								if (eventData.isCancelled === true) return;
								item = eventData.item; // need to reassign because it could be recreated by user
								// default behavior
								if (selected.length >= options.max && options.max > 0) selected.pop();
								delete item.hidden;
								delete obj.tmp.force_open;
								selected.push(item);
								$(obj.el).change();
								multi.val('').width(20);
								obj.refresh();
								// event after
								obj.trigger($.extend(eventData, { phase: 'after' }));
							} else {
								// trigger event
								item = { id: multi.val(), text: multi.val() }
								var eventData = obj.trigger({ phase: 'before', type: 'new', target: obj.el, originalEvent: event.originalEvent, item: item });
								if (eventData.isCancelled === true) return;
								item = eventData.item; // need to reassign because it could be recreated by user
								// default behavior
								if (typeof obj.onNew == 'function') {
									if (selected.length >= options.max && options.max > 0) selected.pop();
									delete obj.tmp.force_open;
									selected.push(item);
									$(obj.el).change();
									multi.val('').width(20);
									obj.refresh();
								}
								// event after
								obj.trigger($.extend(eventData, { phase: 'after' }));
							}
						} else {
							if (item) $(obj.el).data('selected', item).val(item.text).change();
							if ($(obj.el).val() == '' && $(obj.el).data('selected')) $(obj.el).removeData('selected').val('').change();
							if (obj.type == 'list') {
								focus.val('');
								obj.refresh();
							}
							// hide overlay
							obj.tmp.force_hide = true;
						}
						break;
					case 8: // delete
						if (['enum'].indexOf(obj.type) != -1) {
							if ($(obj.helpers.multi).find('input').val() == '' && selected.length > 0) {
								var item = selected[selected.length - 1];
								// trigger event
								var eventData = obj.trigger({ phase: 'before', type: 'remove', target: obj.el, originalEvent: event.originalEvent, item: item });
								if (eventData.isCancelled === true) return;
								// default behavior
								selected.pop();
								$(obj.el).trigger('change');
								obj.refresh();
								// event after
								obj.trigger($.extend(eventData, { phase: 'after' }));
							}
						}
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
						// show overlay if not shown
						var input = obj.el;
						if (['enum'].indexOf(obj.type) != -1) input = obj.helpers.multi.find('input');
						if ($(input).val() == '' && $('#w2ui-overlay').length == 0) {
							obj.tmp.force_open = true;
						} else {
							cancel = true;
						}
						break;
				}
				if (cancel) {
					if (options.index < 0) options.index = 0;
					if (options.index >= options.items.length) options.index = options.items.length -1;
					obj.updateOverlay();
					// cancel event
					event.preventDefault();
					setTimeout(function () {
						// set cursor to the end
						if (obj.type == 'enum') {
							var tmp = obj.helpers.multi.find('input').get(0);
							tmp.setSelectionRange(tmp.value.length, tmp.value.length);
						} else if (obj.type == 'list') {
							var tmp = obj.helpers.focus.find('input').get(0);
							tmp.setSelectionRange(tmp.value.length, tmp.value.length);
						} else {
							obj.el.setSelectionRange(obj.el.value.length, obj.el.value.length);
						}
					}, 0);
					return;
				}
				// expand input
				if (obj.type == 'enum') {
					var input  = obj.helpers.multi.find('input');
					var search = input.val();
					input.width(((search.length + 2) * 8) + 'px');
				}
				// run search
				if ([16, 17, 18, 20, 37, 39, 91].indexOf(key) == -1) { // no refreah on crtl, shift, left/right arrows, etc
					setTimeout(function () {
						if (!obj.tmp.force_hide) obj.request();
						obj.search();
					}, 1);
				}
			}
		},

		keyUp: function (event) {
			if (this.type == 'color') {
				if (event.keyCode == 86 && (event.ctrlKey || event.metaKey)) $(this).prop('maxlength', 6);
			}
		},

		clearCache: function () {
			var options 		= this.options;
			options.items 		= [];
			this.tmp.xhr_loading = false;
			this.tmp.xhr_search  = '';
			this.tmp.xhr_total	= -1;
			this.search();
		},

		request: function (interval) {
			var obj 	 = this;
			var options  = this.options;
			var search 	 = $(obj.el).val() || '';
			// if no url - do nothing
			if (!options.url) return;
			// --
			if (obj.type == 'enum') {
				var tmp = $(obj.helpers.multi).find('input');
				if (tmp.length == 0) search = ''; else search = tmp.val();
			}
			if (obj.type == 'list') {
				var tmp = $(obj.helpers.focus).find('input');
				if (tmp.length == 0) search = ''; else search = tmp.val();
			}
			if (options.minLength != 0 && search.length < options.minLength) {
				options.items = []; // need to empty the list
				this.updateOverlay();
				return;
			}
			if (typeof interval == 'undefined') interval = 350;
			if (typeof obj.tmp.xhr_search == 'undefined') obj.tmp.xhr_search = '';
			if (typeof obj.tmp.xhr_total == 'undefined') obj.tmp.xhr_total = -1;
			// check if need to search
			if (options.url && (
					(options.items.length === 0 && obj.tmp.xhr_total !== 0) ||
					(obj.tmp.xhr_total == options.cacheMax && search.length > obj.tmp.xhr_search.length) ||
					(search.length >= obj.tmp.xhr_search.length && search.substr(0, obj.tmp.xhr_search.length) != obj.tmp.xhr_search) ||
					(search.length < obj.tmp.xhr_search.length)
				)) {
				// empty list
				obj.tmp.xhr_loading = true;
				obj.search();
				// timeout
				clearTimeout(obj.tmp.timeout);
				obj.tmp.timeout = setTimeout(function () {
					// trigger event
					var url  	 = options.url;
					var postData = {
						search	: search,
						max 	: options.cacheMax
					};
					$.extend(postData, options.postData);
					var eventData = obj.trigger({ phase: 'before', type: 'request', target: obj.el, url: url, postData: postData });
					if (eventData.isCancelled === true) return;
					url		 = eventData.url;
					postData = eventData.postData;
					// console.log('REMOTE SEARCH:', search);
					if (obj.tmp.xhr) obj.tmp.xhr.abort();
					obj.tmp.xhr = $.ajax({
							type : 'POST',
							url	 : url,
							data : postData
						})
						.done(function (data, status, xhr) {
							// trigger event
							var eventData2 = obj.trigger({ phase: 'before', type: 'load', target: obj.el, search: postData.search, data: data, xhr: xhr });
							if (eventData2.isCancelled === true) return;
							// default behavior
							data = eventData2.data;
							if (typeof data == 'string') data = JSON.parse(data);
							if (data.status != 'success') {
								console.log('ERROR: server did not return proper structure. It should return', { status: 'success', items: [{ id: 1, text: 'item' }] });
								return;
							}
							// remove all extra items if more then needed for cache
							if (data.items.length > options.cacheMax) data.items.splice(options.cacheMax, 100000);
							// remember stats
							obj.tmp.xhr_loading = false;
							obj.tmp.xhr_search 	= search;
							obj.tmp.xhr_total 	= data.items.length;
							options.items 		= data.items;
							if (search == '' && data.items.length == 0) obj.tmp.emptySet = true; else obj.tmp.emptySet = false;
							obj.search();
							// console.log('-->', 'retrieved:', obj.tmp.xhr_total);
							// event after
							obj.trigger($.extend(eventData2, { phase: 'after' }));
						})
						.error(function (xhr, status, exceptionThrown) {
							// trigger event
							var errorObj = { status: status, exceptionThrown: exceptionThrown, rawResponseText: xhr.responseText };
							var eventData2 = obj.trigger({ phase: 'before', type: 'error', target: obj.el, search: search, error: errorObj, xhr: xhr });
							if (eventData2.isCancelled === true) return;
							// default behavior
							console.log('ERROR: server communication failed. The server should return', { status: 'success', items: [{ id: 1, text: 'item' }] }, ', instead the AJAX request produced this: ', errorObj);
							// reset stats
							obj.clearCache();
							// event after
							obj.trigger($.extend(eventData2, { phase: 'after' }));
						});
					// event after
					obj.trigger($.extend(eventData, { phase: 'after' }));
				}, interval);
			}
		},

		search: function () {
			var obj 	= this;
			var options = this.options;
			var search 	= $(obj.el).val();
			var target	= obj.el;
			var ids 	= [];
			var selected= $(obj.el).data('selected');
			if (obj.type == 'enum') {
				target = $(obj.helpers.multi).find('input');
				search = target.val();
				for (var s in selected) { if (selected[s]) ids.push(selected[s].id); }
			}
			if (obj.type == 'list') {
				target = $(obj.helpers.focus).find('input');
				search = target.val();
				for (var s in selected) { if (selected[s]) ids.push(selected[s].id); }
			}
			// trigger event
			var eventData = obj.trigger({ phase: 'before', type: 'search', target: target, search: search });
			if (eventData.isCancelled === true) return;
			if (obj.tmp.xhr_loading !== true) {
				var shown = 0;
				for (var i in options.items) {
					var item = options.items[i];
					var prefix = '';
					var suffix = '';
					if (['is', 'begins'].indexOf(options.match) != -1) prefix = '^';
					if (['is', 'ends'].indexOf(options.match) != -1) suffix = '$';
					try {
						var re = new RegExp(prefix + search + suffix, 'i');
						if (re.test(item.text) || item.text == '...') item.hidden = false; else item.hidden = true;
					} catch (e) {}
					// do not show selected items
					if (obj.type == 'enum' && $.inArray(item.id, ids) != -1) item.hidden = true;
					if (item.hidden !== true) shown++;
				}
				if (obj.type != 'combo') { // don't preselect first for combo
					options.index = 0;
					while (options.items[options.index] && options.items[options.index].hidden) options.index++;
				} else {
					options.index = -1;
				}
				if (shown <= 0) options.index = -1;
				options.spinner = false;
				obj.updateOverlay();
				setTimeout(function () { 
					var html = $('#w2ui-overlay').html() || '';
					if (options.markSearch && html.indexOf('$.fn.w2menuHandler') != -1) { // do not highlight when no items
						$('#w2ui-overlay').w2marker(search); 
					}
				}, 1);
			} else {
				options.items.splice(0, options.cacheMax);
				options.spinner = true;
				obj.updateOverlay();
			}
			// event after
			obj.trigger($.extend(eventData, { phase: 'after' }));
		},

		updateOverlay: function () {
			var obj 	= this;
			var options = this.options;
			// color
			if (this.type == 'color') {
				if ($(obj.el).attr('readonly')) return;
				if ($('#w2ui-overlay').length == 0) {
					$(obj.el).w2overlay(obj.getColorHTML());
				} else {
					$('#w2ui-overlay').html(obj.getColorHTML());
				}
				// bind events
				$('#w2ui-overlay .color')
					.on('mousedown', function (event) {
						var color = $(event.originalEvent.target).attr('name');
						var index = $(event.originalEvent.target).attr('index').split(':');
						obj.tmp.cind1 = index[0];
						obj.tmp.cind2 = index[1];
						$(obj.el).val(color).change();
						$(this).html('&#149;');
					})
					.on('mouseup', function () {
						setTimeout(function () {
							if ($("#w2ui-overlay").length > 0) $('#w2ui-overlay').removeData('keepOpen')[0].hide();
						}, 10);
					});
			}
			// date
			if (this.type == 'date') {
				if ($(obj.el).attr('readonly')) return;
				if ($('#w2ui-overlay').length == 0) {
					$(obj.el).w2overlay('<div class="w2ui-reset w2ui-calendar" onclick="event.stopPropagation();"></div>', {
						css: { "background-color": "#f5f5f5" }
					});
				}
				var month, year;
				var dt = w2utils.isDate($(obj.el).val(), obj.options.format, true);
				if (dt) { month = dt.getMonth() + 1; year = dt.getFullYear(); }
				(function refreshCalendar(month, year) {
					$('#w2ui-overlay > div > div').html(obj.getMonthHTML(month, year));
					$('#w2ui-overlay .w2ui-calendar-title')
						.on('mousedown', function () {
							if ($(this).next().hasClass('w2ui-calendar-jump')) {
								$(this).next().remove();
							} else {
								var selYear, selMonth;
								$(this).after('<div class="w2ui-calendar-jump" style=""></div>');
								$(this).next().hide().html(obj.getYearHTML()).fadeIn(200);
								setTimeout(function () {
									$('#w2ui-overlay .w2ui-calendar-jump')
										.find('.w2ui-jump-month, .w2ui-jump-year')
										.on('click', function () {
											if ($(this).hasClass('w2ui-jump-month')) {
												$(this).parent().find('.w2ui-jump-month').removeClass('selected');
												$(this).addClass('selected');
												selMonth = $(this).attr('name');
											}
											if ($(this).hasClass('w2ui-jump-year')) {
												$(this).parent().find('.w2ui-jump-year').removeClass('selected');
												$(this).addClass('selected');
												selYear = $(this).attr('name');
											}
											if (selYear != null && selMonth != null) {
												$('#w2ui-overlay .w2ui-calendar-jump').fadeOut(100);
												setTimeout(function () { refreshCalendar(parseInt(selMonth)+1, selYear); }, 100);
											}
										});
									$('#w2ui-overlay .w2ui-calendar-jump >:last-child').prop('scrollTop', 2000);
								}, 1);
							}
						});
					$('#w2ui-overlay .w2ui-date')
						.on('mousedown', function () {
							var day = $(this).attr('date');
							$(obj.el).val(day).change();
							$(this).css({ 'background-color': '#B6D5FB', 'border-color': '#aaa' });
						})
						.on('mouseup', function () {
							setTimeout(function () {
								if ($("#w2ui-overlay").length > 0) $('#w2ui-overlay').removeData('keepOpen')[0].hide();
							}, 10);
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
				}) (month, year);
			}
			// date
			if (this.type == 'time') {
				if ($(obj.el).attr('readonly')) return;
				if ($('#w2ui-overlay').length == 0) {
					$(obj.el).w2overlay('<div class="w2ui-reset w2ui-calendar-time" onclick="event.stopPropagation();"></div>', {
						css: { "background-color": "#fff" }
					});
				}
				var h24 = (this.options.format == 'h24' ? true : false);
				$('#w2ui-overlay > div').html(obj.getHourHTML());
				$('#w2ui-overlay .w2ui-time')
					.on('mousedown', function (event) {
						$(this).css({ 'background-color': '#B6D5FB', 'border-color': '#aaa' });
						var hour = $(this).attr('hour');
						$(obj.el).val((hour > 12 && !h24 ? hour - 12 : hour) + ':00' + (!h24 ? (hour < 12 ? ' am' : ' pm') : '')).change();
					})
					.on('mouseup', function () {
						var hour = $(this).attr('hour');
						if ($("#w2ui-overlay").length > 0) $('#w2ui-overlay')[0].hide();
						$(obj.el).w2overlay('<div class="w2ui-reset w2ui-calendar-time"></div>', { css: { "background-color": "#fff" } });
						$('#w2ui-overlay > div').html(obj.getMinHTML(hour));
						$('#w2ui-overlay .w2ui-time')
							.on('mousedown', function () {
								$(this).css({ 'background-color': '#B6D5FB', 'border-color': '#aaa' });
								var min = $(this).attr('min');
								$(obj.el).val((hour > 12 && !h24 ? hour - 12 : hour) + ':' + (min < 10 ? 0 : '') + min + (!h24 ? (hour < 12 ? ' am' : ' pm') : '')).change();
							})
							.on('mouseup', function () {
								setTimeout(function () { if ($("#w2ui-overlay").length > 0) $('#w2ui-overlay').removeData('keepOpen')[0].hide(); }, 10);
							});
					});
			}
			// list
			if (['list', 'combo', 'enum'].indexOf(this.type) != -1) {
				var el		= this.el;
				var input	= this.el;
				if (this.type == 'enum') {
					el		= $(this.helpers.multi);
					input	= $(el).find('input');
				}
				if (this.type == 'list') {
					input	= $(this.helpers.focus).find('input');
				}
				if ($(input).is(':focus')) {
					if (options.openOnFocus === false && $(input).val() == '' && obj.tmp.force_open !== true) {
						$().w2overlay();
						return;
					}
					if (obj.tmp.force_hide) {
						$().w2overlay();
						setTimeout(function () {
							delete obj.tmp.force_hide;
						}, 1);						
						return;
					}
					if ($(input).val() != '') delete obj.tmp.force_open;
					if ($('#w2ui-overlay').length == 0) options.index = 0;
					var msgNoItems = w2utils.lang('No matches');
					if (options.url != null && $(input).val().length < options.minLength && obj.tmp.emptySet !== true) msgNoItems = options.minLength + ' ' + w2utils.lang('letters or more...');
					if (options.url != null && $(input).val() == '' && obj.tmp.emptySet !== true) msgNoItems = w2utils.lang('Type to search....');
					$(el).w2menu('refresh', $.extend(true, {}, options, {
						search		: false,
						render		: options.renderDrop,
						maxHeight	: options.maxDropHeight,
						msgNoItems	: msgNoItems,
						// selected with mouse
						onSelect: function (event) {
							if (obj.type == 'enum') {
								var selected = $(obj.el).data('selected');
								if (event.item) {
									// trigger event
									var eventData = obj.trigger({ phase: 'before', type: 'add', target: obj.el, originalEvent: event.originalEvent, item: event.item });
									if (eventData.isCancelled === true) return;
									// default behavior
									if (selected.length >= options.max && options.max > 0) selected.pop();
									delete event.item.hidden;
									selected.push(event.item);
									$(obj.el).data('selected', selected).change();
									$(obj.helpers.multi).find('input').val('').width(20);
									obj.refresh();
									if ($("#w2ui-overlay").length > 0) $('#w2ui-overlay')[0].hide();
									// event after
									obj.trigger($.extend(eventData, { phase: 'after' }));
								}
							} else {
								$(obj.el).data('selected', event.item).val(event.item.text).change();
								if (obj.helpers.focus) {
									obj.helpers.focus.find('input').val('');
									obj.refresh(); 
								}
							}
						}
					}));
				}
			}
		},

		inRange: function (str) {
			var inRange = false;
			if (this.type == 'date') {
				var dt = w2utils.isDate(str, this.options.format, true);
				if (dt) {
					// enable range
					if (this.options.start || this.options.end) {
						var st = (typeof this.options.start == 'string' ? this.options.start : $(this.options.start).val());
						var en = (typeof this.options.end == 'string' ? this.options.end : $(this.options.end).val());
						var start	= w2utils.isDate(st, this.options.format, true);
						var end		= w2utils.isDate(en, this.options.format, true);
						var current	= new Date(dt);
						if (!start) start = current;
						if (!end) end = current;
						if (current >= start && current <= end) inRange = true;
					} else {
						inRange = true;
					}
					// block predefined dates
					if (this.options.blocked && $.inArray(str, this.options.blocked) != -1) inRange = false;
				}
			}
			if (this.type == 'time') {
				if (this.options.start || this.options.end) {
					var tm  = this.toMin(str);
					var tm1 = this.toMin(this.options.start);
					var tm2 = this.toMin(this.options.end);
					if (!tm1) tm1 = tm;
					if (!tm2) tm2 = tm;
					if (tm >= tm1 && tm <= tm2) inRange = true;
				} else {
					inRange = true;
				}
			}
			return inRange;
		},

		/*
		*  INTERNAL FUNCTIONS
		*/

		checkType: function (ch, loose) {
			var obj = this;
			switch (obj.type) {
				case 'int':
					if (loose && ['-'].indexOf(ch) != -1) return true;
					return w2utils.isInt(ch.replace(obj.options.numberRE, ''));
				case 'percent':
					ch = ch.replace(/%/g, '');
				case 'float':
					if (loose && ['-','.'].indexOf(ch) != -1) return true;
					return w2utils.isFloat(ch.replace(obj.options.numberRE, ''));
				case 'money':
				case 'currency':
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
				if (obj.type === 'clear') return;
				var helper;
				var tmp = $(obj.el).data('tmp') || {};
				if (tmp['old-padding-left']) $(obj.el).css('padding-left', tmp['old-padding-left']);
				tmp['old-padding-left'] = $(obj.el).css('padding-left');
				$(obj.el).data('tmp', tmp);
				if (obj.options.prefix !== '') {
					// remove if already displaed
					if (obj.helpers.prefix) $(obj.helpers.prefix).remove();
					// add fresh
					$(obj.el).before(
						'<div class="w2ui-field-helper">'+
							obj.options.prefix +
						'</div>'
					);
					helper = $(obj.el).prev();
					helper
						.css({
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
						.on('click', function (event) {
							if (obj.options.icon && typeof obj.onIconClick == 'function') {
								// event before
								var eventData = obj.trigger({ phase: 'before', type: 'iconClick', target: obj.el, el: $(this).find('span.w2ui-icon')[0] });
								if (eventData.isCancelled === true) return;
								
								// intentionally empty

								// event after
								obj.trigger($.extend(eventData, { phase: 'after' }));								
							} else {
								if (obj.type == 'list') {
									$(obj.helpers.focus).find('input').focus();
								} else {
									$(obj.el).focus();
								}
							}
						});
					$(obj.el).css('padding-left', (helper.width() + parseInt($(obj.el).css('padding-left'), 10)) + 'px');
					// remember helper
					obj.helpers.prefix = helper;
				}
			}, 1);
		},

		addSuffix: function () {
			var obj = this;
			var helper, pr;
			setTimeout(function () {
				if (obj.type === 'clear') return;
				var tmp = $(obj.el).data('tmp') || {};
				if (tmp['old-padding-right']) $(obj.el).css('padding-right', tmp['old-padding-right']);
				tmp['old-padding-right'] = $(obj.el).css('padding-right');
				$(obj.el).data('tmp', tmp);
				pr = parseInt($(obj.el).css('padding-right'), 10);
				if (obj.options.arrows) {
					// remove if already displaed
					if (obj.helpers.arrows) $(obj.helpers.arrows).remove();
					// add fresh
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
					obj.helpers.arrows = helper;
				}
				if (obj.options.suffix !== '') {
					// remove if already displaed
					if (obj.helpers.suffix) $(obj.helpers.suffix).remove();
					// add fresh
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
						.on('click', function (event) {
							if (obj.type == 'list') {
								$(obj.helpers.focus).find('input').focus();
							} else {
								$(obj.el).focus();
							}
						});

					helper.css('margin-left', '-'+ (w2utils.getSize(helper, 'width') + parseInt($(obj.el).css('margin-right'), 10) + 2) + 'px');
					pr += helper.width() + 3;
					$(obj.el).css('padding-right', pr + 'px');
					// remember helper
					obj.helpers.suffix = helper;
				}
			}, 1);
		},

		addFocus: function () {
			var obj		 = this;
			var options	 = this.options;
			var width	 = 0; // 11 - show search icon, 0 do not show
			if (options.icon) width = 11;
			// clean up & init
			$(obj.helpers.focus).remove();
			// build helper
			var html =
				'<div class="w2ui-field-helper">'+ 
				'	<div class="w2ui-icon icon-search" style="position: absolute; opacity: 0; margin-top: 4px; margin-left: 2px; width: '+ width +'px !important; background-position: left !important;"></div>'+
				'	<input type="text" autocomplete="off">'+
				'<div>';
			$(obj.el).attr('tabindex', -1).before(html);
			var helper = $(obj.el).prev();
			obj.helpers.focus = helper;
			helper.css({
					width			: $(obj.el).width(),
					"margin-top"	: $(obj.el).css('margin-top'),
					"margin-left"	: (parseInt($(obj.el).css('margin-left')) + parseInt($(obj.el).css('padding-left'))) + 'px',
					"margin-bottom"	: $(obj.el).css('margin-bottom'),
					"margin-right"	: $(obj.el).css('margin-right'),
				})
				.find('input')
				.css({
					cursor	: 'default',
					width	: '100%',
					outline	: 'none',
					opacity	: 1,
					margin	: 0,
					border	: '1px solid transparent',
					padding : $(obj.el).css('padding-top'),
					"padding-left"		: 0,
					"margin-left"		: width + (width > 0 ? 6 : 0),
					"background-color"	: 'transparent'
				});
			// INPUT events
			helper.find('input')
				.on('click', function (event) {
					if ($('#w2ui-overlay').length == 0) obj.focus(event);
					event.stopPropagation();
				})
				.on('focus', function (event) {
					$(obj.el).css({ 'outline': 'auto 5px #7DB4F3', 'outline-offset': '-2px' });
					$(this).val('');
					$(obj.el).triggerHandler('focus');
					if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;
				})
				.on('blur', function (event) {
					$(obj.el).css('outline', 'none');
					$(this).val('');
					obj.refresh(); 
					$(obj.el).triggerHandler('blur');
					if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;
				})
				.on('keyup', 	function (event) { obj.keyUp(event) })
				.on('keydown', 	function (event) { obj.keyDown(event) })
				.on('keypress', function (event) { obj.keyPress(event); });
			// MAIN div
			helper.on('click', function (event) { $(this).find('input').focus(); });
			obj.refresh();
		},	

		addMulti: function () {
			var obj		 = this;
			var options	 = this.options;
			// clean up & init
			$(obj.helpers.multi).remove();
			// build helper
			var html   = '';
			var margin =
				'margin-top		: 0px; ' +
				'margin-bottom	: 0px; ' +
				'margin-left	: ' + $(obj.el).css('margin-left') + '; ' +
				'margin-right	: ' + $(obj.el).css('margin-right') + '; '+
				'width			: ' + (w2utils.getSize(obj.el, 'width')
									- parseInt($(obj.el).css('margin-left'), 10)
									- parseInt($(obj.el).css('margin-right'), 10))
									+ 'px;';
			if (obj.type == 'enum') {
				html = 	'<div class="w2ui-field-helper w2ui-list" style="'+ margin + '; box-sizing: border-box">'+
					   	'	<div style="padding: 0px; margin: 0px; margin-right: 20px; display: inline-block">'+
					   	'	<ul>'+
						'		<li style="padding-left: 0px; padding-right: 0px" class="nomouse">'+
						'			<input type="text" style="width: 20px" autocomplete="off" '+ ($(obj.el).attr('readonly') ? 'readonly': '') + '>'+
						'		</li>'
						'	</ul>'+
						'	</div>'+
						'</div>';
			}
			if (obj.type == 'file') {
				html = 	'<div class="w2ui-field-helper w2ui-list" style="'+ margin + '; box-sizing: border-box">'+
					   	'	<div style="padding: 0px; margin: 0px; margin-right: 20px; display: inline-block">'+
					   	'	<ul><li style="padding-left: 0px; padding-right: 0px" class="nomouse"></li></ul>'+
						'	<input class="file-input" type="file" name="attachment" multiple style="display: none" tabindex="-1">'
						'	</div>'+
						'</div>';
			}
			$(obj.el)
				.before(html)
				.css({
					'background-color'	: 'transparent',
					'border-color'		: 'transparent'
				});

			var div	= $(obj.el).prev();
			obj.helpers.multi = div;
			if (obj.type == 'enum') {
				$(obj.el).attr('tabindex', -1);
				// INPUT events
				div.find('input')
					.on('click', function (event) {
						if ($('#w2ui-overlay').length == 0) obj.focus(event);
						$(obj.el).triggerHandler('click');
					})
					.on('focus', function (event) {
						$(div).css({ 'outline': 'auto 5px #7DB4F3', 'outline-offset': '-2px' });
						$(obj.el).triggerHandler('focus');
						if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;
					})
					.on('blur', function (event) {
						$(div).css('outline', 'none');
						$(obj.el).triggerHandler('blur');
						if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;
					})
					.on('keyup', 	function (event) { obj.keyUp(event) })
					.on('keydown', 	function (event) { obj.keyDown(event) })
					.on('keypress', function (event) { div.find('.w2ui-enum-placeholder').remove(); obj.keyPress(event); });
				// MAIN div
				div.on('click', function (event) { $(this).find('input').focus(); });
			}
			if (obj.type == 'file') {
				$(obj.el).css('outline', 'none');
				div.on('click', function (event) {
						$(obj.el).focus();
						if ($(obj.el).attr('readonly')) return;
						obj.blur(event);
						div.find('input').click();
					})
					.on('dragenter', function (event) {
						if ($(obj.el).attr('readonly')) return;
						$(div).addClass('w2ui-file-dragover');
					})
					.on('dragleave', function (event) {
						if ($(obj.el).attr('readonly')) return;
						var tmp = $(event.target).parents('.w2ui-field-helper');
						if (tmp.length == 0) $(div).removeClass('w2ui-file-dragover');
					})
					.on('drop', function (event) {
						if ($(obj.el).attr('readonly')) return;
						$(div).removeClass('w2ui-file-dragover');
						var files = event.originalEvent.dataTransfer.files;
						for (var i=0, l=files.length; i<l; i++) obj.addFile.call(obj, files[i]);
						// cancel to stop browser behaviour
						event.preventDefault();
						event.stopPropagation();
					})
					.on('dragover', function (event) {
						// cancel to stop browser behaviour
						event.preventDefault();
						event.stopPropagation();
					});
				div.find('input')
					.on('click', function (event) {
						event.stopPropagation();
					})
					.on('change', function () {
						if (typeof this.files !== "undefined") {
							for (var i = 0, l = this.files.length; i < l; i++) {
								obj.addFile.call(obj, this.files[i]);
							}
						}
					});
			}
			obj.refresh();
		},	

		addFile: function (file) {
			var obj		 = this;
			var options	 = this.options;
			var selected = $(obj.el).data('selected');
			var newItem  = {
				name		: file.name,
				type		: file.type,
				modified	: file.lastModifiedDate,
				size		: file.size,
				content		: null
			};
			var size = 0;
			var cnt  = 0;
			var err;
			for (var s in selected) { size += selected[s].size; cnt++; }
			// trigger event
			var eventData = obj.trigger({ phase: 'before', type: 'add', target: obj.el, file: newItem, total: cnt, totalSize: size });
			if (eventData.isCancelled === true) return;
			// check params
			if (options.maxFileSize !== 0 && newItem.size > options.maxFileSize) {
				err = 'Maximum file size is '+ w2utils.size(options.maxFileSize);
				if (options.silent === false) $(obj.el).w2tag(err);
				console.log('ERROR: '+ err);
				return;
			}
			if (options.maxSize !== 0 && size + newItem.size > options.maxSize) {
				err = 'Maximum total size is '+ w2utils.size(options.maxSize);
				if (options.silent === false) $(obj.el).w2tag(err);
				console.log('ERROR: '+ err);
				return;
			}
			if (options.max !== 0 && cnt >= options.max) {
				err = 'Maximum number of files is '+ options.max;
				if (options.silent === false) $(obj.el).w2tag(err);
				console.log('ERROR: '+ err);
				return;
			}
			selected.push(newItem);
			// read file as base64
			if (typeof FileReader !== "undefined") {
				var reader = new FileReader();
				// need a closure
				reader.onload = (function () {
					return function (event) {
						var fl  = event.target.result;
						var ind = fl.indexOf(',');
						newItem.content = fl.substr(ind+1);
						obj.refresh();
						$(obj.el).trigger('change');
						// event after
						obj.trigger($.extend(eventData, { phase: 'after' }));
					};
				})();
				reader.readAsDataURL(file);
			} else {
				obj.refresh();
				$(obj.el).trigger('change');
			}
		},

		normMenu: function (menu) {
			if ($.isArray(menu)) {
				for (var m = 0; m < menu.length; m++) {
					if (typeof menu[m] == 'string') {
						menu[m] = { id: menu[m], text: menu[m] };
					} else {
						if (typeof menu[m].text != 'undefined' && typeof menu[m].id == 'undefined') menu[m].id = menu[m].text;
						if (typeof menu[m].text == 'undefined' && typeof menu[m].id != 'undefined') menu[m].text = menu[m].id;
						if (typeof menu[m].caption != 'undefined') menu[m].text = menu[m].caption;
					}
				}
				return menu;
			} else if (typeof menu == 'object') {
				var tmp = []
				for (var m in menu) tmp.push({ id: m, text: menu[m] });
				return tmp;
			}
		},

		getColorHTML: function () {
			var html =  '<div class="w2ui-color">'+
						'<table cellspacing="5">';
			for (var i = 0; i < 8; i++) {
				html += '<tr>';
				for (var j = 0; j < 8; j++) {
					html += '<td>'+
							'	<div class="color" style="background-color: #'+ this.pallete[i][j] +';" name="'+ this.pallete[i][j] +'" index="'+ i + ':' + j +'">'+
							'		'+ ($(this.el).val() == this.pallete[i][j] ? '&#149;' : '&nbsp;')+
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
				if (ci % 7 == 6)  className  = ' w2ui-saturday';
				if (ci % 7 === 0) className  = ' w2ui-sunday';
				if (dt == today)  className += ' w2ui-today';

				var dspDay	 = day;
				var col		 = '';
				var bgcol	 = '';
				var tmp_dt	 = w2utils.formatDate(dt, this.options.format);
				if (this.options.colored && this.options.colored[tmp_dt] !== undefined) { // if there is predefined colors for dates
					tmp		= this.options.colored[tmp_dt].split(':');
					bgcol	= 'background-color: ' + tmp[0] + ';';
					col		= 'color: ' + tmp[1] + ';';
				}
				html += '<td class="'+ (this.inRange(tmp_dt) ? 'w2ui-date ' : 'w2ui-blocked') + className + '" style="'+ col + bgcol + '" date="'+ tmp_dt +'">'+
							dspDay +
						'</td>';
				if (ci % 7 === 0 || (weekDay === 0 && ci == 1)) html += '</tr><tr>';
				day++;
			}
			html += '</tr></table>';
			return html;
		},

		getYearHTML: function () {
			var months	= w2utils.settings.shortmonths;
			var mhtml 	= '';
			var yhtml 	= '';
			for (var m in months) {
				mhtml += '<div class="w2ui-jump-month" name="'+ m +'">'+ months[m] + '</div>';
			}
			for (var y = 1950; y <= 2020; y++) {
				yhtml += '<div class="w2ui-jump-year" name="'+ y +'">'+ y + '</div>'
			}
			return '<div>'+ mhtml +'</div><div>'+ yhtml +'</div>';
		},

		getHourHTML: function () {
			var tmp = [];
			var h24 = (this.options.format == 'h24' ? true : false);
			for (var a=0; a<24; a++) {
				var time = (a >= 12 && !h24 ? a - 12 : a) + ':00' + (!h24 ? (a < 12 ? ' am' : ' pm') : '');
				if (a == 12 && !h24) time = '12:00 pm';
				if (!tmp[Math.floor(a/8)]) tmp[Math.floor(a/8)] = '';
				var tm1 = this.fromMin(this.toMin(time));
				var tm2 = this.fromMin(this.toMin(time) + 59);
				tmp[Math.floor(a/8)] += '<div class="'+ (this.inRange(tm1) || this.inRange(tm2) ? 'w2ui-time ' : 'w2ui-blocked') + '" hour="'+ a +'">'+ time +'</div>';
			}
			var html =
				'<div class="w2ui-calendar-time"><table><tr>'+
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
				var time = (hour > 12 && !h24 ? hour - 12 : hour) + ':' + (a < 10 ? 0 : '') + a + ' ' + (!h24 ? (hour < 12 ? 'am' : 'pm') : '');
				var ind = a < 20 ? 0 : (a < 40 ? 1 : 2);
				if (!tmp[ind]) tmp[ind] = '';
				tmp[ind] += '<div class="'+ (this.inRange(time) ? 'w2ui-time ' : 'w2ui-blocked') + '" min="'+ a +'">'+ time +'</div>';
			}
			var html =
				'<div class="w2ui-calendar-time"><table><tr>'+
				'	<td>'+ tmp[0] +'</td>' +
				'	<td>'+ tmp[1] +'</td>' +
				'	<td>'+ tmp[2] +'</td>' +
				'</tr></table></div>';
			return html;
		},

		toMin: function (str) {
			if (typeof str != 'string') return null;
			var tmp = str.split(':');
			if (tmp.length == 2) {
				tmp[0] = parseInt(tmp[0]);
				tmp[1] = parseInt(tmp[1]);
				if (str.indexOf('pm') != -1 && tmp[0] != 12) tmp[0] += 12;
			} else {
				return null;
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
