/************************************************************************
*   Part of w2ui 2.0 library
*   - Dependencies: jQuery, w2utils
*
* TODO:
* - there should be no focus by default, and ability to set focus to a button or a control
* - need to refactor w2pormpt
*
* == 2.0 changes
*   - CSP - fixed inline events
*   - popup.open - returns promise like object
*   - popup.confirm - refactored
*   - popup.message - refactored
*   - removed popup.options.mutliple
*   - refactores w2alert, w2confirm, w2prompt
*
************************************************************************/

import { w2event } from './w2event.js'
import { w2ui, w2utils } from './w2utils.js'
import { query } from './query.js'

class Dialog extends w2event {
    constructor(options) {
        super()
        this.defaults   = {
            title: '',
            body: '',
            buttons: '',
            actions: null,
            style: '',
            color: '#000',
            opacity: 0.4,
            speed: 0.3,
            modal: false,
            maximized: false, // this is a flag to show the state - to open the popup maximized use openMaximized instead
            keyboard: true, // will close popup on esc if not modal
            width: 450,
            height: 250,
            showClose: true,
            showMax: false,
            transition: null,
            openMaximized: false
        }
        this.status     = 'closed' // string that describes current status
        this.onOpen     = null
        this.onClose    = null
        this.onMax      = null
        this.onMin      = null
        this.onToggle   = null
        this.onKeydown  = null
        this.onAction   = null
        this.onMove     = null
        this.onMsgOpen  = null
        this.onMsgClose = null
    }

