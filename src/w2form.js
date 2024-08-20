/**
 * Part of w2ui 2.0 library
 *  - Dependencies: mQuery, w2utils, w2base, w2tabs, w2toolbar, w2tooltip, w2field
 *
 * == TODO ==
 *  - include delta on save
 *  - tabs below some fields (could already be implemented)
 *  - form with toolbar & tabs
 *  - promise for load, save, etc.
 *
 * == 2.0 changes
 *  - CSP - fixed inline events
 *  - removed jQuery dependency
 *  - better groups support tabs now
 *  - form.confirm - refactored
 *  - form.message - refactored
 *  - observeResize for the box
 *  - removed msgNotJSON, msgAJAXerror
 *  - applyFocus -> setFocus
 *  - getFieldValue(fieldName) = returns { curent, previous, original }
 *  - setFieldVallue(fieldName, value)
 *  - getValue(..., original) -- return original if any
 *  - added .hideErrors()
 *  - reuqest, save, submit - return promises
 *  - this.recid = null if no record needs to be pulled
 *  - remove form.multiplart
 *  - this.method - for saving only
 *  - added field.html.class
 *  - setValue(..., noRefresh)
 *  - rememberOriginal()
 */

import { w2base } from './w2base.js'
import { w2ui, w2utils } from './w2utils.js'
import { query } from './query.js'
import { w2tabs } from './w2tabs.js'
import { w2toolbar } from './w2toolbar.js'
import { w2tooltip } from './w2tooltip.js'
import { w2field } from './w2field.js'

