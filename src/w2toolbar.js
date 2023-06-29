/**
 * Part of w2ui 2.0 library
 *  - Dependencies: mQuery, w2utils, w2base, w2tooltip, w2color, w2menu
 *
 * == TODO ==
 *  - tab navigation (index state)
 *  - vertical toolbar
 *  - w2menu on second click of tb button should hide
 *  - button display groups for each show/hide, possibly add state: { single: t/f, multiple: t/f, type: 'font' }
 *  - item.count - should just support html, so a custom block can be created, such as a colored line
 *
 * == 2.0 changes
 *  - CSP - fixed inline events
 *  - removed jQuery dependency
 *  - item.icon - can be class or <custom-icon-component> or <svg>
 *  - new w2tooltips and w2menu
 *  - scroll returns promise
 *  - added onMouseEntter, onMouseLeave, onMouseDown, onMouseUp events
 *  - add(..., skipRefresh), insert(..., skipRefresh)
 *  - item.items can be a function
 *  - item.icon_style - style for the icon
 *  - item.icon - can be a function
 */

import { w2base } from './w2base.js'
import { w2ui, w2utils } from './w2utils.js'
import { query } from './query.js'
import { w2tooltip, w2color, w2menu } from './w2tooltip.js'

class w2toolbar extends w2base {
    constructor(options) {
        super(options.name)
        this.box           = null // DOM Element that holds the element
        this.name          = null // unique name for w2ui
        this.routeData     = {} // data for dynamic routes
        this.items         = []
        this.right         = '' // HTML text on the right of toolbar
        this.tooltip       = 'top|left'// can be top, bottom, left, right
        this.onClick       = null
        this.onMouseDown   = null
        this.onMouseUp     = null
        this.onMouseEnter  = null // mouse enter the button event
        this.onMouseLeave  = null
        this.onRender      = null
        this.onRefresh     = null
        this.onResize      = null
        this.onDestroy     = null
        this.item_template = {
            id: null, // command to be sent to all event handlers
            type: 'button', // button, check, radio, drop, menu, menu-radio, menu-check, break, html, spacer
            text: null,
            html: '',
            tooltip: null,  // w2toolbar.tooltip should be
            count: null,
            hidden: false,
            disabled: false,
            checked: false, // used for radio buttons
            icon: null,
            route: null,    // if not null, it is route to go
            arrow: null,    // arrow down for drop/menu types
            style: null,    // extra css style for caption
            group: null,    // used for radio buttons
            items: null,    // for type menu* it is an array of items in the menu
            selected: null, // used for menu-check, menu-radio
            color: null,    // color value - used in color pickers
            overlay: {      // additional options for overlay
                anchorClass: ''
            },
            onClick: null,
            onRefresh: null
        }
        this.last = {
            badge: {}
        }
        // mix in options, w/o items
        let items = options.items
        delete options.items
        Object.assign(this, options)
        // add item via method to makes sure item_template is applied
        if (Array.isArray(items)) this.add(items, true)
        // need to reassign back to keep it in config
        options.items = items

        // render if box specified
        if (typeof this.box == 'string') this.box = query(this.box).get(0)
        if (this.box) this.render(this.box)
    }

    add(items, skipRefresh) {
        this.insert(null, items, skipRefresh)
    }

