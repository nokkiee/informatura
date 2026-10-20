import java.io.*;
import java.nio.file.*;
import java.util.*;

public class Main {
    static long silnia(int k) {
        long wynik = 1;
        for (int i = 2; i <= k; i++) wynik *= i;
        return wynik;
    }

    // pierwsza cyfra to zawsze 1, pozostałe cyfry można ustawić na tyle sposobów
    static long anagramy(String liczba) {
        int zera = 0;
        for (char c : liczba.toCharArray())
            if (c == '0') zera++;
        int jedynki = liczba.length() - 1 - zera;
        return silnia(liczba.length() - 1) / (silnia(zera) * silnia(jedynki));
    }

    public static void main(String[] args) throws IOException {
        List<String> dane = new ArrayList<>();
        for (String wiersz : Files.readAllLines(Path.of("anagram.txt"))) dane.add(wiersz.strip());

        long najwiecej = 0;
        for (String liczba : dane)
            if (liczba.length() == 8 && anagramy(liczba) > najwiecej) najwiecej = anagramy(liczba);
        for (String liczba : dane)
            if (liczba.length() == 8 && anagramy(liczba) == najwiecej) System.out.println(liczba);
    }
}
