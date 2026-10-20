import java.io.*;
import java.nio.file.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        List<String> dane = new ArrayList<>();
        for (String wiersz : Files.readAllLines(Path.of("pi.txt"))) dane.add(wiersz.strip());

        int[] ile = new int[100];
        for (int i = 0; i + 1 < dane.size(); i++) {
            ile[Integer.parseInt(dane.get(i) + dane.get(i + 1))]++;
        }

        int najrzadszy = 0, najczestszy = 0;
        for (int f = 0; f < 100; f++) {
            if (ile[f] < ile[najrzadszy]) najrzadszy = f;
            if (ile[f] > ile[najczestszy]) najczestszy = f;
        }

        System.out.println(String.format("%02d %d", najrzadszy, ile[najrzadszy]));
        System.out.println(String.format("%02d %d", najczestszy, ile[najczestszy]));
    }
}
