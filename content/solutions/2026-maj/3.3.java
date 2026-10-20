import java.io.*;
import java.nio.file.*;
import java.util.*;

public class Main {
    // najdłuższe słowo, które jest początkiem s1 i końcem s2 albo początkiem s2 i końcem s1
    static int prefiksosufiks(String s1, String s2) {
        int najdluzszy = 0;
        int n = Math.min(s1.length(), s2.length());
        for (int d = 1; d <= n; d++) {
            if (s1.startsWith(s2.substring(s2.length() - d)) || s2.startsWith(s1.substring(s1.length() - d))) najdluzszy = d;
        }
        return najdluzszy;
    }

    public static void main(String[] args) throws IOException {
        List<String> dane = new ArrayList<>();
        for (String wiersz : Files.readAllLines(Path.of("pary.txt"))) dane.add(wiersz.strip());

        for (String wiersz : dane) {
            String[] s = wiersz.split(" ");
            int d = prefiksosufiks(s[0], s[1]);
            if (d >= 5) System.out.println(s[0] + " " + s[1] + " " + d);
        }
    }
}
