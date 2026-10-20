import java.io.*;
import java.nio.file.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        List<String> dane = new ArrayList<>();
        for (String wiersz : Files.readAllLines(Path.of("korpo.txt"))) dane.add(wiersz.strip());

        int n = dane.size();
        int[] podwladni = new int[n + 1]; // liczba bezpośrednich podwładnych każdego pracownika
        for (String x : dane)
            if (Integer.parseInt(x) > 0) podwladni[Integer.parseInt(x)]++;

        int pracownik = 1;
        for (int i = 2; i <= n; i++)
            if (podwladni[i] > podwladni[pracownik]) pracownik = i;
        System.out.println(pracownik + " " + podwladni[pracownik]);
    }
}
