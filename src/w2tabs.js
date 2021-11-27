/************************************************************************
*   Part of w2ui 2.0 library
*   - Dependencies: jQuery, w2utils
*
* == 2.0 changes
*   - CSP - fixed inline events
*
************************************************************************/

import { w2event } from './w2event.js'
import { w2ui, w2utils } from './w2utils.js'

class w2tabs extends w2event {
    constructor(options) {
        super(options.name)
        this.box          = null // DOM Element that holds the element
        this.name         = null // unique name for w2ui
        this.active       = null
        this.reorder      = false
        this.flow         = 'down' // can be down or up
        this.tooltip      = 'top|left' // can be top, bottom, left, right
        this.tabs         = []
        this.routeData    = {} // data for dynamic routes
        this.tmp          = {} // placeholder for internal variables
        this.right        = ''
        this.style        = ''
        this.onClick      = null
        this.onClose      = null
        this.onRender     = null
        this.onRefresh    = null
        this.onResize     = null
        this.onDestroy    = null
        this.tab_template = {
            id: null,
            text: null,
            route: null,
            hidden: false,
            disabled: false,
            closable: false,
            tooltip: null,
            style: '',
            onClick: null,
            onRefresh: null,
            onClose: null
        }
        let tabs = options.tabs
        delete options.tabs
        // mix in options
        $.extend(true, this, options)
        // add item via method to makes sure item_template is applied
        if (Array.isArray(tabs)) this.add(tabs)
        // need to reassign back to keep it in config
        options.tabs = tabs
    }

    add(tab) {
        return this.insert(null, tab)
    }

    insert(id, tabs) {
        if (!Array.isArray(tabs)) tabs = [tabs]
        // assume it is array
        tabs.forEach(tab => {
            // checks
            if (tab.id == null) {
                console.log(`ERROR: The parameter "id" is required but not supplied. (obj: ${this.name})`)
                return
            }
            if (!w2utils.checkUniqueId(tab.id, this.tabs, 'tabs', this.name)) return
            // add tab
            let it = Object.assign({}, this.tab_template, tab)
            if (id == null) {
                this.tabs.push(it)
                this.animateInsert(null, it)
            } else {
                let middle = this.get(id, true)
                let before = this.tabs[middle].id
                this.tabs.splice(middle, 0, it)
                this.animateInsert(before, it)
            }
        })
    }

    remove() {
        let effected = 0
        Array.from(arguments).forEach(it => {
            let tab = this.get(it)
            if (!tab) return
            effected++
            // remove from array
            this.tabs.splice(this.get(tab.id, true), 1)
            // remove from screen
            $(this.box).find(`#tabs_${this.name}_tab_${w2utils.escapeId(tab.id)}`).remove()
        })
        this.resize()
        return effected
    }

    select(id) {
        if (this.active == id || this.get(id) == null) return false
        this.active = id
        this.refresh()
        return true
    }

    set(id, tab) {
        let index = this.get(id, true)
        if (index == null) return false
        $.extend(this.tabs[index], tab)
        this.refresh(id)
        return true
    }

    get(id, returnIndex) {
        if (arguments.length === 0) {
            let all = []
            for (let i1 = 0; i1 < this.tabs.length; i1++) {
                if (this.tabs[i1].id != null) {
                    all.push(this.tabs[i1].id)
                }
            }
            return all
        } else {
            for (let i2 = 0; i2 < this.tabs.length; i2++) {
                if (this.tabs[i2].id == id) { // need to be == since id can be numeric
                    return (returnIndex === true ? i2 : this.tabs[i2])
                }
            }
        }
        return null
    }

    show() {
        let effected = []
        Array.from(arguments).forEach(it => {
            let tab = this.get(it)
            if (!tab || tab.hidden === false) return
            tab.hidden = false
            effected.push(tab.id)
        })
        setTimeout(() => { effected.forEach(it => { this.refresh(it); this.resize() }) }, 15) // needs timeout
        return effected
    }

    hide() {
        let effected = []
        Array.from(arguments).forEach(it => {
            let tab = this.get(it)
            if (!tab || tab.hidden === true) return
            tab.hidden = true
            effected.push(tab.id)
        })
        setTimeout(() => { effected.forEach(it => { this.refresh(it); this.resize() }) }, 15) // needs timeout
        return effected
    }

