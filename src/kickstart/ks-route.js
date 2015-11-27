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
        var tmp  = hash.split('/');
        // check if modules is loaed
        if (tmp[1] && typeof app[tmp[1]] == 'undefined') {
            // if events are available
            if (typeof app.route.trigger == 'function') {
                var eventData = app.route.trigger({ phase: 'before', type: 'route', target: 'self', route: hash });
                if (eventData.isCancelled === true) return false;           
            }
            // load module
            app.require(tmp[1]).done(function () {
                if (app._conf.modules[tmp[1]]) process();
            });
            // if events are available
            if (typeof app.route.trigger == 'function') app.route.trigger($.extend(eventData, { phase: 'after' }));
        } else {
            // process route
            for (var r in routeRE) {
                var params = {};
                var tmp = routeRE[r].path.exec(hash);
                if (tmp) { // match
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