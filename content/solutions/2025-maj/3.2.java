import java.io.*;
import java.nio.file.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        List<String> dane = new ArrayList<>();
        for (String wiersz : Files.readAllLines(Path.of("dron.txt"))) dane.add(wiersz.strip());

        List<long[]> punkty = new ArrayList<>();
        Set<String> zbior = new HashSet<>();
        long x = 0, y = 0;
        for (String wiersz : dane) {
            String[] p = wiersz.split(" ");
            x += Long.parseLong(p[0]);
            y += Long.parseLong(p[1]);
            punkty.add(new long[] {x, y});
            zbior.add(x + " " + y);
        }

        // a) punkty ściśle wewnątrz kwadratu
        int wynik = 0;
        for (long[] p : punkty)
            if (0 < p[0] && p[0] < 5000 && 0 < p[1] && p[1] < 5000) wynik++;
        System.out.println(wynik);

        // b) para punktów, której środek też jest jednym z punktów
        for (int i = 0; i < punkty.size(); i++) {
            for (int j = i + 1; j < punkty.size(); j++) {
                long[] p = punkty.get(i), q = punkty.get(j);
                if ((p[0] + q[0]) % 2 == 0 && (p[1] + q[1]) % 2 == 0) {
                    String srodek = (p[0] + q[0]) / 2 + " " + (p[1] + q[1]) / 2;
                    if (zbior.contains(srodek) && !srodek.equals(p[0] + " " + p[1])) {
                        System.out.println(p[0] + " " + p[1]);
                        System.out.println(srodek);
                        System.out.println(q[0] + " " + q[1]);
                    }
                }
            }
        }
    }
}
