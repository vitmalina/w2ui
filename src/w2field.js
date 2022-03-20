/**
 * Part of w2ui 2.0 library
 *  - Dependencies: jQuery, w2utils, w2base
 *
 * == TODO ==
 *  - upload (regular files)
 *  - BUG with prefix/postfix and arrows (test in different contexts)
 *  - multiple date selection
 *  - month selection, year selections`
 *  - arrows no longer work (for int)
 *  - rewrite suffix and prefix positioning with translateY()
 *  - prefix and suffix are slow (100ms or so)
 *  - MultiSelect - Allow Copy/Paste for single and multi values
 *  - add routeData to list/enum
 *  - for type: list -> read value from attr('value')
 *  - ENUM, LIST: should have same as grid (limit, offset, search, sort)
 *  - ENUM, LIST: should support wild chars
 *  - add selection of predefined times (used for appointments)
 *  - options.items - can be an array
 *  - options.msgSearch - message to search for user
 *  - options.msgNoItems - can be a function
 *  - normmenu - remove, it is in w2utils now
 *
 * == 2.0 changes
 *  - enum options.autoAdd
 *  - [numeric, date] - options.autoCorrect to enforce range and validity
 *  - silent only left for files, removed form the rest
 *  - remote source response items => records or just an array
 *  - deprecated "success" field for remote source response
 *  - CSP - fixed inline events
 *  - remove clear, use reset instead
 */

