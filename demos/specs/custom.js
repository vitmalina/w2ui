bela.custom.add('ready', (param, options) => {
    bela.tag('Prepare for tests')
    if (param) {
        bela.open(param, { reload: true })
    } else {
        bela.open('/w2ui/demos', { reload: true })
    }
    bela.if('#w2ui-popup', event => {
        event.win.w2popup.close()
        bela.tag('Close popup, if any')
        bela.wait('#w2ui-popup', 'not.to.exist')
    })
})