    /**
     * Sample calls
     * - w2popup.open('ddd').ok(() => { w2popup.close() })
     * - w2popup.open('ddd', { height: 120 }).ok(() => { w2popup.close() })
     * - w2popup.open({ body: 'text', title: 'caption', actions: ["Close"] }).close(() => { w2popup.close() })
     * - w2popup.open({ body: 'text', title: 'caption', actions: { Close() { w2popup.close() }} })
     */
    open(options) {
        let self = this
        let orig_options = $.extend(true, {}, options)
        if (w2popup.status == 'closing') {
            // if called when previous is closing
            setTimeout(() => { self.open.call(self, options) }, 100)
            return
        }
        // get old options and merge them
        let old_options = $('#w2ui-popup').data('options')
        if (['string', 'number'].includes(typeof options)) {
            options = w2utils.extend({
                title: 'Notification',
                body: `<div class="w2ui-centered">${options}</div>`,
                actions: ["Ok"]
            }, arguments[1] ?? {})
        }
        options = $.extend({}, this.defaults, old_options, { title: '', body : '', buttons: '' }, options, { maximized: false })
        // if new - reset event handlers
        if ($('#w2ui-popup').length === 0) {
            // w2popup.handlers  = []; // if commented, allows to add w2popup.on() for all
            w2popup.onOpen     = null
            w2popup.onClose    = null
            w2popup.onMax      = null
            w2popup.onMin      = null
            w2popup.onToggle   = null
            w2popup.onKeydown  = null
            w2popup.onAction   = null
            w2popup.onMove     = null
            w2popup.onMsgOpen  = null
            w2popup.onMsgClose = null
        } else {
            $('#w2ui-popup').data('options', options)
        }
        if (options.onOpen) w2popup.onOpen = options.onOpen
        if (options.onClose) w2popup.onClose = options.onClose
        if (options.onMax) w2popup.onMax = options.onMax
        if (options.onMin) w2popup.onMin = options.onMin
        if (options.onToggle) w2popup.onToggle = options.onToggle
        if (options.onKeydown) w2popup.onKeydown = options.onKeydown
        if (options.onAction) w2popup.onAction = options.onAction
        if (options.onMove) w2popup.onMove = options.onMove
        if (options.onMsgOpen) w2popup.onMsgOpen = options.onMsgOpen
        if (options.onMsgClose) w2popup.onMsgClose = options.onMsgClose
        options.width  = parseInt(options.width)
        options.height = parseInt(options.height)

        let maxW, maxH, edata, msg, tmp
        if (window.innerHeight == undefined) {
            maxW = parseInt(document.documentElement.offsetWidth)
            maxH = parseInt(document.documentElement.offsetHeight)
            if (w2utils.engine === 'IE7') { maxW += 21; maxH += 4 }
        } else {
            maxW = parseInt(window.innerWidth)
            maxH = parseInt(window.innerHeight)
        }
        if (maxW - 10 < options.width) options.width = maxW - 10
        if (maxH - 10 < options.height) options.height = maxH - 10
        let top  = (maxH - options.height) / 2 * 0.6
        let left = (maxW - options.width) / 2

        self.off('.prom')
            .off('.confirm')
            .off('.prompt')
            .off('*')
        let prom = {
            self: this,
            action(callBack) {
                self.on('action.prom', callBack)
                return prom
            },
            close(callBack) {
                self.on('close.prom', callBack)
                return prom
            },
            then(callBack) {
                self.on('open:after.prom', callBack)
                return prom
            }
        }
        // convert action arrays into buttons
        self.off('.buttons')
        if (options.actions != null) {
            options.buttons = ''
            Object.keys(options.actions).forEach((action) => {
                let handler = options.actions[action]
                let btnAction = action
                if (typeof handler == 'function') {
                    options.buttons += `<button class="w2ui-btn w2ui-eaction" data-click='["action","${action}","event"]'>${action}</button>`
                }
                if (typeof handler == 'object') {
                    options.buttons += `<button class="w2ui-btn w2ui-eaction ${handler.class || ''}" data-click='["action","${action}","event"]'
                        style="${handler.style}">${handler.text || action}</button>`
                    btnAction = Array.isArray(options.actions) ? handler.text : action
                }
                if (typeof handler == 'string') {
                    options.buttons += `<button class="w2ui-btn w2ui-eaction" data-click='["action","${handler}","event"]'>${handler}</button>`
                    btnAction = handler
                }
                if (typeof btnAction == 'string') {
                    btnAction = btnAction[0].toLowerCase() + btnAction.substr(1).replace(/\s+/g, '')
                }
                prom[btnAction] = function (callBack) {
                    self.on('action.buttons', (event) => {
                            let target = event.action[0].toLowerCase() + event.action.substr(1).replace(/\s+/g, '')
                            if (target == btnAction) callBack(event)
                        })
                    return prom
                }
            })
        }
        // check if message is already displayed
        if ($('#w2ui-popup').length === 0) {
            // trigger event
            edata = this.trigger({ phase: 'before', type: 'open', target: 'popup', options: options, present: false })
            if (edata.isCancelled === true) return
            w2popup.status = 'opening'
            // output message
            w2popup.lockScreen(options)
            let btn = ''
            if (options.showClose) {
                btn += `<div class="w2ui-popup-button w2ui-popup-close">
                            <span class="w2ui-icon w2ui-icon-cross w2ui-eaction" data-mousedown="stop" data-click="close"></span>
                        </div>`
            }
            if (options.showMax) {
                btn += `<div class="w2ui-popup-button w2ui-popup-max">
                            <span class="w2ui-icon w2ui-icon-box w2ui-eaction" data-mousedown="stop" data-click="toggle"></span>
                        </div>`
            }
            // first insert just body
            msg = '<div id="w2ui-popup" class="w2ui-popup w2ui-popup-opening" style="left: '+ left +'px; top: '+ top +'px;'+
                        '     width: ' + parseInt(options.width) + 'px; height: ' + parseInt(options.height) + 'px;"></div>'
            $('body').append(msg)
            $('#w2ui-popup').data('options', options)
            // parse rel=*
            let parts = $('#w2ui-popup')
            if (parts.find('div[rel=title], div[rel=body], div[rel=buttons]').length > 0) {
                // title
                tmp = parts.find('div[rel=title]')
                if (tmp.length > 0) { options.title = tmp.html(); tmp.remove() }
                // buttons
                tmp = parts.find('div[rel=buttons]')
                if (tmp.length > 0) { options.buttons = tmp.html(); tmp.remove() }
                // body
                tmp = parts.find('div[rel=body]')
                if (tmp.length > 0) options.body = tmp.html(); else options.body = parts.html()
            }
            // then content
            msg = '<div class="w2ui-popup-title" style="'+ (!options.title ? 'display: none' : '') +'">' + btn + '</div>'+
                        '<div class="w2ui-box" style="'+ (!options.title ? 'top: 0px !important;' : '') +
                                (!options.buttons ? 'bottom: 0px !important;' : '') + '">'+
                        '    <div class="w2ui-popup-body' + (!options.title ? ' w2ui-popup-no-title' : '') +
                                (!options.buttons ? ' w2ui-popup-no-buttons' : '') + '" style="' + options.style + '">' +
                        '    </div>'+
                        '</div>'+
                        '<div class="w2ui-popup-buttons" style="'+ (!options.buttons ? 'display: none' : '') +'"></div>'+
                        '<input class="w2ui-popup-hidden" style="position: absolute; top: -100px"/>' // this is needed to keep focus in popup
            $('#w2ui-popup').html(msg)

            if (options.title) $('#w2ui-popup .w2ui-popup-title').append(w2utils.lang(options.title))
            if (options.buttons) $('#w2ui-popup .w2ui-popup-buttons').append(options.buttons)
            if (options.body) $('#w2ui-popup .w2ui-popup-body').append(options.body)

            // allow element to render
            setTimeout(() => {
                $('#w2ui-popup')
                    .css(w2utils.cssPrefix({
                        'transition': options.speed + 's opacity, ' + options.speed + 's -webkit-transform'
                    }))
                    .removeClass('w2ui-popup-opening')
                self.focus()
            }, 1)
            // clean transform
            setTimeout(() => {
                $('#w2ui-popup').css(w2utils.cssPrefix('transform', ''))
                w2popup.status = 'open'
            }, options.speed * 1000)
            // onOpen event should trigger while popup still coing
            setTimeout(() => {
                // event after
                self.trigger($.extend(edata, { phase: 'after' }))
                w2utils.bindEvents('#w2ui-popup .w2ui-eaction', w2popup)
                $('#w2ui-popup').find('.w2ui-popup-body').show()
            }, 50)

        } else {
            // if was from template and now not
            if (w2popup._prev == null && w2popup._template != null) self.restoreTemplate()

            // trigger event
            edata = this.trigger({ phase: 'before', type: 'open', target: 'popup', options: options, present: true })
            if (edata.isCancelled === true) return
            // check if size changed
            w2popup.status = 'opening'
            if (old_options != null) {
                if (!old_options.maximized && (old_options.width != options.width || old_options.height != options.height)) {
                    w2popup.resize(options.width, options.height)
                }
                options.prevSize  = options.width + 'px:' + options.height + 'px'
                options.maximized = old_options.maximized
            }
            // show new items
            let cloned = $('#w2ui-popup .w2ui-box').clone()
            cloned.removeClass('w2ui-box').addClass('w2ui-box-temp').find('.w2ui-popup-body').empty().append(options.body)
            // parse rel=*
            if (typeof options.body == 'string' && cloned.find('div[rel=title], div[rel=body], div[rel=buttons]').length > 0) {
                // title
                tmp = cloned.find('div[rel=title]')
                if (tmp.length > 0) { options.title = tmp.html(); tmp.remove() }
                // buttons
                tmp = cloned.find('div[rel=buttons]')
                if (tmp.length > 0) { options.buttons = tmp.html(); tmp.remove() }
                // body
                tmp = cloned.find('div[rel=body]')
                if (tmp.length > 0) options.body = tmp.html(); else options.body = cloned.html()
                // set proper body
                cloned.html(options.body)
            }
            $('#w2ui-popup .w2ui-box').after(cloned)

            if (options.buttons) {
                $('#w2ui-popup .w2ui-popup-buttons').show().html('').append(options.buttons)
                $('#w2ui-popup .w2ui-popup-body').removeClass('w2ui-popup-no-buttons')
                $('#w2ui-popup .w2ui-box, #w2ui-popup .w2ui-box-temp').css('bottom', '')
            } else {
                $('#w2ui-popup .w2ui-popup-buttons').hide().html('')
                $('#w2ui-popup .w2ui-popup-body').addClass('w2ui-popup-no-buttons')
                $('#w2ui-popup .w2ui-box, #w2ui-popup .w2ui-box-temp').css('bottom', '0px')
            }
            if (options.title) {
                $('#w2ui-popup .w2ui-popup-title')
                    .show()
                    .html((options.showClose
                        ? `<div class="w2ui-popup-button w2ui-popup-close">
                                <span class="w2ui-icon w2ui-icon-cross w2ui-eaction" data-mousedown="stop" data-click="close"></span>
                            </div>`
                        : '') +
                        (options.showMax
                        ? `<div class="w2ui-popup-button w2ui-popup-max">
                                <span class="w2ui-icon w2ui-icon-box w2ui-eaction" data-mousedown="stop" data-click="toggle"></span>
                            </div>`
                        : ''))
                    .append(options.title)
                $('#w2ui-popup .w2ui-popup-body').removeClass('w2ui-popup-no-title')
                $('#w2ui-popup .w2ui-box, #w2ui-popup .w2ui-box-temp').css('top', '')
            } else {
                $('#w2ui-popup .w2ui-popup-title').hide().html('')
                $('#w2ui-popup .w2ui-popup-body').addClass('w2ui-popup-no-title')
                $('#w2ui-popup .w2ui-box, #w2ui-popup .w2ui-box-temp').css('top', '0px')
            }
            // transition
            let div_old = $('#w2ui-popup .w2ui-box')[0]
            let div_new = $('#w2ui-popup .w2ui-box-temp')[0]
            w2utils.transition(div_old, div_new, options.transition, () => {
                // clean up
                self.restoreTemplate()
                $(div_old).remove()
                $(div_new).removeClass('w2ui-box-temp').addClass('w2ui-box')
                let $body = $(div_new).find('.w2ui-popup-body')
                if ($body.length == 1) {
                    $body[0].style.cssText = options.style
                    $body.show()
                }
                // remove max state
                $('#w2ui-popup').data('prev-size', null)
                // focus on first button
                self.focus()
            })
            // call event onOpen
            w2popup.status = 'open'
            self.trigger($.extend(edata, { phase: 'after' }))
            w2utils.bindEvents('#w2ui-popup .w2ui-eaction', w2popup)
            $('#w2ui-popup').find('.w2ui-popup-body').show()
        }

        if(options.openMaximized) {
            this.max()
        }

        // save new options
        options._last_focus = $(':focus')
        // keyboard events
        if (options.keyboard) $(document).on('keydown', this.keydown)

        // initialize move
        tmp = {
            resizing : false,
            mvMove   : mvMove,
            mvStop   : mvStop
        }
        $('#w2ui-popup .w2ui-popup-title').on('mousedown', function(event) {
            if (!w2popup.get().maximized) mvStart(event)
        })

        return prom

        // handlers
        function mvStart(evnt) {
            if (!evnt) evnt = window.event
            w2popup.status = 'moving'
            tmp.resizing   = true
            tmp.isLocked   = $('#w2ui-popup > .w2ui-lock').length == 1 ? true : false
            tmp.x          = evnt.screenX
            tmp.y          = evnt.screenY
            tmp.pos_x      = $('#w2ui-popup').position().left
            tmp.pos_y      = $('#w2ui-popup').position().top
            if (!tmp.isLocked) w2popup.lock({ opacity: 0 })
            $(document).on('mousemove', tmp.mvMove)
            $(document).on('mouseup', tmp.mvStop)
            if (evnt.stopPropagation) evnt.stopPropagation(); else evnt.cancelBubble = true
            if (evnt.preventDefault) evnt.preventDefault(); else return false
        }

        function mvMove(evnt) {
            if (tmp.resizing != true) return
            if (!evnt) evnt = window.event
            tmp.div_x = evnt.screenX - tmp.x
            tmp.div_y = evnt.screenY - tmp.y
            // trigger event
            let edata = w2popup.trigger({ phase: 'before', type: 'move', target: 'popup', div_x: tmp.div_x, div_y: tmp.div_y })
            if (edata.isCancelled === true) return
            // default behavior
            $('#w2ui-popup').css(w2utils.cssPrefix({
                'transition': 'none',
                'transform' : 'translate3d('+ tmp.div_x +'px, '+ tmp.div_y +'px, 0px)'
            }))
            // event after
            w2popup.trigger($.extend(edata, { phase: 'after'}))
        }

        function mvStop(evnt) {
            if (tmp.resizing != true) return
            if (!evnt) evnt = window.event
            w2popup.status = 'open'
            tmp.div_x      = (evnt.screenX - tmp.x)
            tmp.div_y      = (evnt.screenY - tmp.y)
            $('#w2ui-popup').css({
                'left': (tmp.pos_x + tmp.div_x) + 'px',
                'top' : (tmp.pos_y + tmp.div_y) + 'px'
            }).css(w2utils.cssPrefix({
                'transition': 'none',
                'transform' : 'translate3d(0px, 0px, 0px)'
            }))
            tmp.resizing = false
            $(document).off('mousemove', tmp.mvMove)
            $(document).off('mouseup', tmp.mvStop)
            if (!tmp.isLocked) w2popup.unlock()
        }
    }