    enable() {
        let effected = []
        Array.from(arguments).forEach(it => {
            let tab = this.get(it)
            if (!tab || tab.disabled === false) return
            tab.disabled = false
            effected.push(tab.id)
        })
        setTimeout(() => { effected.forEach(it => { this.refresh(it) }) }, 15) // needs timeout
        return effected
    }

    disable() {
        let effected = []
        Array.from(arguments).forEach(it => {
            let tab = this.get(it)
            if (!tab || tab.disabled === true) return
            tab.disabled = true
            effected.push(tab.id)
        })
        setTimeout(() => { effected.forEach(it => { this.refresh(it) }) }, 15) // needs timeout
        return effected
    }

    dragMove(event) {
        if (!this.tmp.reordering) return
        let obj  = this
        let info = this.tmp.moving
        let tab  = this.tabs[info.index]
        let next = _find(info.index, 1)
        let prev = _find(info.index, -1)
        let $el  = $('#tabs_'+ this.name + '_tab_'+ w2utils.escapeId(tab.id))
        if (info.divX > 0 && next) {
            let $nextEl = $('#tabs_'+ this.name + '_tab_'+ w2utils.escapeId(next.id))
            let width1  = parseInt($el.css('width'))
            let width2  = parseInt($nextEl.css('width'))
            if (width1 < width2) {
                width1 = Math.floor(width1 / 3)
                width2 = width2 - width1
            } else {
                width1 = Math.floor(width2 / 3)
                width2 = width2 - width1
            }
            if (info.divX > width2) {
                let index = this.tabs.indexOf(next)
                this.tabs.splice(info.index, 0, this.tabs.splice(index, 1)[0]) // reorder in the array
                info.$tab.before($nextEl)
                info.$tab.css('opacity', 0)
                Object.assign(this.tmp.moving, {
                    index: index,
                    divX: -width1,
                    x: event.pageX + width1,
                    left: info.left + info.divX + width1
                })
                return
            }
        }
        if (info.divX < 0 && prev) {
            let $prevEl = $('#tabs_'+ this.name + '_tab_'+ w2utils.escapeId(prev.id))
            let width1  = parseInt($el.css('width'))
            let width2  = parseInt($prevEl.css('width'))
            if (width1 < width2) {
                width1 = Math.floor(width1 / 3)
                width2 = width2 - width1
            } else {
                width1 = Math.floor(width2 / 3)
                width2 = width2 - width1
            }
            if (Math.abs(info.divX) > width2) {
                let index = this.tabs.indexOf(prev)
                this.tabs.splice(info.index, 0, this.tabs.splice(index, 1)[0]) // reorder in the array
                $prevEl.before(info.$tab)
                info.$tab.css('opacity', 0)
                Object.assign(info, {
                    index: index,
                    divX: width1,
                    x: event.pageX - width1,
                    left: info.left + info.divX - width1
                })
                return
            }
        }
        function _find(ind, inc) {
            ind    += inc
            let tab = obj.tabs[ind]
            if (tab && tab.hidden) {
                tab = _find(ind, inc)
            }
            return tab
        }
    }

    tooltipShow(id, event, forceRefresh) {
        let item = this.get(id)
        let $el  = $(this.box).find('#tabs_'+ this.name + '_tab_'+ w2utils.escapeId(id))
        if (this.tooltip == null || item.disabled || this.tmp.reordering) {
            return
        }
        let pos = this.tooltip
        let txt = item.tooltip
        if (typeof txt == 'function') txt = txt.call(this, item)
        $el.prop('_mouse_over', true)
        setTimeout(() => {
            if ($el.prop('_mouse_over') === true && $el.prop('_mouse_tooltip') !== true) {
                $el.prop('_mouse_tooltip', true)
                // show tooltip
                $el.w2tag(w2utils.lang(txt), { position: pos })
            }
            if (forceRefresh == true) {
                $el.w2tag(w2utils.lang(txt), { position: pos })
            }
        }, 1)
    }

    tooltipHide(id) {
        let item = this.get(id)
        let $el  = $(this.box).find('#tabs_'+ this.name + '_tab_'+ w2utils.escapeId(id))
        if (this.tooltip == null || item.disabled || this.tmp.reordering) {
            return
        }
        $el.removeProp('_mouse_over')
        setTimeout(() => {
            if ($el.prop('_mouse_over') !== true && $el.prop('_mouse_tooltip') === true) {
                $el.removeProp('_mouse_tooltip')
                $el.w2tag() // hide tooltip
            }
        }, 1)
    }

