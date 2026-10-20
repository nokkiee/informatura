import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        long n = sc.nextLong();

        // --- Twój algorytm ---
        long m = 0;
        long p = 1;
        while (n > 0) {
            long cyfra = n % 10;
            if (cyfra % 2 != 0) {
                m = m + cyfra * p;
                p = p * 10;
            }
            n = n / 10;
        }

        System.out.println(m);
    }
}
