# Demos

This folder has demo files that can run as standalone app in here, as well as website demos.

## Uploading Demos (w2ui-website repo)

To deploy demos (and docs) to w2ui.com, switch to `w2ui-website` repository and run

```
gulp deploy
```

To just copy demos and docs run
```
gulp copy
```

It will
- copy denos `../w2ui/demos`
- rename `index-side.html` -> `index.html`
- copy docs `../w2ui/docs`
- prepare docs for website