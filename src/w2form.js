/************************************************************************
*   Part of w2ui 2.0 library
*   - Dependencies: jQuery, w2utils, w2toolbar, w2tabs
*
* == TODO ==
*   - include delta on save
*   - two way data bindings
*   - rename applyFocus -> focus
*   - tabs below some fields (could already be implemented)
*   - form with toolbar & tabs
*   - promise for load, save, etc.
*
* == 2.0 changes
*
************************************************************************/

import { w2event } from './w2event.js'
import { w2ui, w2utils } from './w2utils.js'
import { w2tabs } from './w2tabs.js'
import { w2toolbar } from './w2toolbar.js'

class w2form extends w2event {
    constructor(options) {
        super(options.name)
        this.name         = null
        this.header       = ''
        this.box          = null // HTML element that hold this element
        this.url          = ''
        this.routeData    = {} // data for dynamic routes
        this.formURL      = '' // url where to get form HTML
        this.formHTML     = '' // form HTML (might be loaded from the url)
        this.page         = 0 // current page
        this.pageStyle    = ''
        this.recid        = 0 // can be null or 0
        this.fields       = []
        this.actions      = {}
        this.record       = {}
        this.original     = null
        this.postData     = {}
        this.httpHeaders  = {}
        this.method       = null // only used when not null, otherwise set based on w2utils.settings.dataType
        this.toolbar      = {} // if not empty, then it is toolbar
        this.tabs         = {} // if not empty, then it is tabs object
        this.style        = ''
        this.focus        = 0 // focus first or other element
        this.autosize     = true // autosize, if false the container must have a height set
        this.nestedFields = true // use field name containing dots as separator to look into object
        this.multipart    = false
        this.tabindexBase = 0 // this will be added to the auto numbering
        this.isGenerated  = false
        this.last         = {
            xhr: null, // jquery xhr requests
            errors: []
        }
        this.onRequest    = null
        this.onLoad       = null
        this.onValidate   = null
        this.onSubmit     = null
        this.onProgress   = null
        this.onSave       = null
        this.onChange     = null
        this.onInput      = null
        this.onRender     = null
        this.onRefresh    = null
        this.onResize     = null
        this.onDestroy    = null
        this.onAction     = null
        this.onToolbar    = null
        this.onError      = null
        this.msgNotJSON   = 'Returned data is not in valid JSON format.'
        this.msgAJAXerror = 'AJAX error. See console for more details.'
        this.msgRefresh   = 'Loading...'
        this.msgSaving    = 'Saving...'
        // mix in options
        $.extend(true, this, options)

        // When w2utils.settings.dataType is JSON, then we can convert the save request to multipart/form-data. So we can upload large files with the form
        // The original body is JSON.stringified to __body

        // remember items
        let record   = options.record
        let original = options.original
        let fields   = options.fields
        let toolbar  = options.toolbar
        let tabs     = options.tabs
        // extend items
        $.extend(this, { record: {}, original: null, fields: [], tabs: {}, toolbar: {}, handlers: [] })
        if (Array.isArray(tabs)) {
            $.extend(true, this.tabs, { tabs: [] })
            for (let t = 0; t < tabs.length; t++) {
                let tmp = tabs[t]
                if (typeof tmp === 'object') {
                    this.tabs.tabs.push(tmp)
                    if(tmp.active === true) {
                        this.tabs.active = tmp.id
                    }
                } else {
                    this.tabs.tabs.push({ id: tmp, text: tmp })
                }
            }
        } else {
            $.extend(true, this.tabs, tabs)
        }
        $.extend(true, this.toolbar, toolbar)
        // preprocess fields
        if (fields) {
            this.fields = _processFields(fields)
        }
        for (let p in record) { // it is an object
            if ($.isPlainObject(record[p])) {
                this.record[p] = $.extend(true, {}, record[p])
            } else {
                this.record[p] = record[p]
            }
        }
        for (let p in original) { // it is an object
            if ($.isPlainObject(original[p])) {
                this.original[p] = $.extend(true, {}, original[p])
            } else {
                this.original[p] = original[p]
            }
        }
        // generate html if necessary
        if (this.formURL !== '') {
            $.get(this.formURL, (data) => { // should always be $.get as it is template
                this.formHTML    = data
                this.isGenerated = true
            })
        } else if (!this.formURL && !this.formHTML) {
            this.formHTML    = this.generateHTML()
            this.isGenerated = true
        }

        function _processFields(fields) {
            let newFields = []
            // if it is an object
            if ($.isPlainObject(fields)) {
                let tmp = fields
                fields = []
                Object.keys(tmp).forEach((key) => {
                    let fld = tmp[key]
                    if (fld.type == 'group') {
                        fld.text = key
                        if ($.isPlainObject(fld.fields)) {
                            let tmp2 = fld.fields
                            fld.fields = []
                            Object.keys(tmp2).forEach((key2) => {
                                let fld2 = tmp2[key2]
                                fld2.field = key2
                                fld.fields.push(_process(fld2))

                            })
                        }
                    } else {
                        fld.field = key
                    }
                    fields.push(fld.type == 'group' ? fld : _process(fld))
                })
                function _process(fld) {
                    let ignore = ['html']
                    if (fld.html == null) fld.html = {}
                    Object.keys(fld).forEach((key => {
                        if (ignore.indexOf(key) != -1) return
                        if (['label', 'attr', 'style', 'text', 'span', 'page', 'column', 'anchor',
                            'group', 'groupStyle', 'groupTitleStyle', 'groupCollapsible'].indexOf(key) != -1) {
                            fld.html[key] = fld[key]
                            delete fld[key]
                        }
                    }))
                    return fld
                }
            }
            // process groups
            fields.forEach(field => {
                if (field.type == 'group') {
                    // group properties
                    let group = {
                        group: field.text || '',
                        groupStyle: field.style || '',
                        groupTitleStyle: field.titleStyle || '',
                        groupCollapsible: field.collapsible === true ? true : false,
                    }
                    // loop through fields
                    if (Array.isArray(field.fields)) {
                        field.fields.forEach(gfield => {
                            let fld = $.extend(true, {}, gfield)
                            if (fld.html == null) fld.html = {}
                            $.extend(fld.html, group)
                            Array('span', 'page', 'column', 'attr').forEach(key => {
                                if (fld.html[key] == null && field[key] != null) {
                                    fld.html[key] = field[key]
                                }
                            })
                            if (fld.field == null && fld.name != null) {
                                console.log('NOTICE: form field.name property is deprecated, please use field.field. Field ->', field)
                                fld.field = fld.name
                            }
                            newFields.push(fld)
                        })
                    }
                } else {
                    let fld = $.extend(true, {}, field)
                    if (fld.field == null && fld.name != null) {
                        console.log('NOTICE: form field.name property is deprecated, please use field.field. Field ->', field)
                        fld.field = fld.name
                    }
                    newFields.push(fld)
                }
            })
            return newFields
        }
    }

    get(field, returnIndex) {
        if (arguments.length === 0) {
            let all = []
            for (let f1 = 0; f1 < this.fields.length; f1++) {
                if (this.fields[f1].field != null) all.push(this.fields[f1].field)
            }
            return all
        } else {
            for (let f2 = 0; f2 < this.fields.length; f2++) {
                if (this.fields[f2].field == field) {
                    if (returnIndex === true) return f2; else return this.fields[f2]
                }
            }
            return null
        }
    }

    set(field, obj) {
        for (let f = 0; f < this.fields.length; f++) {
            if (this.fields[f].field == field) {
                $.extend(this.fields[f] , obj)
                this.refresh(field)
                return true
            }
        }
        return false
    }

    getValue(field) {
        if (this.nestedFields) {
            let val = undefined
            try { // need this to make sure no error in fields
                let rec = this.record
                val     = String(field).split('.').reduce((rec, i) => { return rec[i] }, rec)
            } catch (event) {
            }
            return val
        } else {
            return this.record[field]
        }
    }

    setValue(field, value) { // will not refresh the form!
        if (this.nestedFields) {
            try { // need this to make sure no error in fields
                let rec = this.record
                String(field).split('.').map((fld, i, arr) => {
                    if (arr.length - 1 !== i) {
                        if (rec[fld]) rec = rec[fld]; else { rec[fld] = {}; rec = rec[fld] }
                    } else {
                        rec[fld] = value
                    }
                })
                return true
            } catch (event) {
                return false
            }
        } else {
            this.record[field] = value
            return true
        }
    }

    show() {
        let effected = []
        for (let a = 0; a < arguments.length; a++) {
            let fld = this.get(arguments[a])
            if (fld && fld.hidden) {
                fld.hidden = false
                effected.push(fld.field)
            }
        }
        if (effected.length > 0) this.refresh.apply(this, effected)
        this.updateEmptyGroups()
        return effected
    }

    hide() {
        let effected = []
        for (let a = 0; a < arguments.length; a++) {
            let fld = this.get(arguments[a])
            if (fld && !fld.hidden) {
                fld.hidden = true
                effected.push(fld.field)
            }
        }
        if (effected.length > 0) this.refresh.apply(this, effected)
        this.updateEmptyGroups()
        return effected
    }

    enable() {
        let effected = []
        for (let a = 0; a < arguments.length; a++) {
            let fld = this.get(arguments[a])
            if (fld && fld.disabled) {
                fld.disabled = false
                effected.push(fld.field)
            }
        }
        if (effected.length > 0) this.refresh.apply(this, effected)
        return effected
    }

