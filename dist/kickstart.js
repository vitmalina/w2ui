/* kicstart 0.2.x (nightly) (c) http://w2ui.com/kickstart, vitmalina@gmail.com */
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
                url      : app._conf.baseURL + mod,
                dataType : 'text',
                cache    : app._conf.cache,
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
            if (app._conf.modules.hasOwnProperty(m)) {
                console.log('ERROR: module ' + m + ' is already registered.');
                return false;
            }
            app._conf.modules[m] = $.extend({ assets: {} }, mod[m], { ready: false, files: {} });
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
        if (!app._conf.modules.hasOwnProperty(name)) {
            console.log('ERROR: Namespace '+ name +' is not defined, first define it with kickStart.define');
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
                    console.log('ERROR: module ' + name + ' is not defined.');
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
                                    console.error('ERROR: ' + err[0] + ' ==> ' + app._conf.modules[name].start + ', line: '+ tmp[1] + ', character: '+ tmp[2]);
                                    console.log(e.stack);
                                } else {
                                    console.error('ERROR: ' + app._conf.modules[name].start);
                                    console.log(e.stack);
                                }
                                // if (typeof app.conf.fail == 'function') app.conf.fail(app._conf.modules[name]);
                                if (typeof promise._fail == 'function') promise._fail(app._conf.modules[name]);
                            }
                            // check ready
                            // if (typeof app.conf.ready == 'function') app.conf.ready(app._conf.modules[name]);
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
kickStart.define({ route: { } });
kickStart.register('route', function () {
    // private scope
    var app     = kickStart;
    var routes  = {};
    var routeRE = {};
    var silent;

    addListener();

    var obj = {
        init    : init,
        add     : add,
        remove  : remove,
        go      : go,
        set     : set,
        get     : get,
        process : process,
        list    : list,
        onAdd   : null,
        onRemove: null,
        onRoute : null
    };
    if (typeof w2utils != 'undefined') $.extend(obj, w2utils.event, { handlers: [] });
    return obj;

    /*
    *   Public methods
    */

    function init(route) {
        // default route is passed here
        if (get() === '') {
            go(route);
        } else {
            process();
        }
    }

    function add(route, handler) {
        if (typeof route == 'object') {
            for (var r in route) {
                var tmp = String('/'+ r).replace(/\/{2,}/g, '/');
                routes[tmp] = route[r];
            }
            return app.route;
        }
        route = String('/'+route).replace(/\/{2,}/g, '/');
        // if events are available
        if (typeof app.route.trigger == 'function') {
            var eventData = app.route.trigger({ phase: 'before', type: 'add', target: 'self', route: route, handler: handler });
            if (eventData.isCancelled === true) return false;
        }
        // default behavior
        routes[route] = handler;
        // if events are available
        if (typeof app.route.trigger == 'function') app.route.trigger($.extend(eventData, { phase: 'after' }));
        return app.route;
    }

    function remove(route) {
        route = String('/'+route).replace(/\/{2,}/g, '/');
        // if events are available
        if (typeof app.route.trigger == 'function') {
            var eventData = app.route.trigger({ phase: 'before', type: 'remove', target: 'self', route: route, handler: handler });
            if (eventData.isCancelled === true) return false;
        }
        // default behavior
        delete routes[route];
        delete routeRE[route];
        // if events are available
        if (typeof app.route.trigger == 'function') app.route.trigger($.extend(eventData, { phase: 'after' }));
        return app.route;
    }

    function go(route) {
        route = String('/'+route).replace(/\/{2,}/g, '/');
        setTimeout(function () { window.location.hash = route; }, 1);
        return app.route;
    }

    function set(route) {
        silent = true;
        // do not use go(route) here
        route = String('/'+route).replace(/\/{2,}/g, '/');
        window.location.hash = route;
        setTimeout(function () { silent = false }, 1);
        return app.route;
    }

    function get() {
        return window.location.hash.substr(1).replace(/\/{2,}/g, '/');
    }

    function list() {
        prepare();
        var res = {};
        for (var r in routes) {
            var tmp  = routeRE[r].keys;
            var keys = [];
            for (var t in tmp) keys.push(tmp[t].name);
            res[r] = keys;
        }
        return res;
    }

    function process() {
        if (silent === true) return;
        prepare();
        // match routes
        var hash = window.location.hash.substr(1).replace(/\/{2,}/g, '/');
        if (hash == '') hash = '/';
        // process route
        var isFound = false;
        for (var r in routeRE) {
            var params = {};
            var tmp = routeRE[r].path.exec(hash);
            if (tmp) { // match
                isFound = true;
                var i = 1;
                for (var p in routeRE[r].keys) {
                    params[routeRE[r].keys[p].name] = tmp[i];
                    i++;
                }
                // if events are available
                if (typeof app.route.trigger == 'function') {
                    var eventData = app.route.trigger({ phase: 'before', type: 'route', target: 'self', route: r, params: params });
                    if (eventData.isCancelled === true) return false;
                }
                // default handler
                routes[r]($.extend({ name: r, path: hash }, params));
                // if events are available
                if (typeof app.route.trigger == 'function') app.route.trigger($.extend(eventData, { phase: 'after' }));
            }
        }
        // if route is not registered, see if it is in module definitions
        if (!isFound) {
            // find if a route mataches a module route
            var mods = app._conf.modules;
            for (var name in mods) {
                var mod = mods[name];
                var rt  = mod.route;
                if (typeof rt == 'string') {
                    rt = rt.replace(/\/{2,}/g, '/'); // remove double slashes
                    if (rt[rt.length - 1] == '*') rt = rt.substr(0, rt.length - 1); // remove trailign *
                }
                if (!mod.ready && mod.route && hash.indexOf(rt) === 0) { // only when not yet loaded
                    app.require(name).done(function () {
                        if (app._conf.modules[name]) process();
                    });
                    return;
                }
            }
            // path not found
            if (typeof app.route.trigger == 'function') {
                var eventData = app.route.trigger({ phase: 'before', type: 'error', target: 'self', hash: hash});
                if (eventData.isCancelled === true) return false;
            }
            console.log('ERROR: route "' + hash + '" not found');
            // if events are available
            if (typeof app.route.trigger == 'function') app.route.trigger($.extend(eventData, { phase: 'after' }));
        }
    }

    /*
    *   Private methods
    */

    function prepare() {
        // make sure all routes are parsed to RegEx
        for (var r in routes) {
            if (routeRE[r]) continue;
            var keys = [];
            var path = r
                .replace(/\/\(/g, '(?:/')
                .replace(/\+/g, '__plus__')
                .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, function(_, slash, format, key, capture, optional) {
                    keys.push({ name: key, optional: !! optional });
                    slash = slash || '';
                    return '' + (optional ? '' : slash) + '(?:' + (optional ? slash : '') + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')' + (optional || '');
                })
                .replace(/([\/.])/g, '\\$1')
                .replace(/__plus__/g, '(.+)')
                .replace(/\*/g, '(.*)');
            routeRE[r] = {
                path    : new RegExp('^' + path + '$', 'i'),
                keys    : keys
            }
        }
    }

    function addListener() {
        if (window.addEventListener) {
            window.addEventListener('hashchange', process, false);
        } else {
            window.attachEvent('onhashchange', process);
        }
    }

    function removeListener() {
        if (window.removeEventListener) {
            window.removeEventListener('hashchange', process);
        } else {
            window.detachEvent('onhashchange', process);
        }
    }
});