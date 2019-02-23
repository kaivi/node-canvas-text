# node-canvas-text

Draws your string on a _canvas_, fit inside of a rectangle. I had to make this, because _measureText()_ from node-canvas is unpredictable, and ignores font selectors besides font-size and font-family.

## Requirements:

- [node-canvas](https://github.com/Automattic/node-canvas) to draw onto
- [opentype.js](https://github.com/nodebox/opentype.js/blob/master/README.md) to load OpenType fonts

## Installation

`npm install node-canvas-text canvas opentype.js --save`

## Parameters

This module exports a single function with signature:

1. context from node-canvas
2. a string to draw
3. font object
4. bounding rectangle `{ x, y, width, height }`
5. options `{ minSize, maxSize, granularity, hAlign, vAlign, fitMethod, drawRect }`

### Options

- **minSize**: minimum font size `float`
- **maxSize**: maximum font size `float`
- **granularity**: a step, in which to scale font size `float`
- **hAlign**: horizontal text alignment `'left' | 'center' | 'right'`
- **vAlign**: vertical text alignment `'top' | 'center' | 'bottom'`
- **fitMethod**: `'baseline' | 'box'`
- **drawRect**: draw the bounding rectangle `'true' | 'false'`
- **textFillStyle**: fill style for text `string`
- **rectFillStyle**: fill style for rectangle `string`
- **rectFillOnlyText**: fill only the exact resulting text rectangle, not the bounding one `'true' | 'false'`
- **textPadding**: text padding `float`
- **fillPadding**: fill padding `float`

#### Defaults

```javascript
{
    minSize: 10,
    maxSize: 200,
    granularity: 1,
    hAlign: 'left',
    vAlign: 'bottom',
    fitMethod: 'box',
    textFillStyle: '#000',
    rectFillStyle: '#fff',
    rectFillOnlyText: false,
    textPadding: 0,
    fillPadding: 0,
    drawRect: false
}
```

### Fit method: box vs baseline

![fitMethod: box](http://i.imgur.com/wuLdnPs.jpg)
![fitMethod: baseline](http://i.imgur.com/oxJQvYZ.jpg)

## Example

```javascript
const canvasText = require('node-canvas-text');
const opentype = require('opentype.js');
const Canvas = require('canvas');

let canvas = new Canvas.canvas(imgWidth, imgHeight);
let ctx = canvas.getContext('2d');

// Load OpenType fonts from files
let titleFont = opentype.loadSync(__dirname + '/fonts/PTN57F.ttf');
let priceFont = opentype.loadSync(__dirname + '/fonts/PTC75F.ttf');
let barcodeFont = opentype.loadSync(__dirname + '/fonts/code128.ttf');

// Strings to draw
let titleString = 'A string, but not too long',
  priceString = '200',
  barcodeString = '54490000052117';

// Calculate bounding rectangles
let headerRect = {
  x: 0,
  y: 0,
  width: canvas.width,
  height: canvas.height / 3.5
};

let priceRect = {
  x: canvas.width / 2,
  y: headerRect.height,
  width: canvas.width / 2,
  height: canvas.height - headerRect.height
};

let barcodeRect = {
  x: 0,
  y: headerRect.height + priceRect.height / 2,
  width: canvas.width - priceRect.width,
  height: priceRect.height / 2
};

// Draw
let drawRect = true;

canvasText.drawText(ctx, titleString, titleFont, headerRect, {
  minSize: 5,
  maxSize: 100,
  vAlign: 'bottom',
  hAlign: 'left',
  fitMethod: 'box',
  drawRect: drawRect
});

canvasText.drawText(ctx, priceString, priceFont, priceRect, {
  minSize: 5,
  maxSize: 200,
  hAlign: 'right',
  vAlign: 'bottom',
  fitMethod: 'box',
  drawRect: drawRect
});

canvasText.drawText(ctx, barcodeString, barcodeFont, barcodeRect, {
  minSize: 5,
  maxSize: 200,
  hAlign: 'center',
  vAlign: 'center',
  fitMethod: 'box',
  drawRect: drawRect
});
```
