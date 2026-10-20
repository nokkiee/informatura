import java.io.*;
import java.nio.file.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        List<String> dane = new ArrayList<>();
        for (String wiersz : Files.readAllLines(Path.of("pary.txt"))) dane.add(wiersz.strip());

        int najwieksza = -1;
        String para = "";
        for (String wiersz : dane) {
            String[] s = wiersz.split(" ");
            int[] ile1 = new int[26], ile2 = new int[26];
            for (char c : s[0].toCharArray()) ile1[c - 'a']++;
            for (char c : s[1].toCharArray()) ile2[c - 'a']++;
            int suma = 0;
            for (int i = 0; i < 26; i++) suma += Math.min(ile1[i], ile2[i]);
            if (suma > najwieksza) {
                najwieksza = suma;
                para = wiersz;
            }
        }

        System.out.println(para + " " + najwieksza);
    }
}
