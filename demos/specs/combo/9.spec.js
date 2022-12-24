context('1: Combo', () => {
    context('1: Basic', () => {
        test('9: Popup & Layout', () => {
            bela
                .ready('/w2ui/demos/#/combo/9')
                .get('button:contains(Open Popup)')
                .click()
                .wait('#w2ui-popup', 'to.be.visible')
                .begin('Check grid')
                    .grid('grid')
                    .should({
                        'have.records': '>=3',
                        'have.subset': [
                            { state: 'Open', priority: 2 },
                            { state: 'Closed', priority: 1 }
                        ]
                    })
                .end()
                .begin('Check Some HTML')
                    .get('#w2ui-popup [name=sidebar] #node_html')
                    .click()
                    .wait(1) // wait for text to display
                    .get('#layout_layout_panel_main .w2ui-panel-content')
                    .should('contain.text', 'Some HTML')
                    .get('#w2ui-popup [data-click=close]')
                    .click()
                    .wait('#w2ui-popup', 'to.disappear')
                .end()
        })
    })
})