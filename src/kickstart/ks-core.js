/************************************************
*  Library: KickStart - Minimalistic Framework
*   - Dependencies: jQuery
**/

var kickStart = (function () {
    // public scope    

    var app = {
        _config   : { 
            baseURL : '',
            cache   : false, 
            modules : {}
        },
        define    : define,
        require   : require,
        register  : register
    };
    if (!window.app) window.app = app;
    return app;

    // ===========================================
    // -- Define modules

    function define(mod) {
        // if string - it is path to the file
        if (typeof mod == 'string') {
            $.ajax({ 
                url      : app._config.baseURL + mod,
                dataType : 'text',
                cache    : app._config.cache,
                async    : false, // do it synchronously - otherwise errors
                success : function (data, success, xhr) {
                    if (success != 'success') {
                        console.log('ERROR: error while loading module definition from "'+ mod +'".');
                        return;
                    }
                    try { 
                        mod = JSON.parse(data); 
                    } catch (e) {
                        console.log('ERROR: not valid JSON file  "'+ mod +'".\n'+ e);
                        return;                        
                    }
                },
                error : function (data, err, errData) {
                    console.log('ERROR: error while loading module definition from "'+ mod +'".');
                }
            });
        }
        for (var m in mod) {
            if (app._config.modules.hasOwnProperty(m)) {
                console.log('ERROR: module ' + m + ' is already registered.');
                return false;
            }
            app._config.modules[m] = $.extend({ assets: {} }, mod[m], { ready: false, files: {} });
        }
        return true;
    }

    // ===========================================
    // -- Register module

    function register(name, moduleFunction) {
        // check if modules id defined
        if (app.hasOwnProperty(name)) {
            console.log('ERROR: Namespace '+ name +' is already registered');
            return false;
        }
        if (!app._config.modules.hasOwnProperty(name)) {
            console.log('ERROR: Namespace '+ name +' is not defined, first define it with kickStart.define');
            return false;
        }
        // register module
        var mod = app._config.modules[name];
        // init module
        app[name] = moduleFunction(mod.files, mod);
        app._config.modules[name].ready = true;
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
                } else if (typeof app._config.modules[name] == 'undefined') { 
                    console.log('ERROR: module ' + name + ' is not defined.');
                } else { 
                    (function (name) { // need closure
                        // load dependencies
                        getFiles(app._config.modules[name].assets.concat([app._config.modules[name].start]), function (files) {
                            var start = files[app._config.modules[name].start];
                            delete files[app._config.modules[name].start];
                            // register assets
                            app._config.modules[name].files  = files;
                            app._config.modules[name].ready  = true;
                            // execute start file
                            try { 
                                eval(start); 
                            } catch (e) { 
                                failed = true;
                                // find error line
                                var err = e.stack.split('\n');
                                var tmp = err[1].match(/<anonymous>:([\d]){1,10}:([\d]{1,10})/gi);
                                if (tmp) tmp = tmp[0].split(':');
                                if (tmp) {
                                    // display error
                                    console.error('ERROR: ' + err[0] + ' ==> ' + app._config.modules[name].start + ', line: '+ tmp[1] + ', character: '+ tmp[2]);
                                    console.log(e.stack);
                                } else {
                                    console.error('ERROR: ' + app._config.modules[name].start);
                                    console.log(e.stack);
                                }
                                // if (typeof app.config.fail == 'function') app.config.fail(app._config.modules[name]);
                                if (typeof promise._fail == 'function') promise._fail(app._config.modules[name]);
                            }
                            // check ready
                            // if (typeof app.config.ready == 'function') app.config.ready(app._config.modules[name]);
                            if (typeof promise._ready == 'function') promise._ready(app._config.modules[name]);
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
                    // if (typeof app.config.done == 'function') app.config.done(app._config.modules[name]);
                    if (typeof promise._done == 'function') promise._done(app._config.modules[name]);
                    if (typeof callBack == 'function') callBack();
                }
                // if (typeof app.config.always == 'function') app.config.always(app._config.modules[name]);
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
                $.ajax({
                    url      : app._config.baseURL + path,
                    dataType : 'text',
                    cache    : app._config.cache,
                    success  : function (data, success, xhr) {
                        if (success != 'success') {
                            console.log('ERROR: error while getting a file '+ path +'.');
                            return;
                        }
                        bufferObj[path] = xhr.responseText;
                        loadDone();

                    },
                    error : function (data, err, errData) {
                        if (err == 'error') {
                            console.log('ERROR: failed to load '+ files[i] +'.');
                        } else {
                            console.log('ERROR: file "'+ files[i] + '" is loaded, but with a parsing error(s) in line '+ errData.line +': '+ errData.message);
                            bufferObj[path] = xhr.responseText;
                            loadDone();
                        }
                    }
                });
            })();
        }
        // internal counter
        function loadDone() {
            bufferLen--;
            if (bufferLen <= 0) callBack(bufferObj);
        }
    }
})();