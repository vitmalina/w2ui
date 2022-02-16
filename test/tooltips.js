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
    // anchor.css('width', '340px')
    if (!isHide) {
        w2tooltip.show({
            name: 'tp1',
            anchor: anchor[0],
            // position: $('#position').val(),
            position: 'top|bottom',
            align: 'left',
            // maxWidth: 200,
            // tipSize: 12,
            html: isLong
                ? `Long text for the tooltip to see how it would wrap if any.<br>
                   Long text for the tooltip to see how it would wrap if any.<br>
                   Long text for the tooltip to see how it would wrap if any.<br>
                   Long text for the tooltip to see how it would wrap if any.<br>
                   Long text for the tooltip to see how it would wrap if any.`
                : 'Small tooltip',
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

// let ret = w2color.attach({
//     anchor: query('#inp1')[0],
//     showOn: 'focus',
//     hideOn: 'never',
//     // autoShow: true,
//     // html: 'more text',
//     // hideOnClick: true,
//     // hideOnChange: true
// })
// .then(event => {
//     console.log('then', event)
// })
// .show(event => {
//     // debugger
//     console.log('show', event)
// })
// .hide(event => {
//     console.log('hide', event)
// })
// .select(event => {
//     // console.log('selected', event)
// });
// console.log(ret)