    disable() {
        let effected = []
        for (let a = 0; a < arguments.length; a++) {
            let fld = this.get(arguments[a])
            if (fld && !fld.disabled) {
                fld.disabled = true
                effected.push(fld.field)
            }
        }
        if (effected.length > 0) this.refresh.apply(this, effected)
        return effected
    }

    updateEmptyGroups() {
        // hide empty groups
        $(this.box).find('.w2ui-group').each((ind, group) =>{
            if (isHidden($(group).find('.w2ui-field'))) {
                $(group).hide()
            } else {
                $(group).show()
            }
        })
        function isHidden($els) {
            let flag = true
            $els.each((ind, el) => {
                if (el.style.display != 'none') flag = false
            })
            return flag
        }
    }

    change() {
        Array.from(arguments).forEach((field) => {
            let tmp = this.get(field)
            if (tmp.$el) tmp.$el.change()
        })
    }

    reload(callBack) {
        let url = (typeof this.url !== 'object' ? this.url : this.url.get)
        if (url && this.recid !== 0 && this.recid != null) {
            // this.clear();
            this.request(callBack)
        } else {
            // this.refresh(); // no need to refresh
            if (typeof callBack === 'function') callBack()
        }
    }

    clear() {
        if (arguments.length != 0) {
            Array.from(arguments).forEach((field) => {
                let rec = this.record
                String(field).split('.').map((fld, i, arr) => {
                    if (arr.length - 1 !== i) rec = rec[fld]; else delete rec[fld]
                })
                this.refresh(field)
            })
        } else {
            this.recid    = 0
            this.record   = {}
            this.original = null
            this.refresh()
        }
        $().w2tag()
    }

    error(msg) {
        let obj = this
        // let the management of the error outside of the form
        let edata = this.trigger({ target: this.name, type: 'error', message: msg , xhr: this.last.xhr })
        if (edata.isCancelled === true) {
            return
        }
        // need a time out because message might be already up)
        setTimeout(() => { obj.message(msg) }, 1)
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
    }

    message(options) {
        if (typeof options == 'string') {
            options = {
                width : (options.length < 300 ? 350 : 550),
                height: (options.length < 300 ? 170: 250),
                body  : `<div class="w2ui-centered">${options}</div>`,
                onOpen(event) {
                    setTimeout(() => { $(event.box).find('.w2ui-btn').focus() }, 25)
                }
            }
        }
        if (options && options.buttons == null) {
            options.buttons = `<button type="button" class="w2ui-btn" onclick="w2ui['${this.name}'].message()">
                ${w2utils.lang('Ok')}
            </button>`
        }
        return w2utils.message.call(this, {
            box   : this.box,
            path  : 'w2ui.' + this.name,
            title : '.w2ui-form-header:visible',
            body  : '.w2ui-form-box'
        }, options)
    }

    confirm(options) {
        let form = this
        if (typeof options == 'string') {
            options = {
                width: (options.length < 300 ? 350 : 550),
                height: (options.length < 300 ? 170: 250),
                body: '<div class="w2ui-centered">' + options + '</div>'
            }
        }
        let yes_click = () => {
            if (typeof options.yes_click == 'function') {
                options.yes_click('yes')
            }
            if (typeof options.callBack == 'function') {
                options.callBack('yes')
            }
            form.message()
        }
        let no_click = () => {
            if (typeof options.no_click == 'function') {
                options.no_click('no')
            }
            if (typeof options.callBack == 'function') {
                options.callBack('no')
            }
            form.message()
        }
        let btn1 = `<button type="button" class="w2ui-btn btn-yes ${options.yes_class || ''}">${w2utils.lang(options.yes_text || 'Yes')}</button>`
        let btn2 = `<button type="button" class="w2ui-btn btn-no ${options.no_class || ''}">${w2utils.lang(options.no_text || 'No')}</button>`

        Object.assign(options, {
            buttons: w2utils.settings.macButtonOrder
                ? btn2 + btn1
                : btn1 + btn2,
            onOpen(event) {
                setTimeout(() => {
                    let $btns = $(this.box).find('.w2ui-btn')
                    $btns.off('.message')
                        .on('blur.message', function(evt) {
                            // last input
                            if ($btns.index(evt.target) + 1 === $btns.length) {
                                $btns.get(0).focus()
                                evt.preventDefault()
                            }
                        })
                        .on('keydown.message', function(evt) {
                            if (evt.keyCode == 27) no_click() // esc
                        })
                        .focus()
                    $(this.box).find('.w2ui-btn.btn-yes')
                        .off('click')
                        .on('click', yes_click)
                    $(this.box).find('.w2ui-btn.btn-no')
                        .off('click')
                        .on('click', no_click)
                }, 25)
            }
        })
        w2utils.message.call(this, {
            box   : this.box,
            path  : 'w2ui.' + this.name,
            title : '.w2ui-form-header:visible',
            body  : '.w2ui-form-box'
        }, options)

        let prom = {
            yes(callBack) {
                options.yes_click = callBack
                return prom
            },
            no(callBack) {
                options.no_click = callBack
                return prom
            },
            then(callBack) {
                options.callBack = callBack
                return prom
            }
        }
        return prom
    }

    validate(showErrors) {
        if (showErrors == null) showErrors = true
        $().w2tag() // hide all tags before validating
        // validate before saving
        let errors = []
        for (let f = 0; f < this.fields.length; f++) {
            let field = this.fields[f]
            if (this.getValue(field.field) == null) this.setValue(field.field, '')
            if (['int', 'float', 'currency', 'money'].indexOf(field.type) != -1) {
                let val = this.getValue(field.field)
                let min = field.options.min
                let max = field.options.max
                if (min != null && val < min) {
                    errors.push({ field: field, error: w2utils.lang('Should be more than ${min}', { min }) })
                }
                if (max != null && val > max) {
                    errors.push({ field: field, error: w2utils.lang('Should be less than ${max}', { max }) })
                }
            }
            switch (field.type) {
                case 'alphanumeric':
                    if (this.getValue(field.field) && !w2utils.isAlphaNumeric(this.getValue(field.field))) {
                        errors.push({ field: field, error: w2utils.lang('Not alpha-numeric') })
                    }
                    break
                case 'int':
                    if (this.getValue(field.field) && !w2utils.isInt(this.getValue(field.field))) {
                        errors.push({ field: field, error: w2utils.lang('Not an integer') })
                    }
                    break
                case 'percent':
                case 'float':
                    if (this.getValue(field.field) && !w2utils.isFloat(this.getValue(field.field))) {
                        errors.push({ field: field, error: w2utils.lang('Not a float') })
                    }
                    break
                case 'currency':
                case 'money':
                    if (this.getValue(field.field) && !w2utils.isMoney(this.getValue(field.field))) {
                        errors.push({ field: field, error: w2utils.lang('Not in money format') })
                    }
                    break
                case 'color':
                case 'hex':
                    if (this.getValue(field.field) && !w2utils.isHex(this.getValue(field.field))) {
                        errors.push({ field: field, error: w2utils.lang('Not a hex number') })
                    }
                    break
                case 'email':
                    if (this.getValue(field.field) && !w2utils.isEmail(this.getValue(field.field))) {
                        errors.push({ field: field, error: w2utils.lang('Not a valid email') })
                    }
                    break
                case 'checkbox':
                    // convert true/false
                    if (this.getValue(field.field) == true) this.setValue(field.field, 1); else this.setValue(field.field, 0)
                    break
                case 'date':
                    // format date before submit
                    if (!field.options.format) field.options.format = w2utils.settings.dateFormat
                    if (this.getValue(field.field) && !w2utils.isDate(this.getValue(field.field), field.options.format)) {
                        errors.push({ field: field, error: w2utils.lang('Not a valid date') + ': ' + field.options.format })
                    }
                    break
                case 'list':
                case 'combo':
                    break
                case 'enum':
                    break
            }
            // === check required - if field is '0' it should be considered not empty
            let val = this.getValue(field.field)
            if (field.required && field.hidden !== true && ['div', 'custom', 'html', 'empty'].indexOf(field.type) == -1
                    && (val === '' || (Array.isArray(val) && val.length === 0) || ($.isPlainObject(val) && $.isEmptyObject(val)))) {
                errors.push({ field: field, error: w2utils.lang('Required field') })
            }
            if (field.options && field.hidden !== true && field.options.minLength > 0
                    && ['enum', 'list', 'combo'].indexOf(field.type) == -1 // since minLength is used there too
                    && this.getValue(field.field).length < field.options.minLength) {
                errors.push({ field: field, error: w2utils.lang('Field should be at least ${count} characters.', {count: field.options.minLength}) })
            }
        }
        // event before
        let edata = this.trigger({ phase: 'before', target: this.name, type: 'validate', errors: errors })
        if (edata.isCancelled === true) return
        // show error
        this.last.errors = errors
        if (showErrors) this.showErrors()
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
        return errors
    }

