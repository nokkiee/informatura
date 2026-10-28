// Spreadsheet workspace: HyperFormula engine + canvas grid, with a formula bar,
// function autocomplete, sheets, sorting, pivot tables (with a live fields panel), subtotals and
// charts.
import { h, btn, icon, clear, toast, modal, debounce, esc } from '../ui.js';
import { getSettings, onSettings } from '../store.js';
import { fetchData } from '../content.js';
import { loadHyperFormula, hfConfig, parseDataFile, displayValue, addr, colName, parseAddr } from '../sheet/engine.js';
import { Grid } from '../sheet/grid.js';
import { CHART_TYPES, drawChart } from '../sheet/chart.js';
import { computePivot, filterValues, keyOf, PIVOT_FNS, DATE_GROUPS } from '../sheet/pivot.js';
import { SUBTOTAL_FNS, subtotalPlan, isSubtotalFormula } from '../sheet/subtotal.js';

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
  const main = h('div', { class: 'sheet-main' }, gridHost);
  const tabsEl = h('div', { class: 'sheet-tabs' });
  const statusEl = h('div', { class: 'sheet-status' });
  const footer = h('div', { class: 'sheet-footer' }, tabsEl, h('div', { class: 'grow' }), statusEl);
  const acPopup = h('div', { class: 'ac-popup', hidden: true });

  const tb = (label, ic, title, fn, kind, compact) => {
    const b = btn(label, { icon: ic, small: true, title, onClick: fn, kind });
    if (compact) b.classList.add('compact'); // only the icon when the toolbar is narrow
    return b;
  };
  const toolbar = h(
    'div',
    { class: 'ws-toolbar sheet-toolbar' },
    tb('Importuj', 'download', 'Wczytaj plik z danymi do nowego arkusza (Dane → Z tekstu)', () => importDialog(), null, true),
    h('span', { class: 'sep' }),
    h('button', { class: 'icon-btn', title: 'Cofnij (Ctrl+Z)', onclick: () => grid?.undo() }, h('span', { class: 'glyph' }, '↶')),
    h('button', { class: 'icon-btn', title: 'Ponów (Ctrl+Y)', onclick: () => grid?.redo() }, h('span', { class: 'glyph' }, '↷')),
    h('span', { class: 'sep' }),
    tb('Sortuj', 'sort', 'Sortuj dane według kolumny', () => sortDialog(), null, true),
    tb('Tabela przestawna', 'table', 'Zestawienie: grupowanie i sumowanie, z panelem pól jak w Excelu', () => pivotDialog()),
    tb('Suma częściowa', 'sigma', 'Wiersz z sumą (liczbą, średnią…) pod każdą grupą danych, jak Dane → Suma częściowa w Excelu', () => subtotalDialog()),
    tb('Wykres', 'chart', 'Wstaw wykres z zaznaczonych danych', () => chartDialog(), null, true),
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
      if (disposed) return; // the task was closed while the data file was loading
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
    syncPivotPanel();
    if (ctx.focus !== false) grid.scroller.focus({ preventScroll: true });
  }

  async function importFile(file, sep, { initial = false } = {}) {
    const text = await fetchData(entry.exam, file);
    if (disposed) return; // wb.hf is already destroyed
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
    syncPivotPanel();
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
            for (const m of Object.values(wb.meta)) if (m?.pivot?.src === old) m.pivot.src = name;
            if (panelClosed.delete(old)) panelClosed.add(name);
            syncPivotPanel();
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

  // empty cells stay last in both directions
  function compareSortKeys(a, b, asc) {
    if (a[0] !== b[0]) return a[0] - b[0];
    const cmp = typeof a[1] === 'string' ? a[1].localeCompare(b[1], 'pl') : a[1] - b[1];
    return asc ? cmp : -cmp;
  }

  function sortValueKey(v) {
    if (v === null || v === undefined || v === '') return [3, 0];
    if (typeof v === 'number') return [0, v];
    if (typeof v === 'string') return [1, v.toLocaleLowerCase('pl')];
    if (typeof v === 'boolean') return [2, v ? 1 : 0];
    return [4, 0];
  }

  // sorts rows from..to of a sheet by one column (stable, numbers before text, empty last)
  function sortRows(sheet, from, to, col, asc) {
    const dims = wb.hf.getSheetDimensions(sheet);
    const rows = [];
    for (let r = from; r <= to; r++) rows.push({ r, k: sortValueKey(wb.hf.getCellValue({ sheet, row: r, col })) });
    rows.sort((a, b) => compareSortKeys(a.k, b.k, asc));
    // setRowOrder takes the new position of every current row
    const targetOf = new Array(dims.height);
    for (let i = 0; i < dims.height; i++) targetOf[i] = i;
    rows.forEach((x, i) => (targetOf[x.r] = from + i));
    wb.hf.setRowOrder(sheet, targetOf);
  }

  function doSort(reg, header, col, asc) {
    try {
      sortRows(wb.sheet, reg.r0 + (header ? 1 : 0), reg.r1, col, asc);
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

  // ---- pivot tables ------------------------------------------------------------------------------
  // A pivot table lives in its own sheet. Its layout (which fields are in the filters, columns,
  // rows and values) is kept in that sheet's meta, and the "Pola tabeli przestawnej" panel next
  // to the grid changes it live, as in Excel.
  const pivotOf = (id = wb.sheet) => wb.metaFor(id).pivot || null;

  // the pivot's source data: field names, records (values of every data row), date formats
  function pivotSource(p) {
    const sid = wb.hf.getSheetId(p.src);
    if (sid === undefined) throw new Error(`Nie ma już arkusza „${p.src}” z danymi tej tabeli.`);
    const { r0, c0, r1, c1 } = p.range;
    const from = r0 + (p.header ? 1 : 0);
    const smeta = wb.metaFor(sid);
    const names = [];
    const dateFmt = [];
    for (let c = c0; c <= c1; c++) {
      const v = p.header ? wb.hf.getCellValue({ sheet: sid, row: r0, col: c }) : null;
      names.push(v !== null && v !== undefined && v !== '' ? String(v) : `Kolumna ${colName(c)}`);
      let fmt = smeta.colFmt[c]?.date || null;
      // dates typed in by hand have no column format: HyperFormula knows their type
      for (let r = from; !fmt && r <= Math.min(r1, from + 20); r++) {
        const a = { sheet: sid, row: r, col: c };
        if (typeof wb.hf.getCellValue(a) !== 'number') continue;
        const t = wb.hf.getCellValueDetailedType(a);
        fmt = t === 'NUMBER_DATE' ? 'YYYY-MM-DD' : t === 'NUMBER_DATETIME' ? 'YYYY-MM-DD hh:mm' : null;
        break;
      }
      dateFmt.push(fmt);
    }
    const records = from <= r1 ? wb.hf.getRangeValues({ start: { sheet: sid, row: from, col: c0 }, end: { sheet: sid, row: r1, col: c1 } }) : [];
    return { names, records, dateFmt };
  }

  const isNumberField = (src, f) => {
    if (src.dateFmt[f]) return false;
    const first = src.records.find((r) => r[f] !== null && r[f] !== undefined && r[f] !== '');
    return typeof first?.[f] === 'number';
  };

  // computes the table and writes it into its sheet; returns an error message (and writes nothing)
  function writePivot(id, p, res = computePivot(p, pivotSource(p))) {
    if (res.error) return res.error;
    wb.hf.setSheetContent(id, res.cells);
    const meta = wb.metaFor(id);
    meta.colFmt = {};
    for (const [c, f] of Object.entries(res.dateCols)) meta.colFmt[c] = { date: f };
    // every column as wide as its widest text (labels included – they'd spill otherwise)
    const probe = document.createElement('canvas').getContext('2d');
    probe.font = '13px system-ui';
    meta.colW = {};
    res.cells.slice(0, 2000).forEach((row) =>
      row.forEach((v, c) => {
        if (v === null || v === '' || meta.manualW?.[c]) return;
        const t = displayValue(v, null, meta.colFmt[c], wb.lang);
        meta.colW[c] = Math.max(meta.colW[c] || 64, Math.min(320, Math.ceil(probe.measureText(t).width + 18)));
      }),
    );
    return null;
  }

  function pivotDialog() {
    if (!grid) return;
    // on a pivot table's sheet the button brings back its fields panel
    if (pivotOf()) {
      panelClosed.delete(wb.hf.getSheetName(wb.sheet));
      return syncPivotPanel();
    }
    const { reg, header, names } = regionWithHeader();
    const opts = names.map((n, i) => h('option', { value: i }, n));
    const rowSel = h('select', { class: 'select' }, opts.map((o) => o.cloneNode(true)));
    const colSel = h('select', { class: 'select' }, h('option', { value: '' }, '(brak)'), opts.map((o) => o.cloneNode(true)));
    const valSel = h('select', { class: 'select' }, opts.map((o) => o.cloneNode(true)));
    valSel.value = String(Math.min(names.length - 1, 1));
    const fnSel = h('select', { class: 'select' }, PIVOT_FNS.map((f) => h('option', null, f)));
    const grpSel = h('select', { class: 'select' }, DATE_GROUPS.map(([v, l]) => h('option', { value: v }, l)));
    const headChk = h('input', { type: 'checkbox', checked: header });
    modal({
      title: 'Tabela przestawna',
      body: h(
        'div',
        { class: 'form' },
        h('div', { class: 'muted small' }, `Dane: ${addr(reg.r0, reg.c0)}:${addr(reg.r1, reg.c1)}. Tabela trafi do nowego arkusza, a obok niej pojawi się panel „Pola tabeli przestawnej”: przeciągasz w nim pola między wierszami, kolumnami, wartościami i filtrami, a tabela od razu się przebudowuje – jak w Excelu.`),
        h('label', null, 'Wiersze ', rowSel),
        h('label', null, 'Grupuj daty w wierszach ', grpSel),
        h('label', null, 'Kolumny ', colSel),
        h('label', null, 'Wartości ', valSel),
        h('label', null, 'Funkcja ', fnSel),
        h('label', { class: 'check' }, headChk, ' Pierwszy wiersz to nagłówki'),
      ),
      actions: [
        { label: 'Anuluj' },
        {
          label: 'Utwórz',
          kind: 'primary',
          onClick: () =>
            createPivot({
              src: wb.hf.getSheetName(wb.sheet),
              range: reg,
              header: headChk.checked,
              rows: [{ f: Number(rowSel.value), grp: grpSel.value }],
              cols: colSel.value === '' ? [] : [{ f: Number(colSel.value), grp: '' }],
              vals: [{ f: Number(valSel.value), fn: fnSel.value }],
              filters: [],
              subtotals: true,
              totals: true,
            }),
        },
      ],
    });
  }

  // checks the table first, so a layout that can't be built leaves no empty sheet behind
  function createPivot(p) {
    const res = computePivot(p, pivotSource(p));
    if (res.error) {
      toast(res.error, 'error', 8000);
      return true; // the dialog stays open: pick other fields
    }
    let i = 1;
    while (wb.hf.getSheetId('Przestawna' + (i > 1 ? i : '')) !== undefined) i++;
    const name = 'Przestawna' + (i > 1 ? i : '');
    wb.hf.addSheet(name);
    const id = wb.hf.getSheetId(name);
    try {
      writePivot(id, p, res);
    } catch (err) {
      wb.hf.removeSheet(id);
      delete wb.meta[name];
      throw err;
    }
    wb.metaFor(id).pivot = p;
    switchSheet(id);
    toast('Utworzono tabelę przestawną w arkuszu ' + name, 'ok');
  }

  // ---- the fields panel ----
  const pivotPanel = h('div', { class: 'pivot-panel', hidden: true });
  main.append(pivotPanel, chartDock);
  const panelClosed = new Set(); // pivot sheets whose panel was closed
  let pivotError = '';
  const AREA_TITLES = { filters: 'Filtry', cols: 'Kolumny', rows: 'Wiersze', vals: 'Wartości' };

  function syncPivotPanel() {
    const p = wb.hf && pivotOf();
    const name = p && wb.hf.getSheetName(wb.sheet);
    pivotPanel.hidden = !p || panelClosed.has(name);
    if (!pivotPanel.hidden) renderPivotPanel();
  }

  // changes the layout and rebuilds the table; a layout that can't be built is not applied
  function changePivot(fn) {
    const id = wb.sheet;
    const meta = wb.metaFor(id);
    const next = JSON.parse(JSON.stringify(meta.pivot));
    fn(next);
    let err;
    try {
      err = writePivot(id, next);
    } catch (e) {
      err = e.message;
    }
    pivotError = err || '';
    if (!err) {
      meta.pivot = next;
      grid.changed();
      persist();
    }
    renderPivotPanel();
  }

  // a field moved by drag and drop (from the field list or another area) to `area` at `at`
  function moveField(n, d, area, at, src) {
    let item = null;
    let f = d.f;
    if (d.from !== 'list') {
      item = n[d.from][d.i];
      if (!item) return;
      f = item.f;
      n[d.from].splice(d.i, 1);
      if (d.from === area && d.i < at) at--;
    }
    if (area === 'list') return; // dropped back on the list: taken out of the table
    // a field is in one of filters / columns / rows at a time (values may repeat it)
    if (area !== 'vals') for (const a of ['filters', 'cols', 'rows']) n[a] = n[a].filter((x) => x.f !== f);
    const fresh = area === 'vals' ? { f, fn: item?.fn || (isNumberField(src, f) ? 'Suma' : 'Liczba') } : area === 'filters' ? { f, value: null } : { f, grp: item?.grp || '' };
    n[area].splice(Math.min(at, n[area].length), 0, fresh);
  }

  function dropZone(el, area, src) {
    el.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      el.classList.add('over');
    });
    el.addEventListener('dragleave', (e) => {
      if (!el.contains(e.relatedTarget)) el.classList.remove('over');
    });
    el.addEventListener('drop', (e) => {
      e.preventDefault();
      el.classList.remove('over');
      let d;
      try {
        d = JSON.parse(e.dataTransfer.getData('text/plain'));
      } catch {
        return;
      }
      // before the first chip whose middle is below the pointer
      const chips = [...el.querySelectorAll('.pv-chip')];
      let at = chips.findIndex((c) => {
        const r = c.getBoundingClientRect();
        return e.clientY < r.top + r.height / 2;
      });
      if (at < 0) at = chips.length;
      changePivot((n) => moveField(n, d, area, at, src));
    });
  }

  const draggable = (el, data) => {
    el.draggable = true;
    el.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', JSON.stringify(data));
      e.dataTransfer.effectAllowed = 'move';
      el.classList.add('dragging');
    });
    el.addEventListener('dragend', () => el.classList.remove('dragging'));
  };

  function renderPivotPanel() {
    const p = pivotOf();
    if (!p) return;
    const name = wb.hf.getSheetName(wb.sheet);
    const head = h(
      'div',
      { class: 'pv-head' },
      icon('fields', 15),
      h('b', null, 'Pola tabeli przestawnej'),
      h('div', { class: 'grow' }),
      h(
        'button',
        {
          class: 'icon-btn small',
          title: 'Zamknij panel (otworzysz go przyciskiem „Tabela przestawna”)',
          onclick: () => {
            panelClosed.add(name);
            syncPivotPanel();
          },
        },
        icon('x', 14),
      ),
    );
    let src;
    try {
      src = pivotSource(p);
    } catch (err) {
      clear(pivotPanel).append(head, h('div', { class: 'pv-err' }, err.message));
      return;
    }
    const { names } = src;
    const used = new Set([...p.rows, ...p.cols, ...p.vals, ...p.filters].map((x) => x.f));

    const fieldList = h(
      'div',
      { class: 'pv-fields' },
      names.map((n, f) => {
        const chk = h('input', {
          type: 'checkbox',
          checked: used.has(f),
          onchange: () =>
            changePivot((x) => {
              if (chk.checked) moveField(x, { from: 'list', f }, isNumberField(src, f) ? 'vals' : 'rows', 1e9, src);
              else for (const a of ['filters', 'cols', 'rows', 'vals']) x[a] = x[a].filter((it) => it.f !== f);
            }),
        });
        const el = h('label', { class: 'pv-field', title: `${n} – przeciągnij do obszaru poniżej` }, chk, h('span', { class: 'pv-name' }, n));
        draggable(el, { from: 'list', f });
        return el;
      }),
    );
    dropZone(fieldList, 'list', src);

    // a field in an area: its name (for values: the function and the name) and, below, how
    // dates are grouped or which value the filter keeps
    const chip = (area, it, i) => {
      let title;
      let extra = null;
      if (area === 'vals') {
        title = h('span', { class: 'pv-name', title: `${it.fn} z ${names[it.f]}` }, names[it.f]);
        extra = h('select', { class: 'pv-select wide', title: 'Funkcja', onchange: () => changePivot((x) => (x.vals[i].fn = extra.value)) }, PIVOT_FNS.map((fn) => h('option', { selected: fn === it.fn }, fn)));
      } else {
        title = h('span', { class: 'pv-name', title: names[it.f] }, names[it.f]);
        if (area === 'filters') {
          const values = filterValues(src, it.f);
          extra = h(
            'select',
            { class: 'pv-select wide', title: 'Pokaż tylko', onchange: () => changePivot((x) => (x.filters[i].value = extra.value === '' ? null : values[Number(extra.value)].k)) },
            h('option', { value: '' }, '(wszystkie)'),
            values.map((v, k) => h('option', { value: k, selected: v.k === it.value }, String(v.label))),
          );
        } else if (src.dateFmt[it.f]) {
          extra = h('select', { class: 'pv-select wide', title: 'Grupowanie dat', onchange: () => changePivot((x) => (x[area][i].grp = extra.value)) }, DATE_GROUPS.map(([v, l]) => h('option', { value: v, selected: v === (it.grp || '') }, l)));
        }
      }
      const el = h(
        'div',
        { class: 'pv-chip', dataset: { area, i } },
        h(
          'div',
          { class: 'pv-chip-row' },
          h('span', { class: 'pv-grip', title: 'Przeciągnij' }, '⠿'),
          title,
          h('button', { class: 'icon-btn tiny', title: 'Usuń z tabeli', onclick: () => changePivot((x) => x[area].splice(i, 1)) }, icon('x', 12)),
        ),
        extra,
      );
      draggable(el, { from: area, i });
      return el;
    };
    const areaBox = (area) => {
      const drop = h('div', { class: 'pv-drop', dataset: { area } }, p[area].map((it, i) => chip(area, it, i)));
      if (!p[area].length) drop.appendChild(h('div', { class: 'pv-empty' }, 'przeciągnij tu pole'));
      dropZone(drop, area, src);
      return h('div', { class: 'pv-area' }, h('div', { class: 'pv-area-title' }, AREA_TITLES[area]), drop);
    };
    const opt = (key, label, title) =>
      h('label', { class: 'check small', title }, h('input', { type: 'checkbox', checked: p[key] !== false, onchange: (e) => changePivot((x) => (x[key] = e.target.checked)) }), ' ' + label);

    clear(pivotPanel).append(
      head,
      h(
        'div',
        { class: 'pv-src small muted' },
        h('span', null, `Dane: ${p.src}!${addr(p.range.r0, p.range.c0)}:${addr(p.range.r1, p.range.c1)}`),
        h('div', { class: 'grow' }),
        btn('Odśwież', { icon: 'refresh', small: true, title: 'Przelicz tabelę od nowa (np. po zmianie danych albo dopisaniu wierszy)', onClick: () => refreshPivot() }),
      ),
      h('div', { class: 'pv-label small' }, 'Zaznacz pola albo przeciągnij je do obszarów:'),
      fieldList,
      h('div', { class: 'pv-areas' }, areaBox('filters'), areaBox('cols'), areaBox('rows'), areaBox('vals')),
      h('div', { class: 'pv-opts' }, opt('subtotals', 'Sumy częściowe', 'Wiersz z wynikiem pod każdą grupą, gdy w wierszach jest więcej niż jedno pole'), opt('totals', 'Sumy końcowe', 'Wiersz (i kolumna) „Suma końcowa”')),
      ...(pivotError ? [h('div', { class: 'pv-err' }, icon('x', 13), ' ', pivotError)] : []),
      h('div', { class: 'pv-tip small muted' }, 'Każda zmiana od razu przebudowuje tabelę w tym arkuszu (to, co wpiszesz w jej komórkach, zostanie nadpisane).'),
    );
  }

  // recomputes the table, taking in rows added below the source data
  function refreshPivot() {
    changePivot((n) => {
      const sid = wb.hf.getSheetId(n.src);
      if (sid === undefined) return;
      const { r0, c0, c1 } = n.range;
      const d = wb.hf.getSheetDimensions(sid);
      const rowHas = (r) => {
        for (let c = c0; c <= c1; c++) {
          const v = wb.hf.getCellValue({ sheet: sid, row: r, col: c });
          if (v !== null && v !== undefined && v !== '') return true;
        }
        return false;
      };
      let r1 = r0;
      while (r1 + 1 < d.height && rowHas(r1 + 1)) r1++;
      n.range = { ...n.range, r1 };
    });
    if (!pivotError) toast('Tabela przeliczona', 'ok');
  }

  // ---- subtotals (Excel: Dane → Suma częściowa) ---------------------------------------------------
  function subtotalDialog() {
    if (!grid) return;
    const { reg, header, names } = regionWithHeader();
    if (reg.r1 <= reg.r0) return toast('Zaznacz komórkę w tabeli z danymi (z wierszem nagłówków).', 'warn');
    const inCol = grid.sel.c0 - reg.c0;
    const atSel = h('select', { class: 'select' }, names.map((n, i) => h('option', { value: i, selected: i === inCol }, n)));
    const fnSel = h('select', { class: 'select' }, SUBTOTAL_FNS.map(([n], i) => h('option', { value: i }, n)));
    const numeric = (i) => typeof wb.hf.getCellValue({ sheet: wb.sheet, row: reg.r0 + (header ? 1 : 0), col: reg.c0 + i }) === 'number';
    let last = names.length - 1;
    while (last > 0 && !numeric(last)) last--;
    const checks = names.map((_, i) => h('input', { type: 'checkbox', checked: i === last && i !== inCol }));
    const sortChk = h('input', { type: 'checkbox', checked: true });
    const replaceChk = h('input', { type: 'checkbox', checked: true });
    const headChk = h('input', { type: 'checkbox', checked: header });
    modal({
      title: 'Suma częściowa',
      body: h(
        'div',
        { class: 'form' },
        h(
          'div',
          { class: 'muted small' },
          `Zakres: ${addr(reg.r0, reg.c0)}:${addr(reg.r1, reg.c1)}. Pod każdą grupą wierszy z tą samą wartością w wybranej kolumnie pojawi się wiersz z wynikiem dla tej grupy (funkcja ${wb.lang === 'en' ? 'SUBTOTAL' : 'SUMY.CZĘŚCIOWE'}), a na końcu – wynik dla wszystkich danych.`,
        ),
        h('label', null, 'Przy każdej zmianie w: ', atSel),
        h('label', null, 'Użyj funkcji: ', fnSel),
        h('div', null, 'Dodaj sumę częściową do:'),
        h('div', { class: 'st-cols' }, names.map((n, i) => h('label', { class: 'check' }, checks[i], ' ' + n))),
        h('label', { class: 'check' }, sortChk, ' Najpierw posortuj dane według tej kolumny (grupa to wiersze leżące jeden pod drugim)'),
        h('label', { class: 'check' }, replaceChk, ' Zamień bieżące sumy częściowe'),
        h('label', { class: 'check' }, headChk, ' Pierwszy wiersz to nagłówki'),
      ),
      actions: [
        { label: 'Usuń wszystko', onClick: () => removeSubtotals(reg) },
        { label: 'Anuluj' },
        {
          label: 'OK',
          kind: 'primary',
          onClick: () => {
            const cols = checks.map((c, i) => (c.checked ? i : -1)).filter((i) => i >= 0 && i !== Number(atSel.value));
            if (!cols.length) {
              toast('Zaznacz co najmniej jedną kolumnę, do której dodać sumy częściowe.', 'warn');
              return true;
            }
            applySubtotals({ reg, header: headChk.checked, at: Number(atSel.value), cols, fn: SUBTOTAL_FNS[Number(fnSel.value)], sort: sortChk.checked, replace: replaceChk.checked });
          },
        },
      ],
    });
  }

  // the rows of the region holding SUMY.CZĘŚCIOWE formulas (top to bottom)
  function subtotalRows(sheet, reg) {
    const rows = [];
    for (let r = reg.r0; r <= reg.r1; r++)
      for (let c = reg.c0; c <= reg.c1; c++)
        if (isSubtotalFormula(wb.hf.getCellFormula({ sheet, row: r, col: c }))) {
          rows.push(r);
          break;
        }
    return rows;
  }

  function removeSubtotals(reg) {
    const rows = subtotalRows(wb.sheet, reg);
    if (rows.length) wb.hf.batch(() => rows.reverse().forEach((r) => wb.hf.removeRows(wb.sheet, [r, 1])));
    grid.changed();
    persist();
    toast(rows.length ? `Usunięto sumy częściowe (${rows.length} wierszy)` : 'W tych danych nie ma sum częściowych', rows.length ? 'ok' : 'info');
  }

  // Everything is read first and then changed in one batch (one Ctrl+Z undoes it all; inside a
  // batch HyperFormula gives no values): old subtotal rows out, the rows sorted, new ones in.
  function applySubtotals({ reg, header, at, cols, fn, sort, replace }) {
    const sheet = wb.sheet;
    const col = reg.c0 + at;
    const dateFmt = wb.metaFor(sheet).colFmt[col]?.date;
    const from = reg.r0 + (header ? 1 : 0);
    const old = replace ? subtotalRows(sheet, reg) : [];
    const skip = new Set(old);
    const data = []; // the data rows, as they will lie (from `from` on) once the old subtotals are gone
    for (let r = from; r <= reg.r1; r++) {
      if (skip.has(r)) continue;
      const v = wb.hf.getCellValue({ sheet, row: r, col });
      data.push({ key: keyOf(v, { dateFmt }), sk: sortValueKey(v) });
    }
    if (!data.length) return toast('Brak danych pod nagłówkiem.', 'warn');
    const order = data.map((_, i) => i);
    if (sort) order.sort((a, b) => compareSortKeys(data[a].sk, data[b].sk, true) || a - b);
    const to = from + data.length - 1;
    const keys = order.map((i) => ({ k: data[i].key.k, label: String(data[i].key.label) }));
    const plan = subtotalPlan({ from, to, keys, at: col, cols: cols.map((i) => reg.c0 + i), fn, lang: wb.lang });
    const height = wb.hf.getSheetDimensions(sheet).height - old.length;
    wb.hf.batch(() => {
      [...old].reverse().forEach((r) => wb.hf.removeRows(sheet, [r, 1]));
      if (sort) {
        const targetOf = Array.from({ length: height }, (_, i) => i);
        order.forEach((i, pos) => (targetOf[from + i] = from + pos));
        wb.hf.setRowOrder(sheet, targetOf);
      }
      for (const ins of plan.inserts) {
        wb.hf.addRows(sheet, [ins.row, 1]);
        for (const [c, v] of Object.entries(ins.cells)) wb.hf.setCellContents({ sheet, row: ins.row, col: Number(c) }, [[v]]);
      }
    });
    grid.changed();
    persist();
    const n = plan.groups.length;
    toast(`Dodano sumy częściowe dla ${n} ${n === 1 ? 'grupy' : 'grup'} i wynik końcowy`, 'ok');
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
    if (disposed) return;
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
