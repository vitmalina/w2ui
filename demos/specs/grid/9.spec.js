context('3:Grid', () => {
    context('0: Basic', () => {
        test('9: Add Remove Records', () => {
            bela
                .ready('/w2ui/demos/#/grid/9')
                .begin('Add One')
                    .grid('grid')
                    .should({
                        'have.records': '==2',
                        'have.subset': { fname: 'John', lname: 'Doe' }
                    })
                    .get('button:contains(Add One Record)')
                    .click()
                    .grid('grid')
                    .should({
                        'have.records': '==3',
                        'have.subset': { fname: 'Jin', lname: 'Franson' }
                    })
                    .get('button:contains(Remove All Added Records)')
                    .click()
                    .grid('grid')
                    .should('have.records', '==2')
                .end()
                .begin('Add Multiple')
                    .get('button:contains(Add Multiple Record)')
                    .click()
                    .grid('grid')
                    .should({
                        'have.records': '==27',
                        'have.subset': { fname: 'Kelly', lname: 'Silver' }
                    })
                .end()
        })
    })
})