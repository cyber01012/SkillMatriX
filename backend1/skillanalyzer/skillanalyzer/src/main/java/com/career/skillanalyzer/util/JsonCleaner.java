package com.career.skillanalyzer.util;

public class JsonCleaner {

    public static String clean(String text) {

        if (text == null) return "";

        return text
                .replace("```json", "")
                .replace("```", "")
                .trim();
    }
}
