/************************************************
*  Library: KickStart - Minimalistic Framework
*   - Dependencies: jQuery
**/

var kickStart = (function () {
    // public scope

    var app = {
        _conf   : {
            name    : 'unnamed',
            baseURL : '',
            cache   : false,
            modules : {},
            verbose : true
        },
        define    : define,
        require   : require,
        register  : register
    };
    if (!window.app) window.app = app;
    return app;

    // ===========================================
    // -- Define modules

    function define(mod, callBack) {
        // if string - it is path to the file
        if (typeof mod == 'string') {
            $.ajax({
                url      : app._conf.baseURL + mod,
                dataType : 'text',
                cache    : app._conf.cache,
                success : function (data, success, xhr) {
                    if (success != 'success') {
                        if (app._conf.verbose) console.log('ERROR: error while loading module definition from "'+ mod +'".');
                        return;
                    }
                    try {
                        mod = JSON.parse(data);
                    } catch (e) {
                        if (app._conf.verbose) console.log('ERROR: not valid JSON file  "'+ mod +'".\n'+ e);
                        return;
                    }
                    _process(mod);
                    if (typeof callBack == 'function') callBack();

                },
                error : function (data, err, errData) {
                    if (app._conf.verbose) console.log('ERROR: error while loading module definition from "'+ mod +'".');
                }
            });
        } else {
            _process(mod);
            if (typeof callBack == 'function') callBack();
        }

        function _process(mod) {
            for (var m in mod) {
                if (Array.isArray(mod[m].assets)) {
                    if (app._conf.modules.hasOwnProperty(m)) {
                        if (app._conf.verbose) console.log('ERROR: module ' + m + ' is already registered.');
                    }
                    app._conf.modules[m] = $.extend({ assets: {} }, mod[m], { ready: false, files: {} });
                } else {
                    _process(mod[m]);
                }
            }
        }
    }

    // ===========================================
    // -- Register module

    function register(name, moduleFunction) {
        // check if modules id defined
        if (app.hasOwnProperty(name)) {
            if (app._conf.verbose) console.log('ERROR: Namespace '+ name +' is already registered');
            return false;
        }
        if (!app._conf.modules.hasOwnProperty(name)) {
            if (app._conf.verbose) console.log('ERROR: Namespace '+ name +' is not defined, first define it with kickStart.define');
            return false;
        }
        // register module
        var mod = app._conf.modules[name];
        // init module
        app[name] = moduleFunction(mod.files, mod);
        app._conf.modules[name].ready = true;
        return;
    }

    // ===========================================
    // -- Load Modules

    function require(names, callBack) { // returns promise
        if (!$.isArray(names)) names = [names];
        var modCount = names.length;
        var failed  = false;
        var promise = {
            ready: function (callBack) {     // a module loaded
                promise._ready = callBack;
                return promise;
            },
            fail: function (callBack) {     // a module loading failed
                promise._fail = callBack;
                return promise;
            },
            done: function (callBack) {        // all loaded
                promise._done = callBack;
                return promise;
            },
            always: function (callBack) {
                promise._always = callBack;
                return promise;
            }
        };
        setTimeout(function () {
            for (var n in names) {
                var name = names[n];
                // already loaded ?
                if (typeof app[name] != 'undefined') {
                    modCount--;
                    isFinished();
                } else if (typeof app._conf.modules[name] == 'undefined') {
                    if (app._conf.verbose) console.log('ERROR: module ' + name + ' is not defined.');
                } else {
                    (function (name) { // need closure
                        // load dependencies
                        getFiles(app._conf.modules[name].assets.concat([app._conf.modules[name].start]), function (files) {
                            var start = files[app._conf.modules[name].start];
                            delete files[app._conf.modules[name].start];
                            // register assets
                            app._conf.modules[name].files  = files;
                            app._conf.modules[name].ready  = true;
                            // execute start file
                            eval(start); // if in try block, it would not show errors properly
                            // check ready
                            if (typeof promise._ready == 'function') promise._ready(app._conf.modules[name]);
                            modCount--;
                            isFinished();
                        });
                    })(name);
                }
            }
        }, 1);
        // promise need to be returned immediately
        return promise;

        function isFinished() {
            if (modCount == 0) {
                if (failed !== true) {
                    // if (typeof app.conf.done == 'function') app.conf.done(app._conf.modules[name]);
                    if (typeof promise._done == 'function') promise._done(app._conf.modules[name]);
                    if (typeof callBack == 'function') callBack();
                }
                // if (typeof app.conf.always == 'function') app.conf.always(app._conf.modules[name]);
                if (typeof promise._always == 'function') promise._always();
            }
        }
    }

    // ===========================================
    // -- Loads a set of files and returns
    // -- its contents to the callBack function

    function getFiles (files, callBack) {
        var bufferObj = {};
        var bufferLen = files.length;

        for (var i in files) {
            // need a closure
            (function () {
                var index = i;
                var path  = files[i];
                // check if file is loaded in script tag
                var tmp = $('script[path="'+ path +'"]');
                if (tmp.length > 0) {
                    bufferObj[path] = tmp.html();
                    loadDone();
                } else {
                    // load from url source
                    $.ajax({
                        url      : app._conf.baseURL + path,
                        dataType : 'text',
                        cache    : app._conf.cache,
                        success  : function (data, success, xhr) {
                            if (success != 'success') {
                                if (app._conf.verbose) console.log('ERROR: error while getting a file '+ path +'.');
                                return;
                            }
                            bufferObj[path] = xhr.responseText;
                            loadDone();

                        },
                        error : function (data, err, errData) {
                            if (err == 'error') {
                                if (app._conf.verbose) console.log('ERROR: failed to load '+ files[i] +'.');
                            } else {
                                if (app._conf.verbose) console.log('ERROR: file "'+ files[i] + '" is loaded, but with a parsing error(s) in line '+ errData.line +': '+ errData.message);
                                bufferObj[path] = xhr.responseText;
                                loadDone();
                            }
                        }
                    });
                }
            })();
        }
        // internal counter
        function loadDone() {
            bufferLen--;
            if (bufferLen <= 0) callBack(bufferObj);
        }
    }
})();