    load(options) {
        return new Promise((resolve, reject) => {
            if (typeof options == 'string') {
                options = { url: options }
            }
            if (options.url == null) {
                console.log('ERROR: The url is not defined.')
                reject('The url is not defined')
                return
            }
            w2popup.status = 'loading'
            let tmp        = String(options.url).split('#')
            let url        = tmp[0]
            let selector   = tmp[1]
            if (options == null) options = {}
            // load url
            let html = $('#w2ui-popup').data(url)
            if (html != null) {
                this.template(html, selector)
                resolve()
            } else {
                $.get(url, (data, status, obj) => { // should always be $.get as it is template
                    this.template(obj.responseText, selector, options).then(() => { resolve() })
                })
            }
        })
    }

    template(data, id, options = {}) {
        let $html = $(data)
        if (id) $html = $html.filter('#' + id)
        $.extend(options, {
            style: $html[0].style.cssText,
            width: $html.width(),
            height: $html.height(),
            title: $html.find('[rel=title]').html(),
            body: $html.find('[rel=body]').html(),
            buttons: $html.find('[rel=buttons]').html(),
        })
        return w2popup.open(options)
    }

    action(action, event) {
        let options = $('#w2ui-popup').data('options')
        let click = options.actions[action]
        if (click instanceof Object && click.onClick) click = click.onClick
        // event before
        let edata = this.trigger({ phase: 'before', type: 'action', target: 'popup', action, self: this, originalEvent: event })
        if (edata.isCancelled === true) return
        // default actions
        if (typeof click === 'function') click.call(this, event)
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
    }

