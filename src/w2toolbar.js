/************************************************************************
*   Part of w2ui 2.0 library
*   - Dependencies: jQuery, w2utils
*
* == TODO ==
*   - vertical toolbar
*
* == 2.0 changes
*   - w2toolbar.item => w2toolbar.item_template
*   - show/hide, enable/disable, check/uncheck - return array of effected items
*   - button.img - deprecated
*   - this.right - string or array
*
************************************************************************/
import { w2event } from './w2event.js'
import { w2utils } from './w2utils.js'

class w2toolbar extends w2event {
    constructor(options) {
        super(options.name)
        this.box           = null // DOM Element that holds the element
        this.name          = null // unique name for w2ui
        this.routeData     = {} // data for dynamic routes
        this.items         = []
        this.right         = '' // HTML text on the right of toolbar
        this.tooltip       = 'top|left'// can be top, bottom, left, right
        this.onClick       = null
        this.onRender      = null
        this.onRefresh     = null
        this.onResize      = null
        this.onDestroy     = null
        this.item_template = {
            id: null, // command to be sent to all event handlers
            type: 'button', // button, check, radio, drop, menu, menu-radio, menu-check, break, html, spacer
            text: null,
            html: '',
            tooltip: null, // w2toolbar.tooltip should be
            count: null,
            hidden: false,
            disabled: false,
            checked: false, // used for radio buttons
            icon: null,
            route: null, // if not null, it is route to go
            arrow: null, // arrow down for drop/menu types
            style: null, // extra css style for caption
            group: null, // used for radio buttons
            items: null, // for type menu* it is an array of items in the menu
            selected: null, // used for menu-check, menu-radio
            overlay: {},
            color: null, // color value - used in color pickers
            options: {
                advanced: false, // advanced picker t/f - user in color picker
                transparent: true, // transparent t/f - used in color picker
                html: '' // additional buttons for color picker
            },
            onClick: null,
            onRefresh: null
        }
        let items          = options.items
        delete options.items
        // mix in options
        $.extend(true, this, options)
        // add item via method to makes sure item_template is applied
        if (Array.isArray(items)) this.add(items)
    }

    add(items) {
        this.insert(null, items)
    }

    insert(id, items) {
        if (!Array.isArray(items)) items = [items]
        items.forEach(item => {
            // checks
            let valid = ['button', 'check', 'radio', 'drop', 'menu', 'menu-radio', 'menu-check', 'color', 'text-color', 'html',
                'break', 'spacer', 'new-line']
            if (valid.indexOf(String(item.type)) == -1) {
                console.log('ERROR: The parameter "type" should be one of the following:', valid, `, but ${item.type} is supplied.`, item)
                return
            }
            if (item.id == null && ['break', 'spacer', 'new-line'].indexOf(item.type) == -1) {
                console.log('ERROR: The parameter "id" is required but not supplied.', item)
                return
            }
            if (item.type == null) {
                console.log('ERROR: The parameter "type" is required but not supplied.', item)
                return
            }
            if (!w2utils.checkUniqueId(item.id, this.items, 'toolbar', this.name)) return
            // add item
            let newItem = Object.assign({}, this.item_template, item)
            if (newItem.type == 'menu-check') {
                if (!Array.isArray(newItem.selected)) newItem.selected = []
                if (Array.isArray(newItem.items)) {
                    newItem.items.forEach(it => {
                        if (it.checked && newItem.selected.indexOf(it.id) == -1) newItem.selected.push(it.id)
                        if (!it.checked && newItem.selected.indexOf(it.id) != -1) it.checked = true
                        if (it.checked == null) it.checked = false
                    })
                }
            } else if (newItem.type == 'menu-radio') {
                if (Array.isArray(newItem.items)) {
                    newItem.items.forEach(it => {
                        if (it.checked && newItem.selected == null) newItem.selected = it.id; else it.checked = false
                        if (!it.checked && newItem.selected == it.id) it.checked = true
                        if (it.checked == null) it.checked = false
                    })
                }
            }
            if (id == null) {
                this.items.push(newItem)
            } else {
                let middle = this.get(id, true)
                this.items = this.items.slice(0, middle).concat([newItem], this.items.slice(middle))
            }
            newItem.line = newItem.line || 1
            this.refresh(newItem.id)
        })
        this.resize()
    }