    insert(id, items, skipRefresh) {
        if (!Array.isArray(items)) items = [items]
        items.forEach((item, idx, arr) => {
            if (typeof item === 'string') {
                item = arr[idx] = { id: item, text: item }
            }
            // checks
            let valid = ['button', 'check', 'radio', 'drop', 'menu', 'menu-radio', 'menu-check', 'color', 'text-color', 'html',
                'break', 'spacer', 'new-line']
            if (!valid.includes(String(item.type))) {
                console.log('ERROR: The parameter "type" should be one of the following:', valid, `, but ${item.type} is supplied.`, item)
                return
            }
            if (item.id == null && !['break', 'spacer', 'new-line'].includes(item.type)) {
                console.log('ERROR: The parameter "id" is required but not supplied.', item)
                return
            }
            if (item.type == null) {
                console.log('ERROR: The parameter "type" is required but not supplied.', item)
                return
            }
            if (!w2utils.checkUniqueId(item.id, this.items, 'toolbar', this.name)) return
            // add item
            let newItem = w2utils.extend({}, this.item_template, item)
            if (newItem.type == 'menu-check') {
                if (!Array.isArray(newItem.selected)) newItem.selected = []
                if (Array.isArray(newItem.items)) {
                    newItem.items.forEach(it => {
                        if (typeof it === 'string') {
                            it = arr[idx] = { id: it, text: it }
                        }
                        if (it.checked && !newItem.selected.includes(it.id)) newItem.selected.push(it.id)
                        if (!it.checked && newItem.selected.includes(it.id)) it.checked = true
                        if (it.checked == null) it.checked = false
                    })
                }
            } else if (newItem.type == 'menu-radio') {
                if (Array.isArray(newItem.items)) {
                    newItem.items.forEach((it, idx, arr) => {
                        if (typeof it === 'string') {
                            it = arr[idx] = { id: it, text: it }
                        }
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
            newItem.line = newItem.line ?? 1
            if (skipRefresh !== true) this.refresh(newItem.id)
        })
        if (skipRefresh !== true) this.resize()
    }

    remove() {
        let effected = 0
        Array.from(arguments).forEach(item => {
            let it = this.get(item)
            if (!it || String(item).indexOf(':') != -1) return
            effected++
            // remove from screen
            query(this.box).find('#tb_'+ this.name +'_item_'+ w2utils.escapeId(it.id)).remove()
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
            if (['menu', 'menu-radio', 'menu-check'].includes(it.type) && tmp.length == 2 && it.id == tmp[0]) {
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

    setCount(id, count, className, style) {
        let btn = query(this.box).find(`#tb_${this.name}_item_${w2utils.escapeId(id)} .w2ui-tb-count > span`)
        if (btn.length > 0) {
            btn.removeClass()
                .addClass(className ?? '')
                .text(count)
                .get(0).style.cssText = style ?? ''
            this.last.badge[id] = {
                className: className ?? '',
                style: style ?? ''
            }
            let item = this.get(id)
            item.count = count
        } else {
            this.set(id, { count: count })
            this.setCount(...arguments) // to update styles
        }
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
        let effected = []
        Array.from(arguments).forEach(item => {
            let it = this.get(item)
            if (!it || String(item).indexOf(':') != -1) return
            // remove overlay
            if (['menu', 'menu-radio', 'menu-check', 'drop', 'color', 'text-color'].includes(it.type) && it.checked) {
                w2tooltip.hide(this.name + '-drop')
            }
            it.checked = false
            effected.push(String(item).split(':')[0])
        })
        setTimeout(() => { effected.forEach(it => { this.refresh(it) }) }, 15) // needs timeout
        return effected
    }

    click(id, event) {
        // click on menu items
        let tmp   = String(id).split(':')
        let it    = this.get(tmp[0])
        let items = (it && it.items ? w2utils.normMenu.call(this, it.items, it) : [])

        if (tmp.length > 1) {
            let subItem = this.get(id)
            if (subItem && !subItem.disabled) {
                this.menuClick({ name: this.name, item: it, subItem: subItem, originalEvent: event })
            }
            return
        }
        if (it && !it.disabled) {
            // event before
            let edata = this.trigger('click', {
                target: (id != null ? id : this.name),
                item: it, object: it, originalEvent: event
            })
            if (edata.isCancelled === true) return
            // read items again, they might have been changed in the click event handler
            items = (it && it.items ? w2utils.normMenu.call(this, it.items, it) : [])

            let btn = '#tb_'+ this.name +'_item_'+ w2utils.escapeId(it.id)
            query(this.box).find(btn).removeClass('down') // need to re-query at the moment -- as well as elsewhere in this function

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
                query(this.box).find(btn).addClass('checked')
            }

            if (['menu', 'menu-radio', 'menu-check', 'drop', 'color', 'text-color'].includes(it.type)) {
                this.tooltipHide(id)
                if (it.checked) {
                    w2tooltip.hide(this.name + '-drop')
                    return
                } else {
                    // timeout is needed to make sure previous overlay hides
                    setTimeout(() => {
                        let hideDrop = (id, btn) => {
                            // need a closure to capture id variable
                            let self = this
                            return function () {
                                self.set(id, { checked: false })
                            }
                        }
                        let el = query(this.box).find('#tb_'+ this.name +'_item_'+ w2utils.escapeId(it.id))
                        if (!w2utils.isPlainObject(it.overlay)) it.overlay = {}
                        if (it.type == 'drop') {
                            w2tooltip.show(w2utils.extend({
                                html: it.html,
                                class: 'w2ui-white',
                                hideOn: ['doc-click']
                            }, it.overlay, {
                                anchor: el[0],
                                name: this.name + '-drop',
                                data: { item: it, btn }
                            }))
                            .hide(hideDrop(it.id, btn))
                        }
                        if (['menu', 'menu-radio', 'menu-check'].includes(it.type)) {
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
                                    if (Array.isArray(it.selected) && it.selected.includes(item.id)) item.checked = true; else item.checked = false
                                })
                            }
                            w2menu.show(w2utils.extend({
                                items,
                                align: it.text ? 'left' : 'none', // if there is no text, then no alignent
                            }, it.overlay, {
                                type: menuType,
                                name : this.name + '-drop',
                                anchor: el[0],
                                data: { item: it, btn }
                            }))
                                .hide(hideDrop(it.id, btn))
                                .remove(event => {
                                    this.menuClick({ name: this.name, remove: true, item: it, subItem: event.detail.item,
                                        originalEvent: event })
                                })
                                .select(event => {
                                    this.menuClick({ name: this.name, item: it, subItem: event.detail.item,
                                        originalEvent: event })
                                })
                        }
                        if (['color', 'text-color'].includes(it.type)) {
                            w2color.show(w2utils.extend({
                                color: it.color
                            }, it.overlay, {
                                anchor: el[0],
                                name: this.name + '-drop',
                                data: { item: it, btn }
                            }))
                                .hide(hideDrop(it.id, btn))
                                .select(event => {
                                    if (event.detail.color != null) {
                                        this.colorClick({ name: this.name, item: it, color: event.detail.color })
                                    }
                                })
                        }
                    }, 0)
                }
            }

            if (['check', 'menu', 'menu-radio', 'menu-check', 'drop', 'color', 'text-color'].includes(it.type)) {
                it.checked = !it.checked
                if (it.checked) {
                    query(this.box).find(btn).addClass('checked')
                } else {
                    query(this.box).find(btn).removeClass('checked')
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
            // need to refresh toolbar as it might be dynamic
            this.tooltipShow(id)
            // event after
            edata.finish()
        }
    }

    scroll(direction, line, instant) {
        return new Promise((resolve, reject) => {
            let scrollBox  = query(this.box).find(`.w2ui-tb-line:nth-child(${line}) .w2ui-scroll-wrapper`)
            let scrollLeft = scrollBox.get(0).scrollLeft
            let right      = scrollBox.find('.w2ui-tb-right').get(0)
            let width1     = scrollBox.parent().get(0).getBoundingClientRect().width
            let width2     = scrollLeft + parseInt(right.offsetLeft) + parseInt(right.clientWidth )

            switch (direction) {
                case 'left': {
                    scroll = scrollLeft - width1 + 50 // 35 is width of both button
                    if (scroll <= 0) scroll = 0
                    scrollBox.get(0).scrollTo({ top: 0, left: scroll, behavior: instant ? 'atuo' : 'smooth' })
                    break
                }
                case 'right': {
                    scroll = scrollLeft + width1 - 50 // 35 is width of both button
                    if (scroll >= width2 - width1) scroll = width2 - width1
                    scrollBox.get(0).scrollTo({ top: 0, left: scroll, behavior: instant ? 'atuo' : 'smooth' })
                    break
                }
            }
            setTimeout(() => { this.resize(); resolve() }, instant ? 0 : 500)
        })
    }

    render(box) {
        let time = Date.now()
        if (typeof box == 'string') box = query(box).get(0)
        // event before
        let edata = this.trigger('render', { target: this.name, box: box ?? this.box })
        if (edata.isCancelled === true) return
        // defaul action
        if (box != null) {
            // clean previous box
            if (query(this.box).find('.w2ui-scroll-wrapper .w2ui-tb-right').length > 0) {
                query(this.box)
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
                        <div class="w2ui-scroll-wrapper w2ui-eaction" data-mousedown="resize">
                            <div class="w2ui-tb-right">${this.right[line-1] ?? ''}</div>
                        </div>
                        <div class="w2ui-scroll-left w2ui-eaction" data-click='["scroll", "left", "${line}"]'></div>
                        <div class="w2ui-scroll-right w2ui-eaction" data-click='["scroll", "right", "${line}"]'></div>
                    </div>
                `
            }
            it.line = line
        }
        query(this.box)
            .attr('name', this.name)
            .addClass('w2ui-reset w2ui-toolbar')
            .html(html)
        if (query(this.box).length > 0) {
            query(this.box)[0].style.cssText += this.style
        }
        w2utils.bindEvents(query(this.box).find('.w2ui-tb-line .w2ui-eaction'), this)
        // observe div resize
        this.last.observeResize = new ResizeObserver(() => { this.resize() })
        this.last.observeResize.observe(this.box)
        // refresh all
        this.refresh()
        this.resize()
        // event after
        edata.finish()
        return Date.now() - time
    }

    refresh(id) {
        let time = Date.now()
        // event before
        let edata = this.trigger('refresh', { target: (id != null ? id : this.name), item: this.get(id) })
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
            edata2 = this.trigger('refresh', { target: id, item: it, object: it })
            if (edata2.isCancelled === true) return
        }
        let selector = `#tb_${this.name}_item_${w2utils.escapeId(it.id)}`
        let btn  = query(this.box).find(selector)
        let html = this.getItemHTML(it)
        // hide tooltip
        this.tooltipHide(id)

        // if there is a spacer, then right HTML is not 100%
        if (it.type == 'spacer') {
            query(this.box).find(`.w2ui-tb-line:nth-child(${it.line}`).find('.w2ui-tb-right').css('width', 'auto')
        }

        if (btn.length === 0) {
            let next = parseInt(this.get(id, true)) + 1
            let $next = query(this.box).find(`#tb_${this.name}_item_${w2utils.escapeId(this.items[next] ? this.items[next].id : '')}`)
            if ($next.length == 0) {
                $next = query(this.box).find(`.w2ui-tb-line:nth-child(${it.line}`).find('.w2ui-tb-right').before(html)
            } else {
                $next.after(html)
            }
            w2utils.bindEvents(query(this.box).find(selector), this)
        } else {
            // refresh
            query(this.box).find(selector).replace(query.html(html))
            let newBtn = query(this.box).find(selector).get(0)
            w2utils.bindEvents(newBtn, this)
            // update overlay's anchor if changed
            let overlays = w2tooltip.get(true)
            Object.keys(overlays).forEach(key => {
                if (overlays[key].anchor == btn.get(0)) {
                    overlays[key].anchor = newBtn
                }
            })
        }
        if (['menu', 'menu-radio', 'menu-check'].includes(it.type) && it.checked) {
            // check selected items
            let selected = Array.isArray(it.selected) ? it.selected : [it.selected]
            let items = typeof it.items == 'function' ? it.items(it) : [...it.items]
            items.forEach((item) => {
                if (selected.includes(item.id)) item.checked = true; else item.checked = false
            })
            w2menu.update(this.name + '-drop', items)
        }
        // event after
        if (typeof it.onRefresh == 'function') {
            edata2.finish()
        }
        edata.finish()
        return Date.now() - time
    }

    resize() {
        let time = Date.now()
        // event before
        let edata = this.trigger('resize', { target: this.name })
        if (edata.isCancelled === true) return

        query(this.box).find('.w2ui-tb-line').each(el => {
            // show hide overflow buttons
            let box = query(el)
            box.find('.w2ui-scroll-left, .w2ui-scroll-right').hide()
            let scrollBox  = box.find('.w2ui-scroll-wrapper').get(0)
            let $right     = box.find('.w2ui-tb-right')
            let boxWidth   = box.get(0).getBoundingClientRect().width
            let right  = $right[0].getBoundingClientRect()
            let itemsWidth = ($right.length > 0 ? right.width : 0)
            if (boxWidth < itemsWidth) {
                // we have overflown content
                if (scrollBox.scrollLeft > 0) {
                    box.find('.w2ui-scroll-left').show()
                }
                if (boxWidth < itemsWidth - scrollBox.scrollLeft) {
                    box.find('.w2ui-scroll-right').show()
                }
            }
        })
        // event after
        edata.finish()
        return Date.now() - time
    }

    destroy() {
        // event before
        let edata = this.trigger('destroy', { target: this.name })
        if (edata.isCancelled === true) return
        // clean up
        if (query(this.box).find('.w2ui-scroll-wrapper  .w2ui-tb-right').length > 0) {
            query(this.box)
                .removeAttr('name')
                .removeClass('w2ui-reset w2ui-toolbar')
                .html('')
        }
        query(this.box).html('')
        this.last.observeResize?.disconnect()
        delete w2ui[this.name]
        // event after
        edata.finish()
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
            icon = item.icon
            if (typeof item.icon == 'function') {
                icon = item.icon.call(this, item)
            }
            if (String(icon).slice(0, 1) !== '<') {
                icon = `<span class="${icon}" ${item.icon_style ? `style="${item.icon_style}"` : ''}></span>`
            }
            icon = `<div class="w2ui-tb-icon">${icon}</div>`
        }
        let classes = ['w2ui-tb-button']
        if (item.checked) classes.push('checked')
        if (item.disabled) classes.push('disabled')
        if (item.hidden) classes.push('hidden')
        if (!icon) classes.push('no-icon')

        switch (item.type) {
            case 'color':
            case 'text-color':
                if (typeof item.color == 'string') {
                    if (item.color.slice(0, 1) == '#') item.color = item.color.slice(1)
                    if ([3, 6, 8].includes(item.color.length)) item.color = '#' + item.color
                }
                if (item.type == 'color') {
                    text = `<span class="w2ui-tb-color-box" style="background-color: ${(item.color != null ? item.color : '#fff')}"></span>
                           ${(item.text ? `<div style="margin-left: 17px;">${w2utils.lang(item.text)}</div>` : '')}`
                }
                if (item.type == 'text-color') {
                    text = '<span style="color: '+ (item.color != null ? item.color : '#444') +';">'+
                                (item.text ? w2utils.lang(item.text) : '<b>Aa</b>') +
                           '</span>'
                }
            case 'menu':
            case 'menu-check':
            case 'menu-radio':
            case 'button':
            case 'check':
            case 'radio':
            case 'drop': {
                let arrow = (item.arrow === true
                    || (item.arrow !== false && ['menu', 'menu-radio', 'menu-check', 'drop', 'color', 'text-color'].includes(item.type)))
                html = `
                    <div id="tb_${this.name}_item_${item.id}" style="${(item.hidden ? 'display: none' : '')}"
                        class="${classes.join(' ')} ${(item.class ? item.class : '')}"
                        ${!item.disabled
                            ? `data-click='["click","${item.id}"]'
                               data-mouseenter='["mouseAction", "event", "this", "Enter", "${item.id}"]'
                               data-mouseleave='["mouseAction", "event", "this", "Leave", "${item.id}"]'
                               data-mousedown='["mouseAction", "event", "this", "Down", "${item.id}"]'
                               data-mouseup='["mouseAction", "event", "this", "Up", "${item.id}"]'`
                            : ''}
                    >
                        ${ icon }
                        ${ (text != '' && text != null) || item.count != null || arrow
                            ? `<div class="w2ui-tb-text" style="${(item.style ?? '')}; ${!text ? 'padding-left: 0; margin-left: 23px;' : ''}">
                                    ${ w2utils.lang(text) }
                                    ${ item.count != null
                                        ? w2utils.stripSpaces(`
                                            <span class="w2ui-tb-count">
                                                <span class="${this.last.badge[item.id] ? this.last.badge[item.id].className ?? '' : ''}"
                                                        style="${this.last.badge[item.id] ? this.last.badge[item.id].style ?? '' : ''}">${item.count}</span>
                                            </span>`)
                                        : ''
                                    }
                                    ${ arrow
                                        ? `<span class="w2ui-tb-down" ${!text && !item.count ? 'style="margin-left: -3px"' : ''}><span></span></span>`
                                        : ''
                                    }
                                </div>`
                            : ''
                        }
                    </div>
                `
                break
            }

            case 'break':
                html = `<div id="tb_${this.name}_item_${item.id}" class="w2ui-tb-break"
                            style="${(item.hidden ? 'display: none' : '')}; ${(item.style ? item.style : '')}">
                            &#160;
                        </div>`
                break

            case 'spacer':
                html = `<div id="tb_${this.name}_item_${item.id}" class="w2ui-tb-spacer"
                            style="${(item.hidden ? 'display: none' : '')}; ${(item.style ? item.style : '')}">
                        </div>`
                break

            case 'html':
                html = `<div id="tb_${this.name}_item_${item.id}" class="w2ui-tb-html ${classes.join(' ')}"
                            style="${(item.hidden ? 'display: none' : '')}; ${(item.style ? item.style : '')}">
                            ${(typeof item.html == 'function' ? item.html.call(this, item) : item.html)}
                        </div>`
                break
        }
        return html
    }

    tooltipShow(id) {
        if (this.tooltip == null) return
        let el   = query(this.box).find('#tb_'+ this.name + '_item_'+ w2utils.escapeId(id)).get(0)
        let item = this.get(id)
        let overlay = (typeof this.tooltip == 'string' ? { position: this.tooltip } : this.tooltip)
        let txt  = item.tooltip
        if (typeof txt == 'function') txt = txt.call(this, item)
        // not for opened drop downs
        if (['menu', 'menu-radio', 'menu-check', 'drop', 'color', 'text-color'].includes(item.type)
            && item.checked == true) {
            return
        }
        w2tooltip.show({
            anchor: el,
            name: this.name + '-tooltip',
            html: txt,
            ...overlay
        })
        return
    }

    tooltipHide(id) {
        if (this.tooltip == null) return
        w2tooltip.hide(this.name + '-tooltip')
    }

    menuClick(event) {
        if (event.item && !event.item.disabled) {
            // event before
            let edata = this.trigger((event.remove !== true ? 'click' : 'remove'), {
                target: event.item.id + ':' + event.subItem.id, item: event.item,
                subItem: event.subItem, originalEvent: event.originalEvent
            })
            if (edata.isCancelled === true) return

            // route processing
            let it    = event.subItem
            let item  = this.get(event.item.id)
            let items = item.items
            if (typeof items == 'function') items = item.items()
            if (item.type == 'menu') {
                item.selected = it.id
            }
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
                    let unchecked = []
                    let ind = item.selected.indexOf(it.id)
                    let checkNested = (items) => {
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
                    }
                    checkNested(items)
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
                        if (this.routeData[info.keys[k].name] == null) continue
                        route = route.replace((new RegExp(':'+ info.keys[k].name, 'g')), this.routeData[info.keys[k].name])
                    }
                }
                setTimeout(() => { window.location.hash = route }, 1)
            }
            this.refresh(event.item.id)
            // event after
            edata.finish()
        }
    }

    colorClick(event) {
        let obj = this
        if (event.item && !event.item.disabled) {
            // event before
            let edata = this.trigger('click', { target: event.item.id, item: event.item, color: event.color, final: true })
            if (edata.isCancelled === true) return

            // default behavior
            event.item.color = event.color
            obj.refresh(event.item.id)

            // event after
            edata.finish()
        }
    }

    mouseAction(event, target, action, id) {
        let btn = this.get(id)
        let edata = this.trigger('mouse' + action, { target: id, item: btn, object: btn, originalEvent: event })
        if (edata.isCancelled === true || btn.disabled || btn.hidden) return
        switch (action) {
            case 'Enter':
                query(target).addClass('over')
                this.tooltipShow(id)
                break
            case 'Leave':
                query(target).removeClass('over down')
                this.tooltipHide(id)
                break
            case 'Down':
                query(target).addClass('down')
                break
            case 'Up':
                query(target).removeClass('down')
                break
        }
        edata.finish()
    }
}
export { w2toolbar }