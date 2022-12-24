context('3:Grid', () => {
    context('1.5', () => {
        test('29:Advanced Formatting', () => {
            bela
                .ready('/w2ui/demos/#/grid/29')
                .grid('grid')
                .should({
                    // 'have.records': '',
                    'have.subset': [
                        { fname: 'Stuart', lname: 'Motzart', w2ui: { style: 'background-color: #C2F5B4' } }
                    ]
                })
                .begin('Check Formatting')
                    .get('#grid_grid_rec_2') // row style
                    .should('have.css', { 'background-color': 'rgb(194, 245, 180)' })
                    .get('#grid_grid_rec_3') // row class
                    .should('have.class', 'row')
                    .get('#grid_grid_data_3_1') // cell style
                    .should('have.css', { 'background-color': 'rgb(255, 0, 0)' })
                    .get('#grid_grid_data_4_0') // cell class
                    .should('have.class', 'cell1')
                    .get('#grid_grid_data_5_1')
                    .should('have.text', 'http://w2ui.com')
                .end()
        })
    })
})