import query from '../src/query.js'
import { w2tabs } from '../src/w2tabs.js'

let tabs = new w2tabs({
    name     : 'tabs',
    active   : 'tab1',
    right    : '12',
    flow     : 'down',
    tooltip  : 'top',
    routeData: { id: 8, vid: '2.32.3' },
    reorder: true,
    tabs : [
        { id: 'tab1', text: 'Tab 1', route: '/tab1', tooltip: 'some tooltip', style1: 'background-color: red; color: white' },
        { id: 'tab2', text: 'Tab 2', route: '/tab2/:id', closable: false, tooltip: 'some other', hidden1: true },
        { id: 'tab3', text: 'Tab 3', route: '/tab3/:id/view', closable: false, tooltip: 'none', hidden1: true, style: 'min-width1: 400px' },
        { id: 'tab4', text: 'Tab 4', route: '/tab4/:id/some', closable: false, disabled1: true },
        { id: 'tab5', text: 'Tab 5', route: '/tab5/ok/:vid', closable: false },
        // { id: 'tab6', text: 'Tab 6', route: '/tab6/:id/:vid-:id', closable: true, class: 'classssssss' },
        // { id: 'tab7', text: 'Tab 7', route: '/tab7/:id', closable: true },
        // { id: 'tab8', text: 'Tab 8', route: '/tab8/:id', closable: false },
        // { id: 'tab81', text: 'Tab 81', route: '/tab8/:id', closable: true },
        // { id: 'tab82', text: 'Tab 82', route: '/tab8/:id', closable: true },
        // { id: 'tab83', text: 'Tab 83', route: '/tab8/:id', closable: true },
        // { id: 'tab84', text: 'Tab 84', route: '/tab8/:id', closable: true },
        // { id: 'tab85', text: 'Tab 85', route: '/tab8/:id', closable: true },
        // { id: 'tab6.1', text: 'Tab 6.1', route: '/tab8/:id', closable: true },
        // { id: 'tab6.2', text: 'Tab 6.2', route: '/tab8/:id', closable: true },
        { id: 'new', text: '+', style: 'padding-left: 10px; padding-right: 10px; font-weight: bold;' },
    ],
    onReorder(event) {
        console.log('start', event.detail)
        if (event.target == 'new') {
            event.preventDefault()
            return
        }
        this.hide('new')
        event.done(() => {
            console.log('end', event.detail)
            this.show('new')
        })
    },
    onClick(event) {
        if (event.target == 'new') {
            this.insert('new', { id: 'tab-' + (new Date()).getTime(), text: 'Text ' + this.tabs.length, closable: true })
                .then(() => { this.scroll('right') })
        }
    },
    onClose(event) {
    }
});

tabs.render(query('#tabs')[0])
tabs.right = '<span style="white-space: nowrap">new right</span>';
tabs.refresh();

query('#changeTab').on('click', changeTab)
query('#insertTab').on('click', insertTab)

function changeTab() {
    tabs.get('tab2').text = `<div style="width: 200px; border: 1px solid red;">Tab ${(new Date).getTime()}</div>`;
    // tabs.scroll('right')
    tabs.refresh();
}

function insertTab() {
    let id = 'tab-'+(new Date()).getTime()
    tabs.insert('new', { id, text: `Tab ${(new Date).getTime()}`, closable: true })
        .then(() => {
            tabs.select(id)
            tabs.scrollIntoView()
        })
}