    remove() {
        let effected = 0
        Array.from(arguments).forEach(item => {
            let it = this.get(item)
            if (!it || String(item).indexOf(':') != -1) return
            effected++
            // remove from screen
            $(this.box).find('#tb_'+ this.name +'_item_'+ w2utils.escapeId(it.id)).remove()
            // remove from array
            let ind = this.get(it.id, true)
            if (ind != null) this.items.splice(ind, 1)
        })
        this.resize()
        return effected
    }

    set(id, newOptions) {
        let item = this.get(id)
        if (item == null) return false
        Object.assign(item, newOptions)
        this.refresh(String(id).split(':')[0])
        return true
    }

    get(id, returnIndex) {
        if (arguments.length === 0) {
            let all = []
            for (let i1 = 0; i1 < this.items.length; i1++) if (this.items[i1].id != null) all.push(this.items[i1].id)
            return all
        }
        let tmp = String(id).split(':')
        for (let i2 = 0; i2 < this.items.length; i2++) {
            let it = this.items[i2]
            // find a menu item
            if (['menu', 'menu-radio', 'menu-check'].indexOf(it.type) != -1 && tmp.length == 2 && it.id == tmp[0]) {
                let subItems = it.items
                if (typeof subItems == 'function') subItems = subItems(this)
                for (let i = 0; i < subItems.length; i++) {
                    let item = subItems[i]
                    if (item.id == tmp[1] || (item.id == null && item.text == tmp[1])) {
                        if (returnIndex == true) return i; else return item
                    }
                    if (Array.isArray(item.items)) {
                        for (let j = 0; j < item.items.length; j++) {
                            if (item.items[j].id == tmp[1] || (item.items[j].id == null && item.items[j].text == tmp[1])) {
                                if (returnIndex == true) return i; else return item.items[j]
                            }
                        }
                    }
                }
            } else if (it.id == tmp[0]) {
                if (returnIndex == true) return i2; else return it
            }
        }
        return null
    }

    show() {
        let effected = []
        Array.from(arguments).forEach(item => {
            let it = this.get(item)
            if (!it) return
            it.hidden = false
            effected.push(String(item).split(':')[0])
        })
        setTimeout(() => { effected.forEach(it => { this.refresh(it); this.resize() }) }, 15) // needs timeout
        return effected
    }

    hide() {
        let effected = []
        Array.from(arguments).forEach(item => {
            let it = this.get(item)
            if (!it) return
            it.hidden = true
            effected.push(String(item).split(':')[0])
        })
        setTimeout(() => { effected.forEach(it => { this.refresh(it); this.tooltipHide(it); this.resize() }) }, 15) // needs timeout
        return effected
    }

    enable() {
        let effected = []
        Array.from(arguments).forEach(item => {
            let it = this.get(item)
            if (!it) return
            it.disabled = false
            effected.push(String(item).split(':')[0])
        })
        setTimeout(() => { effected.forEach(it => { this.refresh(it) }) }, 15) // needs timeout
        return effected
    }

    disable() {
        let effected = []
        Array.from(arguments).forEach(item => {
            let it = this.get(item)
            if (!it) return
            it.disabled = true
            effected.push(String(item).split(':')[0])
        })
        setTimeout(() => { effected.forEach(it => { this.refresh(it); this.tooltipHide(it) }) }, 15) // needs timeout
        return effected
    }

