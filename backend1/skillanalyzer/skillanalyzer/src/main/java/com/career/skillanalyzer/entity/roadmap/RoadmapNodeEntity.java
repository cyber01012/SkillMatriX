package com.career.skillanalyzer.entity.roadmap;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "roadmap_nodes")
@Getter
@Setter
@NoArgsConstructor
public class RoadmapNodeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "roadmap_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonBackReference
    private RoadmapEntity roadmap;

    @Column(nullable = false)
    private String skillName;

    @Column(nullable = false)
    private String status;

    @Column(columnDefinition = "TEXT")
    private String guidance;

    @Column(columnDefinition = "TEXT")
    private String resources;

    @Column(columnDefinition = "TEXT")
    private String strategicAction;

    @Column(nullable = false)
    private Integer stepOrder;
}
