import '../libs/jquery/jquery-3.5.1.js'
import '../src/w2utils.js'
import { w2popup, w2alert, w2confirm, w2prompt } from '../src/w2popup.js'
// import '../src/w2popup.js'
import { w2tabs } from '../src/w2tabs.js'
import { w2toolbar } from '../src/w2toolbar.js'
import { w2sidebar } from '../src/w2sidebar.js'
import { w2layout } from '../src/w2layout.js'
import conf_tabs from './conf-tabs.js'
import conf_toolbar from './conf-toolbar.js'
import conf_sidebar from './conf-sidebar.js'
import conf_layout from './conf-layout.js'

// tabs
let tabs = new w2tabs(conf_tabs)
$('#box1').w2render(tabs)

// toolbar
let toolbar = new w2toolbar(conf_toolbar)
$('#box2').w2render(toolbar)

// sidebar
let sidebar = new w2sidebar(conf_sidebar)
$('#box3').w2render(sidebar)

// layout
let layout = new w2layout(conf_layout)
$('#box4').w2render(layout)

// w2alert('ee')
w2popup.load({
    url: 'popup.html',
    actions: {
        Ok(event) {
            w2popup.close()
        },
        cancel: {
            text: 'Cancel ',
            class: 'w2ui-btn-red',
            onClick(event) {
                w2popup.close()
            }
        }
    }
}).then(() => {
    w2alert('444')
})
// w2alert(11).ok
// w2popup.open({ title: 'some' }).then(() => {
//     alert(1)
// })

window.w2alert = w2alert
window.w2confirm = w2confirm
window.w2prompt = w2prompt