import '../libs/jquery/jquery-3.5.1.js'
import '../src/w2utils.js'
import { w2tabs } from '../src/w2tabs.js'
import { w2toolbar } from '../src/w2toolbar.js'
import { w2sidebar } from '../src/w2sidebar.js'
import conf_tabs from './conf-tabs.js'
import conf_toolbar from './conf-toolbar.js'
import conf_sidebar from './conf-sidebar.js'

// tabs
let tabs = new w2tabs(conf_tabs)
$('#box1').w2render(tabs)

// toolbar
let toolbar = new w2toolbar(conf_toolbar)
$('#box2').w2render(toolbar)

// toolbar
let sidebar = new w2sidebar(conf_sidebar)
$('#box3').w2render(sidebar)
