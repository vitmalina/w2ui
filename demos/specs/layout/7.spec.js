context("2:Layout", () => {
    context("0: Basic", () => {
        test("7: Nested Layouts", () => {
            bela
                .ready('/w2ui/demos/#/layout/7')
                .let({
                    left: '#nested button:contains(Left)',
                    right: '#nested button:contains(Right)',
                    top: '#nested button:contains(Top)',
                    bottom: '#nested button:contains(Bottom)',
                    preview: '#nested button:contains(Preview)',
                })
                .begin('Prepare layout')
                    .get('@bottom')
                    .click()
                    .get('@preview')
                    .click()
                    .wait('[name="layout2"]', 'to.not.have.class', 'animating')
                    .then(event => {
                        event.win.instant = true
                    })
                .end();

            // do for each panel
            ['left', 'right', 'top', 'preview', 'bottom'].forEach(panel => {
                bela.begin(`Check ${panel} panel`)
                    .get('@' + panel)
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