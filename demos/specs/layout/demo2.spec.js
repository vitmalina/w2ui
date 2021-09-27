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
                .should('be.visible')
                .get('#layout_layout_resizer_left')
                .should('be.visible')
                .trigger('mousedown')
                .trigger('mousemove', { x: 10, y: 20 })
                .trigger('mouseup')
            .end()
    })
})