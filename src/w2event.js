/************************************************************************
*   Part of w2ui 2.0 library
*   - Dependencies: jQuery w2utils
*   - there is a doc file ../details/w2event.html
*   - on/off/trigger methods id not showing in help
**/

import { w2ui, w2utils } from './w2utils.js'

class w2event {
    constructor(name) {
        this.handlers = []
        // register globally
        if (typeof name !== 'undefined') {
            if (!w2utils.checkName(name)) return
            w2ui[name] = this
        }
    }

    /**
     * Adds event listener, supports event phase and event scoping
     *
     * @param {*} edata - an object or string, if string "eventName:phase.scope"
     * @param {*} handler
     * @returns itself
     */
    on(edata, handler) {
        let name = typeof edata == 'string' ? edata : (edata.type + ':' + edata.execute + '.' + edata.scope)
        if (typeof edata == 'string') {
            let [eventName, scope] = edata.split('.')
            let [type, execute] = eventName.replace(':complete', ':after').replace(':done', ':after').split(':')
            edata = { type, execute: execute ?? 'before', scope }
        }
        edata = w2utils.extend({ type: null, execute: 'before', onComplete: null }, edata)
        // errors
        if (!edata.type) { console.log('ERROR: You must specify event type when calling .on() method of '+ this.name); return }
        if (!handler) { console.log('ERROR: You must specify event handler function when calling .on() method of '+ this.name); return }
        if (!Array.isArray(this.handlers)) this.handlers = []
        this.handlers.push({ name, edata: edata, handler: handler })
        return this
    }

    /**
     * Removes event listener, supports event phase and event scoping
     *
     * @param {*} edata - an object or string, if string "eventName:phase.scope"
     * @param {*} handler
     * @returns itself
     */
    off(edata, handler) {
        if (typeof edata == 'string') {
            let [eventName, scope] = edata.split('.')
            let [type, execute] = eventName.replace(':complete', ':after').replace(':done', ':after').split(':')
            edata = { type: type || '*', execute: execute || '', scope: scope || '' }
        }
        edata = w2utils.extend({ type: null, execute: null, onComplete: null }, edata)
        // errors
        if (!edata.type && !edata.scope) { console.log('ERROR: You must specify event type when calling .off() method of '+ this.name); return }
        if (!handler) { handler = null }
        // remove handlers
        this.handlers = this.handlers.filter(curr => {
            if (   (edata.type === '*' ||  edata.type === curr.edata.type)
                && (edata.execute === '' ||  edata.execute === curr.edata.execute)
                && (edata.scope === '' ||  edata.scope === curr.edata.scope)
                && (edata.handler == null ||  edata.handler === curr.edata.handler)
            ) {
                return false
            } else {
                return true
            }
        })
        return this // needed for chaining
    }

    /**
     * Triggers an even handlers from his.handlers
     *
     * @param {*} edata
     * @returns modified edata
     */
    trigger(edata) {
        edata = Object.assign({ type: null, phase: 'before', target: null, doneHandlers: [] }, edata, {
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
                edata = Object.assign({}, item.edata, edata)
                // check handler arguments
                args = []
                tmp  = new RegExp(/\((.*?)\)/).exec(String(item.handler).split('=>')[0])
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
            tmp  = new RegExp(/\((.*?)\)/).exec(String(fun).split('=>')[0])
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
            tmp  = new RegExp(/\((.*?)\)/).exec(String(fun).split('=>')[0])
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