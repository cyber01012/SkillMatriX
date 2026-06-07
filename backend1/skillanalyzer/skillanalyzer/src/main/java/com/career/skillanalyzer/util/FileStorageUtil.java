//
//package com.career.skillanalyzer.util;
//
//import java.io.IOException;
//import java.nio.file.*;
//import java.time.LocalDateTime;
//import java.time.format.DateTimeFormatter;
//
//public class FileStorageUtil {
//
//    public static String baseDir() {
//        String p = System.getProperty("storage.base-path", System.getenv("STORAGE_BASE_PATH"));
//        return (p == null || p.isBlank()) ? "storage" : p;
//    }
//
//    public static Path resolveUserDir(String category, String username) throws IOException {
//        Path dir = Paths.get(baseDir(), category, slug(username));
//        Files.createDirectories(dir);
//        return dir;
//    }
//
//    public static String buildPdfFileName(String username, String role, LocalDateTime ts) {
//        String stamp = ts.format(DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss"));
//        return slug(username) + "_" + slug(role) + "_" + stamp + ".pdf";
//    }
//
//    public static Path saveBytes(byte[] bytes, Path dir, String fileName) throws IOException {
//        Path path = dir.resolve(fileName);
//        Files.write(path, bytes, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
//        return path;
//    }
//
//    public static String slug(String s) {
//        if (s == null) s = "guest";
//        return s.toLowerCase().replaceAll("[^a-z0-9]+","-").replaceAll("(^-|-$)","");
//    }
//}
