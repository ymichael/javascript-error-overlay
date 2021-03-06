# javascript-error-overlay

A generic overlay that displays JavaScript errors on the page - heavily adapted/forked from [facebook/create-react-app](https://github.com/facebook/create-react-app)'s [react-error-overlay](https://github.com/facebook/create-react-app/tree/next/packages/react-error-overlay).

## Usage

1. Build the overlay: `npm run build`

2. Include the script (`lib/index.js`) in your app and start listening for errors!

```
var errorOverlay = require('javascript-error-overlay');
errorOverlay.startReportingRuntimeErrors();
```
### Configuration Options

```
errorOverlay.startReportingRuntimeErrors({
    shouldIgnoreError: function(e) {
        ...
    }
});
```

## Development

When developing within this package, make sure you run `npm start` (or `yarn start`) so that the files are compiled as you work.
This is ran in watch mode by default.

If you would like to build this for production, run `npm run build:prod` (or `yarn build:prod`).<br>
If you would like to build this one-off for development, you can run `NODE_ENV=development npm run build` (or `NODE_ENV=development yarn build`).
