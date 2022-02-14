// import { w2overlay } from '../src/w2overlay.js'
import { w2utils } from '../src/w2utils.js'
import { w2tooltip, w2color } from '../src/w2tooltip.js'
import { $, query } from '../src/query.js'

window.query = query
window.w2tooltip = w2tooltip
window.w2color = w2color
window.w2utils = w2utils

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

w2tooltip.show({
    anchor: query('#inp1')[0],
    html: 'Auto show',
    auto: false,
})

// let ret = w2color.attach({
//     anchor: query('#inp1')[0],
//     showOn: 'focus',
//     hideOn: 'never',
//     // auto: true,
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
