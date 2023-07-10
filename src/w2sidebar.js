/**
 * Part of w2ui 2.0 library
 *  - Dependencies: mQuery, w2utils, w2base, w2tooltip, w2menu
 *
 * == TODO ==
 *  - dbl click should be like it is in grid (with timer not HTML dbl click event)
 *  - node.style is misleading - should be there to apply color for example
 *  - node.plus - is not working
 *
 * == 2.0 changes
 *  - remove jQuery dependency
 *  - deprecarted obj.img, node.img
 *  - CSP - fixed inline events
 *  - observeResize for the box
 *  - search(..., compare) - comparison function
 */

import { w2base } from './w2base.js'
import { w2ui, w2utils } from './w2utils.js'
import { query } from './query.js'
import { w2tooltip, w2menu } from './w2tooltip.js'

class w2sidebar extends w2base {
    constructor(options) {
        super(options.name)
        this.name          = null
        this.box           = null
        this.sidebar       = null
        this.parent        = null
        this.nodes         = [] // Sidebar child nodes
        this.menu          = []
        this.routeData     = {} // data for dynamic routes
        this.selected      = null // current selected node (readonly)
        this.icon          = null
        this.style         = ''
        this.topHTML       = ''
        this.bottomHTML    = ''
        this.flatButton    = false
        this.keyboard      = true
        this.flat          = false
        this.hasFocus      = false
        this.levelPadding  = 12
        this.toggleAlign   = 'right' // can be left or right
        this.skipRefresh   = false
        this.tabIndex      = null // will only be set if > 0 and not null
        this.handle        = { width: 0, style: '', text: '', tooltip: '' },
        this.badge         = null
        this.onClick       = null // Fire when user click on Node Text
        this.onDblClick    = null // Fire when user dbl clicks
        this.onMouseEnter  = null // mouse enter/leave over an item
        this.onMouseLeave  = null
        this.onContextMenu = null
        this.onMenuClick   = null // when context menu item selected
        this.onExpand      = null // Fire when node expands
        this.onCollapse    = null // Fire when node collapses
        this.onKeydown     = null
        this.onRender      = null
        this.onRefresh     = null
        this.onResize      = null
        this.onDestroy     = null
        this.onFocus       = null
        this.onBlur        = null
        this.onFlat        = null
        this.node_template = {
            id: null,
            text: '',
            order: null,
            count: null,
            icon: null,
            nodes: [],
            style: '', // additional style for subitems
            route: null,
            selected: false,
            expanded: false,
            hidden: false,
            disabled: false,
            group: false, // if true, it will build as a group
            groupShowHide: true,
            collapsible: false,
            plus: false, // if true, plus will be shown even if there is no sub nodes
            childOffset: 0,
            // events
            onClick: null,
            onDblClick: null,
            onContextMenu: null,
            onExpand: null,
            onCollapse: null,
            // internal
            parent: null, // node object
            sidebar: null
        }
        this.last = {
            badge: {}
        }
        let nodes = options.nodes
        delete options.nodes
        // mix in options
        Object.assign(this, options)
        // add item via method to makes sure item_template is applied
        if (Array.isArray(nodes)) this.add(nodes)
        // need to reassign back to keep it in config
        options.nodes = nodes

        // render if box specified
        if (typeof this.box == 'string') this.box = query(this.box).get(0)
        if (this.box) this.render(this.box)
    }

    add(parent, nodes) {
        if (arguments.length == 1) {
            // need to be in reverse order
            nodes  = arguments[0]
            parent = this
        }
        if (typeof parent == 'string') parent = this.get(parent)
        if (parent == null || parent == '') parent = this
        return this.insert(parent, null, nodes)
    }

    insert(parent, before, nodes) {
        let txt, ind, tmp, node, nd
        if (arguments.length == 2 && typeof parent == 'string') {
            // need to be in reverse order
            nodes  = arguments[1]
            before = arguments[0]
            if (before != null) {
                ind = this.get(before)
                if (ind == null) {
                    if (!Array.isArray(nodes)) nodes = [nodes]
                    if (nodes[0].caption != null && nodes[0].text == null) {
                        console.log('NOTICE: sidebar node.caption property is deprecated, please use node.text. Node -> ', nodes[0])
                        nodes[0].text = nodes[0].caption
                    }
                    txt = nodes[0].text
                    console.log('ERROR: Cannot insert node "'+ txt +'" because cannot find node "'+ before +'" to insert before.')
                    return null
                }
                parent = this.get(before).parent
            } else {
                parent = this
            }
        }
        if (typeof parent == 'string') parent = this.get(parent)
        if (parent == null || parent == '') parent = this
        if (!Array.isArray(nodes)) nodes = [nodes]
        for (let o = 0; o < nodes.length; o++) {
            node = nodes[o]
            if (node.caption != null && node.text == null) {
                console.log('NOTICE: sidebar node.caption property is deprecated, please use node.text')
                node.text = node.caption
            }
            if (typeof node.id == null) {
                txt = node.text
                console.log('ERROR: Cannot insert node "'+ txt +'" because it has no id.')
                continue
            }
            if (this.get(this, node.id) != null) {
                console.log('ERROR: Cannot insert node with id='+ node.id +' (text: '+ node.text + ') because another node with the same id already exists.')
                continue
            }
            tmp         = Object.assign({}, this.node_template, node)
            tmp.sidebar = this
            tmp.parent  = parent
            nd          = tmp.nodes || []
            tmp.nodes   = [] // very important to re-init empty nodes array
            if (before == null) { // append to the end
                parent.nodes.push(tmp)
            } else {
                ind = this.get(parent, before, true)
                if (ind == null) {
                    console.log('ERROR: Cannot insert node "'+ node.text +'" because cannot find node "'+ before +'" to insert before.')
                    return null
                }
                parent.nodes.splice(ind, 0, tmp)
            }
            if (nd.length > 0) {
                this.insert(tmp, null, nd)
            }
        }
        if (!this.skipRefresh) this.refresh(parent.id)
        return tmp
    }

