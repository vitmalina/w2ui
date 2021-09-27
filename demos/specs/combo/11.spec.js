context("1: Combo", () => {
    context("1.5", () => {
        test("1:Flat Sidebar", () => {
            bela
                .ready('/w2ui/demos/#/combo/11')
                .let('@sb', '#layout_layout_panel_left .w2ui-sidebar')
                .get('@sb').find('>div')
                .should({
                    'be.visible': '',
                    'not.have.class': 'w2ui-sidebar-flat',
                    'have.css': {
                        'width': '200px'
                    }
                })
                .get('@sb').find('.w2ui-flat-left')
                .click()
                .wait(300) // time to shrink
                .get('@sb').find('>div')
                .should({
                    'be.visible': true,
                    'have.class': 'w2ui-sidebar-flat',
                    'have.css': {
                        'width': '35px'
                    }
                })
        })

    })
})