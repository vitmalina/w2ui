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
//         w2tooltip.show(this, 'some input ', event.target.id)
//     })
//     .on('mouseleave.tooltip', function(event) {
//         w2tooltip.hide(this)
//     })

let ret = w2color.show({
    anchor: query('#inp1')[0],
    class: 'w2ui-light',
//     // showOn: 'focus',
//     // hideOn: 'blur',
//     // auto: true,
    html: 'some tooltip'
});
// console.log(ret)
// jQuery('#inp1').w2color({ onSelect: ()=>{}})
