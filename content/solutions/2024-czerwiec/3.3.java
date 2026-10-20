import java.io.*;
import java.nio.file.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        List<String> dane = new ArrayList<>();
        for (String wiersz : Files.readAllLines(Path.of("slowa.txt"))) dane.add(wiersz.strip());

        for (String slowo : dane) {
            int[] ile = new int[26];
            int najczestsza = 0;
            for (char c : slowo.toCharArray()) {
                ile[c - 'a']++;
                najczestsza = Math.max(najczestsza, ile[c - 'a']);
            }
            if (2 * najczestsza >= slowo.length()) System.out.println(slowo);
        }
    }
}
