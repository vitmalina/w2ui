// **********************************
// -- Unit Tests: w2utils

test( "w2utils.formatNumber()", function () {
    var values = {
        '1,000'         : '1000',
        '1,000.01'         : '1000.01',
        '1,000.0001'     : '1000.0001'
    }
    equal( w2utils.formatNumber(), '',          "- no argument -" );
    equal( w2utils.formatNumber(''), '',         "- blank -" );
    equal( w2utils.formatNumber(null), '',         "- null -" );
    equal( w2utils.formatNumber(undefined), '',    "- undefined -" );
    equal( w2utils.formatNumber({}), '',         "- object -" );
    equal( w2utils.formatNumber([]), '',         "- array -" );

    for (var v in values) {
        equal( w2utils.formatNumber(values[v]), v, 'Test: ' + values[v] + ' = ' + v);
    }
});

test( "w2utils.size()", function() {
    var values = {
        ''             : 0,
        '1 Bt'         : 1,
        '512 Bt'    : 512,
        '1023 Bt'    : 1023,
        '1.0 KB'    : 1024,
        '1.4 KB'    : 1500,
        '1023.9 KB'    : 1024*1024-1,
        '1.0 MB'    : 1024*1024+1,
        '2.1 MB'    : 1024*1024*2.1,
        '2.5 GB'    : 1024*1024*1024*2.5,
        '2.9 TB'    : 1024*1024*1024*1024*2.99
    }
    equal( w2utils.size(), '',          "- no argument -" );
    equal( w2utils.size(''), '',         "- blank -" );
    equal( w2utils.size(null), '',         "- null -" );
    equal( w2utils.size(undefined), '',    "- undefined -" );
    equal( w2utils.size({}), '',         "- object -" );
    equal( w2utils.size([]), '',         "- array -" );

    for (var v in values) {
        equal( w2utils.size(values[v]), v, 'Test: ' + values[v] + ' = ' + v);
    }
});

test( "w2utils.isInt()", function() {
    var values = {
        1             : true,
        0             : true,
        '2'            : true,
        '-1'         : true,
        '+1'         : true,
        '1.'         : false,
        '1.0'         : false,
        '1.0.0'     : false,
        '1-0'         : false,
        '--1'         : false,
        '1--'         : false,
        '1,000'        : false     // should have no commas
    }
    ok( w2utils.isInt() === false,          "- no argument -" );
    ok( w2utils.isInt('') === false,         "- blank -" );
    ok( w2utils.isInt(null) === false,         "- null -" );
    ok( w2utils.isInt(undefined) === false,    "- undefined -" );
    ok( w2utils.isInt({}) === false,         "- object -" );
    ok( w2utils.isInt([]) === false,         "- array -" );
    for (var v in values) {
        ok( w2utils.isInt(v) === values[v], 'Test: ' + v);
    }
});

test( "w2utils.isFloat()", function() {
    var values = {
        1             : true,
        0             : true,
        1.0e3        : true,
        'x'            : false,
        '-1x'        : false,
        'x-1'        : false,
        '2'            : true,
        '-1'         : true,
        '+1'         : true,
        '1.'         : true,
        '1.0'         : true,
        '1.0.0'     : false,
        '1-0'         : false,
        '--1'         : false,
        '1--'         : false,
        '1,000'        : false,
        '3.0E+2'    : true,
        '3.0E-2'    : true
    }
    ok( w2utils.isFloat() === false,              "- no argument -" );
    ok( w2utils.isFloat('') === false,             "- blank -" );
    ok( w2utils.isFloat(null) === false,         "- null -" );
    ok( w2utils.isFloat(undefined) === false,    "- undefined -" );
    ok( w2utils.isFloat({}) === false,             "- object -" );
    ok( w2utils.isFloat([]) === false,             "- array -" );
    ok( w2utils.isFloat(1/0) === true,             "- +Infinity is a float -" );
    ok( w2utils.isFloat(-1/0) === true,            "- -Infinity is a float -" );
    ok( w2utils.isFloat(0/0) === false,             "- NaN is NOT a float -" );

    for (var v in values) {
        ok( w2utils.isFloat(v) === values[v], 'Test: ' + v);
    }
});

