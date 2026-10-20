import java.io.*;
import java.nio.file.*;
import java.util.*;

public class Main {
    static int f(String s) {
        int suma = 0;
        for (char c : s.toCharArray()) suma += c;
        return suma;
    }

    public static void main(String[] args) throws IOException {
        List<String> dane = new ArrayList<>();
        for (String wiersz : Files.readAllLines(Path.of("pary.txt"))) dane.add(wiersz.strip());

        int najwieksza = -1;
        String para = "";
        for (String wiersz : dane) {
            String[] s = wiersz.split(" ");
            int roznica = Math.abs(f(s[0]) - f(s[1]));
            if (roznica > najwieksza) {
                najwieksza = roznica;
                para = wiersz;
            }
        }

        System.out.println(para + " " + najwieksza);
    }
}
