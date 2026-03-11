== Icons ==

All icons that are used in w2ui are svg files located in `src/less/icons/svg/*` directory. If you add/modify icons, you will need to regenerate the font and corresponding CSS files. Run the following command:

```
gulp icons
```

It will regenerate following files
- icons.json
- preview.html
- w2ui-font.css
- w2ui-font.woff

And also copy `w2ui-font.css` into `src/less/src/icons.less` file that will be included into final `w2ui.css` file.