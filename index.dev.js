var measureText = (text, font, fontSize, method = 'box') => {
    let ascent = 0,
        descent = 0,
        width = 0,
        scale = 1 / font.unitsPerEm * fontSize,
        glyphs = font.stringToGlyphs(text);

    for (var i = 0; i < glyphs.length; i++) {
        let glyph = glyphs[i];
        if (glyph.advanceWidth) {
            width += glyph.advanceWidth * scale;
        }
        if (i < glyphs.length - 1) {
            let kerningValue = font.getKerningValue(glyph, glyphs[i + 1]);
            width += kerningValue * scale;
        }

        let { yMin, yMax } = glyph.getMetrics();

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

export default (ctx, text, fontObject, _rectangle = {}, _options = {}) => {

    let rectangle = {
        ...{
            x: 0,
            y: 0,
            width: 100,
            height: 100
        }, ..._rectangle };

    let options = {
        ...{
            minSize: 10,
            maxSize: 200,
            granularity: 1,
            hAlign: 'left',
            vAlign: 'bottom',
            fitMethod: 'box',
            drawRect: false
        }, ..._options };

    if (typeof text != 'string') throw 'Missing string parameter';
    if (typeof fontObject != 'object') throw 'Missing fontObject parameter';
    if (typeof ctx != 'object') throw 'Missing ctx parameter';
    if (options.minSize > options.maxSize) throw 'Min font size can not be larger than max font size';

    ctx.save();

    let fontSize = options.maxSize;
    let textMetrics = measureText(text, fontObject, fontSize, options.fitMethod);
    let textWidth = textMetrics.width;
    let textHeight = textMetrics.height;

    while((textWidth > rectangle.width || textHeight > rectangle.height) && fontSize >= options.minSize) {
        fontSize = fontSize - options.granularity;
        textMetrics = measureText(text, fontObject, fontSize, options.fitMethod);
        textWidth = textMetrics.width;
        textHeight = textMetrics.height;
    }

    // Calculate text coordinates based on options
    let xPos = rectangle.x;
    let yPos = options.fitMethod == 'box'
        ? rectangle.y + rectangle.height - Math.abs(textMetrics.actualBoundingBoxDescent)
        : rectangle.y + rectangle.height;

    switch(options.hAlign) {
        case 'right':
            xPos = xPos + rectangle.width - textWidth;
            break;
        case 'center': case 'middle':
            xPos = xPos + (rectangle.width / 2) - (textWidth / 2);
            break;
        case 'left':
            break;
        default:
            throw "Invalid options.hAlign parameter: " + options.hAlign;
            break;
    }

    switch(options.vAlign) {
        case 'top':
            yPos = yPos - rectangle.height + textHeight;
            break;
        case 'center': case 'middle':
            yPos = yPos + textHeight / 2 - rectangle.height / 2;
            break;
        case 'bottom': case 'baseline':
            break;
        default:
            throw "Invalid options.vAlign parameter: " + options.vAlign;
            break;

    }

    // Draw text
    fontObject.draw(ctx, text, xPos, yPos, fontSize);

    // Draw bounding rectangle
    if(options.drawRect) {
        // TODO: Figure out how to not stroke the text itself, just the rectangle
        ctx.strokeStyle = 'red';
        ctx.rect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
        ctx.stroke();
    }

    ctx.restore();
};