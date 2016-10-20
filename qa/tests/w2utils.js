// **********************************
// -- Unit Tests: w2utils

test( "w2utils.date()", function () {
    var dt  = new Date();
    var dt2 = (new Date()).getTime() -  86400000 * 5;
    equal( w2utils.date(), '',          "- no argument -" );
    equal( w2utils.date(''), '',        "- blank -" );
    equal( w2utils.date(null), '',      "- null -" );
    equal( w2utils.date(undefined), '', "- undefined -" );
    equal( w2utils.date({}), '',        "- object -" );
    equal( w2utils.date([]), '',        "- array -" );
    equal( w2utils.stripTags(w2utils.date(new Date())), w2utils.formatTime(dt), "Today" );
    equal( w2utils.stripTags(w2utils.date((new Date()).getTime() -  86400000 )), w2utils.stripTags('Yesterday'), "Yesterday" );
});

test( "w2utils.age()", function () {
    var dt  = new Date();
    equal( w2utils.age(), '',          "- no argument -" );
    equal( w2utils.age(''), '',        "- blank -" );
    equal( w2utils.age(null), '',      "- null -" );
    equal( w2utils.age(undefined), '', "- undefined -" );
    equal( w2utils.age({}), '',        "- object -" );
    equal( w2utils.age([]), '',        "- array -" );
    equal( w2utils.stripTags(w2utils.age(new Date())), '0 sec', "Now" );
    equal( w2utils.stripTags(w2utils.age((new Date()).getTime() -  4000 )), '4 secs', "4 secs" );
    equal( w2utils.stripTags(w2utils.age((new Date()).getTime() +  4000 )), '0 sec', "future" );
    equal( w2utils.stripTags(w2utils.age((new Date()).getTime() -  1000 * 60 * 5 )), '5 mins', "5 mins" );
    equal( w2utils.stripTags(w2utils.age((new Date()).getTime() -  1000 * 60 * 45 )), '45 mins', "45 mins" );
    equal( w2utils.stripTags(w2utils.age((new Date()).getTime() -  1000 * 60 * 60 * 2 )), '2 hours', "2 hours" );
    equal( w2utils.stripTags(w2utils.age((new Date()).getTime() -  86400000)), '1 day', "Yesterday" );
    equal( w2utils.stripTags(w2utils.age((new Date()).getTime() -  86400000 * 1.5)), '1 day', "Yesterday" );
    equal( w2utils.stripTags(w2utils.age((new Date()).getTime() -  86400000 * 5)), '5 days', "5 days" );
    equal( w2utils.stripTags(w2utils.age((new Date()).getTime() -  86400000 * 30)), '1 month', "1 month" );
    equal( w2utils.stripTags(w2utils.age((new Date()).getTime() -  86400000 * 33)), '1.1 months', "over a month" );
    equal( w2utils.stripTags(w2utils.age((new Date()).getTime() -  86400000 * 50)), '1.6 months', "over a month" );
    equal( w2utils.stripTags(w2utils.age((new Date()).getTime() -  86400000 * 145)), '4.8 months', "over 4 months" );
    equal( w2utils.stripTags(w2utils.age((new Date()).getTime() -  86400000 * 365)), '1 year', "one year" );
    equal( w2utils.stripTags(w2utils.age((new Date()).getTime() -  86400000 * 420)), '1.1 years', "over one year" );
    equal( w2utils.stripTags(w2utils.age((new Date()).getTime() -  86400000 * 365 * 20)), '19.9 years', "arround 20 years" );
});

test( "w2utils.formatNumber()", function () {
    var values = {
        '1,000'       : '1000',
        '1,000.01'    : '1000.01',
        '1,000.0001'  : '1000.0001'
    };
    equal( w2utils.formatNumber(), '',          "- no argument -" );
    equal( w2utils.formatNumber(''), '',        "- blank -" );
    equal( w2utils.formatNumber(null), '',      "- null -" );
    equal( w2utils.formatNumber(undefined), '', "- undefined -" );
    equal( w2utils.formatNumber({}), '',        "- object -" );
    equal( w2utils.formatNumber([]), '',        "- array -" );

    for (var v in values) {
        equal( w2utils.formatNumber(values[v]), v, 'Test: ' + values[v] + ' = ' + v);
    }
});

