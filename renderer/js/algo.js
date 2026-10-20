// Code templates and test generation for the user's programs.

export const LANGS = {
  python: { label: 'Python', monaco: 'python', ext: 'py', run: 'python3 zadanie.py' },
  cpp: { label: 'C++', monaco: 'cpp', ext: 'cpp', run: 'g++ zadanie.cpp && ./zadanie' },
  java: { label: 'Java', monaco: 'java', ext: 'java', run: 'javac Main.java && java Main' },
};

// ---- templates for tasks that work on data files -------------------------------------------

export function dataTemplate(lang, { file, title }) {
  const f = file || 'dane.txt';
  if (lang === 'python') {
    return `# ${title}
# Plik ${f} leży w folderze roboczym programu.

with open("${f}") as plik:
    dane = [wiersz.strip() for wiersz in plik]

wynik = 0

print(wynik)
`;
  }
  if (lang === 'cpp') {
    return `// ${title}
// Plik ${f} leży w folderze roboczym programu.
#include <iostream>
#include <fstream>
#include <string>
#include <vector>
using namespace std;

int main() {
    ifstream plik("${f}");
    vector<string> dane;
    string wiersz;
    while (getline(plik, wiersz)) {
        if (!wiersz.empty() && wiersz.back() == '\\r') wiersz.pop_back();
        dane.push_back(wiersz);
    }

    int wynik = 0;

    cout << wynik << endl;
    return 0;
}
`;
  }
  return `// ${title}
// Plik ${f} leży w folderze roboczym programu.
import java.io.*;
import java.nio.file.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        List<String> dane = new ArrayList<>();
        for (String wiersz : Files.readAllLines(Path.of("${f}"))) dane.add(wiersz.strip());

        int wynik = 0;

        System.out.println(wynik);
    }
}
`;
}

export function scratchTemplate(lang) {
  if (lang === 'python') return '# Brudnopis – tu możesz sprawdzić swoje obliczenia.\n\nprint(2 ** 10)\n';
  if (lang === 'cpp') return '// Brudnopis – tu możesz sprawdzić swoje obliczenia.\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << (1 << 10) << endl;\n    return 0;\n}\n';
  return '// Brudnopis – tu możesz sprawdzić swoje obliczenia.\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println(1 << 10);\n    }\n}\n';
}

// ---- algorithm tasks: stdin/stdout harness -----------------------------------------------
// Inputs come on stdin, one value per line (arrays: space-separated on one line).
// Outputs go to stdout, one value per line.

const isArr = (t) => t.endsWith('[]');
const base = (t) => t.replace('[]', '');

function pyRead(v) {
  const t = v.type;
  if (isArr(t)) return `${v.name} = ${base(t) === 'int' ? 'list(map(int, input().split()))' : base(t) === 'float' ? 'list(map(float, input().split()))' : 'input().split()'}`;
  if (t === 'int') return `${v.name} = int(input())`;
  if (t === 'float') return `${v.name} = float(input())`;
  return `${v.name} = input().strip()`;
}

function cppType(t) {
  const b = base(t);
  const s = b === 'int' ? 'long long' : b === 'float' ? 'double' : 'string';
  return isArr(t) ? `vector<${s}>` : s;
}

function javaType(t) {
  const b = base(t);
  const s = b === 'int' ? 'long' : b === 'float' ? 'double' : 'String';
  return isArr(t) ? `${s}[]` : s;
}

function javaRead(t) {
  const b = base(t);
  return b === 'int' ? 'sc.nextLong()' : b === 'float' ? 'sc.nextDouble()' : 'sc.next()';
}

function zero(lang, t) {
  const b = base(t);
  if (isArr(t)) return lang === 'python' ? '[]' : lang === 'cpp' ? '{}' : `new ${javaType(t).replace('[]', '[0]')}`;
  if (b === 'str') return '""';
  if (b === 'float') return '0.0';
  return '0';
}

function describe(vars, prefix) {
  return vars.map((v) => `${prefix}  ${v.name}${v.desc ? ' – ' + v.desc : ''}`).join('\n');
}

