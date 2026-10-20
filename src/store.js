'use strict';
// Small JSON key/value store kept as one file per key under <userData>/store.
// Spreadsheets and code can get large, so they don't go into localStorage.
const fs = require('fs');
const path = require('path');

function fileFor(userData, key) {
  if (typeof key !== 'string' || !/^[\w.\-/]{1,160}$/.test(key) || key.includes('..')) {
    throw new Error('Nieprawidłowy klucz: ' + key);
  }
  return path.join(userData, 'store', key.replace(/\//g, '__') + '.json');
}

function readSync(userData, key) {
  try {
    return JSON.parse(fs.readFileSync(fileFor(userData, key), 'utf8'));
  } catch {
    return null;
  }
}

async function read(userData, key) {
  try {
    return JSON.parse(await fs.promises.readFile(fileFor(userData, key), 'utf8'));
  } catch {
    return null;
  }
}

// Writes go through a temp file and a rename, so a crash never leaves half a file.
const queues = new Map();
function write(userData, key, value) {
  const file = fileFor(userData, key);
  const prev = queues.get(file) || Promise.resolve();
  const next = prev.then(async () => {
    await fs.promises.mkdir(path.dirname(file), { recursive: true });
    const tmp = file + '.tmp';
    await fs.promises.writeFile(tmp, JSON.stringify(value));
    await fs.promises.rename(tmp, file);
  });
  queues.set(file, next.catch(() => {}));
  return next.then(() => true);
}

async function remove(userData, key) {
  try {
    await fs.promises.unlink(fileFor(userData, key));
  } catch {}
  return true;
}

module.exports = { read, readSync, write, remove };
