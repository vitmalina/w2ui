// import { w2overlay } from '../src/w2overlay.js'
import { w2utils } from '../src/w2utils.js'
import { w2tooltip, w2color, w2menu } from '../src/w2tooltip.js'
import { $, query } from '../src/query.js'

window.query = query
window.w2tooltip = w2tooltip
window.w2utils = w2utils

$('.corners input').each(el => {
    w2tooltip.attach(el, {
        html: 'Corner tooltip',
        autoShow: true,
        // showOn: 'focus',
        // hideOn: 'blur'
        // anchorClass: 'my',
        // anchorStyle: 'border: 1px solid red; border-radius: 2px;'
    })
})

$('button').on('click', event => {
    let el = event.target
    let isLong = $(el).attr('long') != null
    let isHide = $(el).attr('hide') != null
    let anchor = $('#inp0')
    anchor.css('height', '120px')
    if (!isHide) {
        // w2tooltip.show({
        //     name: 'tpA',
        //     anchor: anchor[0],
        //     html: 'small',
        //     position: 'left',
        //     hideOn: ['click']
        // })
        // w2tooltip.show({
        //     name: 'tpB',
        //     anchor: anchor[0],
        //     class: 'w2ui-light',
        //     html: 'White small tooltip',
        //     position: 'bottom',
        //     hideOn: ['click']
        // })
        w2tooltip.attach({
            name: 'tp1',
            anchor: anchor[0],
            // position: $('#position').val(),
            // position: 'right|left',
            position: 'top|bottom',
            // position: 'bottom|top',
            // position: 'top',
            // align: 'both',
            // maxWidth: 100,
            // maxHeight: 100,
            // arrowSize: 0,
            // margin: 1,
            autoShowOn: 'focus',
            hideOn: ['doc-click', 'input', 'change'],
            // offsetY: 5,
            html: isLong
                ? `Long text for the tooltip to see how it would wrap if any.<br>
                   Long text for the tooltip to see how it would wrap if any.<br>
                   Long text for the tooltip to see how it would wrap if any.<br>
                   Long text for the tooltip to see how it would wrap if any.<br>
                   Long text for the tooltip to see how it would wrap if any.`
                : 'Small text tooltip',
            class: 'w2ui-light',
            style: 'background-color: white; border: 1px solid red; color: red; text-shadow: none',
            // onShow(event) {
            //     console.log('show', event)
            // },
            // onHide(event) {
            //     console.log('hide', event)
            // },
            // onUpdate(event) {
            //     console.log('update', event)
            // },
            // onMove(event) {
            //     console.log('move', event)
            // }
        })
        // .then(event => {
        //     console.log('then 1', event)
        // })
        // .show(event => {
        //     console.log('show 1', event)
        // })
        // .hide(event => {
        //     console.log('hide 1', event)
        // })
        // .update(event => {
        //     console.log('update 1', event)
        // })
        // .move(event => {
        //     console.log('move 1', event)
        // })
    } else {
        w2tooltip.hide(anchor[0])
    }
})

// let func =  (event) => {
//     console.log('enter 1', event)
// }

// query('.input')
//     .off('.tooltip')
//     .on('mouseenter.tooltip', function(event) {
//         w2tooltip.show(this, 'some input')
//     })
//     .on('mouseleave.tooltip', function(event) {
//         w2tooltip.hide(this)
//     })

// w2tooltip.show({
//     anchor: query('#inp0')[0],
//     position: 'top',
//     html: 'Auto show',
//     style: 'background-color: white; border: 1px solid red; color: red; text-shadow: none'
// })

let ret2 = w2menu.attach({
    type: 'check',
    anchor: query('#inp0')[0],
    // align: 'both',
    items: [
        { id: 1, text: 'item 1', icon: 'w2ui-icon-plus', count1: 4, remove: true, group: false },
        { id: 2, text: 'item 2', icon: 'w2ui-icon-pencil', hotkey: 'Cmd + A' },
        { id: 3, text: 'item 3', icon: 'w2ui-icon-colors' },
        { id: 4, text: 'item 4', icon: 'w2ui-icon-drop' },
    ]
})
.select(event => {
    console.log(event)
    event.preventDefault()
})
.remove(event => {

})
.subMenu(event => {

})
console.log(ret2)
// .liveUpdate(event => {
//     console.log('update', event.color)
// })
// .select(event => {
//     console.log('selected', event.color)
// });

let ret = w2menu.attach({
    anchor: query('#inp6')[0],
    type: 'radio',
    // search: true,
    // filter: true,
    // topHTML: '1',
    // menuStyle: 'border: 1px solid red;',
    // spinner: true,
    items: [
        { id: 1, text: 'item 1', icon1: 'w2ui-icon-plus', count: 'ab', checked: true, disabled: true },
        { id: 2, text: 'item 2', icon: 'w2ui-icon-pencil', remove: true, group: 1, disabled: true },
        { id: 21, text: 'This is some longer item', icon: 'w2ui-icon-colors', remove: true, group: 1 },
        { id: 3, text: 'item 3', icon: 'w2ui-icon-drop',  group: 1,  hotkey: 'Cmd + A' },
        { text: '--' },
        { id: 4, text: 'Has sub items', icon: true, count: '5A', expanded: true, group: false,
            items: [
                { id: 41, text: 'sub item 6', icon: 'w2ui-icon-info', group: 1 },
                { id: 42, text: 'sub item long 7', icon: 'w2ui-icon-info', group: 1 },
                { id: 43, text: 'sub item long 8', icon: 'w2ui-icon-info', group: 1 },
            ]
        },
        { id: 5, text: 'item 5', icon: true, tooltip: 'Some tooltip' },
        { text: '-- group' },
        { id: 6, text: 'item 6', icon: 'w2ui-icon-info', disabled: true },
        { id: 7, text: 'item long 7', icon: 'w2ui-icon-info' },
        { id: 8, text: 'item long 8', icon: 'w2ui-icon-info' },
        { text: '-- No icon items' },
        'Some text w/o an icon',
        'Some text w/o an icon',
        'Some text w/o an icon',
        'Some text w/o an icon',
        'Some text w/o an icon',
        'Some text w/o an icon',
        'Some text w/o an icon',
        'Some text w/o an icon',
        'Some text w/o an icon',
        'Some text w/o an icon',
        'Some text w/o an icon',
    ],
    // advanced: true,
    // position: 'right|left',
    // arrowSize: 14,
    // autoShow: true,
    // html: 'more text',
})
.select(event => {
    console.log(event.item)
})
.remove(event => {
    // console.log(event)
    // event.preventDefault()

})
.subMenu(event => {
    // console.log(event.item.expanded)
})
.hide(event => {
    // console.log('hide')
})
console.log(ret)
