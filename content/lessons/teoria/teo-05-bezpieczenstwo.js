import { md } from '../lib.js';

export default {
  title: 'Bezpieczeństwo i kryptografia',
  summary: 'Szyfrowanie symetryczne i asymetryczne, klucz publiczny i prywatny, podpis cyfrowy, funkcje skrótu, certyfikaty, hasła i uwierzytelnianie dwuskładnikowe, złośliwe oprogramowanie i ataki.',
  minutes: 30,
  intro: md`
    - czym różni się szyfrowanie symetryczne od asymetrycznego i którego klucza używa się do czego,
    - jak działa podpis cyfrowy i do czego służą funkcje skrótu oraz certyfikaty,
    - jak chronić konta: hasła i uwierzytelnianie dwuskładnikowe,
    - rodzaje złośliwego oprogramowania i ataków oraz jak się przed nimi bronić.
  `,
  steps: [
    {
      title: 'Szyfrowanie symetryczne i asymetryczne',
      body: md`
        **Szyfrowanie symetryczne:** ten sam **klucz** szyfruje i odszyfrowuje (np. AES, a z prostych – szyfr Cezara). Jest szybkie, ale obie strony muszą znać klucz – a jak go bezpiecznie przekazać przez niezaufaną sieć?

        **Szyfrowanie asymetryczne** (z kluczem publicznym, np. RSA): każda osoba ma **parę kluczy**:
        - **klucz publiczny** – można go dać każdemu,
        - **klucz prywatny** – zna go tylko właściciel.

        Co jest zaszyfrowane jednym kluczem z pary, da się odszyfrować tylko drugim. Stąd dwie reguły:

        | cel | czym szyfruje nadawca | czym odszyfrowuje odbiorca |
        |---|---|---|
        | **poufność** – tylko B ma przeczytać wiadomość od A | kluczem **publicznym B** | B swoim kluczem **prywatnym** |
        | **podpis** – B ma mieć pewność, że wiadomość jest od A | kluczem **prywatnym A** | każdy kluczem **publicznym A** |

        W praktyce (np. HTTPS) łączy się oba: asymetrycznie uzgadnia się jednorazowy klucz symetryczny, a dalej szyfruje się szybko symetrycznie.

        > **Na maturze:** Pytania prawda/fałsz o to, który klucz osoby A służy do czego (maj 2023), rozwiązuje ta tabela. Zasada: **prywatnym** podpisuję i odszyfrowuję to, co dostaję; **publicznym** szyfruję dla kogoś i sprawdzam jego podpis.
      `,
    },
    {
      title: 'Skróty, podpis cyfrowy, certyfikaty',
      body: md`
        **Funkcja skrótu** (hash, np. SHA-256) zamienia dowolne dane na krótki ciąg o stałej długości. Własności:
        - **jednokierunkowa** – ze skrótu nie da się odtworzyć danych,
        - drobna zmiana danych zmienia skrót całkowicie,
        - praktycznie nie da się znaleźć dwóch różnych danych o tym samym skrócie.

        Skróty służą do sprawdzania **integralności** (czy plik się nie zmienił) i przechowywania haseł (serwer trzyma skrót hasła z dodatkiem losowej „soli”, a nie samo hasło).

        **Podpis cyfrowy** = skrót dokumentu zaszyfrowany **kluczem prywatnym** nadawcy. Odbiorca liczy skrót sam, odszyfrowuje podpis kluczem publicznym nadawcy i porównuje. Zgodność dowodzi, że dokument pochodzi od właściciela klucza (**autentyczność**) i nie został zmieniony (**integralność**). Podpis **nie** szyfruje treści – każdy może ją przeczytać.

        **Certyfikat** to zaświadczenie wydane przez zaufany urząd certyfikacji (CA), że dany klucz publiczny należy do danej osoby lub strony (np. \`bank.pl\`). Przeglądarka sprawdza certyfikat przy połączeniu HTTPS – kłódka oznacza szyfrowane połączenie z serwerem o potwierdzonej nazwie, a **nie** to, że strona jest uczciwa.
      `,
    },
    {
      title: 'Hasła i uwierzytelnianie dwuskładnikowe',
      body: md`
        **Silne hasło** jest **długie** i nieprzewidywalne. Każdy dodatkowy znak mnoży liczbę możliwości przez rozmiar alfabetu: hasło z 8 małych liter ma 26⁸ ≈ 2·10¹¹ możliwości, z 10 liter – 26¹⁰, czyli 676 razy więcej. Nie używaj tego samego hasła w wielu miejscach – wyciek z jednego serwisu otworzy wtedy wszystkie. Pomaga **menedżer haseł**.

        **Uwierzytelnianie dwuskładnikowe (2FA)** wymaga dwóch różnych rodzajów dowodu tożsamości:
        - **coś, co wiesz** – hasło, PIN,
        - **coś, co masz** – telefon (kod SMS, aplikacja z kodami), klucz sprzętowy,
        - **coś, czym jesteś** – odcisk palca, twarz.

        2FA bardzo utrudnia przejęcie konta, ale **nie gwarantuje** pełnego bezpieczeństwa (np. wyłudzenie kodu przez fałszywą stronę, kradzież telefonu). Nie wymaga też specjalnego sprzętu – kody z aplikacji czy SMS działają na zwykłym telefonie.
      `,
    },
    {
      title: 'Złośliwe oprogramowanie i ataki',
      body: md`
        | nazwa | co robi |
        |---|---|
        | **wirus** | dołącza się do plików/programów i rozprzestrzenia przy ich uruchamianiu |
        | **robak** | rozprzestrzenia się sam przez sieć, bez udziału użytkownika |
        | **koń trojański** | udaje przydatny program, a w tle robi coś szkodliwego |
        | **ransomware** | szyfruje pliki ofiary i żąda okupu za klucz |
        | **spyware** | szpieguje użytkownika (historia, dane) |
        | **keylogger** | rejestruje naciśnięte klawisze (np. hasła) |
        | **adware** | wyświetla niechciane reklamy |
        | **rootkit** | ukrywa obecność intruza w systemie |
        | **botnet** | sieć zainfekowanych komputerów sterowanych zdalnie (np. do ataków DDoS) |

        **Ataki bez złośliwego programu:**
        - **phishing** – fałszywa wiadomość lub strona podszywająca się pod bank czy serwis, by wyłudzić dane logowania,
        - **socjotechnika** – manipulacja ludźmi (np. telefon „z działu IT” z prośbą o hasło),
        - **DDoS** – zalewanie serwera ogromną liczbą żądań z wielu komputerów, aż przestanie działać,
        - **atak siłowy (brute force)** – zgadywanie hasła przez sprawdzanie wszystkich możliwości,
        - **man-in-the-middle** – podsłuch i modyfikacja komunikacji między dwiema stronami.

        **Ochrona:** aktualizacje systemu i programów, program antywirusowy, **zapora sieciowa (firewall)** filtrująca ruch, **kopie zapasowe** (najlepiej kilka, w tym jedna poza komputerem – chronią przed ransomware), ostrożność wobec linków i załączników, konta bez uprawnień administratora na co dzień.
      `,
    },
  ],
  quiz: [
    {
      type: 'choice',
      q: md`Anna chce wysłać Bartkowi wiadomość, którą przeczyta **tylko** Bartek. Którym kluczem powinna ją zaszyfrować?`,
      options: ['kluczem publicznym Bartka', 'kluczem prywatnym Bartka', 'swoim kluczem prywatnym', 'swoim kluczem publicznym'],
      answer: 0,
      explain: md`Odszyfrować ją będzie mógł tylko posiadacz pary – Bartek, swoim kluczem prywatnym. Klucza prywatnego Bartka Anna nie zna (i nie powinna znać), a szyfrowanie jej prywatnym kluczem to podpis – odszyfruje go każdy.`,
    },
    {
      type: 'choice',
      q: md`Którym kluczem **tworzy się** podpis cyfrowy dokumentu?`,
      options: ['kluczem prywatnym podpisującego', 'kluczem publicznym podpisującego', 'kluczem publicznym odbiorcy', 'kluczem prywatnym odbiorcy'],
      answer: 0,
      explain: md`Podpis zna tylko podpisujący (klucz prywatny), a sprawdzić go może każdy – kluczem publicznym podpisującego.`,
    },
    {
      type: 'tf',
      q: md`Oceń prawdziwość zdań.`,
      items: [
        { text: 'Ze skrótu (hash) hasła da się łatwo odtworzyć hasło.', answer: false },
        { text: 'Ransomware szyfruje pliki ofiary i żąda okupu.', answer: true },
        { text: 'Uwierzytelnianie dwuskładnikowe całkowicie wyklucza przejęcie konta.', answer: false },
        { text: 'Zapora sieciowa (firewall) filtruje ruch sieciowy według ustalonych reguł.', answer: true },
        { text: 'Robak potrafi rozprzestrzeniać się przez sieć bez udziału użytkownika.', answer: true },
      ],
      explain: md`
        - Nie – funkcja skrótu jest jednokierunkowa (można co najwyżej zgadywać hasła i porównywać skróty).
        - Tak.
        - Nie – bardzo utrudnia, ale nie gwarantuje (np. wyłudzenie kodu, kradzież telefonu).
        - Tak.
        - Tak – tym różni się od wirusa.
      `,
    },
    {
      type: 'choice',
      q: md`Wiadomość e-mail „z banku” prosi o pilne zalogowanie się przez podany link, a strona wygląda jak bankowa, ale ma inny adres. To przykład:`,
      options: ['phishingu', 'ataku DDoS', 'keyloggera', 'ataku siłowego'],
      answer: 0,
      explain: md`Podszywanie się pod zaufaną instytucję, by wyłudzić dane logowania, to phishing. Zawsze sprawdzaj adres strony i nie loguj się z linków w wiadomościach.`,
    },
    {
      type: 'input',
      q: md`Ile razy więcej możliwych haseł jest wśród haseł złożonych z **10** małych liter alfabetu angielskiego (26 liter) niż wśród haseł z **8** takich liter?`,
      answer: String(26 * 26),
      explain: md`26¹⁰ / 26⁸ = 26² = 676. Każdy dodatkowy znak mnoży liczbę możliwości przez 26 – dlatego długość hasła jest tak ważna.`,
    },
  ],
  practice: ['2023-maj/4', '2025-maj/4', '2026-czerwiec/6'],
};
