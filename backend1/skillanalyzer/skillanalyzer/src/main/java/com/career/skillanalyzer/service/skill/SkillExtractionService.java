package com.career.skillanalyzer.service.skill;

import com.career.skillanalyzer.service.ai.GeminiService;
import com.career.skillanalyzer.util.JsonCleaner;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import org.springframework.stereotype.Service;

import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class SkillExtractionService {

    private final GeminiService geminiService;
    private final Gson gson = new Gson();

    public SkillExtractionService(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    private List<String> normalizeSkills(List<String> rawSkills) {

        List<String> normalized = new ArrayList<>();

        for (String skill : rawSkills) {

            // Lowercase
            skill = skill.toLowerCase();

            // Remove stop-words
            skill = skill.replaceAll(
                    "\\b(and|with|for|of|in|to|on|using|integration|development|implementation|facilitation)\\b",
                    ""
            );

            // Keep only first 2–3 words
            String[] parts = skill.trim().split("\\s+");
            if (parts.length > 3) {
                skill = String.join(" ", parts[0], parts[1]);
            }

            skill = skill.trim();

            if (!skill.isEmpty()) {
                normalized.add(skill);
            }
        }

        return normalized;
    }

    /**
     * Extracts categorized, role-relevant professional skills from CV text
     */
    public Map<String, List<String>> extractSkills(String resumeText) {

        String prompt =
                "You are an AI system that extracts ONLY role-relevant professional skills from a CV.\n\n" +
                        "Task:\n" +
                        "- Analyze the provided CV text.\n" +
                        "- Extract ONLY concrete, learnable, job-relevant skills.\n" +
                        "- Skills may belong to ANY profession (medical, education, finance, engineering, IT, etc.).\n" +
                        "- DO NOT include soft skills such as communication, teamwork, leadership, or personal traits.\n" +
                        "- DO NOT infer skills that are not clearly implied by education, experience, projects, or certifications.\n" +
                        "- Normalize similar skills into a consistent format.\n\n" +
                        "Return ONLY valid JSON in the following format:\n\n" +
                        "{\n" +
                        "  \"skills\": {\n" +
                        "    \"core_skills\": [],\n" +
                        "    \"tools_and_technologies\": [],\n" +
                        "    \"domain_specific_skills\": []\n" +
                        "  }\n" +
                        "}\n\n" +
                        "Rules:\n" +
                        "- If a category has no skills, return an empty array.\n" +
                        "- No explanations. No markdown.\n\n" +
                        "CV TEXT:\n" +
                        resumeText;

        // Call Gemini
        String aiResponse = JsonCleaner.clean(geminiService.generate(prompt));

        /*
         * Parse JSON properly
         * Expected structure:
         * {
         *   "skills": {
         *      "core_skills": [],
         *      "tools_and_technologies": [],
         *      "domain_specific_skills": []
         *   }
         * }
         */

        Type mapType = new TypeToken<Map<String, Map<String, List<String>>>>() {}.getType();
        Map<String, Map<String, List<String>>> parsedResponse =
                gson.fromJson(aiResponse, mapType);

        // Return only the "skills" object
        Map<String, List<String>> skills = parsedResponse.get("skills");

        skills.replaceAll((k, v) -> normalizeSkills(v));

        return skills;

//        return parsedResponse.get("skills");
    }
}


//package com.career.skillanalyzer.service.skill;
//
//import com.career.skillanalyzer.service.ai.GeminiService;
//import com.career.skillanalyzer.util.JsonArrayParser;
//import com.career.skillanalyzer.util.JsonCleaner;
//import org.springframework.stereotype.Service;
//
//import java.util.List;
//
//@Service
//public class SkillExtractionService {
//
//    private final GeminiService geminiService;
//
//    public SkillExtractionService(GeminiService geminiService) {
//        this.geminiService = geminiService;
//    }
//
//    public List<String> extractSkills(String resumeText) {
//
//        String prompt =
//                "You are an AI system that extracts ONLY role-relevant professional skills from a CV.\n" +
//                        "\n" +
//                        "Task:\n" +
//                        "- Analyze the provided CV text.\n" +
//                        "- Extract ONLY concrete, learnable, job-relevant skills.\n" +
//                        "- These skills may belong to ANY profession (medical, education, finance, engineering, IT, etc.).\n" +
//                        "- DO NOT include soft skills such as communication, teamwork, leadership, or personal traits.\n" +
//                        "- DO NOT infer skills that are not clearly implied by education, experience, projects, or certifications.\n" +
//                        "- Normalize similar skills into a consistent format.\n" +
//                        "\n" +
//                        "Return the result strictly in the following JSON format and NOTHING else:\n" +
//                        "\n" +
//                        "{\n" +
//                        "  \"skills\": {\n" +
//                        "    \"core_skills\": [],\n" +
//                        "    \"tools_and_technologies\": [],\n" +
//                        "    \"domain_specific_skills\": []\n" +
//                        "  }\n" +
//                        "}\n" +
//                        "\n" +
//                        "Rules:\n" +
//                        "- If a category has no skills, return an empty array.\n" +
//                        "- Use clear, standardized skill names.\n" +
//                        "- Do not include explanations or comments.\n" +
//                        "Return JSON array only.\n\n" +
//                        resumeText;
//
//        String aiResponse =
//                JsonCleaner.clean(geminiService.generate(prompt));
//
//        return JsonArrayParser.parse(aiResponse);
//    }
//}
