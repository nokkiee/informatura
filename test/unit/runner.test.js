'use strict';
// How detected toolchains are named on the home and settings screens.
const test = require('node:test');
const assert = require('node:assert');
const { compilerVersion } = require('../../src/runner.js');

test('C++ compilers are shown as name and version, like Python and Java', () => {
  const cases = [
    ['g++ (Ubuntu 15.2.0-16ubuntu1) 15.2.0', 'g++ 15.2.0'],
    ['g++ (GCC) 13.2.1 20230801', 'g++ 13.2.1'],
    ['g++.exe (Rev2, Built by MSYS2 project) 14.2.0', 'g++ 14.2.0'],
    ['g++ (x86_64-posix-seh-rev0, Built by MinGW-Builds project) 13.2.0', 'g++ 13.2.0'],
    ['g++ (Debian 12.2.0-14+deb12u1) 12.2.0', 'g++ 12.2.0'],
    ['Ubuntu clang version 18.1.3 (1ubuntu1)', 'clang++ 18.1.3'],
    ['Apple clang version 15.0.0 (clang-1500.3.9.4)', 'clang++ 15.0.0'],
    ['some compiler without a version', 'some compiler without a version'],
  ];
  for (const [first, want] of cases) assert.strictEqual(compilerVersion(first), want, first);
});
