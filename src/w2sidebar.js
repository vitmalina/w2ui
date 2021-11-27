/************************************************************************
*   Part of w2ui 2.0 library
*   - Dependencies: jQuery, w2utils
*
* == TODO ==
*   - dbl click should be like it is in grid (with timer not HTML dbl click event)
*   - node.style is misleading - should be there to apply color for example
*   - node.plus - is not working
*
* == 2.0 changes
*   - deprecarted obj.img, node.img
*   - CSP - fixed inline events
*
************************************************************************/

import { w2event } from './w2event.js'
import { w2ui, w2utils } from './w2utils.js'

class w2sidebar extends w2event {
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
        this.skipRefresh   = false
        this.tabIndex      = null // will only be set if > 0 and not null
        this.handle        = { size: 0, style: '', html: '' },
        this.onClick       = null // Fire when user click on Node Text
        this.onDblClick    = null // Fire when user dbl clicks
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
        this.tmp = {
            badge: {}
        }
        let nodes = options.nodes
        delete options.nodes
        // mix in options
        $.extend(true, this, options)
        // add item via method to makes sure item_template is applied
        if (Array.isArray(nodes)) this.add(nodes)
        // need to reassign back to keep it in config
        options.nodes = nodes
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
                    $.extend(parent.nodes[i], node, { nodes: [] })
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

