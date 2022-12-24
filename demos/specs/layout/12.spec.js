context('2:Layout', () => {
    context('1.5+', () => {
        test('12: Fixed Size Main Panel', () => {
            let main = '#layout_layout_panel_main .w2ui-panel-content'
            bela
                .ready('/w2ui/demos/#/layout/12')
                .begin('Check main panel size')
                    .get(main)
                    .should('have.css', { width: '290px'})
                    .get('button:contains(width=700px)')
                    .click()
                    .get(main)
                    .should('have.css', { width: '290px'})
                    .get('button:contains(width=100%)')
                    .click()
                    .get(main)
                    .should('have.css', { width: '290px'})
                .end()
        })
    })
})