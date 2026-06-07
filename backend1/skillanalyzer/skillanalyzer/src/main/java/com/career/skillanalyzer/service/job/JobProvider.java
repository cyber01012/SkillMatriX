package com.career.skillanalyzer.service.job;

import com.career.skillanalyzer.Model.Job;
import java.util.List;

public interface JobProvider {
    List<Job> fetchJobs(List<String> keywords);
    String getSourceName();
}
