/***********************************************************
*  Compatibility with CommonJS and AMD modules
*
*********************************************************/

(function(global, w2ui) {
    if (typeof define=='function' && define.amd) {
        return define(function(){ return w2ui })
    }
    if (typeof exports!='undefined') {
        if (typeof module!='undefined' && module.exports)
            return exports = module.exports = w2ui
        global = exports
    }
    for (let m in w2ui) {
        global[m] = w2ui[m]
    }
})(this, {
    w2ui,
    w2utils,
    w2popup,
    w2alert,
    w2confirm,
    w2prompt
})
