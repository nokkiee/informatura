// Spreadsheet workspace: HyperFormula engine + canvas grid, with a formula bar,
// function autocomplete, sheets, sorting, a pivot table tool and charts.
import { h, btn, icon, clear, toast, modal, debounce, esc } from '../ui.js';
import { getSettings, onSettings } from '../store.js';
import { fetchData } from '../content.js';
import { loadHyperFormula, hfConfig, parseDataFile, displayValue, addr, colName, parseAddr, formatDate } from '../sheet/engine.js';
import { Grid } from '../sheet/grid.js';
import { CHART_TYPES, drawChart } from '../sheet/chart.js';

const FN_HELP = {
  pl: 'Funkcje po polsku, argumenty oddzielaj średnikiem: =SUMA(B2:B10), =JEŻELI(A2>5;"tak";"nie"), =LICZ.JEŻELI(C:C;"maj")',
  en: 'English functions, arguments separated by commas: =SUM(B2:B10), =IF(A2>5,"yes","no")',
};

export function createSheetWorkspace(container, ctx) {
  const { entry, state } = ctx;
  const group = entry.group;
  let disposed = false;
  let grid = null;
  let HF = null;
  const wb = {
    hf: null,
    lang: getSettings().sheetLang || 'pl',
    sheet: 0,
    meta: {},
    metaFor(id) {
      const n = this.hf.getSheetName(id);
      if (!this.meta[n]) this.meta[n] = { colW: {}, colFmt: {}, cellFmt: {} };
      return this.meta[n];
    },
  };
  let charts = [];
  let chartObjs = [];
  let fnNames = [];

  // ---- layout ------------------------------------------------------------------------------
  const nameBox = h('input', { class: 'namebox', spellcheck: false, title: 'Adres komórki – wpisz np. B10 albo A1:C20 i naciśnij Enter' });
  const fxInput = h('input', { class: 'fx-input', spellcheck: false, placeholder: FN_HELP[wb.lang] });
  const fxBar = h('div', { class: 'fx-bar' }, nameBox, h('span', { class: 'fx-label' }, 'fx'), fxInput);
  const gridHost = h('div', { class: 'grid-host' });
  const chartDock = h('div', { class: 'chart-dock', hidden: true });
  const main = h('div', { class: 'sheet-main' }, gridHost, chartDock);
  const tabsEl = h('div', { class: 'sheet-tabs' });
  const statusEl = h('div', { class: 'sheet-status' });
  const footer = h('div', { class: 'sheet-footer' }, tabsEl, h('div', { class: 'grow' }), statusEl);
  const acPopup = h('div', { class: 'ac-popup', hidden: true });

  const tb = (label, ic, title, fn, kind) => btn(label, { icon: ic, small: true, title, onClick: fn, kind });
  const toolbar = h(
    'div',
    { class: 'ws-toolbar sheet-toolbar' },
    tb('Importuj', 'download', 'Wczytaj plik z danymi do nowego arkusza (Dane → Z tekstu)', () => importDialog()),
    h('span', { class: 'sep' }),
    h('button', { class: 'icon-btn', title: 'Cofnij (Ctrl+Z)', onclick: () => grid?.undo() }, h('span', { class: 'glyph' }, '↶')),
    h('button', { class: 'icon-btn', title: 'Ponów (Ctrl+Y)', onclick: () => grid?.redo() }, h('span', { class: 'glyph' }, '↷')),
    h('span', { class: 'sep' }),
    tb('Sortuj', 'sort', 'Sortuj dane według kolumny', () => sortDialog()),
    tb('Tabela przestawna', 'table', 'Zestawienie: grupowanie i sumowanie (jak tabela przestawna)', () => pivotDialog()),
    tb('Wykres', 'chart', 'Wstaw wykres z zaznaczonych danych', () => chartDialog()),
    h('span', { class: 'sep' }),
    h('button', { class: 'icon-btn', title: 'Mniej miejsc po przecinku', onclick: () => changeDecimals(-1) }, h('span', { class: 'glyph small' }, ',0←')),
    h('button', { class: 'icon-btn', title: 'Więcej miejsc po przecinku', onclick: () => changeDecimals(1) }, h('span', { class: 'glyph small' }, ',00→')),
    h('div', { class: 'grow' }),
    tb('Do odpowiedzi', 'check', 'Wstaw wartości z zaznaczonych komórek do pola „Odpowiedź”', () => toAnswer(), 'primary'),
  );
  const root = h('div', { class: 'ws ws-sheet' }, toolbar, fxBar, main, footer, acPopup);
  clear(container).appendChild(root);
  gridHost.appendChild(h('div', { class: 'loading-line' }, 'Wczytywanie arkusza…'));

  // ---- persistence -------------------------------------------------------------------------
  const persist = debounce(() => {
    if (!wb.hf || disposed) return;
    state.sheet = {
      v: 1,
      lang: wb.lang,
      sheets: wb.hf.getSheetNames().map((name) => ({ name, data: wb.hf.getSheetSerialized(wb.hf.getSheetId(name)) })),
      meta: wb.meta,
      charts,
      active: wb.hf.getSheetName(wb.sheet),
    };
    ctx.save();
  }, 1200);

  async function init() {
    HF = await loadHyperFormula();
    if (disposed) return;
    const cfg = hfConfig(wb.lang);
    const saved = state.sheet;
    if (saved && saved.sheets?.length) {
      const sheets = {};
      for (const s of saved.sheets) sheets[s.name] = s.data;
      try {
        wb.hf = HF.buildFromSheets(sheets, hfConfig(saved.lang || 'pl'));
        if ((saved.lang || 'pl') !== wb.lang) wb.hf.updateConfig(cfg);
      } catch (err) {
        console.warn('Nie udało się odtworzyć arkusza', err);
        wb.hf = null;
      }
      if (wb.hf) {
        wb.meta = saved.meta || {};
        charts = saved.charts || [];
        wb.sheet = wb.hf.getSheetId(saved.active) ?? 0;
      }
    }
    if (!wb.hf) {
      wb.hf = HF.buildEmpty(cfg);
      const file = group.sheet?.file || group.files?.[0];
      if (file) await importFile(file, 'auto', { initial: true });
      else wb.hf.addSheet('Arkusz1');
      wb.sheet = 0;
    }
    if (!wb.hf.getSheetNames().length) wb.hf.addSheet('Arkusz1');
    fnNames = HF.getRegisteredFunctionNames(cfg.language).sort();
    clear(gridHost);
    grid = new Grid(gridHost, wb, {
      onSelect: () => updateBars(),
      onChange: () => {
        persist();
        refreshCharts();
        updateStatus();
      },
      onMetaChange: () => persist(),
      onEditChange: (value, editing, source) => onEditChange(value, editing, source),
      onEditorKey: (e, inp) => acKey(e, inp),
      onContextMenu: (e) => contextMenu(e),
      onSwitchSheet: (id) => switchSheet(id),
      onError: (err) => toast(err.message || String(err), 'error'),
    });
    renderTabs();
    updateBars();
    refreshCharts();
    if (ctx.focus !== false) grid.scroller.focus({ preventScroll: true });
  }

  async function importFile(file, sep, { initial = false } = {}) {
    const text = await fetchData(entry.exam, file);
    const parsed = parseDataFile(text, { sep });
    let name = file.replace(/\.txt$/i, '');
    let n = 2;
    while (wb.hf.getSheetId(name) !== undefined) name = `${file.replace(/\.txt$/i, '')} (${n++})`;
    wb.hf.addSheet(name);
    const id = wb.hf.getSheetId(name);
    wb.hf.setSheetContent(id, parsed.rows);
    const meta = wb.metaFor(id);
    for (const [c, f] of Object.entries(parsed.formats)) meta.colFmt[c] = { date: f };
    // column widths from the content
    const probe = document.createElement('canvas').getContext('2d');
    probe.font = '13px system-ui';
    const widths = {};
    parsed.rows.slice(0, 300).forEach((r) =>
      r.forEach((v, c) => {
        if (v == null) return;
        const t = typeof v === 'number' ? String(v) : String(v).replace(/^'/, '');
        widths[c] = Math.max(widths[c] || 60, Math.min(320, probe.measureText(t).width + 16));
      }),
    );
    for (const [c, w] of Object.entries(widths)) meta.colW[c] = Math.ceil(w);
    if (!initial) {
      switchSheet(id);
      persist();
      toast(`Wczytano ${file}: ${parsed.rows.length} wierszy`, 'ok');
    }
    return id;
  }

  // ---- sheets ------------------------------------------------------------------------------
  function switchSheet(id) {
    if (grid?.editing && grid.inPointMode()) {
      // keep editing a formula while looking at another sheet
      wb.sheet = id;
    } else {
      grid?.commitEdit(null);
      wb.sheet = id;
      if (grid) grid.sel = { r0: 0, c0: 0, r1: 0, c1: 0 };
    }
    grid?.scroller.scrollTo(0, 0);
    renderTabs();
    grid?.requestDraw();
    updateBars();
    persist();
  }

  function renderTabs() {
    clear(tabsEl);
    for (const name of wb.hf.getSheetNames()) {
      const id = wb.hf.getSheetId(name);
      const tab = h(
        'button',
        {
          class: `stab ${id === wb.sheet ? 'active' : ''}`,
          title: 'Dwuklik – zmień nazwę, prawy przycisk – usuń',
          onmousedown: (e) => {
            if (grid?.editing && grid.inPointMode()) e.preventDefault();
          },
          onclick: () => switchSheet(id),
          ondblclick: () => renameSheet(id),
          oncontextmenu: (e) => {
            e.preventDefault();
            sheetMenu(e, id);
          },
        },
        name,
      );
      tabsEl.appendChild(tab);
    }
    tabsEl.appendChild(
      h(
        'button',
        {
          class: 'stab add',
          title: 'Nowy arkusz',
          onclick: () => {
            let i = wb.hf.getSheetNames().length + 1;
            while (wb.hf.getSheetId('Arkusz' + i) !== undefined) i++;
            wb.hf.addSheet('Arkusz' + i);
            switchSheet(wb.hf.getSheetId('Arkusz' + i));
          },
        },
        '+',
      ),
    );
  }

  function renameSheet(id) {
    const old = wb.hf.getSheetName(id);
    const input = h('input', { class: 'input', value: old });
    modal({
      title: 'Zmień nazwę arkusza',
      body: input,
      actions: [
        { label: 'Anuluj' },
        {
          label: 'Zmień',
          kind: 'primary',
          onClick: () => {
            const name = input.value.trim();
            if (!name || name === old) return;
            if (!wb.hf.isItPossibleToRenameSheet(id, name)) {
              toast('Nie można użyć tej nazwy', 'error');
              return true;
            }
            wb.hf.renameSheet(id, name);
            wb.meta[name] = wb.meta[old];
            delete wb.meta[old];
            charts.forEach((c) => c.sheet === old && (c.sheet = name));
            renderTabs();
            persist();
          },
        },
      ],
    });
    setTimeout(() => input.select(), 50);
  }

  function sheetMenu(e, id) {
    popupMenu(e, [
      ['Zmień nazwę', () => renameSheet(id)],
      [
        'Usuń arkusz',
        () => {
          if (wb.hf.getSheetNames().length <= 1) return toast('Musi zostać co najmniej jeden arkusz', 'warn');
          const name = wb.hf.getSheetName(id);
          wb.hf.removeSheet(id);
          delete wb.meta[name];
          charts = charts.filter((c) => c.sheet !== name);
          switchSheet(wb.hf.getSheetId(wb.hf.getSheetNames()[0]));
          refreshCharts();
        },
      ],
    ]);
  }

  // ---- formula bar & autocomplete ---------------------------------------------------------
  function selText(s) {
    const n = grid.norm(s);
    return n.r0 === n.r1 && n.c0 === n.c1 ? addr(n.r0, n.c0) : `${addr(n.r0, n.c0)}:${addr(n.r1, n.c1)}`;
  }

  function updateBars() {
    if (!grid) return;
    if (!grid.editing) {
      nameBox.value = selText(grid.sel);
      fxInput.value = grid.rawFor(grid.sel.r0, grid.sel.c0);
    }
    updateStatus();
  }

  function onEditChange(value, editing, source) {
    if (value === null) {
      hideAc();
      fxInput.value = grid.rawFor(grid.sel.r0, grid.sel.c0);
      return;
    }
    if (source !== fxInput) fxInput.value = value;
    updateAc(source || grid.editor);
  }

  fxInput.addEventListener('focus', () => {
    if (!grid) return;
    if (!grid.editing) grid.beginEdit(null, { input: fxInput });
    else grid.editing.input = fxInput;
  });
  fxInput.addEventListener('input', () => grid?.onEditInput(fxInput));
  fxInput.addEventListener('keydown', (e) => grid?.editing && grid.onEditorKey(e, fxInput));
  fxInput.addEventListener('blur', () => setTimeout(() => grid?.maybeCommitOnBlur(), 0));
  nameBox.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const [a, b] = nameBox.value.split(':');
    const p = parseAddr(a);
    const q = b ? parseAddr(b) : p;
    if (!p || !q) return toast('Nieprawidłowy adres', 'warn');
    grid.select(p.r, p.c, q.r, q.c);
    grid.sel.r0 = p.r;
    grid.sel.c0 = p.c;
    grid.scroller.focus();
  });

  let acItems = [];
  let acIndex = 0;
  let acInput = null;
  function updateAc(inp) {
    const v = inp.value;
    const caret = inp.selectionStart ?? v.length;
    if (!v.startsWith('=')) return hideAc();
    const m = v.slice(0, caret).match(/([A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż][A-Za-z0-9.ĄĆĘŁŃÓŚŹŻąćęłńóśźż]*)$/);
    if (!m || /[A-Za-z]+\d+$/.test(m[1]) && !/^[A-Za-zĄĆĘŁŃÓŚŹŻ.]+$/.test(m[1])) return hideAc();
    const pre = m[1].toUpperCase();
    acItems = fnNames.filter((n) => n.startsWith(pre)).slice(0, 12);
    if (!acItems.length || (acItems.length === 1 && acItems[0] === pre)) return hideAc();
    acIndex = 0;
    acInput = inp;
    acPopup.hidden = false;
    renderAc();
    const r = inp.getBoundingClientRect();
    const rr = root.getBoundingClientRect();
    acPopup.style.left = Math.min(r.left - rr.left, rr.width - 260) + 'px';
    acPopup.style.top = r.bottom - rr.top + 2 + 'px';
  }
  function renderAc() {
    clear(acPopup);
    acItems.forEach((n, i) => acPopup.appendChild(h('div', { class: `ac-item ${i === acIndex ? 'active' : ''}`, onmousedown: (e) => (e.preventDefault(), acceptAc(i)) }, n)));
    acPopup.appendChild(h('div', { class: 'ac-hint' }, 'Tab – wstaw'));
  }
  function hideAc() {
    acPopup.hidden = true;
    acItems = [];
  }
  function acceptAc(i) {
    const inp = acInput;
    const name = acItems[i];
    const v = inp.value;
    const caret = inp.selectionStart ?? v.length;
    const m = v.slice(0, caret).match(/([A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż][A-Za-z0-9.ĄĆĘŁŃÓŚŹŻąćęłńóśźż]*)$/);
    const start = caret - m[1].length;
    inp.value = v.slice(0, start) + name + '(' + v.slice(caret);
    const p = start + name.length + 1;
    inp.setSelectionRange(p, p);
    hideAc();
    grid.onEditInput(inp);
    inp.focus();
  }
  function acKey(e, inp) {
    if (acPopup.hidden || !acItems.length) return false;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      acIndex = (acIndex + (e.key === 'ArrowDown' ? 1 : -1) + acItems.length) % acItems.length;
      renderAc();
      return true;
    }
    if (e.key === 'Tab' || (e.key === 'Enter' && acItems.length)) {
      e.preventDefault();
      acInput = inp;
      acceptAc(acIndex);
      return true;
    }
    if (e.key === 'Escape') {
      hideAc();
      e.preventDefault();
      return true;
    }
    return false;
  }

  // ---- status bar (like Excel's sum/average/count) -----------------------------------------
  function updateStatus() {
    if (!grid) return;
    const s = grid.norm();
    const d = grid.dims();
    const r1 = Math.min(s.r1, d.usedRows - 1);
    const c1 = Math.min(s.c1, d.usedCols - 1);
    let sum = 0;
    let n = 0;
    let filled = 0;
    let cells = 0;
    for (let r = s.r0; r <= r1 && cells < 300000; r++)
      for (let c = s.c0; c <= c1; c++, cells++) {
        const v = wb.hf.getCellValue({ sheet: wb.sheet, row: r, col: c });
        if (v === null || v === undefined || v === '') continue;
        filled++;
        if (typeof v === 'number') {
          sum += v;
          n++;
        }
      }
    clear(statusEl);
    if (filled > 1 || (s.r0 !== s.r1 || s.c0 !== s.c1)) {
      const f = (x) => displayValue(x, null, null, wb.lang);
      if (n) statusEl.append(h('span', null, 'Średnia: ', h('b', null, f(sum / n))), h('span', null, 'Licznik: ', h('b', null, String(filled))), h('span', null, 'Suma: ', h('b', null, f(sum))));
      else statusEl.append(h('span', null, 'Licznik: ', h('b', null, String(filled))));
    }
  }

  // ---- context menu --------------------------------------------------------------------------
  function popupMenu(e, items) {
    document.querySelector('.ctx-menu')?.remove();
    const menu = h(
      'div',
      { class: 'ctx-menu' },
      items.map((it) =>
        it === '-'
          ? h('div', { class: 'ctx-sep' })
          : h(
              'button',
              {
                class: 'ctx-item',
                onclick: () => {
                  menu.remove();
                  it[1]();
                },
              },
              it[0],
            ),
      ),
    );
    document.body.appendChild(menu);
    const x = Math.min(e.clientX, window.innerWidth - menu.offsetWidth - 8);
    const y = Math.min(e.clientY, window.innerHeight - menu.offsetHeight - 8);
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    const close = (ev) => {
      if (!menu.contains(ev.target)) {
        menu.remove();
        document.removeEventListener('mousedown', close, true);
      }
    };
    setTimeout(() => document.addEventListener('mousedown', close, true), 0);
  }

  function contextMenu(e) {
    const s = grid.norm();
    const nRows = s.r1 - s.r0 + 1;
    const nCols = s.c1 - s.c0 + 1;
    const op = (fn) => {
      try {
        fn();
        grid.changed();
      } catch (err) {
        toast(err.message, 'error');
      }
    };
    popupMenu(e, [
      ['Kopiuj', () => document.execCommand('copy')],
      ['Wytnij', () => document.execCommand('cut')],
      ['Wklej', () => navigator.clipboard.readText().then((t) => grid.onPaste({ preventDefault() {}, clipboardData: { getData: () => t } }))],
      '-',
      [`Wstaw ${nRows > 1 ? nRows + ' wiersze' : 'wiersz'} powyżej`, () => op(() => wb.hf.addRows(wb.sheet, [s.r0, nRows]))],
      [`Usuń ${nRows > 1 ? 'wiersze' : 'wiersz'}`, () => op(() => wb.hf.removeRows(wb.sheet, [s.r0, nRows]))],
      [`Wstaw ${nCols > 1 ? 'kolumny' : 'kolumnę'} z lewej`, () => op(() => wb.hf.addColumns(wb.sheet, [s.c0, nCols]))],
      [`Usuń ${nCols > 1 ? 'kolumny' : 'kolumnę'}`, () => op(() => wb.hf.removeColumns(wb.sheet, [s.c0, nCols]))],
      ['Wyczyść zawartość', () => grid.clearSelection()],
      '-',
      ['Sortuj rosnąco (A→Z)', () => quickSort(true)],
      ['Sortuj malejąco (Z→A)', () => quickSort(false)],
      ['Format daty…', () => dateFormatDialog()],
      '-',
      ['Wstaw do odpowiedzi', () => toAnswer()],
    ]);
  }

  // ---- tools ---------------------------------------------------------------------------------
  function toAnswer() {
    if (!grid) return;
    const text = grid.selectionText();
    if (!text.trim()) return toast('Zaznacz komórki z wynikiem', 'warn');
    ctx.onOutput?.(text, 'zaznaczone komórki');
  }

  function changeDecimals(delta) {
    const s = grid.norm();
    const meta = wb.metaFor(wb.sheet);
    const d = grid.dims();
    const r1 = Math.min(s.r1, d.usedRows - 1);
    const c1 = Math.min(s.c1, d.usedCols - 1);
    const wholeCols = s.r0 === 0 && s.r1 >= d.rows - 1;
    for (let c = s.c0; c <= c1; c++) {
      if (wholeCols) {
        const cur = meta.colFmt[c]?.dec ?? guessDec(0, c);
        meta.colFmt[c] = { ...(meta.colFmt[c] || {}), dec: Math.max(0, Math.min(10, cur + delta)) };
        continue;
      }
      for (let r = s.r0; r <= r1; r++) {
        const k = `${r},${c}`;
        const cur = meta.cellFmt[k]?.dec ?? meta.colFmt[c]?.dec ?? guessDec(r, c);
        meta.cellFmt[k] = { ...(meta.cellFmt[k] || {}), dec: Math.max(0, Math.min(10, cur + delta)) };
      }
    }
    grid.requestDraw();
    persist();
  }

  function guessDec(r, c) {
    const v = wb.hf.getCellValue({ sheet: wb.sheet, row: r, col: c });
    if (typeof v !== 'number' || Number.isInteger(v)) return 0;
    const s = String(Number(v.toPrecision(12)));
    return s.includes('.') ? s.split('.')[1].length : 0;
  }

  function dateFormatDialog() {
    const s = grid.norm();
    const sel = h('select', { class: 'select' }, ['YYYY-MM-DD', 'DD.MM.YYYY', 'DD-MM-YYYY', 'YYYY-MM-DD hh:mm', 'hh:mm', '(liczba)'].map((f) => h('option', { value: f }, f.replace('YYYY', 'rrrr').replace('DD', 'dd'))));
    modal({
      title: 'Format daty',
      body: h('div', null, h('p', { class: 'muted small' }, 'Dotyczy zaznaczonych kolumn. Data w arkuszu to liczba dni – format zmienia tylko wygląd.'), sel),
      actions: [
        { label: 'Anuluj' },
        {
          label: 'Zastosuj',
          kind: 'primary',
          onClick: () => {
            const meta = wb.metaFor(wb.sheet);
            for (let c = s.c0; c <= s.c1; c++) {
              if (sel.value === '(liczba)') delete meta.colFmt[c]?.date;
              else meta.colFmt[c] = { ...(meta.colFmt[c] || {}), date: sel.value };
            }
            grid.requestDraw();
            persist();
          },
        },
      ],
    });
  }

  function regionWithHeader() {
    const reg = grid.currentRegion();
    const firstRow = [];
    for (let c = reg.c0; c <= reg.c1; c++) firstRow.push(wb.hf.getCellValue({ sheet: wb.sheet, row: reg.r0, col: c }));
    const secondRow = [];
    for (let c = reg.c0; c <= reg.c1; c++) secondRow.push(wb.hf.getCellValue({ sheet: wb.sheet, row: reg.r0 + 1, col: c }));
    const header = firstRow.every((v) => typeof v === 'string') && secondRow.some((v) => typeof v !== 'string');
    return { reg, header, names: firstRow.map((v, i) => (header ? String(v) : `Kolumna ${colName(reg.c0 + i)}`)) };
  }

  function sortValueKey(v) {
    if (v === null || v === undefined || v === '') return [3, 0];
    if (typeof v === 'number') return [0, v];
    if (typeof v === 'string') return [1, v.toLocaleLowerCase('pl')];
    if (typeof v === 'boolean') return [2, v ? 1 : 0];
    return [4, 0];
  }

  function doSort(reg, header, col, asc) {
    const from = reg.r0 + (header ? 1 : 0);
    const dims = wb.hf.getSheetDimensions(wb.sheet);
    const rows = [];
    for (let r = from; r <= reg.r1; r++) rows.push({ r, k: sortValueKey(wb.hf.getCellValue({ sheet: wb.sheet, row: r, col })) });
    rows.sort((a, b) => {
      if (a.k[0] !== b.k[0]) return a.k[0] - b.k[0];
      const x = a.k[1];
      const y = b.k[1];
      const cmp = typeof x === 'string' ? x.localeCompare(y, 'pl') : x - y;
      return asc ? cmp : -cmp;
    });
    // setRowOrder takes the new position of every current row
    const targetOf = new Array(dims.height);
    for (let i = 0; i < dims.height; i++) targetOf[i] = i;
    rows.forEach((x, i) => (targetOf[x.r] = from + i));
    try {
      wb.hf.setRowOrder(wb.sheet, targetOf);
      grid.changed();
      persist();
    } catch (err) {
      toast('Nie udało się posortować: ' + err.message, 'error');
    }
  }

  function quickSort(asc) {
    const { reg, header } = regionWithHeader();
    doSort(reg, header, grid.sel.c0, asc);
  }

  function sortDialog() {
    if (!grid) return;
    const { reg, header, names } = regionWithHeader();
    const colSel = h('select', { class: 'select' }, names.map((n, i) => h('option', { value: reg.c0 + i, selected: reg.c0 + i === grid.sel.c0 }, `${colName(reg.c0 + i)}: ${n}`)));
    const orderSel = h('select', { class: 'select' }, h('option', { value: 'asc' }, 'rosnąco (A→Z, 0→9)'), h('option', { value: 'desc' }, 'malejąco (Z→A, 9→0)'));
    const headChk = h('input', { type: 'checkbox', checked: header });
    modal({
      title: 'Sortowanie',
      body: h(
        'div',
        { class: 'form' },
        h('div', { class: 'muted small' }, `Zakres: ${addr(reg.r0, reg.c0)}:${addr(reg.r1, reg.c1)} (cały blok danych wokół zaznaczonej komórki)`),
        h('label', null, 'Sortuj według ', colSel),
        h('label', null, 'Kolejność ', orderSel),
        h('label', { class: 'check' }, headChk, ' Pierwszy wiersz to nagłówki'),
      ),
      actions: [{ label: 'Anuluj' }, { label: 'Sortuj', kind: 'primary', onClick: () => doSort(reg, headChk.checked, Number(colSel.value), orderSel.value === 'asc') }],
    });
  }

  // Pivot table: group rows by a field (optionally by month/year for dates) and aggregate.
  function pivotDialog() {
    if (!grid) return;
    const { reg, header, names } = regionWithHeader();
    const opts = names.map((n, i) => h('option', { value: i }, n));
    const rowSel = h('select', { class: 'select' }, opts.map((o) => o.cloneNode(true)));
    const colSel = h('select', { class: 'select' }, h('option', { value: '' }, '(brak)'), opts.map((o) => o.cloneNode(true)));
    const valSel = h('select', { class: 'select' }, opts.map((o) => o.cloneNode(true)));
    valSel.value = String(Math.min(names.length - 1, 1));
    const fnSel = h('select', { class: 'select' }, ['Suma', 'Liczba', 'Średnia', 'Maksimum', 'Minimum'].map((f) => h('option', null, f)));
    const grpSel = h('select', { class: 'select' }, [
      ['', 'bez grupowania'],
      ['month', 'miesiące'],
      ['year', 'lata'],
      ['ym', 'rok i miesiąc'],
    ].map(([v, l]) => h('option', { value: v }, l)));
    modal({
      title: 'Tabela przestawna',
      body: h(
        'div',
        { class: 'form' },
        h('div', { class: 'muted small' }, `Dane: ${addr(reg.r0, reg.c0)}:${addr(reg.r1, reg.c1)}${header ? ' (z nagłówkami)' : ''}. Wynik trafi do nowego arkusza.`),
        h('label', null, 'Wiersze ', rowSel),
        h('label', null, 'Grupuj daty w wierszach ', grpSel),
        h('label', null, 'Kolumny ', colSel),
        h('label', null, 'Wartości ', valSel),
        h('label', null, 'Funkcja ', fnSel),
      ),
      actions: [
        { label: 'Anuluj' },
        { label: 'Utwórz', kind: 'primary', onClick: () => buildPivot(reg, header, names, Number(rowSel.value), colSel.value === '' ? null : Number(colSel.value), Number(valSel.value), fnSel.value, grpSel.value) },
      ],
    });
  }

  function buildPivot(reg, header, names, rf, cf, vf, fn, grp) {
    const sheet = wb.sheet;
    const from = reg.r0 + (header ? 1 : 0);
    const keyOf = (r, f, grouping) => {
      const a = { sheet, row: r, col: reg.c0 + f };
      const v = wb.hf.getCellValue(a);
      const t = typeof v === 'number' ? wb.hf.getCellValueDetailedType(a) : null;
      if (grouping && typeof v === 'number') {
        const ymd = formatDate(v, 'YYYY-MM-DD');
        if (grouping === 'month') return { k: Number(ymd.slice(5, 7)), label: MONTHS[Number(ymd.slice(5, 7)) - 1] };
        if (grouping === 'year') return { k: Number(ymd.slice(0, 4)), label: ymd.slice(0, 4) };
        return { k: ymd.slice(0, 7), label: ymd.slice(0, 7) };
      }
      const label = displayValue(v, t, wb.metaFor(sheet).colFmt[reg.c0 + f], wb.lang);
      return { k: typeof v === 'number' ? v : label, label };
    };
    const rowsMap = new Map();
    const colsMap = new Map();
    const cells = new Map();
    for (let r = from; r <= reg.r1; r++) {
      const rk = keyOf(r, rf, grp);
      const ck = cf === null ? { k: '', label: '' } : keyOf(r, cf, null);
      rowsMap.set(rk.k, rk.label);
      colsMap.set(ck.k, ck.label);
      const key = rk.k + '\u0000' + ck.k;
      if (!cells.has(key)) cells.set(key, []);
      const v = wb.hf.getCellValue({ sheet, row: r, col: reg.c0 + vf });
      cells.get(key).push(v);
    }
    const agg = (list) => {
      if (!list || !list.length) return null;
      const nums = list.filter((v) => typeof v === 'number');
      if (fn === 'Liczba') return list.filter((v) => v !== null && v !== '').length;
      if (!nums.length) return null;
      if (fn === 'Suma') return nums.reduce((a, b) => a + b, 0);
      if (fn === 'Średnia') return nums.reduce((a, b) => a + b, 0) / nums.length;
      if (fn === 'Maksimum') return Math.max(...nums);
      return Math.min(...nums);
    };
    const sortKeys = (m) => [...m.keys()].sort((a, b) => (typeof a === 'number' && typeof b === 'number' ? a - b : String(a).localeCompare(String(b), 'pl')));
    const rk = sortKeys(rowsMap);
    const ck = sortKeys(colsMap);
    const out = [];
    const title = `${fn} z ${names[vf]}`;
    out.push([names[rf] + (grp ? ` (${grp === 'month' ? 'miesiąc' : grp === 'year' ? 'rok' : 'rok-miesiąc'})` : ''), ...(cf === null ? [title] : ck.map((k) => colsMap.get(k))), ...(cf !== null && fn !== 'Średnia' ? ['Suma końcowa'] : [])]);
    for (const r of rk) {
      const row = [typeof r === 'number' && !grp ? r : rowsMap.get(r)];
      let total = 0;
      for (const c of ck) {
        const v = agg(cells.get(r + '\u0000' + c));
        row.push(v);
        total += v || 0;
      }
      if (cf !== null && fn !== 'Średnia') row.push(total);
      out.push(row);
    }
    if (fn === 'Suma' || fn === 'Liczba') {
      const tot = ['Suma końcowa'];
      for (let i = 1; i < out[0].length; i++) tot.push(out.slice(1).reduce((s, row) => s + (row[i] || 0), 0));
      out.push(tot);
    }
    let i = 1;
    while (wb.hf.getSheetId('Przestawna' + (i > 1 ? i : '')) !== undefined) i++;
    const name = 'Przestawna' + (i > 1 ? i : '');
    wb.hf.addSheet(name);
    const id = wb.hf.getSheetId(name);
    wb.hf.setSheetContent(id, out.map((r) => r.map((v) => (typeof v === 'number' ? Math.round(v * 1e10) / 1e10 : v))));
    const meta = wb.metaFor(id);
    meta.colW[0] = 160;
    switchSheet(id);
    toast('Utworzono tabelę przestawną w arkuszu ' + name, 'ok');
  }

  // ---- charts ----------------------------------------------------------------------------------
  function chartDialog(existing) {
    if (!grid) return;
    let s = grid.norm();
    if (!existing && s.r0 === s.r1 && s.c0 === s.c1) {
      const reg = grid.currentRegion();
      s = reg;
    }
    const cfg = existing || { id: Date.now(), sheet: wb.hf.getSheetName(wb.sheet), range: { ...s }, type: 'column', title: '', xTitle: '', yTitle: '', legend: true };
    const rangeIn = h('input', { class: 'input', value: `${addr(cfg.range.r0, cfg.range.c0)}:${addr(cfg.range.r1, cfg.range.c1)}` });
    const typeSel = h('select', { class: 'select' }, CHART_TYPES.map(([v, l]) => h('option', { value: v, selected: v === cfg.type }, l)));
    const title = h('input', { class: 'input', value: cfg.title, placeholder: 'np. Dostawy owoców w miesiącach' });
    const xT = h('input', { class: 'input', value: cfg.xTitle, placeholder: 'np. miesiąc' });
    const yT = h('input', { class: 'input', value: cfg.yTitle, placeholder: 'np. liczba kilogramów' });
    const leg = h('input', { type: 'checkbox', checked: cfg.legend !== false });
    modal({
      title: existing ? 'Edytuj wykres' : 'Nowy wykres',
      body: h(
        'div',
        { class: 'form' },
        h('div', { class: 'muted small' }, 'Pierwszy wiersz zakresu (jeśli zawiera tekst) to nazwy serii – trafią do legendy. Pierwsza kolumna z tekstem lub datami to etykiety osi X.'),
        h('label', null, 'Dane (zakres) ', rangeIn),
        h('label', null, 'Typ ', typeSel),
        h('label', null, 'Tytuł wykresu ', title),
        h('label', null, 'Opis osi X ', xT),
        h('label', null, 'Opis osi Y ', yT),
        h('label', { class: 'check' }, leg, ' Legenda'),
      ),
      actions: [
        existing
          ? {
              label: 'Usuń wykres',
              kind: 'danger',
              onClick: () => {
                charts = charts.filter((c) => c.id !== existing.id);
                refreshCharts();
                persist();
              },
            }
          : { label: 'Anuluj' },
        {
          label: existing ? 'Zapisz' : 'Wstaw',
          kind: 'primary',
          onClick: () => {
            const [a, b] = rangeIn.value.split(':');
            const p = parseAddr(a);
            const q = parseAddr(b || a);
            if (!p || !q) {
              toast('Nieprawidłowy zakres', 'error');
              return true;
            }
            Object.assign(cfg, { range: { r0: Math.min(p.r, q.r), c0: Math.min(p.c, q.c), r1: Math.max(p.r, q.r), c1: Math.max(p.c, q.c) }, type: typeSel.value, title: title.value, xTitle: xT.value, yTitle: yT.value, legend: leg.checked });
            if (!existing) charts.push(cfg);
            refreshCharts();
            persist();
          },
        },
      ],
    });
  }

  const refreshCharts = debounce(async () => {
    chartObjs.forEach((c) => c?.destroy());
    chartObjs = [];
    clear(chartDock);
    chartDock.hidden = !charts.length;
    if (!charts.length || !wb.hf) return;
    for (const cfg of charts) {
      const canvas = h('canvas');
      const card = h(
        'div',
        { class: 'chart-card' },
        h('div', { class: 'chart-head' }, h('span', { class: 'small muted' }, `${cfg.sheet}!${addr(cfg.range.r0, cfg.range.c0)}:${addr(cfg.range.r1, cfg.range.c1)}`), h('div', { class: 'grow' }), h('button', { class: 'icon-btn small', title: 'Edytuj wykres', onclick: () => chartDialog(cfg) }, icon('settings', 14))),
        h('div', { class: 'chart-canvas' }, canvas),
      );
      chartDock.appendChild(card);
      try {
        chartObjs.push(await drawChart(canvas, wb, cfg));
      } catch (err) {
        card.appendChild(h('div', { class: 'con-err-title' }, err.message));
      }
    }
  }, 250);

  // ---- import ------------------------------------------------------------------------------------
  function importDialog() {
    const files = group.files || [];
    if (!files.length) return toast('To zadanie nie ma plików z danymi', 'warn');
    const fileSel = h('select', { class: 'select' }, files.map((f) => h('option', { value: f }, f)));
    const sepSel = h('select', { class: 'select' }, [
      ['auto', 'wykryj automatycznie'],
      ['\t', 'tabulator'],
      [';', 'średnik'],
      [',', 'przecinek'],
      [' ', 'spacja'],
    ].map(([v, l]) => h('option', { value: v }, l)));
    modal({
      title: 'Importuj dane z pliku tekstowego',
      body: h('div', { class: 'form' }, h('label', null, 'Plik ', fileSel), h('label', null, 'Separator ', sepSel), h('div', { class: 'muted small' }, 'Dane trafią do nowego arkusza. Liczby z przecinkiem i daty są rozpoznawane automatycznie.')),
      actions: [{ label: 'Anuluj' }, { label: 'Importuj', kind: 'primary', onClick: () => importFile(fileSel.value, sepSel.value) }],
    });
  }

  const unsubSettings = onSettings((s) => {
    if (!wb.hf || s.sheetLang === wb.lang) return;
    grid?.commitEdit(null);
    wb.lang = s.sheetLang;
    wb.hf.updateConfig(hfConfig(wb.lang));
    fnNames = HF.getRegisteredFunctionNames(hfConfig(wb.lang).language).sort();
    fxInput.placeholder = FN_HELP[wb.lang];
    grid?.requestDraw();
    updateBars();
    persist();
  });

  init().catch((err) => {
    console.error(err);
    clear(gridHost).appendChild(h('div', { class: 'con-err-title pad' }, 'Nie udało się uruchomić arkusza: ' + err.message));
  });

  return {
    destroy() {
      persist.flush();
      disposed = true;
      unsubSettings();
      chartObjs.forEach((c) => c?.destroy());
      grid?.destroy();
      document.querySelector('.ctx-menu')?.remove();
      try {
        wb.hf?.destroy();
      } catch {}
    },
  };
}

const MONTHS = ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'];
