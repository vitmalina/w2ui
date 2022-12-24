context('2:Layout', () => {
    context('1.5+', () => {
        test('13: Content Changed', () => {
            let main = '#layout_layout_panel_main .w2ui-panel-content'
            bela
                .ready('/w2ui/demos/#/layout/13')
                .begin('Check main panel size')
                    .get(main)
                    .should('have.text', 'main')
                    .get('button:contains(Content 1)')
                    .click()
                    .get(main)
                    .should('have.text', 'Content of the panel')
                    .get('button:contains(Content 2)')
                    .click()
                    .get(main)
                    .should('have.text', 'Some other content')
                    .get('#log')
                    .should('contain.text', 'is replaced with')
                .end()
        })
    })
})