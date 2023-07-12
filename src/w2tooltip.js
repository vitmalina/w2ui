/**
 * Part of w2ui 2.0 library
 * - Dependencies: mQuery, w2utils, w2base
 *
 * TODO:
 * - need help pages
 *
 * 2.0 Changes
 * - multiple tooltips to the same anchor
 * - options.contextMenu
 * - options.prefilter - if true, it will show prefiltered items for w2menu, otherwise all
 */

import { w2base } from './w2base.js'
import { w2utils } from './w2utils.js'
import { query } from './query.js'

class Tooltip {
    // no need to extend w2base, as each individual tooltip extends it
    static active = {} // all defined tooltips
    constructor() {
        this.defaults = {
            name            : null,     // name for the overlay, otherwise input id is used
            html            : '',       // text or html
            style           : '',       // additional style for the overlay
            class           : '',       // add class for w2ui-tooltip-body
            position        : 'top|bottom',   // can be left, right, top, bottom
            align           : '',       // can be: both, both:XX left, right, both, top, bottom
            anchor          : null,     // element it is attached to, if anchor is body, then it is context menu
            contextMenu     : false,    // if true, then it is context menu
            anchorClass     : '',       // add class for anchor when tooltip is shown
            anchorStyle     : '',       // add style for anchor when tooltip is shown
            autoShow        : false,    // if autoShow true, then tooltip will show on mouseEnter and hide on mouseLeave
            autoShowOn      : null,     // when options.autoShow = true, mouse event to show on
            autoHideOn      : null,     // when options.autoShow = true, mouse event to hide on
            arrowSize       : 8,        // size of the carret
            screenMargin    : 2,        // min margin from screen to tooltip
            autoResize      : true,     // auto resize based on content size and available size
            margin          : 1,        // distance from the anchor
            offsetX         : 0,        // delta for left coordinate
            offsetY         : 0,        // delta for top coordinate
            maxWidth        : null,     // max width
            maxHeight       : null,     // max height
            watchScroll     : null,     // attach to onScroll event // TODO:
            watchResize     : null,     // attach to onResize event // TODO:
            hideOn          : null,     // events when to hide tooltip, ['click', 'change', 'key', 'focus', 'blur'],
            onThen          : null,     // called when displayed
            onShow          : null,     // callBack when shown
            onHide          : null,     // callBack when hidden
            onUpdate        : null,     // callback when tooltip gets updated
            onMove          : null      // callback when tooltip is moved
        }
    }

    static observeRemove = new MutationObserver((mutations) => {
        let cnt = 0
        Object.keys(Tooltip.active).forEach(name => {
            let overlay = Tooltip.active[name]
            if (overlay.displayed) {
                if (!overlay.anchor || !overlay.anchor.isConnected) {
                    overlay.hide()
                } else {
                    cnt++
                }
            }
        })
        // remove observer, as there is no active tooltips
        if (cnt === 0) {
            Tooltip.observeRemove.disconnect()
        }
    })

    trigger(event, data) {
        if (arguments.length == 2) {
            let type = event
            event = data
            data.type = type
        }
        if (event.overlay) {
            return event.overlay.trigger(event)
        } else {
            console.log('ERROR: cannot find overlay where to trigger events')
        }
    }

