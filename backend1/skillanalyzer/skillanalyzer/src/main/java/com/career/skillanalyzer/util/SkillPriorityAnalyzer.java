package com.career.skillanalyzer.util;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class SkillPriorityAnalyzer {

    private final Gson gson = new Gson();

    public AnalysisResult analyze(String skillGapJson, String targetRole) {
        Map<String, Object> skillGap = gson.fromJson(skillGapJson, new TypeToken<Map<String, Object>>() {
        }.getType());

        // Bot 1 Logic: Next Best Action using PriorityQueue
        // We assume "Missing" skills are the highest priority
        List<String> missingSkills = (List<String>) skillGap.get("Missing");
        if (missingSkills == null)
            missingSkills = new ArrayList<>();

        List<String> weakSkills = (List<String>) skillGap.get("Weak");
        if (weakSkills == null)
            weakSkills = new ArrayList<>();

        // Check if we have any skill data
        boolean hasData = !missingSkills.isEmpty() || !weakSkills.isEmpty();

        // Map to store skill importance (simplified mock logic for impact)
        Map<String, Integer> importanceMap = new HashMap<>();
        for (String skill : missingSkills) {
            // In a real app, this would come from a database of role requirements
            importanceMap.put(skill, skill.length()); // Mock: longer names = more impact
        }

        // PriorityQueue to rank missing skills
        PriorityQueue<String> priorityQueue = new PriorityQueue<>(
                (a, b) -> importanceMap.get(b) - importanceMap.get(a));
        priorityQueue.addAll(missingSkills);

        String nextBestAction = priorityQueue.peek();

        // Bot 2 Logic: Dependencies/Explanation
        Map<String, List<String>> dependencyMap = new HashMap<>();
        // Mock data for dependencies
        if (nextBestAction != null) {
            dependencyMap.put(nextBestAction,
                    Arrays.asList("Core competency for " + targetRole, "Foundational for advanced projects"));
        }

        return new AnalysisResult(nextBestAction, importanceMap, missingSkills, dependencyMap, hasData);
    }

    public static class AnalysisResult {
        public final String nextBestAction;
        public final Map<String, Integer> importanceMap;
        public final List<String> missingSkills;
        public final Map<String, List<String>> dependencies;
        public final boolean hasData;

        public AnalysisResult(String nextBestAction, Map<String, Integer> importanceMap,
                List<String> missingSkills, Map<String, List<String>> dependencies, boolean hasData) {
            this.nextBestAction = nextBestAction;
            this.importanceMap = importanceMap;
            this.missingSkills = missingSkills;
            this.dependencies = dependencies;
            this.hasData = hasData;
        }
    }
}
