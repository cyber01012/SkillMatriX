package com.career.skillanalyzer.util;

import com.google.gson.Gson;
import java.util.Arrays;
import java.util.List;

public class JsonArrayParser {

    public static List<String> parse(String json) {
        try {
            return Arrays.asList(
                    new Gson().fromJson(json, String[].class));
        } catch (Exception e) {
            return List.of();
        }
    }
}