    check() {
        let effected = []
        Array.from(arguments).forEach(item => {
            let it = this.get(item)
            if (!it || String(item).indexOf(':') != -1) return
            it.checked = true
            effected.push(String(item).split(':')[0])
        })
        setTimeout(() => { effected.forEach(it => { this.refresh(it) }) }, 15) // needs timeout
        return effected
    }

    uncheck() {
        let obj      = this
        let effected = []
        Array.from(arguments).forEach(item => {
            let it = this.get(item)
            if (!it || String(item).indexOf(':') != -1) return
            // remove overlay
            if (['menu', 'menu-radio', 'menu-check', 'drop', 'color', 'text-color'].indexOf(it.type) != -1 && it.checked) {
                // hide overlay
                setTimeout(() => {
                    let el = $('#tb_'+ obj.name +'_item_'+ w2utils.escapeId(it.id))
                    el.w2overlay({ name: obj.name, data: { 'tb-item': it.id }})
                }, 1)
            }
            it.checked = false
            effected.push(String(item).split(':')[0])
        })
        setTimeout(() => { effected.forEach(it => { this.refresh(it) }) }, 15) // needs timeout
        return effected
    }

    click(id, event) {
        let obj = this
        // click on menu items
        let tmp   = String(id).split(':')
        let it    = this.get(tmp[0])
        let items = (it && it.items ? w2utils.normMenu.call(this, it.items, it) : [])

        if (tmp.length > 1) {
            let subItem = this.get(id)
            if (subItem && !subItem.disabled) {
                obj.menuClick({ name: obj.name, item: it, subItem: subItem, originalEvent: event })
            }
            return
        }
        if (it && !it.disabled) {
            // event before
            let edata = this.trigger({ phase: 'before', type: 'click', target: (id != null ? id : this.name),
                item: it, object: it, originalEvent: event })
            if (edata.isCancelled === true) return

            let btn = '#tb_'+ this.name +'_item_'+ w2utils.escapeId(it.id)
            $(btn).removeClass('down') // need to re-query at the moment -- as well as elsewhere in this function

            if (it.type == 'radio') {
                for (let i = 0; i < this.items.length; i++) {
                    let itt = this.items[i]
                    if (itt == null || itt.id == it.id || itt.type !== 'radio') continue
                    if (itt.group == it.group && itt.checked) {
                        itt.checked = false
                        this.refresh(itt.id)
                    }
                }
                it.checked = true
                $(btn).addClass('checked')
            }

            if (['menu', 'menu-radio', 'menu-check', 'drop', 'color', 'text-color'].indexOf(it.type) != -1) {
                obj.tooltipHide(id)

                if (it.checked) {
                    // if it was already checked, second click will hide it
                    setTimeout(() => {
                        // hide overlay
                        let el = $('#tb_'+ obj.name +'_item_'+ w2utils.escapeId(it.id))
                        el.w2overlay({ name: obj.name, data: { 'tb-item': it.id }})
                        // uncheck
                        it.checked = false
                        obj.refresh(it.id)
                    }, 1)

                } else {

                    // show overlay
                    setTimeout(() => {
                        let el = $('#tb_'+ obj.name +'_item_'+ w2utils.escapeId(it.id))
                        if (!$.isPlainObject(it.overlay)) it.overlay = {}
                        let left = (el.width() - 50) / 2
                        if (left > 19) left = 19
                        if (it.type == 'drop') {
                            el.w2overlay(it.html, $.extend({ name: obj.name, left: left, top: 3, data: { 'tb-item': it.id } }, it.overlay, {
                                onHide(event) {
                                    hideDrop()
                                }
                            }))
                        }
                        if (['menu', 'menu-radio', 'menu-check'].indexOf(it.type) != -1) {
                            let menuType = 'normal'
                            if (it.type == 'menu-radio') {
                                menuType = 'radio'
                                items.forEach((item) => {
                                    if (it.selected == item.id) item.checked = true; else item.checked = false
                                })
                            }
                            if (it.type == 'menu-check') {
                                menuType = 'check'
                                items.forEach((item) => {
                                    if (Array.isArray(it.selected) && it.selected.indexOf(item.id) != -1) item.checked = true; else item.checked = false
                                })
                            }
                            el.w2menu($.extend({ name: obj.name, items: items, left: left, top: 3, data: { 'tb-item': it.id } }, it.overlay, {
                                type: menuType,
                                remove(event) {
                                    obj.menuClick({ name: obj.name, remove: true, item: it, subItem: event.item, originalEvent: event.originalEvent, keepOpen: event.keepOpen })
                                },
                                select(event) {
                                    obj.menuClick({ name: obj.name, item: it, subItem: event.item, originalEvent: event.originalEvent, keepOpen: event.keepOpen })
                                },
                                onHide(event) {
                                    hideDrop()
                                }
                            }))
                        }
                        if (['color', 'text-color'].indexOf(it.type) != -1) {
                            $(el).w2color($.extend({
                                color: it.color,
                                onHide(event) {
                                    hideDrop()
                                    if (obj._tmpColor) {
                                        obj.colorClick({ name: obj.name, item: it, color: obj._tmpColor, final: true })
                                    }
                                    delete obj._tmpColor
                                },
                                onSelect(color) {
                                    if (color != null) {
                                        obj.colorClick({ name: obj.name, item: it, color: color })
                                        obj._tmpColor = color
                                    }
                                }
                            }, it.options))
                        }
                        function hideDrop(event) {
                            it.checked = false
                            $(btn).removeClass('checked')
                        }
                    }, 1)
                }
            }

            if (['check', 'menu', 'menu-radio', 'menu-check', 'drop', 'color', 'text-color'].indexOf(it.type) != -1) {
                it.checked = !it.checked
                if (it.checked) {
                    $(btn).addClass('checked')
                } else {
                    $(btn).removeClass('checked')
                }
            }
            // route processing
            if (it.route) {
                let route = String('/'+ it.route).replace(/\/{2,}/g, '/')
                let info  = w2utils.parseRoute(route)
                if (info.keys.length > 0) {
                    for (let k = 0; k < info.keys.length; k++) {
                        route = route.replace((new RegExp(':'+ info.keys[k].name, 'g')), this.routeData[info.keys[k].name])
                    }
                }
                setTimeout(() => { window.location.hash = route }, 1)
            }
            if (event && ['button', 'check', 'radio'].indexOf(it.type) != -1) {
                // need to refresh toolbar as it might be dynamic
                this.tooltipShow(id, event, true)
            }
            // event after
            this.trigger($.extend(edata, { phase: 'after' }))
        }
    }

