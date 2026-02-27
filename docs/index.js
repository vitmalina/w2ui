$(function () {
    // init layout
    $('#main_layout').w2layout({
        name: 'layout',
        panels: [
            { type: 'top', size: 45, style: 'border: 0px; border-bottom: 1px solid #efefef; background-color: #fff; color: #555;', overflow: 'hidden'},
            { type: 'left', size: 240, resizable: true, style: 'border-right: 1px solid #efefef;' },
            { type: 'main', style: 'background-color: white;' }
        ]
    })
    w2ui.layout.html('top', '<div style="padding: 12px 20px; font-size: 18px;">W2UI 2.0 Documentation</div>')
    // init sidebar
    w2ui.layout.html('left', $().w2sidebar({
        name: 'docs',
        levelPadding: 20,
        nodes: [
            { id: 'w2layout', text: 'w2layout', icon: 'w2ui-icon icon-folder', group1: true, expanded: true, nodes: [
                { id: 'w2layout-events', text: 'Events', icon: 'fa fa-tag' },
                { id: 'w2layout-props', text: 'Properties', icon: 'fa fa-star-o' },
                { id: 'w2layout-methods', text: 'Methods', icon: 'fa fa-cog' }
            ]},
            { id: 'w2grid', text: 'w2grid', icon: 'w2ui-icon icon-folder', group1: true, nodes: [
                { id: 'w2grid-events', text: 'Events', icon: 'fa fa-tag' },
                { id: 'w2grid-props', text: 'Properties', icon: 'fa fa-star-o' },
                { id: 'w2grid-methods', text: 'Methods', icon: 'fa fa-cog' }
            ] },
            { id: 'w2toolbar', text: 'w2toolbar', icon: 'w2ui-icon icon-folder', group1: true, nodes: [
                { id: 'w2toolbar-events', text: 'Events', icon: 'fa fa-tag' },
                { id: 'w2toolbar-props', text: 'Properties', icon: 'fa fa-star-o' },
                { id: 'w2toolbar-methods', text: 'Methods', icon: 'fa fa-cog' }
            ] },
            { id: 'w2sidebar', text: 'w2sidebar', icon: 'w2ui-icon icon-folder', group1: true, nodes: [
                { id: 'w2sidebar-events', text: 'Events', icon: 'fa fa-tag' },
                { id: 'w2sidebar-props', text: 'Properties', icon: 'fa fa-star-o' },
                { id: 'w2sidebar-methods', text: 'Methods', icon: 'fa fa-cog' }
            ] },
            { id: 'w2tabs', text: 'w2tabs', icon: 'w2ui-icon icon-folder', group1: true, nodes: [
                { id: 'w2tabs-events', text: 'Events', icon: 'fa fa-tag' },
                { id: 'w2tabs-props', text: 'Properties', icon: 'fa fa-star-o' },
                { id: 'w2tabs-methods', text: 'Methods', icon: 'fa fa-cog' }
            ] },
            { id: 'w2form', text: 'w2form', icon: 'w2ui-icon icon-folder', group1: true, nodes: [
                { id: 'w2form-events', text: 'Events', icon: 'fa fa-tag' },
                { id: 'w2form-props', text: 'Properties', icon: 'fa fa-star-o' },
                { id: 'w2form-methods', text: 'Methods', icon: 'fa fa-cog' }
            ]},
            { id: 'w2field', text: 'w2field', icon: 'w2ui-icon icon-folder', group1: true, nodes: [
                { id: 'w2field-events', text: 'Events', icon: 'fa fa-tag' },
                { id: 'w2field-props', text: 'Properties', icon: 'fa fa-star-o' },
                { id: 'w2field-methods', text: 'Methods', icon: 'fa fa-cog' }
            ]},
            { id: 'w2popup', text: 'w2popup', icon: 'w2ui-icon icon-folder', group1: true, nodes: [
                { id: 'w2popup-events', text: 'Events', icon: 'fa fa-tag' },
                { id: 'w2popup-props', text: 'Properties', icon: 'fa fa-star-o' },
                { id: 'w2popup-methods', text: 'Methods', icon: 'fa fa-cog' }
            ] },
            { id: 'w2utils', text: 'w2utils', icon: 'w2ui-icon icon-folder', group1: true, nodes: [
                { id: 'w2utils-props', text: 'Properties', icon: 'fa fa-star-o' },
                { id: 'w2utils-methods', text: 'Methods', icon: 'fa fa-cog' }
            ] }
        ],
        onClick: function(id, data) {
            doClick(id, data)
            window.skipChange = true
            document.location = '#' + id
        }
    }))

    // create test objects
    $().w2layout({ name: 'test-layout' })
    $().w2grid({ name: 'test-grid' })
    $().w2sidebar({ name: 'test-sidebar' })
    $().w2toolbar({ name: 'test-toolbar' })
    $().w2tabs({ name: 'test-tabs' })
    $().w2form({ name: 'test-form' })

    // init properties and methods
    init('layout')
    init('grid')
    init('sidebar')
    init('toolbar')
    init('tabs')
    init('form')
    init('field', new w2field(''))
    init('popup', w2popup)
    initUtils()

    // remove internal methods/props
    w2ui.docs.remove(
        'w2layout.panel',
        'w2grid.isIOS', 'w2grid.editChange', 'w2grid.initColumnDrag',
        'w2toolbar.item',
        'w2sidebar.node',
        'w2tabs.tab',
        'w2utils.testLocalStorage'
    )

    function init(type, obj) {
        let methods = []
        let props   = []
        // -- this is needed for es6 compatibility
        if (window.w2obj == null) {
            window.w2obj = {}
        }
        // ----
        if (obj == null) {
            obj = w2ui['test-'+ type]
        }
        Object.getOwnPropertyNames(Object.getPrototypeOf(obj)).forEach(key => {
            if (key == 'constructor' || String(key).substr(0, 2) == '__') return
            if (typeof obj[key] == 'function') methods.push(key); else props.push(key)
        })
        Object.keys(obj).forEach(key => {
            if (['activeEvents', 'listeners', 'debug'].includes(key)) return // ignore common properties from w2base class
            if (props.indexOf(key) == -1) props.push(key)
        })
        methods.sort()
        props.sort()
        let nodes = []
        for (let o in methods) {
            //console.log('---' + methods[o]);
            nodes.push({ id: 'w2'+ type +'.' + methods[o], text: methods[o], icon: 'fa fa-cog' })
        }
        // add to tree
        w2ui.docs.add('w2'+ type +'-methods', nodes)
        let nodes1 = []
        let nodes2 = []
        for (let o in props) {
            //console.log('--->' + props[o]);
            if (w2ui.docs.get('w2'+ type +'.' + props[o]) != null) continue
            if (props[o].substr(0, 2) == 'on') {
                nodes1.push({ id: 'w2'+ type +'.' + props[o], text: props[o], icon: 'fa fa-tag' })
            } else {
                nodes2.push({ id: 'w2'+ type +'.' + props[o], text: props[o], icon: 'fa fa-star-o' })
            }
        }
        w2ui.docs.add('w2'+ type +'-events', nodes1)
        w2ui.docs.add('w2'+ type +'-props', nodes2)
    }

    function initUtils() {
        // utils
        let props   = []
        let methods = []
        for (let key of Object.getOwnPropertyNames(w2utils)) {
            if (typeof w2utils[key] == 'function') methods.push(key); else props.push(key)
        }

        for (let key of Object.getOwnPropertyNames(w2utils.__proto__)) {
            if (typeof w2utils.__proto__[key] == 'function') methods.push(key); else props.push(key)
        }
        props.sort()
        methods.sort()
        // properties
        let nodes = []
        for (let o in props) nodes.push({ id: 'w2utils.' + props[o], text: props[o], icon: 'fa fa-tag' })
        w2ui.docs.add('w2utils-props', nodes)
        // methods
        nodes = []
        for (let o in methods) nodes.push({ id: 'w2utils.' + methods[o], text: methods[o], icon: 'fa fa-cog' })
        w2ui.docs.add('w2utils-methods', nodes)
    }

    // show latest hash
    function goHash() {
        if (window.skipChange === true) {
            window.skipChange = false
            return
        }
        let hash = String(document.location.hash).substr(1)
        doClick(hash)
        if (w2ui.docs.get(hash) != null) {
            w2ui.docs.collapseAll()
            w2ui.docs.select(hash)
            w2ui.docs.expandParents(hash)
        }
    }
    $(window).on('hashchange', goHash)
    setTimeout(goHash, 1)
})

