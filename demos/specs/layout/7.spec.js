context('2:Layout', () => {
    context('0: Basic', () => {
        test('7: Nested Layouts', () => {
            let sel = {
                left: '#nested button:contains(Left)',
                right: '#nested button:contains(Right)',
                top: '#nested button:contains(Top)',
                bottom: '#nested button:contains(Bottom)',
                preview: '#nested button:contains(Preview)',
            }
            bela
                .ready('/w2ui/demos/#/layout/7')
                .begin('Prepare layout')
                    .get(sel.bottom)
                    .click()
                    .get(sel.preview)
                    .click()
                    .wait('[name="layout2"]', 'not.to.have.class', 'animating')
                    .then(event => {
                        event.win.instant = true
                    })
                .end();

            // do for each panel
            ['left', 'right', 'top', 'preview', 'bottom'].forEach(panel => {
                bela.begin(`Check ${panel} panel`)
                    .get(sel[panel])
                    .click()
                    .get('#layout_layout2_panel_' + panel)
                    .should({
                        'have.length': 1,
                        'have.css': {
                            display: 'none'
                        }
                    })
                .end()
            })
        })
    })
})