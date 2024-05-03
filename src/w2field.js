/**
 * Part of w2ui 2.0 library
 *  - Dependencies: mQuery, w2utils, w2base, w2tooltip, w2color, w2menu, w2date
 *
 * == TODO ==
 *  - upload (regular files)
 *  - BUG with prefix/postfix and arrows (test in different contexts)
 *  - multiple date selection
 *  - month selection, year selections
 *  - MultiSelect - Allow Copy/Paste for single and multi values
 *  - add routeData to list/enum
 *  - ENUM, LIST: should have same as grid (limit, offset, search, sort)
 *  - ENUM, LIST: should support wild chars
 *  - add selection of predefined times (used for appointments)
 *  - options.items - can be an array
 *  - options.msgNoItems - can be a function
 *  - REMOTE fields
 *
 * == 2.0 changes
 *  - removed jQuery dependency
 *  - enum options.autoAdd
 *  - [numeric, date] - options.autoCorrect to enforce range and validity
 *  - silent only left for files, removed form the rest
 *  - remote source response items => records or just an array
 *  - deprecated "success" field for remote source response
 *  - CSP - fixed inline events
 *  - remove clear, use reset instead
 *  - options.msgSearch
 *  - options.msgNoItems
 */

import query from './query.js'
import { w2base } from './w2base.js'
import { w2utils } from './w2utils.js'
import { w2tooltip, w2color, w2menu, w2date } from './w2tooltip.js'

class w2field extends w2base {
    constructor(type, options) {
        super()
        // sanitization
        if (typeof type == 'string' && options == null) {
            options = { type: type }
        }
        if (typeof type == 'object' && options == null) {
            options = w2utils.clone(type)
        }
        if (typeof type == 'string' && typeof options == 'object') {
            options.type = type
        }
        options.type = String(options.type).toLowerCase()
        this.el          = options.el ?? null
        this.selected    = null
        this.helpers     = {} // object or helper elements
        this.type        = options.type ?? 'text'
        this.options     = w2utils.clone(options)
        this.onClick     = options.onClick ?? null
        this.onAdd       = options.onAdd ?? null
        this.onNew       = options.onNew ?? null
        this.onRemove    = options.onRemove ?? null
        this.onMouseEnter= options.onMouseEnter ?? null
        this.onMouseLeave= options.onMouseLeave ?? null
        this.onScroll    = options.onScroll ?? null
        this.tmp         = {} // temp object
        // clean up some options
        delete this.options.type
        delete this.options.onClick
        delete this.options.onMouseEnter
        delete this.options.onMouseLeave
        delete this.options.onScroll

        if (this.el) {
            this.render(this.el)
        }
    }

    render(el) {
        if (!(el instanceof HTMLElement)) {
            console.log('ERROR: Cannot init w2field on empty subject')
            return
        }
        el._w2field?.reset?.() // will remove all previous events
        el._w2field = this
        this.el = el
        this.init()
    }

