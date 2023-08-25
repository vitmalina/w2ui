/**
 * Part of w2ui 2.0 library
 *  - Dependencies: mQuery, w2utils, w2base, w2tabs, w2toolbar
 *
 * == 2.0 changes
 *  - CSP - fixed inline events
 *  - remove jQuery dependency
 *  - layout.confirm - refactored
 *  - layout.message - refactored
 *  - panel.removed
 */

import { w2base } from './w2base.js'
import { w2ui, w2utils } from './w2utils.js'
import { query } from './query.js'
import { w2tabs } from './w2tabs.js'
import { w2toolbar } from './w2toolbar.js'

let w2panels = ['top', 'left', 'main', 'preview', 'right', 'bottom']

class w2layout extends w2base {
    constructor(options) {
        super(options.name)
        this.box            = null // DOM Element that holds the element
        this.name           = null // unique name for w2ui
        this.panels         = []
        this.last           = {}
        this.padding        = 1 // panel padding
        this.resizer        = 4 // resizer width or height
        this.style          = ''
        this.onShow         = null
        this.onHide         = null
        this.onResizing     = null
        this.onResizerClick = null
        this.onRender       = null
        this.onRefresh      = null
        this.onChange       = null
        this.onResize       = null
        this.onDestroy      = null
        this.panel_template = {
            type: null, // left, right, top, bottom
            title: '',
            size: 100, // width or height depending on panel name
            minSize: 20,
            maxSize: false,
            hidden: false,
            resizable: false,
            overflow: 'auto',
            style: '',
            html: '', // can be String or Object with .render(box) method
            tabs: null,
            toolbar: null,
            width: null, // read only
            height: null, // read only
            show: {
                toolbar: false,
                tabs: false
            },
            removed: null, // function to call when content is overwritten
            onRefresh: null,
            onShow: null,
            onHide: null
        }
        // mix in options
        Object.assign(this, options)
        if (!Array.isArray(this.panels)) this.panels = []
        // add defined panels
        this.panels.forEach((panel, ind) => {
            this.panels[ind] = w2utils.extend({}, this.panel_template, panel)
            if (w2utils.isPlainObject(panel.tabs) || Array.isArray(panel.tabs)) initTabs(this, panel.type)
            if (w2utils.isPlainObject(panel.toolbar) || Array.isArray(panel.toolbar)) initToolbar(this, panel.type)
        })
        // add all other panels
        w2panels.forEach(tab => {
            if (this.get(tab) != null) return
            this.panels.push(w2utils.extend({}, this.panel_template, { type: tab, hidden: (tab !== 'main'), size: 50 }))
        })

        // render if box specified
        if (typeof this.box == 'string') this.box = query(this.box).get(0)
        if (this.box) this.render(this.box)

        function initTabs(object, panel, tabs) {
            let pan = object.get(panel)
            if (pan != null && tabs == null) tabs = pan.tabs
            if (pan == null || tabs == null) return false
            // instantiate tabs
            if (Array.isArray(tabs)) tabs = { tabs: tabs }
            let name = object.name + '_' + panel + '_tabs'
            if (w2ui[name]) w2ui[name].destroy() // destroy if existed
            pan.tabs      = new w2tabs(w2utils.extend({}, tabs, { owner: object, name: object.name + '_' + panel + '_tabs' }))
            pan.show.tabs = true
            return true
        }

        function initToolbar(object, panel, toolbar) {
            let pan = object.get(panel)
            if (pan != null && toolbar == null) toolbar = pan.toolbar
            if (pan == null || toolbar == null) return false
            // instantiate toolbar
            if (Array.isArray(toolbar)) toolbar = { items: toolbar }
            let name = object.name + '_' + panel + '_toolbar'
            if (w2ui[name]) w2ui[name].destroy() // destroy if existed
            pan.toolbar      = new w2toolbar(w2utils.extend({}, toolbar, { owner: object, name: object.name + '_' + panel + '_toolbar' }))
            pan.show.toolbar = true
            return true
        }
    }

