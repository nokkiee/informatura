import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        long k = sc.nextLong();

        // --- Twój algorytm ---
        long a = 0;
        long b = 0;
        long dlugosc = 0; // liczba cyfr k
        long x = k;
        while (x > 0) {
            x = x / 10;
            dlugosc = dlugosc + 1;
        }
        long potega = 1;
        for (long i = 0; i < dlugosc / 2; i++) {
            b = b + potega * (k % 10); // przenosimy ostatnią cyfrę k do b
            k = k / 10;
            potega = potega * 10;
        }
        a = k;

        System.out.println(a);
        System.out.println(b);
    }
}
