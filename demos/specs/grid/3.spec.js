context('3:Grid', () => {
    context('0: Basic', () => {
        test('3: Row Styling', () => {
            bela
                .ready('/w2ui/demos/#/grid/2')
                .grid('grid')
                .should({
                    'have.records': '>1',
                    'have.subset': [
                        { lname: 'Beethoven', w2ui: { style: 'background-color: #C2F5B4' }},
                        { lname: 'Wagner', w2ui: { style: 'color: red' }}
                    ]
                })
                .get('#grid_grid_rec_7')
                .should({
                    'contain.text': 'Beethoven',
                    'not.contain.text': 'Wagner',
                    'have.css': {
                        'background-color': 'rgb(194, 245, 180)',
                        'color': 'rgb(0, 0, 0)'
                    }
                })
                .get('#grid_grid_rec_10')
                .should({
                    'contain.text': 'Wagner',
                    'have.css': {
                        'color': 'rgb(255, 0, 0)'
                    }
                })
        })
    })
})