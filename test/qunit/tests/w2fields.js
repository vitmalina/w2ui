// **********************************
// -- Unit Tests: w2utils

// test( "w2fields('enum')", function() {
//     var items;
//     var values = [
//         { // # 0
//             input: [ 'item1', 'item2', 'item3', null, undefined, '' ],
//             result: [
//                 { id: 'item1', text: 'item1' },
//                 { id: 'item2', text: 'item2' },
//                 { id: 'item3', text: 'item3' }
//             ],
//         }, 
//         { // # 1 
//             input: [
//                 null,
//                 { id: -1, text: 'item-1' },
//                 { id: 0,  text: 'item0' },
//                 { id: 1,  text: 'item1' }
//             ],
//             result: [
//                 { id: -1, text: 'item-1' },
//                 { id: 0,  text: 'item0' },
//                 { id: 1,  text: 'item1' }
//             ]
//         }, 
//         { // # 2
//             input: {
//                 "-1" : 'item-1',
//                  "0" : 'item0',
//                  "1" : 'item1',
//                  "2" : 'item2',
//             },
//             result: [
//                 { id: 0,  text: 'item0' },
//                 { id: 1,  text: 'item1' },
//                 { id: 2,  text: 'item2' },
//                 { id: -1, text: 'item-1' }
//             ]
//         }, 
//         { // # 3
//             input: {
//                 "a" : 'item-1',
//                 "b" : 'item0',
//                 "c" : 'item1',
//                 "d" : 'item2',
//             },
//             result: [
//                 { id: 'a', text: 'item-1' },
//                 { id: 'b', text: 'item0' },
//                 { id: 'c', text: 'item1' },
//                 { id: 'd', text: 'item2' }
//             ]
//         }
//     ];
//     $('body').append('<input type="text" id="enum"/>');

//     for (var v in values) {
//         $('#enum').w2field('clear');
//         $('#enum').w2field({ type: 'enum', items: values[v].input, selected: values[v].input });
//         var items = $('#enum').data('settings').items;
//         var selected = $('#enum').data('selected');
//         deepEqual(items, values[v].result, 'Enum items convertion #' + v);
//         deepEqual(selected, values[v].result, 'Enum selected convertion #' + v);
//     }

//     $('#enum').w2field('clear');
//     $('#enum').remove();
// });

// test( "w2fields('list')", function() {
//     var items;
//     var values = [
//         { // # 0
//             input: [ 'item1', 'item2', 'item3', null, undefined, '' ],
//             result: [
//                 { id: 'item1', text: 'item1' },
//                 { id: 'item2', text: 'item2' },
//                 { id: 'item3', text: 'item3' }
//             ],
//         }, 
//         { // # 1 
//             input: [
//                 null,
//                 { id: -1, text: 'item-1' },
//                 { id: 0,  text: 'item0' },
//                 { id: 1,  text: 'item1' }
//             ],
//             result: [
//                 { id: -1, text: 'item-1' },
//                 { id: 0,  text: 'item0' },
//                 { id: 1,  text: 'item1' }
//             ]
//         }, 
//         { // # 2
//             input: {
//                 "-1" : 'item-1',
//                  "0" : 'item0',
//                  "1" : 'item1',
//                  "2" : 'item2',
//             },
//             result: [
//                 { id: 0,  text: 'item0' },
//                 { id: 1,  text: 'item1' },
//                 { id: 2,  text: 'item2' },
//                 { id: -1, text: 'item-1' }
//             ]
//         }, 
//         { // # 3
//             input: {
//                 "a" : 'item-1',
//                 "b" : 'item0',
//                 "c" : 'item1',
//                 "d" : 'item2',
//             },
//             result: [
//                 { id: 'a', text: 'item-1' },
//                 { id: 'b', text: 'item0' },
//                 { id: 'c', text: 'item1' },
//                 { id: 'd', text: 'item2' }
//             ]
//         }
//     ];
//     $('body').append('<select id="list"></select>');

//     for (var v in values) {
//         $('#list').w2field('clear');
//         $('#list').w2field({ type: 'list', items: values[v].input, selected: values[v].input });
//         var items = $('#list').data('settings').items;
//         deepEqual(items, values[v].result, 'Enum items convertion #' + v);
//     }

//     $('#list').w2field('clear');
//     $('#list').remove();
// });