context('3:Grid', () => {
    context('0: Basic', () => {
        test('8: Show/Hide Columns', () => {
            bela
                .ready('/w2ui/demos/#/grid/8')
                .begin('First column')
                    .grid('grid')
                    .get('#grid_grid_column_0')
                    .should('be.visible')
                    // hide
                    .get('button:contains(Hide First Column)')
                    .click()
                    .should('not.exist', '#grid_grid_column_0')
                    // show
                    .get('button:contains(Show First Column)')
                    .click()
                    .get('#grid_grid_column_0')
                    .should('be.visible')
                .end()
                .begin('Toggle last column')
                    .get('button:contains(Toggle Last Column)')
                    .click()
                    .should('not.exist', '#grid_grid_column_3')
                    .get('button:contains(Toggle Last Column)')
                    .click()
                    .get('#grid_grid_column_3')
                    .should('be.visible')
                .end()
        })
    })
})