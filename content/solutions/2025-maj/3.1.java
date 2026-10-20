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
        for (String wiersz : Files.readAllLines(Path.of("dron.txt"))) dane.add(wiersz.strip());

        int wynik = 0;
        for (String wiersz : dane) {
            String[] p = wiersz.split(" ");
            int a = Integer.parseInt(p[0]), b = Integer.parseInt(p[1]);
            if (nwd(Math.abs(a), Math.abs(b)) > 1) wynik++;
        }

        System.out.println(wynik);
    }
}
