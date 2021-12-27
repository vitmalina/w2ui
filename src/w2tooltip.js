/************************************************************************
*   Part of w2ui 2.0 library
*   - Dependencies: w2utils
*
************************************************************************/

import { w2event } from './w2event.js'
import { query } from './query.js'
import { w2utils } from './w2utils.js'

class w2popper extends w2event {

    constructor() {
        // TODO: what events are used for?
        super()
        this.active = {} // all tooltips on screen now
        this.defaults = {
            name            : null,     // id for the tooltip, otherwise input id is used
            html            : '',       // text or html
            anchor          : null,     // element it is attached to
            position        : 'auto',   // can be left, right, top, bottom
            auto            : null,     // if auto true, then tooltip will show on mouseEnter and hide on mouseLeave
            showOn          : null,     // when options.auto = true, mouse event to show on
            hideOn          : null,     // when options.auto = true, mouse event to hide on
            // TOODO: not done
            align           : 'none',   // can be none, left, right, both (only works for position: top | bottom)
            left            : 0,        // delta for left coordinate
            top             : 0,        // delta for top coordinate
            maxWidth        : null,     // max width
            maxHeight       : null,     // max height
            style           : '',       // additional style for the tag
            class           : '',       // add class for w2ui-tag-body
            onShow          : null,     // callBack when shown
            onHide          : null,     // callBack when hidden
            onChange        : null,     // callback when tooltip gets updated
            onMoved         : null,     // callback when tooltip is moved
            inputClass      : '',       // add class for input when tag is shown
            inputStyle      : '',       // add style for input when tag is shown
            hideOnClick     : false,    // global hide on document click
            hideOnChange    : true,     // hides when input changes
            hideOnKeyPress  : true,     // hides when input key pressed
            hideOnFocus     : false,    // hides when input gets focus
            hideOnBlur      : false,    // hides when input gets blur
        }
    }

    get(id) {
        if (arguments.length == 0) {
            return Object.keys(this.active)
        } else {
            return this.active[id]
        }
    }

    show(anchor, text) {
        let options, tag
        if (arguments.length == 0) {
            return
        } else if (arguments.length == 1 && anchor.anchor) {
            options = anchor
            anchor = options.anchor
        } else if (arguments.length === 2 && typeof text === 'object') {
            options = text
            text = options.html
        }
        options = w2utils.extend({}, this.defaults, options ? options : {})
        if (!text && options.html) text = options.html
        // anchor is func var
        delete options.anchor

        if (options.auto === true || options.showOn != null || options.hideOn != null) {
            let self
            query(anchor).each((el, ind) => {
                let showOn = 'mouseenter', hideOn = 'mouseleave'
                if (options.showOn) {
                    showOn = String(options.showOn).toLowerCase()
                    delete options.showOn
                }
                if (options.hideOn) {
                    hideOn = String(options.hideOn).toLowerCase()
                    delete options.hideOn
                }
                query(el)
                    .off('.w2tag-auto')
                    .on(showOn + '.w2tag-auto', function (event) {
                        options.auto = false
                        w2tooltip.show(this, options)
                    })
                    .on(hideOn + '.w2tag-auto', function (event) {
                        let tag = query(this).data('w2tag')
                        if (tag) w2tooltip.hide(tag.id)
                    })
            })
        } else {
            let id = (options.name ? options.name : anchor.id)
            if (!id) {
                id = 'noid-' +Object.keys(this.active).length
            }
            if (this.active['w2tag-' + id]) {
                tag = this.active['w2tag-' + id]
                // keep event handlers from previous options
                Array('onShow', 'onHide', 'onChange', 'onMoved').forEach(method => { delete options[method] })
                tag.options = w2utils.extend({}, tag.options, options)
            } else {
                tag = { id: 'w2tag-' + id, options, anchor, tmp: {} }
                this.active[tag.id] = tag
            }
            // show or hide tag
            let tagStyles = 'white-space: nowrap;'
            if (tag.options.maxWidth && w2utils.getStrWidth(text, tagStyles) > tag.options.maxWidth) {
                tagStyles = 'width: '+ tag.options.maxWidth + 'px; white-space: inherit; overflow: auto;'
            }
            tagStyles += ' max-height: '+ (tag.options.maxHeight ? tag.options.maxHeight : window.innerHeight - 40) + 'px;'
            if (text === '' || text == null) {
                w2tooltip.hide(tag.id)
            } else if (tag.box) {
                query(tag.box)
                    .find('.w2ui-tag-body')
                    .attr('style', (tag.options.style || '') + '; ' + tagStyles)
                    .addClass(tag.options.class)
                    .html(text)
                if (typeof tag.options.onChange === 'function') {
                    tag.options.onChange(tag)
                }
            } else {
                tag.tmp.originalCSS = ''
                if (query(tag.anchor).length > 0) {
                    tag.tmp.originalCSS = query(tag.anchor)[0].style.cssText
                }
                query('body').append(
                    `<div id="${tag.id}" style="display: none;" class="w2ui-tag" data-click="stop">
                        <style></style>
                        <div class="w2ui-tag-body ${tag.options.class}" style="${tag.options.style || ''}; ${tagStyles}">
                            ${text}
                        </div>
                    </div>`)
                tag.box = query('#'+w2utils.escapeId(tag.id))[0]
                query(tag.anchor).data('w2tag', tag) // make available to element tag attached to
                w2utils.bindEvents(tag.box, {})
                setTimeout(() => { this.init(tag.id) }, 1)
            }
            // if it is input, then add style and class
            if (tag.anchor.tagName == 'INPUT') {
                if (tag.options.inputStyle) {
                    tag.anchor.style.cssText += ';' + tag.options.inputStyle
                }
                if (tag.options.inputClass) {
                    query(tag.anchor).addClass(tag.options.inputClass)
                }
            }
        }
        let ret = {
            id: tag ? tag.id : null,
            show(callback) {
                options.onShow = callback
                return ret
            },
            hide(callback) {
                options.onHide = callback
                return ret
            },
            change(callback) {
                options.onChange = callback
                return ret
            },
            moved(callback) {
                options.onMoved = callback
                return ret
            }
        }
        return ret
    }

