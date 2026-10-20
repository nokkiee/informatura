import java.io.*;
import java.nio.file.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        List<String> dane = new ArrayList<>();
        for (String wiersz : Files.readAllLines(Path.of("bin.txt"))) dane.add(wiersz.strip());

        int wynik = 0; // numer wiersza z największą liczbą
        for (int i = 1; i < dane.size(); i++) {
            if (Integer.parseInt(dane.get(i), 2) > Integer.parseInt(dane.get(wynik), 2)) wynik = i;
        }

        System.out.println(dane.get(wynik));
    }
}
