import { md, code } from '../lib.js';

const to = (n, b) => n.toString(b).toUpperCase();

export default {
  questions: [
    {
      lesson: 'teo-01-systemy',
      type: 'input',
      q: md`Zapisz liczbę **300** w systemie szesnastkowym.`,
      answer: [to(300, 16)],
      exact: true,
      explain: md`300 = 1·256 + 2·16 + 12 → cyfry 1, 2, C: **12C₁₆**.`,
    },
    {
      lesson: 'teo-01-systemy',
      type: 'input',
      q: md`Zamień \`101101₂\` na system ósemkowy.`,
      answer: [to(0b101101, 8)],
      exact: true,
      explain: md`Trójki od prawej: \`101 101\` → 5, 5: **55₈** (= 45).`,
    },
    {
      lesson: 'teo-01-systemy',
      type: 'choice',
      q: md`Która z liczb jest **największa**?`,
      options: ['`1000001₂`', '`77₈`', '`2101₃`', '`3F₁₆`'],
      answer: 0,
      explain: md`\`1000001₂\` = 64 + 1 = **65**, \`77₈\` = 7·8 + 7 = 63, \`2101₃\` = 54 + 9 + 1 = 64, \`3F₁₆\` = 3·16 + 15 = 63. Największa jest pierwsza.`,
    },
    {
      lesson: 'teo-02-dzialania',
      type: 'input',
      q: md`Oblicz \`222₃ + 111₃\`. Wynik zapisz w systemie trójkowym.`,
      answer: [to(parseInt('222', 3) + parseInt('111', 3), 3)],
      exact: true,
      explain: md`2+1 = 3 → 0, przeniesienie w każdej kolumnie: **1110₃** (26 + 13 = 39 ✓).`,
    },
    {
      lesson: 'teo-02-dzialania',
      type: 'input',
      q: md`Oblicz \`1101₂ · 11₂\`. Wynik zapisz w systemie dwójkowym.`,
      answer: [to(0b1101 * 0b11, 2)],
      exact: true,
      explain: md`\`1101 + 11010 = 100111₂\` (13 · 3 = 39).`,
    },
    {
      lesson: 'teo-03-bity-logika-kolory',
      type: 'input',
      q: md`Jaką liczbę dziesiętną oznacza 8-bitowy zapis w kodzie U2 \`11111111\`?`,
      answer: '-1',
      explain: md`−128 + 127 = −1. Same jedynki w U2 to zawsze −1.`,
    },
    {
      lesson: 'teo-03-bity-logika-kolory',
      type: 'input',
      q: md`Kolor ma zapis \`#C80000\`. Ile wynosi jego składowa **czerwona** w systemie dziesiętnym?`,
      answer: String(0xc8),
      explain: md`\`C8₁₆\` = 12·16 + 8 = 200.`,
    },
    {
      lesson: 'teo-04-sieci',
      type: 'input',
      q: md`Podaj adres sieci dla adresu \`10.1.1.200/27\`.`,
      answer: ['10.1.1.192'],
      exact: true,
      explain: md`/27 → w ostatnim oktecie 3 bity sieci (maska 224). 200 = \`11001000\`, AND \`11100000\` = \`11000000\` = 192.`,
    },
    {
      lesson: 'teo-04-sieci',
      type: 'tf',
      q: md`Oceń prawdziwość zdań.`,
      items: [
        { text: 'DHCP przydziela komputerom m.in. adres IP i adres bramy domyślnej.', answer: true },
        { text: 'FTP zamienia nazwy domenowe na adresy IP.', answer: false },
        { text: 'W sieci /27 można zaadresować 30 hostów.', answer: true },
      ],
      explain: md`Nazwy domen zamienia DNS; FTP służy do przesyłania plików. W /27 zostaje 5 bitów na hosta: 2⁵ − 2 = 30.`,
    },
    {
      lesson: 'teo-05-bezpieczenstwo',
      type: 'choice',
      q: md`Bartek odbiera dokument podpisany cyfrowo przez Annę. Którego klucza użyje, żeby **sprawdzić** podpis?`,
      options: ['klucza publicznego Anny', 'klucza prywatnego Anny', 'swojego klucza prywatnego', 'swojego klucza publicznego'],
      answer: 0,
      explain: md`Anna podpisuje swoim kluczem prywatnym, a każdy sprawdza podpis jej kluczem publicznym.`,
    },
    {
      lesson: 'teo-05-bezpieczenstwo',
      type: 'choice',
      q: md`Program, który rejestruje naciskane klawisze, żeby przechwycić np. hasła, to:`,
      options: ['keylogger', 'ransomware', 'robak', 'adware'],
      answer: 0,
      explain: md`Keylogger zapisuje naciśnięcia klawiszy. Ransomware szyfruje pliki dla okupu, robak sam rozprzestrzenia się po sieci, adware wyświetla reklamy.`,
    },
    {
      lesson: 'teo-06-grafika-prawo',
      type: 'input',
      q: md`Ile bajtów zajmie nieskompresowany obraz 640 × 480 pikseli o głębi koloru 16 bitów?`,
      answer: String((640 * 480 * 16) / 8),
      explain: md`640 · 480 · 16 / 8 = 614 400 bajtów (2 bajty na piksel).`,
    },
    {
      lesson: 'teo-06-grafika-prawo',
      type: 'tf',
      q: md`Oceń prawdziwość zdań.`,
      items: [
        { text: 'Format JPG obsługuje przezroczyste tło.', answer: false },
        { text: 'Ochrona prawa autorskiego przysługuje twórcy niezależnie od rejestracji utworu.', answer: true },
        { text: 'Freeware oznacza, że program nie jest chroniony prawem autorskim.', answer: false },
      ],
      explain: md`JPG nie ma przezroczystości (ma ją PNG i – dla jednego koloru – GIF). Prawa autorskie powstają automatycznie. Freeware to darmowa licencja, a nie brak praw autorskich.`,
    },
    {
      lesson: 'teo-03-bity-logika-kolory',
      type: 'code',
      q: md`Wczytaj liczbę całkowitą \`x\` z przedziału [−128, 127] i wypisz jej 8-bitowy zapis w kodzie U2 (osiem znaków 0/1).`,
      tests: [
        { input: '-5\n', output: '11111011\n' },
        { input: '5\n', output: '00000101\n' },
        { input: '-128\n', output: '10000000\n' },
        { input: '127\n', output: '01111111\n' },
        { input: '-1\n', output: '11111111\n' },
        { input: '0\n', output: '00000000\n' },
      ],
      solution: {
        python: code`
          x = int(input())
          if x < 0:
              x += 256
          s = ""
          for _ in range(8):
              s = str(x % 2) + s
              x //= 2
          print(s)
        `,
        cpp: code`
          #include <iostream>
          #include <string>
          using namespace std;

          int main() {
              int x;
              cin >> x;
              if (x < 0) x += 256;
              string s = "";
              for (int i = 0; i < 8; i++) {
                  s = char('0' + x % 2) + s;
                  x /= 2;
              }
              cout << s << endl;
              return 0;
          }
        `,
        java: code`
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  Scanner sc = new Scanner(System.in);
                  int x = sc.nextInt();
                  if (x < 0) x += 256;
                  StringBuilder s = new StringBuilder();
                  for (int i = 0; i < 8; i++) {
                      s.insert(0, x % 2);
                      x /= 2;
                  }
                  System.out.println(s);
              }
          }
        `,
      },
      explain: md`Zapis U2 liczby ujemnej \`x\` na 8 bitach to zwykły zapis binarny liczby \`x + 256\` (2⁸). Potem 8 kolejnych reszt z dzielenia przez 2, z zerami wiodącymi.`,
    },
  ],
};
