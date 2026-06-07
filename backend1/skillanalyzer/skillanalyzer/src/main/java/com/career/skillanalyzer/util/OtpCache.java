package com.career.skillanalyzer.util;

import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Component
public class OtpCache {



        private final ConcurrentHashMap<String, String> otpMap = new ConcurrentHashMap<>();
        private final ConcurrentHashMap<String, Long> expiryMap = new ConcurrentHashMap<>();

        private static final long OTP_EXPIRY_MILLIS = TimeUnit.MINUTES.toMillis(15);

        public void storeOtp(String key, String otp) {
            otpMap.put(key, otp);
            expiryMap.put(key, System.currentTimeMillis() + OTP_EXPIRY_MILLIS);
        }

        public String getOtp(String key) {
            Long expiry = expiryMap.get(key);
            if (expiry == null || System.currentTimeMillis() > expiry) {
                otpMap.remove(key);
                expiryMap.remove(key);
                return null;
            }
            return otpMap.get(key);
        }

        public void removeOtp(String key) {
            otpMap.remove(key);
            expiryMap.remove(key);
        }
    }
