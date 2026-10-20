import java.io.*;
import java.nio.file.*;
import java.util.*;

public class Main {
    // część rosnąca c[0..k-1] i malejąca c[k..], każda co najmniej z 2 elementów
    static boolean rosnacoMalejacy(int[] c) {
        int n = c.length;
        for (int k = 2; k <= n - 2; k++) {
            boolean rosnie = true, maleje = true;
            for (int i = 0; i + 1 < k; i++)
                if (c[i] >= c[i + 1]) rosnie = false;
            for (int i = k; i + 1 < n; i++)
                if (c[i] <= c[i + 1]) maleje = false;
            if (rosnie && maleje) return true;
        }
        return false;
    }

    public static void main(String[] args) throws IOException {
        List<String> dane = new ArrayList<>();
        for (String wiersz : Files.readAllLines(Path.of("pi.txt"))) dane.add(wiersz.strip());

        int wynik = 0;
        for (int i = 0; i + 6 <= dane.size(); i++) {
            int[] okno = new int[6];
            for (int j = 0; j < 6; j++) okno[j] = Integer.parseInt(dane.get(i + j));
            if (rosnacoMalejacy(okno)) wynik++;
        }

        System.out.println(wynik);
    }
}
