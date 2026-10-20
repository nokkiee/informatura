#include <iostream>
#include <fstream>
#include <string>
#include <vector>
using namespace std;

long long silnia(int k) {
    long long wynik = 1;
    for (int i = 2; i <= k; i++) wynik *= i;
    return wynik;
}

// pierwsza cyfra to zawsze 1, pozostałe cyfry można ustawić na tyle sposobów
long long anagramy(const string &liczba) {
    int zera = 0;
    for (char c : liczba)
        if (c == '0') zera++;
    int jedynki = liczba.size() - 1 - zera;
    return silnia(liczba.size() - 1) / (silnia(zera) * silnia(jedynki));
}

int main() {
    ifstream plik("anagram.txt");
    vector<string> dane;
    string wiersz;
    while (getline(plik, wiersz)) {
        if (!wiersz.empty() && wiersz.back() == '\r') wiersz.pop_back();
        dane.push_back(wiersz);
    }

    long long najwiecej = 0;
    for (string liczba : dane)
        if (liczba.size() == 8 && anagramy(liczba) > najwiecej) najwiecej = anagramy(liczba);
    for (string liczba : dane)
        if (liczba.size() == 8 && anagramy(liczba) == najwiecej) cout << liczba << endl;
    return 0;
}
