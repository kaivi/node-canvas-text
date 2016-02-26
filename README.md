# node-canvas-text

Draws your string on a _canvas_, fit inside of a rectangle. I had to make this, because _measureText()_ from node-canvas is unpredictable, and ignores font selectors besides font-size and font-family.

## Requirements:
* [node-canvas](https://github.com/Automattic/node-canvas) to draw onto
* [opentype.js](https://github.com/nodebox/opentype.js/blob/master/README.md) to load OpenType fonts

## Installation

```npm install node-canvas-text canvas opentype.js --save```

## Parameters

This module exports a single function with signature:

1. context from node-canvas
2. a string to draw
3. font object
4. bounding rectangle ```{ x, y, width, height }```
5. options ```{ minSize, maxSize, granularity, hAlign, vAlign, fitMethod, drawRect }```

### Options

* **minSize**: minimum font size
* **maxSize**: maximum font size
* **granularity**: a step, in which to scale font size
* **hAlign**: horizontal text alignment ```'left' | 'center' | 'right'```
* **vAlign**: vertical text alignment ```'top' | 'center' | 'bottom'```
* **fitMethod**: ```'baseline' | 'box'```
* **drawRect**: draw the bounding rectangle

### Fit method: box vs baseline

![fitMethod: box](http://i.imgur.com/wuLdnPs.jpg)
![fitMethod: baseline](http://i.imgur.com/oxJQvYZ.jpg)

## Example
```javascript
import drawText from 'node-canvas-text'
import opentype from 'opentype.js'
import Canvas from 'canvas'

let canvas = new Canvas(imgWidth, imgHeight);
let ctx = canvas.getContext('2d');

// Load OpenType fonts from files
let titleFont = opentype.loadSync(__dirname + '/fonts/PTN57F.ttf');
let priceFont = opentype.loadSync(__dirname + '/fonts/PTC75F.ttf');
let barcodeFont = opentype.loadSync(__dirname + '/fonts/code128.ttf');

// Strings to draw
let titleString = "A string, but not too long",
    priceString = "200",
    barcodeString = "54490000052117";

// Calculate bounding rectangles
let titleHeight = canvas.height / 3.5;
let headerRect = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: titleHeight };

let priceRect = {
    x: canvas.width / 2,
    y: headerRect.height,
    width: canvas.width / 2,
    height: canvas.height - headerRect.height };

let barcodeRect = {
    x: 0,
    y: headerRect.height + priceRect.height / 2,
    width: canvas.width - priceRect.width,
    height: priceRect.height / 2
};

// Do drawing

let drawRect = true;

drawText(ctx, titleString, titleFont, headerRect,
    {
        minSize: 5,
        maxSize: 100,
        vAlign: 'bottom',
        hAlign: 'left',
        fitMethod: 'box',
        drawRect: drawRect} );

drawText(ctx, priceString, priceFont, priceRect,
    {
        minSize: 5,
        maxSize: 200,
        hAlign: 'right',
        vAlign: 'bottom',
        fitMethod: 'box',
        drawRect: drawRect } );

drawText(ctx, barcodeString, barcodeFont, barcodeRect,
    {
        minSize: 5,
        maxSize: 200,
        hAlign: 'center',
        vAlign: 'center',
        fitMethod: 'box',
        drawRect: drawRect });
```
