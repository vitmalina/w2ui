context('2:Layout', () => {
    context('0: Basic', () => {
        test('10: Panel with Titles', () => {
            bela
                .ready('/w2ui/demos/#/layout/10')
                .begin('Check titles')
                    .get('#layout_layout_panel_top .w2ui-panel-title')
                    .should('have.text', 'top title')
                    .get('#layout_layout_panel_left .w2ui-panel-title')
                    .should('have.text', 'left title')
                    .get('#layout_layout_panel_main .w2ui-panel-title')
                    .should('have.text', 'Main Title')
        .end()
        })
    })
})