    remove() { // multiple arguments
        let effected = 0
        let node
        Array.from(arguments).forEach(arg => {
            node = this.get(arg)
            if (node == null) return
            if (this.selected != null && this.selected === node.id) {
                this.selected = null
            }
            let ind = this.get(node.parent, arg, true)
            if (ind == null) return
            if (node.parent.nodes[ind].selected) node.sidebar.unselect(node.id)
            node.parent.nodes.splice(ind, 1)
            node.parent.collapsible = node.parent.nodes.length > 0
            effected++
        })
        if (!this.skipRefresh) {
            if (effected > 0 && arguments.length == 1) this.refresh(node.parent.id); else this.refresh()
        }
        return effected
    }

    set(parent, id, node) {
        if (arguments.length == 2) {
            // need to be in reverse order
            node   = id
            id     = parent
            parent = this
        }
        // searches all nested nodes
        if (typeof parent == 'string') parent = this.get(parent)
        if (parent.nodes == null) return null
        for (let i = 0; i < parent.nodes.length; i++) {
            if (parent.nodes[i].id === id) {
                // see if quick update is possible
                let res = this.update(id, node)
                if (Object.keys(res).length != 0) {
                    // make sure nodes inserted correctly
                    let nodes = node.nodes
                    w2utils.extend(parent.nodes[i], node, (nodes != null ? { nodes: [] } : {}))
                    if (nodes != null) {
                        this.add(parent.nodes[i], nodes)
                    }
                    if (!this.skipRefresh) this.refresh(id)
                }
                return true
            } else {
                let rv = this.set(parent.nodes[i], id, node)
                if (rv) return true
            }
        }
        return false
    }

    get(parent, id, returnIndex) { // can be just called get(id) or get(id, true)
        if (arguments.length === 0) {
            let all = []
            let tmp = this.find({})
            for (let t = 0; t < tmp.length; t++) {
                if (tmp[t].id != null) all.push(tmp[t].id)
            }
            return all
        } else {
            if (arguments.length == 1 || (arguments.length == 2 && id === true) ) {
                // need to be in reverse order
                returnIndex = id
                id          = parent
                parent      = this
            }
            // searches all nested nodes
            if (typeof parent == 'string') parent = this.get(parent)
            if (parent.nodes == null) return null
            for (let i = 0; i < parent.nodes.length; i++) {
                if (parent.nodes[i].id == id) {
                    if (returnIndex === true) return i; else return parent.nodes[i]
                } else {
                    let rv = this.get(parent.nodes[i], id, returnIndex)
                    if (rv || rv === 0) return rv
                }
            }
            return null
        }
    }

    setCount(id, count, options = {}) {
        let btn = query(this.box).find(`#node_${w2utils.escapeId(id)} .w2ui-node-badge`)
        if (btn.length > 0) {
            btn.removeClass()
                .addClass(`w2ui-node-badge ${options.className ?? 'w2ui-node-count'}`)
                .text(count)
                .get(0).style.cssText = options.style || ''
            this.last.badge[id] = {
                className: options.className ?? '',
                style: options.style ?? ''
            }
            let item = this.get(id)
            item.count = count
        } else {
            this.set(id, { count })
            this.setCount(...arguments) // to update styles
        }
    }

    find(parent, params, results) { // can be just called find({ selected: true })
        // TODO: rewrite with this.each()
        if (arguments.length == 1) {
            // need to be in reverse order
            params = parent
            parent = this
        }
        if (!results) results = []
        // searches all nested nodes
        if (typeof parent == 'string') parent = this.get(parent)
        if (parent.nodes == null) return results
        for (let i = 0; i < parent.nodes.length; i++) {
            let match = true
            for (let prop in params) { // params is an object
                if (parent.nodes[i][prop] != params[prop]) match = false
            }
            if (match) results.push(parent.nodes[i])
            if (parent.nodes[i].nodes.length > 0) results = this.find(parent.nodes[i], params, results)
        }
        return results
    }

    sort(options, nodes) {
        // default options
        if (!options || typeof options != 'object') options = {}
        if (options.foldersFirst == null) options.foldersFirst = true
        if (options.caseSensitive == null) options.caseSensitive = false
        if (options.reverse == null) options.reverse = false

        if (nodes == null) {
            nodes = this.nodes
        }
        nodes.sort((a, b) => {
            // folders first
            let isAfolder = (a.nodes && a.nodes.length > 0)
            let isBfolder = (b.nodes && b.nodes.length > 0)
            // both folder or both not folders
            if (options.foldersFirst === false || (!isAfolder && !isBfolder) || (isAfolder && isBfolder)) {
                let aText = a.text
                let bText = b.text
                if (!options.caseSensitive) {
                    aText = aText.toLowerCase()
                    bText = bText.toLowerCase()
                }
                if (a.order != null) aText = a.order
                if (b.order != null) bText = b.order
                let cmp = w2utils.naturalCompare(aText, bText)
                return (cmp === 1 || cmp === -1) & options.reverse ? -cmp : cmp
            }
            if (isAfolder && !isBfolder) {
                return !options.reverse ? -1 : 1
            }
            if (!isAfolder && isBfolder) {
                return !options.reverse ? 1 : -1
            }
        })
        nodes.forEach(node => {
            if (node.nodes && node.nodes.length > 0) {
                this.sort(options, node.nodes)
            }
        })
    }

    each(fn, nodes) {
        if (nodes == null) nodes = this.nodes
        nodes.forEach((node) => {
            fn.call(this, node)
            if (node.nodes && node.nodes.length > 0) {
                this.each(fn, node.nodes)
            }
        })
    }

