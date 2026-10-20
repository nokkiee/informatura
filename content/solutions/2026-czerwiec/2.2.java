import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        long n = sc.nextLong();
        long[] T = new long[(int) n];
        for (int i = 0; i < T.length; i++) T[i] = sc.nextLong();

        // --- Twój algorytm ---
        long k = 0;
        for (int d = 1; d < n; d++) { // sprawdzamy każde możliwe k = d
            boolean podobna = true;
            for (int i = 0; i < d; i++) { // T[1..d] i T[n-d+1..n], w kodzie indeksy od 0
                if (T[i] != T[(int) n - d + i]) podobna = false;
            }
            if (podobna) k = d;
        }

        System.out.println(k);
    }
}
