
$(function () {
    let last_hash
    let conf = {
        demo_layout: {
            name: 'demo_layout',
            panels: [
                { type: 'top', size: 60, overflow: 'hidden',
                    style: 'border: 0px; border-bottom: 1px solid #e4e4e4; background-color: #fff; color: #555;',
                    onRefresh(event) {
                        event.done(() => {
                            $('#demo_toolbar').w2render(w2ui.demo_toolbar)
                        })
                    }
                },
                { type: 'left', size: 240, resizable: true, style: 'border-right: 1px solid #efefef;' },
                { type: 'main', style: 'background-color: white;' }
            ]
        },

        demo_toolbar: {
            name: 'demo_toolbar',
            items: [
                { id: 'combo', type: 'radio', text: 'Combo', icon: 'fa fa-star-o', route: 'combo/1' },
                { id: 'layout', type: 'radio', text: 'Layout', icon: 'fa fa-columns', route: 'layout/1' },
                { id: 'grid', type: 'radio', text: 'Grid', icon: 'fa fa-table', route: 'grid/1' },
                { id: 'toolbar', type: 'radio', text: 'Toolbar', icon: 'fa fa-hand-o-up', route: 'toolbar/1' },
                { id: 'sidebar', type: 'radio', text: 'Sidebar', icon: 'fa fa-hand-o-left', route: 'sidebar/1' },
                { id: 'tabs', type: 'radio', text: 'Tabs', icon: 'fa fa-folder-o', route: 'tabs/1' },
                { id: 'form', type: 'radio', text: 'Forms', icon: 'fa fa-pencil-square-o', route: 'form/1' },
                { id: 'fields', type: 'radio', text: 'Fields', icon: 'fa fa-pencil-square-o', route: 'fields/1' },
                { id: 'popup', type: 'radio', text: 'Popup', icon: 'fa fa-list-alt', route: 'popup/1' },
                { id: 'utils', type: 'radio', text: 'Utils', icon: 'fa fa-star-o', route: 'utils/1' }
            ]
        },

        demo_sidebar: {
            name: 'demo_sidebar',
            img: null,
            nodes: [
                { id: 'combo', text: 'Combinations', img: 'icon-folder', group: true, expanded: true, hidden: true,
                    nodes: [
                        { id: 'combo/1', text: 'Sidebar & Grid', icon: 'fa fa-star-o' },
                        { id: 'combo/2', text: 'Grid & Edit', icon: 'fa fa-star-o' },
                        { id: 'combo/3', text: 'Spreadsheet Like Grid', icon: 'fa fa-star-o' },
                        { id: 'combo/4', text: 'Buffered Scroll', icon: 'fa fa-star-o' },
                        { id: 'combo/9', text: 'Infinite Scroll', icon: 'fa fa-star-o' },
                        { id: 'combo/5', text: 'Tabs With Content', icon: 'fa fa-star-o' },
                        { id: 'combo/6', text: 'Layout & Dynamic Tabs', icon: 'fa fa-star-o' },
                        { id: 'combo/7', text: 'Popup & Grid', icon: 'fa fa-star-o' },
                        { id: 'combo/8', text: 'Popup & Layout', icon: 'fa fa-star-o' },
                        { id: 'combo/10', text: 'Dependent Fields', icon: 'fa fa-star-o' }
                    ]
                },
                { id: 'combo-1.5', text: 'Features 1.5+', img: 'icon-folder', group: true, expanded: true, hidden: true,
                    nodes: [
                        { id: 'combo/11', text: 'Flat Sidebar', icon: 'fa fa-star-o' }
                    ]
                },
                { id: 'layout', text: 'Layout Basic', img: 'icon-folder', group: true, expanded: true, hidden: true,
                    nodes: [
                        { id: 'layout/1', text: 'Simple Layout', icon: 'fa fa-columns' },
                        { id: 'layout/2', text: 'Resizable Panels', icon: 'fa fa-columns' },
                        { id: 'layout/3', text: 'Show/Hide Panels', icon: 'fa fa-columns' },
                        { id: 'layout/4', text: 'Load Content', icon: 'fa fa-columns' },
                        { id: 'layout/5', text: 'Transitions', icon: 'fa fa-columns' },
                        { id: 'layout/6', text: 'Event Listeners', icon: 'fa fa-columns' },
                        { id: 'layout/7', text: 'Nested Layouts', icon: 'fa fa-columns' },
                        { id: 'layout/8', text: 'Panel With Tabs', icon: 'fa fa-columns' },
                        { id: 'layout/9', text: 'Panel With Toolbar', icon: 'fa fa-columns' },
                        { id: 'layout/10', text: 'Panel With Title', icon: 'fa fa-columns' }
                    ]
                },
                { id: 'layout-1.5', text: 'Features 1.5+', img: 'icon-folder', group: true, expanded: true, hidden: true,
                    nodes: [
                        { id: 'layout/11', text: 'Panel Messages', icon: 'fa fa-columns' },
                        { id: 'layout/12', text: 'Fixed Size Main', icon: 'fa fa-columns' },
                        { id: 'layout/13', text: 'Content Replaced', icon: 'fa fa-columns' }
                    ]
                },
                { id: 'grid', text: 'Grid Basic', img: 'icon-folder', group: true, expanded: true, hidden: true,
                    nodes: [
                        { id: 'grid/1', text: 'Simple Grid', icon: 'fa fa-table' },
                        { id: 'grid/3', text: 'Grid Elements', icon: 'fa fa-table' },
                        { id: 'grid/2', text: 'Row Formatting', icon: 'fa fa-table' },
                        { id: 'grid/23',text: 'Cell Formatting', icon: 'fa fa-table' },
                        { id: 'grid/4', text: 'Data Source', icon: 'fa fa-table' },
                        { id: 'grid/5', text: 'Load Data Once', icon: 'fa fa-table' },
                        { id: 'grid/6', text: 'Single or Multi Select', icon: 'fa fa-table' },
                        { id: 'grid/8', text: 'Show/Hide Columns', icon: 'fa fa-table' },
                        { id: 'grid/9', text: 'Add/Remove Records', icon: 'fa fa-table' },
                        { id: 'grid/10', text: 'Select/Unselect Records', icon: 'fa fa-table' },
                        { id: 'grid/11', text: 'Fixed/Resizable', icon: 'fa fa-table' },
                        { id: 'grid/12', text: 'Column Sort', icon: 'fa fa-table' },
                        { id: 'grid/13', text: 'Column Groups', icon: 'fa fa-table' },
                        { id: 'grid/14', text: 'Summary Records', icon: 'fa fa-table' },
                        { id: 'grid/15', text: 'Simple Search', icon: 'fa fa-table' },
                        { id: 'grid/16', text: 'Advanced Search', icon: 'fa fa-table' },
                        { id: 'grid/17', text: 'Grid Toolbar', icon: 'fa fa-table' },
                        { id: 'grid/18', text: 'Master -> Detail', icon: 'fa fa-table' },
                        { id: 'grid/19', text: 'Two Grids', icon: 'fa fa-table' },
                        { id: 'grid/20', text: 'Render to a New Box', icon: 'fa fa-table' },
                        { id: 'grid/21', text: 'Inline Editing', icon: 'fa fa-table' },
                        { id: 'grid/22', text: 'Resizable Columns', icon: 'fa fa-table' },
                        { id: 'grid/24', text: 'Lock/Unlock Grid', icon: 'fa fa-table' },
                        { id: 'grid/25', text: 'Reorder Columns', icon: 'fa fa-table' },
                        { id: 'grid/30', text: 'Events', icon: 'fa fa-table' },
                    ]
                },
                { id: 'grid-1.5', text: 'Features 1.5+', img: 'icon-folder', group: true, expanded: true, hidden: true,
                    nodes: [
                        { id: 'grid/26', text: 'Reorder Records', icon: 'fa fa-table' },
                        { id: 'grid/7', text: 'Tree-Like Grid', icon: 'fa fa-table' },
                        { id: 'grid/27', text: 'Frozen Columns', icon: 'fa fa-table' },
                        { id: 'grid/28', text: 'Info Bubble', icon: 'fa fa-table' },
                        { id: 'grid/29', text: 'Advanced Formatting', icon: 'fa fa-table' },
                        { id: 'grid/31', text: 'Column Tooltip &amp; Title', icon: 'fa fa-table' },
                    ]
                },
                { id: 'toolbar', text: 'Toolbar Basic', img: 'icon-folder', group: true, expanded: true, hidden: true,
                    nodes: [
                        { id: 'toolbar/1', text: 'Simple Toolbar', icon: 'fa fa-hand-o-up' },
                        { id: 'toolbar/2', text: 'More Buttons Type', icon: 'fa fa-hand-o-up' },
                        { id: 'toolbar/3', text: 'Add/Remove Buttons', icon: 'fa fa-hand-o-up' },
                        { id: 'toolbar/4', text: 'Show/Hide Buttons', icon: 'fa fa-hand-o-up' },
                        { id: 'toolbar/5', text: 'Enable/Disable Buttons', icon: 'fa fa-hand-o-up' }
                    ]
                },
                { id: 'toolbar-1.5', text: 'Features 1.5+', img: 'icon-folder', group: true, expanded: true, hidden: true,
                    nodes: [
                        { id: 'toolbar/6', text: 'Menu Buttons', icon: 'fa fa-hand-o-up' },
                        { id: 'toolbar/7', text: 'Color Buttons', icon: 'fa fa-hand-o-up' },
                        { id: 'toolbar/9', text: 'Custom Buttons', icon: 'fa fa-hand-o-up' },
                        { id: 'toolbar/8', text: 'Tooltips', icon: 'fa fa-hand-o-up' },
                        { id: 'toolbar/10', text: 'Toolbar Overflow', icon: 'fa fa-hand-o-up' },
                        { id: 'toolbar/11', text: 'Multiline Toolbars', icon: 'fa fa-hand-o-up' }
                    ]
                },
                { id: 'sidebar', text: 'Sidebar Basic', img: 'icon-folder', group: true, expanded: true, hidden: true,
                    nodes: [
                        { id: 'sidebar/1', text: 'Simple Sidebar', icon: 'fa fa-hand-o-left' },
                        { id: 'sidebar/2', text: 'Add/Remove', icon: 'fa fa-hand-o-left' },
                        { id: 'sidebar/3', text: 'Show/Hide', icon: 'fa fa-hand-o-left' },
                        { id: 'sidebar/4', text: 'Enable/Disable', icon: 'fa fa-hand-o-left' },
                        { id: 'sidebar/5', text: 'Expand/Collapse', icon: 'fa fa-hand-o-left' },
                        { id: 'sidebar/6', text: 'Select/Unselect', icon: 'fa fa-hand-o-left' },
                        { id: 'sidebar/8', text: 'Top & Bottom HTML', icon: 'fa fa-hand-o-left' },
                        { id: 'sidebar/7', text: 'Events', icon: 'fa fa-hand-o-left' }
                    ]
                },
                { id: 'sidebar-1.5', text: 'Features 1.5+', img: 'icon-folder', group: true, expanded: true, hidden: true,
                    nodes: [
                        { id: 'sidebar/9', text: 'Flat Sidebar', icon: 'fa fa-hand-o-up' },
                        { id: 'sidebar/10', text: 'In/Out of Focus', icon: 'fa fa-hand-o-up' },
                        { id: 'sidebar/11', text: 'Tree Like Sidebars', icon: 'fa fa-hand-o-up' },
                        { id: 'sidebar/12', text: 'Level Padding', icon: 'fa fa-hand-o-up' },
                        { id: 'sidebar/13', text: 'Node Handle', icon: 'fa fa-hand-o-up' },
                    ]
                },
                // { id: 'sidebar-2.0', text: 'Features 2.0+', img: 'icon-folder', group: true, expanded: true, hidden: true,
                //     nodes: [
                //         { id: 'sidebar/14', text: 'Sort Nodes', icon: 'fa fa-hand-o-up' },
                //         { id: 'sidebar/15', text: 'Search Nodes', icon: 'fa fa-hand-o-up' }
                //     ]
                // },
                { id: 'tabs', text: 'Tabs Basic', img: 'icon-folder', group: true, expanded: true, hidden: true,
                    nodes: [
                        { id: 'tabs/1', text: 'Simple Tabs', icon: 'fa fa-folder-o' },
                        { id: 'tabs/2', text: 'Set a Tab Active', icon: 'fa fa-folder-o' },
                        { id: 'tabs/3', text: 'Closeable Tabs', icon: 'fa fa-folder-o' },
                        { id: 'tabs/4', text: 'Add/Remove Tabs', icon: 'fa fa-folder-o' },
                        { id: 'tabs/5', text: 'Enable/Disabled Tabs', icon: 'fa fa-folder-o' },
                        { id: 'tabs/6', text: 'Show/Hide Tabs', icon: 'fa fa-folder-o' }
                    ]
                },
                { id: 'tabs-1.5', text: 'Features 1.5+', img: 'icon-folder', group: true, expanded: true, hidden: true,
                    nodes: [
                        { id: 'tabs/7', text: 'Tabs Overflow', icon: 'fa fa-folder-o' },
                        { id: 'tabs/8', text: 'Tooltips', icon: 'fa fa-folder-o' },
                        { id: 'tabs/9', text: 'Tab Reorder', icon: 'fa fa-folder-o' }
                    ]
                },
                // { id: 'tabs-2.0', text: 'Features 2.0+', img: 'icon-folder', group: true, expanded: true, hidden: true,
                //     nodes: [
                //         { id: 'tabs/10', text: 'Smooth Add/Remove', icon: 'fa fa-folder-o' }
                //     ]
                // },
                { id: 'forms', text: 'Forms Basic', img: 'icon-folder', group: true, expanded: true, hidden: true,
                    nodes: [
                        { id: 'form/1', text: 'Simple Form', icon: 'fa fa-pencil-square-o' },
                        { id: 'form/2',text: 'Auto Templates', icon: 'fa fa-pencil-square-o' },
                        { id: 'form/3', text: 'Field Types', icon: 'fa fa-pencil-square-o' },
                        { id: 'form/4', text: 'Field Groups', icon: 'fa fa-pencil-square-o' },
                        { id: 'form/5', text: 'Multi Page Form', icon: 'fa fa-pencil-square-o' },
                        { id: 'form/6', text: 'Form Tabs', icon: 'fa fa-pencil-square-o' },
                        { id: 'form/7', text: 'Form Toolbar', icon: 'fa fa-pencil-square-o' },
                        { id: 'form/8', text: 'Form in a Popup', icon: 'fa fa-pencil-square-o' },
                        { id: 'form/9', text: 'Events', icon: 'fa fa-pencil-square-o' }
                    ]
                },
                { id: 'forms-1.5', text: 'Features 1.5+', img: 'icon-folder', group: true, expanded: true, hidden: true,
                    nodes: [
                        { id: 'form/10', text: 'Multi Columns', icon: 'fa fa-pencil-square-o' },
                        { id: 'form/11', text: 'Column Span', icon: 'fa fa-pencil-square-o' },
                        { id: 'form/12', text: 'Custom Styling', icon: 'fa fa-pencil-square-o' },
                        { id: 'form/13', text: 'Anchored Fields', icon: 'fa fa-pencil-square-o' },
                        { id: 'form/14', text: 'Maps and Arrays', icon: 'fa fa-pencil-square-o' },
                        { id: 'form/15', text: 'Custom Fields', icon: 'fa fa-pencil-square-o' },
                        { id: 'form/16', text: 'Enable/Disable Fields', icon: 'fa fa-pencil-square-o' },
                        { id: 'form/17', text: 'Show/Hide Fields', icon: 'fa fa-pencil-square-o' },
                        { id: 'form/18', text: 'Context Messages', icon: 'fa fa-pencil-square-o' },
                        { id: 'form/19', text: 'Collapsible Groups', icon: 'fa fa-pencil-square-o' },
                        { id: 'form/20', text: 'Form Actions', icon: 'fa fa-pencil-square-o' },
                        { id: 'form/21', text: 'Custom Errors', icon: 'fa fa-pencil-square-o' },
                        { id: 'form/23', text: 'Lock/Unlock Form', icon: 'fa fa-pencil-square-o' },
                    ]
                },
                // { id: 'forms-2.0', text: 'Features 2.0+', img: 'icon-folder', group: true, expanded: true, hidden: true,
                //     nodes: [
                //         { id: 'form/22', text: 'Apply Focus', icon: 'fa fa-pencil-square-o' },
                //         { id: 'form/23', text: 'Better Groups', icon: 'fa fa-pencil-square-o' },
                //     ]
                // },
                { id: 'fields', text: 'Fields Basic', img: 'icon-folder', group: true, expanded: true, hidden: true,
                    nodes: [
                        { id: 'fields/1', text: 'Numeric', icon: 'fa fa-pencil-square-o' },
                        { id: 'fields/2', text: 'Date, Time & Datetime', icon: 'fa fa-pencil-square-o' },
                        { id: 'fields/3', text: 'Drop Down Lists', icon: 'fa fa-pencil-square-o' },
                        { id: 'fields/4', text: 'Multi Selects', icon: 'fa fa-pencil-square-o' },
                        { id: 'fields/5', text: 'File Upload', icon: 'fa fa-pencil-square-o' },
                        { id: 'fields/6', text: 'Remote Source', icon: 'fa fa-pencil-square-o' }
                    ]
                },
                { id: 'fields-1.5', text: 'Features 1.5', img: 'icon-folder', group: true, expanded: true, hidden: true,
                    nodes: [
                        { id: 'fields/7', text: 'Get/Set Value', icon: 'fa fa-pencil-square-o' },
                        { id: 'fields/8', text: 'Color Picker', icon: 'fa fa-pencil-square-o' }
                    ]
                },
                { id: 'popup', text: 'Popup Basic', img: 'icon-folder', group: true, expanded: true, hidden: true,
                    nodes: [
                        { id: 'popup/1', text: 'Simple Popup', icon: 'fa fa-list-alt' },
                        { id: 'popup/2', text: 'Popup Elements', icon: 'fa fa-list-alt' },
                        { id: 'popup/3', text: 'Popup Content', icon: 'fa fa-list-alt' },
                        { id: 'popup/4', text: 'Lock/Unlock', icon: 'fa fa-list-alt' },
                        { id: 'popup/5', text: 'Slide a Message', icon: 'fa fa-list-alt' },
                        { id: 'popup/6', text: 'Transitions', icon: 'fa fa-list-alt' }
                    ]
                },
                { id: 'popup-1.5', text: 'Features 1.5+', img: 'icon-folder', group: true, expanded: true, hidden: true,
                    nodes: [
                        { id: 'popup/7', text: 'Common Dialogs', icon: 'fa fa-list-alt' },
                        { id: 'popup/8', text: 'Messages', icon: 'fa fa-list-alt' },
                        { id: 'popup/9', text: 'Better Events', icon: 'fa fa-list-alt' },
                        { id: 'popup/10', text: 'Actions', icon: 'fa fa-list-alt' }
                    ]
                },
                // { id: 'popup-2.0', text: 'Features 2.0+', img: 'icon-folder', group: true, expanded: true, hidden: true,
                //     nodes: [
                //         { id: 'popup/11', text: 'Promises', icon: 'fa fa-list-alt' }
                //     ]
                // },
                { id: 'utils', text: 'Utils Basic', img: 'icon-folder', group: true, expanded: true, hidden: true,
                    nodes: [
                        { id: 'utils/1', text: 'Validation', icon: 'fa fa-star-o' },
                        { id: 'utils/2', text: 'Encoding', icon: 'fa fa-star-o' },
                        { id: 'utils/3', text: 'Transitions', icon: 'fa fa-star-o' },
                    ]
                },
                { id: 'utils-1.5', text: 'Features 1.5+', img: 'icon-folder', group: true, expanded: true, hidden: true,
                    nodes: [
                        { id: 'utils/4', text: 'Tooltips', icon: 'fa fa-star-o' },
                        { id: 'utils/5', text: 'Overlays', icon: 'fa fa-star-o' },
                        { id: 'utils/9', text: 'Menus', icon: 'fa fa-star-o' },
                        { id: 'utils/6', text: 'Formatters', icon: 'fa fa-star-o' },
                        { id: 'utils/7', text: 'Color Utils', icon: 'fa fa-star-o' },
                        { id: 'utils/8', text: 'Text Marker', icon: 'fa fa-star-o' },
                        { id: 'utils/10', text: 'Natural Compare', icon: 'fa fa-star-o' },
                    ]
                }
            ],
            onClick: function (event) {
                let cmd = event.target
                if (parseInt(cmd.substr(cmd.length-1)) != cmd.substr(cmd.length-1)) return
                let tmp = w2ui.demo_sidebar.get(cmd)
                document.title = tmp.parent.text + ': ' + tmp.text + ' | w2ui'
                // delete previously created items
                for (let widget in w2ui) {
                    let nm = w2ui[widget].name
                    if (['demo_layout', 'demo_sidebar', 'demo_toolbar'].indexOf(nm) == -1) $().w2destroy(nm)
                }
                // set hash
                if (tmp.parent && tmp.parent.id != '') {
                    last_hash = cmd
                    document.location.hash = '/' + cmd
                }
                // load example
                $.get('examples/'+ cmd +'.html', function (data) {
                    let tmp = data.split('<!--CODE-->')
                    if (tmp.length == 1) {
                        alert('ERROR: cannot parse example.')
                        console.log('ERROR: cannot parse example.', data)
                        return
                    }
                    let w2ui_js  = 'http://rawgit.com/vitmalina/w2ui/master/dist/w2ui.min.js'
                    let w2ui_css = 'http://rawgit.com/vitmalina/w2ui/master/dist/w2ui.min.css'
                    let html     = tmp[1] ? $.trim(tmp[1]) : ''
                    let js       = tmp[2] ? $.trim(tmp[2]) : ''
                    let css      = tmp[3] ? $.trim(tmp[3]) : ''
                    let json     = tmp[4] ? $.trim(tmp[4]) : ''
                    js   = js.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, '')
                    js   = $.trim(js)
                    css  = css.replace(/^<style[^>]*>/, '').replace(/<\/style>$/, '')
                    css  = $.trim(css)
                    json = json.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, '')
                    json = $.trim(json)
                    w2ui.demo_layout.html('main', tmp[0])
                    $('#example_view').html(
                        '<h2>Preview</h2>'+ html +
                            '<script type="text/javascript">' + js + '</script>' +
                            '<style>' + css + '</style>')
                    let code = '<!DOCTYPE html>\n'+
                               '<html>\n'+
                               '<head>\n'+
                               '    <title>W2UI Demo: '+ cmd +'</title>\n'+
                               '    <script src="http://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>\n'+
                               '    <script type="text/javascript" src="'+ w2ui_js +'"></script>\n'+
                               '    <link rel="stylesheet" type="text/css" href="'+ w2ui_css +'" />\n'+
                               '</head>\n'+
                               '<body>\n\n'+
                               html + '\n\n'+
                               (js != '' ? '<script type="text/javascript">\n' + js + '\n</script>\n\n' : '') +
                               (css != '' ? '<style>\n' + css + '</style>\n\n' : '') +
                               '</body>\n'+
                               '</html>'
                    $('#example_code').html('<a href="javascript:" onclick="$(this).next().show(); initCode(); $(this).hide();" class="btn-source">Show Source Code</a>'+
                        '<div id="sourcecode" style="display: none;">'+
                        '<h2>Complete Code '+
                        '<span style="font-weight: normal; padding-left: 10px;">- &nbsp;&nbsp;Copy & paste into your editor or <a href="javascript:" class="jsfiddle">fiddle with code online</a></span> </h2>'+
                        '<textarea class="preview" id="code">'+
                            code.replace(/<textarea/gi, '&lt;textarea').replace(/<\/textarea>/gi, '&lt;/textarea&gt;') +
                        '</textarea>'+
                        (json != '' ?
                            '<h2>JSON file</h2>'+
                            '<textarea class="json" id="json">'+ json +'</textarea>'
                            :
                            '')+
                        '</div>'+
                        '<div style="display: none">'+
                        '<form id="fiddleForm" target="_blank" action="http://jsfiddle.net/api/post/jquery/2.1/" method="post">'+
                        '    <textarea name="title">W2UI Demo: '+ cmd +'</textarea>'+
                        '    <textarea name="resources">'+ w2ui_js +','+ w2ui_css +'</textarea>'+
                        '    <textarea name="html">'+ html.replace(/<textarea/gi, '&lt;textarea').replace(/<\/textarea>/gi, '&lt;/textarea&gt;') +'</textarea>'+
                        '    <textarea name="js">'+ js +'</textarea>'+
                        '    <textarea name="css">'+ css +'</textarea>'+
                        '    <textarea name="wrap">l</textarea>'+
                        '</form>'+
                        '</div>')
                })
            }
        }
    }
    // init layout
    $().w2toolbar(conf.demo_toolbar)
    $().w2sidebar(conf.demo_sidebar)
    $('#demo_layout').w2layout(conf.demo_layout)
    // init sidebar
    w2ui.demo_layout.html('top', '<div style="padding: 18px 0 0 20px; font-size: 18px;">W2UI Demos</div><div id="demo_toolbar"></div>')
    w2ui.demo_layout.html('left', w2ui.demo_sidebar)

    setTimeout(hashChanged, 10)
    window.onhashchange = hashChanged

    // check hash
    function hashChanged() {
        // show toolbar
        let hash = String(document.location.hash).substr(2)
        if (hash == '') hash = 'combo/1'
        let sec = hash.split('/')[0]
        let exp = hash.split('/')[1]
        if (parseInt(exp) != exp) { // needed for backward compatibility with what is in google already
            exp = String(exp).split('-')[1]
        }
        let sb = w2ui.demo_sidebar
        w2ui.demo_toolbar.get(sec).checked = true
        w2ui.demo_toolbar.refresh(sec)
        if (last_hash != hash) {
            last_hash = hash
            sb.nodes.forEach(node => {
                if (node.id.substr(0, sec.length) == sec) {
                    sb.show(node.id)
                    sb.expand(node.id)
                } else {
                    sb.hide(node.id)
                }
            })
            w2ui.demo_sidebar.click(sec + '/' + exp || (exp+'/1'))
        } else {
            // w2ui.demo_sidebar.select(hash || (exp+'/1'))
        }
    }
})

function initCode() {
    // CodeMirror
    let text = $('#example_code .preview')
    if (text.length > 0) {
        let cm = CodeMirror(
            function(elt) { text[0].parentNode.replaceChild(elt, text[0]) },
            {
                value        : $.trim(text.val()),
                mode        : 'text/html',
                readOnly    : true,
                gutter        : true,
                lineNumbers    : true
            }
        )
        cm.setSize(null, cm.doc.height + 15)
    }
    text = $('#example_code .json')
    if (text.length > 0) {
        let cm = CodeMirror(
            function(elt) { text[0].parentNode.replaceChild(elt, text[0]) },
            {
                value        : $.trim(text.val()),
                mode        : 'javascript',
                readOnly    : true,
                gutter        : true,
                lineNumbers    : true
            }
        )
        cm.setSize(null, cm.doc.height + 15)
    }
    $('#example_code .jsfiddle').on('click', function () {
        // $('#fiddleForm textarea[name=html]').val(html || '')
        // $('#fiddleForm textarea[name=js]').val(js || '')
        // $('#fiddleForm textarea[name=css]').val(css || '')
        $('#fiddleForm').submit()
    })
}