    keydown(event) {
        let options = $('#w2ui-popup').data('options')
        if (options && !options.keyboard) return
        // trigger event
        let edata = w2popup.trigger({ phase: 'before', type: 'keydown', target: 'popup', options: options, originalEvent: event })
        if (edata.isCancelled === true) return
        // default behavior
        switch (event.keyCode) {
            case 27:
                event.preventDefault()
                if ($('#w2ui-popup .w2ui-message').length == 0) w2popup.close()
                break
        }
        // event after
        w2popup.trigger($.extend(edata, { phase: 'after'}))
    }

    close(options) {
        let obj = this
        options = $.extend({}, $('#w2ui-popup').data('options'), options)
        if ($('#w2ui-popup').length === 0 || this.status == 'closed') return
        if (this.status == 'opening') {
            setTimeout(() => { w2popup.close() }, 100)
            return
        }
        // trigger event
        let edata = this.trigger({ phase: 'before', type: 'close', target: 'popup', options: options })
        if (edata.isCancelled === true) return
        // default behavior
        w2popup.status = 'closing'
        $('#w2ui-popup')
            .css(w2utils.cssPrefix({
                'transition': options.speed + 's opacity, ' + options.speed + 's -webkit-transform'
            }))
            .addClass('w2ui-popup-closing')
        w2popup.unlockScreen(options)
        setTimeout(() => {
            // return template
            obj.restoreTemplate()
            $('#w2ui-popup').remove()
            w2popup.status = 'closed'
            // restore active
            if (options._last_focus && options._last_focus.length > 0) options._last_focus.focus()
            // event after
            obj.trigger($.extend(edata, { phase: 'after'}))
        }, options.speed * 1000)
        // remove keyboard events
        if (options.keyboard) $(document).off('keydown', this.keydown)
    }

    toggle() {
        let obj     = this
        let options = $('#w2ui-popup').data('options')
        // trigger event
        let edata = this.trigger({ phase: 'before', type: 'toggle', target: 'popup', options: options })
        if (edata.isCancelled === true) return
        // default action
        if (options.maximized === true) w2popup.min(); else w2popup.max()
        // event after
        setTimeout(() => {
            obj.trigger($.extend(edata, { phase: 'after'}))
        }, (options.speed * 1000) + 50)
    }

