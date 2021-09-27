context("2:Layout", () => {
    test("1: Simple Layout", () => {
        bela
            .ready('/w2ui/demos/#/layout/1')
            .begin('Check panels')
                .get('#layout_layout_panel_top')
                .should('be.visible')
                .get('#layout_layout_resizer_top')
                .should('be.hidden')
                .get('#layout_layout_panel_left')
                .should('be.visible')
                .get('#layout_layout_resizer_left')
                .should('be.hidden')
            .end()
    })
})