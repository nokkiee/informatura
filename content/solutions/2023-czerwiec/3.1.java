import java.io.*;
import java.nio.file.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        List<String> dane = new ArrayList<>();
        for (String wiersz : Files.readAllLines(Path.of("anagram.txt"))) dane.add(wiersz.strip());

        int zrownowazone = 0, prawie = 0;
        for (String liczba : dane) {
            int zera = 0, jedynki = 0;
            for (char c : liczba.toCharArray()) {
                if (c == '0') zera++;
                else jedynki++;
            }
            if (zera == jedynki) zrownowazone++;
            else if (Math.abs(zera - jedynki) == 1) prawie++;
        }

        System.out.println(zrownowazone);
        System.out.println(prawie);
    }
}
