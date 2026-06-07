
package com.career.skillanalyzer.Model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.Instant;

@Data
@Entity
@Table(name = "user_top_jobs")
public class UserTopJob {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String userId;

    private String title;
    private String company;
    private String url;
    private String geo;

    private Integer matchScore;

    private String recommendationType; // RECOMMENDED

    private String recId; // bundle id (important)

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}
