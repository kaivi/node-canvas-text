const measureText = (text, font, fontSize, method = 'box') => {
  let ascent = 0,
    descent = 0,
    width = 0,
    scale = (1 / font.unitsPerEm) * fontSize,
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
    height:
      method == 'box'
        ? Math.abs(ascent) * scale + Math.abs(descent) * scale
        : Math.abs(ascent) * scale,
    actualBoundingBoxAscent: ascent * scale,
    actualBoundingBoxDescent: descent * scale,
    fontBoundingBoxAscent: font.ascender * scale,
    fontBoundingBoxDescent: font.descender * scale
  };
};

const padRectangle = (rectangle, padding) => {
  return {
    x: rectangle.x - padding,
    y: rectangle.y - padding,
    width: rectangle.width + padding * 2,
    height: rectangle.height + padding * 2
  };
};

exports.drawText = (ctx, text, fontObject, _rectangle = {}, _options = {}) => {
  let paddedRect = {
    ...{
      x: 0,
      y: 0,
      width: 100,
      height: 100
    },
    ..._rectangle
  };

  let options = {
    ...{
      minSize: 10,
      maxSize: 200,
      granularity: 1,
      hAlign: 'left',
      vAlign: 'bottom',
      fitMethod: 'box',
      textFillStyle: '#000',
      rectFillStyle: 'transparent',
      rectFillOnlyText: false,
      textPadding: 0,
      fillPadding: 0,
      drawRect: false
    },
    ..._options
  };

  if (typeof text != 'string') throw 'Missing string parameter';
  if (typeof fontObject != 'object') throw 'Missing fontObject parameter';
  if (typeof ctx != 'object') throw 'Missing ctx parameter';
  if (options.minSize > options.maxSize)
    throw 'Min font size can not be larger than max font size';

  let originalRect = paddedRect;
  paddedRect = padRectangle(paddedRect, options.textPadding);

  ctx.save();

  let fontSize = options.maxSize;
  let textMetrics = measureText(text, fontObject, fontSize, options.fitMethod);
  let textWidth = textMetrics.width;
  let textHeight = textMetrics.height;

  while (
    (textWidth > paddedRect.width || textHeight > paddedRect.height) &&
    fontSize >= options.minSize
  ) {
    fontSize = fontSize - options.granularity;
    textMetrics = measureText(text, fontObject, fontSize, options.fitMethod);
    textWidth = textMetrics.width;
    textHeight = textMetrics.height;
  }

  // Calculate text coordinates based on options
  let xPos = paddedRect.x;
  let yPos =
    options.fitMethod == 'box'
      ? paddedRect.y +
        paddedRect.height -
        Math.abs(textMetrics.actualBoundingBoxDescent)
      : paddedRect.y + paddedRect.height;

  switch (options.hAlign) {
    case 'right':
      xPos = xPos + paddedRect.width - textWidth;
      break;
    case 'center':
    case 'middle':
      xPos = xPos + paddedRect.width / 2 - textWidth / 2;
      break;
    case 'left':
      break;
    default:
      throw 'Invalid options.hAlign parameter: ' + options.hAlign;
      break;
  }

  switch (options.vAlign) {
    case 'top':
      yPos = yPos - paddedRect.height + textHeight;
      break;
    case 'center':
    case 'middle':
      yPos = yPos + textHeight / 2 - paddedRect.height / 2;
      break;
    case 'bottom':
    case 'baseline':
      break;
    default:
      throw 'Invalid options.vAlign parameter: ' + options.vAlign;
      break;
  }

  ctx.fillStyle = 'transparent';

  // Draw fill rectangle if needed
  if (options.rectFillStyle != 'transparent') {
    let fillRect = options.rectFillOnlyText
      ? {
          x: xPos,
          y: yPos - textHeight,
          width: textWidth,
          height: textHeight
        }
      : originalRect;

    fillRect = padRectangle(fillRect, options.fillPadding);

    ctx.fillStyle = options.rectFillStyle;
    ctx.fillRect(fillRect.x, fillRect.y, fillRect.width, fillRect.height);
    ctx.fillStyle = 'transparent';
  }

  // Draw text
  let fontPath = fontObject.getPath(text, xPos, yPos, fontSize);
  fontPath.fill = options.textFillStyle;
  fontPath.draw(ctx);

  // Draw bounding rectangle
  if (options.drawRect) {
    // TODO: Figure out how to not stroke the text itself, just the rectangle
    ctx.save();
    ctx.strokeStyle = 'red';
    ctx.rect(paddedRect.x, paddedRect.y, paddedRect.width, paddedRect.height);
    ctx.stroke();
    ctx.strokeStyle = 'transparent';
    ctx.restore();
  }

  ctx.restore();
};
