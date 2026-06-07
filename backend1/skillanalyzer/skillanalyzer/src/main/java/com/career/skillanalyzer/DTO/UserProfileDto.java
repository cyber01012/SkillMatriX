
// src/main/java/com/skillmatrix/user/dto/UserProfileDto.java
package com.career.skillanalyzer.DTO;

public record UserProfileDto(
        String id,
        String firstName,
        String lastName,
        String username,
        String email,
        String role,
        String profileImage
) {}

