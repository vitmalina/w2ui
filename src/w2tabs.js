/************************************************************************
*   Library: Web 2.0 UI for jQuery (using prototypical inheritance)
*   - Following objects defined
*        - w2tabs        - tabs widget
*        - $().w2tabs    - jQuery wrapper
*   - Dependencies: jQuery, w2utils
*
* == NICE TO HAVE ==
*   - align = left, right, center ??
*
************************************************************************/

(function ($) {
    var w2tabs = function (options) {
        this.box       = null;      // DOM Element that holds the element
        this.name      = null;      // unique name for w2ui
        this.active    = null;
        this.flow      = 'down';    // can be down or up
        this.tooltip   = 'top|left';     // can be top, bottom, left, right
        this.tabs      = [];
        this.routeData = {};        // data for dynamic routes
        this.right     = '';
        this.style     = '';

        $.extend(this, { handlers: [] });
        $.extend(true, this, w2obj.tabs, options);
    };

    // ====================================================
    // -- Registers as a jQuery plugin

    $.fn.w2tabs = function(method) {
        if ($.isPlainObject(method)) {
            // check name parameter
            if (!w2utils.checkName(method, 'w2tabs')) return;
            // extend tabs
            var tabs   = method.tabs || [];
            var object = new w2tabs(method);
            for (var i = 0; i < tabs.length; i++) {
                object.tabs[i] = $.extend({}, w2tabs.prototype.tab, tabs[i]);
            }
            if ($(this).length !== 0) {
                object.render($(this)[0]);
            }
            // register new object
            w2ui[object.name] = object;
            return object;
        } else {
            var obj = w2ui[$(this).attr('name')];
            if (!obj) return null;
            if (arguments.length > 0) {
                if (obj[method]) obj[method].apply(obj, Array.prototype.slice.call(arguments, 1));
                return this;
            } else {
                return obj;
            }
        }
    };

    // ====================================================
    // -- Implementation of core functionality

    w2tabs.prototype = {
        onClick   : null,
        onClose   : null,
        onRender  : null,
        onRefresh : null,
        onResize  : null,
        onDestroy : null,

        tab : {
            id        : null,        // command to be sent to all event handlers
            text      : null,
            route     : null,
            hidden    : false,
            disabled  : false,
            closable  : false,
            tooltip   : null,
            style     : '',
            onClick   : null,
            onRefresh : null,
            onClose   : null
        },

        add: function (tab) {
            return this.insert(null, tab);
        },

        insert: function (id, tab) {
            if (!$.isArray(tab)) tab = [tab];
            // assume it is array
            for (var i = 0; i < tab.length; i++) {
                // checks
                if (tab[i].id == null) {
                    console.log('ERROR: The parameter "id" is required but not supplied. (obj: '+ this.name +')');
                    return;
                }
                if (!w2utils.checkUniqueId(tab[i].id, this.tabs, 'tabs', this.name)) return;
                // add tab
                var newTab = $.extend({}, w2tabs.prototype.tab, tab[i]);
                if (id == null) {
                    this.tabs.push(newTab);
                } else {
                    var middle = this.get(id, true);
                    this.tabs = this.tabs.slice(0, middle).concat([newTab], this.tabs.slice(middle));
                }
                this.refresh(tab[i].id);
                this.resize();
            }
        },

        remove: function () {
            var removed = 0;
            for (var a = 0; a < arguments.length; a++) {
                var tab = this.get(arguments[a]);
                if (!tab) return false;
                removed++;
                // remove from array
                this.tabs.splice(this.get(tab.id, true), 1);
                // remove from screen
                $(this.box).find('#tabs_'+ this.name +'_tab_'+ w2utils.escapeId(tab.id)).remove();
            }
            this.resize();
            return removed;
        },

        select: function (id) {
            if (this.active == id || this.get(id) == null) return false;
            this.active = id;
            this.refresh();
            return true;
        },

        set: function (id, tab) {
            var index = this.get(id, true);
            if (index == null) return false;
            $.extend(this.tabs[index], tab);
            this.refresh(id);
            return true;
        },

        get: function (id, returnIndex) {
            if (arguments.length === 0) {
                var all = [];
                for (var i1 = 0; i1 < this.tabs.length; i1++) {
                    if (this.tabs[i1].id != null) {
                        all.push(this.tabs[i1].id);
                    }
                }
                return all;
            } else {
                for (var i2 = 0; i2 < this.tabs.length; i2++) {
                    if (this.tabs[i2].id == id) { // need to be == since id can be numeric
                        return (returnIndex === true ? i2 : this.tabs[i2]);
                    }
                }
            }
            return null;
        },

        show: function () {
            var obj   = this;
            var shown = 0;
            var tmp   = [];
            for (var a = 0; a < arguments.length; a++) {
                var tab = this.get(arguments[a]);
                if (!tab || tab.hidden === false) continue;
                shown++;
                tab.hidden = false;
                tmp.push(tab.id);
            }
            setTimeout(function () { for (var t=0; t<tmp.length; t++) obj.refresh(tmp[t]); obj.resize(); }, 15); // needs timeout
            return shown;
        },

        hide: function () {
            var obj   = this;
            var hidden= 0;
            var tmp   = [];
            for (var a = 0; a < arguments.length; a++) {
                var tab = this.get(arguments[a]);
                if (!tab || tab.hidden === true) continue;
                hidden++;
                tab.hidden = true;
                tmp.push(tab.id);
            }
            setTimeout(function () { for (var t=0; t<tmp.length; t++) obj.refresh(tmp[t]); obj.resize(); }, 15); // needs timeout
            return hidden;
        },

        enable: function () {
            var obj   = this;
            var enabled = 0;
            var tmp   = [];
            for (var a = 0; a < arguments.length; a++) {
                var tab = this.get(arguments[a]);
                if (!tab || tab.disabled === false) continue;
                enabled++;
                tab.disabled = false;
                tmp.push(tab.id);
            }
            setTimeout(function () { for (var t=0; t<tmp.length; t++) obj.refresh(tmp[t]); }, 15); // needs timeout
            return enabled;
        },

        disable: function () {
            var obj   = this;
            var disabled = 0;
            var tmp   = [];
            for (var a = 0; a < arguments.length; a++) {
                var tab = this.get(arguments[a]);
                if (!tab || tab.disabled === true) continue;
                disabled++;
                tab.disabled = true;
                tmp.push(tab.id);
            }
            setTimeout(function () { for (var t=0; t<tmp.length; t++) obj.refresh(tmp[t]); }, 15); // needs timeout
            return disabled;
        },

        tooltipShow: function (id, event, forceRefresh) {
            if (this.tooltip == null) return;
            var $el  = $(this.box).find('#tabs_'+ this.name + '_tab_'+ w2utils.escapeId(id));
            var item = this.get(id);
            var pos  = this.tooltip;
            var txt  = item.tooltip;
            if (typeof txt == 'function') txt = txt.call(this, item);
            $el.prop('_mouse_over', true);
            setTimeout(function () {
                if ($el.prop('_mouse_over') === true && $el.prop('_mouse_tooltip') !== true) {
                    $el.prop('_mouse_tooltip', true);
                    // show tooltip
                    $el.w2tag(w2utils.lang(txt), { position: pos });
                }
                if (forceRefresh == true) {
                    $el.w2tag(w2utils.lang(txt), { position: pos });
                }
            }, 1);
        },

        tooltipHide: function (id) {
            if (this.tooltip == null) return;
            var $el  = $(this.box).find('#tabs_'+ this.name + '_tab_'+ w2utils.escapeId(id));
            var item = this.get(id);
            $el.removeProp('_mouse_over');
            setTimeout(function () {
                if ($el.prop('_mouse_over') !== true && $el.prop('_mouse_tooltip') === true) {
                    $el.removeProp('_mouse_tooltip');
                    // hide tooltip
                    $el.w2tag();
                }
            }, 1);
        },

        refresh: function (id) {
            var time = (new Date()).getTime();
            if (this.flow == 'up') $(this.box).addClass('w2ui-tabs-up'); else $(this.box).removeClass('w2ui-tabs-up');
            // event before
            var edata = this.trigger({ phase: 'before', type: 'refresh', target: (id != null ? id : this.name), object: this.get(id) });
            if (edata.isCancelled === true) return;
            if (id == null) {
                // refresh all
                for (var i = 0; i < this.tabs.length; i++) this.refresh(this.tabs[i].id);
            } else {
                // create or refresh only one item
                var tab = this.get(id);
                if (tab == null) return false;
                if (tab.text == null && tab.caption != null) tab.text = tab.caption;
                if (tab.tooltip == null && tab.hint != null) tab.tooltip = tab.hint; // for backward compatibility
                var text = tab.text;
                if (typeof text == 'function') text = text.call(this, tab);
                if (text == null) text = '';

                var jq_el    = $(this.box).find('#tabs_'+ this.name +'_tab_'+ w2utils.escapeId(tab.id));
                var closable = '';
                if (tab.closable && !tab.disabled) {
                    closable = '<div class="w2ui-tab-close" '+
                               '    onmouseover = "w2ui[\''+ this.name +'\'].tooltipShow(\''+ tab.id +'\', event);"'+
                               '    onmouseout  = "w2ui[\''+ this.name +'\'].tooltipHide(\''+ tab.id +'\', event);"'+
                               '    onclick="w2ui[\''+ this.name +'\'].animateClose(\''+ tab.id +'\', event);">'+
                               '</div>';
                }
                var tabHTML = closable +
                    '    <div class="w2ui-tab'+ (this.active === tab.id ? ' active' : '') + (tab.closable ? ' closable' : '')
                                + (tab['class'] ? ' ' + tab['class'] : '') +'" style="'+ tab.style +'" '+
                    '        onmouseover = "' + (!tab.disabled ? "w2ui['"+ this.name +"'].tooltipShow('"+ tab.id +"', event);" : "") + '"'+
                    '        onmouseout  = "' + (!tab.disabled ? "w2ui['"+ this.name +"'].tooltipHide('"+ tab.id +"', event);" : "") + '"'+
                    '        onclick="w2ui[\''+ this.name +'\'].click(\''+ tab.id +'\', event);">' + w2utils.lang(text) + '</div>';
                if (jq_el.length === 0) {
                    // does not exist - create it
                    var addStyle = '';
                    if (tab.hidden) { addStyle += 'display: none;'; }
                    if (tab.disabled) { addStyle += 'opacity: 0.2;'; }
                    var html = '<td id="tabs_'+ this.name + '_tab_'+ tab.id +'" style="'+ addStyle +'" valign="middle">'+ tabHTML + '</td>';
                    if (this.get(id, true) !== this.tabs.length-1 && $(this.box).find('#tabs_'+ this.name +'_tab_'+ w2utils.escapeId(this.tabs[parseInt(this.get(id, true))+1].id)).length > 0) {
                        $(this.box).find('#tabs_'+ this.name +'_tab_'+ w2utils.escapeId(this.tabs[parseInt(this.get(id, true))+1].id)).before(html);
                    } else {
                        $(this.box).find('#tabs_'+ this.name +'_right').before(html);
                    }
                } else {
                    // refresh
                    jq_el.html(tabHTML);
                    if (tab.hidden) { jq_el.css('display', 'none'); }
                    else { jq_el.css('display', ''); }
                    if (tab.disabled) { jq_el.css({ 'opacity': '0.2' }); }
                    else { jq_el.css({ 'opacity': '1' }); }
                }
            }
            // right html
            $('#tabs_'+ this.name +'_right').html(this.right);
            // event after
            this.trigger($.extend(edata, { phase: 'after' }));
            return (new Date()).getTime() - time;
        },

        render: function (box) {
            var time = (new Date()).getTime();
            // event before
            var edata = this.trigger({ phase: 'before', type: 'render', target: this.name, box: box });
            if (edata.isCancelled === true) return;
            // default action
            // if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection
            if (box != null) {
                if ($(this.box).find('> table #tabs_'+ this.name + '_right').length > 0) {
                    $(this.box)
                        .removeAttr('name')
                        .removeClass('w2ui-reset w2ui-tabs')
                        .html('');
                }
                this.box = box;
            }
            if (!this.box) return false;
            // render all buttons
            var html =  '<div class="w2ui-scroll-wrapper" onmousedown="var el=w2ui[\''+ this.name +'\']; if (el) el.resize();">'+
                '<table cellspacing="0" cellpadding="1" width="100%"><tbody>'+
                '    <tr><td width="100%" id="tabs_'+ this.name +'_right" align="right">'+ this.right +'</td></tr>'+
                '</tbody></table>'+
                '</div>'+
                '<div class="w2ui-scroll-left" onclick="var el=w2ui[\''+ this.name +'\']; if (el) el.scroll(\'left\');"></div>'+
                '<div class="w2ui-scroll-right" onclick="var el=w2ui[\''+ this.name +'\']; if (el) el.scroll(\'right\');"></div>';
            $(this.box)
                .attr('name', this.name)
                .addClass('w2ui-reset w2ui-tabs')
                .html(html);
            if ($(this.box).length > 0) $(this.box)[0].style.cssText += this.style;
            // event after
            this.trigger($.extend(edata, { phase: 'after' }));
            this.refresh();
            this.resize();
            return (new Date()).getTime() - time;
        },

        scroll: function (direction) {
            var box = $(this.box);
            var obj = this;
            var scrollBox  = box.find('.w2ui-scroll-wrapper');
            var scrollLeft = scrollBox.scrollLeft();
            var width1, width2, scroll;

            switch (direction) {
                case 'left':
                    width1 = scrollBox.outerWidth();
                    width2 = scrollBox.find(':first').outerWidth();
                    scroll = scrollLeft - width1 + 50; // 35 is width of both button
                    if (scroll <= 0) scroll = 0;
                    scrollBox.animate({ scrollLeft: scroll }, 300);
                    break;

                case 'right':
                    width1 = scrollBox.outerWidth();
                    width2 = scrollBox.find(':first').outerWidth();
                    scroll = scrollLeft + width1 - 50; // 35 is width of both button
                    if (scroll >= width2 - width1) scroll = width2 - width1;
                    scrollBox.animate({ scrollLeft: scroll }, 300);
                    break;
            }
            setTimeout(function () { obj.resize(); }, 350);
        },


        resize: function () {
            var time = (new Date()).getTime();
            // event before
            var edata = this.trigger({ phase: 'before', type: 'resize', target: this.name });
            if (edata.isCancelled === true) return;

            // show hide overflow buttons
            var box = $(this.box);
            box.find('.w2ui-scroll-left, .w2ui-scroll-right').hide();
            var scrollBox = box.find('.w2ui-scroll-wrapper');
            if (scrollBox.find(':first').outerWidth() > scrollBox.outerWidth()) {
                // we have overflowed content
                if (scrollBox.scrollLeft() > 0) {
                    box.find('.w2ui-scroll-left').show();
                }
                if (scrollBox.scrollLeft() < scrollBox.find(':first').outerWidth() - scrollBox.outerWidth()) {
                    box.find('.w2ui-scroll-right').show();
                }
            }

            // event after
            this.trigger($.extend(edata, { phase: 'after' }));
            return (new Date()).getTime() - time;
        },

        destroy: function () {
            // event before
            var edata = this.trigger({ phase: 'before', type: 'destroy', target: this.name });
            if (edata.isCancelled === true) return;
            // clean up
            if ($(this.box).find('> table #tabs_'+ this.name + '_right').length > 0) {
                $(this.box)
                    .removeAttr('name')
                    .removeClass('w2ui-reset w2ui-tabs')
                    .html('');
            }
            delete w2ui[this.name];
            // event after
            this.trigger($.extend(edata, { phase: 'after' }));
        },

        // ===================================================
        // -- Internal Event Handlers

        click: function (id, event) {
            var tab = this.get(id);
            if (tab == null || tab.disabled) return false;
            // event before
            var edata = this.trigger({ phase: 'before', type: 'click', target: id, tab: tab, object: tab, originalEvent: event });
            if (edata.isCancelled === true) return;
            // default action
            $(this.box).find('#tabs_'+ this.name +'_tab_'+ w2utils.escapeId(this.active) +' .w2ui-tab').removeClass('active');
            this.active = tab.id;
            // route processing
            if (typeof tab.route == 'string') {
                var route = tab.route !== '' ? String('/'+ tab.route).replace(/\/{2,}/g, '/') : '';
                var info  = w2utils.parseRoute(route);
                if (info.keys.length > 0) {
                    for (var k = 0; k < info.keys.length; k++) {
                        if (this.routeData[info.keys[k].name] == null) continue;
                        route = route.replace((new RegExp(':'+ info.keys[k].name, 'g')), this.routeData[info.keys[k].name]);
                    }
                }
                setTimeout(function () { window.location.hash = route; }, 1);
            }
            // event after
            this.trigger($.extend(edata, { phase: 'after' }));
            this.refresh(id);
        },

        animateClose: function(id, event) {
            var tab = this.get(id);
            if (tab == null || tab.disabled) return false;
            // event before
            var edata = this.trigger({ phase: 'before', type: 'close', target: id, object: this.get(id), originalEvent: event });
            if (edata.isCancelled === true) return;
            // default action
            var obj = this;
            $(this.box).find('#tabs_'+ this.name +'_tab_'+ w2utils.escapeId(tab.id)).css(w2utils.cssPrefix('transition', '.2s')).css('opacity', '0');
            setTimeout(function () {
                var width = $(obj.box).find('#tabs_'+ obj.name +'_tab_'+ w2utils.escapeId(tab.id)).width();
                $(obj.box).find('#tabs_'+ obj.name +'_tab_'+ w2utils.escapeId(tab.id))
                    .html('<div style="width: '+ width +'px; '+ w2utils.cssPrefix('transition', '.2s', true) +'"></div>');
                setTimeout(function () {
                    $(obj.box).find('#tabs_'+ obj.name +'_tab_'+ w2utils.escapeId(tab.id)).find(':first-child').css({ 'width': '0px' });
                }, 50);
            }, 200);
            setTimeout(function () {
                obj.remove(id);
            }, 450);
            // event before
            this.trigger($.extend(edata, { phase: 'after' }));
            this.refresh();
        },

        animateInsert: function(id, tab) {
            if (this.get(id) == null) return;
            if (!$.isPlainObject(tab)) return;
            // check for unique
            if (!w2utils.checkUniqueId(tab.id, this.tabs, 'tabs', this.name)) return;
            // insert simple div
            var jq_el   = $(this.box).find('#tabs_'+ this.name +'_tab_'+ w2utils.escapeId(tab.id));
            if (jq_el.length !== 0) return; // already exists
            // measure width
            if (tab.text == null && tab.caption != null) tab.text = tab.caption;
            var tmp = '<div id="_tmp_tabs" class="w2ui-reset w2ui-tabs" style="position: absolute; top: -1000px;">'+
                '<table cellspacing="0" cellpadding="1" width="100%"><tbody><tr>'+
                '<td id="_tmp_simple_tab" style="" valign="middle">'+
                    (tab.closable ? '<div class="w2ui-tab-close"></div>' : '') +
                '    <div class="w2ui-tab '+ (this.active === tab.id ? 'active' : '') +'">'+ tab.text +'</div>'+
                '</td></tr></tbody></table>'+
                '</div>';
            $('body').append(tmp);
            // create dummy element
            var tabHTML = '<div style="width: 1px; '+ w2utils.cssPrefix('transition', '.2s', true) +'">&#160;</div>';
            var addStyle = '';
            if (tab.hidden) { addStyle += 'display: none;'; }
            if (tab.disabled) { addStyle += 'opacity: 0.2;'; }
            var html = '<td id="tabs_'+ this.name +'_tab_'+ tab.id +'" style="'+ addStyle +'" valign="middle">'+ tabHTML +'</td>';
            if (this.get(id, true) !== this.tabs.length && $(this.box).find('#tabs_'+ this.name +'_tab_'+ w2utils.escapeId(this.tabs[parseInt(this.get(id, true))].id)).length > 0) {
                $(this.box).find('#tabs_'+ this.name +'_tab_'+ w2utils.escapeId(this.tabs[parseInt(this.get(id, true))].id)).before(html);
            } else {
                $(this.box).find('#tabs_'+ this.name +'_right').before(html);
            }
            // -- move
            var obj = this;
            setTimeout(function () {
                var width = $('#_tmp_simple_tab').width();
                $('#_tmp_tabs').remove();
                $('#tabs_'+ obj.name +'_tab_'+ w2utils.escapeId(tab.id) +' > div').css('width', width+'px');
            }, 1);
            setTimeout(function () {
                // insert for real
                obj.insert(id, tab);
            }, 200);
        }
    };

    $.extend(w2tabs.prototype, w2utils.event);
    w2obj.tabs = w2tabs;
})(jQuery);