    max() {
        let obj     = this
        let options = $('#w2ui-popup').data('options')
        if (options.maximized === true) return
        // trigger event
        let edata = this.trigger({ phase: 'before', type: 'max', target: 'popup', options: options })
        if (edata.isCancelled === true) return
        // default behavior
        w2popup.status   = 'resizing'
        options.prevSize = $('#w2ui-popup').css('width') + ':' + $('#w2ui-popup').css('height')
        // do resize
        w2popup.resize(10000, 10000, () => {
            w2popup.status    = 'open'
            options.maximized = true
            obj.trigger($.extend(edata, { phase: 'after'}))
            // resize gird, form, layout inside popup
            $('#w2ui-popup .w2ui-grid, #w2ui-popup .w2ui-form, #w2ui-popup .w2ui-layout').each(() => {
                let name = $(this).attr('name')
                if (w2ui[name] && w2ui[name].resize) w2ui[name].resize()
            })
        })
    }

    min() {
        let obj     = this
        let options = $('#w2ui-popup').data('options')
        if (options.maximized !== true) return
        let size = options.prevSize.split(':')
        // trigger event
        let edata = this.trigger({ phase: 'before', type: 'min', target: 'popup', options: options })
        if (edata.isCancelled === true) return
        // default behavior
        w2popup.status = 'resizing'
        // do resize
        w2popup.resize(parseInt(size[0]), parseInt(size[1]), () => {
            w2popup.status    = 'open'
            options.maximized = false
            options.prevSize  = null
            obj.trigger($.extend(edata, { phase: 'after'}))
            // resize gird, form, layout inside popup
            $('#w2ui-popup .w2ui-grid, #w2ui-popup .w2ui-form, #w2ui-popup .w2ui-layout').each(() => {
                let name = $(this).attr('name')
                if (w2ui[name] && w2ui[name].resize) w2ui[name].resize()
            })
        })
    }

    get() {
        return $('#w2ui-popup').data('options')
    }

    set(options) {
        w2popup.open(options)
    }

    clear() {
        $('#w2ui-popup .w2ui-popup-title').html('')
        $('#w2ui-popup .w2ui-popup-body').html('')
        $('#w2ui-popup .w2ui-popup-buttons').html('')
    }

    reset() {
        w2popup.open(w2popup.defaults)
    }

    message(options) {
        return w2utils.message.call(this, {
            box   : $('#w2ui-popup'),
            after : '.w2ui-popup-title'
        }, options)
    }

    confirm(options) {
        return w2utils.confirm.call(this, {
            box   : $('#w2ui-popup'),
            after : '.w2ui-popup-title'
        }, options)
    }

    focus() {
        let tmp = null
        let pop = $('#w2ui-popup')
        // TODO: jquery only :visible
        let sel = 'input:visible, button:visible, select:visible, textarea:visible, [contentEditable], .w2ui-input'
        // clear previous blur
        $(pop).find(sel).off('.keep-focus')
        // in message or popup
        let cnt = $('#w2ui-popup .w2ui-message').length - 1
        let msg = $('#w2ui-popup #w2ui-message' + cnt)
        if (msg.length > 0) {
            let btn =$(msg[msg.length - 1]).find('button')
            if (btn.length > 0) btn[0].focus()
            tmp = msg
        } else if (pop.length > 0) {
            let btn = pop.find('.w2ui-popup-buttons button')
            if (btn.length > 0) btn[0].focus()
            tmp = pop
        }
        // keep focus/blur inside popup
        $(tmp).find(sel)
            .on('blur.keep-focus', function(event) {
                setTimeout(() => {
                    let focus = $(':focus')
                    if ((focus.length > 0 && !$(tmp).find(sel).is(focus)) || focus.hasClass('w2ui-popup-hidden')) {
                        let el = $(tmp).find(sel)
                        if (el.length > 0) el[0].focus()
                    }
                }, 1)
            })
    }

    lock(msg, showSpinner) {
        let args = Array.from(arguments)
        args.unshift($('#w2ui-popup'))
        w2utils.lock(...args)
    }

    unlock(speed) {
        w2utils.unlock($('#w2ui-popup'), speed)
    }

    // --- INTERNAL FUNCTIONS

    lockScreen(options) {
        if ($('#w2ui-lock').length > 0) return false
        if (options == null) options = $('#w2ui-popup').data('options')
        if (options == null) options = {}
        options = $.extend({}, w2popup.defaults, options)
        // show element
        $('body').append('<div id="w2ui-lock" ' +
            '    style="position: ' + (w2utils.engine == 'IE5' ? 'absolute' : 'fixed') + '; z-Index: 1199; left: 0px; top: 0px; ' +
            '           padding: 0px; margin: 0px; background-color: ' + options.color + '; width: 100%; height: 100%; opacity: 0;"></div>')
        // lock screen
        setTimeout(() => {
            $('#w2ui-lock')
                .css('opacity', options.opacity)
                .css(w2utils.cssPrefix('transition', options.speed + 's opacity'))
        }, 1)
        // add events
        if (options.modal == true) {
            $('#w2ui-lock')
                .on('mousedown', function() {
                    $('#w2ui-lock')
                        .css('opacity', '0.6')
                        .css(w2utils.cssPrefix('transition', '.1s'))
                })
                .on('mouseup', function() {
                    setTimeout(() => {
                        $('#w2ui-lock')
                            .css('opacity', options.opacity)
                            .css(w2utils.cssPrefix('transition', '.1s'))
                    }, 100)
                })
                .on('mousewheel', function(event) {
                    if (event.stopPropagation) { event.stopPropagation() } else { event.cancelBubble = true }
                    if (event.preventDefault) { event.preventDefault() } else { return false }
                })
        } else {
            $('#w2ui-lock').on('mousedown', function() { w2popup.close() })
        }
        return true
    }

