import java.io.*;
import java.nio.file.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        List<String> dane = new ArrayList<>();
        for (String wiersz : Files.readAllLines(Path.of("mapa.txt"))) dane.add(wiersz.strip());

        int n = dane.size();
        int[] x = new int[n], y = new int[n];
        for (int i = 0; i < n; i++) {
            String[] p = dane.get(i).split(" ");
            x[i] = Integer.parseInt(p[0]);
            y[i] = Integer.parseInt(p[1]);
        }

        int najmniejsza = Integer.MAX_VALUE;
        List<String> pary = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                int d = Math.abs(x[i] - x[j]) + Math.abs(y[i] - y[j]);
                if (d < najmniejsza) {
                    najmniejsza = d;
                    pary.clear();
                }
                if (d == najmniejsza) pary.add((i + 1) + " " + (j + 1));
            }
        }

        System.out.println(najmniejsza);
        for (String p : pary) System.out.println(p);
    }
}
