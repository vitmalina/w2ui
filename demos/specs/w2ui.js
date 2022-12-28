let tmp = {}
bela.custom.add('grid', { timeout: 15000 }, function(gridName, options={}) { // cannot be arrow function, as it has not this
    if (!gridName) {
        let names = ''
        $('.w2ui-grid', this.win.document).each((ind, el) => {
            if (names) names += ', '
            names += '"' + $(el).attr('name') + '"'
        })
        return { success: false, error: 'Grid name is not specified', details: `Grids found on the page: ${names}` }
    }
    if (this.win.w2ui == null || this.win.w2ui[gridName] == null) {
        return { repeat: true }
    }
    let grid = this.win.w2ui[gridName]
    if (grid && options.nowait === true) {

        return { success: true, msg: `${gridName}`, subject: grid }
    }
    let isRendered = (grid.box && grid.box.getAttribute('name') == grid.name ? true : false)
    if (!grid.url) {
        let isLocked = ($ && $(grid.box).find('.w2ui-lock-msg').length > 0 ? true : false)
        if (grid.records.length > 0 ) {
            grid.last.loaded = true
        } else if (!isLocked) {
            grid.last.loaded = true
        }
    }
    if (isRendered && grid.last.loaded === true) {
        let recs = grid.records
        if (recs.length == 0) {
            return { repeat: 10, subject: grid } // repeat 10 times
        }
        let isRecRendered = ($ && $(grid.box).find('.w2ui-record').length > 0 ? true : false)
        let emptySearch = (grid.records.length > 0 && grid.last.search && grid.last.searchIds.length == 0 ? true : false)
        if (recs.length > 0 && !emptySearch && !isRecRendered) {
            return { repeat: true }
        }
        // grid is ready
        return { success: true, msg: `${gridName}`, subject: grid }
    } else {
        return { repeat: true }
    }
})

bela.custom.overwrite('should', function(param, options = {}) { // cannot be arrow function, as it has not this
    let grid = this.proc.subject
    let globals = ['exist', 'not.exist'] // subject does not matter
    if (globals.indexOf(param) == -1 && grid && grid.name && this.win.w2ui[grid.name]) {
        let value = options.args[1]
        let res = {
            msg: `${options.args[0]} ${options.args[1]||''}`,
            details: `Grid "${grid.name}" has ${grid.records.length} record(s) total.`
        }
        if (typeof param == 'string') {
            Object.assign(res, process(param, value))
        } else if (param && typeof param == 'object') {
            let total = 0, good = 0, error, last_res = {}
            let len = Object.keys(param).length
            Object.keys(param).forEach(key => {
                tmp = process(key, param[key])
                if (tmp.success === false && error == null) {
                    error = tmp
                }
                if (tmp.total == null) {
                    Object.assign(last_res, {
                        assertion: true,
                        search: tmp.search,
                        details: tmp.details,
                        msg: tmp.msg

                    })
                    if (tmp.success === true) {
                        tmp.good  = 1
                        tmp.total = 1
                        if (len > 1) {
                            bela.log(tmp.msg || tmp.details, Object.assign({}, last_res))
                        }
                    } else {
                        tmp.good  = 0
                        tmp.total = 1
                        if (len > 1) {
                            bela.error(tmp.msg || tmp.details, Object.assign({}, last_res))
                        }
                    }
                }
                good += tmp.good
                total += tmp.total
            })
            if (error) {
                res.error = error.details
            }
            if (total == 1) {
                Object.assign(res, last_res, { success: good === total, assertion: false })
            } else {
                Object.assign(res, {
                    success: good === total,
                    msg: `${good} of ${total} passed, ${total - good} failed`
                })
            }
        } else {
            res.success = false
            res.msg = 'Wrong arguments'
        }
        return res
    } else {
        return options.originalFn(param, options)
    }

    function process(param, value) {
        let res = { msg: param, details: `Grid has ${grid.records.length} records` }
        switch (param) {
            case 'have.records': {
                if (value) {
                    if (value === true) value = '>0'
                    if (value === false) value = '==0'
                    if (!isNaN(value)) value = '==' + value
                    /* eslint-disable-next-line */
                    if (eval(`${grid.records.length}${value}`) === true) {
                        res.success = true
                        res.msg = `record count ${value}`
                    } else {
                        Object.assign(res, {
                            success: false,
                            details: `Record count is ${grid.records.length}, but condition is ${value}`
                        })
                    }
                } else if (grid.records.length > 0 ) {
                    Object.assign(res, { success: true })
                } else {
                    res = { success: false, details: 'Grid has no records.' }
                }
                break
            }
            case 'have.subset': {
                if (value == null || typeof value != 'object') {
                    Object.assign(res, {
                        success: false,
                        msg: 'have.record "undefined"',
                        details: 'You did not provide record to look for or it is not in JSON format'
                    })
                    break
                }
                if (value && !Array.isArray(value) && typeof value == 'object') {
                    value = [value]
                }
                res.msg = `${param}`
                res.search = value
                // chai raises errors
                res.success = true
                try {
                    chai.expect(grid.records).to.containSubset(value)
                } catch (error) {
                    Object.assign(res, { success: false, error: error.message })
                }
                break
            }
            case 'have.selection': {
                let sel = grid.getSelection()
                if (value) {
                    if (value === true) value = '>0'
                    if (value === false) value = '==0'
                    if (!isNaN(value)) value = '==' + value
                    /* eslint-disable-next-line */
                    if (eval(`${sel.length}${value}`) === true) {
                        res.success = true
                        res.msg = `selected ${value}`
                    } else {
                        Object.assign(res, {
                            success: false,
                            details: `Selection count is ${sel.length}, but condition is ${value}`
                        })
                    }
                } else if (sel.length > 0 ) {
                    Object.assign(res, { success: true })
                } else {
                    res = { success: false, details: 'Grid has no selected records.' }
                }
                break
            }
            default: {
                res = {
                    success: false,
                    msg: `Unrecognized parameter "${param}"`,
                    details: 'Support only, "have.records", "have.selection" and "have.subset"'
                }
            }
        }
        return res
    }
})

