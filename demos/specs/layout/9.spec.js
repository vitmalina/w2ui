context('2:Layout', () => {
    context('0: Basic', () => {
        test('9: Panel with Toolbar', () => {
            bela
                .ready('/w2ui/demos/#/layout/9')
                .begin('Check toolbar')
                    .get('#layout_layout_panel_main .w2ui-panel-toolbar .w2ui-tb-button')
                    .should('have.length', 5)
                .end();
            ['item1', 'item3', 'item4', 'item5'].forEach(it => {
                bela
                        .begin('Toolbar ' + it)
                            .get(`#tb_layout_main_toolbar_item_${it}`)
                            .click()
                            .get('#layout_layout_panel_main .w2ui-panel-content')
                            .should('contain.text', 'TARGET: ' + it)
                        .end()
            })
        })
    })
})