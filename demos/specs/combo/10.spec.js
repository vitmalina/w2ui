context('1: Combo', () => {
    context('1: Basic', () => {
        test('10: Dependent Fields', () => {
            bela
                .ready('/w2ui/demos/#/combo/10')
                .formFill('#tab-example', {
                    field1: { search: 'Peter' },
                    field2: { search: 'Andrew' }
                })
        })
    })
})