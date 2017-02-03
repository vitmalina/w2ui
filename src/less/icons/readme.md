== Icons ==

Icons are used in the grid. They are generated from svn files in src/less/icons/svg/* directory. To regenerated do the following

```
grunt webfont
```

After font and css classes are created  from

```
src/less/icons/icon-font.css
```

into

```
src/less/src/icons.less
```

Then,
- rename font to w2ui-font
- prepend icons with w2ui-