    search(str, compare = null) {
        let count = 0
        let str2  = str.toLowerCase()
        this.each((node) => {
            let match = false
            if (typeof compare == 'function') {
                match = compare(str, node)
            } else {
                match = !(node.text.toLowerCase().indexOf(str2) === -1)
            }
            if (match) {
                count++
                showParents(node)
                node.hidden = false
            } else {
                node.hidden = true
            }
        })
        this.refresh()
        return count

        function showParents(node) {
            if (node.parent) {
                node.parent.hidden = false
                showParents(node.parent)
            }
        }
    }

    show() { // multiple arguments
        let effected = []
        Array.from(arguments).forEach(it => {
            let node = this.get(it)
            if (node == null || node.hidden === false) return
            node.hidden = false
            effected.push(node.id)
        })
        if (effected.length > 0) {
            if (arguments.length == 1) this.refresh(arguments[0]); else this.refresh()
        }
        return effected
    }

    hide() { // multiple arguments
        let effected = []
        Array.from(arguments).forEach(it => {
            let node = this.get(it)
            if (node == null || node.hidden === true) return
            node.hidden = true
            effected.push(node.id)
        })
        if (effected.length > 0) {
            if (arguments.length == 1) this.refresh(arguments[0]); else this.refresh()
        }
        return effected
    }

    enable() { // multiple arguments
        let effected = []
        Array.from(arguments).forEach(it => {
            let node = this.get(it)
            if (node == null || node.disabled === false) return
            node.disabled = false
            effected.push(node.id)
        })
        if (effected.length > 0) {
            if (arguments.length == 1) this.refresh(arguments[0]); else this.refresh()
        }
        return effected
    }

    disable() { // multiple arguments
        let effected = []
        Array.from(arguments).forEach(it => {
            let node = this.get(it)
            if (node == null || node.disabled === true) return
            node.disabled = true
            if (node.selected) this.unselect(node.id)
            effected.push(node.id)
        })
        if (effected.length > 0) {
            if (arguments.length == 1) this.refresh(arguments[0]); else this.refresh()
        }
        return effected
    }

    select(id) {
        let new_node = this.get(id)
        if (!new_node) return false
        if (this.selected == id && new_node.selected) return false
        this.unselect(this.selected)
        let $el = query(this.box).find('#node_'+ w2utils.escapeId(id))
        $el.addClass('w2ui-selected')
            .find('.w2ui-icon')
            .addClass('w2ui-icon-selected')
        if ($el.length > 0) {
            if (!this.inView(id)) this.scrollIntoView(id)
        }
        new_node.selected = true
        this.selected = id
        return true
    }

    unselect(id) {
        // if no arguments provided, unselect selected node
        if (arguments.length === 0) {
            id = this.selected
        }
        let current = this.get(id)
        if (!current) return false
        current.selected = false
        query(this.box).find('#node_'+ w2utils.escapeId(id))
            .removeClass('w2ui-selected')
            .find('.w2ui-icon').removeClass('w2ui-icon-selected')
        if (this.selected == id) this.selected = null
        return true
    }

    toggle(id) {
        let nd = this.get(id)
        if (nd == null) return false
        if (nd.plus) {
            this.set(id, { plus: false })
            this.expand(id)
            this.refresh(id)
            return
        }
        if (nd.nodes.length === 0) return false
        if (!nd.collapsible) return false
        if (this.get(id).expanded) return this.collapse(id); else return this.expand(id)
    }

    collapse(id) {
        let nd = this.get(id)
        if (nd == null) return false
        // event before
        let edata = this.trigger('collapse', { target: id, object: nd })
        if (edata.isCancelled === true) return
        // default action
        query(this.box).find('#node_'+ w2utils.escapeId(id) +'_sub').hide()
        query(this.box).find('#node_'+ w2utils.escapeId(id) +' .w2ui-expanded')
            .removeClass('w2ui-expanded')
            .addClass('w2ui-collapsed')
        nd.expanded = false
        // event after
        edata.finish()
        this.refresh(id)
        return true
    }

    expand(id) {
        let nd = this.get(id)
        // event before
        let edata = this.trigger('expand', { target: id, object: nd })
        if (edata.isCancelled === true) return
        // default action
        query(this.box).find('#node_'+ w2utils.escapeId(id) +'_sub')
            .show()
        query(this.box).find('#node_'+ w2utils.escapeId(id) +' .w2ui-collapsed')
            .removeClass('w2ui-collapsed')
            .addClass('w2ui-expanded')
        nd.expanded = true
        // event after
        edata.finish()
        this.refresh(id)
        return true
    }

    collapseAll(parent) {
        if (parent == null) parent = this
        if (typeof parent == 'string') parent = this.get(parent)
        if (parent.nodes == null) return false
        for (let i = 0; i < parent.nodes.length; i++) {
            if (parent.nodes[i].expanded === true) parent.nodes[i].expanded = false
            if (parent.nodes[i].nodes && parent.nodes[i].nodes.length > 0) this.collapseAll(parent.nodes[i])
        }
        this.refresh(parent.id)
        return true
    }

    expandAll(parent) {
        if (parent == null) parent = this
        if (typeof parent == 'string') parent = this.get(parent)
        if (parent.nodes == null) return false
        for (let i = 0; i < parent.nodes.length; i++) {
            if (parent.nodes[i].expanded === false) parent.nodes[i].expanded = true
            if (parent.nodes[i].nodes && parent.nodes[i].nodes.length > 0) this.expandAll(parent.nodes[i])
        }
        this.refresh(parent.id)
    }

    expandParents(id) {
        let node = this.get(id)
        if (node == null) return false
        if (node.parent) {
            if (!node.parent.expanded) {
                node.parent.expanded = true
                this.refresh(node.parent.id)
            }
            this.expandParents(node.parent.id)
        }
        return true
    }

