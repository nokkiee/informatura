import java.io.*;
import java.nio.file.*;
import java.util.*;

public class Main {
    static long wartosc(String napis) {
        long w = 0;
        for (char znak : napis.toCharArray()) w = w * 3 + (znak == 'o' ? 0 : znak == '+' ? 1 : 2);
        return w;
    }

    public static void main(String[] args) throws IOException {
        List<String> dane = new ArrayList<>();
        for (String wiersz : Files.readAllLines(Path.of("symbole.txt"))) dane.add(wiersz.strip());

        String wynik = dane.get(0);
        for (String napis : dane)
            if (wartosc(napis) > wartosc(wynik)) wynik = napis;

        System.out.println(wartosc(wynik) + " " + wynik);
    }
}
