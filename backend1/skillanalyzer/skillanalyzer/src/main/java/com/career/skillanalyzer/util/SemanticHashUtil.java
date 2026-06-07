//
//package com.career.skillanalyzer.util;
//
//import java.util.*;
//
//public class SemanticHashUtil {
//
//    // Minimal stopwords; extend if needed
//    private static final Set<String> STOP = Set.of(
//            "and","or","with","in","of","for","to","the","a","an"
//    );
//
//    public static String generate(List<String> skills, String role) {
//        List<String> tokens = new ArrayList<>();
//
//        if (skills != null) {
//            for (String s : skills) {
//                if (s == null) continue;
//                String t = normalize(s);
//                if (!t.isBlank() && !STOP.contains(t)) tokens.add(t);
//            }
//        }
//        if (role != null) tokens.add(normalize(role));
//
//        Collections.sort(tokens);
//        return HashUtil.sha256(String.join(" ", tokens));
//    }
//
//    private static String normalize(String s) {
//        return s.toLowerCase()
//                .trim()
//                .replaceAll("[^a-z0-9+.#-]+", " "); // keep basic tech/medical chars
//    }
//}