    getTabHTML(id) {
        let index = this.get(id, true)
        let tab   = this.tabs[index]
        if (tab == null) return false
        if (tab.text == null && tab.caption != null) tab.text = tab.caption
        if (tab.tooltip == null && tab.hint != null) tab.tooltip = tab.hint // for backward compatibility
        if (tab.caption != null) {
            console.log('NOTICE: tabs tab.caption property is deprecated, please use tab.text. Tab -> ', tab)
        }
        if (tab.hint != null) {
            console.log('NOTICE: tabs tab.hint property is deprecated, please use tab.tooltip. Tab -> ', tab)
        }

        let text = tab.text
        if (typeof text == 'function') text = text.call(this, tab)
        if (text == null) text = ''

        let closable = ''
        let addStyle = ''
        if (tab.hidden) { addStyle += 'display: none;' }
        if (tab.disabled) { addStyle += 'opacity: 0.2;' }
        if (tab.closable && !tab.disabled) {
            closable = `<div class="w2ui-tab-close w2ui-eaction ${this.active === tab.id ? 'active' : ''}"
                data-mouseenter='["tooltipShow", "${tab.id}", "event"]'
                data-mouseleave='["tooltipHide", "${tab.id}", "event"]'
                data-mousedown="stop"
                data-mouseup='["clickClose", "${tab.id}", "event"]'>
            </div>`
        }
        return `
            <div id="tabs_${this.name}_tab_${tab.id}" style="${addStyle} ${tab.style}"
               class="w2ui-tab w2ui-eaction ${this.active === tab.id ? 'active' : ''} ${tab.closable ? 'closable' : ''} ${tab.class ? tab.class : ''}"
               data-mouseenter ='["tooltipShow", "${tab.id}", "event"]'
               data-mouseleave ='["tooltipHide", "${tab.id}", "event"]'
               data-mousedown  ='["initReorder", "${tab.id}", "event"]'
               data-click      ='["click", "${tab.id}", "event"]'
               >
                    ${w2utils.lang(text) + closable}
            </div>`
    }

    refresh(id) {
        let time = (new Date()).getTime()
        if (this.flow == 'up') $(this.box).addClass('w2ui-tabs-up'); else $(this.box).removeClass('w2ui-tabs-up')
        // event before
        let edata = this.trigger({ phase: 'before', type: 'refresh', target: (id != null ? id : this.name), object: this.get(id) })
        if (edata.isCancelled === true) return
        if (id == null) {
            // refresh all
            for (let i = 0; i < this.tabs.length; i++) {
                this.refresh(this.tabs[i].id)
            }
        } else {
            // create or refresh only one item
            let selector = '#tabs_'+ this.name +'_tab_'+ w2utils.escapeId(id)
            let $tab = $(this.box).find(selector)
            let tabHTML = this.getTabHTML(id)
            if ($tab.length === 0) {
                $(this.box).find('#tabs_'+ this.name +'_right').before(tabHTML)
            } else {
                if ($(this.box).find('.tab-animate-insert').length == 0) {
                    $tab.replaceWith(tabHTML)
                }
            }
            w2utils.bindEvents(`${selector}, ${selector} .w2ui-eaction`, this)
        }
        // right html
        $('#tabs_'+ this.name +'_right').html(this.right)
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
        // this.resize();
        return (new Date()).getTime() - time
    }

    render(box) {
        let time = (new Date()).getTime()
        // event before
        let edata = this.trigger({ phase: 'before', type: 'render', target: this.name, box: box })
        if (edata.isCancelled === true) return
        // default action
        // if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection
        if (box != null) {
            if ($(this.box).find('#tabs_'+ this.name + '_right').length > 0) {
                $(this.box)
                    .removeAttr('name')
                    .removeClass('w2ui-reset w2ui-tabs')
                    .html('')
            }
            this.box = box
        }
        if (!this.box) return false
        // render all buttons
        let html =`
            <div class="w2ui-tabs-line"></div>
            <div class="w2ui-scroll-wrapper w2ui-eaction" data-mousedown="resize">
                <div id="tabs_${this.name}_right" class="w2ui-tabs-right">${this.right}</div>
            </div>
            <div class="w2ui-scroll-left w2ui-eaction" data-click='["scroll","left"]'></div>
            <div class="w2ui-scroll-right w2ui-eaction" data-click='["scroll","right"]'></div>`
        $(this.box)
            .attr('name', this.name)
            .addClass('w2ui-reset w2ui-tabs')
            .html(html)
        if ($(this.box).length > 0) {
            $(this.box)[0].style.cssText += this.style
        }
        w2utils.bindEvents($(this.box).find('.w2ui-eaction'), this)
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
        this.refresh()
        this.resize()
        return (new Date()).getTime() - time
    }