bela.custom.overwrite('click', function(button, options = {}) { // cannot be arrow function, as it has not this
    let grid = this.proc.subject
    if (grid && grid.name && this.win.w2ui[grid.name]) {
        let recs = grid.records
        let step = this.proc.steps[this.proc.index]
        step.options.expanded = false

        if (!isNaN(button) && parseInt(button) < recs.length) {  // click on a record
            bela
                .tag(`record ${button}`)
                .get(`#grid_${grid.name}_records tr[index="${button}"]`)
                .click(options)
        } else if (typeof button == 'string') {  // click on toolbar button
            bela
                .tag(`button "${button}"`)
                .wait(`#grid_${grid.name}_toolbar .w2ui-tb-button:has(.w2ui-tb-text:contains(${button}))`, 'not.to.have.class', 'disabled')
                    .tag('when clickable')
                .get(`#grid_${grid.name}_toolbar .w2ui-tb-button .w2ui-tb-text:contains(${button})`)
                .click(options).tag('toolbar button')
        } else {
            return { success: false, error: 'Not sure what you want to click on this grid.'}
        }
        if (options.delay) {
            bela.wait(options.delay)
        }
        if (options.confirm) {
            bela
                .wait(200).tag('Wait for slide down')
                .get(`.w2ui-message button:contains(${options.confirm})`)
                .trigger('mousedown')
                .wait(options.delay || 0)
                .click(options).tag(`"${options.confirm}" to confirm`)
        }
        if (options.menu) {
            bela
                .tag(`drop menu "${options.menu}"`)
                .get(`.w2ui-menu .menu-text:contains(${options.menu})`)
                .trigger('mousedown')
                .wait(options.delay || 0)
                .click(options).tag(`item "${options.menu}"`)
        }
        bela.grid(grid.name)
    } else {
        return options.originalFn(button, options)
    }
})

bela.custom.add('dblclick', function(row, options = {}) { // cannot be arrow function, as it has not this
    let grid = this.proc.subject
    if (grid && grid.name && this.win.w2ui[grid.name]) {
        let recs = grid.records
        let step = this.proc.steps[this.proc.index]
        step.options.expanded = false

        if (!isNaN(row) && parseInt(row) < recs.length) {
            bela
                .get(`#grid_${grid.name}_records tr[index="${row}"]`)
                .click()
                .click().tag('Two clicks is a double click')
        } else {
            bela.error(`Cannot double click record ${row} as it does not exist.`)
        }
        bela.grid(grid.name)
    } else {
        return { success: false, error: 'The subject is not a grid.' }
    }
})

