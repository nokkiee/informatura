import java.io.*;
import java.nio.file.*;
import java.util.*;

public class Main {
    static int nwd(int a, int b) {
        while (b > 0) {
            int r = a % b;
            a = b;
            b = r;
        }
        return a;
    }

    public static void main(String[] args) throws IOException {
        List<String> dane = new ArrayList<>();
        for (String wiersz : Files.readAllLines(Path.of("skrot2.txt"))) dane.add(wiersz.strip());

        for (String liczba : dane) {
            StringBuilder skrot = new StringBuilder();
            for (char c : liczba.toCharArray())
                if ((c - '0') % 2 == 1) skrot.append(c);
            int n = Integer.parseInt(liczba), m = Integer.parseInt(skrot.toString());
            if (nwd(n, m) == 7) System.out.println(n);
        }
    }
}
