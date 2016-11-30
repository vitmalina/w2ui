/************************************************************************
*   Library: Web 2.0 UI for jQuery (using prototypical inheritance)
*   - Following objects defined
*        - w2chart       - chart widget
*        - $().w2chart   - jQuery wrapper
*   - Dependencies: jQuery, d3, w2utils 
*
************************************************************************/

(function ($) {
    var w2chart = function(options) {

        // public properties
        this.name         = null;
        this.box          = null;     // HTML element that hold this element
        this.header       = '';
        this.margin       = {top: 30, right: 40, bottom: 30, left: 50};
        this.xAxis        = {visible: true, field: '', caption: '', type: ''/* 'number', 'date', 'time' */, minAuto: true, maxAuto: true, min: null, max: null},
        this.yLeftAxis    = {visible: true, caption: '', type: ''/* 'number', 'date', 'time' */, minAuto: true, maxAuto: true, min: null, max: null},
        this.yRightAxis   = {visible: false, caption: '', type: ''/* 'number', 'date', 'time' */, minAuto: true, maxAuto: true, min: null, max: null},

        this.series       = [];       // { id, type: 'line', field: 'value', caption: 'string', yAxis: 'yLeftAxis' or 'yRightAxis', style: {color: 'black', width: '1px'} }
        this.records      = [];       // { recid: int(requied), field1: 'value1', ... fieldN: 'valueN', style: 'string',  changes: object }

        this.show = {
            header          : false,
            legend          : false,
            footer          : false
        };

        this.hasFocus        = false;

        this.style           = '';

        // internal
        this.last = {
            width           : null,
            height          : null,
            svg             : null,     // d3 svg object
            g               : null,     // group in svg for generate graph
            g1              : null,     // group in svg for generate top level elements
            gxAxis          : null,
            xScale          : null,
            yScaleLeft      : null,
            yScaleRight     : null,
            yLeftAxisEnable : false,
            yRightAxisEnable: false
        };

        $.extend(true, this, w2obj.chart, options);
    };

    // ====================================================
    // -- Registers as a jQuery plugin

    $.fn.w2chart = function(method) {
        if ($.isPlainObject(method)) {
            // check name parameter
            if (!w2utils.checkName(method, 'w2chart')) return;
            // extend series
            var series   = method.series || [];
            var object = new w2chart(method);
            for (var i = 0; i < series.length; i++) {
                object.series[i] = $.extend({}, w2chart.prototype.ser, series[i]);
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

    w2chart.prototype = {
        onRender  : null,
        onRefresh : null,
        onResize  : null,
        onDestroy : null,

        ser : {
            id          : null,
            type        : 'line',
            field       : '',
            filterField : null,
            filterValue : null,
            caption     : '',
            yAxis       : 'yLeftAxis',     
            style       : {color: 'black', width: '1px'}
        },

        add: function (ser) {
            return this.insert(null, ser);
        },

        insert: function (id, ser) {
            if (!$.isArray(ser)) ser = [ser];
            // assume it is array
            for (var i = 0; i < ser.length; i++) {
                // checks
                if (ser[i].id == null) {
                    console.log('ERROR: The parameter "id" is required but not supplied. (obj: '+ this.name +')');
                    return;
                }
                if (!w2utils.checkUniqueId(ser[i].id, this.series, 'series', this.name)) return;
                // add ser
                var newSer = $.extend({}, w2chart.prototype.ser, ser[i]);
                if (id == null) {
                    this.series.push(newSer);
                } else {
                    var middle = this.get(id, true);
                    this.series = this.series.slice(0, middle).concat([newSer], this.series.slice(middle));
                }
                this.refresh(ser[i].id);
                this.resize();
            }
        },

        remove: function () {
            var removed = 0;
            for (var a = 0; a < arguments.length; a++) {
                var ser = this.get(arguments[a]);
                if (!ser) return false;
                removed++;
                // remove from array
                this.series.splice(this.get(ser.id, true), 1);
                // TODO: need for chart? remove from screen
                // $(this.box).find('#series_'+ this.name +'_ser_'+ w2utils.escapeId(ser.id)).remove();
            }
            this.resize();
            return removed;
        },

        set: function (id, ser) {
            var index = this.get(id, true);
            if (index == null) return false;
            $.extend(this.series[index], ser);
            this.refresh(id);
            return true;
        },

        get: function (id, returnIndex) {
            if (arguments.length === 0) {
                var all = [];
                for (var i1 = 0; i1 < this.series.length; i1++) {
                    if (this.series[i1].id != null) {
                        all.push(this.series[i1].id);
                    }
                }
                return all;
            } else {
                for (var i2 = 0; i2 < this.series.length; i2++) {
                    if (this.series[i2].id == id) { // need to be == since id can be numeric
                        return (returnIndex === true ? i2 : this.series[i2]);
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
                var ser = this.get(arguments[a]);
                if (!ser || ser.hidden === false) continue;
                shown++;
                ser.hidden = false;
                tmp.push(ser.id);
            }
            setTimeout(function () { for (var t=0; t<tmp.length; t++) obj.refresh(tmp[t]); obj.resize(); }, 15); // needs timeout
            return shown;
        },

        hide: function () {
            var obj   = this;
            var hidden= 0;
            var tmp   = [];
            for (var a = 0; a < arguments.length; a++) {
                var ser = this.get(arguments[a]);
                if (!ser || ser.hidden === true) continue;
                hidden++;
                ser.hidden = true;
                tmp.push(ser.id);
            }
            setTimeout(function () { for (var t=0; t<tmp.length; t++) obj.refresh(tmp[t]); obj.resize(); }, 15); // needs timeout
            return hidden;
        },

        tooltipShow: function (id, event, forceRefresh) {
            if (this.tooltip == null) return;
            var $el  = $(this.box).find('#series_'+ this.name + '_ser_'+ w2utils.escapeId(id));
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
            var $el  = $(this.box).find('#series_'+ this.name + '_ser_'+ w2utils.escapeId(id));
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
            var obj = this;
            var time = (new Date()).getTime();
            // event before
            var edata = obj.trigger({ phase: 'before', type: 'refresh', target: (id != null ? id : obj.name), object: obj.get(id) });
            if (edata.isCancelled === true) return;
            if (id == null) {
                // -- header
                if (obj.show.header) {
                    $('#chart_'+ obj.name +'_header').html(obj.header +'&#160;').show();
                } else {
                    $('#chart_'+ obj.name +'_header').hide();
                }
                // -- body
                obj.refreshBody();
                // -- footer
                if (obj.show.footer) {
                    $('#grid_'+ obj.name +'_footer').html(obj.getFooterHTML()).show();
                } else {
                    $('#grid_'+ obj.name +'_footer').hide();
                }
                // refresh all
                for (var i = 0; i < obj.series.length; i++) obj.refresh(obj.series[i].id);
                if (obj.show.legend) obj.showLegend();
            } else {
                var ser = this.get(id);
                var parseDate = d3.timeParse(obj.xAxis.dateFormat);
                var data = (!ser.filterField) ? obj.records : obj.records.filter(function(d) { return d[ser.filterField] == ser.filterValue;});
                switch (ser.type) {
                    case 'line': 
                        var line = d3.line()
                            .x(function(d) { return (obj.xAxis.type === 'date') ? obj.last.xScale(parseDate(d[obj.xAxis.field])) : obj.last.xScale(d[obj.xAxis.field]); })
                            .y(function(d) { return (ser.yAxis === 'yLeftAxis') ? obj.last.yScaleLeft(d[ser.field]) : obj.last.yScaleRight(d[ser.field]); });
                        obj.last.g1.append("path").datum(data)
                            .attr("d", line).style("fill", "none")
                            .style("stroke", ser.style.color)
                            .style("stroke-width", ser.style.width);
                        break;
                    case 'area': 
                        var area = d3.area()
                            .x(function(d) { return (obj.xAxis.type === 'date') ? obj.last.xScale(parseDate(d[obj.xAxis.field])) : obj.last.xScale(d[obj.xAxis.field]); })
                            .y0(obj.last.height)
                            .y1(function(d) { return (ser.yAxis === 'yLeftAxis') ? obj.last.yScaleLeft(d[ser.field]) : obj.last.yScaleRight(d[ser.field]); });
                        obj.last.g.append("path").datum(data)
                            .attr("d", area).style("fill", ser.style.color)
                            .style("stroke", "none");
                        break;
                    case 'dot':
                        obj.last.g1.selectAll(".dot").data(data).enter().append("circle")
                            .attr("cx", function(d) { return (obj.xAxis.type === 'date') ? obj.last.xScale(parseDate(d[obj.xAxis.field])) : obj.last.xScale(d[obj.xAxis.field]); })
                            .attr("cy", function(d) { return (ser.yAxis === 'yLeftAxis') ? obj.last.yScaleLeft(d[ser.field]) : obj.last.yScaleRight(d[ser.field]); })
                            .attr("r", ser.style.width)
                            .style("fill", ser.style.color)
                            .style("stroke", 'black');
                        break;
                };
            };
            // event after
            this.trigger($.extend(edata, { phase: 'after' }));
            return (new Date()).getTime() - time;
        },

        showLegend: function () {
            var obj = this;
            var legend = obj.last.svg.append("g").attr("height", 40).attr("width", 200)
                .attr("transform","translate(20,20)");   
            legend.selectAll('rect').data(obj.series.filter(function(d) { return d.caption.length>0;})).enter()
                  .append("rect").attr("y", 0 - (obj.margin.top / 2)).attr("x", function(d, i){ return i *  90;})
                  .attr("width", 10).attr("height", 10)
                  .style("fill", function(d) {return d.style.color; });
            legend.selectAll('text').data(obj.series.filter(function(d) { return d.caption.length>0;})).enter()
                  .append("text").attr("y", 0 - (obj.margin.top / 2)+10).attr("x", function(d, i){ return i *  90 + 11;})
                  .text(function(d) { return d.caption; });
        },

        refreshBody: function () {
            var obj  = this;
            var body = $('#chart_'+ this.name +'_body');
            // -- body
            body.html('');
            obj.last.width = body.width() - obj.margin.left - obj.margin.right,
            obj.last.height = body.height() - obj.margin.top - obj.margin.bottom;
            // set the scale for the transfer of real values
            obj.last.xScale = (obj.xAxis.type === 'date') ? d3.scaleTime().range([0, obj.last.width]) : d3.scaleLinear().range([0, obj.last.width]);
            obj.last.yScaleLeft = d3.scaleLinear().range([obj.last.height, 0]);
            obj.last.yScaleRight = d3.scaleLinear().range([obj.last.height, 0]);

            // definition of data range for conversion coord at scales
            var parseDate = d3.timeParse(obj.xAxis.dateFormat);
            if (obj.xAxis.minAuto || !obj.xAxis.min) {
                obj.xAxis.min = d3.min(obj.records, function(d) { return (obj.xAxis.type === 'date') ? parseDate(d[obj.xAxis.field]) : d[obj.xAxis.field]; });
            };
            if (obj.xAxis.maxAuto || !obj.xAxis.max) {
                obj.xAxis.max = d3.max(obj.records, function(d) { return (obj.xAxis.type === 'date') ? parseDate(d[obj.xAxis.field]) : d[obj.xAxis.field]; });
            };
            var tmpVal;
            for (var i = 0; i < obj.series.length; i++) {
                if (obj.series[i].yAxis === 'yLeftAxis') {
                    obj.last.yLeftAxisEnable = true;
                    if (obj.yLeftAxis.minAuto || !obj.yLeftAxis.min) {
                        tmpVal = d3.min(obj.records, function(d) { return d[obj.series[i].field]; });
                        if (!obj.yLeftAxis.min || tmpVal < obj.yLeftAxis.min) { obj.yLeftAxis.min = tmpVal; };
                    };
                    if (obj.yLeftAxis.maxAuto || !obj.yLeftAxis.max) {
                        tmpVal = d3.max(obj.records, function(d) { return d[obj.series[i].field]; });
                        if (tmpVal > obj.yLeftAxis.max) { obj.yLeftAxis.max = tmpVal; };
                    };
                };
                if (obj.series[i].yAxis === 'yRightAxis') {
                    obj.last.yRightAxisEnable = true;
                    if (obj.yRightAxis.minAuto || !obj.yRightAxis.min) {
                        tmpVal = d3.min(obj.records, function(d) { return d[obj.series[i].field]; });
                        if (!obj.yRightAxis.min || tmpVal < obj.yRightAxis.min) { obj.yRightAxis.min = tmpVal; };
                    };
                    if (obj.yRightAxis.maxAuto || !obj.yRightAxis.max) {
                        tmpVal = d3.max(obj.records, function(d) { return d[obj.series[i].field]; });
                        if (tmpVal > obj.yRightAxis.max) { obj.yRightAxis.max = tmpVal; };
                    };
                };
            };
            obj.last.xScale.domain([obj.xAxis.min,obj.xAxis.max]);
            if (obj.last.yLeftAxisEnable) { obj.last.yScaleLeft.domain([obj.yLeftAxis.min,obj.yLeftAxis.max]); };
            if (obj.last.yRightAxisEnable) { obj.last.yScaleRight.domain([obj.yRightAxis.min,obj.yRightAxis.max]); };
            // set chart axis
            if (obj.xAxis.type === 'date') {
                var xAxisD3 = d3.axisBottom(obj.last.xScale)
                            .ticks(d3.timeYear,1).tickFormat(d3.timeFormat("%Y"))
                            .tickSize(10);
                //calculate count month in year on axis
                var xqViewMonth=Math.round(((obj.xAxis.max-obj.xAxis.min)/1000/60/60/24/30)/(obj.last.width/23));
                if (xqViewMonth<1) { xqViewMonth=1; };

                var monthNameFormat = d3.timeFormat("%m");
                var xAxis2D3 = d3.axisBottom(obj.last.xScale)
                            .ticks(d3.timeMonth,xqViewMonth).tickFormat(function(d) { var a = monthNameFormat(d); if (a == "01") {a = "";}; return a;})
                            .tickSize(2);
            } else {
                var xAxisD3 = d3.axisBottom(obj.last.xScale);
                if (obj.last.width<300) xAxisD3.ticks(5);
            };
            var yAxisLeftD3 = d3.axisLeft(obj.last.yScaleLeft);
            if (obj.last.height<100) yAxisLeftD3.ticks(5);
            var yAxisRightD3 = d3.axisRight(obj.last.yScaleRight);
            if (obj.last.height<100) yAxisRightD3.ticks(5);

            // create svg for draving chart
            obj.last.svg = d3.select(body.get(0)).append("svg")
                .attr("width", body.width()).attr("height", body.height());
            // create group in svg for generate graph
            obj.last.g = obj.last.svg.append("g").attr("transform", "translate(" + obj.margin.left + "," + obj.margin.top + ")");
            obj.last.g1 = obj.last.svg.append("g").attr("transform", "translate(" + obj.margin.left + "," + obj.margin.top + ")");
            // add axis to chart
            if (obj.xAxis.visible) {
                obj.last.g1.append("text").attr("x", obj.last.width-43).attr("dx", 40) .attr("y", obj.last.height-4 )
                    .attr("text-anchor", "end")
                    .attr("id", 'chart_'+ this.name +'_xAxisCaption') 
                    .text(obj.xAxis.caption);
                obj.last.g1.append("g").attr("class", "x axis").attr("transform", "translate(0," + obj.last.height + ")")
                    .call(xAxisD3);
                if (obj.xAxis.type === 'date') {
                    obj.last.g1.append("g").attr("class", "x axis2").attr("transform", "translate(0," + obj.last.height + ")")
                      .call(xAxis2D3);
                };
            };
            if (obj.last.yLeftAxisEnable && obj.yLeftAxis.visible) {
                obj.last.g1.append("text").attr("transform", "rotate(-90)")
                    .attr("x", 0) .attr("y", -28).attr("dy", 40)
                    .attr("text-anchor", "end") 
                    .text(obj.yLeftAxis.caption);
                obj.last.g1.append("g").attr("class", "y axis")
                    .call(yAxisLeftD3);
            };
            if (obj.last.yRightAxisEnable && obj.yRightAxis.visible) {
                obj.last.g1.append("text").attr("transform", "rotate(-90)")
                    .attr("x", 0) .attr("y", obj.last.width-44).attr("dy", 40)
                    .attr("text-anchor", "end") 
                    .text(obj.yRightAxis.caption);
                obj.last.g1.append("g").attr("class", "y axis").attr("transform", "translate(" + obj.last.width + " ,0)")
                    .call(yAxisRightD3);
            };
        },

        render: function (box) {
            var obj = this;
            // if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection
            var time = (new Date()).getTime();
            // event before
            var edata = obj.trigger({ phase: 'before', type: 'render', target: obj.name, box: box });
            if (edata.isCancelled === true) return;

            if (box != null) {
                if ($(obj.box).find('#chart_'+ obj.name +'_body').length > 0) {
                    $(obj.box)
                        .removeAttr('name')
                        .removeClass('w2ui-reset w2ui-grid')
                        .html('');
                }
                obj.box = box;
            }
            if (!obj.box) return false;
            $(obj.box)
                .attr('name', obj.name)
                .addClass('w2ui-reset w2ui-grid')
                .html('<div class="w2ui-chart-box">'+
                      '    <div id="chart_'+ obj.name +'_header" class="w2ui-grid-header"></div>'+
                      '    <div id="chart_'+ obj.name +'_body" class="w2ui-grid-body"></div>'+
                      '    <div id="chart_'+ obj.name +'_footer" class="w2ui-grid-footer"></div>'+
                      '</div>');
            if ($(obj.box).length > 0) $(obj.box)[0].style.cssText += obj.style;
            // TODO: init footer
            //$('#grid_'+ this.name +'_footer').html(this.getFooterHTML());

            // event after
            obj.trigger($.extend(edata, { phase: 'after' }));
            obj.resize();
            return (new Date()).getTime() - time;
        },

        resize: function () {
            var obj  = this;
            var time = (new Date()).getTime();
            // make sure the box is right
            if (!this.box || $(this.box).attr('name') != this.name) return;
            // determine new width and height
            $(this.box).find('> div.w2ui-chart-box')
                .css('width', $(this.box).width())
                .css('height', $(this.box).height());
            // event before
            var edata = this.trigger({ phase: 'before', type: 'resize', target: this.name });
            if (edata.isCancelled === true) return;
            // resize
            obj.resizeBoxes();
            obj.refresh();
            // event after
            this.trigger($.extend(edata, { phase: 'after' }));
            return (new Date()).getTime() - time;
        },

        resizeBoxes: function () {
            var obj  = this;
            // elements
            var chart    = $(this.box).find('> div.w2ui-chart-box');
            var header   = $('#chart_'+ this.name +'_header');
            var header   = $('#chart_'+ this.name +'_header');
            var footer   = $('#chart_'+ this.name +'_footer');
            var body     = $('#chart_'+ this.name +'_body');

            if (this.show.header) {
                header.css({
                    top:   '0px',
                    left:  '0px',
                    right: '0px'
                });
            }
            if (this.show.footer) {
                footer.css({
                    bottom: '0px',
                    left:  '0px',
                    right: '0px'
                });
            }
            var calculatedHeight =  chart.height()
                - (this.show.header ? w2utils.getSize(header, 'height') : 0)
                - (this.show.footer ? w2utils.getSize(footer, 'height') : 0);
            body.css({
                top: ( 0 + (this.show.header ? w2utils.getSize(header, 'height') : 0) ) + 'px',
                bottom: ( 0 + (this.show.footer ? w2utils.getSize(footer, 'height') : 0) ) + 'px',
                left:   '0px',
                right:  '0px',
                height: calculatedHeight
            });
        },

        destroy: function () {
            // event before
            var edata = this.trigger({ phase: 'before', type: 'destroy', target: this.name });
            if (edata.isCancelled === true) return;
            // clean up
            if ($(this.box).find('#chart_'+ this.name + '_body').length > 0) {
                $(this.box)
                    .removeAttr('name')
                    .removeClass('w2ui-reset w2ui-chart')
                    .html('');
            }
            delete w2ui[this.name];
            // event after
            this.trigger($.extend(edata, { phase: 'after' }));
        },

        getFooterHTML: function () {
            return '<div>'+
                '    <div class="w2ui-footer-left"></div>'+
                '    <div class="w2ui-footer-right"></div>'+
                '    <div class="w2ui-footer-center"></div>'+
                '</div>';
        }

        // ===================================================
        // -- Internal Event Handlers
    };

    $.extend(w2chart.prototype, w2utils.event);
    w2obj.chart = w2chart;
})(jQuery);
