package com.career.skillanalyzer.service.job.providers;

import com.career.skillanalyzer.Model.Job;
import com.career.skillanalyzer.service.job.JobProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class AdzunaProvider implements JobProvider {

    @Value("${adzuna.app-id}")
    private String appId;

    @Value("${adzuna.api-key}")
    private String apiKey;

    private final RestTemplate restTemplate;

    public AdzunaProvider(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public List<Job> fetchJobs(List<String> skills) {
        List<Job> results = new ArrayList<>();
        try {
            String query = URLEncoder.encode(String.join(" ", skills), StandardCharsets.UTF_8.toString());
            String url = "https://api.adzuna.com/v1/api/jobs/gb/search/1" +
                    "?app_id=" + appId +
                    "&app_key=" + apiKey +
                    "&what=" + query;

            Map response = restTemplate.getForObject(url, Map.class);
            if (response == null || !response.containsKey("results")) return results;

            List<Map<String, Object>> jobs = (List<Map<String, Object>>) response.get("results");

            for (Map<String, Object> r : jobs) {
                Job job = new Job();
                job.setId(String.valueOf(r.getOrDefault("id", "Unknown")));
                job.setUrl((String) r.getOrDefault("redirect_url", "Not specified"));
                job.setJobTitle((String) r.getOrDefault("title", "Not specified"));
                job.setCompanyName(r.containsKey("company") ? ((Map) r.get("company")).getOrDefault("display_name", "Not specified").toString() : "Not specified");
                job.setCompanyLogo(null);
                job.setJobIndustry(r.containsKey("category") ? ((Map) r.get("category")).getOrDefault("label", "General").toString() : "General");
                job.setJobType("Full-time");
                job.setJobGeo(r.containsKey("location") ? ((Map) r.get("location")).getOrDefault("display_name", "Not specified").toString() : "Not specified");
                job.setJobLevel("Not specified");
                job.setJobDescription((String) r.getOrDefault("description", "Not specified"));
                job.setJobExcerpt(job.getJobDescription());
                job.setPubDate((String) r.getOrDefault("created", "Unknown"));
                job.setSalaryMin(r.get("salary_min") instanceof Number ? ((Number) r.get("salary_min")).intValue() : null);
                job.setSalaryMax(r.get("salary_max") instanceof Number ? ((Number) r.get("salary_max")).intValue() : null);
                job.setSalaryCurrency("GBP");
                job.setSalaryPeriod("year");
                job.setRecommendationType("API");
                results.add(job);
            }
        } catch (Exception e) {
            System.err.println("[ADZUNA] Error: " + e.getMessage());
        }
        System.out.println("[ADZUNA] Fetched jobs: " + results.size());
        return results;
    }

    @Override
    public String getSourceName() {
        return "ADZUNA";
    }
}


//@Service
//public class AdzunaProvider implements JobProvider {
//
//    @Value("${adzuna.app-id}")
//    private String appId;
//
//    @Value("${adzuna.api-key}")
//    private String apiKey;
//
////    private final RestTemplate restTemplate = new RestTemplate();
//private final RestTemplate restTemplate;
//
//    public AdzunaProvider(RestTemplate restTemplate) {
//        this.restTemplate = restTemplate;
//    }
//
//    @Override
//    public List<Job> fetchJobs(List<String> skills) {
//        String query;
//        String url = "";
//
////        String query = URLEncoder.encode(String.join(" ", skills), StandardCharsets.UTF_8);
//        try {
//            query = URLEncoder.encode(String.join(" ", skills), StandardCharsets.UTF_8.toString());
//            System.out.println(query);
//
//        url = "https://api.adzuna.com/v1/api/jobs/gb/search/1" +
//                "?app_id=" + appId +
//                "&app_key=" + apiKey +
//                "&what=" + query;
//        } catch (Exception e) {
//            e.printStackTrace();
//        }
//
//        Map response = restTemplate.getForObject(url, Map.class);
//        if (response == null || !response.containsKey("results")) {
//            return new ArrayList<>();
//        }
//        List<Map<String, Object>> results =
//                (List<Map<String, Object>>) response.get("results");
//
//        List<Job> jobs = new ArrayList<>();
//
//        for (Map<String, Object> r : results) {
//            Job job = new Job();
//
//            job.setId(String.valueOf(r.get("id")));
//            job.setUrl((String) r.get("redirect_url"));
//            job.setJobTitle((String) r.get("title"));
//
//            job.setCompanyName(
//                    ((Map<String, Object>) r.get("company"))
//                            .get("display_name").toString()
//            );
//
//            job.setCompanyLogo(null);
//            job.setJobIndustry(
//                    ((Map<String, Object>) r.get("category"))
//                            .get("label").toString()
//            );
//
//            job.setJobType("Full-time");
//            Map loc = (Map) r.get("location");
//            job.setJobGeo(
//                    loc != null ? loc.get("display_name").toString() : "Not specified"
//            );
//
//            job.setJobLevel("Not specified");
//
//            job.setJobDescription((String) r.get("description"));
//            job.setJobExcerpt(job.getJobDescription());
//            job.setPubDate((String) r.get("created"));
//
////            Object min = r.get("salary_min");
////            job.setSalaryMin(min instanceof Number ? ((Number) min).intValue() : null);
////
////            Object max = r.get("salary_max");
////            job.setSalaryMax(max instanceof Number ? ((Number) max).intValue() : null);
//
//            job.setSalaryMin(parseSalary(r.get("salary_min")));
//            job.setSalaryMax(parseSalary(r.get("salary_max")));
//            job.setSalaryCurrency("GBP");
//            job.setSalaryPeriod("year");
//
//            job.setRecommendationType("API");
//
//            jobs.add(job);
//        }
//        return jobs;
//    }
//
//    private Integer parseSalary(Object value) {
//        if (value == null) return null;
//        if (value instanceof Number) {
//            return ((Number) value).intValue();
//        }
//        return null;
//    }
//
//    @Override
//    public String getSourceName() {
//        return "ADZUNA";
//    }
//}