    unlockScreen(options) {
        if ($('#w2ui-lock').length === 0) return false
        if (options == null) options = $('#w2ui-popup').data('options')
        if (options == null) options = {}
        options = $.extend({}, w2popup.defaults, options)
        $('#w2ui-lock')
            .css('opacity', '0')
            .css(w2utils.cssPrefix('transition', options.speed + 's opacity'))
        setTimeout(() => {
            $('#w2ui-lock').remove()
        }, options.speed * 1000)
        return true
    }

    resizeMessages() {
        // see if there are messages and resize them
        $('#w2ui-popup .w2ui-message').each(() => {
            let moptions = $(this).data('options')
            let $popup   = $('#w2ui-popup')
            if (parseInt(moptions.width) < 10) moptions.width = 10
            if (parseInt(moptions.height) < 10) moptions.height = 10
            let titleHeight = parseInt($popup.find('> .w2ui-popup-title').css('height'))
            let pWidth      = parseInt($popup.width())
            let pHeight     = parseInt($popup.height())
            // re-calc width
            moptions.width = moptions.originalWidth
            if (moptions.width > pWidth - 10) {
                moptions.width = pWidth - 10
            }
            // re-calc height
            moptions.height = moptions.originalHeight
            if (moptions.height > pHeight - titleHeight - 5) {
                moptions.height = pHeight - titleHeight - 5
            }
            if (moptions.originalHeight < 0) moptions.height = pHeight + moptions.originalHeight - titleHeight
            if (moptions.originalWidth < 0) moptions.width = pWidth + moptions.originalWidth * 2 // x 2 because there is left and right margin
            $(this).css({
                left    : ((pWidth - moptions.width) / 2) + 'px',
                width   : moptions.width + 'px',
                height  : moptions.height + 'px'
            })
        })
    }

    resize(width, height, callBack) {
        let obj     = this
        let options = $('#w2ui-popup').data('options') || {}
        if (options.speed == null) options.speed = 0
        width  = parseInt(width)
        height = parseInt(height)
        // calculate new position
        let maxW, maxH
        if (window.innerHeight == undefined) {
            maxW = parseInt(document.documentElement.offsetWidth)
            maxH = parseInt(document.documentElement.offsetHeight)
            if (w2utils.engine === 'IE7') { maxW += 21; maxH += 4 }
        } else {
            maxW = parseInt(window.innerWidth)
            maxH = parseInt(window.innerHeight)
        }
        if (maxW - 10 < width) width = maxW - 10
        if (maxH - 10 < height) height = maxH - 10
        let top  = (maxH - height) / 2 * 0.6
        let left = (maxW - width) / 2
        // resize there
        $('#w2ui-popup')
            .css(w2utils.cssPrefix({
                'transition': options.speed + 's width, ' + options.speed + 's height, ' + options.speed + 's left, ' + options.speed + 's top'
            }))
            .css({
                'top'   : top,
                'left'  : left,
                'width' : width,
                'height': height
            })
        let tmp_int = setInterval(() => { obj.resizeMessages() }, 10) // then messages resize nicely
        setTimeout(() => {
            clearInterval(tmp_int)
            options.width  = width
            options.height = height
            obj.resizeMessages()
            if (typeof callBack == 'function') callBack()
        }, (options.speed * 1000) + 50) // give extra 50 ms
    }

    /***********************
    *  Internal
    **/

    // restores template
    restoreTemplate() {
        let options = $('#w2ui-popup').data('options')
        if (options == null) return
        let template = w2popup._template
        let title    = options.title
        let body     = options.body
        let buttons  = options.buttons
        if (w2popup._prev) {
            template = w2popup._prev.template
            title    = w2popup._prev.title
            body     = w2popup._prev.body
            buttons  = w2popup._prev.buttons
            delete w2popup._prev
        } else {
            delete w2popup._template
        }
        if (template != null) {
            let $tmp = $(template)
            if ($tmp.length === 0) return
            if ($(body).attr('rel') == 'body') {
                if (title) $tmp.append(title)
                if (body) $tmp.append(body)
                if (buttons) $tmp.append(buttons)
            } else {
                $tmp.append(body)
            }
        }
    }
}

function w2alert(msg, title, callBack) {
    let prom
    let options = {
        title: w2utils.lang(title ?? 'Notification'),
        body: `<div class="w2ui-centered w2ui-alert-msg">${msg}</div>`,
        showClose: false,
        actions: ['Ok']
    }
    if (query('#w2ui-popup').length > 0 && w2popup.status != 'closing') {
        prom = w2popup.message(options)
    } else {
        prom = w2popup.open(options)
    }
    prom.ok((event) => {
        if (typeof event.self?.close == 'function') {
            event.self.close();
        }
        if (typeof callBack == 'function') callBack()
    })
    return prom
}

