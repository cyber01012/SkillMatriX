package com.career.skillanalyzer.Mapper;


import com.career.skillanalyzer.Model.Job;
import com.career.skillanalyzer.DTO.JobResponseDTO;

/**
 * Converts internal Job model to API DTO
 */
public class JobMapper {

    public static JobResponseDTO toDTO(Job job) {

        JobResponseDTO dto = new JobResponseDTO();

        // Jobicy fields
        dto.setId(job.getId());
        dto.setUrl(job.getUrl());
        dto.setJobTitle(job.getJobTitle());
        dto.setCompanyName(job.getCompanyName());
        dto.setCompanyLogo(job.getCompanyLogo());
        dto.setJobIndustry(job.getJobIndustry());
        dto.setJobType(job.getJobType());
        dto.setJobGeo(job.getJobGeo());
        dto.setJobLevel(job.getJobLevel());
        dto.setJobExcerpt(job.getJobExcerpt());
        dto.setJobDescription(job.getJobDescription());
        dto.setPubDate(job.getPubDate());

        dto.setSalaryMin(job.getSalaryMin());
        dto.setSalaryMax(job.getSalaryMax());
        dto.setSalaryCurrency(job.getSalaryCurrency());
        dto.setSalaryPeriod(job.getSalaryPeriod());

        // Matching info
        dto.setMatchScore(job.getMatchScore());
        dto.setMatchedSkills(job.getMatchedSkills());
        dto.setRecommendationType(job.getRecommendationType());

        return dto;
    }
}
