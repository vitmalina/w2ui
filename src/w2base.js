/**
 * Part of w2ui 2.0 library
 *  - Dependencies: w2utils
 *  - on/off/trigger methods id not showing in help
 *  - refactored with event object
 *
 * Chanes in 2.0.+
 * - added unmount that cleans up the box
 *
 */

import { w2ui, w2utils, query } from './w2utils.js'

class w2event {
    constructor(owner, edata) {
        Object.assign(this, {
            type: edata.type ?? null,
            detail: edata,
            owner,
            target: edata.target ?? null,
            phase: edata.phase ?? 'before',
            object: edata.object ?? null,
            execute: null,
            isStopped: false,
            isCancelled: false,
            onComplete: null,
            listeners: []
        })
        delete edata.type
        delete edata.target
        delete edata.object
        this.complete = new Promise((resolve, reject) => {
            this._resolve = resolve
            this._reject = reject
        })
        // needed empty catch function so that promise will not show error in the console
        this.complete.catch(() => {})
    }

    finish(detail) {
        if (detail) {
            w2utils.extend(this.detail, detail)
        }
        this.phase = 'after'
        this.owner.trigger.call(this.owner, this)
    }

    done(func) {
        this.listeners.push(func)
    }

    preventDefault() {
        this._reject()
        this.isCancelled = true
    }

    stopPropagation() {
        this.isStopped = true
    }
}

class w2base {
    /**
     * Initializes base object for w2ui, registers it with w2ui object
     *
     * @param {string} name  - name of the object
     * @returns
     */
    constructor(name) {
        this.activeEvents = [] // events that are currently processing
        this.listeners = [] // event listeners
        // register globally
        if (typeof name !== 'undefined') {
            if (!w2utils.checkName(name)) return
            w2ui[name] = this
        }
        this.debug = false // if true, will trigger all events
    }

    /**
     * Adds event listener, supports event phase and event scoping
     *
     * @param {*} edata - an object or string, if string "eventName:phase.scope"
     * @param {*} handler
     * @returns itself
     */
    on(events, handler) {
        if (typeof events == 'string') {
            events = events.split(/[,\s]+/) // separate by comma or space
        } else {
            events = [events]
        }
        events.forEach(edata => {
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
            if (!Array.isArray(this.listeners)) this.listeners = []
            this.listeners.push({ name, edata, handler })
            if (this.debug) {
                console.log('w2base: add event', { name, edata, handler })
            }
        })
        return this
    }

    /**
     * Removes event listener, supports event phase and event scoping
     *
     * @param {*} edata - an object or string, if string "eventName:phase.scope"
     * @param {*} handler
     * @returns itself
     */
    off(events, handler) {
        if (typeof events == 'string') {
            events = events.split(/[,\s]+/) // separate by comma or space
        } else {
            events = [events]
        }
        events.forEach(edata => {
            let name = typeof edata == 'string' ? edata : (edata.type + ':' + edata.execute + '.' + edata.scope)
            if (typeof edata == 'string') {
                let [eventName, scope] = edata.split('.')
                let [type, execute] = eventName.replace(':complete', ':after').replace(':done', ':after').split(':')
                edata = { type: type || '*', execute: execute || '', scope: scope || '' }
            }
            edata = w2utils.extend({ type: null, execute: null, onComplete: null }, edata)
            // errors
            if (!edata.type && !edata.scope) { console.log('ERROR: You must specify event type when calling .off() method of '+ this.name); return }
            if (!handler) { handler = null }
            let count = 0
            // remove listener
            this.listeners = this.listeners.filter(curr => {
                if ( (edata.type === '*' || edata.type === curr.edata.type)
                    && (edata.execute === '' || edata.execute === curr.edata.execute)
                    && (edata.scope === '' || edata.scope === curr.edata.scope)
                    && (edata.handler == null || edata.handler === curr.edata.handler)
                ) {
                    count++ // how many listeners removed
                    return false
                } else {
                    return true
                }
            })
            if (this.debug) {
                console.log(`w2base: remove event (${count})`, { name, edata, handler })
            }
        })
        return this // needed for chaining
    }

