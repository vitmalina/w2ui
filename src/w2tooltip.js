/************************************************************************
*   Part of w2ui 2.0 library
*   - Dependencies: w2utils, w2event mQuery
*
************************************************************************/

import { w2event } from './w2event.js'
import { query } from './query.js'
import { w2utils } from './w2utils.js'

class Popper extends w2event {

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
            // TODO: not done
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
        let self = this
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
                        self.show(this, options)
                    })
                    .on(hideOn + '.w2tag-auto', function (event) {
                        let tag = query(this).data('w2tag')
                        if (tag) self.hide(tag.id)
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
                self.hide(tag.id)
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
                this.hide(id)
            })
            return
        } else if (typeof id == 'string') {
            tag = this.active[id]
        } else {
            let q = query(id)
            if (q.length > 0) {
                tag = q.data('w2tag')
                id = tag.id
            }
        }
        if (!tag || !tag.box) return
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
        delete this.active[tag.id]
        if (typeof tag.options.onHide === 'function') {
            tag.options.onHide(tag)
        }
    }

    init(id) {
        let self = this
        let tag = this.active[id]
        query(tag.box).css('display', 'block')
        if (!tag || !tag.box) return
        let hide = () => { self.hide(tag.id) }

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
            this.hide(tag.id)
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

class ColorPopper extends Popper {
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
            transparent: false,
            color: '#DDDDDD',
            fireChange: null,
            maxWidth: 252,
            maxHeight: 220,
            style: 'padding: 0; border: 1px solid silver;'
        })
    }

    show(anchor, text) {
        let options
        if (arguments.length == 1 && anchor.anchor) {
            options = anchor
            anchor = options.anchor
        } else if (arguments.length === 2 && typeof text === 'object') {
            options = text
            options.anchor = anchor
        }
        options = w2utils.extend({}, this.defaults, options)
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
        if (options.fireChange == null) options.fireChange = true
        // color html
        options.html = this.getColorHTML(options, options.html)
        let ret = super.show(options)
        let tag = this.get(ret.id)
        ret.select = (callback) => {
            tag.options.onSelect = callback
            return ret
        }
        return ret
    }

    getColorHTML(options, customHTML) {
        let bor
        let html = `
            <div class="w2ui-colors w2ui-eaction" data-mousedown="keepOpen|this">
                <div class="w2ui-color-palette">
            <table cellspacing="0" cellpadding="0">`
        for (let i = 0; i < this.palette.length; i++) {
            html += '<tr>'
            for (let j = 0; j < this.palette[i].length; j++) {
                if (this.palette[i][j] === 'FFFFFF') bor = '; border: 1px solid #efefef'; else bor = ''
                html += `
                    <td>
                        <div class="w2ui-color ${this.palette[i][j] === '' ? 'w2ui-no-color' : ''}"
                                style="background-color: #${this.palette[i][j] + bor};"
                                name="${this.palette[i][j]}" index="${i}:${j}">
                            ${(options.color == this.palette[i][j]
                                ? '<span style="position: relative; top: -4px;">&#149;</span>'
                                : '&#160;')
                            }
                        </div>
                    </td>`
            }
            html += '</tr>'
            if (i < 2) html += '<tr><td colspan="12" style="height: 5px"></td></tr>'
        }
        html += '</table>'+
                '</div>'
        if (true) {
            html += `
                <div class="w2ui-color-advanced" style="display: none">
                   <div class="color-info">
                       <div class="color-preview-bg"><div class="color-preview"></div><div class="color-original"></div></div>
                       <div class="color-part">
                           <span>H</span> <input name="h" maxlength="3" max="360" tabindex="101">
                           <span>R</span> <input name="r" maxlength="3" max="255" tabindex="104">
                       </div>
                       <div class="color-part">
                           <span>S</span> <input name="s" maxlength="3" max="100" tabindex="102">
                           <span>G</span> <input name="g" maxlength="3" max="255" tabindex="105">
                       </div>
                       <div class="color-part">
                           <span>V</span> <input name="v" maxlength="3" max="100" tabindex="103">
                           <span>B</span> <input name="b" maxlength="3" max="255" tabindex="106">
                       </div>
                       <div class="color-part" style="margin: 30px 0px 0px 2px">
                           <span style="width: 40px">${w2utils.lang('Opacity')}</span>
                           <input name="a" maxlength="5" max="1" style="width: 32px !important" tabindex="107">
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
        }
        html += `
            <div class="w2ui-color-tabs">
               <div class="w2ui-color-tab selected w2ui-eaction" data-click="colorClick|this"><span class="w2ui-icon w2ui-icon-colors"></span></div>
               <div class="w2ui-color-tab w2ui-eaction" data-click="colorClick2|this"><span class="w2ui-icon w2ui-icon-settings"></span></div>
               <div style="padding: 8px; text-align: right;">${(typeof customHTML == 'string' ? customHTML : '')}</div>
            </div>
            <div style="clear: both; height: 0"></div>`
        return html
    }
}

class DatePopper extends Popper {
    constructor() {
        super()
    }
}

class TimePopper extends Popper {
    constructor() {
        super()
    }
}

class MenuPopper extends Popper {
    constructor() {
        super()
    }
}

let w2tooltip = new Popper()
let w2color   = new ColorPopper()
let w2date    = new DatePopper()
let w2time    = new TimePopper()
let w2menu    = new MenuPopper()

export { w2tooltip, w2color, w2date, w2time, w2menu, Popper, ColorPopper, DatePopper, TimePopper, MenuPopper }