    scroll(direction, line) {
        let scrollBox  = $(this.box).find(`.w2ui-tb-line:nth-child(${line}) .w2ui-scroll-wrapper`)
        let scrollLeft = scrollBox.scrollLeft()
        let $right     = $(scrollBox).find('.w2ui-tb-right')
        let width1     = scrollBox.outerWidth()
        let width2     = scrollLeft + parseInt($right.offset().left) + parseInt($right.width())
        let scroll

        switch (direction) {
            case 'left':
                scroll = scrollLeft - width1 + 50 // 35 is width of both button
                if (scroll <= 0) scroll = 0
                scrollBox.animate({ scrollLeft: scroll }, 300)
                break

            case 'right':
                scroll = scrollLeft + width1 - 50 // 35 is width of both button
                if (scroll >= width2 - width1) scroll = width2 - width1
                scrollBox.animate({ scrollLeft: scroll }, 300)
                break
        }
        setTimeout(() => { this.resize() }, 350)
    }

    render(box) {
        let time = (new Date()).getTime()
        // event before
        let edata = this.trigger({ phase: 'before', type: 'render', target: this.name, box: box })
        if (edata.isCancelled === true) return

        if (box != null) {
            if ($(this.box).find('.w2ui-scroll-wrapper .w2ui-tb-right').length > 0) {
                $(this.box)
                    .removeAttr('name')
                    .removeClass('w2ui-reset w2ui-toolbar')
                    .html('')
            }
            this.box = box
        }
        if (!this.box) return
        if (!Array.isArray(this.right)) {
            this.right = [this.right]
        }
        // render all buttons
        let html = ''
        let line = 0
        for (let i = 0; i < this.items.length; i++) {
            let it = this.items[i]
            if (it == null) continue
            if (it.id == null) it.id = 'item_' + i
            if (it.caption != null) {
                console.log('NOTICE: toolbar item.caption property is deprecated, please use item.text. Item -> ', it)
            }
            if (it.hint != null) {
                console.log('NOTICE: toolbar item.hint property is deprecated, please use item.tooltip. Item -> ', it)
            }
            if (i === 0 || it.type == 'new-line') {
                line++
                html += `
                    <div class="w2ui-tb-line">
                        <div class="w2ui-scroll-wrapper w2ui-action" data-mousedown="resize">
                            <div class="w2ui-tb-right">${this.right[line-1] || ''}</div>
                        </div>
                        <div class="w2ui-scroll-left w2ui-action" data-click='["scroll", "left", "${line}"]'></div>
                        <div class="w2ui-scroll-right w2ui-action" data-click='["scroll", "right", "${line}"]'></div>
                    </div>
                `
            }
            it.line = line
        }
        $(this.box)
            .attr('name', this.name)
            .addClass('w2ui-reset w2ui-toolbar')
            .html(html)
        if ($(this.box).length > 0) {
            $(this.box)[0].style.cssText += this.style
        }
        w2utils.bindEvents($(this.box).find('.w2ui-tb-line .w2ui-action'), this)
        // refresh all
        this.refresh()
        this.resize()
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
        return (new Date()).getTime() - time
    }

