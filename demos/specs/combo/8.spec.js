context('1: Combo', () => {
    context('1: Basic', () => {
        test('8: Popup & Grid', () => {
            bela
                .ready('/w2ui/demos/#/combo/8')
                .begin('Open popup')
                    .get('button:contains(Open Popup)')
                    .click()
                    .grid('grid')
                    .select(1)
                .end()
                .begin('Check form')
                    .get('#w2ui-popup #fname')
                    .should('have.value', 'Stuart')
                    .get('#w2ui-popup #lname')
                    .should('have.value', 'Motzart')
                    .get('#w2ui-popup [data-click=close]')
                    .click()
                    .wait('#w2ui-popup', 'to.disappear')
                .end()
        })
    })
})