function doClick(cmd, data) {
    let path
    if (cmd.indexOf('.') == -1) {
        let cmds = cmd.split('-')
        if (cmd.indexOf('-') == -1) {
            path = 'overview/'+ cmd.substr(2) +'.html'
        } else {
            if (cmds.length == 1) {
                path = 'overview/'+ cmd +'.html'
            } else {
                path = 'summary/'+ cmd +'.php'
            }

        }
    } else {
        let tmp = cmd.split('.')
        switch (tmp[1]) {
            case 'box' : cmd = 'common.box'; break
            case 'name' : cmd = 'common.name'; break
            case 'handlers' : cmd = 'common.handlers'; break
            case 'style' : cmd = 'common.style'; break
            case 'render' : cmd = 'common.render'; break
            case 'refresh' : cmd = 'common.refresh'; break
            case 'destroy' : cmd = 'common.destroy'; break
            case 'resize' : if (tmp[0] != 'w2popup') cmd = 'common.resize'; break
            case 'on' : cmd = 'common.on'; break
            case 'off' : cmd = 'common.off'; break
            case 'trigger' : cmd = 'common.trigger'; break
            case 'onRender' : cmd = 'common.onRender'; break
            case 'onRefresh': cmd = 'common.onRefresh'; break
            case 'onDestroy': cmd = 'common.onDestroy'; break
            case 'onResize' : cmd = 'common.onResize'; break
        }
        w2ui.layout.html('main', '')
        path = 'details/'+ cmd +'.html'
    }
    // load file
    $.get(path, function (data) {
        data = data.replace(/href="/g, 'href="#')
        data = data.replace(/href="#http:\/\/w2ui.com/g, 'href="http://w2ui.com')
        data = data.replace(/href="#https:\/\/w2ui.com/g, 'href="https://w2ui.com')
        data = data.replace(/href="#\/\/w2ui.com/g, 'href="//w2ui.com')
        w2ui.layout.html('main',
            '<div class="obj-desc">'+
            '<h1>' + cmd + '</h1>' +
            data +
            '</div>')
        // javascript
        $('textarea.javascript').each(function (index, el) {
            $(this).val($(this).val().trim())
            // init Code Mirror
            let cm = CodeMirror.fromTextArea(this, {
                mode: 'javascript',
                readOnly: true,
                gutter: true,
                lineNumbers: true
            })
            cm.setSize(null, cm.doc.height + 15)
        })
        // html
        $('textarea.html').each(function (index, el) {
            $(this).val($(this).val().trim())
            // init Code Mirror
            let cm = CodeMirror.fromTextArea(this, {
                mode: 'htmlmixed',
                readOnly: true,
                gutter: true,
                lineNumbers: true
            })
            cm.setSize(null, cm.doc.height + 15)
        })
    })
}