    click(id, event) {
        let obj = this
        let nd  = this.get(id)
        if (nd == null) return
        if (nd.disabled || nd.group) return // should click event if already selected
        // unselect all previously
        query(obj.box).find('.w2ui-node.w2ui-selected').each(el => {
            let oldID   = query(el).attr('id').replace('node_', '')
            let oldNode = obj.get(oldID)
            if (oldNode != null) oldNode.selected = false
            query(el).removeClass('w2ui-selected').find('.w2ui-icon').removeClass('w2ui-icon-selected')
        })
        // select new one
        let newNode = query(obj.box).find('#node_'+ w2utils.escapeId(id))
        let oldNode = query(obj.box).find('#node_'+ w2utils.escapeId(obj.selected))
        newNode.addClass('w2ui-selected').find('.w2ui-icon').addClass('w2ui-icon-selected')
        // need timeout to allow rendering
        setTimeout(() => {
            // event before
            let edata = obj.trigger('click', { target: id, originalEvent: event, node: nd, object: nd })
            if (edata.isCancelled === true) {
                // restore selection
                newNode.removeClass('w2ui-selected').find('.w2ui-icon').removeClass('w2ui-icon-selected')
                oldNode.addClass('w2ui-selected').find('.w2ui-icon').addClass('w2ui-icon-selected')
                return
            }
            // default action
            if (oldNode != null) oldNode.selected = false
            obj.get(id).selected = true
            obj.selected = id
            // route processing
            if (typeof nd.route == 'string') {
                let route = nd.route !== '' ? String('/'+ nd.route).replace(/\/{2,}/g, '/') : ''
                let info  = w2utils.parseRoute(route)
                if (info.keys.length > 0) {
                    for (let k = 0; k < info.keys.length; k++) {
                        if (obj.routeData[info.keys[k].name] == null) continue
                        route = route.replace((new RegExp(':'+ info.keys[k].name, 'g')), obj.routeData[info.keys[k].name])
                    }
                }
                setTimeout(() => { window.location.hash = route }, 1)
            }
            // event after
            edata.finish()
        }, 1)
    }

    focus(event) {
        let self = this
        // event before
        let edata = this.trigger('focus', { target: this.name, originalEvent: event })
        if (edata.isCancelled === true) return false
        // default behaviour
        this.hasFocus = true
        query(this.box).find('.w2ui-sidebar-body').addClass('w2ui-focus')
        setTimeout(() => {
            let input = query(self.box).find('#sidebar_'+ self.name + '_focus').get(0)
            if (document.activeElement != input) input.focus()
        }, 10)
        // event after
        edata.finish()
    }

    blur(event) {
        // event before
        let edata = this.trigger('blur', { target: this.name, originalEvent: event })
        if (edata.isCancelled === true) return false
        // default behaviour
        this.hasFocus = false
        query(this.box).find('.w2ui-sidebar-body').removeClass('w2ui-focus')
        // event after
        edata.finish()
    }

    keydown(event) {
        let obj = this
        let nd  = obj.get(obj.selected)
        if (obj.keyboard !== true) return
        if (!nd) nd = obj.nodes[0]
        // trigger event
        let edata = obj.trigger('keydown', { target: obj.name, originalEvent: event })
        if (edata.isCancelled === true) return
        // default behaviour
        if (event.keyCode == 13 || event.keyCode == 32) { // enter or space
            if (nd.nodes.length > 0) obj.toggle(obj.selected)
        }
        if (event.keyCode == 37) { // left
            if (nd.nodes.length > 0 && nd.expanded) {
                obj.collapse(obj.selected)
            } else {
                selectNode(nd.parent)
                if (!nd.parent.group) obj.collapse(nd.parent.id)
            }
        }
        if (event.keyCode == 39) { // right
            if ((nd.nodes.length > 0 || nd.plus) && !nd.expanded) obj.expand(obj.selected)
        }
        if (event.keyCode == 38) { // up
            if (obj.get(obj.selected) == null) {
                selectNode(this.nodes[0] || null)
            } else {
                selectNode(neighbor(nd, prev))
            }
        }
        if (event.keyCode == 40) { // down
            if (obj.get(obj.selected) == null) {
                selectNode(this.nodes[0] || null)
            } else {
                selectNode(neighbor(nd, next))
            }
        }
        // cancel event if needed
        if ([13, 32, 37, 38, 39, 40].includes(event.keyCode)) {
            if (event.preventDefault) event.preventDefault()
            if (event.stopPropagation) event.stopPropagation()
        }
        // event after
        edata.finish()

        function selectNode(node, event) {
            if (node != null && !node.hidden && !node.disabled && !node.group) {
                obj.click(node.id, event)
                if (!obj.inView(node.id)) obj.scrollIntoView(node.id)
            }
        }

        function neighbor(node, neighborFunc) {
            node = neighborFunc(node)
            while (node != null && (node.hidden || node.disabled)) {
                if (node.group) break; else node = neighborFunc(node)
            }
            return node
        }

        function next(node, noSubs) {
            if (node == null) return null
            let parent   = node.parent
            let ind      = obj.get(node.id, true)
            let nextNode = null
            // jump inside
            if (node.expanded && node.nodes.length > 0 && noSubs !== true) {
                let t = node.nodes[0]
                if (t.hidden || t.disabled || t.group) nextNode = next(t); else nextNode = t
            } else {
                if (parent && ind + 1 < parent.nodes.length) {
                    nextNode = parent.nodes[ind + 1]
                } else {
                    nextNode = next(parent, true) // jump to the parent
                }
            }
            if (nextNode != null && (nextNode.hidden || nextNode.disabled || nextNode.group)) nextNode = next(nextNode)
            return nextNode
        }

        function prev(node) {
            if (node == null) return null
            let parent   = node.parent
            let ind      = obj.get(node.id, true)
            let prevNode = (ind > 0) ? lastChild(parent.nodes[ind - 1]) : parent
            if (prevNode != null && (prevNode.hidden || prevNode.disabled || prevNode.group)) prevNode = prev(prevNode)
            return prevNode
        }

        function lastChild(node) {
            if (node.expanded && node.nodes.length > 0) {
                let t = node.nodes[node.nodes.length - 1]
                if (t.hidden || t.disabled || t.group) return prev(t); else return lastChild(t)
            }
            return node
        }
    }

