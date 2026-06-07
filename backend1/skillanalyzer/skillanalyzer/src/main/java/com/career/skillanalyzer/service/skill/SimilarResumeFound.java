
package com.career.skillanalyzer.service.skill;

public class SimilarResumeFound extends RuntimeException {
    private final Long reuseAnalysisId;
    private final double similarity;

    public SimilarResumeFound(Long reuseAnalysisId, double similarity) {
        super("Similar resume found");
        this.reuseAnalysisId = reuseAnalysisId;
        this.similarity = similarity;
    }
    public Long getReuseAnalysisId() { return reuseAnalysisId; }
    public double getSimilarity() { return similarity; }
}
