import java.util.*;

public class Main {
    static boolean czyMniejszy(long n, String s, long k1, long k2) {
        long i = k1, j = k2;
        while (i <= n && j <= n) {
            char a = s.charAt((int) i - 1), b = s.charAt((int) j - 1);
            if (a == b) {
                i = i + 1;
                j = j + 1;
            } else if (a < b) {
                return true;
            } else {
                return false;
            }
        }
        return j <= n;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        long n = sc.nextLong();
        String s = sc.next();

        // --- Twój algorytm ---
        long[] T = new long[(int) n];
        for (int i = 0; i < n; i++) T[i] = i + 1;
        // sortowanie bąbelkowe, porównujące sufiksy funkcją czyMniejszy
        for (int i = 0; i < n - 1; i++) {
            for (int j = 0; j < n - 1 - i; j++) {
                if (!czyMniejszy(n, s, T[j], T[j + 1])) {
                    long x = T[j];
                    T[j] = T[j + 1];
                    T[j + 1] = x;
                }
            }
        }

        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < T.length; i++) sb.append(i > 0 ? " " : "").append(T[i]);
        System.out.println(sb);
    }
}
