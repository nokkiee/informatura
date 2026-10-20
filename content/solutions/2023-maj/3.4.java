import java.io.*;
import java.nio.file.*;
import java.util.*;

public class Main {
    static int[] cyfry;

    // długość najdłuższego ciągu rosnąco-malejącego od pozycji start (0, gdy takiego nie ma)
    static int najdluzszyOd(int start) {
        int n = cyfry.length;
        int koniec = start + 1;
        while (koniec < n && cyfry[koniec] > cyfry[koniec - 1]) koniec++;
        int najlepszy = 0;
        // część rosnąca: start … k-1, część malejąca: od k
        for (int k = start + 2; k <= koniec; k++) {
            int m = k + 1;
            while (m < n && cyfry[m] < cyfry[m - 1]) m++;
            if (m - k >= 2) najlepszy = Math.max(najlepszy, m - start);
        }
        return najlepszy;
    }

    public static void main(String[] args) throws IOException {
        List<String> dane = new ArrayList<>();
        for (String wiersz : Files.readAllLines(Path.of("pi.txt"))) dane.add(wiersz.strip());

        cyfry = new int[dane.size()];
        for (int i = 0; i < dane.size(); i++) cyfry[i] = Integer.parseInt(dane.get(i));
        int pozycja = 0, dlugosc = 0;
        for (int i = 0; i < cyfry.length; i++) {
            int d = najdluzszyOd(i);
            if (d > dlugosc) {
                dlugosc = d;
                pozycja = i;
            }
        }

        System.out.println(pozycja + 1);
        System.out.println(String.join("", dane.subList(pozycja, pozycja + dlugosc)));
    }
}
