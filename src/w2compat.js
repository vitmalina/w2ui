/**
 * Part of w2ui 2.0 library
 *  - Dependencies: jQuery, w2ui.*
 *
 * This file provided compatibility for projects that conntinue to use jQuery. It extends jQuery with
 * w2ui support, such as fn.w2grid, fn.w2form, ... fn.w2render, fn.w2destroy, fn.w2tag, etc
 *
 * It is not needed for projects that use ES6 module loading.
 *
 * == 2.0 changes
 *   - CSP - fixed inline events
 */

import { w2locale } from './w2locale.js'
import { w2event, w2base } from './w2base.js'
import { w2ui, w2utils } from './w2utils.js'
import { query } from './query.js'
import { w2popup, w2alert, w2confirm, w2prompt, Dialog } from './w2popup.js'
import { w2field } from './w2field.js'
import { w2form } from './w2form.js'
import { w2grid } from './w2grid.js'
import { w2layout } from './w2layout.js'
import { w2sidebar } from './w2sidebar.js'
import { w2tabs } from './w2tabs.js'
import { w2toolbar } from './w2toolbar.js'
import { w2tooltip, w2color, w2menu, w2date, Tooltip } from './w2tooltip.js'

// Register jQuery plugins
(function($) {

    // register globals if needed
    let w2globals = function() {
        (function (win, obj) {
            Object.keys(obj).forEach(key => {
                win[key] = obj[key]
            })
        })(window, {
            w2ui, w2utils, query, w2locale, w2event, w2base,
            w2popup, w2alert, w2confirm, w2prompt, Dialog,
            w2tooltip, w2menu, w2color, w2date, Tooltip,
            w2toolbar, w2sidebar, w2tabs, w2layout, w2grid, w2form, w2field
        })
    }
    // if url has globals at the end, then register globals
    let param = String(import.meta.url).split('?')[1] || ''
    if (param == 'globals' || param.substr(0, 8) == 'globals=') {
        w2globals()
    }

    // if jQuery is not defined, then exit
    if (!$) return
    $.w2globals = w2globals

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
        let str = Array.from(arguments)
        if (Array.isArray(str[0])) str = str[0]
        return $(this).each((index, el) => {
            w2utils.marker(el, str)
        })
    }

    $.fn.w2tag = function(text, options) {
        return this.each((index, el) => {
            if (text == null && options == null) {
                w2tooltip.hide()
                return
            }
            if (typeof text == 'object') {
                options = text
            } else {
                options = options ?? {}
                options.html = text
            }
            w2tooltip.show({ anchor: el, ...options })
        })
    }

    $.fn.w2overlay = function(html, options) {
        return this.each((index, el) => {
            if (html == null && options == null) {
                w2tooltip.hide()
                return
            }
            if (typeof html == 'object') {
                options = html
            } else {
                options.html = html
            }
            Object.assign(options, {
                class: 'w2ui-white',
                hideOn: ['doc-click']
            })
            w2tooltip.show({ anchor: el, ...options })
        })
    }

    $.fn.w2menu = function(menu, options) {
        return this.each((index, el) => {
            if (typeof menu == 'object') {
                options = menu
            }
            if (typeof menu == 'object') {
                options = menu
            } else {
                options.items = menu
            }
            w2menu.show({ anchor: el, ...options })
        })
    }

    $.fn.w2color = function(options, callBack) {
        return this.each((index, el) => {
            let tooltip = w2color.show({ anchor: el, ...options })
            if (typeof callBack == 'function') {
                tooltip.select(callBack)
            }
        })
    }

})(window.jQuery)

export {
    w2ui, w2utils, query, w2locale, w2event, w2base,
    w2popup, w2alert, w2confirm, w2prompt, Dialog,
    w2tooltip, w2menu, w2color, w2date, Tooltip,
    w2toolbar, w2sidebar, w2tabs, w2layout, w2grid, w2form, w2field
}