'use strict';
const { contextBridge, ipcRenderer } = require('electron');

const listeners = new Set();
ipcRenderer.on('run:event', (_e, ev) => {
  for (const fn of listeners) fn(ev);
});

contextBridge.exposeInMainWorld('api', {
  detectToolchains: (force) => ipcRenderer.invoke('toolchains:detect', force),
  run: (spec) => ipcRenderer.invoke('run:start', spec),
  sendStdin: (id, text) => ipcRenderer.invoke('run:stdin', id, text),
  kill: (id) => ipcRenderer.invoke('run:kill', id),
  runTests: (spec) => ipcRenderer.invoke('run:tests', spec),
  onRunEvent: (fn) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  listWorkspace: (key) => ipcRenderer.invoke('ws:list', key),
  readWorkspaceFile: (key, name) => ipcRenderer.invoke('ws:read', key, name),
  openWorkspace: (key) => ipcRenderer.invoke('ws:open', key),
  storeGet: (key) => ipcRenderer.invoke('store:get', key),
  storeSet: (key, value) => ipcRenderer.invoke('store:set', key, value),
  storeDel: (key) => ipcRenderer.invoke('store:del', key),
  openPdf: (rel, page) => ipcRenderer.invoke('pdf:open', rel, page),
  appInfo: () => ipcRenderer.invoke('app:info'),
});
