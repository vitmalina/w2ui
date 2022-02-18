// import { w2overlay } from '../src/w2overlay.js'
import { w2utils } from '../src/w2utils.js'
import { w2tooltip, w2color } from '../src/w2tooltip.js'
import { $, query } from '../src/query.js'

window.query = query
window.w2tooltip = w2tooltip
window.w2color = w2color
window.w2utils = w2utils

$('.corners input').each(el => {
    w2tooltip.attach(el, {
        html: 'Corner tooltip',
        position: 'auto',
        autoShow: true
    })
})

$('button').on('click', event => {
    let el = event.target
    let isLong = $(el).attr('long') != null
    let isHide = $(el).attr('hide') != null
    let anchor = $('#inp0')
    anchor.css('height', '120px')
    if (!isHide) {
        w2tooltip.show({
            name: 'tpA',
            anchor: anchor[0],
            html: 'small',
            position: 'left'
        })
        w2tooltip.show({
            name: 'tpB',
            anchor: anchor[0],
            class: 'w2ui-light',
            html: 'White small tooltip',
            position: 'bottom'
        })
        w2tooltip.show({
            name: 'tp1',
            anchor: anchor[0],
            // position: $('#position').val(),
            position: 'right',
            // position: 'top|bottom',
            // position: 'bottom|top',
            // align: 'both',
            // maxWidth: 100,
            // maxHeight: 100,
            arrowSize: 20,
            html: isLong
                ? `Long text for the tooltip to see how it would wrap if any.<br>
                   Long text for the tooltip to see how it would wrap if any.<br>
                   Long text for the tooltip to see how it would wrap if any.<br>
                   Long text for the tooltip to see how it would wrap if any.<br>
                   Long text for the tooltip to see how it would wrap if any.`
                : 'Small text tooltip',
            class: 'w2ui-light',
            style: 'background-color: white; border: 1px solid red; color: red; text-shadow: none'
        })
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
    name: 'color',
    anchor: query('#inp0')[0],
    showOn: 'focus',
    hideOn: 'never',
    // position: 'right|left',
    // arrowSize: 14,
    // autoShow: true,
    // html: 'more text',
    // hideOnClick: true,
    // hideOnChange: true
})
.then(event => {
    console.log('then', event)
})
.show(event => {
    // debugger
    console.log('show', event)
})
.hide(event => {
    console.log('hide', event)
})
.select(event => {
    // console.log('selected', event)
});
console.log(ret)