    refresh(id) {
        let time = (new Date()).getTime()
        // event before
        let edata = this.trigger({ phase: 'before', type: 'refresh', target: (id != null ? id : this.name), item: this.get(id) })
        if (edata.isCancelled === true) return
        let edata2
        // refresh all
        if (id == null) {
            for (let i = 0; i < this.items.length; i++) {
                let it1 = this.items[i]
                if (it1.id == null) it1.id = 'item_' + i
                this.refresh(it1.id)
            }
            return
        }
        // create or refresh only one item
        let it = this.get(id)
        if (it == null) return false
        if (typeof it.onRefresh == 'function') {
            edata2 = this.trigger({ phase: 'before', type: 'refresh', target: id, item: it, object: it })
            if (edata2.isCancelled === true) return
        }
        let el   = $(this.box).find(`#tb_${this.name}_item_${w2utils.escapeId(it.id)}`)
        let html = this.getItemHTML(it)
        // hide tooltip
        this.tooltipHide(id, {})

        // if there is a spacer, then right HTML is not 100%
        if (it.type == 'spacer') {
            $(this.box).find(`.w2ui-tb-line:nth-child(${it.line}`).find('.w2ui-tb-right').css('width', 'auto')
        }

        if (el.length === 0) {
            let next = parseInt(this.get(id, true)) + 1
            let $next = $(this.box).find(`#tb_${this.name}_item_${w2utils.escapeId(this.items[next] ? this.items[next].id : '')}`)
            if ($next.length == 0) {
                $next = $(this.box).find(`.w2ui-tb-line:nth-child(${it.line}`).find('.w2ui-tb-right').before(html)
            } else {
                $next.after(html)
            }
            w2utils.bindEvents(`#tb_${this.name}_item_${w2utils.escapeId(it.id)}`, this)
        } else {
            if (['menu', 'menu-radio', 'menu-check', 'drop', 'color', 'text-color'].indexOf(it.type) != -1) {
                let drop = $('#w2ui-overlay-'+ this.name)
                if (drop.length > 0) {
                    if (it.checked == false) {
                        drop[0].hide()
                    } else {
                        if (['menu', 'menu-radio', 'menu-check'].indexOf(it.type) != -1) {
                            drop.w2menu('refresh', { items: it.items })
                        }
                    }
                }
            }
            // refresh
            el.replaceWith($(html))
            if (it.hidden) { el.css('display', 'none') } else { el.css('display', '') }
            if (it.disabled) { el.addClass('disabled') } else { el.removeClass('disabled') }
            w2utils.bindEvents(`#tb_${this.name}_item_${w2utils.escapeId(it.id)}`, this)
        }
        // event after
        if (typeof it.onRefresh == 'function') {
            this.trigger($.extend(edata2, { phase: 'after' }))
        }
        this.trigger($.extend(edata, { phase: 'after' }))
        return (new Date()).getTime() - time
    }

