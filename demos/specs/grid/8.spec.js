context("3:Grid", () => {
    context("0: Basic", () => {
        test("8: Show/Hide Columns", () => {
            bela
                .ready('/w2ui/demos/#/grid/8')
                .begin('First column')
                    .grid('grid')
                    .get('#grid_grid_column_0')
                    .should('be.visible')
                    // hide
                    .get('button:contains(Hide First Column)')
                    .click()
                    .if('#grid_grid_column_0', 'exists', (event) => {
                        bela.error('First column should be hidden')
                    })
                    // show
                    .get('button:contains(Show First Column)')
                    .click()
                    .get('#grid_grid_column_0')
                    .should('be.visible')
                .end()
                .begin('Toggle last column')
                    .get('button:contains(Toggle Last Column)')
                    .click()
                    .if('#grid_grid_column_3', 'exists', (event) => {
                        bela.error('Last column should be hidden')
                    })
                    .get('button:contains(Toggle Last Column)')
                    .click()
                    .get('#grid_grid_column_3')
                    .should('be.visible')
                .end()
        })
    })
})