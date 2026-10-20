import java.io.*;
import java.nio.file.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        List<String> dane = new ArrayList<>();
        for (String wiersz : Files.readAllLines(Path.of("odbiorcy.txt"))) dane.add(wiersz.strip());

        int n = dane.size();
        int[] odbiorca = new int[n + 1], gdzie = new int[n + 1]; // gdzie[p] – komputer, w którym jest pakiet p
        for (int i = 1; i <= n; i++) {
            odbiorca[i] = Integer.parseInt(dane.get(i - 1));
            gdzie[i] = i;
        }

        StringBuilder wynik = new StringBuilder();
        for (int runda = 1; runda <= 8; runda++) {
            for (int p = 1; p <= n; p++) gdzie[p] = odbiorca[gdzie[p]];
            if (runda == 1 || runda == 2 || runda == 4 || runda == 8) {
                int[] ile = new int[n + 1]; // ile pakietów jest w każdym komputerze
                for (int p = 1; p <= n; p++) ile[gdzie[p]]++;
                wynik.append(Arrays.stream(ile).max().getAsInt()).append(" ");
            }
        }

        System.out.println(wynik.toString().trim());
    }
}
