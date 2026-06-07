package com.career.skillanalyzer.service.chatbot;

import com.career.skillanalyzer.entity.chat.ChatMessage;
import com.career.skillanalyzer.service.ai.GeminiService;
import com.career.skillanalyzer.util.SkillPriorityAnalyzer;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CounsellingAIService {

    private final GeminiService geminiService;
    private final com.career.skillanalyzer.util.SkillPriorityAnalyzer priorityAnalyzer;

    public CounsellingAIService(
            GeminiService geminiService,
            SkillPriorityAnalyzer priorityAnalyzer
    ) {
        this.geminiService = geminiService;
        this.priorityAnalyzer = priorityAnalyzer;
    }

    public String generateResponse(
            String targetRole,
            String cvSkills,
            String skillGap,
            List<ChatMessage> history) {

        com.career.skillanalyzer.util.SkillPriorityAnalyzer.AnalysisResult analysis = priorityAnalyzer.analyze(skillGap,
                targetRole);

        StringBuilder prompt = new StringBuilder();
        prompt.append("Role: Expert Career Strategist & DSA Consultant\n");
        prompt.append("Goal: Provide data-driven career advice for a aspiring ").append(targetRole).append("\n\n");

        prompt.append("### CORE ANALYSIS (Internal DSA Results)\n");
        prompt.append("- Priority Missing Skill (from PriorityQueue): ")
                .append(analysis.nextBestAction != null ? analysis.nextBestAction : "None identified").append("\n");
        prompt.append("- Skill Dependencies (from Map): ").append(analysis.dependencies).append("\n");
        prompt.append("- All Gap Weights: ").append(analysis.importanceMap).append("\n\n");

        prompt.append("### USER CONTEXT\n");
        prompt.append("- Known Skills: ").append(cvSkills).append("\n");
        prompt.append("- Role Focus: ").append(targetRole).append("\n\n");

        prompt.append("### CONVERSATION LOG\n");
        for (ChatMessage msg : history) {
            String roleLabel = "user".equalsIgnoreCase(msg.getRole()) ? "Candidate" : "Strategist";
            prompt.append(roleLabel).append(": ").append(msg.getContent()).append("\n");
        }

        prompt.append("\n### YOUR PRIMARY TASK\n");
        prompt.append("Answer the user's MOST RECENT question directly and specifically.\n");
        prompt.append("Use the DSA analysis data above to provide personalized, data-driven answers.\n\n");

        prompt.append("### AVAILABLE GUIDANCE TOPICS (Use when relevant to the question)\n");
        prompt.append("- NEXT BEST ACTION: The highest-priority skill from the PriorityQueue analysis\n");
        prompt.append("- PRIORITY JUSTIFICATION: Why this skill matters based on dependencies\n");
        prompt.append("- CAREER SCENARIOS: Best/Worst case outcomes\n");
        prompt.append("- SKILL GAPS: Missing vs Weak skills breakdown\n");
        prompt.append("- LEARNING PATH: How to approach skill development\n\n");

        prompt.append("### FORMATTING RULES\n");
        prompt.append("- Use PLAIN TEXT ONLY. No asterisks (*), hashes (#), or Markdown.\n");
        prompt.append("- Use dash '-' for bullets.\n");
        prompt.append("- Use ALL CAPS for section headers.\n");
        prompt.append("- Keep responses concise (2-4 lines per point).\n");
        prompt.append("- Use DOUBLE LINE BREAKS between sections.\n");
        prompt.append("- NEVER use speaker labels.\n");
        prompt.append(
                "- If the user asks a general question like 'What should I learn?', provide the full Next Best Action guidance.\n");
        prompt.append("- If the user asks a specific question, answer ONLY that question.\n\n");

        return geminiService.generate(prompt.toString());
    }
}