test( "w2utils.formatDate()", function () {
    var values = {
        '2014-01-05 => mm/dd/yyyy'     : '01/05/2014',
        '2014-01-05 => m/d/yyyy'       : '1/5/2014',
        '2014-01-31 => m/d/yyyy'       : '1/31/2014',
        '2014-05-31 => d.m.yyyy'       : '31.5.2014',
        '2014-05-31 => d.m/yyyy'       : '31.5/2014',
        '2014-05-31 => dd mm yyyy'     : '31 05 2014',
        '2014-05-31 => yyyy-m-d'       : '2014-5-31',
        '2014-05-31 => dd Mon, yyyy'   : '31 May, 2014',
        '2014-06-04 => dd Month, yyyy' : '04 June, 2014',
        '2014-06-04 => d Month, yyyy'  : '4 June, 2014',
        '2014-06-04 => Month dth, yyyy': 'June 4th, 2014',
        '2014-06-01 => Mon dth, yyyy'  : 'Jun 1st, 2014',
        '2014-06-02 => Mon dth, yyyy'  : 'Jun 2nd, 2014',
        '2014-06-03 => Mon dth, yyyy'  : 'Jun 3rd, 2014'
    };
    equal( w2utils.formatDate(), '',          "- no argument -" );
    equal( w2utils.formatDate(''), '',        "- blank -" );
    equal( w2utils.formatDate(null), '',      "- null -" );
    equal( w2utils.formatDate(undefined), '', "- undefined -" );
    equal( w2utils.formatDate({}), '',        "- object -" );
    equal( w2utils.formatDate([]), '',        "- array -" );

    for (var v in values) {
        var tmp = v.split(' => ');
        var tm1 = tmp[0].split('-');
        var fm  = w2utils.formatDate(new Date(parseInt(tm1[0]), parseInt(tm1[1])-1, parseInt(tm1[2])), tmp[1]);
        equal( fm, values[v], 'Format: ' + tmp[0] + ' => ' + tmp[1] + ' =>  ' + fm);
    }
});

test( "w2utils.formatTime()", function () {
    var values = {
        '21:40:00 => hh:mi pm'     : '9:40 pm',
        '21:40:00 => hh:mi am'     : '9:40 pm',
        '9:40:00 => hh:mi am'      : '9:40 am',
        '21:40:05 => hh:mi:ss am'  : '9:40:05 pm',
        '21:40:00 => h24:mi'       : '21:40',
        '21:40:35 => h24:mi:ss'    : '21:40:35',
        '8:40:35 => hh24:mi:ss'    : '08:40:35',
        '18:40:35 => hh24:mi:ss'   : '18:40:35',
        '8:40:35 => hhh:mm:ss'     : '08:40:35'
    };
    equal( w2utils.formatTime(), '',          "- no argument -" );
    equal( w2utils.formatTime(''), '',        "- blank -" );
    equal( w2utils.formatTime(null), '',      "- null -" );
    equal( w2utils.formatTime(undefined), '', "- undefined -" );
    equal( w2utils.formatTime({}), '',        "- object -" );
    equal( w2utils.formatTime([]), '',        "- array -" );

    for (var v in values) {
        var tmp = v.split(' => ');
        var tm2 = tmp[0].split(':');
        var dt  = new Date(2014, 0, 1); // Jan 1, 2014
        dt.setHours(parseInt(tm2[0]));
        dt.setMinutes(parseInt(tm2[1]));
        dt.setSeconds(parseInt(tm2[2]));
        var fm  = w2utils.formatTime(dt, tmp[1]);
        equal( fm, values[v], 'Format: ' + tmp[0] + ' => ' + tmp[1] + ' =>  ' + fm);
    }
});

test( "w2utils.formatDateTime()", function () {
    var values = {
        '2014-01-05 21:40:05 => mm/dd/yyyy|hh:mi pm'     : '01/05/2014 9:40 pm',
        '2014-01-05 21:40:05 => mm/dd/yyyy|hh:mi:ss pm'  : '01/05/2014 9:40:05 pm',
        '2014-01-05 21:40:05 => mm/dd/yyyy|h24:mi:ss'    : '01/05/2014 21:40:05',
    };
    equal( w2utils.formatDateTime(), '',          "- no argument -" );
    equal( w2utils.formatDateTime(''), '',        "- blank -" );
    equal( w2utils.formatDateTime(null), '',      "- null -" );
    equal( w2utils.formatDateTime(undefined), '', "- undefined -" );
    equal( w2utils.formatDateTime({}), '',        "- object -" );
    equal( w2utils.formatDateTime([]), '',        "- array -" );
    equal( w2utils.formatDateTime('Sat Nov 22 2014 22:29:17'), '11/22/2014 10:29 pm', "default format" );

    for (var v in values) {
        var tmp = v.split(' => ');
        var tm1 = tmp[0].split(' ')[0].split('-');
        var tm2 = tmp[0].split(' ')[1].split(':');
        var dt  = new Date(parseInt(tm1[0]), parseInt(tm1[1])-1, parseInt(tm1[2]));
        dt.setHours(parseInt(tm2[0]));
        dt.setMinutes(parseInt(tm2[1]));
        dt.setSeconds(parseInt(tm2[2]));
        var fm  = w2utils.formatDateTime(dt, tmp[1]);
        equal( fm, values[v], 'Format: ' + tmp[0] + ' => ' + tmp[1] + ' =>  ' + fm);
    }
});

