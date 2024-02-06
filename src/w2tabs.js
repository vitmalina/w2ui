/**
 * Part of w2ui 2.0 library
 *  - Dependencies: mQuery, w2utils, w2base, w2tooltip
 *
 * == 2.0 changes
 *  - CSP - fixed inline events
 *  - removed jQuery dependency
 *  - observeResize for the box
 *  - refactored w2events
 *  - scrollIntoView - removed callback
 *  - scroll, scrollIntoView return promise
 *  - animateInsert, animateClose - returns a promise
 *  - add, insert return a promise
 *  - onMouseEnter, onMouseLeave, onMouseDown, onMouseUp
 */

import { w2base } from './w2base.js'
import { w2ui, w2utils } from './w2utils.js'
import { query } from './query.js'
import { w2tooltip } from './w2tooltip.js'

class w2tabs extends w2base {
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
        this.last         = {} // placeholder for internal variables
        this.right        = ''
        this.style        = ''
        this.onClick      = null
        this.onMouseEnter = null // mouse enter and lease
        this.onMouseLeave = null
        this.onMouseDown  = null
        this.onMouseUp    = null
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
        Object.assign(this, options)
        // add item via method to makes sure item_template is applied
        if (Array.isArray(tabs)) this.add(tabs)
        // need to reassign back to keep it in config
        options.tabs = tabs

