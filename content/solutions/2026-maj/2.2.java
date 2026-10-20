import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        long a = sc.nextLong();
        long b = sc.nextLong();

        // --- Twój algorytm ---
        long p = 0;
        long wPamieci = 0; // przeniesienie z poprzedniej kolumny
        while (a > 0) {
            long suma = a % 10 + b % 10 + wPamieci;
            if (suma >= 10) {
                wPamieci = 1;
                p = p + 1;
            } else {
                wPamieci = 0;
            }
            a = a / 10;
            b = b / 10;
        }

        System.out.println(p);
    }
}
