import java.io.*;
import java.nio.file.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        List<String> dane = new ArrayList<>();
        for (String wiersz : Files.readAllLines(Path.of("dane.txt"))) dane.add(wiersz.strip());

        String napis = dane.get(0);
        Map<String, Integer> ile = new HashMap<>(); // liczba wystąpień każdej np-pary
        for (int i = 0; i < napis.length(); i += 2) ile.merge(napis.substring(i, i + 2), 1, Integer::sum);

        List<String> pary = new ArrayList<>(ile.keySet());
        pary.sort(Comparator.comparing(ile::get));

        System.out.println(String.join("", pary));
    }
}