    // bind event to hide it
    hide(id) {
        let tag
        if (arguments.length == 0) {
            Object.keys(this.active).forEach(id => {
                w2tooltip.hide(id)
            })
            return
        } else if (typeof id == 'string') {
            tag = this.active[id]
        } else {
            let q = query(id)
            if (q.length > 0) {
                tag = q.data('w2tag')
            }
        }
        if (!tag.box) return
        if (tag.tmp.timer) clearTimeout(tag.tmp.timer)
        tag.box.remove()
        query(tag.anchor)
            .off('.w2tag')
            .removeData('w2tag')
        // restore original CSS
        if (tag.anchor.tagName == 'INPUT') {
            tag.anchor.style.cssText = tag.tmp.originalCSS
            query(tag.anchor)
                .off('.w2tag')
                .removeClass(tag.options.inputClass)
        }
        query('body').off('.w2tag-' + tag.id)
        delete this.active[id]
        if (typeof tag.options.onHide === 'function') {
            tag.options.onHide(tag)
        }
    }

    init(id) {
        let tag = this.active[id]
        query(tag.box).css('display', 'block')
        if (!tag || !tag.box) return
        let hide = () => { w2tooltip.hide(tag.id) }

        if (tag.anchor.tagName === 'INPUT') {
            let $anchor = query(tag.anchor)
            $anchor.off('.w2tag')
            if (tag.options.hideOnFocus)    $anchor.on('focus.w2tag', { once: true }, hide)
            if (tag.options.hideOnBlur)     $anchor.on('blur.w2tag', { once: true }, hide)
            if (tag.options.hideOnChange)   $anchor.on('change.w2tag', { once: true }, hide)
            if (tag.options.hideOnKeyPress) $anchor.on('keypress.w2tag', { once: true }, hide)
        }
        if (tag.options.hideOnClick) {
            query('body').on('click.w2tag-'+ tag.id, hide)
        }
        if (typeof tag.options.onShow === 'function') {
            tag.options.onShow(tag)
        }
        // move if needed
        tag.tmp.instant = 3
        this.isMoved(tag.id)
        // show if neede
        query(tag.box).css('opacity', '1')
    }

    isMoved(id) {
        let tag = this.active[id]
        if (tag == null || query(tag.anchor).length === 0 || query(tag.box).find('.w2ui-tag-body').length === 0) {
            w2tooltip.hide(tag.id)
            return
        }
        let pos = this.getPosition(tag.id)
        if (tag.tmp.pos !== pos.left + 'x' + pos.top) {
            if (tag.tmp.pos && typeof tag.options.onMoved === 'function') {
                tag.options.onMoved(tag)
            }
            query(tag.box)
                .css({ 'transition': (tag.tmp.instant ? '0s' : '.2s') })
                .css({
                    left: pos.left + 'px',
                    top : pos.top + 'px'
                })
            tag.tmp.pos = pos.left + 'x' + pos.top
        }
        if (typeof tag.tmp.instant != 'boolean') {
            tag.tmp.instant--
            if (tag.tmp.instant === 0) {
                tag.tmp.instant = false
            }
        }
        if (tag.tmp.timer) clearTimeout(tag.tmp.timer)
        tag.tmp.timer = setTimeout(() => { this.isMoved(tag.id) }, tag.tmp.instant ? 0 : 100)
    }