    showErrors() {
        let errors = this.last.errors
        if (errors.length > 0) {
            let err = errors[0]
            // scroll into view
            this.goto(errors[0].field.page)
            $(err.field.$el).parents('.w2ui-field')[0].scrollIntoView(true)
            // show errors
            for (let i = 0; i < errors.length; i++) {
                err     = errors[i]
                let opt = $.extend({ 'class': 'w2ui-error', hideOnFocus: true }, err.options)
                if (err.field == null) continue
                if (err.field.type === 'radio') { // for radio and checkboxes
                    $($(err.field.el).closest('div')[0]).w2tag(err.error, opt)
                } else if (['enum', 'file'].indexOf(err.field.type) !== -1) {
                    (function closure(err) {
                        setTimeout(() => {
                            let fld = $(err.field.el).data('w2field').helpers.multi
                            $(err.field.el).w2tag(err.error, err.options)
                            $(fld).addClass('w2ui-error')
                        }, 1)
                    })(err)
                } else {
                    $(err.field.el).w2tag(err.error, opt)
                }
            }
            // hide errors on scroll
            setTimeout(() => {
                let err = errors[0]
                $(err.field.$el).parents('.w2ui-page').off('.hideErrors').on('scroll.hideErrors', function(event) {
                    for (let i = 0; i < errors.length; i++) {
                        err = errors[i]
                        $(err.field.el).w2tag()
                    }
                    $(err.field.$el).parents('.w2ui-page').off('.hideErrors')
                })
            }, 300)
        }
    }

    getChanges() {
        let diff = {}
        if (this.original != null && typeof this.original == 'object' && !$.isEmptyObject(this.record)) {
            diff = doDiff(this.record, this.original, {})
        }
        return diff

        function doDiff(record, original, result) {
            if (Array.isArray(record) && Array.isArray(original)) {
                while (record.length < original.length) {
                    record.push(null)
                }
            }
            for (let i in record) {
                if (record[i] != null && typeof record[i] === 'object') {
                    result[i] = doDiff(record[i], original[i] || {}, {})
                    if (!result[i] || ($.isEmptyObject(result[i]) && $.isEmptyObject(original[i]))) delete result[i]
                } else if (record[i] != original[i] || (record[i] == null && original[i] != null)) { // also catch field clear
                    result[i] = record[i]
                }
            }
            return !$.isEmptyObject(result) ? result : null
        }
    }

    getCleanRecord(strict) {
        let data = $.extend(true, {}, this.record)
        this.fields.forEach((fld) => {
            if (['list', 'combo', 'enum'].indexOf(fld.type) != -1) {
                let tmp = { nestedFields: true, record: data }
                let val = this.getValue.call(tmp, fld.field)
                if ($.isPlainObject(val) && val.id != null) { // should be true if val.id === ''
                    this.setValue.call(tmp, fld.field, val.id)
                }
                if (Array.isArray(val)) {
                    val.forEach((item, ind) => {
                        if ($.isPlainObject(item) && item.id) {
                            val[ind] = item.id
                        }
                    })
                }
            }
            if (fld.type == 'map') {
                let tmp = { nestedFields: true, record: data }
                let val = this.getValue.call(tmp, fld.field)
                if (val._order) delete val._order
            }
        })
        // return only records present in description
        if (strict === true) {
            Object.keys(data).forEach((key) => {
                if (!this.get(key)) delete data[key]
            })
        }
        return data
    }

    request(postData, callBack) { // if (1) param then it is call back if (2) then postData and callBack
        let obj = this
        // check for multiple params
        if (typeof postData === 'function') {
            callBack = postData
            postData = null
        }
        if (postData == null) postData = {}
        if (!this.url || (typeof this.url === 'object' && !this.url.get)) return
        if (this.recid == null) this.recid = 0
        // build parameters list
        let params = {}
        // add list params
        params.cmd   = 'get'
        params.recid = this.recid
        params.name  = this.name
        // append other params
        $.extend(params, this.postData)
        $.extend(params, postData)
        // event before
        let edata = this.trigger({ phase: 'before', type: 'request', target: this.name, url: this.url, postData: params, httpHeaders: this.httpHeaders })
        if (edata.isCancelled === true) { if (typeof callBack === 'function') callBack({ status: 'error', message: w2utils.lang('Request aborted.') }); return }
        // default action
        this.record   = {}
        this.original = null
        // call server to get data
        this.lock(w2utils.lang(this.msgRefresh))
        let url = edata.url
        if (typeof edata.url === 'object' && edata.url.get) url = edata.url.get
        if (this.last.xhr) try { this.last.xhr.abort() } catch (e) {}
        // process url with routeData
        if (!$.isEmptyObject(obj.routeData)) {
            let info = w2utils.parseRoute(url)
            if (info.keys.length > 0) {
                for (let k = 0; k < info.keys.length; k++) {
                    if (obj.routeData[info.keys[k].name] == null) continue
                    url = url.replace((new RegExp(':'+ info.keys[k].name, 'g')), obj.routeData[info.keys[k].name])
                }
            }
        }
        let ajaxOptions = {
            type     : 'POST',
            url      : url,
            data     : edata.postData,
            headers  : edata.httpHeaders,
            dataType : 'json' // expected from server
        }
        let dataType    = obj.dataType || w2utils.settings.dataType
        if (edata.dataType) dataType = edata.dataType
        switch (dataType) {
            case 'HTTP':
                ajaxOptions.data = String($.param(ajaxOptions.data, false)).replace(/%5B/g, '[').replace(/%5D/g, ']')
                break
            case 'HTTPJSON':
                ajaxOptions.data = { request: JSON.stringify(ajaxOptions.data) }
                break
            case 'RESTFULL':
                ajaxOptions.type = 'GET'
                ajaxOptions.data = String($.param(ajaxOptions.data, false)).replace(/%5B/g, '[').replace(/%5D/g, ']')
                break
            case 'RESTFULLJSON':
                ajaxOptions.type        = 'GET'
                ajaxOptions.data        = JSON.stringify(ajaxOptions.data)
                ajaxOptions.contentType = 'application/json'
                break
            case 'JSON':
                ajaxOptions.type        = 'POST'
                ajaxOptions.data        = JSON.stringify(ajaxOptions.data)
                ajaxOptions.contentType = 'application/json'
                break
        }
        if (this.method) ajaxOptions.type = this.method
        if (edata.method) ajaxOptions.type = edata.method
        this.last.xhr = $.ajax(ajaxOptions)
            .done((data, status, xhr) => {
                obj.unlock()
                // prepare record
                data = xhr.responseJSON
                if (data == null) {
                    data = {
                        status       : 'error',
                        message      : w2utils.lang(obj.msgNotJSON),
                        responseText : xhr.responseText
                    }
                }
                // event before
                let edata = obj.trigger({ phase: 'before', target: obj.name, type: 'load', data: data, xhr: xhr })
                if (edata.isCancelled === true) {
                    if (typeof callBack === 'function') callBack({ status: 'error', message: w2utils.lang('Request aborted.') })
                    return
                }
                // parse server response
                if (edata.data.status === 'error') {
                    obj.error(w2utils.lang(edata.data.message))
                } else {
                    obj.record = $.extend({}, edata.data.record)
                }
                // event after
                obj.trigger($.extend(edata, { phase: 'after' }))
                obj.refresh()
                obj.applyFocus()
                // call back
                if (typeof callBack === 'function') callBack(edata.data)
            })
            .fail((xhr, status, error) => {
                // trigger event
                let errorObj = { status: status, error: error, rawResponseText: xhr.responseText }
                let edata2   = obj.trigger({ phase: 'before', type: 'error', error: errorObj, xhr: xhr })
                if (edata2.isCancelled === true) return
                // default behavior
                if (status !== 'abort') {
                    let data
                    try { data = typeof xhr.responseJSON === 'object' ? xhr.responseJSON : JSON.parse(xhr.responseText) } catch (e) {}
                    console.log('ERROR: Server communication failed.',
                        '\n   EXPECTED:', { status: 'success', items: [{ id: 1, text: 'item' }] },
                        '\n         OR:', { status: 'error', message: 'error message' },
                        '\n   RECEIVED:', typeof data === 'object' ? data : xhr.responseText)
                    obj.unlock()
                }
                // event after
                obj.trigger($.extend(edata2, { phase: 'after' }))
            })
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
    }

    submit(postData, callBack) {
        return this.save(postData, callBack)
    }

