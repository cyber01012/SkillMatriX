package com.career.skillanalyzer.service.job;
import com.career.skillanalyzer.Model.Job;
import com.career.skillanalyzer.service.ai.GeminiJobFallbackService;
import com.career.skillanalyzer.service.job.JobProvider;
import com.career.skillanalyzer.service.job.providers.AdzunaProvider;
import com.career.skillanalyzer.service.job.providers.JobicyProvider;
import com.career.skillanalyzer.service.job.providers.RemotiveProvider;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.CompletableFuture;

@Service
public class JobAggregatorService {

    private final AdzunaProvider adzuna;
    private final RemotiveProvider remotive;
    private final JobicyProvider jobicy;
    private final GeminiJobFallbackService fallback;

    public JobAggregatorService(
            AdzunaProvider adzuna,
            RemotiveProvider remotive,
            JobicyProvider jobicy,
            GeminiJobFallbackService fallback) {
        this.adzuna = adzuna;
        this.remotive = remotive;
        this.jobicy = jobicy;
        this.fallback = fallback;
    }

    public List<Job> fetchAllJobs(List<String> skills) {
        List<Job> allJobs = new ArrayList<>();

        // 1️⃣ Break skills into pairs/chunks
        List<List<String>> skillChunks = chunkSkills(skills);

        boolean jobicyFetched = false; // <-- add this line

        // 2️⃣ Fetch jobs from each provider
        int adzunaCalls = 0;
        for (List<String> chunk : skillChunks) {

            // ✅ Adzuna with delay
            if (adzunaCalls < 3) { // limit calls to avoid too many requests
                allJobs.addAll(safeFetch(adzuna, chunk));
                adzunaCalls++;
                try {
                    Thread.sleep(500); // 0.5 second delay between Adzuna calls
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }

            // Remotive can handle many requests → no delay needed
            allJobs.addAll(safeFetch(remotive, chunk));

            // Jobicy will fetch all jobs at once → no chunking needed
            // so we fetch only once, skip inside the loop
            if (adzunaCalls == 1 && !jobicyFetched) {
                allJobs.addAll(safeFetch(jobicy, new ArrayList<>())); // empty list → Jobicy ignores skills, returns all
                jobicyFetched = true;
            }
        }

        // 3️⃣ Deduplicate jobs
        allJobs = deduplicate(allJobs);

        // 4️⃣ If all fail → fallback
        if (allJobs.isEmpty()) {
            return fallback.generateFallbackJobs(skills);
        }

        System.out.println("[JOB-AGGREGATOR] Total jobs collected: " + allJobs.size());
        return allJobs;
    }

    private List<Job> safeFetch(JobProvider provider, List<String> skills) {
        try {
            return provider.fetchJobs(skills);
        } catch (Exception e) {
            System.err.println("[ERROR] " + provider.getSourceName() + " → " + e.getMessage());
            return new ArrayList<>();
        }
    }

    private List<Job> deduplicate(List<Job> jobs) {
        Map<String, Job> map = new LinkedHashMap<>();
        for (Job j : jobs) {
            String key = j.getUrl() != null ? j.getUrl() : j.getJobTitle();
            map.putIfAbsent(key, j);
        }
        return new ArrayList<>(map.values());
    }

    private List<List<String>> chunkSkills(List<String> skills) {
        List<List<String>> chunks = new ArrayList<>();
        for (int i = 0; i < skills.size(); i += 2) {
            chunks.add(skills.subList(i, Math.min(i + 2, skills.size())));
        }
        return chunks;
    }
}


//@Service
//public class JobAggregatorService {
//
//    private final AdzunaProvider adzuna;
//    private final RemotiveProvider remotive;
//    private final JobicyProvider jobicy;
//    private final GeminiJobFallbackService fallback;
//
//    public JobAggregatorService(
//            AdzunaProvider adzuna,
//            RemotiveProvider remotive,
//            JobicyProvider jobicy,
//            GeminiJobFallbackService fallback) {
//
//        this.adzuna = adzuna;
//        this.remotive = remotive;
//        this.jobicy = jobicy;
//        this.fallback = fallback;
//    }
//
//    public List<Job> fetchAllJobs(List<String> skills) {
//
//        List<Job> allJobs = new ArrayList<>();
//
//        // ✅ EACH API CALLED ONCE
//        allJobs.addAll(safeFetch(adzuna, skills));
//        allJobs.addAll(safeFetch(remotive, skills));
//        allJobs.addAll(safeFetch(jobicy, skills));
//
//        System.out.println("[AGG] Raw jobs: " + allJobs.size());
//
//        allJobs = deduplicate(allJobs);
//
//        System.out.println("[AGG] After dedupe: " + allJobs.size());
//
//        if (allJobs.isEmpty()) {
//            return fallback.generateFallbackJobs(skills);
//        }
//
//        return allJobs;
//    }
//
//    private List<Job> safeFetch(JobProvider provider, List<String> skills) {
//        try {
//            return provider.fetchJobs(skills);
//        } catch (Exception e) {
//            System.err.println("[ERROR] " + provider.getSourceName());
//            return new ArrayList<>();
//        }
//    }
//
//    private List<Job> deduplicate(List<Job> jobs) {
//        Map<String, Job> map = new LinkedHashMap<>();
//        for (Job j : jobs) {
//            String key = j.getUrl() != null ? j.getUrl() : j.getJobTitle();
//            map.putIfAbsent(key, j);
//        }
//        return new ArrayList<>(map.values());
//    }
//}


//@Service
//public class JobAggregatorService {
//
//    private final AdzunaProvider adzuna;
//    private final RemotiveProvider remotive;
//    private final JobicyProvider jobicy;
//    private final GeminiJobFallbackService fallback;
//
//    public JobAggregatorService(
//            AdzunaProvider adzuna,
//            RemotiveProvider remotive,
//            JobicyProvider jobicy,
//            GeminiJobFallbackService fallback) {
//
//        this.adzuna = adzuna;
//        this.remotive = remotive;
//        this.jobicy = jobicy;
//        this.fallback = fallback;
//    }
//
//    private List<List<String>> chunkSkills(List<String> skills) {
//
//        List<List<String>> chunks = new ArrayList<>();
//
//        List<String> processedSkills = new ArrayList<>();
//        for (String skill : skills) {
//            // split multi-word skills into single words
//            String[] parts = skill.split(" ");
//            processedSkills.addAll(Arrays.asList(parts));
//        }
//
//        for (int i = 0; i < processedSkills.size(); i += 2) {
//            int end = Math.min(i + 2, processedSkills.size());
//            chunks.add(processedSkills.subList(i, end));
//            System.out.println("Chunks: "+chunks);
//        }
//
////        for (int i = 0; i < skills.size(); i += 2) {
////            int end = Math.min(i + 2, skills.size());
////            chunks.add(skills.subList(i, end));
////        }
//
//        return chunks;
//    }
//
//
//    public List<Job> fetchAllJobs(List<String> skills) {
//
//        List<Job> allJobs = new ArrayList<>();
//
//        // 1️⃣ Break skills into pairs
//        List<List<String>> skillChunks = chunkSkills(skills);
//
//        // 2️⃣ Loop over each pair
//        for (List<String> pair : skillChunks) {
//
//            CompletableFuture<List<Job>> adzunaF =
//                    CompletableFuture.supplyAsync(() -> safeFetch(adzuna, pair));
//
//            CompletableFuture<List<Job>> remotiveF =
//                    CompletableFuture.supplyAsync(() -> safeFetch(remotive, pair));
//
//            CompletableFuture<List<Job>> jobicyF =
//                    CompletableFuture.supplyAsync(() -> safeFetch(jobicy, pair));
//
//            CompletableFuture.allOf(adzunaF, remotiveF, jobicyF).join();
//
//            allJobs.addAll(adzunaF.join());
//            allJobs.addAll(remotiveF.join());
//            allJobs.addAll(jobicyF.join());
//
//            System.out.println(
//                    "[JOB-AGGREGATOR] Skills chunk " + pair +
//                            " → Adzuna: " + adzunaF.join().size() +
//                            ", Remotive: " + remotiveF.join().size() +
//                            ", Jobicy: " + jobicyF.join().size()
//            );
//
//        }
//
//        // 3️⃣ Deduplicate
//        allJobs = deduplicate(allJobs);
//        System.out.println(
//                "[JOB-AGGREGATOR] Jobs after deduplication: " + allJobs.size()
//        );
//
//
//        // 4️⃣ If ALL APIs failed → fallback
//        if (allJobs.isEmpty()) {
//            return fallback.generateFallbackJobs(skills);
//        }
//
//        System.out.println(
//                "[JOB-AGGREGATOR] TOTAL jobs collected: " + allJobs.size()
//        );
//        return allJobs;
//    }


//    public List<Job> fetchAllJobs(List<String> skills) {
//
//        CompletableFuture<List<Job>> adzunaF =
//                CompletableFuture.supplyAsync(() -> safeFetch(adzuna, skills));
//
//        CompletableFuture<List<Job>> remotiveF =
//                CompletableFuture.supplyAsync(() -> safeFetch(remotive, skills));
//
//        CompletableFuture<List<Job>> jobicyF =
//                CompletableFuture.supplyAsync(() -> safeFetch(jobicy, skills));
//
//        CompletableFuture.allOf(adzunaF, remotiveF, jobicyF).join();
//
//        List<Job> adzunaJobs = adzunaF.join();
//        List<Job> remotiveJobs = remotiveF.join();
//        List<Job> jobicyJobs = jobicyF.join();
//
//        List<Job> merged = new ArrayList<>();
//
//        // Priority-weighted merge
//        merged.addAll(limit(adzunaJobs, 30));
//        merged.addAll(limit(remotiveJobs, 15));
//        merged.addAll(limit(jobicyJobs, 10));
//
//        // Deduplicate by title + company
//        merged = deduplicate(merged);
//
//        if (merged.isEmpty()) {
//            return fallback.generateFallbackJobs(skills);
//        }
//
//        return merged;
//    }

//    private List<Job> safeFetch(JobProvider provider, List<String> skills) {
//        try {
//            List<Job> jobs = provider.fetchJobs(skills);
//            return jobs == null ? List.of() : jobs;
//        } catch (Exception e) {
//            System.err.println(provider.getSourceName() + " failed");
//            return List.of();
//        }
//    }
//
//    private List<Job> limit(List<Job> jobs, int max) {
//        return jobs.stream().limit(max).toList();
//    }
//
//    private List<Job> deduplicate(List<Job> jobs) {
//        Map<String, Job> map = new LinkedHashMap<>();
//        for (Job j : jobs) {
//            String key = (j.getJobTitle() + j.getCompanyName()).toLowerCase();
//            map.putIfAbsent(key, j);
//        }
//        return new ArrayList<>(map.values());
//    }
//}



//package com.career.skillanalyzer.service.job;
//
//import com.career.skillanalyzer.Model.Job;
//import com.career.skillanalyzer.service.ai.GeminiJobFallbackService;
//import org.springframework.stereotype.Service;
//
//import java.util.ArrayList;
//import java.util.List;
//
//@Service
//public class JobAggregatorService {
//
//    private final List<JobProvider> providers;
//    private final GeminiJobFallbackService fallbackService;
//
//    public JobAggregatorService(
//            List<JobProvider> providers,
//            GeminiJobFallbackService fallbackService) {
//
//        this.providers = providers;
//        this.fallbackService = fallbackService;
//    }
//
//    public List<Job> fetchAllJobs(List<String> skills) {
//
//        List<Job> allJobs = new ArrayList<>();
//
//        for (JobProvider provider : providers) {
//            try {
//                List<Job> jobs = provider.fetchJobs(skills);
//
//                if (jobs != null && !jobs.isEmpty()) {
//                    allJobs.addAll(jobs);
//                }
//
//            } catch (Exception e) {
//                // LOG ONLY — never fail pipeline
//                System.err.println(
//                        "Job provider failed: " + provider.getSourceName()
//                );
//            }
//        }
//
//        // 🔥 FINAL fallback
//        if (allJobs.isEmpty()) {
//            return fallbackService.generateFallbackJobs(skills);
//        }
//
//        return allJobs;
//    }
//}

//import com.career.skillanalyzer.Model.Job;
//import com.career.skillanalyzer.service.ai.GeminiJobFallbackService;
//import org.springframework.stereotype.Service;
//
//import java.util.List;
//
//@Service
//public class JobAggregatorService {
//
//    private final List<JobProvider> providers;
//    private final GeminiJobFallbackService fallbackService;
//
//    public JobAggregatorService(
//            List<JobProvider> providers,
//            GeminiJobFallbackService fallbackService) {
//
//        this.providers = providers;
//        this.fallbackService = fallbackService;
//    }
//
//    public List<Job> fetchAllJobs(List<String> skills) {
//
//        for (JobProvider provider : providers) {
//            try {
//                List<Job> jobs = provider.fetchJobs(skills);
//                if (!jobs.isEmpty()) return jobs;
//            } catch (Exception ignored) {}
//        }
//
//        // FINAL fallback
//        return fallbackService.generateFallbackJobs(skills);
//    }
//}
