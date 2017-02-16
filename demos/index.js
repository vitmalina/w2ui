$(function () {
    // init layout
    var main_layout = $('#main_layout').w2layout({
        name: 'main_layout',
        panels: [
            { type: 'top', size: 45, style: 'border: 0px; border-bottom: 1px solid silver; background-color: #fff; color: #555;', overflow: 'hidden'},
            { type: 'left', size: 240, resizable: true, style: 'border-right: 1px solid silver;' },
            { type: 'main', style: 'background-color: white;' }
        ]
    });
    w2ui['main_layout'].content('top', '<div style="padding: 12px 20px; font-size: 18px;">W2UI 1.5 Demos</div>');
    // w2ui['main_layout'].content('top', '<div style="padding: 9px;">'+
    //     'Theme: '+
    //     '<select onchange="$(\'#mainCSS\').attr(\'href\', this.value);">'+
    //     '    <option value="../css/w2ui.min.css">Default Theme</option>'+
    //     '    <option value="../css/w2ui-dark.min.css">Dark Theme</option>'+
    //     '</select>&nbsp;&nbsp;&nbsp;'+
    //     'Locale: '+
    //     '<select onchange="w2utils.locale({ path: \'../\', lang: this.value }); alert(\'Localization is only internal functions. You need to refresh to see it.\')">'+
    //     '    <option value="en-us">en-US</option>'+
    //     '    <option value="fr-fr">fr-FR</option>'+
    //     '    <option value="ru-ru">ru-RU</option>'+
    //     '</select>'+
    //     '</div>');
    // init sidebar
    w2ui['main_layout'].content('left', $().w2sidebar({
        name: 'demo-sidebar',
        img: null,
        nodes: [
            { id: 'combo', text: 'Combinations', img: 'icon-folder', group1: true,
                nodes: [
                    { id: 'combo-1', text: 'Sidebar & Grid', icon: 'fa fa-star-o' },
                    { id: 'combo-2', text: 'Grid & Edit', icon: 'fa fa-star-o' },
                    { id: 'combo-3', text: 'Spreadsheet Like Grid', icon: 'fa fa-star-o' },
                    { id: 'combo-4', text: 'Buffered Scroll', icon: 'fa fa-star-o' },
                    { id: 'combo-9', text: 'Infinite Scroll', icon: 'fa fa-star-o' },
                    { id: 'combo-5', text: 'Tabs With Content', icon: 'fa fa-star-o' },
                    { id: 'combo-6', text: 'Layout & Dynamic Tabs', icon: 'fa fa-star-o' },
                    { id: 'combo-7', text: 'Popup & Grid', icon: 'fa fa-star-o' },
                    { id: 'combo-8', text: 'Popup & Layout', icon: 'fa fa-star-o' },
                    { id: 'combo-10', text: 'Dependent Fields', icon: 'fa fa-star-o' }
                ]
            },
            { id: 'layout', text: 'Layout', img: 'icon-folder', group1: true,
                nodes: [
                    { id: 'layout-1', text: 'Simple Layout', icon: 'fa fa-columns' },
                    { id: 'layout-2', text: 'Resizable Panels', icon: 'fa fa-columns' },
                    { id: 'layout-3', text: 'Show/Hide Panels', icon: 'fa fa-columns' },
                    { id: 'layout-4', text: 'Load Content', icon: 'fa fa-columns' },
                    { id: 'layout-5', text: 'Transitions', icon: 'fa fa-columns' },
                    { id: 'layout-6', text: 'Event Listeners', icon: 'fa fa-columns' },
                    { id: 'layout-7', text: 'Nested Layouts', icon: 'fa fa-columns' },
                    { id: 'layout-8', text: 'Panel With Tabs', icon: 'fa fa-columns' },
                    { id: 'layout-9', text: 'Panel With Toolbar', icon: 'fa fa-columns' },
                    { id: 'layout-10', text: 'Panel With Title', icon: 'fa fa-columns' },
                    { id: 'layout-11', text: 'Panel Messages (1.5+)', icon: 'fa fa-columns' }
                ]
            },
            { id: 'grid', text: 'Grid', img: 'icon-folder', group1: true,
                nodes: [
                    { id: 'grid-1', text: 'Simple Grid', icon: 'fa fa-table' },
                    { id: 'grid-3', text: 'Grid Elements', icon: 'fa fa-table' },
                    { id: 'grid-2', text: 'Row Formatting', icon: 'fa fa-table' },
                    { id: 'grid-23',text: 'Cell Formatting', icon: 'fa fa-table' },
                    { id: 'grid-4', text: 'Data Source', icon: 'fa fa-table' },
                    { id: 'grid-5', text: 'Load Data Once', icon: 'fa fa-table' },
                    { id: 'grid-6', text: 'Single or Multi Select', icon: 'fa fa-table' },
                    { id: 'grid-8', text: 'Show/Hide Columns', icon: 'fa fa-table' },
                    { id: 'grid-9', text: 'Add/Remove Records', icon: 'fa fa-table' },
                    { id: 'grid-10', text: 'Select/Unselect Records', icon: 'fa fa-table' },
                    { id: 'grid-11', text: 'Fixed/Resizable', icon: 'fa fa-table' },
                    { id: 'grid-12', text: 'Column Sort', icon: 'fa fa-table' },
                    { id: 'grid-13', text: 'Column Groups', icon: 'fa fa-table' },
                    { id: 'grid-14', text: 'Summary Records', icon: 'fa fa-table' },
                    { id: 'grid-15', text: 'Simple Search', icon: 'fa fa-table' },
                    { id: 'grid-16', text: 'Advanced Search', icon: 'fa fa-table' },
                    { id: 'grid-17', text: 'Grid Toolbar', icon: 'fa fa-table' },
                    { id: 'grid-18', text: 'Master -> Detail', icon: 'fa fa-table' },
                    { id: 'grid-19', text: 'Two Grids', icon: 'fa fa-table' },
                    { id: 'grid-20', text: 'Render to a New Box', icon: 'fa fa-table' },
                    { id: 'grid-21', text: 'Inline Editing', icon: 'fa fa-table' },
                    { id: 'grid-22', text: 'Resizable Columns', icon: 'fa fa-table' },
                    { id: 'grid-24', text: 'Lock/Unlock Grid', icon: 'fa fa-table' },
                    { id: 'grid-25', text: 'Re-Order Columns', icon: 'fa fa-table' },
                    { id: 'grid-26', text: 'Re-Order Records', icon: 'fa fa-table' },
                    { id: 'grid-7',  text: 'Tree-Like Grid (1.5+)', icon: 'fa fa-table' },
                    { id: 'grid-27', text: 'Frozen Columns (1.5+)', icon: 'fa fa-table' },
                    { id: 'grid-28', text: 'Info Bubble (1.5+)', icon: 'fa fa-table' }
                ]
            },
            { id: 'toolbar', text: 'Toolbar', img: 'icon-folder', group1: true,
                nodes: [
                    { id: 'toolbar-1', text: 'Simple Toolbar', icon: 'fa fa-hand-o-up' },
                    { id: 'toolbar-2', text: 'More Buttons Type', icon: 'fa fa-hand-o-up' },
                    { id: 'toolbar-3', text: 'Add/Remove Buttons', icon: 'fa fa-hand-o-up' },
                    { id: 'toolbar-4', text: 'Show/Hide Buttons', icon: 'fa fa-hand-o-up' },
                    { id: 'toolbar-5', text: 'Enable/Disable Buttons', icon: 'fa fa-hand-o-up' },
                    { id: 'toolbar-6', text: 'Menu Buttons (1.5+)', icon: 'fa fa-hand-o-up' },
                    { id: 'toolbar-7', text: 'Color Buttons (1.5+)', icon: 'fa fa-hand-o-up' },
                    { id: 'toolbar-8', text: 'Tooltips (1.5+)', icon: 'fa fa-hand-o-up' },
                    { id: 'toolbar-9', text: 'Custom Buttons (1.5+)', icon: 'fa fa-hand-o-up' },
                    { id: 'toolbar-10', text: 'Toolbar Overflow (1.5+)', icon: 'fa fa-hand-o-up' }
                ]
            },
            { id: 'sidebar', text: 'Sidebar', img: 'icon-folder', group1: true,
                nodes: [
                    { id: 'sidebar-1', text: 'Simple Sidebar', icon: 'fa fa-hand-o-left' },
                    { id: 'sidebar-2', text: 'Add/Remove', icon: 'fa fa-hand-o-left' },
                    { id: 'sidebar-3', text: 'Show/Hide', icon: 'fa fa-hand-o-left' },
                    { id: 'sidebar-4', text: 'Enable/Disable', icon: 'fa fa-hand-o-left' },
                    { id: 'sidebar-5', text: 'Expand/Collapse', icon: 'fa fa-hand-o-left' },
                    { id: 'sidebar-6', text: 'Select/Unselect', icon: 'fa fa-hand-o-left' },
                    { id: 'sidebar-8', text: 'Top & Bottom HTML', icon: 'fa fa-hand-o-left' },
                    { id: 'sidebar-7', text: 'Events', icon: 'fa fa-hand-o-left' },
                    { id: 'sidebar-9', text: 'Flat Sidebar (1.5+)', icon: 'fa fa-hand-o-up' },
                    { id: 'sidebar-10', text: 'In/Out of Focus (1.5+)', icon: 'fa fa-hand-o-up' }
                ]
            },
            { id: 'tabs', text: 'Tabs', img: 'icon-folder', group1: true,
                nodes: [
                    { id: 'tabs-1', text: 'Simple Tabs', icon: 'fa fa-folder-o' },
                    { id: 'tabs-2', text: 'Set a Tab Active', icon: 'fa fa-folder-o' },
                    { id: 'tabs-3', text: 'Closeable Tabs', icon: 'fa fa-folder-o' },
                    { id: 'tabs-4', text: 'Add/Remove Tabs', icon: 'fa fa-folder-o' },
                    { id: 'tabs-5', text: 'Enable/Disabled Tabs', icon: 'fa fa-folder-o' },
                    { id: 'tabs-6', text: 'Show/Hide Tabs', icon: 'fa fa-folder-o' },
                    { id: 'tabs-7', text: 'Tabs Overflow (1.5+)', icon: 'fa fa-folder-o' },
                    { id: 'tabs-8', text: 'Tooltips (1.5+)', icon: 'fa fa-folder-o' }
                ]
            },
            { id: 'forms', text: 'Forms', img: 'icon-folder', group1: true,
                nodes: [
                    { id: 'forms-1', text: 'Simple Form', icon: 'fa fa-pencil-square-o' },
                    { id: 'forms-10',text: 'Auto Templates', icon: 'fa fa-pencil-square-o' },
                    { id: 'forms-2', text: 'Field Types', icon: 'fa fa-pencil-square-o' },
                    { id: 'forms-3', text: 'Large Form', icon: 'fa fa-pencil-square-o' },
                    { id: 'forms-4', text: 'Multi Page Form', icon: 'fa fa-pencil-square-o' },
                    { id: 'forms-5', text: 'Form Tabs', icon: 'fa fa-pencil-square-o' },
                    { id: 'forms-9', text: 'Form Toolbar', icon: 'fa fa-pencil-square-o' },
                    { id: 'forms-8', text: 'Form in a Popup', icon: 'fa fa-pencil-square-o' },
                    { id: 'forms-6', text: 'Events', icon: 'fa fa-pencil-square-o' },
                    { id: 'forms-11', text: 'Form Columns (1.5+)', icon: 'fa fa-pencil-square-o' }
                ]
            },
            { id: 'fields', text: 'Fields', img: 'icon-folder', group1: true,
                nodes: [
                    { id: 'fields-1', text: 'Numeric', icon: 'fa fa-pencil-square-o' },
                    { id: 'fields-2', text: 'Date, Time & Datetime', icon: 'fa fa-pencil-square-o' },
                    { id: 'fields-3', text: 'Drop Down Lists', icon: 'fa fa-pencil-square-o' },
                    { id: 'fields-4', text: 'Multi Selects', icon: 'fa fa-pencil-square-o' },
                    { id: 'fields-5', text: 'File Upload', icon: 'fa fa-pencil-square-o' },
                    { id: 'fields-6', text: 'Remote Source', icon: 'fa fa-pencil-square-o' },
                    { id: 'fields-7', text: 'Get/Set Value (1.5+)', icon: 'fa fa-pencil-square-o' },
                    { id: 'fields-8', text: 'Color Picker (1.5+)', icon: 'fa fa-pencil-square-o' }
                ]
            },
            { id: 'popup', text: 'Popup', img: 'icon-folder', group1: true,
                nodes: [
                    { id: 'popup-1', text: 'Simple Popup', icon: 'fa fa-list-alt' },
                    { id: 'popup-2', text: 'More Options', icon: 'fa fa-list-alt' },
                    { id: 'popup-3', text: 'Popup Elements', icon: 'fa fa-list-alt' },
                    { id: 'popup-4', text: 'Based on Markup', icon: 'fa fa-list-alt' },
                    { id: 'popup-5', text: 'Load Content', icon: 'fa fa-list-alt' },
                    { id: 'popup-6', text: 'Transitions', icon: 'fa fa-list-alt' },
                    { id: 'popup-7', text: 'Slide a Message', icon: 'fa fa-list-alt' },
                    { id: 'popup-9', text: 'Lock Content', icon: 'fa fa-list-alt' },
                    { id: 'popup-8', text: 'Dialogs (1.5+)', icon: 'fa fa-list-alt' },
                    { id: 'popup-10', text: 'Keyboard (1.5+)', icon: 'fa fa-list-alt' },
                    { id: 'popup-11', text: 'Messages (1.5+)', icon: 'fa fa-list-alt' }
                ]
            },
            { id: 'utils', text: 'Utilities', img: 'icon-folder', group1: true,
                nodes: [
                    { id: 'utils-1', text: 'Validation', icon: 'fa fa-star-o' },
                    { id: 'utils-2', text: 'Encoding', icon: 'fa fa-star-o' },
                    { id: 'utils-3', text: 'Transitions', icon: 'fa fa-star-o' },
                    { id: 'utils-4', text: 'Tags (1.5+)', icon: 'fa fa-star-o' },
                    { id: 'utils-5', text: 'Overlays (1.5+)', icon: 'fa fa-star-o' },
                    { id: 'utils-6', text: 'Formatters (1.5+)', icon: 'fa fa-star-o' },
                ]
            }
        ],
        onClick: function (event) {
            var cmd = event.target;
            if (parseInt(cmd.substr(cmd.length-1)) != cmd.substr(cmd.length-1)) return;
            var tmp = w2ui['demo-sidebar'].get(cmd);
            document.title = tmp.parent.text + ': ' + tmp.text + ' | w2ui';
            // delete previously created items
            for (var widget in w2ui) {
                var nm = w2ui[widget].name;
                if (['main_layout', 'demo-sidebar'].indexOf(nm) == -1) $().w2destroy(nm);
            }
            // set hash
            if (tmp.parent && tmp.parent.id != '') {
                var pid = w2ui['demo-sidebar'].get(cmd).parent.id;
                document.location.hash = '!'+ pid + '/' + cmd;
            }
            // load example
            $.get('examples/'+ cmd +'.html', function (data) {
                var tmp = data.split('<!--CODE-->');
                if (tmp.length == 1) {
                    alert('ERROR: cannot parse example.');
                    console.log('ERROR: cannot parse example.', data);
                    return;
                }
                var w2ui_js  = 'http://rawgit.com/vitmalina/w2ui/master/dist/w2ui.min.js';
                var w2ui_css = 'http://rawgit.com/vitmalina/w2ui/master/dist/w2ui.min.css';
                var html     = tmp[1] ? $.trim(tmp[1]) : '';
                var js       = tmp[2] ? $.trim(tmp[2]) : '';
                var css      = tmp[3] ? $.trim(tmp[3]) : '';
                var json     = tmp[4] ? $.trim(tmp[4]) : '';
                js   = js.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, '');
                js   = $.trim(js);
                css  = css.replace(/^<style[^>]*>/, '').replace(/<\/style>$/, '');
                css  = $.trim(css);
                json = json.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, '');
                json = $.trim(json);
                w2ui['main_layout'].content('main', tmp[0]);
                $('#example_view').html(
                        '<h2>Preview</h2>'+ html +
                        '<script type="text/javascript">' + js + '</script>' +
                        '<style>' + css + '</style>');
                var code = '<!DOCTYPE html>\n'+
                           '<html>\n'+
                           '<head>\n'+
                           '    <title>W2UI Demo: '+ cmd +'</title>\n'+
                           '    <script src="http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js"></script>\n'+
                           '    <script type="text/javascript" src="'+ w2ui_js +'"></script>\n'+
                           '    <link rel="stylesheet" type="text/css" href="'+ w2ui_css +'" />\n'+
                           '</head>\n'+
                           '<body>\n\n'+
                           html + '\n\n'+
                           (js != '' ? '<script type="text/javascript">\n' + js + '\n</script>\n\n' : '') +
                           (css != '' ? '<style>\n' + css + '</style>\n\n' : '') +
                           '</body>\n'+
                           '</html>';
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
                    '</div>');
            });
        }
    }));

    // check hash
    setTimeout(function () {
        var tmp = String(document.location.hash).split('/');
        switch (tmp[0]) {
            default:
            case '#!combo':
                w2ui['demo-sidebar'].expand('combo');
                w2ui['demo-sidebar'].click(tmp[1] || 'combo-1');
                break;

            case '#!layout':
                w2ui['demo-sidebar'].expand('layout');
                w2ui['demo-sidebar'].click(tmp[1] || 'layout-1');
                break;

            case '#!grid':
                w2ui['demo-sidebar'].expand('grid');
                w2ui['demo-sidebar'].click(tmp[1] || 'grid-1');
                break;

            case '#!toolbar':
                w2ui['demo-sidebar'].expand('toolbar');
                w2ui['demo-sidebar'].click(tmp[1] || 'toolbar-1');
                break;

            case '#!sidebar':
                w2ui['demo-sidebar'].expand('sidebar');
                w2ui['demo-sidebar'].click(tmp[1] || 'sidebar-1');
                break;

            // case '#!listview':
            //     w2ui['demo-sidebar'].expand('listview');
            //     w2ui['demo-sidebar'].click(tmp[1] || 'listview-1');
            //     break;

            case '#!tabs':
                w2ui['demo-sidebar'].expand('tabs');
                w2ui['demo-sidebar'].click(tmp[1] || 'tabs-1');
                break;

            case '#!popup':
                w2ui['demo-sidebar'].expand('popup');
                w2ui['demo-sidebar'].click(tmp[1] || 'popup-1');
                break;

            case '#!forms':
                w2ui['demo-sidebar'].expand('forms');
                w2ui['demo-sidebar'].click(tmp[1] || 'forms-1');
                break;

            case '#!fields':
                w2ui['demo-sidebar'].expand('fields');
                w2ui['demo-sidebar'].click(tmp[1] || 'fields-1');
                break;

            case '#!utils':
                w2ui['demo-sidebar'].expand('utils');
                w2ui['demo-sidebar'].click(tmp[1] || 'utils-1');
                break;
        }
    }, 100);
});

function initCode() {
    // CodeMirror
    var text = $('#example_code .preview');
    if (text.length > 0) {
        var cm = CodeMirror(
            function(elt) { text[0].parentNode.replaceChild(elt, text[0]); },
            {
                value        : $.trim(text.val()),
                mode        : "text/html",
                readOnly    : true,
                gutter        : true,
                lineNumbers    : true
            }
        );
        cm.setSize(null, cm.doc.height + 15);
    }
    var text = $('#example_code .json');
    if (text.length > 0) {
        var cm = CodeMirror(
            function(elt) { text[0].parentNode.replaceChild(elt, text[0]); },
            {
                    value        : $.trim(text.val()),
                mode        : "javascript",
                readOnly    : true,
                gutter        : true,
                lineNumbers    : true
            }
        );
        cm.setSize(null, cm.doc.height + 15);
    }
    $('#example_code .jsfiddle').on('click', function () {
        // $('#fiddleForm textarea[name=html]').val(html || '');
        // $('#fiddleForm textarea[name=js]').val(js || '');
        // $('#fiddleForm textarea[name=css]').val(css || '');
        $('#fiddleForm').submit();
    });
}
