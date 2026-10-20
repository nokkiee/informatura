import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        long n = sc.nextLong();

        // --- Twój algorytm ---
        long w = 0;
        long p = 1; // kolejne potęgi 100
        while (n > 0) {
            long r = n % 100;
            long a = r / 10;
            long b = r % 10;
            if (n > 9) {
                w = w + p * a + 10 * p * b; // zamiana dwóch ostatnich cyfr miejscami
            } else {
                w = w + p * b; // została jedna cyfra
            }
            n = n / 100;
            p = p * 100;
        }

        System.out.println(w);
    }
}