    html(panel, data, transition) {
        let p = this.get(panel)
        let promise = {
            panel: panel,
            html: p.html,
            error: false,
            cancelled: false,
            removed(cb) {
                if (typeof cb == 'function') {
                    p.removed = cb
                }
            }
        }
        if (typeof p.removed == 'function') {
            p.removed({ panel: panel, html: p.html, html_new: data, transition: transition || 'none' })
            p.removed = null // this is one time call back only
        }
        // if it is CSS panel
        if (panel == 'css') {
            query(this.box).find('#layout_'+ this.name +'_panel_css').html('<style>'+ data +'</style>')
            promise.status = true
            return promise
        }
        if (p == null) {
            console.log('ERROR: incorrect panel name. Panel name can be main, left, right, top, bottom, preview or css')
            promise.error = true
            return promise
        }
        if (data == null) {
            return promise
        }
        // event before
        let edata = this.trigger('change', { target: panel, panel: p, html_new: data, transition: transition })
        if (edata.isCancelled === true) {
            promise.cancelled = true
            return promise
        }
        let pname = '#layout_'+ this.name + '_panel_'+ p.type
        let current = query(this.box).find(pname + '> [data-role="panel-content"]')
        let panelTop = 0
        if (current.length > 0) {
            query(this.box).find(pname).get(0).scrollTop = 0
            panelTop = query(current).css('top')
        }
        // clean up previous content
        if (typeof p.html.unmount == 'function') p.html.unmount()
        current.addClass('w2ui-panel-content')
        current.removeAttr('style') // styles could have added manually, but all necessary will be added by resizeBoxes
        this.resizeBoxes(panel)

        if (p.html === '') {
            p.html = data
            this.refresh(panel)
        } else {
            p.html = data
            if (!p.hidden) {
                if (transition != null && transition !== '') {
                    // apply transition
                    query(this.box).addClass('animating')
                    let div1 = query(this.box).find(pname + '> [data-role="panel-content"]')
                    div1.after('<div class="w2ui-panel-content new-panel" data-role="panel-content" style="'+ div1[0].style.cssText +'"></div>')
                    let div2 = query(this.box).find(pname + '> [data-role="panel-content"].new-panel')
                    div1.css('top', panelTop)
                    div2.css('top', panelTop)
                    if (typeof data == 'object') {
                        data.box = div2[0] // do not do .render(box);
                        data.render()
                    } else {
                        div2.hide().html(data)
                    }
                    w2utils.transition(div1[0], div2[0], transition, () => {
                        div1.remove()
                        div2.removeClass('new-panel')
                        div2.css('overflow', p.overflow)
                        // make sure only one content left
                        query(query(this.box).find(pname + '> [data-role="panel-content"]').get(1)).remove()
                        query(this.box).removeClass('animating')
                        this.refresh(panel)
                    })
                } else {
                    this.refresh(panel)
                }
            }
        }
        // event after
        edata.finish()
        return promise
    }

    message(panel, options) {
        let p = this.get(panel)
        let box = query(this.box).find('#layout_'+ this.name + '_panel_'+ p.type)
        let oldOverflow = box.css('overflow')
        box.css('overflow', 'hidden')
        let prom = w2utils.message({
            owner: this,
            box  : box.get(0),
            after: '.w2ui-panel-title',
            param: panel
        }, options)
        if (prom) {
            prom.self.on('close:after', () => {
                box.css('overflow', oldOverflow)
            })
        }
        return prom
    }

    confirm(panel, options) {
        let p = this.get(panel)
        let box = query(this.box).find('#layout_'+ this.name + '_panel_'+ p.type)
        let oldOverflow = box.css('overflow')
        box.css('overflow', 'hidden')
        let prom = w2utils.confirm({
            owner : this,
            box   : box.get(0),
            after : '.w2ui-panel-title',
            param : panel
        }, options)
        if (prom) {
            prom.self.on('close:after', () => {
                box.css('overflow', oldOverflow)
            })
        }
        return prom
    }

    load(panel, url, transition) {
        return new Promise((resolve, reject) => {
            if ((panel == 'css' || this.get(panel) != null) && url != null) {
                fetch(url)
                    .then(resp => resp.text())
                    .then(text => {
                        this.resize()
                        resolve(this.html(panel, text, transition))
                    })
            } else {
                reject()
            }
        })
    }

    sizeTo(panel, size, instant) {
        let pan = this.get(panel)
        if (pan == null) return false
        // resize
        query(this.box).find(':scope > div > .w2ui-panel')
            .css('transition', (instant !== true ? '.2s' : '0s'))
        setTimeout(() => { this.set(panel, { size: size }) }, 1)
        // clean
        setTimeout(() => {
            query(this.box).find(':scope > div > .w2ui-panel').css('transition', '0s')
            this.resize()
        }, 300)
        return true
    }

    show(panel, immediate) {
        // event before
        let edata = this.trigger('show', { target: panel, thisect: this.get(panel), immediate: immediate })
        if (edata.isCancelled === true) return

        let p = this.get(panel)
        if (p == null) return false
        p.hidden = false
        if (immediate === true) {
            query(this.box).find('#layout_'+ this.name +'_panel_'+panel)
                .css({ 'opacity': '1' })
            edata.finish()
            this.resize()
        } else {
            // resize
            query(this.box).addClass('animating')
            query(this.box).find('#layout_'+ this.name +'_panel_'+panel)
                .css({ 'opacity': '0' })
            query(this.box).find(':scope > div > .w2ui-panel')
                .css('transition', '.2s')
            setTimeout(() => { this.resize() }, 1)
            // show
            setTimeout(() => {
                query(this.box).find('#layout_'+ this.name +'_panel_'+ panel).css({ 'opacity': '1' })
            }, 250)
            // clean
            setTimeout(() => {
                query(this.box).find(':scope > div > .w2ui-panel')
                    .css('transition', '0s')
                query(this.box).removeClass('animating')
                edata.finish()
                this.resize()
            }, 300)
        }
        return true
    }

