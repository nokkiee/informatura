import java.io.*;
import java.nio.file.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        List<String> dane = new ArrayList<>();
        for (String wiersz : Files.readAllLines(Path.of("anagram.txt"))) dane.add(wiersz.strip());

        int wynik = 0;
        for (int i = 0; i + 1 < dane.size(); i++) {
            int roznica = Math.abs(Integer.parseInt(dane.get(i), 2) - Integer.parseInt(dane.get(i + 1), 2));
            if (roznica > wynik) wynik = roznica;
        }

        System.out.println(Integer.toBinaryString(wynik));
    }
}
