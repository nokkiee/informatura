import java.io.*;
import java.nio.file.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        List<String> dane = new ArrayList<>();
        for (String wiersz : Files.readAllLines(Path.of("symbole.txt"))) dane.add(wiersz.strip());

        List<String> srodki = new ArrayList<>();
        for (int i = 1; i + 1 < dane.size(); i++) {
            for (int j = 1; j + 1 < dane.get(i).length(); j++) {
                // wszystkie 9 pól kwadratu o środku (i, j) mają ten sam symbol co środek
                boolean takieSame = true;
                for (int di = -1; di <= 1; di++)
                    for (int dj = -1; dj <= 1; dj++)
                        if (dane.get(i + di).charAt(j + dj) != dane.get(i).charAt(j)) takieSame = false;
                if (takieSame) srodki.add((i + 1) + " " + (j + 1));
            }
        }

        System.out.println(srodki.size());
        for (String s : srodki) System.out.println(s);
    }
}
