// Data for the spreadsheet lessons (fixed; generated once).

// a small shop: product, price, quantity (lesson 1)
export const SKLEP = [
  ["produkt", "cena", "ilosc"],
  ["chleb", 4.5, 10],
  ["mleko", 3.2, 24],
  ["ser", 12.9, 5],
  ["jablka", 5.8, 12],
  ["maslo", 7.49, 8],
  ["jajka", 0.89, 60],
  ["woda", 1.99, 30],
  ["kawa", 24.99, 3],
];

// bike shop sales, March–May 2024: date, product, category, quantity, unit price (lessons 2–4)
export const ROWERY = [
  ["data", "produkt", "kategoria", "ilosc", "cena"],
  ["2024-03-04", "Przeglad", "serwis", 1, 120],
  ["2024-03-08", "Lampka", "akcesoria", 1, 59],
  ["2024-03-09", "Kask", "akcesoria", 1, 149],
  ["2024-03-11", "Rower miejski", "rower", 1, 1899],
  ["2024-03-15", "Kask", "akcesoria", 2, 149],
  ["2024-03-16", "Lampka", "akcesoria", 1, 59],
  ["2024-03-17", "Przeglad", "serwis", 1, 120],
  ["2024-03-18", "Lampka", "akcesoria", 4, 59],
  ["2024-03-19", "Przeglad", "serwis", 1, 120],
  ["2024-03-20", "Lampka", "akcesoria", 2, 59],
  ["2024-03-23", "Kask", "akcesoria", 1, 149],
  ["2024-03-26", "Lampka", "akcesoria", 2, 59],
  ["2024-03-27", "Lampka", "akcesoria", 2, 59],
  ["2024-03-30", "Rower miejski", "rower", 1, 1899],
  ["2024-03-31", "Lampka", "akcesoria", 2, 59],
  ["2024-04-04", "Zapiecie", "akcesoria", 4, 89],
  ["2024-04-07", "Lampka", "akcesoria", 4, 59],
  ["2024-04-10", "Kask", "akcesoria", 2, 149],
  ["2024-04-12", "Rower miejski", "rower", 1, 1899],
  ["2024-04-15", "Lampka", "akcesoria", 3, 59],
  ["2024-04-19", "Kask", "akcesoria", 1, 149],
  ["2024-04-20", "Lampka", "akcesoria", 2, 59],
  ["2024-04-23", "Rower gorski", "rower", 1, 2599],
  ["2024-04-27", "Kask", "akcesoria", 1, 149],
  ["2024-04-30", "Kask", "akcesoria", 3, 149],
  ["2024-05-04", "Lampka", "akcesoria", 4, 59],
  ["2024-05-05", "Zapiecie", "akcesoria", 3, 89],
  ["2024-05-09", "Zapiecie", "akcesoria", 1, 89],
  ["2024-05-10", "Zapiecie", "akcesoria", 3, 89],
  ["2024-05-14", "Kask", "akcesoria", 4, 149],
  ["2024-05-17", "Rower miejski", "rower", 1, 1899],
  ["2024-05-21", "Kask", "akcesoria", 1, 149],
  ["2024-05-25", "Rower miejski", "rower", 1, 1899],
  ["2024-05-28", "Rower miejski", "rower", 1, 1899],
  ["2024-05-30", "Kask", "akcesoria", 4, 149],
  ["2024-05-31", "Rower gorski", "rower", 1, 2599],
];

// rainwater tank: day and rainfall in mm (lesson 5)
export const ZBIORNIK = [
  ["dzien", "opad_mm"],
  [1, 1],
  [2, 0],
  [3, 0],
  [4, 1],
  [5, 2],
  [6, 5],
  [7, 12],
  [8, 3],
  [9, 0],
  [10, 0],
  [11, 0],
  [12, 0],
  [13, 3],
  [14, 0],
  [15, 8],
  [16, 0],
  [17, 0],
  [18, 0],
  [19, 2],
  [20, 3],
  [21, 0],
  [22, 0],
  [23, 8],
  [24, 12],
  [25, 3],
  [26, 5],
  [27, 1],
  [28, 8],
  [29, 12],
  [30, 3],
];

// price list for the lookup lesson (product, unit price)
export const CENNIK = [
  ['produkt', 'cena'],
  ['Rower miejski', 1899],
  ['Rower gorski', 2599],
  ['Kask', 149],
  ['Lampka', 59],
  ['Zapiecie', 89],
  ['Przeglad', 120],
];

// sales without prices (A–D) and the price list in G1:H7 (lesson 4)
export const SPRZEDAZ = ROWERY.map((r, i) => [...r.slice(0, 4), null, null, ...(CENNIK[i] || [])]);
