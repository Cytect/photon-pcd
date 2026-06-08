/* PHOTON — Export Modal (B1–B7) */
import { x } from '../icons/icons.js';
import { getState, setState } from '../utils/state.js';
import { getCanvasBase64, saveImage, getCurrentFileName } from '../services/ImageEngine.js';

// ── Compression Methods Data (B3/B6) ──────────────────────
const METHODS = [
  {
    id: 'quantization',
    name: 'Quantization',
    type: 'lossy',
    desc: 'Reduces precision of pixel values by mapping ranges to single representative values. This is the core of JPEG compression — the quality slider directly controls the quantization table, trading visual fidelity for smaller file size.',
    best: 'Best for photographs with gradual tonal changes.',
  },
  {
    id: 'huffman',
    name: 'Huffman Coding',
    type: 'lossless',
    desc: 'A variable-length coding algorithm that assigns shorter binary codes to more frequently occurring pixel values. Builds a binary tree based on symbol frequency, ensuring optimal prefix-free encoding.',
    best: 'Best as a final encoding step after quantization (used in JPEG).',
  },
  {
    id: 'arithmetic',
    name: 'Arithmetic Coding',
    type: 'lossless',
    desc: 'Encodes an entire message as a single fractional number between 0 and 1. Achieves higher compression ratios than Huffman because it can represent fractional bit lengths per symbol.',
    best: 'Best for data with skewed probability distributions.',
  },
  {
    id: 'lzw',
    name: 'LZW (Lempel-Ziv-Welch)',
    type: 'lossless',
    desc: 'A dictionary-based algorithm that builds a table of recurring byte patterns during encoding. Each new pattern is assigned a code. Widely used in GIF and TIFF formats.',
    best: 'Best for images with repeating patterns or limited color palettes.',
  },
  {
    id: 'rle',
    name: 'RLE (Run-Length Encoding)',
    type: 'lossless',
    desc: 'Replaces consecutive runs of identical pixel values with a single value and a count. For example, "AAABBB" becomes "3A3B". Simple but effective for images with large uniform regions.',
    best: 'Best for binary images, diagrams, and icons with solid areas.',
  },
];

// ── Format configs ────────────────────────────────────────
const FORMATS = [
  { id: 'jpeg', name: 'JPEG', ext: '.jpg', mime: 'image/jpeg', hasQuality: true },
  { id: 'png',  name: 'PNG',  ext: '.png', mime: 'image/png',  hasQuality: false },
  { id: 'bmp',  name: 'BMP',  ext: '.bmp', mime: 'image/bmp',  hasQuality: false },
];

