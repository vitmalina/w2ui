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

let ret = w2color.attach({
    anchor: query('#inp6')[0],
    autoShowOn: 'focus',
    // advanced: true,
    // position: 'right|left',
    // arrowSize: 14,
    // autoShow: true,
    // html: 'more text',
})
.liveUpdate(event => {
    console.log('update', event.color)
})
.select(event => {
    console.log('selected', event.color)
});

// let ret = w2menu.attach({
//     anchor: query('#inp6')[0],
//     items: [
//         { id: 1, text: 'item 1' },
//         { id: 2, text: 'item 2' },
//         { id: 3, text: 'item 3' },
//         { id: 4, text: 'item 4' },
//         { id: 5, text: 'item 5' },
//         { id: 6, text: 'item 6' },
//     ],
//     html: 'dd'
//     // advanced: true,
//     // position: 'right|left',
//     // arrowSize: 14,
//     // autoShow: true,
//     // html: 'more text',
// })
console.log(ret)