    resize() {
        let time = (new Date()).getTime()
        // event before
        let edata = this.trigger({ phase: 'before', type: 'resize', target: this.name })
        if (edata.isCancelled === true) return

        $(this.box).find('.w2ui-tb-line').each((ind, el) => {
            // show hide overflow buttons
            let box = $(el)
            box.find('.w2ui-scroll-left, .w2ui-scroll-right').hide()
            let scrollBox  = box.find('.w2ui-scroll-wrapper')
            let $right     = $(box).find('.w2ui-tb-right')
            let boxWidth   = scrollBox.outerWidth()
            let itemsWidth = ($right.length > 0 ? $right[0].offsetLeft + $right[0].clientWidth : 0)
            let padding    = parseInt(box.css('padding-right'))
            if (boxWidth < itemsWidth - padding) {
                // we have overflown content
                if (scrollBox.scrollLeft() > 0) {
                    box.find('.w2ui-scroll-left').show()
                }
                let padding2 = parseInt(scrollBox.css('padding-right'))
                if (boxWidth < itemsWidth - scrollBox.scrollLeft() - padding - padding2) {
                    box.find('.w2ui-scroll-right').show()
                }
            }
        })
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
        return (new Date()).getTime() - time
    }

    destroy() {
        // event before
        let edata = this.trigger({ phase: 'before', type: 'destroy', target: this.name })
        if (edata.isCancelled === true) return
        // clean up
        if ($(this.box).find('.w2ui-scroll-wrapper  .w2ui-tb-right').length > 0) {
            $(this.box)
                .removeAttr('name')
                .removeClass('w2ui-reset w2ui-toolbar')
                .html('')
        }
        $(this.box).html('')
        delete w2ui[this.name]
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
    }

    // ========================================
    // --- Internal Functions

