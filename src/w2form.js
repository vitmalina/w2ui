/************************************************************************
*   Library: Web 2.0 UI for jQuery (using prototypical inheritance)
*   - Following objects defined
* 		- w2ui.w2form 	- form widget
*		- $.w2form		- jQuery wrapper
*   - Dependencies: jQuery, w2utils, w2fields, w2tabs, w2popup
*
* == NICE TO HAVE ==
*	- refresh(field) - would refresh only one field
* 	- include delta on save
*
* == 1.3 changes ==
*   - tabs can be array of string, array of tab objects or w2tabs object
* 	- generate should use fields, and not its own structure
*
************************************************************************/


(function () {
	var w2form = function(options) {
		// public properties
		this.name  	  		= null;
		this.header 		= '';
		this.box			= null; 	// HTML element that hold this element
		this.url			= '';
		this.formURL    	= '';		// url where to get form HTML
		this.formHTML   	= '';		// form HTML (might be loaded from the url)
		this.page 			= 0;		// current page
		this.recid			= 0;		// can be null or 0
		this.fields 		= [];
		this.actions 		= {};
		this.record			= {};
		this.original   	= {};
		this.postData		= {};
		this.tabs 			= {}; 		// if not empty, then it is tabs object
		this.style 			= '';
		this.focusFirst		= true;
		this.msgNotJSON 	= w2utils.lang('Return data is not in JSON format.');
		this.msgRefresh		= w2utils.lang('Refreshing...');
		this.msgSaving		= w2utils.lang('Saving...');

		// events
		this.onRequest  	= null,
		this.onLoad 		= null,
		this.onSubmit		= null,
		this.onSave			= null,
		this.onChange		= null,
		this.onRender 		= null;
		this.onRefresh		= null;
		this.onResize 		= null;
		this.onDestroy		= null;
		this.onAction		= null; 
		this.onError		= null;

		// internal
		this.isGenerated	= false;
		this.last = {
			xhr	: null		// jquery xhr requests
		}

		$.extend(true, this, options);
	};
	
	// ====================================================
	// -- Registers as a jQuery plugin
	
	$.fn.w2form = function(method) {
		if (typeof method === 'object' || !method ) {
			var obj = this;
			// check required parameters
			if (!method || typeof method.name == 'undefined') {
				console.log('ERROR: The parameter "name" is required but not supplied in $().w2form().');
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
			// remember items
			var record 		= method.record;
			var original	= method.original;
			var fields 		= method.fields;
			var tabs		= method.tabs;
			// extend items
			var object = new w2form(method);
			$.extend(object, { record: {}, original: {}, fields: [], tabs: {}, handlers: [] });
			if ($.isArray(tabs)) {
				$.extend(true, object.tabs, { tabs: [] });
				for (var t in tabs) {
					var tmp = tabs[t];
					if (typeof tmp == 'object') object.tabs.tabs.push(tmp); else object.tabs.tabs.push({ id: tmp, caption: tmp });
				}
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
			if (object.formURL != '') {
				$.get(object.formURL, function (data) {
					object.formHTML = data;
					if ($(obj).length != 0 || data.length != 0) {
						$(obj).html(object.formHTML);
						object.init(obj);
						object.render($(obj)[0]);
					}
				});
			} else if (object.formHTML != '') {
				// it is already loaded into formHTML
			} else if ($(this).length != 0 && $.trim($(this).html()) != '') {
				object.formHTML = $(this).html();
			}  else { // try to generate it
				object.formHTML = object.generateHTML();
				object.isGenerated = true;
				$(obj).html(object.formHTML);
			}
			// register new object
			w2ui[object.name] = object;
			// render if not loaded from url
			if (object.formURL == '') {
				if (String(object.formHTML).indexOf('w2ui-page') == -1) object.formHTML = '<div class="w2ui-page page-0">'+ object.formHTML +'</div>';
				object.init(this);
				object.render($(this)[0]);
			}
			return object;
		
		} else if (w2ui[$(this).attr('name')]) {
			var obj = w2ui[$(this).attr('name')];
			obj[method].apply(obj, Array.prototype.slice.call(arguments, 1));
			return this;
		} else {
			console.log('ERROR: Method ' +  method + ' does not exist on jQuery.w2form');
		}    
	}		

	// ====================================================
	// -- Implementation of core functionality
	
	w2form.prototype = {

		init: function (box) {
			var obj = this;
			$(box).find('input, textarea, select').each(function (index, el) {
				var type  = 'text';
				var name  = (typeof $(el).attr('name') != 'undefined' ? $(el).attr('name') : $(el).attr('id'));
				if (el.type == 'checkbox')  	type = 'checkbox';
				if (el.type == 'radio')     	type = 'radio';
				if (el.type == 'password')     	type = 'password';
				if (el.type == 'button') 		type = 'button';
				if (el.tagName == 'select') 	type = 'list';
				if (el.tagName == 'textarea')	type = 'textarea';
				var value = (type == 'checkbox' || type == 'radio' ? ($(el).prop('checked') ? true : false) : $(el).val());

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
			// init tabs regardless it is defined or not
			if (typeof this.tabs['render'] == 'undefined') {
				var obj = this;
				this.tabs = $().w2tabs($.extend({}, this.tabs, { name: this.name +'_tabs', owner: this }));
				this.tabs.on('click', function (id, choice) {
					obj.goto(this.get(id, true));
				});
			}
			return;
		},

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
			if (this.url != '' && this.recid != 0) {
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
			// clear all enum fields
			for (var f in this.fields) {
				var field = this.fields[f];
				if (field.options && field.options.selected) delete field.options.selected;
			}
			$().w2tag();
			this.refresh();
		},
		
		error: function (msg) {
			var obj = this;
			// let the management of the error outside of the grid
			var eventData = this.trigger({ target: this.name, type: 'error', message: msg , xhr: this.last.xhr });
			if (eventData.stop === true) {
				if (typeof callBack == 'function') callBack();
				return false;
			}
			// need a time out because message might be already up)
			setTimeout(function () {
				if ($('#w2ui-popup').length > 0) {
					$().w2popup('message', {
						width 	: 370,
						height 	: 140,
						html 	: '<div class="w2ui-grid-error-msg" style="font-size: 11px;">ERROR: '+ msg +'</div>'+
								  '<div style="position: absolute; bottom: 7px; left: 0px; right: 0px; text-align: center;">'+
								  '	<input type="button" value="Ok" onclick="$().w2popup(\'message\');" class="w2ui-grid-popup-btn">'+
								  '</div>'
					});
				} else {
					$().w2popup('open', {
						width 	: 420,
						height 	: 200,
						showMax : false,
						title 	: 'Error',
						body 	: '<div class="w2ui-grid-error-msg">'+ msg +'</div>',
						buttons : '<input type="button" value="Ok" onclick="$().w2popup(\'close\');" class="w2ui-grid-popup-btn">'
					});
				}
				console.log('ERROR: ' + msg);
			}, 1);
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
							var error = { field: field, error: w2utils.lang('Not an integer') };
							errors.push(error);
							if (showErrors) $(field.el).w2tag(error.error, { "class": 'w2ui-error' });
						} 
						break;
					case 'float':
						if (this.record[field.name] && !w2utils.isFloat(this.record[field.name])) {
							var error = { field: field, error: w2utils.lang('Not a float') };
							errors.push(error);
							if (showErrors) $(field.el).w2tag(error.error, { "class": 'w2ui-error' });
						} 
						break;
					case 'money':
						if (this.record[field.name] && !w2utils.isMoney(this.record[field.name])) {
							var error = { field: field, error: w2utils.lang('Not in money format') };
							errors.push(error);
							if (showErrors) $(field.el).w2tag(error.error, { "class": 'w2ui-error' });
						} 
						break;
					case 'hex':
						if (this.record[field.name] && !w2utils.isHex(this.record[field.name])) {
							var error = { field: field, error: w2utils.lang('Not a hex number') };
							errors.push(error);
							if (showErrors) $(field.el).w2tag(error, { "class": 'w2ui-error' });
						} 
						break;
					case 'email':
						if (this.record[field.name] && !w2utils.isEmail(this.record[field.name])) {
							var error = { field: field, error: w2utils.lang('Not a valid email') };
							errors.push(error);
							if (showErrors) $(field.el).w2tag(error.error, { "class": 'w2ui-error' });
						} 
						break;
					case 'checkbox':
						// convert true/false
						if (this.record[field.name] == true) this.record[field.name] = 1; else this.record[field.name] = 0; 
						break;
					case 'date':
						// format date before submit
						if (this.record[field.name] && !w2utils.isDate(this.record[field.name], field.options.format)) {
							var error = { field: field, error: w2utils.lang('Not a valid date') + ': ' + field.options.format };
							errors.push(error);
							if (showErrors) $(field.el).w2tag(error.error, { "class": 'w2ui-error' });
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
						break;
				}
				// === check required - if field is '0' it should be considered not empty
				var val = this.record[field.name];
				if ( field.required && (val === '' || ($.isArray(val) && val.length == 0)) ) {
					var error = { field: field, error: w2utils.lang('Required field') };
					errors.push(error);
					if (showErrors) $(field.el).w2tag(error.error, { "class": 'w2ui-error' });
				}
			}
			return errors;
		},

		request: function (postData, callBack) { // if (1) param then it is call back if (2) then postData and callBack
			var obj = this;
			// check for multiple params
			if (typeof postData == 'function') {
				callBack 	= postData;
				postData 	= null;
			}
			if (typeof postData == 'undefined' || postData == null) postData = {};
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
			if (eventData.stop === true) { if (typeof callBack == 'function') callBack({ status: 'error', message: 'Request aborted.' }); return false; }
			// default action
			this.record	  = {};
			this.original = {};
			// call server to get data
			this.lock(this.msgRefresh);
			if (this.last.xhr) try { this.last.xhr.abort(); } catch (e) {};
			this.last.xhr = $.ajax({
				type		: 'GET',
				url			: eventData.url, // + (eventData.url.indexOf('?') > -1 ? '&' : '?') +'t=' + (new Date()).getTime(),
				data		: String($.param(eventData.postData, false)).replace(/%5B/g, '[').replace(/%5D/g, ']'),
				dataType	: 'text',
				complete	: function (xhr, status) {
					obj.unlock();
					// event before
					var eventData = obj.trigger({ phase: 'before', target: obj.name, type: 'load', xhr: xhr, status: status });	
					if (eventData.stop === true) {
						if (typeof callBack == 'function') callBack({ status: 'error', message: 'Request aborted.' });
						return false;
					}
					// parse server response
					var responseText = obj.last.xhr.responseText;
					if (status != 'error') {
						// default action
						if (typeof responseText != 'undefined' && responseText != '') {
							var data;
							// check if the onLoad handler has not already parsed the data
							if (typeof responseText == "object") {
								data = responseText;
							} else {
								// $.parseJSON or $.getJSON did not work because it expect perfect JSON data - where everything is in double quotes
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

		save: function (postData, callBack) {
			var obj = this;
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
			if (!obj.url) {
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
				// convert  before submitting 
				for (var f in obj.fields) {
					var field = obj.fields[f];
					switch (String(field.type).toLowerCase()) {
						case 'date': // to yyyy-mm-dd format
							var dt = params.record[field.name];
							if (field.options.format.toLowerCase() == 'dd/mm/yyyy' || field.options.format.toLowerCase() == 'dd-mm-yyyy'
									|| field.options.format.toLowerCase() == 'dd.mm.yyyy') {
								var tmp = dt.replace(/-/g, '/').replace(/\./g, '/').split('/');
								var dt  = new Date(tmp[2] + '-' + tmp[1] + '-' + tmp[0]);
							}
							params.record[field.name] = w2utils.formatDate(dt, 'yyyy-mm-dd');
							break;
					}
				}
				// event before
				var eventData = obj.trigger({ phase: 'before', type: 'submit', target: obj.name, url: obj.url, postData: params });
				if (eventData.stop === true) { 
					if (typeof callBack == 'function') callBack({ status: 'error', message: 'Saving aborted.' }); 
					return false; 
				}
				// default action
				if (obj.last.xhr) try { obj.last.xhr.abort(); } catch (e) {};
				obj.last.xhr = $.ajax({
					type		: (w2utils.settings.RESTfull ? (obj.recid == 0 ? 'POST' : 'PUT') : 'POST'),
					url			: eventData.url, // + (eventData.url.indexOf('?') > -1 ? '&' : '?') +'t=' + (new Date()).getTime(),
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
						if (eventData.stop === true) {
							if (typeof callBack == 'function') callBack({ status: 'error', message: 'Saving aborted.' });
							return false;
						}
						// parse server response
						var responseText = xhr.responseText;
						if (status != 'error') {
							// default action
							if (typeof responseText != 'undefined' && responseText != '') {
								var data;
								// check if the onLoad handler has not already parsed the data
								if (typeof responseText == "object") {
									data = responseText;
								} else {
									// $.parseJSON or $.getJSON did not work because it expect perfect JSON data - where everything is in double quotes
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

		lock: function (msg, unlockOnClick) {
			var obj = this;
			if (typeof msg == 'undefined' || msg == '') {
				setTimeout(function () {
					$('#form_'+ obj.name +'_lock').remove();
					$('#form_'+ obj.name +'_status').remove();
				}, 25);
			} else {
				$('#form_'+ obj.name +'_lock').remove();
				$('#form_'+ obj.name +'_status').remove();
				$(this.box).find('> div :first-child').before(
					'<div id="form_'+ obj.name +'_lock" class="w2ui-form-lock"></div>'+
					'<div id="form_'+ obj.name +'_status" class="w2ui-form-status"></div>'
				);
				setTimeout(function () {
					var lock 	= $('#form_'+ obj.name +'_lock');
					var status 	= $('#form_'+ obj.name +'_status');
					status.data('old_opacity', status.css('opacity')).css('opacity', '0').show();
					lock.data('old_opacity', lock.css('opacity')).css('opacity', '0').show();
					setTimeout(function () {
						var left 	= ($(obj.box).width()  - w2utils.getSize(status, 'width')) / 2;
						var top 	= ($(obj.box).height() * 0.9 - w2utils.getSize(status, 'height')) / 2;
						lock.css({
							opacity : lock.data('old_opacity'),
							width 	: $(obj.box).width() + 'px',
							height 	: $(obj.box).height() + 'px'
						});
						status.html(msg).css({
							opacity : status.data('old_opacity'),
							left	: left + 'px',
							top		: top + 'px'
						});
					}, 10);
				}, 10);
			}
		},

		unlock: function() {
			this.lock();
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
				if (field.type == 'list') input = '<select name="'+ field.name +'" '+ field.html.attr +'></select>';
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
			if (this.actions.length > 0) {
				buttons += '\n<div class="w2ui-buttons">';
				for (var a in this.actions) {
					buttons += '\n    <input type="button" value="'+ a +'" name="'+ a +'">';
				}
				buttons += '\n</div>';
			}
			return pages.join('') + buttons;
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

		resize: function () {
			var obj = this;
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'resize' });
			if (eventData.stop === true) return false;
			// default behaviour
			var main 	= $(this.box).find('> div');
			var header	= $(this.box).find('> div .w2ui-form-header');
			var tabs	= $(this.box).find('> div .w2ui-form-tabs');
			var page	= $(this.box).find('> div .w2ui-page');
			var cpage	= $(this.box).find('> div .w2ui-page.page-'+ this.page);
			var dpage	= $(this.box).find('> div .w2ui-page.page-'+ this.page + ' > div');
			var buttons	= $(this.box).find('> div .w2ui-buttons');		
			// if no height, calculate it
			resizeElements();
			if ($(this.box).height() == 0 || $(this.box).data('auto-size') === true) {
				$(this.box).height(
					(header.length > 0 ? w2utils.getSize(header, 'height') : 0) + 
					(this.tabs.tabs.length > 0 ? w2utils.getSize(tabs, 'height') : 0) + 
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
				tabs.css('top', (obj.header != '' ? w2utils.getSize(header, 'height') : 0));
				page.css('top', (obj.header != '' ? w2utils.getSize(header, 'height') : 0) 
							  + (obj.tabs.tabs.length > 0 ? w2utils.getSize(tabs, 'height') + 5 : 0));
				page.css('bottom', (buttons.length > 0 ? w2utils.getSize(buttons, 'height') : 0));
			}
		},

		refresh: function () {
			var obj = this;
			if (!this.box) return;
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'refresh', page: this.page })
			if (eventData.stop === true) return false;
			// default action
			$(this.box).find('.w2ui-page').hide();
			$(this.box).find('.w2ui-page.page-' + this.page).show();
			// refresh tabs if needed
			if (typeof this.tabs == 'object' && this.tabs.tabs.length > 0) {
				$('#form_'+ this.name +'_tabs').show();
				this.tabs.active = this.tabs.tabs[this.page].id;
				this.tabs.refresh();
			} else {
				$('#form_'+ this.name +'_tabs').hide();
			}			
			// refresh values of all fields
			for (var f in this.fields) {
				var field = this.fields[f];
				field.el = $(this.box).find('[name="'+ String(field.name).replace(/\\/g, '\\\\') +'"]')[0];
				if (typeof field.el == 'undefined') {
					console.log('ERROR: Cannot associate field "'+ field.name + '" with html control. Make sure html control exists with the same name.');
					//return;
				}
				if (field.el) field.el.id = field.name;
				$(field.el).off('change').on('change', function () {
					var value_new 		= this.value;
					var value_previous 	= obj.record[this.name] ? obj.record[this.name] : '';
					var field 			= obj.get(this.name);
					if ((field.type == 'enum' || field.type == 'upload') && $(this).data('selected')) {
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
					if (field.type == 'enum') 	 val = value_new;
					if (field.type == 'upload')  val = value_new;
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
				if (!field.el)  continue;
				switch (String(field.type).toLowerCase()) {
					case 'email':
					case 'text':
					case 'textarea':
						field.el.value = value;
						break;
					case 'date':
						if (!field.options) field.options = {};
						if (!field.options.format) field.options.format = 'mm/dd/yyyy';
						if (field.options.format.toLowerCase() == 'dd/mm/yyyy' || field.options.format.toLowerCase() == 'dd-mm-yyyy'
								|| field.options.format.toLowerCase() == 'dd.mm.yyyy') {
							var tmp = value.replace(/-/g, '/').replace(/\./g, '/').split('/');
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
							$(field.el).prop('checked', true);
						} else {
							$(field.el).prop('checked', false);
						}
						break;
					case 'password':
						// hide passwords
						field.el.value = value;
						break;
					case 'select':
					case 'list':
						$(field.el).w2field($.extend({}, field.options, { type: 'list', value: value }));
						break;
					case 'enum':
						if (typeof field.options == 'undefined' || (typeof field.options.url == 'undefined' && typeof field.options.items == 'undefined')) {
							console.log("ERROR: (w2form."+ obj.name +") the field "+ field.name +" defined as enum but not field.options.url or field.options.items provided.");
							break;
						}
						var sel = value;
						// if (field.selected) sel = field.selected;
						$(field.el).w2field( $.extend({}, field.options, { type: 'enum', selected: value }) );
						break;
					case 'upload':
						$(field.el).w2field($.extend({}, field.options, { type: 'upload', selected: value }));
						break;
					default:
						console.log('ERROR: field type "'+ field.type +'" is not recognized.');
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
		},

		render: function (box) {
			var obj = this;
			if (box && $(box).html() != '' && this.isGenerated) {
				this.formHTML = $(box).html();
				this.isGenerated = false;
			}
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'render', box: (typeof box != 'undefined' ? box : this.box) });	
			if (eventData.stop === true) return false;
			// default actions
			if (typeof box != 'undefined' && box != null) {
				// remove from previous box
				if ($(this.box).find('#form_'+ this.name +'_tabs').length > 0) {
					$(this.box)
						.removeAttr('name')
						.removeClass('w2ui-reset w2ui-form')
						.html('');
				}
				this.box = box;
			}
			var html =  '<div>' +
						(this.header != '' ? '<div class="w2ui-form-header">' + this.header + '</div>' : '') +
						'	<div id="form_'+ this.name +'_tabs" class="w2ui-form-tabs"></div>' +
						this.formHTML +
						'</div>';
			$(this.box)
				.attr('name', this.name)
				.addClass('w2ui-reset w2ui-form')
				.html(html);
			if ($(this.box).length > 0) $(this.box)[0].style.cssText += this.style;
			// init tabs
			this.initTabs();
			if (typeof this.tabs == 'object' && typeof this.tabs.render == 'function') {
				this.tabs.render($('#form_'+ this.name +'_tabs')[0]);
			}
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			// after render actions
			this.resize();
			if (this.url != '' && this.recid != 0) {
				this.request(); 
			} else {
				this.refresh();
			}
			// attach to resize event
			this.tmp_resize = function (event) { w2ui[obj.name].resize(); }
			$(window).off('resize', 'body').on('resize', 'body', this.tmp_resize);
			setTimeout(function () { obj.resize(); obj.refresh(); }, 150); // need timer because resize is on timer
			// focus first
			function focusFirst() {
				var inputs = $(obj.box).find('input, select');
				if (inputs.length > 0) inputs[0].focus();
			}
			if (this.focusFirst === true) setTimeout(focusFirst, 500); // need timeout to allow form to render
		},

		destroy: function () { 
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'destroy' });	
			if (eventData.stop === true) return false;
			// clean up
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
	}
	
	$.extend(w2form.prototype, $.w2event);
	w2obj.form = w2form;
})();
