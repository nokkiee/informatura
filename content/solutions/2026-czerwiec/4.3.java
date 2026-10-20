import java.io.*;
import java.nio.file.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        List<String> dane = new ArrayList<>();
        for (String wiersz : Files.readAllLines(Path.of("mapa.txt"))) dane.add(wiersz.strip());

        int n = dane.size();
        long[] x = new long[n], y = new long[n], ludnosc = new long[n];
        long razem = 0; // ludność całej I ćwiartki
        for (int i = 0; i < n; i++) {
            String[] p = dane.get(i).split(" ");
            x[i] = Long.parseLong(p[0]);
            y[i] = Long.parseLong(p[1]);
            ludnosc[i] = Long.parseLong(p[2]);
            if (x[i] > 0 && y[i] > 0) razem += ludnosc[i];
        }

        long bok = 0, wynik = 0;
        for (long d = 1; 2 * d * d < razem; d++) { // przy większym boku gęstość na pewno nie przekroczy 2
            long suma = 0;
            for (int i = 0; i < n; i++)
                if (0 < x[i] && x[i] < d && 0 < y[i] && y[i] < d) suma += ludnosc[i]; // bez miast na krawędziach
            if (suma > 2 * d * d) { // gęstość suma / d² > 2, bez dzielenia
                bok = d;
                wynik = suma;
            }
        }

        System.out.println(bok + " " + wynik);
    }
}
