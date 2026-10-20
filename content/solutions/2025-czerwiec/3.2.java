import java.io.*;
import java.nio.file.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        List<String> dane = new ArrayList<>();
        for (String wiersz : Files.readAllLines(Path.of("dane.txt"))) dane.add(wiersz.strip());

        String napis = dane.get(0);
        int[] ile = new int[10];
        for (char znak : napis.toCharArray())
            if (Character.isDigit(znak)) ile[znak - '0']++;

        int cyfra = 0;
        for (int c = 1; c < 10; c++)
            if (ile[c] > ile[cyfra]) cyfra = c;
        System.out.println(cyfra + " " + ile[cyfra]);
    }
}
