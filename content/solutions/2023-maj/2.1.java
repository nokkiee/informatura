import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        long n = sc.nextLong();

        // --- Twój algorytm ---
        long b = 0;
        long poprzednia = -1;
        while (n > 0) {
            long cyfra = n % 2;
            if (cyfra != poprzednia) {
                b = b + 1;
            }
            poprzednia = cyfra;
            n = n / 2;
        }

        System.out.println(b);
    }
}
