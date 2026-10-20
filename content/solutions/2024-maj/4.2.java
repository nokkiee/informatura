import java.io.*;
import java.nio.file.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        List<String> dane = new ArrayList<>();
        for (String wiersz : Files.readAllLines(Path.of("liczby.txt"))) dane.add(wiersz.strip());

        int[] pierwsze = Arrays.stream(dane.get(0).split(" ")).mapToInt(Integer::parseInt).toArray();
        Arrays.sort(pierwsze); // rosnąco
        int wynik = pierwsze[pierwsze.length - 101]; // sto pierwsza od największej

        System.out.println(wynik);
    }
}
