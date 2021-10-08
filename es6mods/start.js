import '../libs/jquery/jquery-3.5.1.js'
import { w2ui, w2utils, w2tabs, w2toolbar, w2sidebar, w2grid } from '../dist/w2ui.es6.js'
import '../src/w2compat.js'
// import { w2popup, w2alert, w2confirm, w2prompt } from '../src/w2popup.js'
// import { w2tabs } from '../src/w2tabs.js'
// import { w2toolbar } from '../src/w2toolbar.js'
// import { w2sidebar } from '../src/w2sidebar.js'
// import { w2layout } from '../src/w2layout.js'
// import { w2field, addType, removeType } from '../src/w2field.js'
// import { w2form } from '../src/w2form.js'
// import { w2grid } from '../src/w2grid.js'

import conf_tabs from './conf-tabs.js'
import conf_toolbar from './conf-toolbar.js'
import conf_sidebar from './conf-sidebar.js'
import conf_layout from './conf-layout.js'
import conf_form from './conf-form.js'
import conf_grid from './conf-grid3.js'

// w2field
// addType('myType', function (options) {
//     $(this.el).on('keypress', function (event) {
//         if (event.metaKey || event.ctrlKey || event.altKey
//             || (event.charCode != event.keyCode && event.keyCode > 0)) return;
//         var ch = String.fromCharCode(event.charCode);
//         if (ch != 'a' && ch != 'b' && ch != 'c') {
//             if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;
//             return false;
//         }
//     });
//     $(this.el).on('blur', function (event)  { // keyCode & charCode differ in FireFox
//         var ch = this.value;
//         if (ch != 'a' && ch != 'b' && ch != 'c') {
//             $(this).w2tag(w2utils.lang("Not a single character from the set of 'abc'"), { position: 'top|bottom' });
//         }
//     });
// })
// let field = new w2field('myType')
// field.render($('input.w2field')[0])
$('input').val('E06666').w2field('color')

// tabs
let tabs = new w2tabs(conf_tabs)
// tabs.render($('#box1'))
$('#box1').w2render(tabs)

// toolbar
let toolbar = new w2toolbar(conf_toolbar)
$('#box2').w2render(toolbar)

// sidebar
let sidebar = new w2sidebar(conf_sidebar)
$('#box3').w2render(sidebar)

// layout
// let layout = new w2layout(conf_layout)
// $('#box4').w2render(layout)

// form
// let form = new w2form(conf_form)
// $('#box4').w2render(form)

// form
let grid = new w2grid(conf_grid)
$('#box4').w2render(grid)
// $('#box4').w2grid(conf_grid)

// w2alert('ee')
// w2popup.load({
//     url: 'popup.html',
//     actions: {
//         Ok(event) {
//             w2popup.close()
//         },
//         cancel: {
//             text: 'Cancel ',
//             class: 'w2ui-btn-red',
//             onClick(event) {
//                 w2popup.close()
//             }
//         }
//     }
// }).then(() => {
//     w2alert('444')
// })
// w2alert(11).ok
// w2popup.open({ title: 'some' }).then(() => {
//     alert(1)
// })

// window.w2alert = w2alert
// window.w2confirm = w2confirm
// window.w2prompt = w2prompt