// ── Simulated file sizes ──────────────────────────────────
function estimateSize(w, h, format, quality) {
  const raw = w * h * 3; // RGB bytes
  if (format === 'jpeg') return Math.round(raw * (quality / 100) * 0.08);
  if (format === 'png')  return Math.round(raw * 0.35);
  return raw; // BMP = uncompressed
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

// ── Build HTML ────────────────────────────────────────────
function buildHTML(projectName) {
  const filename = 'untitled';

  const formatBtns = FORMATS.map((f, i) => `
    <button class="ex-format-btn${i === 0 ? ' active' : ''}" data-format="${f.id}">
      <span class="ex-format-name">${f.name}</span>
      <span class="ex-format-ext">${f.ext}</span>
    </button>`).join('');

  const methodOpts = METHODS.map((m, i) => `
    <option value="${m.id}"${i === 0 ? ' selected' : ''}>${m.name}</option>`).join('');

  const m = METHODS[0];

  return `
    <div class="modal-header">
      <span class="modal-title">Export Image</span>
      <button class="modal-close" id="ex-close">${x()}</button>
    </div>

    <div class="export-layout">
      <!-- Left: Controls -->
      <div class="export-left">
        <div class="ex-section">
          <label class="ex-section-label">Format</label>
          <div class="ex-formats" id="ex-formats">${formatBtns}</div>
        </div>

        <div class="ex-section" id="ex-quality-section">
          <label class="ex-section-label">Quality</label>
          <div class="ex-quality-row">
            <input type="range" class="ex-quality-slider" id="ex-quality" min="1" max="100" value="75" />
            <span class="ex-quality-value" id="ex-quality-val">75%</span>
          </div>
          <div class="ex-quality-labels">
            <span>Low (small file)</span>
            <span>High (large file)</span>
          </div>
        </div>

        <div class="ex-section" id="ex-method-section">
          <label class="ex-section-label">Compression Method</label>
          <select class="ex-method-select" id="ex-method">${methodOpts}</select>
          <div class="ex-method-info" id="ex-method-info">
            <div class="ex-method-header">
              <span class="ex-method-name" id="ex-mi-name">${m.name}</span>
              <span class="ex-method-badge ${m.type}" id="ex-mi-badge">${m.type}</span>
            </div>
            <p class="ex-method-desc" id="ex-mi-desc">${m.desc}</p>
            <p class="ex-method-best" id="ex-mi-best">${m.best}</p>
          </div>
        </div>

        <div class="ex-section">
          <label class="ex-section-label">Filename</label>
          <input type="text" class="ex-filename-input" id="ex-filename" value="${filename}" />
          <div class="ex-output-line" id="ex-output">${filename}.jpg</div>
        </div>
      </div>

      <!-- Right: Preview -->
      <div class="export-right">
        <div class="ex-preview-box" id="ex-preview">
          <canvas id="ex-preview-canvas" width="280" height="175"></canvas>
        </div>
        <div class="ex-stats" id="ex-stats">
          <div class="ex-stat">
            <div class="ex-stat-label">Estimated Size</div>
            <div class="ex-stat-value" id="ex-stat-size">245 KB</div>
          </div>
          <div class="ex-stat">
            <div class="ex-stat-label">Compression</div>
            <div class="ex-stat-value" id="ex-stat-ratio">8.2:1</div>
          </div>
          <div class="ex-stat">
            <div class="ex-stat-label">Original</div>
            <div class="ex-stat-value" id="ex-stat-original">6.2 MB</div>
          </div>
          <div class="ex-stat">
            <div class="ex-stat-label">Savings</div>
            <div class="ex-stat-value" id="ex-stat-savings">87.8%</div>
          </div>
        </div>
      </div>
    </div>

    <div class="ex-footer">
      <button class="ex-btn-cancel" id="ex-cancel">Cancel</button>
      <button class="ex-btn-export" id="ex-export">Export Image</button>
    </div>
  `;
}

// ── Draw real image preview ───────────────────────────────
function drawPreview(canvas) {
  const b64 = getCanvasBase64();
  if (!b64) {
    // No image loaded — draw placeholder gradient
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#4C8BF5');
    grad.addColorStop(0.5, '#7C5BF0');
    grad.addColorStop(1, '#F5576C');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    return;
  }
  const ctx = canvas.getContext('2d');
  const img = new Image();
  img.onload = () => {
    const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    const dx = (canvas.width - dw) / 2;
    const dy = (canvas.height - dh) / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, dx, dy, dw, dh);
  };
  img.src = b64;
}

