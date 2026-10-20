import java.io.*;
import java.nio.file.*;
import java.util.*;

public class Main {
    static int nwd(int a, int b) {
        while (b > 0) {
            int r = a % b;
            a = b;
            b = r;
        }
        return a;
    }

    public static void main(String[] args) throws IOException {
        List<String> dane = new ArrayList<>();
        for (String wiersz : Files.readAllLines(Path.of("liczby1.txt"))) dane.add(wiersz.strip());

        int wynik = 0;
        for (String liczba : dane) {
            int polowa = liczba.length() / 2;
            int a = Integer.parseInt(liczba.substring(0, polowa));
            int b = Integer.parseInt(liczba.substring(polowa));
            if (nwd(a, b) == 1) wynik++;
        }

        System.out.println(wynik);
    }
}
