package com.career.skillanalyzer.util;

import java.util.regex.Pattern;

public class EmailValidator {
    private static final String EMAIL_REGEX = "^[A-Za-z0-9+_.-]+@(.+)$";

    public static boolean validate(String email) {
        return Pattern.compile(EMAIL_REGEX).matcher(email).matches();
    }
}