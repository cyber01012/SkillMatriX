
// src/main/java/com/career/skillanalyzer/config/StaticResourceConfig.java
package com.career.skillanalyzer.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Physical directory: <project-root>/uploads
        Path uploadDir = Paths.get(System.getProperty("user.dir"), "uploads");

        // Convert to a valid "file:" URI with trailing slash (works on Windows/macOS/Linux)
        String uploadLocation = uploadDir.toUri().toString(); // e.g., file:/C:/proj/uploads/
        if (!uploadLocation.endsWith("/")) {
            uploadLocation = uploadLocation + "/";
        }

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadLocation) // "file:/.../uploads/"
                .setCachePeriod(3600); // 1 hour
    }}
