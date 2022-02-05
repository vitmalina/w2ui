/**
 * Small library to replace basic functionality of jQuery
 * methods that start with "_" are internal
 *
 * TODO:
 *  - .data(name, 1) => el.dataset.name
 */

 class Query {
    constructor(selector, context, previous) {
        this.version = 0.4
        this.context = context ?? document
        this.previous = previous ?? null
        let nodes = []
        if (Array.isArray(selector)) {
            nodes = selector
        } else if (Query._isEl(selector)) {
            nodes = [selector]
        } else if (selector instanceof Query) {
            nodes = selector.nodes
        } else if (typeof selector == 'string') {
            if (typeof this.context.querySelector != 'function') {
                throw new Error('Invalid context')
            }
            nodes = Array.from(this.context.querySelectorAll(selector))
        } else {
            // if selector is itterable, then try to create nodes from it, also supports jQuery
            let arr = Array.from(selector)
            if (typeof selector == 'object' && Array.isArray(arr)) {
                nodes = arr
            } else {
                throw new Error(`Invalid selector "${selector}"`)
            }
        }
        this.nodes = nodes
        this.length = nodes.length
        // map nodes to object propoerties
        this.each((node, ind) => {
            this[ind] = node
        })
    }

    static _isEl(node) {
        return (node instanceof DocumentFragment || node instanceof HTMLElement || node instanceof Text)
    }

    static _fragment(html) {
        let tmpl = document.createElement('template')
        tmpl.innerHTML = html
        return tmpl.content
    }

    _insert(method, html) {
        let nodes = []
        let len  = this.length
        if (len < 1) return
        let isEl = Query._isEl(html)
        let self = this
        if (typeof html == 'string') {
            this.each(node => {
                let cln = Query._fragment(html)
                if (method == 'replaceWith') {
                    // replace nodes, but keep reference to them
                    nodes.push(...cln.childNodes)
                }
                node[method](cln) // inserts nodes or text
            })
            if (method == 'replaceWith') {
                self = new Query(nodes, this.context, this) // must return a new collection
            }
        } else if (isEl) {
            this.each(node => {
                let cln = Query._fragment(html.outerHTML)
                node[method](len === 1 ? html : cln)
                if (len > 1 && isEl) nodes.push(...cln.childNodes)
            })
            if (len > 1 && isEl) html.remove()
        } else {
            throw new Error(`Incorrect argument for "${method}(html)". It expects one string argument.`)
        }
        return self
    }

    get(index) {
        if (index < 0) index = this.length + index
        let node = this[index]
        if (node) {
            return node
        }
        return this.nodes
    }

    eq(index) {
        if (index < 0) index = this.length + index
        let nodes = [this[index]]
        if (nodes[0] == null) nodes = []
        return new Query(nodes, this.context, this) // must return a new collection
    }

    find(selector) {
        let nodes = []
        this.each(node => {
            let nn = Array.from(node.querySelectorAll(selector))
            if (nn.length > 0) {
                nodes.push(...nn)
            }
        })
        return new Query(nodes, this.context, this) // must return a new collection
    }

    filter(selector) {
        let nodes = []
        this.each(node => {
            if (node === selector
                || (typeof selector == 'string' && node.matches(selector))
                || (typeof selector == 'function' && selector(node))
            ) {
                nodes.push(node)
            }
        })
        return new Query(nodes, this.context, this) // must return a new collection
    }

    shadow(selector) {
        let nodes = []
        this.each(node => {
            // select shadow root if available
            if (node.shadowRoot) nodes.push(node.shadowRoot)
        })
        let col = new Query(nodes, this.context, this)
        return selector ? col.find(selector) : col
    }

    closest(selector) {
        let nodes = []
        this.each(node => {
            let nn = node.closest(selector)
            if (nn) {
                nodes.push(nn)
            }
        })
        return new Query(nodes, this.context, this) // must return a new collection
    }

    host(all) {
        let nodes = []
        // find shadow root or body
        let top = (node) => {
            if (node.parentNode) {
                return top(node.parentNode)
            } else {
                return node
            }
        }
        let fun = (node) => {
            let nn = top(node)
            nodes.push(nn.host ? nn.host : nn)
            if (nn.host && all) fun(nn.host)
        }
        this.each(node => {
            fun(node)
        })
        return new Query(nodes, this.context, this) // must return a new collection
    }

    each(func) {
        this.nodes.forEach((node, ind) => { func(node, ind, this) })
        return this
    }

    append(html) {
        return this._insert('append', html)
    }

    prepend(html) {
        return this._insert('prepend', html)
    }

    after(html) {
        return this._insert('after', html)
    }

    before(html) {
        return this._insert('before', html)
    }

    replace(html) {
        return this._insert('replaceWith', html)
    }

    remove() {
        // remove from dom, but keep in current query
        this.each(node => { node.remove() })
        return this
    }

    css(key, value) {
        let css = key
        let len = arguments.length
        if (len === 0 || (len ===1 && typeof key == 'string')) {
            if (this[0]) {
                // do not do computedStyleMap as it is not what on immediate element
                if (typeof key == 'string') {
                    return this[0].style[key]
                } else {
                    return Object.fromEntries(
                        this[0].style.cssText
                            .split(';')
                            .filter(a => !!a) // filter non-empty
                            .map(a => {
                                return a.split(':').map(a => a.trim()) // trim strings
                            })
                        )
                }
            } else {
                return undefined
            }
        } else {
            if (typeof key != 'object') {
                css = {}
                css[key] = value
            }
            this.each((el, ind) => {
                Object.keys(css).forEach(key => {
                    el.style[key] = css[key]
                })
            })
            return this
        }
    }

    addClass(classes) {
        this.toggleClass(classes, true)
        return this
    }

    removeClass(classes) {
        this.toggleClass(classes, false)
        return this
    }

    toggleClass(classes, force) {
        // split by comma or space
        if (typeof classes == 'string') classes = classes.split(/[ ,]+/)
        this.each(node => {
            let classes2 = classes
            // if not defined, remove all classes
            if (classes2 == null && force === false) classes2 = Array.from(node.classList)
            classes2.forEach(className => {
                if (className !== '') {
                    let act = 'toggle'
                    if (force != null) act = force ? 'add' : 'remove'
                    node.classList[act](className)
                }
            })
        })
        return this
    }

    hasClass(classes) {
        // split by comma or space
        if (typeof classes == 'string') classes = classes.split(/[ ,]+/)
        if (classes == null && this.length > 0) {
            return Array.from(this[0].classList)
        }
        let ret = false
        this.each(node => {
            ret = ret || classes.every(className => {
                return Array.from(node.classList).includes(className)
            })
        })
        return ret
    }

    on(eventScope, options, callback) {
        let [ event, scope ] = String(eventScope).toLowerCase().split('.')
        if (typeof options == 'function') {
            callback = options
            options = undefined
        }
        this.each(node => {
            node._mQuery = node._mQuery ?? {}
            node._mQuery.events = node._mQuery.events ?? []
            node._mQuery.events.push({ event, scope, callback, options })
            node.addEventListener(event, callback, options)
        })
        return this
    }

    off(eventScope, options, callback) {
        let [ event, scope ] = String(eventScope).toLowerCase().split('.')
        if (typeof options == 'function') {
            callback = options
            options = undefined
        }
        this.each(node => {
            if (node._mQuery && Array.isArray(node._mQuery.events)) {
                for (let i = node._mQuery.events.length - 1; i >= 0; i--) {
                    let evt = node._mQuery.events[i]
                    if (scope == null || scope === '') {
                        // if no scope, has to be exact match
                        if (evt.event == event && evt.scope == scope && evt.callback == callback) {
                            node.removeEventListener(event, callback, options)
                            node._mQuery.events.splice(i, 1)
                        }
                    } else {
                        if ((evt.event == event || event === '') && (evt.scope == scope || scope === '*')) {
                            node.removeEventListener(evt.event, evt.callback, evt.options)
                            node._mQuery.events.splice(i, 1)
                        }
                    }
                }
            }
        })
        return this
    }

    trigger(name, options) {
        let event,
            mevent = ['click', 'dblclick', 'mousedown', 'mouseup', 'mousemove'],
            kevent = ['keydown', 'keyup', 'keypress']
        if (name instanceof Event || name instanceof CustomEvent) {
            // MouseEvent and KeyboardEvent are instances of Event, no need to explicitly add
            event = name
        } else if (mevent.includes(name)) {
            event = new MouseEvent(name, options)
        } else if (kevent.includes(name)) {
            event = new KeyboardEvent(name, options)
        } else {
            event = new Event(name, options)
        }
        this.each(node => { node.dispatchEvent(event) })
        return this
    }

    attr(name, value) {
        if (value === undefined && typeof name == 'string') {
            return this[0] ? this[0].getAttribute(name) : undefined
        } else {
            let obj = {}
            if (typeof name == 'object') obj = name; else obj[name] = value
            this.each(node => {
                Object.entries(obj).forEach(([nm, val]) => { node.setAttribute(nm, val) })
            })
            return this
        }
    }

    removeAttr() {
        this.each(node => {
            Array.from(arguments).forEach(attr => {
                node.removeAttribute(attr)
            })
        })
        return this
    }

    prop(name, value) {
        if (value === undefined && typeof name == 'string') {
            return this[0] ? this[0][name] : undefined
        } else {
            let obj = {}
            if (typeof name == 'object') obj = name; else obj[name] = value
            this.each(node => {
                Object.entries(obj).forEach(([nm, val]) => { node[nm] = val })
            })
            return this
        }
    }

    removeProp() {
        this.each(node => {
            Array.from(arguments).forEach(prop => { delete node[prop] })
        })
        return this
    }

    data(key, value) {
        if (arguments.length < 2) {
            if (this[0]) {
                let data = this[0]._mQuery?.data ?? {}
                // also pick all atributes that start with data-*
                Array.from(this[0].attributes).forEach(attr => {
                    if (attr.name.substr(0, 5) == 'data-') {
                        let val = attr.value
                        let nm  = attr.name.substr(5)
                        // if it is JSON - parse it
                        if (['[', '{'].includes(String(val).substr(0, 1))) {
                            try { val = JSON.parse(val) } catch(e) { val = attr.value }
                        }
                        // attributes have lower priority than set with data()
                        if (data[nm] === undefined) data[nm] = val
                    }
                })
                return key ? data[key] : data
            } else {
                return undefined
            }
        } else {
            this.each(node => {
                node._mQuery = node._mQuery ?? {}
                node._mQuery.data = node._mQuery.data ?? {}
                if (value != null) {
                    node._mQuery.data[key] = value
                } else {
                    delete node._mQuery.data[key]
                }
            })
            return this
        }
    }

    removeData(key) {
        this.each(node => {
            node._mQuery = node._mQuery ?? {}
            if (arguments.length == 0) {
                node._mQuery.data = {}
            } else if (key != null && node._mQuery.data) {
                delete node._mQuery.data[key]
            } else {
                node._mQuery.data = {}
            }
        })
        return this
    }

    empty() {
        return this.html('')
    }

    html(html) {
        return this.prop('innerHTML', html)
    }

    text(text) {
        return this.prop('textContent', text)
    }

    val(value) {
        return this.attr('value', value)
    }

    show() {
        return this.css('display', 'inherit')
    }

    hide() {
        return this.css('display', 'none')
    }

    toggle() {
        let dsp = this.css('display')
        return this.css('display', dsp == 'none' ? 'inherit' : 'none')
    }

    change() {
        return this.trigger('change')
    }

    click() {
        return this.trigger('click')
    }
}
// create a new object each time
let query = function (selector, context) {
    return new Query(selector, context)
}
// allows to create document fragments
query.html = (str) => { return Query._fragment(str) }
let $ = query

export default $
export { $, query, Query }