        // render if box specified
        if (typeof this.box == 'string') this.box = query(this.box).get(0)
        if (this.box) this.render(this.box)
    }

    add(tab) {
        return this.insert(null, tab)
    }

    insert(id, tabs) {
        if (!Array.isArray(tabs)) tabs = [tabs]
        // assume it is array
        let proms = []
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
                proms.push(this.animateInsert(null, it))
            } else {
                let middle = this.get(id, true)
                let before = this.tabs[middle].id
                this.tabs.splice(middle, 0, it)
                proms.push(this.animateInsert(before, it))
            }
        })
        return Promise.all(proms)
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
            query(this.box).find(`#tabs_${this.name}_tab_${w2utils.escapeId(tab.id)}`).remove()
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
        w2utils.extend(this.tabs[index], tab)
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
        if (!this.last.reordering) return
        let self = this
        let info = this.last.moving
        let tab  = this.tabs[info.index]
        let next = _find(info.index, 1)
        let prev = _find(info.index, -1)
        let $el  = query(this.box).find('#tabs_'+ this.name + '_tab_'+ w2utils.escapeId(tab.id))
        if (info.divX > 0 && next) {
            let $nextEl = query(this.box).find('#tabs_'+ this.name + '_tab_'+ w2utils.escapeId(next.id))
            let width1  = parseInt($el.get(0).clientWidth)
            let width2  = parseInt($nextEl.get(0).clientWidth)
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
                info.$tab.before($nextEl.get(0))
                info.$tab.css('opacity', 0)
                Object.assign(this.last.moving, {
                    index: index,
                    divX: -width1,
                    x: event.pageX + width1,
                    left: info.left + info.divX + width1
                })
                return
            }
        }
        if (info.divX < 0 && prev) {
            let $prevEl = query(this.box).find('#tabs_'+ this.name + '_tab_'+ w2utils.escapeId(prev.id))
            let width1  = parseInt($el.get(0).clientWidth)
            let width2  = parseInt($prevEl.get(0).clientWidth)
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
            let tab = self.tabs[ind]
            if (tab && tab.hidden) {
                tab = _find(ind, inc)
            }
            return tab
        }
    }

    mouseAction(action, id, event) {
        let tab = this.get(id)
        let edata = this.trigger('mouse' + action, { target: id, tab, object: tab, originalEvent: event })
        if (edata.isCancelled === true || tab?.disabled || tab?.hidden) return
        switch (action) {
            case 'Enter':
                this.tooltipShow(id)
                break
            case 'Leave':
                this.tooltipHide(id)
                break
            case 'Down':
                this.initReorder(id, event)
                break
            case 'Up':
                break
        }
        edata.finish()
    }

    tooltipShow(id) {
        let tab = this.get(id)
        let el = query(this.box).find('#tabs_'+ this.name + '_tab_'+ w2utils.escapeId(id)).get(0)
        if (this.tooltip == null || tab?.disabled || this.last.reordering) {
            return
        }
        let pos = this.tooltip
        let txt = tab?.tooltip
        if (typeof txt == 'function') txt = txt.call(this, tab)
        w2tooltip.show({
            anchor: el,
            name: this.name + '_tooltip',
            html: txt,
            position: pos
        })
    }

    tooltipHide(id) {
        if (this.tooltip == null) return
        w2tooltip.hide(this.name + '_tooltip')
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
                data-mousedown="stop" data-mouseup="clickClose|${tab.id}|event">
            </div>`
        }
        return `
            <div id="tabs_${this.name}_tab_${tab.id}" style="${addStyle} ${tab.style}"
                class="w2ui-tab w2ui-eaction ${this.active === tab.id ? 'active' : ''} ${tab.closable ? 'closable' : ''} ${tab.class ? tab.class : ''}"
                data-mouseenter="mouseAction|Enter|${tab.id}|event]"
                data-mouseleave="mouseAction|Leave|${tab.id}|event]"
                data-mousedown="mouseAction|Down|${tab.id}|event"
                data-mouseup="mouseAction|Up|${tab.id}|event"
                data-click="click|${tab.id}|event"
               >
                    ${w2utils.lang(text) + closable}
            </div>`
    }

    refresh(id) {
        let time = Date.now()
        if (this.flow == 'up') {
            query(this.box).addClass('w2ui-tabs-up')
        } else {
            query(this.box).removeClass('w2ui-tabs-up')
        }
        // event before
        let edata = this.trigger('refresh', { target: (id != null ? id : this.name), object: this.get(id) })
        if (edata.isCancelled === true) return
        if (id == null) {
            // refresh all
            for (let i = 0; i < this.tabs.length; i++) {
                this.refresh(this.tabs[i].id)
            }
        } else {
            // create or refresh only one item
            let selector = '#tabs_'+ this.name +'_tab_'+ w2utils.escapeId(id)
            let $tab = query(this.box).find(selector)
            let tabHTML = this.getTabHTML(id)
            if ($tab.length === 0) {
                query(this.box).find('#tabs_'+ this.name +'_right').before(tabHTML)
            } else {
                if (query(this.box).find('.tab-animate-insert').length == 0) {
                    $tab.replace(tabHTML)
                }
            }
            w2utils.bindEvents(query(this.box).find(`${selector}, ${selector} .w2ui-eaction`), this)
        }
        // right html
        query(this.box).find('#tabs_'+ this.name +'_right').html(this.right)
        // event after
        edata.finish()
        // this.resize();
        return Date.now() - time
    }

    render(box) {
        let time = Date.now()
        if (typeof box == 'string') box = query(box).get(0)
        // event before
        let edata = this.trigger('render', { target: this.name, box: box ?? this.box })
        if (edata.isCancelled === true) return
        // default action
        if (box != null) {
            this.unmount() // clean previous control
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
        query(this.box)
            .attr('name', this.name)
            .addClass('w2ui-reset w2ui-tabs')
            .html(html)
        if (query(this.box).length > 0) {
            query(this.box)[0].style.cssText += this.style
        }
        w2utils.bindEvents(query(this.box).find('.w2ui-eaction'), this)
        // observe div resize
        this.last.observeResize = new ResizeObserver(() => { this.resize() })
        this.last.observeResize.observe(this.box)
        // event after
        edata.finish()
        this.refresh()
        this.resize()
        return Date.now() - time
    }

    initReorder(id, event) {
        if (!this.reorder) return
        let self     = this
        let $tab     = query(this.box).find('#tabs_' + this.name + '_tab_' + w2utils.escapeId(id))
        let tabIndex = this.get(id, true)
        let $ghost   = query($tab.get(0).cloneNode(true))
        let edata
        $ghost.attr('id', '#tabs_' + this.name + '_tab_ghost')
        this.last.moving = {
            index: tabIndex,
            indexFrom: tabIndex,
            $tab: $tab,
            $ghost: $ghost,
            divX: 0,
            left: $tab.get(0).getBoundingClientRect().left,
            parentX: query(this.box).get(0).getBoundingClientRect().left,
            x: event.pageX,
            opacity: $tab.css('opacity')
        }

        query(document)
            .off('.w2uiTabReorder')
            .on('mousemove.w2uiTabReorder', function (event) {
                if (!self.last.reordering) {
                    // event before
                    edata = self.trigger('reorder', { target: self.tabs[tabIndex].id, indexFrom: tabIndex, tab: self.tabs[tabIndex] })
                    if (edata.isCancelled === true) return

                    w2tooltip.hide(this.name + '_tooltip')
                    self.last.reordering = true
                    $ghost.addClass('moving')
                    $ghost.css({
                        'pointer-events': 'none',
                        'position': 'absolute',
                        'left': $tab.get(0).getBoundingClientRect().left
                    })
                    $tab.css('opacity', 0)
                    query(self.box).find('.w2ui-scroll-wrapper').append($ghost.get(0))
                    query(self.box).find('.w2ui-tab-close').hide()
                }
                self.last.moving.divX = event.pageX - self.last.moving.x
                $ghost.css('left', (self.last.moving.left - self.last.moving.parentX + self.last.moving.divX) + 'px')
                self.dragMove(event)
            })
            .on('mouseup.w2uiTabReorder', function () {
                query(document).off('.w2uiTabReorder')
                $ghost.css({
                    'transition': '0.1s',
                    'left': self.last.moving.$tab.get(0).getBoundingClientRect().left - self.last.moving.parentX
                })
                query(self.box).find('.w2ui-tab-close').show()
                $ghost.remove()
                $tab.css({ opacity: self.last.moving.opacity })
                // self.render()
                if (self.last.reordering) {
                    edata.finish({ indexTo: self.last.moving.index })
                }
                self.last.reordering = false
            })
    }

    scroll(direction, instant) {
        return new Promise((resolve, reject) => {
            let scrollBox  = query(this.box).find('.w2ui-scroll-wrapper')
            let scrollLeft = scrollBox.get(0).scrollLeft
            let right      = scrollBox.find('.w2ui-tabs-right').get(0)
            let width1     = scrollBox.parent().get(0).getBoundingClientRect().width
            let width2     = scrollLeft + parseInt(right.offsetLeft) + parseInt(right.clientWidth )

            switch (direction) {
                case 'left': {
                    let scroll = scrollLeft - width1 + 50 // 35 is width of both button
                    if (scroll <= 0) scroll = 0
                    scrollBox.get(0).scrollTo({ top: 0, left: scroll, behavior: instant ? 'atuo' : 'smooth' })
                    break
                }
                case 'right': {
                    let scroll = scrollLeft + width1 - 50 // 35 is width of both button
                    if (scroll >= width2 - width1) scroll = width2 - width1
                    scrollBox.get(0).scrollTo({ top: 0, left: scroll, behavior: instant ? 'atuo' : 'smooth' })
                    break
                }
            }
            setTimeout(() => { this.resize(); resolve() }, instant ? 0 : 350)
        })
    }

    scrollIntoView(id, instant) {
        return new Promise((resolve, reject) => {
            if (id == null) id = this.active
            let tab = this.get(id)
            if (tab == null) return
            let tabEl = query(this.box).find('#tabs_' + this.name + '_tab_' + w2utils.escapeId(id)).get(0)
            tabEl.scrollIntoView({ block: 'start', inline: 'center', behavior: instant ? 'atuo' : 'smooth' })
            setTimeout(() => { this.resize(); resolve() }, instant ? 0 : 500)
        })
    }

    resize() {
        let time = Date.now()
        if (this.box == null) return
        // event before
        let edata = this.trigger('resize', { target: this.name })
        if (edata.isCancelled === true) return

        // show hide overflow buttons
        if (this.box != null) {
            let box = query(this.box)
            box.find('.w2ui-scroll-left, .w2ui-scroll-right').hide()
            let scrollBox  = box.find('.w2ui-scroll-wrapper').get(0)
            let $right     = box.find('.w2ui-tabs-right')
            let boxWidth   = box.get(0).getBoundingClientRect().width
            let itemsWidth = ($right.length > 0 ? $right[0].offsetLeft + $right[0].clientWidth : 0)
            if (boxWidth < itemsWidth) {
                // we have overflown content
                if (scrollBox.scrollLeft > 0) {
                    box.find('.w2ui-scroll-left').show()
                }
                if (boxWidth < itemsWidth - scrollBox.scrollLeft) {
                    box.find('.w2ui-scroll-right').show()
                }
            }
        }
        // event after
        edata.finish()
        return Date.now() - time
    }

    destroy() {
        // event before
        let edata = this.trigger('destroy', { target: this.name })
        if (edata.isCancelled === true) return
        // clean up
        if (query(this.box).find('#tabs_'+ this.name + '_right').length > 0) {
            this.unmount()
        }
        delete w2ui[this.name]
        // event after
        edata.finish()
    }

    unmount() {
        super.unmount()
        this.last.observeResize?.disconnect()
    }

    // ===================================================
    // -- Internal Event Handlers

    click(id, event) {
        let tab = this.get(id)
        if (tab == null || tab.disabled || this.last.reordering) return false
        // event before
        let edata = this.trigger('click', { target: id, tab: tab, object: tab, originalEvent: event })
        if (edata.isCancelled === true) return
        // default action
        query(this.box).find('#tabs_'+ this.name +'_tab_'+ w2utils.escapeId(this.active)).removeClass('active')
        this.active = tab.id
        query(this.box).find('#tabs_'+ this.name +'_tab_'+ w2utils.escapeId(this.active)).addClass('active')
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
        edata.finish()
    }

    clickClose(id, event) {
        let tab = this.get(id)
        if (tab == null || tab.disabled) return false
        // event before
        let edata = this.trigger('close', { target: id, object: tab, tab, originalEvent: event })
        if (edata.isCancelled === true) return
        this.animateClose(id).then(() => {
            this.remove(id)
            edata.finish()
            this.refresh()
        })
        if (event) event.stopPropagation()
    }

    animateClose(id) {
        return new Promise((resolve, reject) => {
            let $tab  = query(this.box).find('#tabs_'+ this.name +'_tab_'+ w2utils.escapeId(id))
            let width = parseInt($tab.get(0).clientWidth || 0)
            let anim = `<div class="tab-animate-close" style="display: inline-block; flex-shrink: 0; width: ${width}px; transition: width 0.25s"></div>`
            let $anim = $tab.replace(anim)
            setTimeout(() => { $anim.css({ width: '0px' }) }, 1)
            setTimeout(() => {
                $anim.remove()
                this.resize()

                resolve()
            }, 500)
        })
    }

    animateInsert(id, tab) {
        return new Promise((resolve, reject) => {
            let $before = query(this.box).find('#tabs_'+ this.name +'_tab_'+ w2utils.escapeId(id))
            let $tab    = query.html(this.getTabHTML(tab.id))
            if ($before.length == 0) {
                $before = query(this.box).find('#tabs_tabs_right')
                $before.before($tab)
                this.resize()
            } else {
                $tab.css({ opacity: 0 })
                // first insert tab on the right to get its proper dimentions
                query(this.box).find('#tabs_tabs_right').before($tab.get(0))
                let $tmp  = query(this.box).find('#' + $tab.attr('id'))
                let width = $tmp.get(0)?.clientWidth ?? 0
                // insert animation div
                let $anim = query.html('<div class="tab-animate-insert" style="flex-shrink: 0; width: 0; transition: width 0.25s"></div>')
                $before.before($anim)
                // hide tab and move it in the right position
                $tab.hide()
                $anim.before($tab[0])
                setTimeout(() => { $anim.css({ width: width + 'px' }) }, 1)
                setTimeout(() => {
                    $anim.remove()
                    $tab.css({ opacity: 1 }).show()
                    this.refresh(tab.id)
                    this.resize()
                    resolve()
                }, 500)
            }
        })
    }
}
export { w2tabs }