    setCount(id, count, className, style) {
        let $it = $(`#node_${id} .w2ui-node-count`)
        $it.removeClass()
            .addClass(`w2ui-node-count ${className || ''}`)
            .text(count)[0].style.cssText = style || ''
        this.tmp.badge[id] = {
            className: className || '',
            style: style || ''
        }
        let item = this.get(id)
        item.count = count
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

    search(str) {
        let count = 0
        let str2  = str.toLowerCase()
        this.each((node) => {
            if (node.text.toLowerCase().indexOf(str2) === -1) {
                node.hidden = true
            } else {
                count++
                showParents(node)
                node.hidden = false
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
        // var obj = this;
        let new_node = this.get(id)
        if (!new_node) return false
        if (this.selected == id && new_node.selected) return false
        this.unselect(this.selected)
        let $el = $(this.box).find('#node_'+ w2utils.escapeId(id))
        $el.addClass('w2ui-selected')
            .find('.w2ui-icon')
            .addClass('w2ui-icon-selected')
        if ($el.length > 0) {
            this.scrollIntoView(id, true)
        }
        new_node.selected = true
        this.selected     = id
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
        $(this.box).find('#node_'+ w2utils.escapeId(id))
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
        let obj = this
        let nd  = this.get(id)
        if (nd == null) return false
        // event before
        let edata = this.trigger({ phase: 'before', type: 'collapse', target: id, object: nd })
        if (edata.isCancelled === true) return
        // default action
        $(this.box).find('#node_'+ w2utils.escapeId(id) +'_sub').slideUp(200)
        $(this.box).find('#node_'+ w2utils.escapeId(id) +' .w2ui-expanded')
            .removeClass('w2ui-expanded')
            .addClass('w2ui-collapsed')
        nd.expanded = false
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
        setTimeout(() => { obj.refresh(id) }, 200)
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

    expand(id) {
        let obj = this
        let nd  = this.get(id)
        // event before
        let edata = this.trigger({ phase: 'before', type: 'expand', target: id, object: nd })
        if (edata.isCancelled === true) return
        // default action
        $(this.box).find('#node_'+ w2utils.escapeId(id) +'_sub').slideDown(200)
        $(this.box).find('#node_'+ w2utils.escapeId(id) +' .w2ui-collapsed')
            .removeClass('w2ui-collapsed')
            .addClass('w2ui-expanded')
        nd.expanded = true
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
        setTimeout(() => { obj.refresh(id) }, 200)
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
        $(obj.box).find('.w2ui-node.w2ui-selected').each((index, el) => {
            let oldID   = $(el).attr('id').replace('node_', '')
            let oldNode = obj.get(oldID)
            if (oldNode != null) oldNode.selected = false
            $(el).removeClass('w2ui-selected').find('.w2ui-icon').removeClass('w2ui-icon-selected')
        })
        // select new one
        let newNode = $(obj.box).find('#node_'+ w2utils.escapeId(id))
        let oldNode = $(obj.box).find('#node_'+ w2utils.escapeId(obj.selected))
        newNode.addClass('w2ui-selected').find('.w2ui-icon').addClass('w2ui-icon-selected')
        // need timeout to allow rendering
        setTimeout(() => {
            // event before
            let edata = obj.trigger({ phase: 'before', type: 'click', target: id, originalEvent: event, node: nd, object: nd })
            if (edata.isCancelled === true) {
                // restore selection
                newNode.removeClass('w2ui-selected').find('.w2ui-icon').removeClass('w2ui-icon-selected')
                oldNode.addClass('w2ui-selected').find('.w2ui-icon').addClass('w2ui-icon-selected')
                return
            }
            // default action
            if (oldNode != null) oldNode.selected = false
            obj.get(id).selected = true
            obj.selected         = id
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
            obj.trigger($.extend(edata, { phase: 'after' }))
        }, 1)
    }

    focus(event) {
        let obj = this
        // event before
        let edata = this.trigger({ phase: 'before', type: 'focus', target: this.name, originalEvent: event })
        if (edata.isCancelled === true) return false
        // default behaviour
        this.hasFocus = true
        $(this.box).find('.w2ui-sidebar-body').addClass('w2ui-focus')
        setTimeout(() => {
            let $input = $(obj.box).find('#sidebar_'+ obj.name + '_focus')
            if (!$input.is(':focus')) $input.focus()
        }, 10)
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
    }

    blur(event) {
        // event before
        let edata = this.trigger({ phase: 'before', type: 'blur', target: this.name, originalEvent: event })
        if (edata.isCancelled === true) return false
        // default behaviour
        this.hasFocus = false
        $(this.box).find('.w2ui-sidebar-body').removeClass('w2ui-focus')
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
    }

    keydown(event) {
        let obj = this
        let nd  = obj.get(obj.selected)
        if (obj.keyboard !== true) return
        if (!nd) nd = obj.nodes[0]
        // trigger event
        let edata = obj.trigger({ phase: 'before', type: 'keydown', target: obj.name, originalEvent: event })
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
        if ($.inArray(event.keyCode, [13, 32, 37, 38, 39, 40]) != -1) {
            if (event.preventDefault) event.preventDefault()
            if (event.stopPropagation) event.stopPropagation()
        }
        // event after
        obj.trigger($.extend(edata, { phase: 'after' }))

        function selectNode(node, event) {
            if (node != null && !node.hidden && !node.disabled && !node.group) {
                obj.click(node.id, event)
                setTimeout(() => { obj.scrollIntoView() }, 50)
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

    scrollIntoView(id, instant) {
        if (id == null) id = this.selected
        let nd = this.get(id)
        if (nd == null) return
        let body   = $(this.box).find('.w2ui-sidebar-body')
        let item   = $(this.box).find('#node_'+ w2utils.escapeId(id))
        let offset = item.offset().top - body.offset().top
        if (offset + item.height() > body.height() || offset <= 0) {
            body.animate({ 'scrollTop': body.scrollTop() + offset - body.height() / 2 + item.height() }, instant ? 0 : 250, 'linear')
        }
    }

    dblClick(id, event) {
        let nd = this.get(id)
        // event before
        let edata = this.trigger({ phase: 'before', type: 'dblClick', target: id, originalEvent: event, object: nd })
        if (edata.isCancelled === true) return
        // default action
        this.toggle(id)
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
    }

    contextMenu(id, event) {
        let obj = this
        let nd  = obj.get(id)
        if (id != obj.selected) obj.click(id)
        // event before
        let edata = obj.trigger({ phase: 'before', type: 'contextMenu', target: id, originalEvent: event, object: nd, allowOnDisabled: false })
        if (edata.isCancelled === true) return
        // default action
        if (nd.disabled && !edata.allowOnDisabled) return
        if (obj.menu.length > 0) {
            $(obj.box).find('#node_'+ w2utils.escapeId(id))
                .w2menu({
                    items: obj.menu,
                    contextMenu: true,
                    originalEvent: event,
                    onSelect(event) {
                        obj.menuClick(id, parseInt(event.index), event.originalEvent)
                    }
                }
                )
        }
        // cancel event
        if (event.preventDefault) event.preventDefault()
        // event after
        obj.trigger($.extend(edata, { phase: 'after' }))
    }

    menuClick(itemId, index, event) {
        let obj = this
        // event before
        let edata = obj.trigger({ phase: 'before', type: 'menuClick', target: itemId, originalEvent: event, menuIndex: index, menuItem: obj.menu[index] })
        if (edata.isCancelled === true) return
        // default action
        // -- empty
        // event after
        obj.trigger($.extend(edata, { phase: 'after' }))
    }

    goFlat() {
        // event before
        let edata = this.trigger({ phase: 'before', type: 'flat', goFlat: !this.flat })
        if (edata.isCancelled === true) return
        // default action
        this.flat = !this.flat
        this.refresh()
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
    }

    render(box) {
        let time = (new Date()).getTime()
        let obj  = this
        // event before
        let edata = this.trigger({ phase: 'before', type: 'render', target: this.name, box: box })
        if (edata.isCancelled === true) return
        // default action
        if (box != null) {
            if ($(this.box).find('> div > div.w2ui-sidebar-body').length > 0) {
                $(this.box)
                    .removeAttr('name')
                    .removeClass('w2ui-reset w2ui-sidebar')
                    .html('')
            }
            this.box = box
        }
        if (!this.box) return
        $(this.box)
            .attr('name', this.name)
            .addClass('w2ui-reset w2ui-sidebar')
            .html('<div>'+
                    '<input id="sidebar_'+ this.name +'_focus" '+ (this.tabIndex ? 'tabindex="' + this.tabIndex + '"' : '') +
                    '   style="position: absolute; top: 0; right: 0; width: 1px; z-index: -1; opacity: 0" '+ (w2utils.isIOS ? 'readonly' : '') +'/>'+
                    '<div class="w2ui-sidebar-top"></div>' +
                    '<div class="w2ui-sidebar-body"></div>'+
                    '<div class="w2ui-sidebar-bottom"></div>'+
                '</div>'
            )
        $(this.box).find('> div').css({
            width  : $(this.box).width() + 'px',
            height : $(this.box).height() + 'px'
        })
        if ($(this.box).length > 0) $(this.box)[0].style.cssText += this.style
        // adjust top and bottom
        let flatHTML = ''
        if (this.flatButton == true) {
            flatHTML = '<div class="w2ui-flat-'+ (this.flat ? 'right' : 'left') +'" onclick="w2ui[\''+ this.name +'\'].goFlat()"></div>'
        }
        if (this.topHTML !== '' || flatHTML !== '') {
            $(this.box).find('.w2ui-sidebar-top').html(this.topHTML + flatHTML)
            $(this.box).find('.w2ui-sidebar-body')
                .css('top', $(this.box).find('.w2ui-sidebar-top').height() + 'px')
        }
        if (this.bottomHTML !== '') {
            $(this.box).find('.w2ui-sidebar-bottom').html(this.bottomHTML)
            $(this.box).find('.w2ui-sidebar-body')
                .css('bottom', $(this.box).find('.w2ui-sidebar-bottom').height() + 'px')
        }
        // focus
        let kbd_timer
        $(this.box).find('#sidebar_'+ this.name + '_focus')
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
        $(this.box).off('mousedown').on('mousedown', function(event) {
            // set focus to grid
            setTimeout(() => {
                // if input then do not focus
                if (['INPUT', 'TEXTAREA', 'SELECT'].indexOf(event.target.tagName.toUpperCase()) == -1) {
                    let $input = $(obj.box).find('#sidebar_'+ obj.name + '_focus')
                    if (!$input.is(':focus')) {
                        if ($(event.target).hasClass('w2ui-node')) {
                            let top = $(event.target).position().top + $(obj.box).find('.w2ui-sidebar-top').height() + event.offsetY
                            $input.css({ top: top + 'px', left: '0px' })
                        }
                        $input.focus()
                    }
                }
            }, 1)
        })
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
        // ---
        this.refresh()
        return (new Date()).getTime() - time
    }

    update(id, options) {
        // quick function to refresh just this item (not sub nodes)
        //  - icon, class, style, text, count
        let nd = this.get(id)
        let level
        if (nd) {
            let $el = $(this.box).find('#node_'+ w2utils.escapeId(nd.id))
            if (nd.group) {
                if (options.text) {
                    nd.text = options.text
                    $el.find('.w2ui-group-text').replaceWith(typeof nd.text == 'function'
                        ? nd.text.call(this, nd)
                        : '<span class="w2ui-group-text">'+ nd.text +'</span>')
                    delete options.text
                }
                if (options.class) {
                    nd.class         = options.class
                    level            = $el.data('level')
                    $el[0].className = 'w2ui-node-group w2ui-level-'+ level +(nd.class ? ' ' + nd.class : '')
                    delete options.class
                }
                if (options.style) {
                    nd.style            = options.style
                    $el.next()[0].style = nd.style +';'+ (!nd.hidden && nd.expanded ? '' : 'display: none;')
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
                    $el.find('.w2ui-node-count').html(nd.count)
                    if ($el.find('.w2ui-node-count').length > 0) delete options.count
                }
                if (options.class && $el.length > 0) {
                    nd.class         = options.class
                    level            = $el.data('level')
                    $el[0].className = 'w2ui-node w2ui-level-'+ level + (nd.selected ? ' w2ui-selected' : '') + (nd.disabled ? ' w2ui-disabled' : '') + (nd.class ? ' ' + nd.class : '')
                    delete options.class
                }
                if (options.text) {
                    nd.text = options.text
                    $el.find('.w2ui-node-text').html(typeof nd.text == 'function' ? nd.text.call(this, nd) : nd.text)
                    delete options.text
                }
                if (options.style && $el.length > 0) {
                    let $txt      = $el.find('.w2ui-node-text')
                    nd.style      = options.style
                    $txt[0].style = nd.style
                    delete options.style
                }
            }
        }
        // return what was not set
        return options
    }

    refresh(id) {
        if (this.box == null) return
        let time = (new Date()).getTime()
        // event before
        let edata = this.trigger({ phase: 'before', type: 'refresh', target: (id != null ? id : this.name),
            fullRefresh: (id != null ? false : true) })
        if (edata.isCancelled === true) return
        // adjust top and bottom
        let flatHTML = ''
        if (this.flatButton == true) {
            flatHTML = '<div class="w2ui-flat-'+ (this.flat ? 'right' : 'left') +'" onclick="w2ui[\''+ this.name +'\'].goFlat()"></div>'
        }
        if (this.topHTML !== '' || flatHTML !== '') {
            $(this.box).find('.w2ui-sidebar-top').html(this.topHTML + flatHTML)
            $(this.box).find('.w2ui-sidebar-body')
                .css('top', $(this.box).find('.w2ui-sidebar-top').height() + 'px')
        }
        if (this.bottomHTML !== '') {
            $(this.box).find('.w2ui-sidebar-bottom').html(this.bottomHTML)
            $(this.box).find('.w2ui-sidebar-body')
                .css('bottom', $(this.box).find('.w2ui-sidebar-bottom').height() + 'px')
        }
        // default action
        $(this.box).find('> div').removeClass('w2ui-sidebar-flat').addClass(this.flat ? 'w2ui-sidebar-flat' : '').css({
            width : $(this.box).width() + 'px',
            height: $(this.box).height() + 'px'
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
            $(this.box).find(nodeId).before('<div id="sidebar_'+ this.name + '_tmp"></div>')
            $(this.box).find(nodeId).remove()
            $(this.box).find(nodeSubId).remove()
            $('#sidebar_'+ this.name + '_tmp').before(nodeHTML)
            $('#sidebar_'+ this.name + '_tmp').remove()
        }
        // remember scroll position
        let scroll = {
            top: $(this.box).find(nodeSubId).scrollTop(),
            left: $(this.box).find(nodeSubId).scrollLeft()
        }
        // refresh sub nodes
        $(this.box).find(nodeSubId).html('')
        for (let i = 0; i < node.nodes.length; i++) {
            let subNode = node.nodes[i]
            nodeHTML = getNodeHTML(subNode)
            $(this.box).find(nodeSubId).append(nodeHTML)
            if (subNode.nodes.length !== 0) {
                this.refresh(subNode.id)
            } else {
                // trigger event
                let edata2 = this.trigger({ phase: 'before', type: 'refresh', target: subNode.id })
                if (edata2.isCancelled === true) return
                // event after
                this.trigger($.extend(edata2, { phase: 'after' }))
            }
        }
        // reset scroll
        $(this.box).find(nodeSubId).scrollLeft(scroll.left).scrollTop(scroll.top)
        // bind events
        if (id) {
            let els = $(this.box).find(`${nodeId}.w2ui-eaction, ${nodeSubId} .w2ui-eaction`)
            w2utils.bindEvents(els, this)
        }
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
        return (new Date()).getTime() - time

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
                let text = w2utils.lang(typeof nd.text == 'function' ? nd.text.call(obj, nd) : nd.text)
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
                tmp = ''
                if (icon) {
                    tmp = `
                    <div class="w2ui-node-image">
                        <span class="${typeof icon == 'function' ? icon.call(obj, nd) : icon}"></span>
                    </div>`
                }
                let expand = ''
                let counts = (nd.count != null
                    ? `<div class="w2ui-node-count ${obj.tmp.badge[nd.id] ? obj.tmp.badge[nd.id].className || '' : ''}"
                            style="${obj.tmp.badge[nd.id] ? obj.tmp.badge[nd.id].style || '' : ''}">
                                ${nd.count}
                       </div>`
                    : '')
                if (nd.collapsible === true) {
                    expand = `<div class="w2ui-${nd.expanded ? 'expanded' : 'collapsed'}"><span></span></div>`
                }

                let text = w2utils.lang(typeof nd.text == 'function' ? nd.text.call(obj, nd) : nd.text)
                // array with classes
                let classes = ['w2ui-node', `w2ui-level-${level}`, 'w2ui-eaction']
                if (nd.selected) classes.push('w2ui-selected')
                if (nd.disabled) classes.push('w2ui-disabled')
                if (nd.class) classes.push(nd.class)
                html = `
                    <div id="node_${nd.id}" class="${classes.join(' ')}" data-level="${level}"
                        style="position: relative; ${nd.hidden ? 'display: none;' : ''}"
                        data-click="click|${nd.id}|event"
                        data-dblclick="dblClick|${nd.id}|event"
                        data-contextmenu="contextMenu|${nd.id}|event">
                        ${obj.handle.html
                            ? `<div class="w2ui-node-handle" style="width: ${obj.handle.size}px; ${obj.handle.style}">
                                   ${typeof obj.handle.html == 'function' ? obj.handle.html.call(obj, nd) : obj.handle.html}
                              </div>`
                            : ''
                        }
                      <div class="w2ui-node-data" style="margin-left: ${level * obj.levelPadding + obj.handle.size}px">
                            ${expand} ${tmp} ${counts}
                            <div class="w2ui-node-text w2ui-node-caption" style="${nd.style || ''}">${text}</div>
                       </div>
                    </div>
                    <div class="w2ui-node-sub" id="node_${nd.id}_sub" style="${nd.style}; ${!nd.hidden && nd.expanded ? '' : 'display: none;'}"></div>`
                if (obj.flat) {
                    let tooltip = w2utils.base64encode(text + (nd.count || nd.count === 0 ? ' - <span class="w2ui-node-count">'+ nd.count +'</span>' : ''))
                    html = `
                        <div id="node_${nd.id}" class="${classes.join(' ')}" style="${nd.hidden ? 'display: none;' : ''}"
                            data-click="click|${nd.id}|event"
                            data-dblclick="dblClick|${nd.id}|event"
                            data-contextmenu="contextMenu|${nd.id}|event"
                            data-mouseenter="tooltip|this|${tooltip}|${nd.id}"
                            data-mouseleave="tooltip|this|">
                            <div class="w2ui-node-data w2ui-node-flat">${tmp}</div>
                        </div>
                        <div class="w2ui-node-sub" id="node_${nd.id}_sub" style="${nd.style}; ${!nd.hidden && nd.expanded ? '' : 'display: none;'}"></div>`
                }
            }
            return html
        }
    }

    tooltip(el, text, id) {
        let $el = $(el).find('.w2ui-node-data')
        if (text !== '') {
            // show
            $(el).find('.w2ui-node-data').w2tag(w2utils.base64decode(text), { id, left: -5 })
        } else {
             // hide
            $el.w2tag()
        }
    }

    showPlus(el, color) {
        $(el).find('span:nth-child(1)').css('color', color)
    }

    resize() {
        let time = (new Date()).getTime()
        // event before
        let edata = this.trigger({ phase: 'before', type: 'resize', target: this.name })
        if (edata.isCancelled === true) return
        // default action
        $(this.box).css('overflow', 'hidden') // container should have no overflow
        $(this.box).find('> div').css({
            width  : $(this.box).width() + 'px',
            height : $(this.box).height() + 'px'
        })
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
        return (new Date()).getTime() - time
    }

    destroy() {
        // event before
        let edata = this.trigger({ phase: 'before', type: 'destroy', target: this.name })
        if (edata.isCancelled === true) return
        // clean up
        if ($(this.box).find('> div > div.w2ui-sidebar-body').length > 0) {
            $(this.box)
                .removeAttr('name')
                .removeClass('w2ui-reset w2ui-sidebar')
                .html('')
        }
        delete w2ui[this.name]
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
    }

    lock(msg, showSpinner) {
        let args = Array.prototype.slice.call(arguments, 0)
        args.unshift(this.box)
        w2utils.lock.apply(window, args)
    }

    unlock(speed) {
        w2utils.unlock(this.box, speed)
    }
}
export { w2sidebar }