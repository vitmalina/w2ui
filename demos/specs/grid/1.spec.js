context('3:Grid', () => {
    context('0: Basic', () => {
        test('1: Simple grid', () => {
            bela
                .ready('/w2ui/demos/#/grid/1')
                .grid('grid')
                .should('have.records')
                .should('have.subset', [{ fname: 'John', lname: 'Doe' }])
                .should('have.subset', [{ fname: 'Sergei', lname: 'Rachmaninov' }])

        })
    })
})