    getItemHTML(item) {
        let html = ''
        if (item.caption != null && item.text == null) item.text = item.caption // for backward compatibility
        if (item.text == null) item.text = ''
        if (item.tooltip == null && item.hint != null) item.tooltip = item.hint // for backward compatibility
        if (item.tooltip == null) item.tooltip = ''
        if (typeof item.get !== 'function' && (Array.isArray(item.items) || typeof item.items == 'function')) {
            item.get = function get(id) { // need scope, cannot be arrow func
                let tmp = item.items
                if (typeof tmp == 'function') tmp = item.items(item)
                return tmp.find(it => it.id == id ? true : false)
            }
        }
        let icon = ''
        let text = (typeof item.text == 'function' ? item.text.call(this, item) : item.text)
        if (item.icon) {
            icon = `<div class="w2ui-tb-icon">
                       <span class="${(typeof item.icon == 'function' ? item.icon.call(this, item) : item.icon)}"></span>
                   </div>`
        }
        switch (item.type) {
            case 'color':
            case 'text-color':
                if (typeof item.color == 'string') {
                    if (item.color.substr(0,1) == '#') item.color = item.color.substr(1)
                    if (item.color.length == 3 || item.color.length == 6) item.color = '#' + item.color
                }
                if (item.type == 'color') {
                    text = `<span class="w2ui-tb-color-box" style="background-color: ${(item.color != null ? item.color : '#fff')}"></span>
                           ${(item.text ? `<div style="margin-left: 17px;">${w2utils.lang(item.text, true)}</div>` : '')}`
                }
                if (item.type == 'text-color') {
                    text = '<span style="color: '+ (item.color != null ? item.color : '#444') +';">'+
                                (item.text ? w2utils.lang(item.text, true) : '<b>Aa</b>') +
                           '</span>'
                }
            case 'menu':
            case 'menu-check':
            case 'menu-radio':
            case 'button':
            case 'check':
            case 'radio':
            case 'drop':
                let arrow = item.arrow === true || (item.arrow !== false && ['menu', 'menu-radio', 'menu-check', 'drop', 'color', 'text-color'].indexOf(item.type) != -1)
                html = `
                    <div id="tb_${this.name}_item_${item.id}" style="${(item.hidden ? 'display: none' : '')}"
                        class="w2ui-tb-button${item.checked ? ' checked' : ''}${(item.class ? ' '+item.class : '')}${(item.disabled ? ' disabled' : '')}${(!icon ? ' no-icon' : '')}"
                        ${!item.disabled
                            ? `data-click='["click","${item.id}"]'
                               data-mouseenter='["mouseAction", "event", "this", "enter", "${item.id}"]'
                               data-mouseleave='["mouseAction", "event", "this", "leave", "${item.id}"]'
                               data-mousedown='["mouseAction", "event", "this", "down", "${item.id}"]'
                               data-mouseup='["mouseAction", "event", "this", "up", "${item.id}"]'`
                            : ''}
                    >
                        ${ icon }
                        ${ text != ''
                            ? `<div class="w2ui-tb-text" style="${(item.style ? item.style : '')}">
                                    ${ w2utils.lang(text, true) }
                                    ${ item.count != null
                                        ? `<span class="w2ui-tb-count"><span>${item.count}</span></span>`
                                        : ''
                                    }
                                    ${ arrow
                                        ? '<span class="w2ui-tb-down"><span></span></span>'
                                        : ''
                                    }
                                </div>`
                            : ''}
                    </div>
                `
                break

            case 'break':
                html = `<div id="tb_${this.name}_item_${item.id}" class="w2ui-tb-break">&#160;</div>`
                break

            case 'spacer':
                html = `<div id="tb_${this.name}_item_${item.id}" class="w2ui-tb-spacer"></div>`
                break

            case 'html':
                html = `<div id="tb_${this.name}_item_${item.id}" class="w2ui-tb-html">${(typeof item.html == 'function' ? item.html.call(this, item) : item.html)}</div>`
                break
        }
        return html
    }

    tooltipShow(id, event, forceRefresh) {
        if (this.tooltip == null) return
        let $el  = $(this.box).find('#tb_'+ this.name + '_item_'+ w2utils.escapeId(id))
        let item = this.get(id)
        let pos  = this.tooltip
        let txt  = item.tooltip
        if (typeof txt == 'function') txt = txt.call(this, item)
        clearTimeout(this._tooltipTimer)
        this._tooltipTimer = setTimeout(() => {
            if ($el.prop('_mouse_tooltip') !== true) {
                $el.prop('_mouse_tooltip', true)
                // show tooltip
                if (['menu', 'menu-radio', 'menu-check', 'drop', 'color', 'text-color'].indexOf(item.type) != -1 && item.checked == true) return // not for opened drop downs
                $el.w2tag(w2utils.lang(txt, true), { position: pos })
            }
        }, 0)
        // refresh only
        if ($el.prop('_mouse_tooltip') && forceRefresh == true) {
            $el.w2tag(w2utils.lang(txt, true), { position: pos })
        }
    }

    tooltipHide(id, event) {
        if (this.tooltip == null) return
        let $el = $(this.box).find('#tb_'+ this.name + '_item_'+ w2utils.escapeId(id))
        clearTimeout(this._tooltipTimer)
        setTimeout(() => {
            if ($el.prop('_mouse_tooltip') === true) {
                $el.removeProp('_mouse_tooltip')
                // hide tooltip
                $el.w2tag()
            }
        }, 1)
    }

