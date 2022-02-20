/**
 * Part of w2ui 2.0 library
 * - Dependencies: mQuery, w2utils, w2base
 *
 * 2.0 Changes
 * - multiple tooltips to the same anchor
 *
 * TODO
 * - cleanup w2color less
 */

import { w2base } from './w2base.js'
import { $, query } from './query.js'
import { w2utils } from './w2utils.js'

window.$ = query // TODO: remove

class Tooltip extends w2base {
    // all acitve tooltips, any any its descendants
    static active = {}
    constructor() {
        super()
        this.defaults = {
            name            : null,     // name for the overlay, otherwise input id is used
            html            : '',       // text or html
            style           : '',       // additional style for the overlay
            class           : '',       // add class for w2ui-tooltip-body
            position        : 'auto',   // can be left, right, top, bottom
            align           : '',       // can be: both:size=50, left, right, both, top, bottom
            anchor          : null,     // element it is attached to
            anchorClass     : '',       // add class for anchor when tooltip is shown
            anchorStyle     : '',       // add style for anchor when tooltip is shown
            autoShow        : false,    // if autoShow true, then tooltip will show on mouseEnter and hide on mouseLeave
            autoShowOn      : null,     // when options.auto = true, mouse event to show on
            autoHideOn      : null,     // when options.auto = true, mouse event to hide on
            arrowSize       : 8,        // size of the carret
            margin          : 0,        // extra margin from the anchor
            screenMargin    : 2,        // min margin from screen to tooltip
            autoResize      : true,     // auto resize based on content size and available size
            offsetX         : 0,        // delta for left coordinate
            offsetY         : 0,        // delta for top coordinate
            maxWidth        : null,     // max width
            maxHeight       : null,     // max height
            watchScroll     : null,     // attach to onScroll event // TODO:
            watchResize     : null,     // attach to onResize event // TODO:
            hideOn          : null,     // events when to hide tooltip, ['click', 'change', 'key', 'focus', 'blur'],
            onShow          : null,     // callBack when shown
            onHide          : null,     // callBack when hidden
            onUpdate        : null,     // callback when tooltip gets updated
            onMove          : null      // callback when tooltip is moved
        }
    }

    // map events to individual tooltips
    onShow(event) { this._trigger('onShow', event) }
    onHide(event) { this._trigger('onHide', event) }
    onUpdate(event) { this._trigger('onUpdate', event) }
    onMove(event) { this._trigger('onMove', event) }

    _trigger(eventName, event) {
        let overlay = Tooltip.active[event.target]
        if (typeof overlay.options[eventName] == 'function') {
            overlay.options[eventName](event)
        }
    }

    get(name) {
        if (arguments.length == 0) {
            return Object.keys(Tooltip.active)
        } else if (name === true) {
            return Tooltip.active
        } else {
            return Tooltip.active[name]
        }
    }