    inView(id) {
        let item = query(this.box).find('#node_'+ w2utils.escapeId(id)).get(0)
        if (!item) {
            return false
        }
        let div = query(this.box).find('.w2ui-sidebar-body').get(0)
        if (item.offsetTop < div.scrollTop || (item.offsetTop + item.clientHeight > div.clientHeight + div.scrollTop)) {
            return false
        }
        return true
    }

    scrollIntoView(id, instant) {
        return new Promise((resolve, reject) => {
            if (id == null) id = this.selected
            let nd = this.get(id)
            if (nd == null) return
            let item = query(this.box).find('#node_'+ w2utils.escapeId(id)).get(0)
            item.scrollIntoView({ block: 'center', inline: 'center', behavior: instant ? 'atuo' : 'smooth' })
            setTimeout(() => { this.resize(); resolve() }, instant ? 0 : 500)
        })
    }

    dblClick(id, event) {
        let nd = this.get(id)
        // event before
        let edata = this.trigger('dblClick', { target: id, originalEvent: event, object: nd })
        if (edata.isCancelled === true) return
        // default action
        this.toggle(id)
        // event after
        edata.finish()
    }

    contextMenu(id, event) {
        let nd = this.get(id)
        if (id != this.selected) this.click(id)
        // event before
        let edata = this.trigger('contextMenu', { target: id, originalEvent: event, object: nd, allowOnDisabled: false })
        if (edata.isCancelled === true) return
        // default action
        if (nd.disabled && !edata.allowOnDisabled) return
        if (this.menu.length > 0) {
            w2menu.show({
                name: this.name + '_menu',
                anchor: document.body,
                items: this.menu,
                originalEvent: event
            })
            .select(evt => {
                this.menuClick(id, parseInt(evt.detail.index), event)
            })
        }
        // prevent default context menu
        if (event.preventDefault) event.preventDefault()
        // event after
        edata.finish()
    }

    menuClick(itemId, index, event) {
        // event before
        let edata = this.trigger('menuClick', { target: itemId, originalEvent: event, menuIndex: index, menuItem: this.menu[index] })
        if (edata.isCancelled === true) return
        // default action
        // -- empty
        // event after
        edata.finish()
    }

    goFlat() {
        // event before
        let edata = this.trigger('flat', { goFlat: !this.flat })
        if (edata.isCancelled === true) return
        // default action
        this.flat = !this.flat
        this.refresh()
        // event after
        edata.finish()
    }

    render(box) {
        let time = Date.now()
        let obj  = this
        if (typeof box == 'string') box = query(box).get(0)
        // event before
        let edata = this.trigger('render', { target: this.name, box: box ?? this.box })
        if (edata.isCancelled === true) return
        // default action
        if (box != null) {
            // clean previous box
            if (query(this.box).find('.w2ui-sidebar-body').length > 0) {
                query(this.box)
                    .removeAttr('name')
                    .removeClass('w2ui-reset w2ui-sidebar')
                    .html('')
            }
            this.box = box
        }
        if (!this.box) return
        query(this.box)
            .attr('name', this.name)
            .addClass('w2ui-reset w2ui-sidebar')
            .html(`<div>
                <div class="w2ui-sidebar-top"></div>
                <input id="sidebar_${this.name}_focus" ${(this.tabIndex ? 'tabindex="' + this.tabIndex + '"' : '')}
                    style="position: absolute; top: 0; right: 0; width: 1px; z-index: -1; opacity: 0"
                    ${(w2utils.isIOS ? 'readonly' : '')}/>
                <div class="w2ui-sidebar-body"></div>
                <div class="w2ui-sidebar-bottom"></div>
            </div>`)
        let rect = query(this.box).get(0).getBoundingClientRect()
        query(this.box).find(':scope > div').css({
            width  : rect.width + 'px',
            height : rect.height + 'px'
        })
        query(this.box).get(0).style.cssText += this.style
        // focus
        let kbd_timer
        query(this.box).find('#sidebar_'+ this.name + '_focus')
            .on('focus', function(event) {
                clearTimeout(kbd_timer)
                if (!obj.hasFocus) obj.focus(event)
            })
            .on('blur', function(event) {
                kbd_timer = setTimeout(() => {
                    if (obj.hasFocus) { obj.blur(event) }
                }, 100)
            })
            .on('keydown', function(event) {
                if (event.keyCode != 9) { // not tab
                    w2ui[obj.name].keydown.call(w2ui[obj.name], event)
                }
            })
        query(this.box).off('mousedown')
            .on('mousedown', function(event) {
                // set focus to sidebar
                setTimeout(() => {
                    // if input then do not focus
                    if (['INPUT', 'TEXTAREA', 'SELECT'].indexOf(event.target.tagName.toUpperCase()) == -1) {
                        let $input = query(obj.box).find('#sidebar_'+ obj.name + '_focus')
                        if (document.activeElement != $input.get(0) && $input.length > 0) {
                            $input.get(0).focus()
                        }
                    }
                }, 1)
            })
        // observe div resize
        this.last.observeResize = new ResizeObserver(() => { this.resize() })
        this.last.observeResize.observe(this.box)
        // event after
        edata.finish()
        // ---
        this.refresh()
        return Date.now() - time
    }