    hide(panel, immediate) {
        // event before
        let edata = this.trigger('hide', { target: panel, object: this.get(panel), immediate: immediate })
        if (edata.isCancelled === true) return

        let p = this.get(panel)
        if (p == null) return false
        p.hidden = true
        if (immediate === true) {
            query(this.box).find('#layout_'+ this.name +'_panel_'+panel)
                .css({ 'opacity': '0' })
            edata.finish()
            this.resize()
        } else {
            // hide
            query(this.box).addClass('animating')
            query(this.box).find(':scope > div > .w2ui-panel')
                .css('transition', '.2s')
            query(this.box).find('#layout_'+ this.name +'_panel_'+panel)
                .css({ 'opacity': '0' })
            setTimeout(() => { this.resize() }, 1)
            // clean
            setTimeout(() => {
                query(this.box).find(':scope > div > .w2ui-panel')
                    .css('transition', '0s')
                query(this.box).removeClass('animating')
                edata.finish()
                this.resize()
            }, 300)
        }
        return true
    }

    toggle(panel, immediate) {
        let p = this.get(panel)
        if (p == null) return false
        if (p.hidden) return this.show(panel, immediate); else return this.hide(panel, immediate)
    }

    set(panel, options) {
        let ind = this.get(panel, true)
        if (ind == null) return false
        w2utils.extend(this.panels[ind], options)
        // refresh only when content changed
        if (options.html != null || options.resizable != null) {
            this.refresh(panel)
        }
        // show/hide resizer
        this.resize() // resize is needed when panel size is changed
        return true
    }

    get(panel, returnIndex) {
        for (let p = 0; p < this.panels.length; p++) {
            if (this.panels[p].type == panel) {
                if (returnIndex === true) return p; else return this.panels[p]
            }
        }
        return null
    }

    el(panel) {
        let el = query(this.box).find('#layout_'+ this.name +'_panel_'+ panel +'> [data-role="panel-content"]')
        if (el.length != 1) return null
        return el[0]
    }

    hideToolbar(panel) {
        let pan = this.get(panel)
        if (!pan) return
        pan.show.toolbar = false
        query(this.box).find(`#layout_${this.name}_panel_${panel} > [data-role="panel-toolbar"]`).hide()
        this.resize()
    }

    showToolbar(panel) {
        let pan = this.get(panel)
        if (!pan) return
        pan.show.toolbar = true
        query(this.box).find(`#layout_${this.name}_panel_${panel} > [data-role="panel-toolbar"]`).show()
        this.resize()
    }

    toggleToolbar(panel) {
        let pan = this.get(panel)
        if (!pan) return
        if (pan.show.toolbar) this.hideToolbar(panel); else this.showToolbar(panel)
    }

    assignToolbar(panel, toolbar) {
        if (typeof toolbar == 'string' && w2ui[toolbar] != null) toolbar = w2ui[toolbar]
        let pan = this.get(panel)
        pan.toolbar = toolbar
        let tmp = query(this.box).find(panel +'> [data-role="panel-toolbar"]')
        if (pan.toolbar != null) {
            if (tmp.attr('name') != pan.toolbar.name) {
                pan.toolbar.render(tmp.get(0))
            } else if (pan.toolbar != null) {
                pan.toolbar.refresh()
            }
            toolbar.owner = this
            this.showToolbar(panel)
            this.refresh(panel)
        } else {
            tmp.html('')
            this.hideToolbar(panel)
        }
    }

    hideTabs(panel) {
        let pan = this.get(panel)
        if (!pan) return
        pan.show.tabs = false
        query(this.box).find('#layout_'+ this.name +'_panel_'+ panel +'> [data-role="panel-tabs"]').hide()
        this.resize()
    }

    showTabs(panel) {
        let pan = this.get(panel)
        if (!pan) return
        pan.show.tabs = true
        query(this.box).find('#layout_'+ this.name +'_panel_'+ panel +'> [data-role="panel-tabs"]').show()
        this.resize()
    }

    toggleTabs(panel) {
        let pan = this.get(panel)
        if (!pan) return
        if (pan.show.tabs) this.hideTabs(panel); else this.showTabs(panel)
    }

