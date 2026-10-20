// Charts for the spreadsheet (Chart.js), built from a cell range.
import { displayValue } from './engine.js';
import { loadUmd } from '../ui.js';

export async function loadChartJs() {
  await loadUmd('vendor/chartjs/chart.umd.min.js');
  return window.Chart;
}

export const CHART_TYPES = [
  ['column', 'Kolumnowy'],
  ['stacked', 'Kolumnowy skumulowany'],
  ['bar', 'Słupkowy (poziomy)'],
  ['line', 'Liniowy'],
  ['scatter', 'Punktowy (XY)'],
  ['pie', 'Kołowy'],
];

const PALETTE = ['#4f8ff7', '#f2994a', '#56c271', '#e5534b', '#a371f7', '#d4b106', '#2bb3c0', '#ec6cb9', '#8d99ae', '#6c8a3f'];

// Reads the range: first row = series names when it holds text, first column = categories when it holds text/dates.
export function chartData(wb, cfg) {
  const { hf } = wb;
  const sheet = hf.getSheetId(cfg.sheet);
  if (sheet === undefined) return null;
  const { r0, c0, r1, c1 } = cfg.range;
  const cell = (r, c) => {
    const a = { sheet, row: r, col: c };
    const v = hf.getCellValue(a);
    return { v, type: typeof v === 'number' ? hf.getCellValueDetailedType(a) : null, text: displayValue(v, typeof v === 'number' ? hf.getCellValueDetailedType(a) : null, wb.metaFor(sheet).colFmt[c], wb.lang) };
  };
  const firstRowText = (() => {
    for (let c = c0; c <= c1; c++) {
      const x = cell(r0, c);
      if (typeof x.v === 'string') return true;
    }
    return false;
  })();
  const dr0 = firstRowText ? r0 + 1 : r0;
  const firstColLabels = (() => {
    if (c1 === c0) return false;
    if (cfg.type === 'scatter') return false;
    for (let r = dr0; r <= r1; r++) {
      const x = cell(r, c0);
      if (typeof x.v === 'string' || String(x.type).startsWith('NUMBER_DATE') || wb.metaFor(sheet).colFmt[c0]?.date) return true;
    }
    return cfg.firstColLabels ?? false;
  })();
  const sc0 = firstColLabels || cfg.type === 'scatter' ? c0 + 1 : c0;
  const labels = [];
  for (let r = dr0; r <= r1; r++) labels.push(firstColLabels || cfg.type === 'scatter' ? cell(r, c0).text : String(r - dr0 + 1));
  const series = [];
  for (let c = sc0; c <= c1; c++) {
    const name = firstRowText ? cell(r0, c).text : `Seria ${c - sc0 + 1}`;
    const values = [];
    for (let r = dr0; r <= r1; r++) {
      const v = cell(r, c).v;
      values.push(typeof v === 'number' ? v : null);
    }
    series.push({ name, values });
  }
  const xs = cfg.type === 'scatter' ? Array.from({ length: r1 - dr0 + 1 }, (_, i) => cell(dr0 + i, c0).v) : null;
  return { labels, series, xs };
}

export async function drawChart(canvas, wb, cfg, prev) {
  const Chart = await loadChartJs();
  prev?.destroy();
  const data = chartData(wb, cfg);
  if (!data) return null;
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const text = css('--text') || '#ddd';
  const grid = css('--border') || '#444';
  Chart.defaults.color = text;
  Chart.defaults.font.family = 'system-ui, "Segoe UI", Ubuntu, sans-serif';
  const type = cfg.type === 'column' || cfg.type === 'stacked' || cfg.type === 'bar' ? 'bar' : cfg.type;
  const stacked = cfg.type === 'stacked';
  let datasets;
  if (cfg.type === 'pie') {
    datasets = [{ label: data.series[0]?.name, data: data.series[0]?.values || [], backgroundColor: data.labels.map((_, i) => PALETTE[i % PALETTE.length]) }];
  } else if (cfg.type === 'scatter') {
    datasets = data.series.map((s, i) => ({ label: s.name, data: s.values.map((y, k) => ({ x: data.xs[k], y })), backgroundColor: PALETTE[i % PALETTE.length], borderColor: PALETTE[i % PALETTE.length] }));
  } else {
    datasets = data.series.map((s, i) => ({ label: s.name, data: s.values, backgroundColor: PALETTE[i % PALETTE.length], borderColor: PALETTE[i % PALETTE.length], borderWidth: type === 'line' ? 2 : 0, pointRadius: type === 'line' ? 2 : undefined }));
  }
  const axis = (title, stack) => ({ stacked: stack, title: { display: !!title, text: title, color: text }, grid: { color: grid }, ticks: { color: text } });
  const scales =
    cfg.type === 'pie'
      ? {}
      : cfg.type === 'bar'
        ? { y: axis(cfg.xTitle, stacked), x: axis(cfg.yTitle, stacked) }
        : { x: { ...axis(cfg.xTitle, stacked), type: cfg.type === 'scatter' ? 'linear' : 'category' }, y: axis(cfg.yTitle, stacked) };
  return new Chart(canvas, {
    type,
    data: { labels: cfg.type === 'scatter' ? undefined : data.labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      locale: 'pl-PL',
      animation: false,
      indexAxis: cfg.type === 'bar' ? 'y' : 'x',
      plugins: {
        title: { display: !!cfg.title, text: cfg.title, color: text, font: { size: 15, weight: '600' } },
        legend: { display: cfg.legend !== false, position: 'bottom', labels: { color: text } },
      },
      scales,
    },
  });
}
