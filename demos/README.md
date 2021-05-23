# Demos

This folder has demo files that can run as standalone app in here, as well as website demos.

## Uploading Demos

To deploy demos to w2ui.com from `w2ui-website` repository run

```
gulp deploy
```

To just copy demos from `w2ui` main repository run
```
gulp copy
```

It will
- copy denos `../w2ui/demos` into here
- rename `index-side.html` -> `index.html`