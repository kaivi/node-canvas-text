'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var measureText = function measureText(text, font, fontSize) {
    var method = arguments.length <= 3 || arguments[3] === undefined ? 'box' : arguments[3];

    var ascent = 0,
        descent = 0,
        width = 0,
        scale = 1 / font.unitsPerEm * fontSize,
        glyphs = font.stringToGlyphs(text);

    for (var i = 0; i < glyphs.length; i++) {
        var glyph = glyphs[i];
        if (glyph.advanceWidth) {
            width += glyph.advanceWidth * scale;
        }
        if (i < glyphs.length - 1) {
            var kerningValue = font.getKerningValue(glyph, glyphs[i + 1]);
            width += kerningValue * scale;
        }

        var _glyph$getMetrics = glyph.getMetrics();

        var yMin = _glyph$getMetrics.yMin;
        var yMax = _glyph$getMetrics.yMax;


        ascent = Math.max(ascent, yMax);
        descent = Math.min(descent, yMin);
    }

    return {
        width: width,
        height: method == 'box' ? Math.abs(ascent) * scale + Math.abs(descent) * scale : Math.abs(ascent) * scale,
        actualBoundingBoxAscent: ascent * scale,
        actualBoundingBoxDescent: descent * scale,
        fontBoundingBoxAscent: font.ascender * scale,
        fontBoundingBoxDescent: font.descender * scale
    };
};

exports.default = function (ctx, text, fontObject) {
    var _rectangle = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

    var _options = arguments.length <= 4 || arguments[4] === undefined ? {} : arguments[4];

    var rectangle = _extends({
        x: 0,
        y: 0,
        width: 100,
        height: 100
    }, _rectangle);

    var options = _extends({
        minSize: 10,
        maxSize: 200,
        fillStyle: '#000',
        granularity: 1,
        hAlign: 'left',
        vAlign: 'bottom',
        fitMethod: 'box',
        drawRect: false
    }, _options);

    if (typeof text != 'string') throw 'Missing string parameter';
    if ((typeof fontObject === 'undefined' ? 'undefined' : _typeof(fontObject)) != 'object') throw 'Missing fontObject parameter';
    if ((typeof ctx === 'undefined' ? 'undefined' : _typeof(ctx)) != 'object') throw 'Missing ctx parameter';
    if (options.minSize > options.maxSize) throw 'Min font size can not be larger than max font size';

    ctx.save();

    var fontSize = options.maxSize;
    var textMetrics = measureText(text, fontObject, fontSize, options.fitMethod);
    var textWidth = textMetrics.width;
    var textHeight = textMetrics.height;

    while ((textWidth > rectangle.width || textHeight > rectangle.height) && fontSize >= options.minSize) {
        fontSize = fontSize - options.granularity;
        textMetrics = measureText(text, fontObject, fontSize, options.fitMethod);
        textWidth = textMetrics.width;
        textHeight = textMetrics.height;
    }

    // Calculate text coordinates based on options
    var xPos = rectangle.x;
    var yPos = options.fitMethod == 'box' ? rectangle.y + rectangle.height - Math.abs(textMetrics.actualBoundingBoxDescent) : rectangle.y + rectangle.height;

    switch (options.hAlign) {
        case 'right':
            xPos = xPos + rectangle.width - textWidth;
            break;
        case 'center':case 'middle':
            xPos = xPos + rectangle.width / 2 - textWidth / 2;
            break;
        case 'left':
            break;
        default:
            throw "Invalid options.hAlign parameter: " + options.hAlign;
            break;
    }

    switch (options.vAlign) {
        case 'top':
            yPos = yPos - rectangle.height + textHeight;
            break;
        case 'center':case 'middle':
            yPos = yPos + textHeight / 2 - rectangle.height / 2;
            break;
        case 'bottom':case 'baseline':
            break;
        default:
            throw "Invalid options.vAlign parameter: " + options.vAlign;
            break;

    }

    // Draw text
    fontObject.draw(ctx, text, xPos, yPos, fontSize);

    // Draw bounding rectangle
    if (options.drawRect) {
        // TODO: Figure out how to not stroke the text itself, just the rectangle
        ctx.strokeStyle = 'red';
        ctx.rect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
        ctx.stroke();
    }

    ctx.restore();
};
