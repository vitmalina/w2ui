/************************************************************************
*   Library: Web 2.0 UI for jQuery (using prototypical inheritance)
*   - Following objects defined
* 		- w2form 		- form widget
*		- $().w2form	- jQuery wrapper
*   - Dependencies: jQuery, w2utils, w2fields, w2tabs, w2toolbar, w2alert
*
* == NICE TO HAVE ==
*	- refresh(field) - would refresh only one field
* 	- include delta on save
*	- create an example how to do cascadic dropdown
*	- form should read <select> <options> into items
* 	- two way data bindings
* 	- verify validation of fields
*	- when field is blank, set record.field = null
*
* == 1.4 Changes ==
*	- refactored for the new fields
*	- added getChanges() - not complete
*
************************************************************************/


(function () {
	var w2form = function(options) {
		// public properties
		this.name  	  		= null;
		this.header 		= '';
		this.box			= null; 	// HTML element that hold this element
		this.url			= '';
		this.formURL		= '';		// url where to get form HTML
		this.formHTML   	= '';		// form HTML (might be loaded from the url)
		this.page 			= 0;		// current page
		this.recid			= 0;		// can be null or 0
		this.fields 		= [];
		this.actions 		= {};
		this.record			= {};
		this.original   	= {};
		this.postData		= {};
		this.toolbar		= {};		// if not empty, then it is toolbar
		this.tabs 			= {}; 		// if not empty, then it is tabs object

		this.style 			= '';
		this.focus			= 0;		// focus first or other element
		this.msgNotJSON 	= w2utils.lang('Return data is not in JSON format.');
		this.msgAJAXerror   = w2utils.lang('AJAX error. See console for more details.');
		this.msgRefresh		= w2utils.lang('Refreshing...');
		this.msgSaving		= w2utils.lang('Saving...');

		// events
		this.onRequest  	= null;
		this.onLoad 		= null;
		this.onValidate		= null;
		this.onSubmit		= null;
		this.onSave			= null;
		this.onChange		= null;
		this.onRender 		= null;
		this.onRefresh		= null;
		this.onResize 		= null;
		this.onDestroy		= null;
		this.onAction		= null;
		this.onToolbar 		= null;
		this.onError		= null;

		// internal
		this.isGenerated	= false;
		this.last = {
			xhr	: null		// jquery xhr requests
		}

		$.extend(true, this, w2obj.form, options);
	};

	// ====================================================
	// -- Registers as a jQuery plugin

	$.fn.w2form = function(method) {
		if (typeof method === 'object' || !method ) {
			var obj = this;
			// check name parameter
			if (!w2utils.checkName(method, 'w2form')) return;
			// remember items
			var record 		= method.record;
			var original	= method.original;
			var fields 		= method.fields;
			var toolbar		= method.toolbar;
			var tabs		= method.tabs;
			// extend items
			var object = new w2form(method);
			$.extend(object, { record: {}, original: {}, fields: [], tabs: {}, toolbar: {}, handlers: [] });
			if ($.isArray(tabs)) {
				$.extend(true, object.tabs, { tabs: [] });
				for (var t in tabs) {
					var tmp = tabs[t];
					if (typeof tmp === 'object') object.tabs.tabs.push(tmp); else object.tabs.tabs.push({ id: tmp, caption: tmp });
				}
			} else {
				$.extend(true, object.tabs, tabs);
			}
			$.extend(true, object.toolbar, toolbar);
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
			if (obj.length > 0) object.box = obj[0];
			// render if necessary
			if (object.formURL != '') {
				$.get(object.formURL, function (data) {
					object.formHTML = data;
					object.isGenerated = true;
					if ($(object.box).length != 0 || data.length != 0) {
						$(object.box).html(data);
						object.render(object.box);
					}
				});
			} else if (object.formHTML != '') {
				// it is already loaded into formHTML
			} else if ($(this).length != 0 && $.trim($(this).html()) != '') {
				object.formHTML = $(this).html();
			}  else { // try to generate it
				object.formHTML = object.generateHTML();
			}
			// register new object
			w2ui[object.name] = object;
			// render if not loaded from url
			if (object.formURL == '') {
				if (String(object.formHTML).indexOf('w2ui-page') == -1) {
					object.formHTML = '<div class="w2ui-page page-0">'+ object.formHTML +'</div>';
				}
				$(object.box).html(object.formHTML);
				object.isGenerated = true;
				object.render(object.box);
			}
			return object;

		} else if (w2ui[$(this).attr('name')]) {
			var obj = w2ui[$(this).attr('name')];
			obj[method].apply(obj, Array.prototype.slice.call(arguments, 1));
			return this;
		} else {
			console.log('ERROR: Method ' +  method + ' does not exist on jQuery.w2form');
		}
	};

	// ====================================================
	// -- Implementation of core functionality

	w2form.prototype = {

		get: function (field, returnIndex) {
			for (var f in this.fields) {
				if (this.fields[f].name == field) {
					if (returnIndex === true) return f; else return this.fields[f];
				}
			}
			return null;
		},

		set: function (field, obj) {
			for (var f in this.fields) {
				if (this.fields[f].name == field) {
					$.extend(this.fields[f] , obj);
					this.refresh();
					return true;
				}
			}
			return false;
		},

		reload: function (callBack) {
			var url = (typeof this.url != 'object' ? this.url : this.url.get);
			if (url && this.recid != 0) {
				//this.clear();
				this.request(callBack);
			} else {
				this.refresh();
				if (typeof callBack == 'function') callBack();
			}
		},

		clear: function () {
			this.recid  = 0;
			this.record = {};
			$().w2tag();
			this.refresh();
		},

		error: function (msg) {
			var obj = this;
			// let the management of the error outside of the grid
			var eventData = this.trigger({ target: this.name, type: 'error', message: msg , xhr: this.last.xhr });
			if (eventData.isCancelled === true) {
				if (typeof callBack == 'function') callBack();
				return;
			}
			// need a time out because message might be already up)
			setTimeout(function () { w2alert(msg, 'Error');	}, 1);
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		validate: function (showErrors) {
			if (typeof showErrors == 'undefined') showErrors = true;
			$().w2tag(); // hide all tags before validating
			// validate before saving
			var errors = [];
			for (var f in this.fields) {
				var field = this.fields[f];
				if (this.record[field.name] == null) this.record[field.name] = '';
				switch (field.type) {
					case 'int':
						if (this.record[field.name] && !w2utils.isInt(this.record[field.name])) {
							errors.push({ field: field, error: w2utils.lang('Not an integer') });
						}
						break;
					case 'float':
						if (this.record[field.name] && !w2utils.isFloat(this.record[field.name])) {
							errors.push({ field: field, error: w2utils.lang('Not a float') });
						}
						break;
					case 'money':
						if (this.record[field.name] && !w2utils.isMoney(this.record[field.name])) {
							errors.push({ field: field, error: w2utils.lang('Not in money format') });
						}
						break;
					case 'color':
					case 'hex':
						if (this.record[field.name] && !w2utils.isHex(this.record[field.name])) {
							errors.push({ field: field, error: w2utils.lang('Not a hex number') });
						}
						break;
					case 'email':
						if (this.record[field.name] && !w2utils.isEmail(this.record[field.name])) {
							errors.push({ field: field, error: w2utils.lang('Not a valid email') });
						}
						break;
					case 'checkbox':
						// convert true/false
						if (this.record[field.name] == true) this.record[field.name] = 1; else this.record[field.name] = 0;
						break;
					case 'date':
						// format date before submit
						if (this.record[field.name] && !w2utils.isDate(this.record[field.name], field.options.format)) {
							errors.push({ field: field, error: w2utils.lang('Not a valid date') + ': ' + field.options.format });
						} else {
						}
						break;
					case 'list':
					case 'combo':
						break;
					case 'enum':
						break;
				}
				// === check required - if field is '0' it should be considered not empty
				var val = this.record[field.name];
				if ( field.required && (val === '' || ($.isArray(val) && val.length == 0)) ) {
					errors.push({ field: field, error: w2utils.lang('Required field') });
				}
				if ( field.equalto && this.record[field.name]!=this.record[field.equalto] ) {
					errors.push({ field: field, error: w2utils.lang('Field should be equal to ')+field.equalto });
				}
			}
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'validate', errors: errors });
			if (eventData.isCancelled === true) return;
			// show error
			if (showErrors) for (var e in eventData.errors) {
				var err = eventData.errors[e];
				if (err.field.type == 'radio') { // for radio and checkboxes
					$($(err.field.el).parents('div')[0]).w2tag(err.error, { "class": 'w2ui-error' });
				} else if (['enum', 'file'].indexOf(err.field.type) != -1) {
					(function (err) {
						setTimeout(function () {
							var fld = $(err.field.el).data('w2field').helpers.multi;
							$(err.field.el).w2tag(err.error);
							$(fld).addClass('w2ui-error');
						}, 1);
					})(err);
				} else {
					$(err.field.el).w2tag(err.error, { "class": 'w2ui-error' });
				}
			}
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			return errors;
		},

		getChanges: function () {
			var differ = function(record, original, result) {
				for (var i in record) {
					if (typeof record[i] == "object") {
						result[i] = differ(record[i], original[i] || {}, {});
						if (!result[i] || $.isEmptyObject(result[i])) delete result[i];
					} else if (record[i] != original[i]) {
						result[i] = record[i];
					}
				}
				return result;
			}
			return differ(this.record, this.original, {});
		},

		request: function (postData, callBack) { // if (1) param then it is call back if (2) then postData and callBack
			var obj = this;
			// check for multiple params
			if (typeof postData == 'function') {
				callBack 	= postData;
				postData 	= null;
			}
			if (typeof postData == 'undefined' || postData == null) postData = {};
			if (!this.url || (typeof this.url == 'object' && !this.url.get)) return;
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
			if (eventData.isCancelled === true) { if (typeof callBack == 'function') callBack({ status: 'error', message: 'Request aborted.' }); return; }
			// default action
			this.record	  = {};
			this.original = {};
			// call server to get data
			this.lock(this.msgRefresh);
			var url = eventData.url;
			if (typeof eventData.url == 'object' && eventData.url.get) url = eventData.url.get;
			if (this.last.xhr) try { this.last.xhr.abort(); } catch (e) {};
			this.last.xhr = $.ajax({
				type		: 'GET',
				url			: url,
				data		: String($.param(eventData.postData, false)).replace(/%5B/g, '[').replace(/%5D/g, ']'),
				dataType	: 'text',
				complete	: function (xhr, status) {
					obj.unlock();
					// event before
					var eventData = obj.trigger({ phase: 'before', target: obj.name, type: 'load', xhr: xhr, status: status });
					if (eventData.isCancelled === true) {
						if (typeof callBack == 'function') callBack({ status: 'error', message: 'Request aborted.' });
						return;
					}
					// parse server response
					var data;
					var responseText = obj.last.xhr.responseText;
					if (status != 'error') {
						// default action
						if (typeof responseText != 'undefined' && responseText != '') {
							// check if the onLoad handler has not already parsed the data
							if (typeof responseText == "object") {
								data = responseText;
							} else {
								// $.parseJSON or $.getJSON did not work because those expect perfect JSON data - where everything is in double quotes
								//
								// TODO: avoid (potentially malicious) code injection from the response.
								try { eval('data = '+ responseText); } catch (e) { }
							}
							if (typeof data == 'undefined') {
								data = {
									status		 : 'error',
									message		 : obj.msgNotJSON,
									responseText : responseText
								}
							}
							if (data['status'] == 'error') {
								obj.error(data['message']);
							} else {
								obj.record 	 = $.extend({}, data.record);
								obj.original = $.extend({}, data.record);
							}
						}
					} else {
						obj.error('AJAX Error ' + xhr.status + ': '+ xhr.statusText);
						data = {
							status		 : 'error',
							message		 : obj.msgAJAXerror,
							responseText : responseText
						};
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

		submit: function (postData, callBack) {
			return this.save(postData, callBack);
		},

		save: function (postData, callBack) {
			var obj = this;
			$(this.box).find(':focus').change(); // trigger onchange
			// check for multiple params
			if (typeof postData == 'function') {
				callBack 	= postData;
				postData 	= null;
			}
			// validation
			var errors = obj.validate(true);
			if (errors.length !== 0) {
				obj.goto(errors[0].field.page);
				return;
			}
			// submit save
			if (typeof postData == 'undefined' || postData == null) postData = {};
			if (!obj.url || (typeof obj.url == 'object' && !obj.url.save)) {
				console.log("ERROR: Form cannot be saved because no url is defined.");
				return;
			}
			obj.lock(obj.msgSaving + ' <span id="'+ obj.name +'_progress"></span>');
			// need timer to allow to lock
			setTimeout(function () {
				// build parameters list
				var params = {};
				// add list params
				params['cmd']  	 = 'save-record';
				params['name'] 	 = obj.name;
				params['recid']  = obj.recid;
				// append other params
				$.extend(params, obj.postData);
				$.extend(params, postData);
				params.record = $.extend(true, {}, obj.record);
				// event before
				var eventData = obj.trigger({ phase: 'before', type: 'submit', target: obj.name, url: obj.url, postData: params });
				if (eventData.isCancelled === true) {
					if (typeof callBack == 'function') callBack({ status: 'error', message: 'Saving aborted.' });
					return;
				}
				// default action
				var url = eventData.url;
				if (typeof eventData.url == 'object' && eventData.url.save) url = eventData.url.save;
				if (obj.last.xhr) try { obj.last.xhr.abort(); } catch (e) {};
				obj.last.xhr = $.ajax({
					type		: (w2utils.settings.RESTfull ? (obj.recid == 0 ? 'POST' : 'PUT') : 'POST'),
					url			: url,
					data		: String($.param(eventData.postData, false)).replace(/%5B/g, '[').replace(/%5D/g, ']'),
					dataType	: 'text',
					xhr	: function() {
						var xhr = new window.XMLHttpRequest();
						// upload
						xhr.upload.addEventListener("progress", function(evt) {
							if (evt.lengthComputable) {
								var percent = Math.round(evt.loaded / evt.total * 100);
								$('#'+ obj.name + '_progress').text(''+ percent + '%');
							}
						}, false);
						return xhr;
					},
					complete : function (xhr, status) {
						obj.unlock();

						// event before
						var eventData = obj.trigger({ phase: 'before', target: obj.name, type: 'save', xhr: xhr, status: status });
						if (eventData.isCancelled === true) {
							if (typeof callBack == 'function') callBack({ status: 'error', message: 'Saving aborted.' });
							return;
						}
						// parse server response
						var data;
						var responseText = xhr.responseText;
						if (status != 'error') {
							// default action
							if (typeof responseText != 'undefined' && responseText != '') {
								// check if the onLoad handler has not already parsed the data
								if (typeof responseText == "object") {
									data = responseText;
								} else {
									// $.parseJSON or $.getJSON did not work because those expect perfect JSON data - where everything is in double quotes
									//
									// TODO: avoid (potentially malicious) code injection from the response.
									try { eval('data = '+ responseText); } catch (e) { }
								}
								if (typeof data == 'undefined') {
									data = {
										status		 : 'error',
										message		 : obj.msgNotJSON,
										responseText : responseText
									}
								}
								if (data['status'] == 'error') {
									obj.error(data['message']);
								} else {
									obj.original = $.extend({}, obj.record);
								}
							}
						} else {
							obj.error('AJAX Error ' + xhr.status + ': '+ xhr.statusText);
							data = {
								status		 : 'error',
								message		 : obj.msgAJAXerror,
								responseText : responseText
							};
						}
						// event after
						obj.trigger($.extend(eventData, { phase: 'after' }));
						obj.refresh();
						// call back
						if (typeof callBack == 'function') callBack(data);
					}
				});
				// event after
				obj.trigger($.extend(eventData, { phase: 'after' }));
			}, 50);
		},

		lock: function (msg, showSpinner) {
			var box = $(this.box).find('> div:first-child');
			var args = Array.prototype.slice.call(arguments, 0);
			args.unshift(box);
			w2utils.lock.apply(window, args);
		},

		unlock: function () {
			var obj = this;
			setTimeout(function () { w2utils.unlock(obj.box); }, 25); // needed timer so if server fast, it will not flash
		},

		goto: function (page) {
			if (typeof page != 'undefined') this.page = page;
			// if it was auto size, resize it
			if ($(this.box).data('auto-size') === true) $(this.box).height(0);
			this.refresh();
		},

		generateHTML: function () {
			var pages = []; // array for each page
			for (var f in this.fields) {
				var html = '';
				var field = this.fields[f];
				if (typeof field.html == 'undefined') field.html = {};
				field.html = $.extend(true, { caption: '', span: 6, attr: '', text: '', page: 0 }, field.html);
				if (field.html.caption == '') field.html.caption = field.name;
				var input = '<input name="'+ field.name +'" type="text" '+ field.html.attr +'/>';
				// if (field.type == 'list') input = '<select name="'+ field.name +'" '+ field.html.attr +'></select>';
				if ((field.type === 'pass') || (field.type === 'password')){
					input = '<input name="' + field.name + '" type = "password" ' + field.html.attr + '/>';
				}
				if (field.type == 'checkbox') input = '<input name="'+ field.name +'" type="checkbox" '+ field.html.attr +'/>';
				if (field.type == 'textarea') input = '<textarea name="'+ field.name +'" '+ field.html.attr +'></textarea>';
				html += '\n   <div class="w2ui-label '+ (typeof field.html.span != 'undefined' ? 'w2ui-span'+ field.html.span : '') +'">'+ field.html.caption +':</div>'+
						'\n   <div class="w2ui-field '+ (typeof field.html.span != 'undefined' ? 'w2ui-span'+ field.html.span : '') +'">'+
								input + field.html.text +
						'</div>';
				if (typeof pages[field.html.page] == 'undefined') pages[field.html.page] = '<div class="w2ui-page page-'+ field.html.page +'">';
				pages[field.html.page] += html;
			}
			for (var p in pages) pages[p] += '\n</div>';
			// buttons if any
			var buttons = '';
			if (!$.isEmptyObject(this.actions)) {
				buttons += '\n<div class="w2ui-buttons">';
				for (var a in this.actions) {
					buttons += '\n	<button name="'+ a +'" class="btn">'+ a + '</button>';
				}
				buttons += '\n</div>';
			}
			return pages.join('') + buttons;
		},

		action: function (action, event) {
			// event before
			var eventData = this.trigger({ phase: 'before', target: action, type: 'action', originalEvent: event });
			if (eventData.isCancelled === true) return;
			// default actions
			if (typeof (this.actions[action]) == 'function') {
				this.actions[action].call(this, event);
			}
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		resize: function () {
			var obj = this;
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'resize' });
			if (eventData.isCancelled === true) return;
			// default behaviour
			var main 	= $(this.box).find('> div');
			var header	= $(this.box).find('> div .w2ui-form-header');
			var toolbar	= $(this.box).find('> div .w2ui-form-toolbar');
			var tabs	= $(this.box).find('> div .w2ui-form-tabs');
			var page	= $(this.box).find('> div .w2ui-page');
			var cpage	= $(this.box).find('> div .w2ui-page.page-'+ this.page);
			var dpage	= $(this.box).find('> div .w2ui-page.page-'+ this.page + ' > div');
			var buttons	= $(this.box).find('> div .w2ui-buttons');
			// if no height, calculate it
			resizeElements();
			if (parseInt($(this.box).height()) == 0 || $(this.box).data('auto-size') === true) {
				$(this.box).height(
					(header.length > 0 ? w2utils.getSize(header, 'height') : 0) +
					((typeof this.tabs === 'object' && $.isArray(this.tabs.tabs) && this.tabs.tabs.length > 0) ? w2utils.getSize(tabs, 'height') : 0) +
					((typeof this.toolbar == 'object' && $.isArray(this.toolbar.items) && this.toolbar.items.length > 0) ? w2utils.getSize(toolbar, 'height') : 0) +
					(page.length > 0 ? w2utils.getSize(dpage, 'height') + w2utils.getSize(cpage, '+height') + 12 : 0) +  // why 12 ???
					(buttons.length > 0 ? w2utils.getSize(buttons, 'height') : 0)
				);
				$(this.box).data('auto-size', true);
			}
			resizeElements();
			// event after
			obj.trigger($.extend(eventData, { phase: 'after' }));

			function resizeElements() {
				// resize elements
				main.width($(obj.box).width()).height($(obj.box).height());
				toolbar.css('top', (obj.header != '' ? w2utils.getSize(header, 'height') : 0));
				tabs.css('top', (obj.header != '' ? w2utils.getSize(header, 'height') : 0)
							  + ((typeof obj.toolbar == 'object' && $.isArray(obj.toolbar.items) && obj.toolbar.items.length > 0) ? w2utils.getSize(toolbar, 'height') : 0));
				page.css('top', (obj.header != '' ? w2utils.getSize(header, 'height') : 0)
							  + ((typeof obj.toolbar == 'object' && $.isArray(obj.toolbar.items) && obj.toolbar.items.length > 0) ? w2utils.getSize(toolbar, 'height') + 5 : 0)
							  + ((typeof obj.tabs === 'object' && $.isArray(obj.tabs.tabs) && obj.tabs.tabs.length > 0) ? w2utils.getSize(tabs, 'height') + 5 : 0));
				page.css('bottom', (buttons.length > 0 ? w2utils.getSize(buttons, 'height') : 0));
			}
		},

		refresh: function () {
			var time = (new Date()).getTime();
			var obj = this;
			if (!this.box) return;
			if (!this.isGenerated || typeof $(this.box).html() == 'undefined') return;
			// update what page field belongs
			$(this.box).find('input, textarea, select').each(function (index, el) {
				var name  = (typeof $(el).attr('name') != 'undefined' ? $(el).attr('name') : $(el).attr('id'));
				var field = obj.get(name);
				if (field) {
					// find page
					var div = $(el).parents('.w2ui-page');
					if (div.length > 0) {
						for (var i = 0; i < 100; i++) {
							if (div.hasClass('page-'+i)) { field.page = i; break; }
						}
					}
				}
			});
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'refresh', page: this.page })
			if (eventData.isCancelled === true) return;
			// default action
			$(this.box).find('.w2ui-page').hide();
			$(this.box).find('.w2ui-page.page-' + this.page).show();
			$(this.box).find('.w2ui-form-header').html(this.header);
			// refresh tabs if needed
			if (typeof this.tabs === 'object' && $.isArray(this.tabs.tabs) && this.tabs.tabs.length > 0) {
				$('#form_'+ this.name +'_tabs').show();
				this.tabs.active = this.tabs.tabs[this.page].id;
				this.tabs.refresh();
			} else {
				$('#form_'+ this.name +'_tabs').hide();
			}
			// refresh tabs if needed
			if (typeof this.toolbar == 'object' && $.isArray(this.toolbar.items) && this.toolbar.items.length > 0) {
				$('#form_'+ this.name +'_toolbar').show();
				this.toolbar.refresh();
			} else {
				$('#form_'+ this.name +'_toolbar').hide();
			}
			// refresh values of all fields
			for (var f in this.fields) {
				var field = this.fields[f];
				field.$el = $(this.box).find('[name="'+ String(field.name).replace(/\\/g, '\\\\') +'"]');
				field.el  = field.$el[0];
				if (typeof field.el == 'undefined') {
					console.log('ERROR: Cannot associate field "'+ field.name + '" with html control. Make sure html control exists with the same name.');
					//return;
				}
				if (field.el) field.el.id = field.name;
				var tmp = $(field).data('w2field');
				if (tmp) tmp.clear();
				$(field.$el).off('change').on('change', function () {
					var value_new 		= this.value;
					var value_previous 	= obj.record[this.name] ? obj.record[this.name] : '';
					var field 			= obj.get(this.name);
					if (['list', 'enum', 'file'].indexOf(field.type) != -1 && $(this).data('selected')) {
						var nv = $(this).data('selected');
						var cv = obj.record[this.name];
						if ($.isArray(nv)) {
							value_new = [];
							for (var i in nv) value_new[i] = $.extend(true, {}, nv[i]); // clone array
						}
						if ($.isPlainObject(nv)) {
							value_new = $.extend(true, {}, nv); // clone object
						}
						if ($.isArray(cv)) {
							value_previous = [];
							for (var i in cv) value_previous[i] = $.extend(true, {}, cv[i]); // clone array
						}
						if ($.isPlainObject(cv)) {
							value_previous = $.extend(true, {}, cv); // clone object
						}
					}
					// clean extra chars
					if (['int', 'float', 'percent', 'money', 'currency'].indexOf(field.type) != -1) {
						value_new = $(this).data('w2field').clean(value_new);
					}
					if (value_new === value_previous) return;
					// event before
					var eventData = obj.trigger({ phase: 'before', target: this.name, type: 'change', value_new: value_new, value_previous: value_previous });
					if (eventData.isCancelled === true) {
						$(this).val(obj.record[this.name]); // return previous value
						return;
					}
					// default action
					var val = this.value;
					if (this.type == 'select')   val = this.value;
					if (this.type == 'checkbox') val = this.checked ? true : false;
					if (this.type == 'radio') {
						field.$el.each(function (index, el) {
							if (el.checked) val = el.value;
						});
					}
					if (['int', 'float', 'percent', 'money', 'currency', 'list', 'combo', 'enum', 'file'].indexOf(field.type) != -1) {
						val = value_new;
					}
					if (['enum', 'file'].indexOf(field.type) != -1) {
						if (val.length > 0) {
							var fld = $(field.el).data('w2field').helpers.multi;
							$(fld).removeClass('w2ui-error');
						}
					}
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
					obj.action(action, event);
				});
			});
			// init controls with record
			for (var f in this.fields) {
				var field = this.fields[f];
				var value = (typeof this.record[field.name] != 'undefined' ? this.record[field.name] : '');
				if (!field.el) continue;
				field.type = String(field.type).toLowerCase();
				if (!field.options) field.options = {};
				switch (field.type) {
					case 'text':
					case 'textarea':
					case 'email':
					case 'password':
						field.el.value = value;
						break;
					case 'int':
					case 'float':
					case 'money':
					case 'currency':
					case 'percent':
					case 'hex':
					case 'alphanumeric':
					case 'color':
					case 'date':
					case 'time':
						field.el.value = value;
						$(field.el).w2field($.extend({}, field.options, { type: field.type }));
						break;

					// enums
					case 'list':
					case 'combo':
						if (field.type == 'list' && !$.isPlainObject(value)) {
							// find value from items
							for (var i in field.options.items) {
								var item = field.options.items[i];
								if (item && item.id == value) {
									value = $.extend(true, {}, item);
									obj.record[field.name] = value;
									break;
								}
							}
						} else if (field.type == 'combo' && !$.isPlainObject(value)) {
							field.el.value = value;
						} else if ($.isPlainObject(value) && typeof value.text != 'undefined') {
							field.el.value = value.text;
						} else {
							field.el.value = '';
						}
						if (!$.isPlainObject(value)) value = {};
						$(field.el).w2field($.extend({}, field.options, { type: field.type, selected: value }));
						break;
					case 'enum':
					case 'file':
						if (!$.isArray(value)) value = [];
						$(field.el).w2field($.extend({}, field.options, { type: field.type, selected: value }));
						break;

					// standard HTML
					case 'select':
						// generate options
						var items = field.options.items;
						if (typeof items != 'undefined' && items.length > 0) {
							items = w2obj.field.prototype.normMenu(items);
							$(field.el).html('');
							for (var it in items) {
								$(field.el).append('<option value="'+ items[it].id +'">' + items[it].text + '</option');
							}
						}
						$(field.el).val(value);
						break;
					case 'radio':
						$(field.$el).prop('checked', false).each(function (index, el) {
							if ($(el).val() == value) $(el).prop('checked', true);
						});
						break;
					case 'checkbox':
						$(field.el).prop('checked', value ? true : false);
						break;
					default:
						$(field.el).w2field($.extend({}, field.options, { type: field.type }));
						break;
				}
			}
			// wrap pages in div
			var tmp = $(this.box).find('.w2ui-page');
			for (var i = 0; i < tmp.length; i++) {
				if ($(tmp[i]).find('> *').length > 1) $(tmp[i]).wrapInner('<div></div>');
			}
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			this.resize();
			return (new Date()).getTime() - time;
		},

		render: function (box) {
			var time = (new Date()).getTime();
			var obj = this;
			if (typeof box == 'object') {
				// remove from previous box
				if ($(this.box).find('#form_'+ this.name +'_tabs').length > 0) {
					$(this.box).removeAttr('name')
						.removeClass('w2ui-reset w2ui-form')
						.html('');
				}
				this.box = box;
			}
			if (!this.isGenerated) return;
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'render', box: (typeof box != 'undefined' ? box : this.box) });
			if (eventData.isCancelled === true) return;
			// default actions
			if ($.isEmptyObject(this.original) && !$.isEmptyObject(this.record)) {
				this.original = $.extend(true, {}, this.record);
			}
			var html =  '<div>' +
						(this.header != '' ? '<div class="w2ui-form-header">' + this.header + '</div>' : '') +
						'	<div id="form_'+ this.name +'_toolbar" class="w2ui-form-toolbar"></div>' +
						'	<div id="form_'+ this.name +'_tabs" class="w2ui-form-tabs"></div>' +
							this.formHTML +
						'</div>';
			$(this.box).attr('name', this.name)
				.addClass('w2ui-reset w2ui-form')
				.html(html);
			if ($(this.box).length > 0) $(this.box)[0].style.cssText += this.style;

			// init toolbar regardless it is defined or not
			if (typeof this.toolbar.render !== 'function') {
				this.toolbar = $().w2toolbar($.extend({}, this.toolbar, { name: this.name +'_toolbar', owner: this }));
				this.toolbar.on('click', function (event) {
					var eventData = obj.trigger({ phase: 'before', type: 'toolbar', target: event.target, originalEvent: event });
					if (eventData.isCancelled === true) return;
					// no default action
					obj.trigger($.extend(eventData, { phase: 'after' }));
				});
			}
			if (typeof this.toolbar == 'object' && typeof this.toolbar.render == 'function') {
				this.toolbar.render($('#form_'+ this.name +'_toolbar')[0]);
			}
			// init tabs regardless it is defined or not
			if (typeof this.tabs.render !== 'function') {
				this.tabs = $().w2tabs($.extend({}, this.tabs, { name: this.name +'_tabs', owner: this }));
				this.tabs.on('click', function (event) {
					obj.goto(this.get(event.target, true));
				});
			}
			if (typeof this.tabs == 'object' && typeof this.tabs.render == 'function') {
				this.tabs.render($('#form_'+ this.name +'_tabs')[0]);
			}
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			// after render actions
			this.resize();
			var url = (typeof this.url != 'object' ? this.url : this.url.get);
			if (url && this.recid != 0) {
				this.request();
			} else {
				this.refresh();
			}
			// attach to resize event
			if ($('.w2ui-layout').length == 0) { // if there is layout, it will send a resize event
				this.tmp_resize = function (event) { w2ui[obj.name].resize(); }
				$(window).off('resize', 'body').on('resize', 'body', this.tmp_resize);
			}
			setTimeout(function () { obj.resize(); obj.refresh(); }, 150); // need timer because resize is on timer
			// focus on load
			function focusEl() {
				var inputs = $(obj.box).find('input, select, textarea');
				if (inputs.length > obj.focus) inputs[obj.focus].focus();
			}
			if (this.focus >= 0) setTimeout(focusEl, 500); // need timeout to allow form to render
			return (new Date()).getTime() - time;
		},

		destroy: function () {
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'destroy' });
			if (eventData.isCancelled === true) return;
			// clean up
			if (typeof this.toolbar == 'object' && this.toolbar.destroy) this.toolbar.destroy();
			if (typeof this.tabs == 'object' && this.tabs.destroy) this.tabs.destroy();
			if ($(this.box).find('#form_'+ this.name +'_tabs').length > 0) {
				$(this.box)
					.removeAttr('name')
					.removeClass('w2ui-reset w2ui-form')
					.html('');
			}
			delete w2ui[this.name];
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			$(window).off('resize', 'body')
		}
	};

	$.extend(w2form.prototype, w2utils.event);
	w2obj.form = w2form;
})();
