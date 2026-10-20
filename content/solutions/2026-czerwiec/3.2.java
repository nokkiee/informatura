import java.io.*;
import java.nio.file.*;
import java.util.*;

public class Main {
    static boolean pierwsza(int x) {
        if (x < 2) return false;
        for (int d = 2; d * d <= x; d++)
            if (x % d == 0) return false;
        return true;
    }

    public static void main(String[] args) throws IOException {
        List<String> dane = new ArrayList<>();
        for (String wiersz : Files.readAllLines(Path.of("dane.txt"))) dane.add(wiersz.strip());

        String napis = dane.get(0);
        int n = napis.length();
        int[] suma = new int[n + 1]; // suma[i] – suma kodów pierwszych i znaków
        for (int i = 0; i < n; i++) suma[i + 1] = suma[i] + napis.charAt(i);

        String najdluzszy = "";
        for (int i = 0; i < n; i += 2) {             // fragment zaczyna się na początku np-pary…
            for (int j = i + 2; j <= n; j += 2) {    // …i kończy na końcu np-pary
                if (j - i > najdluzszy.length() && pierwsza(suma[j] - suma[i])) najdluzszy = napis.substring(i, j);
            }
        }

        System.out.println(najdluzszy);
    }
}
