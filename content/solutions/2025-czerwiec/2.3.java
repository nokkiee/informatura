import java.io.*;
import java.nio.file.*;
import java.util.*;

public class Main {
    static int stopien(long n) {
        String kwadrat = String.valueOf(n * n);
        int ile = 0;
        for (int i = 1; i < kwadrat.length(); i++) { // cięcie po i-tej cyfrze
            if (Long.parseLong(kwadrat.substring(0, i)) + Long.parseLong(kwadrat.substring(i)) <= n) ile++;
        }
        return ile;
    }

    public static void main(String[] args) throws IOException {
        List<String> dane = new ArrayList<>();
        for (String wiersz : Files.readAllLines(Path.of("liczby2.txt"))) dane.add(wiersz.strip());

        int najlepszy = -1;
        long liczba = 0;
        for (String w : dane) {
            long n = Long.parseLong(w);
            int s = stopien(n);
            if (s > najlepszy) {
                najlepszy = s;
                liczba = n;
            }
        }

        System.out.println(najlepszy);
        System.out.println(liczba);
    }
}
