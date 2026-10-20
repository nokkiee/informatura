import java.io.*;
import java.nio.file.*;
import java.util.*;

public class Main {
    static String rot13(String slowo) {
        StringBuilder sb = new StringBuilder();
        for (char c : slowo.toCharArray()) sb.append((char) ((c - 'a' + 13) % 26 + 'a'));
        return sb.toString();
    }

    public static void main(String[] args) throws IOException {
        List<String> dane = new ArrayList<>();
        for (String wiersz : Files.readAllLines(Path.of("slowa.txt"))) dane.add(wiersz.strip());

        int wynik = 0;
        String najdluzsze = "";
        for (String slowo : dane) {
            String odwrocone = new StringBuilder(slowo).reverse().toString();
            if (rot13(slowo).equals(odwrocone)) {
                wynik++;
                if (slowo.length() > najdluzsze.length()) najdluzsze = slowo;
            }
        }

        System.out.println(wynik);
        System.out.println(najdluzsze);
    }
}
