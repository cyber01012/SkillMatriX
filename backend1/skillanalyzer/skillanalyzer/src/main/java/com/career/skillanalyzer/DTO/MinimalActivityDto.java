
package com.career.skillanalyzer.DTO;

import java.time.LocalDateTime;

public class MinimalActivityDto {
    private String title;
    private LocalDateTime time;
    private String station;
    private String badge;
    private String type;
    private Integer riskScore;

    public MinimalActivityDto(String title, LocalDateTime time, String station, String badge, String type, Integer riskScore) {
        this.title = title;
        this.time = time;
        this.station = station;
        this.badge = badge;
        this.type = type;
        this.riskScore = riskScore;
    }

    public String getTitle() { return title; }
    public LocalDateTime getTime() { return time; }
    public String getStation() { return station; }
    public String getBadge() { return badge; }
    public String getType() { return type; }
    public Integer getRiskScore() { return riskScore; }
}
