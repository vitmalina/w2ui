context('3:Grid', () => {
    context('0: Basic', () => {
        test('5: Load Data Once', () => {
            bela
                .ready('/w2ui/demos/#/grid/5')
                .grid('grid')
                .should('have.records', '==0')
                .get('button:contains(Load Data)')
                .click()
                .grid('grid')
                .should({
                    'have.records': '>0',
                    'have.subset': [{ fname: 'John', lname: 'Doe' }]
                })
        })
    })
})