context("2:Layout", () => {
    test("2: Resizable Panels", () => {
        bela
            .ready('/w2ui/demos/#/layout/2')
            .begin('Check panels')
                .get('#layout_layout_panel_top')
                .should('be.visible')
                .get('#layout_layout_resizer_top')
                .should('be.visible')
                .get('#layout_layout_panel_left')
                .should({
                    'be.visible': true,
                    'have.css': {
                        width: '200px'
                    }
                })
            .end()
            .begin('Move Panel')
                .get('#layout_layout_resizer_left')
                .invoke('addClass', 'active')
                .should('be.visible')
                .drag({ divX: 200, step: 5 })
                .invoke('removeClass', 'active')
                .get('#layout_layout_panel_left')
                .should({
                    'have.css': {
                        width: '400px'
                    }
                })
                .get('#layout_layout_resizer_left')
                .drag({ divX: -250, step: 5 })
                .invoke('removeClass', 'active')
                .get('#layout_layout_panel_left')
                .should({
                    'have.css': {
                        width: '150px'
                    }
                })
            .end()
    })
})