    render(box) {
        let time = Date.now()
        let self = this
        if (typeof box == 'string') box = query(box).get(0)
        // if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection
        // event before
        let edata = this.trigger('render', { target: this.name, box: box ?? this.box })
        if (edata.isCancelled === true) return
        // default action
        if (box != null) {
            this.unmount() // clean previous control
            this.box = box
        }
        if (!this.box) return false
        // render layout
        query(this.box)
            .attr('name', this.name)
            .addClass('w2ui-layout')
            .html('<div></div>')
        if (query(this.box).length > 0) {
            query(this.box)[0].style.cssText += this.style
        }
        // create all panels
        for (let p1 = 0; p1 < w2panels.length; p1++) {
            let html = '<div id="layout_'+ this.name + '_panel_'+ w2panels[p1] +'" class="w2ui-panel">'+
                        '    <div class="w2ui-panel-title"></div>'+
                        '    <div class="w2ui-panel-tabs" data-role="panel-tabs"></div>'+
                        '    <div class="w2ui-panel-toolbar" data-role="panel-toolbar"></div>'+
                        '    <div class="w2ui-panel-content" data-role="panel-content"></div>'+
                        '</div>'+
                        '<div id="layout_'+ this.name + '_resizer_'+ w2panels[p1] +'" class="w2ui-resizer"></div>'
            query(this.box).find(':scope > div').append(html)
        }
        query(this.box).find(':scope > div')
            .append('<div id="layout_'+ this.name + '_panel_css" style="position: absolute; top: 10000px;"></div>')
        this.refresh() // if refresh is not called here, the layout will not be available right after initialization
        // observe div resize
        this.last.observeResize = new ResizeObserver(() => { this.resize() })
        this.last.observeResize.observe(this.box)
        // process event
        edata.finish()
        // re-init events
        setTimeout(() => { // needed this timeout to allow browser to render first if there are tabs or toolbar
            self.last.events = { resizeStart, mouseMove, mouseUp }
            this.resize()
        }, 0)
        return Date.now() - time

        function resizeStart(type, evnt) {
            if (!self.box) return
            if (!evnt) evnt = window.event
            query(document)
                .off('mousemove', self.last.events.mouseMove)
                .on('mousemove', self.last.events.mouseMove)
            query(document)
                .off('mouseup', self.last.events.mouseUp)
                .on('mouseup', self.last.events.mouseUp)
            self.last.resize = {
                type    : type,
                x       : evnt.screenX,
                y       : evnt.screenY,
                diff_x  : 0,
                diff_y  : 0,
                value   : 0
            }
            // lock all panels
            w2panels.forEach(panel => {
                let $tmp = query(self.el(panel)).find('.w2ui-lock')
                if ($tmp.length > 0) {
                    $tmp.data('locked', 'yes')
                } else {
                    self.lock(panel, { opacity: 0 })
                }
            })
            let el = query(self.box).find('#layout_'+ self.name +'_resizer_'+ type).get(0)
            if (type == 'left' || type == 'right') {
                self.last.resize.value = parseInt(el.style.left)
            }
            if (type == 'top' || type == 'preview' || type == 'bottom') {
                self.last.resize.value = parseInt(el.style.top)
            }
        }

        function mouseUp(evnt) {
            if (!self.box) return
            if (!evnt) evnt = window.event
            query(document).off('mousemove', self.last.events.mouseMove)
            query(document).off('mouseup', self.last.events.mouseUp)
            if (self.last.resize == null) return
            // unlock all panels
            w2panels.forEach(panel => {
                let $tmp = query(self.el(panel)).find('.w2ui-lock')
                if ($tmp.data('locked') == 'yes') {
                    $tmp.removeData('locked')
                } else {
                    self.unlock(panel)
                }
            })
            // set new size
            if (self.last.diff_x !== 0 || self.last.resize.diff_y !== 0) { // only recalculate if changed
                let ptop    = self.get('top')
                let pbottom = self.get('bottom')
                let panel   = self.get(self.last.resize.type)
                let width   = w2utils.getSize(query(self.box), 'width')
                let height  = w2utils.getSize(query(self.box), 'height')
                let str     = String(panel.size)
                let ns, nd
                switch (self.last.resize.type) {
                    case 'top':
                        ns = parseInt(panel.sizeCalculated) + self.last.resize.diff_y
                        nd = 0
                        break
                    case 'bottom':
                        ns = parseInt(panel.sizeCalculated) - self.last.resize.diff_y
                        nd = 0
                        break
                    case 'preview':
                        ns = parseInt(panel.sizeCalculated) - self.last.resize.diff_y
                        nd = (ptop && !ptop.hidden ? ptop.sizeCalculated : 0) +
                            (pbottom && !pbottom.hidden ? pbottom.sizeCalculated : 0)
                        break
                    case 'left':
                        ns = parseInt(panel.sizeCalculated) + self.last.resize.diff_x
                        nd = 0
                        break
                    case 'right':
                        ns = parseInt(panel.sizeCalculated) - self.last.resize.diff_x
                        nd = 0
                        break
                }
                // set size
                if (str.substr(str.length-1) == '%') {
                    panel.size = Math.floor(ns * 100 / (panel.type == 'left' || panel.type == 'right' ? width : height - nd) * 100) / 100 + '%'
                } else {
                    if (String(panel.size).substr(0, 1) == '-') {
                        panel.size = parseInt(panel.size) - panel.sizeCalculated + ns
                    } else {
                        panel.size = ns
                    }
                }
                self.resize()
            }
            query(self.box)
                .find('#layout_'+ self.name + '_resizer_'+ self.last.resize.type)
                .removeClass('active')
            delete self.last.resize
        }

        function mouseMove(evnt) {
            if (!self.box) return
            if (!evnt) evnt = window.event
            if (self.last.resize == null) return
            let panel = self.get(self.last.resize.type)
            // event before
            let tmp   = self.last.resize
            let edata = self.trigger('resizing', { target: self.name, object: panel, originalEvent: evnt,
                panel: tmp ? tmp.type : 'all', diff_x: tmp ? tmp.diff_x : 0, diff_y: tmp ? tmp.diff_y : 0 })
            if (edata.isCancelled === true) return

            let p         = query(self.box).find('#layout_'+ self.name + '_resizer_'+ tmp.type)
            let resize_x  = (evnt.screenX - tmp.x)
            let resize_y  = (evnt.screenY - tmp.y)
            let mainPanel = self.get('main')

            if (!p.hasClass('active')) p.addClass('active')

            switch (tmp.type) {
                case 'left':
                    if (panel.minSize - resize_x > panel.width) {
                        resize_x = panel.minSize - panel.width
                    }
                    if (panel.maxSize && (panel.width + resize_x > panel.maxSize)) {
                        resize_x = panel.maxSize - panel.width
                    }
                    if (mainPanel.minSize + resize_x > mainPanel.width) {
                        resize_x = mainPanel.width - mainPanel.minSize
                    }
                    break

                case 'right':
                    if (panel.minSize + resize_x > panel.width) {
                        resize_x = panel.width - panel.minSize
                    }
                    if (panel.maxSize && (panel.width - resize_x > panel.maxSize)) {
                        resize_x = panel.width - panel.maxSize
                    }
                    if (mainPanel.minSize - resize_x > mainPanel.width) {
                        resize_x = mainPanel.minSize - mainPanel.width
                    }
                    break

                case 'top':
                    if (panel.minSize - resize_y > panel.height) {
                        resize_y = panel.minSize - panel.height
                    }
                    if (panel.maxSize && (panel.height + resize_y > panel.maxSize)) {
                        resize_y = panel.maxSize - panel.height
                    }
                    if (mainPanel.minSize + resize_y > mainPanel.height) {
                        resize_y = mainPanel.height - mainPanel.minSize
                    }
                    break

                case 'preview':
                case 'bottom':
                    if (panel.minSize + resize_y > panel.height) {
                        resize_y = panel.height - panel.minSize
                    }
                    if (panel.maxSize && (panel.height - resize_y > panel.maxSize)) {
                        resize_y = panel.height - panel.maxSize
                    }
                    if (mainPanel.minSize - resize_y > mainPanel.height) {
                        resize_y = mainPanel.minSize - mainPanel.height
                    }
                    break
            }
            tmp.diff_x = resize_x
            tmp.diff_y = resize_y

            switch (tmp.type) {
                case 'top':
                case 'preview':
                case 'bottom':
                    tmp.diff_x = 0
                    if (p.length > 0) p[0].style.top = (tmp.value + tmp.diff_y) + 'px'
                    break

                case 'left':
                case 'right':
                    tmp.diff_y = 0
                    if (p.length > 0) p[0].style.left = (tmp.value + tmp.diff_x) + 'px'
                    break
            }
            // event after
            edata.finish()
        }
    }

