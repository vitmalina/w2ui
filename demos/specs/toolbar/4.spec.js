context('4:Toolbar', () => {
    context('0: Basic', () => {
        test('4: Show/Hide Buttons', () => {
            bela
                .ready('/w2ui/demos/#/toolbar/4')
                .get('#toolbar .w2ui-tb-button')
                .should('have.length', 4)
                .begin('Hide')
                    .get('#tb_toolbar_item_hide')
                    .click()
                    .wait(20)
                    .get('#toolbar .w2ui-tb-button:eq(2)')
                    .should({
                        'have.css': { display: 'none' },
                        'have.class': 'hidden'
                    })
                .end()
                .begin('Show')
                    .get('#tb_toolbar_item_show')
                    .click()
                    .wait(20)
                    .get('#toolbar .w2ui-tb-button:eq(2)')
                    .should({
                        'have.css': { display: 'block' },
                        'not.have.class': 'hidden'
                    })
                .end()
        })
    })
})