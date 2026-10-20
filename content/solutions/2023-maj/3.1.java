import java.io.*;
import java.nio.file.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        List<String> dane = new ArrayList<>();
        for (String wiersz : Files.readAllLines(Path.of("pi.txt"))) dane.add(wiersz.strip());

        int wynik = 0;
        for (int i = 0; i + 1 < dane.size(); i++) {
            int fragment = Integer.parseInt(dane.get(i) + dane.get(i + 1));
            if (fragment > 90) wynik++;
        }

        System.out.println(wynik);
    }
}
