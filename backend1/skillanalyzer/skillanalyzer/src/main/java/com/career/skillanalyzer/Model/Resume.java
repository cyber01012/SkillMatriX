
package com.career.skillanalyzer.Model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "resume")
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "resume_hash", unique = true, nullable = false)
    private String resumeHash;

    private String fileName;

    // ✅ 64-bit SimHash (hex) for similarity; no CV text stored
    @Column(name = "simhash64")
    private String simhash64;

    private LocalDateTime createdAt = LocalDateTime.now();

    // getters/setters
    public Long getId() { return id; }
    public String getResumeHash() { return resumeHash; }
    public void setResumeHash(String resumeHash) { this.resumeHash = resumeHash; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getSimhash64() { return simhash64; }
    public void setSimhash64(String simhash64) { this.simhash64 = simhash64; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
