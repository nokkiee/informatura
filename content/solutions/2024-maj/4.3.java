import java.io.*;
import java.nio.file.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        List<String> dane = new ArrayList<>();
        for (String wiersz : Files.readAllLines(Path.of("liczby.txt"))) dane.add(wiersz.strip());

        Map<Long, Integer> ile = new TreeMap<>(); // ile razy każda liczba pierwsza występuje w pierwszym wierszu
        for (String s : dane.get(0).split(" ")) ile.merge(Long.parseLong(s), 1, Integer::sum);
        long[] liczby = Arrays.stream(dane.get(1).split(" ")).mapToLong(Long::parseLong).toArray();

        for (long y : liczby) {
            long reszta = y;
            for (Map.Entry<Long, Integer> e : ile.entrySet()) {
                long p = e.getKey();
                int k = e.getValue();
                while (k > 0 && reszta % p == 0) {
                    reszta /= p;
                    k--;
                }
            }
            if (reszta == 1) System.out.println(y);
        }
    }
}
