package com.career.skillanalyzer.util;

import java.util.UUID;

public class DeviceIdUtil {

    // Generates a unique device ID (UUID)
    public static String generateDeviceId() {
        return UUID.randomUUID().toString();
    }
}
