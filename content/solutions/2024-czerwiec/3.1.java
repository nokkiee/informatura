import java.io.*;
import java.nio.file.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        List<String> dane = new ArrayList<>();
        for (String wiersz : Files.readAllLines(Path.of("slowa.txt"))) dane.add(wiersz.strip());

        int wynik = 0;
        for (String slowo : dane) {
            for (int i = 0; i + 2 < slowo.length(); i++) {
                if (slowo.charAt(i) == 'k' && slowo.charAt(i + 2) == 't') {
                    wynik++;
                    break;
                }
            }
        }

        System.out.println(wynik);
    }
}
