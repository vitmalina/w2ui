context('2:Layout', () => {
    context('0: Basic', () => {
        test('8: Panel with Tabs', () => {
            bela
                .ready('/w2ui/demos/#/layout/8')
                .begin('Check tab count')
                    .get('#layout_layout_panel_main .w2ui-panel-tabs .w2ui-tab')
                    .should('have.length', 3)
                .end()
            for (let i = 1; i <= 3; i++) {
                bela.begin('Check tab ' + i)
                        .get('#tabs_layout_main_tabs_tab_tab'+i)
                        .click()
                        .get('#layout_layout_panel_main .w2ui-panel-content')
                        .should('have.text', 'tab'+ i)
                        .end()
            }
        })
    })
})