    save(postData, callBack) {
        let obj = this
        $(this.box).find(':focus').change() // trigger onchange
        // check for multiple params
        if (typeof postData === 'function') {
            callBack = postData
            postData = null
        }
        // validation
        let errors = obj.validate(true)
        if (errors.length !== 0) return
        // submit save
        if (postData == null) postData = {}
        if (!obj.url || (typeof obj.url === 'object' && !obj.url.save)) {
            console.log('ERROR: Form cannot be saved because no url is defined.')
            return
        }
        obj.lock(w2utils.lang(obj.msgSaving) + ' <span id="'+ obj.name +'_progress"></span>')
        // need timer to allow to lock
        setTimeout(() => {
            // build parameters list
            let params = {}
            // add list params
            params.cmd   = 'save'
            params.recid = obj.recid
            params.name  = obj.name
            // append other params
            $.extend(params, obj.postData)
            $.extend(params, postData)
            // clear up files
            if (!obj.multipart)
                obj.fields.forEach((item) => {
                    if (item.type === 'file' && Array.isArray(obj.getValue(item.field))) {
                        obj.getValue(item.field).forEach((fitem) => {
                            delete fitem.file
                        })
                    }
                })
            params.record = $.extend(true, {}, obj.record)
            // event before
            let edata = obj.trigger({ phase: 'before', type: 'submit', target: obj.name, url: obj.url, postData: params, httpHeaders: obj.httpHeaders })
            if (edata.isCancelled === true) return
            // default action
            let url = edata.url
            if (typeof edata.url === 'object' && edata.url.save) url = edata.url.save
            if (obj.last.xhr) try { obj.last.xhr.abort() } catch (e) {}
            // process url with routeData
            if (!$.isEmptyObject(obj.routeData)) {
                let info = w2utils.parseRoute(url)
                if (info.keys.length > 0) {
                    for (let k = 0; k < info.keys.length; k++) {
                        if (obj.routeData[info.keys[k].name] == null) continue
                        url = url.replace((new RegExp(':'+ info.keys[k].name, 'g')), obj.routeData[info.keys[k].name])
                    }
                }
            }
            let ajaxOptions = {
                type     : 'POST',
                url      : url,
                data     : edata.postData,
                headers  : edata.httpHeaders,
                dataType : 'json', // expected from server
                xhr () {
                    let xhr = new window.XMLHttpRequest()
                    // upload
                    xhr.upload.addEventListener('progress', function progress(evt) {
                        if (evt.lengthComputable) {
                            let edata3 = obj.trigger({ phase: 'before', type: 'progress', total: evt.total, loaded: evt.loaded, originalEvent: evt })
                            if (edata3.isCancelled === true) return
                            // only show % if it takes time
                            let percent = Math.round(evt.loaded / evt.total * 100)
                            if ((percent && percent != 100) || $('#'+ obj.name + '_progress').text() != '') {
                                $('#'+ obj.name + '_progress').text(''+ percent + '%')
                            }
                            // event after
                            obj.trigger($.extend(edata3, { phase: 'after' }))
                        }
                    }, false)
                    return xhr
                }
            }
            let dataType = obj.dataType || w2utils.settings.dataType
            if (edata.dataType) dataType = edata.dataType
            switch (dataType) {
                case 'HTTP':
                    ajaxOptions.data = String($.param(ajaxOptions.data, false)).replace(/%5B/g, '[').replace(/%5D/g, ']')
                    break
                case 'HTTPJSON':
                    ajaxOptions.data = { request: JSON.stringify(ajaxOptions.data) }
                    break
                case 'RESTFULL':
                    if (obj.recid !== 0 && obj.recid != null) ajaxOptions.type = 'PUT'
                    ajaxOptions.data = String($.param(ajaxOptions.data, false)).replace(/%5B/g, '[').replace(/%5D/g, ']')
                    break
                case 'RESTFULLJSON':
                    if (obj.recid !== 0 && obj.recid != null) ajaxOptions.type = 'PUT'
                    ajaxOptions.data        = JSON.stringify(ajaxOptions.data)
                    ajaxOptions.contentType = 'application/json'
                    break
                case 'JSON':
                    ajaxOptions.type        = 'POST'
                    ajaxOptions.contentType = 'application/json'
                    if (!obj.multipart) {
                        ajaxOptions.data = JSON.stringify(ajaxOptions.data)
                    } else {
                        function append(fd, dob, fob, p){
                            if (p == null) p = ''
                            function isObj(dob, fob, p){
                                if (typeof dob === 'object' && dob instanceof File) fd.append(p, dob)
                                if (typeof dob === 'object'){
                                    if (!!dob && dob.constructor === Array) {
                                        for (let i = 0; i < dob.length; i++) {
                                            let aux_fob = !!fob ? fob[i] : fob
                                            isObj(dob[i], aux_fob, p+'['+i+']')
                                        }
                                    } else {
                                        append(fd, dob, fob, p)
                                    }
                                }
                            }
                            for(let prop in dob){
                                let aux_p   = p == '' ? prop : '${p}[${prop}]'
                                let aux_fob = !!fob ? fob[prop] : fob
                                isObj(dob[prop], aux_fob, aux_p)
                            }
                        }
                        let fdata = new FormData()
                        fdata.append('__body', JSON.stringify(ajaxOptions.data))
                        append(fdata, ajaxOptions.data)
                        ajaxOptions.data        = fdata
                        ajaxOptions.contentType = false
                        ajaxOptions.processData = false
                    }
                    break
            }
            if (this.method) ajaxOptions.type = this.method
            if (edata.method) ajaxOptions.type = edata.method
            obj.last.xhr = $.ajax(ajaxOptions)
                .done((data, status, xhr) => {
                    obj.unlock()
                    // event before
                    let edata = obj.trigger({ phase: 'before', target: obj.name, type: 'save', xhr: xhr, status: status, data: data })
                    if (edata.isCancelled === true) return
                    // parse server response
                    data = xhr.responseJSON
                    // default action
                    if (data == null) {
                        data = {
                            status       : 'error',
                            message      : w2utils.lang(obj.msgNotJSON),
                            responseText : xhr.responseText
                        }
                    }
                    if (data.status === 'error') {
                        obj.error(w2utils.lang(data.message))
                    } else {
                        obj.original = null
                    }
                    // event after
                    obj.trigger($.extend(edata, { phase: 'after' }))
                    obj.refresh()
                    // call back
                    if (typeof callBack === 'function') callBack(data, xhr)
                })
                .fail((xhr, status, error) => {
                    // trigger event
                    let errorObj = { status: status, error: error, rawResponseText: xhr.responseText }
                    let edata2   = obj.trigger({ phase: 'before', type: 'error', error: errorObj, xhr: xhr })
                    if (edata2.isCancelled === true) return
                    // default behavior
                    console.log('ERROR: server communication failed. The server should return',
                        { status: 'success' }, 'OR', { status: 'error', message: 'error message' },
                        ', instead the AJAX request produced this: ', errorObj)
                    obj.unlock()
                    // event after
                    obj.trigger($.extend(edata2, { phase: 'after' }))
                })
            // event after
            obj.trigger($.extend(edata, { phase: 'after' }))
        }, 50)
    }

    lock(msg, showSpinner) {
        let args = Array.prototype.slice.call(arguments, 0)
        args.unshift(this.box)
        setTimeout(() => { w2utils.lock.apply(window, args) }, 10)
    }

    unlock(speed) {
        let box = this.box
        setTimeout(() => { w2utils.unlock(box, speed) }, 25) // needed timer so if server fast, it will not flash
    }

    lockPage(page, msg, spinner) {
        let $page = $(this.box).find('.page-' + page)
        if($page.length){
            // page found
            w2utils.lock($page, msg, spinner)
            return true
        }
        // page with this id not found!
        return false
    }

    unlockPage(page, speed) {
        let $page = $(this.box).find('.page-' + page)
        if ($page.length) {
            // page found
            w2utils.unlock($page, speed)
            return true
        }
        // page with this id not found!
        return false
    }

    goto(page) {
        if (this.page === page) return // already on this page
        if (page != null) this.page = page
        // if it was auto size, resize it
        if ($(this.box).data('auto-size') === true) $(this.box).height(0)
        this.refresh()
    }

