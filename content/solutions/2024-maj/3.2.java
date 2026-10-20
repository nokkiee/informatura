import java.io.*;
import java.nio.file.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        List<String> dane = new ArrayList<>();
        for (String wiersz : Files.readAllLines(Path.of("skrot.txt"))) dane.add(wiersz.strip());

        int ile = 0, najwieksza = 0;
        for (String liczba : dane) {
            // skrót nie istnieje, gdy wszystkie cyfry są parzyste
            boolean parzyste = true;
            for (char c : liczba.toCharArray())
                if ((c - '0') % 2 != 0) parzyste = false;
            if (parzyste) {
                ile++;
                najwieksza = Math.max(najwieksza, Integer.parseInt(liczba));
            }
        }

        System.out.println(ile);
        System.out.println(najwieksza);
    }
}
