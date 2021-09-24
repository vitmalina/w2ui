/************************************************************************
*   Part of w2ui 2.0 library
*   - Dependencies: jQuery, w2utils
**/

import { w2utils } from './w2utils.js'

class w2event {
    constructor(name) {
        this.handlers = []
        // register globally
        if (typeof name !== 'undefined') {
            window.w2ui = window.w2ui || {}
            if (!w2utils.checkName(name)) return
            window.w2ui[name] = this
        }
    }

    on(edata, handler) {
        let scope
        // allow 'eventName.scope' syntax
        if (typeof edata === 'string' && edata.indexOf('.') !== -1) {
            let tmp = edata.split('.')
            edata   = tmp[0]
            scope   = tmp[1]
        }
        // allow 'eventName:after' syntax
        if (typeof edata === 'string' && edata.indexOf(':') !== -1) {
            let tmp = edata.split(':')
            if (['complete', 'done'].indexOf(edata[1]) !== -1) edata[1] = 'after'
            edata = {
                type    : tmp[0],
                execute : tmp[1]
            }
            if (scope) edata.scope = scope
        }
        if (!$.isPlainObject(edata)) edata = { type: edata, scope: scope }
        edata = $.extend({ type: null, execute: 'before', target: null, onComplete: null }, edata)
        // errors
        if (!edata.type) { console.log('ERROR: You must specify event type when calling .on() method of '+ this.name); return }
        if (!handler) { console.log('ERROR: You must specify event handler function when calling .on() method of '+ this.name); return }
        if (!Array.isArray(this.handlers)) this.handlers = []
        this.handlers.push({ edata: edata, handler: handler })
        return this // needed for chaining
    }

    off(edata, handler) {
        let scope
        // allow 'eventName.scope' syntax
        if (typeof edata === 'string' && edata.indexOf('.') !== -1) {
            let tmp = edata.split('.')
            edata   = tmp[0]
            scope   = tmp[1]
            if (edata === '') edata = '*'
        }
        // allow 'eventName:after' syntax
        if (typeof edata === 'string' && edata.indexOf(':') !== -1) {
            let tmp = edata.split(':')
            if (['complete', 'done'].indexOf(edata[1]) !== -1) edata[1] = 'after'
            edata = {
                type    : tmp[0],
                execute : tmp[1]
            }
        }
        if (!$.isPlainObject(edata)) edata = { type: edata }
        edata = $.extend({}, { type: null, execute: null, target: null, onComplete: null }, edata)
        // errors
        if (!edata.type && !scope) { console.log('ERROR: You must specify event type when calling .off() method of '+ this.name); return }
        if (!handler) { handler = null }
        // remove handlers
        let newHandlers = []
        for (let h = 0, len = this.handlers.length; h < len; h++) {
            let t = this.handlers[h]
            if ((t.edata.type === edata.type || edata.type === '*' || (t.edata.scope != null && edata.type == '')) &&
                (t.edata.target === edata.target || edata.target == null) &&
                (t.edata.execute === edata.execute || edata.execute == null) &&
                ((t.handler === handler && handler != null) || (scope != null && t.edata.scope == scope)))
            {
                // match
            } else {
                newHandlers.push(t)
            }
        }
        this.handlers = newHandlers
        return this
    }

    trigger(edata) {
        edata = $.extend({ type: null, phase: 'before', target: null, doneHandlers: [] }, edata, {
            isStopped: false,
            isCancelled: false,
            done(handler) { this.doneHandlers.push(handler) },
            preventDefault() { this.isCancelled = true },
            stopPropagation() { this.isStopped = true }
        })
        if (edata.phase === 'before') edata.onComplete = null
        let args, fun, tmp
        if (edata.target == null) edata.target = null
        if (!Array.isArray(this.handlers)) this.handlers = []
        // process events in REVERSE order
        for (let h = this.handlers.length-1; h >= 0; h--) {
            let item = this.handlers[h]
            if (item != null && (item.edata.type === edata.type || item.edata.type === '*') &&
                (item.edata.target === edata.target || item.edata.target == null) &&
                (item.edata.execute === edata.phase || item.edata.execute === '*' || item.edata.phase === '*'))
            {
                edata = $.extend({}, item.edata, edata)
                // check handler arguments
                args = []
                tmp  = new RegExp(/\((.*?)\)/).exec(item.handler)
                if (tmp) args = tmp[1].split(/\s*,\s*/)
                if (args.length === 2) {
                    item.handler.call(this, edata.target, edata) // old way for back compatibility
                } else {
                    item.handler.call(this, edata) // new way
                }
                if (edata.isStopped === true || edata.stop === true) return edata // back compatibility edata.stop === true
            }
        }
        // main object events
        let funName = 'on' + edata.type.substr(0,1).toUpperCase() + edata.type.substr(1)
        if (edata.phase === 'before' && typeof this[funName] === 'function') {
            fun = this[funName]
            // check handler arguments
            args = []
            tmp  = new RegExp(/\((.*?)\)/).exec(fun)
            if (tmp) args = tmp[1].split(/\s*,\s*/)
            if (args.length === 2) {
                fun.call(this, edata.target, edata) // old way for back compatibility
            } else {
                fun.call(this, edata) // new way
            }
            if (edata.isStopped === true || edata.stop === true) return edata // back compatibility edata.stop === true
        }
        // item object events
        if (edata.object != null && edata.phase === 'before' && typeof edata.object[funName] === 'function') {
            fun = edata.object[funName]
            // check handler arguments
            args = []
            tmp  = new RegExp(/\((.*?)\)/).exec(fun)
            if (tmp) args = tmp[1].split(/\s*,\s*/)
            if (args.length === 2) {
                fun.call(this, edata.target, edata) // old way for back compatibility
            } else {
                fun.call(this, edata) // new way
            }
            if (edata.isStopped === true || edata.stop === true) return edata
        }
        // execute onComplete
        if (edata.phase === 'after') {
            if (typeof edata.onComplete === 'function') edata.onComplete.call(this, edata)
            for (let i = 0; i < edata.doneHandlers.length; i++) {
                if (typeof edata.doneHandlers[i] === 'function') {
                    edata.doneHandlers[i].call(this, edata)
                }
            }
        }
        return edata
    }
}
export { w2event }