    /**
     * Triggers even listeners for a specific event, loops through this.listeners
     *
     * @param {Object} edata - Object
     * @returns modified edata
     */
    trigger(eventName, edata) {
        if (arguments.length == 1) {
            edata = eventName
        } else {
            edata.type = eventName
            edata.target = edata.target ?? this
        }
        if (w2utils.isPlainObject(edata) && edata.phase == 'after') {
            // find event
            edata = this.activeEvents.find(event => {
                if (event.type == edata.type && event.target == edata.target) {
                    return true
                }
                return false
            })
            if (!edata) {
                console.log(`ERROR: Cannot find even handler for "${edata.type}" on "${edata.target}".`)
                return
            }
            console.log('NOTICE: This syntax "edata.trigger({ phase: \'after\' })" is outdated. Use edata.finish() instead.')
        } else if (!(edata instanceof w2event)) {
            edata = new w2event(this, edata)
            this.activeEvents.push(edata)
        }
        let args, fun, tmp
        if (!Array.isArray(this.listeners)) this.listeners = []
        if (this.debug) {
            console.log(`w2base: trigger "${edata.type}:${edata.phase}"`, edata)
        }
        // process events in REVERSE order
        for (let h = this.listeners.length-1; h >= 0; h--) {
            let item = this.listeners[h]
            if (item != null && (item.edata.type === edata.type || item.edata.type === '*') &&
                (item.edata.target === edata.target || item.edata.target == null) &&
                (item.edata.execute === edata.phase || item.edata.execute === '*' || item.edata.phase === '*'))
            {
                // add extra params if there
                Object.keys(item.edata).forEach(key => {
                    if (edata[key] == null && item.edata[key] != null) {
                        edata[key] = item.edata[key]
                    }
                })
                // check handler arguments
                args = []
                tmp  = new RegExp(/\((.*?)\)/).exec(String(item.handler).split('=>')[0])
                if (tmp) args = tmp[1].split(/\s*,\s*/)
                if (args.length === 2) {
                    item.handler.call(this, edata.target, edata) // old way for back compatibility
                    if (this.debug) console.log(' - call (old)', item.handler)
                } else {
                    item.handler.call(this, edata) // new way
                    if (this.debug) console.log(' - call', item.handler)
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
                if (this.debug) console.log(' - call: on[Event] (old)', fun)
            } else {
                fun.call(this, edata) // new way
                if (this.debug) console.log(' - call: on[Event]', fun)
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
                if (this.debug) console.log(' - call: edata.object (old)', fun)
            } else {
                fun.call(this, edata) // new way
                if (this.debug) console.log(' - call: edata.object', fun)
            }
            if (edata.isStopped === true || edata.stop === true) return edata
        }
        // execute onComplete
        if (edata.phase === 'after') {
            if (typeof edata.onComplete === 'function') edata.onComplete.call(this, edata)
            for (let i = 0; i < edata.listeners.length; i++) {
                if (typeof edata.listeners[i] === 'function') {
                    edata.listeners[i].call(this, edata)
                    if (this.debug) console.log(' - call: done', fun)
                }
            }
            edata._resolve(edata)
            if (this.debug) {
                console.log(`w2base: trigger "${edata.type}:${edata.phase}"`, edata)
            }
            // clean up activeEvents
            let ind = this.activeEvents.indexOf(edata)
            if (ind !== -1) this.activeEvents.splice(ind, 1)
        }
        return edata
    }

    /**
     * Removes all classes that start with w2ui-* and sets box to null. It is needed so that control will
     * release the box to be used for other widgets
     */
    unmount() {
        let remove = []
        // find classes that start with "w2ui-*"
        if (this.box instanceof HTMLElement) {
            this.box.classList.forEach(cl => {
                if (cl.startsWith('w2ui-')) remove.push(cl)
            })
        }
        query(this.box).removeClass(remove)
        this.box = null
    }
}
export { w2event, w2base }