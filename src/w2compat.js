/************************************************************************
*   Part of w2ui 2.0 library
*
* == 2.0 changes
*   - CSP - fixed inline events
*
************************************************************************/

import { w2locale } from './w2locale.js'
import { w2event } from './w2event.js'
import { w2ui, w2utils } from './w2utils.js'
import { w2popup, w2alert, w2confirm, w2prompt } from './w2popup.js'
import { w2field, addType, removeType } from './w2field.js'
import { w2form } from './w2form.js'
import { w2grid } from './w2grid.js'
import { w2layout } from './w2layout.js'
import { w2sidebar } from './w2sidebar.js'
import { w2tabs } from './w2tabs.js'
import { w2toolbar } from './w2toolbar.js'

// Register jQuery plugins
(function($) {
    // if jQuery is not defined, then exit
    if (!$) return

    // register globals if needed
    $.w2globals = function() {
        (function (win, obj) {
            Object.keys(obj).forEach(key => {
                win[key] = obj[key]
            })
        })(window, { w2ui, w2locale, w2event, w2utils, w2popup, w2alert, w2confirm, w2prompt, w2field, w2form, w2grid,
            w2layout, w2sidebar, w2tabs, w2toolbar, addType, removeType })
    }
    // if url has globals at the end, then register globals
    let param = String(import.meta.url).split('?')[1] || ''
    if (param == 'globals' || param.substr(0, 8) == 'globals=') {
        $.w2globals()
    }

    $.fn.w2render = function(name) {
        if ($(this).length > 0) {
            if (typeof name === 'string' && w2ui[name]) w2ui[name].render($(this)[0])
            if (typeof name === 'object') name.render($(this)[0])
        }
    }

    $.fn.w2destroy = function(name) {
        if (!name && this.length > 0) name = this.attr('name')
        if (typeof name === 'string' && w2ui[name]) w2ui[name].destroy()
        if (typeof name === 'object') name.destroy()
    }

    $.fn.w2field = function(type, options) {
        // if without arguments - return the object
        if (arguments.length === 0) {
            let obj = $(this).data('w2field')
            return obj
        }
        return this.each((index, el) => {
            let obj = $(el).data('w2field')
            // if object is not defined, define it
            if (obj == null) {
                obj = new w2field(type, options)
                obj.render(el)
                return obj
            } else { // fully re-init
                obj.clear()
                if (type === 'clear') return
                obj = new w2field(type, options)
                obj.render(el)
                return obj
            }
            return null
        })
    }

    $.fn.w2form    = function(options) { return proc.call(this, options, 'w2form') }
    $.fn.w2grid    = function(options) { return proc.call(this, options, 'w2grid') }
    $.fn.w2layout  = function(options) { return proc.call(this, options, 'w2layout') }
    $.fn.w2sidebar = function(options) { return proc.call(this, options, 'w2sidebar') }
    $.fn.w2tabs    = function(options) { return proc.call(this, options, 'w2tabs') }
    $.fn.w2toolbar = function(options) { return proc.call(this, options, 'w2toolbar') }

    function proc(options, type) {
        if ($.isPlainObject(options)) {
            let obj
            if (type == 'w2form') {
                obj = new w2form(options)
                if (this.find('.w2ui-field').length > 0) {
                    obj.formHTML = this.html()
                }
            }
            if (type == 'w2grid') obj = new w2grid(options)
            if (type == 'w2layout') obj = new w2layout(options)
            if (type == 'w2sidebar') obj = new w2sidebar(options)
            if (type == 'w2tabs') obj = new w2tabs(options)
            if (type == 'w2toolbar') obj = new w2toolbar(options)
            if ($(this).length !== 0) {
                obj.render(this[0])
            }
            return obj
        } else {
            let obj = w2ui[$(this).attr('name')]
            if (!obj) return null
            if (arguments.length > 0) {
                if (obj[options]) obj[options].apply(obj, Array.prototype.slice.call(arguments, 1))
                return this
            } else {
                return obj
            }
        }
    }

    $.fn.w2popup = function(options) {
        if (this.length > 0 ) {
            w2popup.template(this[0], null, options)
        } else if (options.url) {
            w2popup.load(options)
        }
    }

    $.fn.w2marker = function() {
        let str = Array.prototype.slice.call(arguments, 0)
        if (Array.isArray(str[0])) str = str[0]
        if (str.length === 0 || !str[0]) { // remove marker
            return $(this).each(clearMarkedText)
        } else { // add marker
            return $(this).each((index, el) => {
                clearMarkedText(index, el)
                for (let s = 0; s < str.length; s++) {
                    let tmp = str[s]
                    if (typeof tmp !== 'string') tmp = String(tmp)
                    // escape regex special chars
                    tmp          = tmp.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&').replace(/&/g, '&amp;').replace(/</g, '&gt;').replace(/>/g, '&lt;')
                    let regex    = new RegExp(tmp + '(?!([^<]+)?>)', 'gi') // only outside tags
                    el.innerHTML = el.innerHTML.replace(regex, replaceValue)
                }
                function replaceValue(matched) { // mark new
                    return '<span class="w2ui-marker">' + matched + '</span>'
                }
            })
        }

        function clearMarkedText(index, el) {
            while (el.innerHTML.indexOf('<span class="w2ui-marker">') !== -1) {
                el.innerHTML = el.innerHTML.replace(/\<span class=\"w2ui\-marker\"\>((.|\n|\r)*)\<\/span\>/ig, '$1') // unmark
            }
        }
    }

    // -- w2tag - there can be multiple on screen at a time

    $.fn.w2tag = function(text, options) {
        // only one argument
        if (arguments.length === 1 && typeof text === 'object') {
            options = text
            if (options.html != null) text = options.html
        }
        // default options
        options = $.extend({
            id              : null,     // id for the tag, otherwise input id is used
            auto            : null,     // if auto true, then tag will show on mouseEnter and hide on mouseLeave
            html            : text,     // or html
            position        : 'right|top', // can be left, right, top, bottom
            align           : 'none',   // can be none, left, right (only works for position: top | bottom)
            left            : 0,        // delta for left coordinate
            top             : 0,        // delta for top coordinate
            maxWidth        : null,     // max width
            style           : '',       // additional style for the tag
            css             : {},       // add css for input when tag is shown
            attachTo        : null,     // when should it be created (for exmaple shadowRoot)
            className       : '',       // add class bubble
            inputClass      : '',       // add class for input when tag is shown
            onShow          : null,     // callBack when shown
            onHide          : null,     // callBack when hidden
            hideOnKeyPress  : true,     // hide tag if key pressed
            hideOnFocus     : false,    // hide tag on focus
            hideOnBlur      : false,    // hide tag on blur
            hideOnClick     : false,    // hide tag on document click
            hideOnChange    : true      // hides when input changes
        }, options)
        if (options.name != null && options.id == null) options.id = options.name

        // for backward compatibility
        if (options.class !== '' && options.inputClass === '') options.inputClass = options.class

        // remove all tags
        if ($(this).length === 0) {
            $('.w2ui-tag').each((index, el) => {
                let tag = $(el).data('w2tag')
                if (tag) tag.hide()
            })
            return
        }
        if (options.auto === true || options.showOn != null || options.hideOn != null) {
            if (arguments.length == 0 || !text) {
                return $(this).each((index, el) => {
                    $(el).off('.w2tooltip')
                })
            } else {
                return $(this).each((index, el) => {
                    let showOn = 'mouseenter', hideOn = 'mouseleave'
                    if (options.showOn) {
                        showOn = String(options.showOn).toLowerCase()
                        delete options.showOn
                    }
                    if (options.hideOn) {
                        hideOn = String(options.hideOn).toLowerCase()
                        delete options.hideOn
                    }
                    if (!options.position) { options.position = 'top|bottom' }
                    $(el)
                        .off('.w2tooltip')
                        .on(showOn + '.w2tooltip', function tooltip() {
                            options.auto = false
                            $(this).w2tag(text, options)
                        })
                        .on(hideOn + '.w2tooltip', function tooltip() {
                            $(this).w2tag()
                        })
                })
            }
        } else {
            return $(this).each((index, el) => {
                // main object
                let tag
                let origID = (options.id ? options.id : el.id)
                if (origID == '') { // search for an id
                    origID = $(el).find('input').attr('id')
                }
                if (!origID) {
                    origID = 'noid'
                }
                let tmpID = w2utils.escapeId(origID)
                if ($(this).data('w2tag') != null) {
                    tag = $(this).data('w2tag')
                    $.extend(tag.options, options)
                } else {
                    tag = {
                        id        : origID,
                        attachedTo: el, // element attached to
                        box       : $('#w2ui-tag-' + tmpID), // tag itself
                        options   : $.extend({}, options),
                        // methods
                        init      : init, // attach events
                        hide      : hide, // hide tag
                        getPos    : getPos, // gets position of tag
                        isMoved   : isMoved, // if called, will adjust position
                        // internal
                        tmp       : {} // for temp variables
                    }
                }
                // show or hide tag
                if (text === '' || text == null) {
                    tag.hide()
                } else if (tag.box.length !== 0) {
                    // if already present
                    tag.box.find('.w2ui-tag-body')
                        .css(tag.options.css)
                        .attr('style', tag.options.style)
                        .addClass(tag.options.className)
                        .html(tag.options.html)
                } else {
                    tag.tmp.originalCSS = ''
                    if ($(tag.attachedTo).length > 0) tag.tmp.originalCSS = $(tag.attachedTo)[0].style.cssText
                    let tagStyles = 'white-space: nowrap;'
                    if (tag.options.maxWidth && w2utils.getStrWidth(text) > tag.options.maxWidth) {
                        tagStyles = 'width: '+ tag.options.maxWidth + 'px'
                    }
                    // check if shadow root
                    let topEl = $(el).parents('*').last()[0];
                    // insert
                    $(topEl.tagName == 'HTML' ? 'body' : topEl).append(
                        '<div data-click="stop" style="display: none;" id="w2ui-tag-'+ tag.id +'" '+
                        '       class="w2ui-tag '+ ($(tag.attachedTo).parents('.w2ui-popup, .w2ui-overlay-popup, .w2ui-message').length > 0 ? 'w2ui-tag-popup' : '') + '">'+
                        '   <div style="margin: -2px 0px 0px -2px; '+ tagStyles +'">'+
                        '      <div class="w2ui-tag-body '+ tag.options.className +'" style="'+ (tag.options.style || '') +'">'+ text +'</div>'+
                        '   </div>' +
                        '</div>')
                    tag.box = $('#w2ui-tag-' + tmpID)
                    $(tag.attachedTo).data('w2tag', tag) // make available to element tag attached to
                    w2utils.bindEvents(tag.box, {})
                    setTimeout(init, 1)
                }
                return

                function init() {
                    tag.box.css('display', 'block')
                    if (!tag || !tag.box || !$(tag.attachedTo).offset()) return
                    let pos = tag.getPos()
                    tag.box.css({
                        opacity : '1',
                        left    : pos.left + 'px',
                        top     : pos.top + 'px'
                    })
                        .data('w2tag', tag)
                        .find('.w2ui-tag-body').addClass(pos.posClass)
                    tag.tmp.pos = pos.left + 'x' + pos.top

                    $(tag.attachedTo)
                        .off('.w2tag')
                        .css(tag.options.css)
                        .addClass(tag.options.inputClass)


                    if (tag.options.hideOnKeyPress) {
                        $(tag.attachedTo).on('keypress.w2tag', tag.hide)
                    }
                    if (tag.options.hideOnFocus) {
                        $(tag.attachedTo).on('focus.w2tag', tag.hide)
                    }
                    if (options.hideOnChange) {
                        if (el.nodeName === 'INPUT') {
                            $(el).on('change.w2tag', tag.hide)
                        } else {
                            $(el).find('input').on('change.w2tag', tag.hide)
                        }
                    }
                    if (tag.options.hideOnBlur) {
                        $(tag.attachedTo).on('blur.w2tag', tag.hide)
                    }
                    if (tag.options.hideOnClick) {
                        $('body').on('click.w2tag' + (tag.id || ''), tag.hide)
                    }
                    if (typeof tag.options.onShow === 'function') {
                        tag.options.onShow()
                    }
                    isMoved()
                }

                // bind event to hide it
                function hide() {
                    if (tag.box.length <= 0) return
                    if (tag.tmp.timer) clearTimeout(tag.tmp.timer)
                    tag.box.remove()
                    if (tag.options.hideOnClick) {
                        $('body').off('.w2tag' + (tag.id || ''))
                    }
                    $(tag.attachedTo).off('.w2tag')
                        .removeClass(tag.options.inputClass)
                        .removeData('w2tag')
                    // restore original CSS
                    if ($(tag.attachedTo).length > 0) {
                        $(tag.attachedTo)[0].style.cssText = tag.tmp.originalCSS
                    }
                    if (typeof tag.options.onHide === 'function') {
                        tag.options.onHide()
                    }
                }

                function isMoved(instant) {
                    // monitor if destroyed
                    let offset = $(tag.attachedTo).offset()
                    if ($(tag.attachedTo).length === 0 || (offset.left === 0 && offset.top === 0) || tag.box.find('.w2ui-tag-body').length === 0) {
                        tag.hide()
                        return
                    }
                    let pos = getPos()
                    if (tag.tmp.pos !== pos.left + 'x' + pos.top) {
                        tag.box
                            .css(w2utils.cssPrefix({ 'transition': (instant ? '0s' : '.2s') }))
                            .css({
                                left: pos.left + 'px',
                                top : pos.top + 'px'
                            })
                        tag.tmp.pos = pos.left + 'x' + pos.top
                    }
                    if (tag.tmp.timer) clearTimeout(tag.tmp.timer)
                    tag.tmp.timer = setTimeout(isMoved, 100)
                }

                function getPos() {
                    let offset   = $(tag.attachedTo).offset()
                    let posClass = 'w2ui-tag-right'
                    let posLeft  = parseInt(offset.left + tag.attachedTo.offsetWidth + (tag.options.left ? tag.options.left : 0))
                    let posTop   = parseInt(offset.top + (tag.options.top ? tag.options.top : 0))
                    let tagBody  = tag.box.find('.w2ui-tag-body')
                    let width    = tagBody[0].offsetWidth
                    let height   = tagBody[0].offsetHeight
                    if (typeof tag.options.position === 'string' && tag.options.position.indexOf('|') !== -1) {
                        tag.options.position = tag.options.position.split('|')
                    }
                    if (tag.options.position === 'top') {
                        posClass = 'w2ui-tag-top'
                        posLeft  = parseInt(offset.left + (tag.options.left ? tag.options.left : 0)) - 14
                        posTop   = parseInt(offset.top + (tag.options.top ? tag.options.top : 0)) - height - 10
                    } else if (tag.options.position === 'bottom') {
                        posClass = 'w2ui-tag-bottom'
                        posLeft  = parseInt(offset.left + (tag.options.left ? tag.options.left : 0)) - 14
                        posTop   = parseInt(offset.top + tag.attachedTo.offsetHeight + (tag.options.top ? tag.options.top : 0)) + 10
                    } else if (tag.options.position === 'left') {
                        posClass = 'w2ui-tag-left'
                        posLeft  = parseInt(offset.left + (tag.options.left ? tag.options.left : 0)) - width - 20
                        posTop   = parseInt(offset.top + (tag.options.top ? tag.options.top : 0))
                    } else if (Array.isArray(tag.options.position)) {
                        // try to fit the tag on screen in the order defined in the array
                        let maxWidth  = window.innerWidth
                        let maxHeight = window.innerHeight
                        for (let i = 0; i < tag.options.position.length; i++) {
                            let pos = tag.options.position[i]
                            if (pos === 'right') {
                                posClass = 'w2ui-tag-right'
                                posLeft  = parseInt(offset.left + tag.attachedTo.offsetWidth + (tag.options.left ? tag.options.left : 0))
                                posTop   = parseInt(offset.top + (tag.options.top ? tag.options.top : 0))
                                if (posLeft+width <= maxWidth) break
                            } else if (pos === 'left') {
                                posClass = 'w2ui-tag-left'
                                posLeft  = parseInt(offset.left + (tag.options.left ? tag.options.left : 0)) - width - 20
                                posTop   = parseInt(offset.top + (tag.options.top ? tag.options.top : 0))
                                if (posLeft >= 0) break
                            } else if (pos === 'top') {
                                posClass = 'w2ui-tag-top'
                                posLeft  = parseInt(offset.left + (tag.options.left ? tag.options.left : 0)) - 14
                                posTop   = parseInt(offset.top + (tag.options.top ? tag.options.top : 0)) - height - 10
                                if(posLeft+width <= maxWidth && posTop >= 0) break
                            } else if (pos === 'bottom') {
                                posClass = 'w2ui-tag-bottom'
                                posLeft  = parseInt(offset.left + (tag.options.left ? tag.options.left : 0)) - 14
                                posTop   = parseInt(offset.top + tag.attachedTo.offsetHeight + (tag.options.top ? tag.options.top : 0)) + 10
                                if (posLeft+width <= maxWidth && posTop+height <= maxHeight) break
                            }
                        }
                        if (tagBody.data('posClass') !== posClass) {
                            tagBody.removeClass('w2ui-tag-right w2ui-tag-left w2ui-tag-top w2ui-tag-bottom')
                                .addClass(posClass)
                                .data('posClass', posClass)
                        }
                    }
                    return { left: posLeft, top: posTop, posClass: posClass }
                }
            })
        }
    }

    // w2overlay - appears under the element, there can be only one at a time

    $.fn.w2overlay = function(html, options) {
        let obj      = this
        let name     = ''
        let defaults = {
            name        : null, // it not null, then allows multiple concurrent overlays
            html        : '', // html text to display
            align       : 'none', // can be none, left, right, both
            left        : 0, // offset left
            top         : 0, // offset top
            tipLeft     : 30, // tip offset left
            noTip       : false, // if true - no tip will be displayed
            selectable  : false,
            width       : 0, // fixed width
            height      : 0, // fixed height
            minWidth    : null, // min width if any. Valid values: null / 'auto' (default) / 'input' (default for align='both') / 'XXpx' / numeric value (same as setting string with 'px')
            maxWidth    : null, // max width if any
            maxHeight   : null, // max height if any
            contextMenu : false, // if true, it will be opened at mouse position
            pageX       : null,
            pageY       : null,
            originalEvent : null,
            style       : '', // additional style for main div
            'class'     : '', // additional class name for main div
            overlayStyle: '',
            onShow      : null, // event on show
            onHide      : null, // event on hide
            openAbove   : null, // show above control (if not, then as best needed)
            tmp         : {}
        }
        if (arguments.length === 1) {
            if (typeof html === 'object') {
                options = html
            } else {
                options = { html: html }
            }
        }
        if (arguments.length === 2) options.html = html
        if (!$.isPlainObject(options)) options = {}
        options = $.extend({}, defaults, options)
        if (options.name) name = '-' + options.name
        // hide
        let tmp_hide
        if (this.length === 0 || options.html === '' || options.html == null) {
            if ($('#w2ui-overlay'+ name).length > 0) {
                tmp_hide = $('#w2ui-overlay'+ name)[0].hide
                if (typeof tmp_hide === 'function') tmp_hide()
            } else {
                $('#w2ui-overlay'+ name).remove()
            }
            return $(this)
        }
        // hide previous if any
        if ($('#w2ui-overlay'+ name).length > 0) {
            tmp_hide = $('#w2ui-overlay'+ name)[0].hide
            $(document).off('.w2overlay'+ name)
            if (typeof tmp_hide === 'function') tmp_hide()
        }
        if (obj.length > 0 && (obj[0].tagName == null || obj[0].tagName.toUpperCase() === 'BODY')) options.contextMenu = true
        if (options.contextMenu && options.originalEvent) {
            options.pageX = options.originalEvent.pageX
            options.pageY = options.originalEvent.pageY
        }
        if (options.contextMenu && (options.pageX == null || options.pageY == null)) {
            console.log('ERROR: to display menu at mouse location, pass options.pageX and options.pageY.')
        }
        let data_str = ''
        if (options.data) {
            Object.keys(options.data).forEach((item) => {
                data_str += 'data-'+ item + '="' + options.data[item] +'"'
            })
        }
        // append
        $('body').append(
            '<div id="w2ui-overlay'+ name +'" style="display: none; left: 0px; top: 0px; '+ options.overlayStyle +'" '+ data_str +
            '        class="w2ui-reset w2ui-overlay '+ ($(this).parents('.w2ui-popup, .w2ui-overlay-popup, .w2ui-message').length > 0 ? 'w2ui-overlay-popup' : '') +'">'+
            '    <style></style>'+
            '    <div style="min-width: 100%; '+ options.style +'" class="'+ options.class +'"></div>'+
            '</div>'
        )
        // init
        let div1 = $('#w2ui-overlay'+ name)
        let div2 = div1.find(' > div')
        div2.html(options.html)
        // pick bg color of first div
        let bc = div2.css('background-color')
        if (bc != null && bc !== 'rgba(0, 0, 0, 0)' && bc !== 'transparent') div1.css({ 'background-color': bc, 'border-color': bc })

        let offset = $(obj).offset() || {}
        div1.data('element', obj.length > 0 ? obj[0] : null)
            .data('options', options)
            .data('position', offset.left + 'x' + offset.top)
            .fadeIn('fast')
            .on('click', function(event) {
                $('#w2ui-overlay'+ name).data('keepOpen', true)
                // if there is label for input, it will produce 2 click events
                if (event.target.tagName.toUpperCase() === 'LABEL') event.stopPropagation()
            })
            .on('mousedown', function(event) {
                let tmp = event.target.tagName.toUpperCase()
                if (['INPUT', 'TEXTAREA', 'SELECT'].indexOf(tmp) === -1 && !options.selectable) {
                    event.preventDefault()
                }
            })
        div1[0].hide   = hide
        div1[0].resize = resize

        // need time to display
        setTimeout(() => {
            $(document).off('.w2overlay'+ name).on('click.w2overlay'+ name, hide)
            if (typeof options.onShow === 'function') options.onShow()
            resize()
        }, 10)

        monitor()
        return $(this)

        // monitor position
        function monitor() {
            let tmp = $('#w2ui-overlay'+ name)
            if (tmp.data('element') !== obj[0]) return // it if it different overlay
            if (tmp.length === 0) return
            let offset = $(obj).offset() || {}
            let pos    = offset.left + 'x' + offset.top
            if (tmp.data('position') !== pos) {
                hide()
            } else {
                setTimeout(monitor, 250)
            }
        }

        // click anywhere else hides the drop down
        function hide(event) {
            if (event && event.button !== 0) return // only for left click button
            let div1 = $('#w2ui-overlay'+ name)
            // Allow clicking inside other overlays which belong to the elements inside this overlay
            if (event && $($(event.target).closest('.w2ui-overlay').data('element')).closest('.w2ui-overlay')[0] === div1[0]) return
            if (div1.data('keepOpen') === true) {
                div1.removeData('keepOpen')
                return
            }
            let result
            if (typeof options.onHide === 'function') result = options.onHide()
            if (result === false) return
            div1.remove()
            $(document).off('.w2overlay'+ name)
            clearInterval(div1.data('timer'))
        }

        function resize() {
            let div1 = $('#w2ui-overlay'+ name)
            let div2 = div1.find(' > div')
            let menu = $('#w2ui-overlay'+ name +' div.w2ui-menu')
            let pos  = {}
            if (menu.length > 0) {
                menu.css('overflow-y', 'hidden')
                pos.scrollTop  = menu.scrollTop()
                pos.scrollLeft = menu.scrollLeft()
            }
            // if goes over the screen, limit height and width
            if (div1.length > 0) {
                div2.height('auto').width('auto')
                // width/height
                let overflowY = false
                let h         = div2.height()
                let w         = div2.width()
                if (options.width && options.width < w) w = options.width
                if (w < 30) w = 30
                // if content of specific height
                if (options.tmp.contentHeight) {
                    h = parseInt(options.tmp.contentHeight)
                    div2.height(h)
                    setTimeout(() => {
                        let $div = div2.find('div.w2ui-menu')
                        if (h > $div.height()) {
                            div2.find('div.w2ui-menu').css('overflow-y', 'hidden')
                        }
                    }, 1)
                    setTimeout(() => {
                        let $div = div2.find('div.w2ui-menu')
                        if ($div.css('overflow-y') !== 'auto') $div.css('overflow-y', 'auto')
                    }, 10)
                }
                if (options.tmp.contentWidth && options.align !== 'both') {
                    w = parseInt(options.tmp.contentWidth)
                    div2.width(w)
                    setTimeout(() => {
                        if (w > div2.find('div.w2ui-menu > table').width()) {
                            div2.find('div.w2ui-menu > table').css('overflow-x', 'hidden')
                        }
                    }, 1)
                    setTimeout(() => {
                        div2.find('div.w2ui-menu > table').css('overflow-x', 'auto')
                    }, 10)
                }
                div2.find('div.w2ui-menu').css('width', '100%')
                // adjust position
                let boxLeft  = options.left
                let boxWidth = options.width
                let tipLeft  = options.tipLeft
                let minWidth = options.minWidth
                let maxWidth = options.maxWidth
                let objWidth = w2utils.getSize($(obj), 'width')
                // alignment
                switch (options.align) {
                    case 'both':
                        boxLeft  = 17
                        minWidth = 'input'
                        maxWidth = 'input'
                        break
                    case 'left':
                        boxLeft = 17
                        break
                    case 'right':
                        break
                }

                // convert minWidth to a numeric value
                if(!minWidth || minWidth === 'auto') minWidth = 0
                if(minWidth === 'input') minWidth = objWidth
                minWidth = parseInt(minWidth, 10)
                // convert maxWidth to a numeric value
                if(!maxWidth || maxWidth === 'auto') maxWidth = 0
                if(maxWidth === 'input') maxWidth = objWidth
                maxWidth = parseInt(maxWidth, 10)
                // convert boxWidth to a numeric value
                if(!boxWidth || boxWidth === 'auto') boxWidth = 0
                if(boxWidth === 'input') boxWidth = objWidth
                boxWidth = parseInt(boxWidth, 10)
                if(minWidth) boxWidth = Math.max(boxWidth, minWidth)
                if(maxWidth) boxWidth = Math.min(boxWidth, maxWidth)

                if(options.align === 'right') {
                    let mw  = Math.max(w - 10, minWidth - 17)
                    boxLeft = objWidth - mw
                    tipLeft = mw - 30
                }
                if (w === 30 && !boxWidth) boxWidth = 30
                let tmp = ((boxWidth ? boxWidth : w) - 17) / 2
                if (tmp < 25) {
                    tipLeft = Math.floor(tmp)
                }

                // Y coord
                let X, Y, offsetTop
                if (options.contextMenu) { // context menu
                    X         = options.pageX + 8
                    Y         = options.pageY - 0
                    offsetTop = options.pageY
                } else {
                    let offset = obj.offset() || {}
                    X          = ((offset.left > 25 ? offset.left : 25) + boxLeft)
                    Y          = (offset.top + w2utils.getSize(obj, 'height') + options.top + 7)
                    offsetTop  = offset.top
                }
                div1.css({
                    left        :  X + 'px',
                    top         :  Y + 'px',
                    'width'     : boxWidth || 'auto',
                    'min-width' : minWidth || 'auto',
                    'max-width' : maxWidth || 'auto',
                    'min-height': options.height || 'auto'
                })
                // $(window).height() - has a problem in FF20
                let offset    = div2.offset() || {}
                let maxHeight = window.innerHeight + $(document).scrollTop() - offset.top - 7
                maxWidth      = window.innerWidth + $(document).scrollLeft() - offset.left - 7
                if (options.contextMenu) { // context menu
                    maxHeight = window.innerHeight + $(document).scrollTop() - options.pageY - 15
                    maxWidth  = window.innerWidth + $(document).scrollLeft() - options.pageX
                }

                if (((maxHeight > -50 && maxHeight < 210) || options.openAbove === true) && options.openAbove !== false) {
                    let tipOffset
                    // show on top
                    if (options.contextMenu) { // context menu
                        maxHeight = options.pageY - 7
                        tipOffset = 5
                    } else {
                        maxHeight = offset.top - $(document).scrollTop() - 7
                        tipOffset = 24
                    }
                    if (options.maxHeight && maxHeight > options.maxHeight) maxHeight = options.maxHeight
                    if (h > maxHeight) {
                        overflowY = true
                        div2.height(maxHeight).width(w).css({ 'overflow-y': 'auto' })
                        h = maxHeight
                    }
                    div1.addClass('bottom-arrow')
                    div1.css('top', (offsetTop - h - tipOffset + options.top) + 'px')
                    div1.find('>style').html(
                        '#w2ui-overlay'+ name +':before { margin-left: '+ parseInt(tipLeft) +'px; }'+
                        '#w2ui-overlay'+ name +':after { margin-left: '+ parseInt(tipLeft) +'px; }'
                    )
                } else {
                    // show under
                    if (options.maxHeight && maxHeight > options.maxHeight) maxHeight = options.maxHeight
                    if (h > maxHeight) {
                        overflowY = true
                        div2.height(maxHeight).width(w).css({ 'overflow-y': 'auto' })
                    }
                    div1.addClass('top-arrow')
                    div1.find('>style').html(
                        '#w2ui-overlay'+ name +':before { margin-left: '+ parseInt(tipLeft) +'px; }'+
                        '#w2ui-overlay'+ name +':after { margin-left: '+ parseInt(tipLeft) +'px; }'
                    )
                }
                // check width
                w        = div2.width()
                maxWidth = window.innerWidth + $(document).scrollLeft() - offset.left - 7
                if (options.maxWidth && maxWidth > options.maxWidth) maxWidth = options.maxWidth
                if (w > maxWidth && options.align !== 'both') {
                    options.align = 'right'
                    setTimeout(() => { resize() }, 1)
                }
                // don't show tip
                if (options.contextMenu || options.noTip) { // context menu
                    div1.find('>style').html(
                        '#w2ui-overlay'+ name +':before { display: none; }'+
                        '#w2ui-overlay'+ name +':after { display: none; }'
                    )
                }
                // check scroll bar (needed to avoid horizontal scrollbar)
                if (overflowY && options.align !== 'both') div2.width(w + w2utils.scrollBarSize() + 2)
            }
            if (menu.length > 0) {
                menu.css('overflow-y', 'auto')
                menu.scrollTop(pos.scrollTop)
                menu.scrollLeft(pos.scrollLeft)
            }
        }
    }

    $.fn.w2tmp = {} // store runtime variables
    $.fn.w2menu = function(menu, options) {
        /*
        ITEM STRUCTURE
            item : {
                id       : null,
                text     : '',
                style    : '',
                img      : '',
                icon     : '',
                count    : '',
                tooltip  : '',
                hidden   : false,
                checked  : null,
                disabled : false
                ...
            }
        */
        // if items is a function
        if (options && typeof options.items === 'function') {
            options.items = options.items()
        }
        let defaults = {
            type         : 'normal', // can be normal, radio, check
            index        : null, // current selected
            items        : [],
            render       : null,
            msgNoItems   : w2utils.lang('No items found'),
            onSelect     : null,
            hideOnSelect : true,
            hideOnRemove : false,
            tmp          : {}
        }
        let ret
        let obj  = this
        let name = ''
        let activeChain
        if (menu === 'refresh') {
            // if not show - call blur
            if ($.fn.w2tmp.menuOptions && $.fn.w2tmp.menuOptions.name) name = '-' + $.fn.w2tmp.menuOptions.name
            if (options.name) name = '-' + options.name
            let anchor = $('#w2ui-overlay'+ name).data('element')
            if ($('#w2ui-overlay'+ name).length == 0 || (anchor != null && anchor != this[0])) {
                $(this).w2menu(options)
            } else {
                options    = $.extend($.fn.w2tmp.menuOptions, options)
                let scrTop = $('#w2ui-overlay'+ name +' div.w2ui-menu').scrollTop()
                $('#w2ui-overlay'+ name +' div.w2ui-menu').html(getMenuHTML())
                $('#w2ui-overlay'+ name +' div.w2ui-menu').scrollTop(scrTop)
                setTimeout(() => {
                    w2utils.bindEvents(`#w2ui-overlay${name} .w2ui-menu-item`, jQuery.fn.w2tmp)
                    mresize()
                }, 1)
            }
        } else if (menu === 'refresh-index') {
            if (!Array.isArray(options.index) && w2utils.isInt(options.index) && parseInt(options.index) >= 0) {
                options.index = [options.index]
            }
            let $menu  = $('#w2ui-overlay'+ name +' div.w2ui-menu')
            let cur    = $menu.find('tr[index="'+ (Array.isArray(options.index) ? options.index.join('-') : '') +'"]')
            let scrTop = $menu.scrollTop()
            $menu.find('tr.w2ui-selected').removeClass('w2ui-selected') // clear all
            cur.addClass('w2ui-selected') // select current
            // scroll into view
            if (cur.length > 0) {
                let top    = cur[0].offsetTop - 5 // 5 is margin top
                let height = $menu.height()
                $menu.scrollTop(scrTop)
                if (top < scrTop || top + cur.height() > scrTop + height) {
                    $menu.animate({ 'scrollTop': top - (height - cur.height() * 2) / 2 }, 200, 'linear')
                }
            }
            mresize()
        } else {
            if (arguments.length === 1) options = menu; else options.items = menu
            if (typeof options !== 'object') options = {}
            options = $.extend({}, defaults, options)
            if (w2utils.isInt(options.index) && parseInt(options.index) >= 0) {
                options.index = [options.index]
            }
            options.items = w2utils.normMenu(options.items)
            $.fn.w2tmp.menuOptions = options
            if (options.name) name = '-' + options.name
            if (typeof options.select === 'function' && typeof options.onSelect !== 'function') options.onSelect = options.select
            if (typeof options.remove === 'function' && typeof options.onRemove !== 'function') options.onRemove = options.remove
            if (typeof options.onRender === 'function' && typeof options.render !== 'function') options.render = options.onRender

            // since only one overlay can exist at a time
            $.fn.w2tmp.menuClick = function menuClick(event, index, parentIndex) {
                let keepOpen = false
                let items    = options.items
                let $tr      = $(event.target).closest('tr')
                if (event.shiftKey || event.metaKey || event.ctrlKey) {
                    keepOpen = true
                }
                if (typeof parentIndex == 'string' && parentIndex !== '') {
                    let ids = parentIndex.split('-')
                    ids.forEach(id => {
                        items = items[id].items
                    })
                }
                if (items[index].disabled) {
                    return
                }
                if ($(event.target).hasClass('remove')) {
                    if (typeof options.onRemove === 'function') {
                        options.onRemove({
                            index: index,
                            parentIndex: parentIndex,
                            item: items[index],
                            keepOpen: keepOpen,
                            originalEvent: event
                        })
                    }
                    keepOpen = !options.hideOnRemove
                    $(event.target).closest('tr').remove()
                    mresize()
                } else if ($tr.hasClass('has-sub-menu')) {
                    // add overflow hidden so scrollbar would not flash
                    let menu = $('#w2ui-overlay'+ name +' div.w2ui-menu')
                    if (menu.length > 0) menu.css('overflow-y', 'hidden')
                    // --
                    keepOpen = true
                    if ($tr.hasClass('expanded')) {
                        items[index].expanded = false
                        $tr.removeClass('expanded').addClass('collapsed').next().hide()
                        activeChain = null // reset active chain
                        options.index = $tr.attr('index').split('-')
                    } else {
                        items[index].expanded = true
                        $tr.addClass('expanded').removeClass('collapsed').next().show()
                        activeChain = null // reset active chain
                        options.index = $tr.attr('index').split('-')
                    }
                    mresize()
                } else if (typeof options.onSelect === 'function') {
                    let tmp = items
                    if (typeof items == 'function') {
                        tmp = items(options.items[parentIndex])
                    }
                    if (tmp[index].keepOpen != null) {
                        keepOpen = tmp[index].keepOpen
                    }
                    options.onSelect({
                        index: index,
                        parentIndex: parentIndex,
                        item: tmp[index],
                        keepOpen: keepOpen,
                        originalEvent: event
                    })
                }
                // -- hide
                if (options.hideOnSelect && (items[index] == null || items[index].keepOpen !== true)) {
                    let div = $('#w2ui-overlay'+ name)
                    div.removeData('keepOpen')
                    if (div.length > 0 && typeof div[0].hide === 'function' && !keepOpen) {
                        div[0].hide()
                    }
                }
            }

            $.fn.w2tmp.menuDown = function (event, index, parentIndex) {
                let items = options.items
                let $el = $(event.target).closest('tr')
                let tmp = $($el.get(0)).find('.w2ui-icon')
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
                if ((options.type === 'check' || options.type === 'radio') && item.group !== false
                            && !$(event.target).hasClass('remove')
                            && !$(event.target).closest('tr').hasClass('has-sub-menu')) {
                    item.checked = !item.checked
                    if (item.checked) {
                        if (options.type === 'radio') {
                            tmp.parents('table').find('.w2ui-icon') // should not be closest, but parents
                                .removeClass('w2ui-icon-check')
                                .addClass('w2ui-icon-empty')
                        }
                        if (options.type === 'check' && item.group != null) {
                            items.forEach((sub, ind) => {
                                if (sub.id == item.id) return
                                if (sub.group === item.group && sub.checked) {
                                    tmp.closest('table').find('tr[index='+ ind +'] .w2ui-icon')
                                        .removeClass('w2ui-icon-check')
                                        .addClass('w2ui-icon-empty')
                                    items[ind].checked = false
                                }
                            })
                        }
                        tmp.removeClass('w2ui-icon-empty').addClass('w2ui-icon-check')
                    } else if (options.type === 'check' && item.group == null && item.group !== false) {
                        tmp.removeClass('w2ui-icon-check').addClass('w2ui-icon-empty')
                    }
                }
                // highlight record
                $el.parent().find('tr').removeClass('w2ui-selected')
                $el.addClass('w2ui-selected')
            }
            let html = ''
            if (options.search) {
                html += `
                    <div class="w2ui-menu-search">
                        <div class="w2ui-icon w2ui-icon-search"></div>
                        <input id="menu-search" type="text"/>
                    </div>`
                for (let i = 0; i < options.items.length; i++) options.items[i].hidden = false
            }
            html += (options.topHTML || '') +
                    `<div class="w2ui-menu" style="top: ${options.search ? 40 : 0}px; ${options.menuStyle || ''}">
                        ${getMenuHTML()}
                    </div>`
            ret = $(this).w2overlay(html, options)
            activeChain = null // reset active chain
            setTimeout(() => {
                $(`#w2ui-overlay${name} #menu-search`)
                    .on('click', function (event) {
                        event.stopPropagation()
                    })
                    .on('keyup', change)
                    .on('keydown', function (event) {
                        // cancel left/right arrows
                        if ([40, 38].indexOf(event.keyCode) !== -1) {
                            event.stopPropagation()
                            event.preventDefault()
                        }
                    })
                w2utils.bindEvents(`#w2ui-overlay${name} .w2ui-menu-item`, jQuery.fn.w2tmp)
                mresize()
                // should be last (moves focus if needed)
                if (options.search) {
                    if (['text', 'password'].indexOf($(obj)[0].type) !== -1 || $(obj)[0].tagName.toUpperCase() === 'TEXTAREA') return
                    $(`#w2ui-overlay${name} #menu-search`).focus()
                }
            }, 1)
            mresize()
            // map functions
            let div = $('#w2ui-overlay'+ name)
            if (div.length > 0) {
                div[0].mresize = mresize
                div[0].change  = change
                div[0].getCurrent = getCurrent
            }
        }
        return ret

        function mresize() {
            setTimeout(() => {
                // show selected
                $('#w2ui-overlay'+ name +' tr.w2ui-selected').removeClass('w2ui-selected')
                let cur    = $('#w2ui-overlay'+ name +' tr[index="'+ (Array.isArray(options.index) ? options.index.join('-') : '') +'"]')
                let scrTop = $('#w2ui-overlay'+ name +' div.w2ui-menu').scrollTop()
                cur.addClass('w2ui-selected')
                if (options.tmp) {
                    options.tmp.contentHeight = $('#w2ui-overlay'+ name +' table').height() + 12
                        + (parseInt($('#w2ui-overlay'+ name +' .w2ui-menu').css('top')) || 0) // it menu is moved with menuStyle
                        + (parseInt($('#w2ui-overlay'+ name +' .w2ui-menu').css('bottom')) || 0) // it menu is moved with menuStyle
                    options.tmp.contentWidth  = $('#w2ui-overlay'+ name +' table').width()
                }
                if ($('#w2ui-overlay'+ name).length > 0) $('#w2ui-overlay'+ name)[0].resize()
                // scroll into view
                if (cur.length > 0) {
                    let top    = cur[0].offsetTop - 5 // 5 is margin top
                    let el     = $('#w2ui-overlay'+ name +' div.w2ui-menu table')
                    let height = el.height()
                    $('#w2ui-overlay'+ name +' div.w2ui-menu').scrollTop(scrTop)
                    if (top < scrTop || top + cur.height() > scrTop + height) {
                        $('#w2ui-overlay'+ name +' div.w2ui-menu').animate({ 'scrollTop': top - (height - cur.height() * 2) / 2 }, 200, 'linear')
                    }
                }
            }, 1)
        }

        function getCurrent() {
            // index
            let last  = options.index.length-1
            let index = options.index[last]
            let parents = options.index.slice(0, options.index.length-1).join('-')
            index = w2utils.isInt(index) ? parseInt(index) : 0
            // items
            let items = options.items
            options.index.forEach((id, ind) => {
                // do not go to the last one
                if (ind < options.index.length - 1) {
                    items = items[id].items
                }
            })
            return { last, index, items, item: items[index], parents }
        }

        function change(event) {
            let search = this.value
            let key    = event.keyCode
            let filter = true
            let refreshIndex = false
            switch (key) {
                case 13: { // enter
                    let { item, index, parents } = getCurrent()
                    // do not hide if folder
                    if (Array.isArray(item.items) && item.items.length > 0) {
                        event.target = $('#w2ui-overlay'+ name).find('.w2ui-selected')[0]
                        activeChain = null
                    } else {
                        getCurrent()
                        $('#w2ui-overlay'+ name)[0].hide()
                    }
                    $.fn.w2tmp.menuClick(event, index, parents)
                    filter = false
                    break
                }
                case 9: // tab
                case 27: // escape
                    filter = false
                    $('#w2ui-overlay'+ name)[0].hide()
                    break
                case 37: { // left
                    let { item, index, parents } = getCurrent()
                    if (Array.isArray(item.items) && item.items.length > 0 && item.expanded) {
                        event.target = $('#w2ui-overlay'+ name).find('.w2ui-selected')[0]
                        $.fn.w2tmp.menuClick(event, index, parents)
                    }
                    filter = false
                    break
                }
                case 39: { // right
                    let { item, index, parents } = getCurrent()
                    if (Array.isArray(item.items) && item.items.length > 0 && !item.expanded) {
                        event.target = $('#w2ui-overlay'+ name).find('.w2ui-selected')[0]
                        $.fn.w2tmp.menuClick(event, index, parents)
                    }
                    filter = false
                    break
                }
                case 38: { // up
                    let chain = getActiveChain(options.items)
                    if (Array.isArray(options.index) && options.index.length == 0) {
                        options.index = [chain[chain.length-1]]
                    } else {
                        let ind = chain.indexOf(options.index.join('-'))
                        if (ind > 0) {
                            options.index = chain[ind - 1].split('-')
                        }
                    }
                    filter = false
                    refreshIndex = true
                    event.preventDefault()
                    break
                }
                case 40: { // down
                    let chain = getActiveChain(options.items)
                    if (Array.isArray(options.index) && options.index.length == 0) {
                        options.index = [chain[0]]
                    } else {
                        let ind = chain.indexOf(options.index.join('-'))
                        if (ind != -1 && ind < chain.length - 1) {
                            options.index = chain[ind + 1].split('-')
                        }
                    }
                    filter = false
                    refreshIndex = true
                    event.preventDefault()
                    break
                }
            }
            // filter
            if (filter) {
                let count = applyFilter(options.items, search)
                if (count > 0) {
                    let chain = getActiveChain(options.items)
                    options.index = chain.length > 0 ? [chain[0].split('-')[0]] : []
                } else {
                    options.index = []
                }
                $(obj).w2menu('refresh', options)
            }
            if (refreshIndex) {
                $(obj).w2menu('refresh-index', options)
            }

            function applyFilter(items, search) {
                let count = 0
                for (let i = 0; i < items.length; i++) {
                    let item   = items[i]
                    let prefix = ''
                    let suffix = ''
                    if (['is', 'begins with'].indexOf(options.match) !== -1) prefix = '^'
                    if (['is', 'ends with'].indexOf(options.match) !== -1) suffix = '$'
                    try {
                        let re = new RegExp(prefix + search + suffix, 'i')
                        if (re.test(item.text) || item.text === '...') {
                            item.hidden = false
                        } else {
                            item.hidden = true
                        }
                    } catch (e) {}
                    // do not show selected items
                    if (Array.isArray(item.items) && item.items.length > 0) {
                        delete item._noSearchInside
                        let subCount = applyFilter(item.items, search)
                        if (subCount > 0) {
                            count += subCount
                            if (item.hidden) item._noSearchInside = true
                            item.expanded = true
                            item.hidden = false
                        }
                    }
                    if (item.hidden !== true) count++
                }
                return count
            }

            function getActiveChain(items, parents, res, noSave) {
                if (activeChain != null) {
                    return activeChain
                }
                if (res == null) res = []
                if (parents == null) parents = []
                items.forEach((item, ind) => {
                    if (!item.hidden && !item.disabled) {
                        res.push(parents.concat([ind]).join('-'))
                        if (Array.isArray(item.items) && item.items.length > 0 && item.expanded) {
                            parents.push(ind)
                            getActiveChain(item.items, parents, res, true)
                            parents.pop()
                        }
                    }
                })
                if (noSave == null) {
                    activeChain = res
                }
                return res
            }
        }

        function getMenuHTML(items, subMenu, expanded, parentIndex) {
            if (options.spinner) {
                return `
                    <table>
                        <tr><td class="w2ui-no-items">
                            <div class="w2ui-spinner" style="width: 18px; height: 18px; position: relative; top: 5px;"></div>
                            <div class="w2ui-no-items-label">${w2utils.lang('Loading...')}</div>
                        </td></tr>
                    </table>`
            }
            if (!parentIndex) parentIndex = []
            // normalize options.index
            if (options.index == null || options.index == -1) options.index = []
            if (!Array.isArray(options.index) && w2utils.isInt(options.index) && parseInt(options.index) >= 0) {
                options.index = [options.index]
            }
            let count     = 0
            let menu_html = '<table cellspacing="0" cellpadding="0" class="'+ (subMenu ? ' sub-menu' : '') +'"><tbody>'
            let img       = null, icon = null
            if (items == null) items = options.items
            if (!Array.isArray(items)) items = []
            for (let f = 0; f < items.length; f++) {
                let mitem = items[f]
                if (typeof mitem === 'string') {
                    mitem = { id: mitem, text: mitem }
                } else {
                    if (mitem.text != null && mitem.id == null) mitem.id = mitem.text
                    if (mitem.text == null && mitem.id != null) mitem.text = mitem.id
                    if (mitem.caption != null) mitem.text = mitem.caption
                    img  = mitem.img
                    icon = mitem.icon
                    if (img == null) img = null // img might be undefined
                    if (icon == null) icon = null // icon might be undefined
                }
                if (['radio', 'check'].indexOf(options.type) != -1 && !Array.isArray(mitem.items) && mitem.group !== false) {
                    if (mitem.checked === true) icon = 'w2ui-icon-check'; else icon = 'w2ui-icon-empty'
                }
                if (mitem.hidden !== true) {
                    let imgd = ''
                    let txt  = mitem.text
                    let subMenu_dsp = ''
                    if (typeof options.render === 'function') txt = options.render(mitem, options)
                    if (typeof txt == 'function') txt = txt(mitem, options)
                    if (img) imgd = '<td class="menu-icon"><div class="w2ui-tb-image w2ui-icon '+ img +'"></div></td>'
                    if (icon) imgd = '<td class="menu-icon" align="center"><span class="w2ui-icon '+ icon +'"></span></td>'
                    // render only if non-empty
                    if (mitem.type !== 'break' && txt != null && txt !== '' && String(txt).substr(0, 2) != '--') {
                        let classes = ['w2ui-menu-item']
                        if (options.altRows == true) {
                            classes.push(count % 2 === 0 ? 'w2ui-item-even' : 'w2ui-item-odd')
                        }
                        let colspan = 1
                        if (imgd === '') colspan++
                        if (mitem.count == null && mitem.hotkey == null && mitem.remove !== true && mitem.items == null) colspan++
                        if (mitem.tooltip == null && mitem.hint != null) mitem.tooltip = mitem.hint // for backward compatibility
                        let count_dsp = ''
                        if (mitem.remove === true) {
                            count_dsp = '<span class="remove">X</span>'
                        } else if (mitem.items != null) {
                            let _items = []
                            if (typeof mitem.items == 'function') {
                                _items = mitem.items(mitem)
                            } else if (Array.isArray(mitem.items)) {
                                _items = mitem.items
                            }
                            count_dsp   = '<span></span>'
                            subMenu_dsp = `
                                <tr style="${mitem.expanded ? '' : 'display: none'}">
                                    <td colspan="4" style="padding: 0px !important">
                                        ${getMenuHTML(_items, true, !mitem.expanded, parentIndex.concat(f))}
                                    </td>
                                <tr>`
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
                        menu_html += `<tr index="${(parentIndex.length > 0 ? parentIndex.join('-') + '-' : '') + f}" class="${classes.join(' ')}"
                            ${mitem.style ? `style="${mitem.style}"` : ''}
                            ${mitem.tooltip ? `title="${w2utils.lang(mitem.tooltip)}"` : ''}
                            data-mousedown='["menuDown", "event", ${f}, "${parentIndex.join('-')}"]'
                            data-click='["menuClick", "event", ${f}, "${parentIndex.join('-')}"]'>
                                ${subMenu ? '<td></td>' : ''} ${imgd}
                               <td class="menu-text" colspan="${colspan}">${w2utils.lang(txt)}</td>
                               <td class="menu-count">${count_dsp}</td>
                            </tr>
                            ${subMenu_dsp}`
                        count++
                    } else {
                        // horizontal line
                        let divText = txt.replace(/^-+/g, '')
                        menu_html  += '<tr><td colspan="4" class="menu-divider '+ (divText != '' ? 'divider-text' : '') +'">'+
                                     '   <div class="line">'+ divText +'</div>'+
                                     '   <div class="text">'+ divText +'</div>'+
                                     '</td></tr>'
                    }
                }
                items[f] = mitem
            }
            if (count === 0 && options.msgNoItems) {
                menu_html += `
                    <tr><td class="w2ui-no-items">
                        <div class="w2ui-no-items-label">${w2utils.lang(options.msgNoItems)}</div>
                    </td></tr>`
            }
            menu_html += '</tbody></table>'
            return menu_html
        }
    }

    $.fn.w2color = function(options, callBack) {
        let $el = $(this)
        let el  = $el[0]
        // no need to init
        if ($el.data('skipInit')) {
            $el.removeData('skipInit')
            return
        }
        // needed for keyboard navigation
        let index = [-1, -1]
        if ($.fn.w2colorPalette == null) {
            $.fn.w2colorPalette = [
                ['000000', '333333', '555555', '777777', '888888', '999999', 'AAAAAA', 'CCCCCC', 'DDDDDD', 'EEEEEE', 'F7F7F7', 'FFFFFF'],
                ['FF011B', 'FF9838', 'FFC300', 'FFFD59', '86FF14', '14FF7A', '2EFFFC', '2693FF', '006CE7', '9B24F4', 'FF21F5', 'FF0099'],
                ['FFEAEA', 'FCEFE1', 'FCF4DC', 'FFFECF', 'EBFFD9', 'D9FFE9', 'E0FFFF', 'E8F4FF', 'ECF4FC', 'EAE6F4', 'FFF5FE', 'FCF0F7'],
                ['F4CCCC', 'FCE5CD', 'FFF1C2', 'FFFDA1', 'D5FCB1', 'B5F7D0', 'BFFFFF', 'D6ECFF', 'CFE2F3', 'D9D1E9', 'FFE3FD', 'FFD9F0'],
                ['EA9899', 'F9CB9C', 'FFE48C', 'F7F56F', 'B9F77E', '84F0B1', '83F7F7', 'B5DAFF', '9FC5E8', 'B4A7D6', 'FAB9F6', 'FFADDE'],
                ['E06666', 'F6B26B', 'DEB737', 'E0DE51', '8FDB48', '52D189', '4EDEDB', '76ACE3', '6FA8DC', '8E7CC3', 'E07EDA', 'F26DBD'],
                ['CC0814', 'E69138', 'AB8816', 'B5B20E', '6BAB30', '27A85F', '1BA8A6', '3C81C7', '3D85C6', '674EA7', 'A14F9D', 'BF4990'],
                ['99050C', 'B45F17', '80650E', '737103', '395E14', '10783D', '13615E', '094785', '0A5394', '351C75', '780172', '782C5A']
            ]
        }
        let pal = $.fn.w2colorPalette
        if (typeof options === 'string') options = {
            color: options,
            transparent: true
        }
        if (options.onSelect == null && callBack != null) options.onSelect = callBack
        // add remove transparent color
        if (options.transparent && pal[0][1] == '333333') {
            pal[0].splice(1, 1)
            pal[0].push('')
        }
        if (!options.transparent && pal[0][1] != '333333') {
            pal[0].splice(1, 0, '333333')
            pal[0].pop()
        }
        if (options.color) options.color = String(options.color).toUpperCase()
        if (typeof options.color === 'string' && options.color.substr(0,1) === '#') options.color = options.color.substr(1)
        if (options.fireChange == null) options.fireChange = true

        let colorEvents = {
            keepOpen(el) {
                $(el).parents('.w2ui-overlay').data('keepOpen', true)
            },
            colorClick(el) {
                $(el).addClass('selected').next().removeClass('selected')
                    .parents('.w2ui-overlay').find('.w2ui-color-advanced').hide()
                    .parent().find('.w2ui-color-palette').show()
                $.fn._colorAdvanced = false
                $('#w2ui-overlay')[0].resize()
            },
            colorClick2(el) {
                $(el).addClass('selected').prev().removeClass('selected')
                    .parents('.w2ui-overlay').find('.w2ui-color-advanced').show()
                    .parent().find('.w2ui-color-palette').hide()
                $.fn._colorAdvanced = true
                $('#w2ui-overlay')[0].resize()
            }
        }

        if ($('#w2ui-overlay').length === 0) {
            $(el).w2overlay(getColorHTML(options), options)
            setTimeout(() => {
                w2utils.bindEvents($('#w2ui-overlay .w2ui-eaction'), colorEvents)
            }, 1)
        } else { // only refresh contents
            $('#w2ui-overlay .w2ui-colors').parent().html(getColorHTML(options))
            $('#w2ui-overlay').show()
            setTimeout(() => {
                w2utils.bindEvents($('#w2ui-overlay .w2ui-eaction'), colorEvents)
            }, 1)
        }
        // bind events
        $('#w2ui-overlay .w2ui-color')
            .off('.w2color')
            .on('mousedown.w2color', (event) => {
                let color = $(event.originalEvent.target).attr('name') // should not have #
                index     = $(event.originalEvent.target).attr('index').split(':')
                if (el.tagName.toUpperCase() === 'INPUT') {
                    if (options.fireChange) $(el).change()
                    $(el).next().find('>div').css('background-color', color)
                } else {
                    $(el).data('_color', color)
                }
                if (typeof options.onSelect === 'function') options.onSelect(color)
            })
            .on('mouseup.w2color', () => {
                setTimeout(() => {
                    if ($('#w2ui-overlay').length > 0) $('#w2ui-overlay').removeData('keepOpen')[0].hide()
                }, 10)
            })
        $('#w2ui-overlay .color-original')
            .off('.w2color')
            .on('click.w2color', (event) => {
                // restore original color
                let tmp = w2utils.parseColor($(event.target).css('background-color'))
                if (tmp != null) {
                    rgb = tmp
                    hsv = w2utils.rgb2hsv(rgb)
                    setColor(hsv)
                    updateSlides()
                    refreshPalette()
                }
            })
        $('#w2ui-overlay input')
            .off('.w2color')
            .on('mousedown.w2color', (event) => {
                $('#w2ui-overlay').data('keepOpen', true)
                setTimeout(() => { $('#w2ui-overlay').data('keepOpen', true) }, 10)
                event.stopPropagation()
            })
            .on('change.w2color', () => {
                let $el = $(this)
                let val = parseFloat($el.val())
                let max = parseFloat($el.attr('max'))
                if (isNaN(val)) val = 0
                if (max > 1) val = parseInt(val)
                if (max > 0 && val > max) {
                    $el.val(max)
                    val = max
                }
                if (val < 0) {
                    $el.val(0)
                    val = 0
                }
                let name  = $el.attr('name')
                let color = {}
                if (['r', 'g', 'b', 'a'].indexOf(name) !== -1) {
                    rgb[name] = val
                    hsv       = w2utils.rgb2hsv(rgb)
                } else if (['h', 's', 'v'].indexOf(name) !== -1) {
                    color[name] = val
                }
                setColor(color)
                updateSlides()
                refreshPalette()
            })
        // advanced color events
        let initial
        let hsv, rgb = w2utils.parseColor(options.color)
        if (rgb == null) {
            rgb = { r: 140, g: 150, b: 160, a: 1 }
            hsv = w2utils.rgb2hsv(rgb)
        }
        hsv = w2utils.rgb2hsv(rgb)

        function setColor(color, silent) {
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
            $('#w2ui-overlay .color-preview').css('background-color', '#'+newColor)
            $('#w2ui-overlay input').each((index, el) => {
                if (el.name) {
                    if (rgb[el.name] != null) el.value = rgb[el.name]
                    if (hsv[el.name] != null) el.value = hsv[el.name]
                    if (el.name === 'a') el.value = rgb.a
                }
            })
            if (!silent) {
                if (el.tagName.toUpperCase() === 'INPUT') {
                    $(el).val(newColor).data('skipInit', true)
                    if (options.fireChange) $(el).change()
                    $(el).next().find('>div').css('background-color', '#'+newColor)
                } else {
                    $(el).data('_color', newColor)
                }
                if (typeof options.onSelect === 'function') options.onSelect(newColor)
            } else {
                $('#w2ui-overlay .color-original').css('background-color', '#'+newColor)
            }
        }
        function updateSlides() {
            let $el1    = $('#w2ui-overlay .palette .value1')
            let $el2    = $('#w2ui-overlay .rainbow .value2')
            let $el3    = $('#w2ui-overlay .alpha .value2')
            let offset1 = parseInt($el1.width()) / 2
            let offset2 = parseInt($el2.width()) / 2
            $el1.css({ 'left': hsv.s * 150 / 100 - offset1, 'top': (100 - hsv.v) * 125 / 100 - offset1})
            $el2.css('left', hsv.h/(360/150) - offset2)
            $el3.css('left', rgb.a*150 - offset2)
        }
        function refreshPalette() {
            let cl  = w2utils.hsv2rgb(hsv.h, 100, 100)
            let rgb = cl.r + ',' + cl.g + ',' + cl.b
            $('#w2ui-overlay .palette').css('background-image',
                'linear-gradient(90deg, rgba('+ rgb +',0) 0%, rgba(' + rgb + ',1) 100%)')
        }
        function mouseDown(event) {
            let $el    = $(this).find('.value1, .value2')
            let offset = parseInt($el.width()) / 2
            if ($el.hasClass('move-x')) $el.css({ left: (event.offsetX - offset) + 'px' })
            if ($el.hasClass('move-y')) $el.css({ top: (event.offsetY - offset) + 'px' })
            initial = {
                $el    : $el,
                x      : event.pageX,
                y      : event.pageY,
                width  : $el.parent().width(),
                height : $el.parent().height(),
                left   : parseInt($el.css('left')),
                top    : parseInt($el.css('top'))
            }
            mouseMove(event)
            $('body').off('.w2color')
                .on(mMove, mouseMove)
                .on(mUp, mouseUp)
        }
        function mouseUp(event) {
            $('body').off('.w2color')
        }
        function mouseMove (event) {
            let $el    = initial.$el
            let divX   = event.pageX - initial.x
            let divY   = event.pageY - initial.y
            let newX   = initial.left + divX
            let newY   = initial.top + divY
            let offset = parseInt($el.width()) / 2
            if (newX < -offset) newX = -offset
            if (newY < -offset) newY = -offset
            if (newX > initial.width - offset) newX = initial.width - offset
            if (newY > initial.height - offset) newY = initial.height - offset
            if ($el.hasClass('move-x')) $el.css({ left : newX + 'px' })
            if ($el.hasClass('move-y')) $el.css({ top : newY + 'px' })

            // move
            let name = $el.parent().attr('name')
            let x    = parseInt($el.css('left')) + offset
            let y    = parseInt($el.css('top')) + offset
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
        if ($.fn._colorAdvanced === true || options.advanced === true) {
            $('#w2ui-overlay .w2ui-color-tabs :nth-child(2)').click()
            $('#w2ui-overlay').removeData('keepOpen')
        }
        setColor({}, true)
        refreshPalette()
        updateSlides()

        // Events of iOS
        let mUp   = 'mouseup.w2color'
        let mMove = 'mousemove.w2color'
        if (w2utils.isIOS) {
            mUp   = 'touchend.w2color'
            mMove = 'touchmove.w2color'
        }
        $('#w2ui-overlay .palette')
            .off('.w2color')
            .on('mousedown.w2color', mouseDown)
        $('#w2ui-overlay .rainbow')
            .off('.w2color')
            .on('mousedown.w2color', mouseDown)
        $('#w2ui-overlay .alpha')
            .off('.w2color')
            .on('mousedown.w2color', mouseDown)

        // keyboard navigation
        el.nav = (direction) => {
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

            let color = pal[index[0]][index[1]]
            $(el).data('_color', color)
            return color
        }

        function getColorHTML(options) {
            let bor
            let html = '<div class="w2ui-colors w2ui-eaction" data-mousedown="keepOpen|this">'+
                        '<div class="w2ui-color-palette">'+
                        '<table cellspacing="5"><tbody>'
            for (let i = 0; i < pal.length; i++) {
                html += '<tr>'
                for (let j = 0; j < pal[i].length; j++) {
                    if (pal[i][j] === 'FFFFFF') bor = ';border: 1px solid #efefef'; else bor = ''
                    html += '<td>'+
                            '    <div class="w2ui-color '+ (pal[i][j] === '' ? 'w2ui-no-color' : '') +'" style="background-color: #'+ pal[i][j] + bor +';" ' +
                            '       name="'+ pal[i][j] +'" index="'+ i + ':' + j +'">'+ (options.color == pal[i][j] ? '&#149;' : '&#160;') +
                            '    </div>'+
                            '</td>'
                    if (options.color == pal[i][j]) index = [i, j]
                }
                html += '</tr>'
                if (i < 2) html += '<tr><td style="height: 8px" colspan="8"></td></tr>'
            }
            html += '</tbody></table>'+
                    '</div>'
            if (true) {
                html += '<div class="w2ui-color-advanced" style="display: none">'+
                        '   <div class="color-info">'+
                        '       <div class="color-preview-bg"><div class="color-preview"></div><div class="color-original"></div></div>'+
                        '       <div class="color-part">'+
                        '           <span>H</span> <input name="h" maxlength="3" max="360" tabindex="101">'+
                        '           <span>R</span> <input name="r" maxlength="3" max="255" tabindex="104">'+
                        '       </div>'+
                        '       <div class="color-part">'+
                        '           <span>S</span> <input name="s" maxlength="3" max="100" tabindex="102">'+
                        '           <span>G</span> <input name="g" maxlength="3" max="255" tabindex="105">'+
                        '       </div>'+
                        '       <div class="color-part">'+
                        '           <span>V</span> <input name="v" maxlength="3" max="100" tabindex="103">'+
                        '           <span>B</span> <input name="b" maxlength="3" max="255" tabindex="106">'+
                        '       </div>'+
                        '       <div class="color-part" style="margin: 30px 0px 0px 2px">'+
                        '           <span style="width: 40px">'+ w2utils.lang('Opacity') +'</span> '+
                        '           <input name="a" maxlength="5" max="1" style="width: 32px !important" tabindex="107">'+
                        '       </div>'+
                        '   </div>'+
                        '   <div class="palette" name="palette">'+
                        '       <div class="palette-bg"></div>'+
                        '       <div class="value1 move-x move-y"></div>'+
                        '   </div>'+
                        '   <div class="rainbow" name="rainbow">'+
                        '       <div class="value2 move-x"></div>'+
                        '   </div>'+
                        '   <div class="alpha" name="alpha">'+
                        '       <div class="alpha-bg"></div>'+
                        '       <div class="value2 move-x"></div>'+
                        '   </div>'+
                        '</div>'
            }
            html += '<div class="w2ui-color-tabs">'+
                    '   <div class="w2ui-color-tab selected w2ui-eaction" data-click="colorClick|this"><span class="w2ui-icon w2ui-icon-colors"></span></div>'+
                    '   <div class="w2ui-color-tab w2ui-eaction" data-click="colorClick2|this"><span class="w2ui-icon w2ui-icon-settings"></span></div>'+
                    '   <div style="padding: 8px; text-align: right;">' + (typeof options.html == 'string' ? options.html : '') + '</div>' +
                    '</div>'+
                    '</div>'+
                    '<div style="clear: both; height: 0"></div>'
            return html
        }
    }

})(jQuery)

export { w2ui, w2locale, w2event, w2utils, w2popup, w2alert, w2confirm, w2prompt, w2field, w2form, w2grid,
    w2layout, w2sidebar, w2tabs, w2toolbar, addType, removeType }