bela.custom.add('search', function(field, options) { // cannot be arrow function, as it has not this
    let grid = this.proc.subject
    if (grid && grid.name && this.win.w2ui[grid.name]) {
        let step = this.proc.steps[this.proc.index]
        step.options.expanded = false

        let search
        if (options && options.args[1]) {
            search = options.args[1]
        }
        if (search == null) {
            search = field
            field = null
        }
        if (field != null) {
            bela.tag(field + '="' + search + '"')
            if (grid.searchData.length > 0) {
                let s0 = grid.searchData[0]
                let sField = grid.getSearch(s0.field)
                if (sField.label == field && s0.value == search) {
                    //empty
                    bela.log('Already applied')
                } else {
                    _search()
                }
            } else {
                _search()
            }
            function _search() {
                // first select a field
                bela
                    .get(`#grid_${grid.name}_search_all`)
                    .click()
                    .clear()
                    .then((event) => {
                        if (event.subj.hasClass('w2ui-select')) {
                            bela
                                .wait('#w2ui-overlay', 'to.appear')
                                .clear()
                        }
                    }).tag('If Search Field is a select')
                    .grid(grid.name).tag('Wait grid reload')
                    // .wait(20) // to allow grid to clear prev server
                    .get(`#tb_${grid.name}_toolbar_item_w2ui-search .w2ui-search-down`).tag('Search drop menu')
                    .click()
                    .wait(`#w2ui-overlay-${grid.name}-searchFields`, 'to.be.visible')
                    .get(`#w2ui-overlay-${grid.name}-searchFields tr td:contains(${field})`).tag(field)
                    .trigger('mousedown')
                    .wait(50) // to show selection
                    .click()
                    .wait(`#w2ui-overlay-${grid.name}-searchFields`, 'to.be.removed')
                    .get(`#grid_${grid.name}_search_all`)
                    .wait(20) // allow drop to populate
                    .then((event) => {
                        if (event.subj.hasClass('w2ui-select')) {
                            bela
                                .click()
                                .wait('#w2ui-overlay', 'to.appear')
                                .get(`#w2ui-overlay .menu-text:contains(${search})`)
                                .trigger('mousedown')
                                .wait(50) // to show selection
                                .click()
                        } else {
                            bela
                                .clear()
                                .type(search)
                        }
                    })
                    .trigger('change')
                    .then(() => {
                        // to wait for grid reload
                        grid.last.loaded = false
                    }).tag('Mark for reload')
            }
        } else {
            bela.tag('ALL="' + search + '"')
            if (grid.searchData.length > 0) {
                let s0 = grid.searchData[0]
                if (s0.value == search) {
                    // empty
                    bela.log('Already applied')
                } else {
                    _search2()
                }
            } else {
                _search2()
            }
            function _search2() {
                bela.get(`#grid_${grid.name}_search_all`)
                    // .clear()
                    .type(search)
                    .trigger('change')
                    .then(() => {
                        // to wait for grid reload
                        grid.last.loaded = false
                    }).tag('Mark for reload')
            }
        }
        bela.grid(grid.name)
    } else {
        return { success: false, error: 'The subject is not a grid.' }
    }
})

bela.custom.overwrite('select', function(data, options = {}) { // cannot be arrow function, as it has not this
    let grid = this.proc.subject
    if (grid && grid.name && this.win.w2ui[grid.name]) {
        let step = this.proc.steps[this.proc.index]
        step.options.expanded = false

        if (typeof data != 'object') {
            data = { rows: [data] }
        }
        // check if can select all
        if (grid.multiSelect == false && data.all == true) {
            data.all = false
            data.rows = [0]
            bela.error('Cannot select all, as multiselect is not enabled for the grid')
        }
        if (data.all === true) {
            grid.selectAll()
            bela.tag('all records')
        } else {
            let rows = ''
            if (data.recid) {
                rows += `#grid_${grid.name}_rec_${data.recid}`
                bela.tag(`by recid ${data.recid}`)
            }
            if (data.index) {
                rows += `#grid_${grid.name}_records tr[index="${data.index}"]`
                bela.tag(`by index ${data.index}`)
            }
            if (data.rows) {
                data.rows.forEach((row) => {
                    if (rows != '') rows += ', '
                    rows += `#grid_${grid.name}_records tr[index="${row}"]`
                })
                bela.tag(`row(s) [${data.rows}]`)
            }
            if (data.recids) {
                if (!Array.isArray(data.recids)) {
                    data.recids = [data.recids]
                }
                data.recids.forEach((recid) => {
                    if (rows != '') rows += ', '
                    rows += `#grid_${grid.name}_rec_${recid}`
                })
                bela.tag(`recid(s) [${data.recids}]`)
            }
            grid.selectNone()
            bela.get(rows)
                .click({ multiple: true, metaKey: true, ctrlKey: true })
        }
        bela.grid(grid.name)
    } else {
        return options.originalFn(data, options)
    }
})

