context("1: Combo", () => {
    context("1: Basic", () => {
        test("7: Layout & Dynamic Tabs", () => {
            bela
                .ready('/w2ui/demos/#/combo/7')
                .let({
                    '@item1': '#tabs_layout_main_tabs_tab_item1',
                    '@item2': '#tabs_layout_main_tabs_tab_item2',
                    '@item3': '#tabs_layout_main_tabs_tab_item3',
                    '@item4': '#tabs_layout_main_tabs_tab_item4',
                })
                .begin('Item 1')
                    .should('not.exist', '@item1')
                    .get('[name=sidebar] .w2ui-node-text:contains(Item 1)')
                    .click()
                    .get('@item1').tag('(Tab Item 1')
                    .click()
                .end()
                .begin('Item 2')
                    .should('not.exist', '@item2')
                    .get('[name=sidebar] .w2ui-node-text:contains(Item 2)')
                    .click()
                    .get('@item2').tag('(Tab Item 2')
                    .click()
                .end()
                .begin('Item 3')
                    .should('not.exist', '@item3')
                    .get('[name=sidebar] .w2ui-node-text:contains(Item 3)')
                    .click()
                    .get('@item3').tag('(Tab Item 3')
                    .click()
                .end()
                .begin('Item 4')
                    .should('not.exist', '@item4')
                    .get('[name=sidebar] .w2ui-node-text:contains(Item 4)')
                    .click()
                    .get('@item4').tag('(Tab Item 4')
                    .click()
                .end()
        })
    })
})