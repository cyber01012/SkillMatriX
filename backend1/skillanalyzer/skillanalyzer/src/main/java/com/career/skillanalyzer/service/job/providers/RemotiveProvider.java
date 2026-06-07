package com.career.skillanalyzer.service.job.providers;

import com.career.skillanalyzer.Model.Job;
import com.career.skillanalyzer.service.job.JobProvider;
import com.career.skillanalyzer.util.HtmlCleaner;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class RemotiveProvider implements JobProvider {

    private static final String URL =
            "https://remotive.com/api/remote-jobs";

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public List<Job> fetchJobs(List<String> skills) {

        Map response = restTemplate.getForObject(URL, Map.class);
        List<Map<String, Object>> jobs =
                (List<Map<String, Object>>) response.get("jobs");

        List<Job> results = new ArrayList<>();

        for (Map<String, Object> j : jobs) {
            Job job = new Job();

            job.setId(String.valueOf(j.get("id")));
            job.setUrl((String) j.get("url"));
            job.setJobTitle((String) j.get("title"));
            job.setCompanyName((String) j.get("company_name"));
            job.setCompanyLogo((String) j.get("company_logo"));
            job.setJobIndustry((String) j.getOrDefault("category", "General"));
            job.setJobType("Remote");
            job.setJobGeo("Worldwide");
            job.setJobLevel("Not specified");

            job.setJobDescription(
                    HtmlCleaner.htmlToText((String) j.getOrDefault("description", ""))
            );

            job.setJobExcerpt(
                    HtmlCleaner.htmlToText((String) j.getOrDefault("description", ""))
            );

//            job.setJobExcerpt((String) j.getOrDefault("description", ""));
//            job.setJobDescription((String) j.getOrDefault("description", ""));
            job.setPubDate((String) j.getOrDefault("publication_date", ""));

            job.setSalaryMin(null);
            job.setSalaryMax(null);
            job.setSalaryCurrency("USD");
            job.setSalaryPeriod("year");

            job.setRecommendationType("API");

            results.add(job);
        }
        return results;
    }

    @Override
    public String getSourceName() {
        return "REMOTIVE";
    }
}
