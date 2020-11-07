const flags = new URLSearchParams(location.search);
const showFps = flags.has('fps');
const isAnimated = showFps || flags.has('animated');

let stats = null;
if (showFps) {
  let s = document.createElement('script');
  s.src = 'https://mrdoob.github.io/stats.js/build/stats.min.js';
  s.onload = () => {
    stats = new Stats();
    document.body.appendChild(stats.dom);
  };

  document.head.appendChild(s);
}

const width = window.innerWidth;
const height = window.innerHeight;
const scale = window.devicePixelRatio;

const fontSize = parseFontSize(flags.get('size'), 10); // px
const font = `900 ${fontSize}px "M+ 2p"`;

const numRows = Math.ceil(height / fontSize);
const numCols = Math.ceil(width / fontSize);
const minColLen = 8;

const rowPerSec = fontSize / 1000;
const minVel = 8 * rowPerSec;
const maxVel = 20 * rowPerSec;

let lastDraw = null;

let mainCanvas = makeCanvas();
let textMaskCanvas = makeCanvas();
document.body.appendChild(mainCanvas);


let columns = [];
for (let c = 0; c < numCols; c++) {
  columns.push(genCol(!isAnimated));
}

document.fonts.load(font, 'あ').then(() => {
  drawTextMask(textMaskCanvas);

  lastDraw = Date.now();
  drawFrame(isAnimated);
});

function makeCanvas() {
  let canvas = document.createElement('canvas');
  canvas.width = Math.floor(width * scale);
  canvas.height = Math.floor(height * scale);

  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';

  canvas.getContext('2d').scale(scale, scale);

  return canvas;
}

function drawFrame(loop = true) {
  let now = Date.now();
  let dt = now - lastDraw;
  lastDraw = now;

  updateCols(dt);
  drawGradients();

  let ctx = mainCanvas.getContext('2d');
  ctx.save();
  ctx.resetTransform();
  ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(textMaskCanvas, 0, 0);
  ctx.restore();

  if (loop) {
    if (stats != null) {
      stats.update();
    }

    window.requestAnimationFrame(drawFrame);
  }
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
  ctx.clearRect(0, 0, width, height);

  for (let c = 0; c < numCols; c++) {
    let col = columns[c];
    let x = c * fontSize;
    let y = calcRow(col.pos) * fontSize;
    let w = fontSize;
    let h = col.len * fontSize;

    let gradient = ctx.createLinearGradient(0, y, 0, y + h);
    gradient.addColorStop(0.0, 'rgba(40, 160, 70, 0)');
    gradient.addColorStop(0.65, 'rgba(40, 160, 70, 1.0)');
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

function genCol(onScreen = false) {
  let len = randInt(minColLen, numRows - minColLen * 2);
  let rowPos = onScreen
    ? randInt(-minColLen, numRows - minColLen / 2)
    : randInt(-numRows / 4, 0) - len;
  let pos = rowPos * fontSize;
  let vel = minVel + Math.random() * (maxVel - minVel);

  return { len, pos, vel };
}

function randElem(collection) {
  let i = randInt(0, collection.length - 1);

  return collection[i];
}

function randInt(min, max) {
  let span = max - min + 1;

  return min + Math.floor(Math.random() * span);
}

function parseFontSize(str, fallback) {
  let n = parseInt(str);

  return Number.isInteger(n) && n > 0 ? n : fallback;
}