    initReorder(id, event) {
        if (!this.reorder) return
        let obj      = this
        let $tab     = $('#tabs_' + this.name + '_tab_' + w2utils.escapeId(id))
        let tabIndex = this.get(id, true)
        let $ghost   = $tab.clone()
        let edata
        $ghost.attr('id', '#tabs_' + this.name + '_tab_ghost')
        this.tmp.moving = {
            index: tabIndex,
            indexFrom: tabIndex,
            $tab: $tab,
            $ghost: $ghost,
            divX: 0,
            left: $tab.offset().left,
            parentX: $(this.box).offset().left,
            x: event.pageX,
            opacity: $tab.css('opacity')
        }

        $('body')
            .off('.w2uiTabReorder')
            .on('mousemove.w2uiTabReorder', function(event) {
                if (!obj.tmp.reordering) {
                    // event before
                    edata = obj.trigger({ phase: 'before', type: 'reorder', target: obj.tabs[tabIndex].id, indexFrom: tabIndex, tab: obj.tabs[tabIndex] })
                    if (edata.isCancelled === true) return

                    $().w2tag()
                    obj.tmp.reordering = true
                    $ghost.addClass('moving')
                    $ghost.css({
                        'pointer-events': 'none',
                        'position': 'absolute',
                        'left': $tab.offset().left
                    })
                    $tab.css('opacity', 0)
                    $(obj.box).find('.w2ui-scroll-wrapper').append($ghost)
                    $(obj.box).find('.w2ui-tab-close').hide()
                }
                obj.tmp.moving.divX = event.pageX - obj.tmp.moving.x
                $ghost.css('left', (obj.tmp.moving.left - obj.tmp.moving.parentX + obj.tmp.moving.divX) + 'px')
                obj.dragMove(event)
            })
            .on('mouseup.w2uiTabReorder', function() {
                $('body').off('.w2uiTabReorder')
                $ghost.css({
                    'transition': '0.1s',
                    'left': obj.tmp.moving.$tab.offset().left - obj.tmp.moving.parentX
                })
                $(obj.box).find('.w2ui-tab-close').show()
                setTimeout(() => {
                    $ghost.remove()
                    $tab.css({ opacity: obj.tmp.moving.opacity })
                    // obj.render()
                    if (obj.tmp.reordering) {
                        obj.trigger($.extend(edata, { phase: 'after', indexTo: obj.tmp.moving.index }))
                    }
                    obj.tmp.reordering = false
                }, 100)
            })
    }

    scroll(direction, instant) {
        let box        = $(this.box)
        let obj        = this
        let scrollBox  = box.find('.w2ui-scroll-wrapper')
        let scrollLeft = scrollBox.scrollLeft()
        let $right     = box.find('.w2ui-tabs-right')
        let width1     = scrollBox.outerWidth()
        let width2     = scrollLeft + parseInt($right.offset().left) + parseInt($right.width())
        let scroll     = false

        switch (direction) {
            case 'left':
                scroll = scrollLeft - width1 + 50 // 35 is width of both button
                if (scroll <= 0) scroll = 0
                break

            case 'right':
                scroll = scrollLeft + width1 - 50 // 35 is width of both button
                if (scroll >= width2 - width1) scroll = width2 - width1
                break
        }

        if (scroll !== false){
            scrollBox.animate({ scrollLeft: scroll }, instant ? 0 : 300, function(){ obj.resize() })
        }
    }

    scrollIntoView(id, instant, callBack) {
        let obj = this
        if (id == null) id = obj.active
        let tab = obj.get(id)
        if (tab == null) return

        let box         = $(obj.box)
        let $scrollBox  = box.find('.w2ui-scroll-wrapper')
        let $tab        = box.find('#tabs_' + obj.name + '_tab_' + w2utils.escapeId(id))
        let offset      = $tab.offset().left - $scrollBox.offset().left

        $scrollBox.animate({ 'scrollLeft': $scrollBox.scrollLeft() + offset - $scrollBox.width() / 2 + $tab.width() }, instant ? 0 : 350, 'linear', function(){
            obj.resize()
            if (typeof callBack === 'function') callBack(id, tab)
        })
    }