    generateHTML() {
        let pages = [] // array for each page
        let group = ''
        let page
        let column
        let html
        let tabindex
        let tabindex_str
        for (let f = 0; f < this.fields.length; f++) {
            html         = ''
            tabindex     = this.tabindexBase + f + 1
            tabindex_str = ' tabindex="'+ tabindex +'"'
            let field    = this.fields[f]
            if (field.html == null) field.html = {}
            if (field.options == null) field.options = {}
            if (field.html.caption != null && field.html.label == null) {
                console.log('NOTICE: form field.html.caption property is deprecated, please use field.html.label. Field ->', field)
                field.html.label = field.html.caption
            }
            if (field.html.label == null) field.html.label = field.field
            field.html = $.extend(true, { label: '', span: 6, attr: '', text: '', style: '', page: 0, column: 0 }, field.html)
            if (page == null) page = field.html.page
            if (column == null) column = field.html.column
            // input control
            let input = '<input id="'+ field.field +'" name="'+ field.field +'" class="w2ui-input" type="text" '+ field.html.attr + tabindex_str + '>'
            switch (field.type) {
                case 'pass':
                case 'password':
                    input = '<input id="' + field.field + '" name="' + field.field + '" class="w2ui-input" type = "password" ' + field.html.attr + tabindex_str + '>'
                    break
                case 'check':
                case 'checks': {
                    if (field.options.items == null && field.html.items != null) field.options.items = field.html.items
                    let items = field.options.items
                    input     = ''
                    // normalized options
                    if (!Array.isArray(items)) items = []
                    if (items.length > 0) {
                        items = w2utils.normMenu.call(this, items, field)
                    }
                    // generate
                    for (let i = 0; i < items.length; i++) {
                        input += '<label class="w2ui-box-label">'+
                                 '  <input id="' + field.field + i +'" name="' + field.field + '" class="w2ui-input" type="checkbox" ' +
                                            field.html.attr + tabindex_str + ' data-value="'+ items[i].id +'" data-index="'+ i +'">' +
                                    '<span>&#160;' + items[i].text + '</span>' +
                                 '</label><br>'
                    }
                    break
                }

                case 'checkbox':
                    input = '<label class="w2ui-box-label">'+
                            '   <input id="'+ field.field +'" name="'+ field.field +'" class="w2ui-input" type="checkbox" '+ field.html.attr + tabindex_str + '>'+
                            '   <span>'+ field.html.label +'</span>'+
                            '</label>'
                    break
                case 'radio': {
                    input = ''
                    // normalized options
                    if (field.options.items == null && field.html.items != null) field.options.items = field.html.items
                    let items = field.options.items
                    if (!Array.isArray(items)) items = []
                    if (items.length > 0) {
                        items = w2utils.normMenu.call(this, items, field)
                    }
                    // generate
                    for (let i = 0; i < items.length; i++) {
                        input += '<label class="w2ui-box-label">'+
                                 '  <input id="' + field.field + i + '" name="' + field.field + '" class="w2ui-input" type = "radio" ' +
                                        field.html.attr + (i === 0 ? tabindex_str : '') + ' value="'+ items[i].id + '">' +
                                    '<span>&#160;' + items[i].text + '</span>' +
                                 '</label><br>'
                    }
                    break
                }
                case 'select': {
                    input = '<select id="' + field.field + '" name="' + field.field + '" class="w2ui-input" ' + field.html.attr + tabindex_str + '>'
                    // normalized options
                    if (field.options.items == null && field.html.items != null) field.options.items = field.html.items
                    let items = field.options.items
                    if (!Array.isArray(items)) items = []
                    if (items.length > 0) {
                        items = w2utils.normMenu.call(this, items, field)
                    }
                    // generate
                    for (let i = 0; i < items.length; i++) {
                        input += '<option value="'+ items[i].id + '">' + items[i].text + '</option>'
                    }
                    input += '</select>'
                    break
                }
                case 'textarea':
                    input = '<textarea id="'+ field.field +'" name="'+ field.field +'" class="w2ui-input" '+ field.html.attr + tabindex_str + '></textarea>'
                    break
                case 'toggle':
                    input = '<input id="'+ field.field +'" name="'+ field.field +'" type="checkbox" '+ field.html.attr + tabindex_str + ' class="w2ui-input w2ui-toggle"><div><div></div></div>'
                    break
                case 'map':
                case 'array':
                    field.html.key          = field.html.key || {}
                    field.html.value        = field.html.value || {}
                    field.html.tabindex_str = tabindex_str
                    input                   = '<span style="float: right">' + (field.html.text || '') + '</span>' +
                            '<input id="'+ field.field +'" name="'+ field.field +'" type="hidden" '+ field.html.attr + tabindex_str + '>'+
                            '<div class="w2ui-map-container"></div>'
                    break
                case 'div':
                case 'custom':
                    input = '<div id="'+ field.field +'" name="'+ field.field +'" '+ field.html.attr + tabindex_str + ' class="w2ui-input">'+
                                (field && field.html && field.html.html ? field.html.html : '') +
                            '</div>'
                    break
                case 'html':
                case 'empty':
                    input = (field && field.html ? (field.html.html || '') + (field.html.text || '') : '')
                    break

            }
            if (group !== '') {
                if (page != field.html.page || column != field.html.column || (field.html.group && (group != field.html.group))) {
                    pages[page][column] += '\n   </div>\n  </div>'
                    group                = ''
                }
            }
            if (field.html.group && (group != field.html.group)) {
                let collapsible = ''
                if (field.html.groupCollapsible) {
                    collapsible = '<span class="w2ui-icon-collapse" style="width: 15px; display: inline-block; position: relative; top: -2px;"></span>'
                }
                html += '\n <div class="w2ui-group">'
                    + '\n   <div class="w2ui-group-title" style="'+ (field.html.groupTitleStyle || '') + '; '
                                    + (collapsible != '' ? 'cursor: pointer; user-select: none' : '') + '"'
                    + (collapsible != '' ? 'data-group="' + w2utils.base64encode(field.html.group) + '"' : '')
                    + (collapsible != ''
                        ? 'onclick="w2ui[\'' + this.name + '\'].toggleGroup(\'' + field.html.group + '\')"'
                        : '')
                    + '>'
                    + collapsible + w2utils.lang(field.html.group) + '</div>\n'
                    + '   <div class="w2ui-group-fields" style="'+ (field.html.groupStyle || '') +'">'
                group = field.html.group
            }
            if (field.html.anchor == null) {
                let span = (field.html.span != null ? 'w2ui-span'+ field.html.span : '')
                if (field.html.span == -1) span = 'w2ui-span-none'
                let label = '<label'+ (span == 'none' ? ' style="display: none"' : '') +'>' + w2utils.lang(field.type != 'checkbox' ? field.html.label : field.html.text) +'</label>'
                if (!field.html.label) label = ''
                html += '\n      <div class="w2ui-field '+ span +'" style="'+ (field.hidden ? 'display: none;' : '') + field.html.style +'">'+
                        '\n         '+ label +
                        ((field.type === 'empty') ? input : '\n         <div>'+ input + (field.type != 'array' && field.type != 'map' ? w2utils.lang(field.type != 'checkbox' ? field.html.text : '') : '') + '</div>') +
                        '\n      </div>'
            } else {
                pages[field.html.page].anchors                    = pages[field.html.page].anchors || {}
                pages[field.html.page].anchors[field.html.anchor] = '<div class="w2ui-field w2ui-field-inline" style="'+ (field.hidden ? 'display: none;' : '') + field.html.style +'">'+
                        ((field.type === 'empty') ? input : '<div>'+ w2utils.lang(field.type != 'checkbox' ? field.html.label : field.html.text, true) + input + w2utils.lang(field.type != 'checkbox' ? field.html.text : '') + '</div>') +
                        '</div>'
            }
            if (pages[field.html.page] == null) pages[field.html.page] = {}
            if (pages[field.html.page][field.html.column] == null) pages[field.html.page][field.html.column] = ''
            pages[field.html.page][field.html.column] += html
            page                                       = field.html.page
            column                                     = field.html.column
        }
        if (group !== '') pages[page][column] += '\n   </div>\n  </div>'
        if (this.tabs.tabs) {
            for (let i = 0; i < this.tabs.tabs.length; i++) if (pages[i] == null) pages[i] = []
        }
        // buttons if any
        let buttons = ''
        if (!$.isEmptyObject(this.actions)) {
            buttons += '\n<div class="w2ui-buttons">'
            tabindex = this.tabindexBase + this.fields.length + 1

            for (let a in this.actions) { // it is an object
                let act  = this.actions[a]
                let info = { text: '', style: '', 'class': '' }
                if ($.isPlainObject(act)) {
                    if (act.text == null && act.caption != null) {
                        console.log('NOTICE: form action.caption property is deprecated, please use action.text. Action ->', act)
                        act.text = act.caption
                    }
                    if (act.text) info.text = act.text
                    if (act.style) info.style = act.style
                    if (act.class) info.class = act.class
                } else {
                    info.text = a
                    if (['save', 'update', 'create'].indexOf(a.toLowerCase()) !== -1) info.class = 'w2ui-btn-blue'; else info.class = ''
                }
                buttons += '\n    <button name="'+ a +'" class="w2ui-btn '+ info.class +'" style="'+ info.style +'" tabindex="'+ tabindex +'">'+
                                        w2utils.lang(info.text) +'</button>'
                tabindex++
            }
            buttons += '\n</div>'
        }
        html = ''
        for (let p = 0; p < pages.length; p++){
            html += '<div class="w2ui-page page-'+ p +'" style="' + (p !== 0 ? 'display: none;' : '') + this.pageStyle + '">'
            if (!pages[p]) {
                console.log(`ERROR: Page ${p} does not exist`)
                return false
            }
            if (pages[p].before) {
                html += pages[p].before
            }
            html += '<div class="w2ui-column-container">'
            Object.keys(pages[p]).sort().forEach((c, ind) => {
                if (c == parseInt(c)) {
                    html += '<div class="w2ui-column col-'+ c +'">' + (pages[p][c] || '') + '\n</div>'
                }
            })
            html += '\n</div>'
            if (pages[p].after) {
                html += pages[p].after
            }
            html += '\n</div>'
            // process page anchors
            if (pages[p].anchors) {
                Object.keys(pages[p].anchors).forEach((key, ind) => {
                    html = html.replace(key, pages[p].anchors[key])
                })
            }
        }
        html += buttons
        return html
    }

    toggleGroup(groupName, show) {
        let el = $(this.box).find('.w2ui-group-title[data-group="' + w2utils.base64encode(groupName) + '"]')
        if(!el || !el.length) return
        let el_next = el.next()
        if (typeof show === 'undefined') {
            show = ( el_next.css('display') == 'none' )
        }
        if (show) {
            el_next.slideDown(300)
            el_next.next().remove()
            el.find('span').addClass('w2ui-icon-collapse').removeClass('w2ui-icon-expand')
        } else {
            el_next.slideUp(300)
            let css = 'width: ' + el_next.css('width') + ';'
               + 'padding-left: ' + el_next.css('padding-left') + ';'
               + 'padding-right: ' + el_next.css('padding-right') + ';'
               + 'margin-left: ' + el_next.css('margin-left') + ';'
               + 'margin-right: ' + el_next.css('margin-right') + ';'
            setTimeout(() => { el_next.after('<div style="height: 5px;'+ css +'"></div>') }, 100)
            el.find('span').addClass('w2ui-icon-expand').removeClass('w2ui-icon-collapse')
        }
    }