test( "w2utils.formatSize()", function() {
    var values = {
        ''          : 0,
        '1 Bt'      : 1,
        '512 Bt'    : 512,
        '1023 Bt'   : 1023,
        '1.0 KB'    : 1024,
        '1.4 KB'    : 1500,
        '1023.9 KB' : 1024*1024-1,
        '1.0 MB'    : 1024*1024+1,
        '2.1 MB'    : 1024*1024*2.1,
        '2.5 GB'    : 1024*1024*1024*2.5,
        '2.9 TB'    : 1024*1024*1024*1024*2.99
    };
    equal( w2utils.formatSize(), '',          "- no argument -" );
    equal( w2utils.formatSize(''), '',        "- blank -" );
    equal( w2utils.formatSize(null), '',      "- null -" );
    equal( w2utils.formatSize(undefined), '', "- undefined -" );
    equal( w2utils.formatSize({}), '',        "- object -" );
    equal( w2utils.formatSize([]), '',        "- array -" );

    for (var v in values) {
        equal( w2utils.formatSize(values[v]), v, 'Test: ' + values[v] + ' = ' + v);
    }
});

test( "w2utils.isInt()", function() {
    var values = {
        1       : true,
        0       : true,
        '2'     : true,
        '-1'    : true,
        '+1'    : true,
        '1.'    : false,
        '1.0'   : false,
        '1.0.0' : false,
        '1-0'   : false,
        '--1'   : false,
        '1--'   : false,
        '1,000' : false     // should have no commas
    };
    ok( w2utils.isInt() === false,          "- no argument -" );
    ok( w2utils.isInt('') === false,        "- blank -" );
    ok( w2utils.isInt(null) === false,      "- null -" );
    ok( w2utils.isInt(undefined) === false, "- undefined -" );
    ok( w2utils.isInt({}) === false,        "- object -" );
    ok( w2utils.isInt([]) === false,        "- array -" );

    for (var v in values) {
        ok( w2utils.isInt(v) === values[v], 'Test: ' + v);
    }
});

test( "w2utils.isFloat()", function() {
    var values = {
        1           : true,
        0           : true,
        1.0e3       : true,
        'x'         : false,
        '-1x'       : false,
        'x-1'       : false,
        '2'         : true,
        '-1'        : true,
        '+1'        : true,
        '1.'        : true,
        '1.0'       : true,
        '1.0.0'     : false,
        '1-0'       : false,
        '--1'       : false,
        '1--'       : false,
        '1,000'     : true,
        '3.0E+2'    : true,
        '3.0E-2'    : true
    };
    ok( w2utils.isFloat() === false,            "- no argument -" );
    ok( w2utils.isFloat('') === false,          "- blank -" );
    ok( w2utils.isFloat(null) === false,        "- null -" );
    ok( w2utils.isFloat(undefined) === false,   "- undefined -" );
    ok( w2utils.isFloat({}) === false,          "- object -" );
    ok( w2utils.isFloat([]) === false,          "- array -" );
    ok( w2utils.isFloat(1/0) === true,          "- +Infinity is a float -" );
    ok( w2utils.isFloat(-1/0) === true,         "- -Infinity is a float -" );
    ok( w2utils.isFloat(0/0) === false,         "- NaN is NOT a float -" );

    for (var v in values) {
        ok( w2utils.isFloat(v) === values[v], 'Test: ' + v);
    }
});

test( "w2utils.isMoney() - Default Format", function() {
    var values = {
        1           : true,
        0           : true,
        '2'         : true,
        '-1'        : true,
        '+1'        : true,
        '1.'        : false,
        '1.0'       : true,
        '1.0.0'     : false,
        '1-0'       : false,
        '--1'       : false,
        '1--'       : false,
        '1,000'     : true,
        '$4.00'     : true,
        '$4,000'    : true,
        '$-4,000'   : true,
        '$+4,000'   : true,
        '-$4,000'   : true,
        '+$4,000'   : true,
        '1 000'     : false,
        '4.0€'      : false,
        '4 000€'    : false,
        '-4 000€'   : false,
        '+4 000€'   : false
    };
    ok( w2utils.isMoney() === false,            "- no argument -" );
    ok( w2utils.isMoney('') === false,          "- blank -" );
    ok( w2utils.isMoney(null) === false,        "- null -" );
    ok( w2utils.isMoney(undefined) === false,   "- undefined -" );
    ok( w2utils.isMoney({}) === false,          "- object -" );
    ok( w2utils.isMoney([]) === false,          "- array -" );
    for (var v in values) {
        ok( w2utils.isMoney(v) === values[v], 'Test: ' + v);
    }
});

