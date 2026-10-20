import java.io.*;
import java.nio.file.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        List<String> dane = new ArrayList<>();
        for (String wiersz : Files.readAllLines(Path.of("symbole.txt"))) dane.add(wiersz.strip());

        for (String napis : dane) {
            String odwrocony = new StringBuilder(napis).reverse().toString();
            if (napis.equals(odwrocony)) System.out.println(napis);
        }
    }
}
