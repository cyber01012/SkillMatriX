package com.career.skillanalyzer.service.job;

import com.career.skillanalyzer.Model.Job;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class JobRecommendationService {

    public PriorityQueue<Job> rankJobs(List<Job> jobs, List<String> skills) {

        PriorityQueue<Job> pq = new PriorityQueue<>(
                (a, b) -> Integer.compare(b.getMatchScore(), a.getMatchScore())
        );

        for (Job job : jobs) {

            int score = 0;
            List<String> matched = new ArrayList<>();

            String text = (
                    safe(job.getJobTitle()) + " " +
                            safe(job.getJobDescription()) + " " +
                            safe(job.getJobIndustry())
            ).toLowerCase();

            for (String skill : skills) {
                if (text.contains(skill.toLowerCase())) {
                    score++;
                    matched.add(skill);
                }
            }

            job.setMatchScore(score);
            job.setMatchedSkills(matched);

            pq.offer(job);
        }

        return pq;
    }

    private String safe(String s) {
        return s == null ? "" : s;
    }
}



//@Service
//public class JobRecommendationService {
//
//    public PriorityQueue<Job> rankJobs(List<Job> jobs, List<String> skills) {
//
//        PriorityQueue<Job> pq = new PriorityQueue<>(
//                (a, b) -> Integer.compare(b.getMatchScore(), a.getMatchScore())
//        );
//
//        for (Job job : jobs) {
//
//            int score = 0;
//            List<String> matched = new ArrayList<>();
//
//            String text = (
//                    safe(job.getJobTitle()) + " " +
//                            safe(job.getJobDescription()) + " " +
//                            safe(job.getJobIndustry())
//            ).toLowerCase();
//
//            for (String skill : skills) {
//                if (text.contains(skill.toLowerCase())) {
//                    score++;
//                    matched.add(skill);
//                }
//            }
//
//            job.setMatchScore(score);
//            job.setMatchedSkills(matched);
//            pq.offer(job);
//        }
//
//        return pq;
//    }
//
//    private String safe(String s) {
//        return s == null ? "" : s;
//    }
//}

//@Service
//public class JobRecommendationService {
//
//    public PriorityQueue<Job> rankJobs(
//            List<Job> jobs,
//            List<String> cvSkills) {
//
//        // Max-heap PriorityQueue based on matchScore
//        PriorityQueue<Job> pq = new PriorityQueue<>(
//                (a, b) -> b.getMatchScore() - a.getMatchScore()
//        );
//
//        for (Job job : jobs) {
//
//            int score = 0;
//            List<String> matched = new ArrayList<>();
//
//            // Combine all searchable text fields
//            String text = (
//                    (job.getJobTitle() != null ? job.getJobTitle() : "") + " " +
//                            (job.getJobDescription() != null ? job.getJobDescription() : "") +
//                            (job.getJobIndustry() != null ? " " + job.getJobIndustry() : "") +
//                            (job.getJobType() != null ? " " + job.getJobType() : "")
//            ).toLowerCase();
//
//            // Check for each skill
//            for (String skill : cvSkills) {
//                if (text.contains(skill.toLowerCase())) {
//                    score++;
//                    matched.add(skill);
//                }
//            }
//
//            if (score > 0) {
//                job.setMatchScore(score);
//                job.setMatchedSkills(matched);
//                pq.offer(job); // Add to priority queue
//            }
//        }
//
//        return pq; // Returns ranked jobs
//    }
//}