test( "w2utils.isMoney() - EU Format", function() {
    // $\€\£\¥
    $.extend(w2utils.settings, { currencyPrefix: "", currencySuffix: "€", groupSymbol : " " });
    var values = {
        1           : true,
        0           : true,
        '2'         : true,
        '-1'        : true,
        '+1'        : true,
        '1.'        : false,
        '1.0'       : true,
        '1.0.0'     : false,
        '1-0'       : false,
        '--1'       : false,
        '1--'       : false,
        '$4.00'     : false,
        '$4,000'    : false,
        '$-4,000'   : false,
        '$+4,000'   : false,
        '1 000'     : true,
        '4.00€'     : true,
        '4 000€'    : true,
        '-4 000€'   : true,
        '+4 000€'   : true
    };
    ok( w2utils.isMoney() === false,            "- no argument -" );
    ok( w2utils.isMoney('') === false,          "- blank -" );
    ok( w2utils.isMoney(null) === false,        "- null -" );
    ok( w2utils.isMoney(undefined) === false,   "- undefined -" );
    ok( w2utils.isMoney({}) === false,          "- object -" );
    ok( w2utils.isMoney([]) === false,          "- array -" );
    for (var v in values) {
        ok( w2utils.isMoney(v) === values[v], 'Test: ' + v);
    }
    $.extend(w2utils.settings, { currencyPrefix: "$", currencySuffix: "", groupSymbol : "," });
});

test( "w2utils.isDate()", function() {
    ok( w2utils.isDate('1/31/2013', 'mm/dd/yyyy') === true, "'1/31/2013', 'mm/dd/yyyy'" );
    ok( w2utils.isDate('1.31.2013', 'mm.dd.yyyy') === true, "'1.31.2013', 'mm.dd.yyyy'" );
    ok( w2utils.isDate('1-31-2013', 'mm-dd-yyyy') === true, "'1-31-2013', 'mm-dd-yyyy'" );
    ok( w2utils.isDate('31/1/2013', 'dd/mm/yyyy') === true, "'31/1/2013', 'dd/mm/yyyy'" );
    ok( w2utils.isDate('31.1.2013', 'dd.mm.yyyy') === true, "'31.1.2013', 'dd.mm.yyyy'" );
    ok( w2utils.isDate('31-1-2013', 'dd-mm-yyyy') === true, "'31-1-2013', 'dd-mm-yyyy'" );
    ok( w2utils.isDate('2013/31/1', 'yyyy/dd/mm') === true, "'2013/31/1', 'yyyy/dd/mm'" );
    ok( w2utils.isDate('2013.31.1', 'yyyy.dd.mm') === true, "'2013.31.1', 'yyyy.dd.mm'" );
    ok( w2utils.isDate('2013-31-1', 'yyyy-dd-mm') === true, "'2013-31-1', 'yyyy-dd-mm'" );
    ok( w2utils.isDate('2013/1/31', 'yyyy/mm/dd') === true, "'2013/1/31', 'yyyy/mm/dd'" );
    ok( w2utils.isDate('2013.1.31', 'yyyy.mm.dd') === true, "'2013.1.31', 'yyyy.mm.dd'" );
    ok( w2utils.isDate('2013-1-31', 'yyyy-mm-dd') === true, "'2013-1-1', 'yyyy-mm-dd'" );
    ok( w2utils.isDate('13-1-31', 'yy-mm-dd') === true, "'13-1-31', 'yy-mm-dd'" );
    ok( w2utils.isDate('31-1-13', 'dd-mm-yy') === true, "'31-1-13', 'dd-mm-yy'" );
    ok( w2utils.isDate('2/29/2008', 'mm/dd/yyyy') === true, "'2/29/2008', 'mm/dd/yyyy' - Leap Year" );
    ok( w2utils.isDate('2/29/2009', 'mm/dd/yyyy') === false, "'2/29/2009', 'mm/dd/yyyy' - Not Leap Year" );
    ok( w2utils.isDate('24/29/2009', 'mm/dd/yyyy') === false, "'24/29/2009', Wrong date" );
    ok( w2utils.isDate('dk3', '') === false, "'dk3', Wrong date" );
    ok( w2utils.isDate('31 Jan, 2013', 'dd Mon, yyyy') === true, "'1 Jun, 2013', 'dd Mon, yyyy'");
    ok( w2utils.isDate('30 Feb, 2013', 'dd Mon, yyyy') === false, "'30 Feb, 2013', 'dd Mon, yyyy'");
    ok( w2utils.isDate('1 January, 2013', 'dd Month, yyyy') === true, "'1 January, 2013', 'dd Month, yyyy'");
    ok( w2utils.isDate('January 5, 2013', 'Month dd, yyyy') === true, "'January 5, 2013', 'Month dd, yyyy'");

    ok( w2utils.isDate(new Date()) === true, "current date");

    ok( w2utils.isDate() === false,             "- no argument -" );
    ok( w2utils.isDate('') === false,           "- blank -" );
    ok( w2utils.isDate(null) === false,         "- null -" );
    ok( w2utils.isDate(undefined) === false,    "- undefined -" );
    ok( w2utils.isDate({}) === false,           "- object -" );
    ok( w2utils.isDate([]) === false,           "- array -" );
    ok( w2utils.isDate(1300) === true,         "- integer -" );
    ok( w2utils.isDate(500.5) === false,        "- number -" );
});

