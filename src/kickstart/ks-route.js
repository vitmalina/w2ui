kickStart.define({ route: { assets: [] }});
kickStart.register('route', function () {
    // private scope
    var app     = kickStart;
    var routes  = {};
    var routeRE = {};

    addListener();

    var obj = {
        init    : init,
        add     : add,
        remove  : remove,
        go      : go,
        set     : set,
        get     : get,
        info    : info,
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
        window.history.replaceState({}, document.title, '#' + route)
        process()
        return app.route;
    }

    function set(route) {
        route = String('/'+route).replace(/\/{2,}/g, '/');
        window.history.replaceState({}, document.title, '#' + route)
        return app.route;
    }

    function get() {
        return window.location.hash.substr(1).replace(/\/{2,}/g, '/');
    }

    function info() {
        var matches = [];
        var isFound = false;
        var isExact = false;
        // match routes
        var hash = window.location.hash.substr(1).replace(/\/{2,}/g, '/');
        if (hash == '') hash = '/';

        for (var r in routeRE) {
            var params = {};
            var tmp = routeRE[r].path.exec(hash);
            if (tmp != null) { // match
                isFound = true;
                if (!isExact && r.indexOf('*') === -1) {
                    isExact = true;
                }
                var i = 1;
                for (var p in routeRE[r].keys) {
                    params[routeRE[r].keys[p].name] = tmp[i];
                    i++;
                }
                // default handler
                matches.push({ name: r, path: hash, params: params });
            }
        }
        return matches;
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
        prepare();
        // match routes
        var hash = window.location.hash.substr(1).replace(/\/{2,}/g, '/');
        if (hash == '') hash = '/';
        // process route
        var isFound = false;
        var isExact = false;
        var isAutoLoad = false;
        for (var r in routeRE) {
            var params = {};
            var tmp = routeRE[r].path.exec(hash);
            if (tmp != null) { // match
                isFound = true;
                if (!isExact && r.indexOf('*') === -1) {
                    isExact = true;
                }
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
                var res = routes[r]({ name: r, path: hash, params: params }, params);
                // if events are available
                if (typeof app.route.trigger == 'function') app.route.trigger($.extend(eventData, { phase: 'after' }));
                // if hash changed (for example in handler), then do not process rest of old processings
                var current = window.location.hash.substr(1).replace(/\/{2,}/g, '/');
                if (hash !== current) return
            }
        }
        // find if a route matches a module route
        var loadCnt = 0;
        var mods    = app._conf.modules;
        var loading = [];
        for (var name in mods) {
            var mod = mods[name];
            var rt  = mod.route;
            var nearMatch = false;
            if (rt != null) {
                if (typeof rt == 'string') rt = [rt];
                if (Array.isArray(rt)) {
                    rt.forEach(function (str) { checkRoute(str) });
                }
            }
            function checkRoute(str) {
                mod.routeRE = mod.routeRE || {};
                if (mod.routeRE[str] == null) mod.routeRE[str] = prepare(str);
                if (!mod.ready && str && mod.routeRE[str].path.exec(hash) && loading.indexOf(name) == -1) {
                    if (app._conf.verbose) console.log('ROUTER: Auto Load Module "' + name + '"');
                    isAutoLoad = true;
                    loadCnt++;
                    loading.push(name);
                    app.require(name).done(function () {
                        loadCnt--;
                        if (app._conf.modules[name] && loadCnt === 0) process();
                    });
                    return;
                }
            }
        }
        if (!isAutoLoad && !isExact && app._conf.verbose) console.log('ROUTER: Exact route for "' + hash + '" not found');

        if (!isFound) {
            // path not found
            if (typeof app.route.trigger == 'function') {
                var eventData = app.route.trigger({ phase: 'before', type: 'error', target: 'self', hash: hash});
                if (eventData.isCancelled === true) return false;
            }
            if (!isAutoLoad && app._conf.verbose) console.log('ROUTER: Wild card route for "' + hash + '" not found');
            // if events are available
            if (typeof app.route.trigger == 'function') app.route.trigger($.extend(eventData, { phase: 'after' }));
        }
    }

    /*
    *   Private methods
    */

    function prepare(r) {
        if (r != null) {
            return _prepare(r)
        }
        // make sure all routes are parsed to RegEx
        for (var r in routes) {
            if (routeRE[r]) continue;
            routeRE[r] = _prepare(r)
        }

        function _prepare(r) {
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
            return {
                path : new RegExp('^' + path + '$', 'i'),
                keys : keys
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