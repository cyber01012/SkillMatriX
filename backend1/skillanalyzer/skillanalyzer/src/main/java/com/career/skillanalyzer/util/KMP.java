
package com.career.skillanalyzer.util;

public class KMP {
    public static boolean containsIgnoreCase(String text, String pattern) {
        if (pattern == null || pattern.isEmpty()) return true;
        if (text == null) return false;
        return kmp(text.toLowerCase(), pattern.toLowerCase());
    }
    private static boolean kmp(String text, String pat) {
        int[] lps = lps(pat);
        int i=0, j=0;
        while (i < text.length()) {
            if (text.charAt(i) == pat.charAt(j)) { i++; j++; if (j == pat.length()) return true; }
            else if (j != 0) j = lps[j-1];
            else i++;
        }
        return false;
    }
    private static int[] lps(String p) {
        int[] l = new int[p.length()];
        int len = 0, i = 1;
        while (i < p.length()) {
            if (p.charAt(i) == p.charAt(len)) l[i++] = ++len;
            else if (len != 0) len = l[len-1];
            else l[i++] = 0;
        }
        return l;
    }
}
