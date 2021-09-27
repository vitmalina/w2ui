context("3:Grid", () => {
    test("4:Cell Formatting", () => {
        bela
            .ready('/w2ui/demos/#/grid/23')
            .grid('grid')
            .should({
                'have.records': '>4',
                'have.subset': [{ fname: 'John', lname: 'Doe', profit: 2500 }]
            })
            .get('#grid_grid_rec_1')
            .should({
                'contain.text': ['John Doe', '$2,500.00'],
                'not.contain.text': ['2500', 'Stuart']
            })
    })
})