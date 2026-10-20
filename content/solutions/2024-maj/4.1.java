import java.io.*;
import java.nio.file.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        List<String> dane = new ArrayList<>();
        for (String wiersz : Files.readAllLines(Path.of("liczby.txt"))) dane.add(wiersz.strip());

        long[] pierwsze = Arrays.stream(dane.get(0).split(" ")).mapToLong(Long::parseLong).toArray();
        long[] liczby = Arrays.stream(dane.get(1).split(" ")).mapToLong(Long::parseLong).toArray();

        int wynik = 0;
        for (long p : pierwsze) {
            boolean dzieli = false;
            for (long y : liczby)
                if (y % p == 0) dzieli = true;
            if (dzieli) wynik++;
        }

        System.out.println(wynik);
    }
}