    resize() {
        let time = (new Date()).getTime()
        // event before
        let edata = this.trigger({ phase: 'before', type: 'resize', target: this.name })
        if (edata.isCancelled === true) return

        // show hide overflow buttons
        let box = $(this.box)
        box.find('.w2ui-scroll-left, .w2ui-scroll-right').hide()
        let scrollBox  = box.find('.w2ui-scroll-wrapper')
        let $right     = $(box).find('.w2ui-tabs-right')
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
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
        return (new Date()).getTime() - time
    }

    destroy() {
        // event before
        let edata = this.trigger({ phase: 'before', type: 'destroy', target: this.name })
        if (edata.isCancelled === true) return
        // clean up
        if ($(this.box).find('#tabs_'+ this.name + '_right').length > 0) {
            $(this.box)
                .removeAttr('name')
                .removeClass('w2ui-reset w2ui-tabs')
                .html('')
        }
        delete w2ui[this.name]
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
    }

    // ===================================================
    // -- Internal Event Handlers

    click(id, event) {
        let tab = this.get(id)
        if (tab == null || tab.disabled || this.tmp.reordering) return false
        // event before
        let edata = this.trigger({ phase: 'before', type: 'click', target: id, tab: tab, object: tab, originalEvent: event })
        if (edata.isCancelled === true) return
        // default action
        $(this.box).find('#tabs_'+ this.name +'_tab_'+ w2utils.escapeId(this.active)).removeClass('active')
        $(this.box).find('#tabs_'+ this.name +'_tab_'+ w2utils.escapeId(this.active)).removeClass('active')
        this.active = tab.id
        // route processing
        if (typeof tab.route == 'string') {
            let route = tab.route !== '' ? String('/'+ tab.route).replace(/\/{2,}/g, '/') : ''
            let info  = w2utils.parseRoute(route)
            if (info.keys.length > 0) {
                for (let k = 0; k < info.keys.length; k++) {
                    if (this.routeData[info.keys[k].name] == null) continue
                    route = route.replace((new RegExp(':'+ info.keys[k].name, 'g')), this.routeData[info.keys[k].name])
                }
            }
            setTimeout(() => { window.location.hash = route }, 1)
        }
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
        this.refresh(id)
    }

    clickClose(id, event) {
        let tab = this.get(id)
        if (tab == null || tab.disabled) return false
        // event before
        let edata = this.trigger({ phase: 'before', type: 'close', target: id, object: this.get(id), originalEvent: event })
        if (edata.isCancelled === true) return
        this.animateClose(id).then(() => {
            this.remove(id)
            this.trigger($.extend(edata, { phase: 'after' }))
            this.refresh()
        })
        if (event) event.stopPropagation()
    }

    animateClose(id) {
        return new Promise((resolve, reject) => {
            let $tab  = $(this.box).find('#tabs_'+ this.name +'_tab_'+ w2utils.escapeId(id))
            let width = parseInt($tab.css('width') || 0)
            let $anim = $(`<div class="tab-animate-close" style="display: inline-block; flex-shrink: 0; width: ${width}px; transition: width 0.25s"></div>`)
            $tab.replaceWith($anim)
            setTimeout(() => { $anim.css({ width: '0px' }) }, 1)
            setTimeout(() => {
                $anim.remove()
                this.resize()
                resolve()
            }, 300)
        })
    }

    animateInsert(id, tab) {
        return new Promise((resolve, reject) => {
            let $before = $(this.box).find('#tabs_'+ this.name +'_tab_'+ w2utils.escapeId(id))
            let $tab    = $(this.getTabHTML(tab.id))
            if ($before.length == 0) {
                $before = $(this.box).find('#tabs_tabs_right')
                $before.before($tab)
                this.resize()
            } else {
                // insert at the end and find width
                $tab.css({ opacity: 0 })
                $(this.box).find('#tabs_tabs_right').before($tab)
                let $tmp  = $('#'+$tab.attr('id'))
                let width = parseInt($tmp.css('width') || 0)
                let $anim = $('<div class="tab-animate-insert" style="display: inline-block; flex-shrink: 0; width: 0px; transition: width 0.25s"></div>')
                $before.before($anim)
                $tab.hide()
                $tab.insertBefore($anim)
                setTimeout(() => { $anim.css({ width: width + 'px' }) }, 1)
                setTimeout(() => {
                    $anim.remove()
                    $tab.css({ opacity: 1 }).show()
                    this.refresh(tab.id)
                    this.resize()
                    resolve()
                }, 300)
            }
        })
    }
}
export { w2tabs }