    update(id, options = {}) {
        // quick function to refresh just this item (not sub nodes)
        //  - icon, class, style, text, count
        let nd = this.get(id)
        let level
        if (nd) {
            let $el = query(this.box).find('#node_'+ w2utils.escapeId(nd.id))
            if (nd.group) {
                if (options.text) {
                    nd.text = options.text
                    $el.find('.w2ui-group-text').replace(typeof nd.text == 'function'
                        ? nd.text.call(this, nd)
                        : '<span class="w2ui-group-text">'+ nd.text +'</span>')
                    delete options.text
                }
                if (options.class) {
                    nd.class = options.class
                    level = $el.data('level')
                    $el.get(0).className = 'w2ui-node-group w2ui-level-'+ level +(nd.class ? ' ' + nd.class : '')
                    delete options.class
                }
                if (options.style) {
                    nd.style = options.style
                    $el.get(0).nextElementSibling.style = nd.style +';'+ (!nd.hidden && nd.expanded ? '' : 'display: none;')
                    delete options.style
                }
            } else {
                if (options.icon) {
                    let $icon = $el.find('.w2ui-node-image > span')
                    if ($icon.length > 0) {
                        nd.icon = options.icon
                        $icon[0].className = (typeof nd.icon == 'function' ? nd.icon.call(this, nd) : nd.icon)
                        delete options.icon
                    }
                }
                if (options.count) {
                    nd.count = options.count
                    // update counts
                    let txt = nd.count ?? this.badge.text
                    let style = this.badge.style
                    let last = this.last.badge[nd.id]
                    if (typeof txt == 'function') txt = txt.call(this, node, level)
                    $el.find('.w2ui-node-badge')
                        .html(txt)
                        .attr('style', `${style}; ${last?.style ?? ''}`)
                    if ($el.find('.w2ui-node-badge').length > 0) delete options.count
                }
                if (options.class && $el.length > 0) {
                    nd.class = options.class
                    level = $el.data('level')
                    $el[0].className = 'w2ui-node w2ui-level-'+ level + (nd.selected ? ' w2ui-selected' : '') + (nd.disabled ? ' w2ui-disabled' : '') + (nd.class ? ' ' + nd.class : '')
                    delete options.class
                }
                if (options.text) {
                    nd.text = options.text
                    $el.find('.w2ui-node-text').html(typeof nd.text == 'function' ? nd.text.call(this, nd) : nd.text)
                    delete options.text
                }
                if (options.style && $el.length > 0) {
                    let $txt = $el.find('.w2ui-node-text')
                    nd.style = options.style
                    $txt[0].style = nd.style
                    delete options.style
                }
            }
        }
        // return what was not set
        return options
    }