    unmount() {
        super.unmount()
        this.panels.forEach(panel => {
            panel.tabs?.unmount?.()
            panel.toolbar?.unmount?.()
        })
        this.last.observeResize?.disconnect()
    }

    destroy() {
        // event before
        let edata = this.trigger('destroy', { target: this.name })
        if (edata.isCancelled === true) return
        if (w2ui[this.name] == null) return false
        // clean up
        this.panels.forEach(panel => {
            panel.tabs?.destroy?.()
            panel.toolbar?.destroy?.()
        })
        if (query(this.box).find('#layout_'+ this.name +'_panel_main').length > 0) {
            this.unmount()
        }
        delete w2ui[this.name]
        // event after
        edata.finish()
        if (this.last.events && this.last.events.resize) {
            query(window).off('resize', this.last.events.resize)
        }
        return true
    }

    refresh(panel) {
        let self = this
        // if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection
        if (panel == null) panel = null
        let time = Date.now()
        // event before
        let edata = self.trigger('refresh', { target: (panel != null ? panel : self.name), object: self.get(panel) })
        if (edata.isCancelled === true) return
        // self.unlock(panel);
        if (typeof panel == 'string') {
            let p = self.get(panel)
            if (p == null) return
            let pname = '#layout_'+ self.name + '_panel_'+ p.type
            let rname = '#layout_'+ self.name +'_resizer_'+ p.type
            // apply properties to the panel
            query(self.box).find(pname).css({ display: p.hidden ? 'none' : 'block' })
            if (p.resizable) {
                query(self.box).find(rname).show()
            } else {
                query(self.box).find(rname).hide()
            }
            // insert content
            if (typeof p.html == 'object' && typeof p.html.render === 'function') {
                p.html.box = query(self.box).find(pname +'> [data-role="panel-content"]')[0]
                setTimeout(() => {
                    // need to remove unnecessary classes
                    if (query(self.box).find(pname +'> [data-role="panel-content"]').length > 0) {
                        query(self.box).find(pname +'> [data-role="panel-content"]')
                            .removeClass()
                            .removeAttr('name')
                            .addClass('w2ui-panel-content')
                            .css('overflow', p.overflow)[0].style.cssText += ';' + p.style
                    }
                    if (p.html && typeof p.html.render == 'function') {
                        p.html.render() // do not do .render(box);
                    }
                }, 1)
            } else {
                // need to remove unnecessary classes
                if (query(self.box).find(pname +'> [data-role="panel-content"]').length > 0) {
                    query(self.box).find(pname +'> [data-role="panel-content"]')
                        .removeClass()
                        .removeAttr('name')
                        .addClass('w2ui-panel-content')
                        .html(p.html)
                        .css('overflow', p.overflow)[0].style.cssText += ';' + p.style
                }
            }
            // if there are tabs and/or toolbar - render it
            let tmp = query(self.box).find(pname +'> [data-role="panel-tabs"]')
            if (p.show.tabs) {
                if (tmp.attr('name') != p.tabs.name && p.tabs != null) {
                    p.tabs.render(tmp.get(0))
                } else {
                    p.tabs.refresh()
                }
                tmp.addClass('w2ui-panel-tabs')
            } else {
                tmp.html('').removeAttr('name').removeClass('w2ui-tabs').hide()
            }
            tmp = query(self.box).find(pname +'> [data-role="panel-toolbar"]')
            if (p.show.toolbar) {
                if (tmp.attr('name') != p.toolbar.name && p.toolbar != null) {
                    p.toolbar.render(tmp.get(0))
                } else {
                    p.toolbar.refresh()
                }
                tmp.addClass('w2ui-panel-toolbar')
            } else {
                tmp.html('').removeAttr('name').removeClass('w2ui-toolbar').hide()
            }
            // show title
            tmp = query(self.box).find(pname +'> .w2ui-panel-title')
            if (p.title) {
                tmp.html(p.title).show()
            } else {
                tmp.html('').hide()
            }
        } else {
            if (query(self.box).find('#layout_'+ self.name +'_panel_main').length === 0) {
                self.render()
                return
            }
            self.resize()
            // refresh all of them
            for (let p1 = 0; p1 < this.panels.length; p1++) { self.refresh(this.panels[p1].type) }
        }
        edata.finish()
        return Date.now() - time
    }

