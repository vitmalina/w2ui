/************************************************
*  Library: KickStart - Minimalistic Framework
*   - Dependencies: jQuery
**/

var kickStart = (function () {
    var app = {};

    // public scope    
    app.modules   = {};
    app.config    = {};
    app.define    = define;
    app.require   = require;
    app.register  = register;

    return app;

    // ===========================================
    // -- Define modules

    function define (mod) {
        // if string - it is path to the file
        if (typeof mod == 'string') {
            $.ajax({ 
                url      : mod,
                dataType : 'text',
                cache    : false,
                async    : false, // do it synchronosly - otherwise errors
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
        if (!$.isArray(mod)) mod = [mod];
        for (var m in mod) {
            if (app.modules.hasOwnProperty(mod[m].name)) {
                console.log('ERROR: module ' + mod[m].name + ' is already registered.');
                return false;
            }
            app.modules[mod[m].name] = $.extend({}, mod[m], { loaded: false, files: {} });
        }
        return true;
    }

    // ===========================================
    // -- Register module

    function register (name, moduleFunction) {
        // check if modules id defined
        if (app.hasOwnProperty(name)) {
            console.log('ERROR: Namespace '+ name +' is already registered');
            return false;
        }
        if (!app.modules.hasOwnProperty(name)) {
            console.log('ERROR: Namespace '+ name +' is not defined, first define it with kickStart.define');
            return false;
        }
        // register module
        var mod = null;
        for (var m in app.modules) {
            if (app.modules[m].name == name) mod = app.modules[m];
        }
        // init module
        app[name] = moduleFunction(mod.files, mod);
        app.modules[name].loaded = true;
        return;
    }

    // ===========================================
    // -- Load Modules

    function require (names, callBack) { // returns promise
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
                } else if (typeof app.modules[name] == 'undefined') { 
                    console.log('ERROR: module ' + name + ' is not defined.');
                } else { 
                    (function (name) { // need closure
                        // load dependencies
                        getFiles(app.modules[name].assets.concat([app.modules[name].main]), function (files) {
                            var main = files[app.modules[name].main];
                            delete files[app.modules[name].main];
                            // register assets
                            app.modules[name].files  = files;
                            app.modules[name].loaded = true;
                            // execute main file
                            try { 
                                eval(main); 
                            } catch (e) { 
                                failed = true;
                                // find error line
                                var err = e.stack.split('\n');
                                var tmp = err[1].match(/<anonymous>:([\d]){1,10}:([\d]{1,10})/gi);
                                if (tmp) tmp = tmp[0].split(':');
                                if (tmp) {
                                    // display error
                                    console.error('ERROR: ' + err[0] + ' ==> ' + app.modules[name].main + ', line: '+ tmp[1] + ', character: '+ tmp[2]);
                                    console.log(e.stack);
                                } else {
                                    console.error('ERROR: ' + app.modules[name].main);
                                    console.log(e.stack);
                                }
                                if (typeof app.config.fail == 'function') app.config.fail(app.modules[name]);
                                if (typeof promise._fail == 'function') promise._fail(app.modules[name]);
                            }
                            // check ready
                            if (typeof app.config.ready == 'function') app.config.ready(app.modules[name]);
                            if (typeof promise._ready == 'function') promise._ready(app.modules[name]);
                            modCount--;
                            isFinished();
                        });
                    })(name);
                }
            }
        }, 1);
        // promise need to be returned immidiately
        return promise;

        function isFinished () {
            if (modCount == 0) {
                if (failed !== true) {
                    if (typeof app.config.done == 'function') app.config.done(app.modules[name]);
                    if (typeof promise._done == 'function') promise._done(app.modules[name]);
                    if (typeof callBack == 'function') callBack();
                }
                if (typeof app.config.always == 'function') app.config.always(app.modules[name]);
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
                    url        : path,
                    dataType: 'text',
                    cache    : false,
                    success : function (data, success, xhr) {
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
        function loadDone () {
            bufferLen--;
            if (bufferLen <= 0) callBack(bufferObj);
        }
    }
})();