    get(name) {
        if (arguments.length == 0) {
            return Object.keys(Tooltip.active)
        } else if (name === true) {
            return Tooltip.active
        } else {
            return Tooltip.active[name.replace(/[\s\.#]/g, '_')]
        }
    }

    attach(anchor, text) {
        let options, overlay
        let self = this
        if (arguments.length == 0) {
            return
        } else if (arguments.length == 1 && anchor instanceof Object) {
            options = anchor
            anchor = options.anchor
        } else if (arguments.length === 2 && typeof text === 'string') {
            options = { anchor, html: text }
            text = options.html
        } else if (arguments.length === 2 && text != null && typeof text === 'object') {
            options = text
            text = options.html
        }
        options = w2utils.extend({}, this.defaults, options || {})
        if (!text && options.text) text = options.text
        if (!text && options.html) text = options.html
        // anchor is func var
        delete options.anchor

        // define tooltip
        let name = (options.name ? options.name : anchor?.id)
        if (anchor == document || anchor == document.body || options.contextMenu) {
            anchor = document.body
            name = 'context-menu'
        }
        if (!name) {
            name = 'noname-' + Object.keys(Tooltip.active).length
            console.log('NOTICE: name property is not defined for tooltip, could lead to too many instances')
        }
        // clean name as it is used as id and css selector
        name = name.replace(/[\s\.#]/g, '_')
        if (Tooltip.active[name]) {
            overlay = Tooltip.active[name]
            overlay.prevOptions = overlay.options
            overlay.options = options // do not merge or extend, otherwiser menu items get merged too
            // overlay.options = w2utils.extend({}, overlay.options, options)
            overlay.anchor  = anchor // as HTML elements are not copied
            if (overlay.prevOptions.html != overlay.options.html || overlay.prevOptions.class != overlay.options.class
                    || overlay.prevOptions.style != overlay.options.style) {
                overlay.needsUpdate = true
            }
            options = overlay.options // it was recreated
        } else {
            overlay = new w2base()
            Object.assign(overlay, {
                id: 'w2overlay-' + name,
                name, options, anchor, self,
                displayed: false,
                tmp: {
                    observeResize: new ResizeObserver(() => {
                        this.resize(overlay.name)
                    })
                },
                hide() {
                    self.hide(name)
                }
            })
            Tooltip.active[name] = overlay
        }
        // move events on to overlay layer
        Object.keys(overlay.options).forEach(key => {
            let val = overlay.options[key]
            if (key.startsWith('on') && typeof val == 'function') {
                overlay[key] = val
                delete overlay.options[key]
            }
        })
        // add event for auto show/hide
        if (options.autoShow === true) {
            options.autoShowOn = options.autoShowOn ?? 'mouseenter'
            options.autoHideOn = options.autoHideOn ?? 'mouseleave'
            options.autoShow = false
            options._keep = true
        }
        if (options.autoShowOn) {
            let scope = 'autoShow-' + overlay.name
            query(anchor)
                .off(`.${scope}`)
                .on(`${options.autoShowOn}.${scope}`, event => {
                    self.show(overlay.name)
                    event.stopPropagation()
                })
            delete options.autoShowOn
            options._keep = true
        }
        if (options.autoHideOn) {
            let scope = 'autoHide-' + overlay.name
            query(anchor)
                .off(`.${scope}`)
                .on(`${options.autoHideOn}.${scope}`, event => {
                    self.hide(overlay.name)
                    event.stopPropagation()
                })
            delete options.autoHideOn
            options._keep = true
        }
        overlay.off('.attach')
        let ret = {
            overlay,
            then: (callback) => {
                overlay.on('show:after.attach', event => { callback(event) })
                return ret
            },
            show: (callback) => {
                overlay.on('show.attach', event => { callback(event) })
                return ret
            },
            hide: (callback) => {
                overlay.on('hide.attach', event => { callback(event) })
                return ret
            },
            update: (callback) => {
                overlay.on('update.attach', event => { callback(event) })
                return ret
            },
            move: (callback) => {
                overlay.on('move.attach', event => { callback(event) })
                return ret
            }
        }
        return ret
    }

    update(name, html) {
        let overlay = Tooltip.active[name]
        if (overlay) {
            overlay.needsUpdate = true
            overlay.options.html = html
            this.show(name)
        } else {
            console.log(`Tooltip "${name}" is not displayed. Cannot update it.`)
        }
    }

    show(name) {
        if (name instanceof HTMLElement || name instanceof Object) {
            let options = name
            if (name instanceof HTMLElement) {
                options = arguments[1] || {}
                options.anchor = name
            }
            let ret = this.attach(options)
            query(ret.overlay.anchor)
                .off('.autoShow-' + ret.overlay.name)
                .off('.autoHide-' + ret.overlay.name)
            // need a timer, so that events would be preperty set
            setTimeout(() => {
                this.show(ret.overlay.name)
                if (this.initControls) {
                    this.initControls(ret.overlay)
                }
            }, 1)
            return ret
        }
        let edata
        let self = this
        let overlay = Tooltip.active[name.replace(/[\s\.#]/g, '_')]
        if (!overlay) return
        let options = overlay.options
        if (!overlay || (overlay.displayed && !overlay.needsUpdate)) {
            this.resize(overlay?.name)
            return
        }
        let position = options.position.split('|')
        let isVertical = ['top', 'bottom'].includes(position[0])
        // enforce nowrap only when align=both and vertical
        let overlayStyles = (options.align == 'both' && isVertical ? '' : 'white-space: nowrap;')
        if (options.maxWidth && w2utils.getStrWidth(options.html, '') > options.maxWidth) {
            overlayStyles = 'width: '+ options.maxWidth + 'px; white-space: inherit; overflow: auto;'
        }
        overlayStyles += ' max-height: '+ (options.maxHeight ? options.maxHeight : window.innerHeight - 4) + 'px;'
        // if empty content - then hide it
        if (options.html === '' || options.html == null) {
            self.hide(name)
            return
        } else if (overlay.box) {
            // if already present, update it
            edata = this.trigger('update', { target: name, overlay })
            if (edata.isCancelled === true) {
                // restore previous options
                if (overlay.prevOptions) {
                    overlay.options = overlay.prevOptions
                    delete overlay.prevOptions
                }
                return
            }
            query(overlay.box)
                .find('.w2ui-overlay-body')
                .attr('style', (options.style || '') + '; ' + overlayStyles)
                .removeClass() // removes all classes
                .addClass('w2ui-overlay-body ' + options.class)
                .html(options.html)
            this.resize(overlay.name)
        } else {
            // event before
            edata = this.trigger('show', { target: name, overlay })
            if (edata.isCancelled === true) return
            // normal processing
            query('body').append(
                // pointer-events will be re-enabled leter
                `<div id="${overlay.id}" name="${name}" style="display: none; pointer-events: none" class="w2ui-overlay"
                        data-click="stop" data-focusin="stop">
                    <style></style>
                    <div class="w2ui-overlay-body ${options.class}" style="${options.style || ''}; ${overlayStyles}">
                        ${options.html}
                    </div>
                </div>`)
            overlay.box = query('#'+w2utils.escapeId(overlay.id))[0]
            overlay.displayed = true
            let names = query(overlay.anchor).data('tooltipName') ?? []
            names.push(name)
            query(overlay.anchor).data('tooltipName', names) // make available to element overlay attached to
            w2utils.bindEvents(overlay.box, {})
            // remember anchor's original styles
            overlay.tmp.originalCSS = ''
            if (query(overlay.anchor).length > 0) {
                overlay.tmp.originalCSS = query(overlay.anchor)[0].style.cssText
            }
            this.resize(overlay.name)
        }
        if (options.anchorStyle) {
            overlay.anchor.style.cssText += ';' + options.anchorStyle
        }
        if (options.anchorClass) {
            // do not add w2ui-focus to body
            if (!(options.anchorClass == 'w2ui-focus' && overlay.anchor == document.body)) {
                query(overlay.anchor).addClass(options.anchorClass)
            }
        }
        // add on hide events
        if (typeof options.hideOn == 'string') options.hideOn = [options.hideOn]
        if (!Array.isArray(options.hideOn)) options.hideOn = []
        // initial scroll
        Object.assign(overlay.tmp, {
            scrollLeft: document.body.scrollLeft,
            scrollTop: document.body.scrollTop
        })
        addHideEvents()
        addWatchEvents(document.body)
        // first show empty tooltip, so it will popup up in the right position
        query(overlay.box).show()
        overlay.tmp.observeResize.observe(overlay.box)
        // observer element removal from DOM
        Tooltip.observeRemove.observe(document.body, { subtree: true, childList: true })
        // then insert html and it will adjust
        query(overlay.box)
            .css('opacity', 1)
            .find('.w2ui-overlay-body')
            .html(options.html)
        /**
         * pointer-events: none is needed to avoid cases when popup is shown right under the cursor
         * or it will trigger onmouseout, onmouseleave and other events.
         */
        setTimeout(() => { query(overlay.box).css({ 'pointer-events': 'auto' }).data('ready', 'yes') }, 100)
        delete overlay.needsUpdate
        // expose overlay to DOM element
        overlay.box.overlay = overlay
        // event after
        if (edata) edata.finish()
        return { overlay }

        function addWatchEvents(el) {
            let scope = 'tooltip-' + overlay.name
            let queryEl = el
            if (el.tagName == 'BODY') {
                queryEl = el.ownerDocument
            }
            query(queryEl)
                .off(`.${scope}`)
                .on(`scroll.${scope}`, event => {
                    Object.assign(overlay.tmp, {
                        scrollLeft: el.scrollLeft,
                        scrollTop: el.scrollTop
                    })
                    self.resize(overlay.name)
                })
        }

        function addHideEvents() {
            let hide = (event) => { self.hide(overlay.name) }
            let $anchor = query(overlay.anchor)
            let scope = 'tooltip-' + overlay.name
            // document click
            query('body').off(`.${scope}`)
            if (options.hideOn.includes('doc-click')) {
                if (['INPUT', 'TEXTAREA'].includes(overlay.anchor.tagName)) {
                    // otherwise hides on click to focus
                    $anchor
                        .off(`.${scope}-doc`)
                        .on(`click.${scope}-doc`, (event) => { event.stopPropagation() })
                }
                query('body').on(`click.${scope}`, hide)
            }
            if (options.hideOn.includes('focus-change')) {
                query('body')
                    .on(`focusin.${scope}`, (e) => {
                        if (document.activeElement != overlay.anchor) {
                            self.hide(overlay.name)
                        }
                    })
            }
            if (['INPUT', 'TEXTAREA'].includes(overlay.anchor.tagName)) {
                $anchor.off(`.${scope}`)
                options.hideOn.forEach(event => {
                    if (['doc-click', 'focus-change'].indexOf(event) == -1) {
                        $anchor.on(`${event}.${scope}`, { once: true }, hide)
                    }
                })
            }
        }
    }

    hide(name) {
        let overlay
        if (arguments.length == 0) {
            // hide all tooltips
            Object.keys(Tooltip.active).forEach(name => { this.hide(name) })
            return
        }
        if (name instanceof HTMLElement) {
            let names = query(name).data('tooltipName') ?? []
            names.forEach(name => { this.hide(name) })
            return
        }
        if (typeof name == 'string') {
            name = name.replace(/[\s\.#]/g, '_')
            overlay = Tooltip.active[name]
        }
        if (!overlay || !overlay.box) return

        // event before
        let edata = this.trigger('hide', { target: name, overlay })
        if (edata.isCancelled === true) return

        // normal processing
        if (!overlay.options._keep) delete Tooltip.active[name]
        let scope = 'tooltip-' + overlay.name
        overlay.tmp.observeResize?.disconnect()
        if (overlay.options.watchScroll) {
            query(overlay.options.watchScroll)
                .off('.w2scroll-' + overlay.name)
        }
        // if no active tooltip then disable observeRemove
        let cnt = 0
        Object.keys(Tooltip.active).forEach(key => {
            let overlay = Tooltip.active[key]
            if (overlay.displayed) {
                cnt++
            }
        })
        if (cnt == 0) {
            Tooltip.observeRemove.disconnect()
        }
        query('body').off(`.${scope}`)   // hide to click event here
        query(document).off(`.${scope}`) // scroll event here
        // remove element
        overlay.box.remove()
        overlay.box = null
        overlay.displayed = false
        // remove name from anchor properties
        let names = query(overlay.anchor).data('tooltipName') ?? []
        let ind = names.indexOf(overlay.name)
        if (ind != -1) names.splice(names.indexOf(overlay.name), 1)
        if (names.length == 0) {
            query(overlay.anchor).removeData('tooltipName')
        } else {
            query(overlay.anchor).data('tooltipName', names)
        }
        // restore original CSS
        overlay.anchor.style.cssText = overlay.tmp.originalCSS
        query(overlay.anchor)
            .off(`.${scope}`)
            .removeClass(overlay.options.anchorClass)
        // event after
        edata.finish()
    }

    resize(name) {
        if (arguments.length == 0) {
            Object.keys(Tooltip.active).forEach(key => {
                let overlay = Tooltip.active[key]
                if (overlay.displayed) this.resize(overlay.name)
            })
            return
        }
        let overlay = Tooltip.active[name.replace(/[\s\.#]/g, '_')]
        let pos = this.getPosition(overlay.name)
        let newPos = pos.left + 'x' + pos.top
        let edata
        if (overlay.tmp.lastPos != newPos) {
            edata = this.trigger('move', { target: name, overlay, pos })
        }
        query(overlay.box)
            .css({
                left: pos.left + 'px',
                top : pos.top + 'px'
            })
            .then(query => {
                if (pos.width != null) {
                    query.css('width', pos.width + 'px')
                         .find('.w2ui-overlay-body')
                         .css('width', '100%')
                }
                if (pos.height != null) {
                    query.css('height', pos.height + 'px')
                         .find('.w2ui-overlay-body')
                         .css('height', '100%')
                }
            })
            .find('.w2ui-overlay-body')
            .removeClass('w2ui-arrow-right w2ui-arrow-left w2ui-arrow-top w2ui-arrow-bottom')
            .addClass(pos.arrow.class)
            .closest('.w2ui-overlay')
            .find('style')
            .text(pos.arrow.style)

        if (overlay.tmp.lastPos != newPos && edata) {
            overlay.tmp.lastPos = newPos
            edata.finish()
        }
    }

    getPosition(name) {
        let overlay = Tooltip.active[name.replace(/[\s\.#]/g, '_')]
        if (!overlay || !overlay.box) {
            return
        }
        let options = overlay.options
        if (overlay.tmp.resizedY || overlay.tmp.resizedX) {
            query(overlay.box).css({ width: '', height: '', scroll: 'auto' })
        }
        let scrollSize = w2utils.scrollBarSize()
        let hasScrollBarX = !(document.body.scrollWidth == document.body.clientWidth)
        let hasScrollBarY = !(document.body.scrollHeight == document.body.clientHeight)
        let max = {
            width: window.innerWidth - (hasScrollBarY ? scrollSize : 0),
            height: window.innerHeight - (hasScrollBarX ? scrollSize : 0)
        }
        let position = options.position == 'auto'
            ? 'top|bottom|right|left'.split('|')
            : Array.isArray(options.position) ? options.position : options.position.split('|')
        let isVertical = ['top', 'bottom'].includes(position[0])
        let content = overlay.box.getBoundingClientRect()
        let anchor = overlay.anchor.getBoundingClientRect()

        if (overlay.anchor == document.body) {
            // context menu
            let evt = options.originalEvent
            while(evt.originalEvent) { evt = evt.originalEvent }
            let { x, y, width, height } = evt
            anchor = { left: x - 2, top: y - 4, width, height, arrow: 'none' }
        }
        let arrowSize = options.arrowSize
        if (anchor.arrow == 'none') arrowSize = 0

        // space available
        let available = { // tipsize adjustment should be here, not in max.width/max.height
            top: anchor.top - arrowSize,
            bottom: max.height - arrowSize - (anchor.top + anchor.height) - (hasScrollBarX ? scrollSize : 0) - 2,
            left: anchor.left,
            right: max.width - (anchor.left + anchor.width) + (hasScrollBarY ? scrollSize : 0),
        }
        // size of empty tooltip
        if (content.width < 22) content.width = 22
        if (content.height < 14) content.height = 14
        let left, top, width, height // tooltip position
        let found = ''
        let arrow = {
            offset: 0,
            class: '',
            style: `#${overlay.id} { --tip-size: ${arrowSize}px; }`
        }
        let adjust   = { left: 0, top: 0 }
        let bestFit  = { posX: '', x: 0, posY: '', y: 0 }

        // find best position
        position.forEach(pos => {
            if (['top', 'bottom'].includes(pos)) {
                if (!found && (content.height + arrowSize/1.893) < available[pos]) { // 1.893 = 1 + sin(90)
                    found = pos
                }
                if (available[pos] > bestFit.y) {
                    Object.assign(bestFit, { posY: pos, y: available[pos] })
                }
            }
            if (['left', 'right'].includes(pos)) {
                if (!found && (content.width + arrowSize/1.893) < available[pos]) { // 1.893 = 1 + sin(90)
                    found = pos
                }
                if (available[pos] > bestFit.x) {
                    Object.assign(bestFit, { posX: pos, x: available[pos] })
                }
            }
        })
        // if not found, use best (greatest available space) position
        if (!found) {
            if (isVertical) {
                found = bestFit.posY
            } else {
                found = bestFit.posX
            }
        }
        if (options.autoResize) {
            if (['top', 'bottom'].includes(found)) {
                if (content.height > available[found]) {
                    height = available[found]
                    overlay.tmp.resizedY = true
                } else {
                    overlay.tmp.resizedY = false
                }
            }
            if (['left', 'right'].includes(found)) {
                if (content.width > available[found]) {
                    width = available[found]
                    overlay.tmp.resizedX = true
                } else {
                    overlay.tmp.resizedX = false
                }
            }
        }
        usePosition(found)
        if (isVertical) anchorAlignment()

        // user offset
        top += parseFloat(options.offsetY)
        left += parseFloat(options.offsetX)

        // make sure it is inside visible screen area
        screenAdjust()

        // adjust for scrollbar
        let extraTop = (found == 'top' ? -options.margin : (found == 'bottom' ? options.margin : 0))
        let extraLeft = (found == 'left' ? -options.margin : (found == 'right' ? options.margin : 0))
        top = Math.floor((top + parseFloat(extraTop)) * 100) / 100
        left = Math.floor((left + parseFloat(extraLeft)) * 100) / 100

        return { left, top, arrow, adjust, width, height, pos: found }

        function usePosition(pos) {
            arrow.class = anchor.arrow ? anchor.arrow : `w2ui-arrow-${pos}`
            switch (pos) {
                case 'top': {
                    left = anchor.left + (anchor.width - (width ?? content.width)) / 2
                    top = anchor.top - (height ?? content.height) - arrowSize / 1.5 + 1
                    break
                }
                case 'bottom': {
                    left = anchor.left + (anchor.width - (width ?? content.width)) / 2
                    top = anchor.top + anchor.height + arrowSize / 1.25 + 1
                    break
                }
                case 'left': {
                    left = anchor.left - (width ?? content.width) - arrowSize / 1.2 - 1
                    top = anchor.top + (anchor.height - (height ?? content.height)) / 2
                    break
                }
                case 'right': {
                    left = anchor.left + anchor.width + arrowSize / 1.2 + 1
                    top = anchor.top + (anchor.height - (height ?? content.height)) / 2
                    break
                }
            }
        }

        function anchorAlignment() {
            // top/bottom alignments
            if (options.align == 'left') {
                adjust.left = anchor.left - left
                left = anchor.left
            }
            if (options.align == 'right') {
                adjust.left = (anchor.left + anchor.width - (width ?? content.width)) - left
                left = anchor.left + anchor.width - (width ?? content.width)
            }
            if (['top', 'bottom'].includes(found) && options.align.startsWith('both')) {
                let minWidth = options.align.split(':')[1] ?? 50
                if (anchor.width >= minWidth) {
                    left = anchor.left
                    width = anchor.width
                }
            }
            // left/right alignments
            if (options.align == 'top') {
                adjust.top = anchor.top - top
                top = anchor.top
            }
            if (options.align == 'bottom') {
                adjust.top = (anchor.top + anchor.height - (height ?? content.height)) - top
                top = anchor.top + anchor.height - (height ?? content.height)
            }
            if (['left', 'right'].includes(found) && options.align.startsWith('both')) {
                let minHeight = options.align.split(':')[1] ?? 50
                if (anchor.height >= minHeight) {
                    top = anchor.top
                    height = anchor.height
                }
            }
        }

        function screenAdjust() {
            let adjustArrow
            // adjust tip if needed after alignment
            if ((['left', 'right'].includes(options.align) && anchor.width < (width ?? content.width))
                || (['top', 'bottom'].includes(options.align) && anchor.height < (height ?? content.height))
            ) {
                adjustArrow = true
            }
            // if off screen then adjust
            let minLeft = (found == 'right' ? arrowSize : options.screenMargin)
            let minTop  = (found == 'bottom' ? arrowSize : options.screenMargin)
            let maxLeft = max.width - (width ?? content.width) - (found == 'left' ? arrowSize : options.screenMargin)
            let maxTop  = max.height - (height ?? content.height) - (found == 'top' ? arrowSize : options.screenMargin) + 3
            // adjust X
            if (['top', 'bottom'].includes(found) || options.autoResize) {
                if (left < minLeft) {
                    adjustArrow = true
                    adjust.left -= left
                    left = minLeft
                }
                if (left > maxLeft) {
                    adjustArrow = true
                    adjust.left -= left - maxLeft
                    left += maxLeft - left
                }
            }
            // adjust Y
            if (['left', 'right'].includes(found) || options.autoResize) {
                if (top < minTop) {
                    adjustArrow = true
                    adjust.top -= top
                    top = minTop
                }
                if (top > maxTop) {
                    adjustArrow = true
                    adjust.top -= top - maxTop
                    top += maxTop - top
                }
            }
            // moves carret to adjust it with element width
            if (adjustArrow) {
                let aType = isVertical ? 'left' : 'top'
                let sType = isVertical ? 'width' : 'height'
                arrow.offset = -adjust[aType]
                let maxOffset = content[sType] / 2 - arrowSize
                if (Math.abs(arrow.offset) > maxOffset + arrowSize) {
                    arrow.class = '' // no arrow
                }
                if (Math.abs(arrow.offset) > maxOffset) {
                    arrow.offset = arrow.offset < 0 ? -maxOffset : maxOffset
                }
                arrow.style = w2utils.stripSpaces(`#${overlay.id} .w2ui-overlay-body:after,
                            #${overlay.id} .w2ui-overlay-body:before {
                                --tip-size: ${arrowSize}px;
                                margin-${aType}: ${arrow.offset}px;
                            }`)
            }
        }
    }
}

class ColorTooltip extends Tooltip {
    constructor() {
        super()
        this.palette = [
            ['000000', '333333', '555555', '777777', '888888', '999999', 'AAAAAA', 'CCCCCC', 'DDDDDD', 'EEEEEE', 'F7F7F7', 'FFFFFF'],
            ['FF011B', 'FF9838', 'FFC300', 'FFFD59', '86FF14', '14FF7A', '2EFFFC', '2693FF', '006CE7', '9B24F4', 'FF21F5', 'FF0099'],
            ['FFEAEA', 'FCEFE1', 'FCF4DC', 'FFFECF', 'EBFFD9', 'D9FFE9', 'E0FFFF', 'E8F4FF', 'ECF4FC', 'EAE6F4', 'FFF5FE', 'FCF0F7'],
            ['F4CCCC', 'FCE5CD', 'FFF1C2', 'FFFDA1', 'D5FCB1', 'B5F7D0', 'BFFFFF', 'D6ECFF', 'CFE2F3', 'D9D1E9', 'FFE3FD', 'FFD9F0'],
            ['EA9899', 'F9CB9C', 'FFE48C', 'F7F56F', 'B9F77E', '84F0B1', '83F7F7', 'B5DAFF', '9FC5E8', 'B4A7D6', 'FAB9F6', 'FFADDE'],
            ['E06666', 'F6B26B', 'DEB737', 'E0DE51', '8FDB48', '52D189', '4EDEDB', '76ACE3', '6FA8DC', '8E7CC3', 'E07EDA', 'F26DBD'],
            ['CC0814', 'E69138', 'AB8816', 'B5B20E', '6BAB30', '27A85F', '1BA8A6', '3C81C7', '3D85C6', '674EA7', 'A14F9D', 'BF4990'],
            ['99050C', 'B45F17', '80650E', '737103', '395E14', '10783D', '13615E', '094785', '0A5394', '351C75', '780172', '782C5A']
        ]
        this.defaults = w2utils.extend({}, this.defaults, {
            advanced    : false,
            transparent : true,
            position    : 'top|bottom',
            class       : 'w2ui-white',
            color       : '',
            liveUpdate  : true,
            arrowSize   : 12,
            autoResize  : false,
            anchorClass : 'w2ui-focus',
            autoShowOn  : 'focus',
            hideOn      : ['doc-click', 'focus-change'],
            onSelect    : null,
            onLiveUpdate: null
        })
    }

    attach(anchor, text) {
        let options
        if (arguments.length == 1 && anchor instanceof Object) {
            options = anchor
            anchor = options.anchor
        } else if (arguments.length === 2 && text != null && typeof text === 'object') {
            options = text
            options.anchor = anchor
        }
        let prevHideOn = options.hideOn
        options = w2utils.extend({}, this.defaults, options || {})
        if (prevHideOn) {
            options.hideOn = prevHideOn
        }
        options.style += '; padding: 0;'
        // add remove transparent color
        if (options.transparent && this.palette[0][1] == '333333') {
            this.palette[0].splice(1, 1)
            this.palette[0].push('')
        }
        if (!options.transparent && this.palette[0][1] != '333333') {
            this.palette[0].splice(1, 0, '333333')
            this.palette[0].pop()
        }
        if (options.color) options.color = String(options.color).toUpperCase()
        if (typeof options.color === 'string' && options.color.substr(0,1) === '#') options.color = options.color.substr(1)
        // needed for keyboard navigation
        this.index = [-1, -1]
        let ret = super.attach(options)
        let overlay = ret.overlay
        overlay.options.html = this.getColorHTML(overlay.name, options)
        overlay.on('show.attach', event => {
            let overlay = event.detail.overlay
            let anchor  = overlay.anchor
            let options = overlay.options
            if (['INPUT', 'TEXTAREA'].includes(anchor.tagName) && !options.color && anchor.value) {
                overlay.tmp.initColor = anchor.value
            }
            delete overlay.newColor
        })
        overlay.on('show:after.attach', event => {
            if (ret.overlay?.box) {
                let actions = query(ret.overlay.box).find('.w2ui-eaction')
                w2utils.bindEvents(actions, this)
                this.initControls(ret.overlay)
            }
        })
        overlay.on('update:after.attach', event => {
            if (ret.overlay?.box) {
                let actions = query(ret.overlay.box).find('.w2ui-eaction')
                w2utils.bindEvents(actions, this)
                this.initControls(ret.overlay)
            }
        })
        overlay.on('hide.attach', event => {
            let overlay = event.detail.overlay
            let anchor  = overlay.anchor
            let color   = overlay.newColor ?? overlay.options.color ?? ''
            if (['INPUT', 'TEXTAREA'].includes(anchor.tagName) && anchor.value != color) {
                anchor.value = color
            }
            let edata = this.trigger('select', { color, target: overlay.name, overlay })
            if (edata.isCancelled === true) return
            // event after
            edata.finish()
        })
        ret.liveUpdate = (callback) => {
            overlay.on('liveUpdate.attach', (event) => { callback(event) })
            return ret
        }
        ret.select = (callback) => {
            overlay.on('select.attach', (event) => { callback(event) })
            return ret
        }
        return ret
    }

    // regular panel handler, adds selection class
    select(color, name) {
        let target
        this.index = [-1, -1]
        if (typeof name != 'string') {
            target = name.target
            this.index = query(target).attr('index').split(':')
            name = query(target).closest('.w2ui-overlay').attr('name')
        }
        let overlay = this.get(name)
        // event before
        let edata = this.trigger('liveUpdate', { color, target: name, overlay, param: arguments[1] })
        if (edata.isCancelled === true) return
        // if anchor is input - live update
        if (['INPUT', 'TEXTAREA'].includes(overlay.anchor.tagName) && overlay.options.liveUpdate) {
            query(overlay.anchor).val(color)
        }
        overlay.newColor = color
        query(overlay.box).find('.w2ui-selected').removeClass('w2ui-selected')
        if (target) {
            query(target).addClass('w2ui-selected')
        }
        // event after
        edata.finish()
    }

    // used for keyboard navigation, if any
    nextColor(direction) { // TODO: check it
        let pal = this.palette
        switch (direction) {
            case 'up':
                this.index[0]--
                break
            case 'down':
                this.index[0]++
                break
            case 'right':
                this.index[1]++
                break
            case 'left':
                this.index[1]--
                break
        }
        if (this.index[0] < 0) this.index[0] = 0
        if (this.index[0] > pal.length - 2) this.index[0] = pal.length - 2
        if (this.index[1] < 0) this.index[1] = 0
        if (this.index[1] > pal[0].length - 1) this.index[1] = pal[0].length - 1
        return pal[this.index[0]][this.index[1]]
    }

    tabClick(index, name) {
        if (typeof name != 'string') {
            name = query(name.target).closest('.w2ui-overlay').attr('name')
        }
        let overlay = this.get(name)
        let tab = query(overlay.box).find(`.w2ui-color-tab:nth-child(${index})`)
        query(overlay.box).find('.w2ui-color-tab').removeClass('w2ui-selected')
        query(tab).addClass('w2ui-selected')
        query(overlay.box)
            .find('.w2ui-tab-content')
            .hide()
            .closest('.w2ui-colors')
            .find('.tab-'+ index)
            .show()
    }

    // generate HTML with color pallent and controls
    getColorHTML(name, options) {
        let html = `
            <div class="w2ui-colors">
                <div class="w2ui-tab-content tab-1">`
        for (let i = 0; i < this.palette.length; i++) {
            html += '<div class="w2ui-color-row">'
            for (let j = 0; j < this.palette[i].length; j++) {
                let color = this.palette[i][j]
                let border = ''
                if (color === 'FFFFFF') border = '; border: 1px solid #efefef'
                html += `
                    <div class="w2ui-color w2ui-eaction ${color === '' ? 'w2ui-no-color' : ''} ${options.color == color ? 'w2ui-selected' : ''}"
                        style="background-color: #${color + border};" name="${color}" index="${i}:${j}"
                        data-mousedown="select|'${color}'|event" data-mouseup="hide|${name}">&nbsp;
                    </div>`
            }
            html += '</div>'
            if (i < 2) html += '<div style="height: 8px"></div>'
        }
        html += '</div>'
        // advanced tab
        html += `
            <div class="w2ui-tab-content tab-2" style="display: none">
                <div class="color-info">
                    <div class="color-preview-bg"><div class="color-preview"></div><div class="color-original"></div></div>
                    <div class="color-part">
                        <span>H</span> <input class="w2ui-input" name="h" maxlength="3" max="360" tabindex="101">
                        <span>R</span> <input class="w2ui-input" name="r" maxlength="3" max="255" tabindex="104">
                    </div>
                    <div class="color-part">
                        <span>S</span> <input class="w2ui-input" name="s" maxlength="3" max="100" tabindex="102">
                        <span>G</span> <input class="w2ui-input" name="g" maxlength="3" max="255" tabindex="105">
                    </div>
                    <div class="color-part">
                        <span>V</span> <input class="w2ui-input" name="v" maxlength="3" max="100" tabindex="103">
                        <span>B</span> <input class="w2ui-input" name="b" maxlength="3" max="255" tabindex="106">
                    </div>
                    <div class="color-part opacity">
                        <span>${w2utils.lang('Opacity')}</span>
                        <input class="w2ui-input" name="a" maxlength="5" max="1" tabindex="107">
                    </div>
                </div>
                <div class="palette" name="palette">
                    <div class="palette-bg"></div>
                    <div class="value1 move-x move-y"></div>
                </div>
                <div class="rainbow" name="rainbow">
                    <div class="value2 move-x"></div>
                </div>
                <div class="alpha" name="alpha">
                    <div class="alpha-bg"></div>
                    <div class="value2 move-x"></div>
                </div>
            </div>`
        // color tabs on the bottom
        html += `
            <div class="w2ui-color-tabs">
                <div class="w2ui-color-tab selected w2ui-eaction" data-click="tabClick|1|event|this"><span class="w2ui-icon w2ui-icon-colors"></span></div>
                <div class="w2ui-color-tab w2ui-eaction" data-click="tabClick|2|event|this"><span class="w2ui-icon w2ui-icon-settings"></span></div>
                <div style="padding: 5px; width: 100%; text-align: right;">
                    ${(typeof options.html == 'string' ? options.html : '')}
                </div>
            </div>`
        return html
    }

    // bind advanced tab controls
    initControls(overlay) {
        let initial // used for mouse events
        let self = this
        let options = overlay.options
        let rgb = w2utils.parseColor(options.color || overlay.tmp.initColor)
        if (rgb == null) {
            rgb = { r: 140, g: 150, b: 160, a: 1 }
        }
        let hsv = w2utils.rgb2hsv(rgb)
        if (options.advanced === true) {
            this.tabClick(2, overlay.name)
        }
        setColor(hsv, true, true)

        // even for rgb, hsv inputs
        query(overlay.box)
            .off('.w2color')
            .on('contextmenu.w2color', event => {
                event.preventDefault() // prevent browser context menu
            })
            .find('input')
            .off('.w2color')
            .on('change.w2color', (event) => {
                let el = query(event.target)
                let val = parseFloat(el.val())
                let max = parseFloat(el.attr('max'))
                if (isNaN(val)) {
                    val = 0
                    el.val(0)
                }
                if (max > 1) val = parseInt(val) // trancate fractions
                if (max > 0 && val > max) {
                    el.val(max)
                    val = max
                }
                if (val < 0) {
                    el.val(0)
                    val = 0
                }
                let name  = el.attr('name')
                let color = {}
                if (['r', 'g', 'b', 'a'].indexOf(name) !== -1) {
                    rgb[name] = val
                    hsv = w2utils.rgb2hsv(rgb)
                } else if (['h', 's', 'v'].indexOf(name) !== -1) {
                    color[name] = val
                }
                setColor(color, true)
            })

        // click on original color resets it
        query(overlay.box).find('.color-original')
            .off('.w2color')
            .on('click.w2color', (event) => {
                let tmp = w2utils.parseColor(query(event.target).css('background-color'))
                if (tmp != null) {
                    rgb = tmp
                    hsv = w2utils.rgb2hsv(rgb)
                    setColor(hsv, true)
                }
            })

        // color sliders events
        let mDown = `${!w2utils.isIOS ? 'mousedown' : 'touchstart'}.w2color`
        let mUp   = `${!w2utils.isIOS ? 'mouseup' : 'touchend'}.w2color`
        let mMove = `${!w2utils.isIOS ? 'mousemove' : 'touchmove'}.w2color`
        query(overlay.box).find('.palette, .rainbow, .alpha')
            .off('.w2color')
            .on(`${mDown}.w2color`, mouseDown)
        return

        function setColor(color, fullUpdate, initial) {
            if (color.h != null) hsv.h = color.h
            if (color.s != null) hsv.s = color.s
            if (color.v != null) hsv.v = color.v
            if (color.a != null) { rgb.a = color.a; hsv.a = color.a }
            rgb = w2utils.hsv2rgb(hsv)
            let newColor = 'rgba('+ rgb.r +','+ rgb.g +','+ rgb.b +','+ rgb.a +')'
            let cl       = [
                Number(rgb.r).toString(16).toUpperCase(),
                Number(rgb.g).toString(16).toUpperCase(),
                Number(rgb.b).toString(16).toUpperCase(),
                (Math.round(Number(rgb.a)*255)).toString(16).toUpperCase()
            ]
            cl.forEach((item, ind) => { if (item.length === 1) cl[ind] = '0' + item })
            newColor = cl[0] + cl[1] + cl[2] + cl[3]
            if (rgb.a === 1) {
                newColor = cl[0] + cl[1] + cl[2]
            }
            query(overlay.box).find('.color-preview').css('background-color', '#' + newColor)
            query(overlay.box).find('input').each(el => {
                if (el.name) {
                    if (rgb[el.name] != null) el.value = rgb[el.name]
                    if (hsv[el.name] != null) el.value = hsv[el.name]
                    if (el.name === 'a') el.value = rgb.a
                }
            })
            // if it is in pallette
            if (initial) {
                let color = overlay.tmp?.initColor || newColor
                query(overlay.box).find('.color-original')
                    .css('background-color', '#'+color)
                query(overlay.box).find('.w2ui-colors .w2ui-selected')
                    .removeClass('w2ui-selected')
                query(overlay.box).find(`.w2ui-colors [name="${color}"]`)
                    .addClass('w2ui-selected')
                // if has transparent color, open advanced tab
                if (newColor.length == 8) {
                    self.tabClick(2, overlay.name)
                }
            } else {
                self.select(newColor, overlay.name)
            }
            if (fullUpdate) {
                updateSliders()
                refreshPalette()
            }
        }

        function updateSliders() {
            let el1 = query(overlay.box).find('.palette .value1')
            let el2 = query(overlay.box).find('.rainbow .value2')
            let el3 = query(overlay.box).find('.alpha .value2')
            if (!el1[0] || !el2[0] || !el3[0]) return
            let offset1 = parseInt(el1[0].clientWidth) / 2
            let offset2 = parseInt(el2[0].clientWidth) / 2
            el1.css({
                'left': (hsv.s * 150 / 100 - offset1) + 'px',
                'top': ((100 - hsv.v) * 125 / 100 - offset1) + 'px'
            })
            el2.css('left', (hsv.h/(360/150) - offset2) + 'px')
            el3.css('left', (rgb.a*150 - offset2) + 'px')
        }

        function refreshPalette() {
            let cl  = w2utils.hsv2rgb(hsv.h, 100, 100)
            let rgb = `${cl.r},${cl.g},${cl.b}`
            query(overlay.box).find('.palette')
                .css('background-image', `linear-gradient(90deg, rgba(${rgb},0) 0%, rgba(${rgb},1) 100%)`)
        }

        function mouseDown(event) {
            let el = query(this).find('.value1, .value2')
            let offset = parseInt(el.prop('clientWidth')) / 2
            if (el.hasClass('move-x')) el.css({ left: (event.offsetX - offset) + 'px' })
            if (el.hasClass('move-y')) el.css({ top: (event.offsetY - offset) + 'px' })
            initial = {
                el    : el,
                x      : event.pageX,
                y      : event.pageY,
                width  : el.prop('parentNode').clientWidth,
                height : el.prop('parentNode').clientHeight,
                left   : parseInt(el.css('left')),
                top    : parseInt(el.css('top'))
            }
            mouseMove(event)
            query('body')
                .off('.w2color')
                .on(mMove, mouseMove)
                .on(mUp, mouseUp)
        }

        function mouseUp(event) {
            query('body').off('.w2color')
        }

        function mouseMove(event) {
            let el    = initial.el
            let divX   = event.pageX - initial.x
            let divY   = event.pageY - initial.y
            let newX   = initial.left + divX
            let newY   = initial.top + divY
            let offset = parseInt(el.prop('clientWidth')) / 2
            if (newX < -offset) newX = -offset
            if (newY < -offset) newY = -offset
            if (newX > initial.width - offset) newX = initial.width - offset
            if (newY > initial.height - offset) newY = initial.height - offset
            if (el.hasClass('move-x')) el.css({ left : newX + 'px' })
            if (el.hasClass('move-y')) el.css({ top : newY + 'px' })

            // move
            let name = query(el.get(0).parentNode).attr('name')
            let x    = parseInt(el.css('left')) + offset
            let y    = parseInt(el.css('top')) + offset
            if (name === 'palette') {
                setColor({
                    s: Math.round(x / initial.width * 100),
                    v: Math.round(100 - (y / initial.height * 100))
                })
            }
            if (name === 'rainbow') {
                let h = Math.round(360 / 150 * x)
                setColor({ h: h })
                refreshPalette()
            }
            if (name === 'alpha') {
                setColor({ a: parseFloat(Number(x / 150).toFixed(2)) })
            }
        }
    }
}

class MenuTooltip extends Tooltip {
    constructor() {
        super()
        // ITEM STRUCTURE
        // item : {
        //   id       : null,
        //   text     : '',
        //   style    : '',
        //   icon     : '',
        //   count    : '',
        //   tooltip  : '',
        //   hotkey   : '',
        //   remove   : false,
        //   items    : []
        //   indent   : 0,
        //   type     : null,    // check/radio
        //   group    : false,   // groupping for checks
        //   expanded : false,
        //   hidden   : false,
        //   checked  : null,
        //   disabled : false
        //   ...
        // }
        this.defaults = w2utils.extend({}, this.defaults, {
            type        : 'normal',    // can be normal, radio, check
            items       : [],
            index       : null,        // current selected
            render      : null,
            spinner     : false,
            msgNoItems  : w2utils.lang('No items found'),
            topHTML     : '',
            menuStyle   : '',
            filter      : false,
            markSearch  : false,
            prefilter   : false,
            match       : 'contains',   // is, begins, ends, contains
            search      : false,        // top search TODO: Check
            altRows     : false,
            arrowSize   : 10,
            align       : 'left',
            position    : 'bottom|top',
            class       : 'w2ui-white',
            anchorClass : 'w2ui-focus',
            autoShowOn  : 'focus',
            hideOn      : ['doc-click', 'focus-change', 'select'], // also can 'item-remove'
            onSelect    : null,
            onSubMenu   : null,
            onRemove    : null
        })
    }

    attach(anchor, text) {
        let options
        if (arguments.length == 1 && anchor instanceof Object) {
            options = anchor
            anchor = options.anchor
        } else if (arguments.length === 2 && text != null && typeof text === 'object') {
            options = text
            options.anchor = anchor
        }
        let prevHideOn = options.hideOn
        options = w2utils.extend({}, this.defaults, options || {})
        if (prevHideOn) {
            options.hideOn = prevHideOn
        }
        options.style += '; padding: 0;'
        if (options.items == null) {
            options.items = []
        }
        options.items = w2utils.normMenu(options.items)
        options.html = this.getMenuHTML(options)
        let ret = super.attach(options)
        let overlay = ret.overlay
        overlay.on('show:after.attach, update:after.attach', event => {
            if (ret.overlay?.box) {
                let search = ''
                // reset selected and active chain
                overlay.selected = null

                if (['INPUT', 'TEXTAREA'].includes(overlay.anchor.tagName)) {
                    search = overlay.anchor.value
                    overlay.selected = overlay.anchor.dataset.selectedIndex
                }
                let actions = query(ret.overlay.box).find('.w2ui-eaction')
                w2utils.bindEvents(actions, this)
                this.applyFilter(overlay.name, null, search)
                    .then(data => {
                        overlay.tmp.searchCount = data.count
                        overlay.tmp.search = data.search
                        if (options.prefilter) {
                            this.refreshSearch(overlay.name)
                        }
                        this.initControls(ret.overlay)
                        this.refreshIndex(overlay.name, true)
                    })
            }
        })
        overlay.next = () => {
            let chain = this.getActiveChain(overlay.name)
            if (overlay.selected == null || overlay.selected?.length == 0) {
                overlay.selected = chain[0]
            } else {
                let ind = chain.indexOf(overlay.selected)
                // selected not in chain of items
                if (ind == -1) {
                    overlay.selected = chain[0]
                }
                // not the last item
                if (ind < chain.length - 1) {
                    overlay.selected = chain[ind + 1]
                }
            }
            this.refreshIndex(overlay.name)
        }
        overlay.prev = () => {
            let chain = this.getActiveChain(overlay.name)
            if (overlay.selected == null || overlay.selected?.length == 0) {
                overlay.selected = chain[chain.length-1]
            } else {
                let ind = chain.indexOf(overlay.selected)
                // selected not in chain of items
                if (ind == -1) {
                    overlay.selected = chain[chain.length-1]
                }
                // not first item
                if (ind > 0) {
                    overlay.selected = chain[ind - 1]
                }
            }
            this.refreshIndex(overlay.name)
        }
        overlay.click = () => {
            $(overlay.box).find('.w2ui-selected').click()
        }
        overlay.on('hide:after.attach', event => {
            w2tooltip.hide(overlay.name + '-tooltip')
        })
        ret.select = (callback) => {
            overlay.on('select.attach', (event) => { callback(event) })
            return ret
        }
        ret.remove = (callback) => {
            overlay.on('remove.attach', (event) => { callback(event) })
            return ret
        }
        ret.subMenu = (callback) => {
            overlay.on('subMenu.attach', (event) => { callback(event) })
            return ret
        }
        return ret
    }

    update(name, items) {
        let overlay = Tooltip.active[name]
        if (overlay) {
            let options = overlay.options
            if (options.items != items) {
                options.items = items
            }
            let menuHTML = this.getMenuHTML(options)
            if (options.html != menuHTML) {
                options.html = menuHTML
                overlay.needsUpdate = true
                this.show(name)
            }
        } else {
            console.log(`Tooltip "${name}" is not displayed. Cannot update it.`)
        }
    }

    initControls(overlay) {
        query(overlay.box).find('.w2ui-menu:not(.w2ui-sub-menu)')
            .off('.w2menu')
            .on('contextmenu.w2menu', event => {
                event.preventDefault() // prevent browser context menu
            })
            .on('mouseDown.w2menu', { delegate: '.w2ui-menu-item' }, event => {
                let dt = event.delegate.dataset
                this.menuDown(overlay, event, dt.index, dt.parents)
            })
            .on((w2utils.isIOS ? 'touchStart' : 'click') + '.w2menu', { delegate: '.w2ui-menu-item' }, event => {
                let dt = event.delegate.dataset
                this.menuClick(overlay, event, parseInt(dt.index), dt.parents)
            })
            .find('.w2ui-menu-item')
            .off('.w2menu')
            .on('mouseEnter.w2menu', event => {
                let dt = event.target.dataset
                let tooltip = overlay.options.items[dt.index]?.tooltip
                if (tooltip) {
                    w2tooltip.show({
                        name: overlay.name + '-tooltip',
                        anchor: event.target,
                        html: tooltip,
                        position: 'right|left',
                        hideOn: ['doc-click']
                    })
                }
            })
            .on('mouseLeave.w2menu', event => {
                w2tooltip.hide(overlay.name + '-tooltip')
            })

        if (['INPUT', 'TEXTAREA'].includes(overlay.anchor.tagName)) {
            query(overlay.anchor)
                .off('.w2menu')
                .on('input.w2menu', event => {
                    // if user types, clear selection
                    // let dt = event.target.dataset
                    // delete dt.selected
                    // delete dt.selectedIndex
                })
                .on('keyup.w2menu', event => {
                    event._searchType = 'filter'
                    this.keyUp(overlay, event)
                })
        }
        if (overlay.options.search) {
            query(overlay.box).find('#menu-search')
                .off('.w2menu')
                .on('keyup.w2menu', event => {
                    event._searchType = 'search'
                    this.keyUp(overlay, event)
                })
        }
    }

    getCurrent(name, id) {
        let overlay  = Tooltip.active[name.replace(/[\s\.#]/g, '_')]
        let options  = overlay.options
        let selected = (id ? id : overlay.selected ?? '').split('-')
        let last     = selected.length-1
        let index    = selected[last]
        let parents  = selected.slice(0, selected.length-1).join('-')
        index = w2utils.isInt(index) ? parseInt(index) : 0
        // items
        let items = options.items
        selected.forEach((id, ind) => {
            // do not go to the last one
            if (ind < selected.length - 1) {
                items = items[id].items
            }
        })
        return { last, index, items, item: items[index], parents }
    }

    getMenuHTML(options, items, subMenu, parentIndex) {
        if (options.spinner) {
            return `
            <div class="w2ui-menu">
                <div class="w2ui-no-items">
                    <div class="w2ui-spinner"></div>
                    ${w2utils.lang('Loading...')}
                </div>
            </div>`
        }
        if (!parentIndex) parentIndex = []
        if (items == null) {
            items = options.items
        }
        if (!Array.isArray(items)) items = []
        let count = 0
        let icon = null
        let topHTML = ''
        if (!subMenu && options.search) {
            topHTML += `
                <div class="w2ui-menu-search">
                    <span class="w2ui-icon w2ui-icon-search"></span>
                    <input id="menu-search" class="w2ui-input" type="text"/>
                </div>`
            items.forEach(item => item.hidden = false)
        }
        if (!subMenu && options.topHTML) {
            topHTML += `<div class="w2ui-menu-top">${options.topHTML}</div>`
        }
        let menu_html = `
            ${topHTML}
            <div class="w2ui-menu ${(subMenu ? 'w2ui-sub-menu' : '')}" ${!subMenu ? `style="${options.menuStyle}"` : ''}
                data-parent="${parentIndex}">
        `
        items.forEach((mitem, f) => {
            icon = mitem.icon
            let index = (parentIndex.length > 0 ? parentIndex.join('-') + '-' : '') + f
            if (icon == null) icon = null // icon might be undefined
            if (['radio', 'check'].indexOf(options.type) != -1 && !Array.isArray(mitem.items) && mitem.group !== false) {
                if (mitem.checked === true) icon = 'w2ui-icon-check'; else icon = 'w2ui-icon-empty'
            }
            if (mitem.hidden !== true) {
                let txt  = mitem.text
                let icon_dsp = ''
                let subMenu_dsp = ''
                if (typeof options.render === 'function') txt = options.render(mitem, options)
                if (typeof txt == 'function') txt = txt(mitem, options)
                if (icon) {
                    if (String(icon).slice(0, 1) !== '<') {
                        icon = `<span class="w2ui-icon ${icon}"></span>`
                    }
                    icon_dsp = `<div class="menu-icon">${icon}</span></div>`
                }
                // for backward compatibility
                if (mitem.removable == null && mitem.remove != null) {
                    mitem.rmovable = mitem.remove
                }
                // render only if non-empty
                if (mitem.type !== 'break' && txt != null && txt !== '' && String(txt).substr(0, 2) != '--') {
                    let classes = ['w2ui-menu-item']
                    if (options.altRows == true) {
                        classes.push(count % 2 === 0 ? 'w2ui-even' : 'w2ui-odd')
                    }
                    let colspan = 1
                    if (icon_dsp === '') colspan++
                    if (mitem.count == null && mitem.hotkey == null && mitem.removable !== true && mitem.items == null) colspan++
                    if (mitem.tooltip == null && mitem.hint != null) mitem.tooltip = mitem.hint // for backward compatibility
                    let count_dsp = ''
                    if (mitem.removable === true) {
                        count_dsp = '<span class="remove">x</span>'
                    } else if (mitem.items != null) {
                        let _items = []
                        if (typeof mitem.items == 'function') {
                            _items = mitem.items(mitem)
                        } else if (Array.isArray(mitem.items)) {
                            _items = mitem.items
                        }
                        count_dsp   = '<span style="background-color: transparent; border: transparent; box-shadow: none;"></span>' // used as drop arrow
                        subMenu_dsp = `
                            <div class="w2ui-sub-menu-box" style="${mitem.expanded ? '' : 'display: none'}">
                                ${this.getMenuHTML(options, _items, true, parentIndex.concat(f))}
                            </div>`
                    } else {
                        if (mitem.count != null) count_dsp += '<span>' + mitem.count + '</span>'
                        if (mitem.hotkey != null) count_dsp += '<span class="hotkey">' + mitem.hotkey + '</span>'
                    }
                    if (mitem.disabled === true) classes.push('w2ui-disabled')
                    if (mitem._noSearchInside === true) classes.push('w2ui-no-search-inside')
                    if (subMenu_dsp !== '') {
                        classes.push('has-sub-menu')
                        if (mitem.expanded) {
                            classes.push('expanded')
                        } else {
                            classes.push('collapsed')
                        }
                    }
                    menu_html += `
                        <div index="${index}" class="${classes.join(' ')}" style="${mitem.style ? mitem.style : ''}"
                            data-index="${f}" data-parents="${parentIndex.join('-')}">
                                <div style="width: ${(subMenu ? 20 : 0) + parseInt(mitem.indent ?? 0)}px"></div>
                                ${icon_dsp}
                                <div class="menu-text" colspan="${colspan}">${w2utils.lang(txt)}</div>
                                <div class="menu-extra">${count_dsp}</div>
                        </div>
                        ${subMenu_dsp}`
                    count++
                } else {
                    // horizontal line
                    let divText = (txt ?? '').replace(/^-+/g, '')
                    menu_html  += `
                        <div index="${index}" class="w2ui-menu-divider ${divText != '' ? 'has-text' : ''}">
                            <div class="line"></div>
                            ${divText ? `<div class="text">${divText}</div>` : ''}
                        </div>`
                }
            }
            items[f] = mitem
        })
        if (count === 0 && options.msgNoItems) {
            menu_html += `
                <div class="w2ui-no-items">
                    ${w2utils.lang(options.msgNoItems)}
                </div>`
        }
        menu_html += '</div>'
        return menu_html
    }

    // Refreshed only selected item highligh, used in keyboard navigation
    refreshIndex(name, instant) {
        let overlay = Tooltip.active[name.replace(/[\s\.#]/g, '_')]
        if (!overlay) return
        if (!overlay.displayed) {
            this.show(overlay.name)
        }
        let view = query(overlay.box).find('.w2ui-overlay-body').get(0)
        let search = query(overlay.box).find('.w2ui-menu-search, .w2ui-menu-top').get(0)
        query(overlay.box).find('.w2ui-menu-item.w2ui-selected')
            .removeClass('w2ui-selected')
        let el = query(overlay.box).find(`.w2ui-menu-item[index="${overlay.selected}"]`)
            .addClass('w2ui-selected')
            .get(0)
        if (el) {
            if (el.offsetTop + el.clientHeight > view.clientHeight + view.scrollTop) {
                el.scrollIntoView({
                    behavior: instant ? 'instant' : 'smooth',
                    block: instant ? 'center' : 'start',
                    inline: instant ? 'center' : 'start'
                })
            }
            if (el.offsetTop < view.scrollTop + (search ? search.clientHeight : 0)) {
                el.scrollIntoView({
                    behavior: instant ? 'instant' : 'smooth',
                    block: instant ? 'center' : 'end',
                    inline: instant ? 'center' : 'end'
                })
            }
        }
    }

    // show/hide searched items
    refreshSearch(name) {
        let overlay = Tooltip.active[name.replace(/[\s\.#]/g, '_')]
        if (!overlay) return
        if (!overlay.displayed) {
            this.show(overlay.name)
        }
        query(overlay.box).find('.w2ui-no-items').hide()
        query(overlay.box).find('.w2ui-menu-item, .w2ui-menu-divider').each(el => {
            let cur = this.getCurrent(name, el.getAttribute('index'))
            if (cur.item?.hidden) {
                query(el).hide()
            } else {
                let search = overlay.tmp?.search
                if (overlay.options.markSearch) {
                    w2utils.marker(el, search, { onlyFirst: overlay.options.match == 'begins' })
                }
                query(el).show()
            }
        })
        // hide empty menus
        query(overlay.box).find('.w2ui-sub-menu').each(sub => {
            let hasItems = query(sub).find('.w2ui-menu-item').get().some(el => {
                return el.style.display != 'none' ? true : false
            })
            let parent = this.getCurrent(name, sub.dataset.parent)
            // only if parent is expaneded
            if (parent.item.expanded) {
                if (!hasItems) {
                    query(sub).parent().hide()
                } else {
                    query(sub).parent().show()
                }
            }
        })
        // show empty message
        if (overlay.tmp.searchCount == 0 || overlay.options?.items?.length == 0) {
            if (query(overlay.box).find('.w2ui-no-items').length == 0) {
                query(overlay.box).find('.w2ui-menu:not(.w2ui-sub-menu)').append(`
                    <div class="w2ui-no-items">
                        ${w2utils.lang(overlay.options.msgNoItems)}
                    </div>`)
            }
            query(overlay.box).find('.w2ui-no-items').show()
        }
    }

    /**
     * Loops through the items and markes item.hidden = true for those that need to be hidden, and item.hidden = false
     * for those that are visible. Return a promise (since items can be on the server) with the number of visible items.
     */
    applyFilter(name, items, search, debounce) {
        let count = 0
        let overlay = Tooltip.active[name.replace(/[\s\.#]/g, '_')]
        let options = overlay.options
        let resolve, reject
        let prom = new Promise((res, rej) => {
            resolve = res
            reject = rej
        })
        if (search == null) {
            if (['INPUT', 'TEXTAREA'].includes(overlay.anchor.tagName)) {
                search = overlay.anchor.value
            } else {
                search = ''
            }
        }
        let selectedIds = []
        if (options.selected) {
            if (Array.isArray(options.selected)) {
                selectedIds = options.selected.map(item => {
                    return item?.id ?? item
                })
            } else if (options.selected?.id) {
                selectedIds = [options.selected.id]
            }
        }
        overlay.tmp.activeChain = null
        // if url is defined, get items from it
        let remote = overlay.tmp.remote ?? { hasMore: true, emtpySet: false, search: null, total: -1 }
        if (items == null && options.url && remote.hasMore && remote.search !== search) {
            let proceed = true
            // only when items == null because it is case of nested items
            let msg = w2utils.lang('Loading...')
            if (search.length < options.minLength && remote.emptySet !== true) {
                msg = w2utils.lang('${count} letters or more...', { count: options.minLength })
                proceed = false
                if (search === '') {
                    msg = w2utils.lang(options.msgSearch)
                }
            }
            query(overlay.box).find('.w2ui-no-items').html(msg)

            remote.search = search
            options.items = []
            overlay.tmp.remote = remote
            if (proceed) {
                this.request(overlay, search, debounce)
                    .then(remoteItems => {
                        this.update(name, remoteItems)
                        this.applyFilter(name, null, search).then(data => {
                            resolve(data)
                        })
                    })
                    .catch(error => {
                        console.log('Server Request error', error)
                    })
            }
            return prom
        }
        let edata
        // only trigger search event when data is present and for the top level
        if (items == null) {
            edata = this.trigger('search', { search, overlay, prom, resolve, reject })
            if (edata.isCancelled === true) {
                return prom
            }
        }
        if (items == null) {
            items = overlay.options.items
        }
        if (options.filter === false) {
            resolve({ count: -1, search })
            return prom
        }
        items.forEach(item => {
            let prefix = ''
            let suffix = ''
            if (['is', 'begins', 'begins with'].indexOf(options.match) !== -1) prefix = '^'
            if (['is', 'ends', 'ends with'].indexOf(options.match) !== -1) suffix = '$'
            try {
                let re = new RegExp(prefix + search + suffix, 'i')
                if (re.test(item.text) || item.text === '...') {
                    item.hidden = false
                } else {
                    item.hidden = true
                }
            } catch (e) {}
            // do not show selected items
            if (options.hideSelected && selectedIds.includes(item.id)) {
                item.hidden = true
            }
            // search nested items
            if (Array.isArray(item.items) && item.items.length > 0) {
                delete item._noSearchInside
                this.applyFilter(name, item.items, search).then(data => {
                    let subCount = data.count
                    if (subCount > 0) {
                        count += subCount
                        if (item.hidden) item._noSearchInside = true
                        // only expand items if search is not empty
                        if (search) item.expanded = true
                        item.hidden = false
                    }
                    })
            }
            if (item.hidden !== true) count++
        })
        resolve({ count, search })
        edata?.finish()
        return prom
    }

    request(overlay, search, debounce) {
        let options = overlay.options
        let remote = overlay.tmp.remote
        let resolve, reject // promise functions
        if ((options.items.length === 0 && remote.total !== 0)
            || (remote.total == options.cacheMax && search.length > remote.search.length)
            || (search.length >= remote.search.length && search.substr(0, remote.search.length) !== remote.search)
            || (search.length < remote.search.length))
        {
            // Aabort previous request if any
            if (remote.controller) {
                remote.controller.abort()
            }
            remote.loading = true
            clearTimeout(remote.timeout)
            remote.timeout = setTimeout(() => {
                let url = options.url
                let postData = { search, max: options.cacheMax }
                Object.assign(postData, options.postData)
                // trigger event
                let edata = this.trigger('request', {
                    search, overlay, url, postData,
                    httpMethod: options.method ?? 'GET',
                    httpHeaders: {}
                })
                if (edata.isCancelled === true) return
                // if event updated url and postData, use it
                url = new URL(edata.detail.url, location)
                let fetchOptions = w2utils.prepareParams(url, {
                    method: edata.detail.httpMethod,
                    headers: edata.detail.httpHeaders,
                    body: edata.detail.postData
                })
                // Create new abort controller
                remote.controller = new AbortController()
                fetchOptions.signal = remote.controller.signal
                // send request
                fetch(url, fetchOptions)
                    .then(resp => resp.json())
                    .then(data => {
                        remote.controller = null
                        // trigger event
                        let edata = overlay.trigger('load', { search: postData.search, overlay, data })
                        if (edata.isCancelled === true) return
                        // default behavior
                        data = edata.detail.data
                        if (typeof data === 'string') data = JSON.parse(data)
                        // if server just returns array
                        if (Array.isArray(data)) {
                            data = { records: data }
                        }
                        // needed for backward compatibility
                        if (data.records == null && data.items != null) {
                            data.records = data.items
                            delete data.items
                        }
                        // handles Golang marshal of empty arrays to null
                        if (!data.error && data.records == null) {
                            data.records = []
                        }
                        if (!Array.isArray(data.records)) {
                            console.error('ERROR: server did not return proper data structure', '\n',
                                ' - it should return', { records: [{ id: 1, text: 'item' }] }, '\n',
                                ' - or just an array ', [{ id: 1, text: 'item' }], '\n',
                                ' - or if errorr ', { error: true, message: 'error message' })
                            return
                        }
                        // remove all extra items if more then needed for cache
                        if (data.records.length >= options.cacheMax) {
                            data.records.splice(options.cacheMax, data.records.length)
                            remote.hasMore = true
                        } else {
                            remote.hasMore = false
                        }
                        // map id and text
                        if (options.recId == null && options.recid != null) options.recId = options.recid // since lower-case recid is used in grid
                        if (options.recId || options.recText) {
                            data.records.forEach((item) => {
                                if (typeof options.recId === 'string') item.id = item[options.recId]
                                if (typeof options.recId === 'function') item.id = options.recId(item)
                                if (typeof options.recText === 'string') item.text = item[options.recText]
                                if (typeof options.recText === 'function') item.text = options.recText(item)
                            })
                        }
                        // remember stats
                        remote.loading = false
                        remote.search = search
                        remote.total = data.records.length
                        remote.lastError = ''
                        remote.emptySet = (search === '' && data.records.length === 0 ? true : false)
                        // event after
                        edata.finish()
                        resolve(w2utils.normMenu(data.records))
                    })
                    .catch(error => {
                        let edata = this.trigger('error', { overlay, search, error })
                        if (edata.isCancelled === true) return
                        // default behavior
                        if (error?.name !== 'AbortError') {
                            console.error('ERROR: Server communication failed.', '\n',
                                ' - it should return', { records: [{ id: 1, text: 'item' }] }, '\n',
                                ' - or just an array ', [{ id: 1, text: 'item' }], '\n',
                                ' - or if errorr ', { error: true, message: 'error message' })
                        }
                        // reset stats
                        remote.loading = false
                        remote.search = ''
                        remote.total = -1
                        remote.emptySet = true
                        remote.lastError = (edata.detail.error || 'Server communication failed')
                        options.items = []
                        // event after
                        edata.finish()
                        reject()
                    })
                // event after
                edata.finish()
            }, debounce ? (options.debounce ?? 350) : 0)
        }
        return new Promise((res, rej) => {
            resolve = res
            reject = rej
        })
    }

    /**
     * Builds an array of item ids that sequencial in navigation with up/down keys.
     * Skips hidden and disabled items and goes into nested structures.
     */
    getActiveChain(name, items, parents = [], res = [], noSave) {
        let overlay = Tooltip.active[name.replace(/[\s\.#]/g, '_')]
        if (overlay.tmp.activeChain != null) {
            return overlay.tmp.activeChain
        }
        if (items == null) items = overlay.options.items
        items.forEach((item, ind) => {
            if (!item.hidden && !item.disabled && !item?.text?.startsWith('--')) {
                res.push(parents.concat([ind]).join('-'))
                if (Array.isArray(item.items) && item.items.length > 0 && item.expanded) {
                    parents.push(ind)
                    this.getActiveChain(name, item.items, parents, res, true)
                    parents.pop()
                }
            }
        })
        if (noSave == null) {
            overlay.tmp.activeChain = res
        }
        return res
    }

    menuDown(overlay, event, index, parentIndex) {
        let options = overlay.options
        let items   = options.items
        let icon    = query(event.delegate).find('.w2ui-icon')
        let menu    = query(event.target).closest('.w2ui-menu:not(.w2ui-sub-menu)')
        if (typeof parentIndex == 'string' && parentIndex !== '') {
            let ids = parentIndex.split('-')
            ids.forEach(id => {
                items = items[id].items
            })
        }
        if (typeof items == 'function') {
            items = items({ overlay, index, parentIndex, event })
        }
        let item = items[index]
        if (item.disabled) {
            return
        }
        let uncheck = (items, parent) => {
            items.forEach((other, ind) => {
                if (other.id == item.id) return
                if (other.group === item.group && other.checked) {
                    menu
                        .find(`.w2ui-menu-item[index="${(parent ? parent + '-' : '') + ind}"] .w2ui-icon`)
                        .removeClass('w2ui-icon-check')
                        .addClass('w2ui-icon-empty')
                    items[ind].checked = false
                }
                if (Array.isArray(other.items)) {
                    uncheck(other.items, ind)
                }
            })
        }
        if ((options.type === 'check' || options.type === 'radio') && item.group !== false
                    && !query(event.target).hasClass('remove')
                    && !query(event.target).closest('.w2ui-menu-item').hasClass('has-sub-menu')) {
            item.checked = options.type == 'radio' ? true : !item.checked
            if (item.checked) {
                if (options.type === 'radio') {
                    query(event.target).closest('.w2ui-menu').find('.w2ui-icon')
                        .removeClass('w2ui-icon-check')
                        .addClass('w2ui-icon-empty')
                }
                if (options.type === 'check' && item.group != null) {
                    uncheck(options.items)
                }
                icon.removeClass('w2ui-icon-empty').addClass('w2ui-icon-check')
            } else if (options.type === 'check') {
                icon.removeClass('w2ui-icon-check').addClass('w2ui-icon-empty')
            }
        }
        // highlight record
        if (!query(event.target).hasClass('remove')) {
            menu.find('.w2ui-menu-item').removeClass('w2ui-selected')
            query(event.delegate).addClass('w2ui-selected')
        }
    }

    menuClick(overlay, event, index, parentIndex) {
        let options  = overlay.options
        let items    = options.items
        let $item    = query(event.delegate).closest('.w2ui-menu-item')
        let keepOpen = options.hideOn.includes('select') ? false : true
        if (event.shiftKey || event.metaKey || event.ctrlKey) {
            keepOpen = true
        }
        if (typeof parentIndex == 'string' && parentIndex !== '') {
            let ids = parentIndex.split('-')
            ids.forEach(id => {
                items = items[id].items
            })
        } else {
            parentIndex = null
        }
        if (typeof items == 'function') {
            items = items({ overlay, index, parentIndex, event })
        }
        let item = items[index]
        if (!item || (item.disabled && !query(event.target).hasClass('remove'))) {
            return
        }
        let edata
        if (query(event.target).hasClass('remove')) {
            edata = this.trigger('remove', { originalEvent: event, target: overlay.name,
                overlay, item, index, parentIndex, el: $item[0] })
            if (edata.isCancelled === true) {
                return
            }
            keepOpen = !options.hideOn.includes('item-remove')
            $item.remove()

        } else if ($item.hasClass('has-sub-menu')) {
            edata = this.trigger('subMenu', { originalEvent: event, target: overlay.name,
                overlay, item, index, parentIndex, el: $item[0] })
            if (edata.isCancelled === true) {
                return
            }
            keepOpen = true
            if ($item.hasClass('expanded')) {
                item.expanded = false
                $item.removeClass('expanded').addClass('collapsed')
                query($item.get(0).nextElementSibling).hide()
                overlay.selected = parseInt($item.attr('index'))
            } else {
                item.expanded = true
                $item.addClass('expanded').removeClass('collapsed')
                query($item.get(0).nextElementSibling).show()
                overlay.selected = parseInt($item.attr('index'))
            }
        } else {
            // find items that are selected
            let selected = this.findChecked(options.items)
            overlay.selected = parseInt($item.attr('index'))
            edata = this.trigger('select', { originalEvent: event, target: overlay.name,
                overlay, item, index, parentIndex, selected, keepOpen, el: $item[0] })
            if (edata.isCancelled === true) {
                return
            }
            if (item.keepOpen != null) {
                keepOpen = item.keepOpen
            }
            if (['INPUT', 'TEXTAREA'].includes(overlay.anchor.tagName)) {
                overlay.anchor.dataset.selected = item.id
                overlay.anchor.dataset.selectedIndex = overlay.selected
            }
        }
        if (!keepOpen) {
            this.hide(overlay.name)
        }
        // if (['INPUT', 'TEXTAREA'].includes(overlay.anchor.tagName)) {
        //     overlay.anchor.focus()
        // }
        // event after
        edata.finish()
    }

    findChecked(items) {
        let found = []
        items.forEach(item => {
            if (item.checked) found.push(item)
            if (Array.isArray(item.items)) {
                found = found.concat(this.findChecked(item.items))
            }
        })
        return found
    }

    keyUp(overlay, event) {
        let options = overlay.options
        let search = event.target.value
        let filter = true
        let refreshIndex = false
        switch (event.keyCode) {
            case 46:  // delete
            case 8: { // backspace
                // if search empty and delete is clicked, do not filter nor show overlay
                if (search === '' && !overlay.displayed) filter = false
                break
            }
            case 13: { // enter
                if (!overlay.displayed || !overlay.selected) return
                let { index, parents } = this.getCurrent(overlay.name)
                event.delegate = query(overlay.box).find('.w2ui-selected').get(0)
                // reset active chain for folders
                this.menuClick(overlay, event, parseInt(index), parents)
                filter = false
                break
            }
            case 27: { // escape
                filter = false
                if (overlay.displayed) {
                    this.hide(overlay.name)
                } else {
                    // clear selected
                    let el = overlay.anchor
                    if (['INPUT', 'TEXTAREA'].includes(el.tagName)) {
                        el.value = ''
                        delete el.dataset.selected
                        delete el.dataset.selectedIndex
                    }
                }
                break
            }
            case 37: { // left
                if (!overlay.displayed) return
                let { item, index, parents } = this.getCurrent(overlay.name)
                // collapse parent if any
                if (parents) {
                    item    = options.items[parents]
                    index   = parseInt(parents)
                    parents = ''
                    refreshIndex = true
                }
                if (Array.isArray(item?.items) && item.items.length > 0 && item.expanded) {
                    event.delegate = query(overlay.box).find(`.w2ui-menu-item[index="${index}"]`).get(0)
                    overlay.selected = index
                    this.menuClick(overlay, event, parseInt(index), parents)
                }
                filter = false
                break
            }
            case 39: { // right
                if (!overlay.displayed) return
                let { item, index, parents } = this.getCurrent(overlay.name)
                if (Array.isArray(item?.items) && item.items.length > 0 && !item.expanded) {
                    event.delegate = query(overlay.box).find('.w2ui-selected').get(0)
                    this.menuClick(overlay, event, parseInt(index), parents)
                }
                filter = false
                break
            }
            case 38: { // up
                if (!overlay.displayed) {
                    break
                }
                overlay.prev()
                filter = false
                event.preventDefault()
                break
            }
            case 40: { // down
                if (!overlay.displayed) {
                    break
                }
                overlay.next()
                filter = false
                event.preventDefault()
                break
            }
        }
        // filter
        if (filter && overlay.displayed
                && ((options.filter && event._searchType == 'filter') || (options.search && event._searchType == 'search'))) {
            this.applyFilter(overlay.name, null, search, true)
                .then(data => {
                    overlay.tmp.searchCount = data.count
                    overlay.tmp.search = data.search
                    // if selected is not in searched items
                    if (data.count === 0 || !this.getActiveChain(overlay.name).includes(overlay.selected)) {
                        overlay.selected = null
                    }
                    this.refreshSearch(overlay.name)
                })
        }
        if (refreshIndex) {
            this.refreshIndex(overlay.name)
        }
    }
}

class DateTooltip extends Tooltip {
    constructor() {
        super()
        let td = new Date()
        this.daysCount = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
        this.today = td.getFullYear() + '/' + (Number(td.getMonth()) + 1) + '/' + td.getDate()
        this.defaults = w2utils.extend({}, this.defaults, {
            position      : 'top|bottom',
            class         : 'w2ui-calendar',
            type          : 'date', // can be date/time/datetime
            value         : '', // initial date (in w2utils.settings format)
            format        : '',
            start         : null,
            end           : null,
            btnNow        : false,
            blockDates    : [], // array of blocked dates
            blockWeekdays : [], // blocked weekdays 0 - sunday, 1 - monday, etc
            colored       : {}, // ex: { '3/13/2022': 'bg-color|text-color' }
            arrowSize     : 12,
            autoResize    : false,
            anchorClass   : 'w2ui-focus',
            autoShowOn    : 'focus',
            hideOn        : ['doc-click', 'focus-change'],
            onSelect      : null
        })
    }

    attach(anchor, text) {
        let options
        if (arguments.length == 1 && anchor instanceof Object) {
            options = anchor
            anchor = options.anchor
        } else if (arguments.length === 2 && text != null && typeof text === 'object') {
            options = text
            options.anchor = anchor
        }
        let prevHideOn = options.hideOn
        options = w2utils.extend({}, this.defaults, options || {})
        if (prevHideOn) {
            options.hideOn = prevHideOn
        }
        if (!options.format) {
            let df = w2utils.settings.dateFormat
            let tf = w2utils.settings.timeFormat
            if (options.type == 'date') {
                options.format = df
            } else if (options.type == 'time') {
                options.format = tf
            } else {
                options.format = df + '|' + tf
            }
        }
        let cal = options.type == 'time' ? this.getHourHTML(options) : this.getMonthHTML(options)
        options.style += '; padding: 0;'
        options.html = cal.html
        let ret = super.attach(options)
        let overlay = ret.overlay
        Object.assign(overlay.tmp, cal)
        overlay.on('show.attach', event => {
            let overlay = event.detail.overlay
            let anchor  = overlay.anchor
            let options = overlay.options
            if (['INPUT', 'TEXTAREA'].includes(anchor.tagName) && !options.value && anchor.value) {
                overlay.tmp.initValue = anchor.value
            }
            delete overlay.newValue
            delete overlay.newDate
        })
        overlay.on('show:after.attach', event => {
            if (ret.overlay?.box) {
                this.initControls(ret.overlay)
            }
        })
        overlay.on('update:after.attach', event => {
            if (ret.overlay?.box) {
                this.initControls(ret.overlay)
            }
        })
        overlay.on('hide.attach', event => {
            let overlay = event.detail.overlay
            let anchor  = overlay.anchor
            if (overlay.newValue != null) {
                if (overlay.newDate) {
                    overlay.newValue = overlay.newDate + ' ' + overlay.newValue
                }
                if (['INPUT', 'TEXTAREA'].includes(anchor.tagName) && anchor.value != overlay.newValue) {
                    anchor.value = overlay.newValue
                }
                let edata = this.trigger('select', { date: overlay.newValue, target: overlay.name, overlay })
                if (edata.isCancelled === true) return
                // event after
                edata.finish()
            }
        })
        ret.select = (callback) => {
            overlay.on('select.attach', (event) => { callback(event) })
            return ret
        }
        return ret
    }

    initControls(overlay) {
        let options = overlay.options
        let moveMonth = (inc) => {
            let { month, year } = overlay.tmp
            month += inc
            if (month > 12) {
                month = 1
                year++
            }
            if (month < 1 ) {
                month = 12
                year--
            }
            let cal = this.getMonthHTML(options, month, year)
            Object.assign(overlay.tmp, cal)
            query(overlay.box).find('.w2ui-overlay-body').html(cal.html)
            this.initControls(overlay)
        }
        let checkJump = (event, dblclick) => {
            query(event.target).parent().find('.w2ui-jump-month, .w2ui-jump-year')
                .removeClass('w2ui-selected')
            query(event.target).addClass('w2ui-selected')
            let dt = new Date()
            let { jumpMonth, jumpYear } = overlay.tmp
            if (dblclick) {
                if (jumpYear == null) jumpYear = dt.getFullYear()
                if (jumpMonth == null) jumpMonth = dt.getMonth() + 1
            }
            if (jumpMonth && jumpYear) {
                let cal = this.getMonthHTML(options, jumpMonth, jumpYear)
                Object.assign(overlay.tmp, cal)
                query(overlay.box).find('.w2ui-overlay-body').html(cal.html)
                overlay.tmp.jump = false
                this.initControls(overlay)
            }
        }

        // events for next/prev buttons and title
        query(overlay.box)
            .find('.w2ui-cal-title')
            .off('.calendar')
            // click on title
            .on('click.calendar', event => {
                Object.assign(overlay.tmp, { jumpYear: null, jumpMonth: null })
                if (overlay.tmp.jump) {
                    let { month, year } = overlay.tmp
                    let cal = this.getMonthHTML(options, month, year)
                    query(overlay.box).find('.w2ui-overlay-body').html(cal.html)
                    overlay.tmp.jump = false
                } else {
                    query(overlay.box).find('.w2ui-overlay-body .w2ui-cal-days')
                        .replace(this.getYearHTML())
                    let el = query(overlay.box).find(`[name="${overlay.tmp.year}"]`).get(0)
                    if (el) el.scrollIntoView(true)
                    overlay.tmp.jump = true
                }
                this.initControls(overlay)
                event.stopPropagation()
            })
            // prev button
            .find('.w2ui-cal-previous')
            .off('.calendar')
            .on('click.calendar', event => {
                moveMonth(-1)
                event.stopPropagation()
            })
            .parent()
            // next button
            .find('.w2ui-cal-next')
            .off('.calendar')
            .on('click.calendar', event => {
                moveMonth(1)
                event.stopPropagation()
            })
        // now button
        query(overlay.box).find('.w2ui-cal-now')
            .off('.calendar')
            .on('click.calendar', event => {
                if (options.type == 'datetime') {
                    if (overlay.newDate) {
                        overlay.newValue = w2utils.formatTime(new Date(), options.format.split('|')[1])
                    } else {
                        overlay.newValue = w2utils.formatDateTime(new Date(), options.format)
                    }
                } else if (options.type == 'date') {
                    overlay.newValue = w2utils.formatDate(new Date(), options.format)
                } else if (options.type == 'time') {
                    overlay.newValue = w2utils.formatTime(new Date(), options.format)
                }
                this.hide(overlay.name)
            })
        // events for dates
        query(overlay.box)
            .off('.calendar')
            .on('contextmenu.calendar', event => {
                event.preventDefault() // prevent browser context menu
            })
            .on('click.calendar', { delegate: '.w2ui-day.w2ui-date' }, event => {
                if (options.type == 'datetime') {
                    overlay.newDate = query(event.target).attr('date')
                    query(overlay.box).find('.w2ui-overlay-body').html(this.getHourHTML(overlay.options).html)
                    this.initControls(overlay)
                } else {
                    overlay.newValue = query(event.target).attr('date')
                    this.hide(overlay.name)
                }
            })
            // click on month
            .on('click.calendar', { delegate: '.w2ui-jump-month' }, event => {
                overlay.tmp.jumpMonth = parseInt(query(event.target).attr('name'))
                checkJump(event)
            })
            // double click on month
            .on('dblclick.calendar', { delegate: '.w2ui-jump-month' }, event => {
                overlay.tmp.jumpMonth = parseInt(query(event.target).attr('name'))
                checkJump(event, true)
            })
            // click on year
            .on('click.calendar', { delegate: '.w2ui-jump-year' }, event => {
                overlay.tmp.jumpYear = parseInt(query(event.target).attr('name'))
                checkJump(event)
            })
            // dbl click on year
            .on('dblclick.calendar', { delegate: '.w2ui-jump-year' }, event => {
                overlay.tmp.jumpYear = parseInt(query(event.target).attr('name'))
                checkJump(event, true)
            })
            // click on hour
            .on('click.calendar', { delegate: '.w2ui-time.hour' }, event => {
                let hour = query(event.target).attr('hour')
                let min  = this.str2min(options.value) % 60
                if (overlay.tmp.initValue && !options.value) {
                    min = this.str2min(overlay.tmp.initValue) % 60
                }
                if (options.noMinutes) {
                    overlay.newValue = this.min2str(hour * 60, options.format)
                    this.hide(overlay.name)
                } else {
                    overlay.newValue = hour + ':' + min
                    let html = this.getMinHTML(hour, options).html
                    query(overlay.box).find('.w2ui-overlay-body').html(html)
                    this.initControls(overlay)
                }
            })
            // click on minute
            .on('click.calendar', { delegate: '.w2ui-time.min' }, event => {
                let hour = Math.floor(this.str2min(overlay.newValue) / 60)
                let time = (hour * 60) + parseInt(query(event.target).attr('min'))
                overlay.newValue = this.min2str(time, options.format)
                this.hide(overlay.name)
            })
    }

    getMonthHTML(options, month, year) {
        let days = w2utils.settings.fulldays.slice() // creates copy of the array
        let sdays = w2utils.settings.shortdays.slice() // creates copy of the array
        if (w2utils.settings.weekStarts !== 'M') {
            days.unshift(days.pop())
            sdays.unshift(sdays.pop())
        }

        let td = new Date()
        let dayLengthMil = 1000 * 60 * 60 * 24
        let selected = options.type === 'datetime'
            ? w2utils.isDateTime(options.value, options.format, true)
            : w2utils.isDate(options.value, options.format, true)
        let selected_dsp = w2utils.formatDate(selected)
        // normalize date
        if (month == null || year == null) {
            year  = selected ? selected.getFullYear() : td.getFullYear()
            month = selected ? selected.getMonth() + 1 : td.getMonth() + 1
        }
        if (month > 12) { month -= 12; year++ }
        if (month < 1 || month === 0) { month += 12; year-- }
        if (year/4 == Math.floor(year/4)) { this.daysCount[1] = 29 } else { this.daysCount[1] = 28 }
        options.current = month + '/' + year
        // start with the required date
        td = new Date(year, month-1, 1)
        let weekDay = td.getDay()
        let weekDays = ''
        let st = w2utils.settings.weekStarts
        for (let i = 0; i < sdays.length; i++) {
            let isSat = (st == 'M' && i == 5) || (st != 'M' && i == 6) ? true : false
            let isSun = (st == 'M' && i == 6) || (st != 'M' && i == 0) ? true : false
            weekDays += `<div class="w2ui-day w2ui-weekday ${isSat ? 'w2ui-sunday' : ''} ${isSun ? 'w2ui-saturday' : ''}">${sdays[i]}</div>`
        }
        let html = `
            <div class="w2ui-cal-title">
                <div class="w2ui-cal-previous">
                    <div></div>
                </div>
                <div class="w2ui-cal-next">
                    <div></div>
                </div>
                ${w2utils.settings.fullmonths[month-1]}, ${year}
                <span class="arrow-down"></span>
            </div>
            <div class="w2ui-cal-days">
                ${weekDays}
        `
        let DT = new Date(`${year}/${month}/1`) // first of month
        /**
         * Move to noon, instead of midnight. If not, then the date when time saving happens
         * will be duplicated in the calendar
         */
        DT = new Date(DT.getTime() + dayLengthMil * 0.5)
        let weekday = DT.getDay()
        if (w2utils.settings.weekStarts == 'M') weekDay--
        if (weekday > 0) {
            DT = new Date(DT.getTime() - (weekDay * dayLengthMil))
        }
        for (let ci = 0; ci < 42; ci++) {
            let className = []
            let dt = `${DT.getFullYear()}/${DT.getMonth()+1}/${DT.getDate()}`
            if (DT.getDay() === 6) className.push('w2ui-saturday')
            if (DT.getDay() === 0) className.push('w2ui-sunday')
            if (DT.getMonth() + 1 !== month) className.push('outside')
            if (dt == this.today) className.push('w2ui-today')

            let dspDay = DT.getDate()
            let col    = ''
            let bgcol  = ''
            let tmp_dt, tmp_dt_fmt
            if (options.type === 'datetime') {
                tmp_dt     = w2utils.formatDateTime(dt, options.format)
                tmp_dt_fmt = w2utils.formatDate(dt, w2utils.settings.dateFormat)
            } else {
                tmp_dt     = w2utils.formatDate(dt, options.format)
                tmp_dt_fmt = tmp_dt
            }
            if (options.colored && options.colored[tmp_dt_fmt] !== undefined) { // if there is predefined colors for dates
                let tmp = options.colored[tmp_dt_fmt].split('|')
                bgcol   = 'background-color: ' + tmp[0] + ';'
                col     = 'color: ' + tmp[1] + ';'
            }
            html += `<div class="w2ui-day ${this.inRange(tmp_dt, options, true)
                            ? 'w2ui-date ' + (tmp_dt_fmt == selected_dsp ? 'w2ui-selected' : '')
                            : 'w2ui-blocked'
                        } ${className.join(' ')}"
                       style="${col + bgcol}" date="${tmp_dt_fmt}" data-date="${DT.getTime()}">
                            ${dspDay}
                    </div>`
            DT = new Date(DT.getTime() + dayLengthMil)
        }
        html += '</div>'
        if (options.btnNow) {
            let label = w2utils.lang('Today' + (options.type == 'datetime' ? ' & Now' : ''))
            html += `<div class="w2ui-cal-now">${label}</div>`
        }
        return { html, month, year }
    }

    getYearHTML() {
        let mhtml = ''
        let yhtml = ''
        for (let m = 0; m < w2utils.settings.fullmonths.length; m++) {
            mhtml += `<div class="w2ui-jump-month" name="${m+1}">${w2utils.settings.shortmonths[m]}</div>`
        }
        for (let y = w2utils.settings.dateStartYear; y <= w2utils.settings.dateEndYear; y++) {
            yhtml += `<div class="w2ui-jump-year" name="${y}">${y}</div>`
        }
        return `<div class="w2ui-cal-jump">
            <div id="w2ui-jump-month">${mhtml}</div>
            <div id="w2ui-jump-year">${yhtml}</div>
        </div>`
    }

    getHourHTML(options) {
        options = options ?? {}
        if (!options.format) options.format = w2utils.settings.timeFormat
        let h24 = (options.format.indexOf('h24') > -1)
        let value = options.value ? options.value : (options.anchor ? options.anchor.value : '')

        let tmp = []
        for (let a = 0; a < 24; a++) {
            let time = (a >= 12 && !h24 ? a - 12 : a) + ':00' + (!h24 ? (a < 12 ? ' am' : ' pm') : '')
            if (a == 12 && !h24) time = '12:00 pm'
            if (!tmp[Math.floor(a/8)]) tmp[Math.floor(a/8)] = ''
            let tm1 = this.min2str(this.str2min(time))
            let tm2 = this.min2str(this.str2min(time) + 59)
            if (options.type === 'datetime') {
                let dt = w2utils.isDateTime(value, options.format, true)
                let fm = options.format.split('|')[0].trim()
                tm1    = w2utils.formatDate(dt, fm) + ' ' + tm1
                tm2    = w2utils.formatDate(dt, fm) + ' ' + tm2
            }
            let valid = this.inRange(tm1, options) || this.inRange(tm2, options)
            tmp[Math.floor(a/8)] += `<span hour="${a}"
                class="hour ${valid ? 'w2ui-time ' : 'w2ui-blocked'}">${time}</span>`
        }
        let html = `<div class="w2ui-calendar">
            <div class="w2ui-time-title">${w2utils.lang('Select Hour')}</div>
            <div class="w2ui-cal-time">
                <div class="w2ui-cal-column">${tmp[0]}</div>
                <div class="w2ui-cal-column">${tmp[1]}</div>
                <div class="w2ui-cal-column">${tmp[2]}</div>
            </div>
            ${options.btnNow ? `<div class="w2ui-cal-now">${w2utils.lang('Now')}</div>` : '' }
        </div>`
        return { html }
    }

    getMinHTML(hour, options) {
        if (hour == null) hour = 0
        options = options ?? {}
        if (!options.format) options.format = w2utils.settings.timeFormat
        let h24 = (options.format.indexOf('h24') > -1)
        let value = options.value ? options.value : (options.anchor ? options.anchor.value : '')

        let tmp = []
        for (let a = 0; a < 60; a += 5) {
            let time = (hour > 12 && !h24 ? hour - 12 : hour) + ':' + (a < 10 ? 0 : '') + a + ' ' + (!h24 ? (hour < 12 ? 'am' : 'pm') : '')
            let tm   = time
            let ind  = a < 20 ? 0 : (a < 40 ? 1 : 2)
            if (!tmp[ind]) tmp[ind] = ''
            if (options.type === 'datetime') {
                let dt = w2utils.isDateTime(value, options.format, true)
                let fm = options.format.split('|')[0].trim()
                tm = w2utils.formatDate(dt, fm) + ' ' + tm
            }
            tmp[ind] += `<span min="${a}" class="min ${(this.inRange(tm, options) ? 'w2ui-time ' : 'w2ui-blocked')}">${time}</span>`
        }
        let html = `<div class="w2ui-calendar">
            <div class="w2ui-time-title">${w2utils.lang('Select Minute')}</div>
            <div class="w2ui-cal-time">
                <div class="w2ui-cal-column">${tmp[0]}</div>
                <div class="w2ui-cal-column">${tmp[1]}</div>
                <div class="w2ui-cal-column">${tmp[2]}</div>
            </div>
            ${options.btnNow ? `<div class="w2ui-cal-now">${w2utils.lang('Now')}</div>` : '' }
        </div>`
        return { html }
    }

    // checks if date is in range (loost at start, end, blockDates, blockWeekdays)
    inRange(str, options, dateOnly) {
        let inRange = false
        if (options.type === 'date') {
            let dt = w2utils.isDate(str, options.format, true)
            if (dt) {
                // enable range
                if (options.start || options.end) {
                    let st      = (typeof options.start === 'string' ? options.start : query(options.start).val())
                    let en      = (typeof options.end === 'string' ? options.end : query(options.end).val())
                    let start   = w2utils.isDate(st, options.format, true)
                    let end     = w2utils.isDate(en, options.format, true)
                    let current = new Date(dt)
                    if (!start) start = current
                    if (!end) end = current
                    if (current >= start && current <= end) inRange = true
                } else {
                    inRange = true
                }
                // block predefined dates
                if (Array.isArray(options.blockDates) && options.blockDates.includes(str)) inRange = false
                // block weekdays
                if (Array.isArray(options.blockWeekdays) && options.blockWeekdays.includes(dt.getDay())) inRange = false
            }
        } else if (options.type === 'time') {
            if (options.start || options.end) {
                let tm  = this.str2min(str)
                let tm1 = this.str2min(options.start)
                let tm2 = this.str2min(options.end)
                if (!tm1) tm1 = tm
                if (!tm2) tm2 = tm
                if (tm >= tm1 && tm <= tm2) inRange = true
            } else {
                inRange = true
            }
        } else if (options.type === 'datetime') {
            let dt = w2utils.isDateTime(str, options.format, true)
            if (dt) {
                let format = options.format.split('|').map(format => format.trim())
                if (dateOnly) {
                    let date = w2utils.formatDate(dt, format[0])
                    let opts = w2utils.extend({}, options, { type: 'date', format: format[0] })
                    if (this.inRange(date, opts)) inRange = true
                } else {
                    let time = w2utils.formatTime(dt, format[1])
                    let opts =  { type: 'time', format: format[1], start: options.startTime, end: options.endTime }
                    if (this.inRange(time, opts)) inRange = true
                }
            }
        }
        return inRange
    }

    // converts time into number of minutes since midnight -- '11:50am' => 710
    str2min(str) {
        if (typeof str !== 'string') return null
        let tmp = str.split(':')
        if (tmp.length === 2) {
            tmp[0] = parseInt(tmp[0])
            tmp[1] = parseInt(tmp[1])
            if (str.indexOf('pm') !== -1 && tmp[0] !== 12) tmp[0] += 12
            if (str.includes('am') && tmp[0] == 12) tmp[0] = 0 // 12:00am - is midnight
        } else {
            return null
        }
        return tmp[0] * 60 + tmp[1]
    }

    // converts minutes since midnight into time str -- 710 => '11:50am'
    min2str(time, format) {
        let ret = ''
        if (time >= 24 * 60) time = time % (24 * 60)
        if (time < 0) time = 24 * 60 + time
        let hour = Math.floor(time/60)
        let min = ((time % 60) < 10 ? '0' : '') + (time % 60)
        if (!format) { format = w2utils.settings.timeFormat}
        if (format.indexOf('h24') !== -1) {
            ret = hour + ':' + min
        } else {
            ret = (hour <= 12 ? hour : hour - 12) + ':' + min + ' ' + (hour >= 12 ? 'pm' : 'am')
        }
        return ret
    }
}

let w2tooltip = new Tooltip()
let w2menu    = new MenuTooltip()
let w2color   = new ColorTooltip()
let w2date    = new DateTooltip()

export { w2tooltip, w2color, w2menu, w2date, Tooltip }