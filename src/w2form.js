/************************************************************************
*   Library: Web 2.0 UI for jQuery (using prototypical inheritance)
*   - Following objects defined
*        - w2form      - form widget
*        - $().w2form  - jQuery wrapper
*   - Dependencies: jQuery, w2utils, w2fields, w2tabs, w2toolbar
*
* == NICE TO HAVE ==
*   - include delta on save
*   - form should read <select> <options> into items
*   - two way data bindings
*   - verify validation of fields
*   - added getChanges() - not complete
*   - nested record object
*   - formHTML --> template
*
* == 1.5 changes
*   - $('#form').w2form() - if called w/o argument then it returns form object
*   - added onProgress
*   - added field.html.style (for the whole field)
*   - added enable/disable, show/hide
*   - added field.disabled, field.hidden
*   - when field is blank, set record.field = null
*   - action: { caption: 'Limpiar', style: '', class: '', onClick: function () {} }
*   - added ability to generate radio and select html in generateHTML()
*   - refresh(field) - would refresh only one field
*   - form.message
*   - added field.html.column
*   - added field types html, empty, custom
*
************************************************************************/


(function ($) {
    var w2form = function(options) {
        // public properties
        this.name      = null;
        this.header    = '';
        this.box       = null;     // HTML element that hold this element
        this.url       = '';
        this.routeData = {};       // data for dynamic routes
        this.formURL   = '';       // url where to get form HTML
        this.formHTML  = '';       // form HTML (might be loaded from the url)
        this.page      = 0;        // current page
        this.recid     = 0;        // can be null or 0
        this.fields    = [];
        this.actions   = {};
        this.record    = {};
        this.original  = {};
        this.postData  = {};
        this.toolbar   = {};       // if not empty, then it is toolbar
        this.tabs      = {};       // if not empty, then it is tabs object

        this.style         = '';
        this.focus         = 0;    // focus first or other element

        // internal
        this.isGenerated = false;
        this.last = {
            xhr: null        // jquery xhr requests
        };

        $.extend(true, this, w2obj.form, options);
    };

    // ====================================================
    // -- Registers as a jQuery plugin

    $.fn.w2form = function(method) {
        if ($.isPlainObject(method)) {
            var obj = this;
            // check name parameter
            if (!w2utils.checkName(method, 'w2form')) return;
            // remember items
            var record   = method.record;
            var original = method.original;
            var fields   = method.fields;
            var toolbar  = method.toolbar;
            var tabs     = method.tabs;
            // extend items
            var object = new w2form(method);
            $.extend(object, { record: {}, original: {}, fields: [], tabs: {}, toolbar: {}, handlers: [] });
            if ($.isArray(tabs)) {
                $.extend(true, object.tabs, { tabs: [] });
                for (var t = 0; t < tabs.length; t++) {
                    var tmp = tabs[t];
                    if (typeof tmp === 'object') object.tabs.tabs.push(tmp); else object.tabs.tabs.push({ id: tmp, caption: tmp });
                }
            } else {
                $.extend(true, object.tabs, tabs);
            }
            $.extend(true, object.toolbar, toolbar);
            // reassign variables
            if (fields) for (var p = 0; p < fields.length; p++) {
                var field = $.extend(true, {}, fields[p]);
                if (field.name == null && field.field != null) field.name = field.field;
                if (field.field == null && field.name != null) field.field = field.name;
                object.fields[p] = field;
            }
            for (var p in record) { // it is an object
                if ($.isPlainObject(record[p])) {
                    object.record[p] = $.extend(true, {}, record[p]);
                } else {
                    object.record[p] = record[p];
                }
            }
            for (var p in original) { // it is an object
                if ($.isPlainObject(original[p])) {
                    object.original[p] = $.extend(true, {}, original[p]);
                } else {
                    object.original[p] = original[p];
                }
            }
            if (obj.length > 0) object.box = obj[0];
            // render if necessary
            if (object.formURL !== '') {
                $.get(object.formURL, function (data) { // should always be $.get as it is template
                    object.formHTML = data;
                    object.isGenerated = true;
                    if ($(object.box).length !== 0 || data.length !== 0) {
                        $(object.box).html(data);
                        object.render(object.box);
                    }
                });
            } else if (object.formHTML !== '') {
                // it is already loaded into formHTML
            } else if ($(this).length !== 0 && $.trim($(this).html()) !== '') {
                object.formHTML = $(this).html();
            }  else { // try to generate it
                object.formHTML = object.generateHTML();
            }
            // register new object
            w2ui[object.name] = object;
            // render if not loaded from url
            if (object.formURL === '') {
                if (String(object.formHTML).indexOf('w2ui-page') == -1) {
                    object.formHTML = '<div class="w2ui-page page-0">'+ object.formHTML +'</div>';
                }
                $(object.box).html(object.formHTML);
                object.isGenerated = true;
                object.render(object.box);
            }
            return object;

        } else {
            var obj = w2ui[$(this).attr('name')];
            if (!obj) return null;
            if (arguments.length > 0) {
                if (obj[method]) obj[method].apply(obj, Array.prototype.slice.call(arguments, 1));
                return this;
            } else {
                return obj;
            }
        }
    };

    // ====================================================
    // -- Implementation of core functionality

    w2form.prototype = {
        // events
        onRequest     : null,
        onLoad        : null,
        onValidate    : null,
        onSubmit      : null,
        onProgress    : null,
        onSave        : null,
        onChange      : null,
        onRender      : null,
        onRefresh     : null,
        onResize      : null,
        onDestroy     : null,
        onAction      : null,
        onToolbar     : null,
        onError       : null,

        msgNotJSON    : 'Returned data is not in valid JSON format.',
        msgAJAXerror  : 'AJAX error. See console for more details.',
        msgRefresh    : 'Refreshing...',
        msgSaving     : 'Saving...',

        get: function (field, returnIndex) {
            if (arguments.length === 0) {
                var all = [];
                for (var f1 = 0; f1 < this.fields.length; f1++) {
                    if (this.fields[f1].name != null) all.push(this.fields[f1].name);
                }
                return all;
            } else {
                for (var f2 = 0; f2 < this.fields.length; f2++) {
                    if (this.fields[f2].name == field) {
                        if (returnIndex === true) return f2; else return this.fields[f2];
                    }
                }
                return null;
            }
        },

        set: function (field, obj) {
            for (var f = 0; f < this.fields.length; f++) {
                if (this.fields[f].name == field) {
                    $.extend(this.fields[f] , obj);
                    this.refresh();
                    return true;
                }
            }
            return false;
        },

        show: function () {
            var affected = 0;
            for (var a = 0; a < arguments.length; a++) {
                var fld = this.get(arguments[a]);
                if (fld && fld.hidden) {
                    fld.hidden = false;
                    affected++;
                }
            }
            if (affected > 0) this.refresh();
            return affected;
        },

        hide: function () {
            var affected = 0;
            for (var a = 0; a < arguments.length; a++) {
                var fld = this.get(arguments[a]);
                if (fld && !fld.hidden) {
                    fld.hidden = true;
                    affected++;
                }
            }
            if (affected > 0) this.refresh();
            return affected;
        },

        enable: function () {
            var affected = 0;
            for (var a = 0; a < arguments.length; a++) {
                var fld = this.get(arguments[a]);
                if (fld && fld.disabled) {
                    fld.disabled = false;
                    affected++;
                }
            }
            if (affected > 0) this.refresh();
            return affected;
        },

        disable: function () {
            var affected = 0;
            for (var a = 0; a < arguments.length; a++) {
                var fld = this.get(arguments[a]);
                if (fld && !fld.disabled) {
                    fld.disabled = true;
                    affected++;
                }
            }
            if (affected > 0) this.refresh();
            return affected;
        },

        reload: function (callBack) {
            var url = (typeof this.url != 'object' ? this.url : this.url.get);
            if (url && this.recid !== 0 && this.recid != null) {
                // this.clear();
                this.request(callBack);
            } else {
                // this.refresh(); // no need to refresh
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
            var edata = this.trigger({ target: this.name, type: 'error', message: msg , xhr: this.last.xhr });
            if (edata.isCancelled === true) {
                if (typeof callBack == 'function') callBack();
                return;
            }
            // need a time out because message might be already up)
            setTimeout(function () { obj.message(msg); }, 1);
            // event after
            this.trigger($.extend(edata, { phase: 'after' }));
        },

        message: function(options) {
            if (typeof options == 'string') {
                options = {
                    width   : (options.length < 300 ? 350 : 550),
                    height  : (options.length < 300 ? 170: 250),
                    body    : '<div class="w2ui-centered">' + options + '</div>',
                    buttons : '<button class="w2ui-btn" onclick="w2ui[\''+ this.name +'\'].message()">Ok</button>',
                    onOpen  : function (event) {
                        setTimeout(function () {
                            $(event.box).find('.w2ui-btn').focus();
                        }, 25);
                    }
                };
            }
            w2utils.message.call(this, {
                box   : this.box,
                path  : 'w2ui.' + this.name,
                title : '.w2ui-form-header:visible',
                body  : '.w2ui-form-box'
            }, options);
        },

        validate: function (showErrors) {
            if (showErrors == null) showErrors = true;
            $().w2tag(); // hide all tags before validating
            // validate before saving
            var errors = [];
            for (var f = 0; f < this.fields.length; f++) {
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
                        if (!field.options.format) field.options.format = w2utils.settings.dateFormat;
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
                if (field.required && (val === '' || ($.isArray(val) && val.length === 0) || ($.isPlainObject(val) && $.isEmptyObject(val)))) {
                    errors.push({ field: field, error: w2utils.lang('Required field') });
                }
                if (field.equalto && this.record[field.name] != this.record[field.equalto]) {
                    errors.push({ field: field, error: w2utils.lang('Field should be equal to ') + field.equalto });
                }
            }
            // event before
            var edata = this.trigger({ phase: 'before', target: this.name, type: 'validate', errors: errors });
            if (edata.isCancelled === true) return;
            // show error
            if (showErrors) {
                for (var e = 0; e < edata.errors.length; e++) {
                    var err = edata.errors[e];
                    if (err.field == null) continue;
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
                    this.goto(errors[0].field.page);
                }
            }
            // event after
            this.trigger($.extend(edata, { phase: 'after' }));
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
            };
            return differ(this.record, this.original, {});
        },

        request: function (postData, callBack) { // if (1) param then it is call back if (2) then postData and callBack
            var obj = this;
            // check for multiple params
            if (typeof postData == 'function') {
                callBack = postData;
                postData = null;
            }
            if (postData == null) postData = {};
            if (!this.url || (typeof this.url == 'object' && !this.url.get)) return;
            if (this.recid == null) this.recid = 0;
            // build parameters list
            var params = {};
            // add list params
            params['cmd']   = 'get';
            params['recid'] = this.recid;
            params['name']  = this.name;
            // append other params
            $.extend(params, this.postData);
            $.extend(params, postData);
            // event before
            var edata = this.trigger({ phase: 'before', type: 'request', target: this.name, url: this.url, postData: params });
            if (edata.isCancelled === true) { if (typeof callBack == 'function') callBack({ status: 'error', message: 'Request aborted.' }); return; }
            // default action
            this.record   = {};
            this.original = {};
            // call server to get data
            this.lock(w2utils.lang(this.msgRefresh));
            var url = edata.url;
            if (typeof edata.url == 'object' && edata.url.get) url = edata.url.get;
            if (this.last.xhr) try { this.last.xhr.abort(); } catch (e) {}
            // process url with routeData
            if (!$.isEmptyObject(obj.routeData)) {
                var info  = w2utils.parseRoute(url);
                if (info.keys.length > 0) {
                    for (var k = 0; k < info.keys.length; k++) {
                        if (obj.routeData[info.keys[k].name] == null) continue;
                        url = url.replace((new RegExp(':'+ info.keys[k].name, 'g')), obj.routeData[info.keys[k].name]);
                    }
                }
            }
            var ajaxOptions = {
                type     : 'POST',
                url      : url,
                data     : edata.postData,
                dataType : 'text'   // expected from server
            };
            if (w2utils.settings.dataType == 'HTTP') {
                ajaxOptions.data = String($.param(ajaxOptions.data, false)).replace(/%5B/g, '[').replace(/%5D/g, ']');
            }
            if (w2utils.settings.dataType == 'HTTPJSON') {
                ajaxOptions.data = { request: JSON.stringify(ajaxOptions.data) };
            }
            if (w2utils.settings.dataType == 'RESTFULL') {
                ajaxOptions.type = 'GET';
                ajaxOptions.data = String($.param(ajaxOptions.data, false)).replace(/%5B/g, '[').replace(/%5D/g, ']');
            }
            if (w2utils.settings.dataType == 'RESTFULLJSON') {
                ajaxOptions.type = 'GET';
                ajaxOptions.data        = JSON.stringify(ajaxOptions.data);
                ajaxOptions.contentType = 'application/json';
            }
            if (w2utils.settings.dataType == 'JSON') {
                ajaxOptions.type        = 'POST';
                ajaxOptions.data        = JSON.stringify(ajaxOptions.data);
                ajaxOptions.contentType = 'application/json';
            }
            this.last.xhr = $.ajax(ajaxOptions)
                .done(function (data, status, xhr) {
                    obj.unlock();
                    // event before
                    var edata = obj.trigger({ phase: 'before', target: obj.name, type: 'load', xhr: xhr });
                    if (edata.isCancelled === true) {
                        if (typeof callBack == 'function') callBack({ status: 'error', message: 'Request aborted.' });
                        return;
                    }
                    // parse server response
                    var data;
                    var responseText = obj.last.xhr.responseText;
                    if (status != 'error') {
                        // default action
                        if (responseText != null && responseText !== '') {
                            // check if the onLoad handler has not already parsed the data
                            if (typeof responseText == "object") {
                                data = responseText;
                            } else {
                                // $.parseJSON or $.getJSON did not work because those expect perfect JSON data - where everything is in double quotes
                                //
                                // TODO: avoid (potentially malicious) code injection from the response.
                                try { eval('data = '+ responseText); } catch (e) { }
                            }
                            if (data == null) {
                                data = {
                                    status       : 'error',
                                    message      : w2utils.lang(obj.msgNotJSON),
                                    responseText : responseText
                                };
                            }
                            if (data['status'] == 'error') {
                                obj.error(w2utils.lang(data['message']));
                            } else {
                                obj.record   = $.extend({}, data.record);
                                obj.original = $.extend({}, data.record);
                            }
                        }
                    } else {
                        obj.error('AJAX Error ' + xhr.status + ': '+ xhr.statusText);
                        data = {
                            status       : 'error',
                            message      : w2utils.lang(obj.msgAJAXerror),
                            responseText : responseText
                        };
                    }
                    // event after
                    obj.trigger($.extend(edata, { phase: 'after' }));
                    obj.refresh();
                    // call back
                    if (typeof callBack == 'function') callBack(data);
                })
                .fail(function (xhr, status, error) {
                    // trigger event
                    var errorObj = { status: status, error: error, rawResponseText: xhr.responseText };
                    var edata2 = obj.trigger({ phase: 'before', type: 'error', error: errorObj, xhr: xhr });
                    if (edata2.isCancelled === true) return;
                    // default behavior
                    if (status != 'abort') {
                        var data;
                        try { data = $.parseJSON(xhr.responseText); } catch (e) {}
                        console.log('ERROR: Server communication failed.',
                            '\n   EXPECTED:', { status: 'success', items: [{ id: 1, text: 'item' }] },
                            '\n         OR:', { status: 'error', message: 'error message' },
                            '\n   RECEIVED:', typeof data == 'object' ? data : xhr.responseText);
                    }
                    // event after
                    obj.trigger($.extend(edata2, { phase: 'after' }));
                });
            // event after
            this.trigger($.extend(edata, { phase: 'after' }));
        },

        submit: function (postData, callBack) {
            return this.save(postData, callBack);
        },

        save: function (postData, callBack) {
            var obj = this;
            $(this.box).find(':focus').change(); // trigger onchange
            // check for multiple params
            if (typeof postData == 'function') {
                callBack = postData;
                postData = null;
            }
            // validation
            var errors = obj.validate(true);
            if (errors.length !== 0) return;
            // submit save
            if (postData == null) postData = {};
            if (!obj.url || (typeof obj.url == 'object' && !obj.url.save)) {
                console.log("ERROR: Form cannot be saved because no url is defined.");
                return;
            }
            obj.lock(w2utils.lang(obj.msgSaving) + ' <span id="'+ obj.name +'_progress"></span>');
            // need timer to allow to lock
            setTimeout(function () {
                // build parameters list
                var params = {};
                // add list params
                params['cmd']   = 'save';
                params['recid'] = obj.recid;
                params['name']  = obj.name;
                // append other params
                $.extend(params, obj.postData);
                $.extend(params, postData);
                // clear up files
                obj.fields.forEach(function (item) {
                    if (item.type == 'file' && Array.isArray(obj.record[item.field])) {
                        obj.record[item.field].forEach(function (fitem) {
                            delete fitem.file;
                        });
                    }
                });
                params.record = $.extend(true, {}, obj.record);
                // event before
                var edata = obj.trigger({ phase: 'before', type: 'submit', target: obj.name, url: obj.url, postData: params });
                if (edata.isCancelled === true) return;
                // default action
                var url = edata.url;
                if (typeof edata.url == 'object' && edata.url.save) url = edata.url.save;
                if (obj.last.xhr) try { obj.last.xhr.abort(); } catch (e) {}
                // process url with routeData
                if (!$.isEmptyObject(obj.routeData)) {
                    var info  = w2utils.parseRoute(url);
                    if (info.keys.length > 0) {
                        for (var k = 0; k < info.keys.length; k++) {
                            if (obj.routeData[info.keys[k].name] == null) continue;
                            url = url.replace((new RegExp(':'+ info.keys[k].name, 'g')), obj.routeData[info.keys[k].name]);
                        }
                    }
                }
                var ajaxOptions = {
                    type     : 'POST',
                    url      : url,
                    data     : edata.postData,
                    dataType : 'text',   // expected from server
                    xhr : function() {
                        var xhr = new window.XMLHttpRequest();
                        // upload
                        xhr.upload.addEventListener("progress", function(evt) {
                            if (evt.lengthComputable) {
                                var edata3 = obj.trigger({ phase: 'before', type: 'progress', total: evt.total, loaded: evt.loaded, originalEvent: evt });
                                if (edata3.isCancelled === true) return;
                                // default behavior
                                var percent = Math.round(evt.loaded / evt.total * 100);
                                $('#'+ obj.name + '_progress').text(''+ percent + '%');
                                // event after
                                obj.trigger($.extend(edata3, { phase: 'after' }));
                            }
                        }, false);
                        return xhr;
                    }
                };
                if (w2utils.settings.dataType == 'HTTP') {
                    ajaxOptions.data = String($.param(ajaxOptions.data, false)).replace(/%5B/g, '[').replace(/%5D/g, ']');
                }
                if (w2utils.settings.dataType == 'HTTPJSON') {
                    ajaxOptions.data = { request: JSON.stringify(ajaxOptions.data) };
                }
                if (w2utils.settings.dataType == 'RESTFULL') {
                    if (obj.recid !== 0 && obj.recid != null) ajaxOptions.type = 'PUT';
                    ajaxOptions.data = String($.param(ajaxOptions.data, false)).replace(/%5B/g, '[').replace(/%5D/g, ']');
                }
                if (w2utils.settings.dataType == 'RESTFULLJSON') {
                    if (obj.recid !== 0 && obj.recid != null) ajaxOptions.type = 'PUT';
                    ajaxOptions.data        = JSON.stringify(ajaxOptions.data);
                    ajaxOptions.contentType = 'application/json';
                }
                if (w2utils.settings.dataType == 'JSON') {
                    ajaxOptions.type        = 'POST';
                    ajaxOptions.data        = JSON.stringify(ajaxOptions.data);
                    ajaxOptions.contentType = 'application/json';
                }

                obj.last.xhr = $.ajax(ajaxOptions)
                    .done(function (data, status, xhr) {
                        obj.unlock();
                        // event before
                        var edata = obj.trigger({ phase: 'before', target: obj.name, type: 'save', xhr: xhr, status: status });
                        if (edata.isCancelled === true) return;
                        // parse server response
                        var data;
                        var responseText = xhr.responseText;
                        if (status != 'error') {
                            // default action
                            if (responseText != null && responseText !== '') {
                                // check if the onLoad handler has not already parsed the data
                                if (typeof responseText == "object") {
                                    data = responseText;
                                } else {
                                    // $.parseJSON or $.getJSON did not work because those expect perfect JSON data - where everything is in double quotes
                                    //
                                    // TODO: avoid (potentially malicious) code injection from the response.
                                    try { eval('data = '+ responseText); } catch (e) { }
                                }
                                if (data == null) {
                                    data = {
                                        status       : 'error',
                                        message      : w2utils.lang(obj.msgNotJSON),
                                        responseText : responseText
                                    };
                                }
                                if (data['status'] == 'error') {
                                    obj.error(w2utils.lang(data['message']));
                                } else {
                                    obj.original = $.extend({}, obj.record);
                                }
                            }
                        } else {
                            obj.error('AJAX Error ' + xhr.status + ': '+ xhr.statusText);
                            data = {
                                status       : 'error',
                                message      : w2utils.lang(obj.msgAJAXerror),
                                responseText : responseText
                            };
                        }
                        // event after
                        obj.trigger($.extend(edata, { phase: 'after' }));
                        obj.refresh();
                        // call back
                        if (data.status == 'success' && typeof callBack == 'function') callBack(data);
                    })
                    .fail(function (xhr, status, error) {
                        // trigger event
                        var errorObj = { status: status, error: error, rawResponseText: xhr.responseText };
                        var edata2 = obj.trigger({ phase: 'before', type: 'error', error: errorObj, xhr: xhr });
                        if (edata2.isCancelled === true) return;
                        // default behavior
                        console.log('ERROR: server communication failed. The server should return',
                            { status: 'success' }, 'OR', { status: 'error', message: 'error message' },
                            ', instead the AJAX request produced this: ', errorObj);
                        // event after
                        obj.trigger($.extend(edata2, { phase: 'after' }));
                    });
                // event after
                obj.trigger($.extend(edata, { phase: 'after' }));
            }, 50);
        },

        lock: function (msg, showSpinner) {
            var args = Array.prototype.slice.call(arguments, 0);
            args.unshift(this.box);
            setTimeout(function () { w2utils.lock.apply(window, args); }, 10);
        },

        unlock: function (speed) {
            var box = this.box;
            setTimeout(function () { w2utils.unlock(box, speed); }, 25); // needed timer so if server fast, it will not flash
        },

        goto: function (page) {
            if (this.page === page) return; // already on this page
            if (page != null) this.page = page;
            // if it was auto size, resize it
            if ($(this.box).data('auto-size') === true) $(this.box).height(0);
            this.refresh();
        },

        generateHTML: function () {
            var pages = []; // array for each page
            var group = '';
            var page;
            var column;
            var html;
            for (var f = 0; f < this.fields.length; f++) {
                html = '';
                var field = this.fields[f];
                if (field.html == null) field.html = {};
                if (field.options == null) field.options = {};
                field.html = $.extend(true, { caption: '', span: 6, attr: '', text: '', style: '', page: 0, column: 0 }, field.html);
                if (page == null) page = field.html.page;
                if (column == null) column = field.html.column;
                if (field.html.caption === '') field.html.caption = field.name;
                // input control
                var input = '<input name="'+ field.name +'" class="w2ui-input" type="text" '+ field.html.attr +'/>';
                switch (field.type) {
                    case 'pass':
                    case 'password':
                        input = '<input name="' + field.name + '" class="w2ui-input" type = "password" ' + field.html.attr + '/>';
                        break;
                    case 'checkbox':
                        input = '<input name="'+ field.name +'" class="w2ui-input" type="checkbox" '+ field.html.attr +'/>';
                        break;
                    case 'radio':
                        input = '';
                        // normalized options
                        var items =  field.options.items ? field.options.items : field.html.items;
                        if (!$.isArray(items)) items = [];
                        if (items.length > 0) {
                            items = w2obj.field.prototype.normMenu(items);
                        }
                        // generate
                        for (var i = 0; i < items.length; i++) {
                            input += '<label><input name="' + field.name + '" class="w2ui-input" type = "radio" ' + field.html.attr + ' value="'+ items[i].id + '"/>' +
                                '&#160;' + items[i].text + '</label><br/>';
                        }
                        break;
                    case 'select':
                        input = '<select name="' + field.name + '" class="w2ui-input" ' + field.html.attr + '>';
                        // normalized options
                        var items =  field.options.items ? field.options.items : field.html.items;
                        if (!$.isArray(items)) items = [];
                        if (items.length > 0) {
                            items = w2obj.field.prototype.normMenu(items);
                        }
                        // generate
                        for (var i = 0; i < items.length; i++) {
                            input += '<option value="'+ items[i].id + '">' + items[i].text + '</option>';
                        }
                        input += '</select>';
                        break;
                    case 'textarea':
                        input = '<textarea name="'+ field.name +'" class="w2ui-input" '+ field.html.attr +'></textarea>';
                        break;
                    case 'toggle':
                        input = '<input name="'+ field.name +'" type="checkbox" '+ field.html.attr +' class="w2ui-input w2ui-toggle"/><div><div></div></div>';
                        break;
                    case 'html':
                    case 'custom':
                    case 'empty':
                        input = '';
                        break;

                }
                if (group !== ''){
                    if(page != field.html.page || column != field.html.column || (field.html.group && (group != field.html.group))){
                       pages[page][column]  += '\n   </div>';
                       group = '';
                    }
                }
                if (field.html.group && (group != field.html.group)) {
                    html += '\n   <div class="w2ui-group-title">'+ field.html.group + '</div>\n   <div class="w2ui-group">';
                    group = field.html.group;
                }
                html += '\n      <div class="w2ui-field '+ (field.html.span != null ? 'w2ui-span'+ field.html.span : '') +'" style="'+ field.html.style +'">'+
                        '\n         <label>' + w2utils.lang(field.html.caption) +'</label>'+
                        '\n         <div>'+ input + w2utils.lang(field.html.text) + '</div>'+
                        '\n      </div>';
                if (pages[field.html.page] == null) pages[field.html.page] = [];
                if (pages[field.html.page][field.html.column] == null) pages[field.html.page][field.html.column] = '';
                pages[field.html.page][field.html.column] += html;
                page = field.html.page;
                column = field.html.column;
            }
            if (group !== '') pages[page][column] += '\n   </div>';
            if (this.tabs.tabs) {
                for (var i = 0; i < this.tabs.tabs.length; i++) if (pages[i] == null) pages[i] = [];
            }
            // buttons if any
            var buttons = '';
            if (!$.isEmptyObject(this.actions)) {
                var addClass = '';
                buttons += '\n<div class="w2ui-buttons">';
                for (var a in this.actions) { // it is an object
                    var act  = this.actions[a];
                    var info = { caption: '', style: '', "class": '' };
                    if ($.isPlainObject(act)) {
                        if (act.caption) info.caption = act.caption;
                        if (act.style) info.style = act.style;
                        if (act["class"]) info['class'] = act['class'];
                    } else {
                        info.caption = a;
                        if (['save', 'update', 'create'].indexOf(a.toLowerCase()) != -1) info['class'] = 'w2ui-btn-blue'; else info['class'] = '';
                    }
                    buttons += '\n    <button name="'+ a +'" class="w2ui-btn '+ info['class'] +'" style="'+ info.style +'">'+
                                            w2utils.lang(info.caption) +'</button>';
                }
                buttons += '\n</div>';
            }
            html = '';
            for (var p = 0; p < pages.length; p++){
                html += '<div class="w2ui-page page-'+ p +'"><div class="w2ui-column-container" style="display: flex;">';
                for (var c = 0; c < pages[p].length; c++){
                    html += '<div class="w2ui-column col-'+ c +'">' + (pages[p][c] || '') + '\n</div>';
                }
                html += '\n</div></div>';
            }
            html += buttons;
            return html;
        },

        action: function (action, event) {
            var act   = this.actions[action];
            var click = act;
            if ($.isPlainObject(act) && act.onClick) click = act.onClick;
            // event before
            var edata = this.trigger({ phase: 'before', target: action, type: 'action', click: click, originalEvent: event });
            if (edata.isCancelled === true) return;
            // default actions
            if (typeof click == 'function') click.call(this, event);
            // event after
            this.trigger($.extend(edata, { phase: 'after' }));
        },

        resize: function () {
            var obj = this;
            // event before
            var edata = this.trigger({ phase: 'before', target: this.name, type: 'resize' });
            if (edata.isCancelled === true) return;
            // default behaviour
            var main    = $(this.box).find('> div.w2ui-form-box');
            var header  = $(this.box).find('> div .w2ui-form-header');
            var toolbar = $(this.box).find('> div .w2ui-form-toolbar');
            var tabs    = $(this.box).find('> div .w2ui-form-tabs');
            var page    = $(this.box).find('> div .w2ui-page');
            var cpage   = $(this.box).find('> div .w2ui-page.page-'+ this.page);
            var dpage   = $(this.box).find('> div .w2ui-page.page-'+ this.page + ' > div');
            var buttons = $(this.box).find('> div .w2ui-buttons');
            // if no height, calculate it
            resizeElements();
            if (parseInt($(this.box).height()) === 0 || $(this.box).data('auto-size') === true) {
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
            if (this.toolbar && this.toolbar.resize) this.toolbar.resize();
            if (this.tabs && this.tabs.resize) this.tabs.resize();
            // event after
            obj.trigger($.extend(edata, { phase: 'after' }));

            function resizeElements() {
                // resize elements
                main.width($(obj.box).width()).height($(obj.box).height());
                toolbar.css('top', (obj.header !== '' ? w2utils.getSize(header, 'height') : 0));
                tabs.css('top', (obj.header !== '' ? w2utils.getSize(header, 'height') : 0)
                              + ((typeof obj.toolbar == 'object' && $.isArray(obj.toolbar.items) && obj.toolbar.items.length > 0) ? w2utils.getSize(toolbar, 'height') : 0));
                page.css('top', (obj.header !== '' ? w2utils.getSize(header, 'height') : 0)
                              + ((typeof obj.toolbar == 'object' && $.isArray(obj.toolbar.items) && obj.toolbar.items.length > 0) ? w2utils.getSize(toolbar, 'height') + 5 : 0)
                              + ((typeof obj.tabs === 'object' && $.isArray(obj.tabs.tabs) && obj.tabs.tabs.length > 0) ? w2utils.getSize(tabs, 'height') + 5 : 0));
                page.css('bottom', (buttons.length > 0 ? w2utils.getSize(buttons, 'height') : 0));
            }
        },

        refresh: function (field) {
            var time = (new Date()).getTime();
            var obj = this;
            if (!this.box) return;
            if (!this.isGenerated || $(this.box).html() == null) return;
            // event before
            var edata = this.trigger({ phase: 'before', target: this.name, type: 'refresh', page: this.page, field: field });
            if (edata.isCancelled === true) return;
            if (field != null) {
                var from_field = obj.get(field, true);
                var to_field = from_field + 1;
            } else {
                // update what page field belongs
                $(this.box).find('input, textarea, select').each(function (index, el) {
                    var name  = ($(el).attr('name') != null ? $(el).attr('name') : $(el).attr('id'));
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
                var from_field = 0;
                var to_field = this.fields.length;
            }
            // refresh values of fields
            for (var f = from_field; f < to_field; f++) {
                var field = this.fields[f];
                if (field.name == null && field.field != null) field.name = field.field;
                if (field.field == null && field.name != null) field.field = field.name;
                field.$el = $(this.box).find('[name="'+ String(field.name).replace(/\\/g, '\\\\') +'"]');
                field.el  = field.$el[0];
                if (field.el == null) {
                    console.log('ERROR: Cannot associate field "'+ field.name + '" with html control. Make sure html control exists with the same name.');
                    //return;
                }
                if (field.el) field.el.id = field.name;
                var tmp = $(field).data('w2field');
                if (tmp) tmp.clear();
                $(field.$el).off('change').on('change', function () {
                    var value_new      = this.value;
                    var value_previous = obj.record[this.name] ? obj.record[this.name] : '';
                    var field          = obj.get(this.name);
                    if (['list', 'enum', 'file'].indexOf(field.type) != -1 && $(this).data('selected')) {
                        var nv = $(this).data('selected');
                        var cv = obj.record[this.name];
                        if ($.isArray(nv)) {
                            value_new = [];
                            for (var i = 0; i < nv.length; i++) value_new[i] = $.extend(true, {}, nv[i]); // clone array
                        }
                        if ($.isPlainObject(nv)) {
                            value_new = $.extend(true, {}, nv); // clone object
                        }
                        if ($.isArray(cv)) {
                            value_previous = [];
                            for (var i = 0; i < cv.length; i++) value_previous[i] = $.extend(true, {}, cv[i]); // clone array
                        }
                        if ($.isPlainObject(cv)) {
                            value_previous = $.extend(true, {}, cv); // clone object
                        }
                    }
                    if (['toggle', 'checkbox'].indexOf(field.type) != -1) {
                        value_new = ($(this).prop('checked') ? ($(this).prop('value') == 'on' ? true : $(this).prop('value')) : false);
                    }
                    // clean extra chars
                    if (['int', 'float', 'percent', 'money', 'currency'].indexOf(field.type) != -1) {
                        value_new = $(this).data('w2field').clean(value_new);
                    }
                    if (value_new === value_previous) return;
                    // event before
                    var edata2 = obj.trigger({ phase: 'before', target: this.name, type: 'change', value_new: value_new, value_previous: value_previous });
                    if (edata2.isCancelled === true) {
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
                    if (['int', 'float', 'percent', 'money', 'currency', 'list', 'combo', 'enum', 'file', 'toggle'].indexOf(field.type) != -1) {
                        val = value_new;
                    }
                    if (['enum', 'file'].indexOf(field.type) != -1) {
                        if (val.length > 0) {
                            var fld = $(field.el).data('w2field').helpers.multi;
                            $(fld).removeClass('w2ui-error');
                        }
                    }
                    if (val === '' || val == null || ($.isArray(val) && val.length === 0) || ($.isPlainObject(val) && $.isEmptyObject(val))) {
                        val = null;
                    }
                    obj.record[this.name] = val;
                    // event after
                    obj.trigger($.extend(edata2, { phase: 'after' }));
                });
                // required
                if (field.required) {
                    $(field.el).parent().parent().addClass('w2ui-required');
                } else {
                    $(field.el).parent().parent().removeClass('w2ui-required');
                }
                // disabled
                if (field.disabled != null) {
                    if (field.disabled) {
                        $(field.el).prop('readonly', true);
                    } else {
                        $(field.el).prop('readonly', false);
                    }
                }
                // hidden
                if (field.hidden) {
                    $(field.el).parent().parent().hide();
                } else {
                    $(field.el).parent().parent().show();
                }
            }
            // attach actions on buttons
            $(this.box).find('button, input[type=button]').each(function (index, el) {
                $(el).off('click').on('click', function (event) {
                    var action = this.value;
                    if (this.id)   action = this.id;
                    if (this.name) action = this.name;
                    obj.action(action, event);
                });
            });
            // init controls with record
            for (var f = from_field; f < to_field; f++) {
                var field = this.fields[f];
                var value = (this.record[field.name] != null ? this.record[field.name] : '');
                if (!field.el) continue;
                if (!$(field.el).hasClass('w2ui-input')) $(field.el).addClass('w2ui-input');
                field.type = String(field.type).toLowerCase();
                if (!field.options) field.options = {};
                switch (field.type) {
                    case 'text':
                    case 'textarea':
                    case 'email':
                    case 'pass':
                    case 'password':
                        field.el.value = value;
                        break;
                    case 'int':
                    case 'float':
                    case 'money':
                    case 'currency':
                    case 'percent':
                        // issue #761
                        field.el.value = value;
                        $(field.el).w2field($.extend({}, field.options, { type: field.type }));
                        break;
                    case 'hex':
                    case 'alphanumeric':
                    case 'color':
                    case 'date':
                    case 'time':
                        field.el.value = value;
                        $(field.el).w2field($.extend({}, field.options, { type: field.type }));
                        break;
                    case 'toggle':
                        if (w2utils.isFloat(value)) value = parseFloat(value);
                        $(field.el).prop('checked', (value ? true : false));
                        this.record[field.name] = (value ? value : false);
                        break;
                    // enums
                    case 'list':
                    case 'combo':
                        if (field.type == 'list') {
                            var tmp_value = ($.isPlainObject(value) ? value.id : ($.isPlainObject(field.options.selected) ? field.options.selected.id : value));
                            // normalized options
                            if (!field.options.items) field.options.items = [];
                            var items = field.options.items;
                            if ($.isArray(items) && items.length > 0 && !$.isPlainObject(items[0])) {
                                field.options.items = w2obj.field.prototype.normMenu(items);
                            }
                            // find value from items
                            for (var i = 0; i < field.options.items.length; i++) {
                                var item = field.options.items[i];
                                if (item.id == tmp_value) {
                                    value = $.extend(true, {}, item);
                                    obj.record[field.name] = value;
                                    break;
                                }
                            }
                        } else if (field.type == 'combo' && !$.isPlainObject(value)) {
                            field.el.value = value;
                        } else if ($.isPlainObject(value) && value.text != null) {
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
                        if (items != null && items.length > 0) {
                            items = w2obj.field.prototype.normMenu(items);
                            $(field.el).html('');
                            for (var it = 0; it < items.length; it++) {
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
                    case 'html':
                    case 'custom':
                    case 'empty':
                        break;
                    default:
                        $(field.el).val(value);
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
            this.trigger($.extend(edata, { phase: 'after' }));
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
            if (!this.box) return;
            // event before
            var edata = this.trigger({ phase: 'before', target: this.name, type: 'render', box: (box != null ? box : this.box) });
            if (edata.isCancelled === true) return;
            // default actions
            if ($.isEmptyObject(this.original) && !$.isEmptyObject(this.record)) {
                this.original = $.extend(true, {}, this.record);
            }
            var html =  '<div class="w2ui-form-box">' +
                        (this.header !== '' ? '<div class="w2ui-form-header">' + this.header + '</div>' : '') +
                        '    <div id="form_'+ this.name +'_toolbar" class="w2ui-form-toolbar" style="display: none"></div>' +
                        '    <div id="form_'+ this.name +'_tabs" class="w2ui-form-tabs" style="display: none"></div>' +
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
                    var edata = obj.trigger({ phase: 'before', type: 'toolbar', target: event.target, originalEvent: event });
                    if (edata.isCancelled === true) return;
                    // no default action
                    obj.trigger($.extend(edata, { phase: 'after' }));
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
            this.trigger($.extend(edata, { phase: 'after' }));
            // after render actions
            this.resize();
            var url = (typeof this.url != 'object' ? this.url : this.url.get);
            if (url && this.recid !== 0 && this.recid != null) {
                this.request();
            } else {
                this.refresh();
            }
            // attach to resize event
            if ($('.w2ui-layout').length === 0) { // if there is layout, it will send a resize event
                this.tmp_resize = function (event) { w2ui[obj.name].resize(); };
                $(window).off('resize', 'body').on('resize', 'body', this.tmp_resize);
            }
            setTimeout(function () { obj.resize(); obj.refresh(); }, 150); // need timer because resize is on timer
            // focus on load
            function focusEl() {
                var inputs = $(obj.box).find('input, select, textarea');
                if (inputs.length > obj.focus) inputs[obj.focus].focus();
            }
            if (this.focus >= 0) {
                setTimeout(function () {
                    // if not rendered in 10ms, then wait 500ms
                    if ($(obj.box).find('input, select, textarea').length === 0) {
                        setTimeout(focusEl, 500); // need timeout to allow form to render
                    } else {
                        focusEl();
                    }
                }, 10);
            }
            return (new Date()).getTime() - time;
        },

        destroy: function () {
            // event before
            var edata = this.trigger({ phase: 'before', target: this.name, type: 'destroy' });
            if (edata.isCancelled === true) return;
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
            this.trigger($.extend(edata, { phase: 'after' }));
            $(window).off('resize', 'body')
        }
    };

    $.extend(w2form.prototype, w2utils.event);
    w2obj.form = w2form;
})(jQuery);
