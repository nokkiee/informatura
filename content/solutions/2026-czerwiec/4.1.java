import java.io.*;
import java.nio.file.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        List<String> dane = new ArrayList<>();
        for (String wiersz : Files.readAllLines(Path.of("mapa.txt"))) dane.add(wiersz.strip());

        int nr = 0, najwiecej = -1;
        for (int i = 0; i < dane.size(); i++) {
            int ludnosc = Integer.parseInt(dane.get(i).split(" ")[2]);
            if (ludnosc > najwiecej) {
                najwiecej = ludnosc;
                nr = i;
            }
        }

        System.out.println((nr + 1) + " " + najwiecej);
    }
}