    refresh(id, noBinding) {
        if (this.box == null) return
        let time = Date.now()
        let self = this
        // event before
        let edata = this.trigger('refresh', {
            target: (id != null ? id : this.name),
            nodeId: (id != null ? id : null),
            fullRefresh: (id != null ? false : true)
        })
        if (edata.isCancelled === true) return
        // adjust top and bottom
        let flatHTML = ''
        if (this.flatButton == true) {
            flatHTML = `<div class="w2ui-flat w2ui-flat-${(this.flat ? 'right' : 'left')}"></div>`
        }
        if (id == null && (this.topHTML !== '' || flatHTML !== '')) {
            query(this.box).find('.w2ui-sidebar-top').html(this.topHTML + flatHTML)
            query(this.box).find('.w2ui-sidebar-body')
                .css('top', query(this.box).find('.w2ui-sidebar-top').get(0)?.clientHeight + 'px')
            query(this.box).find('.w2ui-flat')
                .off('click')
                .on('click', event => { this.goFlat() })
        }
        if (id != null && this.bottomHTML !== '') {
            query(this.box).find('.w2ui-sidebar-bottom').html(this.bottomHTML)
            query(this.box).find('.w2ui-sidebar-body')
                .css('bottom', query(this.box).find('.w2ui-sidebar-bottom').get(0)?.clientHeight + 'px')
        }
        // default action
        query(this.box).find(':scope > div').removeClass('w2ui-sidebar-flat').addClass(this.flat ? 'w2ui-sidebar-flat' : '').css({
            width : query(this.box).get(0)?.clientWidth + 'px',
            height: query(this.box).get(0)?.clientHeight + 'px'
        })
        // if no parent - reset nodes
        if (this.nodes.length > 0 && this.nodes[0].parent == null) {
            let tmp    = this.nodes
            this.nodes = []
            this.add(this, tmp)
        }
        let obj = this
        let node
        let nodeSubId
        if (id == null) {
            node = this
            nodeSubId = '.w2ui-sidebar-body'
        } else {
            node = this.get(id)
            if (node == null) return
            nodeSubId = '#node_'+ w2utils.escapeId(node.id) + '_sub'
        }
        let nodeId = '#node_'+ w2utils.escapeId(node.id)
        let nodeHTML
        if (node !== this) {
            nodeHTML = getNodeHTML(node)
            query(this.box).find(nodeId).before('<div id="sidebar_'+ this.name + '_tmp"></div>')
            query(this.box).find(nodeId).remove()
            query(this.box).find(nodeSubId).remove()
            query(this.box).find('#sidebar_'+ this.name + '_tmp').before(nodeHTML)
            query(this.box).find('#sidebar_'+ this.name + '_tmp').remove()
        }
        // remember scroll position
        let div = query(this.box).find(':scope > div').get(0)
        let scroll = {
            top: div?.scrollTop,
            left: div?.scrollLeft
        }
        // refresh sub nodes
        query(this.box).find(nodeSubId).html('')
        for (let i = 0; i < node.nodes.length; i++) {
            let subNode = node.nodes[i]
            nodeHTML = getNodeHTML(subNode)
            query(this.box).find(nodeSubId).append(nodeHTML)
            if (subNode.nodes.length !== 0) {
                this.refresh(subNode.id, true)
            } else {
                // trigger event
                let edata2 = this.trigger('refresh', { target: subNode.id })
                if (edata2.isCancelled === true) return
                // event after
                edata2.finish()
            }
        }
        // reset scroll
        if (div) {
            div.scrollTop = scroll.top
            div.scrollLeft = scroll.left
        }
        // bind events
        if (!noBinding) {
            let els = query(this.box).find(`${nodeId}, ${nodeId} .w2ui-eaction, ${nodeSubId} .w2ui-eaction`)
            w2utils.bindEvents(els, this)
        }
        // event after
        edata.finish()
        return Date.now() - time

        function getNodeHTML(nd) {
            let html = ''
            let icon = nd.icon
            if (icon == null) icon = obj.icon
            // -- find out level
            let tmp   = nd.parent
            let level = 0
            while (tmp && tmp.parent != null) {
                // if (tmp.group) level--;
                tmp = tmp.parent
                level++
            }
            if (nd.caption != null && nd.text == null) nd.text = nd.caption
            if (nd.caption != null) {
                console.log('NOTICE: sidebar node.caption property is deprecated, please use node.text. Node -> ', nd)
                nd.text = nd.caption
            }
            if (Array.isArray(nd.nodes) && nd.nodes.length > 0) nd.collapsible = true
            if (nd.group) {
                let text = w2utils.lang(typeof nd.text == 'function' ? nd.text.call(obj, nd, level) : nd.text)
                if (String(text).substr(0, 5) != '<span') {
                    text = `<span class="w2ui-group-text">${text}</span>`
                }
                html = `
                    <div id="node_${nd.id}" data-level="${level}" style="${nd.hidden ? 'display: none' : ''}"
                        class="w2ui-node-group w2ui-level-${level} ${nd.class ? nd.class : ''} w2ui-eaction"
                        data-click="toggle|${nd.id}"
                        data-contextmenu="contextMenu|${nd.id}|event"
                        data-mouseenter="showPlus|this|inherit"
                        data-mouseleave="showPlus|this|transparent">
                        ${nd.groupShowHide && nd.collapsible
                            ? `<span>${!nd.hidden && nd.expanded ? w2utils.lang('Hide') : w2utils.lang('Show')}</span>`
                            : '<span></span>'
                        } ${text}
                    </div>
                    <div class="w2ui-node-sub" id="node_${nd.id}_sub" style="${nd.style}; ${!nd.hidden && nd.expanded ? '' : 'display: none;'}">
                </div>`
                if (obj.flat) {
                    html = `
                        <div class="w2ui-node-group" id="node_${nd.id}"><span>&#160;</span></div>
                        <div id="node_${nd.id}_sub" style="${nd.style}; ${!nd.hidden && nd.expanded ? '' : 'display: none;'}"></div>`
                }
            } else {
                if (nd.selected && !nd.disabled) obj.selected = nd.id
                // icon or image
                let image = ''
                if (icon) {
                    if (icon instanceof Object) {
                        let text = (typeof icon.text == 'function' ? (icon.text.call(obj, nd, level) ?? '') : icon.text)
                        image = `
                            <div class="w2ui-node-image w2ui-eaction" style="${obj.icon.style ?? ''}; pointer-events: all"
                                data-mouseEnter="mouseAction|Enter|this|${nd.id}|event|icon"
                                data-mouseLeave="mouseAction|Leave|this|${nd.id}|event|icon"
                                data-click="mouseAction|click|this|${nd.id}|event|icon">
                                    ${text}
                            </div>
                        `
                    } else {
                        image = `
                            <div class="w2ui-node-image">
                                <span class="${typeof icon == 'function' ? icon.call(obj, nd, level) : icon}"></span>
                            </div>`
                    }
                }
                let expand = ''
                let counts = ''
                if (self.badge != null || nd.count != null) {
                    let txt = nd.count ?? self.badge?.text
                    let style = self.badge?.style
                    let last = obj.last.badge[nd.id]
                    if (typeof txt == 'function') txt = txt.call(self, nd, level)
                    if (txt) {
                        counts = `
                            <div class="w2ui-node-badge w2ui-eaction ${nd.count != null ? 'w2ui-node-count' : ''} ${last?.className ?? ''}"
                                style="${style ?? ''};${last?.style ?? ''}"
                                data-mouseEnter="mouseAction|Enter|this|${nd.id}|event|badge"
                                data-mouseLeave="mouseAction|Leave|this|${nd.id}|event|badge"
                                data-click="mouseAction|click|this|${nd.id}|event|badge"
                            >
                                ${txt}
                            </div>`
                    }
                }
                // array with classes
                let classes = ['w2ui-node', `w2ui-level-${level}`, 'w2ui-eaction']
                if (nd.selected) classes.push('w2ui-selected')
                if (nd.disabled) classes.push('w2ui-disabled')
                if (nd.class) classes.push(nd.class)
                // collapsible
                if (nd.collapsible === true) {
                    expand = `<div class="w2ui-${nd.expanded ? 'expanded' : 'collapsed'} ${self.toggleAlign == 'left' ? 'w2ui-left-toggle' : ''}"><span></span></div>`
                    classes.push('w2ui-has-children')
                }
                let text = w2utils.lang(typeof nd.text == 'function' ? nd.text.call(obj, nd, level) : nd.text)
                let nodeOffset = nd.parent?.childOffset ?? 0
                if (level === 0 && nd.collapsible === true && self.toggleAlign == 'left') {
                    nodeOffset += 12
                }
                html = `
                    <div id="node_${nd.id}" class="${classes.join(' ')}" data-level="${level}"
                        style="position: relative; ${nd.hidden ? 'display: none;' : ''}"
                        data-click="click|${nd.id}|event"
                        data-dblclick="dblClick|${nd.id}|event"
                        data-contextmenu="contextMenu|${nd.id}|event"
                        data-mouseEnter="mouseAction|Enter|this|${nd.id}|event"
                        data-mouseLeave="mouseAction|Leave|this|${nd.id}|event"
                    >
                        ${obj.handle.text
                            ? `<div class="w2ui-node-handle w2ui-eaction" style="width: ${obj.handle.width}px; ${obj.handle.style}"
                                    data-mouseEnter="mouseAction|Enter|this|${nd.id}|event|handle"
                                    data-mouseLeave="mouseAction|Leave|this|${nd.id}|event|handle"
                                    data-click="mouseAction|click|this|${nd.id}|event|handle"
                                >
                                   ${typeof obj.handle.text == 'function' ? obj.handle.text.call(obj, nd, level) ?? '' : obj.handle.text}
                              </div>`
                            : ''
                        }
                      <div class="w2ui-node-data" style="margin-left: ${(level * obj.levelPadding) + nodeOffset + obj.handle.width}px">
                            ${expand} ${image} ${counts}
                            <div class="w2ui-node-text ${!image ? 'no-icon' : ''}" style="${nd.style || ''}">${text}</div>
                       </div>
                    </div>
                    <div class="w2ui-node-sub" id="node_${nd.id}_sub" style="${nd.style}; ${!nd.hidden && nd.expanded ? '' : 'display: none;'}"></div>`
                if (obj.flat) {
                    html = `
                        <div id="node_${nd.id}" class="${classes.join(' ')}" style="${nd.hidden ? 'display: none;' : ''}"
                            data-click="click|${nd.id}|event"
                            data-dblclick="dblClick|${nd.id}|event"
                            data-contextmenu="contextMenu|${nd.id}|event"
                            data-mouseEnter="mouseAction|Enter|this|${nd.id}|event|tooltip"
                            data-mouseLeave="mouseAction|Leave|this|${nd.id}|event|tooltip"
                        >
                            <div class="w2ui-node-data w2ui-node-flat">${image}</div>
                        </div>
                        <div class="w2ui-node-sub" id="node_${nd.id}_sub" style="${nd.style}; ${!nd.hidden && nd.expanded ? '' : 'display: none;'}"></div>`
                }
            }
            return html
        }
    }