test( "w2utils.isTime()", function() {
    var values = {
        1               : false,
        0               : false,
        '2'             : false,
        '-1'            : false,
        '+1'            : false,
        '1.'            : false,
        '1.0'           : false,
        '1:0'           : false,
        ':01'           : false,
        ' :01'          : false,
        '1:00'          : true,
        '01:00'         : true,
        '001:000'       : false,
        '001:00'        : false,
        '01:000'        : false,
        '1 : 0'         : false,
        '1PM'           : true,
        '1AM'           : true,
        '0AM'           : false,
        '12AM'          : true,
        '0PM'           : false,
        '12PM'          : true,
        '0:00AM'        : true,
        '4:00'          : true,
        '4:000'         : false,
        '-4:00'         : false,
        '1:00AM'        : true,
        '13:00AM'       : false,
        '12:00AM'       : true,
        '12:01AM'       : true,
        '00:00AM'       : true,
        '13:00PM'       : false,
        '12:00PM'       : true,
        '12:01PM'       : true,
        '00:00PM'       : true,
        '13:00 PM'      : false,
        '12:00 PM'      : true,
        '00:00 PM'      : true,
        ' 6:30 '        : true,
        ' 6 : 30 '      : false,
        ' 6 : 3 0 '     : false,
        '13:00'         : true,
        '23:00'         : true,
        '24:00'         : true,
        '24:01'         : false,
        '25:00'         : false,
        '12:00'         : true,
        '12:01'         : true,
        '12:59'         : true,
        '11:60'         : false,
        '11:-1'         : false,
        '11:0'          : false,
        '11:0AM'        : false,
        '11:0 AM'       : false,
        '00:00'         : true,
        '12:02:43'      : true,
        '12:02:43PM'    : true,
        '11:00:33:43'   : false,
        '03:45:11 AM'   : true,
        '24:00:11'      : false,
        '14:26:43 PM'   : false
    };
    ok( w2utils.isTime() === false,             "- no argument -" );
    ok( w2utils.isTime('') === false,           "- blank -" );
    ok( w2utils.isTime(null) === false,         "- null -" );
    ok( w2utils.isTime(undefined) === false,    "- undefined -" );
    ok( w2utils.isTime({}) === false,           "- object -" );
    ok( w2utils.isTime([]) === false,           "- array -" );
    for (var v in values) {
        ok( w2utils.isTime(v) === values[v], 'Test: ' + v);
    }
});

test( "w2utils.base64encode(), w2utils.base64decode()", function() {
    ok(
        w2utils.base64decode(w2utils.base64encode('Some text')) === 'Some text',
        "Simple text"
    );
    ok(
        w2utils.base64decode(w2utils.base64encode('~!@#$%^&*()_+|}{":?><`;,./\\')) === '~!@#$%^&*()_+|}{":?><`;,./\\',
        "Text with special characters"
    );
});

test( "md5", function() {
    ok(w2utils.md5('some')  === '03d59e663c1af9ac33a9949d1193505a', "md5('some')");
    ok(w2utils.md5('other') === '795f3202b17cb6bc3d4b771d8c6c9eaf', "md5('other')");
});