export function algoTemplate(lang, algo, title) {
  if (algo.template?.[lang]) return algo.template[lang];
  const ins = algo.inputs || [];
  const outs = algo.outputs || [];
  const sizeOf = (v) => v.size || (ins.find((x) => x.type === 'int' && x !== v) || {}).name || 'n';
  if (lang === 'python') {
    return `# ${title}
# Dane (wczytywane z wejścia, każda w osobnym wierszu):
${describe(ins, '#')}
# Wynik (wypisz, każdy w osobnym wierszu):
${describe(outs, '#')}

${ins.map(pyRead).join('\n')}

# --- Twój algorytm ---
${outs.map((v) => `${v.name} = ${zero('python', v.type)}`).join('\n')}

${outs.map((v) => (isArr(v.type) ? `print(*${v.name})` : `print(${v.name})`)).join('\n')}
`;
  }
  if (lang === 'cpp') {
    const reads = ins
      .map((v) =>
        isArr(v.type)
          ? `    ${cppType(v.type)} ${v.name}(${sizeOf(v)});\n    for (auto &x : ${v.name}) cin >> x;`
          : `    ${cppType(v.type)} ${v.name};\n    cin >> ${v.name};`,
      )
      .join('\n');
    const prints = outs
      .map((v) => (isArr(v.type) ? `    for (size_t i = 0; i < ${v.name}.size(); i++) cout << ${v.name}[i] << (i + 1 < ${v.name}.size() ? " " : "");\n    cout << endl;` : `    cout << ${v.name} << endl;`))
      .join('\n');
    return `// ${title}
// Dane (wczytywane z wejścia):
${describe(ins, '//')}
// Wynik (wypisz, każdy w osobnym wierszu):
${describe(outs, '//')}
#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
${reads}

    // --- Twój algorytm ---
${outs.map((v) => `    ${cppType(v.type)} ${v.name} = ${zero('cpp', v.type)};`).join('\n')}

${prints}
    return 0;
}
`;
  }
  const reads = ins
    .map((v) =>
      isArr(v.type)
        ? `        ${javaType(v.type)} ${v.name} = new ${javaType(v.type).replace('[]', '')}[(int) ${sizeOf(v)}];\n        for (int i = 0; i < ${v.name}.length; i++) ${v.name}[i] = ${javaRead(v.type)};`
        : `        ${javaType(v.type)} ${v.name} = ${javaRead(v.type)};`,
    )
    .join('\n');
  const prints = outs
    .map((v) =>
      isArr(v.type)
        ? `        StringBuilder sb = new StringBuilder();\n        for (int i = 0; i < ${v.name}.length; i++) sb.append(i > 0 ? " " : "").append(${v.name}[i]);\n        System.out.println(sb);`
        : `        System.out.println(${v.name});`,
    )
    .join('\n');
  return `// ${title}
// Dane (wczytywane z wejścia):
${describe(ins, '//')}
// Wynik (wypisz, każdy w osobnym wierszu):
${describe(outs, '//')}
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
${reads}

        // --- Twój algorytm ---
${outs.map((v) => `        ${javaType(v.type)} ${v.name} = ${zero('java', v.type)};`).join('\n')}

${prints}
    }
}
`;
}

// ---- tests -------------------------------------------------------------------------------

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function rng(seed) {
  const r = mulberry32(seed);
  const api = {
    float: r,
    int: (a, b) => a + Math.floor(r() * (b - a + 1)),
    pick: (arr) => arr[Math.floor(r() * arr.length)],
    str: (len, alphabet = 'abcdefghijklmnopqrstuvwxyz') => Array.from({ length: len }, () => alphabet[Math.floor(r() * alphabet.length)]).join(''),
    arr: (n, fn) => Array.from({ length: n }, (_, i) => fn(i)),
  };
  return api;
}

function hashStr(s) {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

const fmtVal = (v) => (Array.isArray(v) ? v.join(' ') : String(v));

export function serializeInput(values) {
  return values.map(fmtVal).join('\n') + '\n';
}

// values: one entry per output variable.
export function serializeOutput(values) {
  return values.map(fmtVal).join('\n');
}

// Official examples first, then generated cases checked against the reference solution.
export function buildTests(algo, key) {
  const tests = [];
  for (const ex of algo.examples || []) {
    tests.push({ input: serializeInput(ex.in), expected: serializeOutput(ex.out), official: true, args: ex.in });
  }
  if (algo.ref && algo.gen) {
    const r = rng(hashStr(key));
    const seen = new Set(tests.map((t) => t.input));
    let guard = 0;
    while (tests.length < (algo.examples?.length || 0) + (algo.random || 10) && guard++ < 500) {
      const args = algo.gen(r);
      const input = serializeInput(args);
      if (seen.has(input)) continue;
      seen.add(input);
      const out = algo.ref(...args.map((a) => (Array.isArray(a) ? [...a] : a)));
      const outs = (algo.outputs?.length || 1) === 1 ? [out] : out;
      tests.push({ input, expected: serializeOutput(outs), official: false, args });
    }
  }
  return tests;
}

// ---- "no built-in conversions" hints -------------------------------------------------------

const BANNED = {
  conversion: {
    python: [/\bbin\s*\(/, /\boct\s*\(/, /\bhex\s*\(/, /\bint\s*\([^()]*,\s*\w+\s*\)/, /\bformat\s*\(/, /:\s*[bxo]\s*\}/, /\.bit_length\s*\(/, /\.bit_count\s*\(/, /\bstr\s*\(/, /\blen\s*\(/],
    cpp: [/\bbitset\s*</, /\bto_string\s*\(/, /\bstoi\s*\(/, /\bstoll\s*\(/, /\bstrtol\s*\(/, /__builtin_/, /\bstd::format\b/],
    java: [/toBinaryString/, /toOctalString/, /toHexString/, /\.toString\s*\([^)]*,/, /parse(Int|Long)\s*\([^)]*,/, /bitCount/, /BigInteger/, /String\.valueOf/, /Integer\.toString/],
  },
};

export function bannedUses(kind, lang, code) {
  const list = BANNED[kind]?.[lang] || [];
  const found = [];
  const lines = code.split('\n');
  lines.forEach((l, i) => {
    const s = l.replace(/(#|\/\/).*$/, '');
    for (const re of list) {
      const m = s.match(re);
      if (m) found.push({ line: i + 1, text: m[0].trim() });
    }
  });
  return found;
}
