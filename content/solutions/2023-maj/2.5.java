import java.io.*;
import java.nio.file.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        List<String> dane = new ArrayList<>();
        for (String wiersz : Files.readAllLines(Path.of("bin.txt"))) dane.add(wiersz.strip());

        for (String liczba : dane) {
            int p = Integer.parseInt(liczba, 2);
            int wynik = p ^ (p / 2);
            System.out.println(Integer.toBinaryString(wynik));
        }
    }
}
