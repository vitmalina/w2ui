// import { w2overlay } from '../src/w2overlay.js'
import { w2tooltip } from '../src/w2tooltip.js'
import { $, query } from '../src/query.js'

window.query = query
window.w2tooltip = w2tooltip

// let func =  (event) => {
//     console.log('enter 1', event)
// }

query('.input')
    .off('.tooltip')
    .on('mouseenter.tooltip', function(event) {
        // console.log('mouse enter')
        // w2tooltip.show(this, 'some')
    })
    .on('mouseleave.tooltip', function(event) {
        // w2tooltip.hide(this)
        // console.log('mouse leave')
    })

w2tooltip.show(query('#inp1')[0], 'some tooltip');
// let tag = w2tooltip.show({
//     anchor: query('#inp1')[0],
//     html: 'Some tooltip'
// })
// console.log(tag)