import query from './query.js'
import { w2base } from './w2base.js'
import { w2utils } from './w2utils.js'
import { w2tooltip, w2color, w2menu } from './w2tooltip.js'

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

        this.options     = options
        this.el          = null
        this.selected    = null
        this.helpers     = {} // object or helper elements
        this.type        = options.type || 'text'
        this.options     = w2utils.clone(options)
        this.onSearch    = options.onSearch || null
        this.onRequest   = options.onRequest || null
        this.onLoad      = options.onLoad || null
        this.onError     = options.onError || null
        this.onClick     = options.onClick || null
        this.onAdd       = options.onAdd || null
        this.onNew       = options.onNew || null
        this.onRemove    = options.onRemove || null
        this.onMouseOver = options.onMouseOver || null
        this.onMouseOut  = options.onMouseOut || null
        this.onScroll    = options.onScroll || null
        this.tmp         = {} // temp object
        // clean up some options
        delete this.options.type
        delete this.options.onSearch
        delete this.options.onRequest
        delete this.options.onLoad
        delete this.options.onError
        delete this.options.onClick
        delete this.options.onMouseOver
        delete this.options.onMouseOut
        delete this.options.onScroll
    }

    render(el) {
        if (!(el instanceof HTMLElement)) {
            console.log('ERROR: Cannot init w2field on empty subject')
            return
        }
        if (el._w2field) {
            el._w2field.reset()
        } else {
            el._w2field = this
        }
        this.el = el
        this.init()
    }

    init() {
        let obj = this
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
            case 'hex':
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
                    arrows: false,
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
                    options.arrows   = false
                    options.keyboard = false
                }
                this.addPrefix() // only will add if needed
                this.addSuffix()
                break

            case 'color':
                defaults     = {
                    prefix      : '#',
                    suffix      : `<div style="width: ${(parseInt(getComputedStyle(this.el)['font-size'])) || 12}px">&#160;</div>`,
                    arrows      : false,
                    keyboard    : false,
                    advanced    : null, // open advanced by default
                    transparent : true
                }
                this.options = w2utils.extend({}, defaults, options)
                options      = this.options // since object is re-created, need to re-assign
                this.addPrefix() // only will add if needed
                this.addSuffix() // only will add if needed
                break

            case 'date':
                defaults     = {
                    format       : w2utils.settings.dateFormat, // date format
                    keyboard     : true,
                    autoCorrect  : true,
                    start        : '', // string or jquery object
                    end          : '', // string or jquery object
                    blocked      : {}, // { '4/11/2011': 'yes' }
                    colored      : {}, // { '4/11/2011': 'red:white' }
                    blockWeekDays : null // array of numbers of weekday to block
                }
                this.options = $.extend(true, {}, defaults, options)
                options      = this.options // since object is re-created, need to re-assign
                if (query(this.el).attr('placeholder') == null) query(this.el).attr('placeholder', options.format)
                break

            case 'time':
                defaults     = {
                    format      : w2utils.settings.timeFormat,
                    keyboard    : true,
                    autoCorrect : true,
                    start       : '',
                    end         : '',
                    noMinutes   : false
                }
                this.options = $.extend(true, {}, defaults, options)
                options      = this.options // since object is re-created, need to re-assign
                if (query(this.el).attr('placeholder') == null) query(this.el).attr('placeholder', options.format)
                break

            case 'datetime':
                defaults     = {
                    format      : w2utils.settings.dateFormat + ' | ' + w2utils.settings.timeFormat,
                    keyboard    : true,
                    autoCorrect : true,
                    start       : '', // string or jquery object or Date object
                    end         : '', // string or jquery object or Date object
                    blocked     : [], // [ '4/11/2011', '4/12/2011' ] or [ new Date(2011, 4, 11), new Date(2011, 4, 12) ]
                    colored     : {}, // { '12/17/2014': 'blue:green', '12/18/2014': 'gray:white'  }; // key has to be formatted with w2utils.settings.dateFormat
                    placeholder : null, // optional. will fall back to this.format if not specified. Only used if this.el has no placeholder attribute.
                    btn_now     : true, // show/hide the use-current-date-and-time button
                    noMinutes   : false
                }
                this.options = $.extend(true, {}, defaults, options)
                options      = this.options // since object is re-created, need to re-assign
                if (query(this.el).attr('placeholder') == null) query(this.el).attr('placeholder', options.placeholder || options.format)
                break

            case 'list':
            case 'combo':
                defaults = {
                    items           : [],
                    selected        : {},
                    url             : null, // url to pull data from // TODO: implement
                    recId           : null, // map retrieved data from url to id, can be string or function
                    recText         : null, // map retrieved data from url to text, can be string or function
                    method          : null, // default comes from w2utils.settings.dataType
                    interval        : 350, // number of ms to wait before sending server call on search
                    postData        : {},
                    minLength       : 1, // min number of chars when trigger search
                    cacheMax        : 250,
                    maxDropHeight   : 350, // max height for drop down menu
                    maxDropWidth    : null, // if null then auto set
                    minDropWidth    : null, // if null then auto set
                    match           : 'begins', // ['contains', 'is', 'begins', 'ends']
                    icon            : null,
                    iconStyle       : '',
                    align           : 'both', // same width as control
                    altRows         : true, // alternate row color
                    onSearch        : null, // when search needs to be performed
                    onRequest       : null, // when request is submitted
                    onLoad          : null, // when data is received
                    onError         : null, // when data fails to load due to server error or other failure modes
                    renderDrop      : null, // render function for drop down item
                    compare         : null, // compare function for filtering
                    filter          : true, // weather to filter at all
                    prefix          : '',
                    suffix          : '',
                    openOnFocus     : false, // if to show overlay onclick or when typing
                    markSearch      : false
                }
                if (typeof options.items == 'function') {
                    options._items_fun = options.items
                }
                // need to be first
                options.items = w2utils.normMenu.call(this, options.items)
                if (this.type === 'list') {
                    // defaults.search = (options.items && options.items.length >= 10 ? true : false);
                    defaults.openOnFocus = true
                    query(this.el).addClass('w2ui-select')
                    // if simple value - look it up
                    if (!w2utils.isPlainObject(options.selected) && Array.isArray(options.items)) {
                        options.items.forEach(item => {
                            if (item && item.id === options.selected) {
                                options.selected = w2utils.clone(item)
                            }
                        })
                    }
                    this.watchSize()
                }
                options = w2utils.extend({}, defaults, options)
                this.options = options
                if (!w2utils.isPlainObject(options.selected)) options.selected = {}
                this.selected = options.selected
                if (this.type === 'list') this.addFocus()
                this.addPrefix()
                this.addSuffix()
                this.refresh()
                query(this.el)
                    .attr('autocapitalize', 'off')
                    .attr('autocomplete', 'off')
                    .attr('autocorrect', 'off')
                    .attr('spellcheck', 'false')
                if (options.selected.text != null) {
                    query(this.el).val(options.selected.text)
                }
                break

            case 'enum':
                defaults = {
                    items           : [],
                    selected        : [],
                    max             : 0, // max number of selected items, 0 - unlimited
                    url             : null, // not implemented
                    recId           : null, // map retrieved data from url to id, can be string or function
                    recText         : null, // map retrieved data from url to text, can be string or function
                    interval        : 350, // number of ms to wait before sending server call on search
                    method          : null, // default comes from w2utils.settings.dataType
                    postData        : {},
                    minLength       : 1, // min number of chars when trigger search
                    cacheMax        : 250,
                    maxWidth        : 250, // max width for a single item
                    maxHeight       : 350, // max height for input control to grow
                    maxDropHeight   : 350, // max height for drop down menu
                    maxDropWidth    : null, // if null then auto set
                    match           : 'contains', // ['contains', 'is', 'begins', 'ends']
                    align           : 'both', // same width as control
                    altRows         : true, // alternate row color
                    openOnFocus     : false, // if to show overlay onclick or when typing
                    markSearch      : true,
                    renderDrop      : null, // render function for drop down item
                    renderItem      : null, // render selected item
                    compare         : null, // compare function for filtering
                    filter          : true, // alias for compare
                    style           : '', // style for container div
                    onSearch        : null, // when search needs to be performed
                    onRequest       : null, // when request is submitted
                    onLoad          : null, // when data is received
                    onError         : null, // when data fails to load due to server error or other failure modes
                    onClick         : null, // when an item is clicked
                    onAdd           : null, // when an item is added
                    onNew           : null, // when new item should be added
                    onRemove        : null, // when an item is removed
                    onMouseOver     : null, // when an item is mouse over
                    onMouseOut      : null, // when an item is mouse out
                    onScroll        : null // when div with selected items is scrolled
                }
                options  = w2utils.extend({}, defaults, options, { suffix: '' })
                if (typeof options.items == 'function') {
                    options._items_fun = options.items
                }
                options.items    = w2utils.normMenu.call(this, options.items)
                options.selected = w2utils.normMenu.call(this, options.selected)
                this.options     = options
                if (!Array.isArray(options.selected)) options.selected = []
                this.selected = options.selected
                this.addSuffix()
                this.addMulti()
                this.watchSize()
                break

            case 'file':
                defaults     = {
                    selected      : [],
                    max           : 0,
                    maxSize       : 0, // max size of all files, 0 - unlimited
                    maxFileSize   : 0, // max size of a single file, 0 -unlimited
                    maxWidth      : 250, // max width for a single item
                    maxHeight     : 350, // max height for input control to grow
                    maxDropHeight : 350, // max height for drop down menu
                    maxDropWidth  : null, // if null then auto set
                    readContent   : true, // if true, it will readAsDataURL content of the file
                    silent        : true,
                    align         : 'both', // same width as control
                    altRows       : true, // alternate row color
                    renderItem    : null, // render selected item
                    style         : '', // style for container div
                    onClick       : null, // when an item is clicked
                    onAdd         : null, // when an item is added
                    onRemove      : null, // when an item is removed
                    onMouseOver   : null, // when an item is mouse over
                    onMouseOut    : null // when an item is mouse out
                }
                options = w2utils.extend({}, defaults, options)
                this.options = options
                if (!Array.isArray(options.selected)) options.selected = []
                this.selected = options.selected
                if (query(this.el).attr('placeholder') == null) {
                    query(this.el).attr('placeholder', w2utils.lang('Attach files by dragging and dropping or Click to Select'))
                }
                this.addMulti()
                this.watchSize()
                break
        }
        // attach events
        this.tmp = {
            onChange    (event) { obj.change.call(obj, event) },
            onClick     (event) { obj.click.call(obj, event) },
            onFocus     (event) { obj.focus.call(obj, event) },
            onBlur      (event) { obj.blur.call(obj, event) },
            onKeydown   (event) { obj.keyDown.call(obj, event) },
            onKeypress  (event) { obj.keyPress.call(obj, event) }
        }
        query(this.el)
            .addClass('w2field w2ui-input')
            .off('.w2field')
            .on('change.w2field', this.tmp.onChange)
            .on('click.w2field', this.tmp.onClick) // ignore click because it messes overlays
            .on('focus.w2field', this.tmp.onFocus)
            .on('blur.w2field', this.tmp.onBlur)
            .on('keydown.w2field', this.tmp.onKeydown)
            .on('keypress.w2field', this.tmp.onKeypress)
            .css('box-sizing', 'border-box')
        // format initial value
        this.change(new Event('change'))
    }

    watchSize() {
        let obj = this
        let tmp = $(obj.el).data('tmp') || {}
        tmp.sizeTimer = setInterval(() => {
            if ($(obj.el).parents('body').length > 0) {
                obj.resize()
            } else {
                clearInterval(tmp.sizeTimer)
            }
        }, 200)
        $(obj.el).data('tmp', tmp)
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
                query(this.el).trigger('input').trigger('change')
            } else {
                let it = (this.type === 'enum' ? [val] : val)
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
                if (this.type !== 'list' && append) {
                    if (Array.isArray(this.selected)) this.selected = []
                    this.selected.push(items[ind])
                    query(this.el).trigger('input').trigger('change')
                } else {
                    let it = (this.type === 'enum' ? [items[ind]] : items[ind])
                    this.selected.push(it)
                    query(this.el).trigger('input').trigger('change')
                }
                this.refresh()
                return true
            }
        }
        return false
    }

    refresh() {
        let obj      = this
        let options  = this.options
        let selected = this.selected
        let time     = (new Date()).getTime()
        // enum
        if (['list'].indexOf(this.type) !== -1) {
            $(obj.el).parent().css('white-space', 'nowrap') // needs this for arrow always to appear on the right side
            // hide focus and show text
            if (obj.helpers.prefix) obj.helpers.prefix.hide()
            setTimeout(() => {
                if (!obj.helpers.focus) return
                // if empty show no icon
                if (!$.isEmptyObject(selected) && options.icon) {
                    options.prefix = '<span class="w2ui-icon '+ options.icon +'"style="cursor: pointer; font-size: 14px;' +
                                     ' display: inline-block; margin-top: -1px; color: #7F98AD;'+ options.iconStyle +'">'+
                        '</span>'
                    obj.addPrefix()
                } else {
                    options.prefix = ''
                    obj.addPrefix()
                }
                // focus helper
                let focus = query(obj.helpers.focus).find('input')
                if ($(focus).val() === '') {
                    $(focus).css({'text-indent': '-9999em', outline: 'none' })
                        .prev().css('opacity', 0)
                    $(obj.el).val(selected && selected.text != null ? w2utils.lang(selected.text) : '')
                } else {
                    $(focus).css('text-indent', 0).prev().css('opacity', 1)
                    $(obj.el).val('')
                    setTimeout(() => {
                        if (obj.helpers.prefix) obj.helpers.prefix.hide()
                        if (options.icon) {
                            $(focus).css('margin-left', '17px')
                            $(obj.helpers.focus).find('.w2ui-icon-search')
                                .addClass('show-search')
                        } else {
                            $(focus).css('margin-left', '0px')
                            $(obj.helpers.focus).find('.w2ui-icon-search')
                                .removeClass('show-search')
                        }
                    }, 1)
                }
                // if readonly or disabled
                if ($(obj.el).prop('readonly') || $(obj.el).prop('disabled')) {
                    setTimeout(() => {
                        $(obj.helpers.prefix).css('opacity', '0.6')
                        $(obj.helpers.suffix).css('opacity', '0.6')
                    }, 1)
                } else {
                    setTimeout(() => {
                        $(obj.helpers.prefix).css('opacity', '1')
                        $(obj.helpers.suffix).css('opacity', '1')
                    }, 1)
                }
            }, 1)
        }
        if (['enum', 'file'].indexOf(this.type) !== -1) {
            let html = ''
            if (selected) {
                for (let s = 0; s < selected.length; s++) {
                    let it  = selected[s]
                    let ren = ''
                    if (typeof options.renderItem === 'function') {
                        ren = options.renderItem(it, s, '<div class="w2ui-list-remove" title="'+ w2utils.lang('Remove') +'" index="'+ s +'">&#160;&#160;</div>')
                    } else {
                        ren = '<div class="w2ui-list-remove" title="'+ w2utils.lang('Remove') +'" index="'+ s +'">&#160;&#160;</div>'+
                             (obj.type === 'enum' ? it.text : it.name + '<span class="file-size"> - '+ w2utils.formatSize(it.size) +'</span>')
                    }
                    html += '<li index="'+ s +'" style="max-width: '+ parseInt(options.maxWidth) + 'px; '+ (it.style ? it.style : '') +'">'+
                           ren +'</li>'
                }
            }
            let div = obj.helpers.multi
            let ul  = div.find('ul')
            div.attr('style', div.attr('style') + ';' + options.style)
            $(obj.el).css('z-index', '-1')
            if ($(obj.el).prop('readonly') || $(obj.el).prop('disabled')) {
                setTimeout(() => {
                    div[0].scrollTop = 0 // scroll to the top
                    div.addClass('w2ui-readonly')
                        .find('li').css('opacity', '0.9')
                        .parent().find('li.nomouse').hide()
                        .find('input').prop('readonly', true)
                        .parents('ul')
                        .find('.w2ui-list-remove').hide()
                }, 1)
            } else {
                setTimeout(() => {
                    div.removeClass('w2ui-readonly')
                        .find('li').css('opacity', '1')
                        .parent().find('li.nomouse').show()
                        .find('input').prop('readonly', false)
                        .parents('ul')
                        .find('.w2ui-list-remove').show()
                }, 1)
            }

            // clean
            div.find('.w2ui-enum-placeholder').remove()
            ul.find('li').not('li.nomouse').remove()
            // add new list
            if (html !== '') {
                ul.prepend(html)
            } else if ($(obj.el).attr('placeholder') != null && div.find('input').val() === '') {
                let style =
                    'padding-top: ' + $(this.el).css('padding-top') + ';'+
                    'padding-left: ' + $(this.el).css('padding-left') + '; ' +
                    'box-sizing: ' + $(this.el).css('box-sizing') + '; ' +
                    'line-height: ' + $(this.el).css('line-height') + '; ' +
                    'font-size: ' + $(this.el).css('font-size') + '; ' +
                    'font-family: ' + $(this.el).css('font-family') + '; '
                div.prepend('<div class="w2ui-enum-placeholder" style="'+ style +'">'+ $(obj.el).attr('placeholder') +'</div>')
            }
            // ITEMS events
            div.off('scroll.w2field').on('scroll.w2field', function(event) {
                let edata = obj.trigger({ phase: 'before', type: 'scroll', target: obj.el, originalEvent: event })
                if (edata.isCancelled === true) return
                // event after
                obj.trigger($.extend(edata, { phase: 'after' }))
            })
                .find('li')
                .data('mouse', 'out')
                .on('click', function(event) {
                    let target = (event.target.tagName.toUpperCase() === 'LI' ? event.target : $(event.target).parents('LI'))
                    let item   = selected[$(target).attr('index')]
                    if ($(target).hasClass('nomouse')) return
                    event.stopPropagation()
                    let edata
                    // default behavior
                    if ($(event.target).hasClass('w2ui-list-remove')) {
                        if ($(obj.el).prop('readonly') || $(obj.el).prop('disabled')) return
                        // trigger event
                        edata = obj.trigger({ phase: 'before', type: 'remove', target: obj.el, originalEvent: event.originalEvent, item: item })
                        if (edata.isCancelled === true) return
                        // default behavior
                        $().w2overlay()
                        selected.splice($(event.target).attr('index'), 1)
                        $(obj.el).trigger('input').trigger('change')
                        $(event.target).parent().fadeOut('fast')
                        setTimeout(() => {
                            obj.refresh()
                            // event after
                            obj.trigger($.extend(edata, { phase: 'after' }))
                        }, 300)
                    } else {
                        // trigger event
                        edata = obj.trigger({ phase: 'before', type: 'click', target: obj.el, originalEvent: event.originalEvent, item: item })
                        if (edata.isCancelled === true) return
                        // if file - show image preview
                        if (obj.type === 'file') {
                            let preview = ''
                            if ((/image/i).test(item.type)) { // image
                                preview = `
                                    <div style="padding: 3px">
                                        <img data-src="${(item.content ? 'data:'+ item.type +';base64,'+ item.content : '')}"
                                            style="max-width: 300px">
                                    </div>`
                            }
                            let td1  = 'style="padding: 3px; text-align: right; color: #777"'
                            let td2  = 'style="padding: 3px"'
                            preview += `
                                <div style="padding: 8px;">
                                    <table cellpadding="2">
                                    <tr>
                                        <td ${td1}>${w2utils.lang('Name')}</td>
                                        <td ${td2}>${item.name}</td>
                                    </tr>
                                    <tr>
                                        <td ${td1}>${w2utils.lang('Size')}</td>
                                        <td ${td2}>${w2utils.formatSize(item.size)}</td>
                                    </tr>
                                    <tr>
                                        <td ${td1}>${w2utils.lang('Type')}</td>
                                        <td ${td2}>
                                            <span style="width: 200px; display: block-inline; overflow: hidden;
                                                text-overflow: ellipsis; white-space: nowrap="nowrap";">${item.type}</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td ${td1}>${w2utils.lang('Modified')}</td>
                                        <td ${td2}>${w2utils.date(item.modified)}</td>
                                    </tr>
                                    </table>
                                </div>`
                            $('#w2ui-overlay').remove()
                            $(target).w2overlay(preview, {
                                onShow(event) {
                                    let $img = $('#w2ui-overlay img')
                                    $img.on('load', function (event) {
                                        let w = $(this).width()
                                        let h = $(this).height()
                                        if (w < 300 & h < 300) return
                                        if (w >= h && w > 300) $(this).width(300)
                                        if (w < h && h > 300) $(this).height(300)
                                    })
                                    .on('error', function (event) {
                                        this.style.display = 'none'
                                    })
                                    .attr('src', $img.data('src'))
                                }
                            })
                        } // event after
                        obj.trigger($.extend(edata, { phase: 'after' }))
                    }
                })
                .on('mouseover', function(event) {
                    let target = (event.target.tagName.toUpperCase() === 'LI' ? event.target : $(event.target).parents('LI'))
                    if ($(target).hasClass('nomouse')) return
                    if ($(target).data('mouse') === 'out') {
                        let item = selected[$(event.target).attr('index')]
                        // trigger event
                        let edata = obj.trigger({ phase: 'before', type: 'mouseOver', target: obj.el, originalEvent: event.originalEvent, item: item })
                        if (edata.isCancelled === true) return
                        // event after
                        obj.trigger($.extend(edata, { phase: 'after' }))
                    }
                    $(target).data('mouse', 'over')
                })
                .on('mouseout', function(event) {
                    let target = (event.target.tagName.toUpperCase() === 'LI' ? event.target : $(event.target).parents('LI'))
                    if ($(target).hasClass('nomouse')) return
                    $(target).data('mouse', 'leaving')
                    setTimeout(() => {
                        if ($(target).data('mouse') === 'leaving') {
                            $(target).data('mouse', 'out')
                            let item = selected[$(event.target).attr('index')]
                            // trigger event
                            let edata = obj.trigger({ phase: 'before', type: 'mouseOut', target: obj.el, originalEvent: event.originalEvent, item: item })
                            if (edata.isCancelled === true) return
                            // event after
                            obj.trigger($.extend(edata, { phase: 'after' }))
                        }
                    }, 0)
                })
            // adjust height
            $(this.el).height('auto')
            let cntHeight = $(div).find('> div.w2ui-multi-items').height()
            if (cntHeight < 26) cntHeight = 26
            if (cntHeight > options.maxHeight) cntHeight = options.maxHeight
            if (div.length > 0) div[0].scrollTop = 1000
            let inpHeight = w2utils.getSize($(this.el), 'height') - 2
            if (inpHeight > cntHeight) cntHeight = inpHeight
            $(div).css({ 'height': cntHeight + 'px', overflow: (cntHeight == options.maxHeight ? 'auto' : 'hidden') })
            if (cntHeight < options.maxHeight) $(div).prop('scrollTop', 0)
            // min height
            let minHeight = parseInt($(this.el).css('min-height'))
            if (minHeight > cntHeight) {
                cntHeight = minHeight
                $(obj.helpers.multi).css('height', cntHeight + 'px')
            }
            $(this.el).css({ 'height': cntHeight + 'px' })

            // update size
            if (obj.type === 'enum') {
                let tmp = obj.helpers.multi.find('input')
                tmp.width(((tmp.val().length + 2) * 8) + 'px')
            }
        }
        return (new Date()).getTime() - time
    }

    // resizing width of list, enum, file controls
    resize() {
        let width = this.el.clientWidth
        let height = this.el.clientHeight
        if (this.tmp.current_width == width && height > 0) return
        let styles = getComputedStyle(this.el)

        let focus  = this.helpers.focus
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
            this.options.suffix = `<div class="arrow-down" style="margin-top: ${((parseInt(styles['height']) - 6) / 2)}px;"></div>`
            this.addSuffix()
        }
        if (prefix) {
            this.addPrefix()
        }
        // remember width
        this.tmp.current_width = width
    }

    reset() {
        // restore paddings
        if (this.tmp != null) {
            query(this.el).css('height', 'auto')
            if (this.tmp && this.tmp['old-padding-left']) query(this.el).css('padding-left', this.tmp['old-padding-left'])
            if (this.tmp && this.tmp['old-padding-right']) query(this.el).css('padding-right', this.tmp['old-padding-right'])
            if (this.tmp && this.tmp['old-background-color']) query(this.el).css('background-color', this.tmp['old-background-color'])
            if (this.tmp && this.tmp['old-border-color']) query(this.el).css('border-color', this.tmp['old-border-color'])
            // remove resize watcher
            clearInterval(this.tmp.sizeTimer)
        }
        // remove events and (data)
        query(this.el)
            .val(this.clean(query(this.el).val()))
            .removeClass('w2field')
            .removeData() // removes all attached data
            .off('.w2field') // remove only events added by w2field
        // remove helpers
        Object.keys(this.helpers).forEach(key => {
            query(this.helpers[key]).remove()
        })
        this.helpers = {}
    }

    clean(val) {
        // issue #499
        if(typeof val === 'number'){
            return val
        }
        let options = this.options
        val = String(val).trim()
        // clean
        if (['int', 'float', 'money', 'currency', 'percent'].indexOf(this.type) !== -1) {
            if (typeof val === 'string') {
                if (options.autoFormat && ['money', 'currency'].indexOf(this.type) !== -1) val = String(val).replace(options.moneyRE, '')
                if (options.autoFormat && this.type === 'percent') val = String(val).replace(options.percentRE, '')
                if (options.autoFormat && ['int', 'float'].indexOf(this.type) !== -1) val = String(val).replace(options.numberRE, '')
                val = val.replace(/\s+/g, '').replace(w2utils.settings.groupSymbol, '').replace(w2utils.settings.decimalSymbol, '.')
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
                    val = w2utils.formatNumber(val, options.currencyPrecision, options.groupSymbol)
                    if (val !== '') val = options.currencyPrefix + val + options.currencySuffix
                    break
                case 'percent':
                    val = w2utils.formatNumber(val, options.precision, options.groupSymbol)
                    if (val !== '') val += '%'
                    break
                case 'float':
                    val = w2utils.formatNumber(val, options.precision, options.groupSymbol)
                    break
                case 'int':
                    val = w2utils.formatNumber(val, 0, options.groupSymbol)
                    break
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
            // need time out to show icon indent properly
            // TODO: check
            // setTimeout(() => { self.refresh() }, 5)
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
            if (this.type == 'combo') {
                this.updateOverlay()
            }
        }
        // other fields with drops
        if (['date', 'time', 'datetime', 'color'].includes(this.type)) {
            this.updateOverlay()
        }
        event.stopPropagation()
    }

    focus(event) {
        if (query(this.el).hasClass('has-focus')) {
            return
        }
        query(this.el).addClass('has-focus')
        // color, date, time
        if (['color', 'date', 'time', 'datetime'].indexOf(this.type) !== -1) {
            if (query(this.el).prop('readonly') || query(this.el).prop('disabled')) return
            this.updateOverlay()
        }
        // menu
        if (['list', 'combo', 'enum'].indexOf(this.type) !== -1) {
            if (query(this.el).prop('readonly') || query(this.el).prop('disabled')) return
            // regenerate items
            if (typeof this.options._items_fun == 'function') {
                this.options.items = w2utils.normMenu.call(this, this.options._items_fun)
            }
            this.resize()
            this.updateOverlay()
        }
        if (this.type == 'file') {
            let prev = query(this.el).get(0).previousElementSibling
            query(prev).addClass('has-focus')
        }
    }

    blur(event) {
        let obj      = this
        let options  = obj.options
        let val      = $(obj.el).val().trim()
        let $overlay = $('#w2ui-overlay')
        $(obj.el).removeClass('has-focus')

        // hide overlay
        if (['color', 'date', 'time', 'list', 'combo', 'enum', 'datetime'].indexOf(obj.type) !== -1) {
            let closeTimeout = setTimeout(() => {
                if ($overlay.data('keepOpen') !== true) $overlay.hide()
            }, 0)

            $('.menu', $overlay).one('focus', function() {
                clearTimeout(closeTimeout)
                $(this).one('focusout', function(event) {
                    $overlay.hide()
                })
            })
        }
        if (['int', 'float', 'money', 'currency', 'percent'].indexOf(obj.type) !== -1) {
            if (val !== '') {
                let newVal = val
                let error = ''
                if (!obj.checkType(val)) {
                    newVal = ''
                } else {
                    let rVal = this.clean(val)
                    if (options.min != null && rVal < options.min) {
                        newVal = options.min
                        error = `Should be >= ${options.min}`
                    }
                    if (options.max != null && rVal > options.max) {
                        newVal = options.max
                        error = `Should be <= ${options.max}`
                    }
                }
                if (options.autoCorrect) {
                    $(obj.el).val(newVal).trigger('input').trigger('change')
                    if (error) {
                        $(obj.el).w2tag(error)
                        setTimeout(() => { $(obj.el).w2tag('') }, 3000)
                    }
                }
            }
        }
        // date or time
        if (['date', 'time', 'datetime'].indexOf(obj.type) !== -1) {
            // check if in range
            if (val !== '' && !obj.inRange(obj.el.value)) {
                if (options.autoCorrect) {
                    $(obj.el).val('').removeData('selected').trigger('input').trigger('change')
                }
            } else {
                if (obj.type === 'date' && val !== '' && !w2utils.isDate(obj.el.value, options.format)) {
                    if (options.autoCorrect) {
                        $(obj.el).val('').removeData('selected').trigger('input').trigger('change')
                    }
                }
                else if (obj.type === 'time' && val !== '' && !w2utils.isTime(obj.el.value)) {
                    if (options.autoCorrect) {
                        $(obj.el).val('').removeData('selected').trigger('input').trigger('change')
                    }
                }
                else if (obj.type === 'datetime' && val !== '' && !w2utils.isDateTime(obj.el.value, options.format)) {
                    if (options.autoCorrect) {
                        $(obj.el).val('').removeData('selected').trigger('input').trigger('change')
                    }
                }
            }
        }
        // clear search input
        if (obj.type === 'enum') {
            $(obj.helpers.multi).find('input').val('').width(20)
        }
        if (this.type == 'file') {
            $(this.el).prev().removeClass('has-focus')
        }
    }

    keyPress(event) {
        let obj = this
        // ignore wrong pressed key
        if (['int', 'float', 'money', 'currency', 'percent', 'hex', 'bin', 'color', 'alphanumeric'].indexOf(obj.type) !== -1) {
            // keyCode & charCode differ in FireFox
            if (event.metaKey || event.ctrlKey || event.altKey || (event.charCode != event.keyCode && event.keyCode > 0)) return
            let ch = String.fromCharCode(event.charCode)
            if (!obj.checkType(ch, true) && event.keyCode != 13) {
                event.preventDefault()
                if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true
                return false
            }
        }
        // update date popup
        if (['date', 'time', 'datetime'].indexOf(obj.type) !== -1) {
            if (event.keyCode !== 9) setTimeout(() => { obj.updateOverlay() }, 1)
        }
    }

    keyDown(event, extra) {
        let obj     = this
        let options = obj.options
        let key     = event.keyCode || (extra && extra.keyCode)
        let cancel  = false
        let val, inc, daymil, dt, newValue, newDT
        // numeric
        if (['int', 'float', 'money', 'currency', 'percent'].indexOf(obj.type) !== -1) {
            if (!options.keyboard || $(obj.el).prop('readonly') || $(obj.el).prop('disabled')) return
            val = parseFloat($(obj.el).val().replace(options.moneyRE, '')) || 0
            inc = options.step
            if (event.ctrlKey || event.metaKey) inc = 10
            switch (key) {
                case 38: // up
                    if (event.shiftKey) break // no action if shift key is pressed
                    newValue = (val + inc <= options.max || options.max == null ? Number((val + inc).toFixed(12)) : options.max)
                    $(obj.el).val(newValue).trigger('input').trigger('change')
                    cancel = true
                    break
                case 40: // down
                    if (event.shiftKey) break // no action if shift key is pressed
                    newValue = (val - inc >= options.min || options.min == null ? Number((val - inc).toFixed(12)) : options.min)
                    $(obj.el).val(newValue).trigger('input').trigger('change')
                    cancel = true
                    break
            }
            if (cancel) {
                event.preventDefault()
                setTimeout(() => {
                    // set cursor to the end
                    obj.el.setSelectionRange(obj.el.value.length, obj.el.value.length)
                }, 0)
            }
        }
        // date
        if (obj.type === 'date') {
            if (!options.keyboard || $(obj.el).prop('readonly') || $(obj.el).prop('disabled')) return
            daymil = 24*60*60*1000
            inc    = 1
            if (event.ctrlKey || event.metaKey) inc = 10
            dt = w2utils.isDate($(obj.el).val(), options.format, true)
            if (!dt) { dt = new Date(); daymil = 0 }
            switch (key) {
                case 38: // up
                    if (event.shiftKey) break // no action if shift key is pressed
                    newDT = w2utils.formatDate(dt.getTime() + daymil, options.format)
                    if (inc == 10) newDT = w2utils.formatDate(new Date(dt.getFullYear(), dt.getMonth()+1, dt.getDate()), options.format)
                    $(obj.el).val(newDT).trigger('input').trigger('change')
                    cancel = true
                    break
                case 40: // down
                    if (event.shiftKey) break // no action if shift key is pressed
                    newDT = w2utils.formatDate(dt.getTime() - daymil, options.format)
                    if (inc == 10) newDT = w2utils.formatDate(new Date(dt.getFullYear(), dt.getMonth()-1, dt.getDate()), options.format)
                    $(obj.el).val(newDT).trigger('input').trigger('change')
                    cancel = true
                    break
            }
            if (cancel) {
                event.preventDefault()
                setTimeout(() => {
                    // set cursor to the end
                    obj.el.setSelectionRange(obj.el.value.length, obj.el.value.length)
                    obj.updateOverlay()
                }, 0)
            }
        }
        // time
        if (obj.type === 'time') {
            if (!options.keyboard || $(obj.el).prop('readonly') || $(obj.el).prop('disabled')) return
            inc      = (event.ctrlKey || event.metaKey ? 60 : 1)
            val      = $(obj.el).val()
            let time = obj.toMin(val) || obj.toMin((new Date()).getHours() + ':' + ((new Date()).getMinutes() - 1))
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
                $(obj.el).val(obj.fromMin(time)).trigger('input').trigger('change')
                event.preventDefault()
                setTimeout(() => {
                    // set cursor to the end
                    obj.el.setSelectionRange(obj.el.value.length, obj.el.value.length)
                }, 0)
            }
        }
        // datetime
        if (obj.type === 'datetime') {
            if (!options.keyboard || $(obj.el).prop('readonly') || $(obj.el).prop('disabled')) return
            daymil = 24*60*60*1000
            inc    = 1
            if (event.ctrlKey || event.metaKey) inc = 10
            let str = $(obj.el).val()
            dt      = w2utils.isDateTime(str, this.options.format, true)
            if (!dt) { dt = new Date(); daymil = 0 }
            switch (key) {
                case 38: // up
                    if (event.shiftKey) break // no action if shift key is pressed
                    newDT = w2utils.formatDateTime(dt.getTime() + daymil, options.format)
                    if (inc == 10) newDT = w2utils.formatDateTime(new Date(dt.getFullYear(), dt.getMonth()+1, dt.getDate()), options.format)
                    $(obj.el).val(newDT).trigger('input').trigger('change')
                    cancel = true
                    break
                case 40: // down
                    if (event.shiftKey) break // no action if shift key is pressed
                    newDT = w2utils.formatDateTime(dt.getTime() - daymil, options.format)
                    if (inc == 10) newDT = w2utils.formatDateTime(new Date(dt.getFullYear(), dt.getMonth()-1, dt.getDate()), options.format)
                    $(obj.el).val(newDT).trigger('input').trigger('change')
                    cancel = true
                    break
            }
            if (cancel) {
                event.preventDefault()
                setTimeout(() => {
                    // set cursor to the end
                    obj.el.setSelectionRange(obj.el.value.length, obj.el.value.length)
                    obj.updateOverlay()
                }, 0)
            }
        }
        // color
        if (obj.type === 'color') {
            if ($(obj.el).prop('readonly') || $(obj.el).prop('disabled')) return
            // paste
            if ((event.ctrlKey || event.metaKey) && !event.shiftKey) {
                let dir      = null
                let newColor = null
                switch (key) {
                    case 38: // up
                        dir = 'up'
                        break
                    case 40: // down
                        dir = 'down'
                        break
                    case 39: // right
                        dir = 'right'
                        break
                    case 37: // left
                        dir = 'left'
                        break
                }
                if (obj.el.nav && dir != null) {
                    newColor = obj.el.nav(dir)
                    $(obj.el).val(newColor).trigger('input').trigger('change')
                    event.preventDefault()
                }
            }
        }
    }

    updateOverlay(indexOnly) {
        let obj = this
        let options = this.options
        let month, year, dt, params
        // color
        if (this.type === 'color') {
            if (query(this.el).prop('readonly') || query(this.el).prop('disabled')) return
            w2color.show({
                name: this.el.id + '_color',
                anchor: this.el,
                transparent: options.transparent,
                advanced: options.advanced,
                color: this.el.value,
                liveUpdate: true
            })
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
                el = this.helpers.multi
                // TODO: check
                input = query(el).find('input')
            }
            if (this.type === 'list') {
                let sel = this.selected
                if (w2utils.isPlainObject(sel) && Object.keys(sel).length > 0) {
                    let ind = _findItem(options.items, sel.id)
                    if (ind.length > 0) {
                        options.index = ind
                    }
                    function _findItem(items, search, parents) {
                        let ids = []
                        if (!parents) parents = []
                        items.forEach((item, ind) => {
                            if (item.id === search) {
                                ids = parents.concat([ind])
                                options.index = [ind]
                            }
                            if (ids.length == 0 && item.items && item.items.length > 0) {
                                parents.push(ind)
                                ids = _findItem(item.items, search, parents)
                                parents.pop()
                            }
                        })
                        return ids
                    }
                }
                input = query(this.helpers.focus).find('input')
            }
            if (query(this.el).hasClass('has-focus')) {
                if (options.openOnFocus === false && query(input).val() === '' && this.tmp.force_open !== true) {
                    w2menu.hide(el.id + '_menu')
                    return
                }
                if (this.tmp.force_hide) {
                    w2menu.hide(el.id + '_menu')
                    delete this.tmp.force_hide
                    return
                }
                if (query(input).val() !== '') delete this.tmp.force_open
                let msgNoItems = w2utils.lang('No matches')
                if (options.url != null && String(query(input).val()).length < options.minLength && this.tmp.emptySet !== true) {
                    msgNoItems = w2utils.lang('${count} letters or more...', { count: options.minLength })
                }
                if (options.url != null && query(input).val() === '' && this.tmp.emptySet !== true) {
                    msgNoItems = w2utils.lang(options.msgSearch || 'Type to search...')
                }
                if (options.url == null && options.items.length === 0) msgNoItems = w2utils.lang('Empty list')
                if (options.msgNoItems != null) {
                    let eventData = {
                        search: query(input).val(),
                        options: $.extend(true, {}, options)
                    }
                    if (options.url) {
                        eventData.remote = {
                            url: options.url,
                            empty: this.tmp.emptySet ? true : false,
                            error: this.tmp.lastError,
                            minLength: options.minLength
                        }
                    }
                    msgNoItems = (typeof options.msgNoItems === 'function'
                        ? options.msgNoItems(eventData)
                        : options.msgNoItems)
                }
                if (this.tmp.lastError) {
                    msgNoItems = this.tmp.lastError
                }
                if (msgNoItems) {
                    msgNoItems = '<div class="no-matches" style="white-space: normal; line-height: 1.3">' + msgNoItems + '</div>'
                }

                params = w2utils.extend({}, options, {
                    name: el.id + '_menu',
                    anchor: el,
                    search     : false,
                    render     : options.renderDrop,
                    maxHeight  : options.maxDropHeight, // TODO: check
                    maxWidth   : options.maxDropWidth,  // TODO: check
                    minWidth   : options.minDropWidth,  // TODO: check
                    msgNoItems : msgNoItems,
                })
                w2menu.show(params).select(event => {
                    if (this.type != 'enum') {
                        this.selected = event.detail.item
                        if (this.helpers.focus) query(this.helpers.focus).find('input').val('')
                        query(this.el).val(this.selected.text).trigger('input').trigger('change')
                    } else {
                        let selected = $(obj.el).data('selected')
                        if (event.item) {
                            // trigger event
                            let edata = obj.trigger({ phase: 'before', type: 'add', target: obj.el, originalEvent: event.originalEvent, item: event.item })
                            if (edata.isCancelled === true) return
                            // default behavior
                            if (selected.length >= options.max && options.max > 0) selected.pop()
                            delete event.item.hidden
                            selected.push(event.item)
                            $(obj.el).data('selected', selected).trigger('input').trigger('change')
                            $(obj.helpers.multi).find('input').val('').width(20)
                            obj.refresh()
                            if (event.keepOpen !== true) {
                                if ($('#w2ui-overlay').length > 0) $('#w2ui-overlay')[0].hide()
                            } else {
                                let ind
                                params.items.forEach((item, i) => { if (item.id == event.item.id) ind = i })
                                if (ind != null) params.items.splice(ind, 1)
                                params.selected = selected
                                $(el).w2menu('refresh', params)
                            }
                            // event after
                            obj.trigger($.extend(edata, { phase: 'after' }))
                        }
                    }
                })
            }
        }
        // date
        if (this.type === 'date') {
            if (query(obj.el).prop('readonly') || query(obj.el).prop('disabled')) return
            w2tooltip.show({
                anchor: this.el,
                html: 'In progress...',
                hideOn: ['blur', 'doc-click']
            })
            return
            if ($('#w2ui-overlay').length === 0) {
                $(obj.el).w2overlay('<div class="w2ui-reset w2ui-calendar"></div>', {
                    css: { 'background-color': '#f5f5f5' }
                })
            }
            dt = w2utils.isDate($(obj.el).val(), obj.options.format, true)
            if (dt) { month = dt.getMonth() + 1; year = dt.getFullYear() }
            (function refreshCalendar(month, year) {
                if (!month && !year) {
                    let dt = new Date()
                    month  = dt.getMonth()
                    year   = dt.getFullYear()
                }
                $('#w2ui-overlay > div > div').html(obj.getMonthHTML(month, year, $(obj.el).val()))
                $('#w2ui-overlay .w2ui-calendar-title')
                    .on('mousedown', function() {
                        if ($(this).next().hasClass('w2ui-calendar-jump')) {
                            $(this).next().remove()
                        } else {
                            let selYear, selMonth
                            $(this).after('<div class="w2ui-calendar-jump" style=""></div>')
                            $(this).next().hide().html(obj.getYearHTML()).fadeIn(200)
                            setTimeout(() => {
                                $('#w2ui-overlay .w2ui-calendar-jump')
                                    .find('.w2ui-jump-month, .w2ui-jump-year')
                                    .on('dblclick', function() {
                                        if ($(this).hasClass('w2ui-jump-month')) {
                                            $(this).parent().find('.w2ui-jump-month').removeClass('selected')
                                            $(this).addClass('selected')
                                            selMonth = $(this).attr('name')
                                        }
                                        if ($(this).hasClass('w2ui-jump-year')) {
                                            $(this).parent().find('.w2ui-jump-year').removeClass('selected')
                                            $(this).addClass('selected')
                                            selYear = $(this).attr('name')
                                        }
                                        if (selMonth == null) selMonth = month
                                        if (selYear == null) selYear = year
                                        $('#w2ui-overlay .w2ui-calendar-jump').fadeOut(100)
                                        setTimeout(() => { refreshCalendar(parseInt(selMonth)+1, selYear) }, 100)
                                    })
                                    .on('click', function() {
                                        if ($(this).hasClass('w2ui-jump-month')) {
                                            $(this).parent().find('.w2ui-jump-month').removeClass('selected')
                                            $(this).addClass('selected')
                                            selMonth = $(this).attr('name')
                                        }
                                        if ($(this).hasClass('w2ui-jump-year')) {
                                            $(this).parent().find('.w2ui-jump-year').removeClass('selected')
                                            $(this).addClass('selected')
                                            selYear = $(this).attr('name')
                                        }
                                        if (selYear != null && selMonth != null) {
                                            $('#w2ui-overlay .w2ui-calendar-jump').fadeOut(100)
                                            setTimeout(() => { refreshCalendar(parseInt(selMonth)+1, selYear) }, 100)
                                        }
                                    })
                                $('#w2ui-overlay .w2ui-calendar-jump >:last-child').prop('scrollTop', 2000)
                            }, 1)
                        }
                    })
                $('#w2ui-overlay .w2ui-date')
                    .on('mousedown', function() {
                        let day = $(this).attr('date')
                        $(obj.el).val(day).trigger('input').trigger('change')
                        $(this).css({ 'background-color': '#B6D5FB', 'border-color': '#aaa' })
                    })
                    .on('mouseup', function() {
                        setTimeout(() => {
                            if ($('#w2ui-overlay').length > 0) $('#w2ui-overlay').removeData('keepOpen')[0].hide()
                        }, 10)
                    })
                $('#w2ui-overlay .previous').on('mousedown', function() {
                    let tmp = obj.options.current.split('/')
                    tmp[0]  = parseInt(tmp[0]) - 1
                    refreshCalendar(tmp[0], tmp[1])
                })
                $('#w2ui-overlay .next').on('mousedown', function() {
                    let tmp = obj.options.current.split('/')
                    tmp[0]  = parseInt(tmp[0]) + 1
                    refreshCalendar(tmp[0], tmp[1])
                })
            })(month, year)
        }
        // time
        if (this.type === 'time') {
            if (query(obj.el).prop('readonly') || query(obj.el).prop('disabled')) return
            w2tooltip.show({
                anchor: this.el,
                html: 'In progress...',
                hideOn: ['blur', 'doc-click']
            })
            return;

            if ($('#w2ui-overlay').length === 0) {
                $(obj.el).w2overlay('<div class="w2ui-reset w2ui-calendar-time"></div>', {
                    css: { 'background-color': '#fff' }
                })
            }
            let h24 = (this.options.format === 'h24')
            $('#w2ui-overlay > div').html(obj.getHourHTML())
            $('#w2ui-overlay .w2ui-time')
                .on('mousedown', function(event) {
                    $(this).css({ 'background-color': '#B6D5FB', 'border-color': '#aaa' })
                    let hour = $(this).attr('hour')
                    $(obj.el).val((hour > 12 && !h24 ? hour - 12 : hour) + ':00' + (!h24 ? (hour < 12 ? ' am' : ' pm') : '')).trigger('input').trigger('change')
                })
            if (this.options.noMinutes == null || this.options.noMinutes === false) {
                $('#w2ui-overlay .w2ui-time')
                    .on('mouseup', function() {
                        let hour = $(this).attr('hour')
                        if ($('#w2ui-overlay').length > 0) $('#w2ui-overlay')[0].hide()
                        $(obj.el).w2overlay('<div class="w2ui-reset w2ui-calendar-time"></div>', { css: { 'background-color': '#fff' } })
                        $('#w2ui-overlay > div').html(obj.getMinHTML(hour))
                        $('#w2ui-overlay .w2ui-time')
                            .on('mousedown', function() {
                                $(this).css({ 'background-color': '#B6D5FB', 'border-color': '#aaa' })
                                let min = $(this).attr('min')
                                $(obj.el).val((hour > 12 && !h24 ? hour - 12 : hour) + ':' + (min < 10 ? 0 : '') + min + (!h24 ? (hour < 12 ? ' am' : ' pm') : '')).trigger('input').trigger('change')
                            })
                            .on('mouseup', function() {
                                setTimeout(() => { if ($('#w2ui-overlay').length > 0) $('#w2ui-overlay').removeData('keepOpen')[0].hide() }, 10)
                            })
                    })
            } else {
                $('#w2ui-overlay .w2ui-time')
                    .on('mouseup', function() {
                        setTimeout(() => { if ($('#w2ui-overlay').length > 0) $('#w2ui-overlay').removeData('keepOpen')[0].hide() }, 10)
                    })
            }
        }
        // datetime
        if (this.type === 'datetime') {
            if (query(obj.el).prop('readonly') || query(obj.el).prop('disabled')) return
            w2tooltip.show({
                anchor: this.el,
                html: 'In progress...',
                hideOn: ['blur', 'doc-click']
            })
            return;

            // hide overlay if we are in the time selection
            if ($('#w2ui-overlay .w2ui-time').length > 0) $('#w2ui-overlay')[0].hide()
            if ($('#w2ui-overlay').length === 0) {
                $(obj.el).w2overlay('<div class="w2ui-reset w2ui-calendar"></div>', {
                    css: { 'background-color': '#f5f5f5' }
                })
            }
            dt = w2utils.isDateTime($(obj.el).val(), obj.options.format, true)
            if (dt) { month = dt.getMonth() + 1; year = dt.getFullYear() }
            let selDate = null;
            (function refreshCalendar(month, year) {
                $('#w2ui-overlay > div > div').html(
                    obj.getMonthHTML(month, year, $(obj.el).val())
                    + (options.btn_now ? '<div class="w2ui-calendar-now now">'+ w2utils.lang('Current Date & Time') + '</div>' : '')
                )
                $('#w2ui-overlay .w2ui-calendar-title')
                    .on('mousedown', function() {
                        if ($(this).next().hasClass('w2ui-calendar-jump')) {
                            $(this).next().remove()
                        } else {
                            let selYear, selMonth
                            $(this).after('<div class="w2ui-calendar-jump" style=""></div>')
                            $(this).next().hide().html(obj.getYearHTML()).fadeIn(200)
                            setTimeout(() => {
                                $('#w2ui-overlay .w2ui-calendar-jump')
                                    .find('.w2ui-jump-month, .w2ui-jump-year')
                                    .on('click', function() {
                                        if ($(this).hasClass('w2ui-jump-month')) {
                                            $(this).parent().find('.w2ui-jump-month').removeClass('selected')
                                            $(this).addClass('selected')
                                            selMonth = $(this).attr('name')
                                        }
                                        if ($(this).hasClass('w2ui-jump-year')) {
                                            $(this).parent().find('.w2ui-jump-year').removeClass('selected')
                                            $(this).addClass('selected')
                                            selYear = $(this).attr('name')
                                        }
                                        if (selYear != null && selMonth != null) {
                                            $('#w2ui-overlay .w2ui-calendar-jump').fadeOut(100)
                                            setTimeout(() => { refreshCalendar(parseInt(selMonth)+1, selYear) }, 100)
                                        }
                                    })
                                $('#w2ui-overlay .w2ui-calendar-jump >:last-child').prop('scrollTop', 2000)
                            }, 1)
                        }
                    })
                $('#w2ui-overlay .w2ui-date')
                    .on('mousedown', function() {
                        let day = $(this).attr('date')
                        $(obj.el).val(day).trigger('input').trigger('change')
                        $(this).css({ 'background-color': '#B6D5FB', 'border-color': '#aaa' })
                        selDate = new Date($(this).attr('data-date'))
                    })
                    .on('mouseup', function() {
                        // continue with time picker
                        let selHour, selMin
                        if ($('#w2ui-overlay').length > 0) $('#w2ui-overlay')[0].hide()
                        $(obj.el).w2overlay('<div class="w2ui-reset w2ui-calendar-time"></div>', { css: { 'background-color': '#fff' } })
                        // let h24 = (obj.options.format === 'h24')
                        $('#w2ui-overlay > div').html(obj.getHourHTML())
                        $('#w2ui-overlay .w2ui-time')
                            .on('mousedown', function(event) {
                                $(this).css({ 'background-color': '#B6D5FB', 'border-color': '#aaa' })
                                selHour = $(this).attr('hour')
                                selDate.setHours(selHour)
                                let txt = w2utils.formatDateTime(selDate, obj.options.format)
                                $(obj.el).val(txt).trigger('input').trigger('change')
                                //$(obj.el).val((hour > 12 && !h24 ? hour - 12 : hour) + ':00' + (!h24 ? (hour < 12 ? ' am' : ' pm') : '')).trigger('input').trigger('change');
                            })
                        if (obj.options.noMinutes == null || obj.options.noMinutes === false) {
                            $('#w2ui-overlay .w2ui-time')
                                .on('mouseup', function() {
                                    let hour = $(this).attr('hour')
                                    if ($('#w2ui-overlay').length > 0) $('#w2ui-overlay')[0].hide()
                                    $(obj.el).w2overlay('<div class="w2ui-reset w2ui-calendar-time"></div>', { css: { 'background-color': '#fff' } })
                                    $('#w2ui-overlay > div').html(obj.getMinHTML(hour))
                                    $('#w2ui-overlay .w2ui-time')
                                        .on('mousedown', function() {
                                            $(this).css({ 'background-color': '#B6D5FB', 'border-color': '#aaa' })
                                            selMin = $(this).attr('min')
                                            selDate.setHours(selHour, selMin)
                                            let txt = w2utils.formatDateTime(selDate, obj.options.format)
                                            $(obj.el).val(txt).trigger('input').trigger('change')
                                            //$(obj.el).val((hour > 12 && !h24 ? hour - 12 : hour) + ':' + (min < 10 ? 0 : '') + min + (!h24 ? (hour < 12 ? ' am' : ' pm') : '')).trigger('input').trigger('change');
                                        })
                                        .on('mouseup', function() {
                                            setTimeout(() => { if ($('#w2ui-overlay').length > 0) $('#w2ui-overlay').removeData('keepOpen')[0].hide() }, 10)
                                        })
                                })
                        } else {
                            $('#w2ui-overlay .w2ui-time')
                                .on('mouseup', function() {
                                    setTimeout(() => { if ($('#w2ui-overlay').length > 0) $('#w2ui-overlay').removeData('keepOpen')[0].hide() }, 10)
                                })
                        }
                    })
                $('#w2ui-overlay .previous').on('mousedown', function() {
                    let tmp = obj.options.current.split('/')
                    tmp[0]  = parseInt(tmp[0]) - 1
                    refreshCalendar(tmp[0], tmp[1])
                })
                $('#w2ui-overlay .next').on('mousedown', function() {
                    let tmp = obj.options.current.split('/')
                    tmp[0]  = parseInt(tmp[0]) + 1
                    refreshCalendar(tmp[0], tmp[1])
                })
                // "now" button
                $('#w2ui-overlay .now')
                    .on('mousedown', function() {
                        // this currently ignores blocked days or start / end dates!
                        let tmp = w2utils.formatDateTime(new Date(), obj.options.format)
                        $(obj.el).val(tmp).trigger('input').trigger('change')
                        return false
                    })
                    .on('mouseup', function() {
                        setTimeout(() => {
                            if ($('#w2ui-overlay').length > 0) $('#w2ui-overlay').removeData('keepOpen')[0].hide()
                        }, 10)
                    })
            })(month, year)
        }
    }

    inRange(str, onlyDate) {
        let inRange = false
        if (this.type === 'date') {
            let dt = w2utils.isDate(str, this.options.format, true)
            if (dt) {
                // enable range
                if (this.options.start || this.options.end) {
                    let st      = (typeof this.options.start === 'string' ? this.options.start : $(this.options.start).val())
                    let en      = (typeof this.options.end === 'string' ? this.options.end : $(this.options.end).val())
                    let start   = w2utils.isDate(st, this.options.format, true)
                    let end     = w2utils.isDate(en, this.options.format, true)
                    let current = new Date(dt)
                    if (!start) start = current
                    if (!end) end = current
                    if (current >= start && current <= end) inRange = true
                } else {
                    inRange = true
                }
                // block predefined dates
                if (this.options.blocked && $.inArray(str, this.options.blocked) !== -1) inRange = false

                /*
                clockWeekDay - type: array or integers. every element - number of week day.
                number of weekday (1 - monday, 2 - tuesday, 3 - wednesday, 4 - thursday, 5 - friday, 6 - saturday, 0 - sunday)
                for block in calendar (for example, block all sundays so user can't choose sunday in calendar)
                */
                if (this.options.blockWeekDays !== null && this.options.blockWeekDays !== undefined
                    && this.options.blockWeekDays.length != undefined){
                    let l = this.options.blockWeekDays.length
                    for (let i = 0; i<l; i++){
                        if (dt.getDay() == this.options.blockWeekDays[i]){
                            inRange = false
                        }
                    }
                }
            }
        } else if (this.type === 'time') {
            if (this.options.start || this.options.end) {
                let tm  = this.toMin(str)
                let tm1 = this.toMin(this.options.start)
                let tm2 = this.toMin(this.options.end)
                if (!tm1) tm1 = tm
                if (!tm2) tm2 = tm
                if (tm >= tm1 && tm <= tm2) inRange = true
            } else {
                inRange = true
            }
        } else if (this.type === 'datetime') {
            let dt = w2utils.isDateTime(str, this.options.format, true)
            if (dt) {
                // enable range
                if (this.options.start || this.options.end) {
                    let start, end
                    if (typeof this.options.start === 'object' && this.options.start instanceof Date) {
                        start = this.options.start
                    } else {
                        let st = (typeof this.options.start === 'string' ? this.options.start : $(this.options.start).val())
                        if (st.trim() !== '') {
                            start = w2utils.isDateTime(st, this.options.format, true)
                        } else {
                            start = ''
                        }
                    }
                    if (typeof this.options.end === 'object' && this.options.end instanceof Date) {
                        end = this.options.end
                    } else {
                        let en = (typeof this.options.end === 'string' ? this.options.end : $(this.options.end).val())
                        if (en.trim() !== '') {
                            end = w2utils.isDateTime(en, this.options.format, true)
                        } else {
                            end = ''
                        }
                    }
                    let current = dt // new Date(dt);
                    if (!start) start = current
                    if (!end) end = current
                    if (onlyDate && start instanceof Date) {
                        start.setHours(0)
                        start.setMinutes(0)
                        start.setSeconds(0)
                    }
                    if (current >= start && current <= end) inRange = true
                } else {
                    inRange = true
                }
                // block predefined dates
                if (inRange && this.options.blocked) {
                    for (let i = 0; i<this.options.blocked.length; i++) {
                        let blocked = this.options.blocked[i]
                        if(typeof blocked === 'string') {
                            // convert string to Date object
                            blocked = w2utils.isDateTime(blocked, this.options.format, true)
                        }
                        // check for Date object with the same day
                        if(typeof blocked === 'object' && blocked instanceof Date && (blocked.getFullYear() == dt.getFullYear() && blocked.getMonth() == dt.getMonth() && blocked.getDate() == dt.getDate())) {
                            inRange = false
                            break
                        }
                    }
                }
            }
        }
        return inRange
    }

    /*
    *  INTERNAL FUNCTIONS
    */

    checkType(ch, loose) {
        let obj = this
        switch (obj.type) {
            case 'int':
                if (loose && ['-', obj.options.groupSymbol].indexOf(ch) !== -1) return true
                return w2utils.isInt(ch.replace(obj.options.numberRE, ''))
            case 'percent':
                ch = ch.replace(/%/g, '')
            case 'float':
                if (loose && ['-', w2utils.settings.decimalSymbol, obj.options.groupSymbol].indexOf(ch) !== -1) return true
                return w2utils.isFloat(ch.replace(obj.options.numberRE, ''))
            case 'money':
            case 'currency':
                if (loose && ['-', obj.options.decimalSymbol, obj.options.groupSymbol, obj.options.currencyPrefix, obj.options.currencySuffix].indexOf(ch) !== -1) return true
                return w2utils.isFloat(ch.replace(obj.options.moneyRE, ''))
            case 'bin':
                return w2utils.isBin(ch)
            case 'hex':
                return w2utils.isHex(ch)
            case 'alphanumeric':
                return w2utils.isAlphaNumeric(ch)
        }
        return true
    }

    addPrefix() {
        let helper
        let styles = getComputedStyle(this.el)
        if (this.tmp['old-padding-left']) {
            query(this.el).css('padding-left', this.tmp['old-padding-left'])
        }
        this.tmp['old-padding-left'] = styles['padding-left']
        // remove if already displayed
        if (this.helpers.prefix) query(this.helpers.prefix).remove()
        if (this.options.prefix !== '') {
            // add fresh
            query(this.el).before(`<div class="w2ui-field-helper">${this.options.prefix}</div>`)
            helper = query(this.el).get(0).previousElementSibling
            query(helper)
                .css({
                    'color'          : styles['color'],
                    'font-family'    : styles['font-family'],
                    'font-size'      : styles['font-size'],
                    'padding-top'    : styles['padding-top'],
                    'padding-bottom' : styles['padding-bottom'],
                    'padding-left'   : styles['padding-left'],
                    'padding-right'  : 0,
                    'margin-top'     : (parseInt(styles['margin-top'], 10) + 2) + 'px',
                    'margin-bottom'  : (parseInt(styles['margin-bottom'], 10) + 1) + 'px',
                    'margin-left'    : styles['margin-left'],
                    'margin-right'   : 0
                })
            query(this.el).css('padding-left', helper.clientWidth + 'px')
            // remember helper
            this.helpers.prefix = helper
        }
    }

    addSuffix() {
        let helper
        let self = this
        let styles = getComputedStyle(this.el)
        if (this.tmp['old-padding-right']) {
            query(this.el).css('padding-right', this.tmp['old-padding-right'])
        }
        this.tmp['old-padding-right'] = styles['padding-right']
        let pr = parseInt(styles['padding-right'] || 0)
        if (this.options.arrows) {
            // remove if already displayed
            if (this.helpers.arrows) query(this.helpers.arrows).remove()
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
                    'color'         : styles['color'],
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
            query(this.el).css('padding-right', pr + 'px')
            this.helpers.arrows = helper
        }
        if (this.options.suffix !== '') {
            // remove if already displayed
            if (this.helpers.suffix) query(this.helpers.suffix).remove()
            // add fresh
            query(this.el).after(`<div class="w2ui-field-helper">${this.options.suffix}</div>`)
            helper = query(this.el).get(0).nextElementSibling
            query(helper)
                .css({
                    'color'          : styles['color'],
                    'font-family'    : styles['font-family'],
                    'font-size'      : styles['font-size'],
                    'padding-top'    : styles['padding-top'],
                    'padding-bottom' : styles['padding-bottom'],
                    'padding-left'   : 0,
                    'padding-right'  : styles['padding-right'],
                    'margin-top'     : (parseInt(styles['margin-top'], 10) + 2) + 'px',
                    'margin-bottom'  : (parseInt(styles['margin-bottom'], 10) + 1) + 'px',
                    'transform'      : 'translateX(-100%)'
                })

            query(this.el).css('padding-right', helper.clientWidth + 'px')
            this.helpers.suffix = helper
        }
    }

    addFocus() {
        let width = 0 // 11 - show search icon, 0 do not show
        let pholder
        // clean up & init
        if (this.helpers.focus) query(this.helpers.focus).remove()
        // remember original tabindex
        let tabIndex = parseInt(query(this.el).attr('tabIndex'))
        if (!isNaN(tabIndex) && tabIndex !== -1) this.el._tabIndex = tabIndex
        if (this.el._tabIndex) tabIndex = this.el._tabIndex
        if (tabIndex == null) tabIndex = -1
        if (isNaN(tabIndex)) tabIndex = 0
        // if there is id, add to search with "_search"
        let searchId = ''
        if (query(this.el).attr('id') != null) {
            searchId = 'id="' + query(this.el).attr('id') + '_search"'
        }
        // build helper
        let html =
            '<div class="w2ui-field-helper">'+
            '    <span class="w2ui-icon w2ui-icon-search"></span>'+
            '    <input '+ searchId +' type="text" tabIndex="'+ tabIndex +'" autocapitalize="off" autocomplete="off" autocorrect="off" spellcheck="false"/>'+
            '</div>'
        query(this.el).attr('tabindex', -1).before(html)
        let helper = query(this.el).get(0).previousElementSibling
        this.helpers.focus = helper
        let styles = getComputedStyle(this.el)
        query(helper).css({
                width           : this.el.clientWidth,
                'margin-top'    : styles['margin-top'],
                'margin-left'   : (parseInt(styles['margin-left']) + parseInt(styles['padding-left'])) + 'px',
                'margin-bottom' : styles['margin-bottom'],
                'margin-right'  : styles['margin-right']
            })
            .find('input')
            .css({
                cursor   : 'default',
                width    : '100%',
                opacity  : 1,
                margin   : 0,
                border   : '1px solid transparent',
                padding  : styles['padding-top'],
                'padding-left'     : 0,
                'margin-left'      : (width > 0 ? width + 6 : 0),
                'background-color' : 'transparent'
            })
        // INPUT events
        query(helper).find('input')
            .on('focus', event => {
                pholder = query(this.el).attr('placeholder')
                query(event.target).val('')
                query(this.el).trigger('focus')
                event.stopPropagation()
            })
            .on('blur', event => {
                $(event.target).val('')
                this.refresh()
                query(this.el).trigger('blur')
                event.stopPropagation()
                if (pholder != null) query(this.el).attr('placeholder', pholder)
            })
            .on('keydown', event => {
                let el = event.target
                this.keyDown(event)
                if (el.value === '') {
                    query(this.el).attr('placeholder', pholder)
                 } else {
                     query(this.el).attr('placeholder', '')
                 }
            })
            .on('keypress', event => {
                this.keyPress(event)
            })
        // MAIN div
        query(helper).on('click', event => {
            query(event.target).find('input').focus()
        })
        this.refresh()
    }

    addMulti() {
        let obj = this
        // clean up & init
        $(obj.helpers.multi).remove()
        // build helper
        let html   = ''
        let margin =
            'margin-top     : 0px; ' +
            'margin-bottom  : 0px; ' +
            'margin-left    : ' + $(obj.el).css('margin-left') + '; ' +
            'margin-right   : ' + $(obj.el).css('margin-right') + '; '+
            'width          : ' + (w2utils.getSize(obj.el, 'width')
                                - parseInt($(obj.el).css('margin-left'), 10)
                                - parseInt($(obj.el).css('margin-right'), 10))
                                + 'px;'
        // if there is id, add to search with "_search"
        let searchId = ''
        if ($(obj.el).attr('id') != null) {
            searchId = 'id="' + $(obj.el).attr('id') + '_search" '
        }
        if (obj.type === 'enum') {
            // remember original tabindex
            let tabIndex = parseInt($(obj.el).attr('tabIndex'))
            if (!isNaN(tabIndex) && tabIndex !== -1) obj.el._tabIndex = tabIndex
            if (obj.el._tabIndex) tabIndex = obj.el._tabIndex
            if (tabIndex == null) tabIndex = 0
            if (isNaN(tabIndex)) tabIndex = 0

            html = `
            <div class="w2ui-field-helper w2ui-list" style="${margin}; box-sizing: border-box">
                <div style="padding: 0px; margin: 0px; display: inline-block" class="w2ui-multi-items">
                <ul>
                    <li style="padding-left: 0px; padding-right: 0px" class="nomouse">
                        <input ${searchId} type="text" autocapitalize="off" autocomplete="off" autocorrect="off" spellcheck="false"
                            style="width: 20px; margin: -3px 0 0; padding: 2px 0; border-color: transparent" tabindex="${tabIndex}"
                            ${ $(obj.el).prop('readonly') ? ' readonly="readonly"': '' }
                            ${ $(obj.el).prop('disabled') ? ' disabled="disabled"': '' }/>
                    </li>
                </ul>
                </div>
            </div>`
        }
        if (obj.type === 'file') {
            html = `
            <div class="w2ui-field-helper w2ui-list" style="${margin}; box-sizing: border-box">
                <div style="position: absolute; left: 0px; right: 0px; top: 0px; bottom: 0px;">
                    <input ${searchId} name="attachment" class="file-input" type="file" tabindex="-1"'
                        style="width: 100%; height: 100%; opacity: 0"
                        ${ obj.options.max !== 1 ? ' multiple="multiple"' : '' }
                        ${ $(obj.el).prop('readonly') ? ' readonly="readonly"': '' }
                        ${ $(obj.el).prop('disabled') ? ' disabled="disabled"': '' }
                        ${ $(obj.el).attr('accept') ? ' accept="'+ $(obj.el).attr('accept') +'"': '' }/>
                </div>
                <div style="position: absolute; padding: 0px; margin: 0px; display: inline-block" class="w2ui-multi-items">
                    <ul>
                        <li style="padding-left: 0px; padding-right: 0px" class="nomouse"></li>
                    </ul>
                </div>
            </div>`
        }
        // old bg and border
        let tmp                     = $(obj.el).data('tmp') || {}
        tmp['old-background-color'] = $(obj.el).css('background-color')
        tmp['old-border-color']     = $(obj.el).css('border-color')
        $(obj.el).data('tmp', tmp)

        $(obj.el)
            .before(html)
            .css({
                'background-color' : 'transparent',
                'border-color'     : 'transparent'
            })

        let div           = $(obj.el).prev()
        obj.helpers.multi = div
        if (obj.type === 'enum') {
            $(obj.el).attr('tabindex', -1)
            // INPUT events
            div.find('input')
                .on('click', function(event) {
                    if ($('#w2ui-overlay').length === 0) obj.focus(event)
                    $(obj.el).triggerHandler('click')
                })
                .on('focus', function(event) {
                    $(obj.el).triggerHandler('focus')
                    if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true
                })
                .on('blur', function(event) {
                    $(obj.el).triggerHandler('blur')
                    if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true
                })
                .on('keydown', function(event) { obj.keyDown(event) })
                .on('keypress', function(event) { obj.keyPress(event) })
            // MAIN div
            div.on('click', function(event) { $(this).find('input').focus() })
        }
        if (obj.type === 'file') {
            div.find('input')
                .off('.drag')
                .on('click.drag', function(event) {
                    event.stopPropagation()
                    if ($(obj.el).prop('readonly') || $(obj.el).prop('disabled')) return
                    $(obj.el).focus()
                })
                .on('dragenter.drag', function(event) {
                    if ($(obj.el).prop('readonly') || $(obj.el).prop('disabled')) return
                    $(div).addClass('w2ui-file-dragover')
                })
                .on('dragleave.drag', function(event) {
                    if ($(obj.el).prop('readonly') || $(obj.el).prop('disabled')) return
                    $(div).removeClass('w2ui-file-dragover')
                })
                .on('drop.drag', function(event) {
                    if ($(obj.el).prop('readonly') || $(obj.el).prop('disabled')) return
                    $(div).removeClass('w2ui-file-dragover')
                    let files = event.originalEvent.dataTransfer.files
                    for (let i = 0, l = files.length; i < l; i++) obj.addFile.call(obj, files[i])
                    $(obj.el).focus()
                    // cancel to stop browser behaviour
                    event.preventDefault()
                    event.stopPropagation()
                })
                .on('dragover.drag', function(event) {
                    // cancel to stop browser behaviour
                    event.preventDefault()
                    event.stopPropagation()
                })
                .on('change.drag', function() {
                    $(obj.el).focus()
                    if (typeof this.files !== 'undefined') {
                        for (let i = 0, l = this.files.length; i < l; i++) {
                            obj.addFile.call(obj, this.files[i])
                        }
                    }
                })
        }
        obj.refresh()
    }

    addFile(file) {
        let obj      = this
        let options  = this.options
        let selected = $(obj.el).data('selected')
        let newItem  = {
            name     : file.name,
            type     : file.type,
            modified : file.lastModifiedDate,
            size     : file.size,
            content  : null,
            file     : file
        }
        let size     = 0
        let cnt      = 0
        let err
        if (selected) {
            for (let s = 0; s < selected.length; s++) {
                // check for dupes
                if (selected[s].name == file.name && selected[s].size == file.size) return
                size += selected[s].size
                cnt++
            }
        }
        // trigger event
        let edata = obj.trigger({ phase: 'before', type: 'add', target: obj.el, file: newItem, total: cnt, totalSize: size })
        if (edata.isCancelled === true) return
        // check params
        if (options.maxFileSize !== 0 && newItem.size > options.maxFileSize) {
            err = 'Maximum file size is '+ w2utils.formatSize(options.maxFileSize)
            if (options.silent === false) $(obj.el).w2tag(err)
            console.log('ERROR: '+ err)
            return
        }
        if (options.maxSize !== 0 && size + newItem.size > options.maxSize) {
            err = w2utils.lang('Maximum total size is ${count}', { count: w2utils.formatSize(options.maxSize) })
            if (options.silent === false) {
                $(obj.el).w2tag(err)
            }
            console.log('ERROR: '+ err)
            return
        }
        if (options.max !== 0 && cnt >= options.max) {
            err = w2utils.lang('Maximum number of files is ${count}', { count: options.max })
            if (options.silent === false) {
                $(obj.el).w2tag(err)
            }
            console.log('ERROR: '+ err)
            return
        }
        selected.push(newItem)
        // read file as base64
        if (typeof FileReader !== 'undefined' && options.readContent === true) {
            let reader = new FileReader()
            // need a closure
            reader.onload = (function onload() {
                return function closure(event) {
                    let fl          = event.target.result
                    let ind         = fl.indexOf(',')
                    newItem.content = fl.substr(ind+1)
                    obj.refresh()
                    $(obj.el).trigger('input').trigger('change')
                    // event after
                    obj.trigger($.extend(edata, { phase: 'after' }))
                }
            })()
            reader.readAsDataURL(file)
        } else {
            obj.refresh()
            $(obj.el).trigger('input').trigger('change')
            obj.trigger($.extend(edata, { phase: 'after' }))
        }
    }

    getMonthHTML(month, year, selected) {
        let td        = new Date()
        let months    = w2utils.settings.fullmonths
        let daysCount = ['31', '28', '31', '30', '31', '30', '31', '31', '30', '31', '30', '31']
        let today     = td.getFullYear() + '/' + (Number(td.getMonth()) + 1) + '/' + td.getDate()
        let days      = w2utils.settings.fulldays.slice() // creates copy of the array
        let sdays     = w2utils.settings.shortdays.slice() // creates copy of the array
        if (w2utils.settings.weekStarts !== 'M') {
            days.unshift(days.pop())
            sdays.unshift(sdays.pop())
        }
        let options = this.options
        if (options == null) options = {}
        // normalize date
        year  = w2utils.isInt(year) ? parseInt(year) : td.getFullYear()
        month = w2utils.isInt(month) ? parseInt(month) : td.getMonth() + 1
        if (month > 12) { month -= 12; year++ }
        if (month < 1 || month === 0) { month += 12; year-- }
        if (year/4 == Math.floor(year/4)) { daysCount[1] = '29' } else { daysCount[1] = '28' }
        options.current = month + '/' + year

        // start with the required date
        td           = new Date(year, month-1, 1)
        let weekDay  = td.getDay()
        let dayTitle = ''
        for (let i = 0; i < sdays.length; i++) dayTitle += '<td title="'+ days[i] +'">' + sdays[i] + '</td>'

        let html =
            '<div class="w2ui-calendar-title title">'+
            '    <div class="w2ui-calendar-previous previous"> <div></div> </div>'+
            '    <div class="w2ui-calendar-next next"> <div></div> </div> '+
                    months[month-1] +', '+ year +
            '       <span class="arrow-down" style="position: relative; top: -1px; left: 5px; opacity: 0.6;"></span>'+
            '</div>'+
            '<table class="w2ui-calendar-days" cellspacing="0"><tbody>'+
            '    <tr class="w2ui-day-title">' + dayTitle + '</tr>'+
            '    <tr>'

        let day = 1
        if (w2utils.settings.weekStarts !== 'M') weekDay++
        if(this.type === 'datetime') {
            let dt_sel = w2utils.isDateTime(selected, options.format, true)
            selected   = w2utils.formatDate(dt_sel, w2utils.settings.dateFormat)
        }
        for (let ci = 1; ci < 43; ci++) {
            if (weekDay === 0 && ci == 1) {
                for (let ti = 0; ti < 6; ti++) html += '<td class="w2ui-day-empty">&#160;</td>'
                ci += 6
            } else {
                if (ci < weekDay || day > daysCount[month-1]) {
                    html += '<td class="w2ui-day-empty">&#160;</td>'
                    if ((ci) % 7 === 0) html += '</tr><tr>'
                    continue
                }
            }
            let dt        = year + '/' + month + '/' + day
            let DT        = new Date(dt)
            let className = ''
            if (DT.getDay() === 6) className = ' w2ui-saturday'
            if (DT.getDay() === 0) className = ' w2ui-sunday'
            if (dt == today) className += ' w2ui-today'

            let dspDay = day
            let col    = ''
            let bgcol  = ''
            let tmp_dt, tmp_dt_fmt
            if(this.type === 'datetime') {
                // var fm = options.format.split('|')[0].trim();
                // tmp_dt      = w2utils.formatDate(dt, fm);
                tmp_dt     = w2utils.formatDateTime(dt, options.format)
                tmp_dt_fmt = w2utils.formatDate(dt, w2utils.settings.dateFormat)
            } else {
                tmp_dt     = w2utils.formatDate(dt, options.format)
                tmp_dt_fmt = tmp_dt
            }
            if (options.colored && options.colored[tmp_dt_fmt] !== undefined) { // if there is predefined colors for dates
                let tmp = options.colored[tmp_dt_fmt].split(':')
                bgcol   = 'background-color: ' + tmp[0] + ';'
                col     = 'color: ' + tmp[1] + ';'
            }
            html += '<td class="'+ (this.inRange(tmp_dt, true) ? 'w2ui-date ' + (tmp_dt_fmt == selected ? 'w2ui-date-selected' : '') : 'w2ui-blocked') + className + '" '+
                    '   style="'+ col + bgcol + '" date="'+ tmp_dt +'" data-date="'+ DT +'">'+
                        dspDay +
                    '</td>'
            if (ci % 7 === 0 || (weekDay === 0 && ci == 1)) html += '</tr><tr>'
            day++
        }
        html += '</tr></tbody></table>'
        return html
    }

    getYearHTML() {
        let months     = w2utils.settings.shortmonths
        let start_year = w2utils.settings.dateStartYear
        let end_year   = w2utils.settings.dateEndYear
        let mhtml      = ''
        let yhtml      = ''
        for (let m = 0; m < months.length; m++) {
            mhtml += '<div class="w2ui-jump-month" name="'+ m +'">'+ months[m] + '</div>'
        }
        for (let y = start_year; y <= end_year; y++) {
            yhtml += '<div class="w2ui-jump-year" name="'+ y +'">'+ y + '</div>'
        }
        return '<div id="w2ui-jump-month">'+ mhtml +'</div><div id="w2ui-jump-year">'+ yhtml +'</div>'
    }

    getHourHTML() {
        let tmp     = []
        let options = this.options
        if (options == null) options = { format: w2utils.settings.timeFormat }
        let h24 = (options.format.indexOf('h24') > -1)
        for (let a = 0; a < 24; a++) {
            let time = (a >= 12 && !h24 ? a - 12 : a) + ':00' + (!h24 ? (a < 12 ? ' am' : ' pm') : '')
            if (a == 12 && !h24) time = '12:00 pm'
            if (!tmp[Math.floor(a/8)]) tmp[Math.floor(a/8)] = ''
            let tm1 = this.fromMin(this.toMin(time))
            let tm2 = this.fromMin(this.toMin(time) + 59)
            if (this.type === 'datetime') {
                let dt = w2utils.isDateTime(this.el.value, options.format, true)
                let fm = options.format.split('|')[0].trim()
                tm1    = w2utils.formatDate(dt, fm) + ' ' + tm1
                tm2    = w2utils.formatDate(dt, fm) + ' ' + tm2
            }
            tmp[Math.floor(a/8)] += '<div class="'+ (this.inRange(tm1) || this.inRange(tm2) ? 'w2ui-time ' : 'w2ui-blocked') + '" hour="'+ a +'">'+ time +'</div>'
        }
        let html =
            '<div class="w2ui-calendar">'+
            '   <div class="w2ui-calendar-title">'+ w2utils.lang('Select Hour') +'</div>'+
            '   <div class="w2ui-calendar-time"><table><tbody><tr>'+
            '       <td>'+ tmp[0] +'</td>' +
            '       <td>'+ tmp[1] +'</td>' +
            '       <td>'+ tmp[2] +'</td>' +
            '   </tr></tbody></table></div>'+
            '</div>'
        return html
    }

    getMinHTML(hour) {
        if (hour == null) hour = 0
        let options = this.options
        if (options == null) options = { format: w2utils.settings.timeFormat }
        let h24 = (options.format.indexOf('h24') > -1)
        let tmp = []
        for (let a = 0; a < 60; a += 5) {
            let time = (hour > 12 && !h24 ? hour - 12 : hour) + ':' + (a < 10 ? 0 : '') + a + ' ' + (!h24 ? (hour < 12 ? 'am' : 'pm') : '')
            let tm   = time
            let ind  = a < 20 ? 0 : (a < 40 ? 1 : 2)
            if (!tmp[ind]) tmp[ind] = ''
            if (this.type === 'datetime') {
                let dt = w2utils.isDateTime(this.el.value, options.format, true)
                let fm = options.format.split('|')[0].trim()
                tm     = w2utils.formatDate(dt, fm) + ' ' + tm
            }
            tmp[ind] += '<div class="'+ (this.inRange(tm) ? 'w2ui-time ' : 'w2ui-blocked') + '" min="'+ a +'">'+ time +'</div>'
        }
        let html =
            '<div class="w2ui-calendar">'+
            '   <div class="w2ui-calendar-title">'+ w2utils.lang('Select Minute') +'</div>'+
            '   <div class="w2ui-calendar-time"><table><tbody><tr>'+
            '       <td>'+ tmp[0] +'</td>' +
            '       <td>'+ tmp[1] +'</td>' +
            '       <td>'+ tmp[2] +'</td>' +
            '   </tr></tbody></table></div>'+
            '</div>'
        return html
    }

    toMin(str) {
        if (typeof str !== 'string') return null
        let tmp = str.split(':')
        if (tmp.length === 2) {
            tmp[0] = parseInt(tmp[0])
            tmp[1] = parseInt(tmp[1])
            if (str.indexOf('pm') !== -1 && tmp[0] !== 12) tmp[0] += 12
        } else {
            return null
        }
        return tmp[0] * 60 + tmp[1]
    }

    fromMin(time) {
        let ret = ''
        if (time >= 24 * 60) time = time % (24 * 60)
        if (time < 0) time = 24 * 60 + time
        let hour    = Math.floor(time/60)
        let min     = ((time % 60) < 10 ? '0' : '') + (time % 60)
        let options = this.options
        if (options == null) options = { format: w2utils.settings.timeFormat }
        if (options.format.indexOf('h24') !== -1) {
            ret = hour + ':' + min
        } else {
            ret = (hour <= 12 ? hour : hour - 12) + ':' + min + ' ' + (hour >= 12 ? 'pm' : 'am')
        }
        return ret
    }
}

export { w2field }