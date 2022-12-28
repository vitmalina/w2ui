context('1: Combo', () => {
    context('1: Basic', () => {
        test('4: Virtual Scroll', () => {
            bela
                .ready('/w2ui/demos/#/combo/4')
                .begin('Check ghe grid')
                    .grid('grid')
                    .should('have.records', '==25000')
                    .get('#grid_grid_records tr')
                    .should('have.length', 20)
                    .get('#grid_grid_records')
                    .invoke('scrollTop', 35e4).tag('scroll to 350,000px top')
                    .wait(10) // need to wait for scroll to apply
                    .get('#grid_grid_records tr')
                    .should('have.length', 44) // records in the view
                .end()
        })
    })
})