    attach(anchor, text) {
        let options, overlay
        let self = this
        if (arguments.length == 0) {
            return
        } else if (arguments.length == 1 && anchor.anchor) {
            options = anchor
            anchor = options.anchor
        } else if (arguments.length === 2 && typeof text === 'string') {
            options = { anchor, html: text }
            text = options.html
        } else if (arguments.length === 2 && typeof text === 'object') {
            options = text
            text = options.html
        }
        options = w2utils.extend({}, this.defaults, options ? options : {})
        if (!text && options.text) text = options.text
        if (!text && options.html) text = options.html
        // anchor is func var
        delete options.anchor

        // define tooltip
        let name = (options.name ? options.name : anchor.id)
        if (!name) {
            name = 'noname-' +Object.keys(Tooltip.active).length
        }
        if (name == anchor.id && Tooltip.active[name]) {
            // find unique name
            let find = (name, ind=0) => {
                if (ind !== 0) name = name.substr(0, name.length-2)
                name += '-' + (ind + 1)
                return (Tooltip.active['w2overlay-' + name] == null ? name : find(name, ind+1))
            }
            name = find(name)
        }
        if (Tooltip.active[name]) {
            overlay = Tooltip.active[name]
            overlay.prevOptions = overlay.options
            overlay.options = w2utils.extend({}, overlay.options, options)
        } else {
            overlay = {
                displayed: false,
                id: 'w2overlay-' + name, name, options, anchor,
                tmp: {
                    resizeObserver: new ResizeObserver(() => {
                        this.resize(overlay.name)
                    })
                }
            }
            Tooltip.active[name] = overlay
        }
        // add event for auto show/hide
        if (options.autoShow === true) {
            options.autoShowOn = options.autoShowOn ?? 'mouseenter'
            options.autoHideOn = options.autoHideOn ?? 'mouseleave'
            options.autoShow = false
        }
        if (options.autoShowOn) {
            query(anchor).on(options.autoShowOn + '.w2overlay-init', event => {
                self.show(overlay.name)
                // event.stopPropagation()
            })
            delete options.autoShowOn
        }
        if (options.autoHideOn) {
            query(anchor).on(options.autoHideOn + '.w2overlay-init', event => {
                self.hide(overlay.name)
                // event.stopPropagation()
            })
            delete options.autoHideOn
        }
        self.off('.attach')
        let ret = {
            overlay,
            then: (callback) => {
                self.on('show:after.attach', event => { callback(event) })
                return ret
            },
            show: (callback) => {
                self.on('show.attach', event => { callback(event) })
                return ret
            },
            hide: (callback) => {
                self.on('hide.attach', event => { callback(event) })
                return ret
            },
            update: (callback) => {
                self.on('update.attach', event => { callback(event) })
                return ret
            },
            move: (callback) => {
                self.on('move.attach', event => { callback(event) })
                return ret
            }
        }
        return ret
    }

