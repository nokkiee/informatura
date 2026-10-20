import java.io.*;
import java.nio.file.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        List<String> dane = new ArrayList<>();
        for (String wiersz : Files.readAllLines(Path.of("liczby.txt"))) dane.add(wiersz.strip());

        long[] a = Arrays.stream(dane.get(0).split(" ")).mapToLong(Long::parseLong).toArray();
        int n = a.length;
        long[] suma = new long[n + 1]; // suma[i] = a[0] + … + a[i-1]
        for (int i = 0; i < n; i++) suma[i + 1] = suma[i] + a[i];

        double najlepsza = -1;
        int dlugosc = 0, poczatek = 0;
        for (int i = 0; i < n; i++) {
            for (int j = i + 50; j <= n; j++) {
                double srednia = (double) (suma[j] - suma[i]) / (j - i);
                if (srednia > najlepsza) {
                    najlepsza = srednia;
                    dlugosc = j - i;
                    poczatek = i;
                }
            }
        }

        System.out.println(najlepsza + " " + dlugosc + " " + a[poczatek]);
    }
}
