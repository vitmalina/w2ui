/************************************************************************
*   Part of w2ui 2.0 library
*   - Dependencies: jQuery, w2utils
*
* == TODO ==
*   - vertical toolbar
*   - refactor w/o <table>
*
* == 2.0 changes
*   - w2toolbar.item => w2toolbar.item_template
*   - show/hide, enable/disable, check/uncheck - return array of effected items
*
************************************************************************/
import { w2event } from './w2event.js'
import { w2utils } from './w2utils.js'

class w2toolbar extends w2event {
    constructor(options) {
        super(options.name)
        this.box = null // DOM Element that holds the element
        this.name = null // unique name for w2ui
        this.routeData = {} // data for dynamic routes
        this.items = []
        this.right = '' // HTML text on the right of toolbar
        this.tooltip = 'top|left'// can be top, bottom, left, right
        this.onClick = null
        this.onRender = null
        this.onRefresh = null
        this.onResize = null
        this.onDestroy = null
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
            img: null,
            icon: null,
            route: null, // if not null, it is route to go
            arrow: true, // arrow down for drop/menu types
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
        let items = options.items
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
                this.items = this.items.slice(0, middle).concat([netItem], this.items.slice(middle))
            }
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
        let tmp = String(id).split(':')
        let it = this.get(tmp[0])
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

            let btn = '#tb_'+ this.name +'_item_'+ w2utils.escapeId(it.id) +' table.w2ui-button'
            $(btn).removeClass('down') // need to requery at the moment -- as well as elsewhere in this function

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
                let info = w2utils.parseRoute(route)
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

    scroll(direction) {
        let box = $(this.box)
        let obj = this
        let scrollBox = box.find('.w2ui-scroll-wrapper')
        let scrollLeft = scrollBox.scrollLeft()
        let width1, width2, scroll

        switch (direction) {
            case 'left':
                width1 = scrollBox.outerWidth()
                width2 = scrollBox.find(':first').outerWidth()
                scroll = scrollLeft - width1 + 50 // 35 is width of both button
                if (scroll <= 0) scroll = 0
                scrollBox.animate({ scrollLeft: scroll }, 300)
                break

            case 'right':
                width1 = scrollBox.outerWidth()
                width2 = scrollBox.find(':first').outerWidth()
                scroll = scrollLeft + width1 - 50 // 35 is width of both button
                if (scroll >= width2 - width1) scroll = width2 - width1
                scrollBox.animate({ scrollLeft: scroll }, 300)
                break
        }
        setTimeout(() => { obj.resize() }, 350)
    }

    render(box) {
        let time = (new Date()).getTime()
        // event before
        let edata = this.trigger({ phase: 'before', type: 'render', target: this.name, box: box })
        if (edata.isCancelled === true) return

        if (box != null) {
            if ($(this.box).find('> table #tb_'+ this.name + '_right').length > 0) {
                $(this.box)
                    .removeAttr('name')
                    .removeClass('w2ui-reset w2ui-toolbar')
                    .html('')
            }
            this.box = box
        }
        if (!this.box) return
        // render all buttons
        let html = '<div class="w2ui-scroll-wrapper" onmousedown="var el=w2ui[\''+ this.name +'\']; if (el) el.resize();">'+
                   '<table cellspacing="0" cellpadding="0" width="100%"><tbody>'+
                   '<tr>'
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
            if (it.type == 'spacer') {
                html += '<td width="100%" id="tb_'+ this.name +'_item_'+ it.id +'" align="right"></td>'
            } else if (it.type == 'new-line') {
                html += '<td width="100%"></td></tr></tbody></table>'
                     + '<div class="w2ui-toolbar-new-line"></div>'
                     + '<table cellspacing="0" cellpadding="0" width="100%"><tbody><tr>'

            } else {
                html += '<td id="tb_'+ this.name + '_item_'+ it.id +'" style="'+ (it.hidden ? 'display: none' : '') +'" '+
                        '    class="'+ (it.disabled ? 'disabled' : '') +'" valign="middle">'+
                        '</td>'
            }
        }
        html += '<td width="100%" id="tb_'+ this.name +'_right" align="right">'+ this.right +'</td>'
        html += '</tr>'+
                '</tbody></table></div>'+
                '<div class="w2ui-scroll-left" onclick="var el=w2ui[\''+ this.name +'\']; if (el) el.scroll(\'left\');"></div>'+
                '<div class="w2ui-scroll-right" onclick="var el=w2ui[\''+ this.name +'\']; if (el) el.scroll(\'right\');"></div>'
        $(this.box)
            .attr('name', this.name)
            .addClass('w2ui-reset w2ui-toolbar')
            .html(html)
        if ($(this.box).length > 0) $(this.box)[0].style.cssText += this.style
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
        let el = $(this.box).find('#tb_'+ this.name +'_item_'+ w2utils.escapeId(it.id))
        let html = this.getItemHTML(it)
        // hide tooltip
        this.tooltipHide(id, {})

