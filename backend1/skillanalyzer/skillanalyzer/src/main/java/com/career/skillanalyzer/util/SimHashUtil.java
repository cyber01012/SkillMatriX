//
//package com.career.skillanalyzer.util;
//
//import java.nio.charset.StandardCharsets;
//import java.security.MessageDigest;
//import java.util.*;
//
//public class SimHashUtil {
//
//    private static List<String> tokenize(String text) {
//        if (text == null) return List.of();
//        String norm = text.toLowerCase().replaceAll("[^a-z0-9+.#-]+"," ").trim();
//        if (norm.isBlank()) return List.of();
//        return Arrays.asList(norm.split("\\s+"));
//    }
//
//    private static long hash64(String token) {
//        try {
//            MessageDigest md = MessageDigest.getInstance("MD5");
//            byte[] b = md.digest(token.getBytes(StandardCharsets.UTF_8));
//            long x = 0;
//            for (int i = 0; i < 8; i++) {
//                x <<= 8;
//                x |= (b[i] & 0xFF);
//            }
//            return x;
//        } catch (Exception e) {
//            throw new RuntimeException(e);
//        }
//    }
//
//    public static String simhash64Hex(String text) {
//        int[] v = new int[64];
//        for (String t : tokenize(text)) {
//            long h = hash64(t);
//            for (int i = 0; i < 64; i++) {
//                if (((h >>> i) & 1L) == 1L) v[i] += 1; else v[i] -= 1;
//            }
//        }
//        long signature = 0L;
//        for (int i = 0; i < 64; i++) if (v[i] > 0) signature |= (1L << i);
//        return String.format("%016x", signature);
//    }
//
//    public static int hammingDistanceHex64(String hexA, String hexB) {
//        if (hexA == null || hexB == null) return 64;
//        long a = Long.parseUnsignedLong(hexA, 16);
//        long b = Long.parseUnsignedLong(hexB, 16);
//        return Long.bitCount(a ^ b);
//    }
//
//    public static double similarityFromHamming(int hamming) {
//        return 1.0 - (hamming / 64.0);
//    }
//}
