import { md } from '../lib.js';

export default {
  title: 'Sieci komputerowe',
  summary: 'Adresy IPv4 i IPv6, maska i prefiks, adres sieci i rozgłoszeniowy, liczba hostów, adresy prywatne, urządzenia sieciowe, protokoły: DNS, DHCP, HTTP(S), FTP, poczta, TCP i UDP.',
  minutes: 30,
  intro: md`
    - jak zbudowane są adresy IPv4 i IPv6 i ile mają bitów,
    - co znaczy maska (prefiks) i jak policzyć adres sieci oraz liczbę hostów,
    - które adresy są prywatne i po co jest NAT,
    - do czego służą najważniejsze protokoły i urządzenia sieciowe.
  `,
  steps: [
    {
      title: 'Adresy IPv4 i IPv6',
      body: md`
        Każde urządzenie w sieci IP ma **adres IP**.

        - **IPv4** ma **32 bity**, zapisywane jako cztery liczby 0–255 oddzielone kropkami (każda to 8 bitów, tzw. oktet), np. \`192.168.10.77\`. Adresów jest 2³² ≈ 4,3 mld – za mało dla wszystkich urządzeń na świecie.
        - **IPv6** ma **128 bitów**, zapisywane jako osiem grup po 4 cyfry szesnastkowe oddzielone dwukropkami, np. \`2001:0db8:0000:0000:0000:ff00:0042:8329\`. Zera wiodące w grupie można pominąć, a jeden ciąg grup zerowych zastąpić \`::\` → \`2001:db8::ff00:42:8329\`.

        Oprócz IP karta sieciowa ma **adres MAC** (48 bitów, zapisywany szesnastkowo, np. \`3C:52:82:1A:9F:07\`) – fizyczny adres używany w sieci lokalnej.

        > **Na maturze:** Pytanie z maja 2026 dotyczyło właśnie długości adresów: IPv4 – 32 bity, IPv6 – 128 bitów.
      `,
    },
    {
      title: 'Maska, sieć i hosty',
      body: md`
        Adres IPv4 dzieli się na część **sieci** i część **hosta** (urządzenia w tej sieci). Granicę wyznacza **maska**: jedynki w części sieci, zera w części hosta. Zapis z **prefiksem** \`/26\` oznacza 26 jedynek w masce:

        \`/26\` → \`11111111.11111111.11111111.11000000\` → \`255.255.255.192\`

        Dla adresu \`192.168.10.77/26\`:
        - **adres sieci** = adres AND maska: ostatni oktet 77 = \`01001101\`, AND \`11000000\` = \`01000000\` = 64 → **192.168.10.64**,
        - **adres rozgłoszeniowy** (broadcast) – same jedynki w części hosta → **192.168.10.127**,
        - **liczba hostów** = \`2^(32 − prefiks) − 2\` = 2⁶ − 2 = **62** (odejmujemy adres sieci i rozgłoszeniowy).

        | prefiks | maska | hostów |
        |---|---|---|
        | /24 | 255.255.255.0 | 254 |
        | /25 | 255.255.255.128 | 126 |
        | /26 | 255.255.255.192 | 62 |
        | /30 | 255.255.255.252 | 2 |

        Dwa urządzenia są w **tej samej sieci**, jeśli mają ten sam adres sieci (po zastosowaniu maski). Do komunikacji z innymi sieciami potrzebna jest **brama domyślna** (router).
      `,
    },
    {
      title: 'Adresy prywatne, urządzenia',
      body: md`
        **Adresy prywatne** są zarezerwowane dla sieci lokalnych i nie są widoczne w internecie:
        - \`10.0.0.0/8\` (10.x.x.x),
        - \`172.16.0.0/12\` (od 172.16.x.x do 172.31.x.x),
        - \`192.168.0.0/16\` (192.168.x.x).

        Domowy router zamienia je na jeden adres publiczny – to **NAT** (translacja adresów). Adres \`127.0.0.1\` (localhost) wskazuje na ten sam komputer.

        **Urządzenia:**
        - **przełącznik (switch)** – łączy urządzenia w jednej sieci lokalnej, kieruje ramki według adresów MAC,
        - **router** – łączy **różne sieci** i wybiera trasę pakietów według adresów IP,
        - **punkt dostępowy (access point)** – podłącza urządzenia bezprzewodowe (Wi-Fi).
      `,
    },
    {
      title: 'Protokoły i usługi',
      body: md`
        | protokół | do czego |
        |---|---|
        | **DNS** | zamiana nazw domenowych (np. \`cke.gov.pl\`) na adresy IP |
        | **DHCP** | automatyczne przydzielanie konfiguracji: adresu IP, maski, bramy, serwerów DNS |
        | **HTTP / HTTPS** | przesyłanie stron WWW; HTTPS – szyfrowane (TLS) |
        | **FTP** (i szyfrowane SFTP) | przesyłanie plików |
        | **SMTP** | **wysyłanie** poczty elektronicznej |
        | **POP3 / IMAP** | **odbieranie** poczty (IMAP trzyma pocztę na serwerze i synchronizuje) |
        | **SSH** | bezpieczne zdalne logowanie |
        | **TCP** | niezawodny przesył – potwierdzenia, kolejność, retransmisja (WWW, poczta, pliki) |
        | **UDP** | szybki przesył bez gwarancji (rozmowy, gry, strumienie, DNS) |

        Numery **portów** wskazują usługę na komputerze: HTTP – 80, HTTPS – 443, SSH – 22, SMTP – 25, DNS – 53.

        **Model warstwowy TCP/IP:** dostęp do sieci (Ethernet, Wi-Fi) → internet (IP) → transport (TCP, UDP) → aplikacji (HTTP, DNS, SMTP…). Każda warstwa korzysta z usług niższej.

        > **Na maturze:** Pytania prawda/fałsz o protokoły (np. maj 2024: HTTP, FTP, DHCP) sprawdzają, czy wiesz, **do czego** dany protokół służy – nauka tej tabeli wystarczy.
      `,
    },
  ],
  quiz: [
    {
      type: 'input',
      q: md`Podaj **adres sieci** dla adresu \`192.168.1.130/25\`.`,
      answer: ['192.168.1.128'],
      exact: true,
      explain: md`/25 → maska 255.255.255.128: w ostatnim oktecie zostaje tylko najstarszy bit. 130 = \`10000010\`, AND \`10000000\` = 128.`,
    },
    {
      type: 'input',
      q: md`Ile adresów hostów (urządzeń) można przydzielić w sieci \`172.16.32.0/20\`?`,
      answer: String(2 ** 12 - 2),
      explain: md`32 − 20 = 12 bitów na hosta: 2¹² − 2 = 4094.`,
    },
    {
      type: 'choice',
      q: md`Który protokół służy do **wysyłania** poczty elektronicznej?`,
      options: ['SMTP', 'POP3', 'DHCP', 'FTP'],
      answer: 0,
      explain: md`SMTP wysyła (i przekazuje między serwerami) pocztę. POP3 i IMAP służą do jej odbierania, DHCP – do przydzielania adresów, FTP – do przesyłania plików.`,
    },
    {
      type: 'tf',
      q: md`Oceń prawdziwość zdań.`,
      items: [
        { text: 'Adres IPv6 ma 128 bitów.', answer: true },
        { text: 'DNS to protokół przydzielający komputerom adresy IP.', answer: false },
        { text: 'Adres 172.20.1.1 należy do puli adresów prywatnych.', answer: true },
        { text: 'Router łączy różne sieci i przekazuje pakiety według adresów IP.', answer: true },
        { text: 'Maska 255.255.255.0 odpowiada prefiksowi /16.', answer: false },
      ],
      explain: md`
        - Tak.
        - Nie – to DHCP. DNS zamienia nazwy domen na adresy IP.
        - Tak – pula 172.16.0.0–172.31.255.255.
        - Tak.
        - Nie – 255.255.255.0 to 24 jedynki, czyli /24.
      `,
    },
    {
      type: 'choice',
      q: md`Komputery mają adresy \`192.168.0.5/30\` i \`192.168.0.9/30\`. Czy są w tej samej sieci?`,
      options: ['nie – pierwszy jest w sieci 192.168.0.4, drugi w 192.168.0.8', 'tak – oba zaczynają się od 192.168.0', 'tak – maska jest taka sama', 'nie da się tego stwierdzić'],
      answer: 0,
      explain: md`/30 zostawia 2 bity na hosta – sieci mają po 4 adresy: …0.4–0.7 i …0.8–0.11. Adresy sieci są różne, więc to różne sieci (potrzebny router).`,
    },
  ],
  practice: ['2024-maj/5', '2026-maj/6'],
};
