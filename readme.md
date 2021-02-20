## Road to 2.0
The `master` branch has new, in-progress version of w2ui. You might want to consider [1.5 branch](https://github.com/vitmalina/w2ui/tree/w2ui-1.5) that is stable and supports older browsers. Here are the goals for the new version of w2ui.

[Road to 2.0 discussion](https://github.com/vitmalina/w2ui/discussions/1955)

## About W2UI

W2UI is a modern JavaScript UI library for building data-driven web applications. It aims to let you define UI in expressive JSON-like structures. The library has small footprint and has only one dependency - jQuery.

The library implements following UI controls:

* **[w2layout](http://w2ui.com/web/docs/1.5/layout)** - a Layout component - *[demo](http://w2ui.com/web/demo/layout)*
* **[w2grid](http://w2ui.com/web/docs/1.5/layout/grid)** - an advanced Grid component - *[demo](http://w2ui.com/web/demo/grid)*
* **[w2toolbar](http://w2ui.com/web/docs/1.5/toolbar)** - a Toolbar component - *[demo](http://w2ui.com/web/demo/toolbar)*
* **[w2sidebar](http://w2ui.com/web/docs/1.5/sidebar)** - a Tree/Sidebar component - *[demo](http://w2ui.com/web/demo/sidebar)*
* **[w2tabs](http://w2ui.com/web/docs/1.5/tabs)** - Tabs - *[demo](http://w2ui.com/web/demo/tabs)*
* **[w2form](http://w2ui.com/web/docs/1.5/form)** - Forms - *[demo](http://w2ui.com/web/demo/form)*
* **[w2fields](http://w2ui.com/web/docs/1.5/fields)** - various Fields - *[demo](http://w2ui.com/web/demo/fields)*
* **[w2popup](http://w2ui.com/web/docs/1.5/popup)** - a Popup component - *[demo](http://w2ui.com/web/demo/popup)*
* **[w2utils](http://w2ui.com/web/docs/1.5/utils)** - various utilities - *[demo](http://w2ui.com/web/demo/utils)*

The complete library is under **100Kb** (minified & gzipped).

## Quick Start

Current stable version is 1.5
Current development version is 2.0

[Getting Started Guide](http://w2ui.com/web/get-started)

You can download latest stable version here: [http://w2ui.com](http://w2ui.com). If you want to use dev version, see `dist/` folder in the master branch.

To start using the library you need to include into your page:

- w2ui.js (or w2ui.min.js)
- w2ui.css (or w2ui.min.css)

All the controls and their css classes are defined inside of these two files. There is no image dependencies, some images
are embedded into CSS file, as well as font icons.

There is no requirement for a server side language. Node, Java, PHP, ASP, Perl or .NET all will work, as long as you can
return JSON format from the server (or write a converter into JSON format on the client). Some server side example implementations
can be found [here](https://github.com/vitmalina/w2ui/tree/master/server).

## Documentation & Demos

You can find documentation and demos here:

* [http://w2ui.com/web/docs](http://w2ui.com/web/docs) - documentation
* [http://w2ui.com/web/demos](http://w2ui.com/web/demos) - detailed demos


## Bug Tracking

Have a bug or a feature request? Please open an issue here [https://github.com/vitmalina/w2ui/issues](https://github.com/vitmalina/w2ui/issues).
Please make sure that the same issue was not previously submitted by someone else.

## Building

It is a Node.JS repository, so, you need to have node installed to install all dependencies run

```
npm install
```

To compile JS and CSS, run
```
gulp
```

It will bundle all necessary files into `dist/w2ui.min.js` and `dist/w2ui.min.css`

## File Structure

```
- dist        - compiled JS and CSS files
- src         - source JS files
  - kickstart - module loader & router, see https://github.com/vitmalina/w2ui-starter
  - less      - LESS files (source for css)
- demos       - all demos, same as on the website
- libs        - external libs, som used in demos, etc.
- server      - server api samles (to get you started)
- specs       - some qunit test
- test        - manual testing files
```

## Who is Using It

[List of projects that use **`w2ui`**](https://github.com/vitmalina/w2ui/wiki/Projects-that-use-w2ui)!

If you're using **`w2ui`**, I'd love to hear about it, please email to `vitmalina@gmail.com` the name of your project and a link to a public website or demo, and I will add it to the list.

## Contributing

Your contributions are welcome. However, few things you need to know before contribution:

1. Please check out latest code before changing anything. It is harder to merge if your changes will not merge clean.
2. If you are changing JS files - do all changes in /src folder
3. If you are changing CSS files - do all changes in LESS in /src/less/src
4. If you want to help with unit test - do all changes in /qa
5. If you want to change documentation - do all changes in /docs
6. If you want to add demos - do all changes in /demos
