context("3:Grid", () => {
    context("0: Basic", () => {
        test("6: Single or Multi Select", () => {
            bela
                .ready('/w2ui/demos/#/grid/6')
                .grid('grid')
                .should('have.records', '>0')
                .click(0, { metaKey: true, ctrlKey: true })
                .click(1, { metaKey: true, ctrlKey: true })
                .should({
                    'have.records': true,
                    'have.selection': 1
                })
                .get('#singleOrMulti')
                .click()
                .grid('grid')
                .click(0, { metaKey: true, ctrlKey: true })
                .click(1, { metaKey: true, ctrlKey: true })
                .should({
                    'have.records': true,
                    'have.selection': 2
                })
        })
    })
})