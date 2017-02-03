## Deploying Documentation

After you copy these files, add following directories into this one
- docs/details
- docs/overview
- docs/summary

You will need to run (from withing docs directory).
```
node generate.js
```

Before you run, uncomment
```
// var rPath = '/web/docs/1.5/';
```

This will generate summary pages based on current version