    action(action, event) {
        let act   = this.actions[action]
        let click = act
        if ($.isPlainObject(act) && act.onClick) click = act.onClick
        // event before
        let edata = this.trigger({ phase: 'before', target: action, type: 'action', action: act, originalEvent: event })
        if (edata.isCancelled === true) return
        // default actions
        if (typeof click === 'function') click.call(this, event)
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
    }

    resize() {
        let obj = this
        // event before
        let edata = this.trigger({ phase: 'before', target: this.name, type: 'resize' })
        if (edata.isCancelled === true) return
        // default behaviour
        let main    = $(this.box).find('> div.w2ui-form-box')
        let header  = $(this.box).find('> div .w2ui-form-header')
        let toolbar = $(this.box).find('> div .w2ui-form-toolbar')
        let tabs    = $(this.box).find('> div .w2ui-form-tabs')
        let page    = $(this.box).find('> div .w2ui-page')
        let cpage   = $(this.box).find('> div .w2ui-page.page-'+ this.page)
        let dpage   = $(this.box).find('> div .w2ui-page.page-'+ this.page + ' > div')
        let buttons = $(this.box).find('> div .w2ui-buttons')
        // if no height, calculate it
        resizeElements()
        if (this.autosize) { //we don't need auto-size every time
            if (parseInt($(this.box).height()) === 0 || $(this.box).data('auto-size') === true) {
                $(this.box).height(
                    (header.length > 0 ? w2utils.getSize(header, 'height') : 0) +
                    ((typeof this.tabs === 'object' && Array.isArray(this.tabs.tabs) && this.tabs.tabs.length > 0) ? w2utils.getSize(tabs, 'height') : 0) +
                    ((typeof this.toolbar === 'object' && Array.isArray(this.toolbar.items) && this.toolbar.items.length > 0) ? w2utils.getSize(toolbar, 'height') : 0) +
                    (page.length > 0 ? w2utils.getSize(dpage, 'height') + w2utils.getSize(cpage, '+height') + 12 : 0) + // why 12 ???
                    (buttons.length > 0 ? w2utils.getSize(buttons, 'height') : 0)
                )
                $(this.box).data('auto-size', true)
            }
            resizeElements()
        }
        if (this.toolbar && this.toolbar.resize) this.toolbar.resize()
        if (this.tabs && this.tabs.resize) this.tabs.resize()
        // event after
        obj.trigger($.extend(edata, { phase: 'after' }))

        function resizeElements() {
            // resize elements
            main.width($(obj.box).width()).height($(obj.box).height())
            toolbar.css('top', (obj.header !== '' ? w2utils.getSize(header, 'height') : 0))
            tabs.css('top', (obj.header !== '' ? w2utils.getSize(header, 'height') : 0)
                          + ((typeof obj.toolbar === 'object' && Array.isArray(obj.toolbar.items) && obj.toolbar.items.length > 0) ? w2utils.getSize(toolbar, 'height') : 0))
            page.css('top', (obj.header !== '' ? w2utils.getSize(header, 'height') : 0)
                          + ((typeof obj.toolbar === 'object' && Array.isArray(obj.toolbar.items) && obj.toolbar.items.length > 0) ? w2utils.getSize(toolbar, 'height') + 5 : 0)
                          + ((typeof obj.tabs === 'object' && Array.isArray(obj.tabs.tabs) && obj.tabs.tabs.length > 0) ? w2utils.getSize(tabs, 'height') + 5 : 0))
            page.css('bottom', (buttons.length > 0 ? w2utils.getSize(buttons, 'height') : 0))
        }
    }