    resize() {
        // if (window.getSelection) window.getSelection().removeAllRanges();    // clear selection
        if (!this.box) return false
        let time = Date.now()
        // event before
        let tmp   = this.last.resize
        let edata = this.trigger('resize', { target: this.name,
            panel: tmp ? tmp.type : 'all', diff_x: tmp ? tmp.diff_x : 0, diff_y: tmp ? tmp.diff_y : 0 })
        if (edata.isCancelled === true) return
        if (this.padding < 0) this.padding = 0

        // layout itself
        // width includes border and padding, we need to exclude that so panels
        // are sized correctly
        let width  = w2utils.getSize(query(this.box), 'width')
        let height = w2utils.getSize(query(this.box), 'height')
        let self = this
        // panels
        let pmain   = this.get('main')
        let pprev   = this.get('preview')
        let pleft   = this.get('left')
        let pright  = this.get('right')
        let ptop    = this.get('top')
        let pbottom = this.get('bottom')
        let sprev   = (pprev != null && pprev.hidden !== true ? true : false)
        let sleft   = (pleft != null && pleft.hidden !== true ? true : false)
        let sright  = (pright != null && pright.hidden !== true ? true : false)
        let stop    = (ptop != null && ptop.hidden !== true ? true : false)
        let sbottom = (pbottom != null && pbottom.hidden !== true ? true : false)
        let l, t, w, h
        // calculate %
        for (let p = 0; p < w2panels.length; p++) {
            if (w2panels[p] === 'main') continue
            tmp = this.get(w2panels[p])
            if (!tmp) continue
            let str = String(tmp.size || 0)
            if (str.substr(str.length-1) == '%') {
                let tmph = height
                if (tmp.type == 'preview') {
                    tmph = tmph -
                        (ptop && !ptop.hidden ? ptop.sizeCalculated : 0) -
                        (pbottom && !pbottom.hidden ? pbottom.sizeCalculated : 0)
                }
                tmp.sizeCalculated = parseInt((tmp.type == 'left' || tmp.type == 'right' ? width : tmph) * parseFloat(tmp.size) / 100)
            } else {
                tmp.sizeCalculated = parseInt(tmp.size)
            }
            tmp.sizeCalculated = Math.max(tmp.sizeCalculated, parseInt(tmp.minSize))
        }
        // negative size
        if (String(pright.size).substr(0, 1) == '-') {
            if (sleft && String(pleft.size).substr(0, 1) == '-') {
                console.log('ERROR: you cannot have both left panel.size and right panel.size be negative.')
            } else {
                pright.sizeCalculated = width - (sleft ? pleft.sizeCalculated : 0) + parseInt(pright.size)
            }
        }
        if (String(pleft.size).substr(0, 1) == '-') {
            if (sright && String(pright.size).substr(0, 1) == '-') {
                console.log('ERROR: you cannot have both left panel.size and right panel.size be negative.')
            } else {
                pleft.sizeCalculated = width - (sright ? pright.sizeCalculated : 0) + parseInt(pleft.size)
            }
        }
        // top if any
        if (ptop != null && ptop.hidden !== true) {
            l = 0
            t = 0
            w = width
            h = ptop.sizeCalculated
            query(this.box).find('#layout_'+ this.name +'_panel_top')
                .css({
                    'display': 'block',
                    'left': l + 'px',
                    'top': t + 'px',
                    'width': w + 'px',
                    'height': h + 'px'
                })
            ptop.width  = w
            ptop.height = h
            // resizer
            if (ptop.resizable) {
                t = ptop.sizeCalculated - (this.padding === 0 ? this.resizer : 0)
                h = (this.resizer > this.padding ? this.resizer : this.padding)
                query(this.box).find('#layout_'+ this.name +'_resizer_top')
                    .css({
                        'display': 'block',
                        'left': l + 'px',
                        'top': t + 'px',
                        'width': w + 'px',
                        'height': h + 'px',
                        'cursor': 'ns-resize'
                    })
                    .off('mousedown')
                    .on('mousedown', function(event) {
                        event.preventDefault()
                        // event before
                        let edata = self.trigger('resizerClick', { target: 'top', originalEvent: event })
                        if (edata.isCancelled === true) return
                        // default action
                        w2ui[self.name].last.events.resizeStart('top', event)
                        // event after
                        edata.finish()
                        return false
                    })
            }
        } else {
            query(this.box).find('#layout_'+ this.name +'_panel_top').hide()
            query(this.box).find('#layout_'+ this.name +'_resizer_top').hide()
        }
        // left if any
        if (pleft != null && pleft.hidden !== true) {
            l = 0
            t = 0 + (stop ? ptop.sizeCalculated + this.padding : 0)
            w = pleft.sizeCalculated
            h = height - (stop ? ptop.sizeCalculated + this.padding : 0) -
                    (sbottom ? pbottom.sizeCalculated + this.padding : 0)
            query(this.box).find('#layout_'+ this.name +'_panel_left')
                .css({
                    'display': 'block',
                    'left': l + 'px',
                    'top': t + 'px',
                    'width': w + 'px',
                    'height': h + 'px'
                })
            pleft.width  = w
            pleft.height = h
            // resizer
            if (pleft.resizable) {
                l = pleft.sizeCalculated - (this.padding === 0 ? this.resizer : 0)
                w = (this.resizer > this.padding ? this.resizer : this.padding)
                query(this.box).find('#layout_'+ this.name +'_resizer_left')
                    .css({
                        'display': 'block',
                        'left': l + 'px',
                        'top': t + 'px',
                        'width': w + 'px',
                        'height': h + 'px',
                        'cursor': 'ew-resize'
                    })
                    .off('mousedown')
                    .on('mousedown', function(event) {
                        event.preventDefault()
                        // event before
                        let edata = self.trigger('resizerClick', { target: 'left', originalEvent: event })
                        if (edata.isCancelled === true) return
                        // default action
                        w2ui[self.name].last.events.resizeStart('left', event)
                        // event after
                        edata.finish()
                        return false
                    })
            }
        } else {
            query(this.box).find('#layout_'+ this.name +'_panel_left').hide()
            query(this.box).find('#layout_'+ this.name +'_resizer_left').hide()
        }
        // right if any
        if (pright != null && pright.hidden !== true) {
            l = width - pright.sizeCalculated
            t = 0 + (stop ? ptop.sizeCalculated + this.padding : 0)
            w = pright.sizeCalculated
            h = height - (stop ? ptop.sizeCalculated + this.padding : 0) -
                (sbottom ? pbottom.sizeCalculated + this.padding : 0)
            query(this.box).find('#layout_'+ this.name +'_panel_right')
                .css({
                    'display': 'block',
                    'left': l + 'px',
                    'top': t + 'px',
                    'width': w + 'px',
                    'height': h + 'px'
                })
            pright.width  = w
            pright.height = h
            // resizer
            if (pright.resizable) {
                l = l - this.padding
                w = (this.resizer > this.padding ? this.resizer : this.padding)
                query(this.box).find('#layout_'+ this.name +'_resizer_right')
                    .css({
                        'display': 'block',
                        'left': l + 'px',
                        'top': t + 'px',
                        'width': w + 'px',
                        'height': h + 'px',
                        'cursor': 'ew-resize'
                    })
                    .off('mousedown')
                    .on('mousedown', function(event) {
                        event.preventDefault()
                        // event before
                        let edata = self.trigger('resizerClick', { target: 'right', originalEvent: event })
                        if (edata.isCancelled === true) return
                        // default action
                        w2ui[self.name].last.events.resizeStart('right', event)
                        // event after
                        edata.finish()
                        return false
                    })
            }
        } else {
            query(this.box).find('#layout_'+ this.name +'_panel_right').hide()
            query(this.box).find('#layout_'+ this.name +'_resizer_right').hide()
        }
        // bottom if any
        if (pbottom != null && pbottom.hidden !== true) {
            l = 0
            t = height - pbottom.sizeCalculated
            w = width
            h = pbottom.sizeCalculated
            query(this.box).find('#layout_'+ this.name +'_panel_bottom')
                .css({
                    'display': 'block',
                    'left': l + 'px',
                    'top': t + 'px',
                    'width': w + 'px',
                    'height': h + 'px'
                })
            pbottom.width  = w
            pbottom.height = h
            // resizer
            if (pbottom.resizable) {
                t = t - (this.padding === 0 ? 0 : this.padding)
                h = (this.resizer > this.padding ? this.resizer : this.padding)
                query(this.box).find('#layout_'+ this.name +'_resizer_bottom')
                    .css({
                        'display': 'block',
                        'left': l + 'px',
                        'top': t + 'px',
                        'width': w + 'px',
                        'height': h + 'px',
                        'cursor': 'ns-resize'
                    })
                    .off('mousedown')
                    .on('mousedown', function(event) {
                        event.preventDefault()
                        // event before
                        let edata = self.trigger('resizerClick', { target: 'bottom', originalEvent: event })
                        if (edata.isCancelled === true) return
                        // default action
                        w2ui[self.name].last.events.resizeStart('bottom', event)
                        // event after
                        edata.finish()
                        return false
                    })
            }
        } else {
            query(this.box).find('#layout_'+ this.name +'_panel_bottom').hide()
            query(this.box).find('#layout_'+ this.name +'_resizer_bottom').hide()
        }
        // main - always there
        l = 0 + (sleft ? pleft.sizeCalculated + this.padding : 0)
        t = 0 + (stop ? ptop.sizeCalculated + this.padding : 0)
        w = width - (sleft ? pleft.sizeCalculated + this.padding : 0) -
            (sright ? pright.sizeCalculated + this.padding: 0)
        h = height - (stop ? ptop.sizeCalculated + this.padding : 0) -
            (sbottom ? pbottom.sizeCalculated + this.padding : 0) -
            (sprev ? pprev.sizeCalculated + this.padding : 0)
        query(this.box)
            .find('#layout_'+ this.name +'_panel_main')
            .css({
                'display': 'block',
                'left': l + 'px',
                'top': t + 'px',
                'width': w + 'px',
                'height': h + 'px'
            })
        pmain.width  = w
        pmain.height = h

        // preview if any
        if (pprev != null && pprev.hidden !== true) {
            l = 0 + (sleft ? pleft.sizeCalculated + this.padding : 0)
            t = height - (sbottom ? pbottom.sizeCalculated + this.padding : 0) - pprev.sizeCalculated
            w = width - (sleft ? pleft.sizeCalculated + this.padding : 0) -
                (sright ? pright.sizeCalculated + this.padding : 0)
            h = pprev.sizeCalculated
            query(this.box).find('#layout_'+ this.name +'_panel_preview')
                .css({
                    'display': 'block',
                    'left': l + 'px',
                    'top': t + 'px',
                    'width': w + 'px',
                    'height': h + 'px'
                })
            pprev.width  = w
            pprev.height = h
            // resizer
            if (pprev.resizable) {
                t = t - (this.padding === 0 ? 0 : this.padding)
                h = (this.resizer > this.padding ? this.resizer : this.padding)
                query(this.box).find('#layout_'+ this.name +'_resizer_preview')
                    .css({
                        'display': 'block',
                        'left': l + 'px',
                        'top': t + 'px',
                        'width': w + 'px',
                        'height': h + 'px',
                        'cursor': 'ns-resize'
                    })
                    .off('mousedown')
                    .on('mousedown', function(event) {
                        event.preventDefault()
                        // event before
                        let edata = self.trigger('resizerClick', { target: 'preview', originalEvent: event })
                        if (edata.isCancelled === true) return
                        // default action
                        w2ui[self.name].last.events.resizeStart('preview', event)
                        // event after
                        edata.finish()
                        return false
                    })
            }
        } else {
            query(this.box).find('#layout_'+ this.name +'_panel_preview').hide()
            query(this.box).find('#layout_'+ this.name +'_resizer_preview').hide()
        }

        // resizes boxes for header, tabs, toolbar inside the panel
        this.resizeBoxes()

        edata.finish()
        return Date.now() - time
    }