// bela.custom.add('delete', function(field, options = {}) { // cannot be arrow function, as it has not this
//     let grid = this.proc.subject
//     if (grid && grid.name && this.win.w2ui[grid.name]) {
//         bela
//             .search(field, options.args[1])
//             .grid(grid.name)
//             .wait(200).tag('Wait refresh') // wait for grid to refresh after data is here
//             .then((event) => {
//                 let grid = event.subj
//                 if (grid.records.length > 0) {
//                     bela
//                         .select({ all: true })
//                         .click('Delete', { confirm: 'Delete', delay: 200 })
//                 }
//             })
//     } else {
//         return { success: false, error: 'The subject is not a grid.' }
//     }
// })

bela.custom.add('formFill', function(selector, data={}) { // cannot be arrow function, as it has not this
    data = data.args[1] // needed so other options would not be added on top of it
    if (typeof selector == 'object') {
        data = selector
        selector = '#w2ui-popup'
        bela.error('Selector is not provided')
        return
    } else {
        if (data.repeat === 0) delete data.repeat
    }
    bela
        .wait(selector, 'to.appear')
        .wait(`${selector} .w2ui-lock`, 'not.to.exist')

    Object.keys(data).forEach(prop => {
        let val = data[prop],
            fld = prop,
            index = 0,
            select = ''
        if (typeof val == 'object') {
            fld    = prop + '_search'
            index  = data[prop].index
            val    = data[prop].search || ''
            select = data[prop].select || val
            // if (val === '') {
            //     val = '{downarrow}'
            // }
            if (data[prop].first === true) {
                index = 0
            }
        }
        fld = fld.replace(/\./g, '\\.') // escape name
        // drop down
        bela.begin(`<span class="command"><span>FIELD</span></span> <span class="command-extra">${prop} = ${val}</span>`)
        if (typeof data[prop] == 'boolean') {
            bela.get(`${selector} #${fld}`)
                .check()
                .trigger('change')
                .blur()
        } else if (typeof data[prop] == 'object') {
            if (index != null) {
                bela.get(`${selector} #${fld}`)
                    .focus()
                    .click()
                    .wait(`#w2ui-overlay tr[index=${index}]`, 'to.exist', { timeout: 8000 })
                    .wait(10) // wait to appear
                    .get(`#w2ui-overlay tr[index=${index}]`)
                    .click()
                    .wait('#w2ui-overlay', 'not.to.exist')
                    .get(`${selector} #${fld}`)
                    .blur()
            } else {
                bela.get(`${selector} #${fld}`)
                    .focus()
                    .click()
                    .type(val)
                    .wait(`#w2ui-overlay td.menu-text:contains(${select})`, 'to.exist', { timeout: 8000 })
                    .wait(10) // wait to appear
                    .get(`#w2ui-overlay td.menu-text:contains(${select})`)
                    .click()
                    .wait('#w2ui-overlay', 'not.to.exist')
                    .get(`${selector} #${fld}`)
                    .blur()
            }
            if (data[prop].wait) bela.wait(data[prop].wait)
        } else {
            bela.get(`${selector} #${fld}`)
                .focus()
                .type(val, { delay: val.length > 100 ? 0 : 20})
                .trigger('change')
                .blur()
        }
        bela.end()
        // some then function between field populations
        if (typeof data[prop].then == 'function') {
            bela.then(data[prop].then)
        }
    })
})