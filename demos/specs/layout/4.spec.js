context('2:Layout', () => {
    context('0: Basic', () => {
        test('4: Load Content', () => {
            bela
                .ready('/w2ui/demos/#/layout/4')
                .begin('Manual content')
                    .get('button:contains(Set Content)')
                    .click({ multiple: true })
                    .get('#layout_layout_panel_left .w2ui-panel-content')
                    .wait(10) // wait for content to be set
                    .should('have.text', 'This is some content set manually')
                .end()
                .begin('Load content')
                    .get('button:contains(Load Content 1)')
                    .click({ multiple: true })
                    .wait('network', { url: '**/demos/data/content1.html', count: 2 })
                    .get('#layout_layout_panel_left .w2ui-panel-content')
                    .should('not.contain.text', 'This is some content')
                    .should('contain.text', 'Lorem ipsum')
                .end()
        })
    })
})