// ── Open the modal ────────────────────────────────────────
export function openExportModal() {
  const root = document.getElementById('modal-root');
  const state = getState();
  const projectName = getCurrentFileName()?.replace(/\.[^.]+$/, '') || state.newProjectSettings?.name || 'Untitled';
  const imgInfo = state.imageInfo || {};
  const imgW = imgInfo.width || state.newProjectSettings?.width || 1920;
  const imgH = imgInfo.height || state.newProjectSettings?.height || 1080;

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop export-modal';
  const dialog = document.createElement('div');
  dialog.className = 'modal-dialog';
  dialog.innerHTML = buildHTML(projectName);
  backdrop.appendChild(dialog);
  root.appendChild(backdrop);

  // ── Refs ──────────────────────────────────────────────
  const qualitySlider    = dialog.querySelector('#ex-quality');
  const qualityVal       = dialog.querySelector('#ex-quality-val');
  const qualitySection   = dialog.querySelector('#ex-quality-section');
  const methodSection    = dialog.querySelector('#ex-method-section');
  const methodSelect     = dialog.querySelector('#ex-method');
  const filenameInput    = dialog.querySelector('#ex-filename');
  const outputLine       = dialog.querySelector('#ex-output');
  const previewCanvas    = dialog.querySelector('#ex-preview-canvas');

  let currentFormat = 'jpeg';
  let currentQuality = 75;

  drawPreview(previewCanvas);
  updateStats();

  // ── Close ─────────────────────────────────────────────
  function close() {
    backdrop.classList.add('closing');
    setTimeout(() => backdrop.remove(), 200);
  }

  dialog.querySelector('#ex-close').addEventListener('click', close);
  dialog.querySelector('#ex-cancel').addEventListener('click', close);
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
  document.addEventListener('keydown', function esc(e) {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
  });

  // ── Format selection (B2) ─────────────────────────────
  dialog.querySelectorAll('.ex-format-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      dialog.querySelectorAll('.ex-format-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFormat = btn.dataset.format;
      const fmt = FORMATS.find(f => f.id === currentFormat);

      // Show/hide quality
      qualitySection.classList.toggle('ex-hidden', !fmt.hasQuality);

      // Show/hide method section (BMP = hide)
      methodSection.classList.toggle('ex-hidden', currentFormat === 'bmp');

      // If PNG, lock method to LZW
      if (currentFormat === 'png') {
        methodSelect.value = 'lzw';
        updateMethodInfo('lzw');
      }

      // Update output filename
      outputLine.textContent = filenameInput.value + fmt.ext;
      updateStats();
    });
  });

  // ── Quality slider (B3) ───────────────────────────────
  qualitySlider.addEventListener('input', () => {
    currentQuality = parseInt(qualitySlider.value);
    qualityVal.textContent = currentQuality + '%';
    updateStats();
  });

  // ── Method selector (B3/B6) ───────────────────────────
  methodSelect.addEventListener('change', () => {
    updateMethodInfo(methodSelect.value);
  });

  function updateMethodInfo(methodId) {
    const m = METHODS.find(me => me.id === methodId);
    if (!m) return;
    dialog.querySelector('#ex-mi-name').textContent = m.name;
    const badge = dialog.querySelector('#ex-mi-badge');
    badge.textContent = m.type;
    badge.className = `ex-method-badge ${m.type}`;
    dialog.querySelector('#ex-mi-desc').textContent = m.desc;
    dialog.querySelector('#ex-mi-best').textContent = m.best;
  }

  // ── Filename (B4) ─────────────────────────────────────
  filenameInput.addEventListener('input', () => {
    const fmt = FORMATS.find(f => f.id === currentFormat);
    outputLine.textContent = filenameInput.value + fmt.ext;
  });

  // ── Stats update (B5/B6) ──────────────────────────────
  function updateStats() {
    const raw = imgW * imgH * 3;
    const compressed = estimateSize(imgW, imgH, currentFormat, currentQuality);
    const ratio = (raw / compressed).toFixed(1);
    const savings = ((1 - compressed / raw) * 100).toFixed(1);

    dialog.querySelector('#ex-stat-size').textContent = formatBytes(compressed);
    dialog.querySelector('#ex-stat-ratio').textContent = ratio + ':1';
    dialog.querySelector('#ex-stat-original').textContent = formatBytes(raw);
    dialog.querySelector('#ex-stat-savings').textContent = savings + '%';
  }

  // ── Export action (B7) — uses real canvas data via backend ──
  dialog.querySelector('#ex-export').addEventListener('click', async () => {
    const fmt = FORMATS.find(f => f.id === currentFormat);
    const fname = (filenameInput.value || 'untitled') + fmt.ext;
    const fmtKey = currentFormat === 'jpeg' ? 'jpg' : currentFormat;

    try {
      await saveImage(fmtKey, currentQuality, fname);
      close();
    } catch (err) {
      setState({ statusMessage: `Export failed: ${err.message}` });
    }
  });
}
