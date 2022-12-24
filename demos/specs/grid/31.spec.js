context('3:Grid', () => {
    context('1.5', () => {
        test('31:Column Tooltip & Title', () => {
            bela
                .ready('/w2ui/demos/#/grid/31')
                .grid('grid')
                .should({
                    'have.records': '',
                    'have.subset': [{ fname: 'Jane', lname: 'Doe' }]
                })
                .begin('Column 1 tooltip')
                    .get('#grid_grid_column_0')
                    .trigger('mouseenter')
                    .wait('.w2ui-tag .w2ui-tag-body', 'to.appear')
                    .get('.w2ui-tag .w2ui-tag-body')
                    .should('contain.text', 'This is a column tooltip')
                    .wait(200) // don't have to have, just for visual effects
                    .get('#grid_grid_column_0')
                    .trigger('mouseleave')
                    .wait('.w2ui-tag .w2ui-tag-body', 'to.disappear')
                .end()
                .begin('Column 2 tooltip')
                    .get('#grid_grid_column_1')
                    .trigger('mouseenter')
                    .wait('.w2ui-tag .w2ui-tag-body', 'to.appear')
                    .get('.w2ui-tag .w2ui-tag-body')
                    .should('contain.text', ['Another', 'tooltip', 'with HTML'])
                    .wait(200) // don't have to have, just for visual effects
                    .get('#grid_grid_column_1')
                    .trigger('mouseleave')
                    .wait('.w2ui-tag .w2ui-tag-body', 'to.disappear')
                .end()
        })
    })
})