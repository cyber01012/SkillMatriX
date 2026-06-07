
package com.career.skillanalyzer.Model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;


    @Entity
    @Table(
            name = "users",
            indexes = {
                    @Index(name = "idx_users_username", columnList = "username", unique = true),
                    @Index(name = "idx_users_email", columnList = "email", unique = true)
            }
    )
    public class User {

        @Id
        @Column(length = 36, nullable = false, updatable = false)
        private String id;

        @Column(nullable = false, unique = true, length = 190)
        private String email;

        @Column(nullable = false, unique = true, length = 50)
        private String username; // unique handle

        @Column(nullable = false, length = 255)
        private String password; // BCrypt

        @Column(name = "first_name", length = 100)
        private String firstName;

        @Column(name = "last_name", length = 100)
        private String lastName;

        @Column(name = "profile_photo_url", length = 512)
        private String profilePhotoUrl; // filesystem or cloud path

        @Column(name = "google_user", nullable = false)
        private boolean googleUser;

        @Column(name = "created_at", nullable = false)
        private LocalDateTime createdAt;

        @Column(name = "updated_at", nullable = false)
        private LocalDateTime updatedAt;

        public User() {
            this.id = UUID.randomUUID().toString();
            this.googleUser = false;
            this.createdAt = LocalDateTime.now();
            this.updatedAt = LocalDateTime.now();
        }

        // getters/setters...
        // (updatedAt ko setters me update karna na bhoolna)
        // ...


// in com.career.skillanalyzer.Model.User


        // com.career.skillanalyzer.Model.User (additions)
        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getFirstName() {
            return firstName;
        }

        public void setFirstName(String firstName) {
            this.firstName = firstName;
        }

        public String getLastName() {
            return lastName;
        }

        public void setLastName(String lastName) {
            this.lastName = lastName;
        }

        public String getProfilePhotoUrl() {
            return profilePhotoUrl;
        }

        public void setProfilePhotoUrl(String profilePhotoUrl) {
            this.profilePhotoUrl = profilePhotoUrl;
        }

        public LocalDateTime getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
        }

        public LocalDateTime getUpdatedAt() {
            return updatedAt;
        }

        public void setUpdatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
        }

        // existing new ones ke sath ensure these are present too:
        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public boolean isGoogleUser() {
            return googleUser;
        }

        public void setGoogleUser(boolean googleUser) {
            this.googleUser = googleUser;
        }
    }