test( "w2utils.isMoney() - Default Format", function() {
    var values = {
        1             : true,
        0             : true,
        '2'            : true,
        '-1'         : true,
        '+1'         : true,
        '1.'         : false,
        '1.0'         : true,
        '1.0.0'     : false,
        '1-0'         : false,
        '--1'         : false,
        '1--'         : false,
        '1,000'        : true,
        '$4.00'        : true,
        '$4,000'    : true,
        '$-4,000'    : true,
        '$+4,000'    : true,
        '1 000'        : false,
        '4.0€'        : false,
        '4 000€'    : false,
        '-4 000€'    : false,
        '+4 000€'    : false
    }
    ok( w2utils.isMoney() === false,              "- no argument -" );
    ok( w2utils.isMoney('') === false,             "- blank -" );
    ok( w2utils.isMoney(null) === false,         "- null -" );
    ok( w2utils.isMoney(undefined) === false,    "- undefined -" );
    ok( w2utils.isMoney({}) === false,             "- object -" );
    ok( w2utils.isMoney([]) === false,             "- array -" );
    for (var v in values) {
        ok( w2utils.isMoney(v) === values[v], 'Test: ' + v);
    }
});

test( "w2utils.isMoney() - EU Format", function() {
    // $\€\£\¥
    $.extend(w2utils.settings, { currencyPrefix: "", currencySuffix: "€", groupSymbol : " " });
    var values = {
        1             : true,
        0             : true,
        '2'            : true,
        '-1'         : true,
        '+1'         : true,
        '1.'         : false,
        '1.0'         : true,
        '1.0.0'     : false,
        '1-0'         : false,
        '--1'         : false,
        '1--'         : false,
        '$4.00'        : false,
        '$4,000'    : false,
        '$-4,000'    : false,
        '$+4,000'    : false,
        '1 000'        : true,
        '4.00€'        : true,
        '4 000€'    : true,
        '-4 000€'    : true,
        '+4 000€'    : true,
    }
    ok( w2utils.isMoney() === false,              "- no argument -" );
    ok( w2utils.isMoney('') === false,             "- blank -" );
    ok( w2utils.isMoney(null) === false,         "- null -" );
    ok( w2utils.isMoney(undefined) === false,    "- undefined -" );
    ok( w2utils.isMoney({}) === false,             "- object -" );
    ok( w2utils.isMoney([]) === false,             "- array -" );
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

    ok( w2utils.isDate() === false,              "- no argument -" );
    ok( w2utils.isDate('') === false,             "- blank -" );
    ok( w2utils.isDate(null) === false,         "- null -" );
    ok( w2utils.isDate(undefined) === false,    "- undefined -" );
    ok( w2utils.isDate({}) === false,             "- object -" );
    ok( w2utils.isDate([]) === false,             "- array -" );
    ok( w2utils.isDate(1300) === false,            "- integer -" );
    ok( w2utils.isDate(500.5) === false,        "- number -" );
});

test( "w2utils.isTime()", function() {
    var values = {
        1             : false,
        0             : false,
        '2'            : false,
        '-1'         : false,
        '+1'         : false,
        '1.'         : false,
        '1.0'         : false,
        '1:0'         : false,
        ':01'         : false,
        ' :01'         : false,
        '1:00'         : true,
        '01:00'        : true,
        '001:000'    : false,
        '001:00'    : false,
        '01:000'    : false,
        '1 : 0'     : false,
        '1PM'         : true,
        '1AM'         : true,
        '0AM'         : false,
        '12AM'         : true,
        '0PM'         : false,
        '12PM'         : true,
        '0:00AM'    : true,
        '4:00'        : true,
        '4:000'        : false,
        '-4:00'        : false,
        '1:00AM'    : true,
        '13:00AM'    : false,
        '12:00AM'    : true,
        '12:01AM'    : true,
        '00:00AM'    : true,
        '13:00PM'    : false,
        '12:00PM'    : true,
        '12:01PM'    : true,
        '00:00PM'    : true,
        '13:00 PM'    : false,
        '12:00 PM'    : true,
        '00:00 PM'    : true,
        ' 6:30 '    : true,
        ' 6 : 30 '    : false,
        ' 6 : 3 0 '    : false,
        '13:00'        : true,
        '23:00'        : true,
        '24:00'        : true,
        '24:01'        : false,
        '25:00'        : false,
        '12:00'        : true,
        '12:01'        : true,
        '12:59'        : true,
        '11:60'        : false,
        '11:-1'        : false,
        '11:0'        : false,
        '11:0AM'    : false,
        '11:0 AM'    : false,
        '00:00'        : true
    };
    ok( w2utils.isTime() === false,              "- no argument -" );
    ok( w2utils.isTime('') === false,             "- blank -" );
    ok( w2utils.isTime(null) === false,         "- null -" );
    ok( w2utils.isTime(undefined) === false,    "- undefined -" );
    ok( w2utils.isTime({}) === false,             "- object -" );
    ok( w2utils.isTime([]) === false,             "- array -" );
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