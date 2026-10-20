import java.io.*;
import java.nio.file.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        List<String> dane = new ArrayList<>();
        for (String wiersz : Files.readAllLines(Path.of("korpo.txt"))) dane.add(wiersz.strip());

        int n = dane.size();
        int[] ilu = new int[n + 1]; // ilu[i] – liczba przełożonych pracownika i
        for (int i = 2; i <= n; i++) {
            int szef = Integer.parseInt(dane.get(i - 1));
            ilu[i] = ilu[szef] + 1; // numer szefa jest mniejszy, więc ilu[szef] jest już policzone
        }

        int najwiecej = 0, ile = 0;
        for (int i = 1; i <= n; i++) {
            if (ilu[i] > najwiecej) {
                najwiecej = ilu[i];
                ile = 0;
            }
            if (ilu[i] == najwiecej) ile++;
        }
        System.out.println(najwiecej + " " + ile);
    }
}
