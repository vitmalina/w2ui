/************************************************************************
*   Library: Web 2.0 UI for jQuery (using prototypical inheritance)
*   - Following objects defined
*        - w2field        - various field controls
*        - $().w2field    - jQuery wrapper
*   - Dependencies: jQuery, w2utils
*
* == NICE TO HAVE ==
*   - upload (regular files)
*   - BUG with prefix/postfix and arrows (test in different contexts)
*   - multiple date selection
*   - month selection, year selections
*   - arrows no longer work (for int)
*   - form to support custom types
*   - rewrite suffix and prefix positioning with translateY()
*   - prefix and suffix are slow (100ms or so)
*   - MultiSelect - Allow Copy/Paste for single and multi values
*   - add routeData to list/enum
*   - for type: list -> read value from attr('value')
*   - ENUM, LIST: should have same as grid (limit, offset, search, sort)
*   - ENUM, LIST: should support wild chars
*   - add selection of predefined times (used for appointments)
*
************************************************************************/

(function ($) {

    var w2field = function (options) {
        // public properties
        this.el          = null;
        this.helpers     = {}; // object or helper elements
        this.type        = options.type || 'text';
        this.options     = $.extend(true, {}, options);
        this.onSearch    = options.onSearch    || null;
        this.onRequest   = options.onRequest   || null;
        this.onLoad      = options.onLoad      || null;
        this.onError     = options.onError     || null;
        this.onClick     = options.onClick     || null;
        this.onAdd       = options.onAdd       || null;
        this.onNew       = options.onNew       || null;
        this.onRemove    = options.onRemove    || null;
        this.onMouseOver = options.onMouseOver || null;
        this.onMouseOut  = options.onMouseOut  || null;
        this.onIconClick = options.onIconClick || null;
        this.onScroll    = options.onScroll || null;
        this.tmp         = {}; // temp object
        // clean up some options
        delete this.options.type;
        delete this.options.onSearch;
        delete this.options.onRequest;
        delete this.options.onLoad;
        delete this.options.onError;
        delete this.options.onClick;
        delete this.options.onMouseOver;
        delete this.options.onMouseOut;
        delete this.options.onIconClick;
        delete this.options.onScroll;
        // extend with defaults
        $.extend(true, this, w2obj.field);
    };

    // ====================================================
    // -- Registers as a jQuery plugin

    $.fn.w2field = function (method, options) {
        // call direct
        if (this.length === 0) {
            var pr = w2field.prototype;
            if (pr[method]) {
                return pr[method].apply(pr, Array.prototype.slice.call(arguments, 1));
            }
        } else {
            // if without arguments - return the object
            if (arguments.length === 0) {
                var obj = $(this).data('w2field');
                return obj;
            }
            if (typeof method == 'string' && typeof options == 'object') {
                method = $.extend(true, {}, options, { type: method });
            }
            if (typeof method == 'string' && options == null) {
                method = { type: method };
            }
            if (method) method.type = String(method.type).toLowerCase();
            return this.each(function (index, el) {
                var obj = $(el).data('w2field');
                // if object is not defined, define it
                if (obj == null) {
                    var obj = new w2field(method);
                    $.extend(obj, { handlers: [] });
                    if (el) obj.el = $(el)[0];
                    obj.init();
                    $(el).data('w2field', obj);
                    return obj;
                } else { // fully re-init
                    obj.clear();
                    if (method.type == 'clear') return;
                    var obj = new w2field(method);
                    $.extend(obj, { handlers: [] });
                    if (el) obj.el = $(el)[0];
                    obj.init();
                    $(el).data('w2field', obj);
                    return obj;
                }
                return null;
            });
        }
    };

    // ====================================================
    // -- Implementation of core functionality

    /*     To add custom types
        $().w2field('addType', 'myType', function (options) {
            $(this.el).on('keypress', function (event) {
                if (event.metaKey || event.ctrlKey || event.altKey
                    || (event.charCode != event.keyCode && event.keyCode > 0)) return;
                var ch = String.fromCharCode(event.charCode);
                if (ch != 'a' && ch != 'b' && ch != 'c') {
                    if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;
                    return false;
                }
            });
            $(this.el).on('blur', function (event)  { // keyCode & charCode differ in FireFox
                var ch = this.value;
                if (ch != 'a' && ch != 'b' && ch != 'c') {
                    $(this).w2tag(w2utils.lang("Not a single character from the set of 'abc'"));
                }
            });
        });
    */

    w2field.prototype = {

        custom: {},  // map of custom types

        addType: function (type, handler) {
            type = String(type).toLowerCase();
            this.custom[type] = handler;
            return true;
        },

        removeType: function (type) {
            type = String(type).toLowerCase();
            if (!this.custom[type]) return false;
            delete this.custom[type];
            return true;
        },

        init: function () {
            var obj     = this;
            var options = this.options;
            var defaults;

            // Custom Types
            if (typeof this.custom[this.type] == 'function') {
                this.custom[this.type].call(this, options);
                return;
            }
            // only for INPUT or TEXTAREA
            if (['INPUT', 'TEXTAREA'].indexOf(this.el.tagName.toUpperCase()) == -1) {
                console.log('ERROR: w2field could only be applied to INPUT or TEXTAREA.', this.el);
                return;
            }

            switch (this.type) {
                case 'text':
                case 'int':
                case 'float':
                case 'money':
                case 'currency':
                case 'percent':
                case 'alphanumeric':
                case 'bin':
                case 'hex':
                    defaults = {
                        min                : null,
                        max                : null,
                        step               : 1,
                        autoFormat         : true,
                        currencyPrefix     : w2utils.settings.currencyPrefix,
                        currencySuffix     : w2utils.settings.currencySuffix,
                        currencyPrecision  : w2utils.settings.currencyPrecision,
                        decimalSymbol      : w2utils.settings.decimalSymbol,
                        groupSymbol        : w2utils.settings.groupSymbol,
                        arrows             : false,
                        keyboard           : true,
                        precision          : null,
                        silent             : true,
                        prefix             : '',
                        suffix             : ''
                    };
                    this.options = $.extend(true, {}, defaults, options);
                    options = this.options; // since object is re-created, need to re-assign
                    options.numberRE  = new RegExp('['+ options.groupSymbol + ']', 'g');
                    options.moneyRE   = new RegExp('['+ options.currencyPrefix + options.currencySuffix + options.groupSymbol +']', 'g');
                    options.percentRE = new RegExp('['+ options.groupSymbol + '%]', 'g');
                    // no keyboard support needed
                    if (['text', 'alphanumeric', 'hex', 'bin'].indexOf(this.type) != -1) {
                        options.arrows   = false;
                        options.keyboard = false;
                    }
                    this.addPrefix(); // only will add if needed
                    this.addSuffix();
                    break;

                case 'color':
                    defaults = {
                        prefix      : '',
                        suffix      : '<div style="width: '+ (parseInt($(this.el).css('font-size')) || 12) +'px">&#160;</div>',
                        arrows      : false,
                        keyboard    : false,
                        advanced    : null, // open advanced by default
                        transparent : true
                    };
                    $.extend(options, defaults);
                    this.addPrefix();    // only will add if needed
                    this.addSuffix();    // only will add if needed
                    // additional checks
                    if ($(this.el).val() !== '') setTimeout(function () { obj.change(); }, 1);
                    break;

                case 'date':
                    defaults = {
                        format       : w2utils.settings.dateFormat, // date format
                        keyboard     : true,
                        silent       : true,
                        start        : '',       // string or jquery object
                        end          : '',       // string or jquery object
                        blocked      : {},       // { '4/11/2011': 'yes' }
                        colored      : {},        // { '4/11/2011': 'red:white' }
                        blockWeekDays : null       // array of numbers of weekday to block
                    };
                    this.options = $.extend(true, {}, defaults, options);
                    options = this.options; // since object is re-created, need to re-assign
                    if ($(this.el).attr('placeholder') == null) $(this.el).attr('placeholder', options.format);
                    break;

                case 'time':
                    defaults = {
                        format    : w2utils.settings.timeFormat,
                        keyboard  : true,
                        silent    : true,
                        start     : '',
                        end       : '',
                        noMinutes : false
                    };
                    this.options = $.extend(true, {}, defaults, options);
                    options = this.options; // since object is re-created, need to re-assign
                    if ($(this.el).attr('placeholder') == null) $(this.el).attr('placeholder', options.format);
                    break;

                case 'datetime':
                    defaults = {
                        format      : w2utils.settings.dateFormat + ' | ' + w2utils.settings.timeFormat,
                        keyboard    : true,
                        silent      : true,
                        start       : '',       // string or jquery object or Date object
                        end         : '',       // string or jquery object or Date object
                        blocked     : [],       // [ '4/11/2011', '4/12/2011' ] or [ new Date(2011, 4, 11), new Date(2011, 4, 12) ]
                        colored     : {},       // { '12/17/2014': 'blue:green', '12/18/2014': 'gray:white'  }; // key has to be formatted with w2utils.settings.dateFormat
                        placeholder : null,     // optional. will fall back to this.format if not specified. Only used if this.el has no placeholder attribute.
                        btn_now     : true,     // show/hide the use-current-date-and-time button
                        noMinutes   : false
                    };
                    this.options = $.extend(true, {}, defaults, options);
                    options = this.options; // since object is re-created, need to re-assign
                    if ($(this.el).attr('placeholder') == null) $(this.el).attr('placeholder', options.placeholder || options.format);
                    break;

                case 'list':
                case 'combo':
                    defaults = {
                        items           : [],
                        selected        : {},
                        url             : null,          // url to pull data from
                        recId           : null,          // map retrieved data from url to id, can be string or function
                        recText         : null,          // map retrieved data from url to text, can be string or function
                        method          : null,          // default comes from w2utils.settings.dataType
                        interval        : 350,           // number of ms to wait before sending server call on search
                        postData        : {},
                        minLength       : 1,            // min number of chars when trigger search
                        cacheMax        : 250,
                        maxDropHeight   : 350,          // max height for drop down menu
                        maxDropWidth    : null,         // if null then auto set
                        match           : 'begins',     // ['contains', 'is', 'begins', 'ends']
                        silent          : true,
                        icon            : null,
                        iconStyle       : '',
                        onSearch        : null,         // when search needs to be performed
                        onRequest       : null,         // when request is submitted
                        onLoad          : null,         // when data is received
                        onError         : null,         // when data fails to load due to server error or other failure modes
                        onIconClick     : null,
                        renderDrop      : null,         // render function for drop down item
                        compare         : null,         // compare function for filtering
                        filter          : true,         // weather to filter at all
                        prefix          : '',
                        suffix          : '',
                        openOnFocus     : false,        // if to show overlay onclick or when typing
                        markSearch      : false
                    };
                    options.items = this.normMenu(options.items); // need to be first
                    if (this.type == 'list') {
                        // defaults.search = (options.items && options.items.length >= 10 ? true : false);
                        defaults.openOnFocus = true;
                        $(this.el).addClass('w2ui-select');
                        // if simple value - look it up
                        if (!$.isPlainObject(options.selected) && options.items) {
                            for (var i = 0; i< options.items.length; i++) {
                                var item = options.items[i];
                                if (item && item.id === options.selected) {
                                    options.selected = $.extend(true, {}, item);
                                    break;
                                }
                            }
                        }
                        this.watchSize();
                    }
                    options = $.extend({}, defaults, options, {
                        align   : 'both',      // same width as control
                        altRows : true         // alternate row color
                    });
                    this.options = options;
                    if (!$.isPlainObject(options.selected)) options.selected = {};
                    $(this.el).data('selected', options.selected);
                    if (options.url) {
                        options.items = [];
                        this.request(0);
                    }
                    if (this.type == 'list') this.addFocus();
                    this.addPrefix();
                    this.addSuffix();
                    setTimeout(function () { obj.refresh(); }, 10); // need this for icon refresh
                    $(this.el).attr('autocomplete', 'off');
                    if (options.selected.text != null) $(this.el).val(options.selected.text);
                    break;

                case 'enum':
                    defaults = {
                        items           : [],
                        selected        : [],
                        max             : 0,             // max number of selected items, 0 - unlim
                        url             : null,          // not implemented
                        recId           : null,          // map retrieved data from url to id, can be string or function
                        recText         : null,          // map retrieved data from url to text, can be string or function
                        interval        : 350,           // number of ms to wait before sending server call on search
                        method          : null,          // default comes from w2utils.settings.dataType
                        postData        : {},
                        minLength       : 1,            // min number of chars when trigger search
                        cacheMax        : 250,
                        maxWidth        : 250,           // max width for a single item
                        maxHeight       : 350,           // max height for input control to grow
                        maxDropHeight   : 350,           // max height for drop down menu
                        maxDropWidth    : null,          // if null then auto set
                        match           : 'contains',    // ['contains', 'is', 'begins', 'ends']
                        silent          : true,
                        openOnFocus     : false,         // if to show overlay onclick or when typing
                        markSearch      : true,
                        renderDrop      : null,          // render function for drop down item
                        renderItem      : null,          // render selected item
                        compare         : null,          // compare function for filtering
                        filter          : true,          // alias for compare
                        style           : '',            // style for container div
                        onSearch        : null,          // when search needs to be performed
                        onRequest       : null,          // when request is submitted
                        onLoad          : null,          // when data is received
                        onError         : null,          // when data fails to load due to server error or other failure modes
                        onClick         : null,          // when an item is clicked
                        onAdd           : null,          // when an item is added
                        onNew           : null,          // when new item should be added
                        onRemove        : null,          // when an item is removed
                        onMouseOver     : null,          // when an item is mouse over
                        onMouseOut      : null,          // when an item is mouse out
                        onScroll        : null           // when div with selected items is scrolled
                    };
                    options = $.extend({}, defaults, options, {
                        align    : 'both',    // same width as control
                        suffix   : '',
                        altRows  : true       // alternate row color
                    });
                    options.items    = this.normMenu(options.items);
                    options.selected = this.normMenu(options.selected);
                    this.options = options;
                    if (!$.isArray(options.selected)) options.selected = [];
                    $(this.el).data('selected', options.selected);
                    if (options.url) {
                        options.items = [];
                        this.request(0);
                    }
                    this.addSuffix();
                    this.addMulti();
                    this.watchSize();
                    break;

                case 'file':
                    defaults = {
                        selected      : [],
                        max           : 0,
                        maxSize       : 0,        // max size of all files, 0 - unlim
                        maxFileSize   : 0,        // max size of a single file, 0 -unlim
                        maxWidth      : 250,      // max width for a single item
                        maxHeight     : 350,      // max height for input control to grow
                        maxDropHeight : 350,      // max height for drop down menu
                        maxDropWidth  : null,     // if null then auto set
                        readContent   : true,     // if true, it will readAsDataURL content of the file
                        silent        : true,
                        renderItem    : null,     // render selected item
                        style         : '',       // style for container div
                        onClick       : null,     // when an item is clicked
                        onAdd         : null,     // when an item is added
                        onRemove      : null,     // when an item is removed
                        onMouseOver   : null,     // when an item is mouse over
                        onMouseOut    : null      // when an item is mouse out
                    };
                    options = $.extend({}, defaults, options, {
                        align         : 'both',   // same width as control
                        altRows        : true     // alternate row color
                    });
                    this.options = options;
                    if (!$.isArray(options.selected)) options.selected = [];
                    $(this.el).data('selected', options.selected);
                    if ($(this.el).attr('placeholder') == null) {
                        $(this.el).attr('placeholder', w2utils.lang('Attach files by dragging and dropping or Click to Select'));
                    }
                    this.addMulti();
                    this.watchSize();
                    break;
            }
            // attach events
            this.tmp = {
                onChange    : function (event) { obj.change.call(obj, event); },
                onClick     : function (event) { obj.click.call(obj, event); },
                onFocus     : function (event) { obj.focus.call(obj, event); },
                onBlur      : function (event) { obj.blur.call(obj, event); },
                onKeydown   : function (event) { obj.keyDown.call(obj, event); },
                onKeyup     : function (event) { obj.keyUp.call(obj, event); },
                onKeypress  : function (event) { obj.keyPress.call(obj, event); }
            };
            $(this.el)
                .addClass('w2field w2ui-input')
                .data('w2field', this)
                .on('change.w2field',   this.tmp.onChange)
                .on('click.w2field',    this.tmp.onClick)         // ignore click because it messes overlays
                .on('focus.w2field',    this.tmp.onFocus)
                .on('blur.w2field',     this.tmp.onBlur)
                .on('keydown.w2field',  this.tmp.onKeydown)
                .on('keyup.w2field',    this.tmp.onKeyup)
                .on('keypress.w2field', this.tmp.onKeypress)
                .css(w2utils.cssPrefix('box-sizing', 'border-box'));
            // format initial value
            this.change($.Event('change'));
        },

        watchSize: function () {
            var obj = this;
            var tmp = $(obj.el).data('tmp') || {};
            tmp.sizeTimer = setInterval(function () {
                if ($(obj.el).parents('body').length > 0) {
                    obj.resize();
                } else {
                    clearInterval(tmp.sizeTimer);
                }
            }, 200);
            $(obj.el).data('tmp', tmp);
        },

        get: function () {
            var ret;
            if (['list', 'enum', 'file'].indexOf(this.type) != -1) {
                ret = $(this.el).data('selected');
            } else {
                ret = $(this.el).val();
            }
            return ret;
        },

        set: function (val, append) {
            if (['list', 'enum', 'file'].indexOf(this.type) != -1) {
                if (this.type != 'list' && append) {
                    if ($(this.el).data('selected') == null) $(this.el).data('selected', []);
                    $(this.el).data('selected').push(val);
                    $(this.el).change();
                } else {
                    var it = (this.type == 'enum' ? [val] : val);
                    $(this.el).data('selected', it).change();
                }
                this.refresh();
            } else {
                $(this.el).val(val);
            }
        },

        setIndex: function (ind, append) {
            if (['list', 'enum'].indexOf(this.type) != -1) {
                var items = this.options.items;
                if (items && items[ind]) {
                    if (this.type != 'list' && append) {
                        if ($(this.el).data('selected') == null) $(this.el).data('selected', []);
                        $(this.el).data('selected').push(items[ind]);
                        $(this.el).change();
                    } else {
                        var it = (this.type == 'enum' ? [items[ind]] : items[ind]);
                        $(this.el).data('selected', it).change();
                    }
                    this.refresh();
                    return true;
                }
            }
            return false;
        },

        clear: function () {
            var obj        = this;
            var options    = this.options;
            // if money then clear value
            if (['money', 'currency'].indexOf(this.type) != -1) {
                $(this.el).val($(this.el).val().replace(options.moneyRE, ''));
            }
            if (this.type == 'percent') {
                $(this.el).val($(this.el).val().replace(/%/g, ''));
            }
            if (this.type == 'list') {
                $(this.el).removeClass('w2ui-select');
            }
            this.type = 'clear';
            var tmp = $(this.el).data('tmp');
            if (!this.tmp) return;
            // restore paddings
            if (tmp != null) {
                $(this.el).height('auto');
                if (tmp && tmp['old-padding-left'])  $(this.el).css('padding-left',  tmp['old-padding-left']);
                if (tmp && tmp['old-padding-right']) $(this.el).css('padding-right', tmp['old-padding-right']);
                if (tmp && tmp['old-background-color']) $(this.el).css('background-color', tmp['old-background-color']);
                if (tmp && tmp['old-border-color']) $(this.el).css('border-color', tmp['old-border-color']);
                // remove resize watcher
                clearInterval(tmp.sizeTimer);
            }
            // remove events and (data)
            $(this.el)
                .val(this.clean($(this.el).val()))
                .removeClass('w2field')
                .removeData()       // removes all attached data
                .off('.w2field');   // remove only events added by w2field
            // remove helpers
            for (var h in this.helpers) $(this.helpers[h]).remove();
            this.helpers = {};
        },

        refresh: function () {
            var obj       = this;
            var options   = this.options;
            var selected  = $(this.el).data('selected');
            var time      = (new Date()).getTime();
            // enum
            if (['list'].indexOf(this.type) != -1) {
                $(obj.el).parent().css('white-space', 'nowrap'); // needs this for arrow always to appear on the right side
                // hide focus and show text
                if (obj.helpers.prefix) obj.helpers.prefix.hide();
                setTimeout(function () {
                    if (!obj.helpers.focus) return;
                    // if empty show no icon
                    if (!$.isEmptyObject(selected) && options.icon) {
                        options.prefix = '<span class="w2ui-icon '+ options.icon +'"style="cursor: pointer; font-size: 14px;' +
                                         ' display: inline-block; margin-top: -1px; color: #7F98AD;'+ options.iconStyle +'">'+
                            '</span>';
                        obj.addPrefix();
                    } else {
                        options.prefix = '';
                        obj.addPrefix();
                    }
                    // focus helper
                    var focus = obj.helpers.focus.find('input');
                    if ($(focus).val() === '') {
                        $(focus).css('text-indent', '-9999em').prev().css('opacity', 0);
                        $(obj.el).val(selected && selected.text != null ? w2utils.lang(selected.text) : '');
                    } else {
                        $(focus).css('text-indent', 0).prev().css('opacity', 1);
                        $(obj.el).val('');
                        setTimeout(function () {
                            if (obj.helpers.prefix) obj.helpers.prefix.hide();
                            var tmp = 'position: absolute; opacity: 0; margin: 4px 0px 0px 2px; background-position: left !important;';
                            if (options.icon) {
                                $(focus).css('margin-left', '17px');
                                $(obj.helpers.focus).find('.icon-search').attr('style', tmp + 'width: 11px !important; opacity: 1; display: block');
                            } else {
                                $(focus).css('margin-left', '0px');
                                $(obj.helpers.focus).find('.icon-search').attr('style', tmp + 'width: 0px !important; opacity: 0; display: none');
                            }
                        }, 1);
                    }
                    // if readonly or disabled
                    if ($(obj.el).prop('readonly') || $(obj.el).prop('disabled')) {
                        setTimeout(function () {
                            $(obj.helpers.prefix).css('opacity', '0.6');
                            $(obj.helpers.suffix).css('opacity', '0.6');
                        }, 1);
                    } else {
                        setTimeout(function () {
                            $(obj.helpers.prefix).css('opacity', '1');
                            $(obj.helpers.suffix).css('opacity', '1');
                        }, 1);
                    }
                }, 1);
            }
            if (['enum', 'file'].indexOf(this.type) != -1) {
                var html = '';
                if (selected) {
                   for (var s = 0; s < selected.length; s++) {
                       var it  = selected[s];
                       var ren = '';
                       if (typeof options.renderItem == 'function') {
                           ren = options.renderItem(it, s, '<div class="w2ui-list-remove" title="'+ w2utils.lang('Remove') +'" index="'+ s +'">&#160;&#160;</div>');
                       } else {
                           ren = '<div class="w2ui-list-remove" title="'+ w2utils.lang('Remove') +'" index="'+ s +'">&#160;&#160;</div>'+
                                 (obj.type == 'enum' ? it.text : it.name + '<span class="file-size"> - '+ w2utils.formatSize(it.size) +'</span>');
                       }
                       html += '<li index="'+ s +'" style="max-width: '+ parseInt(options.maxWidth) + 'px; '+ (it.style ? it.style : '') +'">'+
                               ren +'</li>';
                   }
                }
                var div = obj.helpers.multi;
                var ul  = div.find('ul');
                div.attr('style', div.attr('style') + ';' + options.style);
                $(obj.el).css('z-index', '-1');
                if ($(obj.el).prop('readonly') || $(obj.el).prop('disabled')) {
                    setTimeout(function () {
                        div[0].scrollTop = 0; // scroll to the top
                        div.addClass('w2ui-readonly')
                            .find('li').css('opacity', '0.9')
                            .parent().find('li.nomouse').hide()
                            .find('input').prop('readonly', true)
                            .parents('ul')
                            .find('.w2ui-list-remove').hide();
                    }, 1);
                } else {
                    setTimeout(function () {
                        div.removeClass('w2ui-readonly')
                            .find('li').css('opacity', '1')
                            .parent().find('li.nomouse').show()
                            .find('input').prop('readonly', false)
                            .parents('ul')
                            .find('.w2ui-list-remove').show();
                    }, 1);
                }

                // clean
                div.find('.w2ui-enum-placeholder').remove();
                ul.find('li').not('li.nomouse').remove();
                // add new list
                if (html !== '') {
                    ul.prepend(html);
                } else if ($(obj.el).attr('placeholder') != null && div.find('input').val() === '') {
                    var style =
                        'padding-top: ' + $(this.el).css('padding-top') + ';'+
                        'padding-left: ' + $(this.el).css('padding-left') + '; ' +
                        'box-sizing: ' + $(this.el).css('box-sizing') + '; ' +
                        'line-height: ' + $(this.el).css('line-height') + '; ' +
                        'font-size: ' + $(this.el).css('font-size') + '; ' +
                        'font-family: ' + $(this.el).css('font-family') + '; ';
                    div.prepend('<div class="w2ui-enum-placeholder" style="'+ style +'">'+ $(obj.el).attr('placeholder') +'</div>');
                }
                // ITEMS events
                div.off('scroll.w2field').on('scroll.w2field', function (event) {
                        var edata = obj.trigger({ phase: 'before', type: 'scroll', target: obj.el, originalEvent: event });
                        if (edata.isCancelled === true) return;
                        // event after
                        obj.trigger($.extend(edata, { phase: 'after' }));
                    })
                    .find('li')
                    .data('mouse', 'out')
                    .on('click', function (event) {
                        var target = (event.target.tagName.toUpperCase() == 'LI' ? event.target : $(event.target).parents('LI'));
                        var item   = selected[$(target).attr('index')];
                        if ($(target).hasClass('nomouse')) return;
                        event.stopPropagation();
                        // default behavior
                        if ($(event.target).hasClass('w2ui-list-remove')) {
                            if ($(obj.el).prop('readonly') || $(obj.el).prop('disabled')) return;
                            // trigger event
                            var edata = obj.trigger({ phase: 'before', type: 'remove', target: obj.el, originalEvent: event.originalEvent, item: item });
                            if (edata.isCancelled === true) return;
                            // default behavior
                            $().w2overlay();
                            selected.splice($(event.target).attr('index'), 1);
                            $(obj.el).trigger('change');
                            $(event.target).parent().fadeOut('fast');
                            setTimeout(function () {
                                obj.refresh();
                                // event after
                                obj.trigger($.extend(edata, { phase: 'after' }));
                            }, 300);
                        } else {
                            // trigger event
                            var edata = obj.trigger({ phase: 'before', type: 'click', target: obj.el, originalEvent: event.originalEvent, item: item });
                            if (edata.isCancelled === true) return;
                            // if file - show image preview
                            if (obj.type == 'file') {
                                var preview = '';
                                if ((/image/i).test(item.type)) { // image
                                    preview = '<div style="padding: 3px;">'+
                                        '    <img src="'+ (item.content ? 'data:'+ item.type +';base64,'+ item.content : '') +'" style="max-width: 300px;" '+
                                        '        onload="var w = jQuery(this).width(); var h = jQuery(this).height(); '+
                                        '            if (w < 300 & h < 300) return; '+
                                        '            if (w >= h && w > 300) jQuery(this).width(300);'+
                                        '            if (w < h && h > 300) jQuery(this).height(300);"'+
                                        '        onerror="this.style.display = \'none\'"'+
                                        '    >'+
                                        '</div>';
                                }
                                var td1 = 'style="padding: 3px; text-align: right; color: #777;"';
                                var td2 = 'style="padding: 3px"';
                                preview += '<div style="padding: 8px;">'+
                                    '    <table cellpadding="2"><tbody>'+
                                    '    <tr><td '+ td1 +'>'+ w2utils.lang('Name') +':</td><td '+ td2 +'>'+ item.name +'</td></tr>'+
                                    '    <tr><td '+ td1 +'>'+ w2utils.lang('Size') +':</td><td '+ td2 +'>'+ w2utils.formatSize(item.size) +'</td></tr>'+
                                    '    <tr><td '+ td1 +'>'+ w2utils.lang('Type') +':</td><td '+ td2 +'>' +
                                    '        <span style="width: 200px; display: block-inline; overflow: hidden; text-overflow: ellipsis; white-space: nowrap="nowrap";">'+ item.type +'</span>'+
                                    '    </td></tr>'+
                                    '    <tr><td '+ td1 +'>'+ w2utils.lang('Modified') +':</td><td '+ td2 +'>'+ w2utils.date(item.modified) +'</td></tr>'+
                                    '    </tbody></table>'+
                                    '</div>';
                                $('#w2ui-overlay').remove();
                                $(target).w2overlay(preview);
                            }                            // event after
                            obj.trigger($.extend(edata, { phase: 'after' }));
                        }
                    })
                    .on('mouseover', function (event) {
                        var target = (event.target.tagName.toUpperCase() == 'LI' ? event.target : $(event.target).parents('LI'));
                        if ($(target).hasClass('nomouse')) return;
                        if ($(target).data('mouse') == 'out') {
                            var item = selected[$(event.target).attr('index')];
                            // trigger event
                            var edata = obj.trigger({ phase: 'before', type: 'mouseOver', target: obj.el, originalEvent: event.originalEvent, item: item });
                            if (edata.isCancelled === true) return;
                            // event after
                            obj.trigger($.extend(edata, { phase: 'after' }));
                        }
                        $(target).data('mouse', 'over');
                    })
                    .on('mouseout', function (event) {
                        var target = (event.target.tagName.toUpperCase() == 'LI' ? event.target : $(event.target).parents('LI'));
                        if ($(target).hasClass('nomouse')) return;
                        $(target).data('mouse', 'leaving');
                        setTimeout(function () {
                            if ($(target).data('mouse') == 'leaving') {
                                $(target).data('mouse', 'out');
                                var item = selected[$(event.target).attr('index')];
                                // trigger event
                                var edata = obj.trigger({ phase: 'before', type: 'mouseOut', target: obj.el, originalEvent: event.originalEvent, item: item });
                                if (edata.isCancelled === true) return;
                                // event after
                                obj.trigger($.extend(edata, { phase: 'after' }));
                            }
                        }, 0);
                    });
                // adjust height
                $(this.el).height('auto');
                var cntHeight = $(div).find('> div.w2ui-multi-items').height() + w2utils.getSize(div, '+height') * 2;
                if (cntHeight < 26) cntHeight = 26;
                if (cntHeight > options.maxHeight) cntHeight = options.maxHeight;
                if (div.length > 0) div[0].scrollTop = 1000;
                var inpHeight = w2utils.getSize($(this.el), 'height') - 2;
                if (inpHeight > cntHeight) cntHeight = inpHeight;
                $(div).css({ 'height': cntHeight + 'px', overflow: (cntHeight == options.maxHeight ? 'auto' : 'hidden') });
                if (cntHeight < options.maxHeight) $(div).prop('scrollTop', 0);
                $(this.el).css({ 'height' : (cntHeight + 2) + 'px' });
                // update size
                if (obj.type == 'enum') {
                    var tmp = obj.helpers.multi.find('input');
                    tmp.width(((tmp.val().length + 2) * 8) + 'px');
                }
            }
            return (new Date()).getTime() - time;
        },

        reset: function () {
            var type = this.type;
            this.clear();
            this.type = type;
            this.init();
        },

        // resizing width of list, enum, file controls
        resize: function () {
            var obj = this;
            var new_width  = $(obj.el).width();
            var new_height = $(obj.el).height();
            if (obj.tmp.current_width == new_width && new_height > 0) return;

            var focus  = this.helpers.focus;
            var multi  = this.helpers.multi;
            var suffix = this.helpers.suffix;
            var prefix = this.helpers.prefix;

            // resize helpers
            if (focus) {
                focus.width($(obj.el).width());
            }
            if (multi) {
                var width = (w2utils.getSize(obj.el, 'width')
                    - parseInt($(obj.el).css('margin-left'), 10)
                    - parseInt($(obj.el).css('margin-right'), 10));
                $(multi).width(width);
            }
            if (suffix) {
                obj.options.suffix = '<div class="arrow-down" style="margin-top: '+ ((parseInt($(obj.el).height()) - 6) / 2) +'px;"></div>';
                obj.addSuffix();
            }
            if (prefix) {
                obj.addPrefix();
            }
            // remember width
            obj.tmp.current_width = new_width;
        },

        clean: function (val) {
            //issue #499
            if(typeof val == 'number'){
                 return val;
            }
            var options = this.options;
            val = String(val).trim();
            // clean
            if (['int', 'float', 'money', 'currency', 'percent'].indexOf(this.type) != -1) {
                if (typeof val == 'string') {
                    if (options.autoFormat && ['money', 'currency'].indexOf(this.type) != -1) val = String(val).replace(options.moneyRE, '');
                    if (options.autoFormat && this.type == 'percent') val = String(val).replace(options.percentRE, '');
                    if (options.autoFormat && ['int', 'float'].indexOf(this.type) != -1) val = String(val).replace(options.numberRE, '');
                    val = val.replace(/\s+/g, '').replace(w2utils.settings.groupSymbol, '').replace(w2utils.settings.decimalSymbol, '.');
                }
                if (parseFloat(val) == val) {
                    if (options.min != null && val < options.min) { val = options.min; $(this.el).val(options.min); }
                    if (options.max != null && val > options.max) { val = options.max; $(this.el).val(options.max); }
                }
                if (val !== '' && w2utils.isFloat(val)) val = Number(val); else val = '';
            }
            return val;
        },

        format: function (val) {
            var options = this.options;
            // autoformat numbers or money
            if (options.autoFormat && val !== '') {
                switch (this.type) {
                    case 'money':
                    case 'currency':
                        val = w2utils.formatNumber(val, options.currencyPrecision, options.groupSymbol);
                        if (val !== '') val = options.currencyPrefix + val + options.currencySuffix;
                        break;
                    case 'percent':
                        val = w2utils.formatNumber(val, options.precision, options.groupSymbol);
                        if (val !== '') val += '%';
                        break;
                    case 'float':
                        val = w2utils.formatNumber(val, options.precision, options.groupSymbol);
                        break;
                    case 'int':
                        val = w2utils.formatNumber(val, 0, options.groupSymbol);
                        break;
                }
            }
            return val;
        },

        change: function (event) {
            var obj     = this;
            var options = obj.options;
            // numeric
            if (['int', 'float', 'money', 'currency', 'percent'].indexOf(this.type) != -1) {
                // check max/min
                var val     =  $(this.el).val();
                var new_val = this.format(this.clean($(this.el).val()));
                // if was modified
                if (val !== '' && val != new_val) {
                    $(this.el).val(new_val).change();
                    // cancel event
                    event.stopPropagation();
                    event.preventDefault();
                    return false;
                }
            }
            // color
            if (this.type == 'color') {
                var color = $(this.el).val();
                if (color.substr(0, 3).toLowerCase() != 'rgb') {
                    color = '#' + color;
                    if ($(this.el).val().length != 6 && $(this.el).val().length != 3) color = '';
                }
                $(this.el).next().find('div').css('background-color', color);
                if ($(this.el).is(':focus') && $(this.el).data('skipInit') !== true) {
                    this.updateOverlay();
                }
            }
            // list, enum
            if (['list', 'enum', 'file'].indexOf(this.type) != -1) {
                obj.refresh();
                // need time out to show icon indent properly
                setTimeout(function () { obj.refresh(); }, 5);
            }
            // date, time
            if (['date', 'time', 'datetime'].indexOf(this.type) != -1) {
                // convert linux timestamps
                var tmp = parseInt(obj.el.value);
                if (w2utils.isInt(obj.el.value) && tmp > 3000) {
                    if (this.type == 'time') $(obj.el).val(w2utils.formatTime(new Date(tmp), options.format)).change();
                    if (this.type == 'date') $(obj.el).val(w2utils.formatDate(new Date(tmp), options.format)).change();
                    if (this.type == 'datetime') $(obj.el).val(w2utils.formatDateTime(new Date(tmp), options.format)).change();
                }
            }
        },

        click: function (event) {
            event.stopPropagation();
            // lists
            if (['list', 'combo', 'enum'].indexOf(this.type) != -1) {
                if (!$(this.el).is(':focus')) this.focus(event);
            }
            // other fields with drops
            if (['date', 'time', 'color', 'datetime'].indexOf(this.type) != -1) {
                this.updateOverlay();
            }
        },

        focus: function (event) {
            var obj     = this;
            var options = this.options;
            // color, date, time
            if (['color', 'date', 'time', 'datetime'].indexOf(obj.type) !== -1) {
                if ($(obj.el).prop('readonly') || $(obj.el).prop('disabled')) return;
                if ($("#w2ui-overlay").length > 0) $('#w2ui-overlay')[0].hide();
                setTimeout(function () { obj.updateOverlay(); }, 150);
            }
            // menu
            if (['list', 'combo', 'enum'].indexOf(obj.type) != -1) {
                if ($(obj.el).prop('readonly') || $(obj.el).prop('disabled')) return;
                if ($("#w2ui-overlay").length > 0) $('#w2ui-overlay')[0].hide();
                obj.resize();
                setTimeout(function () {
                    if (obj.type == 'list' && $(obj.el).is(':focus')) {
                        $(obj.helpers.focus).find('input').focus();
                        return;
                    }
                    obj.search();
                    setTimeout(function () { obj.updateOverlay(); }, 1);
                }, 1);
            }
            // file
            if (obj.type == 'file') {
                $(obj.helpers.multi).css({ 'outline': 'auto 5px #7DB4F3', 'outline-offset': '-2px' });
            }
        },

        blur: function (event) {
            var obj     = this;
            var options = obj.options;
            var val     = $(obj.el).val().trim();
            var $overlay = $("#w2ui-overlay");

            // hide overlay
            if (['color', 'date', 'time', 'list', 'combo', 'enum', 'datetime'].indexOf(obj.type) != -1) {
                var closeTimeout = window.setTimeout(function() {
                    if ($overlay.data('keepOpen') !== true) $overlay.hide();
                }, 0);

                $(".menu", $overlay).one('focus', function() {
                    clearTimeout(closeTimeout);
                    $(this).one('focusout', function(event) {
                        $overlay.hide();
                    })
                });
            }
            if (['int', 'float', 'money', 'currency', 'percent'].indexOf(obj.type) != -1) {
                if (val !== '' && !obj.checkType(val)) {
                    $(obj.el).val('').change();
                    if (options.silent === false) {
                        $(obj.el).w2tag('Not a valid number');
                        setTimeout(function () { $(obj.el).w2tag(''); }, 3000);
                    }
                }
            }
            // date or time
            if (['date', 'time', 'datetime'].indexOf(obj.type) != -1) {
                // check if in range
                if (val !== '' && !obj.inRange(obj.el.value)) {
                    $(obj.el).val('').removeData('selected').change();
                    if (options.silent === false) {
                        $(obj.el).w2tag('Not in range');
                        setTimeout(function () { $(obj.el).w2tag(''); }, 3000);
                    }
                } else {
                    if (obj.type == 'date' && val !== '' && !w2utils.isDate(obj.el.value, options.format)) {
                        $(obj.el).val('').removeData('selected').change();
                        if (options.silent === false) {
                            $(obj.el).w2tag('Not a valid date');
                            setTimeout(function () { $(obj.el).w2tag(''); }, 3000);
                        }
                    }
                    else if (obj.type == 'time' && val !== '' && !w2utils.isTime(obj.el.value)) {
                        $(obj.el).val('').removeData('selected').change();
                        if (options.silent === false) {
                            $(obj.el).w2tag('Not a valid time');
                            setTimeout(function () { $(obj.el).w2tag(''); }, 3000);
                        }
                    }
                    else if (obj.type == 'datetime' && val !== '' && !w2utils.isDateTime(obj.el.value, options.format)) {
                        $(obj.el).val('').removeData('selected').change();
                        if (options.silent === false) {
                            $(obj.el).w2tag('Not a valid date');
                            setTimeout(function () { $(obj.el).w2tag(''); }, 3000);
                        }
                    }
                }
            }
            // clear search input
            if (obj.type == 'enum') {
                $(obj.helpers.multi).find('input').val('').width(20);
            }
            // file
            if (obj.type == 'file') {
                $(obj.helpers.multi).css({ 'outline': 'none' });
            }
        },

        keyPress: function (event) {
            var obj     = this;
            var options = obj.options;
            // ignore wrong pressed key
            if (['int', 'float', 'money', 'currency', 'percent', 'hex', 'bin', 'color', 'alphanumeric'].indexOf(obj.type) != -1) {
                // keyCode & charCode differ in FireFox
                if (event.metaKey || event.ctrlKey || event.altKey || (event.charCode != event.keyCode && event.keyCode > 0)) return;
                var ch = String.fromCharCode(event.charCode);
                if (!obj.checkType(ch, true) && event.keyCode != 13) {
                    event.preventDefault();
                    if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;
                    return false;
                }
            }
            // update date popup
            if (['date', 'time', 'datetime'].indexOf(obj.type) != -1) {
                if (event.keyCode !== 9) setTimeout(function () { obj.updateOverlay(); }, 1);
            }
        },

        keyDown: function (event, extra) {
            var obj     = this;
            var options = obj.options;
            var key     = event.keyCode || (extra && extra.keyCode);
            // numeric
            if (['int', 'float', 'money', 'currency', 'percent'].indexOf(obj.type) != -1) {
                if (!options.keyboard || $(obj.el).prop('readonly') || $(obj.el).prop('disabled')) return;
                var cancel = false;
                var val = parseFloat($(obj.el).val().replace(options.moneyRE, '')) || 0;
                var inc = options.step;
                if (event.ctrlKey || event.metaKey) inc = 10;
                switch (key) {
                    case 38: // up
                        if (event.shiftKey) break; // no action if shift key is pressed
                        $(obj.el).val((val + inc <= options.max || options.max == null ? Number((val + inc).toFixed(12)) : options.max)).change();
                        cancel = true;
                        break;
                    case 40: // down
                        if (event.shiftKey) break; // no action if shift key is pressed
                        $(obj.el).val((val - inc >= options.min || options.min == null ? Number((val - inc).toFixed(12)) : options.min)).change();
                        cancel = true;
                        break;
                }
                if (cancel) {
                    event.preventDefault();
                    setTimeout(function () {
                        // set cursor to the end
                        obj.el.setSelectionRange(obj.el.value.length, obj.el.value.length);
                    }, 0);
                }
            }
            // date
            if (obj.type == 'date') {
                if (!options.keyboard || $(obj.el).prop('readonly') || $(obj.el).prop('disabled')) return;
                var cancel  = false;
                var daymil  = 24*60*60*1000;
                var inc     = 1;
                if (event.ctrlKey || event.metaKey) inc = 10;
                var dt = w2utils.isDate($(obj.el).val(), options.format, true);
                if (!dt) { dt = new Date(); daymil = 0; }
                switch (key) {
                    case 38: // up
                        if (event.shiftKey) break; // no action if shift key is pressed
                        var newDT = w2utils.formatDate(dt.getTime() + daymil, options.format);
                        if (inc == 10) newDT = w2utils.formatDate(new Date(dt.getFullYear(), dt.getMonth()+1, dt.getDate()), options.format);
                        $(obj.el).val(newDT).change();
                        cancel = true;
                        break;
                    case 40: // down
                        if (event.shiftKey) break; // no action if shift key is pressed
                        var newDT = w2utils.formatDate(dt.getTime() - daymil, options.format);
                        if (inc == 10) newDT = w2utils.formatDate(new Date(dt.getFullYear(), dt.getMonth()-1, dt.getDate()), options.format);
                        $(obj.el).val(newDT).change();
                        cancel = true;
                        break;
                }
                if (cancel) {
                    event.preventDefault();
                    setTimeout(function () {
                        // set cursor to the end
                        obj.el.setSelectionRange(obj.el.value.length, obj.el.value.length);
                        obj.updateOverlay();
                    }, 0);
                }
            }
            // time
            if (obj.type == 'time') {
                if (!options.keyboard || $(obj.el).prop('readonly') || $(obj.el).prop('disabled')) return;
                var cancel  = false;
                var inc     = (event.ctrlKey || event.metaKey ? 60 : 1);
                var val     = $(obj.el).val();
                var time    = obj.toMin(val) || obj.toMin((new Date()).getHours() + ':' + ((new Date()).getMinutes() - 1));
                switch (key) {
                    case 38: // up
                        if (event.shiftKey) break; // no action if shift key is pressed
                        time += inc;
                        cancel = true;
                        break;
                    case 40: // down
                        if (event.shiftKey) break; // no action if shift key is pressed
                        time -= inc;
                        cancel = true;
                        break;
                }
                if (cancel) {
                    $(obj.el).val(obj.fromMin(time)).change();
                    event.preventDefault();
                    setTimeout(function () {
                        // set cursor to the end
                        obj.el.setSelectionRange(obj.el.value.length, obj.el.value.length);
                    }, 0);
                }
            }
            // datetime
            if (obj.type == 'datetime') {
                if (!options.keyboard || $(obj.el).prop('readonly') || $(obj.el).prop('disabled')) return;
                var cancel  = false;
                var daymil  = 24*60*60*1000;
                var inc     = 1;
                if (event.ctrlKey || event.metaKey) inc = 10;
                var str = $(obj.el).val();
                var dt  = w2utils.isDateTime(str, this.options.format, true);
                if (!dt) { dt = new Date(); daymil = 0; }
                switch (key) {
                    case 38: // up
                        if (event.shiftKey) break; // no action if shift key is pressed
                        var newDT = w2utils.formatDateTime(dt.getTime() + daymil, options.format);
                        if (inc == 10) newDT = w2utils.formatDateTime(new Date(dt.getFullYear(), dt.getMonth()+1, dt.getDate()), options.format);
                        $(obj.el).val(newDT).change();
                        cancel = true;
                        break;
                    case 40: // down
                        if (event.shiftKey) break; // no action if shift key is pressed
                        var newDT = w2utils.formatDateTime(dt.getTime() - daymil, options.format);
                        if (inc == 10) newDT = w2utils.formatDateTime(new Date(dt.getFullYear(), dt.getMonth()-1, dt.getDate()), options.format);
                        $(obj.el).val(newDT).change();
                        cancel = true;
                        break;
                }
                if (cancel) {
                    event.preventDefault();
                    setTimeout(function () {
                        // set cursor to the end
                        obj.el.setSelectionRange(obj.el.value.length, obj.el.value.length);
                        obj.updateOverlay();
                    }, 0);
                }
            }
            // color
            if (obj.type == 'color') {
                if ($(obj.el).prop('readonly') || $(obj.el).prop('disabled')) return;
                // paste
                if ((event.ctrlKey || event.metaKey) && !event.shiftKey) {
                    var dir      = null;
                    var newColor = null;
                    switch (key) {
                        case 38: // up
                            dir = 'up';
                            break;
                        case 40: // down
                            dir = 'down';
                            break;
                        case 39: // right
                            dir = 'right';
                            break;
                        case 37: // left
                            dir = 'left';
                            break;
                    }
                    if (obj.el.nav && dir != null) {
                        newColor = obj.el.nav(dir);
                        $(obj.el).val(newColor).change();
                        event.preventDefault();
                    }
                }
            }
            // list/select/combo
            if (['list', 'combo', 'enum'].indexOf(obj.type) != -1) {
                if ($(obj.el).prop('readonly') || $(obj.el).prop('disabled')) return;
                var selected  = $(obj.el).data('selected');
                var focus     = $(obj.el);
                var indexOnly = false;
                if (['list', 'enum'].indexOf(obj.type) != -1) {
                    if (obj.type == 'list') {
                        focus = $(obj.helpers.focus).find('input');
                    }
                    if (obj.type == 'enum') {
                        focus = $(obj.helpers.multi).find('input');
                    }
                    // not arrows - refresh
                    if ([37, 38, 39, 40].indexOf(key) == -1) {
                        setTimeout(function () { obj.refresh(); }, 1);
                    }
                    // paste
                    if (event.keyCode == 86 && (event.ctrlKey || event.metaKey)) {
                        setTimeout(function () {
                            obj.refresh();
                            obj.search();
                            obj.request();
                        }, 50);
                    }
                }
                // apply arrows
                switch (key) {
                    case 27: // escape
                        if (obj.type == 'list') {
                            if (focus.val() !== '') focus.val('');
                            event.stopPropagation(); // escape in field should not close popup
                        }
                        break;
                    case 37: // left
                    case 39: // right
                        // indexOnly = true;
                        break;
                    case 13: // enter
                        if ($('#w2ui-overlay').length === 0) break; // no action if overlay not open
                        var item  = options.items[options.index];
                        if (obj.type == 'enum') {
                            if (item != null) {
                                // trigger event
                                var edata = obj.trigger({ phase: 'before', type: 'add', target: obj.el, originalEvent: event.originalEvent, item: item });
                                if (edata.isCancelled === true) return;
                                item = edata.item; // need to reassign because it could be recreated by user
                                // default behavior
                                if (selected.length >= options.max && options.max > 0) selected.pop();
                                delete item.hidden;
                                delete obj.tmp.force_open;
                                selected.push(item);
                                $(obj.el).change();
                                focus.val('').width(20);
                                obj.refresh();
                                // event after
                                obj.trigger($.extend(edata, { phase: 'after' }));
                            } else {
                                // trigger event
                                item = { id: focus.val(), text: focus.val() };
                                var edata = obj.trigger({ phase: 'before', type: 'new', target: obj.el, originalEvent: event.originalEvent, item: item });
                                if (edata.isCancelled === true) return;
                                item = edata.item; // need to reassign because it could be recreated by user
                                // default behavior
                                if (typeof obj.onNew == 'function') {
                                    if (selected.length >= options.max && options.max > 0) selected.pop();
                                    delete obj.tmp.force_open;
                                    selected.push(item);
                                    $(obj.el).change();
                                    focus.val('').width(20);
                                    obj.refresh();
                                }
                                // event after
                                obj.trigger($.extend(edata, { phase: 'after' }));
                            }
                        } else {
                            if (item) $(obj.el).data('selected', item).val(item.text).change();
                            if ($(obj.el).val() === '' && $(obj.el).data('selected')) $(obj.el).removeData('selected').val('').change();
                            if (obj.type == 'list') {
                                focus.val('');
                                obj.refresh();
                            }
                            // hide overlay
                            obj.tmp.force_hide = true;
                        }
                        break;
                    case 8:  // backspace
                    case 46: // delete
                        if (obj.type == 'enum' && key == 8) {
                            if (focus.val() === '' && selected.length > 0) {
                                var item = selected[selected.length - 1];
                                // trigger event
                                var edata = obj.trigger({ phase: 'before', type: 'remove', target: obj.el, originalEvent: event.originalEvent, item: item });
                                if (edata.isCancelled === true) return;
                                // default behavior
                                selected.pop();
                                $(obj.el).trigger('change');
                                obj.refresh();
                                // event after
                                obj.trigger($.extend(edata, { phase: 'after' }));
                            }
                        }
                        if (obj.type == 'list' && focus.val() === '') {
                            $(obj.el).data('selected', {}).change();
                            obj.refresh();
                        }
                        break;
                    case 38: // up
                        options.index = w2utils.isInt(options.index) ? parseInt(options.index) : 0;
                        options.index--;
                        while (options.index > 0 && options.items[options.index].hidden) options.index--;
                        if (options.index === 0 && options.items[options.index].hidden) {
                            while (options.items[options.index] && options.items[options.index].hidden) options.index++;
                        }
                        indexOnly = true;
                        break;
                    case 40: // down
                        options.index = w2utils.isInt(options.index) ? parseInt(options.index) : -1;
                        options.index++;
                        while (options.index < options.items.length-1 && options.items[options.index].hidden) options.index++;
                        if (options.index == options.items.length-1 && options.items[options.index].hidden) {
                            while (options.items[options.index] && options.items[options.index].hidden) options.index--;
                        }
                        // show overlay if not shown
                        if (focus.val() === '' && $('#w2ui-overlay').length === 0) {
                            obj.tmp.force_open = true;
                        } else {
                            indexOnly = true;
                        }
                        break;
                }
                if (indexOnly) {
                    if (options.index < 0) options.index = 0;
                    if (options.index >= options.items.length) options.index = options.items.length -1;
                    obj.updateOverlay(indexOnly);
                    // cancel event
                    event.preventDefault();
                    setTimeout(function () {
                        // set cursor to the end
                        if (obj.type == 'enum') {
                            var tmp = focus.get(0);
                            tmp.setSelectionRange(tmp.value.length, tmp.value.length);
                        } else if (obj.type == 'list') {
                            var tmp = focus.get(0);
                            tmp.setSelectionRange(tmp.value.length, tmp.value.length);
                        } else {
                            obj.el.setSelectionRange(obj.el.value.length, obj.el.value.length);
                        }
                    }, 0);
                    return;
                }
                // expand input
                if (obj.type == 'enum') {
                    focus.width(((focus.val().length + 2) * 8) + 'px');
                }
            }
        },

        keyUp: function (event) {
            var obj = this;
            if (['list', 'combo', 'enum'].indexOf(this.type) != -1) {
                if ($(obj.el).prop('readonly') || $(obj.el).prop('disabled')) return;
                // need to be here for ipad compa
                if ([16, 17, 18, 20, 37, 39, 91].indexOf(event.keyCode) == -1) { // no refreah on crtl, shift, left/right arrows, etc
                    var input = $(this.helpers.focus).find('input');
                    if (input.length === 0) input = $(this.el); // for combo list
                    // trigger event
                    var edata = this.trigger({ phase: 'before', type: 'search', originalEvent: event, target: input, search: input.val() });
                    if (edata.isCancelled === true) return;
                    // regular
                    if (!this.tmp.force_hide) this.request();
                    if (input.val().length == 1) this.refresh();
                    if ($('#w2ui-overlay').length === 0 || [38, 40].indexOf(event.keyCode) == -1) { // no search on arrows
                        this.search();
                    }
                    // event after
                    this.trigger($.extend(edata, { phase: 'after' }));
                }
            }
        },

        clearCache: function () {
            var options          = this.options;
            options.items        = [];
            this.tmp.xhr_loading = false;
            this.tmp.xhr_search  = '';
            this.tmp.xhr_total   = -1;
        },

        request: function (interval) {
            var obj      = this;
            var options  = this.options;
            var search   = $(obj.el).val() || '';
            // if no url - do nothing
            if (!options.url) return;
            // --
            if (obj.type == 'enum') {
                var tmp = $(obj.helpers.multi).find('input');
                if (tmp.length === 0) search = ''; else search = tmp.val();
            }
            if (obj.type == 'list') {
                var tmp = $(obj.helpers.focus).find('input');
                if (tmp.length === 0) search = ''; else search = tmp.val();
            }
            if (options.minLength !== 0 && search.length < options.minLength) {
                options.items = []; // need to empty the list
                this.updateOverlay();
                return;
            }
            if (interval == null) interval = options.interval;
            if (obj.tmp.xhr_search == null) obj.tmp.xhr_search = '';
            if (obj.tmp.xhr_total == null) obj.tmp.xhr_total = -1;
            // check if need to search
            if (options.url && $(obj.el).prop('readonly') !== true && $(obj.el).prop('disabled') !== true && (
                    (options.items.length === 0 && obj.tmp.xhr_total !== 0) ||
                    (obj.tmp.xhr_total == options.cacheMax && search.length > obj.tmp.xhr_search.length) ||
                    (search.length >= obj.tmp.xhr_search.length && search.substr(0, obj.tmp.xhr_search.length) != obj.tmp.xhr_search) ||
                    (search.length < obj.tmp.xhr_search.length)
                )) {
                // empty list
                if (obj.tmp.xhr) obj.tmp.xhr.abort();
                obj.tmp.xhr_loading = true;
                obj.search();
                // timeout
                clearTimeout(obj.tmp.timeout);
                obj.tmp.timeout = setTimeout(function () {
                    // trigger event
                    var url      = options.url;
                    var postData = {
                        search : search,
                        max    : options.cacheMax
                    };
                    $.extend(postData, options.postData);
                    var edata = obj.trigger({ phase: 'before', type: 'request', search: search, target: obj.el, url: url, postData: postData });
                    if (edata.isCancelled === true) return;
                    url      = edata.url;
                    postData = edata.postData;
                    var ajaxOptions = {
                        type     : 'GET',
                        url      : url,
                        data     : postData,
                        dataType : 'JSON' // expected from server
                    };
                    if (options.method) ajaxOptions.type = options.method;
                    if (w2utils.settings.dataType == 'JSON') {
                        ajaxOptions.type        = 'POST';
                        ajaxOptions.data        = JSON.stringify(ajaxOptions.data);
                        ajaxOptions.contentType = 'application/json';
                    }
                    if (w2utils.settings.dataType == 'HTTPJSON') {
                        ajaxOptions.data = { request: JSON.stringify(ajaxOptions.data) };
                    }
                    if (options.method != null) ajaxOptions.type = options.method;
                    obj.tmp.xhr = $.ajax(ajaxOptions)
                        .done(function (data, status, xhr) {
                            // trigger event
                            var edata2 = obj.trigger({ phase: 'before', type: 'load', target: obj.el, search: postData.search, data: data, xhr: xhr });
                            if (edata2.isCancelled === true) return;
                            // default behavior
                            data = edata2.data;
                            if (typeof data == 'string') data = JSON.parse(data);
                            if (data.records == null && data.items != null) {
                                // needed for backward compatibility
                                data.records = data.items;
                                delete data.items;
                            }
                            if (data.status != 'success' || !Array.isArray(data.records)) {
                                console.log('ERROR: server did not return proper structure. It should return', { status: 'success', records: [{ id: 1, text: 'item' }] });
                                return;
                            }
                            // remove all extra items if more then needed for cache
                            if (data.records.length > options.cacheMax) data.records.splice(options.cacheMax, 100000);
                            // map id and text
                            if (options.recId == null && options.recid != null) options.recId = options.recid; // since lower-case recid is used in grid
                            if (options.recId || options.recText) {
                                data.records.forEach(function (item) {
                                    if (typeof options.recId == 'string') item.id   = item[options.recId];
                                    if (typeof options.recId == 'function') item.id = options.recId(item);
                                    if (typeof options.recText == 'string') item.text   = item[options.recText];
                                    if (typeof options.recText == 'function') item.text = options.recText(item);
                                });
                            }
                            // remember stats
                            obj.tmp.xhr_loading = false;
                            obj.tmp.xhr_search  = search;
                            obj.tmp.xhr_total   = data.records.length;
                            options.items       = obj.normMenu(data.records);
                            if (search === '' && data.records.length === 0) obj.tmp.emptySet = true; else obj.tmp.emptySet = false;
                            obj.search();
                            // event after
                            obj.trigger($.extend(edata2, { phase: 'after' }));
                        })
                        .fail(function (xhr, status, error) {
                            // trigger event
                            var errorObj = { status: status, error: error, rawResponseText: xhr.responseText };
                            var edata2 = obj.trigger({ phase: 'before', type: 'error', target: obj.el, search: search, error: errorObj, xhr: xhr });
                            if (edata2.isCancelled === true) return;
                            // default behavior
                            if (status != 'abort') {
                                var data;
                                try { data = $.parseJSON(xhr.responseText); } catch (e) {}
                                console.log('ERROR: Server communication failed.',
                                    '\n   EXPECTED:', { status: 'success', records: [{ id: 1, text: 'item' }] },
                                    '\n         OR:', { status: 'error', message: 'error message' },
                                    '\n   RECEIVED:', typeof data == 'object' ? data : xhr.responseText);
                            }
                            // reset stats
                            obj.clearCache();
                            obj.search();
                            // event after
                            obj.trigger($.extend(edata2, { phase: 'after' }));
                        });
                    // event after
                    obj.trigger($.extend(edata, { phase: 'after' }));
                }, interval);
            }
        },

        search: function () {
            var obj      = this;
            var options  = this.options;
            var search   = $(obj.el).val();
            var target   = obj.el;
            var ids      = [];
            var selected = $(obj.el).data('selected');
            if (obj.type == 'enum') {
                target = $(obj.helpers.multi).find('input');
                search = target.val();
                for (var s in selected) { if (selected[s]) ids.push(selected[s].id); }
            }
            else if (obj.type == 'list') {
                target = $(obj.helpers.focus).find('input');
                search = target.val();
                for (var s in selected) { if (selected[s]) ids.push(selected[s].id); }
            }
            if (obj.tmp.xhr_loading !== true) {
                var shown = 0;
                for (var i = 0; i < options.items.length; i++) {
                    var item = options.items[i];
                    if (options.compare != null) {
                        if (typeof options.compare == 'function') {
                            item.hidden = (options.compare.call(this, item, search) === false ? true : false);
                        }
                    } else {
                        var prefix = '';
                        var suffix = '';
                        if (['is', 'begins'].indexOf(options.match) != -1) prefix = '^';
                        if (['is', 'ends'].indexOf(options.match) != -1) suffix = '$';
                        try {
                            var re = new RegExp(prefix + search + suffix, 'i');
                            if (re.test(item.text) || item.text == '...') item.hidden = false; else item.hidden = true;
                        } catch (e) {}
                    }
                    if (options.filter === false) item.hidden = false;
                    // do not show selected items
                    if (obj.type == 'enum' && $.inArray(item.id, ids) != -1) item.hidden = true;
                    if (item.hidden !== true) { shown++; delete item.hidden; }
                }
                // preselect first item
                options.index = -1;
                while (options.items[options.index] && options.items[options.index].hidden) options.index++;
                if (shown <= 0) options.index = -1;
                options.spinner = false;
                obj.updateOverlay();
                setTimeout(function () {
                    var html = $('#w2ui-overlay').html() || '';
                    if (options.markSearch && html.indexOf('$.fn.w2menuHandler') != -1) { // do not highlight when no items
                        $('#w2ui-overlay').w2marker(search);
                    }
                }, 1);
            } else {
                options.items.splice(0, options.cacheMax);
                options.spinner = true;
                obj.updateOverlay();
            }
        },

        updateOverlay: function (indexOnly) {
            var obj     = this;
            var options = this.options;
            // color
            if (this.type == 'color') {
                if ($(obj.el).prop('readonly') || $(obj.el).prop('disabled')) return;
                $(this.el).w2color({
                    color       : $(this.el).val(),
                    transparent : options.transparent,
                    advanced    : options.advanced
                },
                function (color) {
                    if (color == null) return;
                    $(obj.el).val(color).change();
                });
            }
            // date
            if (this.type == 'date') {
                if ($(obj.el).prop('readonly') || $(obj.el).prop('disabled')) return;
                if ($('#w2ui-overlay').length === 0) {
                    $(obj.el).w2overlay('<div class="w2ui-reset w2ui-calendar"></div>', {
                        css: { "background-color": "#f5f5f5" },
                        onShow: function (event) {
                            // this needed for IE 11 compatibility
                            if (w2utils.isIE) {
                                console.log("IE");
                                $('.w2ui-calendar').on('mousedown', function (event) {
                                    var $tg = $(event.target);
                                    if ($tg.length == 1 && $tg[0].id == 'w2ui-jump-year') {
                                        $('#w2ui-overlay').data('keepOpen', true);
                                    }
                                });
                            }
                        }
                    });
                }
                var month, year;
                var dt = w2utils.isDate($(obj.el).val(), obj.options.format, true);
                if (dt) { month = dt.getMonth() + 1; year = dt.getFullYear(); }
                (function refreshCalendar(month, year) {
                    $('#w2ui-overlay > div > div').html(obj.getMonthHTML(month, year, $(obj.el).val()));
                    $('#w2ui-overlay .w2ui-calendar-title')
                        .on('mousedown', function () {
                            if ($(this).next().hasClass('w2ui-calendar-jump')) {
                                $(this).next().remove();
                            } else {
                                var selYear, selMonth;
                                $(this).after('<div class="w2ui-calendar-jump" style=""></div>');
                                $(this).next().hide().html(obj.getYearHTML()).fadeIn(200);
                                setTimeout(function () {
                                    $('#w2ui-overlay .w2ui-calendar-jump')
                                        .find('.w2ui-jump-month, .w2ui-jump-year')
                                        .on('click', function () {
                                            if ($(this).hasClass('w2ui-jump-month')) {
                                                $(this).parent().find('.w2ui-jump-month').removeClass('selected');
                                                $(this).addClass('selected');
                                                selMonth = $(this).attr('name');
                                            }
                                            if ($(this).hasClass('w2ui-jump-year')) {
                                                $(this).parent().find('.w2ui-jump-year').removeClass('selected');
                                                $(this).addClass('selected');
                                                selYear = $(this).attr('name');
                                            }
                                            if (selYear != null && selMonth != null) {
                                                $('#w2ui-overlay .w2ui-calendar-jump').fadeOut(100);
                                                setTimeout(function () { refreshCalendar(parseInt(selMonth)+1, selYear); }, 100);
                                            }
                                        });
                                    $('#w2ui-overlay .w2ui-calendar-jump >:last-child').prop('scrollTop', 2000);
                                }, 1);
                            }
                        });
                    $('#w2ui-overlay .w2ui-date')
                        .on('mousedown', function () {
                            var day = $(this).attr('date');
                            $(obj.el).val(day).change();
                            $(this).css({ 'background-color': '#B6D5FB', 'border-color': '#aaa' });
                        })
                        .on('mouseup', function () {
                            setTimeout(function () {
                                if ($("#w2ui-overlay").length > 0) $('#w2ui-overlay').removeData('keepOpen')[0].hide();
                            }, 10);
                        });
                    $('#w2ui-overlay .previous').on('mousedown', function () {
                        var tmp = obj.options.current.split('/');
                        tmp[0]  = parseInt(tmp[0]) - 1;
                        refreshCalendar(tmp[0], tmp[1]);
                    });
                    $('#w2ui-overlay .next').on('mousedown', function () {
                        var tmp = obj.options.current.split('/');
                        tmp[0]  = parseInt(tmp[0]) + 1;
                        refreshCalendar(tmp[0], tmp[1]);
                    });
                }) (month, year);
            }
            // time
            if (this.type == 'time') {
                if ($(obj.el).prop('readonly') || $(obj.el).prop('disabled')) return;
                if ($('#w2ui-overlay').length === 0) {
                    $(obj.el).w2overlay('<div class="w2ui-reset w2ui-calendar-time" onclick="event.stopPropagation();"></div>', {
                        css: { "background-color": "#fff" }
                    });
                }
                var h24 = (this.options.format == 'h24');
                $('#w2ui-overlay > div').html(obj.getHourHTML());
                $('#w2ui-overlay .w2ui-time')
                    .on('mousedown', function (event) {
                        $(this).css({ 'background-color': '#B6D5FB', 'border-color': '#aaa' });
                        var hour = $(this).attr('hour');
                        $(obj.el).val((hour > 12 && !h24 ? hour - 12 : hour) + ':00' + (!h24 ? (hour < 12 ? ' am' : ' pm') : '')).change();
                    });
                    if (this.options.noMinutes == null || this.options.noMinutes === false) {
                        $('#w2ui-overlay .w2ui-time')
                            .on('mouseup', function () {
                                var hour = $(this).attr('hour');
                                if ($("#w2ui-overlay").length > 0) $('#w2ui-overlay')[0].hide();
                                $(obj.el).w2overlay('<div class="w2ui-reset w2ui-calendar-time"></div>', { css: { "background-color": "#fff" } });
                                $('#w2ui-overlay > div').html(obj.getMinHTML(hour));
                                $('#w2ui-overlay .w2ui-time')
                                    .on('mousedown', function () {
                                        $(this).css({ 'background-color': '#B6D5FB', 'border-color': '#aaa' });
                                        var min = $(this).attr('min');
                                        $(obj.el).val((hour > 12 && !h24 ? hour - 12 : hour) + ':' + (min < 10 ? 0 : '') + min + (!h24 ? (hour < 12 ? ' am' : ' pm') : '')).change();
                                    })
                                    .on('mouseup', function () {
                                        setTimeout(function () { if ($("#w2ui-overlay").length > 0) $('#w2ui-overlay').removeData('keepOpen')[0].hide(); }, 10);
                                    });
                            });
                    } else {
                        $('#w2ui-overlay .w2ui-time')
                            .on('mouseup', function () {
                                    setTimeout(function () { if ($("#w2ui-overlay").length > 0) $('#w2ui-overlay').removeData('keepOpen')[0].hide(); }, 10);
                            });
                    }
            }
            // datetime
            if (this.type == 'datetime') {
                if ($(obj.el).prop('readonly') || $(obj.el).prop('disabled')) return;
                // hide overlay if we are in the time selection
                if ($("#w2ui-overlay .w2ui-time").length > 0) $('#w2ui-overlay')[0].hide();
                if ($('#w2ui-overlay').length === 0) {
                    $(obj.el).w2overlay('<div class="w2ui-reset w2ui-calendar" onclick="event.stopPropagation();"></div>', {
                        css: { "background-color": "#f5f5f5" },
                        onShow: function (event) {
                            // this needed for IE 11 compatibility
                            if (w2utils.isIE) {
                                console.log("IE");
                                $('.w2ui-calendar').on('mousedown', function (event) {
                                    var $tg = $(event.target);
                                    if ($tg.length == 1 && $tg[0].id == 'w2ui-jump-year') {
                                        $('#w2ui-overlay').data('keepOpen', true);
                                    }
                                });
                            }
                        }
                    });
                }
                var month, year;
                var dt = w2utils.isDateTime($(obj.el).val(), obj.options.format, true);
                if (dt) { month = dt.getMonth() + 1; year = dt.getFullYear(); }
                var selDate = null;
                (function refreshCalendar(month, year) {
                    $('#w2ui-overlay > div > div').html(
                        obj.getMonthHTML(month, year, $(obj.el).val())
                        + (options.btn_now ? '<div class="w2ui-calendar-now now">'+ w2utils.lang('Current Date & Time') + '</div>' : '')
                    );
                    $('#w2ui-overlay .w2ui-calendar-title')
                        .on('mousedown', function () {
                            if ($(this).next().hasClass('w2ui-calendar-jump')) {
                                $(this).next().remove();
                            } else {
                                var selYear, selMonth;
                                $(this).after('<div class="w2ui-calendar-jump" style=""></div>');
                                $(this).next().hide().html(obj.getYearHTML()).fadeIn(200);
                                setTimeout(function () {
                                    $('#w2ui-overlay .w2ui-calendar-jump')
                                        .find('.w2ui-jump-month, .w2ui-jump-year')
                                        .on('click', function () {
                                            if ($(this).hasClass('w2ui-jump-month')) {
                                                $(this).parent().find('.w2ui-jump-month').removeClass('selected');
                                                $(this).addClass('selected');
                                                selMonth = $(this).attr('name');
                                            }
                                            if ($(this).hasClass('w2ui-jump-year')) {
                                                $(this).parent().find('.w2ui-jump-year').removeClass('selected');
                                                $(this).addClass('selected');
                                                selYear = $(this).attr('name');
                                            }
                                            if (selYear != null && selMonth != null) {
                                                $('#w2ui-overlay .w2ui-calendar-jump').fadeOut(100);
                                                setTimeout(function () { refreshCalendar(parseInt(selMonth)+1, selYear); }, 100);
                                            }
                                        });
                                    $('#w2ui-overlay .w2ui-calendar-jump >:last-child').prop('scrollTop', 2000);
                                }, 1);
                            }
                        });
                    $('#w2ui-overlay .w2ui-date')
                        .on('mousedown', function () {
                            var day = $(this).attr('date');
                            $(obj.el).val(day).change();
                            $(this).css({ 'background-color': '#B6D5FB', 'border-color': '#aaa' });
                            selDate = new Date($(this).attr('data-date'));
                        })
                        .on('mouseup', function () {
                            // continue with time picker
                            var selHour, selMin;
                            if ($("#w2ui-overlay").length > 0) $('#w2ui-overlay')[0].hide();
                            $(obj.el).w2overlay('<div class="w2ui-reset w2ui-calendar-time"></div>', { css: { "background-color": "#fff" } });
                            var h24 = (obj.options.format == 'h24');
                            $('#w2ui-overlay > div').html(obj.getHourHTML());
                            $('#w2ui-overlay .w2ui-time')
                                .on('mousedown', function (event) {
                                    $(this).css({ 'background-color': '#B6D5FB', 'border-color': '#aaa' });
                                    selHour = $(this).attr('hour');
                                    selDate.setHours(selHour);
                                    var txt = w2utils.formatDateTime(selDate, obj.options.format);
                                    $(obj.el).val(txt).change();
                                    //$(obj.el).val((hour > 12 && !h24 ? hour - 12 : hour) + ':00' + (!h24 ? (hour < 12 ? ' am' : ' pm') : '')).change();
                                });
                            if (obj.options.noMinutes == null || obj.options.noMinutes === false) {
                                $('#w2ui-overlay .w2ui-time')
                                    .on('mouseup', function () {
                                        var hour = $(this).attr('hour');
                                        if ($("#w2ui-overlay").length > 0) $('#w2ui-overlay')[0].hide();
                                        $(obj.el).w2overlay('<div class="w2ui-reset w2ui-calendar-time"></div>', { css: { "background-color": "#fff" } });
                                        $('#w2ui-overlay > div').html(obj.getMinHTML(hour));
                                        $('#w2ui-overlay .w2ui-time')
                                            .on('mousedown', function () {
                                                $(this).css({ 'background-color': '#B6D5FB', 'border-color': '#aaa' });
                                                selMin = $(this).attr('min');
                                                selDate.setHours(selHour, selMin);
                                                var txt = w2utils.formatDateTime(selDate, obj.options.format);
                                                $(obj.el).val(txt).change();
                                                //$(obj.el).val((hour > 12 && !h24 ? hour - 12 : hour) + ':' + (min < 10 ? 0 : '') + min + (!h24 ? (hour < 12 ? ' am' : ' pm') : '')).change();
                                            })
                                            .on('mouseup', function () {
                                                setTimeout(function () { if ($("#w2ui-overlay").length > 0) $('#w2ui-overlay').removeData('keepOpen')[0].hide(); }, 10);
                                            });
                                    });
                            } else {
                                $('#w2ui-overlay .w2ui-time')
                                    .on('mouseup', function () {
                                            setTimeout(function () { if ($("#w2ui-overlay").length > 0) $('#w2ui-overlay').removeData('keepOpen')[0].hide(); }, 10);
                                    });
                            }
                        });
                    $('#w2ui-overlay .previous').on('mousedown', function () {
                        var tmp = obj.options.current.split('/');
                        tmp[0]  = parseInt(tmp[0]) - 1;
                        refreshCalendar(tmp[0], tmp[1]);
                    });
                    $('#w2ui-overlay .next').on('mousedown', function () {
                        var tmp = obj.options.current.split('/');
                        tmp[0]  = parseInt(tmp[0]) + 1;
                        refreshCalendar(tmp[0], tmp[1]);
                    });
                    // "now" button
                    $('#w2ui-overlay .now')
                        .on('mousedown', function () {
                            // this currently ignores blocked days or start / end dates!
                            var tmp = w2utils.formatDateTime(new Date(), obj.options.format);
                            $(obj.el).val(tmp).change();
                            return false;
                        })
                        .on('mouseup', function () {
                            setTimeout(function () {
                                if ($("#w2ui-overlay").length > 0) $('#w2ui-overlay').removeData('keepOpen')[0].hide();
                            }, 10);
                        });
                }) (month, year);
            }
            // list
            if (['list', 'combo', 'enum'].indexOf(this.type) != -1) {
                var el    = this.el;
                var input = this.el;
                if (this.type == 'enum') {
                    el    = $(this.helpers.multi);
                    input = $(el).find('input');
                }
                if (this.type == 'list') {
                    var sel = $(input).data('selected');
                    if ($.isPlainObject(sel) && !$.isEmptyObject(sel) && options.index == -1) {
                        options.items.forEach(function (item, ind) {
                            if (item.id === sel.id) {
                                options.index = ind;
                            }
                        });
                    }
                    input = $(this.helpers.focus).find('input');
                }
                if ($(input).is(':focus')) {
                    if (options.openOnFocus === false && $(input).val() === '' && obj.tmp.force_open !== true) {
                        $().w2overlay();
                        return;
                    }
                    if (obj.tmp.force_hide) {
                        $().w2overlay();
                        setTimeout(function () {
                            delete obj.tmp.force_hide;
                        }, 1);
                        return;
                    }
                    if ($(input).val() !== '') delete obj.tmp.force_open;
                    var msgNoItems = w2utils.lang('No matches');
                    if (options.url != null && $(input).val().length < options.minLength && obj.tmp.emptySet !== true) msgNoItems = options.minLength + ' ' + w2utils.lang('letters or more...');
                    if (options.url != null && $(input).val() === '' && obj.tmp.emptySet !== true) msgNoItems = w2utils.lang('Type to search...');
                    if (options.url == null && options.items.length === 0) msgNoItems = w2utils.lang('Empty list');
                    if (options.msgNoItems != null) msgNoItems = options.msgNoItems;
                    if (msgNoItems == 'function') msgNoItems = msgNoItems(options);
                    $(el).w2menu((!indexOnly ? 'refresh' : 'refresh-index'), $.extend(true, {}, options, {
                        search     : false,
                        render     : options.renderDrop,
                        maxHeight  : options.maxDropHeight,
                        maxWidth   : options.maxDropWidth,
                        msgNoItems : msgNoItems,
                        // selected with mouse
                        onSelect: function (event) {
                            if (obj.type == 'enum') {
                                var selected = $(obj.el).data('selected');
                                if (event.item) {
                                    // trigger event
                                    var edata = obj.trigger({ phase: 'before', type: 'add', target: obj.el, originalEvent: event.originalEvent, item: event.item });
                                    if (edata.isCancelled === true) return;
                                    // default behavior
                                    if (selected.length >= options.max && options.max > 0) selected.pop();
                                    delete event.item.hidden;
                                    selected.push(event.item);
                                    $(obj.el).data('selected', selected).change();
                                    $(obj.helpers.multi).find('input').val('').width(20);
                                    obj.refresh();
                                    if ($("#w2ui-overlay").length > 0) $('#w2ui-overlay')[0].hide();
                                    // event after
                                    obj.trigger($.extend(edata, { phase: 'after' }));
                                }
                            } else {
                                $(obj.el).data('selected', event.item).val(event.item.text).change();
                                if (obj.helpers.focus) obj.helpers.focus.find('input').val('');
                            }
                        }
                    }));
                }
            }
        },

        inRange: function (str, onlyDate) {
            var inRange = false;
            if (this.type == 'date') {
                var dt = w2utils.isDate(str, this.options.format, true);
                if (dt) {
                    // enable range
                    if (this.options.start || this.options.end) {
                        var st = (typeof this.options.start == 'string' ? this.options.start : $(this.options.start).val());
                        var en = (typeof this.options.end == 'string' ? this.options.end : $(this.options.end).val());
                        var start   = w2utils.isDate(st, this.options.format, true);
                        var end     = w2utils.isDate(en, this.options.format, true);
                        var current = new Date(dt);
                        if (!start) start = current;
                        if (!end) end = current;
                        if (current >= start && current <= end) inRange = true;
                    } else {
                        inRange = true;
                    }
                    // block predefined dates
                    if (this.options.blocked && $.inArray(str, this.options.blocked) != -1) inRange = false;

                    /*
                    clockWeekDay - type: array or integers. every element - number of week day.
                    number of weekday (1 - monday, 2 - tuesday, 3 - wensday, 4 - thursday, 5 - friday, 6 - saturday, 0 - sunday)
                    for block in calendar (for example, block all sundays so user can't choose sunday in calendar)
                    */
                    if (this.options.blockWeekDays != null && this.options.blockWeekDays != undefined
                        && this.options.blockWeekDays.length != undefined){
                        var l = this.options.blockWeekDays.length;
                        for (var i=0; i<l; i++){
                            if (dt.getDay() == this.options.blockWeekDays[i]){
                                inRange = false;
                            }
                        }
                    }
                }
            } else if (this.type == 'time') {
                if (this.options.start || this.options.end) {
                    var tm  = this.toMin(str);
                    var tm1 = this.toMin(this.options.start);
                    var tm2 = this.toMin(this.options.end);
                    if (!tm1) tm1 = tm;
                    if (!tm2) tm2 = tm;
                    if (tm >= tm1 && tm <= tm2) inRange = true;
                } else {
                    inRange = true;
                }
            } else if (this.type == 'datetime') {
                var dt = w2utils.isDateTime(str, this.options.format, true);
                if (dt) {
                    // enable range
                    if (this.options.start || this.options.end) {
                        var start, end;
                        if (typeof this.options.start == 'object' && this.options.start instanceof Date) {
                            start = this.options.start;
                        } else {
                            var st = (typeof this.options.start == 'string' ? this.options.start : $(this.options.start).val());
                            if (st.trim() !== '') {
                                start = w2utils.isDateTime(st, this.options.format, true);
                            } else {
                                start = '';
                            }
                        }
                        if (typeof this.options.end == 'object' && this.options.end instanceof Date) {
                            end = this.options.end;
                        } else {
                            var en = (typeof this.options.end == 'string' ? this.options.end : $(this.options.end).val());
                            if (en.trim() !== '') {
                                end = w2utils.isDateTime(en, this.options.format, true);
                            } else {
                                end = '';
                            }
                        }
                        var current = dt; // new Date(dt);
                        if (!start) start = current;
                        if (!end) end = current;
                        if (onlyDate && start instanceof Date) {
                            start.setHours(0);
                            start.setMinutes(0);
                            start.setSeconds(0);
                        }
                        if (current >= start && current <= end) inRange = true;
                    } else {
                        inRange = true;
                    }
                    // block predefined dates
                    if (inRange && this.options.blocked) {
                        for (var i=0; i<this.options.blocked.length; i++) {
                            var blocked = this.options.blocked[i];
                            if(typeof blocked == 'string') {
                                // convert string to Date object
                                blocked = w2utils.isDateTime(blocked, this.options.format, true);
                            }
                            // check for Date object with the same day
                            if(typeof blocked == 'object' && blocked instanceof Date && (blocked.getFullYear() == dt.getFullYear() && blocked.getMonth() == dt.getMonth() && blocked.getDate() == dt.getDate())) {
                                inRange = false;
                                break;
                            }
                        }
                    }
                }
            }
            return inRange;
        },

        /*
        *  INTERNAL FUNCTIONS
        */

        checkType: function (ch, loose) {
            var obj = this;
            switch (obj.type) {
                case 'int':
                    if (loose && ['-', obj.options.groupSymbol].indexOf(ch) != -1) return true;
                    return w2utils.isInt(ch.replace(obj.options.numberRE, ''));
                case 'percent':
                    ch = ch.replace(/%/g, '');
                case 'float':
                    if (loose && ['-', w2utils.settings.decimalSymbol, obj.options.groupSymbol].indexOf(ch) != -1) return true;
                    return w2utils.isFloat(ch.replace(obj.options.numberRE, ''));
                case 'money':
                case 'currency':
                    if (loose && ['-', obj.options.decimalSymbol, obj.options.groupSymbol, obj.options.currencyPrefix, obj.options.currencySuffix].indexOf(ch) != -1) return true;
                    return w2utils.isFloat(ch.replace(obj.options.moneyRE, ''));
                case 'bin':
                    return w2utils.isBin(ch);
                case 'hex':
                    return w2utils.isHex(ch);
                case 'alphanumeric':
                    return w2utils.isAlphaNumeric(ch);
            }
            return true;
        },

        addPrefix: function () {
            var obj = this;
            setTimeout(function () {
                if (obj.type === 'clear') return;
                var helper;
                var tmp = $(obj.el).data('tmp') || {};
                if (tmp['old-padding-left']) $(obj.el).css('padding-left', tmp['old-padding-left']);
                tmp['old-padding-left'] = $(obj.el).css('padding-left');
                $(obj.el).data('tmp', tmp);
                // remove if already displaed
                if (obj.helpers.prefix) $(obj.helpers.prefix).remove();
                if (obj.options.prefix !== '') {
                    // add fresh
                    $(obj.el).before(
                        '<div class="w2ui-field-helper">'+
                            obj.options.prefix +
                        '</div>'
                    );
                    helper = $(obj.el).prev();
                    helper
                        .css({
                            'color'          : $(obj.el).css('color'),
                            'font-family'    : $(obj.el).css('font-family'),
                            'font-size'      : $(obj.el).css('font-size'),
                            'padding-top'    : $(obj.el).css('padding-top'),
                            'padding-bottom' : $(obj.el).css('padding-bottom'),
                            'padding-left'   : $(obj.el).css('padding-left'),
                            'padding-right'  : 0,
                            'margin-top'     : (parseInt($(obj.el).css('margin-top'), 10) + 2) + 'px',
                            'margin-bottom'  : (parseInt($(obj.el).css('margin-bottom'), 10) + 1) + 'px',
                            'margin-left'    : $(obj.el).css('margin-left'),
                            'margin-right'   : 0
                        })
                        .on('click', function (event) {
                            if (obj.options.icon && typeof obj.onIconClick == 'function') {
                                // event before
                                var edata = obj.trigger({ phase: 'before', type: 'iconClick', target: obj.el, el: $(this).find('span.w2ui-icon')[0] });
                                if (edata.isCancelled === true) return;

                                // intentionally empty

                                // event after
                                obj.trigger($.extend(edata, { phase: 'after' }));
                            } else {
                                if (obj.type == 'list') {
                                    $(obj.helpers.focus).find('input').focus();
                                } else {
                                    $(obj.el).focus();
                                }
                            }
                        });
                    $(obj.el).css('padding-left', (helper.width() + parseInt($(obj.el).css('padding-left'), 10)) + 'px');
                    // remember helper
                    obj.helpers.prefix = helper;
                }
            }, 1);
        },

        addSuffix: function () {
            var obj = this;
            var helper, pr;
            setTimeout(function () {
                if (obj.type === 'clear') return;
                var tmp = $(obj.el).data('tmp') || {};
                if (tmp['old-padding-right']) $(obj.el).css('padding-right', tmp['old-padding-right']);
                tmp['old-padding-right'] = $(obj.el).css('padding-right');
                $(obj.el).data('tmp', tmp);
                pr = parseInt($(obj.el).css('padding-right'), 10);
                if (obj.options.arrows) {
                    // remove if already displayed
                    if (obj.helpers.arrows) $(obj.helpers.arrows).remove();
                    // add fresh
                    $(obj.el).after(
                        '<div class="w2ui-field-helper" style="border: 1px solid transparent">&#160;'+
                        '    <div class="w2ui-field-up" type="up">'+
                        '        <div class="arrow-up" type="up"></div>'+
                        '    </div>'+
                        '    <div class="w2ui-field-down" type="down">'+
                        '        <div class="arrow-down" type="down"></div>'+
                        '    </div>'+
                        '</div>');
                    var height = w2utils.getSize(obj.el, 'height');
                    helper = $(obj.el).next();
                    helper.css({
                            'color'         : $(obj.el).css('color'),
                            'font-family'   : $(obj.el).css('font-family'),
                            'font-size'     : $(obj.el).css('font-size'),
                            'height'        : ($(obj.el).height() + parseInt($(obj.el).css('padding-top'), 10) + parseInt($(obj.el).css('padding-bottom'), 10) ) + 'px',
                            'padding'       : 0,
                            'margin-top'    : (parseInt($(obj.el).css('margin-top'), 10) + 1) + 'px',
                            'margin-bottom' : 0,
                            'border-left'   : '1px solid silver'
                        })
                        .css('margin-left', '-'+ (helper.width() + parseInt($(obj.el).css('margin-right'), 10) + 12) + 'px')
                        .on('mousedown', function (event) {
                            var body = $('body');
                            body.on('mouseup', tmp);
                            body.data('_field_update_timer', setTimeout(update, 700));
                            update(false);
                            // timer function
                            function tmp() {
                                clearTimeout(body.data('_field_update_timer'));
                                body.off('mouseup', tmp);
                            }
                            // update function
                            function update(notimer) {
                                $(obj.el).focus();
                                obj.keyDown($.Event("keydown"), {
                                    keyCode : ($(event.target).attr('type') == 'up' ? 38 : 40)
                                });
                                if (notimer !== false) $('body').data('_field_update_timer', setTimeout(update, 60));
                            }
                        });
                    pr += helper.width() + 12;
                    $(obj.el).css('padding-right', pr + 'px');
                    // remember helper
                    obj.helpers.arrows = helper;
                }
                if (obj.options.suffix !== '') {
                    // remove if already displayed
                    if (obj.helpers.suffix) $(obj.helpers.suffix).remove();
                    // add fresh
                    $(obj.el).after(
                        '<div class="w2ui-field-helper">'+
                            obj.options.suffix +
                        '</div>');
                    helper = $(obj.el).next();
                    helper
                        .css({
                            'color'          : $(obj.el).css('color'),
                            'font-family'    : $(obj.el).css('font-family'),
                            'font-size'      : $(obj.el).css('font-size'),
                            'padding-top'    : $(obj.el).css('padding-top'),
                            'padding-bottom' : $(obj.el).css('padding-bottom'),
                            'padding-left'   : '3px',
                            'padding-right'  : $(obj.el).css('padding-right'),
                            'margin-top'     : (parseInt($(obj.el).css('margin-top'), 10) + 2) + 'px',
                            'margin-bottom'  : (parseInt($(obj.el).css('margin-bottom'), 10) + 1) + 'px'
                        })
                        .on('click', function (event) {
                            if (obj.type == 'list') {
                                $(obj.helpers.focus).find('input').focus();
                            } else {
                                $(obj.el).focus();
                            }
                        });

                    helper.css('margin-left', '-'+ (w2utils.getSize(helper, 'width') + parseInt($(obj.el).css('margin-right'), 10) + 2) + 'px');
                    pr += helper.width() + 3;
                    $(obj.el).css('padding-right', pr + 'px');
                    // remember helper
                    obj.helpers.suffix = helper;
                }
            }, 1);
        },

        addFocus: function () {
            var obj      = this;
            var options  = this.options;
            var width    = 0; // 11 - show search icon, 0 do not show
            var pholder;
            // clean up & init
            $(obj.helpers.focus).remove();
            // remember original tabindex
            var tabIndex = $(obj.el).attr('tabIndex');
            if (tabIndex && tabIndex != -1) obj.el._tabIndex = tabIndex;
            if (obj.el._tabIndex) tabIndex = obj.el._tabIndex;
            if (tabIndex == null) tabIndex = -1;
            // build helper
            var html =
                '<div class="w2ui-field-helper">'+
                '    <div class="w2ui-icon icon-search" style="opacity: 0; display: none"></div>'+
                '    <input type="text" autocomplete="off" tabIndex="'+ tabIndex +'"/>'+
                '</div>';
            $(obj.el).attr('tabindex', -1).before(html);
            var helper = $(obj.el).prev();
            obj.helpers.focus = helper;
            helper.css({
                    width           : $(obj.el).width(),
                    "margin-top"    : $(obj.el).css('margin-top'),
                    "margin-left"   : (parseInt($(obj.el).css('margin-left')) + parseInt($(obj.el).css('padding-left'))) + 'px',
                    "margin-bottom" : $(obj.el).css('margin-bottom'),
                    "margin-right"  : $(obj.el).css('margin-right')
                })
                .find('input')
                .css({
                    cursor   : 'default',
                    width    : '100%',
                    outline  : 'none',
                    opacity  : 1,
                    margin   : 0,
                    border   : '1px solid transparent',
                    padding  : $(obj.el).css('padding-top'),
                    "padding-left"     : 0,
                    "margin-left"      : (width > 0 ? width + 6 : 0),
                    "background-color" : 'transparent'
                });
            // INPUT events
            helper.find('input')
                .on('click', function (event) {
                    if ($('#w2ui-overlay').length === 0) obj.focus(event);
                    event.stopPropagation();
                })
                .on('focus', function (event) {
                    pholder = $(obj.el).attr('placeholder');
                    $(obj.el).css({ 'outline': 'auto 5px #7DB4F3', 'outline-offset': '-2px' });
                    $(this).val('');
                    $(obj.el).triggerHandler('focus');
                    if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;
                })
                .on('blur', function (event) {
                    $(obj.el).css('outline', 'none');
                    $(this).val('');
                    obj.refresh();
                    $(obj.el).triggerHandler('blur');
                    if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;
                    if (pholder != null) $(obj.el).attr('placeholder', pholder);
                })
                .on('keydown', function (event) {
                    var el = this;
                    obj.keyDown(event);
                    setTimeout(function () {
                        if (el.value === '') $(obj.el).attr('placeholder', pholder); else $(obj.el).attr('placeholder', '');
                    }, 10);
                })
                .on('keyup', function (event) { obj.keyUp(event); })
                .on('keypress', function (event) { obj.keyPress(event); });
            // MAIN div
            helper.on('click', function (event) { $(this).find('input').focus(); });
            obj.refresh();
        },

        addMulti: function () {
            var obj     = this;
            var options = this.options;
            // clean up & init
            $(obj.helpers.multi).remove();
            // build helper
            var html   = '';
            var margin =
                'margin-top     : 0px; ' +
                'margin-bottom  : 0px; ' +
                'margin-left    : ' + $(obj.el).css('margin-left') + '; ' +
                'margin-right   : ' + $(obj.el).css('margin-right') + '; '+
                'width          : ' + (w2utils.getSize(obj.el, 'width')
                                    - parseInt($(obj.el).css('margin-left'), 10)
                                    - parseInt($(obj.el).css('margin-right'), 10))
                                    + 'px;';
            if (obj.type == 'enum') {
                // remember original tabindex
                var tabIndex = $(obj.el).attr('tabIndex');
                if (tabIndex && tabIndex != -1) obj.el._tabIndex = tabIndex;
                if (obj.el._tabIndex) tabIndex = obj.el._tabIndex;
                if (tabIndex == null) tabIndex = -1;

                html =  '<div class="w2ui-field-helper w2ui-list" style="'+ margin + '; box-sizing: border-box">'+
                        '    <div style="padding: 0px; margin: 0px; display: inline-block" class="w2ui-multi-items">'+
                        '    <ul>'+
                        '        <li style="padding-left: 0px; padding-right: 0px" class="nomouse">'+
                        '            <input type="text" style="width: 20px; margin: -3px 0 0; padding: 2px 0; border-color: white" autocomplete="off"' + ($(obj.el).prop('readonly') ? ' readonly="readonly"': '') + ($(obj.el).prop('disabled') ? ' disabled="disabled"': '') + ' tabindex="'+ tabIndex +'"/>'+
                        '        </li>'+
                        '    </ul>'+
                        '    </div>'+
                        '</div>';
            }
            if (obj.type == 'file') {
                html =  '<div class="w2ui-field-helper w2ui-list" style="'+ margin + '; box-sizing: border-box">'+
                        '   <div style="position: absolute; left: 0px; right: 0px; top: 0px; bottom: 0px;">'+
                        '       <input class="file-input" type="file" style="width: 100%; height: 100%; opacity: 0;" name="attachment" multiple tabindex="-1"' + ($(obj.el).prop('readonly') ? ' readonly="readonly"': '') + ($(obj.el).prop('disabled') ? ' disabled="disabled"': '') + ($(obj.el).attr('accept') ? ' accept="'+ $(obj.el).attr('accept') +'"': '') + '/>'+
                        '   </div>'+
                        '    <div style="position: absolute; padding: 0px; margin: 0px; display: inline-block" class="w2ui-multi-items">'+
                        '        <ul><li style="padding-left: 0px; padding-right: 0px" class="nomouse"></li></ul>'+
                        '    </div>'+
                        '</div>';
            }
            // old bg and border
            var tmp = $(obj.el).data('tmp') || {};
            tmp['old-background-color'] = $(obj.el).css('background-color');
            tmp['old-border-color']     = $(obj.el).css('border-color');
            $(obj.el).data('tmp', tmp);

            $(obj.el)
                .before(html)
                .css({
                    'background-color' : 'transparent',
                    'border-color'     : 'transparent'
                });

            var div    = $(obj.el).prev();
            obj.helpers.multi = div;
            if (obj.type == 'enum') {
                $(obj.el).attr('tabindex', -1);
                // INPUT events
                div.find('input')
                    .on('click', function (event) {
                        if ($('#w2ui-overlay').length === 0) obj.focus(event);
                        $(obj.el).triggerHandler('click');
                    })
                    .on('focus', function (event) {
                        $(div).css({ 'outline': 'auto 5px #7DB4F3', 'outline-offset': '-2px' });
                        $(obj.el).triggerHandler('focus');
                        if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;
                    })
                    .on('blur', function (event) {
                        $(div).css('outline', 'none');
                        $(obj.el).triggerHandler('blur');
                        if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;
                    })
                    .on('keyup',    function (event) { obj.keyUp(event); })
                    .on('keydown',  function (event) { obj.keyDown(event); })
                    .on('keypress', function (event) { obj.keyPress(event); });
                // MAIN div
                div.on('click', function (event) { $(this).find('input').focus(); });
            }
            if (obj.type == 'file') {
                $(obj.el).css('outline', 'none');
                div.on('click', function (event) {
                        $(obj.el).focus();
                        if ($(obj.el).prop('readonly') || $(obj.el).prop('disabled')) return;
                        obj.blur(event);
                        obj.resize();
                        setTimeout(function () { div.find('input').click(); }, 10); // needed this when clicked on items div
                    })
                    .on('dragenter', function (event) {
                        if ($(obj.el).prop('readonly') || $(obj.el).prop('disabled')) return;
                        $(div).addClass('w2ui-file-dragover');
                    })
                    .on('dragleave', function (event) {
                        if ($(obj.el).prop('readonly') || $(obj.el).prop('disabled')) return;
                        var tmp = $(event.target).parents('.w2ui-field-helper');
                        if (tmp.length === 0) $(div).removeClass('w2ui-file-dragover');
                    })
                    .on('drop', function (event) {
                        if ($(obj.el).prop('readonly') || $(obj.el).prop('disabled')) return;
                        $(div).removeClass('w2ui-file-dragover');
                        var files = event.originalEvent.dataTransfer.files;
                        for (var i = 0, l = files.length; i < l; i++) obj.addFile.call(obj, files[i]);
                        // cancel to stop browser behaviour
                        event.preventDefault();
                        event.stopPropagation();
                    })
                    .on('dragover', function (event) {
                        // cancel to stop browser behaviour
                        event.preventDefault();
                        event.stopPropagation();
                    });
                div.find('input')
                    .on('click', function (event) {
                        event.stopPropagation();
                    })
                    .on('change', function () {
                        if (typeof this.files !== "undefined") {
                            for (var i = 0, l = this.files.length; i < l; i++) {
                                obj.addFile.call(obj, this.files[i]);
                            }
                        }
                    });
            }
            obj.refresh();
        },

        addFile: function (file) {
            var obj      = this;
            var options  = this.options;
            var selected = $(obj.el).data('selected');
            var newItem  = {
                name     : file.name,
                type     : file.type,
                modified : file.lastModifiedDate,
                size     : file.size,
                content  : null,
                file     : file
            };
            var size = 0;
            var cnt  = 0;
            var err;
            if (selected) {
                for (var s = 0; s < selected.length; s++) {
                   // check for dups
                   if (selected[s].name == file.name && selected[s].size == file.size) return;
                   size += selected[s].size;
                   cnt++;
               }
            }
            // trigger event
            var edata = obj.trigger({ phase: 'before', type: 'add', target: obj.el, file: newItem, total: cnt, totalSize: size });
            if (edata.isCancelled === true) return;
            // check params
            if (options.maxFileSize !== 0 && newItem.size > options.maxFileSize) {
                err = 'Maximum file size is '+ w2utils.formatSize(options.maxFileSize);
                if (options.silent === false) $(obj.el).w2tag(err);
                console.log('ERROR: '+ err);
                return;
            }
            if (options.maxSize !== 0 && size + newItem.size > options.maxSize) {
                err = w2utils.lang('Maximum total size is') + ' ' + w2utils.formatSize(options.maxSize);
                if (options.silent === false) {
                    $(obj.el).w2tag(err);
                } else {
                    console.log('ERROR: '+ err);
                }
                return;
            }
            if (options.max !== 0 && cnt >= options.max) {
                err = w2utils.lang('Maximum number of files is') + ' '+ options.max;
                if (options.silent === false) {
                    $(obj.el).w2tag(err);
                } else {
                    console.log('ERROR: '+ err);
                }
                return;
            }
            selected.push(newItem);
            // read file as base64
            if (typeof FileReader !== "undefined" && options.readContent === true) {
                var reader = new FileReader();
                // need a closure
                reader.onload = (function () {
                    return function (event) {
                        var fl  = event.target.result;
                        var ind = fl.indexOf(',');
                        newItem.content = fl.substr(ind+1);
                        obj.refresh();
                        $(obj.el).trigger('change');
                        // event after
                        obj.trigger($.extend(edata, { phase: 'after' }));
                    };
                })();
                reader.readAsDataURL(file);
            } else {
                obj.refresh();
                $(obj.el).trigger('change');
                obj.trigger($.extend(edata, { phase: 'after' }));
            }
        },

        normMenu: function (menu) {
            if ($.isArray(menu)) {
                for (var m = 0; m < menu.length; m++) {
                    if (typeof menu[m] == 'string') {
                        menu[m] = { id: menu[m], text: menu[m] };
                    } else {
                        if (menu[m].text != null && menu[m].id == null) menu[m].id = menu[m].text;
                        if (menu[m].text == null && menu[m].id != null) menu[m].text = menu[m].id;
                        if (menu[m].caption != null) menu[m].text = menu[m].caption;
                    }
                }
                return menu;
            } else if (typeof menu == 'function') {
                return this.normMenu(menu());
            } else if (typeof menu == 'object') {
                var tmp = [];
                for (var m in menu) tmp.push({ id: m, text: menu[m] });
                return tmp;
            }
        },

        getMonthHTML: function (month, year, selected) {
            var td          = new Date();
            var months      = w2utils.settings.fullmonths;
            var daysCount   = ['31', '28', '31', '30', '31', '30', '31', '31', '30', '31', '30', '31'];
            var today       = td.getFullYear() + '/' + (Number(td.getMonth()) + 1) + '/' + td.getDate();
            var days        = w2utils.settings.fulldays.slice();    // creates copy of the array
            var sdays       = w2utils.settings.shortdays.slice();   // creates copy of the array
            if (w2utils.settings.weekStarts != 'M') {
                days.unshift(days.pop());
                sdays.unshift(sdays.pop());
            }
            var options = this.options;
            if (options == null) options = {};
            // normalize date
            year  = w2utils.isInt(year)  ? parseInt(year)  : td.getFullYear();
            month = w2utils.isInt(month) ? parseInt(month) : td.getMonth() + 1;
            if (month > 12) { month -= 12; year++; }
            if (month < 1 || month === 0)  { month += 12; year--; }
            if (year/4 == Math.floor(year/4)) { daysCount[1] = '29'; } else { daysCount[1] = '28'; }
            options.current = month + '/' + year;

            // start with the required date
            td = new Date(year, month-1, 1);
            var weekDay = td.getDay();
            var dayTitle = '';
            for (var i = 0; i < sdays.length; i++) dayTitle += '<td title="'+ days[i] +'">' + sdays[i] + '</td>';

            var html  =
                '<div class="w2ui-calendar-title title">'+
                '    <div class="w2ui-calendar-previous previous"> <div></div> </div>'+
                '    <div class="w2ui-calendar-next next"> <div></div> </div> '+
                        months[month-1] +', '+ year +
                '</div>'+
                '<table class="w2ui-calendar-days" cellspacing="0"><tbody>'+
                '    <tr class="w2ui-day-title">' + dayTitle + '</tr>'+
                '    <tr>';

            var day = 1;
            if (w2utils.settings.weekStarts != 'M') weekDay++;
            if(this.type === 'datetime') {
                var dt_sel = w2utils.isDateTime(selected, options.format, true);
                selected = w2utils.formatDate(dt_sel, w2utils.settings.dateFormat);
            }
            for (var ci = 1; ci < 43; ci++) {
                if (weekDay === 0 && ci == 1) {
                    for (var ti = 0; ti < 6; ti++) html += '<td class="w2ui-day-empty">&#160;</td>';
                    ci += 6;
                } else {
                    if (ci < weekDay || day > daysCount[month-1]) {
                        html += '<td class="w2ui-day-empty">&#160;</td>';
                        if ((ci) % 7 === 0) html += '</tr><tr>';
                        continue;
                    }
                }
                var dt  = year + '/' + month + '/' + day;
                var DT  = new Date(dt);
                var className = '';
                if (DT.getDay() === 6) className  = ' w2ui-saturday';
                if (DT.getDay() === 0) className  = ' w2ui-sunday';
                if (dt == today) className += ' w2ui-today';

                var dspDay  = day;
                var col     = '';
                var bgcol   = '';
                var tmp_dt, tmp_dt_fmt;
                if(this.type === 'datetime') {
                    // var fm = options.format.split('|')[0].trim();
                    // tmp_dt      = w2utils.formatDate(dt, fm);
                    tmp_dt      = w2utils.formatDateTime(dt, options.format);
                    tmp_dt_fmt  = w2utils.formatDate(dt, w2utils.settings.dateFormat);
                } else {
                    tmp_dt      = w2utils.formatDate(dt, options.format);
                    tmp_dt_fmt  = tmp_dt;
                }
                if (options.colored && options.colored[tmp_dt_fmt] !== undefined) { // if there is predefined colors for dates
                    var tmp = options.colored[tmp_dt_fmt].split(':');
                    bgcol   = 'background-color: ' + tmp[0] + ';';
                    col     = 'color: ' + tmp[1] + ';';
                }
                html += '<td class="'+ (this.inRange(tmp_dt, true) ? 'w2ui-date ' + (tmp_dt_fmt == selected ? 'w2ui-date-selected' : '') : 'w2ui-blocked') + className + '" '+
                        '   style="'+ col + bgcol + '" date="'+ tmp_dt +'" data-date="'+ DT +'">'+
                            dspDay +
                        '</td>';
                if (ci % 7 === 0 || (weekDay === 0 && ci == 1)) html += '</tr><tr>';
                day++;
            }
            html += '</tr></tbody></table>';
            return html;
        },

        getYearHTML: function () {
            var months = w2utils.settings.shortmonths;
            var start_year = w2utils.settings.dateStartYear;
            var end_year = w2utils.settings.dateEndYear;
            var mhtml  = '';
            var yhtml  = '';
            for (var m = 0; m < months.length; m++) {
                mhtml += '<div class="w2ui-jump-month" name="'+ m +'">'+ months[m] + '</div>';
            }
            for (var y = start_year; y <= end_year; y++) {
                yhtml += '<div class="w2ui-jump-year" name="'+ y +'">'+ y + '</div>';
            }
            return '<div id="w2ui-jump-month">'+ mhtml +'</div><div id="w2ui-jump-year">'+ yhtml +'</div>';
        },

        getHourHTML: function () {
            var tmp = [];
            var options = this.options;
            if (options == null) options = { format: w2utils.settings.timeFormat };
            var h24 = (options.format.indexOf('h24') > -1);
            for (var a = 0; a < 24; a++) {
                var time = (a >= 12 && !h24 ? a - 12 : a) + ':00' + (!h24 ? (a < 12 ? ' am' : ' pm') : '');
                if (a == 12 && !h24) time = '12:00 pm';
                if (!tmp[Math.floor(a/8)]) tmp[Math.floor(a/8)] = '';
                var tm1 = this.fromMin(this.toMin(time));
                var tm2 = this.fromMin(this.toMin(time) + 59);
                if (this.type === 'datetime') {
                    var dt = w2utils.isDateTime(this.el.value, options.format, true);
                    var fm = options.format.split('|')[0].trim();
                    tm1 = w2utils.formatDate(dt, fm) + ' ' + tm1;
                    tm2 = w2utils.formatDate(dt, fm) + ' ' + tm2;
                }
                tmp[Math.floor(a/8)] += '<div class="'+ (this.inRange(tm1) || this.inRange(tm2) ? 'w2ui-time ' : 'w2ui-blocked') + '" hour="'+ a +'">'+ time +'</div>';
            }
            var html =
                '<div class="w2ui-calendar">'+
                '   <div class="w2ui-calendar-title">'+ w2utils.lang('Select Hour') +'</div>'+
                '   <div class="w2ui-calendar-time"><table><tbody><tr>'+
                '       <td>'+ tmp[0] +'</td>' +
                '       <td>'+ tmp[1] +'</td>' +
                '       <td>'+ tmp[2] +'</td>' +
                '   </tr></tbody></table></div>'+
                '</div>';
            return html;
        },

        getMinHTML: function (hour) {
            if (hour == null) hour = 0;
            var options = this.options;
            if (options == null) options = { format: w2utils.settings.timeFormat };
            var h24 = (options.format.indexOf('h24') > -1);
            var tmp = [];
            for (var a = 0; a < 60; a += 5) {
                var time = (hour > 12 && !h24 ? hour - 12 : hour) + ':' + (a < 10 ? 0 : '') + a + ' ' + (!h24 ? (hour < 12 ? 'am' : 'pm') : '');
                var tm   = time;
                var ind  = a < 20 ? 0 : (a < 40 ? 1 : 2);
                if (!tmp[ind]) tmp[ind] = '';
                if (this.type === 'datetime') {
                    var dt = w2utils.isDateTime(this.el.value, options.format, true);
                    var fm = options.format.split('|')[0].trim();
                    tm = w2utils.formatDate(dt, fm) + ' ' + tm;
                }
                tmp[ind] += '<div class="'+ (this.inRange(tm) ? 'w2ui-time ' : 'w2ui-blocked') + '" min="'+ a +'">'+ time +'</div>';
            }
            var html =
                '<div class="w2ui-calendar">'+
                '   <div class="w2ui-calendar-title">'+ w2utils.lang('Select Minute') +'</div>'+
                '   <div class="w2ui-calendar-time"><table><tbody><tr>'+
                '       <td>'+ tmp[0] +'</td>' +
                '       <td>'+ tmp[1] +'</td>' +
                '       <td>'+ tmp[2] +'</td>' +
                '   </tr></tbody></table></div>'+
                '</div>';
            return html;
        },

        toMin: function (str) {
            if (typeof str != 'string') return null;
            var tmp = str.split(':');
            if (tmp.length === 2) {
                tmp[0] = parseInt(tmp[0]);
                tmp[1] = parseInt(tmp[1]);
                if (str.indexOf('pm') != -1 && tmp[0] != 12) tmp[0] += 12;
            } else {
                return null;
            }
            return tmp[0] * 60 + tmp[1];
        },

        fromMin: function (time) {
            var ret = '';
            if (time >= 24 * 60) time = time % (24 * 60);
            if (time < 0) time = 24 * 60 + time;
            var hour = Math.floor(time/60);
            var min  = ((time % 60) < 10 ? '0' : '') + (time % 60);
            var options = this.options;
            if (options == null) options = { format: w2utils.settings.timeFormat };
            if (options.format.indexOf('h24') != -1) {
                ret = hour + ':' + min;
            } else {
                ret = (hour <= 12 ? hour : hour - 12) + ':' + min + ' ' + (hour >= 12 ? 'pm' : 'am');
            }
            return ret;
        }
    };

    $.extend(w2field.prototype, w2utils.event);
    w2obj.field = w2field;

}) (jQuery);
