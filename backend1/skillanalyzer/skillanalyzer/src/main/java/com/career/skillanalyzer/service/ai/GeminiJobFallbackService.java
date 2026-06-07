package com.career.skillanalyzer.service.ai;

import com.career.skillanalyzer.Model.Job;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class GeminiJobFallbackService {

    public List<Job> generateFallbackJobs(List<String> skills) {

        List<Job> jobs = new ArrayList<>();

        Job job = new Job();
        job.setId("AI-001");
        job.setJobTitle("AI Suggested Role");
        job.setCompanyName("Various Companies");
        job.setUrl("https://linkedin.com/jobs");
        job.setJobIndustry("General");
        job.setJobType("Not specified");
        job.setJobGeo("Not specified");
        job.setJobLevel("Not specified");
        job.setJobExcerpt("AI generated fallback job");
        job.setJobDescription(
                "Fallback job suggestion based on skills: " + skills
        );
        job.setPubDate("N/A");

        job.setSalaryMin(null);
        job.setSalaryMax(null);
        job.setSalaryCurrency("N/A");
        job.setSalaryPeriod("N/A");

        job.setRecommendationType("AI");

        jobs.add(job);

        return jobs;
    }
}


//package com.career.skillanalyzer.service.ai;
//
//import com.career.skillanalyzer.Model.Job;
//import com.career.skillanalyzer.service.job.JobProvider;
//import org.springframework.stereotype.Service;
//
//import java.util.List;
//
//@Service
//public class GeminiJobFallbackService implements JobProvider {
//
//    private final GeminiService geminiService;
//
//    public GeminiJobFallbackService(GeminiService geminiService) {
//        this.geminiService = geminiService;
//    }
//
//    @Override
//    public List<Job> fetchJobs(List<String> skills) {
//
//        String prompt =
//                "Generate 5 realistic job listings titles with links " +
//                        "for skills: " + skills +
//                        ". Return JSON array with title and link.";
//
//        String response = geminiService.generate(prompt);
//
//        // parse response yourself (simple JSON)
//
//        Job job = new Job();
//        job.setId("AI-1");
//        job.setJobTitle("AI Suggested Role");
//        job.setUrl("https://linkedin.com/jobs");
//        job.setCompanyName("Various");
//        job.setCompanyLogo(null);
//        job.setJobIndustry("General");
//        job.setJobType("Not specified");
//        job.setJobGeo("Not specified");
//        job.setJobLevel("Not specified");
//        job.setJobDescription("AI generated fallback job");
//        job.setJobExcerpt("AI generated fallback job");
//        job.setPubDate("N/A");
//
//        job.setSalaryMin(null);
//        job.setSalaryMax(null);
//        job.setSalaryCurrency("N/A");
//        job.setSalaryPeriod("N/A");
//
//        job.setRecommendationType("AI");
//
//        return List.of(job);
//    }
//
//    @Override
//    public String getSourceName() {
//        return "GEMINI_FALLBACK";
//    }
//}
