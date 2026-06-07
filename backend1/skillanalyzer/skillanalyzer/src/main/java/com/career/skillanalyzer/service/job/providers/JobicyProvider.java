package com.career.skillanalyzer.service.job.providers;

import com.career.skillanalyzer.Model.Job;
import com.career.skillanalyzer.service.job.JobProvider;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class JobicyProvider implements JobProvider {

    private final RestTemplate restTemplate;

    public JobicyProvider(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    private static final String URL = "https://jobicy.com/api/v2/remote-jobs?count=100";

    @Override
    public List<Job> fetchJobs(List<String> skills) {
        Map<String, Object> response;
        try {
            response = restTemplate.getForObject(URL, Map.class);
            if (response == null || !response.containsKey("jobs")) {
                return new ArrayList<>();
            }
        } catch (Exception e) {
            System.err.println("[JOBICY] blocked request or error: " + e.getMessage());
            return new ArrayList<>();
        }

        List<Map<String, Object>> jobs = (List<Map<String, Object>>) response.get("jobs");
        List<Job> results = new ArrayList<>();

        for (Map<String, Object> j : jobs) {
            Job job = new Job();
            job.setId(String.valueOf(j.getOrDefault("id", "Unknown")));
            job.setUrl(getString(j, "url", "Not specified"));
            job.setJobTitle(getString(j, "jobTitle", "Not specified"));
            job.setCompanyName(getString(j, "companyName", "Not specified"));
            job.setCompanyLogo(getString(j, "companyLogo", null));
            job.setJobIndustry(getString(j, "jobIndustry", "General"));
            job.setJobType(getString(j, "jobType", "Remote"));
            job.setJobGeo(getString(j, "jobGeo", "Worldwide"));
            job.setJobLevel(getString(j, "jobLevel", "Any"));
            job.setJobExcerpt(getString(j, "jobExcerpt", ""));
            job.setJobDescription(getString(j, "jobDescription", "Not specified"));
            job.setPubDate(getString(j, "pubDate", "Unknown"));
            job.setSalaryMin(j.get("salaryMin") instanceof Number ? ((Number) j.get("salaryMin")).intValue() : null);
            job.setSalaryMax(j.get("salaryMax") instanceof Number ? ((Number) j.get("salaryMax")).intValue() : null);
            job.setSalaryCurrency(getString(j, "salaryCurrency", "USD"));
            job.setSalaryPeriod(getString(j, "salaryPeriod", "year"));


//            job.setSalaryCurrency((String) j.getOrDefault("salaryCurrency", "USD"));
//            job.setSalaryPeriod((String) j.getOrDefault("salaryPeriod", "year"));

            job.setRecommendationType("API");
            results.add(job);
        }

        System.out.println("[JOBICY] Fetched jobs: " + results.size());
        return results;
    }

    private String getString(Map<String, Object> map, String camelKey, String fallback) {
        Object value = map.get(camelKey);

        // try snake_case if camelCase not found
        if (value == null) {
            String snakeKey = camelToSnake(camelKey);
            value = map.get(snakeKey);
        }

        if (value == null) return fallback;

        if (value instanceof String) return (String) value;
        if (value instanceof List) {
            List<?> list = (List<?>) value;
            if (!list.isEmpty()) return list.get(0).toString();
        }
        return value.toString();
    }

    private String camelToSnake(String camel) {
        return camel.replaceAll("([a-z])([A-Z]+)", "$1_$2").toLowerCase();
    }

    @Override
    public String getSourceName() {
        return "JOBICY";
    }
}


//@Service
//public class JobicyProvider implements JobProvider {
//
//    private final RestTemplate restTemplate;
//
//    public JobicyProvider(RestTemplate restTemplate) {
//        this.restTemplate = restTemplate;
//    }
//
//    @Override
//    public List<Job> fetchJobs(List<String> skills) {
//
//        String tag = String.join(" ", skills);
//        String url = "https://jobicy.com/api/v2/remote-jobs?count=40&tag=" +
//                URLEncoder.encode(tag, StandardCharsets.UTF_8);
//
//        Map<String, Object> response =
//                restTemplate.getForObject(url, Map.class);
//
//        if (response == null || !response.containsKey("jobs")) {
//            return new ArrayList<>();
//        }
//
//        List<Map<String, Object>> jobs =
//                (List<Map<String, Object>>) response.get("jobs");
//
//        List<Job> results = new ArrayList<>();
//
//        for (Map<String, Object> j : jobs) {
//            Job job = new Job();
//
//            job.setId(String.valueOf(j.get("id")));
//                job.setUrl(string(j, "job_url", "Not available"));
//                job.setJobTitle(string(j, "job_title", "Not specified"));
//                job.setCompanyName(string(j, "company_name", "Unknown company"));
//                job.setCompanyLogo(string(j, "company_logo", "Not available"));
//                job.setJobIndustry(string(j, "job_industry", "General"));
//                job.setJobType(string(j, "job_type", "Remote"));
//                job.setJobGeo(string(j, "job_geo", "Worldwide"));
//                job.setJobLevel(string(j, "job_level", "Any"));
//
//                job.setJobExcerpt(string(j, "job_excerpt", "Not provided"));
//                job.setJobDescription(string(j, "job_description", "Description not available"));
//                job.setPubDate(string(j, "pub_date", "Unknown date"));
//
//                job.setSalaryMin(parseInt(j.get("salary_min")));
//                job.setSalaryMax(parseInt(j.get("salary_max")));
//                job.setSalaryCurrency(
//                        string(j, "salary_currency", "Not specified")
//                );
//                job.setSalaryPeriod(
//                        string(j, "salary_period", "Not mentioned")
//                );
//
//                job.setRecommendationType("API");
//            results.add(job);
//        }
//
//        return results;
//    }
//
//    private String string(Map<String, Object> m, String key, String fallback) {
//        Object v = m.get(key);
//        return v == null ? fallback : v.toString();
//    }
//
//    private Integer parseInt(Object o) {
//        if (o instanceof Number) {
//            return ((Number) o).intValue();
//        }
//        return null;
//    }
//
//    @Override
//    public String getSourceName() {
//        return "JOBICY";
//    }
//}


//@Service
//public class JobicyProvider implements JobProvider {
//
//    private final RestTemplate restTemplate;
//
//    public JobicyProvider(RestTemplate restTemplate) {
//        this.restTemplate = restTemplate;
//    }
//
//    @Override
//    public List<Job> fetchJobs(List<String> skills) {
//
//        List<Job> results = new ArrayList<>();
//
//        try {
//            String tag = URLEncoder.encode(
//                    String.join(" ", skills),
//                    StandardCharsets.UTF_8
//            );
//
//            String url =
//                    "https://jobicy.com/api/v2/remote-jobs" +
//                            "?count=100" +
//                            "&tag=" + tag;
//
//            Map<String, Object> response =
//                    restTemplate.getForObject(url, Map.class);
//
//            if (response == null || !response.containsKey("jobs")) {
//                return results;
//            }
//
//            List<Map<String, Object>> jobs =
//                    (List<Map<String, Object>>) response.get("jobs");
//
//            for (Map<String, Object> j : jobs) {
//
//                Job job = new Job();
//
//                job.setId(String.valueOf(j.get("id")));
//                job.setUrl(string(j, "job_url", "Not available"));
//                job.setJobTitle(string(j, "job_title", "Not specified"));
//                job.setCompanyName(string(j, "company_name", "Unknown company"));
//                job.setCompanyLogo(string(j, "company_logo", "Not available"));
//                job.setJobIndustry(string(j, "job_industry", "General"));
//                job.setJobType(string(j, "job_type", "Remote"));
//                job.setJobGeo(string(j, "job_geo", "Worldwide"));
//                job.setJobLevel(string(j, "job_level", "Any"));
//
//                job.setJobExcerpt(string(j, "job_excerpt", "Not provided"));
//                job.setJobDescription(string(j, "job_description", "Description not available"));
//                job.setPubDate(string(j, "pub_date", "Unknown date"));
//
//                job.setSalaryMin(parseInt(j.get("salary_min")));
//                job.setSalaryMax(parseInt(j.get("salary_max")));
//                job.setSalaryCurrency(
//                        string(j, "salary_currency", "Not specified")
//                );
//                job.setSalaryPeriod(
//                        string(j, "salary_period", "Not mentioned")
//                );
//
//                job.setRecommendationType("API");
//
//                results.add(job);
//            }
//
//        } catch (Exception e) {
//            System.err.println("[JOBICY] Failed: " + e.getMessage());
//        }
//
//        return results;
//    }
//
//    private String string(Map<String, Object> m, String key, String fallback) {
//        Object v = m.get(key);
//        return v == null ? fallback : v.toString();
//    }
//
//    private Integer parseInt(Object o) {
//        if (o instanceof Number) {
//            return ((Number) o).intValue();
//        }
//        return null;
//    }
//
//    @Override
//    public String getSourceName() {
//        return "JOBICY";
//    }
//}


//@Service
//public class JobicyProvider implements JobProvider {
//
////    private final RestTemplate restTemplate = new RestTemplate();
//private final RestTemplate restTemplate;
//
//    public JobicyProvider(RestTemplate restTemplate) {
//        this.restTemplate = restTemplate;
//    }
//
//    private static final String URL =
//            "https://jobicy.com/api/v2/remote-jobs?count=100";
//
//    @Override
//    public List<Job> fetchJobs(List<String> skills) {
//
////        Map response = restTemplate.getForObject(URL, Map.class);
//        Map<String, Object> response;
//
//        try {
//            response = restTemplate.getForObject(URL, Map.class);
//            if (response == null || !response.containsKey("jobs")) {
//                return new ArrayList<>();
//            }
//        } catch (Exception e) {
//            System.err.println("JOBICY blocked request");
//            return new ArrayList<>();
//        }
//
//        List<Map<String, Object>> jobs =
//                (List<Map<String, Object>>) response.get("jobs");
//
//        List<Job> results = new ArrayList<>();
//
//        for (Map<String, Object> j : jobs) {
//            Job job = new Job();
//
//            job.setId(String.valueOf(j.get("id")));
//            job.setUrl((String) j.get("job_url"));
//            job.setJobTitle((String) j.get("job_title"));
//            job.setCompanyName((String) j.getOrDefault("company_name", "Not specified"));
//            job.setCompanyLogo((String) j.getOrDefault("company_logo", null));
//            job.setJobIndustry((String) j.getOrDefault("job_industry", "General"));
//            job.setJobType((String) j.getOrDefault("job_type", "Remote"));
//            job.setJobGeo((String) j.getOrDefault("job_geo", "Worldwide"));
//            job.setJobLevel((String) j.getOrDefault("job_level", "Any"));
//            job.setJobExcerpt((String) j.getOrDefault("job_excerpt", ""));
//            job.setJobDescription((String) j.getOrDefault("job_description", ""));
//            job.setPubDate((String) j.getOrDefault("pub_date", ""));
//
////            job.setId(String.valueOf(j.get("id")));
////            job.setUrl((String) j.get("url"));
////            job.setJobTitle((String) j.get("jobTitle"));
////            job.setCompanyName((String) j.getOrDefault("companyName", "Not specified"));
////            job.setCompanyLogo((String) j.getOrDefault("companyLogo", null));
////            job.setJobIndustry((String) j.getOrDefault("jobIndustry", "General"));
////            job.setJobType((String) j.getOrDefault("jobType", "Remote"));
////            job.setJobGeo((String) j.getOrDefault("jobGeo", "Worldwide"));
////            job.setJobLevel("Not specified");
////
////            job.setJobExcerpt((String) j.getOrDefault("jobExcerpt", ""));
////            job.setJobDescription((String) j.getOrDefault("jobDescription", ""));
////            job.setPubDate((String) j.getOrDefault("pubDate", ""));
//
//            job.setSalaryMin(null);
//            job.setSalaryMax(null);
//            job.setSalaryCurrency("USD");
//            job.setSalaryPeriod("year");
//
//            job.setRecommendationType("API");
//            results.add(job);
//        }
//
//        return results;
//    }
//
//    @Override
//    public String getSourceName() {
//        return "JOBICY";
//    }
//}
