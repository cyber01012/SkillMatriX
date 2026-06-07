//package com.career.skillanalyzer.service.job;
//
//import com.career.skillanalyzer.Model.Job;
//import org.springframework.stereotype.Service;
//import org.springframework.web.client.RestTemplate;
//
//import java.util.ArrayList;
//import java.util.List;
//import java.util.Map;
//
//@Service
//public class JobicyService {
//
//    private static final String API_URL =
//            "https://jobicy.com/api/v2/remote-jobs?count=100";
//
//    private final RestTemplate restTemplate = new RestTemplate();
//
//    public List<Job> fetchJobs() {
//        Map<String, Object> response =
//                restTemplate.getForObject(API_URL, Map.class);
//
//        List<Map<String, Object>> jobsData =
//                (List<Map<String, Object>>) response.get("jobs");
//
//        List<Job> jobs = new ArrayList<>();
//
//        for (Map<String, Object> j : jobsData) {
//            Job job = new Job();
//
//            // Basic String fields
//            job.setId(safeString(j.get("id")));
//            job.setUrl(safeString(j.get("url")));
//            job.setJobTitle(safeString(j.get("jobTitle")));
//            job.setCompanyName(safeString(j.get("companyName")));
//            job.setCompanyLogo(safeString(j.get("companyLogo")));
//            job.setJobIndustry(safeString(j.get("jobIndustry")));
//            job.setJobType(safeString(j.get("jobType")));
//            job.setJobGeo(safeString(j.get("jobGeo")));
//            job.setJobLevel(safeString(j.get("jobLevel")));
//            job.setJobExcerpt(safeString(j.get("jobExcerpt")));
//
//            // Job description - clean HTML
//            job.setJobDescription(cleanHtml(safeString(j.get("jobDescription"))));
//
//            // Publication date
//            job.setPubDate(safeString(j.get("pubDate")));
//
//            // Salary fields - safely convert numbers to String
//            job.setSalaryMin(safeInteger(j.get("salaryMin")));
//            job.setSalaryMax(safeInteger(j.get("salaryMax")));
//            job.setSalaryCurrency(safeString(j.get("salaryCurrency")));
//            job.setSalaryPeriod(safeString(j.get("salaryPeriod")));
//
//            jobs.add(job);
//        }
//
//        return jobs;
//    }
//
//    // Helper: clean HTML tags
//    private String cleanHtml(String html) {
//        if (html == null) return "";
//        return html.replaceAll("<[^>]*>", "").trim();
//    }
//
//    // Helper: safely convert any object to String
//    private String safeString(Object obj) {
//        return obj != null ? obj.toString() : null;
//    }
//
//    // Helper method
//    private Integer safeInteger(Object obj) {
//        if (obj == null) return null;
//        if (obj instanceof Number) {
//            return ((Number) obj).intValue(); // handles Integer, Double, etc.
//        }
//        try {
//            return Integer.parseInt(obj.toString());
//        } catch (NumberFormatException e) {
//            return null; // fallback if parsing fails
//        }
//    }
//
//    // Helper: safely convert numeric fields to String
//    private String safeNumberString(Object obj) {
//        if (obj == null) return null;
//        if (obj instanceof Number) {
//            return String.valueOf(obj);
//        }
//        return obj.toString();
//    }
//}
