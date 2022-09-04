// import { w2overlay } from '../src/w2overlay.js'
import { w2tooltip } from '../src/w2tooltip.js'
import { $, query } from '../src/query.js'

// window.query = query
// window.w2tooltip = w2tooltip

class WebComp extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
        $(this.shadowRoot).append(`
            <style>
            :host {
                overflow: auto;
            }
            </style>
            <link rel="stylesheet" type="text/css" media="screen" href="../dist/w2ui.css" />
            <web-comp2></web-comp2>
            <div>
                Some HTML
            </div>
            <input id="inp1-wc">
            <div>
                This is some text with some html controls in them. This is some text with some html controls in them. This is some text with some html controls in them. This is some text with some html controls in them.
            </div>
            <div>
                This is some text with some html controls in them. This is some text with some html controls in them. This is some text with some html controls in them. This is some text with some html controls in them.
            </div>
        `)
    }

    connectedCallback() {
        setTimeout(() => {
            // w2tooltip.show(query(this.shadowRoot).find('input')[0], {
            //     html: 'some text',
            //     position: 'top',
            //     hideOnClick: true
            // })
            // query(this.shadowRoot).find('input').each(el => {
            // query('input').each(el => {
            //     w2tooltip.show(el, {
            //         // auto: true,
            //         html: 'some html',
            //         // html: 'some html that is quite long and can be multiline',
            //         // position: 'top|bottom|right|left',
            //         // inputClass: 'custom',
            //         // maxWidth: 600,
            //         // maxHeight: 50,
            //         hideOnClick: true,
            //         class: 'w2ui-light'
            //     })
            //     .show((tag) => {
            //         console.log('show', tag)
            //     })
            //     .hide((tag) => {
            //         console.log('hide', tag)
            //     })
            // })
            // console.log('doc', query('*').eq(0).closest(':host')[0]  instanceof Document)
            // console.log('shadow', $(this.shadowRoot).eq(0).closest(':host')[0]  instanceof Document)
        }, 500)
    }
}

class WebComp2 extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
        $(this.shadowRoot).append(`
            <div> <span> web comp 2</span> </div>
        `)
    }
}
customElements.define('web-comp', WebComp)
customElements.define('web-comp2', WebComp2)

query('web-comp').shadow('input').each(el => {
    w2tooltip.show(el, 'some text')
})