        if (el.length === 0) {
            // does not exist - create it
            if (it.type == 'spacer') {
                html = '<td width="100%" id="tb_'+ this.name +'_item_'+ it.id +'" align="right"></td>'
            } else {
                html = '<td id="tb_'+ this.name + '_item_'+ it.id +'" style="'+ (it.hidden ? 'display: none' : '') +'" '+
                    '    class="'+ (it.disabled ? 'disabled' : '') +'" valign="middle">'+ html +
                    '</td>'
            }
            if (this.get(id, true) == this.items.length-1) {
                $(this.box).find('#tb_'+ this.name +'_right').before(html)
            } else {
                $(this.box).find('#tb_'+ this.name +'_item_'+ w2utils.escapeId(this.items[parseInt(this.get(id, true))+1].id)).before(html)
            }
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
            el.html(html)
            if (it.hidden) { el.css('display', 'none') } else { el.css('display', '') }
            if (it.disabled) { el.addClass('disabled') } else { el.removeClass('disabled') }
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

        // show hide overflow buttons
        let box = $(this.box)
        box.find('.w2ui-scroll-left, .w2ui-scroll-right').hide()
        let scrollBox = box.find('.w2ui-scroll-wrapper')
        if (scrollBox.find(':first').outerWidth() > scrollBox.outerWidth()) {
            // we have overflowed content
            if (scrollBox.scrollLeft() > 0) {
                box.find('.w2ui-scroll-left').show()
            }
            if (scrollBox.scrollLeft() < scrollBox.find(':first').outerWidth() - scrollBox.outerWidth()) {
                box.find('.w2ui-scroll-right').show()
            }
        }

        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
        return (new Date()).getTime() - time
    }

