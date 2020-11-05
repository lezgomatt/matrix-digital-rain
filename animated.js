const width = window.innerWidth;
const height = window.innerHeight;

const fontSize = 10; // px
const font = `900 ${fontSize}px "M+ 2p"`;

const numRows = Math.ceil(height / fontSize);
const numCols = Math.ceil(width / fontSize);
const minColLen = 8;

const rowPerSec = fontSize / 1000;
const minVel = 4 * rowPerSec;
const maxVel = 16 * rowPerSec;

let lastDraw = null;

let mainCanvas = makeCanvas();
let textMaskCanvas = makeCanvas();
document.body.appendChild(mainCanvas);


let columns = [];
for (let c = 0; c < numCols; c++) {
  columns.push(genCol());
}

document.fonts.load(font, 'あ').then(() => {
  drawTextMask(textMaskCanvas);

  lastDraw = Date.now();
  window.requestAnimationFrame(drawFrame);
});

function makeCanvas() {
  let canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  return canvas;
}

function drawFrame() {
  let now = Date.now();
  let dt = now - lastDraw;
  lastDraw = now;

  updateCols(dt);
  drawGradients();

  let ctx = mainCanvas.getContext('2d');
  ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(textMaskCanvas, 0, 0);

  window.requestAnimationFrame(drawFrame);
}

function updateCols(dt) {
  for (let c = 0; c < columns.length; c++) {
    let col = columns[c];
    col.pos += col.vel * dt;

    if (calcRow(col.pos) - col.len > numRows) {
      columns[c] = genCol();
    }
  }
}

function drawGradients() {
  let ctx = mainCanvas.getContext('2d');
  ctx.globalCompositeOperation = 'source-over';
  ctx.clearRect(0, 0, width, height);

  for (let c = 0; c < numCols; c++) {
    let col = columns[c];
    let x = c * fontSize;
    let y = calcRow(col.pos) * fontSize;
    let w = fontSize;
    let h = col.len * fontSize;

    let gradient = ctx.createLinearGradient(0, y, 0, y + h);
    gradient.addColorStop(0.0, 'rgba(40, 160, 70, 0)');
    gradient.addColorStop(0.65,'rgba(40, 160, 70, 1.0)');
    gradient.addColorStop(0.85, 'rgba(40, 160, 70, 1.0)');
    gradient.addColorStop(1.0, 'rgba(110, 240, 140, 1.0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, w, h);
  }
}

function calcRow(y) {
  return Math.floor(y / fontSize);
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

function genCol() {
  return {
    len: randInt(minColLen, numRows - minColLen * 2),
    pos: -height * 2 + randInt(-minColLen, numRows - minColLen / 2) * fontSize,
    vel: minVel + Math.random() * (maxVel - minVel),
  };
}

function randElem(collection) {
  let i = randInt(0, collection.length - 1);

  return collection[i];
}

function randInt(min, max) {
  let span = max - min + 1;

  return min + Math.floor(Math.random() * span);
}