    getPosition(id) {
        let tag = this.active[id]
        let anchor   = tag.anchor.getBoundingClientRect()
        let tipClass = 'w2ui-tag-right'
        let tipStyle = ''
        let posLeft  = parseInt(anchor.left + anchor.width + (tag.options.left ? tag.options.left : 0))
        let posTop   = parseInt(anchor.top + (tag.options.top ? tag.options.top : 0))
        let content  = query(tag.box).find('.w2ui-tag-body')
        let style    = content[0].computedStyleMap()
        let padding  = {
            top: style.get('padding-top').value,
            bottom: style.get('padding-bottom').value,
            left: style.get('padding-left').value,
            right: style.get('padding-right').value
        }
        let { width, height } = content[0].getBoundingClientRect()
        if (typeof tag.options.position === 'string') {
            if (tag.options.position == 'auto') {
                tag.options.position = 'top|bottom|right|left'
            }
            tag.options.position = tag.options.position.split('|')
        }
        // if (tag.options.maxWidth) {
        //     width = tag.options.maxWidth - padding.left
        // }
        // try to fit the tag on screen in the order defined in the array
        let maxWidth  = window.innerWidth
        let maxHeight = window.innerHeight
        let posFound  = false
        for (let i = 0; i < tag.options.position.length; i++) {
            let pos = tag.options.position[i]
            if (pos === 'right') {
                tipClass = 'w2ui-tag-right'
                tipStyle = `#${tag.id} .w2ui-tag-body:before { bottom: 50%; transform: rotate(135deg) translateY(-50%); }`
                posLeft = Math.round(parseInt(anchor.left + anchor.width + (tag.options.left ? tag.options.left : 0)
                    + (padding.left + padding.right) / 2 - 10) + document.body.scrollLeft)
                posTop = Math.round(parseInt(anchor.top - height / 2 + anchor.height / 2
                    + (tag.options.top ? tag.options.top : 0) + padding.top) - 2
                    + document.body.scrollTop)
            } else if (pos === 'left') {
                tipClass = 'w2ui-tag-left'
                tipStyle = `#${tag.id} .w2ui-tag-body:after { top: 50%; transform: rotate(-45deg) translateY(-50%); }`
                posLeft = Math.round(parseInt(anchor.left + (tag.options.left ? tag.options.left : 0)) - width - 20
                    + document.body.scrollLeft)
                posTop = Math.round(parseInt(anchor.top - height / 2 + anchor.height / 2
                    + (tag.options.top ? tag.options.top : 0) + padding.top) - 10
                    + document.body.scrollTop)
            } else if (pos === 'top') {
                tipClass = 'w2ui-tag-top'
                tipStyle = `#${tag.id} .w2ui-tag-body:after { left: 50%; transform: rotate(45deg) translateX(-50%); }`
                posLeft = Math.round(parseInt(anchor.left - width / 2 + anchor.width / 2
                    + (tag.options.left ? tag.options.left : 0) - padding.left) + 5
                    + document.body.scrollLeft)
                posTop = Math.round(parseInt(anchor.top + (tag.options.top ? tag.options.top : 0))
                    - height - padding.top + document.body.scrollTop - 2)
            } else if (pos === 'bottom') {
                tipClass = 'w2ui-tag-bottom'
                tipStyle = `#${tag.id} .w2ui-tag-body:before { right: 50%; transform: rotate(-135deg) translateX(-50%); }`
                posLeft = Math.round(parseInt(anchor.left - width / 2 + anchor.width / 2
                    + (tag.options.left ? tag.options.left : 0) - padding.left) + 6
                    + document.body.scrollLeft)
                posTop = Math.round(parseInt(anchor.top + anchor.height + (tag.options.top ? tag.options.top : 0))
                    + (padding.top + padding.bottom) / 2 + 2 + document.body.scrollTop)
            }
            let newLeft = posLeft - document.body.scrollLeft
            let newTop = posTop - document.body.scrollTop
            if (newLeft + width + 20 <= maxWidth && newLeft >= 0 && newTop + height <= maxHeight && newTop >= 0) {
                // scroll bar is 20
                posFound = true
                break
            }
        }
        if (!posFound) {
            if (tag.tmp.hidden != true) {
                tag.tmp.hidden = true
                query(tag.box).hide()
            }
        } else {
            if (tag.tmp.tipClass !== tipClass) {
                tag.tmp.tipClass = tipClass
                content
                    .removeClass('w2ui-tag-right w2ui-tag-left w2ui-tag-top w2ui-tag-bottom')
                    .addClass(tipClass)
                    .closest('.w2ui-tag')
                    .find('style')
                    .text(tipStyle)
            }
            if (tag.tmp.hidden) {
                tag.tmp.hidden = false
                tag.tmp.instant = 3
                query(tag.box).show()
            }
        }
        return { left: posLeft, top: posTop }
    }
}

let w2tooltip = new w2popper()

export { w2tooltip }