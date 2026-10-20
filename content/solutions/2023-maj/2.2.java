import java.io.*;
import java.nio.file.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        List<String> dane = new ArrayList<>();
        for (String wiersz : Files.readAllLines(Path.of("bin.txt"))) dane.add(wiersz.strip());

        int wynik = 0;
        for (String liczba : dane) {
            int bloki = 1;
            for (int i = 1; i < liczba.length(); i++) {
                if (liczba.charAt(i) != liczba.charAt(i - 1)) bloki++;
            }
            if (bloki <= 2) wynik++;
        }

        System.out.println(wynik);
    }
}