    menuClick(event) {
        let obj = this
        if (event.item && !event.item.disabled) {
            // event before
            let edata = this.trigger({ phase: 'before', type: (event.remove !== true ? 'click' : 'remove'), target: event.item.id + ':' + event.subItem.id, item: event.item,
                subItem: event.subItem, originalEvent: event.originalEvent })
            if (edata.isCancelled === true) return

            // route processing
            let it    = event.subItem
            let item  = this.get(event.item.id)
            let items = item.items
            if (typeof items == 'function') items = item.items()
            if (item.type == 'menu-radio') {
                item.selected = it.id
                if (Array.isArray(items)) {
                    items.forEach((item) => {
                        if (item.checked === true) delete item.checked
                        if (Array.isArray(item.items)) {
                            item.items.forEach((item) => {
                                if (item.checked === true) delete item.checked
                            })
                        }
                    })
                }
                it.checked = true
            }
            if (item.type == 'menu-check') {
                if (!Array.isArray(item.selected)) item.selected = []
                if (it.group == null) {
                    let ind = item.selected.indexOf(it.id)
                    if (ind == -1) {
                        item.selected.push(it.id)
                        it.checked = true
                    } else {
                        item.selected.splice(ind, 1)
                        it.checked = false
                    }
                } else if (it.group === false) {
                    // if group is false, then it is not part of checkboxes
                } else {
                    let unchecked = [];
                    // recursive
                    (function checkNested(items) {
                        items.forEach((sub) => {
                            if (sub.group === it.group) {
                                let ind = item.selected.indexOf(sub.id)
                                if (ind != -1) {
                                    if (sub.id != it.id) unchecked.push(sub.id)
                                    item.selected.splice(ind, 1)
                                }
                            }
                            if (Array.isArray(sub.items)) checkNested(sub.items)
                        })
                    })(items)
                    let ind = item.selected.indexOf(it.id)
                    if (ind == -1) {
                        item.selected.push(it.id)
                        it.checked = true
                    }
                }
            }
            if (typeof it.route == 'string') {
                let route = it.route !== '' ? String('/'+ it.route).replace(/\/{2,}/g, '/') : ''
                let info  = w2utils.parseRoute(route)
                if (info.keys.length > 0) {
                    for (let k = 0; k < info.keys.length; k++) {
                        if (obj.routeData[info.keys[k].name] == null) continue
                        route = route.replace((new RegExp(':'+ info.keys[k].name, 'g')), this.routeData[info.keys[k].name])
                    }
                }
                setTimeout(() => { window.location.hash = route }, 1)
            }
            this.refresh(event.item.id)
            // event after
            this.trigger($.extend(edata, { phase: 'after' }))
        }
    }

    colorClick(event) {
        let obj = this
        if (event.item && !event.item.disabled) {
            // event before
            let edata = this.trigger({ phase: 'before', type: 'click', target: event.item.id, item: event.item,
                color: event.color, final: event.final, originalEvent: event.originalEvent })
            if (edata.isCancelled === true) return

            // default behavior
            event.item.color = event.color
            obj.refresh(event.item.id)

            // event after
            this.trigger($.extend(edata, { phase: 'after' }))
        }
    }

    mouseAction(event, target, action, id) {
        let btn = this.get(id)
        if (btn.disabled || btn.hidden) return
        switch (action) {
            case 'enter':
                $(target).addClass('over')
                this.tooltipShow(id, event)
                break
            case 'leave':
                $(target).removeClass('over').removeClass('down')
                this.tooltipHide(id, event)
                break
            case 'down':
                $(target).addClass('down')
                break
            case 'up':
                $(target).removeClass('down')
                break
        }
    }
}
export { w2toolbar }