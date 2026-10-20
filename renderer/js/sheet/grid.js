// Canvas-drawn spreadsheet grid on top of a HyperFormula workbook.
// Handles drawing, selection, keyboard/mouse editing, fill handle, clipboard and resizing.
import { displayValue, addr, colName, parseAddr } from './engine.js';

const ROW_H = 22;
const HEAD_H = 24;
const DEF_W = 92;
const MIN_ROWS = 300;
const MIN_COLS = 26;
const FONT = '13px system-ui, "Segoe UI", Ubuntu, "Noto Sans", sans-serif';
const HEAD_FONT = '12px system-ui, "Segoe UI", Ubuntu, "Noto Sans", sans-serif';
const INSERTABLE = /[=(;,+\-*/<>&:^]\s*$/;

function css(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export class Grid {
  constructor(host, wb, hooks = {}) {
    this.wb = wb;
    this.hooks = hooks;
    this.sel = { r0: 0, c0: 0, r1: 0, c1: 0 }; // r0/c0 = anchor (active cell)
    this.editing = null; // { r, c, input, original, fromTyping }
    this.copyRange = null;
    this.copyText = null;
    this.dirty = true;

    this.wrap = document.createElement('div');
    this.wrap.className = 'grid-wrap';
    this.scroller = document.createElement('div');
    this.scroller.className = 'grid-scroll';
    this.scroller.tabIndex = 0;
    this.spacer = document.createElement('div');
    this.spacer.className = 'grid-spacer';
    this.scroller.appendChild(this.spacer);
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'grid-canvas';
    this.editor = document.createElement('input');
    this.editor.className = 'grid-editor';
    this.editor.spellcheck = false;
    this.editor.autocomplete = 'off';
    this.editor.hidden = true;
    this.wrap.append(this.scroller, this.canvas, this.editor);
    host.appendChild(this.wrap);
    this.ctx = this.canvas.getContext('2d');

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(this.wrap);
    this.scroller.addEventListener('scroll', () => this.requestDraw());
    this.scroller.addEventListener('mousedown', (e) => this.onMouseDown(e));
    this.scroller.addEventListener('dblclick', (e) => this.onDblClick(e));
    this.scroller.addEventListener('mousemove', (e) => this.onHover(e));
    this.scroller.addEventListener('contextmenu', (e) => this.onContextMenu(e));
    this.scroller.addEventListener('keydown', (e) => this.onKey(e));
    this.scroller.addEventListener('paste', (e) => this.onPaste(e));
    this.scroller.addEventListener('copy', (e) => this.onCopy(e, false));
    this.scroller.addEventListener('cut', (e) => this.onCopy(e, true));
    this.editor.addEventListener('keydown', (e) => this.onEditorKey(e, this.editor));
    this.editor.addEventListener('input', () => this.onEditInput(this.editor));
    this.editor.addEventListener('blur', () => setTimeout(() => this.maybeCommitOnBlur(), 0));
    this.resize();
  }

  destroy() {
    this.ro.disconnect();
    this.wrap.remove();
  }

  // ---- geometry ---------------------------------------------------------------------------

  get hf() {
    return this.wb.hf;
  }
  get sheet() {
    return this.wb.sheet;
  }
  get meta() {
    return this.wb.metaFor(this.sheet);
  }

  colW(c) {
    return this.meta.colW[c] ?? DEF_W;
  }

  dims() {
    const d = this.hf.getSheetDimensions(this.sheet);
    const rows = Math.max(MIN_ROWS, d.height + 100, this.sel.r1 + 50, this.sel.r0 + 50);
    const cols = Math.max(MIN_COLS, d.width + 6, this.sel.c1 + 4);
    return { rows, cols, usedRows: d.height, usedCols: d.width };
  }

  rowHeadW() {
    const d = this.dims();
    return Math.max(44, String(d.rows).length * 8 + 18);
  }

  colX(c) {
    // x of column c's left edge, relative to the start of the cell area (no scroll)
    let x = 0;
    for (let i = 0; i < c; i++) x += this.colW(i);
    return x;
  }

  colAt(x) {
    let acc = 0;
    for (let c = 0; c < 10000; c++) {
      const w = this.colW(c);
      if (x < acc + w) return c;
      acc += w;
    }
    return 0;
  }

  updateSpacer() {
    const d = this.dims();
    this.spacer.style.width = this.rowHeadW() + this.colX(d.cols) + 'px';
    this.spacer.style.height = HEAD_H + d.rows * ROW_H + 'px';
  }

  resize() {
    const w = this.scroller.clientWidth;
    const h = this.scroller.clientHeight;
    const dpr = window.devicePixelRatio || 1;
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.canvas.width = Math.max(1, Math.round(w * dpr));
    this.canvas.height = Math.max(1, Math.round(h * dpr));
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.draw();
  }

  // cell rect in canvas coordinates
  cellRect(r, c) {
    const x = this.rowHeadW() + this.colX(c) - this.scroller.scrollLeft;
    const y = HEAD_H + r * ROW_H - this.scroller.scrollTop;
    return { x, y, w: this.colW(c), h: ROW_H };
  }

  hit(e) {
    const rect = this.scroller.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rh = this.rowHeadW();
    const area = x < rh && y < HEAD_H ? 'corner' : y < HEAD_H ? 'colhead' : x < rh ? 'rowhead' : 'cell';
    const cx = x - rh + this.scroller.scrollLeft;
    const cy = y - HEAD_H + this.scroller.scrollTop;
    const c = this.colAt(Math.max(0, cx));
    const r = Math.max(0, Math.floor(cy / ROW_H));
    let border = -1;
    if (area === 'colhead') {
      const left = this.colX(c);
      if (cx - left < 4 && c > 0) border = c - 1;
      else if (left + this.colW(c) - cx < 4) border = c;
    }
    return { x, y, r, c, area, border, inClient: x < this.scroller.clientWidth && y < this.scroller.clientHeight };
  }

  // ---- drawing -----------------------------------------------------------------------------

  requestDraw() {
    if (this.raf) return;
    this.raf = requestAnimationFrame(() => {
      this.raf = null;
      this.draw();
    });
  }

  draw() {
    const ctx = this.ctx;
    const W = this.scroller.clientWidth;
    const H = this.scroller.clientHeight;
    if (!W || !H) return;
    this.updateSpacer();
    const colors = {
      bg: css('--sheet-bg') || '#fff',
      grid: css('--sheet-grid') || '#e2e2e2',
      text: css('--sheet-text') || '#111',
      head: css('--sheet-head') || '#f3f3f3',
      headText: css('--sheet-head-text') || '#555',
      headSel: css('--sheet-head-sel') || '#d6e4f7',
      accent: css('--accent') || '#2f7ff0',
      selFill: css('--sheet-sel') || 'rgba(47,127,240,0.12)',
      error: css('--danger') || '#d33',
    };
    const rh = this.rowHeadW();
    const sl = this.scroller.scrollLeft;
    const st = this.scroller.scrollTop;
    const r0 = Math.floor(st / ROW_H);
    const r1 = Math.min(this.dims().rows - 1, Math.ceil((st + H - HEAD_H) / ROW_H));
    let c0 = this.colAt(sl);
    let x0 = rh + this.colX(c0) - sl;
    const cols = [];
    for (let c = c0, x = x0; x < W; c++) {
      cols.push({ c, x, w: this.colW(c) });
      x += this.colW(c);
    }

    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, W, H);
    ctx.font = FONT;
    ctx.textBaseline = 'middle';

    // selection background (under the text); the active cell stays clear
    const s = this.norm();
    const q = this.rangeRect(s);
    if (s.r0 !== s.r1 || s.c0 !== s.c1) {
      ctx.fillStyle = colors.selFill;
      ctx.fillRect(q.x, q.y, q.w, q.h);
      const a = this.cellRect(this.sel.r0, this.sel.c0);
      ctx.fillStyle = colors.bg;
      ctx.fillRect(a.x, a.y, a.w, a.h);
    }

    const lang = this.wb.lang;
    const sheet = this.sheet;
    const meta = this.meta;
    const editingCell = this.editing && !this.editing.hiddenEditor ? this.editing : null;

    // cell contents
    for (let r = r0; r <= r1; r++) {
      const y = HEAD_H + r * ROW_H - st;
      // text overflow: remember where a long left-aligned text may spill
      for (let i = 0; i < cols.length; i++) {
        const { c, x, w } = cols[i];
        if (editingCell && editingCell.r === r && editingCell.c === c) continue;
        const a = { sheet, row: r, col: c };
        const v = this.hf.getCellValue(a);
        if (v === null || v === undefined || v === '') continue;
        const type = typeof v === 'number' ? this.hf.getCellValueDetailedType(a) : null;
        const fmt = meta.cellFmt[`${r},${c}`] || meta.colFmt[c];
        const text = displayValue(v, type, fmt, lang);
        const isErr = typeof v === 'object';
        const isNum = typeof v === 'number';
        ctx.fillStyle = isErr ? colors.error : colors.text;
        let tw = ctx.measureText(text).width;
        let clipW = w;
        if (!isNum && !isErr && typeof v !== 'boolean' && tw > w - 6) {
          // spill into empty neighbours on the right
          for (let j = i + 1; j < cols.length && tw > clipW - 6; j++) {
            const nv = this.hf.getCellValue({ sheet, row: r, col: cols[j].c });
            if (nv !== null && nv !== undefined && nv !== '') break;
            clipW += cols[j].w;
          }
        }
        ctx.save();
        ctx.beginPath();
        ctx.rect(x + 1, y, clipW - 2, ROW_H);
        ctx.clip();
        if (isNum) {
          if (tw > w - 6) {
            ctx.fillText('###', x + w - 4 - ctx.measureText('###').width, y + ROW_H / 2 + 1);
          } else ctx.fillText(text, x + w - 4 - tw, y + ROW_H / 2 + 1);
        } else if (isErr || typeof v === 'boolean') {
          ctx.fillText(text, x + (w - tw) / 2, y + ROW_H / 2 + 1);
        } else ctx.fillText(text, x + 4, y + ROW_H / 2 + 1);
        ctx.restore();
      }
    }

    // grid lines
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let r = r0; r <= r1 + 1; r++) {
      const y = Math.round(HEAD_H + r * ROW_H - st) + 0.5;
      ctx.moveTo(rh, y);
      ctx.lineTo(W, y);
    }
    for (const { x, w } of cols) {
      const xx = Math.round(x + w) + 0.5;
      ctx.moveTo(xx, HEAD_H);
      ctx.lineTo(xx, H);
    }
    ctx.stroke();

    // copy marquee
    if (this.copyRange && this.copyRange.sheet === sheet) {
      const q = this.rangeRect(this.copyRange);
      ctx.save();
      ctx.setLineDash([5, 3]);
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(q.x + 1, q.y + 1, q.w - 2, q.h - 2);
      ctx.restore();
    }

    // selection border
    ctx.save();
    ctx.beginPath();
    ctx.rect(rh, HEAD_H, W - rh, H - HEAD_H);
    ctx.clip();
    if (this.fillPreview) {
      const f = this.rangeRect(this.fillPreview);
      ctx.setLineDash([4, 3]);
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(f.x + 0.5, f.y + 0.5, f.w - 1, f.h - 1);
      ctx.setLineDash([]);
    }
    if (this.refRange) {
      const f = this.rangeRect(this.refRange);
      ctx.fillStyle = 'rgba(16,185,129,0.12)';
      ctx.fillRect(f.x, f.y, f.w, f.h);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(f.x + 0.5, f.y + 0.5, f.w - 1, f.h - 1);
    }
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2;
    ctx.strokeRect(q.x + 1, q.y + 1, q.w - 2, q.h - 2);
    // fill handle
    ctx.fillStyle = colors.accent;
    ctx.fillRect(q.x + q.w - 4, q.y + q.h - 4, 7, 7);
    ctx.strokeStyle = colors.bg;
    ctx.lineWidth = 1;
    ctx.strokeRect(q.x + q.w - 4.5, q.y + q.h - 4.5, 8, 8);
    ctx.restore();

    // column headers
    ctx.font = HEAD_FONT;
    ctx.fillStyle = colors.head;
    ctx.fillRect(0, 0, W, HEAD_H);
    for (const { c, x, w } of cols) {
      const selected = c >= s.c0 && c <= s.c1;
      if (selected) {
        ctx.fillStyle = colors.headSel;
        ctx.fillRect(x, 0, w, HEAD_H);
      }
      ctx.fillStyle = colors.headText;
      const name = colName(c);
      ctx.fillText(name, x + (w - ctx.measureText(name).width) / 2, HEAD_H / 2 + 1);
      ctx.strokeStyle = colors.grid;
      ctx.beginPath();
      ctx.moveTo(Math.round(x + w) + 0.5, 0);
      ctx.lineTo(Math.round(x + w) + 0.5, HEAD_H);
      ctx.stroke();
    }
    // row headers
    ctx.fillStyle = colors.head;
    ctx.fillRect(0, HEAD_H, rh, H - HEAD_H);
    for (let r = r0; r <= r1; r++) {
      const y = HEAD_H + r * ROW_H - st;
      if (r >= s.r0 && r <= s.r1) {
        ctx.fillStyle = colors.headSel;
        ctx.fillRect(0, y, rh, ROW_H);
      }
      ctx.fillStyle = colors.headText;
      const t = String(r + 1);
      ctx.fillText(t, rh - 6 - ctx.measureText(t).width, y + ROW_H / 2 + 1);
      ctx.strokeStyle = colors.grid;
      ctx.beginPath();
      ctx.moveTo(0, Math.round(y + ROW_H) + 0.5);
      ctx.lineTo(rh, Math.round(y + ROW_H) + 0.5);
      ctx.stroke();
    }
    ctx.fillStyle = colors.head;
    ctx.fillRect(0, 0, rh, HEAD_H);
    ctx.strokeStyle = colors.grid;
    ctx.beginPath();
    ctx.moveTo(rh + 0.5, 0);
    ctx.lineTo(rh + 0.5, H);
    ctx.moveTo(0, HEAD_H + 0.5);
    ctx.lineTo(W, HEAD_H + 0.5);
    ctx.stroke();
    this.positionEditor();
  }

  rangeRect(s) {
    const a = this.cellRect(Math.min(s.r0, s.r1), Math.min(s.c0, s.c1));
    const b = this.cellRect(Math.max(s.r0, s.r1), Math.max(s.c0, s.c1));
    return { x: a.x, y: a.y, w: b.x + b.w - a.x, h: b.y + b.h - a.y };
  }

  norm(s = this.sel) {
    return { r0: Math.min(s.r0, s.r1), r1: Math.max(s.r0, s.r1), c0: Math.min(s.c0, s.c1), c1: Math.max(s.c0, s.c1) };
  }

  // ---- selection ------------------------------------------------------------------------

  select(r0, c0, r1 = r0, c1 = c0, { scroll = true } = {}) {
    this.sel = { r0: Math.max(0, r0), c0: Math.max(0, c0), r1: Math.max(0, r1), c1: Math.max(0, c1) };
    if (scroll) this.scrollIntoView(this.sel.r1, this.sel.c1);
    this.requestDraw();
    this.hooks.onSelect?.(this.sel);
  }

  scrollIntoView(r, c) {
    const rh = this.rowHeadW();
    const W = this.scroller.clientWidth - rh;
    const H = this.scroller.clientHeight - HEAD_H;
    const y = r * ROW_H;
    if (y < this.scroller.scrollTop) this.scroller.scrollTop = y;
    else if (y + ROW_H > this.scroller.scrollTop + H) this.scroller.scrollTop = y + ROW_H - H;
    const x = this.colX(c);
    if (x < this.scroller.scrollLeft) this.scroller.scrollLeft = x;
    else if (x + this.colW(c) > this.scroller.scrollLeft + W) this.scroller.scrollLeft = x + this.colW(c) - W;
  }

  isEmpty(r, c) {
    const v = this.hf.getCellValue({ sheet: this.sheet, row: r, col: c });
    return v === null || v === undefined || v === '';
  }

  // Ctrl+arrow: jump to the edge of the data block, like Excel.
  edge(r, c, dr, dc) {
    const d = this.dims();
    const maxR = Math.max(d.usedRows, 1) - 1;
    const maxC = Math.max(d.usedCols, 1) - 1;
    const inside = (rr, cc) => rr >= 0 && cc >= 0 && rr <= maxR && cc <= maxC;
    let nr = r + dr;
    let nc = c + dc;
    if (!inside(nr, nc)) return { r: dr ? (dr > 0 ? Math.max(r, maxR) : 0) : r, c: dc ? (dc > 0 ? Math.max(c, maxC) : 0) : c };
    if (!this.isEmpty(r, c) && !this.isEmpty(nr, nc)) {
      while (inside(nr + dr, nc + dc) && !this.isEmpty(nr + dr, nc + dc)) {
        nr += dr;
        nc += dc;
      }
      return { r: nr, c: nc };
    }
    while (inside(nr, nc) && this.isEmpty(nr, nc)) {
      nr += dr;
      nc += dc;
    }
    if (!inside(nr, nc)) return { r: dr ? (dr > 0 ? maxR : 0) : r, c: dc ? (dc > 0 ? maxC : 0) : c };
    return { r: nr, c: nc };
  }

  // The contiguous block of data around a cell (Excel's "current region").
  currentRegion(r = this.sel.r0, c = this.sel.c0) {
    const d = this.dims();
    let r0 = r;
    let r1 = r;
    let c0 = c;
    let c1 = c;
    let grew = true;
    const rowHas = (rr, a, b) => {
      for (let cc = a; cc <= b; cc++) if (!this.isEmpty(rr, cc)) return true;
      return false;
    };
    const colHas = (cc, a, b) => {
      for (let rr = a; rr <= b; rr++) if (!this.isEmpty(rr, cc)) return true;
      return false;
    };
    let guard = 0;
    while (grew && guard++ < 1000) {
      grew = false;
      if (r0 > 0 && rowHas(r0 - 1, Math.max(0, c0 - 1), c1 + 1)) (r0--, (grew = true));
      if (r1 < d.usedRows - 1 && rowHas(r1 + 1, Math.max(0, c0 - 1), c1 + 1)) {
        // jump quickly through long columns of data
        let nr = r1 + 1;
        while (nr + 1 < d.usedRows && rowHas(nr + 1, c0, c1)) nr++;
        r1 = nr;
        grew = true;
      }
      if (c0 > 0 && colHas(c0 - 1, Math.max(0, r0 - 1), Math.min(d.usedRows - 1, r1 + 1))) (c0--, (grew = true));
      if (c1 < d.usedCols - 1 && colHas(c1 + 1, Math.max(0, r0 - 1), Math.min(d.usedRows - 1, r1 + 1))) (c1++, (grew = true));
    }
    return { r0, c0, r1, c1 };
  }

  // ---- mouse ----------------------------------------------------------------------------

  onHover(e) {
    if (this.dragging) return;
    const h = this.hit(e);
    let cur = 'cell';
    if (h.area === 'colhead' && h.border >= 0) cur = 'col-resize';
    else if (h.area === 'cell' && this.overFillHandle(h)) cur = 'crosshair';
    this.scroller.style.cursor = cur === 'cell' ? 'cell' : cur;
  }

  overFillHandle(h) {
    const q = this.rangeRect(this.norm());
    return Math.abs(h.x - (q.x + q.w)) <= 5 && Math.abs(h.y - (q.y + q.h)) <= 5;
  }

  inPointMode() {
    if (!this.editing) return false;
    const inp = this.editing.input;
    const v = inp.value;
    if (!v.startsWith('=')) return false;
    const before = v.slice(0, inp.selectionStart ?? v.length);
    return INSERTABLE.test(before) || this.pointInsert != null;
  }

  onMouseDown(e) {
    if (e.button !== 0) return;
    const h = this.hit(e);
    if (!h.inClient) return; // scrollbar
    // formula editing: clicking cells inserts references
    if (this.editing && h.area === 'cell' && this.inPointMode()) {
      e.preventDefault();
      this.startPointing(h, e);
      return;
    }
    if (this.editing) this.commitEdit();
    this.scroller.focus({ preventScroll: true });
    if (h.area === 'colhead' && h.border >= 0) return this.startResize(h, e);
    if (h.area === 'cell' && this.overFillHandle(h)) return this.startFill(e);
    e.preventDefault();
    const d = this.dims();
    if (h.area === 'corner') return this.select(0, 0, d.rows - 1, d.cols - 1, { scroll: false });
    let anchor = { r: this.sel.r0, c: this.sel.c0 };
    const startArea = h.area;
    if (e.shiftKey) {
      this.extendTo(h, startArea);
    } else if (startArea === 'colhead') {
      anchor = { r: 0, c: h.c };
      this.select(0, h.c, d.rows - 1, h.c, { scroll: false });
    } else if (startArea === 'rowhead') {
      anchor = { r: h.r, c: 0 };
      this.select(h.r, 0, h.r, d.cols - 1, { scroll: false });
    } else {
      anchor = { r: h.r, c: h.c };
      this.select(h.r, h.c, h.r, h.c, { scroll: false });
    }
    this.dragging = true;
    const move = (ev) => {
      const hh = this.hit(ev);
      this.autoScroll(hh);
      if (startArea === 'colhead') this.select(0, anchor.c, d.rows - 1, hh.c, { scroll: false });
      else if (startArea === 'rowhead') this.select(anchor.r, 0, hh.r, d.cols - 1, { scroll: false });
      else this.select(anchor.r, anchor.c, hh.r, hh.c, { scroll: false });
    };
    const up = () => {
      this.dragging = false;
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
    };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
  }

  extendTo(h, area) {
    const d = this.dims();
    if (area === 'colhead') this.select(0, this.sel.c0, d.rows - 1, h.c, { scroll: false });
    else if (area === 'rowhead') this.select(this.sel.r0, 0, h.r, d.cols - 1, { scroll: false });
    else this.select(this.sel.r0, this.sel.c0, h.r, h.c, { scroll: false });
  }

  autoScroll(h) {
    const W = this.scroller.clientWidth;
    const H = this.scroller.clientHeight;
    if (h.y > H - 10) this.scroller.scrollTop += ROW_H;
    else if (h.y < HEAD_H + 5 && this.scroller.scrollTop > 0) this.scroller.scrollTop -= ROW_H;
    if (h.x > W - 10) this.scroller.scrollLeft += 40;
    else if (h.x < this.rowHeadW() + 5 && this.scroller.scrollLeft > 0) this.scroller.scrollLeft -= 40;
  }

  startResize(h, e) {
    e.preventDefault();
    const c = h.border;
    const startX = e.clientX;
    const startW = this.colW(c);
    this.dragging = true;
    const move = (ev) => {
      this.meta.colW[c] = Math.max(24, startW + ev.clientX - startX);
      this.requestDraw();
    };
    const up = () => {
      this.dragging = false;
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
      this.hooks.onMetaChange?.();
    };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
  }

  autoFitColumn(c) {
    const ctx = this.ctx;
    ctx.font = FONT;
    const d = this.dims();
    let w = 40;
    const lim = Math.min(d.usedRows, 3000);
    for (let r = 0; r < lim; r++) {
      const a = { sheet: this.sheet, row: r, col: c };
      const v = this.hf.getCellValue(a);
      if (v === null || v === undefined) continue;
      const fmt = this.meta.cellFmt[`${r},${c}`] || this.meta.colFmt[c];
      const t = displayValue(v, typeof v === 'number' ? this.hf.getCellValueDetailedType(a) : null, fmt, this.wb.lang);
      w = Math.max(w, ctx.measureText(t).width + 12);
    }
    this.meta.colW[c] = Math.min(500, Math.ceil(w));
    this.requestDraw();
    this.hooks.onMetaChange?.();
  }

  startFill(e) {
    e.preventDefault();
    const src = this.norm();
    this.dragging = true;
    let target = null;
    const move = (ev) => {
      const h = this.hit(ev);
      this.autoScroll(h);
      const down = h.r - src.r1;
      const right = h.c - src.c1;
      if (down > 0 && down >= right) target = { r0: src.r0, c0: src.c0, r1: h.r, c1: src.c1 };
      else if (right > 0) target = { r0: src.r0, c0: src.c0, r1: src.r1, c1: h.c };
      else target = null;
      this.fillPreview = target;
      this.requestDraw();
    };
    const up = () => {
      this.dragging = false;
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
      this.fillPreview = null;
      if (target) this.fill(src, target);
      this.requestDraw();
    };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
  }

  // Double-click on the fill handle: fill down as far as the neighbouring column has data.
  autoFillDown() {
    const src = this.norm();
    const d = this.dims();
    let last = -1;
    for (const cc of [src.c0 - 1, src.c1 + 1]) {
      if (cc < 0) continue;
      let r = src.r1 + 1;
      while (r < d.usedRows && !this.isEmpty(r, cc)) r++;
      last = Math.max(last, r - 1);
    }
    if (last > src.r1) this.fill(src, { r0: src.r0, c0: src.c0, r1: last, c1: src.c1 });
  }

  fill(src, target) {
    const sheet = this.sheet;
    const range = (s) => ({ start: { sheet, row: s.r0, col: s.c0 }, end: { sheet, row: s.r1, col: s.c1 } });
    const down = target.r1 > src.r1;
    const ext = down ? { r0: src.r1 + 1, c0: src.c0, r1: target.r1, c1: src.c1 } : { r0: src.r0, c0: src.c1 + 1, r1: src.r1, c1: target.c1 };
    try {
      let data = this.hf.getFillRangeData(range(src), range(ext));
      data = this.seriesFill(src, ext, down, data);
      this.hf.setCellContents({ sheet, row: ext.r0, col: ext.c0 }, data);
      this.select(target.r0, target.c0, target.r1, target.c1, { scroll: false });
      this.sel = { r0: src.r0, c0: src.c0, r1: target.r1, c1: target.c1 };
      this.changed();
    } catch (err) {
      this.hooks.onError?.(err);
    }
  }

  // Numbers (two or more) continue as an arithmetic series; a single date counts up by days.
  seriesFill(src, ext, down, data) {
    const sheet = this.sheet;
    const lines = down ? src.c1 - src.c0 + 1 : src.r1 - src.r0 + 1;
    const len = down ? src.r1 - src.r0 + 1 : src.c1 - src.c0 + 1;
    for (let k = 0; k < lines; k++) {
      const vals = [];
      let numeric = true;
      let date = false;
      for (let i = 0; i < len; i++) {
        const a = down ? { sheet, row: src.r0 + i, col: src.c0 + k } : { sheet, row: src.r0 + k, col: src.c0 + i };
        if (this.hf.doesCellHaveFormula(a)) numeric = false;
        const v = this.hf.getCellValue(a);
        if (typeof v !== 'number') numeric = false;
        else if (String(this.hf.getCellValueDetailedType(a)).startsWith('NUMBER_DATE')) date = true;
        vals.push(v);
      }
      if (!numeric || (len < 2 && !date)) continue;
      const step = len >= 2 ? (vals[len - 1] - vals[0]) / (len - 1) : 1;
      const n = down ? ext.r1 - ext.r0 + 1 : ext.c1 - ext.c0 + 1;
      for (let i = 0; i < n; i++) {
        let v = vals[len - 1] + step * (i + 1);
        v = Math.round(v * 1e10) / 1e10;
        if (date) v = this.dateText(v);
        if (down) data[i][k] = v;
        else data[k][i] = v;
      }
    }
    return data;
  }

  dateText(serial) {
    const d = new Date(Math.round((serial - 25569) * 86400000));
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
  }

  onDblClick(e) {
    const h = this.hit(e);
    if (h.area === 'colhead' && h.border >= 0) return this.autoFitColumn(h.border);
    if (h.area === 'cell' && this.overFillHandle(h)) return this.autoFillDown();
    if (h.area === 'cell') {
      this.select(h.r, h.c, h.r, h.c, { scroll: false });
      this.beginEdit(null);
    }
  }

  onContextMenu(e) {
    e.preventDefault();
    const h = this.hit(e);
    const s = this.norm();
    if (h.area === 'cell' && !(h.r >= s.r0 && h.r <= s.r1 && h.c >= s.c0 && h.c <= s.c1)) this.select(h.r, h.c, h.r, h.c, { scroll: false });
    this.hooks.onContextMenu?.(e, h);
  }

  // ---- point mode: clicking cells while writing a formula ---------------------------------

  startPointing(h, e) {
    const inp = this.editing.input;
    const caret = inp.selectionStart ?? inp.value.length;
    if (this.pointInsert == null || caret !== this.pointInsert.end) {
      this.pointInsert = { start: caret, end: caret };
    }
    const sheetPrefix = this.editing.sheet !== this.sheet ? this.sheetRef(this.sheet) : '';
    const anchor = { r: h.r, c: h.c };
    const put = (r, c) => {
      const ref = sheetPrefix + (r === anchor.r && c === anchor.c ? addr(r, c) : `${addr(Math.min(r, anchor.r), Math.min(c, anchor.c))}:${addr(Math.max(r, anchor.r), Math.max(c, anchor.c))}`);
      const v = inp.value;
      inp.value = v.slice(0, this.pointInsert.start) + ref + v.slice(this.pointInsert.end);
      this.pointInsert.end = this.pointInsert.start + ref.length;
      inp.setSelectionRange(this.pointInsert.end, this.pointInsert.end);
      this.refRange = { r0: anchor.r, c0: anchor.c, r1: r, c1: c };
      this.onEditInput(inp, true);
      this.requestDraw();
    };
    put(h.r, h.c);
    inp.focus();
    this.dragging = true;
    const move = (ev) => {
      const hh = this.hit(ev);
      this.autoScroll(hh);
      put(hh.r, hh.c);
    };
    const up = () => {
      this.dragging = false;
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
      inp.focus();
    };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
  }

  sheetRef(id) {
    const name = this.hf.getSheetName(id);
    return (/^[\p{L}_][\p{L}\d_]*$/u.test(name) ? name : `'${name}'`) + '!';
  }

  // ---- editing ---------------------------------------------------------------------------

  rawFor(r, c) {
    const a = { sheet: this.sheet, row: r, col: c };
    const f = this.hf.getCellFormula(a);
    if (f) return f;
    const v = this.hf.getCellSerialized(a);
    if (v === null || v === undefined) return '';
    if (typeof v === 'number') {
      const type = this.hf.getCellValueDetailedType(a);
      const fmt = this.meta.cellFmt[`${r},${c}`] || this.meta.colFmt[c];
      if (fmt?.date || String(type).startsWith('NUMBER_DATE') || type === 'NUMBER_TIME') return displayValue(v, type, fmt, this.wb.lang);
      return this.wb.lang === 'en' ? String(v) : String(v).replace('.', ',');
    }
    if (typeof v === 'boolean') return displayValue(v, null, null, this.wb.lang);
    return String(v);
  }

  // text === null: edit the current content; otherwise replace it with `text`.
  beginEdit(text, { input = null } = {}) {
    if (this.editing) return;
    const r = this.sel.r0;
    const c = this.sel.c0;
    const original = this.rawFor(r, c);
    this.editing = { r, c, sheet: this.sheet, original, input: input || this.editor, fromTyping: text !== null, hiddenEditor: false };
    this.pointInsert = null;
    this.editor.value = text !== null ? text : original;
    this.editor.hidden = false;
    this.positionEditor();
    if (!input) {
      this.editor.focus();
      const end = this.editor.value.length;
      this.editor.setSelectionRange(end, end);
    }
    this.hooks.onEditChange?.(this.editor.value, this.editing);
    this.requestDraw();
  }

  positionEditor() {
    if (!this.editing || this.editor.hidden) return;
    if (this.editing.sheet !== this.sheet) {
      this.editor.style.visibility = 'hidden';
      return;
    }
    this.editor.style.visibility = 'visible';
    const q = this.cellRect(this.editing.r, this.editing.c);
    const ctx = this.ctx;
    ctx.font = FONT;
    const need = ctx.measureText(this.editor.value).width + 18;
    this.editor.style.left = q.x + 'px';
    this.editor.style.top = q.y + 'px';
    this.editor.style.width = Math.max(q.w, Math.min(need, 600)) + 'px';
    this.editor.style.height = q.h + 'px';
  }

  onEditInput(inp, fromPointing = false) {
    if (!this.editing) return;
    if (!fromPointing) {
      this.pointInsert = null;
      this.refRange = null;
    }
    if (inp !== this.editor) this.editor.value = inp.value;
    this.positionEditor();
    this.hooks.onEditChange?.(inp.value, this.editing, inp);
  }

  // Keys while the in-cell editor or formula bar has focus.
  onEditorKey(e, inp) {
    if (this.hooks.onEditorKey?.(e, inp)) return; // autocomplete took it
    const k = e.key;
    if (k === 'Enter') {
      e.preventDefault();
      this.commitEdit(e.shiftKey ? [-1, 0] : [1, 0]);
    } else if (k === 'Tab') {
      e.preventDefault();
      this.commitEdit(e.shiftKey ? [0, -1] : [0, 1]);
    } else if (k === 'Escape') {
      e.preventDefault();
      this.cancelEdit();
    } else if (k === 'F4' && inp.value.startsWith('=')) {
      e.preventDefault();
      this.toggleAbsolute(inp);
    } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(k) && this.editing?.fromTyping && inp === this.editor && !inp.value.startsWith('=')) {
      e.preventDefault();
      const d = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[k];
      this.commitEdit(d);
    }
  }

  toggleAbsolute(inp) {
    const pos = inp.selectionStart;
    const v = inp.value;
    const re = /\$?[A-Za-z]{1,3}\$?\d+/g;
    let m;
    while ((m = re.exec(v))) {
      if (pos >= m.index && pos <= m.index + m[0].length) {
        const raw = m[0].replace(/\$/g, '');
        const [, col, row] = raw.match(/([A-Za-z]+)(\d+)/);
        const cur = m[0];
        const forms = [`${col}${row}`, `$${col}$${row}`, `${col}$${row}`, `$${col}${row}`];
        const next = forms[(forms.indexOf(cur) + 1) % 4];
        inp.value = v.slice(0, m.index) + next + v.slice(m.index + cur.length);
        const p = m.index + next.length;
        inp.setSelectionRange(p, p);
        this.onEditInput(inp);
        return;
      }
    }
  }

  maybeCommitOnBlur() {
    if (!this.editing) return;
    const active = document.activeElement;
    if (active === this.editor || active === this.editing.input || this.dragging) return;
    if (active && active.closest && active.closest('.fx-bar, .ac-popup')) return;
    this.commitEdit(null);
  }

  commitEdit(move) {
    if (!this.editing) return;
    const ed = this.editing;
    const value = ed.input.value;
    this.editing = null;
    this.pointInsert = null;
    this.refRange = null;
    this.editor.hidden = true;
    if (value !== ed.original) {
      try {
        this.hf.setCellContents({ sheet: ed.sheet, row: ed.r, col: ed.c }, [[this.toRaw(value)]]);
        this.changed();
      } catch (err) {
        this.hooks.onError?.(err);
      }
    }
    if (ed.sheet !== this.sheet) this.hooks.onSwitchSheet?.(ed.sheet);
    this.hooks.onEditChange?.(null, null);
    if (move) this.move(move[0], move[1], false);
    this.scroller.focus({ preventScroll: true });
    this.requestDraw();
  }

  toRaw(value) {
    if (value === '') return null;
    if (value.startsWith('=')) return value;
    const t = value.trim();
    // numbers typed with either separator
    if (/^[-+]?\d+([.,]\d+)?$/.test(t)) return Number(t.replace(',', '.'));
    if (/^[-+]?\d+([.,]\d+)?%$/.test(t)) return t; // HF parses percentages
    return value;
  }

  cancelEdit() {
    if (!this.editing) return;
    const ed = this.editing;
    this.editing = null;
    this.pointInsert = null;
    this.refRange = null;
    this.editor.hidden = true;
    if (ed.sheet !== this.sheet) this.hooks.onSwitchSheet?.(ed.sheet);
    this.hooks.onEditChange?.(null, null);
    this.scroller.focus({ preventScroll: true });
    this.requestDraw();
  }

  // ---- keyboard --------------------------------------------------------------------------

  move(dr, dc, extend, jump = false) {
    const d = this.dims();
    let { r1, c1 } = extend ? this.sel : { r1: this.sel.r0, c1: this.sel.c0 };
    let target;
    if (jump) target = this.edge(r1, c1, dr, dc);
    else target = { r: Math.max(0, r1 + dr), c: Math.max(0, c1 + dc) };
    target.r = Math.min(target.r, 99999);
    target.c = Math.min(target.c, d.cols + 50);
    if (extend) this.select(this.sel.r0, this.sel.c0, target.r, target.c);
    else this.select(target.r, target.c);
  }

  onKey(e) {
    if (this.editing) return;
    const ctrl = e.ctrlKey || e.metaKey;
    const k = e.key;
    const arrows = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    if (arrows[k]) {
      e.preventDefault();
      this.move(arrows[k][0], arrows[k][1], e.shiftKey, ctrl);
      return;
    }
    if (k === 'Enter') {
      e.preventDefault();
      const s = this.norm();
      if (s.r0 !== s.r1 || s.c0 !== s.c1) {
        // move inside the selection
        let { r0: r, c0: c } = this.sel;
        r += e.shiftKey ? -1 : 1;
        if (r > s.r1) (r = s.r0), (c = c + 1 > s.c1 ? s.c0 : c + 1);
        if (r < s.r0) r = s.r1;
        this.sel = { ...this.sel, r0: r, c0: c };
        this.requestDraw();
        this.hooks.onSelect?.(this.sel);
      } else this.move(e.shiftKey ? -1 : 1, 0, false);
      return;
    }
    if (k === 'Tab') {
      e.preventDefault();
      this.move(0, e.shiftKey ? -1 : 1, false);
      return;
    }
    if (k === 'PageDown' || k === 'PageUp') {
      e.preventDefault();
      const n = Math.max(1, Math.floor((this.scroller.clientHeight - HEAD_H) / ROW_H) - 1);
      this.move(k === 'PageDown' ? n : -n, 0, e.shiftKey);
      return;
    }
    if (k === 'Home') {
      e.preventDefault();
      if (ctrl) this.select(0, 0);
      else this.select(this.sel.r0, 0);
      return;
    }
    if (k === 'End' && ctrl) {
      e.preventDefault();
      const d = this.dims();
      this.select(Math.max(0, d.usedRows - 1), Math.max(0, d.usedCols - 1));
      return;
    }
    if (k === 'F2') {
      e.preventDefault();
      this.beginEdit(null);
      return;
    }
    if (k === 'Delete' || k === 'Backspace') {
      e.preventDefault();
      this.clearSelection();
      return;
    }
    if (ctrl) {
      const key = k.toLowerCase();
      if (key === 'z') {
        e.preventDefault();
        if (e.shiftKey) this.redo();
        else this.undo();
      } else if (key === 'y') {
        e.preventDefault();
        this.redo();
      } else if (key === 'a') {
        e.preventDefault();
        const reg = this.currentRegion();
        const s = this.norm();
        if (s.r0 === reg.r0 && s.r1 === reg.r1 && s.c0 === reg.c0 && s.c1 === reg.c1) {
          const d = this.dims();
          this.select(0, 0, d.rows - 1, d.cols - 1, { scroll: false });
        } else this.select(reg.r0, reg.c0, reg.r1, reg.c1, { scroll: false });
        this.sel.r0 = reg.r0;
        this.sel.c0 = reg.c0;
      } else if (key === 'd') {
        e.preventDefault();
        const s = this.norm();
        if (s.r1 > s.r0) this.fill({ r0: s.r0, c0: s.c0, r1: s.r0, c1: s.c1 }, s);
      } else if (key === 'r') {
        e.preventDefault();
        const s = this.norm();
        if (s.c1 > s.c0) this.fill({ r0: s.r0, c0: s.c0, r1: s.r1, c1: s.c0 }, s);
      }
      return;
    }
    if (k === 'Escape') {
      this.copyRange = null;
      this.requestDraw();
      return;
    }
    if (k.length === 1 && !e.altKey) {
      e.preventDefault();
      this.beginEdit(k);
    }
  }

  undo() {
    try {
      if (this.hf.isThereSomethingToUndo()) {
        this.hf.undo();
        this.changed();
      }
    } catch (err) {
      this.hooks.onError?.(err);
    }
  }

  redo() {
    try {
      if (this.hf.isThereSomethingToRedo()) {
        this.hf.redo();
        this.changed();
      }
    } catch (err) {
      this.hooks.onError?.(err);
    }
  }

  clearSelection() {
    const s = this.norm();
    const d = this.dims();
    const r1 = Math.min(s.r1, Math.max(d.usedRows - 1, s.r0));
    const c1 = Math.min(s.c1, Math.max(d.usedCols - 1, s.c0));
    const data = [];
    for (let r = s.r0; r <= r1; r++) data.push(new Array(c1 - s.c0 + 1).fill(null));
    try {
      this.hf.setCellContents({ sheet: this.sheet, row: s.r0, col: s.c0 }, data);
      this.changed();
    } catch (err) {
      this.hooks.onError?.(err);
    }
  }

  // ---- clipboard --------------------------------------------------------------------------

  selectionText(s = this.norm()) {
    const d = this.dims();
    const r1 = Math.min(s.r1, Math.max(0, d.usedRows - 1));
    const c1 = Math.min(s.c1, Math.max(0, d.usedCols - 1));
    const lines = [];
    for (let r = s.r0; r <= r1; r++) {
      const row = [];
      for (let c = s.c0; c <= c1; c++) {
        const a = { sheet: this.sheet, row: r, col: c };
        const v = this.hf.getCellValue(a);
        const fmt = this.meta.cellFmt[`${r},${c}`] || this.meta.colFmt[c];
        row.push(displayValue(v, typeof v === 'number' ? this.hf.getCellValueDetailedType(a) : null, fmt, this.wb.lang));
      }
      lines.push(row.join('\t'));
    }
    while (lines.length && lines[lines.length - 1].replace(/\t/g, '') === '') lines.pop();
    return lines.join('\n');
  }

  onCopy(e, cut) {
    if (this.editing) return;
    e.preventDefault();
    const s = this.norm();
    const d = this.dims();
    const r1 = Math.min(s.r1, Math.max(0, d.usedRows - 1));
    const c1 = Math.min(s.c1, Math.max(0, d.usedCols - 1));
    const text = this.selectionText(s);
    e.clipboardData.setData('text/plain', text);
    try {
      const range = { start: { sheet: this.sheet, row: s.r0, col: s.c0 }, end: { sheet: this.sheet, row: r1, col: c1 } };
      if (cut) this.hf.cut(range);
      else this.hf.copy(range);
      this.copyRange = { ...s, r1, c1, sheet: this.sheet };
      this.copyText = text;
      this.isCut = cut;
    } catch {}
    this.requestDraw();
  }

  onPaste(e) {
    if (this.editing) return;
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    const at = { sheet: this.sheet, row: this.sel.r0, col: this.sel.c0 };
    try {
      if (this.copyText != null && text === this.copyText && this.hf.isClipboardEmpty() === false) {
        this.hf.paste(at);
        const cr = this.copyRange;
        this.select(at.row, at.col, at.row + (cr.r1 - cr.r0), at.col + (cr.c1 - cr.c0), { scroll: false });
        this.sel.r0 = at.row;
        this.sel.c0 = at.col;
        if (this.isCut) {
          this.copyRange = null;
          this.copyText = null;
        }
      } else {
        const rows = text.replace(/\r/g, '').replace(/\n$/, '').split('\n').map((l) => l.split('\t').map((v) => this.toRaw(v)));
        this.hf.setCellContents(at, rows);
        this.select(at.row, at.col, at.row + rows.length - 1, at.col + Math.max(...rows.map((r) => r.length)) - 1, { scroll: false });
        this.sel.r0 = at.row;
        this.sel.c0 = at.col;
      }
      this.changed();
    } catch (err) {
      this.hooks.onError?.(err);
    }
  }

  changed() {
    this.requestDraw();
    this.hooks.onChange?.();
    this.hooks.onSelect?.(this.sel);
  }
}

export { ROW_H, HEAD_H, parseAddr };
