import java.io.*;
import java.nio.file.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        List<String> dane = new ArrayList<>();
        for (String wiersz : Files.readAllLines(Path.of("symbole.txt"))) dane.add(wiersz.strip());

        final String SYMBOL = "o+*";
        long suma = 0;
        for (String napis : dane) {
            long w = 0;
            for (char znak : napis.toCharArray()) w = w * 3 + SYMBOL.indexOf(znak);
            suma += w;
        }

        StringBuilder zapis = new StringBuilder();
        for (long x = suma; x > 0; x /= 3) zapis.insert(0, SYMBOL.charAt((int) (x % 3)));

        System.out.println(suma + " " + zapis);
    }
}