    mouseAction(action, anchor, nodeId, event, type) {
        let edata
        let node = this.get(nodeId)
        if (type == null) {
            edata = this.trigger('mouse' + action, { target: node.id, node, originalEvent: event })
        }
        if (type == 'tooltip') {
            // this tooltip shows for flat sidebars
            let text = w2utils.lang(typeof node.text == 'function' ? node.text.call(this, node) : node.text)
            let tooltip = text + (node.count || node.count === 0
                ? ' - <span class="w2ui-node-badge w2ui-node-count">'+ node.count +'</span>'
                : '')
            if (action == 'Leave') tooltip = ''
            this.tooltip(anchor, tooltip)
        }
        if (type == 'handle') {
            if (action == 'click') {
                let onClick = this.handle.onClick
                if (typeof onClick == 'function') {
                    onClick.call(this, node, event)
                }
            } else {
                let tooltip = this.handle.tooltip
                if (typeof tooltip == 'function') {
                    tooltip = tooltip.call(this, node, event)
                }
                if (action == 'Leave') tooltip = ''
                this.otherTooltip(anchor, tooltip)
            }
        }
        if (type == 'icon') {
            if (action == 'click') {
                let onClick = this.icon.onClick
                if (typeof onClick == 'function') {
                    onClick.call(this, node, event)
                }
            } else {
                let tooltip = this.icon.tooltip
                if (typeof tooltip == 'function') {
                    tooltip = tooltip.call(this, node, event)
                }
                if (action == 'Leave') tooltip = ''
                this.otherTooltip(anchor, tooltip)
            }
        }
        if (type == 'badge') {
            if (action == 'click') {
                let onClick = this.badge?.onClick
                if (typeof onClick == 'function') {
                    onClick.call(this, node, event)
                }
            } else {
                let tooltip = this.badge?.tooltip
                if (typeof tooltip == 'function') {
                    tooltip = tooltip.call(this, node, event)
                }
                if (action == 'Leave') tooltip = ''
                this.otherTooltip(anchor, tooltip)
            }
        }
        edata?.finish()
    }

    tooltip(el, text) {
        let $el = query(el).find('.w2ui-node-data')
        if (text !== '') {
            w2tooltip.show({
                anchor: $el.get(0),
                name: this.name + '_tooltip',
                html: text,
                position: 'right|left'
            })
        } else {
            w2tooltip.hide(this.name + '_tooltip')
        }
    }

    otherTooltip(el, text) {
        if (text !== '') {
            w2tooltip.show({
                anchor: el,
                name: this.name + '_tooltip',
                html: text,
                position: 'top|bottom'
            })
        } else {
            w2tooltip.hide(this.name + '_tooltip')
        }
    }

    showPlus(el, color) {
        query(el).find('span:nth-child(1)').css('color', color)
    }

    resize() {
        let time = Date.now()
        // event before
        let edata = this.trigger('resize', { target: this.name })
        if (edata.isCancelled === true) return
        // default action
        if (this.box != null) {
            let rect = query(this.box).get(0).getBoundingClientRect()
            query(this.box).css('overflow', 'hidden') // container should have no overflow
            query(this.box).find(':scope > div').css({
                width  : rect.width + 'px',
                height : rect.height + 'px'
            })
        }
        // event after
        edata.finish()
        return Date.now() - time
    }

    destroy() {
        // event before
        let edata = this.trigger('destroy', { target: this.name })
        if (edata.isCancelled === true) return
        // clean up
        if (query(this.box).find('.w2ui-sidebar-body').length > 0) {
            query(this.box)
                .removeAttr('name')
                .removeClass('w2ui-reset w2ui-sidebar')
                .html('')
        }
        this.last.observeResize?.disconnect()
        delete w2ui[this.name]
        // event after
        edata.finish()
    }

    lock(msg, showSpinner) {
        let args = Array.from(arguments)
        args.unshift(this.box)
        w2utils.lock(...args)
    }

    unlock(speed) {
        w2utils.unlock(this.box, speed)
    }
}
export { w2sidebar }