import java.io.*;
import java.nio.file.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        List<String> dane = new ArrayList<>();
        for (String wiersz : Files.readAllLines(Path.of("dane.txt"))) dane.add(wiersz.strip());

        String napis = dane.get(0);
        List<String> liczby = new ArrayList<>(); // wszystkie ukryte liczby, jako napisy (zera z przodu zostają)
        StringBuilder biezaca = new StringBuilder();
        for (char znak : (napis + " ").toCharArray()) {
            if (Character.isDigit(znak)) {
                biezaca.append(znak);
            } else if (biezaca.length() > 0) {
                liczby.add(biezaca.toString());
                biezaca.setLength(0);
            }
        }

        int wynik = 0;
        for (String liczba : liczby)
            if (liczba.startsWith("50")) wynik++;

        System.out.println(wynik);
    }
}
