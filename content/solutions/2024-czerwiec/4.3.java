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

        int runda = 0, pakiet = 0;
        while (pakiet == 0) {
            runda++;
            for (int p = 1; p <= n; p++) gdzie[p] = odbiorca[gdzie[p]];
            for (int p = 1; p <= n; p++) {
                if (gdzie[p] == p) {
                    pakiet = p;
                    break;
                }
            }
        }

        System.out.println(runda + " " + pakiet);
    }
}