    show(name) {
        if (name instanceof HTMLElement || name instanceof Object) {
            let ret = this.attach(...arguments)
            // need a timer, so that events would be preperty set
            setTimeout(() => { this.show(ret.overlay.name) }, 1)
            return ret
        }
        let edata
        let self = this
        let overlay = Tooltip.active[name]
        let options = overlay.options
        if (!overlay) return
        let isVertical = ['top', 'bottom'].includes(position[0])
        // enforce nowrap only when align=both and vertical
        let overlayStyles = (options.align == 'both' && isVertical ? '' : 'white-space: nowrap;')
        if (options.maxWidth && w2utils.getStrWidth(options.html, '') > options.maxWidth) {
            overlayStyles = 'width: '+ options.maxWidth + 'px; white-space: inherit; overflow: auto;'
        }
        overlayStyles += ' max-height: '+ (options.maxHeight ? options.maxHeight : window.innerHeight - 40) + 'px;'
        // if empty content - then hide it
        if (options.html === '' || options.html == null) {
            self.hide(name)
        } else if (overlay.box) {
            // if already present, update it
            edata = this.trigger({ phase: 'before', type: 'update', target: name, overlay })
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
            edata = this.trigger({ phase: 'before', type: 'show', target: name, overlay })
            if (edata.isCancelled === true) return
            // normal processing
            query('body').append(
                `<div id="${overlay.id}" name="${name}" style="display: none;" class="w2ui-overlay"
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
        }
        if (options.anchorStyle) {
            overlay.anchor.style.cssText += ';' + options.anchorStyle
        }
        if (options.anchorClass) {
            query(overlay.anchor).addClass(options.anchorClass)
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
        overlay.tmp.resizeObserver.observe(overlay.box)
        // then insert html and it will adjust
        query(overlay.box)
            .find('.w2ui-overlay-body')
            .html(options.html)
        // now, make visible, it has css opacity transition
        setTimeout(() => { query(overlay.box).css('opacity', 1) }, 0)
        // event after
        this.trigger(w2utils.extend(edata, { phase: 'after' }))
        return

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
                if (overlay.anchor.tagName === 'INPUT') {
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
            if (overlay.anchor.tagName === 'INPUT') {
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
            overlay = Tooltip.active[name]
        }
        if (!overlay || !overlay.box) return
        // event before
        let edata = this.trigger({ phase: 'before', type: 'hide', target: name, overlay })
        if (edata.isCancelled === true) return
        let scope = 'tooltip-' + overlay.name
        // normal processing
        overlay.tmp.resizeObserver.disconnect()
        if (overlay.options.watchScroll) {
            query(overlay.options.watchScroll)
                .off('.w2scroll-' + overlay.name)
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
        this.trigger(w2utils.extend(edata, { phase: 'after' }))
    }

    resize(name) {
        if (arguments.length == 0) {
            Object.keys(Tooltip.active).forEach(key => {
                let overlay = Tooltip.active[key]
                if (overlay.displayed) this.resize(overlay.name)
            })
            return
        }
        let overlay = Tooltip.active[name]
        let pos = this.getPosition(overlay.name)
        let newPos = pos.left + 'x' + pos.top
        let edata
        if (overlay.tmp.lastPos != newPos) {
            edata = this.trigger({ phase: 'before', type: 'move', target: name, overlay, pos })
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

        if (overlay.tmp.lastPos != newPos) {
            overlay.tmp.lastPos = newPos
            this.trigger(w2utils.extend(edata, { phase: 'after' }))
        }
    }

    getPosition(name) {
        let overlay = Tooltip.active[name]
        if (!overlay || !overlay.box) {
            return
        }
        let options   = overlay.options
        if (overlay.tmp.resizedY || overlay.tmp.resizedX) {
            query(overlay.box).css({ width: '', height: '' })
        }
        let scrollSize = w2utils.scrollBarSize()
        let max        = { width: window.innerWidth - scrollSize, height: window.innerHeight - scrollSize }
        let scroll     = { left: overlay.tmp?.scrollLeft || 0, top: overlay.tmp?.scrollTop || 0 }
        let position   = options.position == 'auto' ? 'top|bottom|right|left'.split('|') : options.position.split('|')
        let isVertical = ['top', 'bottom'].includes(position[0])
        let anchor     = overlay.anchor.getBoundingClientRect()
        let content    = overlay.box.getBoundingClientRect()
                // if convent overflows, the get max overflow
        let body = query(overlay.box).find('.w2ui-overlay-body').get(0)
        // space available
        let available = { // tipsize adjustment should be here, not in max.width/max.height
            top: anchor.top - options.arrowSize,
            bottom: max.height - (anchor.top + anchor.height) - options.arrowSize,
            left: anchor.left - options.arrowSize,
            right: max.width - (anchor.left + anchor.width) - options.arrowSize,
        }
        // size of empty tooltip
        if (content.width < 22) content.width = 22
        if (content.height < 14) content.height = 14
        let left, top, width, height // tooltip position
        let found = ''
        let arrow = {
            offset: 0,
            class: '',
            style: `#${overlay.id} { --tip-size: ${options.arrowSize}px; }`
        }
        let adjust   = { left: 0, top: 0 }
        let bestFit  = { posX: '', x: 0, posY: '', y: 0 }

        // find best position
        position.forEach(pos => {
            if (['top', 'bottom'].includes(pos)) {
                if (!found && (content.height + options.arrowSize) < available[pos]) {
                    found = pos
                }
                if (available[pos] > bestFit.y) {
                    Object.assign(bestFit, { posY: pos, y: available[pos] })
                }
            }
            if (['left', 'right'].includes(pos)) {
                if (!found && (content.width + options.arrowSize) < available[pos]) {
                    found = pos
                }
                if (available[pos] > bestFit.x) {
                    Object.assign(bestFit, { posXY: pos, x: available[pos] })
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
        anchorAlignment()
        screenAdjust()

        let extraTop = (found == 'top' ? -options.margin : (found == 'bottom' ? options.margin : 0))
        let extraLeft = (found == 'left' ? -options.margin : (found == 'right' ? options.margin : 0))

        // adjust for scrollbar
        top = top + parseFloat(options.offsetY) + parseInt(extraTop)
        left = left + parseFloat(options.offsetX) + parseInt(extraLeft)

        return { left, top, arrow, adjust, width, height, pos: found }

        function usePosition(pos) {
            arrow.class = `w2ui-arrow-${pos}`
            switch (pos) {
                case 'top': {
                    left = anchor.left + (anchor.width - (width ?? content.width)) / 2
                    top = anchor.top - (height ?? content.height) - options.arrowSize
                    break
                }
                case 'bottom': {
                    left = anchor.left + (anchor.width - (width ?? content.width)) / 2
                    top = anchor.top + anchor.height + options.arrowSize
                    break
                }
                case 'left': {
                    left = anchor.left - (width ?? content.width) - options.arrowSize
                    top = anchor.top + (anchor.height - (height ?? content.height)) / 2
                    break
                }
                case 'right': {
                    left = anchor.left + anchor.width + options.arrowSize
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
            let minLeft = (found == 'right' ? options.arrowSize : options.screenMargin)
            let minTop  = (found == 'bottom' ? options.arrowSize : options.screenMargin)
            let maxLeft = max.width - (width ?? content.width) - (found == 'left' ? options.arrowSize : options.screenMargin)
            let maxTop  = max.height - (height ?? content.height) - (found == 'top' ? options.arrowSize : options.screenMargin)
            if (left < minLeft) {
                adjustArrow = true
                adjust.left -= left
                left = minLeft
            }
            if (top < minTop) {
                adjustArrow = true
                adjust.top -= top
                top = minTop
            }
            if (left > maxLeft) {
                adjustArrow = true
                adjust.left -= left - maxLeft
                left += maxLeft - left
            }
            if (top > maxTop) {
                adjustArrow = true
                adjust.top -= top - maxTop
                top += maxTop - top
            }
            if (adjustArrow) {
                let aType = 'top'
                let sType = 'height'
                if (isVertical) {
                    aType = 'left'
                    sType = 'width'
                }
                arrow.offset = -adjust[aType]
                let maxOffset = content[sType] / 2 - options.arrowSize
                if (Math.abs(arrow.offset) > maxOffset + options.arrowSize) {
                    arrow.class = '' // no arrow
                }
                if (Math.abs(arrow.offset) > maxOffset) {
                    arrow.offset = arrow.offset < 0 ? -maxOffset : maxOffset
                }
                arrow.style = `#${overlay.id} .w2ui-overlay-body:after,
                            #${overlay.id} .w2ui-overlay-body:before {
                                --tip-size: ${options.arrowSize}px;
                                margin-${aType}: ${arrow.offset}px;
                            }`
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
            advanced: false,
            transparent: true,
            position: 'top|bottom',
            class: 'w2ui-white',
            color: '',
            liveUpdate: true,
            arrowSize: 12,
            autoResize: false,
            anchorClass: 'w2ui-focus',
            autoShowOn: 'focus',
            hideOn: ['doc-click', 'focus-change']
        })
    }

    onSelect(event) { this._trigger('onSelect', event) }
    onLiveUpdate(event) { this._trigger('onLiveUpdate', event) }

    attach(anchor, text) {
        let options, self = this
        if (arguments.length == 1 && anchor.anchor) {
            options = anchor
            anchor = options.anchor
        } else if (arguments.length === 2 && typeof text === 'object') {
            options = text
            options.anchor = anchor
        }
        options = w2utils.extend({}, this.defaults, options)
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
        options.html = this.getColorHTML(options)
        let ret = super.attach(options)
        this.on('show', event => {
            let anchor  = event.overlay.anchor
            let options = event.overlay.options
            if (anchor.tagName === 'INPUT' && !options.color && anchor.value) {
                event.overlay.tmp.initColor = anchor.value
            }
        })
        this.on('show:after', event => {
            if (ret.overlay?.box) {
                let actions = query(ret.overlay.box).find('.w2ui-eaction')
                w2utils.bindEvents(actions, this)
                this.initControls(ret.overlay)
            }
        })
        this.on('update:after', event => {
            if (ret.overlay?.box) {
                let actions = query(ret.overlay.box).find('.w2ui-eaction')
                w2utils.bindEvents(actions, this)
                this.initControls(ret.overlay)
            }
        })
        this.on('hide', event => {
            let overlay = event.overlay
            let anchor  = overlay.anchor
            let color   = overlay.newColor ?? ''
            if (anchor.tagName === 'INPUT' && anchor.value != color) {
                anchor.value = color
            }
            let edata = this.trigger({ phase: 'before', type: 'select', color, target: overlay.name, overlay })
            if (edata.isCancelled === true) return
            // event after
            this.trigger(w2utils.extend(edata, { phase: 'after' }))
        })
        ret.liveUpdate = (callback) => {
            self.on('liveUpdate.attach', (event) => { callback(event) })
            return ret
        }
        ret.select = (callback) => {
            self.on('select.attach', (event) => { callback(event) })
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
        let edata = this.trigger({ phase: 'before', type: 'liveUpdate', color, target: name, overlay, param: arguments[1] })
        if (edata.isCancelled === true) return
        // if anchor is input - live update
        if (overlay.anchor.tagName === 'INPUT' && overlay.options.liveUpdate) {
            query(overlay.anchor).val(color)
        }
        overlay.newColor = color
        query(overlay.box).find('.w2ui-selected').removeClass('w2ui-selected')
        if (target) {
            query(target).addClass('w2ui-selected')
        }
        // event after
        this.trigger(w2utils.extend(edata, { phase: 'after' }))
    }

    // used for keyboard navigation, if any
    nextColor(direction) { // TODO: check it
        let pal = this.palette
        switch (direction) {
            case 'up':
                index[0]--
                break
            case 'down':
                index[0]++
                break
            case 'right':
                index[1]++
                break
            case 'left':
                index[1]--
                break
        }
        if (index[0] < 0) index[0] = 0
        if (index[0] > pal.length - 2) index[0] = pal.length - 2
        if (index[1] < 0) index[1] = 0
        if (index[1] > pal[0].length - 1) index[1] = pal[0].length - 1
        return pal[index[0]][index[1]]
    }

    tabClick(index, name) {
        if (typeof name != 'string') {
            name = query(name.target).closest('.w2ui-overlay').attr('name')
        }
        let overlay = this.get(name)
        let tab = query(overlay.box).find(`.w2ui-color-tab:nth-child(${index})`)
        query(overlay.box).find('.w2ui-color-tab').removeClass('selected')
        query(tab).addClass('selected')
        query(overlay.box)
            .find('.w2ui-tab-content')
            .hide()
            .closest('.w2ui-colors')
            .find('.tab-'+ index)
            .show()
    }

    // generate HTML with color pallent and controls
    getColorHTML(options) {
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
                        data-mousedown="select|'${color}'|event" data-mouseup="hide">&nbsp;
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
        query(overlay.box).find('input')
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
        return;

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
            let offset1 = parseInt(el1[0].clientWidth) / 2
            let offset2 = parseInt(el2[0].clientWidth) / 2
            el1.css({
                'left': hsv.s * 150 / 100 - offset1,
                'top': (100 - hsv.v) * 125 / 100 - offset1
            })
            el2.css('left', hsv.h/(360/150) - offset2)
            el3.css('left', rgb.a*150 - offset2)
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
        //   tooltip  : '',      // TODO: Not working
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
            render      : null,        // TODO:
            spinner     : false,
            msgNoItems  : w2utils.lang('No items found'),
            topHTML     : '',
            menuStyle   : '',
            filter      : false,        // TODO
            search      : false,        // top search
            altRows     : false,

            arrowSize   : 10,
            align       : 'left',
            position    : 'bottom|top',
            class       : 'w2ui-white',
            anchorClass : 'w2ui-focus',
            autoShowOn  : 'focus',
            hideOn      : ['doc-click', 'focus-change', 'select'] // also can 'item-remove'
        })
    }

    onSelect(event) { this._trigger('onSelect', event) }
    onSubMenu(event) { this._trigger('onSubMenu', event) }
    onRemove(event) { this._trigger('onRemove', event) }

    attach(anchor, text) {
        let options, self = this
        if (arguments.length == 1 && anchor.anchor) {
            options = anchor
            anchor = options.anchor
        } else if (arguments.length === 2 && typeof text === 'object') {
            options = text
            options.anchor = anchor
        }
        options = w2utils.extend({}, this.defaults, options)
        options.style += '; padding: 0;'
        if (!Array.isArray(options.items)) {
            options.items = []
        }
        options.html = this.getMenuHTML(options)
        let ret = super.attach(options)
        // TODO: are these events removed?
        this.on('show:after', event => {
            if (ret.overlay?.box) {
                let actions = query(ret.overlay.box).find('.w2ui-eaction')
                w2utils.bindEvents(actions, this)
                this.initControls(ret.overlay)
            }
        })
        this.on('update:after', event => {
            if (ret.overlay?.box) {
                let actions = query(ret.overlay.box).find('.w2ui-eaction')
                w2utils.bindEvents(actions, this)
                this.initControls(ret.overlay)
            }
        })
        ret.select = (callback) => {
            self.on('select.attach', (event) => { callback(event) })
            return ret
        }
        ret.remove = (callback) => {
            self.on('remove.attach', (event) => { callback(event) })
            return ret
        }
        ret.subMenu = (callback) => {
            self.on('subMenu.attach', (event) => { callback(event) })
            return ret
        }
        return ret
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
        // normalize options.index
        if (options.index == null || options.index == -1) options.index = []
        if (!Array.isArray(options.index) && w2utils.isInt(options.index) && parseInt(options.index) >= 0) {
            options.index = [options.index]
        }
        if (items == null) {
            items = options.items
        }
        items = w2utils.normMenu(items)
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
            for (let i = 0; i < options.items.length; i++) options.items[i].hidden = false
        }
        if (!subMenu && options.topHTML) {
            topHTML += `<div class="w2ui-menu-top">${options.topHTML}</div>`
        }
        let menu_html = `
            ${topHTML}
            <div class="w2ui-menu ${(subMenu ? 'w2ui-sub-menu' : '')}" ${!subMenu ? `style="${options.menuStyle}"` : ''}>
        `
        items.forEach((mitem, f) => {
            icon = mitem.icon
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
                if (icon) icon_dsp = '<div class="menu-icon"><span class="w2ui-icon '+ icon +'"></span></div>'
                // render only if non-empty
                if (mitem.type !== 'break' && txt != null && txt !== '' && String(txt).substr(0, 2) != '--') {
                    let classes = ['w2ui-menu-item']
                    if (options.altRows == true) {
                        classes.push(count % 2 === 0 ? 'w2ui-even' : 'w2ui-odd')
                    }
                    let colspan = 1
                    if (icon_dsp === '') colspan++
                    if (mitem.count == null && mitem.hotkey == null && mitem.remove !== true && mitem.items == null) colspan++
                    if (mitem.tooltip == null && mitem.hint != null) mitem.tooltip = mitem.hint // for backward compatibility
                    let count_dsp = ''
                    if (mitem.remove === true) {
                        count_dsp = '<span class="remove">x</span>'
                    } else if (mitem.items != null) {
                        let _items = []
                        if (typeof mitem.items == 'function') {
                            _items = mitem.items(mitem)
                        } else if (Array.isArray(mitem.items)) {
                            _items = mitem.items
                        }
                        count_dsp   = '<span></span>'
                        subMenu_dsp = `
                            <div class="w2ui-sub-menu-box" style="${mitem.expanded ? '' : 'display: none'}">
                                ${this.getMenuHTML(options, _items, true, parentIndex.concat(f))}
                            </div>`
                    } else {
                        if (mitem.count != null) count_dsp += '<span>' + mitem.count + '</span>'
                        if (mitem.hotkey != null) count_dsp += '<span class="hotkey">' + mitem.hotkey + '</span>'
                    }
                    if (options.index.join('-') == parentIndex.concat([f]).join('-')) {
                        classes.push('w2ui-selected')
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
                    // classes.push('w2ui-eaction')
                    // TODO: tooltip
                    menu_html += `
                        <div index="${(parentIndex.length > 0 ? parentIndex.join('-') + '-' : '') + f}"
                            class="${classes.join(' ')}" style="${mitem.style ? mitem.style : ''}"
                            tooltip="${mitem.tooltip ? w2utils.lang(mitem.tooltip) : ''}"
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
                        <div class="w2ui-menu-divider ${divText != '' ? 'has-text' : ''}">
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

    initControls(overlay) {
        query(overlay.box).find('.w2ui-menu:not(.w2ui-sub-menu)')
            .off('.w2menu')
            .on('mouseDown.w2menu', { delegate: '.w2ui-menu-item' }, event => {
                let dt = event.delegate.dataset
                this.menuDown(overlay, event, dt.index, dt.parents)
            })
            .on('click.w2menu', { delegate: '.w2ui-menu-item' }, event => {
                let dt = event.delegate.dataset
                this.menuClick(overlay, event, dt.index, dt.parents)
            })
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
        }
        if (typeof items == 'function') {
            items = items({ overlay, index, parentIndex, event })
        }
        let item = items[index]
        if (item.disabled && !query(event.target).hasClass('remove')) {
            return
        }
        let edata
        if (query(event.target).hasClass('remove')) {
            edata = this.trigger({ phase: 'before', type: 'remove', target: overlay.name,
                        overlay, item, index, parentIndex, el: $item[0] })
            if (edata.isCancelled === true) {
                return
            }
            keepOpen = !options.hideOn.includes('item-remove')
            $item.remove()

        } else if ($item.hasClass('has-sub-menu')) {
            edata = this.trigger({ phase: 'before', type: 'subMenu', target: overlay.name,
                        overlay, item, index, parentIndex, el: $item[0] })
            if (edata.isCancelled === true) {
                return
            }
            keepOpen = true
            if ($item.hasClass('expanded')) {
                item.expanded = false
                $item.removeClass('expanded').addClass('collapsed')
                query($item.get(0).nextElementSibling).hide()
                this.activeChain = null // reset active chain
                options.index = $item.attr('index').split('-')
            } else {
                item.expanded = true
                $item.addClass('expanded').removeClass('collapsed')
                query($item.get(0).nextElementSibling).show()
                this.activeChain = null // reset active chain
                options.index = $item.attr('index').split('-')
            }
        } else {
            edata = this.trigger({ phase: 'before', type: 'select', target: overlay.name,
                        overlay, item, index, parentIndex, keepOpen, el: $item[0] })
            if (edata.isCancelled === true) {
                return
            }
            if (item.keepOpen != null) {
                keepOpen = item.keepOpen
            }
        }
        if (!keepOpen) {
            this.hide(overlay.name)
        }
        // if (overlay.anchor.tagName == 'INPUT') {
        //     overlay.anchor.focus()
        // }
        // event after
        this.trigger(w2utils.extend(edata, { phase: 'after' }))
    }
}

class DateTooltip extends Tooltip {
    constructor() {
        super()
    }
}

class TimeTooltip extends Tooltip {
    constructor() {
        super()
    }
}

let w2tooltip = new Tooltip()
let w2menu    = new MenuTooltip()
let w2color   = new ColorTooltip()
let w2date    = new DateTooltip()
let w2time    = new TimeTooltip()

export { w2tooltip, w2color, w2date, w2time, w2menu }