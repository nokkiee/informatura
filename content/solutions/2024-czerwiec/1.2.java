import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        long w = sc.nextLong();
        long k = sc.nextLong();
        long n = sc.nextLong();

        // --- Twój algorytm ---
        long x = 0;
        long dl = 0; // liczba cyfr zapisu binarnego n
        long pom = n;
        while (pom > 0) {
            pom = pom / 2;
            dl = dl + 1;
        }
        long poz = (w * k - 1) % dl; // która cyfra (licząc od lewej, od 0) trafi do prawego dolnego rogu
        for (long i = 0; i < dl - 1 - poz; i++) {
            n = n / 2; // usuwamy cyfry stojące na prawo od niej
        }
        x = n % 2;

        System.out.println(x);
    }
}
