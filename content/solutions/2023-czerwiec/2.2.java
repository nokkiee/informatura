import java.io.*;
import java.nio.file.*;
import java.util.*;

public class Main {
    static boolean czyMniejszy(int n, String s, int k1, int k2) {
        int i = k1, j = k2;
        while (i <= n && j <= n) {
            if (s.charAt(i - 1) == s.charAt(j - 1)) {
                i++;
                j++;
            } else if (s.charAt(i - 1) < s.charAt(j - 1)) {
                return true;
            } else {
                return false;
            }
        }
        return j <= n;
    }

    public static void main(String[] args) throws IOException {
        for (String nazwa : new String[] {"slowa1.txt", "slowa2.txt", "slowa3.txt"}) {
            List<String> dane = new ArrayList<>();
            for (String wiersz : Files.readAllLines(Path.of(nazwa))) dane.add(wiersz.strip());
            int n = Integer.parseInt(dane.get(0));
            String s = dane.get(1);
            String[] k = dane.get(2).split(" ");
            boolean wynik = czyMniejszy(n, s, Integer.parseInt(k[0]), Integer.parseInt(k[1]));
            System.out.println(nazwa + " " + (wynik ? "TAK" : "NIE"));
        }
    }
}