    resizeBoxes(panel) {
        let panels = w2panels
        if (!panel && typeof panel == 'string') panels = [panel]
        // display tabs and toolbar if needed
        panels.forEach((pname, ind) => {
            let pan = this.get(w2panels[ind])
            let tmp2 = `#layout_${this.name}_panel_${pname} > `
            let topHeight = 0
            if (pan) {
                if (pan.title) {
                    let el = query(this.box).find(tmp2 + '.w2ui-panel-title').css({ top: topHeight + 'px', display: 'block' })
                    topHeight += w2utils.getSize(el, 'height')
                }
                if (pan.show.tabs) {
                    let el = query(this.box).find(tmp2 + '[data-role="panel-tabs"]').css({ top: topHeight + 'px', display: 'block' })
                    topHeight += w2utils.getSize(el, 'height')
                }
                if (pan.show.toolbar) {
                    let el = query(this.box).find(tmp2 + '[data-role="panel-toolbar"]').css({ top: topHeight + 'px', display: 'block' })
                    topHeight += w2utils.getSize(el, 'height')
                }
            }
            query(this.box).find(tmp2 + '[data-role="panel-content"]')
                .css({
                    display: 'block',
                    top: topHeight + 'px'
                })
        })
    }

    lock(panel, msg, showSpinner) {
        if (w2panels.indexOf(panel) == -1) {
            console.log('ERROR: First parameter needs to be the a valid panel name.')
            return
        }
        let args = Array.from(arguments)
        args[0]  = '#layout_'+ this.name + '_panel_' + panel
        w2utils.lock(...args)
    }

    unlock(panel, speed) {
        if (w2panels.indexOf(panel) == -1) {
            console.log('ERROR: First parameter needs to be the a valid panel name.')
            return
        }
        let nm = '#layout_'+ this.name + '_panel_' + panel
        w2utils.unlock(nm, speed)
    }
}
export { w2layout }