    init() {
        let options = this.options
        let defaults

        // only for INPUT or TEXTAREA
        if (!['INPUT', 'TEXTAREA'].includes(this.el.tagName.toUpperCase())) {
            console.log('ERROR: w2field could only be applied to INPUT or TEXTAREA.', this.el)
            return
        }

        switch (this.type) {
            case 'text':
            case 'int':
            case 'float':
            case 'money':
            case 'currency':
            case 'percent':
            case 'alphanumeric':
            case 'bin':
            case 'hex': {
                defaults = {
                    min: null,
                    max: null,
                    step: 1,
                    autoFormat: true,
                    autoCorrect: true,
                    currencyPrefix: w2utils.settings.currencyPrefix,
                    currencySuffix: w2utils.settings.currencySuffix,
                    currencyPrecision: w2utils.settings.currencyPrecision,
                    decimalSymbol: w2utils.settings.decimalSymbol,
                    groupSymbol: w2utils.settings.groupSymbol,
                    arrow: false,
                    keyboard: true,
                    precision: null,
                    prefix: '',
                    suffix: ''
                }
                this.options = w2utils.extend({}, defaults, options)
                options = this.options // since object is re-created, need to re-assign
                options.numberRE  = new RegExp('['+ options.groupSymbol + ']', 'g')
                options.moneyRE   = new RegExp('['+ options.currencyPrefix + options.currencySuffix + options.groupSymbol +']', 'g')
                options.percentRE = new RegExp('['+ options.groupSymbol + '%]', 'g')
                // no keyboard support needed
                if (['text', 'alphanumeric', 'hex', 'bin'].includes(this.type)) {
                    options.arrow   = false
                    options.keyboard = false
                }
                break
            }
            case 'color': {
                let size = parseInt(getComputedStyle(this.el)['font-size']) || 12
                defaults     = {
                    prefix      : '#',
                    suffix      : `<div style="width: ${size}px; height: ${size}px; margin-top: -2px;
                                    position: relative; top: 50%; transform: translateY(-50%);">&#160;</div>`,
                    arrow       : false,
                    advanced    : null, // open advanced by default
                    transparent : true
                }
                this.options = w2utils.extend({}, defaults, options)
                options = this.options // since object is re-created, need to re-assign
                break
            }
            case 'date': {
                defaults = {
                    format        : w2utils.settings.dateFormat, // date format
                    keyboard      : true,
                    autoCorrect   : true,
                    start         : null,
                    end           : null,
                    blockDates    : [], // array of blocked dates
                    blockWeekdays : [], // blocked weekdays 0 - sunday, 1 - monday, etc
                    colored       : {}, // ex: { '3/13/2022': 'bg-color|text-color' }
                    btnNow        : true
                }
                this.options = w2utils.extend({ type: 'date' }, defaults, options)
                options = this.options // since object is re-created, need to re-assign
                if (query(this.el).attr('placeholder') == null) {
                    query(this.el).attr('placeholder', options.format)
                }
                break
            }
            case 'time': {
                defaults     = {
                    format      : w2utils.settings.timeFormat,
                    keyboard    : true,
                    autoCorrect : true,
                    start       : null,
                    end         : null,
                    btnNow      : true,
                    noMinutes   : false
                }
                this.options = w2utils.extend({ type: 'time' }, defaults, options)
                options = this.options // since object is re-created, need to re-assign
                if (query(this.el).attr('placeholder') == null) {
                    query(this.el).attr('placeholder', options.format)
                }
                break
            }
            case 'datetime': {
                defaults     = {
                    format        : w2utils.settings.dateFormat + '|' + w2utils.settings.timeFormat,
                    keyboard      : true,
                    autoCorrect   : true,
                    start         : null,
                    end           : null,
                    startTime     : null,
                    endTime       : null,
                    blockDates    : [], // array of blocked dates
                    blockWeekdays : [], // blocked weekdays 0 - sunday, 1 - monday, etc
                    colored       : {}, // ex: { '3/13/2022': 'bg-color|text-color' }
                    btnNow        : true,
                    noMinutes     : false
                }
                this.options = w2utils.extend({ type: 'datetime' }, defaults, options)
                options = this.options // since object is re-created, need to re-assign
                if (query(this.el).attr('placeholder') == null) {
                    query(this.el).attr('placeholder', options.placeholder || options.format)
                }
                break
            }
            case 'list':
            case 'combo': {
                defaults = {
                    items           : [],
                    selected        : {},
                    prefix          : '',
                    suffix          : '',
                    openOnFocus     : false,  // if to show overlay onclick or when typing
                    icon            : null,
                    iconStyle       : '',
                    // -- following options implemented in w2tooltip
                    url             : null,   // remove source for items
                    recId           : null,   // map retrieved data from url to id, can be string or function
                    recText         : null,   // map retrieved data from url to text, can be string or function
                    method          : null,   // default httpMethod
                    debounce        : 250,    // number of ms to wait before sending server call on search
                    postData        : {},
                    minLength       : 1,      // min number of chars when trigger search
                    cacheMax        : 250,
                    maxDropHeight   : 350,    // max height for drop down menu
                    maxDropWidth    : null,   // if null then auto set
                    minDropWidth    : null,   // if null then auto set
                    match           : 'begins', // ['contains', 'is', 'begins', 'ends']
                    align           : 'both', // same width as control
                    altRows         : true,   // alternate row color
                    renderDrop      : null,   // render function for drop down item
                    compare         : null,   // compare function for filtering
                    filter          : true,   // weather to filter at all
                    hideSelected    : false,  // hide selected item from drop down
                    markSearch      : false,
                    msgNoItems      : 'No matches',
                    msgSearch       : 'Type to search...',
                    onSearch        : null,   // when search needs to be performed
                    onRequest       : null,   // when request is submitted
                    onLoad          : null,   // when data is received
                    onError         : null,    // when data fails to load due to server error or other failure modes
                }
                if (typeof options.items == 'function') {
                    options._items_fun = options.items
                }
                // need to be first
                options.items = w2utils.normMenu.call(this, options.items)
                if (this.type === 'list') {
                    // defaults.search = (options.items && options.items.length >= 10 ? true : false);
                    query(this.el).addClass('w2ui-select')
                    // if simple value - look it up
                    if (!w2utils.isPlainObject(options.selected) && Array.isArray(options.items)) {
                        options.items.forEach(item => {
                            if (item && item.id === options.selected) {
                                options.selected = w2utils.clone(item)
                            }
                        })
                    }
                }
                options = w2utils.extend({}, defaults, options)
                // validate match
                let valid = ['is', 'begins', 'contains', 'ends']
                if (!valid.includes(options.match)) {
                    console.log(`ERROR: invalid value "${options.match}" for option.match. It should be one of following: ${valid.join(', ')}.`)
                }
                this.options = options
                if (!w2utils.isPlainObject(options.selected)) options.selected = {}
                this.selected = options.selected
                query(this.el)
                    .attr('autocapitalize', 'off')
                    .attr('autocomplete', 'off')
                    .attr('autocorrect', 'off')
                    .attr('spellcheck', 'false')
                if (options.selected.text != null) {
                    query(this.el).val(options.selected.text)
                }
                break
            }
            case 'enum': {
                defaults = {
                    items           : [],    // id, text, tooltip, icon
                    selected        : [],
                    max             : 0,     // max number of selected items, 0 - unlimited
                    maxItemWidth    : 250,   // max width for a single item
                    style           : '',    // style for container div
                    openOnFocus     : false, // if to show overlay onclick or when typing
                    renderItem      : null,  // render selected item
                    onMouseEnter    : null,  // when an item is mouse over
                    onMouseLeave    : null,  // when an item is mouse out
                    onScroll        : null,   // when div with selected items is scrolled
                    onClick         : null,  // when an item is clicked
                    onAdd           : null,  // when an item is added
                    onNew           : null,  // when new item should be added
                    onRemove        : null,  // when an item is removed
                    // -- following options implemented in w2tooltip
                    url             : null,  // remove source for items
                    recId           : null,  // map retrieved data from url to id, can be string or function
                    recText         : null,  // map retrieved data from url to text, can be string or function
                    debounce        : 250,   // number of ms to wait before sending server call on search
                    method          : null,  // default httpMethod
                    postData        : {},
                    minLength       : 1,     // min number of chars when trigger search
                    cacheMax        : 250,
                    match           : 'begins', // ['contains', 'is', 'begins', 'ends']
                    align           : '',    // align drop down related to search field
                    altRows         : true,  // alternate row color
                    renderDrop      : null,  // render function for drop down item
                    maxDropHeight   : 350,   // max height for drop down menu
                    maxDropWidth    : null,  // if null then auto set
                    markSearch      : false,
                    compare         : null,  // compare function for filtering
                    filter          : true,  // alias for compare
                    hideSelected    : true,  // hide selected item from drop down
                    msgNoItems      : 'No matches',
                    msgSearch       : 'Type to search...',
                    onSearch        : null,  // when search needs to be performed
                    onRequest       : null,  // when request is submitted
                    onLoad          : null,  // when data is received
                    onError         : null,  // when data fails to load due to server error or other failure modes
                }
                options  = w2utils.extend({}, defaults, options, { suffix: '' })
                if (typeof options.items == 'function') {
                    options._items_fun = options.items
                }
                // validate match
                let valid = ['is', 'begins', 'contains', 'ends']
                if (!valid.includes(options.match)) {
                    console.log(`ERROR: invalid value "${options.match}" for option.match. It should be one of following: ${valid.join(', ')}.`)
                }
                options.items    = w2utils.normMenu.call(this, options.items)
                options.selected = w2utils.normMenu.call(this, options.selected)
                this.options     = options
                if (!Array.isArray(options.selected)) options.selected = []
                this.selected = options.selected
                break
            }
            case 'file': {
                defaults     = {
                    selected      : [],
                    max           : 0,
                    maxSize       : 0,    // max size of all files, 0 - unlimited
                    maxFileSize   : 0,    // max size of a single file, 0 -unlimited
                    maxItemWidth  : 250,  // max width for a single item
                    maxDropHeight : 350,  // max height for drop down menu
                    maxDropWidth  : null, // if null then auto set
                    readContent   : true, // if true, it will readAsDataURL content of the file
                    silent        : true,
                    align         : 'both', // same width as control
                    altRows       : true, // alternate row color
                    renderItem    : null, // render selected item
                    style         : '',   // style for container div
                    onClick       : null, // when an item is clicked
                    onAdd         : null, // when an item is added
                    onRemove      : null, // when an item is removed
                    onMouseEnter  : null, // when an item is mouse over
                    onMouseLeave  : null  // when an item is mouse out
                }
                options = w2utils.extend({}, defaults, options)
                this.options = options
                if (!Array.isArray(options.selected)) options.selected = []
                this.selected = options.selected
                if (query(this.el).attr('placeholder') == null) {
                    query(this.el).attr('placeholder', w2utils.lang('Attach files by dragging and dropping or Click to Select'))
                }
                break
            }
            default: {
                console.log(`ERROR: field type "${this.type}" is not supported.`)
                break
            }
        }
        // attach events
        query(this.el)
            .css('box-sizing', 'border-box')
            .addClass('w2field w2ui-input')
            .off('.w2field')
            .on('change.w2field', (event) => { this.change(event) })
            .on('click.w2field', (event) => { this.click(event) })
            .on('focus.w2field', (event) => { this.focus(event) })
            .on('blur.w2field', (event) => { if (this.type !== 'list') this.blur(event) })
            .on('keydown.w2field', (event) => { this.keyDown(event) })
            .on('keyup.w2field', (event) => { this.keyUp(event) })
        // suffix and prefix need to be after styles
        this.addPrefix() // only will add if needed
        this.addSuffix() // only will add if needed
        this.addSearch()
        this.addMultiSearch()
        // this.refresh() // do not call refresh, on change will trigger refresh (for list at list)
        // format initial value
        this.change(new Event('change'))
    }

    get() {
        let ret
        if (['list', 'enum', 'file'].indexOf(this.type) !== -1) {
            ret = this.selected
        } else {
            ret = query(this.el).val()
        }
        return ret
    }

    set(val, append) {
        if (['list', 'enum', 'file'].indexOf(this.type) !== -1) {
            if (this.type !== 'list' && append) {
                if (!Array.isArray(this.selected)) this.selected = []
                this.selected.push(val)
                // update selected array in overlay
                let overlay = w2menu.get(this.el.id + '_menu')
                if (overlay) overlay.options.selected = this.selected
                query(this.el).trigger('input').trigger('change')
            } else {
                if (val == null) val = []
                let it = (this.type === 'enum' && !Array.isArray(val) ? [val] : val)
                this.selected = it
                query(this.el).trigger('input').trigger('change')
            }
            this.refresh()
        } else {
            query(this.el).val(val)
        }
    }

