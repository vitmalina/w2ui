# things
- selectors
- events
- animation (scrollIntoView({ behavior: 'smooth' }), scroll({ top: 10, behavior: 'smooth' }))
- dimentions (.position(), .height(), .width()) -> getBoundingClientRect
- data()
- $().scrollLeft -> $().prop('scrollLeft')
- $().scrolTop -> $().prop('scrollTop')
- $().clone -> element.cloneNode()

# selectors are not fully compatible

$('div').find('> div') => query('div').find(':scope > div')
next() - nextElemenetSibling
prev() - previousElemenetSibling
