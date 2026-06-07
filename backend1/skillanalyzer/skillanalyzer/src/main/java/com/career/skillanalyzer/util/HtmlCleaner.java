package com.career.skillanalyzer.util;

import org.jsoup.Jsoup;

public class HtmlCleaner {

    public static String htmlToText(String html) {
        if (html == null) return null;
        return Jsoup.parse(html).text();
    }
}