    refresh() {
        let time = (new Date()).getTime()
        let obj  = this
        if (!this.box) return
        if (!this.isGenerated || $(this.box).html() == null) return
        // event before
        let edata = this.trigger({ phase: 'before', target: this.name, type: 'refresh', page: this.page, field: arguments[0], fields: arguments })
        if (edata.isCancelled === true) return
        let fields = Array.from(this.fields.keys())
        if (arguments.length > 0) {
            fields = Array.from(arguments)
                .map((fld, ind) => {
                    if (typeof fld != 'string') console.log('ERROR: Arguments in refresh functions should be field names')
                    return this.get(fld, true) // get index of field
                })
                .filter((fld, ind) => {
                    if (fld != null) return true; else return false
                })
        } else {
            // update what page field belongs
            $(this.box).find('input, textarea, select').each((index, el) => {
                let name  = ($(el).attr('name') != null ? $(el).attr('name') : $(el).attr('id'))
                let field = obj.get(name)
                if (field) {
                    // find page
                    let div = $(el).closest('.w2ui-page')
                    if (div.length > 0) {
                        for (let i = 0; i < 100; i++) {
                            if (div.hasClass('page-'+i)) { field.page = i; break }
                        }
                    }
                }
            })
            // default action
            $(this.box).find('.w2ui-page').hide()
            $(this.box).find('.w2ui-page.page-' + this.page).show()
            $(this.box).find('.w2ui-form-header').html(w2utils.lang(this.header))
            // refresh tabs if needed
            if (typeof this.tabs === 'object' && Array.isArray(this.tabs.tabs) && this.tabs.tabs.length > 0) {
                $('#form_'+ this.name +'_tabs').show()
                this.tabs.active = this.tabs.tabs[this.page].id
                this.tabs.refresh()
            } else {
                $('#form_'+ this.name +'_tabs').hide()
            }
            // refresh tabs if needed
            if (typeof this.toolbar === 'object' && Array.isArray(this.toolbar.items) && this.toolbar.items.length > 0) {
                $('#form_'+ this.name +'_toolbar').show()
                this.toolbar.refresh()
            } else {
                $('#form_'+ this.name +'_toolbar').hide()
            }
        }
        // refresh values of fields
        for (let f = 0; f < fields.length; f++) {
            let field = this.fields[fields[f]]
            if (field.name == null && field.field != null) field.name = field.field
            if (field.field == null && field.name != null) field.field = field.name
            field.$el = $(this.box).find('[name="'+ String(field.name).replace(/\\/g, '\\\\') +'"]')
            field.el  = field.$el[0]
            if (field.el) field.el.id = field.name
            let tmp = $(field).data('w2field')
            if (tmp) tmp.clear()
            $(field.$el)
                .off('.w2form')
                .on('change.w2form', function(event) {
                    let that  = this
                    let field = obj.get(this.name)
                    if (field == null) return
                    if ($(this).data('skip_change') == true) {
                        $(this).data('skip_change', false)
                        return
                    }

                    let value_new      = this.value
                    let value_previous = obj.getValue(this.name)
                    if (value_previous == null) value_previous = ''

                    if (['list', 'enum', 'file'].indexOf(field.type) !== -1 && $(this).data('selected')) {
                        let nv = $(this).data('selected')
                        let cv = obj.getValue(this.name)
                        if (Array.isArray(nv)) {
                            value_new = []
                            for (let i = 0; i < nv.length; i++) value_new[i] = $.extend(true, {}, nv[i]) // clone array
                        }
                        if ($.isPlainObject(nv)) {
                            value_new = $.extend(true, {}, nv) // clone object
                        }
                        if (Array.isArray(cv)) {
                            value_previous = []
                            for (let i = 0; i < cv.length; i++) value_previous[i] = $.extend(true, {}, cv[i]) // clone array
                        }
                        if ($.isPlainObject(cv)) {
                            value_previous = $.extend(true, {}, cv) // clone object
                        }
                    }
                    if (['toggle', 'checkbox'].indexOf(field.type) !== -1) {
                        value_new = ($(this).prop('checked') ? ($(this).prop('value') === 'on' ? true : $(this).prop('value')) : false)
                    }
                    if (['check', 'checks'].indexOf(field.type) !== -1) {
                        if (!Array.isArray(value_previous)) value_previous = []
                        value_new = value_previous.slice()
                        let tmp   = field.options.items[$(this).attr('data-index')]
                        if ($(this).prop('checked')) {
                            value_new.push(tmp.id)
                        } else {
                            value_new.splice(value_new.indexOf(tmp.id), 1)
                        }
                    }
                    // clean extra chars
                    if (['int', 'float', 'percent', 'money', 'currency'].indexOf(field.type) !== -1) {
                        value_new = $(this).data('w2field').clean(value_new)
                    }
                    if (value_new === value_previous) return
                    // event before
                    let edata2 = obj.trigger({ phase: 'before', target: this.name, type: 'change', value_new: value_new, value_previous: value_previous, originalEvent: event })
                    if (edata2.isCancelled === true) {
                        edata2.value_new = obj.getValue(this.name)
                        if ($(this).val() !== edata2.value_new) {
                            $(this).data('skip_change', true)
                            // if not immediate, then ignore it
                            setTimeout(() => { $(that).data('skip_change', false) }, 10)
                        }
                        $(this).val(edata2.value_new) // return previous value
                    }
                    // default action
                    let val = edata2.value_new
                    if (['enum', 'file'].indexOf(field.type) !== -1) {
                        if (val.length > 0) {
                            let fld = $(field.el).data('w2field').helpers.multi
                            $(fld).removeClass('w2ui-error')
                        }
                    }
                    if (val === '' || val == null
                            || (Array.isArray(val) && val.length === 0) || ($.isPlainObject(val) && $.isEmptyObject(val))) {
                        val = null
                    }
                    obj.setValue(this.name, val)
                    // event after
                    obj.trigger($.extend(edata2, { phase: 'after' }))
                })
                .on('input.w2form', function(event) {
                    let val = this.value
                    if (event.target.type == 'checkbox') {
                        val = event.target.checked
                    }
                    // remember original
                    if (obj.original == null) {
                        if (!$.isEmptyObject(obj.record)) {
                            obj.original = $.extend(true, {}, obj.record)
                        } else {
                            obj.original = {}
                        }
                    }
                    // event before
                    let edata2 = obj.trigger({ phase: 'before', target: this.name, type: 'input', value_new: val, originalEvent: event })
                    if (edata2.isCancelled === true) return

                    // event after
                    obj.trigger($.extend(edata2, { phase: 'after' }))
                })
            // required
            if (field.required) {
                $(field.el).parent().parent().addClass('w2ui-required')
            } else {
                $(field.el).parent().parent().removeClass('w2ui-required')
            }
            // disabled
            if (field.disabled != null) {
                let $fld = $(field.el)
                if (field.disabled) {
                    if ($fld.data('w2ui-tabIndex') == null) {
                        $fld.data('w2ui-tabIndex', $fld.prop('tabIndex'))
                    }
                    $(field.el)
                        .prop('readonly', true)
                        .prop('tabindex', -1)
                        .closest('.w2ui-field')
                        .addClass('w2ui-disabled')
                } else {
                    $(field.el)
                        .prop('readonly', false)
                        .prop('tabIndex', $fld.data('w2ui-tabIndex'))
                        .closest('.w2ui-field')
                        .removeClass('w2ui-disabled')
                }
            }
            // hidden
            tmp = field.el
            if (!tmp) tmp = $(this.box).find('#' + field.field)
            if (field.hidden) {
                $(tmp).closest('.w2ui-field').hide()
            } else {
                $(tmp).closest('.w2ui-field').show()
            }
        }
        // attach actions on buttons
        $(this.box).find('button, input[type=button]').each((index, el) => {
            $(el).off('click').on('click', function(event) {
                let action = this.value
                if (this.id) action = this.id
                if (this.name) action = this.name
                obj.action(action, event)
            })
        })
        // init controls with record
        for (let f = 0; f < fields.length; f++) {
            let field = this.fields[fields[f]]
            let value = (this.getValue(field.name) != null ? this.getValue(field.name) : '')
            if (!field.el) continue
            if (!$(field.el).hasClass('w2ui-input')) $(field.el).addClass('w2ui-input')
            field.type = String(field.type).toLowerCase()
            if (!field.options) field.options = {}
            switch (field.type) {
                case 'text':
                case 'textarea':
                case 'email':
                case 'pass':
                case 'password':
                    field.el.value = value
                    break
                case 'int':
                case 'float':
                case 'money':
                case 'currency':
                case 'percent':
                    // issue #761
                    field.el.value = value
                    $(field.el).w2field($.extend({}, field.options, { type: field.type }))
                    break
                case 'hex':
                case 'alphanumeric':
                case 'color':
                case 'date':
                case 'time':
                case 'datetime':
                    field.el.value = value
                    $(field.el).w2field($.extend({}, field.options, { type: field.type }))
                    break
                case 'toggle':
                    if (w2utils.isFloat(value)) value = parseFloat(value)
                    $(field.el).prop('checked', (value ? true : false))
                    this.setValue(field.name, (value ? value : false))
                    break
                case 'radio':
                    $(field.$el).prop('checked', false).each((index, el) => {
                        if ($(el).val() == value) $(el).prop('checked', true)
                    })
                    break
                case 'checkbox':
                    $(field.el).prop('checked', value ? true : false)
                    if (field.disabled === true || field.disabled === false) {
                        $(field.el).prop('disabled', field.disabled ? true : false)
                    }
                    break
                case 'check':
                case 'checks':
                    if (Array.isArray(value)) {
                        value.forEach((val) => {
                            $(field.el).closest('div').find('[data-value="' + val + '"]').prop('checked', true)
                        })
                    }
                    if (field.disabled) {
                        $(field.el).closest('div').find('input[type=checkbox]').prop('disabled', true)
                    } else {
                        $(field.el).closest('div').find('input[type=checkbox]').removeProp('disabled')
                    }
                    break
                // enums
                case 'list':
                case 'combo':
                    if (field.type === 'list') {
                        let tmp_value = ($.isPlainObject(value) ? value.id : ($.isPlainObject(field.options.selected) ? field.options.selected.id : value))
                        // normalized options
                        if (!field.options.items) field.options.items = []
                        let items = field.options.items
                        if (typeof items == 'function') items = items()
                        // find value from items
                        let isFound = false
                        if (Array.isArray(items)) {
                            for (let i = 0; i < items.length; i++) {
                                let item = items[i]
                                if (item.id == tmp_value) {
                                    value = $.extend(true, {}, item)
                                    obj.setValue(field.name, value)
                                    isFound = true
                                    break
                                }
                            }
                        }
                        if (!isFound && value != null && value !== '') {
                            field.$el.data('find_selected', value)
                        }
                    } else if (field.type === 'combo' && !$.isPlainObject(value)) {
                        field.el.value = value
                    } else if ($.isPlainObject(value) && value.text != null) {
                        field.el.value = value.text
                    } else {
                        field.el.value = ''
                    }
                    if (!$.isPlainObject(value)) value = {}
                    $(field.el).w2field($.extend({}, field.options, { type: field.type, selected: value }))
                    break
                case 'enum':
                case 'file':
                    let sel     = []
                    let isFound = false
                    if (!Array.isArray(value)) value = []
                    if (typeof field.options.items != 'function') {
                        if (!Array.isArray(field.options.items)) {
                            field.options.items = []
                        }
                        // find value from items
                        value.forEach((val) => {
                            field.options.items.forEach((it) => {
                                if (it && (it.id == val || ($.isPlainObject(val) && it.id == val.id))) {
                                    sel.push($.isPlainObject(it) ? $.extend(true, {}, it) : it)
                                    isFound = true
                                }
                            })
                        })
                    }
                    if (!isFound && value != null && value.length !== 0) {
                        field.$el.data('find_selected', value)
                        sel = value
                    }
                    let opt = $.extend({}, field.options, { type: field.type, selected: sel })
                    Object.keys(field.options).forEach((key) => {
                        if (typeof field.options[key] == 'function') {
                            opt[key] = field.options[key]
                        }
                    })
                    $(field.el).w2field(opt)
                    break

                // standard HTML
                case 'select': {
                    // generate options
                    let items = field.options.items
                    if (items != null && items.length > 0) {
                        items = w2utils.normMenu.call(this, items, field)
                        $(field.el).html('')
                        for (let it = 0; it < items.length; it++) {
                            $(field.el).append('<option value="'+ items[it].id +'">' + items[it].text + '</option')
                        }
                    }
                    $(field.el).val(value)
                    break
                }
                case 'map':
                case 'array':
                    // init map
                    if (field.type == 'map' && (value == null || !$.isPlainObject(value))) {
                        this.setValue(field.field, {})
                        value = this.getValue(field.field)
                    }
                    if (field.type == 'array' && (value == null || !Array.isArray(value))) {
                        this.setValue(field.field, [])
                        value = this.getValue(field.field)
                    }
                    // need closure
                    (function closure(obj, field) {
                        field.el.mapAdd = function(field, div, cnt) {
                            let attr = (field.disabled ? ' readOnly ' : '') + (field.html.tabindex_str || '')
                            let html = '<div class="w2ui-map-field" style="margin-bottom: 5px">'+
                                '<input id="'+ field.field +'_key_'+ cnt +'" data-cnt="'+ cnt +'" type="text" '+ field.html.key.attr + attr +' class="w2ui-input w2ui-map key">'+
                                    (field.html.key.text || '') +
                                '<input id="'+ field.field +'_value_'+ cnt +'" data-cnt="'+ cnt +'" type="text" '+ field.html.value.attr + attr +' class="w2ui-input w2ui-map value">'+
                                    (field.html.value.text || '') +
                                '</div>'
                            div.append(html)
                        }
                        field.el.mapRefresh = function(map, div) {
                            // generate options
                            let cnt = 1
                            let names
                            if (field.type == 'map') {
                                if (!$.isPlainObject(map)) map = {}
                                if (map._order == null) map._order = Object.keys(map)
                                names = map._order
                            }
                            if (field.type == 'array') {
                                if (!Array.isArray(map)) map = []
                                names = map.map((item) => { return item.key })
                            }
                            let $k, $v
                            names.forEach((item) => {
                                $k = div.find('#' + w2utils.escapeId(field.name) + '_key_' + cnt)
                                $v = div.find('#' + w2utils.escapeId(field.name) + '_value_' + cnt)
                                if ($k.length == 0 || $v.length == 0) {
                                    field.el.mapAdd(field, div, cnt)
                                    $k = div.find('#' + w2utils.escapeId(field.name) + '_key_' + cnt)
                                    $v = div.find('#' + w2utils.escapeId(field.name) + '_value_' + cnt)
                                }
                                let val = map[item]
                                if (field.type == 'array') {
                                    let tmp = map.filter((it) => { return it.key == item ? true : false})
                                    if (tmp.length > 0) val = tmp[0].value
                                }
                                $k.val(item)
                                $v.val(val)
                                if (field.disabled === true || field.disabled === false) {
                                    $k.prop('readOnly', field.disabled ? true : false)
                                    $v.prop('readOnly', field.disabled ? true : false)
                                }
                                $k.parents('.w2ui-map-field').attr('data-key', item)
                                cnt++
                            })
                            let curr = div.find('#' + w2utils.escapeId(field.name) + '_key_' + cnt).parent()
                            let next = div.find('#' + w2utils.escapeId(field.name) + '_key_' + (cnt + 1)).parent()
                            // if not disabled - show next
                            if (curr.length === 0 && !($k && ($k.prop('readOnly') === true || $k.prop('disabled') === true))) {
                                field.el.mapAdd(field, div, cnt)
                            }
                            if (curr.length == 1 && next.length == 1) {
                                curr.removeAttr('data-key')
                                curr.find('.key').val(next.find('.key').val())
                                curr.find('.value').val(next.find('.value').val())
                                next.remove()
                            }
                            if (field.disabled === true || field.disabled === false) {
                                curr.find('.key').prop('readOnly', field.disabled ? true : false)
                                curr.find('.value').prop('readOnly', field.disabled ? true : false)
                            }
                            // attach events
                            $(field.el).next().find('input.w2ui-map')
                                .off('.mapChange')
                                .on('keyup.mapChange', function(event) {
                                    let $div = $(event.target).parents('.w2ui-map-field')
                                    if (event.keyCode == 13) {
                                        $div.next().find('input.key').focus()
                                    }

                                })
                                .on('change.mapChange', function() {
                                    let $div  = $(event.target).parents('.w2ui-map-field')
                                    let old   = $div.attr('data-key')
                                    let key   = $div.find('.key').val()
                                    let value = $div.find('.value').val()
                                    // event before
                                    let value_new      = {}
                                    let value_previous = {}
                                    let aMap           = null
                                    let aIndex         = null
                                    value_new[key]     = value
                                    if (field.type == 'array') {
                                        map.forEach((it, ind) => {
                                            if (it.key == old) aIndex = ind
                                        })
                                        aMap = map[aIndex]
                                    }
                                    if (old != null && field.type == 'map') {
                                        value_previous[old] = map[old]
                                    }
                                    if (old != null && field.type == 'array') {
                                        value_previous[old] = aMap.value
                                    }
                                    let edata = obj.trigger({ phase: 'before', target: field.field, type: 'change', originalEvent: event, value_new: value_new, value_previous: value_previous })
                                    if (edata.isCancelled === true) {
                                        return
                                    }
                                    if (field.type == 'map') {
                                        delete map[old]
                                        let ind = map._order.indexOf(old)
                                        if (key != '') {
                                            if (map[key] != null) {
                                                let newKey, more = 0
                                                do { more++; newKey = key + more } while (map[newKey] != null)
                                                key = newKey
                                                $div.find('.key').val(newKey)
                                            }
                                            map[key] = value
                                            $div.attr('data-key', key)
                                            if (ind != -1) {
                                                map._order[ind] = key
                                            } else {
                                                map._order.push(key)
                                            }
                                        } else {
                                            map._order.splice(ind, 1)
                                            $div.find('.value').val('')
                                        }
                                    } else if (field.type == 'array') {
                                        if (key != '') {
                                            if (aMap == null) {
                                                map.push({ key: key, value: value })
                                            } else {
                                                aMap.key   = key
                                                aMap.value = value
                                            }
                                        } else {
                                            map.splice(aIndex, 1)
                                        }
                                    }
                                    obj.setValue(field.field, map)
                                    field.el.mapRefresh(map, div)
                                    // event after
                                    obj.trigger($.extend(edata, { phase: 'after' }))
                                })
                        }
                        field.el.mapRefresh(value, $(field.el).parent().find('.w2ui-map-container'))
                    })(this, field)
                    break
                case 'div':
                case 'custom':
                    $(field.el).html(value)
                    break
                case 'html':
                case 'empty':
                    break
                default:
                    $(field.el).val(value)
                    $(field.el).w2field($.extend({}, field.options, { type: field.type }))
                    break
            }
        }
        // wrap pages in div
        let tmp = $(this.box).find('.w2ui-page')
        for (let i = 0; i < tmp.length; i++) {
            if ($(tmp[i]).find('> *').length > 1) $(tmp[i]).wrapInner('<div></div>')
        }
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
        this.resize()
        return (new Date()).getTime() - time
    }

