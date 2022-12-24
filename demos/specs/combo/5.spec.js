context('1: Combo', () => {
    context('1: Basic', () => {
        test('5: Infinite Scroll', () => {
            bela
                .ready('/w2ui/demos/#/combo/5')
                .begin('Grid auto load')
                    .grid('grid')
                    .should('have.records', '==50')
                    .get('#grid_grid_records')
                    .invoke('scrollTop', 50000).tag('scroll to bottom')
                    .wait(20) // need to wait for scroll to apply
                    .grid('grid')
                    .should('have.records', '==100')
                .end()
                .begin('Grid manual load')
                    .get('#autoLoad')
                    .click()
                    .grid('grid').tag('grid is reloaded')
                    .get('#grid_grid_records')
                    .invoke('scrollTop', 50000).tag('scroll to bottom')
                    .wait(10) // need to wait for scroll to apply
                    .invoke('scrollTop', 50000).tag('scroll to bottom')
                    .wait(10) // need to wait for scroll to apply
                    .grid('grid')
                    .should('have.records', '==50')
                    .get('#grid_grid_rec_more')
                    .click()
                    .grid('grid')
                    .should('have.records', '==100')
                .end()
        })
    })
})