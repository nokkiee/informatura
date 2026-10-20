import java.io.*;
import java.nio.file.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        List<String> dane = new ArrayList<>();
        for (String wiersz : Files.readAllLines(Path.of("dane.txt"))) dane.add(wiersz.strip());

        String napis = dane.get(0);
        int wynik = 0;
        for (int i = 0; i + 4 <= napis.length(); i += 2) { // np-para na i oraz następna na i + 2
            if (napis.substring(i, i + 2).equals(napis.substring(i + 2, i + 4))) wynik++;
        }

        System.out.println(wynik);
    }
}
