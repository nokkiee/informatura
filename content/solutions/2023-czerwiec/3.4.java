import java.io.*;
import java.nio.file.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        List<String> dane = new ArrayList<>();
        for (String wiersz : Files.readAllLines(Path.of("anagram.txt"))) dane.add(wiersz.strip());

        int bezZera = 0, najwiekszaSuma = -1;
        String najlepsza = "";
        for (String liczba : dane) {
            String dziesietnie = String.valueOf(Integer.parseInt(liczba, 2));
            if (!dziesietnie.contains("0")) bezZera++;
            boolean[] byla = new boolean[10];
            int suma = 0;
            for (char c : dziesietnie.toCharArray()) {
                if (!byla[c - '0']) suma += c - '0';
                byla[c - '0'] = true;
            }
            if (suma > najwiekszaSuma) {
                najwiekszaSuma = suma;
                najlepsza = dziesietnie;
            }
        }

        System.out.println(bezZera);
        System.out.println(najlepsza);
    }
}
