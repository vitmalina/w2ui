context('1: Combo', () => {
    context('1.5', () => {
        test('3:Inline Tooltips', () => {
            let sel = {
                box1: '#example_view #span1 > span',
                box2: '#example_view #span2 > span',
                grid1: '#grid_grid_records span:contains(move over me)'
            }
            bela
                .ready('/w2ui/demos/#/combo/13')
                .begin('First box')
                    .get(sel.box1).tag('Left box')
                    .trigger('mouseenter')
                    .wait('#w2ui-tag-noid', 'to.appear')
                    .get('#w2ui-tag-noid .w2ui-tag-body')
                    .should({
                        'have.class': 'w2ui-light',
                        'contain.text': 'contain any html',
                        'not.contain.text': 'Light theme'
                    })
                    .get(sel.box1).tag('Left box')
                    .trigger('mouseleave')
                    .wait('#w2ui-tag-noid', 'to.disappear')
                .end()
                .begin('Second box')
                    .get(sel.box2).tag('Right box')
                    .trigger('mouseenter')
                    .wait('#w2ui-tag-noid', 'to.appear')
                    .get('#w2ui-tag-noid .w2ui-tag-body')
                    .should({
                        'not.have.class': 'w2ui-light',
                        'contain.text': 'contain any html',
                        'not.contain.text': 'Old dark theme'
                    })
                    .get(sel.box1).tag('Left box')
                    .trigger('mouseleave')
                    .wait('#w2ui-tag-noid', 'to.disappear')
                .end()
                .begin('Grid tooltip')
                    .get(sel.grid1).tag('All tooltips')
                    .trigger('mouseenter', { delay: 15, multiple: true })
                    .get('.w2ui-tag')
                    .should('have.length', 18)
                    .get(sel.grid1).tag('All tooltips')
                    .trigger('mouseleave', { delay: 1, multiple: true })
                    .should('not.exist', '.w2ui-tag')
                .end()
        })

    })
})