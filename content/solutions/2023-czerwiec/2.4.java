import java.io.*;
import java.nio.file.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        List<String> dane = new ArrayList<>();
        for (String wiersz : Files.readAllLines(Path.of("slowa4.txt"))) dane.add(wiersz.strip());

        for (String wiersz : dane) {
            String s = wiersz.split(" ")[1];
            String najmniejszy = s;
            for (int k = 0; k < s.length(); k++) {
                if (s.substring(k).compareTo(najmniejszy) < 0) najmniejszy = s.substring(k);
            }
            System.out.println(najmniejszy);
        }
    }
}
