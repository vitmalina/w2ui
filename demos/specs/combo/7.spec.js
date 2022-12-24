context('1: Combo', () => {
    context('1: Basic', () => {
        test('7: Layout & Dynamic Tabs', () => {
            let sel = {
                item1: '#tabs_layout_main_tabs_tab_item1',
                item2: '#tabs_layout_main_tabs_tab_item2',
                item3: '#tabs_layout_main_tabs_tab_item3',
                item4: '#tabs_layout_main_tabs_tab_item4'
            }
            bela
                .ready('/w2ui/demos/#/combo/7')
                .begin('Item 1')
                    .should('not.exist', sel.item1)
                    .get('[name=sidebar] .w2ui-node-text:contains(Item 1)')
                    .click()
                    .get(sel.item1).tag('(Tab Item 1')
                    .click()
                .end()
                .begin('Item 2')
                    .should('not.exist', sel.item2)
                    .get('[name=sidebar] .w2ui-node-text:contains(Item 2)')
                    .click()
                    .get(sel.item2).tag('(Tab Item 2')
                    .click()
                .end()
                .begin('Item 3')
                    .should('not.exist', sel.item3)
                    .get('[name=sidebar] .w2ui-node-text:contains(Item 3)')
                    .click()
                    .get(sel.item3).tag('(Tab Item 3')
                    .click()
                .end()
                .begin('Item 4')
                    .should('not.exist', sel.item4)
                    .get('[name=sidebar] .w2ui-node-text:contains(Item 4)')
                    .click()
                    .get(sel.item4).tag('(Tab Item 4')
                    .click()
                .end()
        })
    })
})