    render(box) {
        let time = (new Date()).getTime()
        let obj  = this
        if (typeof box === 'object') {
            // remove from previous box
            if ($(this.box).find('#form_'+ this.name +'_tabs').length > 0) {
                $(this.box).removeAttr('name')
                    .removeClass('w2ui-reset w2ui-form')
                    .html('')
            }
            this.box = box
        }
        if (!this.isGenerated) return
        if (!this.box) return
        // event before
        let edata = this.trigger({ phase: 'before', target: this.name, type: 'render', box: (box != null ? box : this.box) })
        if (edata.isCancelled === true) return
        let html = '<div class="w2ui-form-box">' +
                    (this.header !== '' ? '<div class="w2ui-form-header">' + w2utils.lang(this.header) + '</div>' : '') +
                    '    <div id="form_'+ this.name +'_toolbar" class="w2ui-form-toolbar" style="display: none"></div>' +
                    '    <div id="form_'+ this.name +'_tabs" class="w2ui-form-tabs" style="display: none"></div>' +
                        this.formHTML +
                    '</div>'
        $(this.box).attr('name', this.name)
            .addClass('w2ui-reset w2ui-form')
            .html(html)
        if ($(this.box).length > 0) $(this.box)[0].style.cssText += this.style

        // init toolbar regardless it is defined or not
        if (typeof this.toolbar.render !== 'function') {
            this.toolbar = new w2toolbar($.extend({}, this.toolbar, { name: this.name +'_toolbar', owner: this }))
            this.toolbar.on('click', function(event) {
                let edata = obj.trigger({ phase: 'before', type: 'toolbar', target: event.target, originalEvent: event })
                if (edata.isCancelled === true) return
                // no default action
                obj.trigger($.extend(edata, { phase: 'after' }))
            })
        }
        if (typeof this.toolbar === 'object' && typeof this.toolbar.render === 'function') {
            this.toolbar.render($('#form_'+ this.name +'_toolbar')[0])
        }
        // init tabs regardless it is defined or not
        if (typeof this.tabs.render !== 'function') {
            this.tabs = new w2tabs($.extend({}, this.tabs, { name: this.name +'_tabs', owner: this, active: this.tabs.active }))
            this.tabs.on('click', function(event) {
                obj.goto(this.get(event.target, true))
            })
        }
        if (typeof this.tabs === 'object' && typeof this.tabs.render === 'function') {
            this.tabs.render($('#form_'+ this.name +'_tabs')[0])
            if(this.tabs.active) this.tabs.click(this.tabs.active)
        }
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
        // after render actions
        this.resize()
        let url = (typeof this.url !== 'object' ? this.url : this.url.get)
        if (url && this.recid !== 0 && this.recid != null) {
            this.request()
        } else {
            this.refresh()
        }
        // attach to resize event
        if ($('.w2ui-layout').length === 0) { // if there is layout, it will send a resize event
            this.tmp_resize = function tmp_resize(event) {
                if (w2ui[obj.name] == null) {
                    $(window).off('resize.w2uiResize', obj.tmp_resize)
                } else {
                    w2ui[obj.name].resize()
                }
            }
            $(window).off('resize.w2uiResize').on('resize.w2uiResize', obj.tmp_resize)
        }

        // focus on load
        if (this.focus != -1) {
            setTimeout(() => {
                // if not rendered in 50ms, then wait another 500ms
                if ($(obj.box).find('input, select, textarea').length === 0) {
                    setTimeout(obj.applyFocus, 500) // need timeout to allow form to render
                } else {
                    obj.applyFocus()
                }
            }, 50)
        }
        return (new Date()).getTime() - time
    }

    applyFocus(focus) {
        if(typeof focus === 'undefined'){
            // no argument - use form's focus property
            focus = this.focus
        }
        let $input
        // focus field by index
        if (w2utils.isInt(focus)){
            if(focus < 0) {
                return
            }
            let inputs = $(this.box).find('div:not(.w2ui-field-helper) > input, select, textarea, div > label:nth-child(1) > :radio').not('.file-input')
            // find visible
            while ($(inputs[focus]).is(':hidden') && inputs.length >= focus) {
                focus++
            }
            if (inputs[focus]) {
                $input = $(inputs[focus])
            }
        }
        // focus field by name
        else if (typeof focus === 'string') {
            $input = $(this.box).find('[name=\''+focus+'\']').first()
        }
        if ($input){
            $input.trigger('focus')
        }
        return $input
    }

    destroy() {
        // event before
        let edata = this.trigger({ phase: 'before', target: this.name, type: 'destroy' })
        if (edata.isCancelled === true) return
        // clean up
        if (typeof this.toolbar === 'object' && this.toolbar.destroy) this.toolbar.destroy()
        if (typeof this.tabs === 'object' && this.tabs.destroy) this.tabs.destroy()
        if ($(this.box).find('#form_'+ this.name +'_tabs').length > 0) {
            $(this.box)
                .removeAttr('name')
                .removeClass('w2ui-reset w2ui-form')
                .html('')
        }
        delete w2ui[this.name]
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
        $(window).off('resize', 'body')
    }
}
export { w2form }