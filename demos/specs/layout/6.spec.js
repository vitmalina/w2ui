context('2:Layout', () => {
    context('0: Basic', () => {
        test('6: Event Listeners', () => {

            function showHide(event, panel) {
                let sel = {
                    main   : '#layout_layout_panel_main',
                    clear  : 'button:contains(Clear Events)',
                    top    : 'button:contains(Top)',
                    left   : 'button:contains(Left)',
                    right  : 'button:contains(Right)',
                    preview: 'button:contains(Preview)',
                    bottom : 'button:contains(Bottom)'
                }

                bela.tag(panel[0].toUpperCase() + panel.substr(1) + ' show/hide')
                    .get(sel[panel]).click()
                    .wait('#layout', 'not.to.have.class', 'animating')
                    .wait(10) // wait for content to show
                    .get(sel.main)
                    .should({
                        'not.contain.text': 'hide: ' + panel,
                        'contain.text': 'show: '+ panel
                    })
                    .get(sel.clear).click()
                    .get(sel[panel]).click()
                    .wait('#layout', 'not.to.have.class', 'animating')
                    .wait(10) // wait for content to show
                    .get(sel.main)
                    .should({
                        'contain.text': 'hide: ' + panel,
                        'not.contain.text': 'show: ' + panel
                    })
            }

            bela
                .ready('/w2ui/demos/#/layout/6')
                .then(showHide, 'left')
                .get('#instant').click()
                .then(showHide, 'top')
                .then(showHide, 'right')
                .then(showHide, 'preview')
                .then(showHide, 'bottom')
        })
    })
})