class w2form extends w2base {
    constructor(options) {
        super(options.name)
        this.name         = null
        this.header       = ''
        this.box          = null // HTML element that hold this element
        this.url          = ''
        this.method       = null // if defined, it will be http method when saving
        this.routeData    = {} // data for dynamic routes
        this.formURL      = '' // url where to get form HTML
        this.formHTML     = '' // form HTML (might be loaded from the url)
        this.page         = 0 // current page
        this.pageStyle    = ''
        this.recid        = null // if not null, then load record
        this.fields       = []
        this.actions      = {}
        this.record       = {}
        this.original     = null
        this.dataType     = null // only used when not null, otherwise from w2utils.settings.dataType
        this.postData     = {}
        this.httpHeaders  = {}
        this.toolbar      = {} // if not empty, then it is toolbar
        this.tabs         = {} // if not empty, then it is tabs object
        this.style        = ''
        this.focus        = 0 // focus first or other element
        this.autosize     = true // autosize, if false the container must have a height set
        this.nestedFields = true // use field name containing dots as separator to look into object
        this.tabindexBase = 0 // this will be added to the auto numbering
        this.isGenerated  = false
        this.last         = {
            fetchCtrl: null,    // last fetch AbortController
            fetchOptions: null, // last fetch options
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
        this.msgRefresh   = 'Loading...'
        this.msgSaving    = 'Saving...'
        this.msgServerError = 'Server error'
        this.ALL_TYPES    = [ 'text', 'textarea', 'email', 'pass', 'password', 'int', 'float', 'money', 'currency',
            'percent', 'hex', 'alphanumeric', 'color', 'date', 'time', 'datetime', 'toggle', 'checkbox', 'radio',
            'check', 'checks', 'list', 'combo', 'enum', 'file', 'select', 'switch', 'map', 'array', 'div', 'custom', 'html',
            'empty']
        this.LIST_TYPES = ['select', 'radio', 'check', 'checks', 'list', 'combo', 'enum', 'switch']
        this.W2FIELD_TYPES = ['int', 'float', 'money', 'currency', 'percent', 'hex', 'alphanumeric', 'color',
            'date', 'time', 'datetime', 'list', 'combo', 'enum', 'file']
        // mix in options
        w2utils.extend(this, options)

        // remember items
        let record   = options.record
        let original = options.original
        let fields   = options.fields
        let toolbar  = options.toolbar
        let tabs     = options.tabs
        // extend items
        Object.assign(this, { record: {}, original: null, fields: [], tabs: {}, toolbar: {}, handlers: [] })
        // preprocess fields
        if (fields) {
            let sub =_processFields(fields)
            this.fields = sub.fields
            if (!tabs && sub.tabs.length > 0) {
                tabs = sub.tabs
            }
        }
        // prepare tabs
        if (Array.isArray(tabs)) {
            w2utils.extend(this.tabs, { tabs: [] })
            for (let t = 0; t < tabs.length; t++) {
                let tmp = tabs[t]
                if (typeof tmp === 'object') {
                    this.tabs.tabs.push(tmp)
                    if (tmp.active === true) {
                        this.tabs.active = tmp.id
                    }
                } else {
                    this.tabs.tabs.push({ id: tmp, text: tmp })
                }
            }
        } else {
            w2utils.extend(this.tabs, tabs)
        }
        w2utils.extend(this.toolbar, toolbar)
        for (let p in record) { // it is an object
            if (w2utils.isPlainObject(record[p])) {
                this.record[p] = w2utils.clone(record[p])
            } else {
                this.record[p] = record[p]
            }
        }
        for (let p in original) { // it is an object
            if (w2utils.isPlainObject(original[p])) {
                this.original[p] = w2utils.clone(original[p])
            } else {
                this.original[p] = original[p]
            }
        }
        // generate html if necessary
        if (this.formURL !== '') {
            fetch(this.formURL)
                .then(resp => resp.text())
                .then(text => {
                    this.formHTML = text
                    this.isGenerated = true
                    if (this.box) this.render(this.box)
                })
        } else if (!this.formURL && !this.formHTML) {
            this.formHTML    = this.generateHTML()
            this.isGenerated = true
        } else if (this.formHTML) {
            this.isGenerated = true
        }

        // render if box specified
        if (typeof this.box == 'string') this.box = query(this.box).get(0)
        if (this.box) this.render(this.box)

        function _processFields(fields) {
            let newFields = []
            let tabs = []
            // if it is an object
            if (w2utils.isPlainObject(fields)) {
                let tmp = fields
                fields = []
                Object.keys(tmp).forEach((key) => {
                    let fld = tmp[key]
                    if (fld.type == 'group') {
                        fld.text = key
                        if (w2utils.isPlainObject(fld.fields)) {
                            let tmp2 = fld.fields
                            fld.fields = []
                            Object.keys(tmp2).forEach((key2) => {
                                let fld2 = tmp2[key2]
                                fld2.field = key2
                                fld.fields.push(_process(fld2))

                            })
                        }
                        fields.push(fld)
                    } else if (fld.type == 'tab') {
                        // add tab
                        let tab = { id: key, text: key }
                        if (fld.style) {
                            tab.style = fld.style
                        }
                        tabs.push(tab)
                        // add page to fields
                        let sub = _processFields(fld.fields).fields
                        sub.forEach(fld2 => {
                            fld2.html = fld2.html || {}
                            fld2.html.page = tabs.length -1
                            _process2(fld, fld2)
                        })
                        fields.push(...sub)
                    } else {
                        fld.field = key
                        fields.push(_process(fld))
                    }
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

                function _process2(fld, fld2) {
                    let ignore = ['style', 'html']
                    Object.keys(fld).forEach((key => {
                        if (ignore.indexOf(key) != -1) return
                        if (['span', 'column', 'attr', 'text', 'label'].indexOf(key) != -1) {
                            if (fld[key] && !fld2.html[key]) {
                                fld2.html[key] = fld[key]
                            }
                        }
                    }))
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
                            let fld = w2utils.clone(gfield)
                            if (fld.html == null) fld.html = {}
                            w2utils.extend(fld.html, group)
                            Array('span', 'column', 'attr', 'label', 'page').forEach(key => {
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
                    let fld = w2utils.clone(field)
                    if (fld.field == null && fld.name != null) {
                        console.log('NOTICE: form field.name property is deprecated, please use field.field. Field ->', field)
                        fld.field = fld.name
                    }
                    newFields.push(fld)
                }
            })
            return { fields: newFields, tabs }
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
                w2utils.extend(this.fields[f] , obj)
                delete this.fields[f].w2field // otherwise options are not updates
                this.refresh(field)
                return true
            }
        }
        return false
    }

    getValue(field, original) {
        if (this.nestedFields) {
            let val = undefined
            try { // need this to make sure no error in fields
                let rec = original === true ? this.original : this.record
                val = String(field).split('.').reduce((rec, i) => { return rec[i] }, rec)
            } catch (event) {
            }
            return val
        } else {
            return this.record[field]
        }
    }

    setValue(field, value, noRefresh) {
        // will not refresh the form!
        if (value === '' || value == null
                || (Array.isArray(value) && value.length === 0)
                || (w2utils.isPlainObject(value) && Object.keys(value).length == 0)) {
            value = null
        }
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
                if (!noRefresh) this.setFieldValue(field, value)
                return true
            } catch (event) {
                return false
            }
        } else {
            this.record[field] = value
            if (!noRefresh) this.setFieldValue(field, value)
            return true
        }
    }

    rememberOriginal() {
        // remember original
        if (this.original == null) {
            if (Object.keys(this.record).length > 0) {
                this.original = w2utils.clone(this.record)
            } else {
                this.original = {}
            }
        }
    }

    getFieldValue(name) {
        let field = this.get(name)
        if (field == null) return
        let el = field.el
        let previous = this.getValue(name)
        let original = this.getValue(name, true)
        // orginary input control
        let current = el.value
        // should not be set to '', incosistent logic
        // if (previous == null) previous = ''

        // clean extra chars
        if (['int', 'float', 'percent', 'money', 'currency'].includes(field.type)) {
            // for float allow "0." and "0.0..." input as valid, otherwise it is not possible to enter .
            if (field.type == 'int' || /\d+\.(?!0+$)\d+/.test(current)) {
                current = field.w2field.clean(current)
            }
        }
        // radio list
        if (['radio'].includes(field.type)) {
            let selected = query(el).closest('div').find('input:checked').get(0)
            if (selected) {
                let item = field.options.items[query(selected).data('index')]
                current = item.id
            } else {
                current = null
            }
        }
        // single checkbox
        if (['toggle', 'checkbox'].includes(field.type)) {
            current = el.checked
        }
        // check list
        if (['check', 'checks'].indexOf(field.type) !== -1) {
            current = []
            let selected = query(el).closest('div').find('input:checked')
            if (selected.length > 0) {
                selected.each(el => {
                    let item = field.options.items[query(el).data('index')]
                    current.push(item.id)
                })
            }
            if (!Array.isArray(previous)) previous = []
        }
        // lists
        let selected = field.w2field?.selected // drop downs and other w2field objects
        if (['list', 'enum', 'file'].includes(field.type) && selected) {
            let nv = selected
            let cv = previous
            if (Array.isArray(nv)) {
                current = []
                for (let i = 0; i < nv.length; i++) current[i] = w2utils.clone(nv[i]) // clone array
            }
            if (Array.isArray(cv)) {
                previous = []
                for (let i = 0; i < cv.length; i++) previous[i] = w2utils.clone(cv[i]) // clone array
            }
            if (w2utils.isPlainObject(nv)) {
                current = w2utils.clone(nv) // clone object
            }
            if (w2utils.isPlainObject(cv)) {
                previous = w2utils.clone(cv) // clone object
            }
        }
        // map, array
        if (['map', 'array'].includes(field.type)) {
            current = (field.type == 'map' ? {} : [])
            field.$el.parent().find('.w2ui-map-field').each((div, ind) => {
                let key = query(div).find('.w2ui-map.key').val()
                let value = query(div).find('.w2ui-map.value').val()
                if (typeof field.html?.render == 'function') {
                    current[ind] ??= {}
                    query(div).find('input').each(inp => {
                        let name = inp.dataset.name ?? inp.name
                        if (name != null && name != '') {
                            current[ind][name] = ['checkbox', 'radio'].includes(inp.type) ? inp.checked : inp.value
                        }
                    })
                } else if (field.type == 'map') {
                    current[key] = value
                } else {
                    current.push(value)
                }
            })
        }
        return { current, previous, original } // current - in input, previous - in form.record, original - before form change
    }

    setFieldValue(name, value) {
        let field = this.get(name)
        if (field == null) return
        let el = field.el
        switch (field.type) {
            case 'toggle':
            case 'checkbox': {
                el.checked = value ? true : false
                break
            }
            case 'radio': {
                value = value?.id ?? value
                let inputs = query(el).closest('div').find('input')
                let items  = field.options.items
                items.forEach((it, ind) => {
                    if (it.id === value) { // need exact match so to match empty string and 0
                        inputs.filter(`[data-index="${ind}"]`).prop('checked', true)
                    }
                })
                break
            }
            case 'check':
            case 'checks': {
                if (!Array.isArray(value)) {
                    if (value != null) {
                        value = [value]
                    } else {
                        value = []
                    }
                }
                value = value.map(val => val?.id ?? val) // convert if array of objects
                let inputs = query(el).closest('div').find('input')
                let items  = field.options.items
                items.forEach((it, ind) => {
                    inputs.filter(`[data-index="${ind}"]`).prop('checked', value.includes(it.id) ? true : false)
                })
                break
            }
            case 'list':
            case 'combo':
                let item = value
                // find item in options.items, if any
                if (item?.id == null && Array.isArray(field.options?.items)) {
                    field.options.items.forEach(it => {
                        if (it.id === value) item = it
                    })
                }
                // if item is found in field.options, update it in the this.records
                if (item != value) {
                    this.setValue(field.name, item, true)
                }
                if (field.type == 'list') {
                    field.w2field.selected = item
                    field.w2field.refresh()
                } else {
                    field.el.value = item?.text ?? value
                }
                break
            case 'switch': {
                el.value = value
                field.toolbar.uncheck(...field.toolbar.get())
                field.toolbar.check(value)
                break
            }
            case 'enum':
            case 'file': {
                if (!Array.isArray(value)) {
                    value = value != null ? [value] : []
                }
                let items = [...value]
                // find item in options.items, if any
                let updated = false
                items.forEach((item, ind) => {
                    if (item?.id == null && Array.isArray(field.options.items)) {
                        field.options.items.forEach(it => {
                            if (it.id == item) {
                                items[ind] = it
                                updated = true
                            }
                        })
                    }
                })
                if (updated) {
                    this.setValue(field.name, items, true)
                }
                field.w2field.selected = items
                field.w2field.refresh()
                break
            }
            case 'map':
            case 'array': {
                // init map
                if (field.type == 'map' && (value == null || !w2utils.isPlainObject(value))) {
                    this.setValue(field.field, {}, true)
                    value = this.getValue(field.field)
                }
                if (field.type == 'array' && (value == null || !Array.isArray(value))) {
                    this.setValue(field.field, [], true)
                    value = this.getValue(field.field)
                }
                let container = query(field.el).parent().find('.w2ui-map-container')
                field.el.mapRefresh(value, container)
                break
            }
            case 'div':
            case 'custom': {
                query(el).html(value)
                break
            }
            case 'color': {
                el.value = value ?? ''
                field.w2field.refresh()
                break
            }
            case 'html':
            case 'empty':
                break
            default:
                // regular text fields
                el.value = value ?? ''
                break
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
        query(this.box).find('.w2ui-group').each((group) =>{
            if (isHidden(query(group).find('.w2ui-field'))) {
                query(group).hide()
            } else {
                query(group).show()
            }
        })
        function isHidden($els) {
            let flag = true
            $els.each((el) => {
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
        if (url && this.recid != null) {
            // this.clear();
            return this.request(callBack) // returns promise
        } else {
            // this.refresh(); // no need to refresh
            if (typeof callBack === 'function') callBack()
            return new Promise(resolve => { resolve() }) // resolved promise
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
            this.recid = null
            this.record = {}
            this.original = null
            this.refresh()
            this.hideErrors()
        }
    }

    error(msg) {
        // let the management of the error outside of the form
        let edata = this.trigger('error', {
            target: this.name,
            message: msg,
            fetchCtrl: this.last.fetchCtrl,
            fetchOptions: this.last.fetchOptions
        })
        if (edata.isCancelled === true) return
        // need a time out because message might be already up)
        setTimeout(() => { this.message(msg) }, 1)
        // event after
        edata.finish()
    }

    message(options) {
        return w2utils.message({
            owner: this,
            box  : this.box,
            after: '.w2ui-form-header'
        }, options)
    }

    confirm(options) {
        return w2utils.confirm({
            owner: this,
            box  : this.box,
            after: '.w2ui-form-header'
        }, options)
    }

    validate(showErrors) {
        if (showErrors == null) showErrors = true
        // validate before saving
        let errors = []
        for (let f = 0; f < this.fields.length; f++) {
            let field = this.fields[f]
            if (this.getValue(field.field) == null) this.setValue(field.field, '')
            if (['int', 'float', 'currency', 'money'].indexOf(field.type) != -1) {
                let val = this.getValue(field.field)
                let min = field.options.min
                let max = field.options.max
                if (min != null && val != null && val < min) {
                    errors.push({ field: field, error: w2utils.lang('Should be more than ${min}', { min }) })
                }
                if (max != null && val != null && val > max) {
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
                    if (this.getValue(field.field) == true) {
                        this.setValue(field.field, true)
                    } else {
                        this.setValue(field.field, false)
                    }
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
                case 'switch':
                    break
                case 'enum':
                    break
            }
            // === check required - if field is '0' it should be considered not empty
            let val = this.getValue(field.field)
            if (field.hidden !== true && field.required
                    && !['div', 'custom', 'html', 'empty'].includes(field.type)
                    && (val == null || val === '' || (Array.isArray(val) && val.length === 0)
                        || (w2utils.isPlainObject(val) && Object.keys(val).length == 0))) {
                errors.push({ field: field, error: w2utils.lang('Required field') })
            }
            if (field.hidden !== true && field.options?.minLength > 0
                    && !['enum', 'list', 'combo'].includes(field.type) // since minLength is used there for other purpose
                    && (val == null || val.length < field.options.minLength)) {
                errors.push({ field: field, error: w2utils.lang('Field should be at least ${count} characters.',
                    { count: field.options.minLength })})
            }
        }
        // event before
        let edata = this.trigger('validate', { target: this.name, errors: errors })
        if (edata.isCancelled === true) return
        // show error
        this.last.errors = errors
        if (showErrors) this.showErrors()
        // event after
        edata.finish()
        return errors
    }

    showErrors() {
        // TODO: check edge cases
        // -- invisible pages
        // -- form refresh
        let errors = this.last.errors
        if (errors.length <= 0) return
        // show errors
        this.goto(errors[0].field.page)
        query(errors[0].field.$el).parents('.w2ui-field')[0].scrollIntoView({ block: 'nearest', inline: 'nearest' })
        // show errors
        // show only for visible controls
        errors.forEach(error => {
            let opt = w2utils.extend({
                anchorClass: 'w2ui-error',
                class: 'w2ui-light',
                position: 'right|left',
                hideOn: ['input']
            }, error.options)
            if (error.field == null) return
            let anchor = error.field.el
            if (error.field.type === 'radio') { // for radio and checkboxes
                anchor = query(error.field.el).closest('div').get(0)
            } else if (['enum', 'file'].includes(error.field.type)) {
                // TODO: check
                // anchor = (error.field.el).data('w2field').helpers.multi
                // $(fld).addClass('w2ui-error')
            }
            w2tooltip.show(w2utils.extend({
                anchor,
                name: `${this.name}-${error.field.field}-error`,
                html: error.error
            }, opt))
        })
        // on scroll update errors so they will appear in correct places
        this.last.errorsShown = true
        query(errors[0].field.$el).parents('.w2ui-page')
            .off('.hideErrors')
            .on('scroll.hideErrors', (evt) => {
                if (this.last.errorsShown) {
                    this.showErrors()
                }
            })
    }

    hideErrors() {
        this.last.errorsShown = false
        this.fields.forEach(field => {
            w2tooltip.hide(`${this.name}-${field.field}-error`)
        })
    }

    getChanges() {
        // TODO: not working on nested structures
        let diff = {}
        if (this.original != null && typeof this.original == 'object' && Object.keys(this.record).length !== 0) {
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
                    if (!result[i] || (Object.keys(result[i]).length == 0 && Object.keys(original[i].length == 0))) delete result[i]
                } else if (record[i] != original[i] || (record[i] == null && original[i] != null)) { // also catch field clear
                    result[i] = record[i]
                }
            }
            return Object.keys(result).length != 0 ? result : null
        }
    }

    getCleanRecord(strict) {
        let data = w2utils.clone(this.record)
        this.fields.forEach((fld) => {
            if (['list', 'combo', 'enum'].indexOf(fld.type) != -1) {
                let tmp = { nestedFields: true, record: data }
                let val = this.getValue.call(tmp, fld.field)
                if (w2utils.isPlainObject(val) && val.id != null) { // should be true if val.id === ''
                    this.setValue.call(tmp, fld.field, val.id)
                }
                if (Array.isArray(val)) {
                    val.forEach((item, ind) => {
                        if (w2utils.isPlainObject(item) && item.id) {
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
            if (fld.type == 'file') {
                let tmp = { nestedFields: true, record: data }
                let val = this.getValue.call(tmp, fld.field) ?? []
                val.forEach(v => {
                    delete v.file
                    delete v.modified
                })
                this.setValue.call(tmp, fld.field, val)
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
        let self = this
        let resolve, reject
        let responseProm = new Promise((res, rej) => { resolve = res; reject = rej })
        // check for multiple params
        if (typeof postData === 'function') {
            callBack = postData
            postData = null
        }
        if (postData == null) postData = {}
        if (!this.url || (typeof this.url === 'object' && !this.url.get)) return
        // build parameters list
        let params = {}
        // add list params
        params.action = 'get'
        params.recid = this.recid
        params.name  = this.name
        // append other params
        w2utils.extend(params, this.postData)
        w2utils.extend(params, postData)
        // event before
        let edata = this.trigger('request', { target: this.name, url: this.url, httpMethod: 'GET',
            postData: params, httpHeaders: this.httpHeaders })
        if (edata.isCancelled === true) return
        // default action
        this.record = {}
        this.original = null
        // call server to get data
        this.lock(w2utils.lang(this.msgRefresh))
        let url = edata.detail.url
        if (typeof url === 'object' && url.get) url = url.get
        if (this.last.fetchCtrl) try { this.last.fetchCtrl.abort() } catch (e) {}
        // process url with routeData
        if (Object.keys(this.routeData).length != 0) {
            let info = w2utils.parseRoute(url)
            if (info.keys.length > 0) {
                for (let k = 0; k < info.keys.length; k++) {
                    if (this.routeData[info.keys[k].name] == null) continue
                    url = url.replace((new RegExp(':'+ info.keys[k].name, 'g')), this.routeData[info.keys[k].name])
                }
            }
        }
        url = new URL(url, location)
        let fetchOptions = w2utils.prepareParams(url, {
            method: edata.detail.httpMethod,
            headers: edata.detail.httpHeaders,
            body: edata.detail.postData
        }, this.dataType)
        this.last.fetchCtrl = new AbortController()
        fetchOptions.signal = this.last.fetchCtrl.signal
        this.last.fetchOptions = fetchOptions
        fetch(url, fetchOptions)
            .catch(processError)
            .then((resp) => {
                if (resp?.status != 200) {
                    // if resp is undefined, it means request was aborted
                    if (resp) processError(resp)
                    return
                }
                resp.json()
                    .catch(processError)
                    .then(data => {
                        // event before
                        let edata = self.trigger('load', {
                            target: self.name,
                            fetchCtrl: this.last.fetchCtrl,
                            fetchOptions: this.last.fetchOptions,
                            data
                        })
                        if (edata.isCancelled === true) return
                        // for backward compatibility
                        if (data.error == null && data.status === 'error') {
                            data.error = true
                        }
                        // if data.record is not present, then assume that entire response is the record
                        if (!data.record) {
                            Object.assign(data, { record: w2utils.clone(data) })
                        }
                        // server response error, not due to network issues
                        if (data.error === true) {
                            self.error(w2utils.lang(data.message ?? this.msgServerError))
                        } else {
                            self.record = w2utils.clone(data.record)
                        }
                        // event after
                        self.unlock()
                        edata.finish()
                        self.refresh()
                        self.setFocus()
                        // call back
                        if (typeof callBack === 'function') callBack(data)
                        resolve(data)
                    })
            })
        // event after
        edata.finish()
        return responseProm

        function processError(response) {
            if (response.name === 'AbortError') {
                // request was aborted by the form
                return
            }
            self.unlock()
            // trigger event
            let edata2 = self.trigger('error', { response, fetchCtrl: self.last.fetchCtrl, fetchOptions: self.last.fetchOptions })
            if (edata2.isCancelled === true) return
            // default behavior
            if (response.status && response.status != 200) {
                self.error(response.status + ': ' + response.statusText)
            } else {
                console.log('ERROR: Server request failed.', response, '. ',
                    'Expected Response:', { error: false, record: { field1: 1, field2: 'item' }},
                    'OR:', { error: true, message: 'Error description' })
                self.error(String(response))
            }
            // event after
            edata2.finish()
            reject(response)
        }
    }

    submit(postData, callBack) {
        return this.save(postData, callBack)
    }

    save(postData, callBack) {
        let self = this
        let resolve, reject
        let saveProm = new Promise((res, rej) => { resolve = res; reject = rej })
        // check for multiple params
        if (typeof postData === 'function') {
            callBack = postData
            postData = null
        }
        // validation
        let errors = self.validate(true)
        if (errors.length !== 0) return
        // submit save
        if (postData == null) postData = {}
        if (!self.url || (typeof self.url === 'object' && !self.url.save)) {
            console.log('ERROR: Form cannot be saved because no url is defined.')
            return
        }
        self.lock(w2utils.lang(self.msgSaving) + ' <span id="'+ self.name +'_progress"></span>')
        // build parameters list
        let params = {}
        // add list params
        params.action = 'save'
        params.recid = self.recid
        params.name = self.name
        // append other params
        w2utils.extend(params, self.postData)
        w2utils.extend(params, postData)
        params.record = w2utils.clone(self.record)
        // event before
        let edata = self.trigger('submit', { target: self.name, url: self.url, httpMethod: this.method ?? 'POST',
            postData: params, httpHeaders: self.httpHeaders })
        if (edata.isCancelled === true) return
        // default action
        let url = edata.detail.url
        if (typeof url === 'object' && url.save) url = url.save
        if (self.last.fetchCtrl) self.last.fetchCtrl.abort()
        // process url with routeData
        if (Object.keys(self.routeData).length > 0) {
            let info = w2utils.parseRoute(url)
            if (info.keys.length > 0) {
                for (let k = 0; k < info.keys.length; k++) {
                    if (self.routeData[info.keys[k].name] == null) continue
                    url = url.replace((new RegExp(':'+ info.keys[k].name, 'g')), self.routeData[info.keys[k].name])
                }
            }
        }
        url = new URL(url, location)
        let fetchOptions = w2utils.prepareParams(url, {
            method: edata.detail.httpMethod,
            headers: edata.detail.httpHeaders,
            body: edata.detail.postData
        }, this.dataType)
        this.last.fetchCtrl = new AbortController()
        fetchOptions.signal = this.last.fetchCtrl.signal
        this.last.fetchOptions = fetchOptions
        fetch(url, fetchOptions)
            .catch(processError)
            .then(resp => {
                self.unlock()
                if (resp?.status != 200) {
                    processError(resp ?? {})
                    return
                }
                // parse server response
                resp.json()
                    .catch(processError)
                    .then(data => {
                        // event before
                        let edata = self.trigger('save', {
                            target: self.name,
                            fetchCtrl: this.last.fetchCtrl,
                            fetchOptions: this.last.fetchOptions,
                            data
                        })
                        if (edata.isCancelled === true) return
                        // server error, not due to network issues
                        if (data.error === true) {
                            self.error(w2utils.lang(data.message ?? this.msgServerError))
                        } else {
                            self.original = null
                        }
                        // event after
                        edata.finish()
                        self.refresh()
                        // call back
                        if (typeof callBack === 'function') callBack(data)
                        resolve(data)
                    })
            })
        // event after
        edata.finish()
        return saveProm

        function processError(response) {
            if (response?.name === 'AbortError') {
                // request was aborted by the form
                return
            }
            self.unlock()
            // trigger event
            let edata2 = self.trigger('error', { response, fetchCtrl: self.last.fetchCtrl, fetchOptions: self.last.fetchOptions })
            if (edata2.isCancelled === true) return
            // default behavior
            if (response.status && response.status != 200) {
                response.json().then((data) => {
                    self.error(response.status + ': ' + data.message ?? response.statusText)
                }).catch(() => {
                    self.error(response.status + ': ' + response.statusText)
                })
            } else {
                console.log('ERROR: Server request failed.', response, '. ',
                    'Expected Response:', { error: false, record: { field1: 1, field2: 'item' }},
                    'OR:', { error: true, message: 'Error description' })
                self.error(String(response))
            }
            // event after
            edata2.finish()
            reject()
        }
    }

    lock(msg, showSpinner) {
        let args = Array.from(arguments)
        args.unshift(this.box)
        w2utils.lock(...args)
    }

    unlock(speed) {
        let box = this.box
        w2utils.unlock(box, speed)
    }

    lockPage(page, msg, spinner) {
        let $page = query(this.box).find('.page-' + page)
        if ($page.length){
            // page found
            w2utils.lock($page, msg, spinner)
            return true
        }
        // page with this id not found!
        return false
    }

    unlockPage(page, speed) {
        let $page = query(this.box).find('.page-' + page)
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
        if (query(this.box).data('autoSize') === true) {
            query(this.box).get(0).clientHeight = 0
        }
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
            field.html = w2utils.extend({ label: '', span: 6, attr: '', text: '', style: '', page: 0, column: 0 }, field.html)
            if (page == null) page = field.html.page
            if (column == null) column = field.html.column
            // input control
            let input = `<input id="${field.field}" name="${field.field}" class="w2ui-input ${field.html.class ?? ''}" type="text" ${field.html.attr + tabindex_str}>`
            switch (field.type) {
                case 'pass':
                case 'password':
                    input = input.replace('type="text"', 'type="password"')
                    break
                case 'checkbox': {
                    input = `
                        <label class="w2ui-box-label">
                            <input id="${field.field}" name="${field.field}" class="w2ui-input ${field.html.class ?? ''}" type="checkbox" ${field.html.attr + tabindex_str}>
                            <span>${field.html.label}</span>
                        </label>`
                    break
                }
                case 'check':
                case 'checks': {
                    if (field.options.items == null && field.html.items != null) field.options.items = field.html.items
                    let items = field.options.items
                    input = ''
                    // normalized options
                    if (!Array.isArray(items)) items = []
                    if (items.length > 0) {
                        items = w2utils.normMenu.call(this, items, field)
                    }
                    // generate
                    for (let i = 0; i < items.length; i++) {
                        input += `
                            <label class="w2ui-box-label">
                                <input id="${field.field + i}" name="${field.field}" class="w2ui-input ${field.html.class ?? ''}" type="checkbox"
                                    ${field.html.attr + tabindex_str} data-value="${items[i].id}" data-index="${i}">
                                <span>&#160;${items[i].text}</span>
                            </label>
                            <br>`
                    }
                    break
                }
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
                        input += `
                            <label class="w2ui-box-label">
                                <input id="${field.field + i}" name="${field.field}" class="w2ui-input ${field.html.class ?? ''}" type="radio"
                                    ${field.html.attr + (i === 0 ? tabindex_str : '')}
                                    data-value="${items[i].id}" data-index="${i}">
                                <span>&#160;${items[i].text}</span>
                            </label>
                            <br>`
                    }
                    break
                }
                case 'select': {
                    input = `<select id="${field.field}" name="${field.field}" class="w2ui-input ${field.html.class ?? ''}" ${field.html.attr + tabindex_str}>`
                    // normalized options
                    if (field.options.items == null && field.html.items != null) field.options.items = field.html.items
                    let items = field.options.items
                    if (!Array.isArray(items)) items = []
                    if (items.length > 0) {
                        items = w2utils.normMenu.call(this, items, field)
                    }
                    // generate
                    for (let i = 0; i < items.length; i++) {
                        input += `<option value="${items[i].id}">${items[i].text}</option>`
                    }
                    input += '</select>'
                    break
                }
                case 'switch': {
                    input = `<div id="${field.field}-tb" class="w2ui-form-switch ${field.html.class ?? ''}" ${field.html.attr}></div>
                        <input id="${field.field}" name="${field.field}" ${tabindex_str} class="w2ui-input"
                            style="position: absolute; right: 0; margin-top: -30px; width: 1px; padding: 0; opacity: 0">`
                    break
                }
                case 'textarea':
                    input = `<textarea id="${field.field}" name="${field.field}" class="w2ui-input ${field.html.class ?? ''}" ${field.html.attr + tabindex_str}></textarea>`
                    break
                case 'toggle':
                    input = `<input id="${field.field}" name="${field.field}" class="w2ui-input w2ui-toggle  ${field.html.class ?? ''}"
                                type="checkbox" ${field.html.attr + tabindex_str}>
                            <div><div></div></div>`
                    break
                case 'map':
                case 'array':
                    field.html.key = field.html.key || {}
                    field.html.value = field.html.value || {}
                    field.html.tabindex = tabindex
                    field.html.tabindex_str = tabindex_str
                    input = '<span style="float: right">' + (field.html.text || '') + '</span>' +
                            '<input id="'+ field.field +'" name="'+ field.field +'" type="hidden" '+ field.html.attr + tabindex_str + '>'+
                            '<div class="w2ui-map-container"></div>'
                    break
                case 'div':
                case 'custom':
                    input = `<div id="${field.field}" name="${field.field}" ${field.html.attr + tabindex_str} class="w2ui-input ${field.html.class ?? ''}">`+
                                (field && field.html && field.html.html ? field.html.html : '') +
                            '</div>'
                    break
                case 'html':
                case 'empty':
                    input = `<div id="${field.field}" name="${field.field}" ${field.html.attr + tabindex_str} class="w2ui-input ${field.html.class ?? ''}">`+
                                (field && field.html ? (field.html.html || '') + (field.html.text || '') : '') +
                            '</div>'
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
                    + '\n   <div class="w2ui-group-title w2ui-eaction" style="'+ (field.html.groupTitleStyle || '') + '; '
                                    + (collapsible != '' ? 'cursor: pointer; user-select: none' : '') + '"'
                    + (collapsible != '' ? 'data-group="' + w2utils.base64encode(field.html.group) + '"' : '')
                    + (collapsible != ''
                        ? 'data-click="toggleGroup|' + field.html.group + '"'
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
        if (Object.keys(this.actions).length > 0) {
            buttons += '\n<div class="w2ui-buttons">'
            tabindex = this.tabindexBase + this.fields.length + 1

            for (let a in this.actions) { // it is an object
                let act  = this.actions[a]
                let info = { text: '', style: '', 'class': '' }
                if (w2utils.isPlainObject(act)) {
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
        let el = query(this.box).find('.w2ui-group-title[data-group="' + w2utils.base64encode(groupName) + '"]')
        if (el.length === 0) return
        let el_next = query(el.prop('nextElementSibling'))
        if (typeof show === 'undefined') {
            show = (el_next.css('display') == 'none')
        }
        if (show) {
            el_next.show()
            el.find('span').addClass('w2ui-icon-collapse').removeClass('w2ui-icon-expand')
        } else {
            el_next.hide()
            el.find('span').addClass('w2ui-icon-expand').removeClass('w2ui-icon-collapse')
        }
    }

    action(action, event) {
        let act   = this.actions[action]
        let click = act
        if (w2utils.isPlainObject(act) && act.onClick) click = act.onClick
        // event before
        let edata = this.trigger('action', { target: action, action: act, originalEvent: event })
        if (edata.isCancelled === true) return
        // default actions
        if (typeof click === 'function') click.call(this, event)
        // event after
        edata.finish()
    }

    resize() {
        let self = this
        // event before
        let edata = this.trigger('resize', { target: this.name })
        if (edata.isCancelled === true) return
        // default behaviour
        if (this.box != null) {
            let header  = query(this.box).find(':scope > div .w2ui-form-header')
            let toolbar = query(this.box).find(':scope > div .w2ui-form-toolbar')
            let tabs    = query(this.box).find(':scope > div .w2ui-form-tabs')
            let page    = query(this.box).find(':scope > div .w2ui-page')
            let dpage   = query(this.box).find(':scope > div .w2ui-page.page-'+ this.page + ' > div')
            let buttons = query(this.box).find(':scope > div .w2ui-buttons')
            // if no height, calculate it
            let { headerHeight, tbHeight, tabsHeight } = resizeElements()
            if (this.autosize) { // we don't need autosize every time
                let cHeight = query(this.box).get(0).clientHeight
                if (cHeight === 0 || query(this.box).data('autosize') == 'yes') {
                    query(this.box).css({
                        height: headerHeight + tbHeight + tabsHeight + 15 // 15 is extra height
                            + (page.length > 0 ? w2utils.getSize(dpage, 'height') : 0)
                            + (buttons.length > 0 ? w2utils.getSize(buttons, 'height') : 0)
                            + 'px'
                    })
                    query(this.box).data('autosize', 'yes')
                }
                resizeElements()
            }
            // resize tabs and toolbar if any
            this.tabs?.resize?.()
            this.toolbar?.resize?.()
            // resize switch fields
            this.fields.forEach(field => {
                if (field.type == 'switch') {
                    field.toolbar?.resize?.()
                }
            })

            function resizeElements() {
                let headerHeight = (self.header !== '' ? w2utils.getSize(header, 'height') : 0)
                let tbHeight = (Array.isArray(self.toolbar?.items) && self.toolbar?.items?.length > 0)
                    ? w2utils.getSize(toolbar, 'height')
                    : 0
                let tabsHeight = (Array.isArray(self.tabs?.tabs) && self.tabs?.tabs?.length > 0)
                    ? w2utils.getSize(tabs, 'height')
                    : 0
                // resize elements
                toolbar.css({ top: headerHeight + 'px' })
                tabs.css({ top: headerHeight + tbHeight + 'px' })
                page.css({
                    top: headerHeight + tbHeight + tabsHeight + 'px',
                    bottom: (buttons.length > 0 ? w2utils.getSize(buttons, 'height') : 0) + 'px'
                })
                // return some params
                return { headerHeight, tbHeight, tabsHeight }
            }
        }
        // event after
        edata.finish()
    }

    refresh() {
        let time = Date.now()
        let self = this
        if (!this.box) return
        if (!this.isGenerated || !query(this.box).html()) return
        // event before
        let edata = this.trigger('refresh', { target: this.name, page: this.page, field: arguments[0], fields: arguments })
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
            // update field.page with page it belongs too
            query(this.box).find('input, textarea, select').each(el => {
                let name = (query(el).attr('name') != null ? query(el).attr('name') : query(el).attr('id'))
                let field = this.get(name)
                if (field) {
                    // find page
                    let div = query(el).closest('.w2ui-page')
                    if (div.length > 0) {
                        for (let i = 0; i < 100; i++) {
                            if (div.hasClass('page-'+i)) { field.page = i; break }
                        }
                    }
                }
            })
            // default action
            query(this.box).find('.w2ui-page').hide()
            query(this.box).find('.w2ui-page.page-' + this.page).show()
            query(this.box).find('.w2ui-form-header').html(w2utils.lang(this.header))
            // refresh tabs if needed
            if (typeof this.tabs === 'object' && Array.isArray(this.tabs.tabs) && this.tabs.tabs.length > 0) {
                query(this.box).find('#form_'+ this.name +'_tabs').show()
                this.tabs.active = this.tabs.tabs[this.page].id
                this.tabs.refresh()
            } else {
                query(this.box).find('#form_'+ this.name +'_tabs').hide()
            }
            // refresh tabs if needed
            if (typeof this.toolbar === 'object' && Array.isArray(this.toolbar.items) && this.toolbar.items.length > 0) {
                query(this.box).find('#form_'+ this.name +'_toolbar').show()
                this.toolbar.refresh()
            } else {
                query(this.box).find('#form_'+ this.name +'_toolbar').hide()
            }
        }
        // refresh values of fields
        for (let f = 0; f < fields.length; f++) {
            let field = this.fields[fields[f]]
            if (field.name == null && field.field != null) field.name = field.field
            if (field.field == null && field.name != null) field.field = field.name
            field.$el = query(this.box).find(`[name='${String(field.name).replace(/\\/g, '\\\\')}']`)
            field.el  = field.$el.get(0)
            if (field.el) field.el.id = field.name
            if (field.w2field) {
                field.w2field.reset()
            }
            field.$el
                .off('.w2form')
                .on('change.w2form', function(event) {
                    let value = self.getFieldValue(field.field)
                    // clear error class
                    if (['enum', 'file'].includes(field.type)) {
                        let helper = field.w2field?.helpers?.multi
                        query(helper).removeClass('w2ui-error')
                    }
                    if (this._previous != null) {
                        value.previous = this._previous
                        delete this._previous
                    }
                    // event before
                    let edata2 = self.trigger('change', { target: this.name, field: this.name, value, originalEvent: event })
                    if (edata2.isCancelled === true) return
                    // default behavior
                    self.setValue(this.name, value.current)
                    // event after
                    edata2.finish()
                })
                .on('input.w2form', function(event) {
                    self.rememberOriginal()
                    let value = self.getFieldValue(field.field)
                    // save previous for change event
                    if (this._previous == null) {
                        this._previous = value.previous
                    }
                    // event before
                    let edata2 = self.trigger('input', { target: self.name, field, value, originalEvent: event })
                    if (edata2.isCancelled === true) return
                    // default action
                    self.setValue(this.name, value.current)
                    // event after
                    edata2.finish()
                })
            // required
            if (field.required) {
                field.$el.closest('.w2ui-field').addClass('w2ui-required')
            } else {
                field.$el.closest('.w2ui-field').removeClass('w2ui-required')
            }
            // disabled
            if (field.disabled != null) {
                if (field.disabled) {
                    if (field.$el.data('tabIndex') == null) {
                        field.$el.data('tabIndex', field.$el.prop('tabIndex'))
                    }
                    field.$el
                        .prop('readOnly', true)
                        .prop('disabled', true)
                        .prop('tabIndex', -1)
                        .closest('.w2ui-field')
                        .addClass('w2ui-disabled')
                } else {
                    field.$el
                        .prop('readOnly', false)
                        .prop('disabled', false)
                        .prop('tabIndex', field.$el.data('tabIndex') ?? field.$el.prop('tabIndex') ?? 0)
                        .closest('.w2ui-field')
                        .removeClass('w2ui-disabled')
                }
            }
            // hidden
            let tmp = field.el
            if (!tmp) tmp = query(this.box).find('#' + field.field)
            if (field.hidden) {
                query(tmp).closest('.w2ui-field').hide()
            } else {
                query(tmp).closest('.w2ui-field').show()
            }
        }
        // attach actions on buttons
        query(this.box).find('button, input[type=button]').each(el => {
            query(el).off('click').on('click', function(event) {
                let action = this.value
                if (this.id) action = this.id
                if (this.name) action = this.name
                self.action(action, event)
            })
        })
        // init controls with record
        for (let f = 0; f < fields.length; f++) {
            let field = this.fields[fields[f]]
            if (!field.el) continue
            if (!field.$el.hasClass('w2ui-input')) field.$el.addClass('w2ui-input')
            field.type = String(field.type).toLowerCase()
            if (!field.options) field.options = {}
            // list type
            if (this.LIST_TYPES.includes(field.type)) {
                let items = field.options.items
                if (items == null) field.options.items = []
                if (field.type == 'switch') {
                    // should not have .text if it is not explicitly set, or toolbar will have text
                    items.forEach((item, ind) => {
                        return items[ind] = typeof item != 'object'
                            ? { id: item, text: item }
                            : item
                    })
                } else {
                    field.options.items = w2utils.normMenu.call(this, items ?? [], field)
                }
            }
            // switch
            if (field.type == 'switch') {
                if (field.toolbar) {
                    w2ui[this.name + '_' + field.name + '_tb'].destroy()
                }
                let items = field.options.items
                items.forEach(item => item.type = 'radio')
                field.toolbar = new w2toolbar({
                    box: field.$el.prev().get(0),
                    name: this.name + '_' + field.name + '_tb',
                    items,
                    onClick(event) {
                        self.rememberOriginal()
                        let value = self.getFieldValue(field.name)
                        value.current = event.detail.item.id
                        let edata = self.trigger('change', { target: field.name, field: field.name, value, originalEvent: event })
                        if (edata.isCancelled === true) {
                            return
                        }
                        self.record[field.name] = value.current
                        self.setFieldValue(field.name, value.current)
                        edata.finish()
                    }
                })
                field.$el.prev().addClass('w2ui-form-switch') // need to add this class, as toolbar render will remove all w2ui-* classes
                field.$el
                    .off('.form-input')
                    .on('focus.form-input', event => {
                        let ind = field.toolbar.get(field.$el.val(), true)
                        query(event.target).prop('_index', ind)
                        query(field.toolbar.box).addClass('w2ui-tb-focus')
                    })
                    .on('blur.form-input', event => {
                        query(event.target).removeProp('_index')
                        query(`#${field.name}-tb .w2ui-tb-button`).removeClass('over')
                        query(field.toolbar.box).removeClass('w2ui-tb-focus')
                    })
                    .on('keydown.form-input', event => {
                        let ind = query(event.target).prop('_index')
                        switch (event.key) {
                            case 'ArrowLeft': {
                                if (ind > 0) ind--
                                query(`#${field.name}-tb .w2ui-tb-button`)
                                    .removeClass('over')
                                    .eq(ind)
                                    .addClass('over')
                                query(event.target).prop('_index', ind)
                                break
                            }
                            case 'ArrowRight': {
                                if (ind < field.toolbar.items.length -1) ind++
                                query(`#${field.name}-tb .w2ui-tb-button`)
                                    .removeClass('over')
                                    .eq(ind)
                                    .addClass('over')
                                query(event.target).prop('_index', ind)
                                break
                            }
                        }
                        if (event.keyCode == 32 || event.keyCode == 13) {
                            // space or enter - apply selected
                            self.rememberOriginal()
                            let value = self.getFieldValue(field.name)
                            value.current = field.toolbar.items[ind].id
                            let edata = self.trigger('change', { target: field.name, field: field.name, value, originalEvent: event })
                            if (edata.isCancelled === true) {
                                return
                            }
                            self.record[field.name] = value.current
                            self.setFieldValue(field.name, value.current)
                            edata.finish()
                            query(`#${field.name}-tb .w2ui-tb-button`).removeClass('over')
                        }
                        // do not allow any input, besides a tab
                        if (!event.metaKey && !event.ctrlKey && event.keyCode != 9) {
                            event.preventDefault()
                        }
                    })
            }

            // HTML select
            if (field.type == 'select') {
                // generate options
                let items = field.options.items
                let options = ''
                items.forEach(item => {
                    options += `<option value="${item.id}">${item.text}</option>`
                })
                field.$el.html(options)
            }
            // w2fields
            if (this.W2FIELD_TYPES.includes(field.type)) {
                field.w2field = field.w2field
                    ?? new w2field(w2utils.extend({}, field.options, { type: field.type }))
                field.w2field.render(field.el)
            }
            // map and arrays
            if (['map', 'array'].includes(field.type)) {
                // need closure
                (function (obj, field) {
                    let keepFocus
                    field.el.mapAdd = function(field, div, cnt, empty) {
                        let attr = (field.disabled ? ' readOnly ' : '') + (field.html.tabindex_str || '')
                        let html = `<input type="text" ${(field.html.value.attr ?? '') + attr} class="w2ui-input ${field.html.class ?? ''} w2ui-map value">`
                            + `${field.html.value.text || ''}`

                        if (typeof field.html.render == 'function') {
                            html = field.html.render.call(self, { empty: !!empty, ind: cnt, field, div })
                            // make sure all inputs have names as it is important for array objects
                            if (!field.el._errorDisplayed) {
                                query.html(html).filter('input').each(inp => {
                                    let name = inp.dataset.name ?? inp.name
                                    if (name == null || name == '') {
                                        console.log(`ERROR: All inputs of the field %c"${field.name}"%c must have name attribute defined. No name for %c${inp.outerHTML}`,
                                            'color: blue', '', 'color: red')
                                    }
                                })
                                field.el._errorDisplayed = true
                            }
                        } else if (field.type == 'map') {
                            // has key input in front
                            html = `<input type="text" ${(field.html.key.attr ?? '') + attr} class="w2ui-input ${field.html.class ?? ''} w2ui-map key">
                                ${field.html.key.text || ''}
                            ` + html
                        }
                        div.append(`<div class="w2ui-map-field" style="margin-bottom: 5px" data-index="${cnt}">${html}</div>`)
                        if (typeof field.html.render == 'function') {
                            let box = div.find(`[data-index="${cnt}"]`)
                            box.find(`input`).each(el => {
                                // set only if it is not defined in the HTML
                                if (query(el).attr('tabindex') == null) {
                                    query(el).attr('tabindex', field.html.tabindex)
                                }
                            })
                            if (typeof field.html.onRefresh == 'function') {
                                field.html.onRefresh.call(self, { index: cnt, empty, box: box.get(0) })
                            }
                        }
                    }
                    field.el.mapRefresh = function(map, div) {
                        // generate options
                        let keys, $k, $v
                        if (field.type == 'map') {
                            if (!w2utils.isPlainObject(map)) map = {}
                            if (map._order == null) map._order = Object.keys(map)
                            keys = map._order
                        }
                        if (field.type == 'array') {
                            if (!Array.isArray(map)) map = []
                            keys = map.map((item, ind) => { return ind })
                        }
                        // delete extra fields (including empty one)
                        let all = div.find('.w2ui-map-field')
                        for (let i = all.length-1; i >= keys.length; i--) {
                            div.find(`div[data-index='${i}']`).remove()
                        }
                        for (let ind = 0; ind < keys.length; ind++) {
                            let key = keys[ind]
                            let fld = div.find(`div[data-index='${ind}']`)
                            // add if does not exists
                            if (fld.length == 0) {
                                field.el.mapAdd(field, div, ind)
                                fld = div.find(`div[data-index='${ind}']`)
                            }
                            fld.attr('data-key', key)
                            if (typeof field.html?.render == 'function') {
                                let val = map[key]
                                fld.find('input').each(inp => {
                                    let name = inp.dataset.name ?? inp.name // <input data-name="higher priority" name="then">
                                    if (inp.type == 'checkbox') {
                                        inp.checked = val[name] ?? false
                                    } else if (inp.type == 'radio') {
                                        inp.checked = val[name] ?? false
                                    } else {
                                        inp.value = val[name] ?? ''
                                    }
                                })
                            } else {
                                $k = fld.find('.w2ui-map.key')
                                $v = fld.find('.w2ui-map.value')
                                let val = map[key]
                                if (field.type == 'array') {
                                    let tmp = map.filter((it) => { return it?.key == key ? true : false})
                                    if (tmp.length > 0) val = tmp[0].value
                                }
                                $k.val(key)
                                $v.val(val)
                                if (field.disabled === true || field.disabled === false) {
                                    $k.prop('readOnly', field.disabled ? true : false)
                                    $v.prop('readOnly', field.disabled ? true : false)
                                }
                            }
                            // call refresh
                            if (typeof field.html.onRefresh == 'function') {
                                field.html.onRefresh.call(self, { index: ind, box: div.find(`[data-index="${ind}"]`).get(0) })
                            }
                        }
                        if (typeof field.html.render == 'function') {
                            $v = div.find('.w2ui-map-field:last-child input:first-child')
                        }
                        let cnt = keys.length
                        let curr = div.find(`div[data-index='${cnt}']`)
                        // if not disabled - add next if needed
                        if (curr.length === 0 && (!$k || $k.val() != '' || $v.val() != '')
                            && !($k && ($k.prop('readOnly') === true || $k.prop('disabled') === true))
                        ) {
                            field.el.mapAdd(field, div, cnt, true)
                        }
                        if (field.disabled === true || field.disabled === false) {
                            curr.find('.key').prop('readOnly', field.disabled ? true : false)
                            curr.find('.value').prop('readOnly', field.disabled ? true : false)
                        }
                        // attach events
                        let container = query(field.el).get(0)?.nextSibling // should be div
                        query(container)
                            .off('.mapChange')
                            .on('mouseup.mapChange', 'input', function (event) {
                                /***
                                 * This hack is needed for the cases when this field is refreshed and focus in bettween of mousedown and mouse up.
                                 * In such a case, the field will not get focused, but should be as there was mouse click.
                                 */
                                if (document.activeElement != event.target) {
                                    event.target.focus()
                                }
                            })
                            .on('keyup.mapChange', 'input', function(event) {
                                let $div = query(event.target).closest('.w2ui-map-field')
                                let next = $div.get(0).nextElementSibling
                                let prev = $div.get(0).previousElementSibling
                                if (event.keyCode == 13) {
                                    let el = keepFocus ?? next
                                    if (el instanceof HTMLElement) {
                                        let inp = query(el).find('input')
                                        if (inp.length > 0) {
                                            inp.get(0).focus()
                                        }
                                    }
                                    keepFocus = undefined
                                }
                                let className = query(event.target).hasClass('key') ? 'key' : 'value'
                                if (event.keyCode == 38 && prev) { // up key
                                    query(prev).find(`input.${className}, input[name="${event.target.name}"]`).get(0).select()
                                    event.preventDefault()
                                }
                                if (event.keyCode == 40 && next) { // down key
                                    event.target.blur() // blur is neeeded because because it will trigger change which will re-render fields
                                    let next = $div.get(0).nextElementSibling // need to query it again because it was re-rendered
                                    query(next).find(`input.${className}, input[name="${event.target.name}"]`).get(0).select()
                                    event.preventDefault()
                                }
                            })
                            .on('keydown.mapChange', 'input', function(event) {
                                if (event.keyCode == 9) { // tab
                                    /**
                                     * In some cases, when elements are added dynamically after element was focused, hitting tab would not
                                     * consider newly created elements are focusable, therefore we check here if focus goes to body on tab key
                                     * then move it next input
                                     */
                                    setTimeout(() => {
                                        if (document.activeElement?.tagName == 'BODY') {
                                            query(event.target.parentNode).next().find('input').get(0)?.focus()
                                        }
                                    }, 10)
                                }
                                if (event.keyCode == 38 || event.keyCode == 40) {
                                    event.preventDefault()
                                }
                            })
                            .on('input.mapChange', 'input', function(event) {
                                let fld = query(event.target).closest('div')
                                let cnt = fld.data('index')
                                let next = fld.get(0).nextElementSibling
                                // if last one, add new empty
                                let isEmpty = true
                                query(fld).find('input').each(el => {
                                    if (!['checkbox', 'button'].includes(el.type) && el.value != '') isEmpty = false
                                })
                                let isNextEmpty = true
                                query(next).find('input').each(el => {
                                    if (!['checkbox', 'button'].includes(el.type) && el.value != '') isNextEmpty = false
                                })
                                if (!isEmpty && !next) {
                                    field.el.mapAdd(field, div, parseInt(cnt) + 1, true)
                                } else if (isEmpty && next && isNextEmpty) {
                                    query(next).remove()
                                }
                            })
                            .on('change.mapChange', 'input', function(event) {
                                self.rememberOriginal()
                                // event before
                                let { current, previous, original } = self.getFieldValue(field.field)
                                let $cnt = query(event.target).closest('.w2ui-map-container')
                                // delete empty
                                if (typeof field.html?.render == 'function') {
                                    current = current.filter(kk => {
                                        let val = [...(new Set(Object.values(kk).filter(vv => typeof vv != 'boolean')))]
                                        return !(val.length == 0 || (val.length == 1 && val[0] === ''))
                                    })
                                } else if (field.type == 'map') {
                                    current._order = []
                                    $cnt.find('.w2ui-map.key').each(el => { current._order.push(el.value) })
                                    current._order = current._order.filter(k => k !== '')
                                    delete current['']
                                } else if (field.type == 'array') {
                                    current = current.filter(k => k !== '')
                                }
                                let edata = self.trigger('change', { target: field.field, field: field.field, originalEvent: event,
                                    value: { current, previous, original }
                                })
                                if (edata.isCancelled === true) {
                                    return
                                }
                                if (query(event.target).parent().find('input').val() == '') {
                                    keepFocus = event.target
                                }
                                self.setValue(field.field, current)
                                field.el.mapRefresh(current, div)
                                // event after
                                edata.finish()
                            })
                    }
                })(this, field)
            }
            // set value to HTML input field
            this.setFieldValue(field.field, this.getValue(field.name))
        }
        // event after
        edata.finish()
        this.resize()
        return Date.now() - time
    }

    render(box) {
        let time = Date.now()
        let self = this
        if (typeof box == 'string') box = query(box).get(0)
        // event before
        let edata = this.trigger('render', { target: this.name, box: box ?? this.box })
        if (edata.isCancelled === true) return
        // default action
        if (box != null) {
            this.unmount() // clean previous control
            this.box = box
        }
        if (!this.isGenerated && !this.formHTML) return
        if (!this.box) return
        // render form
        let html = '<div class="w2ui-form-box">' +
                    (this.header !== '' ? '<div class="w2ui-form-header">' + w2utils.lang(this.header) + '</div>' : '') +
                    '    <div id="form_'+ this.name +'_toolbar" class="w2ui-form-toolbar" style="display: none"></div>' +
                    '    <div id="form_'+ this.name +'_tabs" class="w2ui-form-tabs" style="display: none"></div>' +
                        this.formHTML +
                    '</div>'
        query(this.box).attr('name', this.name)
            .addClass('w2ui-reset w2ui-form')
            .html(html)
        if (query(this.box).length > 0) query(this.box)[0].style.cssText += this.style
        w2utils.bindEvents(query(this.box).find('.w2ui-eaction'), this)

        // init toolbar regardless it is defined or not
        if (typeof this.toolbar.render !== 'function') {
            this.toolbar = new w2toolbar(w2utils.extend({}, this.toolbar, { name: this.name +'_toolbar', owner: this }))
            this.toolbar.on('click', function(event) {
                let edata = self.trigger('toolbar', { target: event.target, originalEvent: event })
                if (edata.isCancelled === true) return
                // no default action
                edata.finish()
            })
        }
        if (typeof this.toolbar === 'object' && typeof this.toolbar.render === 'function') {
            this.toolbar.render(query(this.box).find('#form_'+ this.name +'_toolbar')[0])
        }
        // init tabs regardless it is defined or not
        if (typeof this.tabs.render !== 'function') {
            this.tabs = new w2tabs(w2utils.extend({}, this.tabs, { name: this.name +'_tabs', owner: this, active: this.tabs.active }))
            this.tabs.on('click', function(event) {
                self.goto(this.get(event.target, true))
            })
        }
        if (typeof this.tabs === 'object' && typeof this.tabs.render === 'function') {
            this.tabs.render(query(this.box).find('#form_'+ this.name +'_tabs')[0])
            if (this.tabs.active) this.tabs.click(this.tabs.active)
        }
        // event after
        edata.finish()
        // after render actions
        this.resize()
        let url = (typeof this.url !== 'object' ? this.url : this.url.get)
        if (url && this.recid != null) {
            this.request().catch(error => this.refresh()) // even if there was error, still need refresh
        } else {
            this.refresh()
        }
        // observe div resize
        this.last.observeResize = new ResizeObserver(() => { this.resize() })
        this.last.observeResize.observe(this.box)
        // focus on load
        if (this.focus != -1) {
            let setCount = 0
            let setFocus = () => {
                if (query(self.box).find('input, select, textarea').length > 0) {
                    self.setFocus()
                } else {
                    setCount++
                    if (setCount < 20) setTimeout(setFocus, 50) // 1 sec max
                }
            }
            setFocus()
        }
        return Date.now() - time
    }

    unmount() {
        super.unmount()
        this.tabs?.unmount?.()
        this.toolbar?.unmount?.()
        this.last.observeResize?.disconnect()
    }

    destroy() {
        // event before
        let edata = this.trigger('destroy', { target: this.name })
        if (edata.isCancelled === true) return
        // clean up
        this.tabs?.destroy?.()
        this.toolbar?.destroy?.()
        if (query(this.box).find('#form_'+ this.name +'_tabs').length > 0) {
            this.unmount()
        }
        this.last.observeResize?.disconnect()
        delete w2ui[this.name]
        // event after
        edata.finish()
    }

    setFocus(focus) {
        if (typeof focus === 'undefined'){
            // no argument - use form's focus property
            focus = this.focus
        }
        let $input
        // focus field by index
        if (w2utils.isInt(focus)){
            if (focus < 0) {
                return
            }
            let inputs = query(this.box)
                .find('div:not(.w2ui-field-helper) > input, select, textarea, div > label:nth-child(1) > [type=radio]')
                .filter(':not(.file-input)')
            // find visible (offsetParent == null for any element is not visible)
            while (inputs[focus].offsetParent == null && inputs.length >= focus) {
                focus++
            }
            if (inputs[focus]) {
                $input = query(inputs[focus])
            }
        } else if (typeof focus === 'string') {
            // focus field by name
            $input = query(this.box).find(`[name='${focus}']`)
        }
        if ($input.length > 0){
            $input.get(0).focus()
        }
        return $input
    }
}
export { w2form }