function w2confirm(msg, title, callBack) {
    let prom
    let options = msg
    if (['string', 'number'].includes(typeof options)) {
        options = { msg: options }
    }
    if (options.msg) {
        options.body = `<div class="w2ui-centered w2ui-confirm-msg">${options.msg}</div>`,
        delete options.msg
    }
    w2utils.extend(options, {
        title: w2utils.lang(title ?? 'Confirmation'),
        showClose: false,
        modal: true
    })
    w2utils.normButtons(options, { yes: 'Yes', no: 'No' })
    if (query('#w2ui-popup').length > 0 && w2popup.status != 'closing') {
        prom = w2popup.message(options)
    } else {
        prom = w2popup.open(options)
    }
    prom.self
        .off('.confirm')
        .on('action:after.confirm', (event) => {
            if (typeof event.self?.close == 'function') {
                event.self.close();
            }
            if (typeof callBack == 'function') callBack(event.action)
        })
    return prom
}

function w2prompt(label, title, callBack) {
    let $        = jQuery
    let options  = {}
    let defaults = {
        title: w2utils.lang('Notification'),
        width: ($('#w2ui-popup').length > 0 ? 400 : 450),
        height: ($('#w2ui-popup').length > 0 ? 180 : 220),
        label: '',
        value: '',
        attrs: '',
        textarea: false,
        btn_ok: {
            text: 'Ok',
            class: '',
            style: '',
            click: null
        },
        btn_cancel: {
            text: 'Cancel',
            class: '',
            style: '',
            click: null
        },
        callBack: null,
        onOpen: null,
        onClose: null
    }
    w2popup.tmp  = w2popup.tmp || {}

    if (arguments.length == 1 && typeof label == 'object') {
        $.extend(options, defaults, label)
    } else {
        if (typeof title == 'function') {
            $.extend(options, defaults, {
                label   : label,
                callBack: title
            })
        } else {
            $.extend(options, defaults, {
                label   : label,
                title   : title,
                callBack: callBack
            })
        }
    }
    // ok btn - backward compatibility
    if (options.ok_text) options.btn_ok.text = options.ok_text
    if (options.ok_class) options.btn_ok.class = options.ok_class
    if (options.ok_style) options.btn_ok.style = options.ok_style
    if (options.ok_onClick) options.btn_ok.click = options.ok_onClick
    if (options.ok_callBack) options.btn_ok.click = options.ok_callBack
    // cancel btn - backward compatibility
    if (options.cancel_text) options.btn_cancel.text = options.cancel_text
    if (options.cancel_class) options.btn_cancel.class = options.cancel_class
    if (options.cancel_style) options.btn_cancel.style = options.cancel_style
    if (options.cancel_onClick) options.btn_cancel.click = options.cancel_onClick
    if (options.cancel_callBack) options.btn_cancel.click = options.cancel_callBack

    if ($('#w2ui-popup').length > 0 && w2popup.status != 'closing' && w2popup.get()) {
        if (options.width > w2popup.get().width) options.width = w2popup.get().width
        if (options.height > (w2popup.get().height - 50)) options.height = w2popup.get().height - 50
        w2popup.message({
            width   : options.width,
            height  : options.height,
            body    : (options.textarea
                     ? '<div class="w2ui-prompt textarea">'+
                        '  <div>' + options.label + '</div>'+
                        '  <textarea id="w2prompt" class="w2ui-input" '+ options.attrs +'></textarea>'+
                        '</div>'
                     : '<div class="w2ui-prompt w2ui-centered">'+
                        '  <label>' + options.label + '</label>'+
                        '  <input id="w2prompt" class="w2ui-input" '+ options.attrs +'>'+
                        '</div>'
            ),
            buttons : (w2utils.settings.macButtonOrder
                ? '<button id="Cancel" class="w2ui-popup-btn w2ui-btn '+ options.btn_cancel.class +'" style="'+ options.btn_cancel.style +'">' + options.btn_cancel.text + '</button>' +
                  '<button id="Ok" class="w2ui-popup-btn w2ui-btn '+ options.btn_ok.class +'" style="'+ options.btn_ok.style +'">' + options.btn_ok.text + '</button>'
                : '<button id="Ok" class="w2ui-popup-btn w2ui-btn '+ options.btn_ok.class +'" style="'+ options.btn_ok.style +'">' + options.btn_ok.text + '</button>' +
                  '<button id="Cancel" class="w2ui-popup-btn w2ui-btn '+ options.btn_cancel.class +'" style="'+ options.btn_cancel.style +'">' + options.btn_cancel.text + '</button>'
            ),
            onOpen(event) {
                $('#w2prompt').val(options.value).off('.w2prompt').on('keydown.w2prompt', function(event) {
                    if (event.keyCode == 13) {
                        $('#w2ui-popup .w2ui-message .w2ui-btn#Ok').click()
                    }
                })
                $('#w2ui-popup .w2ui-message .w2ui-btn#Ok').off('.w2prompt').on('click.w2prompt', function(event) {
                    w2popup.tmp.btn   = 'ok'
                    w2popup.tmp.value = $('#w2prompt').val()
                    w2popup.message()
                })
                $('#w2ui-popup .w2ui-message .w2ui-btn#Cancel').off('.w2prompt').on('click.w2prompt', function(event) {
                    w2popup.tmp.btn   = 'cancel'
                    w2popup.tmp.value = null
                    w2popup.message()
                })
                // set focus
                setTimeout(() => { $('#w2prompt').focus() }, 100)
                // some event
                if (typeof options.onOpen == 'function') options.onOpen(event)
                if (typeof options.then == 'function') options.then(event)
            },
            onClose(event) {
                // needed this because there might be other messages
                $('#w2ui-popup .w2ui-message .w2ui-btn').off('click.w2prompt')
                // need to wait for message to slide up
                setTimeout(() => {
                    btnClick(w2popup.tmp.btn, w2popup.tmp.value, event)
                }, 300)
                // some event
                if (typeof options.onClose == 'function') options.onClose(event)
            }
            // onKeydown will not work here
        })

    } else {

        if (!w2utils.isInt(options.height)) options.height = options.height + 50
        w2popup.open({
            width: options.width,
            height: options.height,
            title: options.title,
            modal: true,
            showClose: false,
            body: (options.textarea
                         ? '<div class="w2ui-prompt">'+
                            '  <div>' + options.label + '</div>'+
                            '  <textarea id="w2prompt" class="w2ui-input" '+ options.attrs +'></textarea>'+
                            '</div>'
                         : '<div class="w2ui-prompt w2ui-centered" style="font-size: 13px;">'+
                            '  <label>' + options.label + '</label>'+
                            '  <input id="w2prompt" class="w2ui-input" '+ options.attrs +'>'+
                            '</div>'
            ),
            buttons    : (w2utils.settings.macButtonOrder
                ? '<button id="Cancel" class="w2ui-popup-btn w2ui-btn '+ options.btn_cancel.class +'" style="'+ options.btn_cancel.style +'">' + options.btn_cancel.text + '</button>' +
                  '<button id="Ok" class="w2ui-popup-btn w2ui-btn '+ options.btn_ok.class +'" style="'+ options.btn_ok.style +'">' + options.btn_ok.text + '</button>'
                : '<button id="Ok" class="w2ui-popup-btn w2ui-btn '+ options.btn_ok.class +'" style="'+ options.btn_ok.style +'">' + options.btn_ok.text + '</button>'+
                  '<button id="Cancel" class="w2ui-popup-btn w2ui-btn '+ options.btn_cancel.class +'" style="'+ options.btn_cancel.style +'">' + options.btn_cancel.text + '</button>'
            ),
            onOpen(event) {
                // do not use onComplete as it is slower
                setTimeout(() => {
                    $('#w2prompt').val(options.value)
                    $('#w2prompt').w2field('text')
                    $('#w2ui-popup .w2ui-popup-btn#Ok').on('click', function(event) {
                        w2popup.tmp.btn   = 'ok'
                        w2popup.tmp.value = $('#w2prompt').val()
                        w2popup.close()
                    })
                    $('#w2ui-popup .w2ui-popup-btn#Cancel').on('click', function(event) {
                        w2popup.tmp.btn   = 'cancel'
                        w2popup.tmp.value = null
                        w2popup.close()
                    })
                    $('#w2ui-popup .w2ui-popup-btn#Ok')
                    // set focus
                    setTimeout(() => { $('#w2prompt').focus() }, 100)
                    // some event
                    if (typeof options.onOpen == 'function') options.onOpen(event)
                    if (typeof options.then == 'function') options.then(event)
                }, 1)
            },
            onClose(event) {
                // some event
                btnClick(w2popup.tmp.btn, w2popup.tmp.value, event)
                if (typeof options.onClose == 'function') options.onClose(event)
            },
            onKeydown(event) {
                // if there are no messages
                if ($('#w2ui-popup .w2ui-message').length === 0) {
                    switch (event.originalEvent.keyCode) {
                        case 13: // enter
                            $('#w2ui-popup .w2ui-popup-btn#Ok').focus().addClass('clicked') // no need fo click as enter will do click
                            break
                        case 27: // esc
                            w2popup.tmp.btn   = 'cancel'
                            w2popup.tmp.value = null
                            break
                    }
                }
            }
        })
    }
    function btnClick(btn, value, event) {
        if (btn == 'ok' && typeof options.btn_ok.click == 'function') {
            options.btn_ok.click(value, event)
        }
        if (btn == 'cancel' && typeof options.btn_cancel.click == 'function') {
            options.btn_cancel.click(value, event)
        }
        if (typeof options.callBack == 'function') {
            options.callBack(btn, value, event)
        }
    }
    let prom = {
        ok(fun) {
            options.btn_ok.click = fun
            return prom
        },
        cancel(fun) {
            options.btn_cancel.click = fun
            return prom
        },
        answer(fun) {
            options.callBack = fun
            return prom
        },
        change(fun) {
            $('#w2prompt').on('keyup', fun).keyup()
            return prom
        },
        then(fun) {
            options.then = fun
            return prom
        }
    }
    return prom
}

let w2popup = new Dialog()
export { w2popup, w2alert, w2confirm, w2prompt, Dialog }