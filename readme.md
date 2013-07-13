## W2UI 1.2 - MIT License

W2UI is modern, intuitive JavaScript UI library for buidling rich data-driven web application. The library has
a small footprint and no dependencies except jQuery. The library has the following widgets:

* w2layout
* w2grid
* w2toolbar
* w2sidebar
* w2tabs
* w2form
* w2popup
* w2utils

The complete library is only **42Kb** (minified & gzipped)

## Quick Start

Current stable version is 1.2. You can download it from here: [http://w2ui.com](http://w2ui.com).

To start using the library you need to include into your page: 

- w2ui-1.2.js (or w2ui-1.2.min.js) 
- w2ui-1.2.css (or w2ui-1.2.min.css) 

All the widgets and their css classes are defined inside of these two files. There is no image dependencies, they are embedded 
into CSS file

There is no requirement for a server side language. Java, PHP, ASP, Perl or .NET all will work, as long as you can return JSON
format from the server (or write a converter into JSON format on the client).

[Getting Started Guide](http://w2ui.com/web/get-started)

## Documentation & Demos

You can find documentation and demos here:

* [http://w2ui.com/web/docs](http://w2ui.com/web/docs) - documentation
* [http://w2ui.com/web/demos](http://w2ui.com/web/demos) - demos

## Bug Tracking

Have a bug or a feature request? Please open an issue here [https://github.com/vitmalina/w2ui/issues](https://github.com/vitmalina/w2ui/issues). 
Please make sure that the same issue was not previously submitted by someone else.

## Building 

I use ANT to build the project. It does the folloing

- Compiles LESS files
- Concatenates and minifies CSS files
- Concatenates and minifies JS files 

In order to be able to use ANT, you will need to install Node.JS and NMP on your machine, then run the following commands to install dependencies

```
sudo npm install less -g
sudo npm install clean-css -g
sudo npm install uglify-js@1 -g
```

## Contributing

Your contributions are welcome. However, few things you need to know before contribution:

1. Please check out latest code before changing anything. It is harder to merge if your changes will not merge clean.
2. If you are changing JS files - do all changes in /src folder
3. If you are changing CSS files - do all changes in LESS in /css/less/src
4. If you want to help with unit test - do all changes in /test/qunit
5. If you want to change documenation - do all chnages in /docs
6. If you want to add demos - do all changes in /demos