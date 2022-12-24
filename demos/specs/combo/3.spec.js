context('1: Combo', () => {
    context('1: Basic', () => {
        test('3: Spreadsheet Like Grid', () => {
            let range = '#grid_grid_range'
            bela
                .ready('/w2ui/demos/#/combo/3')
                .begin('Check ghe grid')
                    .grid('grid')
                    .should({
                        'have.records': '==100',
                        'have.subset': [
                            { c: 1, d: 67, f: 'some', g: 'text' },
                            { c: 2, d: 35 }
                        ]
                    })
                .end()
                .begin('Check ranges')
                    .should('not.exist', range)
                    .get('button:contains(Mark Range)')
                    .click()
                    .should('exist', range)
                    .get(range)
                    .should({
                        'have.class': 'w2ui-selection',
                        'have.css': {
                            'border': '2px dotted rgb(0, 128, 0)'
                        }
                    })
                    .wait(100) // for visual purposes
                    .get('button:contains(Remove Range)')
                    .click()
                    .should('not.exist', range)
                .end()
                .begin('Check cell format')
                    .get('button:contains(Cell Format)')
                    .click()
                    .get('#grid_grid_data_2_5').tag('Cell F3')
                    .should({
                        'have.css': {
                            'color': 'rgb(255, 255, 255)',
                            'background-color': 'rgb(139, 195, 134)'
                        }
                    })
                    .get('#grid_grid_data_2_6').tag('Cell G3')
                    .should({
                        'have.css': {
                            'color': 'rgb(0, 0, 0)',
                            'background-color': 'rgb(191, 230, 255)'
                        }
                    })
                    .wait(100) // for visual purposes
                    .get('button:contains(Remove Cell Format)')
                    .click()
                    .get('#grid_grid_data_2_5').tag('Cell F3')
                    .should({
                        'have.css': {
                            'color': 'rgb(0, 0, 0)',
                            'background-color': 'rgba(0, 0, 0, 0)'
                        }
                    })
                    .get('#grid_grid_data_2_6').tag('Cell G3')
                    .should({
                        'have.css': {
                            'color': 'rgb(0, 0, 0)',
                            'background-color': 'rgba(0, 0, 0, 0)'
                        }
                    })
                .end()
        })
    })
})