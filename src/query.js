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
            let arr = Array.from(selector ?? [])
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
        return (node instanceof Document || node instanceof DocumentFragment
            || node instanceof HTMLElement || node instanceof Text)
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
        // TODO: need good unit test coverage for this function
        if (typeof html == 'string') {
            this.each(node => {
                let clone = Query._fragment(html)
                nodes.push(...clone.childNodes)
                node[method](clone)
            })
        } else if (html instanceof Query) {
            let single = (len == 1 && html.length == 1)
            html.each(el => {
                this.each(node => {
                    // if insert before a single node, just move new one, else clone and move it
                    let clone = (single ? el : el.cloneNode(true))
                    node[method](clone)
                    nodes.push(clone)
                })
            })
            if (!single) html.remove()
        } else if (isEl) {
            this.each(node => {
                // if insert before a single node, just move new one, else clone and move it
                let clone = (len === 1 ? html : Query._fragment(html.outerHTML))
                nodes.push(...(len === 1 ? [html] : clone.childNodes))
                node[method](clone)
            })
            if (len > 1) html.remove()
        } else {
            throw new Error(`Incorrect argument for "${method}(html)". It expects one string argument.`)
        }
        if (method == 'replaceWith') {
            self = new Query(nodes, this.context, this) // must return a new collection
        }
        return self
    }

    _save(node, name, value) {
        node._mQuery = node._mQuery ?? {}
        if (Array.isArray(value)) {
            node._mQuery[name] = node._mQuery[name] ?? []
            node._mQuery[name].push(...value)
        } else if (value != null) {
            node._mQuery[name] = value
        } else {
            delete node._mQuery[name];
        }
    }

    get(index) {
        if (index < 0) index = this.length + index
        let node = this[index]
        if (node) {
            return node
        }
        if (index != null) {
            return null
        }
        return this.nodes
    }

    eq(index) {
        if (index < 0) index = this.length + index
        let nodes = [this[index]]
        if (nodes[0] == null) nodes = []
        return new Query(nodes, this.context, this) // must return a new collection
    }

    then(fun) {
        let ret = fun(this)
        return ret != null ? ret : this
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
                || (typeof selector == 'string' && node.matches && node.matches(selector))
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

    parent(selector) {
        return this.parents(selector, true)
    }

    parents(selector, firstOnly) {
        let nodes = []
        let add = (node) => {
            if (nodes.indexOf(node) == -1) {
                nodes.push(node)
            }
            if (!firstOnly && node.parentNode) {
                return add(node.parentNode)
            }
        }
        this.each(node => {
            if (node.parentNode) add(node.parentNode)
        })
        let col = new Query(nodes, this.context, this)
        return selector ? col.filter(selector) : col
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
        if (options?.delegate) {
            let fun = callback
            let delegate = options.delegate
            callback = (event) => {
                // event.target or any ancestors match delegate selector
                let parent = query(event.target).parents(delegate)
                if (parent.length > 0) { event.delegate = parent[0] } else { event.delegate = event.target }
                if (event.target.matches(delegate) || parent.length > 0) {
                    fun(event)
                }
            }
            delete options.delegate
        }
        this.each(node => {
            this._save(node, 'events', [{ event, scope, callback, options }])
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
            if (Array.isArray(node._mQuery?.events)) {
                for (let i = node._mQuery.events.length - 1; i >= 0; i--) {
                    let evt = node._mQuery.events[i]
                    if (scope == null || scope === '') {
                        // if no scope, has to be exact match
                        if (evt.event == event && evt.scope == scope && (evt.callback == callback || callback == null)) {
                            node.removeEventListener(event, evt.callback, evt.options)
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
                let data = Object.assign({}, this[0].dataset)
                Object.keys(data).forEach(key => {
                    if (data[key].startsWith('[') || data[key].startsWith('{')) {
                        try { data[key] = JSON.parse(data[key]) } catch(e) {}
                    }
                })
                return key ? data[key] : data
            } else {
                return undefined
            }
        } else {
            this.each(node => {
                if (value != null) {
                    node.dataset[key] = value instanceof Object ? JSON.stringify(value) : value
                } else {
                    delete node.dataset[key]
                }
            })
            return this
        }
    }

    removeData(key) {
        this.each(node => {
            delete node.dataset[key]
        })
        return this
    }

    show() {
        return this.toggle(true)
    }

    hide() {
        return this.toggle(false)
    }

    toggle(force) {
        return this.each(node => {
            let dsp = node.style.display
            if ((dsp == 'none' && force == null) || force === true) { // show
                node.style.display = node._mQuery?.prevDisplay ?? 'block'
                this._save(node, 'prevDisplay', null)
            } else { // hide
                if (dsp != 'none') this._save(node, 'prevDisplay', dsp)
                node.style.display = 'none'
            }
        })
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
        return this.prop('value', value) // must be prop
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
    // if a function, use as onload event
    if (typeof selector == 'function') {
        window.addEventListener('load', selector)
    } else {
        return new Query(selector, context)
    }
}
// str -> doc-fragment
query.html = (str) => { let frag = Query._fragment(str); return query(frag.children, frag)  }

export { query as $, query as default, query, Query }