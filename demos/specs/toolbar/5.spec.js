context('4:Toolbar', () => {
    context('0: Basic', () => {
        test('5: Enable/Disable Buttons', () => {
            bela
                .ready('/w2ui/demos/#/toolbar/5')
                .get('#toolbar .w2ui-tb-button')
                .should('have.length', 4)
                .begin('Disable')
                    .get('#tb_toolbar_item_disable')
                    .click()
                    .wait(20)
                    .get('#toolbar .w2ui-tb-button:eq(2)')
                    .should({
                        'have.css': { opacity: 0.3 },
                        'have.class': 'disabled'
                    })
                .end()
                .begin('Enable')
                    .get('#tb_toolbar_item_enable')
                    .click()
                    .wait(20)
                    .get('#toolbar .w2ui-tb-button:eq(2)')
                    .should({
                        'have.css': { opacity: 1 },
                        'not.have.class': 'disabled'
                    })
                .end()
        })
    })
})