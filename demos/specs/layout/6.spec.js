context("2:Layout", () => {
    context("0: Basic", () => {
        test("6: Event Listeners", () => {
            function showHide(event, panel) {
                bela.tag(panel[0].toUpperCase() + panel.substr(1) + ' show/hide')
                    .get('@' + panel).click()
                    .wait('#layout', 'to.not.have.class', 'animating')
                    .get('@main')
                    .should({
                        'not.contain.text': 'hide: ' + panel,
                        'contain.text': 'show: '+ panel
                    })
                    .get('@clear').click()
                    .get('@'+ panel).click()
                    .wait('#layout', 'to.not.have.class', 'animating')
                    .get('@main')
                    .should({
                        'contain.text': 'hide: ' + panel,
                        'not.contain.text': 'show: ' + panel
                    })
            }

            bela
                .ready('/w2ui/demos/#/layout/6')
                .let({
                    main   : '#layout_layout_panel_main',
                    clear  : 'button:contains(Clear Events)',
                    top    : 'button:contains(Top)',
                    left   : 'button:contains(Left)',
                    right  : 'button:contains(Right)',
                    preview: 'button:contains(Preview)',
                    bottom : 'button:contains(Bottom)'
                })
                .then(showHide, 'left')
                .get('#instant').click()
                .then(showHide, 'top')
                .then(showHide, 'right')
                .then(showHide, 'preview')
                .then(showHide, 'bottom')
        })
    })
})