import java.io.*;
import java.nio.file.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        List<String> dane = new ArrayList<>();
        for (String wiersz : Files.readAllLines(Path.of("korpo.txt"))) dane.add(wiersz.strip());

        int n = dane.size();
        boolean[] maPodwladnych = new boolean[n + 1];
        for (String x : dane) maPodwladnych[Integer.parseInt(x)] = true;
        int wynik = 0;
        for (int i = 1; i <= n; i++)
            if (!maPodwladnych[i]) wynik++;

        System.out.println(wynik);
    }
}
