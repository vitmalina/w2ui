context('1: Combo', () => {
    context('1: Basic', () => {
        test('1: Sidebar & Grid', () => {
            bela
                .ready('/w2ui/demos/#/combo/1')
                .begin('Grid 1')
                    .get('[name=sidebar] .w2ui-node-text:contains(Grid 1)')
                    .click()
                    .grid('grid1')
                    .should('have.records')
                .end()
                .begin('Grid 2')
                    .get('[name=sidebar] .w2ui-node-text:contains(Grid 2)')
                    .click()
                    .grid('grid2')
                    .should('have.records')
                .end()
                .begin('Some HTML')
                    .get('[name=sidebar] .w2ui-node-text:contains(Some HTML)')
                    .click()
                    .get('.w2ui-panel-content div:contains(Some HTML)')
                .end()

        })
    })
})