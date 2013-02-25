/************************************************************************
*   Library: Web 2.0 UI for jQuery (using prototypical inheritance)
*   - Following objects defined
* 		- w2ui.w2form 	- form widget
*		- $.w2form		- jQuery wrapper
*   - Dependencies: jQuery, w2utils, w2fields, w2tabs
* 
*  == 1.2 changes
*     - focus first elements on the page
*     - added select/list control
* 	  - Added date format for date fields. 
*
************************************************************************/


(function () {
	var w2form = function(options) {
		// public properties
		this.name  	  		= null;
		this.box			= null; 	// HTML element that hold this element
		this.url			= '';
		this.form_url   	= '';		// url where to get form HTML
		this.form_html  	= '';		// form HTML (might be loaded from the url)
		this.page 			= 0;		// current page
		this.recid			= 0;		// can be null or 0
		this.fields 		= [];
		this.actions 		= {};
		this.record			= {};
		this.original   	= {};
		this.postData		= {};
		this.tabs 			= {}; 		// if not empty, then it is tabs object
		this.isLoaded   	= false;
		this.style 			= '';

		// events
		this.onRequest  	= null,
		this.onLoad     	= null,
		this.onSubmit		= null,
		this.onSave			= null,
		this.onChange		= null,
		this.onRender 		= null;
		this.onRefresh		= null;
		this.onResize 		= null;
		this.onDestroy		= null;
		this.onAction		= null; 

		// internal
		this.request_xhr	= null;		// jquery xhr requests		
		this.save_xhr		= null;		

		$.extend(true, this, options);
	};
	
	// ====================================================
	// -- Registers as a jQuery plugin
	
	$.fn.w2form = function(method) {
		if (typeof method === 'object' || !method ) {
			var obj = this;
			// check required parameters
			if (!method || typeof method.name == 'undefined') {
				$.error('The parameter "name" is required but not supplied in $().w2form().');
				return;
			}
			if (typeof w2ui[method.name] != 'undefined') {
				$.error('The parameter "name" is not unique. There are other objects already created with the same name (obj: '+ method.name +').');
				return;			
			}
			// remember items
			var record 		= method.record;
			var original	= method.original;
			var fields 		= method.fields;
			var tabs		= method.tabs;
			// extend items
			var object = new w2form(method);
			$.extend(object, { record: {}, original: {}, fields: [], tabs: {}, handlers: [] });
			if ($.isArray(tabs)) {
				$.extend(true, object.tabs, { tabs: tabs});
			} else {
				$.extend(true, object.tabs, tabs);
			}
			// reassign variables
			for (var p in fields)  	object.fields[p]   	= $.extend(true, {}, fields[p]); 
			for (var p in record) {
				if ($.isPlainObject(record[p])) {
					object.record[p] = $.extend(true, {}, record[p]);
				} else {
					object.record[p] = record[p];
				}
			}
			for (var p in original) {
				if ($.isPlainObject(original[p])) {
					object.original[p] = $.extend(true, {}, original[p]);
				} else {
					object.original[p] = original[p];
				}
			}
			object.initTabs();
			// render if necessary
			if ($(this).length != 0 && !object.form_url) {
				if (!object.form_html) object.form_html = $(this).html();
				object.init(this);
				object.render($(this)[0]);
			} else if (object.form_url) {
				$.get(object.form_url, function (data) {
					object.form_html = data;
					if ($(obj).length != 0) {
						$(obj).html(object.form_html);
						object.init(obj);
						object.render($(obj)[0]);
					}
				});
			}
			// register new object
			w2ui[object.name] = object;
			return object;
		
		} else if (typeof $(this).data('w2name') != 'undefined') {
			var obj = w2ui[$(this).data('w2name')];
			obj[method].apply(obj, Array.prototype.slice.call(arguments, 1));
			return this;
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.w2form' );
		}    
	}		

	// ====================================================
	// -- Implementation of core functionality
	
	w2form.prototype = {

		init: function (el) {
			var obj = this;
			$(el).find('input, textarea, select').each(function (index, el) {
				var type  = 'text';
				var name  = (typeof $(el).attr('name') != 'undefined' ? $(el).attr('name') : $(el).attr('id'));
				if (el.type == 'checkbox')  	type = 'checkbox';
				if (el.type == 'radio')     	type = 'radio';
				if (el.type == 'password')     	type = 'password';
				if (el.type == 'button') 		type = 'button';
				if (el.tagName == 'select') 	type = 'list';
				if (el.tagName == 'textarea')	type = 'textarea';
				var value = (type == 'checkbox' || type == 'radio' ? ($(el).attr('checked') ? true : false) : $(el).val());

				var field = obj.get(name);
				if (field && type != 'button') {
					// find page
					var div = $(el).parents('.w2ui-page');
					if (div.length > 0) {
						for (var i = 0; i < 100; i++) {
							if (div.hasClass('page-'+i)) { field.page = i; break; }
						}
					}
				} else if (type != 'button') {
					console.log('WARNING: Field "'+ name + '" is present in HTML, but not defined in w2form.');
				}
			});
		},

		initTabs: function () {
			// -- if tabs defined
			if (!$.isEmptyObject(this.tabs) && typeof this.tabs['render'] == 'undefined') {
				var obj = this;
				this.tabs = $().w2tabs($.extend({}, this.tabs, { name: this.name +'_tabs' }));
				this.tabs.on('click', function (id, choice) {
					obj.goto(this.getIndex(id));
				});
			}
			return;
		},

		get: function (field) {
			for (var f in this.fields) {
				if (this.fields[f].name == field) return this.fields[f];
			}
			return null;
		},

		set: function (field, obj) {
			for (var f in this.fields) {
				if (this.fields[f].name == field) {
					$.extend(this.fields[f] , obj);
					return true;
				}
			}
			return false;
		},
	
		reload: function (callBack) {
			if (this.url != '') {
				//this.clear();
				this.isLoaded = false;
				this.request(callBack);
			} else {
				this.isLoaded = true;
				this.refresh();
			}
		},

		clear: function () {
			this.record = {};
			// clear all enum fields
			for (var f in this.fields) {
				var field = this.fields[f];
				if (field.selected) delete field.selected;
			}
			$().w2tag();
			this.refresh();
		},
		
		request: function (postData, callBack) { // if (1) param then it is call back if (2) then postData and callBack
			// check for multiple params
			if (typeof postData == 'function') {
				callBack 	= postData;
				postData 	= null;
			}
			if (!$.isPlainObject(postData)) postData = {};
			if (!this.url) return;
			if (this.recid == null || typeof this.recid == 'undefined') this.recid = 0;
			// build parameters list
			var params = {};
			// add list params
			params['cmd']  	 = 'get-record';
			params['name'] 	 = this.name;
			params['recid']  = this.recid;
			// append other params
			$.extend(params, this.postData);
			$.extend(params, postData);
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'request', target: this.name, url: this.url, postData: params });
			if (eventData.stop === true) { if (typeof callBack == 'function') callBack(); return false; }
			// default action
			this.record	  = {};
			this.original = {};
			// call server to get data
			var obj = this;
			this.isLoaded = false;
			this.showStatus('Refreshing ');
			if (this.request_xhr) try { this.request_xhr.abort(); } catch (e) {};
			this.request_xhr = $.ajax({
				type		: 'GET',
				url			: eventData.url + (eventData.url.indexOf('?') > -1 ? '&' : '?') +'t=' + (new Date()).getTime(),
				data		: String($.param(eventData.postData, false)).replace(/%5B/g, '[').replace(/%5D/g, ']'),
				dataType	: 'text',
				complete	: function (xhr, status) {
					obj.hideStatus();
					obj.isLoaded = true;
					// event before
					var eventData = obj.trigger({ phase: 'before', target: obj.name, type: 'load', data: xhr.responseText , xhr: xhr, status: status });	
					if (eventData.stop === true) {
						if (typeof callBack == 'function') callBack();
						return false;
					}
					// default action
					if (xhr['status'] == 403) {
						document.location = 'login.html'
						return;
					}
					if (typeof eventData.data != 'undefined' && eventData.data != '') {
						var data = 'data = '+ eventData.data; 	// $.parseJSON or $.getJSON did not work because it expect perfect JSON data
						var data = eval(data);					//  where everything is in double quotes
						if (data['status'] != 'success') {
							console.log('ERROR: '+ data['message']);
						} else {
							obj.record 	 = $.extend({}, data.record);
							obj.original = $.extend({}, data.record);
						}
					}
					// event after
					obj.trigger($.extend(eventData, { phase: 'after' }));
					obj.refresh();
					// call back
					if (typeof callBack == 'function') callBack();
				}
			});
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		validate: function (showErrors) {
			if (typeof showErrors == 'undefined') showErrors = true;
			// validate before saving
			var errors = [];
			for (var f in this.fields) {
				var field = this.fields[f];
				if (this.record[field.name] == null) this.record[field.name] = '';
				switch (field.type) {
					case 'int':
						if (this.record[field.name] && !w2utils.isInt(this.record[field.name])) {
							var error = { field: field, error: 'Not an integer' };
							errors.push(error);
							if (showErrors) $(field.el).w2tag(error.error, { class: 'w2ui-error' });
						} 
						break;
					case 'float':
						if (this.record[field.name] && !w2utils.isFloat(this.record[field.name])) {
							var error = { field: field, error: 'Not a float number' };
							errors.push(error);
							if (showErrors) $(field.el).w2tag(error.error, { class: 'w2ui-error' });
						} 
						break;
					case 'money':
						if (this.record[field.name] && !w2utils.isMoney(this.record[field.name])) {
							var error = { field: field, error: 'Not in money format' };
							errors.push(error);
							if (showErrors) $(field.el).w2tag(error.error, { class: 'w2ui-error' });
						} 
						break;
					case 'hex':
						if (this.record[field.name] && !w2utils.isHex(this.record[field.name])) {
							var error = { field: field, error: 'Not a hex number' };
							errors.push(error);
							if (showErrors) $(field.el).w2tag(error, { class: 'w2ui-error' });
						} 
						break;
					case 'email':
						if (this.record[field.name] && !w2utils.isEmail(this.record[field.name])) {
							var error = { field: field, error: 'Not a valid email' };
							errors.push(error);
							if (showErrors) $(field.el).w2tag(error.error, { class: 'w2ui-error' });
						} 
						break;
					case 'checkbox':
						// convert true/false
						if (this.record[field.name] == true) this.record[field.name] = 1; else this.record[field.name] = 0; 
						break;
					case 'date':
						// format date before submit
						if (this.record[field.name] && !w2utils.isDate(this.record[field.name], field.options.format)) {
							var error = { field: field, error: 'Not a valid date: '+ field.options.format };
							errors.push(error);
							if (showErrors) $(field.el).w2tag(error.error, { class: 'w2ui-error' });
						} else {
							// convert to universal timestamp with time zone
							//var d = new Date(this.record[field.name]);
							//var tz = (d.getTimezoneOffset() > 0 ? '+' : '-') + Math.floor(d.getTimezoneOffset()/60) + ':' + (d.getTimezoneOffset() % 60);
							//this.record[field.name] = d.getFullYear() + '-' + (d.getMonth()+1) + '-' + d.getDate() + ' '
							//	+ d.getHours() + ':' + d.getSeconds() + ':' + d.getMilliseconds() + tz;
							//this.record[field.name + '_unix'] = Math.round(d.getTime() / 1000);
							//this.record[field.name] = w2utils.formatDate(this.record[field.name], 'mm/dd/yyyy');
						}
						break;
					case 'select':
					case 'list':
						break;
					case 'enum':
						var sel = $(field.el).data('selected');
						if (!$.isArray(sel)) sel = [];
						switch (sel.length) {
							case 0:
								this.record[field.name] = '';
								break;
							case 1: 
								this.record[field.name] = sel[0].id;
								break;
							default:
								this.record[field.name] = [];
								for (var s in sel) {
									this.record[field.name].push(sel[s].id);
								}
								break;
						}
						break;
				}
				// check required
				if (field.required && !this.record[field.name]) {
					var error = { field: field, error: 'Required field' };
					errors.push(error);
					if (showErrors) $(field.el).w2tag(error.error, { class: 'w2ui-error' });
				}					
			}
			return errors;
		},

		save: function (postData, callBack) {
			var obj = this;
			// check for multiple params
			if (typeof postData == 'function') {
				callBack 	= postData;
				postData 	= null;
			}
			// validation
			var errors = this.validate(true);
			if (errors.length !== 0) {
				this.goto(errors[0].field.page);
				return;
			}
			// submit save
			if (typeof postData == 'undefined' || postData == null) postData = {};
			if (!this.url) return;
			this.showStatus('Saving...');
			// build parameters list
			var params = {};
			// add list params
			params['cmd']  	 = 'save-record';
			params['name'] 	 = this.name;
			params['recid']  = this.recid;
			// append other params
			$.extend(params, this.postData);
			$.extend(params, postData);
			params.record = $.extend(true, {}, this.record);
			// convert  before submitting 
			for (var f in this.fields) {
				var field = this.fields[f];
				switch (String(field.type).toLowerCase()) {
					case 'date': // to yyyy-mm-dd format
						var dt = params.record[field.name];
						if (field.options.format.toLowerCase() == 'dd/mm/yyyy' || field.options.format.toLowerCase() == 'dd-mm-yyyy') {
							var tmp = dt.replace(/-/g, '/').split('/');
							var dt  = new Date(tmp[2] + '-' + tmp[1] + '-' + tmp[0]);
						}
						params.record[field.name] = w2utils.formatDate(dt, 'yyyy-mm-dd');
						break;
				}
			}
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'submit', target: this.name, url: this.url, postData: params });
			if (eventData.stop === true) { if (typeof callBack == 'function') callBack(); return false; }
			// default action
			if (this.save_xhr) try { this.save_xhr.abort(); } catch (e) {};
			this.save_xhr = $.ajax({
				type		: (this.recid == 0 ? 'POST' : 'PUT'),
				url			: eventData.url + (eventData.url.indexOf('?') > -1 ? '&' : '?') +'t=' + (new Date()).getTime(),
				data		: String($.param(eventData.postData, false)).replace(/%5B/g, '[').replace(/%5D/g, ']'),
				dataType	: 'text',
				complete	: function (xhr, status) {
					obj.hideStatus();
					// event before
					var eventData = obj.trigger({ phase: 'before', target: obj.name, type: 'save', data: xhr.responseText , xhr: xhr, status: status });	
					if (eventData.stop === true) {
						if (typeof callBack == 'function') callBack();
						return false;
					}
					// default action
					if (xhr['status'] == 403) {
						document.location = 'login.html'
						return;
					}
					try {
						if (typeof eventData.data != 'undefined' && eventData.data != '' && $.parseJSON(eventData.data) !== false) {
							var data = 'data = '+ eventData.data; 	// $.parseJSON or $.getJSON did not work because it expect perfect JSON data
							var data = eval(data);					//  where everything is in double quotes
							if (data['status'] != 'success') {
								console.log('ERROR: '+ data['message']);
							} else {
								// reset original
								obj.original = $.extend({}, obj.record);
							}
						}
					} catch (e) {
						var data = {};
						data['status']  = 'error';
						data['message'] = 'Server did not return JSON structure.';
					}
					// event after
					obj.trigger($.extend(eventData, { phase: 'after' }));
					obj.refresh();
					// call back
					if (typeof callBack == 'function') callBack(data);
				}
			});
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		showStatus: function (status) {

		},

		hideStatus: function (status) {

		},

		doAction: function (action, event) {
			// event before
			var eventData = this.trigger({ phase: 'before', target: action, type: 'action', event: event });	
			if (eventData.stop === true) return false;
			// default actions
			if (typeof (this.actions[action]) == 'function') {
				this.actions[action].call(this, event);
			}
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		resize: function (width, height) {
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'resize', width: width, height: height });	
			if (eventData.stop === true) return false;

			// does nothing, needed for compatibility

			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		goto: function (page) {
			if (typeof page != 'undefined') this.page = page;
			this.refresh();
		},

		refresh: function () {
			var obj = this;
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'refresh', page: this.page })
			if (eventData.stop === true) return false;
			// default action
			$(this.box).find('.w2ui-page').hide();
			$(this.box).find('.w2ui-page.page-' + this.page).show();
			// refresh tabs if needed
			if (typeof this.tabs == 'object' && typeof this.tabs.refresh == 'function') {
				$('#form_'+ this.name +'_tabs').show();
				this.tabs.active = this.tabs.tabs[this.page].id;
				this.tabs.refresh();
			} else {
				$('#form_'+ this.name +'_tabs').hide();
			}			
			// refresh values of all fields
			for (var f in this.fields) {
				var field = this.fields[f];
				field.el = $(this.box).find('[name="'+ field.name +'"]')[0];
				if (typeof field.el == 'undefined') {
					console.log('ERROR: Cannot associate field "'+ field.name + '" with html control. Make sure html control exists with the same name.');
					return;
				}
				field.el.id = field.name;
				$(field.el).off('change').on('change', function () {
					var value_new 		= this.value;
					var value_previous 	= obj.record[this.name] ? obj.record[this.name] : '';
					if ($(this).data('selected')) {
						var new_arr = $(this).data('selected');
						var cur_arr = obj.get(this.name).selected;
						var value_new = [];
						var value_previous = [];
						if ($.isArray(new_arr)) for (var i in new_arr) value_new[i] = $.extend(true, {}, new_arr[i]); // clone array
						if ($.isArray(cur_arr)) for (var i in cur_arr) value_previous[i] = $.extend(true, {}, cur_arr[i]); // clone array
						obj.get(this.name).selected = value_new;
					}
					// event before
					var eventData = obj.trigger({ phase: 'before', target: this.name, type: 'change', value_new: value_new, value_previous: value_previous });
					if (eventData.stop === true) { 
						$(this).val(obj.record[this.name]); // return previous value
						return false;
					}
					// default action 
					var val = this.value;
					if (this.type == 'checkbox') val = this.checked ? true : false;
					if (this.type == 'radio')    val = this.checked ? true : false;
					//if (this.type == 'password') val = this.checked ? true : false;							
					obj.record[this.name] = val;
					// event after
					obj.trigger($.extend(eventData, { phase: 'after' }));
				});
				if (field.required) {
					$(field.el).parent().addClass('w2ui-required');
				} else {
					$(field.el).parent().removeClass('w2ui-required');
				}
			}
			// attach actions on buttons
			$(this.box).find('button, input[type=button]').each(function (index, el) {
				$(el).off('click').on('click', function (event) {
					var action = this.value;
					if (this.name) 	action = this.name;
					if (this.id) 	action = this.id;
					obj.doAction(action, event);
				});
			});
			// init controls with record
			for (var f in this.fields) {
				var field = this.fields[f];
				var value = (typeof this.record[field.name] != 'undefined' ? this.record[field.name] : '');

				switch (String(field.type).toLowerCase()) {
					case 'email':
					case 'text':
						field.el.value = value;
						break;
					case 'date':
						if (!field.options) field.options = {};
						if (!field.options.format) field.options.format = 'mm/dd/yyyy';
						if (field.options.format.toLowerCase() == 'dd/mm/yyyy' || field.options.format.toLowerCase() == 'dd-mm-yyyy') {
							var tmp = value.replace(/-/g, '/').split('/');
							field.el.value = w2utils.formatDate(tmp[2]+'-'+tmp[1]+'-'+tmp[0], field.options.format);
						} else {
							field.el.value = w2utils.formatDate(value, field.options.format);
						}
						this.record[field.name] = field.el.value;
						$(field.el).w2field($.extend({}, field.options, { type: 'date' }));
						break;
					case 'int':
						field.el.value = value;
						$(field.el).w2field('int');
						break;
					case 'float':
						field.el.value = value;
						$(field.el).w2field('float');
						break;
					case 'money':
						field.el.value = value;
						$(field.el).w2field('money');
						break;
					case 'hex':
						field.el.value = value;
						$(field.el).w2field('hex');
						break;
					case 'alphanumeric':
						field.el.value = value;
						$(field.el).w2field('alphaNumeric');
						break;
					case 'checkbox':
						if (this.record[field.name] == true || this.record[field.name] == 1 || this.record[field.name] == 't') {
							$(field.el).attr('checked', true);
						} else {
							$(field.el).removeAttr('checked');
						}
						break;
					case 'password':
						// hide passwords
						field.el.value = value;
						break;
					case 'select':
					case 'list':
						var options = '<option value="">- not selected -</option>';
						for (var o in field.options.items) {
							var opt  = field.options.items[o];
							var id   = '';
							var text = '';
							if (typeof opt == 'string') {
								id   = opt;
								text = opt;
							}
							if (typeof opt == 'object' || opt.id)    id = opt.id;
							if (typeof opt == 'object' || opt.value) id = opt.value;
							if (typeof opt == 'object' || opt.text)  text = opt.text;
							if (typeof opt == 'object' || opt.txt)   text = opt.txt;
							options += '<option value="'+ id +'">'+ text + '</option>';
						}
						$(field.el).html(options);
						$(field.el).val(this.record[field.name]);
						break;
					case 'enum':
						if (typeof field.options == 'undefined' || (typeof field.options.url == 'undefined' && typeof field.options.items == 'undefined')) {
							console.log("ERROR: (w2form."+ obj.name +") the field "+ field.name +" defined as enum but not field.options.url or field.options.items provided.");
							break;
						}
						var v = value;
						if (field.selected) v = field.selected;
						$(field.el).w2field( $.extend({}, field.options, { type: 'enum', selected: v }) );
						break;
					default:
						console.log('ERROR: field type "'+ field.type +'" is not recognized.');
						break;						
				}
			}
			var inputs = $(this.box).find('input, select')
			if (inputs.length > 0) inputs[0].focus();
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		render: function (box) {
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'render', box: (typeof box != 'undefined' ? box : this.box) });	
			if (eventData.stop === true) return false;
			// default actions
			if (typeof box != 'undefined') this.box = box;
			var html = '<div id="form_'+ this.name +'_tabs" class="w2ui-form-tabs"></div>' + this.form_html;
			$(this.box).html(html).addClass('w2ui-reset w2ui-form');
			if ($(this.box).length > 0) $(this.box)[0].style.cssText += this.style;
			// init tabs
			this.initTabs();
			if (typeof this.tabs == 'object' && typeof this.tabs.render == 'function') {
				this.tabs.render($('#form_'+ this.name +'_tabs')[0]);
			}
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			// after render actions
			if (this.url != '' && this.recid != 0) this.request(); else this.refresh();
		},

		destroy: function () { 
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'destroy' });	
			if (eventData.stop === true) return false;
			// clean up
			if (typeof this.tabs == 'object' && this.tabs.destroy) this.tabs.destroy();
			$(this.box).html('');
			delete w2ui[this.name];
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},
	}
	
	$.extend(w2form.prototype, $.w2event);
})();
