
package com.career.skillanalyzer.service.job;

import com.career.skillanalyzer.DTO.JobResponseDTO;
import com.career.skillanalyzer.Model.UserTopJob;
import com.career.skillanalyzer.repository.UserTopJobRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserTopJobService {

    private final UserTopJobRepository repository;

    public UserTopJobService(UserTopJobRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public void saveTop3(String userId, List<JobResponseDTO> jobs, String recId) {

        // Overwrite previous dashboard jobs
        repository.deleteAllByUserId(userId);

        for (int i = 0; i < Math.min(3, jobs.size()); i++) {
            JobResponseDTO j = jobs.get(i);

            UserTopJob job = new UserTopJob();
            job.setUserId(userId);
            job.setTitle(j.getJobTitle());
            job.setCompany(j.getCompanyName());
            job.setUrl(j.getUrl());
            job.setGeo(j.getJobGeo());
            job.setMatchScore(j.getMatchScore());
            job.setRecommendationType(j.getRecommendationType());
            job.setRecId(recId);

            repository.save(job);
        }
    }

    public List<UserTopJob> getLatestTop3(String userId) {
        return repository.findTop3ByUserIdOrderByCreatedAtDesc(userId);
    }
}
