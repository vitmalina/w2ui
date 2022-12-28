context('2:Layout', () => {
    context('0: Basic', () => {
        test('5: Transitions', () => {
            bela
                .ready('/w2ui/demos/#/layout/5')
                .begin('Manual content')
                    .get('button:contains(Set Content)')
                    .click({ multiple: true })
                    .get('#layout')
                    .should('have.class', 'animating')
                    .wait('#layout', 'not.to.have.class', 'animating')
                    .get('#layout_layout_panel_left .w2ui-panel-content')
                    .should({
                        'have.length': 1,
                        'have.text': 'This is some content set manually'
                    })
                .end()
                .begin('Load w/ transition')
                    .get('button:contains(Load Content 2)')
                    .click({ multiple: true })
                    .wait('network', { url: '**/demos/data/content2.html', count: 2 })
                    .get('#layout')
                    .should('have.class', 'animating')
                    .wait('#layout', 'not.to.have.class', 'animating')
                    .get('#layout_layout_panel_left .w2ui-panel-content')
                    .should({
                        'not.contain.text': 'This is some content',
                        'contain.text': 'some image'
                    })
                .end()
        })
    })
})