    setIndex(ind, append) {
        if (['list', 'enum'].indexOf(this.type) !== -1) {
            let items = this.options.items
            if (items && items[ind]) {
                if (this.type == 'list') {
                    this.selected = items[ind]
                }
                if (this.type == 'enum') {
                    if (!append) this.selected = []
                    this.selected.push(items[ind])
                }
                let overlay = w2menu.get(this.el.id + '_menu')
                if (overlay) overlay.options.selected = this.selected
                query(this.el).trigger('input').trigger('change')
                this.refresh()
                return true
            }
        }
        return false
    }

    refresh() {
        let options = this.options
        let time    = Date.now()
        let styles  = getComputedStyle(this.el)
        // update color
        if (this.type == 'color') {
            let color = this.el.value
            if (color.substr(0, 1) != '#' && color.substr(0, 3) != 'rgb') {
                color = '#' + color
            }
            query(this.helpers.suffix).find(':scope > div').css('background-color', color)
        }
        // enum
        if (this.type == 'list') {
            // next line will not work in a form with span: -1
            // query(this.el).parent().css('white-space', 'nowrap') // needs this for arrow always to appear on the right side
            // hide focus and show text
            if (this.helpers.prefix) this.helpers.prefix.hide()
            if (!this.helpers.search) return
            // if empty show no icon
            if (this.selected == null && options.icon) {
                options.prefix = `
                    <span class="w2ui-icon ${options.icon} "style="cursor: pointer; font-size: 14px;
                        display: inline-block; margin-top: -1px; color: #7F98AD; ${options.iconStyle}">
                    </span>`
                this.addPrefix()
            } else {
                options.prefix = ''
                this.addPrefix()
            }
            // focus helper
            let focus = query(this.helpers.search_focus)
            let icon = query(focus[0].previousElementSibling)
            focus.css({ outline: 'none' })
            if (focus.val() === '') {
                focus.css('opacity', 0)
                icon.css('opacity', 0)
                if (this.selected?.id) {
                    let text = this.selected.text
                    let ind = this.findItemIndex(options.items, this.selected.id)
                    if (text != null) {
                        query(this.el)
                            .val(w2utils.lang(text))
                            .data({
                                selected: text,
                                selectedIndex: ind[0]
                            })
                    }
                } else {
                    this.el.value = ''
                    query(this.el).removeData('selected selectedIndex')
                }
            } else {
                focus.css('opacity', 1)
                icon.css('opacity', 1)
                query(this.el).val('')
                setTimeout(() => {
                    if (this.helpers.prefix) this.helpers.prefix.hide()
                    if (options.icon) {
                        focus.css('margin-left', '17px')
                        query(this.helpers.search).find('.w2ui-icon-search')
                            .addClass('show-search')
                    } else {
                        focus.css('margin-left', '0px')
                        query(this.helpers.search).find('.w2ui-icon-search')
                            .removeClass('show-search')
                    }
                }, 1)
            }
            // if readonly or disabled
            if (query(this.el).prop('readOnly') || query(this.el).prop('disabled')) {
                setTimeout(() => {
                    if (this.helpers.prefix) query(this.helpers.prefix).css('opacity', '0.6')
                    if (this.helpers.suffix) query(this.helpers.suffix).css('opacity', '0.6')
                }, 1)
            } else {
                setTimeout(() => {
                    if (this.helpers.prefix) query(this.helpers.prefix).css('opacity', '1')
                    if (this.helpers.suffix) query(this.helpers.suffix).css('opacity', '1')
                }, 1)
            }
        }
        // multi select control
        let div = this.helpers.multi
        if (['enum', 'file'].includes(this.type) && div) {
            let html = ''
            if (Array.isArray(this.selected)) {
                this.selected.forEach((it, ind) => {
                    if (it == null) return
                    html += `
                        <div class="li-item" index="${ind}" style="max-width: ${parseInt(options.maxItemWidth)}px; ${it.style ? it.style : ''}">
                        ${
                            typeof options.renderItem === 'function'
                            ? options.renderItem(it, ind, `<div class="w2ui-list-remove" index="${ind}">&#160;&#160;</div>`)
                            : `
                               ${it.icon ? `<span class="w2ui-icon ${it.icon}"></span>` : ''}
                               <div class="w2ui-list-remove" index="${ind}">&#160;&#160;</div>
                               ${(this.type === 'enum' ? it.text : it.name) ?? it.id ?? it }
                               ${it.size ? `<span class="file-size"> - ${w2utils.formatSize(it.size)}</span>` : ''}
                            `
                        }
                        </div>`
                })
            }
            let ul  = div.find('.w2ui-multi-items')
            if (options.style) {
                div.attr('style', div.attr('style') + ';' + options.style)
            }
            query(this.el).css('z-index', '-1')
            if (query(this.el).prop('readOnly') || query(this.el).prop('disabled')) {
                setTimeout(() => {
                    div[0].scrollTop = 0 // scroll to the top
                    div.addClass('w2ui-readonly')
                        .find('.li-item').css('opacity', '0.9')
                        .parent().find('.li-search').hide()
                        .find('input').prop('readOnly', true)
                        .closest('.w2ui-multi-items')
                        .find('.w2ui-list-remove').hide()
                }, 1)
            } else {
                setTimeout(() => {
                    div.removeClass('w2ui-readonly')
                        .find('.li-item').css('opacity', '1')
                        .parent().find('.li-search').show()
                        .find('input').prop('readOnly', false)
                        .closest('.w2ui-multi-items')
                        .find('.w2ui-list-remove').show()
                }, 1)
            }

            // clean
            if (this.selected?.length > 0) {
                query(this.el).attr('placeholder', '')
            }
            div.find('.w2ui-enum-placeholder').remove()
            ul.find('.li-item').remove()

            // add new list
            if (html !== '') {
                ul.prepend(html)
            } else if (query(this.el).attr('placeholder') != null && div.find('input').val() === '') {
                let style = w2utils.stripSpaces(`
                    padding-top: ${styles['padding-top']};
                    padding-left: ${styles['padding-left']};
                    box-sizing: ${styles['box-sizing']};
                    line-height: ${styles['line-height']};
                    font-size: ${styles['font-size']};
                    font-family: ${styles['font-family']};
                `)
                div.prepend(`<div class="w2ui-enum-placeholder" style="${style}">${query(this.el).attr('placeholder')}</div>`)
            }
            // ITEMS events
            div.off('.w2item')
                .on('scroll.w2item', (event) => {
                    let edata = this.trigger('scroll', { target: this.el, originalEvent: event })
                    if (edata.isCancelled === true) return
                    // hide tooltip if any
                    w2tooltip.hide(this.el.id + '_preview')
                    // event after
                    edata.finish()
                })
                .find('.li-item')
                .on('click.w2item', (event) => {
                    let target = query(event.target).closest('.li-item')
                    let index  = target.attr('index')
                    let item   = this.selected[index]
                    if (query(target).hasClass('li-search')) return
                    event.stopPropagation()
                    let edata
                    // default behavior
                    if (query(event.target).hasClass('w2ui-list-remove')) {
                        if (query(this.el).prop('readOnly') || query(this.el).prop('disabled')) return
                        // trigger event
                        edata = this.trigger('remove', { target: this.el, originalEvent: event, item })
                        if (edata.isCancelled === true) return
                        // default behavior
                        this.selected.splice(index, 1)
                        query(this.el).trigger('input').trigger('change')
                        query(event.target).remove()
                    } else {
                        // trigger event
                        edata = this.trigger('click', { target: this.el, originalEvent: event.originalEvent, item })
                        if (edata.isCancelled === true) return
                        // if file - show image preview
                        let preview = item.tooltip
                        if (this.type === 'file') {
                            if ((/image/i).test(item.type)) { // image
                                preview = `
                                    <div class="w2ui-file-preview">
                                        <img src="${(item.content ? 'data:'+ item.type +';base64,'+ item.content : '')}"
                                            style="max-width: 300px">
                                    </div>`
                            }
                            preview += `
                                <div class="w2ui-file-info">
                                    <div class="file-caption">${w2utils.lang('Name')}:</div>
                                    <div class="file-value">${item.name}</div>
                                    <div class="file-caption">${w2utils.lang('Size')}:</div>
                                    <div class="file-value">${w2utils.formatSize(item.size)}</div>
                                    <div class="file-caption">${w2utils.lang('Type')}:</div>
                                    <div class="file-value file-type">${item.type}</div>
                                    <div class="file-caption">${w2utils.lang('Modified')}:</div>
                                    <div class="file-value">${w2utils.date(item.modified)}</div>
                                </div>`
                        }
                        if (preview) {
                            let name = this.el.id + '_preview'
                            w2tooltip.show({
                                name,
                                anchor: target.get(0),
                                html: preview,
                                hideOn: ['doc-click'],
                                class: ''
                            })
                            .show((event) => {
                                let $img = query(`#w2overlay-${name} img`)
                                $img.on('load', function (event) {
                                    let w = this.clientWidth
                                    let h = this.clientHeight
                                    if (w < 300 & h < 300) return
                                    if (w >= h && w > 300) query(this).css('width', '300px')
                                    if (w < h && h > 300) query(this).css('height', '300px')
                                })
                                .on('error', function (event) {
                                    this.style.display = 'none'
                                })

                            })
                        }
                        edata.finish()
                    }
                })
                .on('mouseenter.w2item', (event) => {
                    let target = query(event.target).closest('.li-item')
                    if (query(target).hasClass('li-search')) return
                    let item = this.selected[query(event.target).attr('index')]
                    // trigger event
                    let edata = this.trigger('mouseEnter', { target: this.el, originalEvent: event, item })
                    if (edata.isCancelled === true) return
                    // event after
                    edata.finish()
                })
                .on('mouseleave.w2item', (event) => {
                    let target = query(event.target).closest('.li-item')
                    if (query(target).hasClass('li-search')) return
                    let item = this.selected[query(event.target).attr('index')]
                    // trigger event
                    let edata = this.trigger('mouseLeave', { target: this.el, originalEvent: event, item })
                    if (edata.isCancelled === true) return
                    // event after
                    edata.finish()
                })

            // update size for enum, hide for file
            if (this.type === 'enum') {
                let search = this.helpers.multi.find('input')
                search.css({ width: '15px' })
            } else {
                this.helpers.multi.find('.li-search').hide()
            }
            this.resize()
        }
        return Date.now() - time
    }

    // resizing width of list, enum, file controls
    resize() {
        let width = this.el.clientWidth
        // let height = this.el.clientHeight
        // if (this.tmp.current_width == width && height > 0) return
        let styles = getComputedStyle(this.el)

        let focus  = this.helpers.search
        let multi  = this.helpers.multi
        let suffix = this.helpers.suffix
        let prefix = this.helpers.prefix

        // resize helpers
        if (focus) {
            query(focus).css('width', width)
        }
        if (multi) {
            query(multi).css('width', width - parseInt(styles['margin-left'], 10) - parseInt(styles['margin-right'], 10))
        }
        if (suffix) {
            this.addSuffix()
        }
        if (prefix) {
            this.addPrefix()
        }
        // enum or file
        let div = this.helpers.multi
        if (['enum', 'file'].includes(this.type) && div) {
            // adjust height
            query(this.el).css('height', '')
            let cntHeight = query(div).find(':scope div.w2ui-multi-items').get(0).clientHeight + 5
            if (cntHeight < 20) cntHeight = 20
            // max height
            if (cntHeight > this.tmp['max-height']) {
                cntHeight = this.tmp['max-height']
            }
            // min height
            if (cntHeight < this.tmp['min-height']) {
                cntHeight = this.tmp['min-height']
            }
            let inpHeight = w2utils.getSize(this.el, 'height') - 2
            if (inpHeight > cntHeight) cntHeight = inpHeight
            query(div).css({
                'height': cntHeight + 'px',
                overflow: (cntHeight == this.tmp['max-height'] ? 'auto' : 'hidden')
            })
            query(div).css('height', cntHeight + 'px')
            query(this.el).css({ 'height': cntHeight + 'px' })
        }
        // remember width
        this.tmp.current_width = width
    }

    reset() {
        // restore paddings
        if (this.tmp != null) {
            query(this.el).css('height', '')
            Array('padding-left', 'padding-right', 'background-color', 'border-color').forEach(prop => {
                if (this.tmp && this.tmp['old-'+ prop] != null) {
                    query(this.el).css(prop, this.tmp['old-' + prop])
                    delete this.tmp['old-' + prop]
                }
            })
            // remove resize watcher
            clearInterval(this.tmp.sizeTimer)
        }
        // remove events and (data)
        query(this.el)
            .val(this.clean(query(this.el).val()))
            .removeClass('w2field w2ui-input')
            .removeData('selected selectedIndex')
            .off('.w2field') // remove only events added by w2field
        // remove helpers
        Object.keys(this.helpers).forEach(key => {
            query(this.helpers[key]).remove()
        })
        this.helpers = {}
        delete this.el._w2field
    }

    clean(val) {
        // issue #499
        if (typeof val === 'number'){
            return val
        }
        let options = this.options
        val = String(val).trim()
        // clean
        if (['int', 'float', 'money', 'currency', 'percent'].includes(this.type)) {
            if (typeof val === 'string') {
                if (options.autoFormat) {
                    if (['money', 'currency'].includes(this.type)) {
                        val = String(val).replace(options.moneyRE, '')
                    }
                    if (this.type === 'percent') {
                        val = String(val).replace(options.percentRE, '')
                    }
                    if (['int', 'float'].includes(this.type)) {
                        val = String(val).replace(options.numberRE, '')
                    }
                }
                val = val.replace(/\s+/g, '')
                         .replace(new RegExp(options.groupSymbol, 'g'), '')
                         .replace(options.decimalSymbol, '.')
            }
            if (val !== '' && w2utils.isFloat(val)) val = Number(val); else val = ''
        }
        return val
    }

    format(val) {
        let options = this.options
        // auto format numbers or money
        if (options.autoFormat && val !== '') {
            switch (this.type) {
                case 'money':
                case 'currency':
                    val = w2utils.formatNumber(val, options.currencyPrecision, true)
                    if (val !== '') val = options.currencyPrefix + val + options.currencySuffix
                    break
                case 'percent':
                    val = w2utils.formatNumber(val, options.precision, true)
                    if (val !== '') val += '%'
                    break
                case 'float':
                    val = w2utils.formatNumber(val, options.precision, true)
                    break
                case 'int':
                    val = w2utils.formatNumber(val, 0, true)
                    break
            }
            // if default group symbol does not match - replase it
            let group = parseInt(1000).toLocaleString(w2utils.settings.locale, { useGrouping: true }).slice(1, 2)
            if (group !== this.options.groupSymbol) {
                val = val.replaceAll(group, this.options.groupSymbol)
            }
        }
        return val
    }

    change(event) {
        // numeric
        if (['int', 'float', 'money', 'currency', 'percent'].indexOf(this.type) !== -1) {
            // check max/min
            let val = query(this.el).val()
            let new_val = this.format(this.clean(query(this.el).val()))
            // if was modified
            if (val !== '' && val != new_val) {
                query(this.el).val(new_val)
                // cancel event
                event.stopPropagation()
                event.preventDefault()
                return false
            }
        }
        // color
        if (this.type === 'color') {
            let color = query(this.el).val()
            if (color.substr(0, 3).toLowerCase() !== 'rgb') {
                color   = '#' + color
                let len = query(this.el).val().length
                if (len !== 8 && len !== 6 && len !== 3) color = ''
            }
            let next = query(this.el).get(0).nextElementSibling
            query(next).find('div').css('background-color', color)
            if (query(this.el).hasClass('has-focus')) {
                this.updateOverlay()
            }
        }
        // list, enum
        if (['list', 'enum', 'file'].indexOf(this.type) !== -1) {
            this.refresh()
        }
        // date, time
        if (['date', 'time', 'datetime'].indexOf(this.type) !== -1) {
            // convert linux timestamps
            let tmp = parseInt(this.el.value)
            if (w2utils.isInt(this.el.value) && tmp > 3000) {
                if (this.type === 'time') tmp = w2utils.formatTime(new Date(tmp), this.options.format)
                if (this.type === 'date') tmp = w2utils.formatDate(new Date(tmp), this.options.format)
                if (this.type === 'datetime') tmp = w2utils.formatDateTime(new Date(tmp), this.options.format)
                query(this.el).val(tmp).trigger('input').trigger('change')
            }
        }
    }

    click(event) {
        // lists
        if (['list', 'combo', 'enum'].includes(this.type)) {
            if (!query(this.el).hasClass('has-focus')) {
                this.focus(event)
            }
            if (this.type == 'list' || this.type == 'combo') {
                // if overlay is already open (and not just opened on focus event) then hide it
                if (!this.tmp.openedOnFocus) {
                    let name = this.el.id + '_menu'
                    let overlay = w2menu.get(name)
                    if (overlay?.displayed) {
                        w2menu.hide(name)
                    } else {
                        this.updateOverlay()
                    }
                }
                delete this.tmp.openedOnFocus
                if (this.type == 'list') {
                    // since list has separate search input, in order to keep the overlay open, need to stop
                    event.stopPropagation()
                }
            }
        }
        // other fields with drops
        if (['date', 'time', 'datetime', 'color'].includes(this.type)) {
            this.updateOverlay()
        }
    }

    focus(event) {
        if (this.type == 'list' && document.activeElement == this.el) {
            this.helpers.search_focus.focus()
            return
        }
        // color, date, time
        if (['color', 'date', 'time', 'datetime'].indexOf(this.type) !== -1) {
            if (query(this.el).prop('readOnly') || query(this.el).prop('disabled')) return
            this.updateOverlay()
        }
        // menu
        if (['list', 'combo', 'enum'].indexOf(this.type) !== -1) {
            if (query(this.el).prop('readOnly') || query(this.el).prop('disabled')) {
                // still add focus
                query(this.el).addClass('has-focus')
                return
            }
            // regenerate items
            if (typeof this.options._items_fun == 'function') {
                this.options.items = w2utils.normMenu.call(this, this.options._items_fun)
            }
            if (this.helpers.search) {
                let search = this.helpers.search_focus
                search.value = ''
                search.select()
            }
            if (this.type == 'enum') {
                // file control in particular need to receive focus after file select
                let search = query(this.el.previousElementSibling).find('.li-search input').get(0)
                if (document.activeElement !== search) {
                    search.focus()
                }
            }
            this.resize()
            // update overlay if needed
            if (event.showMenu !== false && (this.options.openOnFocus !== false || query(this.el).hasClass('has-focus'))
                    && !this.tmp.overlay?.overlay?.displayed) {
                setTimeout(() => {
                    this.tmp.openedOnFocus = true
                    this.updateOverlay()
                }, 0) // execute at the end of event loop
            }
        }
        if (this.type == 'file') {
            let prev = query(this.el).get(0).previousElementSibling
            query(prev).addClass('has-focus')
        }
        query(this.el).addClass('has-focus')
    }

    blur(event) {
        let val = query(this.el).val().trim()
        query(this.el).removeClass('has-focus')

        if (['int', 'float', 'money', 'currency', 'percent'].includes(this.type)) {
            if (val !== '') {
                let newVal = val
                let error = ''
                if (!this.isStrValid(val)) { // validity is also checked in blur
                    newVal = ''
                } else {
                    let rVal = this.clean(val)
                    if (this.options.min != null && rVal < this.options.min) {
                        newVal = this.options.min
                        error = `Should be >= ${this.options.min}`
                    }
                    if (this.options.max != null && rVal > this.options.max) {
                        newVal = this.options.max
                        error = `Should be <= ${this.options.max}`
                    }
                }
                if (this.options.autoCorrect) {
                    query(this.el).val(newVal).trigger('input').trigger('change')
                    if (error) {
                        w2tooltip.show({
                            name: this.el.id + '_error',
                            anchor: this.el,
                            html: error
                        })
                        setTimeout(() => { w2tooltip.hide(this.el.id + '_error') }, 3000)
                    }
                }
            }
        }
        // date or time
        if (['date', 'time', 'datetime'].includes(this.type) && this.options.autoCorrect) {
            if (val !== '') {
                let check = this.type == 'date' ? w2utils.isDate :
                    (this.type == 'time' ? w2utils.isTime : w2utils.isDateTime)
                if (!w2date.inRange(this.el.value, this.options)
                        || !check.bind(w2utils)(this.el.value, this.options.format)) {
                    // if not in range or wrong value - clear it
                    query(this.el).val('').trigger('input').trigger('change')
                }
            }
        }
        // clear search input
        if (this.type === 'enum') {
            query(this.helpers.multi).find('input').val('').css('width', '15px')
        }
        if (this.type == 'file') {
            let prev = this.el.previousElementSibling
            query(prev).removeClass('has-focus')
        }
        if (this.type === 'list') {
            this.el.value = this.selected?.text ?? ''
        }
    }

    keyDown(event, extra) {
        let options = this.options
        let key     = event.keyCode || (extra && extra.keyCode)
        let cancel  = false
        let val, inc, daymil, dt, newValue, newDT
        // ignore wrong pressed key
        if (['int', 'float', 'money', 'currency', 'percent', 'hex', 'bin', 'color', 'alphanumeric'].includes(this.type)) {
            if (!event.metaKey && !event.ctrlKey && !event.altKey) {
                if (!this.isStrValid(event.key ?? '1', true) && // valid & is not arrows, dot, comma, etc keys
                        ![9, 8, 13, 27, 37, 38, 39, 40, 46].includes(event.keyCode)) {
                    event.preventDefault()
                    if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true
                    return false
                }
            }
        }
        // numeric
        if (['int', 'float', 'money', 'currency', 'percent'].includes(this.type)) {
            if (!options.keyboard || query(this.el).prop('readOnly') || query(this.el).prop('disabled')) return
            val = parseFloat(query(this.el).val().replace(options.moneyRE, '')) || 0
            inc = options.step
            if (event.ctrlKey || event.metaKey) inc = options.step * 10
            switch (key) {
                case 38: // up
                    if (event.shiftKey) break // no action if shift key is pressed
                    newValue = (val + inc <= options.max || options.max == null ? Number((val + inc).toFixed(12)) : options.max)
                    query(this.el).val(newValue).trigger('input').trigger('change')
                    cancel = true
                    break
                case 40: // down
                    if (event.shiftKey) break // no action if shift key is pressed
                    newValue = (val - inc >= options.min || options.min == null ? Number((val - inc).toFixed(12)) : options.min)
                    query(this.el).val(newValue).trigger('input').trigger('change')
                    cancel = true
                    break
            }
            if (cancel) {
                event.preventDefault()
                this.moveCaret2end()
            }
        }
        // date/datetime
        if (['date', 'datetime'].includes(this.type)) {
            if (!options.keyboard || query(this.el).prop('readOnly') || query(this.el).prop('disabled')) return
            let is = (this.type == 'date' ? w2utils.isDate : w2utils.isDateTime).bind(w2utils)
            let format = (this.type == 'date' ? w2utils.formatDate : w2utils.formatDateTime).bind(w2utils)

            daymil = 24*60*60*1000
            inc = 1
            if (event.ctrlKey || event.metaKey) inc = 10 // by month
            dt = is(query(this.el).val(), options.format, true)
            if (!dt) { dt = new Date(); daymil = 0 }
            switch (key) {
                case 38: // up
                    if (event.shiftKey) break // no action if shift key is pressed
                    if (inc == 10) {
                        dt.setMonth(dt.getMonth() + 1)
                    } else {
                        dt.setTime(dt.getTime() + daymil)
                    }
                    newDT = format(dt.getTime(), options.format)
                    query(this.el).val(newDT).trigger('input').trigger('change')
                    cancel = true
                    break
                case 40: // down
                    if (event.shiftKey) break // no action if shift key is pressed
                    if (inc == 10) {
                        dt.setMonth(dt.getMonth() - 1)
                    } else {
                        dt.setTime(dt.getTime() - daymil)
                    }
                    newDT = format(dt.getTime(), options.format)
                    query(this.el).val(newDT).trigger('input').trigger('change')
                    cancel = true
                    break
            }
            if (cancel) {
                event.preventDefault()
                this.moveCaret2end()
                this.updateOverlay()
            }
        }
        // time
        if (this.type === 'time') {
            if (!options.keyboard || query(this.el).prop('readOnly') || query(this.el).prop('disabled')) return
            inc = (event.ctrlKey || event.metaKey ? 60 : 1)
            val = query(this.el).val()
            let time = w2date.str2min(val) || w2date.str2min((new Date()).getHours() + ':' + ((new Date()).getMinutes() - 1))
            switch (key) {
                case 38: // up
                    if (event.shiftKey) break // no action if shift key is pressed
                    time  += inc
                    cancel = true
                    break
                case 40: // down
                    if (event.shiftKey) break // no action if shift key is pressed
                    time  -= inc
                    cancel = true
                    break
            }
            if (cancel) {
                event.preventDefault()
                query(this.el).val(w2date.min2str(time)).trigger('input').trigger('change')
                this.moveCaret2end()
            }
        }
        // list/enum
        if (['list', 'enum'].includes(this.type)) {
            switch (key) {
                case 8: // delete
                case 46: // backspace
                    if (this.type == 'list') {
                        let search = query(this.helpers.search_focus)
                        if (search.val() == '') {
                            this.selected = null
                            w2menu.hide(this.el.id + '_menu')
                            query(this.el).val('').trigger('input').trigger('change')
                        }
                    } else {
                        let search = query(this.helpers.multi).find('input')
                        if (search.val() == '') {
                            w2menu.hide(this.el.id + '_menu')
                            this.selected.pop()
                            // update selected array in overlay
                            let overlay = w2menu.get(this.el.id + '_menu')
                            if (overlay) overlay.options.selected = this.selected
                            this.refresh()
                        }
                    }
                    break
                case 9: // tab key
                case 16: // shift key (when shift+tab)
                    break
                case 27: // escape
                    w2menu.hide(this.el.id + '_menu')
                    this.refresh()
                    break
                default: {
                    // intentionally blank
                }
            }
        }
    }

    keyUp(event) {
        if (this.type == 'list') {
            let search = query(this.helpers.search_focus)
            if (search.val() !== '') {
                query(this.el).attr('placeholder', '')
            } else {
                query(this.el).attr('placeholder', this.tmp.pholder)
            }
            if (event.keyCode == 13) {
                setTimeout(() => {
                    search.val('')
                    w2menu.hide(this.el.id + '_menu')
                    this.refresh()
                }, 1)
            }
            // if arrows are clicked, it will show overlay
            if ([38, 40].includes(event.keyCode) && !this.tmp.overlay?.overlay?.displayed) {
                this.updateOverlay()
            }
            this.refresh()
        }
        if (this.type == 'combo') {
            if (![9, 16, 27].includes(event.keyCode) && this.options.openOnFocus !== true) {
                // do not show when receives focus on tab or shift + tab or on esc
                this.updateOverlay()
            }
            // if arrows are clicked, it will show overlay
            if ([38, 40].includes(event.keyCode) && !this.tmp.overlay?.overlay?.displayed) {
                this.updateOverlay()
            }
        }
        if (this.type == 'enum') {
            let search = this.helpers.multi.find('input')
            let styles = getComputedStyle(search.get(0))
            let width = w2utils.getStrWidth(search.val(),
                `font-family: ${styles['font-family']}; font-size: ${styles['font-size']};`)
            search.css({ width: (width + 15) + 'px' })
            this.resize()
            // if arrows are clicked, it will show overlay
            if ([38, 40].includes(event.keyCode) && !this.tmp.overlay?.overlay?.displayed) {
                this.updateOverlay()
            }
        }
    }

    findItemIndex(items, id, parents) {
        let inds = []
        if (!parents) parents = []
        if (['list', 'combo', 'enum'].includes(this.type) && this.options.url) {
            // remove source, so get it from overlay
            let overlay = w2menu.get(this.el.id + '_menu')
            if (overlay) {
                items = overlay.options.items
                this.options.items = items
            }
        }
        items.forEach((item, ind) => {
            if (item.id === id) {
                inds = parents.concat([ind])
                this.options.index = [ind]
            }
            if (inds.length == 0 && item.items && item.items.length > 0) {
                parents.push(ind)
                inds = this.findItemIndex(item.items, id, parents)
                parents.pop()
            }
        })
        return inds
    }

    updateOverlay(indexOnly) {
        let options = this.options
        let params
        // color
        if (this.type === 'color') {
            if (query(this.el).prop('readOnly') || query(this.el).prop('disabled')) return
            w2color.show(w2utils.extend({
                name: this.el.id + '_color',
                anchor: this.el,
                transparent: options.transparent,
                advanced: options.advanced,
                color: this.el.value,
                liveUpdate: true
            }, this.options))
            .select(event => {
                let color = event.detail.color
                query(this.el).val(color).trigger('input').trigger('change')
            })
            .liveUpdate(event => {
                let color = event.detail.color
                query(this.helpers.suffix).find(':scope > div').css('background-color', '#' + color)
            })
        }
        // list
        if (['list', 'combo', 'enum'].includes(this.type)) {
            let el = this.el
            let input = this.el
            if (this.type === 'enum') {
                el = this.helpers.multi.get(0)
                input = query(el).find('input').get(0)
            }
            if (this.type === 'list') {
                let sel = this.selected
                if (w2utils.isPlainObject(sel) && Object.keys(sel).length > 0) {
                    let ind = this.findItemIndex(options.items, sel.id)
                    if (ind.length > 0) {
                        options.index = ind
                    }
                }
                input = this.helpers.search_focus
            }
            if (query(this.el).hasClass('has-focus') && !this.el.readOnly && !this.el.disabled) {
                params = w2utils.extend({}, options, {
                    name: this.el.id + '_menu',
                    anchor: input,
                    selected: this.selected,
                    search: false,
                    render: options.renderDrop,
                    anchorClass: '',
                    offsetY: 5,
                    maxHeight: options.maxDropHeight, // TODO: check
                    maxWidth: options.maxDropWidth,  // TODO: check
                    minWidth: options.minDropWidth   // TODO: check
                })
                this.tmp.overlay = w2menu.show(params)
                    .select(event => {
                        if (['list', 'combo'].includes(this.type)) {
                            this.selected = event.detail.item
                            query(input).val('')
                            query(this.el).val(this.selected.text).trigger('input').trigger('change')
                            this.focus({ showMenu: false })
                        } else {
                            let selected = this.selected
                            let newItem = event.detail?.item
                            if (newItem) {
                                // trigger event
                                let edata = this.trigger('add', { target: this.el, item: newItem, originalEvent: event })
                                if (edata.isCancelled === true) return
                                // default behavior
                                if (selected.length >= options.max && options.max > 0) selected.pop()
                                delete newItem.hidden
                                selected.push(newItem)
                                query(this.el).trigger('input').trigger('change')
                                query(this.helpers.multi).find('input').val('')
                                // updaet selected array in overlays
                                let overlay = w2menu.get(this.el.id + '_menu')
                                if (overlay) overlay.options.selected = this.selected
                                // event after
                                edata.finish()
                            }
                        }
                    })
            }
        }
        // date
        if (['date', 'time', 'datetime'].includes(this.type)) {
            if (query(this.el).prop('readOnly') || query(this.el).prop('disabled')) return
            w2date.show(w2utils.extend({
                name: this.el.id + '_date',
                anchor: this.el,
                value: this.el.value,
            }, this.options))
            .select(event => {
                let date = event.detail.date
                if (date != null) {
                    query(this.el).val(date).trigger('input').trigger('change')
                }
            })
        }
    }

    /*
    *  INTERNAL FUNCTIONS
    */

    isStrValid(ch, loose) {
        let isValid = true
        switch (this.type) {
            case 'int':
                if (loose && ['-', this.options.groupSymbol].includes(ch)) {
                    isValid = true
                } else {
                    isValid = w2utils.isInt(ch.replace(this.options.numberRE, ''))
                }
                break
            case 'percent':
                ch = ch.replace(/%/g, '')
            case 'float':
                if (loose && ['-', '', this.options.decimalSymbol, this.options.groupSymbol].includes(ch)) {
                    isValid = true
                } else {
                    isValid = w2utils.isFloat(ch.replace(this.options.numberRE, ''))
                }
                break
            case 'money':
            case 'currency':
                if (loose && ['-', this.options.decimalSymbol, this.options.groupSymbol, this.options.currencyPrefix,
                    this.options.currencySuffix].includes(ch)) {
                    isValid = true
                } else {
                    isValid = w2utils.isFloat(ch.replace(this.options.moneyRE, ''))
                }
                break
            case 'bin':
                isValid = w2utils.isBin(ch)
                break
            case 'color':
            case 'hex':
                isValid = w2utils.isHex(ch)
                break
            case 'alphanumeric':
                isValid = w2utils.isAlphaNumeric(ch)
                break
        }
        return isValid
    }

    addPrefix() {
        if (!this.options.prefix) {
            return
        }
        let helper
        let styles = getComputedStyle(this.el)
        if (this.tmp['old-padding-left'] == null) {
            this.tmp['old-padding-left'] = styles['padding-left']
        }
        // remove if already displayed
        if (this.helpers.prefix) query(this.helpers.prefix).remove()
        query(this.el).before(`<div class="w2ui-field-helper">${this.options.prefix}</div>`)
        helper = query(this.el).get(0).previousElementSibling
        query(helper)
            .css({
                'color'          : styles.color,
                'font-family'    : styles['font-family'],
                'font-size'      : styles['font-size'],
                'height'         : this.el.clientHeight + 'px',
                'padding-top'    : parseInt(styles['padding-top'], 10) + 1 + 'px',
                'padding-bottom' : parseInt(styles['padding-bottom'], 10) - 1 + 'px',
                'padding-left'   : this.tmp['old-padding-left'],
                'padding-right'  : 0,
                'margin-top'     : (parseInt(styles['margin-top'], 10)) + 'px',
                'margin-bottom'  : (parseInt(styles['margin-bottom'], 10)) + 'px',
                'margin-left'    : styles['margin-left'],
                'margin-right'   : 0,
                'z-index'        : 1,
                'display'        : 'flex',
                'align-items'    : 'center'
            })
        // only if visible
        query(this.el).css('padding-left', helper.clientWidth + 'px !important')
        // remember helper
        this.helpers.prefix = helper
    }

    addSuffix() {
        if (!this.options.suffix && !this.options.arrow) {
            return
        }
        let helper
        let self = this
        let styles = getComputedStyle(this.el)
        if (this.tmp['old-padding-right'] == null) {
            this.tmp['old-padding-right'] = styles['padding-right']
        }
        let pr = parseInt(styles['padding-right'] || 0)
        if (this.options.arrow) {
            // remove if already displayed
            if (this.helpers.arrow) query(this.helpers.arrow).remove()
            // add fresh
            query(this.el).after(
                '<div class="w2ui-field-helper" style="border: 1px solid transparent">&#160;'+
                '    <div class="w2ui-field-up" type="up">'+
                '        <div class="arrow-up" type="up"></div>'+
                '    </div>'+
                '    <div class="w2ui-field-down" type="down">'+
                '        <div class="arrow-down" type="down"></div>'+
                '    </div>'+
                '</div>')
            helper = query(this.el).get(0).nextElementSibling
            query(helper).css({
                'color'         : styles.color,
                'font-family'   : styles['font-family'],
                'font-size'     : styles['font-size'],
                'height'        : this.el.clientHeight + 'px',
                'padding'       : 0,
                'margin-top'    : (parseInt(styles['margin-top'], 10) + 1) + 'px',
                'margin-bottom' : 0,
                'border-left'   : '1px solid silver',
                'width'         : '16px',
                'transform'     : 'translateX(-100%)'
            })
                .on('mousedown', function(event) {
                    if (query(event.target).hasClass('arrow-up')) {
                        self.keyDown(event, { keyCode: 38 })
                    }
                    if (query(event.target).hasClass('arrow-down')) {
                        self.keyDown(event, { keyCode: 40 })
                    }
                })
            pr += helper.clientWidth // width of the control
            query(this.el).css('padding-right', pr + 'px !important')
            this.helpers.arrow = helper
        }
        if (this.options.suffix !== '') {
            // remove if already displayed
            if (this.helpers.suffix) query(this.helpers.suffix).remove()
            // add fresh
            query(this.el).after(`<div class="w2ui-field-helper">${this.options.suffix}</div>`)
            helper = query(this.el).get(0).nextElementSibling
            query(helper)
                .css({
                    'color'          : styles.color,
                    'font-family'    : styles['font-family'],
                    'font-size'      : styles['font-size'],
                    'height'        : this.el.clientHeight + 'px',
                    'padding-top'    : styles['padding-top'],
                    'padding-bottom' : styles['padding-bottom'],
                    'padding-left'   : 0,
                    'padding-right'  : styles['padding-right'],
                    'margin-top'     : (parseInt(styles['margin-top'], 10) + 2) + 'px',
                    'margin-bottom'  : (parseInt(styles['margin-bottom'], 10) + 1) + 'px',
                    'transform'      : 'translateX(-100%)'
                })

            query(this.el).css('padding-right', helper.clientWidth + 'px !important')
            this.helpers.suffix = helper
        }
    }

    // Only used for list
    addSearch() {
        if (this.type !== 'list') return
        // clean up & init
        if (this.helpers.search) query(this.helpers.search).remove()
        // remember original tabindex
        let tabIndex = parseInt(query(this.el).attr('tabIndex'))
        if (!isNaN(tabIndex) && tabIndex !== -1) this.tmp['old-tabIndex'] = tabIndex
        if (this.tmp['old-tabIndex']) tabIndex = this.tmp['old-tabIndex']
        if (tabIndex == null || isNaN(tabIndex)) tabIndex = 0
        // if there is id, add to search with "_search"
        let searchId = ''
        if (query(this.el).attr('id') != null) {
            searchId = 'id="' + query(this.el).attr('id') + '_search"'
        }
        // build helper
        let html = `
            <div class="w2ui-field-helper">
                <span class="w2ui-icon w2ui-icon-search"></span>
                <input ${searchId} type="text" tabIndex="${tabIndex}" autocapitalize="off" autocomplete="off" autocorrect="off" spellcheck="false"/>
            </div>`
        query(this.el).attr('tabindex', -1).before(html)
        let helper = query(this.el).get(0).previousElementSibling
        this.helpers.search = helper
        this.helpers.search_focus = query(helper).find('input').get(0)
        let styles = getComputedStyle(this.el)
        query(helper).css({
            width           : this.el.clientWidth + 'px',
            'margin-top'    : styles['margin-top'],
            'margin-left'   : styles['margin-left'],
            'margin-bottom' : styles['margin-bottom'],
            'margin-right'  : styles['margin-right']
        })
            .find('input')
            .css({
                cursor   : 'default',
                width    : '100%',
                opacity  : 1,
                padding  : styles.padding,
                margin   : styles.margin,
                border   : '1px solid transparent',
                'background-color' : 'transparent'
            })
        // INPUT events
        query(helper).find('input')
            .off('.helper')
            .on('focus.helper', event => {
                query(event.target).val('')
                this.tmp.pholder = query(this.el).attr('placeholder') ?? ''
                this.focus(event)
                event.stopPropagation()
            })
            .on('blur.helper', event => {
                query(event.target).val('')
                if (this.tmp.pholder != null) query(this.el).attr('placeholder', this.tmp.pholder)
                this.blur(event)
                event.stopPropagation()
            })
            .on('keydown.helper', event => { this.keyDown(event) })
            .on('keyup.helper', event => { this.keyUp(event) })
        // MAIN div
        query(helper).on('click', event => {
            query(event.target).find('input').focus()
        })
    }

    // Used in enum/file
    addMultiSearch() {
        if (!['enum', 'file'].includes(this.type)) {
            return
        }
        // clean up & init
        query(this.helpers.multi).remove()
        // build helper
        let html   = ''
        let styles = getComputedStyle(this.el)
        let margin = w2utils.stripSpaces(`
            margin-top: 0px;
            margin-bottom: 0px;
            margin-left: ${styles['margin-left']};
            margin-right: ${styles['margin-right']};
            width: ${(w2utils.getSize(this.el, 'width') - parseInt(styles['margin-left'], 10)
                                - parseInt(styles['margin-right'], 10))}px;
        `)
        if (this.tmp['min-height'] == null) {
            let min = this.tmp['min-height'] = parseInt((styles['min-height'] != 'none' ? styles['min-height'] : 0) || 0)
            let current = parseInt(styles.height)
            this.tmp['min-height'] = Math.max(min, current)
        }
        if (this.tmp['max-height'] == null && styles['max-height'] != 'none') {
            this.tmp['max-height'] = parseInt(styles['max-height'])
        }

        // if there is id, add to search with "_search"
        let searchId = ''
        if (query(this.el).attr('id') != null) {
            searchId = `id="${query(this.el).attr('id')}_search"`
        }
        // remember original tabindex
        let tabIndex = parseInt(query(this.el).attr('tabIndex'))
        if (!isNaN(tabIndex) && tabIndex !== -1) this.tmp['old-tabIndex'] = tabIndex
        if (this.tmp['old-tabIndex']) tabIndex = this.tmp['old-tabIndex']
        if (tabIndex == null || isNaN(tabIndex)) tabIndex = 0

        if (this.type === 'enum') {
            html = `
            <div class="w2ui-field-helper w2ui-list" style="${margin}">
                <div class="w2ui-multi-items">
                    <div class="li-search">
                        <input ${searchId} type="text" autocapitalize="off" autocomplete="off" autocorrect="off" spellcheck="false"
                            tabindex="${tabIndex}"
                            ${query(this.el).prop('readOnly') ? 'readonly': '' }
                            ${query(this.el).prop('disabled') ? 'disabled': '' }>
                    </div>
                </div>
            </div>`
        }
        if (this.type === 'file') {
            html = `
            <div class="w2ui-field-helper w2ui-list" style="${margin}">
                <div class="w2ui-multi-file">
                    <input name="attachment" class="file-input" type="file" tabindex="-1"'
                        style="width: 100%; height: 100%; opacity: 0" title=""
                        ${this.options.max !== 1 ? 'multiple' : ''}
                        ${query(this.el).prop('readOnly') || query(this.el).prop('disabled') ? 'disabled': ''}
                        ${query(this.el).attr('accept') ? ' accept="'+ query(this.el).attr('accept') +'"': ''}>
                </div>
                <div class="w2ui-multi-items">
                    <div class="li-search" style="display: none">
                        <input ${searchId} type="text" autocapitalize="off" autocomplete="off" autocorrect="off" spellcheck="false"
                            tabindex="${tabIndex}"
                            ${query(this.el).prop('readOnly') ? 'readonly': '' }
                            ${query(this.el).prop('disabled') ? 'disabled': '' }>
                    </div>
                </div>
            </div>`
        }
        // old bg and border
        this.tmp['old-background-color'] = styles['background-color']
        this.tmp['old-border-color']     = styles['border-color']

        query(this.el)
            .before(html)
            .css({
                'border-color': 'transparent',
                'background-color': 'transparent'
            })

        let div = query(this.el.previousElementSibling)
        this.helpers.multi = div
        query(this.el).attr('tabindex', -1)
        // click anywhere on the field
        div.on('click', event => { this.focus(event) })
        // search field
        div.find('input:not(.file-input)')
            .on('click', event => { this.click(event) })
            .on('focus', event => { this.focus(event) })
            .on('blur', event => { this.blur(event) })
            .on('keydown', event => { this.keyDown(event) })
            .on('keyup', event => { this.keyUp(event) })

        // file input
        if (this.type === 'file') {
            div.find('input.file-input')
                .off('.drag')
                .on('click.drag', (event) => {
                    event.stopPropagation()
                    if (query(this.el).prop('readOnly') || query(this.el).prop('disabled')) return
                    this.focus(event)
                })
                .on('dragenter.drag', (event) => {
                    if (query(this.el).prop('readOnly') || query(this.el).prop('disabled')) return
                    div.addClass('w2ui-file-dragover')
                })
                .on('dragleave.drag', (event) => {
                    if (query(this.el).prop('readOnly') || query(this.el).prop('disabled')) return
                    div.removeClass('w2ui-file-dragover')
                })
                .on('drop.drag', (event) => {
                    if (query(this.el).prop('readOnly') || query(this.el).prop('disabled')) return
                    div.removeClass('w2ui-file-dragover')
                    let files = Array.from(event.dataTransfer.files)
                    files.forEach(file => { this.addFile(file) })
                    this.focus(event)
                    // cancel to stop browser behaviour
                    event.preventDefault()
                    event.stopPropagation()
                })
                .on('dragover.drag', (event) => {
                    // cancel to stop browser behaviour
                    event.preventDefault()
                    event.stopPropagation()
                })
                .on('change.drag', (event) => {
                    if (typeof event.target.files !== 'undefined') {
                        Array.from(event.target.files).forEach(file => { this.addFile(file) })
                    }
                    this.focus(event)
                })
        }
        this.refresh()
    }

    addFile(file) {
        let options = this.options
        let selected = this.selected
        let newItem = {
            name     : file.name,
            type     : file.type,
            modified : file.lastModifiedDate,
            size     : file.size,
            content  : null,
            file     : file
        }
        let size = 0
        let cnt = 0
        let errors = []
        if (Array.isArray(selected)) {
            selected.forEach(item => {
                if (item.name == file.name && item.size == file.size) {
                    errors.push(w2utils.lang('The file "${name}" (${size}) is already added.', {
                        name: file.name, size: w2utils.formatSize(file.size) }))
                }
                size += item.size
                cnt++
            })
        }
        if (options.maxFileSize !== 0 && newItem.size > options.maxFileSize) {
            errors.push(w2utils.lang('Maximum file size is ${size}', { size: w2utils.formatSize(options.maxFileSize) }))
        }
        if (options.maxSize !== 0 && size + newItem.size > options.maxSize) {
            errors.push(w2utils.lang('Maximum total size is ${size}', { size: w2utils.formatSize(options.maxSize) }))
        }
        if (options.max !== 0 && cnt >= options.max) {
            errors.push(w2utils.lang('Maximum number of files is ${count}', { count: options.max }))
        }

        // trigger event
        let edata = this.trigger('add', { target: this.el, file: newItem, total: cnt, totalSize: size, errors })
        if (edata.isCancelled === true) return
        // if errors and not silent
        if (options.silent !== true && errors.length > 0) {
            w2tooltip.show({
                anchor: this.el,
                html: 'Errors: ' + errors.join('<br>')
            })
            console.log('ERRORS (while adding files): ', errors)
            return
        }
        // check params
        selected.push(newItem)
        // read file as base64
        if (typeof FileReader !== 'undefined' && options.readContent === true) {
            let reader = new FileReader()
            let self = this
            // need a closure
            reader.onload = (function onload() {
                return function closure(event) {
                    let fl = event.target.result
                    let ind = fl.indexOf(',')
                    newItem.content = fl.substr(ind + 1)
                    self.refresh()
                    query(self.el).trigger('input').trigger('change')
                    // event after
                    edata.finish()
                }
            })()
            reader.readAsDataURL(file)
        } else {
            this.refresh()
            query(this.el).trigger('input').trigger('change')
            edata.finish()
        }
    }

    // move cursror to end
    moveCaret2end() {
        setTimeout(() => {
            this.el.setSelectionRange(this.el.value.length, this.el.value.length)
        }, 0)
    }
}

export { w2field }