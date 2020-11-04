const width = window.innerWidth;
const height = window.innerHeight;
const fontSize = 10; // px

const numRows = Math.ceil(height / fontSize);
const numCols = Math.ceil(width / fontSize);
const font = `900 ${fontSize}px "M+ 2p"`;

let mainCanvas = makeCanvas();
let textMaskCanvas = makeCanvas();
document.body.appendChild(mainCanvas);

document.fonts.load(font, 'あ').then(() => {
  drawTextMask(textMaskCanvas);

  let ctx = mainCanvas.getContext('2d');

  for (let c = 0; c < numCols; c++) {
    const minLen = 8;
    let r = randInt(-minLen, numRows - minLen / 2);
    let len = randInt(minLen, numRows - minLen * 2);

    let x = c * fontSize;
    let y = r * fontSize;
    let w = fontSize;
    let h = len * fontSize;

    let gradient = ctx.createLinearGradient(0, y, 0, y + h);
    gradient.addColorStop(0.0, 'rgba(40, 160, 70, 0)');
    gradient.addColorStop(0.85, 'rgba(40, 160, 70, 1.0)');
    gradient.addColorStop(1.0, 'rgba(110, 240, 140, 1.0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, w, h);
  }

  ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(textMaskCanvas, 0, 0);
});

function makeCanvas() {
  let canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  return canvas;
}

function drawTextMask(canvas) {
  let ctx = canvas.getContext('2d');
  ctx.font = font;

  for (let r = 0; r < numRows; r++) {
    let text = genText(numCols);
    let y = fontSize * (r + 1);
    ctx.fillText(text, 0, y);
  }

  return canvas;
}

function genText(length) {
  const chars = 'あいうえおかきくけこさしすせそたちつてとなにぬね'
    + 'のはひふへほまみむめもやゆよらりるれろわゐゑをん'
    + 'アイウエオカキクケコサシスセソタチツテトナニヌネ'
    + 'ノハヒフヘホマミムメモヤユヨラリルレロワヰヱヲン';

  let text = '';

  for (let i = 0; i < length; i++) {
    text += randElem(chars);
  }

  return text;
}

function randElem(collection) {
  let i = randInt(0, collection.length - 1);

  return collection[i];
}

function randInt(min, max) {
  let span = max - min + 1;

  return min + Math.floor(Math.random() * span);
}
