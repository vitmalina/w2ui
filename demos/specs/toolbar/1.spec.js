context('4:Toolbar', () => {
    context('0: Basic', () => {
        test('1: Simple Toolbar', () => {
            bela
                .ready('/w2ui/demos/#/toolbar/1')
                .get('#toolbar .w2ui-tb-button')
                .should('have.length', 6)
                .begin('Check button')
                    .get('#tb_toolbar_item_item3')
                    .click()
                    .should('have.class', 'checked')
                    .click()
                    .should('not.have.class', 'checked')
                .end()
                .begin('Radio button')
                    .get('#tb_toolbar_item_item6')
                    .click()
                    .get('#tb_toolbar_item_item5')
                    .should('not.have.class', 'checked')
                .end()
        })
    })
})