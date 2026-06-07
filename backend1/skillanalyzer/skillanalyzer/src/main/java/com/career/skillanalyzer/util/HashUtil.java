//
//package com.career.skillanalyzer.util;
//
//import java.security.MessageDigest;
//
//public class HashUtil {
//    public static String sha256(String input) {
//        try {
//            MessageDigest md = MessageDigest.getInstance("SHA-256");
//            byte[] h = md.digest(input.getBytes());
//            StringBuilder sb = new StringBuilder();
//            for (byte b : h) sb.append(String.format("%02x", b));
//            return sb.toString();
//        } catch (Exception e) { throw new RuntimeException(e); }
//    }
//}