    destroy() {
        // event before
        let edata = this.trigger({ phase: 'before', type: 'destroy', target: this.name })
        if (edata.isCancelled === true) return
        // clean up
        if ($(this.box).find('> table #tb_'+ this.name + '_right').length > 0) {
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
        let img = '<td>&#160;</td>'
        let text = (typeof item.text == 'function' ? item.text.call(this, item) : item.text)
        if (item.img) img = '<td><div class="w2ui-tb-image w2ui-icon '+ item.img +'"></div></td>'
        if (item.icon) {
            img = '<td><div class="w2ui-tb-image"><span class="'+
                (typeof item.icon == 'function' ? item.icon.call(this, item) : item.icon) +'"></span></div></td>'
        }
        if (html === '') switch (item.type) {
            case 'color':
            case 'text-color':
                if (typeof item.color == 'string') {
                    if (item.color.substr(0,1) == '#') item.color = item.color.substr(1)
                    if (item.color.length == 3 || item.color.length == 6) item.color = '#' + item.color
                }
                if (item.type == 'color') {
                    text = '<div style="height: 12px; width: 12px; margin-top: 1px; border: 1px solid #8A8A8A; border-radius: 1px; box-shadow: 0px 0px 1px #fff; '+
                           '        background-color: '+ (item.color != null ? item.color : '#fff') +'; float: left;"></div>'+
                           (item.text ? '<div style="margin-left: 17px;">' + w2utils.lang(item.text) + '</div>' : '')
                }
                if (item.type == 'text-color') {
                    text = '<div style="color: '+ (item.color != null ? item.color : '#444') +';">'+
                                (item.text ? w2utils.lang(item.text) : '<b>Aa</b>') +
                           '</div>'
                }
            case 'menu':
            case 'menu-check':
            case 'menu-radio':
            case 'button':
            case 'check':
            case 'radio':
            case 'drop':
                html += '<table cellpadding="0" cellspacing="0" '+
                        '       class="w2ui-button '+ (item.checked ? 'checked' : '') +' '+ (item.class ? item.class : '') +'" '+
                        '       onclick     = "var el=w2ui[\''+ this.name + '\']; if (el) el.click(\''+ item.id +'\', event);" '+
                        '       onmouseenter = "' + (!item.disabled ? 'jQuery(this).addClass(\'over\'); w2ui[\''+ this.name +'\'].tooltipShow(\''+ item.id +'\', event);' : '') + '"'+
                        '       onmouseleave = "' + (!item.disabled ? 'jQuery(this).removeClass(\'over\').removeClass(\'down\'); w2ui[\''+ this.name +'\'].tooltipHide(\''+ item.id +'\', event);' : '') + '"'+
                        '       onmousedown = "' + (!item.disabled ? 'jQuery(this).addClass(\'down\');' : '') + '"'+
                        '       onmouseup   = "' + (!item.disabled ? 'jQuery(this).removeClass(\'down\');' : '') + '"'+
                        '><tbody>'+
                        '<tr><td>'+
                        '  <table cellpadding="1" cellspacing="0"><tbody>'+
                        '  <tr>' +
                                img +
                                (text !== ''
                                    ? '<td class="w2ui-tb-text w2ui-tb-caption" nowrap="nowrap" style="'+ (item.style ? item.style : '') +'">'+ w2utils.lang(text) +'</td>'
                                    : ''
                                ) +
                                (item.count != null
                                    ? '<td class="w2ui-tb-count" nowrap="nowrap"><span>'+ item.count +'</span></td>'
                                    : ''
                                ) +
                                (((['menu', 'menu-radio', 'menu-check', 'drop', 'color', 'text-color'].indexOf(item.type) != -1) && item.arrow !== false) ?
                                    '<td class="w2ui-tb-down" nowrap="nowrap"><div></div></td>' : '') +
                        '  </tr></tbody></table>'+
                        '</td></tr></tbody></table>'
                break

            case 'break':
                html += '<table cellpadding="0" cellspacing="0"><tbody><tr>'+
                        '    <td><div class="w2ui-break">&#160;</div></td>'+
                        '</tr></tbody></table>'
                break

            case 'html':
                html += '<table cellpadding="0" cellspacing="0"><tbody><tr>'+
                        '    <td nowrap="nowrap">' + (typeof item.html == 'function' ? item.html.call(this, item) : item.html) + '</td>'+
                        '</tr></tbody></table>'
                break
        }
        return '<div>' + html + '</div>'
    }

    tooltipShow(id, event, forceRefresh) {
        if (this.tooltip == null) return
        let $el = $(this.box).find('#tb_'+ this.name + '_item_'+ w2utils.escapeId(id))
        let item = this.get(id)
        let pos = this.tooltip
        let txt = item.tooltip
        if (typeof txt == 'function') txt = txt.call(this, item)
        clearTimeout(this._tooltipTimer)
        this._tooltipTimer = setTimeout(() => {
            if ($el.prop('_mouse_tooltip') !== true) {
                $el.prop('_mouse_tooltip', true)
                // show tooltip
                if (['menu', 'menu-radio', 'menu-check', 'drop', 'color', 'text-color'].indexOf(item.type) != -1 && item.checked == true) return // not for opened drop downs
                $el.w2tag(w2utils.lang(txt), { position: pos })
            }
        }, 0)
        // refresh only
        if ($el.prop('_mouse_tooltip') && forceRefresh == true) {
            $el.w2tag(w2utils.lang(txt), { position: pos })
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
            let it = event.subItem
            let item = this.get(event.item.id)
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
                let info = w2utils.parseRoute(route)
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
}
export { w2toolbar }