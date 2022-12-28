context('3:Grid', () => {
    context('0: Basic', () => {
        test('5: Data Source', () => {
            bela
                .ready('/w2ui/demos/#/grid/4')
                .grid('grid')
                .should({
                    'have.records': '>0',
                    'have.subset': [
                        { fname: 'John', lname: 'Doe' },
                        { fname: 'Sergei', lname: 'Rachmaninov' }
                    ],
                })
        })
    })
})