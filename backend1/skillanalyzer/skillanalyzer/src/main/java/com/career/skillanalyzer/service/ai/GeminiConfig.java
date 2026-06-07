package com.career.skillanalyzer.service.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Qualifier;

@Configuration
public class GeminiConfig {

//    @Bean
//    @Qualifier("skillExtractionGemini")
//    public GeminiService skillExtractionGemini(
//            @Value("${gemini.api-key.skill-extraction}") String key) {
//        return new GeminiService(key);
//    }

    @Bean
    @Qualifier("roadmapGemini")
    public GeminiService roadmapGemini(
            @Value("${gemini.api-key.roadmap}") String key) {
        return new GeminiService(key);
    }
}

